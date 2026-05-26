const Bill = require("../models/Bill");
const Payment = require("../models/Payment");
const StockBatch = require("../models/StockBatch");
const CreditNote = require("../models/CreditNote");
const YearlyLedger = require("../models/YearlyLedger");
const Product = require("../models/Product");
const { createBill } = require("../services/billing.service");
const mongoose = require("mongoose");

// ────────────────────────────────────────
// CREATE BILL
// ────────────────────────────────────────
exports.createBillController = async (req, res) => {
  try {
    const { farmerId, items, paymentType, paidAmount = 0, signatureBase64 } = req.body;

    if (!farmerId) return res.status(400).json({ error: "Farmer is required" });

    const allowed = ["cash", "online", "pending", "partial", "upi", "card"];
    if (!allowed.includes(paymentType)) {
      return res.status(400).json({ error: "Invalid payment type" });
    }

    const bill = await createBill({ shop: req.shop, farmerId, items, paymentType, paidAmount, signatureBase64 });

    const paid = paymentType === "pending" ? 0 : Number(paidAmount || bill.totalAmount);

    await Payment.create({
      shop: req.shop._id,
      farmer: farmerId,
      bill: bill._id,
      amount: paid,
      method: paymentType === "partial" ? "cash" : paymentType,
      createdBy: req.user._id,
    });

    res.status(201).json({ bill });
  } catch (err) {
    console.error("Create bill error:", err);
    res.status(err.status || 500).json({ error: err.message });
  }
};

// ────────────────────────────────────────
// GET SINGLE BILL
// ────────────────────────────────────────
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, shopId: req.shop._id })
      .populate("farmerId", "name village phone creditLimit");
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json({ bill });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bill" });
  }
};

