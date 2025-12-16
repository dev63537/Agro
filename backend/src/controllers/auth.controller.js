const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Shop = require("../models/Shop");

/**
 * LOGIN (Master + Shop Admin)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 🔑 Fetch shop ONLY for shop admin
    let shop = null;
    if (user.role === "shop_admin" && user.shopId) {
      shop = await Shop.findById(user.shopId).select(
        "name status plan expiryDate"
      );
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        shopId: user.shopId || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // ✅ DO NOT BLOCK LOGIN BASED ON SHOP STATUS
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId || null,
        shop: shop || null, // 🔥 IMPORTANT
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
};

/**
 * REGISTER MASTER ADMIN
 */
const registerMaster = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const master = await User.create({
      name,
      email,
      password,
      role: "master",
      shopId: null,
    });

    const token = jwt.sign(
      { id: master._id, role: "master" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "Master admin created",
      token,
      user: {
        id: master._id,
        name: master.name,
        email: master.email,
        role: master.role,
      },
    });
  } catch (err) {
    console.error("Register master error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  login,
  registerMaster,
};
