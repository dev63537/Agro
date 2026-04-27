const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Farmer = require("../models/Farmer");
const StockBatch = require("../models/StockBatch");
const YearlyLedger = require("../models/YearlyLedger");
const mongoose = require("mongoose");

// 🔹 SALES REPORT (with date filtering)
exports.salesReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { shopId: req.shopId };

    // Apply date range filter if provided
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const bills = await Bill.find(query)
      .populate('farmerId', 'name village farmerCode')
      .sort({ createdAt: -1 });

    const total = bills.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    res.json({
      bills,
      total,
      count: bills.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 TOP FARMERS REPORT
exports.getTopFarmers = async (req, res) => {
  try {
    const agg = await Bill.aggregate([
      { $match: { shopId: req.shop._id } },
      {
        $group: {
          _id: "$farmerId",
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    // fetch farmers separately
    const farmers = await Farmer.find({
      _id: { $in: agg.map((a) => a._id) },
    }).select("name farmerCode");

    const result = agg.map((a) => {
      const farmer = farmers.find(
        (f) => f._id.toString() === a._id.toString()
      );
      return {
        farmer,
        total: a.total,
      };
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 LOW STOCK REPORT
exports.getLowStock = async (req, res) => {
  try {
    const data = await StockBatch.aggregate([
      { $match: { shopId: req.shopId } },
      {
        $group: {
          _id: "$productId",
          qty: { $sum: "$qty" },
        },
      },
      { $match: { qty: { $lte: 10 } } },
    ]);

    // populate product safely
    const populated = await Product.populate(data, {
      path: "_id",
      select: "name",
    });

    // return only valid products
    const result = populated
      .filter((p) => p._id)
      .map((p) => ({
        name: p._id.name,
        qty: p.qty,
      }));

    res.json(result);
  } catch (err) {
    console.error("Low stock report error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 STOCK REPORT
exports.stockReport = async (req, res) => {
  try {
    const data = await StockBatch.find({ shopId: req.shopId }).populate('productId', 'name unit price');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 FARMER DUES REPORT (aggregated from YearlyLedger)
exports.farmerDues = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const ledgers = await YearlyLedger.find({
      shopId: req.shopId,
      year,
      totalDue: { $gt: 0 },
    })
      .populate('farmerId', 'name phone village farmerCode active')
      .sort({ totalDue: -1 });

    const result = ledgers
      .filter(l => l.farmerId) // exclude orphaned records
      .map(l => ({
        farmer: l.farmerId,
        year: l.year,
        totalDue: l.totalDue,
        transactionCount: l.transactions.length,
        status: l.status,
      }));

    const totalDues = result.reduce((sum, r) => sum + r.totalDue, 0);

    res.json({
      dues: result,
      totalDues,
      count: result.length,
      year,
    });
  } catch (err) {
    console.error("Farmer dues error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 FARMER-WISE PURCHASE REPORT
exports.farmerPurchaseReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const matchStage = { shopId: req.shop._id };

    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = toDate;
      }
    }

    const data = await Bill.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$farmerId",
          totalAmount: { $sum: "$totalAmount" },
          billCount: { $sum: 1 },
          lastPurchase: { $max: "$createdAt" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Populate farmer names
    const farmerIds = data.map(d => d._id);
    const farmers = await Farmer.find({ _id: { $in: farmerIds } })
      .select('name phone village farmerCode active');

    const result = data.map(d => {
      const farmer = farmers.find(f => f._id.toString() === d._id.toString());
      return {
        farmer: farmer || { name: 'Unknown' },
        totalAmount: d.totalAmount,
        billCount: d.billCount,
        lastPurchase: d.lastPurchase,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Farmer purchase report error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 PRODUCT MOVEMENT REPORT
exports.productMovementReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const matchStage = { shopId: req.shop._id };

    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = toDate;
      }
    }

    const data = await Bill.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalQtySold: { $sum: "$items.qty" },
          totalRevenue: { $sum: "$items.total" },
          billCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("Product movement report error:", err);
    res.status(500).json({ error: err.message });
  }
};
