const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CreditNoteItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  gstPercent: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const CreditNoteSchema = new Schema({
  shopId:     { type: Schema.Types.ObjectId, ref: 'Shop',   required: true, index: true },
  farmerId:   { type: Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
  originalBillId: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
  creditNoteNo: { type: String, required: true, unique: true },
  items:      { type: [CreditNoteItemSchema], default: [] },
  subTotal:   { type: Number, required: true },
  gstTotal:   { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  reason:     { type: String, default: '' },
  status:     { type: String, enum: ['issued', 'applied', 'cancelled'], default: 'issued' },
  createdAt:  { type: Date, default: Date.now }
}, { timestamps: true });

CreditNoteSchema.index({ shopId: 1, farmerId: 1 });

module.exports = mongoose.model('CreditNote', CreditNoteSchema);
