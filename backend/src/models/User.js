const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const USER_ROLES = {
  MASTER: 'master',
  SHOP_ADMIN: 'shop_admin'
};

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(USER_ROLES), required: true },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.statics.USER_ROLES = USER_ROLES;

module.exports = mongoose.model('User', UserSchema);

