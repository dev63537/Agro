const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { permit } = require('../middleware/rbac.middleware');
const { salesReport, stockReport, farmerDues } = require('../controllers/reports.controller');

router.use(authMiddleware, tenantMiddleware, permit('shop_admin'));

router.get('/sales', salesReport);
router.get('/stock', stockReport);
router.get('/farmer-dues', farmerDues);

module.exports = router;
