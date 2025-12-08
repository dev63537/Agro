const Bill = require("../models/Bill");
const Farmer = require("../models/Farmer");
const Product = require("../models/Product");
const StockBatch = require("../models/StockBatch");

exports.getSalesReport = async (req, res) => {
  const shopId = req.shopId;

  const sales = await Bill.aggregate([
    { $match: { shopId } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$total" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.json(sales);
};

exports.getTopFarmers = async (req, res) => {
  const shopId = req.shopId;

  const farmers = await Bill.aggregate([
    { $match: { shopId } },
    {
      $group: {
        _id: "$farmerId",
        total: { $sum: "$total" }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "farmers",
        localField: "_id",
        foreignField: "_id",
        as: "farmer"
      }
    },
    { $unwind: "$farmer" }
  ]);

  res.json(farmers);
};

exports.getLowStock = async (req, res) => {
  const shopId = req.shopId;

  const products = await Product.find({ shopId });
  const batches = await StockBatch.find({ shopId });

  const stockSummary = products.map((prod) => {
    const qty = batches
      .filter((b) => b.productId.toString() === prod._id.toString())
      .reduce((sum, b) => sum + b.qty, 0);

    return {
      name: prod.name,
      qty
    };
  });

  const low = stockSummary.filter((p) => p.qty <= 10);

  res.json(low);
};
