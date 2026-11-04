import mongoose from 'mongoose';

const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function checkCols() {
  await mongoose.connect(uri);
  const cols = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:');
  for (const c of cols) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count}`);
  }
  await mongoose.disconnect();
}

checkCols().catch(console.error);

