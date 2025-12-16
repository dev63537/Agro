// D:\A saas test\backend\src\routes\shop.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require("../middleware/tenant.middleware");
const { permit } = require('../middleware/rbac.middleware');
const { getShop, updateShop } = require('../controllers/shop.controller');

router.use(authMiddleware, permit('master', 'shop_admin'));

// Get shop details (master may pass shopId param)
router.get('/:shopId', getShop);

// Update shop (master)
router.patch('/:shopId', updateShop);

module.exports = router;
