/**
 * Expiry Checker — runs daily at midnight.
 * Finds shops expiring in exactly 7 days and sends warning emails.
 */
const Shop = require('../models/Shop');
const User = require('../models/User');
const { sendExpiryWarningEmail } = require('../utils/emailSender');

const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;

async function checkExpiringShops() {
  try {
    console.log('[ExpiryChecker] Running subscription expiry check...');

    const now    = new Date();
    const window = new Date(now.getTime() + MS_7_DAYS);

    // Find shops whose expiryDate falls within the next 7-day window
    // and are still ACTIVE (don't spam already-suspended shops)
    const expiringShops = await Shop.find({
      status:     'ACTIVE',
      expiryDate: { $gte: now, $lte: window },
    });

    if (expiringShops.length === 0) {
      console.log('[ExpiryChecker] No expiring shops found.');
      return;
    }

    console.log(`[ExpiryChecker] Found ${expiringShops.length} expiring shop(s).`);

    for (const shop of expiringShops) {
      // Find the shop admin user
      const admin = await User.findOne({ shop: shop._id, role: 'shop_admin' });
      if (!admin || !admin.email) {
        console.warn(`[ExpiryChecker] No admin email for shop ${shop.name} — skipping.`);
        continue;
      }

      try {
        await sendExpiryWarningEmail(admin.email, shop.name, shop.expiryDate);
      } catch (emailErr) {
        // Don't crash the whole job if one email fails
        console.error(`[ExpiryChecker] Failed to email ${admin.email}:`, emailErr.message);
      }
    }

    console.log('[ExpiryChecker] Done.');
  } catch (err) {
    console.error('[ExpiryChecker] Error:', err.message);
  }
}

/**
 * Start the daily cron — runs every day at 08:00 AM server time.
 * Uses setInterval instead of node-cron to avoid extra dependency.
 */
function startExpiryChecker() {
  // Run once immediately on startup (catches any missed window)
  checkExpiringShops();

  // Then every 24 hours
  const INTERVAL = 24 * 60 * 60 * 1000;
  setInterval(checkExpiringShops, INTERVAL);

  console.log('[ExpiryChecker] Scheduled — runs every 24 hours.');
}

module.exports = { startExpiryChecker, checkExpiringShops };
