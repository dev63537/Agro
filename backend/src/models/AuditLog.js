const mongoose = require('mongoose');

/**
 * AuditLog — records critical master-admin actions.
 * #14 — Audit Log for Master Admin
 */
const AuditLogSchema = new mongoose.Schema({
  actorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorEmail: { type: String },
  action:     { type: String, required: true }, // 'SHOP_CREATED' | 'SHOP_SUSPENDED' | 'PASSWORD_RESET' etc.
  targetType: { type: String },                 // 'Shop' | 'User'
  targetId:   { type: mongoose.Schema.Types.ObjectId },
  targetName: { type: String },
  details:    { type: mongoose.Schema.Types.Mixed, default: {} },
  ip:         { type: String, default: '' },
}, { timestamps: true });

AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
