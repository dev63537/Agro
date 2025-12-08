const { createBill } = require('../services/billing.service');

const createBillController = async (req, res) => {
  const { farmerId, items, paymentType, signatureBase64 } = req.body;
  const shop = req.shop;
  const result = await createBill({ shop, farmerId, items, paymentType, signatureBase64 });
  res.status(201).json({ bill: result.bill, ledger: result.ledger });
};

const getBill = async (req, res) => {
  const { id } = req.params;
  const Bill = require('../models/Bill');
  const bill = await Bill.findOne({ _id: id, shopId: req.shopId });
  if (!bill) return res.status(404).json({ error: 'Bill not found' });
  res.json({ bill });
};

module.exports = { createBillController, getBill };
