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

    expiryDate: { type: Date },

    // Business / Invoice info (#15)
    gstNumber:       { type: String, trim: true, default: '' },
    gstPercent:      { type: Number, default: 0, min: 0, max: 100 },
    businessAddress: { type: String, default: '' },
    businessPhone:   { type: String, default: '' },
    businessEmail:   { type: String, default: '' },
    invoicePrefix:   { type: String, default: 'INV', trim: true },
    invoiceFooter:   { type: String, default: 'Thank you for your business!' },
    logoUrl:         { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
