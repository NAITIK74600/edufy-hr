import mongoose from 'mongoose'

async function checkOrphans() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  const dupIds = [
    '6ae3c20194e63ef36c01731f', // EDU-ADM-002
    '6ae3c20194e63ef36c017320', // EDU-HR-002
    '6ae3c18411ea05abfa92b1e8', // ETS101 (Anjali Annie duplicate)
    '6ae3c18411ea05abfa92b213', // ETS21213 (Boopathi Raja duplicate)
    '6ae3c18411ea05abfa92b173', // ETS21173 (Nathiya S duplicate)
    '6ae3c18411ea05abfa92b20e', // ETS103 (Anshul Khokhar duplicate)
  ]

  console.log('Checking if duplicate IDs have associated records:')
  const collections = ['leaverequests', 'attendancerecords', 'workspacetasks', 'payrollrecords', 'leavebalances']
  for (const c of collections) {
    const col = db.collection(c)
    for (const id of dupIds) {
      const count = await col.countDocuments({
        $or: [
          { employeeId: id },
          { employeeId: new mongoose.Types.ObjectId(id) },
          { userId: id },
        ],
      })
      if (count > 0) console.log(`  ${c} has ${count} records for ${id}`)
    }
  }
  console.log('Orphan check complete.')
  await mongoose.disconnect()
}

checkOrphans()

