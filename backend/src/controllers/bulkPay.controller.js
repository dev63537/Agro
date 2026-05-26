const Bill       = require('../models/Bill');
const Payment    = require('../models/Payment');
const YearlyLedger = require('../models/YearlyLedger');
const Farmer     = require('../models/Farmer');

/**
 * POST /api/billing/bulk-pay
 * Body: { billIds: [id, id, ...], method: 'cash' }
 * Marks all selected unpaid/partial bills as fully paid.
 */
exports.bulkPay = async (req, res) => {
  try {
    const { billIds, method = 'cash', note = 'Bulk payment' } = req.body;

    if (!Array.isArray(billIds) || billIds.length === 0) {
      return res.status(400).json({ error: 'No bills selected' });
    }

    const bills = await Bill.find({
      _id: { $in: billIds },
      shopId: req.shop._id,
      paymentStatus: { $in: ['unpaid', 'partial'] },
    });

    if (bills.length === 0) {
      return res.status(400).json({ error: 'No eligible unpaid/partial bills found' });
    }

    let totalProcessed = 0;
    const results = [];

    for (const bill of bills) {
      const remaining = bill.balanceDue || (bill.totalAmount - (bill.amountPaid || 0));
      if (remaining <= 0) continue;

      // Update bill
      bill.amountPaid   = bill.totalAmount;
      bill.balanceDue   = 0;
      bill.paymentStatus = 'paid';
      await bill.save();

      // Create payment record
      await Payment.create({
        shop: req.shop._id,
        farmer: bill.farmerId,
        bill: bill._id,
        amount: remaining,
        method,
        note,
        createdBy: req.user._id,
      });

      // Update ledger
      const year = new Date(bill.createdAt).getFullYear();
      const ledger = await YearlyLedger.findOne({
        shopId: req.shop._id,
        farmerId: bill.farmerId,
        year,
      });

      if (ledger && ledger.totalDue > 0) {
        ledger.totalDue = Math.max(0, ledger.totalDue - remaining);
        ledger.transactions.push({
          type: 'payment',
          billId: bill._id,
          amount: remaining,
          date: new Date(),
          note: `${note} — Bill #${bill.billNo}`,
        });
        if (ledger.totalDue <= 0) {
          ledger.status = 'cleared';
          await Farmer.findByIdAndUpdate(bill.farmerId, { active: true });
        }
        await ledger.save();
      }

      totalProcessed += remaining;
      results.push({ billId: bill._id, billNo: bill.billNo, amount: remaining });
    }

    res.json({
      message: `${results.length} bill(s) marked as paid`,
      totalProcessed,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
