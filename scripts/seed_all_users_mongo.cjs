const mongoose = require('mongoose');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

const defaultHash = hashPassword('Password@123');

const employeesToSeed = [
  // 1. Admin
  {
    employeeId: 'EDU-ADM-001',
    name: 'Admin',
    displayName: 'Admin',
    username: 'admin',
    email: 'admin@edufyi.in',
    role: 'admin',
    department: 'Executive Leadership',
    designation: 'System Administrator',
    status: 'active',
    salary: 0,
    managerKey: null,
  },
  // 2. Jagadish Babu (Managing Director)
  {
    employeeId: 'ETS21218',
    name: 'Jagadish Babu',
    displayName: 'Jagadish Babu (Managing Director)',
    username: 'jagadishbabu',
    email: 'jagadishbabu@edufyitech.in',
    role: 'director',
    department: 'Executive Leadership',
    designation: 'Managing Director',
    status: 'active',
    salary: 4500000,
    managerKey: 'admin@edufyi.in',
  },
  // 3. HR Operations
  {
    employeeId: 'EDU-HR-001',
    name: 'HR',
    displayName: 'HR (People Operations)',
    username: 'hr',
    email: 'hr@edufyi.in',
    role: 'hr',
    department: 'Human Resources',
    designation: 'HR Operations',
    status: 'active',
    salary: 1500000,
    managerKey: 'jagadishbabu@edufyitech.in',
  },
  // 4. Ravi — Revenue Growth Manager
  {
    employeeId: 'EDU-MGR-003',
    name: 'Ravi',
    displayName: 'Ravi (Revenue Growth Manager)',
    username: 'ravi',
    email: 'ravi@edufyitech.in',
    role: 'manager',
    department: 'Revenue Growth',
    designation: 'Revenue Growth Manager',
    status: 'active',
    salary: 2800000,
    managerKey: 'jagadishbabu@edufyitech.in',
  },
  // 5. Basir — Vertical Head
  {
    employeeId: 'ETS21169',
    name: 'Basir Bashir',
    displayName: 'Basir (Vertical Head)',
    username: 'basirbashir',
    email: 'basirbashir@edufyitech.in',
    role: 'manager',
    department: 'Operations',
    designation: 'Vertical Head',
    status: 'active',
    salary: 2600000,
    managerKey: 'jagadishbabu@edufyitech.in',
  },
  // 6. Venky — Senior Manager
  {
    employeeId: 'ETS21168',
    name: 'Venkatesh (Venky)',
    displayName: 'Venky (Senior Manager)',
    username: 'venkatesh',
    email: 'venkatesh@edufyitech.in',
    role: 'manager',
    department: 'Technology',
    designation: 'Senior Manager',
    status: 'active',
    salary: 2900000,
    managerKey: 'jagadishbabu@edufyitech.in',
  },
  // 7. Rohan — Team Leader (Alpha)
  {
    employeeId: 'ETS21188',
    name: 'Rohan',
    displayName: 'Rohan (Team Leader - Alpha)',
    username: 'rohan',
    email: 'rohan@edufyitech.in',
    role: 'team_lead',
    department: 'Revenue Growth',
    designation: 'Team Leader',
    team: 'Alpha',
    teamId: 'team-alpha',
    status: 'active',
    salary: 2100000,
    managerKey: 'ravi@edufyitech.in',
  },
  // 8. Anjali — Team Leader (3 Bops)
  {
    employeeId: 'ETS21189',
    name: 'Anjali Annie',
    displayName: 'Anjali (Team Leader - 3 Bops)',
    username: 'anjali',
    email: 'anjali@edufyitech.in',
    role: 'team_lead',
    department: 'Revenue Growth',
    designation: 'Team Leader',
    team: '3 Bops',
    teamId: 'team-3bops',
    status: 'active',
    salary: 2050000,
    managerKey: 'ravi@edufyitech.in',
  },
  // 9. Bhoopathi — Team Leader (Marketing)
  {
    employeeId: 'ETS21190',
    name: 'Bhoopathi Raja S',
    displayName: 'Bhoopathi (Team Leader - Marketing)',
    username: 'bhoopathi',
    email: 'bhoopathi@edufyitech.in',
    role: 'team_lead',
    department: 'Revenue Growth',
    designation: 'Team Leader',
    team: 'Marketing',
    teamId: 'team-marketing',
    status: 'active',
    salary: 2000000,
    managerKey: 'ravi@edufyitech.in',
  },
  // 10. Yash — Team Leader (Hustlers)
  {
    employeeId: 'ETS21191',
    name: 'Yashraj Misal (Yash)',
    displayName: 'Yash (Team Leader - Hustlers)',
    username: 'yash',
    email: 'yash@edufyitech.in',
    role: 'team_lead',
    department: 'Revenue Growth',
    designation: 'Team Leader',
    team: 'Hustlers',
    teamId: 'team-hustlers',
    status: 'active',
    salary: 2150000,
    managerKey: 'ravi@edufyitech.in',
  },
  // 11. Bharani — Team Leader (TUK)
  {
    employeeId: 'ETS21175',
    name: 'Bharani',
    displayName: 'Bharani (Team Leader - TUK)',
    username: 'bharani',
    email: 'bharani@edufyitech.in',
    role: 'team_lead',
    department: 'Technology',
    designation: 'Team Leader',
    team: 'TUK',
    teamId: 'team-tuk',
    status: 'active',
    salary: 2200000,
    managerKey: 'venkatesh@edufyitech.in',
  },
  // 12. Nandish — Team Leader (Thanos)
  {
    employeeId: 'ETS21176',
    name: 'Nandish K (Vadish)',
    displayName: 'Nandish (Team Leader - Thanos)',
    username: 'nandish',
    email: 'nandish@edufyitech.in',
    role: 'team_lead',
    department: 'Technology',
    designation: 'Team Leader',
    team: 'Thanos',
    teamId: 'team-thanos',
    status: 'active',
    salary: 2250000,
    managerKey: 'venkatesh@edufyitech.in',
  },
  // 13. Nathyya — Team Leader (Elites)
  {
    employeeId: 'ETS21177',
    name: 'Nathyya S',
    displayName: 'Nathyya (Team Leader - Elites)',
    username: 'nathyya',
    email: 'nathyya@edufyitech.in',
    role: 'team_lead',
    department: 'Technology',
    designation: 'Team Leader',
    team: 'Elites',
    teamId: 'team-elites',
    status: 'active',
    salary: 2100000,
    managerKey: 'venkatesh@edufyitech.in',
  },
  // 14. Mayank — Team Leader (Falcons)
  {
    employeeId: 'ETS112315',
    name: 'Mayank Aryan',
    displayName: 'Mayank (Team Leader - Falcons)',
    username: 'mayankaryan',
    email: 'mayankaryan@edufyitech.in',
    role: 'team_lead',
    department: 'Operations',
    designation: 'Team Leader',
    team: 'Falcons',
    teamId: 'team-falcons',
    status: 'active',
    salary: 2100000,
    managerKey: 'basirbashir@edufyitech.in',
  },
  // 15. Chandana Somaih — Operations Executive (Falcons)
  {
    employeeId: 'ETS21206',
    name: 'Chandana Somaih',
    displayName: 'Chandana Somaih',
    username: 'chandanasomaih',
    email: 'chandanasomaih@edufyitech.in',
    role: 'employee',
    department: 'Operations',
    designation: 'Senior Operations Executive',
    team: 'Falcons',
    teamId: 'team-falcons',
    status: 'active',
    salary: 950000,
    managerKey: 'mayankaryan@edufyitech.in',
  },
  // 16. Diya Verma — Frontend Software Engineer (TUK)
  {
    employeeId: 'ETS21178',
    name: 'Diya Verma',
    displayName: 'Diya Verma',
    username: 'diyaverma',
    email: 'diyaverma@edufyitech.in',
    role: 'employee',
    department: 'Technology',
    designation: 'Frontend Software Engineer',
    team: 'TUK',
    teamId: 'team-tuk',
    status: 'active',
    salary: 1100000,
    managerKey: 'bharani@edufyitech.in',
  },
];

