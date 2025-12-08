require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Agro Billing Backend running on port ${PORT} - env=${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
