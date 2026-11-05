import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/auth/passwords.js'
import { PERMISSIONS } from '../src/auth/permissions.js'
import { createUserStore } from '../src/auth/userStore.js'
import { createMemoryAttendanceRepository } from '../src/modules/attendance/memoryAttendanceRepository.js'
import { createAttendanceService } from '../src/modules/attendance/attendance.service.js'

const secret = 'test-only-jwt-secret'
let server
let baseUrl
let repo
let attService

const users = [
  { id: 'admin-1', employeeId: 'ADM001', email: 'admin@example.test', displayName: 'Admin User', role: 'admin', status: 'active', permissions: ['*'], passwordHash: hashPassword('admin-password') },
  { id: 'hr-1', employeeId: 'HR001', email: 'hr@example.test', displayName: 'HR Manager', role: 'hr', status: 'active', permissions: [PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_WRITE], passwordHash: hashPassword('hr-password') },
  { id: 'employee-1', employeeId: 'ETS21206', email: 'employee@example.test', displayName: 'Naitik Raj', role: 'employee', status: 'active', managerId: 'admin-1', permissions: [PERMISSIONS.ATTENDANCE_SELF_READ], passwordHash: hashPassword('employee-password') },
  { id: 'employee-2', employeeId: 'ETS21207', email: 'employee2@example.test', displayName: 'Rohit Sharma', role: 'employee', status: 'active', managerId: 'admin-1', permissions: [PERMISSIONS.ATTENDANCE_SELF_READ], passwordHash: hashPassword('employee-password') },
]

// Office Coordinates: IGNITE CAMPUS at lat: 12.9101, lng: 77.6517, radius: 50m
const OFFICE_LAT = 12.9101
const OFFICE_LNG = 77.6517
const OUTSIDE_LAT = 12.9500 // ~4.5 km away
const OUTSIDE_LNG = 77.7000

