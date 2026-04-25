require('dotenv').config();
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  for (const c of cols) {
    if (c.name === 'users') {
      const r = await db.collection(c.name).deleteMany({ role: { $ne: 'master' } });
      console.log(`✅ users: removed ${r.deletedCount} non-master users`);
    } else {
      const n = await db.collection(c.name).countDocuments();
      await db.collection(c.name).deleteMany({});
      console.log(`🗑️  ${c.name}: removed ${n} docs`);
    }
  }
  // Ensure master is active
  await db.collection('users').updateMany({ role: 'master' }, { $set: { isActive: true } });
  const m = await db.collection('users').find({ role: 'master' }).toArray();
  console.log(`\n🔑 Master preserved: ${m.map(u => u.email).join(', ')}`);
  await mongoose.disconnect();
  console.log('✅ Done!');
})();
