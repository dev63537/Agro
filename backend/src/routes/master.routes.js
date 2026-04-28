const express = require('express');
const router = express.Router();
const { listShops, createShop, updateShopStatus, resetShopAdminPassword, resendInvite, resetTestData } = require('../controllers/masterAdmin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { permit } = require('../middleware/rbac.middleware');

router.use(authMiddleware, permit('master'));

router.get('/shops', listShops);
router.post('/shops', createShop);
router.patch('/shops/:shopId', updateShopStatus);
router.post('/shops/:shopId/reset-password', resetShopAdminPassword);
router.post('/shops/:shopId/resend-invite', resendInvite);
router.post('/reset-test-data', resetTestData);

module.exports = router;
