const express = require('express');
const router = express.Router();
const { authMiddleware }  = require('../middleware/auth.middleware');
const tenantMiddleware    = require('../middleware/tenant.middleware');
const { permit }          = require('../middleware/rbac.middleware');
const { getNotifications, markAllRead, markOneRead } = require('../controllers/notifications.controller');

router.use(authMiddleware, tenantMiddleware, permit('shop_admin'));

router.get('/',              getNotifications);
router.post('/read-all',     markAllRead);
router.post('/:id/read',     markOneRead);

module.exports = router;
