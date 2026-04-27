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

/**
 * Archive a ledger (mark as archived after year-end clearance)
 * and optionally auto-create a new year ledger
 */
const archiveLedger = async ({ shopId, farmerId, year }) => {
  const ledger = await YearlyLedger.findOne({ shopId, farmerId, year });
  if (!ledger) throw { status: 404, message: 'Ledger not found' };

  if (ledger.totalDue > 0) {
    throw { status: 400, message: 'Cannot archive ledger with pending dues. Clear dues first.' };
  }

  ledger.status = 'cleared';
  await ledger.save();

  // Auto-create next year ledger if it doesn't exist
  const nextYear = year + 1;
  let nextLedger = await YearlyLedger.findOne({ shopId, farmerId, year: nextYear });

  if (!nextLedger) {
    nextLedger = await YearlyLedger.create({
      shopId,
      farmerId,
      year: nextYear,
      totalDue: 0,
      transactions: [],
      status: 'open',
    });
  }

  return { archivedLedger: ledger, newLedger: nextLedger };
};

/**
 * Get all ledgers for a farmer across all years
 */
const getFarmerLedgerHistory = async ({ shopId, farmerId }) => {
  const ledgers = await YearlyLedger.find({ shopId, farmerId })
    .sort({ year: -1 });
  return ledgers;
};

module.exports = { clearLedger, archiveLedger, getFarmerLedgerHistory };
