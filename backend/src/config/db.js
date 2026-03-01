const mongoose = require("mongoose");

function shouldDisableRetryWrites(uri) {
  if (!uri) return false;

  try {
    const parsed = new URL(uri);
    const retryWrites = parsed.searchParams.get("retryWrites");

    if (retryWrites === null) {
      return true;
    }

    return retryWrites.toLowerCase() !== "false";
  } catch (error) {
    // Keep existing behavior for non-standard MongoDB URI parsing edge cases.
    return true;
  }
}

module.exports = async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  try {
    const options = {
      autoIndex: true,
    };

    if (shouldDisableRetryWrites(mongoUri)) {
      options.retryWrites = false;
    }

    await mongoose.connect(mongoUri, options);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
};

module.exports.shouldDisableRetryWrites = shouldDisableRetryWrites;
