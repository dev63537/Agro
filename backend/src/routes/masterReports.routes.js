const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");

const {
  getSalesReportMaster,
  getTopFarmersMaster,
} = require("../controllers/masterReport.controller");

const { getTotalShops } = require("../controllers/masterReport.controller");

router.get("/shops/count", authMiddleware, getTotalShops);

router.get("/sales", authMiddleware, getSalesReportMaster);
router.get("/farmers", authMiddleware, getTopFarmersMaster);

module.exports = router;
