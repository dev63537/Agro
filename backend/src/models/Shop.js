const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShopSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, index: true },
    ownerName: String,
    email: String,
    phone: String,
    address: String,

    // SaaS subscription
    plan: {
      type: String,
      enum: ["FREE", "BASIC", "PRO"],
      default: "FREE",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "SUSPENDED",
    },

    expiryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
