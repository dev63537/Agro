// backend/createMaster.js
// Run from backend folder: node createMaster.js
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// load User model from your backend src (adjust path if your project stores models elsewhere)
const User = require('./src/models/User'); // <- ensure this path exists

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agro_billing';

  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // change these as you like
    const data = {
      name: 'Master Dev',
      email: 'master@example.com',
      password: '123456', // model should hash this on save (if your model has pre-save hashing)
      role: 'master',
      shopId: null
    };

    // remove existing with same email to avoid duplicate-key error
    await User.deleteMany({ email: data.email });

    const created = await User.create(data);
    console.log('Master user created:', {
      id: created._id.toString(),
      email: created.email,
      name: created.name,
      role: created.role
    });
  } catch (err) {
    console.error('Error creating master:', err);
  } finally {
    mongoose.disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
