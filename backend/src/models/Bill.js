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
  paymentType: { type: String, enum: ['cash', 'credit', 'upi', 'card'], default: 'cash' },
  signatureUrl: { type: String },
  invoiceUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

BillSchema.index({ shopId: 1, billNo: 1 });

module.exports = mongoose.model('Bill', BillSchema);

