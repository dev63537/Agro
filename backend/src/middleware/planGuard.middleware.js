/**
 * Plan Guard Middleware — #19
 * Checks if the shop's current plan allows the requested feature.
 *
 * Usage: router.get('/export/bills', planGuard('export'), exportBills);
 *
 * Feature → minimum plan map:
 *   free    → billing, ledger, farmers, products, stock
 *   basic   → + reports, bulk-pay, history, statements
 *   pro     → + export, audit, notifications, farmer-statement
 */

const PLAN_LEVELS = { FREE: 0, BASIC: 1, PRO: 2 };

const FEATURE_REQUIREMENTS = {
  // Free features (always allowed)
  billing:           'FREE',
  ledger:            'FREE',
  farmers:           'FREE',
  products:          'FREE',
  stock:             'FREE',
  // Basic+
  reports:           'BASIC',
  'bulk-pay':        'BASIC',
  history:           'BASIC',
  'returns':         'BASIC',
  // Pro+
  export:            'PRO',
  'farmer-statement':'PRO',
  notifications:     'BASIC',
  'audit-log':       'PRO',
};

/**
 * Returns Express middleware that blocks requests if the shop's plan
 * is below the minimum required for the feature.
 */
function planGuard(feature) {
  return (req, res, next) => {
    const shop = req.shop;
    if (!shop) return next(); // let auth/tenant middleware handle this

    const required = FEATURE_REQUIREMENTS[feature] || 'FREE';
    const shopLevel  = PLAN_LEVELS[shop.plan?.toUpperCase()] ?? 0;
    const needLevel  = PLAN_LEVELS[required] ?? 0;

    if (shopLevel < needLevel) {
      return res.status(403).json({
        error: `This feature requires the ${required} plan. Your current plan is ${shop.plan}.`,
        requiredPlan: required,
        currentPlan:  shop.plan,
        upgrade: true,
      });
    }
    next();
  };
}

module.exports = { planGuard, FEATURE_REQUIREMENTS, PLAN_LEVELS };
