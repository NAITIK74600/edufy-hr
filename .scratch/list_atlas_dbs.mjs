import mongoose from 'mongoose';

const atlasUri = 'mongodb+srv://naitikraj74600_db_user:uRVGHVhBdwtmctuY@cluster0.r5jflcg.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 8000 })
  .then(async () => {
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('[Atlas Databases]:');
    for (const d of dbs.databases) {
      console.log(` - ${d.name} (${(d.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.log('Error:', err.message);
    process.exit(0);
  });
