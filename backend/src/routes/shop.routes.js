const express = require('express');
const router  = express.Router();
const { authMiddleware }  = require('../middleware/auth.middleware');
const tenantMiddleware    = require('../middleware/tenant.middleware');
const { permit }          = require('../middleware/rbac.middleware');
const { getShop, updateShop } = require('../controllers/shop.controller');
const { getSettings, updateSettings } = require('../controllers/shopSettings.controller');

// ── Master-only shop management ────────────────────────────
router.get( '/:shopId', authMiddleware, permit('master', 'shop_admin'), getShop);
router.patch('/:shopId', authMiddleware, permit('master'), updateShop);

// ── Shop admin — own settings (#15 GST config) ────────────
router.get(  '/settings/me', authMiddleware, tenantMiddleware, permit('shop_admin'), getSettings);
router.patch('/settings/me', authMiddleware, tenantMiddleware, permit('shop_admin'), updateSettings);

module.exports = router;
