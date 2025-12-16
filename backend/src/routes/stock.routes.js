const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require("../middleware/tenant.middleware");
const { permit } = require('../middleware/rbac.middleware');
const { listStock, addStock } = require('../controllers/stock.controller');

router.use(authMiddleware, tenantMiddleware, permit('shop_admin'));

router.get('/', listStock);
router.post('/', addStock);

module.exports = router;
