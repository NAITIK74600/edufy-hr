import mongoose from 'mongoose'

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  const deleteResult = await mongoose.connection.collection('leaverequests').deleteOne({ _id: new mongoose.Types.ObjectId('6adb88b2fe8986fe9f49ee80') })
  console.log('Deleted request 6adb88b2fe8986fe9f49ee80:', deleteResult)

  const updateBalance = await mongoose.connection.collection('leavebalances').updateOne(
    { employeeId: new mongoose.Types.ObjectId('6ada3dc072329ca39600c28f'), leaveType: 'casual' },
    { $set: { used: 0, reserved: 0 } }
  )
  console.log('Restored casual leave balance:', updateBalance)

  const allLeaves = await mongoose.connection.collection('leaverequests').find({}).toArray()
  console.log('Remaining leaves in MongoDB:', allLeaves.length)
  allLeaves.forEach((l) => console.log(l._id.toString(), l.startDate, l.endDate, l.status, l.reason))
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
