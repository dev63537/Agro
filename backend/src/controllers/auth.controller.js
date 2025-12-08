// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Login handler (used for master + shop_admin)
 * Expects: { email, password }
 * Returns: { token, user }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role, shopId: user.shopId || null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId || null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * Register Master Admin (UNLIMITED)
 * Expects: { name, email, password }
 * Note: This version allows multiple master accounts.
 */
const registerMaster = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Optional: prevent duplicate emails overall (recommended)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use. Choose another email.' });
    }

    const newMaster = await User.create({
      name,
      email,
      password,
      role: 'master',
      shopId: null
    });

    const token = jwt.sign(
      { id: newMaster._id, role: 'master' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      message: 'New master admin created',
      token,
      user: {
        id: newMaster._id,
        name: newMaster.name,
        email: newMaster.email,
        role: newMaster.role
      }
    });
  } catch (err) {
    console.error('Register master error:', err);
    return res.status(500).json({ error: 'Server error creating master admin' });
  }
};

module.exports = {
  login,
  registerMaster
};
