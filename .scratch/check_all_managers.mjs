import mongoose from 'mongoose';
import fs from 'fs';

let envText = fs.readFileSync('.env', 'utf8');
let uri = envText.match(/MONGODB_URI=(.+)/)[1].trim();

mongoose.connect(uri).then(async () => {
  const emps = await mongoose.connection.db.collection('employees').find({}).toArray();
  console.log(`Total employees in DB: ${emps.length}`);

  let hasManagerId = 0;
  let hasReportingManager = 0;
  let neither = 0;

  for (const e of emps) {
    if (e.managerId) hasManagerId++;
    if (e.reportingManager) hasReportingManager++;
    if (!e.managerId && !e.reportingManager) neither++;
  }

  console.log(`Employees with managerId: ${hasManagerId}`);
  console.log(`Employees with reportingManager string: ${hasReportingManager}`);
  console.log(`Employees with neither: ${neither}`);

  // Sample 5 employees with their manager info
  console.log('\nSample 5 employees:');
  for (const e of emps.slice(0, 5)) {
    let mgrName = 'None';
    if (e.managerId) {
      const m = emps.find(m => String(m._id) === String(e.managerId));
      mgrName = m ? `${m.name} (${m.role}, ${m.email})` : `ID:${e.managerId} (Not found in employees)`;
    }
    console.log(` - ${e.name} (${e.employeeId}, ${e.role}, dept: ${e.department}) -> Manager: ${mgrName}, repMgrField: ${e.reportingManager || 'None'}`);
  }

  process.exit(0);
});

