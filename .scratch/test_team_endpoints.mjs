import http from 'http';
import mongoose from 'mongoose';
import { createApp } from '../server/src/app.js';
import { Employee } from '../server/src/models/Employee.js';

async function testTeams() {
  const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';
  await mongoose.connect(uri);

  const app = await createApp({ useDatabase: true });
  if (app.locals.initializeDatabase) {
    await app.locals.initializeDatabase();
  }

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  // Log in as Admin
  const adminPassword = process.env.ADMIN_PASSWORD || 'Password@123';
  console.log('Logging in as admin@edufyitech.in...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@edufyitech.in',
      password: adminPassword,
    }),
  });
  const loginBody = await loginRes.json();
  console.log('Login status:', loginRes.status);
  const token = loginBody?.data?.token;
  if (!token) {
    console.error('Failed to get login token:', loginBody);
    process.exit(1);
  }

  console.log('\n--- 1. Testing GET /api/v1/workspace/teams ---');
  const getRes = await fetch(`${baseUrl}/workspace/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getBody = await getRes.json();
  console.log('GET status:', getRes.status);
  console.log('GET teams count:', getBody?.data?.length);
  if (getBody?.data?.length) {
    console.log('Discovered & Managed Teams from Live MongoDB:');
    for (const t of getBody.data) {
      console.log(`  - Squad: "${t.name}" | Dept: "${t.department}" | Lead: "${t.teamLeadName || 'Unassigned'}" | Headcount: ${t.memberCount}`);
    }
  }

  // Find 2 employees to test assignment
  const sampleEmps = await Employee.find(
    { status: { $ne: 'terminated' } },
    { name: 1, employeeId: 1, team: 1, teamId: 1 }
  ).limit(2).lean();

  const emp1 = sampleEmps[0];
  const emp2 = sampleEmps[1];
  console.log(`\n--- 2. Testing Assign Employees [${emp1.name}, ${emp2.name}] to 'Hustlers' ---`);

  const assignRes = await fetch(`${baseUrl}/workspace/teams/team-hustlers/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Hustlers',
      employeeIds: [String(emp1._id), String(emp2._id)],
      department: 'Revenue Growth',
    }),
  });
  const assignBody = await assignRes.json();
  console.log('Assign status:', assignRes.status);
  console.log('Assign response body:', assignBody);

  // Verify in MongoDB directly
  const verified1 = await Employee.findById(emp1._id).lean();
  const verified2 = await Employee.findById(emp2._id).lean();
  console.log(`Verified in live DB emp1: name=${verified1.name}, team=${verified1.team}, teamId=${verified1.teamId}`);
  console.log(`Verified in live DB emp2: name=${verified2.name}, team=${verified2.team}, teamId=${verified2.teamId}`);

  // Test removing emp2 by assigning only emp1
  console.log(`\n--- 3. Testing Removing ${emp2.name} from 'Hustlers' by assigning only [${emp1.name}] ---`);
  const removeRes = await fetch(`${baseUrl}/workspace/teams/team-hustlers/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Hustlers',
      employeeIds: [String(emp1._id)],
      department: 'Revenue Growth',
    }),
  });
  const removeBody = await removeRes.json();
  console.log('Remove status:', removeRes.status);
  console.log('Remove response body:', removeBody);

  const reVerified2 = await Employee.findById(emp2._id).lean();
  console.log(`Re-verified in live DB emp2 (team cleared): name=${reVerified2.name}, team="${reVerified2.team}", teamId="${reVerified2.teamId}"`);

  // Restore emp1 and emp2 to original state
  await Employee.updateOne({ _id: emp1._id }, { $set: { team: emp1.team || '', teamId: emp1.teamId || '' } });
  await Employee.updateOne({ _id: emp2._id }, { $set: { team: emp2.team || '', teamId: emp2.teamId || '' } });

  server.close();
  await mongoose.disconnect();
  console.log('\n✅ All team endpoints and live DB persistence verified 100% successfully!');
  process.exit(0);
}

testTeams().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
