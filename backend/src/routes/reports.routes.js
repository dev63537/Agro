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

// ✅ Export routes (#12)
const { exportBills, exportFarmers, exportStock, exportDues } = require('../controllers/export.controller');
router.get("/export/bills",    exportBills);   // GET /api/reports/export/bills
router.get("/export/farmers",  exportFarmers); // GET /api/reports/export/farmers
router.get("/export/stock",    exportStock);   // GET /api/reports/export/stock
router.get("/export/dues",     exportDues);    // GET /api/reports/export/dues

module.exports = router;
