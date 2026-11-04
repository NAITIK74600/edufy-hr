const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('=== USERS COLLECTION SEARCH ===');
  const usersCol = db.collection('users');
  const users = await usersCol.find({
    $or: [{ username: /jagadish/i }, { email: /jagadish/i }, { name: /jagadish/i }, { employeeId: /21218|DIR/i }]
  }).toArray();
  console.log('Users found:', users.length);
  for (const u of users) {
    console.log(JSON.stringify(u, null, 2));
  }

  console.log('\n=== CHECKING ALL ROLES IN USERS COLLECTION ===');
  const allUsers = await usersCol.find({}).toArray();
  const userRoles = {};
  for (const u of allUsers) {
    const r = u.role || '(no role)';
    userRoles[r] = (userRoles[r] || 0) + 1;
  }
  console.log('User roles distribution:', userRoles);

  console.log('\n=== CHECKING MANJULA IN ALL COLLECTIONS ===');
  const collections = await db.listCollections().toArray();
  for (const colInfo of collections) {
    const col = db.collection(colInfo.name);
    const count = await col.countDocuments({
      $or: [
        { name: /manjula/i },
        { displayName: /manjula/i },
        { email: /manjula/i },
        { username: /manjula/i }
      ]
    });
    if (count > 0) {
      console.log(`Found in collection "${colInfo.name}": count = ${count}`);
      const docs = await col.find({
        $or: [
          { name: /manjula/i },
          { displayName: /manjula/i },
          { email: /manjula/i },
          { username: /manjula/i }
        ]
      }).toArray();
      console.log(docs);
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);

