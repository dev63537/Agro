const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FarmerSchema = new Schema({
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String },
    village: { type: String },
    meta: { type: Schema.Types.Mixed },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

FarmerSchema.index({ shopId: 1, name: 1 });

module.exports = mongoose.model('Farmer', FarmerSchema);

