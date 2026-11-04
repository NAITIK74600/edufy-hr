import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

// 1. Load environment variables (.env)
try { process.loadEnvFile?.(); } catch {}
const envCandidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server', '.env'),
  path.resolve(process.cwd(), '..', '.env'),
];

for (const envPath of envCandidatePaths) {
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...v] = trimmed.split('=');
          const key = k.trim();
          if (key && !process.env[key]) {
            process.env[key] = v.join('=').trim();
          }
        }
      }
      break;
    } catch {}
  }
}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('[ERROR] MONGODB_URI not found in .env. Please ensure .env exists with MONGODB_URI.');
  process.exit(1);
}

async function restore() {
  console.log('[INFO] Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  const coll = mongoose.connection.collection('attendancerecords');

  const today = new Date().toISOString().slice(0, 10);
  console.log(`[INFO] Searching for auto-punched out records (Today: ${today})...`);

  // Target any records that have checkIn and were auto-punched out
  const query = {
    $or: [
      { autoPunchOut: true },
      { punchOutReason: { $regex: /auto punch out|disconnect|inactive/i } },
      { totalHours: { $regex: /auto punch out/i } },
    ],
    checkIn: { $nin: [null, ''] },
  };

  const records = await coll.find(query).toArray();

  if (records.length === 0) {
    console.log('[INFO] No auto-punched out records found. All active attendances are in good state!');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`[FOUND] Found ${records.length} records to restore:\n`);

  let count = 0;
  for (const r of records) {
    // Preserve status if it was 'late', else set 'present'
    const cleanStatus = r.status === 'late' || r.isLate ? 'late' : 'present';

    await coll.updateOne(
      { _id: r._id },
      {
        $set: {
          checkOut: null,
          checkOutAt: null,
          autoPunchOut: false,
          punchOutReason: '',
          punchOutType: 'manual',
          isEarlyLogout: false,
          earlyLogoutCount: 0,
          isHalfDay: false,
          totalHours: 'Active (Live)',
          status: cleanStatus,
        },
      }
    );

    count++;
    console.log(`✅ [RESTORED] ${r.employeeId || 'Unknown'} (${r.employeeName || 'Staff'}) | Date: ${r.date} | In: ${r.checkIn} | Previous Out: ${r.checkOut || 'N/A'}`);
  }

  console.log(`\n🎉 [SUCCESS] Successfully restored ${count} attendance records back to Active (Live)!`);
  await mongoose.disconnect();
}

restore().catch((err) => {
  console.error('[ERROR] Restoration failed:', err.message || err);
  process.exit(1);
});

