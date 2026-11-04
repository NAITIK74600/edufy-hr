import mongoose from 'mongoose';

const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function checkRequests() {
  await mongoose.connect(uri);
  const requests = await mongoose.connection.db.collection('leaverequests').find({}).toArray();
  console.log(`Total leave requests in leaverequests: ${requests.length}`);
  console.log(JSON.stringify(requests, null, 2));

  // Also check if there are other collections
  const allCols = await mongoose.connection.db.listCollections().toArray();
  for (const c of allCols) {
    if (c.name.toLowerCase().includes('leave')) {
      const docs = await mongoose.connection.db.collection(c.name).find({}).toArray();
      console.log(`Col ${c.name} count: ${docs.length}`);
      if (docs.length > 0 && c.name !== 'leavebalances') {
        console.log(JSON.stringify(docs, null, 2));
      }
    }
  }

  await mongoose.disconnect();
}

checkRequests().catch(console.error);

