const express = require('express');
const router = express.Router();
const { listShops, createShop, updateShopStatus } = require('../controllers/masterAdmin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { permit } = require('../middleware/rbac.middleware');

router.use(authMiddleware, permit('master'));

router.get('/shops', listShops);
router.post('/shops', createShop);
router.patch('/shops/:shopId', updateShopStatus);

module.exports = router;
