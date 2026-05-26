const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const { permit } = require('../middleware/rbac.middleware');

const {
    listFarmers,
    createFarmer,
    updateFarmer,
    getFarmer,
    sendReminder,
    deleteFarmer,
} = require('../controllers/farmer.controller');

router.use(authMiddleware, tenantMiddleware, permit('shop_admin'));

router.get('/', listFarmers);
router.post('/', createFarmer);
router.get('/:id', getFarmer);
router.patch('/:id', updateFarmer);
router.delete('/:id', deleteFarmer);       // #17 soft delete
router.post('/:id/remind', sendReminder);

module.exports = router;
