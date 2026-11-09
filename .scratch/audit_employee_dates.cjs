const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edufyi_hr';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
  const sample = await Employee.findOne({ status: 'active' }).lean();
  console.log('Sample active employee keys:', Object.keys(sample || {}));
  console.log('Sample DOB:', sample?.dob, sample?.dateOfBirth, sample?.personalDetails?.dateOfBirth);
  console.log('Sample Joining Date:', sample?.joiningDate, sample?.dateOfJoining, sample?.createdAt);
  
  const countWithDob = await Employee.countDocuments({ dob: { $exists: true, $ne: null } });
  const countWithJoining = await Employee.countDocuments({ joiningDate: { $exists: true, $ne: null } });
  const total = await Employee.countDocuments({ status: { $ne: 'deleted' } });
  console.log({ total, countWithDob, countWithJoining });

  await mongoose.disconnect();
}
run().catch(console.error);
