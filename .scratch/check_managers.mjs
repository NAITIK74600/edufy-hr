import mongoose from 'mongoose';
const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function checkManagers() {
  await mongoose.connect(uri);
  const { Employee } = await import('../server/src/models/Employee.js');

  const employees = await Employee.find({}).lean();
  console.log('Total employees in DB:', employees.length);

  const managers = new Map();
  employees.forEach(e => {
    if (e.managerId) {
      const mgrId = String(e.managerId);
      managers.set(mgrId, (managers.get(mgrId) || 0) + 1);
    }
  });

  console.log('Unique managerIds referenced:', managers.size);
  for (const [mgrId, count] of managers.entries()) {
    const mgr = employees.find(e => String(e._id) === mgrId);
    console.log(`Manager ${mgrId} (${count} reports):`, mgr ? { name: mgr.name, role: mgr.role, email: mgr.email, designation: mgr.designation, employeeId: mgr.employeeId } : 'NOT FOUND IN EMPLOYEES');
  }

  await mongoose.disconnect();
}
checkManagers().catch(console.error);

