const Shop = require('../models/Shop');

const tenantMiddleware = async (req, res, next) => {
  // Expect shop id in header for shop-scoped routes
  const shopId = req.headers['x-shop-id'] || (req.user && req.user.shopId);
  if (!shopId) {
    return res.status(400).json({ error: 'Missing x-shop-id header' });
  }
  const shop = await Shop.findById(shopId);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  if (shop.status === 'suspended') {
    return res.status(403).json({ error: 'Shop suspended. Please contact master admin.' });
  }
  req.shop = shop;
  req.shopId = shop._id;
  next();
};

module.exports = { tenantMiddleware };
