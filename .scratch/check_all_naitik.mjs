import mongoose from 'mongoose';

const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function checkAllNaitik() {
  await mongoose.connect(uri);
  const naitiks = await mongoose.connection.db.collection('employees').find({
    $or: [{ name: /naitik/i }, { email: /naitik/i }, { employeeId: /113828/i }]
  }).toArray();
  console.log('All Naitik records:', JSON.stringify(naitiks.map(e => ({
    _id: String(e._id),
    employeeId: e.employeeId,
    name: e.name,
    email: e.email,
    role: e.role,
    managerId: e.managerId ? String(e.managerId) : null,
    reportingManager: e.reportingManager
  })), null, 2));

  const mgr = await mongoose.connection.db.collection('employees').findOne({
    _id: new mongoose.Types.ObjectId('6ac0ec597dc833148206b440')
  });
  console.log('Manager 6ac0ec597dc833148206b440:', mgr ? {
    _id: String(mgr._id),
    employeeId: mgr.employeeId,
    name: mgr.name,
    email: mgr.email,
    role: mgr.role,
    designation: mgr.designation
  } : 'NOT FOUND');

  await mongoose.disconnect();
}

checkAllNaitik().catch(console.error);

