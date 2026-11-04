const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('--- FINDING EMPLOYEE MISSING MANAGER ---');
  const missing = await db.collection('employees').find({
    managerId: null,
    role: { $nin: ['admin', 'director', 'managing_director'] }
  }).toArray();
  for (const m of missing) {
    console.log(JSON.stringify({
      _id: m._id,
      employeeId: m.employeeId,
      name: m.name,
      role: m.role,
      designation: m.designation,
      department: m.department
    }, null, 2));
  }

  console.log('--- INSPECTING NOTIFICATIONS COLLECTION DOCS ---');
  const notifs = await db.collection('notifications').find({}).limit(5).toArray();
  for (const n of notifs) {
    console.log(JSON.stringify(n, null, 2));
  }

  await mongoose.disconnect();
}

main().catch(console.error);

