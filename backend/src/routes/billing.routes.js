const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");
const { permit } = require("../middleware/rbac.middleware");

const {
  createBillController,
  getBill,
} = require("../controllers/billing.controller");

// 🔐 protect all billing routes
router.use(authMiddleware, tenantMiddleware, permit("shop_admin"));

// routes
router.post("/", createBillController);
router.get("/:id", getBill);

module.exports = router;