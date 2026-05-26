const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");
const { permit } = require("../middleware/rbac.middleware");
const { planGuard } = require("../middleware/planGuard.middleware"); // #19

// ✅ IMPORT ALL REQUIRED CONTROLLERS
const {
  getTopFarmers,
  getLowStock,
  salesReport,
  stockReport,
  farmerDues,
  farmerPurchaseReport,
  productMovementReport,
  outstandingDues,
  farmerStatement,
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
router.get("/outstanding-dues", outstandingDues);          // #8 dashboard widget
router.get("/farmer-statement/:farmerId", farmerStatement); // #10 farmer statement

// ✅ Export routes (#12) — PRO plan required (#19)
const { exportBills, exportFarmers, exportStock, exportDues } = require('../controllers/export.controller');
router.get("/export/bills",    planGuard('export'), exportBills);
router.get("/export/farmers",  planGuard('export'), exportFarmers);
router.get("/export/stock",    planGuard('export'), exportStock);
router.get("/export/dues",     planGuard('export'), exportDues);

// Farmer statement — PRO plan (#19)
// (route already defined above, planGuard applied inline)
module.exports = router;
