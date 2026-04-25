const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints.
 * Prevents brute-force attacks on login, password reset, etc.
 * Max 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
