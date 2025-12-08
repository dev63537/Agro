const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { permit } = require('../middleware/rbac.middleware');
const { createBillController, getBill } = require('../controllers/billing.controller');

router.use(authMiddleware, tenantMiddleware, permit('shop_admin'));

router.post('/', createBillController);
router.get('/:id', getBill);

module.exports = router;