// ────────────────────────────────────────
// LIST BILLS (with search)
// ────────────────────────────────────────
exports.listBills = async (req, res) => {
  try {
    const { farmer, status, q, page = 1, limit = 30 } = req.query;
    const filter = { shopId: req.shop._id };

    if (farmer) filter.farmerId = farmer;
    if (status) filter.paymentStatus = status;

    let bills = await Bill.find(filter)
      .populate("farmerId", "name village phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Text search on billNo or farmer name
    if (q) {
      const ql = q.toLowerCase();
      bills = bills.filter(
        (b) =>
          b.billNo.toLowerCase().includes(ql) ||
          (b.farmerId?.name || "").toLowerCase().includes(ql)
      );
    }

    const total = await Bill.countDocuments(filter);
    res.json({ bills, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};

// ────────────────────────────────────────
// EDIT BILL (only pending/partial/credit bills)
// ────────────────────────────────────────
exports.editBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, shopId: req.shop._id });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.paymentStatus === "paid") {
      return res.status(400).json({ error: "Fully paid bills cannot be edited." });
    }

    const { note } = req.body;
    const allowedFields = ["paymentType", "items", "subTotal", "gstTotal", "totalAmount"];

    // Save old snapshot to edit history
    const snapshot = {
      editedAt: new Date(),
      editedBy: req.user._id,
      note: note || "Manual edit",
      prevValues: {
        paymentType: bill.paymentType,
        totalAmount: bill.totalAmount,
        items: bill.items,
      },
    };

    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) bill[f] = req.body[f];
    });

    bill.isEdited = true;
    bill.editHistory = [...(bill.editHistory || []), snapshot];

    // Recalculate balanceDue if total changed
    if (req.body.totalAmount !== undefined) {
      bill.balanceDue = Math.max(0, bill.totalAmount - bill.amountPaid);
      bill.paymentStatus =
        bill.balanceDue <= 0 ? "paid" : bill.amountPaid > 0 ? "partial" : "unpaid";
    }

    await bill.save();
    res.json({ bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ────────────────────────────────────────
// ADD PARTIAL PAYMENT TO A BILL
// ────────────────────────────────────────
exports.addPartialPayment = async (req, res) => {
  try {
    const { amount, method = "cash", note = "" } = req.body;
    const payAmt = Number(amount);

    if (!payAmt || payAmt <= 0) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    const bill = await Bill.findOne({ _id: req.params.id, shopId: req.shop._id });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.paymentStatus === "paid") {
      return res.status(400).json({ error: "Bill is already fully paid" });
    }

    if (payAmt > bill.balanceDue) {
      return res.status(400).json({
        error: `Payment ₹${payAmt} exceeds balance due ₹${bill.balanceDue}`,
      });
    }

    // Update bill
    bill.amountPaid += payAmt;
    bill.balanceDue = Math.max(0, bill.totalAmount - bill.amountPaid);
    bill.paymentStatus = bill.balanceDue <= 0 ? "paid" : "partial";
    await bill.save();

    // Create payment record
    await Payment.create({
      shop: req.shop._id,
      farmer: bill.farmerId,
      bill: bill._id,
      amount: payAmt,
      method,
      note,
      createdBy: req.user._id,
    });

    // Update ledger — reduce totalDue
    const year = new Date().getFullYear();
    const ledger = await YearlyLedger.findOne({
      shopId: req.shop._id,
      farmerId: bill.farmerId,
      year,
    });

    if (ledger) {
      ledger.totalDue = Math.max(0, ledger.totalDue - payAmt);
      ledger.transactions.push({
        type: "payment",
        billId: bill._id,
        amount: payAmt,
        date: new Date(),
        note: note || "Partial payment",
      });
      if (ledger.totalDue <= 0) {
        ledger.status = "cleared";
        const Farmer = require("../models/Farmer");
        await Farmer.findByIdAndUpdate(bill.farmerId, { active: true });
      }
      await ledger.save();
    }

    res.json({ bill, message: `₹${payAmt} payment recorded successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ────────────────────────────────────────
// PAYMENT HISTORY FOR A BILL
// ────────────────────────────────────────
exports.getBillPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ bill: req.params.id, shop: req.shop._id })
      .sort({ createdAt: 1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ────────────────────────────────────────
// ISSUE CREDIT NOTE (Return Items)
// ────────────────────────────────────────
exports.issueCreditNote = async (req, res) => {
  try {
    const { items: returnItems, reason = "" } = req.body;

    const bill = await Bill.findOne({ _id: req.params.id, shopId: req.shop._id });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.creditNoteId) {
      return res.status(400).json({ error: "A credit note has already been issued for this bill." });
    }

    if (!returnItems || returnItems.length === 0) {
      return res.status(400).json({ error: "No return items specified" });
    }

    // Validate return quantities against original bill
    for (const ri of returnItems) {
      const original = bill.items.find((i) => i.productId.toString() === ri.productId);
      if (!original) {
        return res.status(400).json({ error: `Product ${ri.productId} not in original bill` });
      }
      if (ri.qty > original.qty) {
        return res.status(400).json({
          error: `Return qty (${ri.qty}) exceeds billed qty (${original.qty}) for ${original.name}`,
        });
      }
    }

    // Build credit note items
    let subTotal = 0;
    let gstTotal = 0;
    const cnItems = returnItems.map((ri) => {
      const orig = bill.items.find((i) => i.productId.toString() === ri.productId);
      const lineTotal = ri.qty * orig.unitPrice;
      const lineGst = (lineTotal * orig.gstPercent) / 100;
      subTotal += lineTotal;
      gstTotal += lineGst;
      return {
        productId: orig.productId,
        name: orig.name,
        qty: ri.qty,
        unitPrice: orig.unitPrice,
        gstPercent: orig.gstPercent,
        total: lineTotal + lineGst,
      };
    });

    const totalAmount = subTotal + gstTotal;

    // Generate credit note number
    const count = await CreditNote.countDocuments({ shopId: req.shop._id });
    const creditNoteNo = `CN-${String(count + 1).padStart(4, "0")}`;

    const creditNote = await CreditNote.create({
      shopId: req.shop._id,
      farmerId: bill.farmerId,
      originalBillId: bill._id,
      creditNoteNo,
      items: cnItems,
      subTotal,
      gstTotal,
      totalAmount,
      reason,
      status: "issued",
    });

    // Link credit note to bill
    bill.creditNoteId = creditNote._id;
    await bill.save();

    // Restore stock for returned items (FIFO in reverse doesn't matter — just add to a new batch)
    for (const ri of returnItems) {
      const orig = bill.items.find((i) => i.productId.toString() === ri.productId);
      await StockBatch.create({
        shopId: req.shop._id,
        productId: orig.productId,
        batchNo: `RETURN-${creditNoteNo}`,
        qty: ri.qty,
        receivedAt: new Date(),
        costPrice: orig.unitPrice,
      });
    }

    // Reduce farmer's ledger by credit note amount (if bill was pending/partial)
    if (bill.paymentStatus !== "paid") {
      const year = new Date().getFullYear();
      const ledger = await YearlyLedger.findOne({
        shopId: req.shop._id,
        farmerId: bill.farmerId,
        year,
      });
      if (ledger) {
        ledger.totalDue = Math.max(0, ledger.totalDue - totalAmount);
        ledger.transactions.push({
          type: "payment",
          billId: bill._id,
          amount: totalAmount,
          date: new Date(),
          note: `Credit Note ${creditNoteNo} — return`,
        });
        await ledger.save();
      }
    }

    res.status(201).json({ creditNote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ────────────────────────────────────────
// LIST CREDIT NOTES
// ────────────────────────────────────────
exports.listCreditNotes = async (req, res) => {
  try {
    const creditNotes = await CreditNote.find({ shopId: req.shop._id })
      .populate("farmerId", "name village")
      .populate("originalBillId", "billNo totalAmount")
      .sort({ createdAt: -1 });
    res.json({ creditNotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ────────────────────────────────────────
// LOW STOCK ALERTS
// ────────────────────────────────────────
exports.getLowStockAlerts = async (req, res) => {
  try {
    // Get all products with a threshold set
    const products = await Product.find({
      shopId: req.shop._id,
      lowStockThreshold: { $gt: 0 },
    }).lean();

    const alerts = [];
    for (const product of products) {
      const agg = await StockBatch.aggregate([
        { $match: { shopId: req.shop._id, productId: product._id, qty: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$qty" } } },
      ]);
      const totalQty = agg[0]?.total || 0;
      if (totalQty <= product.lowStockThreshold) {
        alerts.push({
          productId: product._id,
          name: product.name,
          unit: product.unit,
          currentQty: totalQty,
          threshold: product.lowStockThreshold,
          isOutOfStock: totalQty === 0,
        });
      }
    }

    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ────────────────────────────────────────
// CHECK STOCK AVAILABILITY (existing)
// ────────────────────────────────────────
exports.checkStockAvailability = async (req, res) => {
  try {
    const { items } = req.body;
    const stockStatus = [];

    for (const item of items) {
      const productObjId = new mongoose.Types.ObjectId(item.productId);
      const totalStock = await StockBatch.aggregate([
        { $match: { shopId: req.shop._id, productId: productObjId, qty: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$qty" } } },
      ]);

      const available = totalStock[0]?.total || 0;
      stockStatus.push({
        productId: item.productId,
        requested: item.qty,
        available,
        sufficient: available >= item.qty,
      });
    }

    res.json({ stockStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};