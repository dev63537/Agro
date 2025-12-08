const YearlyLedger = require('../models/YearlyLedger');
const { clearLedger } = require('../services/ledger.service');

const getLedger = async (req, res) => {
  const { farmerId, year } = req.params;
  const y = parseInt(year, 10) || new Date().getFullYear();
  const ledger = await YearlyLedger.findOne({ shopId: req.shopId, farmerId, year: y });
  if (!ledger) return res.status(404).json({ error: 'Ledger not found' });
  res.json({ ledger });
};

const clearLedgerController = async (req, res) => {
  const { farmerId, year, amountPaid } = req.body;
  if (!farmerId || !year || !amountPaid) return res.status(400).json({ error: 'Missing fields' });
  const ledger = await clearLedger({ shopId: req.shopId, farmerId, year: parseInt(year, 10), amountPaid });
  res.json({ ledger });
};

module.exports = { getLedger, clearLedgerController };
