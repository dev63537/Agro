const Bill = require("../models/Bill");
const Farmer = require("../models/Farmer");

/**
 * MASTER SALES (ALL SHOPS)
 */
exports.getSalesReportMaster = async (req, res) => {
  try {
    if (req.user.role !== "master") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const sales = await Bill.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * MASTER TOP FARMERS (ALL SHOPS)
 */
exports.getTopFarmersMaster = async (req, res) => {
  try {
    if (req.user.role !== "master") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const data = await Bill.aggregate([
      {
        $group: {
          _id: "$farmerId", // ✅ FIXED
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "farmers",
          localField: "_id",
          foreignField: "_id",
          as: "farmer",
        },
      },
      { $unwind: "$farmer" },
      {
        $project: {
          name: "$farmer.name",
          total: 1,
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


/**
 * GET /api/master/reports/shops/count
 * Total shops in system
 */
exports.getTotalShops = async (req, res) => {
  try {
    if (req.user.role !== "master") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const totalShops = await require("../models/Shop").countDocuments();
    res.json({ total: totalShops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
