import test from 'node:test'
import assert from 'node:assert/strict'
import { hrStore } from '../src/services/hrStore.js'
import { normalizeLeave } from '../src/services/connectedStore.js'
import { getDailyAttendanceStatus } from '../src/utils/attendanceUtils.js'

test('Half Day Leave Feature Verification', async (t) => {
  const employee = {
    id: 'emp-half-test',
    employeeId: 'ETS9999',
    name: 'Test HalfDay Employee',
    role: 'employee',
    department: 'Technology',
  }

  await t.test('hrStore.applyLeave creates half-day request with 0.5 days and session', () => {
    const leaveReq = hrStore.applyLeave({
      employeeId: employee.id,
      employeeName: employee.name,
      leaveType: 'casual',
      startDate: '2026-11-04',
      endDate: '2026-11-04',
      days: 0.5,
      isHalfDay: true,
      halfDayPeriod: 'first_half',
      reason: 'Doctor consultation in morning',
    }, employee)

    assert.ok(leaveReq.id, 'Leave request created')
    assert.equal(leaveReq.isHalfDay, true, 'isHalfDay flag set')
    assert.equal(leaveReq.halfDayPeriod, 'first_half', 'halfDayPeriod correctly set')
    assert.equal(leaveReq.days, 0.5, 'days is exactly 0.5')
    assert.equal(leaveReq.startDate, '2026-11-04')
    assert.equal(leaveReq.endDate, '2026-11-04')
  })

  await t.test('normalizeLeave preserves isHalfDay, halfDayPeriod, and 0.5 days', () => {
    const rawApiData = {
      _id: 'leave-half-raw-1',
      employeeId: employee.id,
      leaveType: 'casual',
      startDate: '2026-11-05T00:00:00.000Z',
      endDate: '2026-11-05T00:00:00.000Z',
      units: 0.5,
      isHalfDay: true,
      halfDayPeriod: 'second_half',
      reason: 'Personal afternoon errand',
      status: 'pending_manager',
    }

    const normalized = normalizeLeave(rawApiData, [employee])
    assert.equal(normalized.isHalfDay, true, 'isHalfDay preserved')
    assert.equal(normalized.halfDayPeriod, 'second_half', 'halfDayPeriod preserved')
    assert.equal(normalized.days, 0.5, 'days is 0.5')
    assert.equal(normalized.startDate, '2026-11-05')
    assert.equal(normalized.endDate, '2026-11-05')
  })

  await t.test('getDailyAttendanceStatus: Active punch-in displays accurately without premature Half Day label', () => {
    const rules = { workStartTime: '11:00 AM', workEndTime: '08:00 PM', gracePeriodMinutes: 30 }

    // Case A: Actively working employee punched in on-time on regular day
    const onTimeRec = { checkIn: '10:55 AM', checkOut: null, status: 'present', isLate: false }
    assert.deepEqual(getDailyAttendanceStatus(onTimeRec, rules), { label: 'On-Time', tone: 'info' })

    // Case B: Actively working employee punched in late (12:15 PM) on regular day -> Must be 'Late', NOT 'Half Day'!
    const latePunchRec = { checkIn: '12:15 PM', checkOut: null, status: 'late', isLate: true }
    assert.deepEqual(getDailyAttendanceStatus(latePunchRec, rules), { label: 'Late', tone: 'warning' })

    // Case C: Actively working employee on approved first-half leave punched in for 2nd half on time -> 'Present (1/2 Day Leave)', NOT warning
    const halfDayLeaveOnTime = {
      checkIn: '03:30 PM',
      checkOut: null,
      status: 'half-day',
      isHalfDay: true,
      halfDayPeriod: 'first_half',
      isLate: false,
      occurrence: 'half_day_leave_on_time',
      approvedLeave: { isHalfDay: true, halfDayPeriod: 'first_half', leaveType: 'casual' },
    }
    assert.deepEqual(getDailyAttendanceStatus(halfDayLeaveOnTime, rules), { label: 'Present (1/2 Day Leave)', tone: 'info' })

    // Case D: Checked-out employee on approved half-day leave after completed half shift -> '1/2 Day (Approved)', tone 'info'
    const halfDayCompleted = {
      checkIn: '03:30 PM',
      checkOut: '07:30 PM', // 4 hrs worked
      status: 'half-day',
      isHalfDay: true,
      halfDayPeriod: 'first_half',
      occurrence: 'half_day_leave_on_time',
      approvedLeave: { isHalfDay: true, halfDayPeriod: 'first_half', leaveType: 'sick' },
    }
    assert.deepEqual(getDailyAttendanceStatus(halfDayCompleted, rules), { label: '1/2 Day (Approved)', tone: 'info' })

    // Case E: Employee with no punch-in is marked as Absent
    const noPunchRec = { checkIn: null, checkOut: null, status: 'absent' }
    assert.deepEqual(getDailyAttendanceStatus(noPunchRec, rules), { label: 'Absent', tone: 'danger' })
  })
})

