const YearlyLedger = require('../models/YearlyLedger');
const Farmer = require('../models/Farmer');

const clearLedger = async ({ shopId, farmerId, year, amountPaid }) => {
  const ledger = await YearlyLedger.findOne({ shopId, farmerId, year });
  if (!ledger) throw { status: 404, message: 'Ledger not found' };

  const paid = parseFloat(amountPaid || 0);
  if (paid <= 0) throw { status: 400, message: 'Invalid amount' };

  ledger.totalDue = Math.max(0, ledger.totalDue - paid);
  ledger.transactions.push({ type: 'payment', amount: paid, date: new Date(), note: 'Manual payment' });

  if (ledger.totalDue <= 0) {
    ledger.status = 'cleared';
    // Set farmer active true
    await Farmer.findByIdAndUpdate(farmerId, { active: true });
  }

  await ledger.save();
  return ledger;
};

module.exports = { clearLedger };
