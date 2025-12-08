const Bill = require('../models/Bill');
const StockBatch = require('../models/StockBatch');
const Farmer = require('../models/Farmer');

const salesReport = async (req, res) => {
  const { from, to } = req.query;
  const q = { shopId: req.shopId };
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }
  const bills = await Bill.find(q).sort({ createdAt: -1 });
  const total = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
  res.json({ total, count: bills.length, bills });
};

const stockReport = async (req, res) => {
  const batches = await StockBatch.find({ shopId: req.shopId }).populate('productId');
  res.json({ batches });
};

const farmerDues = async (req, res) => {
  const Ledger = require('../models/YearlyLedger');
  const { year } = req.query;
  const q = { shopId: req.shopId };
  if (year) q.year = parseInt(year, 10);
  const ledgers = await Ledger.find(q).populate('farmerId');
  res.json({ ledgers });
};

module.exports = { salesReport, stockReport, farmerDues };
