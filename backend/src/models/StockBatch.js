const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockBatchSchema = new Schema({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  batchNo: { type: String, trim: true },
  expiryDate: { type: Date },
  qty: { type: Number, required: true, min: 0 },
  receivedAt: { type: Date, default: Date.now },
  costPrice: { type: Number, default: 0 }
}, { timestamps: true });

StockBatchSchema.index({ shopId: 1, productId: 1, expiryDate: 1 });

module.exports = mongoose.model('StockBatch', StockBatchSchema);
