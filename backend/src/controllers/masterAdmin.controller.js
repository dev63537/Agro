const User = require('../models/User');
const Shop = require('../models/Shop');

const listShops = async (req, res) => {
  const shops = await Shop.find().sort({ createdAt: -1 });
  res.json({ shops });
};

const createShop = async (req, res) => {
  const { name, code, ownerName, email, phone, plan = 'free' } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'name and code required' });

  const existing = await Shop.findOne({ code });
  if (existing) return res.status(400).json({ error: 'Shop code already exists' });

  const shop = await Shop.create({
    name, code, ownerName, email, phone, subscription: { plan, paidUntil: null }
  });

  // Create a default shop-admin user credentials (password will be set to random)
  const password = Math.random().toString(36).slice(-8);
  const adminUser = await User.create({
    name: `${ownerName || 'ShopAdmin'}`,
    email: email || `${code}@example.com`,
    password,
    role: User.USER_ROLES.SHOP_ADMIN,
    shopId: shop._id
  });

  res.status(201).json({ shop, shopAdminCredentials: { email: adminUser.email, password } });
};

const updateShopStatus = async (req, res) => {
  const { shopId } = req.params;
  const { status } = req.body;
  const shop = await Shop.findById(shopId);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  shop.status = status;
  await shop.save();
  res.json({ shop });
};

module.exports = { listShops, createShop, updateShopStatus };
