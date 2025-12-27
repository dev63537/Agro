const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Farmer = require("../models/Farmer");
const StockBatch = require("../models/StockBatch");

// 🔹 SALES REPORT
exports.salesReport = async (req, res) => {
  try {
    const bills = await Bill.find({ shop: req.shop._id }).sort({ createdAt: -1 });

    const total = bills.reduce((sum, b) => sum + b.total, 0);

    res.json({
      success: true,
      data: {
        total,
        count: bills.length,
        bills,
      },
    });

  } catch (err) {
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
          _id: "$farmer",
          total: { $sum: "$total" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    // fetch farmers separately
    const farmers = await Farmer.find({
      _id: { $in: agg.map((a) => a._id) },
    }).select("name");

    const result = agg.map((a) => {
      const farmer = farmers.find(
        (f) => f._id.toString() === a._id.toString()
      );
      return {
        farmer,
        total: a.total,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};





// 🔹 LOW STOCK REPORT
exports.getLowStock = async (req, res) => {
  try {
    const data = await StockBatch.aggregate([
      { $match: { shopId: req.shop._id } },
      {
        $group: {
          _id: "$product",
          qty: { $sum: "$qty" },
        },
      },
      { $match: { qty: { $lte: 10 } } },
    ]);

    const populated = await Product.populate(data, {
      path: "_id",
      select: "name",
    });

    res.json(
      populated.map((p) => ({
        name: p._id.name,
        qty: p.qty,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 STOCK REPORT
exports.stockReport = async (req, res) => {
  try {
    const data = await StockBatch.find({ shop: req.shopId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 FARMER DUES REPORT
exports.farmerDues = async (req, res) => {
  try {
    const farmers = await Farmer.find({ shop: req.shopId });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
