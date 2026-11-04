import mongoose from 'mongoose';
import fs from 'fs';

let envText = fs.readFileSync('.env', 'utf8');
let uri = envText.match(/MONGODB_URI=(.+)/)[1].trim();

mongoose.connect(uri).then(async () => {
  const emp = await mongoose.connection.db.collection('employees').findOne({
    $or: [
      { name: /naitik/i },
      { employeeId: 'ETS110328' },
      { email: /naitik/i }
    ]
  });
  console.log('Naitik Raj DB Record:');
  console.log(JSON.stringify(emp, null, 2));

  if (emp && emp.managerId) {
    const mgr = await mongoose.connection.db.collection('employees').findOne({
      $or: [
        { _id: emp.managerId },
        { employeeId: emp.managerId },
        { id: emp.managerId }
      ]
    });
    console.log('Assigned Manager Record:');
    console.log(JSON.stringify(mgr, null, 2));
  }

  // Check the leave request for Naitik Raj
  const req = await mongoose.connection.db.collection('leaverequests').find({
    $or: [
      { employeeId: emp?._id },
      { employeeId: String(emp?._id) },
      { employeeId: emp?.employeeId }
    ]
  }).sort({ createdAt: -1 }).limit(3).toArray();
  console.log('Recent Leave Requests:');
  console.log(JSON.stringify(req, null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