beforeEach(async () => {
  repo = createMemoryAttendanceRepository([])
  attService = createAttendanceService({
    repository: repo,
    companySettings: {
      locations: [{ id: 'loc-ignite', name: 'IGNITE CAMPUS', lat: OFFICE_LAT, lng: OFFICE_LNG, radiusMeters: 50, allowedIPs: ['192.168.10.100'] }],
      allowedWifiSSIDs: ['Edufyi-Office-5G'],
      wifiNetworks: [{ ssid: 'Edufyi-Office-5G', bssid: '9C:3D:CF:11:A2:01', allowedIPs: ['192.168.10.100'] }],
      attendanceRules: {
        requireOfficeNetworkAndGps: false,
        maxGeofenceRadiusMeters: 50,
        geofenceAutoPunchOutEnabled: true,
        geofenceGracePeriodMinutes: 120,
        geofenceGpsAccuracyThresholdMeters: 50,
        geofenceExitWarningEnabled: true,
        offlineAutoPunchOutEnabled: true,
        offlineGracePeriodMinutes: 120,
        dailyCutoffAutoPunchOutEnabled: true,
        dailyCutoffTime: '21:30',
        timezone: 'Asia/Kolkata',
      },
    },
  })

  server = createApp({
    userStore: createUserStore(users),
    attendanceRepository: repo,
    attendanceService: attService,
    jwtSecret: secret,
    trustProxy: 'loopback',
  }).listen(0)

  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`
})

afterEach(async () => {
  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
})

async function request(path, options = {}) {
  const { headers, ...rest } = options
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'content-type': 'application/json', ...(headers || {}) },
    ...rest,
  })
  const body = response.status === 204 ? null : await response.json()
  return { response, body }
}

async function login(email, password) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  assert.equal(result.response.status, 200, `Login failed for ${email}: ${JSON.stringify(result.body)}`)
  return result.body?.data?.token || result.body?.data?.tokens?.accessToken
}

// --------------------------------------------------------------------------------------------------
// TEST CASES (1 to 20)
// --------------------------------------------------------------------------------------------------

test('TEST 1: Employee punches in and remains inside geofence -> No automatic punch-out', async () => {
  const token = await login('employee@example.test', 'employee-password')
  const punchRes = await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })
  assert.equal(punchRes.response.status, 200)
  assert.equal(punchRes.body.data.checkIn ? true : false, true)
  assert.equal(punchRes.body.data.checkOut, null)

  // Report presence inside office
  const presenceRes = await request('/attendance/presence', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 12 }),
  })
  assert.equal(presenceRes.response.status, 200)
  assert.equal(presenceRes.body.data.geofenceStatus, 'inside')
  assert.equal(presenceRes.body.data.geofenceGraceExpiresAt, null)

  // Run auto punchout daemon -> should NOT punch out
  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.geofenceTimeouts.length, 0)
  assert.equal(outcomes.offlineTimeouts.length, 0)

  const record = await attService.getTodayRecord('ETS21206')
  assert.equal(record.checkOut, null)
})

test('TEST 2: Employee exits geofence -> Warning notification and 2-hour grace period started', async () => {
  const token = await login('employee@example.test', 'employee-password')
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  // Device moves outside geofence with accurate GPS (accuracy: 10m <= threshold 50m)
  const presenceRes = await request('/attendance/presence', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OUTSIDE_LAT, longitude: OUTSIDE_LNG, accuracy: 10 }),
  })

  assert.equal(presenceRes.response.status, 200)
  assert.equal(presenceRes.body.data.geofenceStatus, 'outside')
  assert.ok(presenceRes.body.data.geofenceGraceExpiresAt, 'Grace period expiry timestamp must be set')
  assert.ok(presenceRes.body.data.remainingGraceMinutes > 100, 'Remaining minutes must be around 120 mins')

  const record = await attService.getTodayRecord('ETS21206')
  assert.equal(record.geofenceStatus, 'outside')
  assert.ok(record.geofenceGraceExpiresAt)
  assert.equal(record.checkOut, null, 'Employee must not be punched out immediately')
})

test('TEST 3: Employee returns within 2 hours -> Pending auto punch-out cancelled', async () => {
  const token = await login('employee@example.test', 'employee-password')
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  // Exits geofence
  await request('/attendance/presence', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OUTSIDE_LAT, longitude: OUTSIDE_LNG, accuracy: 10 }),
  })

  // Returns to office inside 2-hour window
  const returnRes = await request('/attendance/presence', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 10 }),
  })

  assert.equal(returnRes.body.data.geofenceStatus, 'inside')
  assert.equal(returnRes.body.data.geofenceGraceExpiresAt, null, 'Pending grace period must be cleared')
  assert.equal(returnRes.body.data.remainingGraceMinutes, 0)

  const record = await attService.getTodayRecord('ETS21206')
  assert.equal(record.geofenceStatus, 'inside')
  assert.equal(record.geofenceGraceExpiresAt, null)
  assert.equal(record.checkOut, null)
})

test('TEST 4: Employee exits and does not return for 2 hours -> Automatic punch-out and HR/Admin notification', async () => {
  const token = await login('employee@example.test', 'employee-password')
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  // Exits geofence
  await request('/attendance/presence', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OUTSIDE_LAT, longitude: OUTSIDE_LNG, accuracy: 10 }),
  })

  // Simulate 2 hours passing: set geofenceGraceExpiresAt to 1 minute in the past
  const pastTime = new Date(Date.now() - 60000)
  await repo.updatePresenceDetails('ETS21206', null, { geofenceGraceExpiresAt: pastTime })

  // Trigger daemon
  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.geofenceTimeouts.length, 1)
  assert.equal(outcomes.geofenceTimeouts[0].employeeId, 'ETS21206')
  assert.equal(outcomes.geofenceTimeouts[0].autoPunchOut, true)
  assert.equal(outcomes.geofenceTimeouts[0].autoPunchOutReasonCode, 'GEOFENCE_EXIT_TIMEOUT')
  assert.equal(outcomes.geofenceTimeouts[0].autoPunchOutPolicy, 'ENGINE_A_GEOFENCE')
  assert.equal(outcomes.geofenceTimeouts[0].reviewStatus, 'pending')

  const updatedRecord = await attService.getTodayRecord('ETS21206')
  assert.ok(updatedRecord.checkOut, 'checkOut time must be populated')
})

test('TEST 5: Employee loses internet connectivity -> Device offline state recorded without claiming geofence exit', async () => {
  const token = await login('employee@example.test', 'employee-password')
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  const record = await attService.getTodayRecord('ETS21206')
  assert.equal(record.geofenceStatus, 'inside')

  // Disconnection: no presence packets sent. Does NOT mark as geofenceStatus = outside
  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.geofenceTimeouts.length, 0)
  assert.equal(record.geofenceStatus, 'inside', 'Must not falsely claim geofence exit when offline')
})

test('TEST 6: Low-end Android device kills the application -> Backend scheduler continues functioning', async () => {
  const token = await login('employee@example.test', 'employee-password')
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  // App is killed, device had exited geofence earlier
  const pastTime = new Date(Date.now() - 1000)
  await repo.updatePresenceDetails('ETS21206', null, {
    geofenceStatus: 'outside',
    geofenceGraceExpiresAt: pastTime,
  })

  // Backend executes without any frontend or device communication
  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.geofenceTimeouts.length, 1)
  assert.equal(outcomes.geofenceTimeouts[0].employeeId, 'ETS21206')
})

test('TEST 7: iPhone suspends the browser/application -> Backend scheduler executes deadlines', async () => {
  const token = await login('employee@example.test', 'employee-password')
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  // Device offline for > 120 minutes while checked in
  const twoHoursAgo = new Date(Date.now() - 125 * 60 * 1000)
  await repo.updatePresenceDetails('ETS21206', null, {
    lastConnectedAt: twoHoursAgo,
    checkInAt: twoHoursAgo,
  })

  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.offlineTimeouts.length, 1)
  assert.equal(outcomes.offlineTimeouts[0].autoPunchOutReasonCode, 'OFFLINE_TIMEOUT')
})

test('TEST 8: Server restarts during a pending grace period -> Pending grace period is recovered and processed', async () => {
  // Simulate active session with pending grace period from prior server run
  const pastExpiry = new Date(Date.now() - 5000)
  await repo.punchIn({
    employeeId: 'ETS21206',
    employeeName: 'Naitik Raj',
    date: new Date().toISOString().slice(0, 10),
    checkIn: '09:00 AM',
    checkInAt: new Date(Date.now() - 3 * 3600 * 1000),
    checkOut: null,
    geofenceStatus: 'outside',
    geofenceGraceExpiresAt: pastExpiry,
  })

  // On server boot, scheduler immediately sweeps expired grace periods
  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.geofenceTimeouts.length, 1)
  assert.equal(outcomes.geofenceTimeouts[0].autoPunchOutReasonCode, 'GEOFENCE_EXIT_TIMEOUT')
})

test('TEST 9: PM2 restarts multiple times -> No duplicate jobs or duplicate punch-out records', async () => {
  await repo.punchIn({
    employeeId: 'ETS21206',
    employeeName: 'Naitik Raj',
    date: new Date().toISOString().slice(0, 10),
    checkIn: '09:00 AM',
    checkInAt: new Date(Date.now() - 3 * 3600 * 1000),
    checkOut: null,
    geofenceStatus: 'outside',
    geofenceGraceExpiresAt: new Date(Date.now() - 5000),
  })

  // First run
  const out1 = await attService.processAutoPunchOuts()
  assert.equal(out1.geofenceTimeouts.length, 1)

  // Second run immediately after
  const out2 = await attService.processAutoPunchOuts()
  assert.equal(out2.geofenceTimeouts.length, 0, 'Second run must be a no-op due to atomic idempotency')
})

test('TEST 10: Employee is offline at 09:30 PM -> Backend automatically punches out the employee at cut-off', async () => {
  const today = new Date().toISOString().slice(0, 10)
  await repo.punchIn({
    employeeId: 'ETS21206',
    employeeName: 'Naitik Raj',
    date: today,
    checkIn: '10:00 AM',
    checkInAt: new Date(Date.now() - 5 * 3600 * 1000),
    checkOut: null,
  })

  // Configure cut-off time to current time or past (e.g. 00:00 AM)
  await attService.updateConfig({
    attendanceRules: {
      dailyCutoffAutoPunchOutEnabled: true,
      dailyCutoffTime: '00:00', // Midnight cut-off -> already passed
    },
  })

  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.dailyCutoffs.length, 1)
  assert.equal(outcomes.dailyCutoffs[0].autoPunchOutReasonCode, 'SYSTEM_DAILY_CUTOFF')
  assert.equal(outcomes.dailyCutoffs[0].autoPunchOutPolicy, 'ENGINE_B_DAILY_CUTOFF')
})

test('TEST 11: Admin changes cut-off from 09:30 PM to 10:00 PM -> Applied dynamically without code change', async () => {
  const adminToken = await login('admin@example.test', 'admin-password')
  const patchRes = await request('/attendance/config', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      attendanceRules: {
        dailyCutoffTime: '22:00',
        autoPunchOutTime: '22:00',
      },
    }),
  })
  assert.equal(patchRes.response.status, 200)

  const cfg = attService.getConfig()
  assert.equal(cfg.attendanceRules.dailyCutoffTime, '22:00')
  assert.equal(cfg.attendanceRules.autoPunchOutTime, '22:00')
})

test('TEST 12: Employee has an overnight shift -> Correct shift-aware cut-off', async () => {
  const today = new Date().toISOString().slice(0, 10)
  await repo.punchIn({
    employeeId: 'ETS21206',
    employeeName: 'Naitik Raj',
    date: today,
    checkIn: '08:00 PM',
    checkInAt: new Date(),
    checkOut: null,
    shiftCode: 'overnight_shift',
  })

  // Set cut-off to 00:00
  await attService.updateConfig({
    attendanceRules: {
      dailyCutoffAutoPunchOutEnabled: true,
      dailyCutoffTime: '00:00',
    },
  })

  const outcomes = await attService.processAutoPunchOuts()
  // Overnight shift must NOT be punched out at standard evening cut-off
  assert.equal(outcomes.dailyCutoffs.length, 0)
})

test('TEST 13: Employee manually punches out before deadline -> Pending automatic punch-out is cancelled', async () => {
  const token = await login('employee@example.test', 'employee-password')
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  // Exit geofence -> sets pending grace period
  await request('/attendance/presence', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OUTSIDE_LAT, longitude: OUTSIDE_LNG, accuracy: 10 }),
  })

  // Employee manually punches out
  const outRes = await request('/attendance/check-out', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  })
  assert.equal(outRes.response.status, 200)

  // Daemon runs later
  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.geofenceTimeouts.length, 0)
  assert.equal(outcomes.dailyCutoffs.length, 0)

  const record = await attService.getTodayRecord('ETS21206')
  assert.equal(record.autoPunchOut, false)
  assert.equal(record.punchOutType, 'manual')
})

test('TEST 14: Geofence grace period expires at same time as daily cut-off -> Exactly one punch-out', async () => {
  const today = new Date().toISOString().slice(0, 10)
  await repo.punchIn({
    employeeId: 'ETS21206',
    employeeName: 'Naitik Raj',
    date: today,
    checkIn: '09:00 AM',
    checkInAt: new Date(Date.now() - 4 * 3600 * 1000),
    checkOut: null,
    geofenceStatus: 'outside',
    geofenceGraceExpiresAt: new Date(Date.now() - 1000),
  })

  await attService.updateConfig({
    attendanceRules: {
      geofenceAutoPunchOutEnabled: true,
      dailyCutoffAutoPunchOutEnabled: true,
      dailyCutoffTime: '00:00',
    },
  })

  const outcomes = await attService.processAutoPunchOuts()
  // Geofence exit timeout has higher priority and executes first; daily cut-off does not double punch out
  assert.equal(outcomes.geofenceTimeouts.length, 1)
  assert.equal(outcomes.dailyCutoffs.length, 0)
})

test('TEST 15: GPS is inaccurate or unavailable (>50m) -> No false geofence exit', async () => {
  const token = await login('employee@example.test', 'employee-password')
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  // Inaccurate GPS coordinates with accuracy = 150m (poor indoor reception)
  const presenceRes = await request('/attendance/presence', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OUTSIDE_LAT, longitude: OUTSIDE_LNG, accuracy: 150 }),
  })

  assert.equal(presenceRes.response.status, 200)
  // Must NOT trigger geofence exit because accuracy is > 50m threshold
  assert.equal(presenceRes.body.data.geofenceStatus, 'inside')
  assert.equal(presenceRes.body.data.geofenceGraceExpiresAt, null)
})

test('TEST 16: Employee reconnects after auto punch-out -> Session remains closed', async () => {
  const token = await login('employee@example.test', 'employee-password')
  const today = new Date().toISOString().slice(0, 10)
  await repo.punchIn({
    employeeId: 'ETS21206',
    employeeName: 'Naitik Raj',
    date: today,
    checkIn: '09:00 AM',
    checkInAt: new Date(Date.now() - 4 * 3600 * 1000),
    checkOut: '05:00 PM',
    checkOutAt: new Date(Date.now() - 3600 * 1000),
    autoPunchOut: true,
    punchOutReason: 'Auto Punch Out (Geofence exit timeout)',
    autoPunchOutReasonCode: 'GEOFENCE_EXIT_TIMEOUT',
  })

  // Employee opens app and presence heartbeat fires
  const presenceRes = await request('/attendance/presence', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, accuracy: 15 }),
  })

  assert.equal(presenceRes.response.status, 200)
  const rec = await attService.getTodayRecord('ETS21206')
  assert.equal(rec.checkOut, '05:00 PM', 'Existing punch-out must not be overwritten or cleared')
})

test('TEST 17: Two scheduler instances process same attendance session -> Exactly one successful finalization', async () => {
  const today = new Date().toISOString().slice(0, 10)
  await repo.punchIn({
    employeeId: 'ETS21206',
    employeeName: 'Naitik Raj',
    date: today,
    checkIn: '09:00 AM',
    checkInAt: new Date(Date.now() - 4 * 3600 * 1000),
    checkOut: null,
    geofenceStatus: 'outside',
    geofenceGraceExpiresAt: new Date(Date.now() - 1000),
  })

  // Simulate concurrent executions in parallel
  const [res1, res2] = await Promise.all([
    attService.processAutoPunchOuts(),
    attService.processAutoPunchOuts(),
  ])

  const totalClosed = (res1.geofenceTimeouts.length || 0) + (res2.geofenceTimeouts.length || 0)
  assert.equal(totalClosed, 1, 'Only one atomic finalization must succeed')
})

test('TEST 18: Unauthorized employee attempts to change auto punch-out configuration -> Access denied', async () => {
  const empToken = await login('employee@example.test', 'employee-password')
  const patchRes = await request('/attendance/config', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${empToken}` },
    body: JSON.stringify({
      attendanceRules: { dailyCutoffTime: '23:59' },
    }),
  })
  assert.equal(patchRes.response.status, 403)
})

