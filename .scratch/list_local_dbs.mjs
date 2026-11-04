import mongoose from 'mongoose';

const localUri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/?authSource=admin';

mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('[Local Databases]:');
    for (const d of dbs.databases) {
      console.log(` - ${d.name} (${(d.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.log('Error:', err.message);
    process.exit(0);
  });
