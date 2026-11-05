import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { createMemoryAttendanceRepository } from '../src/modules/attendance/memoryAttendanceRepository.js'
import { createAttendanceService, getTodayString } from '../src/modules/attendance/attendance.service.js'
import { resolveAttendancePresence } from '../../src/utils/attendancePresence.js'

// Office Coordinates: IGNITE CAMPUS at lat: 12.9101, lng: 77.6517, radius: 50m
const OFFICE_LAT = 12.9101
const OFFICE_LNG = 77.6517
const OUTSIDE_LAT = 12.9600 // ~6 km away
const OUTSIDE_LNG = 77.7100

let repo
let service
let workDate

beforeEach(() => {
  workDate = getTodayString()
  repo = createMemoryAttendanceRepository([])
  service = createAttendanceService({
    repository: repo,
    companySettings: {
      locations: [
        { id: 'loc-ignite', name: 'IGNITE CAMPUS', lat: OFFICE_LAT, lng: OFFICE_LNG, radiusMeters: 50, allowedIPs: ['192.168.10.100'] },
      ],
      allowedWifiSSIDs: ['Edufyi-Office-5G'],
      wifiNetworks: [{ ssid: 'Edufyi-Office-5G', bssid: '9C:3D:CF:11:A2:01', allowedIPs: ['192.168.10.100'] }],
      attendanceRules: {
        maxGeofenceRadiusMeters: 50,
        requireOfficeNetworkAndGps: false,
        strictGeofenceRequired: false,
        autoPunchOutEnabled: true,
        autoPunchOutTime: '21:30',
        geofenceAutoPunchOutEnabled: false, // Default per user instruction
        geofenceGracePeriodMinutes: 120,
        geofenceGpsAccuracyThresholdMeters: 50,
        geofenceExitWarningEnabled: true,
        offlineAutoPunchOutEnabled: false, // Offline must never auto punch out
        offlineGracePeriodMinutes: 120,
        dailyCutoffAutoPunchOutEnabled: true,
        dailyCutoffTime: '21:30',
        timezone: 'Asia/Kolkata',
      },
    },
  })
})

// TEST 1: Employee punches in and remains inside the office
test('1. Employee punches in and remains inside the office', async () => {
  const checkIn = await service.punchIn({
    employeeId: 'EMP001',
    employeeName: 'Alice Kumar',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 15,
    clientIp: '192.168.10.100',
  })
  assert.ok(['present', 'late', 'half-day'].includes(checkIn.status))
  assert.equal(checkIn.geofenceStatus, 'inside')

  // Run scheduler: should NOT punch out
  const results = await service.processAutoPunchOuts()
  const rec = await repo.findByEmployeeAndDate('EMP001', workDate)
  assert.equal(rec.checkOut, null)
  assert.equal(rec.autoPunchOut, false)
})

