import mongoose from 'mongoose';
import fs from 'fs';

let envText = fs.readFileSync('.env', 'utf8');
let uri = envText.match(/MONGODB_URI=(.+)/)[1].trim();

mongoose.connect(uri).then(async () => {
  const policies = await mongoose.connection.db.collection('leavepolicies').find({}).toArray();
  console.log('Leave Policies in DB:');
  console.log(JSON.stringify(policies, null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

