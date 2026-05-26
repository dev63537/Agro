const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");
const { permit } = require("../middleware/rbac.middleware");

const {
  createBillController,
  getBill,
  listBills,
  editBill,
  addPartialPayment,
  getBillPayments,
  issueCreditNote,
  listCreditNotes,
  getLowStockAlerts,
  checkStockAvailability,
} = require("../controllers/billing.controller");

const { bulkPay } = require('../controllers/bulkPay.controller');

// 🔐 protect all billing routes
router.use(authMiddleware, tenantMiddleware, permit("shop_admin"));

// ── IMPORTANT: Static routes MUST come before /:id dynamic routes ──

// ── Bills list & create ──
router.get("/",             listBills);              // GET  /api/billing
router.post("/",            createBillController);   // POST /api/billing

// ── Static named routes (before /:id !) ──
router.get("/low-stock",        getLowStockAlerts);      // GET  /api/billing/low-stock
router.get("/credit-notes/all", listCreditNotes);        // GET  /api/billing/credit-notes/all
router.post("/check-stock",     checkStockAvailability); // POST /api/billing/check-stock
router.post("/bulk-pay",        bulkPay);                // POST /api/billing/bulk-pay  ← #7

// ── Dynamic bill routes ──
router.get("/:id",          getBill);                // GET  /api/billing/:id
router.patch("/:id",        editBill);               // PATCH /api/billing/:id

// ── Partial Payments ──
router.post("/:id/payments", addPartialPayment);    // POST /api/billing/:id/payments
router.get("/:id/payments",  getBillPayments);      // GET  /api/billing/:id/payments

// ── Credit Notes ──
router.post("/:id/credit-note", issueCreditNote);   // POST /api/billing/:id/credit-note

module.exports = router;