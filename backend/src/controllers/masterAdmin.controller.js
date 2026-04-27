const User = require('../models/User');
const Shop = require('../models/Shop');
const { generateToken, hashToken } = require('../utils/tokenGenerator');
const { sendInviteEmail, sendResetEmail } = require('../utils/emailSender');

const listShops = async (req, res) => {
  const shops = await Shop.find().sort({ createdAt: -1 });
  res.json({ shops });
};

/**
 * CREATE SHOP + SHOP ADMIN (token-based invite flow)
 * - Creates the shop
 * - Creates shop admin user with isActive: false
 * - Generates invite token and sends email
 * - Does NOT generate or return any password
 */
const createShop = async (req, res) => {
  const { name, code, ownerName, email, phone, plan = 'free' } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'name and code required' });
  if (!email) return res.status(400).json({ error: 'email is required for shop admin invite' });

  const existing = await Shop.findOne({ code });
  if (existing) return res.status(400).json({ error: 'Shop code already exists' });

  // Check if email is already in use
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) return res.status(400).json({ error: 'Email already in use' });

  const shop = await Shop.create({
    name, code, ownerName, email, phone, plan: plan.toUpperCase(), status: 'ACTIVE'
  });

  // Generate secure invite token
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);

  // Create shop admin with NO password (inactive until they set it)
  const adminUser = await User.create({
    name: ownerName || 'ShopAdmin',
    email,
    password: null,
    role: User.USER_ROLES.SHOP_ADMIN,
    shopId: shop._id,
    isActive: false,
    inviteToken: hashedToken,
    inviteTokenExpiry: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
  });

  // Send invite email
  try {
    await sendInviteEmail(email, adminUser.name, rawToken);
    console.log(`📧 Invite sent to: ${email}`);
  } catch (emailErr) {
    console.error('Failed to send invite email:', emailErr);
    // Shop is still created — admin can resend later
  }

  res.status(201).json({
    shop,
    message: `Invite email sent to ${email}. Shop admin must set their password to activate.`,
    shopAdmin: { email: adminUser.email, name: adminUser.name },
  });
};

const updateShopStatus = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status, plan, expiryDate, name, ownerName, email, phone, address } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    // 🔹 Update status (ACTIVE / SUSPENDED)
    if (status) {
      shop.status = status.toUpperCase();
    }
    // 🔹 Update plan (FREE / BASIC / PRO)
    if (plan) {
      shop.plan = plan;
    }

    // 🔹 Update expiry date
    if (expiryDate) {
      shop.expiryDate = new Date(expiryDate);
    }

    // 🔹 Update editable fields
    if (name !== undefined) shop.name = name;
    if (ownerName !== undefined) shop.ownerName = ownerName;
    if (email !== undefined) shop.email = email;
    if (phone !== undefined) shop.phone = phone;
    if (address !== undefined) shop.address = address;

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

/**
 * RESET SHOP ADMIN PASSWORD (triggered by Master)
 * - Finds the shop admin user for the given shop
 * - Generates a reset token
 * - Sends reset email
 */
const resetShopAdminPassword = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    // Find the shop admin user
    const shopAdmin = await User.findOne({ shopId: shop._id, role: 'shop_admin' });
    if (!shopAdmin) {
      return res.status(404).json({ error: "No shop admin found for this shop" });
    }

    // Generate reset token
    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);

    shopAdmin.resetToken = hashedToken;
    shopAdmin.resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await shopAdmin.save();

    // Send reset email
    try {
      await sendResetEmail(shopAdmin.email, shopAdmin.name, rawToken);
      console.log(`📧 Reset email sent to: ${shopAdmin.email}`);
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({
      message: `Password reset email sent to ${shopAdmin.email}`,
    });
  } catch (err) {
    console.error("Reset shop admin password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

/**
 * RESEND INVITE EMAIL (triggered by Master)
 * - Generates a new invite token for a shop admin that hasn't activated yet
 */
const resendInvite = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shopAdmin = await User.findOne({ shopId, role: 'shop_admin' });
    if (!shopAdmin) {
      return res.status(404).json({ error: "No shop admin found for this shop" });
    }

    if (shopAdmin.isActive) {
      return res.status(400).json({ error: "Shop admin is already active" });
    }

    // Generate new invite token
    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);

    shopAdmin.inviteToken = hashedToken;
    shopAdmin.inviteTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
    await shopAdmin.save();

    try {
      await sendInviteEmail(shopAdmin.email, shopAdmin.name, rawToken);
    } catch (emailErr) {
      console.error('Failed to resend invite email:', emailErr);
      return res.status(500).json({ error: 'Failed to send invite email' });
    }

    res.json({ message: `Invite email resent to ${shopAdmin.email}` });
  } catch (err) {
    console.error("Resend invite error:", err);
    res.status(500).json({ error: "Failed to resend invite" });
  }
};

module.exports = { listShops, createShop, updateShopStatus, resetShopAdminPassword, resendInvite };
