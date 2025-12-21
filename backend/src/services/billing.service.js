const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const StockBatch = require("../models/StockBatch");
const Farmer = require("../models/Farmer");
const YearlyLedger = require("../models/YearlyLedger");
const planLimits = require("../config/planLimits");

// const { uploadBase64, uploadBuffer } = require("./s3.service");
// const { generateInvoicePDFBuffer } = require("./pdf.service");
const { generateBillNo } = require("../utils/id.util");

/**
 * Deduct stock using FIFO (oldest batch first)
 */
const deductStockForItem = async (shopId, productId, qtyNeeded) => {
  let remaining = qtyNeeded;

  const batches = await StockBatch.find({
    shopId,
    productId,
    qty: { $gt: 0 },
  }).sort({ expiryDate: 1, receivedAt: 1 });

  const operations = [];

  for (const batch of batches) {
    if (remaining <= 0) break;

    const take = Math.min(batch.qty, remaining);
    batch.qty -= take;
    remaining -= take;

    operations.push(batch.save());
  }

  if (remaining > 0) {
    throw { status: 400, message: "Insufficient stock for product." };
  }

  await Promise.all(operations);
};

/**
 * Count bills created in the current month for a shop
 */
async function countBillsThisMonth(shopId) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return await Bill.countDocuments({
    shopId: shopId,
    createdAt: { $gte: startOfMonth },
  });
}
const year = new Date().getFullYear();

const ledger = await YearlyLedger.findOne({
  shopId: shop._id,
  farmerId,
  year,
});

const pendingDue = ledger?.totalDue || 0;

/**
 * Create Bill
 */
const createBill = async ({
  shop,
  farmerId,
  items,
  paymentType = "cash",
  signatureBase64,
}) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: "No items in bill" };
  }

  const farmer = await Farmer.findOne({
    _id: farmerId,
    shopId: shop._id,
  });

  // 🔐 SAAS PLAN LIMIT CHECK
  const plan = shop.plan || "FREE";
  const limitConfig = planLimits[plan] || planLimits.FREE;

  if (limitConfig.monthlyBills !== Infinity) {
    const billsThisMonth = await countBillsThisMonth(shop._id);

    if (billsThisMonth >= limitConfig.monthlyBills) {
      throw {
        status: 403,
        message: `Monthly bill limit reached for ${plan} plan. Please upgrade your subscription.`,
      };
    }
  }

  if (!farmer) {
    throw { status: 404, message: "Farmer not found" };
  }

  if (!farmer.active && paymentType === "credit") {
    throw {
      status: 403,
      message: "This farmer is INACTIVE. Credit billing is not allowed.",
    };
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
    const gstAmount = (amount * gstPercent) / 100;

    subTotal += amount;
    gstTotal += gstAmount;

    detailedItems.push({
      productId: product._id,
      name: product.name,
      qty,
      unitPrice,
      gstPercent,
      total: amount + gstAmount,
    });
  }

  // Deduct stock
  for (const it of detailedItems) {
    await deductStockForItem(shop._id, it.productId, it.qty);
  }

  const totalAmount = subTotal + gstTotal;

  // Upload signature
  let signatureUrl = null;
  if (signatureBase64) {
    const uploadRes = await uploadBase64({
      base64: signatureBase64,
      keyPrefix: `signatures/${shop._id}`,
    });
    signatureUrl = uploadRes.url;
  }

  const billNo = await generateBillNo(shop._id);

  const bill = await Bill.create({
    shopId: shop._id,
    farmerId,
    billNo,
    items: detailedItems,
    subTotal,
    gstTotal,
    totalAmount,
    paymentType,
    signatureUrl,
  });

  const year = new Date().getFullYear();
  await YearlyLedger.findOneAndUpdate(
    { shopId: shop._id, farmerId, year },
    {
      $inc: { totalDue: totalAmount },
      $push: {
        transactions: {
          type: "bill",
          billId: bill._id,
          amount: totalAmount,
          date: new Date(),
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  //  Generate & upload PDF
  // const pdfBuffer = await generateInvoicePDFBuffer({
  //   bill: bill.toObject(),
  //   shop: shop.toObject(),
  //   farmer: farmer.toObject(),
  // });

  // const pdfUpload = await uploadBuffer({
  //   buffer: pdfBuffer,
  //   keyPrefix: `invoices/${shop._id}`,
  //   filename: `${billNo}.pdf`,
  // });

  // bill.invoiceUrl = pdfUpload.url;
  // await bill.save();
  // PDF generation disabled for now

  return {
    bill,
    pendingDueBeforeBill: pendingDue
  };
};

module.exports = {
  createBill,
  countBillsThisMonth,
};
