const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, index: true }, // shorthand code used in invoice numbers
  ownerName: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  subscription: {
    plan: { type: String, default: 'free' },
    renewalDate: { type: Date },
    paidUntil: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Shop', ShopSchema);
