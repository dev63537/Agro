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
    // Keep safe defaults for malformed/non-standard URI formats.
    return true;
  }
}

function buildMongoUri(uri) {
  if (!uri) return uri;

  try {
    const parsed = new URL(uri);

    if (shouldDisableRetryWrites(uri)) {
      parsed.searchParams.set("retryWrites", "false");
    }

    return parsed.toString();
  } catch (error) {
    // Fallback for edge-case URI formats where URL parsing fails.
    return uri;
  }
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  try {
    const resolvedUri = buildMongoUri(mongoUri);

    await mongoose.connect(resolvedUri, {
      autoIndex: process.env.NODE_ENV !== "production",
      retryWrites: false,
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
}

module.exports = connectDB;
module.exports.shouldDisableRetryWrites = shouldDisableRetryWrites;
module.exports.buildMongoUri = buildMongoUri;
