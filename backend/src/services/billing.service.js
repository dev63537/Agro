const Bill = require("../models/Bill");
const Product = require("../models/Product");
const StockBatch = require("../models/StockBatch");
const Farmer = require("../models/Farmer");
const YearlyLedger = require("../models/YearlyLedger");
const planLimits = require("../config/planLimits");


const { uploadBase64, uploadBuffer } = require("./s3.service");
const { generateInvoicePDFBuffer } = require("./pdf.service");
const { generateBillNo } = require("../utils/id.util");

/**
 * FIFO stock deduction
 */
async function deductStockForItem(shopId, productId, qtyNeeded) {
  let remaining = qtyNeeded;

  const batches = await StockBatch.find({
    shopId,
    productId,
    qty: { $gt: 0 },
  }).sort({ expiryDate: 1, receivedAt: 1 });

  for (const batch of batches) {
    if (remaining <= 0) break;

    const take = Math.min(batch.qty, remaining);
    batch.qty -= take;
    remaining -= take;

    await batch.save();
  }

  if (remaining > 0) {
    throw { status: 400, message: "Insufficient stock" };
  }
}

/**
 * Count monthly bills (plan limit)
 */
async function countBillsThisMonth(shopId) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return Bill.countDocuments({
    shopId,
    createdAt: { $gte: start },
  });
}

/**
 * CREATE BILL (MAIN)
 */
async function createBill({
  shop,
  farmerId,
  items,
  paymentType = "cash",
  signatureBase64,
}) {
  if (!items || items.length === 0) {
    throw { status: 400, message: "No items in bill" };
  }

  const farmer = await Farmer.findOne({
    _id: farmerId,
    shopId: shop._id,
  });

  if (!farmer) {
    throw { status: 404, message: "Farmer not found" };
  }

  if (!farmer.active && paymentType === "credit") {
    throw { status: 400, message: "Farmer inactive due to pending dues" };
  }

  // 🔐 PLAN LIMIT
  const plan = shop.plan || "FREE";
  const limits = planLimits[plan] || planLimits.FREE;

  if (limits.monthlyBills !== Infinity) {
    const used = await countBillsThisMonth(shop._id);
    if (used >= limits.monthlyBills) {
      throw {
        status: 403,
        message: `Monthly bill limit reached (${plan})`,
      };
    }
  }

  let subTotal = 0;
  let gstTotal = 0;
  const detailedItems = [];

  for (const it of items) {
    const product = await Product.findOne({
      _id: it.productId,
      shopId: shop._id,
    });

    if (!product) {
      throw { status: 404, message: "Product not found" };
    }

    const qty = Number(it.qty);
    const unitPrice = Number(it.unitPrice || product.price);
    const gstPercent = Number(product.gstPercent || 0);

    const amount = qty * unitPrice;
    const gst = (amount * gstPercent) / 100;

    subTotal += amount;
    gstTotal += gst;

    detailedItems.push({
      productId: product._id,
      name: product.name,
      qty,
      unitPrice,
      gstPercent,
      total: amount + gst,
    });
  }

  // 🔻 STOCK
  for (const it of detailedItems) {
    await deductStockForItem(shop._id, it.productId, it.qty);
  }

  // ✍️ SIGNATURE
  let signatureUrl = null;
  if (signatureBase64) {
    const uploadRes = await uploadBase64({
      base64: signatureBase64,
      keyPrefix: `signatures/${shop._id}`,
    });
    signatureUrl = uploadRes.url;
  }

  // ✅ ✅ ✅ GENERATE BILL NUMBER FIRST
  const billNo = await generateBillNo(shop._id);

  // ✅ CREATE BILL
  const bill = await Bill.create({
    shopId: shop._id,
    farmerId,
    billNo,
    items: detailedItems,
    subTotal,
    gstTotal,
    totalAmount: subTotal + gstTotal,
    paymentType,
    signatureUrl,
  });

  // 📒 LEDGER
  const year = new Date().getFullYear();
  await YearlyLedger.findOneAndUpdate(
    { shopId: shop._id, farmerId, year },
    {
      $inc: { totalDue: bill.totalAmount },
      $push: {
        transactions: {
          type: "bill",
          billId: bill._id,
          amount: bill.totalAmount,
          date: new Date(),
        },
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  // 🧾 PDF
  const pdfBuffer = await generateInvoicePDFBuffer({
    bill: bill.toObject(),
    shop: shop.toObject(),
    farmer: farmer.toObject(),
  });

  const pdfUpload = await uploadBuffer({
    buffer: pdfBuffer,
    keyPrefix: `invoices/${shop._id}`,
    filename: `${billNo}.pdf`,
  });

  bill.invoiceUrl = pdfUpload.url;
  await bill.save();

  return bill;
}


module.exports = {
  createBill,
  countBillsThisMonth,
};
