const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('employees');

  const doc = await col.findOne({ _id: new mongoose.Types.ObjectId('6ae3c18411ea05abfa92b1d9') });
  console.log('Full Jagadish Babu doc:');
  console.log(JSON.stringify(doc, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);

