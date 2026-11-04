import mongoose from 'mongoose';
import fs from 'fs';

let envText = fs.readFileSync('.env', 'utf8');
let uri = envText.match(/MONGODB_URI=(.+)/)[1].trim();

mongoose.connect(uri).then(async () => {
  const emps = await mongoose.connection.db.collection('employees').find({
    $or: [
      { employeeId: /110328/i },
      { name: /naitik/i }
    ]
  }).toArray();
  console.log('Local DB Matches:', emps.map(e => ({ id: e._id, name: e.name, employeeId: e.employeeId, email: e.email, managerId: e.managerId, role: e.role, dept: e.department })));

  process.exit(0);
});
