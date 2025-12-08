const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth.middleware");

const {
  getSalesReportMaster,
  getTopFarmersMaster,
  getLowStockMaster,
} = require("../controllers/masterReport.controller");

router.get("/sales", authMiddleware, getSalesReportMaster);
router.get("/farmers", authMiddleware, getTopFarmersMaster);
router.get("/low-stock", authMiddleware, getLowStockMaster);

module.exports = router;
