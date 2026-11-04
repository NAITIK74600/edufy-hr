import mongoose from 'mongoose';
const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/?authSource=admin';

async function listDbs() {
  await mongoose.connect(uri);
  const adminDb = mongoose.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log('Databases on 127.0.0.1:27017:');
  for (const d of dbs.databases) {
    console.log('-', d.name, (d.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB');
    const conn = mongoose.createConnection('mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/' + d.name + '?authSource=admin');
    await conn.asPromise();
    const cols = await conn.db.listCollections().toArray();
    for (const c of cols) {
      if (c.name.toLowerCase().includes('leave')) {
        const count = await conn.db.collection(c.name).countDocuments();
        if (count > 0) console.log('   col:', c.name, 'count:', count);
      }
    }
    await conn.close();
  }
  await mongoose.disconnect();
}
listDbs().catch(console.error);

