const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { permit } = require('../middleware/rbac.middleware');
const { listProducts, createProduct, updateProduct } = require('../controllers/product.controller');

router.use(authMiddleware, tenantMiddleware, permit('shop_admin'));

// Product CRUD
router.get('/', listProducts);
router.post('/', createProduct);
router.patch('/:id', updateProduct);

module.exports = router;
