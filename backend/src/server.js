const path = require("path");
// Load environment variables from the current directory .env
require("dotenv").config(); 
// Load environment variables from the repository root directory .env
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const dns = require("dns");

// Force IPv4 first in DNS resolution to prevent ENETUNREACH errors on hosts without IPv6 routing (e.g., Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

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
