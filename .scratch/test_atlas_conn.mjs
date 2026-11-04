import mongoose from 'mongoose';

const atlasUri = 'mongodb+srv://naitikraj74600_db_user:uRVGHVhBdwtmctuY@cluster0.r5jflcg.mongodb.net/hr_dashboard?retryWrites=true&w=majority';

console.log('Testing connection to Atlas URI:', atlasUri);

mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 8000 })
  .then(async () => {
    console.log('[SUCCESS] Connected to MongoDB Atlas!');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(` - ${c.name}: ${count} documents`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.log('[ERROR] Connection failed:', err.message);
    process.exit(0);
  });
