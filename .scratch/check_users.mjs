import mongoose from 'mongoose';

const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function check() {
  await mongoose.connect(uri);
  const users = await mongoose.connection.db.collection('users').find({
    $or: [
      { email: /jagadish/i },
      { name: /jagadish/i },
      { email: /hr@/i },
      { email: /admin@/i }
    ]
  }).toArray();
  console.log('--- USERS ---');
  console.log(JSON.stringify(users.map(u => ({
    _id: String(u._id),
    email: u.email,
    name: u.name,
    role: u.role,
    designation: u.designation,
    permissions: u.permissions
  })), null, 2));

  const employees = await mongoose.connection.db.collection('employees').find({
    $or: [
      { email: /jagadish/i },
      { name: /jagadish/i }
    ]
  }).toArray();
  console.log('--- EMPLOYEES ---');
  console.log(JSON.stringify(employees.map(e => ({
    _id: String(e._id),
    employeeId: e.employeeId,
    email: e.email,
    name: e.name,
    role: e.role,
    designation: e.designation,
    department: e.department,
    managerId: e.managerId ? String(e.managerId) : null
  })), null, 2));

  await mongoose.disconnect();
}

check().catch(console.error);

