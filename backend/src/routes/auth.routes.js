const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter');

const {
  login,
  loginValidation,
  registerMaster,
  setPassword,
  setPasswordValidation,
  resetPassword,
  resetPasswordValidation,
} = require('../controllers/auth.controller');

// Public: First-time master registration
router.post('/register-master', registerMaster);

// Login (master or shop admin) — rate limited + validated
router.post('/login', authLimiter, loginValidation, login);

// Set password (first-time shop admin activation) — rate limited + validated
router.post('/set-password', authLimiter, setPasswordValidation, setPassword);

// Reset password (from master-triggered reset email) — rate limited + validated
router.post('/reset-password', authLimiter, resetPasswordValidation, resetPassword);

module.exports = router;
