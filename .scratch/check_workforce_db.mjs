import mongoose from 'mongoose';

const localUri = 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/edufyi_ui_workforce_6bbfa24c_20261003?authSource=admin';

mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`[edufyi_ui_workforce_6bbfa24c_20261003] Collections (${collections.length}):`);
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(` - ${c.name}: ${count}`);
    }
    const empCount = await mongoose.connection.db.collection('employees').countDocuments();
    if (empCount > 0) {
      const emps = await mongoose.connection.db.collection('employees').find({}, { projection: { employeeId: 1, name: 1, designation: 1, email: 1, role: 1 } }).limit(10).toArray();
      console.log('Sample employees:', emps);
    }
    process.exit(0);
  })
  .catch(err => {
    console.log('Error:', err.message);
    process.exit(0);
  });
