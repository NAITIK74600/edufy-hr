import mongoose from 'mongoose';
import fs from 'fs';

let envText = fs.readFileSync('.env', 'utf8');
let uri = envText.match(/MONGODB_URI=(.+)/)[1].trim();

mongoose.connect(uri).then(async () => {
  const mgr = await mongoose.connection.db.collection('employees').findOne({
    _id: new mongoose.Types.ObjectId('6ac0f786fdb669da90e549ca')
  });
  console.log('Manager 6ac0f786fdb669da90e549ca:');
  console.log(JSON.stringify(mgr, null, 2));

  // Also find the leave request for employee 6ae21ff04d78abebef6b279d
  const reqs = await mongoose.connection.db.collection('leaverequests').find({
    $or: [
      { employeeId: new mongoose.Types.ObjectId('6ae21ff04d78abebef6b279d') },
      { employeeId: '6ae21ff04d78abebef6b279d' },
      { employeeId: 'ETS113828' }
    ]
  }).toArray();
  console.log('Leave requests for Naitik Raj ETS113828:', JSON.stringify(reqs, null, 2));

  process.exit(0);
});
