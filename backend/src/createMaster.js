// backend/createMaster.js
// Run from project root: node .\backend\src\createMaster.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const path = require('path');

// load User model from your backend src (adjust path if your project stores models elsewhere)
const User = require('./models/User'); // <- fixed path (file is already inside src/)

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agro_billing';

  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // change these as you like
    const data = {
      name: 'Master Dev',
      email: 'malvidevendr117@gmail.com',
      password: '27_01_2007',
      role: 'master',
      isActive: true,       // ← must be true so login works
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
