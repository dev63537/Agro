// backend/src/controllers/masterReport.controller.js
const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const StockBatch = require('../models/StockBatch');
const Shop = require('../models/Shop');

/**
 * NOTE:
 * - authMiddleware must run before these controllers so req.user is available.
 * - We check for req.user.role === 'master' inside each fn for safety.
 */

/**
 * GET /api/master/reports/sales
 * Aggregate sales across ALL shops (monthly)
 */
exports.getSalesReportMaster = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'master') {
      return res.status(403).json({ error: 'Forbidden: master only' });
    }

    // Aggregate bills across all shops by month
    const sales = await Bill.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Map to readable months
    const formatted = sales.map((s) => ({
      year: s._id.year,
      month: s._id.month,
      total: s.total,
      count: s.count
    }));

    return res.json(formatted);
  } catch (err) {
    console.error('Master sales report error:', err);
    return res.status(500).json({ error: 'Server error generating master sales report' });
  }
};

/**
 * GET /api/master/reports/farmers
 * Top farmers across all shops (by total purchase)
 */
exports.getTopFarmersMaster = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'master') {
      return res.status(403).json({ error: 'Forbidden: master only' });
    }

    const farmers = await Bill.aggregate([
      {
        $group: {
          _id: '$farmerId',
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'farmers',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      { $unwind: { path: '$farmer', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          farmerId: '$_id',
          total: 1,
          count: 1,
          name: { $ifNull: ['$farmer.name', 'Unknown'] },
          village: { $ifNull: ['$farmer.village', ''] }
        }
      }
    ]);

    return res.json(farmers);
  } catch (err) {
    console.error('Master top farmers error:', err);
    return res.status(500).json({ error: 'Server error generating master top farmers report' });
  }
};

/**
 * GET /api/master/reports/low-stock
 * Show products across shops where aggregated stock <= threshold
 */
exports.getLowStockMaster = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'master') {
      return res.status(403).json({ error: 'Forbidden: master only' });
    }

    const threshold = Number(req.query.threshold || 10);

    // Aggregate stock per product (across all shops)
    const stockAgg = await StockBatch.aggregate([
      {
        $group: {
          _id: '$productId',
          totalQty: { $sum: '$qty' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: '$_id',
          totalQty: 1,
          name: '$product.name',
          shopId: '$product.shopId'
        }
      },
      { $match: { totalQty: { $lte: threshold } } },
      { $sort: { totalQty: 1 } }
    ]);

    return res.json(stockAgg);
  } catch (err) {
    console.error('Master low stock error:', err);
    return res.status(500).json({ error: 'Server error generating master low stock report' });
  }
};
