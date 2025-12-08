const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { permit } = require('../middleware/rbac.middleware');
const { getLedger, clearLedgerController } = require('../controllers/ledger.controller');

router.use(authMiddleware, tenantMiddleware, permit('shop_admin'));

router.get('/:farmerId/:year', getLedger);
router.post('/clear', clearLedgerController);

module.exports = router;
