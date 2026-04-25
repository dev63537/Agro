const crypto = require('crypto');

/**
 * Generate a cryptographically secure random token.
 * Returns a 64-character hex string (32 bytes).
 */
const generateToken = () => crypto.randomBytes(32).toString('hex');

/**
 * Hash a token using SHA-256 for safe storage in the database.
 * We store the hash, not the raw token — the raw token is only sent via email.
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { generateToken, hashToken };
