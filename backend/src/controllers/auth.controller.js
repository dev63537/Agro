const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Shop = require("../models/Shop");
const { generateToken, hashToken } = require("../utils/tokenGenerator");


/* ================================
   VALIDATION RULES
================================ */
const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const setPasswordValidation = [
  body("token").notEmpty().withMessage("Token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];



/* ================================
   HELPER: handle validation errors
================================ */
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  return null;
};

/* ================================
   LOGIN (Master + Shop Admin)
================================ */
const login = async (req, res) => {
  try {
    const valErr = handleValidation(req, res);
    if (valErr) return;

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if account is activated
    if (!user.isActive) {
      return res.status(403).json({
        error: "Account not activated. Check your email for the setup link.",
      });
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
        shop: shop || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
};

/* ================================
   REGISTER MASTER ADMIN
================================ */
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
      isActive: true, // Master is active immediately
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

/* ================================
   SET PASSWORD (First-time setup)
================================ */
const setPassword = async (req, res) => {
  try {
    const valErr = handleValidation(req, res);
    if (valErr) return;

    const { token, password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      inviteToken: hashedToken,
      inviteTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Set password, activate, clear token
    user.password = password;
    user.isActive = true;
    user.inviteToken = null;
    user.inviteTokenExpiry = null;
    await user.save(); // pre-save hook will hash the password

    console.log(`✅ Password set for: ${user.email}`);

    res.json({ message: "Password set successfully. You can now log in." });
  } catch (err) {
    console.error("Set password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================================
   RESET PASSWORD
================================ */
const resetPassword = async (req, res) => {
  try {
    const valErr = handleValidation(req, res);
    if (valErr) return;

    const { token, password } = req.body;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Update password, clear reset token
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save(); // pre-save hook will hash the password

    console.log(`✅ Password reset for: ${user.email}`);

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  login,
  loginValidation,
  registerMaster,
  setPassword,
  setPasswordValidation,
  resetPassword,
  resetPasswordValidation,
};
