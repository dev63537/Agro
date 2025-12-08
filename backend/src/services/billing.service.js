const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockBatch = require('../models/StockBatch');
const Bill = require('../models/Bill');
const Farmer = require('../models/Farmer');
const YearlyLedger = require('../models/YearlyLedger');
const { uploadBase64, uploadBuffer } = require('./s3.service');
const { generateInvoicePDFBuffer } = require('./pdf.service');
const { generateBillNo } = require('../utils/id.util');

const deductStockForItem = async (shopId, productId, qtyNeeded) => {
  // Deduct from oldest batches (by receivedAt or expiryDate)
  let remaining = qtyNeeded;
  const batches = await StockBatch.find({
    shopId,
    productId,
    qty: { $gt: 0 }
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
    throw { status: 400, message: 'Insufficient stock for product.' };
  }

  await Promise.all(operations);
  return true;
};

const createBill = async ({ shop, farmerId, items, paymentType = 'cash', signatureBase64 }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: 'No items in bill' };
  }

  const farmer = await Farmer.findOne({ _id: farmerId, shopId: shop._id });
  if (!farmer) throw { status: 404, message: 'Farmer not found' };
  // Check farmer active; if inactive and payment type is credit, block
  if (!farmer.active && paymentType === 'credit') {
    throw { status: 400, message: 'Farmer inactive due to pending dues' };
  }

  // Build item details and compute totals
  let subTotal = 0;
  let gstTotal = 0;
  const detailedItems = [];

  for (const it of items) {
    const product = await Product.findOne({ _id: it.productId, shopId: shop._id });
    if (!product) throw { status: 404, message: 'Product not found' };

    const qty = Number(it.qty);
    const unitPrice = Number(it.unitPrice || product.price);
    const gstPercent = Number(product.gstPercent || parseFloat(process.env.DEFAULT_GST_PERCENT || '0'));
    const amount = qty * unitPrice;
    const gstAmount = (amount * gstPercent) / 100;
    const total = amount + gstAmount;

    subTotal += amount;
    gstTotal += gstAmount;

    detailedItems.push({
      productId: product._id,
      name: product.name,
      qty,
      unitPrice,
      gstPercent,
      total
    });
  }

  // Deduct stock (for each item)
  for (const it of detailedItems) {
    await deductStockForItem(shop._id, it.productId, it.qty);
  }

  const totalAmount = subTotal + gstTotal;

  // Save signature (if provided)
  let signatureUrl = null;
  if (signatureBase64) {
    const uploadRes = await uploadBase64({ base64: signatureBase64, keyPrefix: `signatures/${shop._id}` });
    signatureUrl = uploadRes.url;
  }

  // Generate bill number
  const billNo = await generateBillNo(shop._id);

  // Create bill record
  const bill = await Bill.create({
    shopId: shop._id,
    farmerId,
    billNo,
    items: detailedItems,
    subTotal,
    gstTotal,
    totalAmount,
    paymentType,
    signatureUrl
  });

  // Update YearlyLedger
  const year = new Date().getFullYear();
  const ledger = await YearlyLedger.findOneAndUpdate(
    { shopId: shop._id, farmerId, year },
    {
      $inc: { totalDue: totalAmount },
      $push: { transactions: { type: 'bill', billId: bill._id, amount: totalAmount, date: new Date() } }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Generate PDF and upload
  const pdfBuffer = await generateInvoicePDFBuffer({ bill: bill.toObject(), shop: shop.toObject(), farmer: farmer.toObject() });
  const pdfUpload = await uploadBuffer({ buffer: pdfBuffer, keyPrefix: `invoices/${shop._id}`, filename: `${billNo}.pdf` });

  bill.invoiceUrl = pdfUpload.url;
  await bill.save();

  return { bill, ledger };
};

module.exports = { createBill };
