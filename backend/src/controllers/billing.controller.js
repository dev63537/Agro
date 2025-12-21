

const createBillController = async (req, res) => {
  try {
    const { farmerId, items, paymentType, signatureBase64 } = req.body;
    const shop = req.shop;

    // 🔥 DYNAMIC IMPORT (FIXES NODE 24 ESM ISSUE)
    const billingService = await import('../services/billing.service.js');
    const createBill = billingService.createBill;

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
  const { id } = req.params;
  const Bill = require('../models/Bill');
  const bill = await Bill.findOne({ _id: id, shopId: req.shopId });
  if (!bill) return res.status(404).json({ error: 'Bill not found' });
  res.json({ bill });
};

module.exports = { createBillController, getBill };
