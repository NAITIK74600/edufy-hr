import assert from 'node:assert/strict'
import {
  resolveShift,
  evaluateShiftLateness,
  parseTimeToMinutes,
  formatTime12,
  formatTime24,
} from '../server/src/modules/attendance/attendance.service.js'

console.log('--- STARTING SHIFT & LATENESS MATRIX TESTS ---')

// 1. Exact start match
{
  const res = evaluateShiftLateness({
    punchTime: '09:00 PM',
    shiftStartMins: parseTimeToMinutes('09:00 PM'), // 1260
    shiftEndMins: parseTimeToMinutes('11:00 PM'), // 1380
    gracePeriodMinutes: 15,
  })
  assert.equal(res.isLate, false, 'Exact 09:00 PM punch must not be late')
  assert.equal(res.lateMinutes, 0, 'lateMinutes must be 0')
  console.log('✓ Test 1 Passed: Exact 09:00 PM punch is NOT late')
}

// 2. User issue case: General (06:36 PM – 08:00 PM) punch at 06:23 PM (early)
{
  const shift = resolveShift('General (06:36 PM – 08:00 PM)', null, { workStartTime: '06:36 PM', workEndTime: '08:00 PM' })
  assert.equal(shift.startTime, '18:36', `Expected 18:36, got ${shift.startTime}`)
  assert.equal(shift.startMins, 18 * 60 + 36)

  const res = evaluateShiftLateness({
    punchTime: '06:23 PM',
    shiftStartMins: shift.startMins,
    shiftEndMins: shift.endMins,
    gracePeriodMinutes: 15,
  })
  assert.equal(res.isLate, false, 'Punch at 06:23 PM for 06:36 PM shift must NOT be late')
  assert.equal(res.lateMinutes, 0)
  console.log('✓ Test 2 Passed: Early punch at 06:23 PM for 06:36 PM shift is NOT late')
}

// 3. User issue case: General (09:19 PM – 11:00 PM) punch at 09:20 PM (1 min after start, grace 15)
{
  const shift = resolveShift('General (09:19 PM – 11:00 PM)', null, { workStartTime: '21:19', workEndTime: '23:00' })
  assert.equal(shift.startMins, 21 * 60 + 19)

  const res = evaluateShiftLateness({
    punchTime: '09:20 PM',
    shiftStartMins: shift.startMins,
    shiftEndMins: shift.endMins,
    gracePeriodMinutes: 15,
  })
  assert.equal(res.isLate, false, '09:20 PM for 09:19 PM shift with 15m grace must NOT be late')
  assert.equal(res.diff, 1)
  console.log('✓ Test 3 Passed: 09:20 PM for 09:19 PM shift with 15m grace is NOT late')
}

// 4. Over grace period: 09:36 PM for 09:19 PM shift (17 mins after start, grace 15)
{
  const res = evaluateShiftLateness({
    punchTime: '09:36 PM',
    shiftStartMins: 21 * 60 + 19,
    shiftEndMins: 23 * 60,
    gracePeriodMinutes: 15,
  })
  assert.equal(res.isLate, true, '09:36 PM for 09:19 PM shift with 15m grace MUST be late')
  assert.equal(res.diff, 17)
  console.log('✓ Test 4 Passed: 09:36 PM (> 15m grace) correctly marked as late')
}

// 5. Morning shift: 05:36 AM – 08:00 PM (as shown in user screenshot media_1793197267056_abdb63bf.png)
{
  const shift = resolveShift('General', null, { workStartTime: '05:36', workEndTime: '20:00' })
  assert.equal(shift.startTime, '05:36')
  assert.equal(shift.endTime, '20:00')
  assert.equal(shift.display, 'General (05:36 AM – 08:00 PM)')
  assert.equal(shift.startMins, 5 * 60 + 36)

  const res = evaluateShiftLateness({
    punchTime: '05:36 AM',
    shiftStartMins: shift.startMins,
    shiftEndMins: shift.endMins,
    gracePeriodMinutes: 15,
  })
  assert.equal(res.isLate, false, '05:36 AM for 05:36 AM shift must NOT be late')
  console.log('✓ Test 5 Passed: Morning 05:36 AM shift correctly resolved and NOT late')
}

// 6. Overnight shift: 10:00 PM to 06:00 AM
{
  const shift = resolveShift('Night (10:00 PM – 06:00 AM)', null, { workStartTime: '22:00', workEndTime: '06:00' })
  assert.equal(shift.isOvernight, true)
  assert.equal(shift.startMins, 1320)
  assert.equal(shift.endMins, 360)

  // Punch at 10:05 PM
  const res1 = evaluateShiftLateness({
    punchTime: '10:05 PM',
    shiftStartMins: shift.startMins,
    shiftEndMins: shift.endMins,
    gracePeriodMinutes: 15,
    isOvernight: true,
  })
  assert.equal(res1.isLate, false)

  // Punch at 10:20 PM (> 15m)
  const res2 = evaluateShiftLateness({
    punchTime: '10:20 PM',
    shiftStartMins: shift.startMins,
    shiftEndMins: shift.endMins,
    gracePeriodMinutes: 15,
    isOvernight: true,
  })
  assert.equal(res2.isLate, true)

  // Punch at 00:05 AM (Day 2 of overnight shift, e.g. 125 mins late)
  const res3 = evaluateShiftLateness({
    punchTime: '12:05 AM',
    shiftStartMins: shift.startMins,
    shiftEndMins: shift.endMins,
    gracePeriodMinutes: 15,
    isOvernight: true,
  })
  assert.equal(res3.effectivePunchMins, 1445)
  assert.equal(res3.isLate, true)
  console.log('✓ Test 6 Passed: Overnight shift works properly')
}

console.log('\n>>> ALL 6 MATRIX TESTS PASSED PERFECTLY! <<<')
