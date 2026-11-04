import mongoose from 'mongoose';
import fs from 'fs';

let envText = fs.readFileSync('.env', 'utf8');
let uriMatch = envText.match(/MONGODB_URI=(.+)/);
let uri = uriMatch ? uriMatch[1].trim() : '';

console.log('URI from .env:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('[SUCCESS] Connected to MongoDB!');
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
