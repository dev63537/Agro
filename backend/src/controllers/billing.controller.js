const { createBill } = require("../services/billing.service");
const Bill = require("../models/Bill");

const createBillController = async (req, res) => {
  try {
    const { farmerId, items, paymentType, signatureBase64 } = req.body;
    const shop = req.shop;

    const bill = await createBill({
      shop,
      farmerId,
      items,
      paymentType,
      signatureBase64,
    });

    res.status(201).json({ bill });
  } catch (err) {
    console.error("Create bill error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Failed to create bill",
    });
  }
};

const getBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      shopId: req.shop._id,
    });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json({ bill });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bill" });
  }
};

module.exports = {
  createBillController,
  getBill,
};
