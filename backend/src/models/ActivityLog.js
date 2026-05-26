const mongoose = require('mongoose');

/**
 * ActivityLog — stores every significant action in the shop.
 * Used for the in-app notification bell (#9).
 */
const ActivityLogSchema = new mongoose.Schema({
  shopId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  type:     { type: String, required: true }, // 'bill_created' | 'payment_received' | 'return_issued' | 'farmer_added' | 'low_stock'
  message:  { type: String, required: true }, // Human-readable: "Bill #1042 created for Raju Singh"
  icon:     { type: String, default: '📌' },
  link:     { type: String, default: '' },    // Frontend URL to navigate to
  meta:     { type: mongoose.Schema.Types.Mixed, default: {} }, // Extra data
  read:     { type: Boolean, default: false, index: true },
}, { timestamps: true });

ActivityLogSchema.index({ shopId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
