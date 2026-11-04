import mongoose from 'mongoose';

const uri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/edufyi_hr?authSource=admin';

async function checkEdufyiHr() {
  await mongoose.connect(uri);
  const cols = await mongoose.connection.db.listCollections().toArray();
  console.log('Cols in edufyi_hr:');
  for (const c of cols) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count}`);
    if (count > 0) {
      const sample = await mongoose.connection.db.collection(c.name).find({}).limit(3).toArray();
      console.log('Sample:', JSON.stringify(sample, null, 2));
    }
  }
  await mongoose.disconnect();
}

checkEdufyiHr().catch(console.error);

