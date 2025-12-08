const multer = require('multer');
const path = require('path');
const fs = require('fs');

const useMulterForSignatures = () => {
  if ((process.env.STORAGE_DRIVER || 'local') === 'local') {
    const uploadPath = process.env.LOCAL_STORAGE_PATH || path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

    const storage = multer.diskStorage({
      destination: (_, __, cb) => {
        cb(null, uploadPath);
      },
      filename: (_, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
      }
    });
    return multer({ storage });
  }

  // For S3 we can keep memory storage then upload to S3
  return multer({ storage: multer.memoryStorage() });
};

module.exports = { useMulterForSignatures };
