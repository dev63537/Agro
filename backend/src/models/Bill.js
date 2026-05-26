const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BillItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  gstPercent: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const BillSchema = new Schema({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
  billNo: { type: String, required: true, unique: true },
  items: { type: [BillItemSchema], default: [] },
  subTotal: { type: Number, required: true },
  gstTotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentType: { type: String, enum: ['cash', 'online', 'pending', 'credit', 'upi', 'card', 'partial'], default: 'cash' },
  paymentStatus: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'paid' },
  signatureUrl: { type: String },
  invoiceUrl: { type: String },
  isEdited: { type: Boolean, default: false },
  editHistory: { type: Array, default: [] },
  creditNoteId: { type: Schema.Types.ObjectId, ref: 'CreditNote', default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

BillSchema.index({ shopId: 1, billNo: 1 });

module.exports = mongoose.model('Bill', BillSchema);

