import mongoose from 'mongoose';
import { Employee } from '../server/src/models/Employee.js';

const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function main() {
  await mongoose.connect(uri);
  const count = await Employee.countDocuments({});
  console.log('Total employee count in DB:', count);
  
  const sample = await Employee.findOne({ status: 'active' }).lean();
  console.log('Sample employee:', {
    name: sample?.firstName ? sample.firstName + ' ' + sample.lastName : sample?.name,
    dob: sample?.dob,
    joiningDate: sample?.joiningDate,
    department: sample?.department,
    role: sample?.role
  });

  const countWithDob = await Employee.countDocuments({ dob: { $exists: true, $ne: null } });
  const countWithJoining = await Employee.countDocuments({ joiningDate: { $exists: true, $ne: null } });
  console.log({ countWithDob, countWithJoining });

  // Let's inspect 5 sample employees and their DOBs
  const list = await Employee.find({ status: 'active' }).limit(5).lean();
  console.log('Sample 5 employee birthdays:');
  list.forEach(e => {
    console.log(`- ${e.firstName || e.name}: DOB=${e.dob}, Joining=${e.joiningDate}, Dept=${e.department}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
