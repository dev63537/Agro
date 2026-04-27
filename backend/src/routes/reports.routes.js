const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");
const { permit } = require("../middleware/rbac.middleware");

// ✅ IMPORT ALL REQUIRED CONTROLLERS
const {
  getTopFarmers,
  getLowStock,
  salesReport,
  stockReport,
  farmerDues,
  farmerPurchaseReport,
  productMovementReport,
} = require("../controllers/reports.controller");


// ✅ Protect all shop-admin report routes
router.use(authMiddleware, tenantMiddleware, permit("shop_admin"));

// ✅ Dashboard APIs
router.get("/farmers/top", getTopFarmers);
router.get("/low-stock", getLowStock);

// ✅ Reports with date filtering
router.get("/sales", salesReport);
router.get("/stock", stockReport);
router.get("/farmer-dues", farmerDues);
router.get("/farmer-purchases", farmerPurchaseReport);
router.get("/product-movement", productMovementReport);

module.exports = router;
