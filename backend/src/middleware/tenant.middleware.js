const Shop = require("../models/Shop");

module.exports = async (req, res, next) => {
  try {
    const shopId = req.headers["x-shop-id"];

    if (!shopId) {
      return res.status(400).json({ message: "Missing x-shop-id header" });
    }

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // 🔐 SAAS RULE 1: suspended shop
    if (shop.status === "SUSPENDED") {
      return res.status(403).json({
        message: "Shop suspended. Please contact admin.",
      });
    }

    // 🔐 SAAS RULE 2: expired shop
    if (shop.expiryDate && new Date(shop.expiryDate) < new Date()) {
      return res.status(403).json({
        message: "Subscription expired. Please renew.",
      });
    }

    // ✅ FIX (THIS LINE WAS MISSING)
    req.shop = shop;
    req.shopId = shop._id; // 🔥 REQUIRED for controllers

    next();
  } catch (err) {
    console.error("Tenant middleware error:", err);
    res.status(500).json({ message: "Tenant validation failed" });
  }
};
