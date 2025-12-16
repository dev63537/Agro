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
  try {
    const { shopId } = req.params;
    const { status, plan, expiryDate } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    // 🔹 Update status (ACTIVE / SUSPENDED)
    if (status) {
      shop.status = status;
    }

    // 🔹 Update plan (FREE / BASIC / PRO)
    if (plan) {
      shop.plan = plan;
    }

    // 🔹 Update expiry date
    if (expiryDate) {
      shop.expiryDate = new Date(expiryDate);
    }

    await shop.save();

    res.json({
      message: "Shop updated successfully",
      shop,
    });
  } catch (err) {
    console.error("Update shop error:", err);
    res.status(500).json({ error: "Failed to update shop" });
  }
};




module.exports = { listShops, createShop, updateShopStatus };
