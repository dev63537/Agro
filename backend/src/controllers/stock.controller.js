const StockBatch = require('../models/StockBatch');

const listStock = async (req, res) => {
  const { productId } = req.query;
  const q = { shopId: req.shopId };
  if (productId) q.productId = productId;
  const batches = await StockBatch.find(q).sort({ expiryDate: 1, receivedAt: 1 });
  res.json({ batches });
};

const addStock = async (req, res) => {
  const { productId, batchNo, expiryDate, qty, costPrice } = req.body;
  if (!productId || !qty) return res.status(400).json({ error: 'productId and qty required' });
  const batch = await StockBatch.create({
    shopId: req.shopId,
    productId,
    batchNo,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    qty,
    costPrice
  });
  res.status(201).json({ batch });
};

module.exports = { listStock, addStock };
