const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Farmer = require("../models/Farmer");
const StockBatch = require("../models/StockBatch");

// 🔹 SALES REPORT
exports.salesReport = async (req, res) => {
  try {
    const bills = await Bill.find({ shopId: req.shopId })
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
      // ✅ FIX 1: correct shop field
      { $match: { shopId: req.shopId } },

      // ✅ FIX 2: correct product field
      {
        $group: {
          _id: "$productId",
          qty: { $sum: "$qty" },
        },
      },

      // ✅ threshold
      { $match: { qty: { $lte: 10 } } },
    ]);

    // ✅ populate product safely
    const populated = await Product.populate(data, {
      path: "_id",
      select: "name",
    });

    // ✅ return only valid products
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

// 🔹 FARMER DUES REPORT
exports.farmerDues = async (req, res) => {
  try {
    const farmers = await Farmer.find({ shopId: req.shopId });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