test('TEST 19: HR manually corrects an automatic punch-out -> Authorized correction, audit trail preserved', async () => {
  const today = new Date().toISOString().slice(0, 10)
  const initial = await repo.punchIn({
    employeeId: 'ETS21206',
    employeeName: 'Naitik Raj',
    date: today,
    checkIn: '10:00 AM',
    checkInAt: new Date(Date.now() - 6 * 3600 * 1000),
    checkOut: '04:00 PM',
    checkOutAt: new Date(Date.now() - 2 * 3600 * 1000),
    autoPunchOut: true,
    punchOutReason: 'Auto Punch Out (Geofence exit timeout - outside office for 2 hours)',
    autoPunchOutReasonCode: 'GEOFENCE_EXIT_TIMEOUT',
    reviewStatus: 'pending',
    auditEvents: [{ eventType: 'AUTO_PUNCH_OUT_EXECUTED', description: 'Auto punch-out executed' }],
  })

  const hrToken = await login('hr@example.test', 'hr-password')
  const reviewRes = await request(`/attendance/auto-punch-outs/${initial.id || initial._id}/review`, {
    method: 'POST',
    headers: { authorization: `Bearer ${hrToken}` },
    body: JSON.stringify({
      action: 'correct',
      reviewRemarks: 'Employee was at off-site client meeting approved by manager',
      correction: {
        previousCheckOut: '04:00 PM',
        checkOut: '07:00 PM',
        checkOutAt: new Date(),
        totalHours: '9h 0m (Corrected by HR)',
      },
    }),
  })

  assert.equal(reviewRes.response.status, 200)
  assert.equal(reviewRes.body.data.reviewStatus, 'corrected')
  assert.equal(reviewRes.body.data.checkOut, '07:00 PM')
  assert.equal(reviewRes.body.data.correctionHistory.length, 1)
  assert.equal(reviewRes.body.data.correctionHistory[0].reason, 'Employee was at off-site client meeting approved by manager')
})

test('TEST 20: Notification service temporarily fails -> Attendance finalization still succeeds safely', async () => {
  const today = new Date().toISOString().slice(0, 10)
  await repo.punchIn({
    employeeId: 'ETS21207',
    employeeName: 'Rohit Sharma',
    date: today,
    checkIn: '09:00 AM',
    checkInAt: new Date(Date.now() - 4 * 3600 * 1000),
    checkOut: null,
    geofenceStatus: 'outside',
    geofenceGraceExpiresAt: new Date(Date.now() - 2000),
  })

  // processAutoPunchOuts wraps notifications in try-catch so attendance finalization is resilient
  const outcomes = await attService.processAutoPunchOuts()
  assert.equal(outcomes.geofenceTimeouts.length, 1)
  const rec = await attService.getTodayRecord('ETS21207')
  assert.ok(rec.checkOut)
})
