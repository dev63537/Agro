const ActivityLog = require('../models/ActivityLog');

/**
 * Log an activity event — fire and forget (never throws).
 */
async function logActivity(shopId, { type, message, icon = '📌', link = '', meta = {} }) {
  try {
    await ActivityLog.create({ shopId, type, message, icon, link, meta });
  } catch (err) {
    console.error('[ActivityLog] Failed to log:', err.message);
  }
}

// Convenience helpers for common events
const log = {
  billCreated:     (shopId, billNo, farmerName, billId) =>
    logActivity(shopId, { type: 'bill_created',      icon: '🧾', message: `Bill #${billNo} created for ${farmerName}`,          link: `/shop/invoice/${billId}` }),
  paymentReceived: (shopId, amount, farmerName, billId) =>
    logActivity(shopId, { type: 'payment_received',  icon: '💳', message: `₹${amount.toLocaleString()} received from ${farmerName}`, link: `/shop/invoice/${billId}` }),
  returnIssued:    (shopId, billNo, farmerName, noteId) =>
    logActivity(shopId, { type: 'return_issued',     icon: '🔄', message: `Return issued on Bill #${billNo} for ${farmerName}`,  link: `/shop/billing/${noteId}/credit-note` }),
  farmerAdded:     (shopId, farmerName, farmerId) =>
    logActivity(shopId, { type: 'farmer_added',      icon: '👨‍🌾', message: `New farmer added: ${farmerName}`,                   link: `/shop/farmers` }),
  lowStock:        (shopId, productName, qty) =>
    logActivity(shopId, { type: 'low_stock',         icon: '⚠️',  message: `Low stock alert: ${productName} has only ${qty} units left`, link: `/shop/stock` }),
};

module.exports = { logActivity, log };
