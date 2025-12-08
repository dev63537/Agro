const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LedgerTransactionSchema = new Schema({
  type: { type: String, enum: ['bill', 'payment'], required: true },
  billId: { type: Schema.Types.ObjectId, ref: 'Bill' },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String }
}, { _id: false });

const YearlyLedgerSchema = new Schema({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
  year: { type: Number, required: true },
  totalDue: { type: Number, default: 0 },
  transactions: { type: [LedgerTransactionSchema], default: [] },
  status: { type: String, enum: ['open', 'cleared'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

YearlyLedgerSchema.index({ shopId: 1, farmerId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('YearlyLedger', YearlyLedgerSchema);

