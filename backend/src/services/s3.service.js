const fs = require('fs');
const path = require('path');
const { s3 } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

const STORAGE_DRIVER = process.env.STORAGE_DRIVER || 'local';
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || path.join(__dirname, '..', '..', 'uploads');

const uploadBase64 = async ({ base64, keyPrefix = 'signatures', contentType = 'image/png' }) => {
  if (STORAGE_DRIVER === 'local') {
    const buffer = Buffer.from(base64.replace(/^data:\w+\/\w+;base64,/, ''), 'base64');
    if (!fs.existsSync(LOCAL_STORAGE_PATH)) fs.mkdirSync(LOCAL_STORAGE_PATH, { recursive: true });
    const filename = `${keyPrefix}-${Date.now()}-${uuidv4()}.png`;
    const fullpath = path.join(LOCAL_STORAGE_PATH, filename);
    fs.writeFileSync(fullpath, buffer);
    // return a URL path that can be served statically
    const url = `/uploads/${filename}`;
    return { url, key: filename };
  }

  const buffer = Buffer.from(base64.replace(/^data:\w+\/\w+;base64,/, ''), 'base64');
  const bucket = process.env.S3_BUCKET;
  const key = `${keyPrefix}/${Date.now()}-${uuidv4()}.png`;
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read'
  };
  const res = await s3.upload(params).promise();
  return { url: res.Location, key: res.Key };
};

const uploadBuffer = async ({ buffer, keyPrefix = 'invoices', filename = null, contentType = 'application/pdf' }) => {
  if (STORAGE_DRIVER === 'local') {
    if (!fs.existsSync(LOCAL_STORAGE_PATH)) fs.mkdirSync(LOCAL_STORAGE_PATH, { recursive: true });
    const file = filename || `${keyPrefix}-${Date.now()}-${uuidv4()}.pdf`;
    const fullpath = path.join(LOCAL_STORAGE_PATH, file);
    fs.writeFileSync(fullpath, buffer);
    return { url: `/uploads/${file}`, key: file };
  }

  const bucket = process.env.S3_BUCKET;
  const key = `${keyPrefix}/${filename || `${Date.now()}-${uuidv4()}.pdf`}`;
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read'
  };
  const res = await s3.upload(params).promise();
  return { url: res.Location, key: res.Key };
};

module.exports = { uploadBase64, uploadBuffer };
