const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  name: { type: String, required: true, trim: true, index: true },
  sku: { type: String, trim: true },
  unit: { type: String, default: 'kg' },
  price: { type: Number, required: true, min: 0 },
  gstPercent: { type: Number, default: parseFloat(process.env.DEFAULT_GST_PERCENT || '0') },
  category: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

ProductSchema.index({ shopId: 1, name: 1 });

module.exports = mongoose.model('Product', ProductSchema);
