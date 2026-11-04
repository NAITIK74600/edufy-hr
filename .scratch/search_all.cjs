const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function searchAllCollections() {
  await mongoose.connect(uri);
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    const col = mongoose.connection.db.collection(c.name);
    try {
      const allDocs = await col.find({}).toArray();
      const matches = allDocs.filter(d => /manjula/i.test(JSON.stringify(d)));
      if (matches.length > 0) {
        console.log(`Found in collection ${c.name}: ${matches.length}`);
        console.log(JSON.stringify(matches, null, 2));
      }
    } catch (err) {
      // ignore
    }
  }
  await mongoose.disconnect();
}
searchAllCollections().catch(console.error);

