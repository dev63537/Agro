const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");
const { permit } = require("../middleware/rbac.middleware");

const {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
} = require("../controllers/product.controller");

router.use(authMiddleware, tenantMiddleware, permit("shop_admin"));

router.get("/", listProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.get("/:id", getProduct);

module.exports = router;
