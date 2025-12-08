const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { permit } = require('../middleware/rbac.middleware');
const { listFarmers, createFarmer, updateFarmer } = require('../controllers/farmer.controller');

router.use(authMiddleware, tenantMiddleware, permit('shop_admin'));

router.get('/', listFarmers);
router.post('/', createFarmer);
router.patch('/:id', updateFarmer);

module.exports = router;
