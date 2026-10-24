const mongoose = require('mongoose');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

async function wipeDatabaseAndSeedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI in environment!');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log('Connected to database:', db.databaseName);

  const collectionsToClear = [
    'workspacedepartments',
    'workspaceroles',
    'workspacetasks',
    'workspaceexpenses',
    'workspacedailyreports',
    'workspacedocuments',
    'workspacerequisitions',
    'workspaceannouncements',
    'attendancerecords',
    'leaverequests',
    'leavebalances',
    'payrollrecords',
    'notifications',
    'auditlogs',
    'workspaceperformancereviews',
    'workspaceperformancegoals',
    'workspacecourses',
    'workspaceenrollments',
    'workspacenotifications',
    'workspaceholidays',
    'workspacekudos',
  ];

  for (const colName of collectionsToClear) {
    try {
      const result = await db.collection(colName).deleteMany({});
      console.log(`Cleared collection ${colName}: deleted ${result.deletedCount} items`);
    } catch (err) {
      console.log(`Collection ${colName} error or does not exist:`, err.message);
    }
  }

  // Wipe all employees
  const empCol = db.collection('employees');
  const empResult = await empCol.deleteMany({});
  console.log(`Cleared employees collection: deleted ${empResult.deletedCount} items`);

  // Seed Primary Administrator account
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@edufyi.in').trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'Password@123';
  const adminHash = hashPassword(adminPass);

  const adminDoc = {
    employeeId: 'EDU-ADM-001',
    name: 'Admin',
    displayName: 'Administrator',
    username: 'admin',
    email: adminEmail,
    role: 'admin',
    department: '',
    designation: 'System Administrator',
    status: 'active',
    salary: 0,
    managerId: null,
    managerKey: null,
    permissions: ['*'],
    passwordHash: adminHash,
    joiningDate: new Date('2023-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await empCol.insertOne(adminDoc);
  console.log(`Successfully seeded primary Administrator account (${adminEmail})!`);

  console.log('\n--- VERIFICATION ---');
  const remainingEmployees = await empCol.find({}).toArray();
  console.log(`Remaining employees in DB: ${remainingEmployees.length}`);
  remainingEmployees.forEach(e => console.log(`- ${e.name} (${e.email}) [${e.role}]`));

  const deptCount = await db.collection('workspacedepartments').countDocuments();
  console.log(`Remaining departments in DB: ${deptCount}`);

  const roleCount = await db.collection('workspaceroles').countDocuments();
  console.log(`Remaining custom roles in DB: ${roleCount}`);

  await mongoose.disconnect();
  console.log('MongoDB disconnected successfully.');
}

wipeDatabaseAndSeedAdmin().catch((err) => {
  console.error('Fatal error during database wipe:', err);
  process.exit(1);
});
