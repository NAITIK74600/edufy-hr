const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('employees');

  const jagadish = await col.findOne({ employeeId: 'ETS21218' });
  if (!jagadish) {
    console.error('Jagadish record not found');
    process.exit(1);
  }

  const res = await col.updateOne(
    { employeeId: 'EDU-HR-002' },
    { $set: { managerId: jagadish._id, reportingManager: jagadish.name } }
  );

  console.log('Updated EDU-HR-002 managerId:', res.modifiedCount);

  const updated = await col.findOne({ employeeId: 'EDU-HR-002' });
  console.log('Verified EDU-HR-002:', {
    employeeId: updated.employeeId,
    name: updated.name,
    managerId: updated.managerId,
    reportingManager: updated.reportingManager
  });

  await mongoose.disconnect();
}

main().catch(console.error);

