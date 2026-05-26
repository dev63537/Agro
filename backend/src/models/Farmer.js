const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FarmerSchema = new Schema({
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    farmerCode: { type: String, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String },
    village: { type: String },
    address: { type: String },
    meta: { type: Schema.Types.Mixed },
    active: { type: Boolean, default: true },
    creditLimit: { type: Number, default: 0, min: 0 }, // 0 = no limit
    pendingDues: { type: Number, default: 0, min: 0 },  // denormalized total
    isDeleted: { type: Boolean, default: false, index: true }, // #17 soft delete
    deletedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

FarmerSchema.index({ shopId: 1, name: 1 });

module.exports = mongoose.model('Farmer', FarmerSchema);

