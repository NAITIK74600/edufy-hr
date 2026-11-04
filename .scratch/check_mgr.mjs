import mongoose from 'mongoose';

const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function check() {
  await mongoose.connect(uri);
  const mgr = await mongoose.connection.db.collection('employees').findOne({
    $or: [
      { _id: new mongoose.Types.ObjectId('6ac0f786fdb669da90e549ca') },
      { id: '6ac0f786fdb669da90e549ca' }
    ]
  });
  console.log('Manager:', mgr ? {
    _id: String(mgr._id),
    name: mgr.name,
    role: mgr.role,
    designation: mgr.designation,
    email: mgr.email,
    department: mgr.department
  } : 'NOT FOUND');

  const naitik = await mongoose.connection.db.collection('employees').findOne({
    email: /naitik/i
  });
  console.log('Naitik:', naitik ? {
    _id: String(naitik._id),
    name: naitik.name,
    role: naitik.role,
    designation: naitik.designation,
    email: naitik.email,
    department: naitik.department,
    managerId: naitik.managerId ? String(naitik.managerId) : null,
    reportingManager: naitik.reportingManager
  } : 'NOT FOUND');

  await mongoose.disconnect();
}

check().catch(console.error);

