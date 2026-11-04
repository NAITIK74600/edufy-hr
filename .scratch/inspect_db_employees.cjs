const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('=== SEARCHING FOR JAGADISH AND MANJULA ===');
  const employeesCol = db.collection('employees');
  
  const jagadish = await employeesCol.find({
    $or: [
      { name: /jagadish/i },
      { email: /jagadish/i },
      { username: /jagadish/i },
      { employeeId: /DIR|001/i }
    ]
  }).toArray();
  console.log('Jagadish records found:', jagadish.length);
  for (const j of jagadish) {
    console.log(JSON.stringify({
      _id: j._id,
      employeeId: j.employeeId,
      name: j.name,
      displayName: j.displayName,
      email: j.email,
      role: j.role,
      designation: j.designation,
      level: j.level,
      hierarchyLevel: j.hierarchyLevel,
      orgLevel: j.orgLevel,
      department: j.department,
      status: j.status,
      reportingManager: j.reportingManager,
      managerId: j.managerId
    }, null, 2));
  }

  const manjula = await employeesCol.find({
    $or: [
      { name: /manjula/i },
      { email: /manjula/i },
      { displayName: /manjula/i }
    ]
  }).toArray();
  console.log('\nManjula records found:', manjula.length);
  for (const m of manjula) {
    console.log(JSON.stringify({
      _id: m._id,
      employeeId: m.employeeId,
      name: m.name,
      displayName: m.displayName,
      email: m.email,
      role: m.role,
      designation: m.designation,
      level: m.level,
      hierarchyLevel: m.hierarchyLevel,
      orgLevel: m.orgLevel,
      department: m.department,
      status: m.status,
      reportingManager: m.reportingManager,
      managerId: m.managerId
    }, null, 2));
  }

  console.log('\n=== ALL UNIQUE DESIGNATIONS AND ROLES IN EMPLOYEES COLLECTION ===');
  const allEmployees = await employeesCol.find({}).project({
    employeeId: 1, name: 1, role: 1, designation: 1, department: 1, level: 1, hierarchyLevel: 1
  }).toArray();

  const designations = new Map();
  const roles = new Map();
  for (const emp of allEmployees) {
    const des = emp.designation ?? '(NULL/UNDEFINED)';
    const rol = emp.role ?? '(NULL/UNDEFINED)';
    designations.set(des, (designations.get(des) || 0) + 1);
    roles.set(rol, (roles.get(rol) || 0) + 1);
  }

  console.log('Designation distribution:', Object.fromEntries(designations));
  console.log('Role distribution:', Object.fromEntries(roles));

  console.log('\n=== EMPLOYEES WITH DESIGNATION === "Employee" OR ROLE === "employee" ===');
  const employeeAsDesig = allEmployees.filter(e => String(e.designation || '').toLowerCase() === 'employee');
  console.log(`Employees with designation "Employee": ${employeeAsDesig.length}`);
  for (const e of employeeAsDesig) {
    console.log(`- ${e.employeeId}: ${e.name} | Role: ${e.role} | Dept: ${e.department} | Desig: ${e.designation}`);
  }

  console.log('\n=== CHECKING ROLES AND DEPARTMENTS MASTER COLLECTIONS ===');
  const rolesCol = db.collection('workspaceroles');
  const allRoles = await rolesCol.find({}).toArray();
  console.log('Workspace Roles Count:', allRoles.length);
  console.log('Workspace Roles:', allRoles.map(r => ({ name: r.name, role: r.role, title: r.title })));

  await mongoose.disconnect();
}

main().catch(console.error);

