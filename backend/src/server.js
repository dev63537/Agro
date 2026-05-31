require("dotenv").config(); 

const app = require("./app");
const connectDB = require("./config/db");
const { startExpiryChecker } = require("./services/expiryChecker.service");

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    // Start background jobs
    startExpiryChecker(); 
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed", err);
  }
})();
