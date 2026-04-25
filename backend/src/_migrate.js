// One-time script to set isActive: true on existing master users
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await User.updateMany(
    { role: 'master', isActive: { $ne: true } },
    { $set: { isActive: true } }
  );
  console.log(`✅ Updated ${result.modifiedCount} master user(s) to isActive: true`);
  await mongoose.disconnect();
})();
