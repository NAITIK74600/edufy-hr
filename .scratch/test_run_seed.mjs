import mongoose from 'mongoose';
import { seedAllEmployees } from '../server/src/modules/employees/seedAllEmployees.js';

const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function main() {
  await mongoose.connect(uri);
  console.log('Connected. Running seedAllEmployees()...');
  await seedAllEmployees();

  const col = mongoose.connection.db.collection('employees');
  const j = await col.findOne({ employeeId: 'ETS21218' });
  console.log('Updated Jagadish record in DB:');
  console.log(JSON.stringify({
    _id: j._id,
    employeeId: j.employeeId,
    name: j.name,
    role: j.role,
    designation: j.designation,
    department: j.department,
    permissions: j.permissions,
  }, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);

