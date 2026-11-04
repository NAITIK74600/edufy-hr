import mongoose from 'mongoose';
import fs from 'fs';

let envText = fs.readFileSync('.env', 'utf8');
let uri = envText.match(/MONGODB_URI=(.+)/)[1].trim();

mongoose.connect(uri).then(async () => {
  const emp = await mongoose.connection.db.collection('employees').findOne({
    $or: [
      { email: 'jagadishbabu@edufyitech.in' },
      { name: /jagadish/i },
      { employeeId: /JAG/i }
    ]
  });
  console.log('Jagadish Babu DB record:');
  console.log(JSON.stringify(emp, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
