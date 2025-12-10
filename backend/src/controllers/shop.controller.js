// backend\src\controllers\shop.controller.js
const Shop = require('../models/Shop');

const getShop = async (req, res) => {
  const { shopId } = req.params;
  const shop = await Shop.findById(shopId);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  res.json({ shop });
};

const updateShop = async (req, res) => {
  const { shopId } = req.params;
  const data = req.body;
  const shop = await Shop.findByIdAndUpdate(shopId, data, { new: true });
  res.json({ shop });
};

module.exports = { getShop, updateShop };
