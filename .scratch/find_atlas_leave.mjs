import mongoose from 'mongoose';

const atlasUri = 'mongodb+srv://naitikraj74600_db_user:uRVGHVhBdwtmctuY@cluster0.r5jflcg.mongodb.net/hr_dashboard?retryWrites=true&w=majority';

mongoose.connect(atlasUri).then(async () => {
  const emp = await mongoose.connection.db.collection('employees').findOne({
    $or: [
      { employeeId: 'ETS110328' },
      { name: /naitik/i }
    ]
  });
  console.log('Atlas Employee:');
  console.log(JSON.stringify(emp, null, 2));

  const allReqs = await mongoose.connection.db.collection('leaverequests').find({}).toArray();
  console.log('Atlas Total leave requests in DB:', allReqs.length);
  console.log(JSON.stringify(allReqs, null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