// TEST 2: Employee exits the geofence
test('2. Employee exits the geofence with high-accuracy GPS', async () => {
  await service.punchIn({
    employeeId: 'EMP002',
    employeeName: 'Bob Singh',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Employee moves outside with high GPS accuracy (10m)
  const presence = await service.updatePresence({
    employeeId: 'EMP002',
    latitude: OUTSIDE_LAT,
    longitude: OUTSIDE_LNG,
    accuracy: 10,
    clientIp: '10.0.0.5', // External cellular IP
  })

  assert.equal(presence.geofenceStatus, 'outside')
  const rec = await repo.findByEmployeeAndDate('EMP002', workDate)
  assert.equal(rec.geofenceStatus, 'outside')
  assert.ok(rec.geofenceGraceExpiresAt, 'Grace period timer must be set')
  assert.ok(rec.geofenceExitAt, 'Exit timestamp must be saved')
})

// TEST 3: Employee returns within 2 hours
test('3. Employee returns within 2 hours (timer is cancelled)', async () => {
  await service.punchIn({
    employeeId: 'EMP003',
    employeeName: 'Charlie Roy',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Exit
  await service.updatePresence({
    employeeId: 'EMP003',
    latitude: OUTSIDE_LAT,
    longitude: OUTSIDE_LNG,
    accuracy: 10,
    clientIp: '10.0.0.5',
  })

  let rec = await repo.findByEmployeeAndDate('EMP003', workDate)
  assert.equal(rec.geofenceStatus, 'outside')
  assert.ok(rec.geofenceGraceExpiresAt)

  // Return to office within 2 hours
  await service.updatePresence({
    employeeId: 'EMP003',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 12,
    clientIp: '192.168.10.100',
  })

  rec = await repo.findByEmployeeAndDate('EMP003', workDate)
  assert.equal(rec.geofenceStatus, 'inside')
  assert.equal(rec.geofenceGraceExpiresAt, null, 'Grace timer must be cleared upon return')
  assert.equal(rec.geofenceExitAt, null, 'Exit timestamp must be cleared')
  assert.equal(rec.checkOut, null, 'Session must remain unclosed')
})

// TEST 4: Employee does not return within 2 hours
test('4. Employee does not return within 2 hours (auto punch-out if enabled)', async () => {
  // Enable geofence auto punch-out
  service.updateConfig({
    attendanceRules: {
      geofenceAutoPunchOutEnabled: true,
      geofenceGracePeriodMinutes: 120,
    },
  })

  await service.punchIn({
    employeeId: 'EMP004',
    employeeName: 'Deepa Sen',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  await service.updatePresence({
    employeeId: 'EMP004',
    latitude: OUTSIDE_LAT,
    longitude: OUTSIDE_LNG,
    accuracy: 10,
    clientIp: '10.0.0.5',
  })

  // Fast forward grace expiry
  const rec = await repo.findByEmployeeAndDate('EMP004', workDate)
  rec.geofenceGraceExpiresAt = new Date(Date.now() - 5000) // Expired 5 seconds ago

  const results = await service.processAutoPunchOuts()
  assert.ok(results.geofenceTimeouts.length > 0)

  const updated = await repo.findByEmployeeAndDate('EMP004', workDate)
  assert.ok(updated.checkOut)
  assert.equal(updated.autoPunchOut, true)
  assert.equal(updated.autoPunchOutReasonCode, 'GEOFENCE_EXIT_TIMEOUT')
  assert.equal(updated.autoPunchOutPolicy, 'ENGINE_A_GEOFENCE')
})

// TEST 5: GPS accuracy becomes poor
test('5. GPS accuracy becomes poor (LOCATION_UNCERTAIN: no false exit)', async () => {
  await service.punchIn({
    employeeId: 'EMP005',
    employeeName: 'Eva Green',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Device reports poor GPS accuracy (180m) outside nominal radius
  const presence = await service.updatePresence({
    employeeId: 'EMP005',
    latitude: 12.9110, // ~100m away
    longitude: 77.6525,
    accuracy: 180, // Poor accuracy!
    clientIp: '10.0.0.8',
  })

  const rec = await repo.findByEmployeeAndDate('EMP005', workDate)
  assert.equal(rec.geofenceStatus, 'inside', 'Must NOT mark outside on poor accuracy')
  assert.equal(rec.geofenceGraceExpiresAt, null, 'Must NOT start grace timer')
})

// TEST 6: GPS permission is disabled
test('6. GPS permission is disabled (LOCATION_UNAVAILABLE: no false exit)', async () => {
  await service.punchIn({
    employeeId: 'EMP006',
    employeeName: 'Fahim Khan',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Permission denied, null coords
  await service.updatePresence({
    employeeId: 'EMP006',
    latitude: null,
    longitude: null,
    accuracy: null,
    locationPermission: 'denied',
    clientIp: '10.0.0.9',
  })

  const rec = await repo.findByEmployeeAndDate('EMP006', workDate)
  assert.equal(rec.geofenceStatus, 'inside')
  assert.equal(rec.geofenceGraceExpiresAt, null)
})

// TEST 7: Internet disconnects
test('7. Internet disconnects (offline state does NOT auto punch out)', async () => {
  await service.punchIn({
    employeeId: 'EMP007',
    employeeName: 'Gita Patel',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Fast forward lastConnectedAt by 3 hours
  const rec = await repo.findByEmployeeAndDate('EMP007', workDate)
  rec.lastConnectedAt = new Date(Date.now() - 3 * 60 * 60 * 1000)

  // Run scheduler: offlineAutoPunchOutEnabled is false, must NOT auto punch out!
  const results = await service.processAutoPunchOuts()
  assert.equal(results.offlineTimeouts.length, 0)

  const updated = await repo.findByEmployeeAndDate('EMP007', workDate)
  assert.equal(updated.checkOut, null)
  assert.equal(updated.autoPunchOut, false)
})

// TEST 8: Internet reconnects
test('8. Internet reconnects (presence restored to live)', async () => {
  await service.punchIn({
    employeeId: 'EMP008',
    employeeName: 'Hari Das',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Send fresh heartbeat after reconnection
  await service.updatePresence({
    employeeId: 'EMP008',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 15,
    clientIp: '192.168.10.100',
  })

  const rec = await repo.findByEmployeeAndDate('EMP008', workDate)
  assert.equal(rec.liveLocation.locationFreshness, 'live')
  assert.equal(rec.checkOut, null)
})

// TEST 9: Mobile hotspot is used inside the office
test('9. Mobile hotspot is used inside office (verified on-site)', async () => {
  await service.punchIn({
    employeeId: 'EMP009',
    employeeName: 'Indu Nair',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 15,
    clientIp: '192.168.10.100',
  })

  // Employee switches to mobile hotspot/cellular (external IP), but GPS remains inside office
  const presence = await service.updatePresence({
    employeeId: 'EMP009',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 15,
    clientIp: '103.21.244.2', // External ISP IP
  })

  assert.equal(presence.geofenceStatus, 'inside')
  const resolved = resolveAttendancePresence(presence, 50)
  assert.equal(resolved.isInside, true)
  assert.equal(resolved.networkTone, 'on-site')
  assert.equal(resolved.networkLabel, 'Mobile Data • On-Site')
})

// TEST 10: Employee uses office Wi-Fi
test('10. Employee uses office Wi-Fi (verified inside regardless of GPS drift)', async () => {
  await service.punchIn({
    employeeId: 'EMP010',
    employeeName: 'Jayant Verma',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // GPS shows small drift (55m), but office Wi-Fi IP is verified!
  const presence = await service.updatePresence({
    employeeId: 'EMP010',
    latitude: 12.9106,
    longitude: 77.6522,
    accuracy: 25,
    clientIp: '192.168.10.100', // Office IP
  })

  assert.equal(presence.geofenceStatus, 'inside')
  const rec = await repo.findByEmployeeAndDate('EMP010', workDate)
  assert.equal(rec.geofenceStatus, 'inside')
  assert.equal(rec.geofenceGraceExpiresAt, null)
})

// TEST 11: Low-end Android closes the application
test('11. Low-end Android closes application (DEVICE_OFFLINE: no false punch-out)', async () => {
  await service.punchIn({
    employeeId: 'EMP011',
    employeeName: 'Kiran Rao',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Android OS kills app in background; 2 hours pass without heartbeat
  const rec = await repo.findByEmployeeAndDate('EMP011', workDate)
  rec.lastConnectedAt = new Date(Date.now() - 2.5 * 60 * 60 * 1000)

  await service.processAutoPunchOuts()
  const updated = await repo.findByEmployeeAndDate('EMP011', workDate)
  assert.equal(updated.checkOut, null, 'Must NOT be punched out due to app kill')
})

// TEST 12: iPhone suspends background execution
test('12. iPhone suspends background execution (no auto punch-out)', async () => {
  await service.punchIn({
    employeeId: 'EMP012',
    employeeName: 'Lata Joshi',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // iOS Safari suspends timer
  const rec = await repo.findByEmployeeAndDate('EMP012', workDate)
  rec.lastConnectedAt = new Date(Date.now() - 150 * 60 * 1000)

  await service.processAutoPunchOuts()
  const updated = await repo.findByEmployeeAndDate('EMP012', workDate)
  assert.equal(updated.checkOut, null)
})

// TEST 13: Server restarts during a pending grace period
test('13. Server restarts during a pending grace period (timer persists & resumes)', async () => {
  service.updateConfig({
    attendanceRules: { geofenceAutoPunchOutEnabled: true },
  })

  await service.punchIn({
    employeeId: 'EMP013',
    employeeName: 'Manish Pandey',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  await service.updatePresence({
    employeeId: 'EMP013',
    latitude: OUTSIDE_LAT,
    longitude: OUTSIDE_LNG,
    accuracy: 10,
    clientIp: '10.0.0.5',
  })

  const rec = await repo.findByEmployeeAndDate('EMP013', workDate)
  const savedExpiresAt = rec.geofenceGraceExpiresAt

  // Simulate server restart: re-create attendance service pointing to same repository
  const newService = createAttendanceService({
    repository: repo,
    companySettings: {
      attendanceRules: { geofenceAutoPunchOutEnabled: true },
    },
  })

  // Check that the timer was preserved
  const reloaded = await repo.findByEmployeeAndDate('EMP013', workDate)
  assert.equal(reloaded.geofenceGraceExpiresAt.getTime(), savedExpiresAt.getTime())

  // Fast forward and run on new instance
  reloaded.geofenceGraceExpiresAt = new Date(Date.now() - 1000)
  const results = await newService.processAutoPunchOuts()
  assert.equal(results.geofenceTimeouts.length, 1)

  const finalRec = await repo.findByEmployeeAndDate('EMP013', workDate)
  assert.ok(finalRec.checkOut)
  assert.equal(finalRec.autoPunchOutReasonCode, 'GEOFENCE_EXIT_TIMEOUT')
})

// TEST 14: PM2 restarts
test('14. PM2 restarts (unclosed sessions remain active and uncorrupted)', async () => {
  await service.punchIn({
    employeeId: 'EMP014',
    employeeName: 'Nisha Ghosh',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Simulate PM2 reload
  const pm2Service = createAttendanceService({ repository: repo })
  const rec = await repo.findByEmployeeAndDate('EMP014', workDate)
  assert.equal(rec.checkOut, null)
  assert.ok(['present', 'late', 'half-day'].includes(rec.status))
})

// TEST 15: Two scheduler instances execute simultaneously
test('15. Two scheduler instances execute simultaneously (mutex & idempotency)', async () => {
  service.updateConfig({
    attendanceRules: { geofenceAutoPunchOutEnabled: true },
  })

  await service.punchIn({
    employeeId: 'EMP015',
    employeeName: 'Omkar Bhatt',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  await service.updatePresence({
    employeeId: 'EMP015',
    latitude: OUTSIDE_LAT,
    longitude: OUTSIDE_LNG,
    accuracy: 10,
    clientIp: '10.0.0.5',
  })

  const rec = await repo.findByEmployeeAndDate('EMP015', workDate)
  rec.geofenceGraceExpiresAt = new Date(Date.now() - 5000)

  // Trigger simultaneously
  const [res1, res2] = await Promise.all([
    service.processAutoPunchOuts(),
    service.processAutoPunchOuts(),
  ])

  // One of them processes, the second is skipped by mutex or idempotent atomic update
  const totalClosed = (res1.geofenceTimeouts?.length || 0) + (res2.geofenceTimeouts?.length || 0)
  assert.equal(totalClosed, 1, 'Exactly one scheduler must process the record')
})

// TEST 16: Employee manually punches out
test('16. Employee manually punches out (subsequent schedulers ignore)', async () => {
  await service.punchIn({
    employeeId: 'EMP016',
    employeeName: 'Priya Nair',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // Manual checkout
  const manual = await service.checkOut({
    employeeId: 'EMP016',
    employeeName: 'Priya Nair',
  })
  assert.ok(manual.checkOut)
  assert.equal(manual.autoPunchOut, false)

  // Scheduler run
  const results = await service.processAutoPunchOuts()
  assert.equal(results.geofenceTimeouts.length, 0)
  assert.equal(results.dailyCutoffs.length, 0)
})

// TEST 17: Employee has an evening shift
test('17. Employee has an evening shift (exempt from 21:30 daily cut-off)', async () => {
  await service.punchIn({
    employeeId: 'EMP017',
    employeeName: 'Qasim Ali',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  const rec = await repo.findByEmployeeAndDate('EMP017', workDate)
  rec.shift = 'Evening Shift (02:00 PM - 11:00 PM)'
  rec.shiftCode = 'evening'
  // Checked in 3 hours ago
  rec.checkInAt = new Date(Date.now() - 3 * 60 * 60 * 1000)

  // Configure daily cut-off to run now
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  service.updateConfig({
    attendanceRules: {
      dailyCutoffAutoPunchOutEnabled: true,
      dailyCutoffTime: `${hh}:${mm}`,
    },
  })

  const results = await service.processAutoPunchOuts()
  const updated = await repo.findByEmployeeAndDate('EMP017', workDate)
  assert.equal(updated.checkOut, null, 'Evening shift employee must NOT be cut off at 21:30')
})

// TEST 18: Employee has an overnight shift
test('18. Employee has an overnight shift (exempt from daily cut-off)', async () => {
  await service.punchIn({
    employeeId: 'EMP018',
    employeeName: 'Ravi Teja',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  const rec = await repo.findByEmployeeAndDate('EMP018', workDate)
  rec.shift = 'Night Shift (08:00 PM - 04:00 AM)'
  rec.shiftCode = 'night'
  rec.checkInAt = new Date(Date.now() - 2 * 60 * 60 * 1000)

  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  service.updateConfig({
    attendanceRules: {
      dailyCutoffAutoPunchOutEnabled: true,
      dailyCutoffTime: `${hh}:${mm}`,
    },
  })

  await service.processAutoPunchOuts()
  const updated = await repo.findByEmployeeAndDate('EMP018', workDate)
  assert.equal(updated.checkOut, null, 'Overnight shift employee must NOT be cut off')
})

// TEST 19: Admin changes daily cut-off
test('19. Admin changes daily cut-off in settings (scheduler obeys new time)', async () => {
  await service.punchIn({
    employeeId: 'EMP019',
    employeeName: 'Sunil Seth',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  const rec = await repo.findByEmployeeAndDate('EMP019', workDate)
  rec.checkInAt = new Date(Date.now() - 4 * 60 * 60 * 1000)

  // Admin sets cutoff to future time 23:59
  service.updateConfig({
    attendanceRules: {
      dailyCutoffAutoPunchOutEnabled: true,
      dailyCutoffTime: '23:59',
    },
  })

  await service.processAutoPunchOuts()
  const updated = await repo.findByEmployeeAndDate('EMP019', workDate)
  assert.equal(updated.checkOut, null, 'Must not punch out before new cut-off time')
})

// TEST 20: Geofence and daily cut-off triggers occur simultaneously
test('20. Geofence and daily cut-off triggers occur simultaneously (single execution)', async () => {
  service.updateConfig({
    attendanceRules: {
      geofenceAutoPunchOutEnabled: true,
      dailyCutoffAutoPunchOutEnabled: true,
      dailyCutoffTime: '00:00', // Matches anytime
    },
  })

  await service.punchIn({
    employeeId: 'EMP020',
    employeeName: 'Tara Bose',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  const rec = await repo.findByEmployeeAndDate('EMP020', workDate)
  rec.geofenceStatus = 'outside'
  rec.geofenceGraceExpiresAt = new Date(Date.now() - 1000)
  rec.checkInAt = new Date(Date.now() - 3 * 60 * 60 * 1000)

  const results = await service.processAutoPunchOuts()
  const total = results.geofenceTimeouts.length + results.dailyCutoffs.length
  assert.equal(total, 1, 'Only one policy may close the session')

  const updated = await repo.findByEmployeeAndDate('EMP020', workDate)
  assert.ok(updated.checkOut)
})

// TEST 21: Attendance module renders with missing optional presence data
test('21. Attendance module renders with missing optional presence data (no runtime crash)', () => {
  // Empty record
  const p1 = resolveAttendancePresence({})
  assert.equal(p1.isInside, false)
  assert.equal(typeof p1.networkTone, 'string')
  assert.equal(typeof p1.networkLabel, 'string')
  assert.equal(typeof p1.distText, 'string')

  // Null record
  const p2 = resolveAttendancePresence(null)
  assert.equal(p2.isInside, false)

  // Partial record with undefined distance
  const p3 = resolveAttendancePresence({ liveLocation: { latitude: 12.9 } })
  assert.equal(p3.isInside, false)
  assert.equal(p3.distText, '—')
})

// TEST 22: Attendance module loads valid presence data
test('22. Attendance module loads valid presence data (formatted properly)', () => {
  const record = {
    distanceMeters: 25,
    accuracy: 10,
    gpsVerified: true,
    wifiVerified: true,
    wifiSSID: 'Edufyi-Office-5G',
    liveLocation: {
      distanceMeters: 25,
      accuracy: 10,
      geofenceStatus: 'inside',
      locationFreshness: 'live',
      wifiSSID: 'Edufyi-Office-5G',
    },
  }

  const p = resolveAttendancePresence(record, 50)
  assert.equal(p.isInside, true)
  assert.equal(p.networkTone, 'verified')
  assert.equal(p.networkLabel, 'Office Wi-Fi')
  assert.equal(p.distText, '25m')
  assert.equal(p.accText, '±10m')
  assert.equal(p.freshness, 'live')
})

// TEST 23: Attendance page refreshes (idempotent presence resolution)
test('23. Attendance page refreshes (idempotent presence resolution)', () => {
  const rec = {
    distanceMeters: 35,
    gpsVerified: true,
    wifiVerified: false,
  }

  const run1 = resolveAttendancePresence(rec, 50)
  const run2 = resolveAttendancePresence(rec, 50)
  assert.deepEqual(run1, run2, 'Must yield identical output on refresh')
})

// TEST 24: All Admin/HR/Manager/Employee attendance views load
test('24. All Admin/HR/Manager/Employee attendance views load valid presence objects', () => {
  const mockRecords = [
    { employeeId: 'E1', wifiVerified: true, distanceMeters: 10 },
    { employeeId: 'E2', wifiVerified: false, distanceMeters: 30, gpsVerified: true },
    { employeeId: 'E3', geofenceStatus: 'outside', distanceMeters: 500 },
    { employeeId: 'E4', geofenceStatus: 'uncertain', distanceMeters: null },
  ]

  for (const r of mockRecords) {
    const presence = resolveAttendancePresence(r, 50)
    assert.ok(presence)
    assert.ok('isInside' in presence)
    assert.ok('networkLabel' in presence)
    assert.ok('networkTone' in presence)
    assert.ok('distText' in presence)
  }
})

// TEST 25: Duplicate auto punch-out attempts are prevented
test('25. Duplicate auto punch-out attempts are prevented (idempotent finalize)', async () => {
  await service.punchIn({
    employeeId: 'EMP025',
    employeeName: 'Umesh Pal',
    latitude: OFFICE_LAT,
    longitude: OFFICE_LNG,
    accuracy: 10,
    clientIp: '192.168.10.100',
  })

  // First finalization
  const res1 = await service.finalizeAttendanceSession({
    employeeId: 'EMP025',
    workDate,
    punchOutTime: '07:00 PM',
    reasonCode: 'SYSTEM_DAILY_CUTOFF',
    reasonText: 'Daily cut-off',
    policy: 'ENGINE_B_DAILY_CUTOFF',
    isAutoPunchOut: true,
  })
  assert.ok(res1)
  assert.equal(res1.autoPunchOut, true)

  // Second finalization on the same record
  const res2 = await service.finalizeAttendanceSession({
    employeeId: 'EMP025',
    workDate,
    punchOutTime: '07:00 PM',
    reasonCode: 'SYSTEM_DAILY_CUTOFF',
    reasonText: 'Daily cut-off',
    policy: 'ENGINE_B_DAILY_CUTOFF',
    isAutoPunchOut: true,
  })
  assert.equal(res2, null, 'Subsequent finalization must return null')

  const finalRec = await repo.findByEmployeeAndDate('EMP025', workDate)
  assert.equal(finalRec.checkOut, '07:00 PM')
  assert.equal(finalRec.autoPunchOutReasonCode, 'SYSTEM_DAILY_CUTOFF')
})
