const Bill = require("../models/Bill");
const Payment = require("../models/Payment");
const StockBatch = require("../models/StockBatch");
const { createBill } = require("../services/billing.service");

exports.createBillController = async (req, res) => {
  try {
    const {
      farmerId,
      items,
      paymentType,
      paidAmount = 0,
      signatureBase64,
    } = req.body;

    if (!farmerId) {
      return res.status(400).json({ error: "Farmer is required" });
    }

    const allowed = ["cash", "online", "pending"];
    if (!allowed.includes(paymentType)) {
      return res.status(400).json({
        error: "Payment type must be cash | online | pending",
      });
    }

    // ✅ CREATE BILL
    const bill = await createBill({
      shop: req.shop,
      farmerId,
      items,
      paymentType,
      signatureBase64,
    });

    // ✅ PAYMENT ENTRY
    const paid =
      paymentType === "pending"
        ? 0
        : Number(paidAmount || bill.totalAmount);

    await Payment.create({
      shop: req.shop._id,
      farmer: farmerId,
      bill: bill._id,
      amount: paid,
      method: paymentType,
      createdBy: req.user._id,
    });

    res.status(201).json({ bill });
  } catch (err) {
    console.error("Create bill error:", err);
    res.status(500).json({ error: err.message });
  }
};
// Add this to billing.controller.js
exports.checkStockAvailability = async (req, res) => {
  try {
    const { items } = req.body;
    const stockStatus = [];

    for (const item of items) {
      const totalStock = await StockBatch.aggregate([
        {
          $match: {
            shopId: req.shop._id,
            productId: item.productId,
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

      const available = totalStock[0]?.total || 0;
      stockStatus.push({
        productId: item.productId,
        requested: item.qty,
        available,
        sufficient: available >= item.qty
      });
    }

    res.json({ stockStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      shopId: req.shop._id,
    }).populate('farmerId', 'name village phone');

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json({ bill });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bill" });
  }
};