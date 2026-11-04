import mongoose from 'mongoose';
const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function updateCasual() {
  await mongoose.connect(uri);
  const { LeavePolicy } = await import('../server/src/models/LeavePolicy.js');

  const res = await LeavePolicy.findOneAndUpdate(
    { leaveType: 'casual' },
    { $set: { approvalStage: 'manager' } },
    { new: true }
  );
  console.log('Updated casual policy in DB:', res?.leaveType, 'approvalStage:', res?.approvalStage);

  const all = await LeavePolicy.find({}).lean();
  console.log('All DB policies:');
  all.forEach(p => console.log(p.leaveType, '=> approvalStage:', p.approvalStage));

  await mongoose.disconnect();
}
updateCasual().catch(console.error);

