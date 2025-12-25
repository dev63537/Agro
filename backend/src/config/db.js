const mongoose = require("mongoose");

console.log("MONGODB_URI =", process.env.MONGODB_URI);
module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
};