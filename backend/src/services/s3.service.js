const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Upload BASE64 image (signature)
 */
const uploadBase64 = async ({ base64, keyPrefix }) => {
  if (!base64) return null;

  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 data");

  const buffer = Buffer.from(matches[2], "base64");

  const dir = path.join(__dirname, "..", "..", "uploads", keyPrefix);
  ensureDir(dir);

  const filename = `${uuid()}.png`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${keyPrefix}/${filename}`,
  };
};

/**
 * Upload PDF buffer
 */
const uploadBuffer = async ({ buffer, keyPrefix, filename }) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid buffer data");
  }

  if (!filename) {
    throw new Error("Filename is required for uploadBuffer");
  }

  const dir = path.join(__dirname, "..", "..", "uploads", keyPrefix);
  ensureDir(dir);

  const filePath = path.join(dir, filename);

  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${keyPrefix}/${filename}`,
  };
};

module.exports = {
  uploadBase64,
  uploadBuffer,
};
