const Bill = require("../models/Bill");
const Product = require("../models/Product");
const StockBatch = require("../models/StockBatch");
const Farmer = require("../models/Farmer");
const mongoose = require("mongoose");

/**
 * FIFO stock consumption with session for rollback
 */
async function consumeStock(session, shopId, productId, qtyNeeded) {
  const batches = await StockBatch.find({
    shopId,
    productId,
    qty: { $gt: 0 },
  })
    .sort({ receivedAt: 1 })
    .session(session); // Add session for transaction

  const available = batches.reduce((s, b) => s + b.qty, 0);
  if (available < qtyNeeded) {
    throw new Error(`Insufficient stock for product ${productId}. Available: ${available}, Needed: ${qtyNeeded}`);
  }

  let remaining = qtyNeeded;
  const batchUpdates = [];

  for (const batch of batches) {
    if (remaining <= 0) break;

    const used = Math.min(batch.qty, remaining);
    batch.qty -= used;
    remaining -= used;
    
    // Add to updates array
    batchUpdates.push({
      updateOne: {
        filter: { _id: batch._id },
        update: { $set: { qty: batch.qty } }
      }
    });
  }

  // Bulk write with session for atomic update
  if (batchUpdates.length > 0) {
    await StockBatch.bulkWrite(batchUpdates, { session });
  }

  return true;
}

exports.createBill = async ({
  shop,
  farmerId,
  items,
  paymentType,
  signatureBase64,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!items || items.length === 0) {
      throw new Error("No items in bill");
    }

    const farmer = await Farmer.findOne({
      _id: farmerId,
      shopId: shop._id,
    }).session(session);

    if (!farmer) {
      throw new Error("Farmer not found");
    }

    let subTotal = 0;
    let gstTotal = 0;
    const billItems = [];

    // FIRST: Validate all products and stock availability
    for (const it of items) {
      const product = await Product.findOne({
        _id: it.productId,
        shopId: shop._id,
      }).session(session);

      if (!product) {
        throw new Error(`Product ${it.productId} not found`);
      }

      // Check stock availability before consuming
      const totalStock = await StockBatch.aggregate([
        {
          $match: {
            shopId: shop._id,
            productId: product._id,
            qty: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$qty" }
          }
        }
      ]).session(session);

      const availableStock = totalStock[0]?.total || 0;
      
      if (availableStock < it.qty) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${it.qty}`);
      }
    }

    // SECOND: Consume stock for all items
    for (const it of items) {
      const product = await Product.findOne({
        _id: it.productId,
        shopId: shop._id,
      }).session(session);

      await consumeStock(session, shop._id, product._id, it.qty);

      const amount = it.qty * product.price;
      const gst = (amount * product.gstPercent) / 100;

      subTotal += amount;
      gstTotal += gst;

      billItems.push({
        productId: product._id,
        name: product.name,
        qty: it.qty,
        unitPrice: product.price,
        gstPercent: product.gstPercent,
        total: amount + gst,
      });
    }

    // THIRD: Create the bill
    const bill = await Bill.create([{
      shopId: shop._id,
      farmerId,
      items: billItems,
      subTotal,
      gstTotal,
      totalAmount: subTotal + gstTotal,
      paymentType,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return bill[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};