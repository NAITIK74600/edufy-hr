import mongoose from 'mongoose';
import fs from 'fs';

let envText = fs.readFileSync('.env', 'utf8');
let uri = envText.match(/MONGODB_URI=(.+)/)[1].trim();

mongoose.connect(uri).then(async () => {
  const emp = await mongoose.connection.db.collection('employees').findOne({
    employeeId: 'ETS110328'
  });
  console.log('Employee with ETS110328:');
  console.log(JSON.stringify(emp, null, 2));

  // Search all leave requests
  const allReqs = await mongoose.connection.db.collection('leaverequests').find({}).toArray();
  console.log('Total leave requests in DB:', allReqs.length);
  console.log(JSON.stringify(allReqs, null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