async function seedMongo() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const employeesCollection = mongoose.connection.db.collection('employees');

  // Step 1: Upsert all employees and preserve or set passwordHash
  for (const emp of employeesToSeed) {
    const existing = await employeesCollection.findOne({
      $or: [{ email: emp.email }, { employeeId: emp.employeeId }]
    });

    const updateDoc = {
      employeeId: emp.employeeId,
      name: emp.name,
      displayName: emp.displayName,
      username: emp.username,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      status: emp.status || 'active',
      salary: emp.salary || 0,
      location: 'Bengaluru',
      employmentType: 'Full-time',
      joiningDate: existing?.joiningDate || new Date('2023-01-15'),
      onboardingStatus: existing?.onboardingStatus || 'verified',
    };

    if (emp.team) updateDoc.team = emp.team;
    if (emp.teamId) updateDoc.teamId = emp.teamId;

    if (!existing || !existing.passwordHash) {
      updateDoc.passwordHash = defaultHash;
      updateDoc.authVersion = 1;
    }

    if (existing) {
      await employeesCollection.updateOne(
        { _id: existing._id },
        { $set: updateDoc }
      );
      console.log(`Updated employee: ${emp.name} (${emp.email})`);
    } else {
      updateDoc.createdAt = new Date();
      updateDoc.updatedAt = new Date();
      await employeesCollection.insertOne(updateDoc);
      console.log(`Inserted employee: ${emp.name} (${emp.email})`);
    }
  }

  // Step 2: Link reporting managerId ObjectIds
  const allEmps = await employeesCollection.find({}).toArray();
  const empMap = new Map();
  for (const e of allEmps) {
    empMap.set(e.email.toLowerCase(), e._id);
  }

  for (const emp of employeesToSeed) {
    if (emp.managerKey) {
      const managerMongoId = empMap.get(emp.managerKey.toLowerCase());
      if (managerMongoId) {
        await employeesCollection.updateOne(
          { email: emp.email.toLowerCase() },
          { $set: { managerId: managerMongoId } }
        );
      }
    }
  }

  console.log('Successfully synced all 16 employees and accounts in MongoDB!');
  const count = await employeesCollection.countDocuments();
  console.log(`Total employees in MongoDB: ${count}`);

  await mongoose.disconnect();
}

seedMongo().catch(err => {
  console.error('Error seeding MongoDB:', err);
  process.exit(1);
});
