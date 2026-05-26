const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints.
 * Max 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter — protects all shop API endpoints.
 * Max 200 requests per minute per IP (prevents scraping / abuse).
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: { error: 'Too many API requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Billing-specific limiter — prevents spam bill creation.
 * Max 30 bills per minute per IP.
 */
const billingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many billing requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, billingLimiter };
