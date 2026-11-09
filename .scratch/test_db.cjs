const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin');
  const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
  const emps = await Employee.find({ status: { $in: ['active', 'onboarding'] } })
    .select('_id employeeId firstName lastName name displayName dob joiningDate')
    .lean();
  
  console.log('Total active emps:', emps.length);
  const sample = emps.slice(0, 5).map(e => ({
    id: e.employeeId,
    firstName: e.firstName,
    lastName: e.lastName,
    name: e.name,
    displayName: e.displayName,
    resolvedName: e.displayName || ((e.firstName || '') + ' ' + (e.lastName || '')).trim() || e.name,
    hasDob: !!e.dob,
    hasJoining: !!e.joiningDate
  }));
  console.log('Sample:', JSON.stringify(sample, null, 2));

  // Count how many have birthdays in November
  const novBirthdays = emps.filter(e => {
    if (!e.dob) return false;
    const d = new Date(e.dob);
    return d.getUTCMonth() + 1 === 11;
  });
  console.log('November birthdays count:', novBirthdays.length);

  // Count how many have anniversaries in November
  const novAnniversaries = emps.filter(e => {
    if (!e.joiningDate) return false;
    const d = new Date(e.joiningDate);
    return d.getUTCMonth() + 1 === 11;
  });
  console.log('November anniversaries count:', novAnniversaries.length);

  await mongoose.disconnect();
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
