const Bill = require("../models/Bill");
const Product = require("../models/Product");
const StockBatch = require("../models/StockBatch");
const Farmer = require("../models/Farmer");
const { generateBillNo } = require("../utils/id.util");
const planLimits = require("../config/planLimits");

/**
 * FIFO stock consumption (without transactions for standalone MongoDB)
 */
async function consumeStock(shopId, productId, qtyNeeded) {
  const batches = await StockBatch.find({
    shopId,
    productId,
    qty: { $gt: 0 },
  }).sort({ receivedAt: 1 });

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

    batchUpdates.push({
      updateOne: {
        filter: { _id: batch._id },
        update: { $set: { qty: batch.qty } }
      }
    });
  }

  if (batchUpdates.length > 0) {
    await StockBatch.bulkWrite(batchUpdates);
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
  try {
    if (!items || items.length === 0) {
      throw new Error("No items in bill");
    }

    // ✅ ENFORCE PLAN LIMITS
    const shopPlan = (shop.plan || "FREE").toUpperCase();
    const limits = planLimits[shopPlan] || planLimits.FREE;
    if (limits.monthlyBills !== Infinity) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const billCount = await Bill.countDocuments({
        shopId: shop._id,
        createdAt: { $gte: startOfMonth },
      });
      if (billCount >= limits.monthlyBills) {
        throw new Error(
          `Monthly bill limit reached (${limits.monthlyBills} bills for ${shopPlan} plan). Please upgrade your plan.`
        );
      }
    }

    const farmer = await Farmer.findOne({
      _id: farmerId,
      shopId: shop._id,
    });

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
      });

      if (!product) {
        throw new Error(`Product ${it.productId} not found`);
      }

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
      ]);

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
      });

      await consumeStock(shop._id, product._id, it.qty);

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

    // THIRD: Generate bill number and create the bill
    const billNo = await generateBillNo(shop._id);

    const bill = await Bill.create({
      shopId: shop._id,
      farmerId,
      billNo,
      items: billItems,
      subTotal,
      gstTotal,
      totalAmount: subTotal + gstTotal,
      paymentType,
    });

    return bill;
  } catch (error) {
    throw error;
  }
};