import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/auth/passwords.js'
import { PERMISSIONS } from '../src/auth/permissions.js'
import { createUserStore } from '../src/auth/userStore.js'
import { createMemoryAttendanceRepository } from '../src/modules/attendance/memoryAttendanceRepository.js'
import { calculateDistanceMeters, createAttendanceService } from '../src/modules/attendance/attendance.service.js'

const secret = 'test-only-jwt-secret'
let server
let baseUrl

const users = [
  { id: 'admin-1', email: 'admin@example.test', displayName: 'Admin', role: 'admin', status: 'active', permissions: ['*'], passwordHash: hashPassword('admin-password') },
  { id: 'hr-1', email: 'hr@example.test', displayName: 'HR', role: 'hr', status: 'active', permissions: [PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_WRITE], passwordHash: hashPassword('hr-password') },
  { id: 'manager-1', email: 'manager@example.test', displayName: 'Manager', role: 'manager', status: 'active', permissions: [PERMISSIONS.ATTENDANCE_SELF_READ], passwordHash: hashPassword('manager-password') },
  { id: 'employee-1', employeeId: 'ETS21206', email: 'employee@example.test', displayName: 'Chandana Somaih', role: 'employee', status: 'active', managerId: 'manager-1', permissions: [PERMISSIONS.ATTENDANCE_SELF_READ], passwordHash: hashPassword('employee-password') },
]

beforeEach(async () => {
  const repository = createMemoryAttendanceRepository([])
  const service = createAttendanceService({ repository, companySettings: {
    locations: [{ name: 'Test office', lat: 37.789172, lng: -122.401449, radiusMeters: 200 }],
    allowedWifiSSIDs: ['Edufyi-Office-5G'],
    wifiNetworks: [{ ssid: 'Edufyi-Office-5G', bssid: '9C:3D:CF:11:A2:01', allowedIPs: ['127.0.0.1'] }],
    attendanceRules: { requireOfficeNetworkAndGps: false },
  } })
  server = createApp({ userStore: createUserStore(users), attendanceRepository: repository, attendanceService: service, jwtSecret: secret, trustProxy: 'loopback' }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`
})

afterEach(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
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
  assert.equal(result.response.status, 200)
  return result.body.data.token
}

test('Geodesic Distance calculation independently computes accurate meters', () => {
  // San Francisco HQ: (37.789172, -122.401449)
  const hqLat = 37.789172
  const hqLng = -122.401449

  // ~25m away desk
  const distNear = calculateDistanceMeters(hqLat, hqLng, 37.789190, -122.401460)
  assert.ok(distNear < 50, 'Desk location should be within 50 meters')
  assert.ok(distNear >= 0, 'Distance must be >= 0')

  // ~5km away
  const distFar = calculateDistanceMeters(hqLat, hqLng, 37.750000, -122.450000)
  assert.ok(distFar > 3000, 'Far location should be over 3km')
})

test('Attendance dry-run verify endpoint returns geofence, BSSID, and IP status', async () => {
  const token = await login('employee@example.test', 'employee-password')

  // Verify inside geofence with genuine office Wi-Fi SSID + correct BSSID
  const insideRes = await request('/attendance/verify', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({
      latitude: 37.789190,
      longitude: -122.401460,
      accuracy: 8,
      wifiSSID: 'Edufyi-Office-5G',
      bssid: '9C:3D:CF:11:A2:01',
    }),
  })
  assert.equal(insideRes.response.status, 200)
  assert.equal(insideRes.body.data.isGpsVerified, true)
  assert.equal(insideRes.body.data.isBssidVerified, true)
  assert.equal(insideRes.body.data.isWifiVerified, true)
  assert.equal(insideRes.body.data.method, 'wifi_and_gps')
  assert.ok(insideRes.body.data.distanceMeters <= 200)

  // SPOOF: office SSID name but wrong BSSID (fake hotspot) + outside geofence => rejected/ineligible
  const spoofRes = await request('/attendance/verify', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({
      latitude: 37.750000,
      longitude: -122.450000,
      wifiSSID: 'Edufyi-Office-5G',
      bssid: 'DE:AD:BE:EF:00:00',
    }),
  })
  assert.equal(spoofRes.response.status, 200)
  assert.equal(spoofRes.body.data.isGpsVerified, false)
  assert.equal(spoofRes.body.data.isBssidVerified, false)
})

test('Backend REJECTS a spoofed same-named Wi-Fi punch from outside the geofence', async () => {
  const token = await login('employee@example.test', 'employee-password')

  // Attacker at home declares the office SSID name but cannot match the BSSID and is far away.
  const spoofPunch = await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'x-forwarded-for': '203.0.113.55' },
    body: JSON.stringify({
      latitude: 37.750000,
      longitude: -122.450000,
      accuracy: 20,
      wifiSSID: 'Edufyi-Office-5G',
      bssid: 'DE:AD:BE:EF:00:00',
    }),
  })
  assert.equal(spoofPunch.response.status, 403)
  assert.equal(spoofPunch.body.error.code, 'ATTENDANCE_NOT_VERIFIED')
})

test('Employee check-in and check-out lifecycle with backend GPS and network verification', async () => {
  const token = await login('employee@example.test', 'employee-password')

  // 1. Check in
  const checkInRes = await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({
      latitude: 37.789190,
      longitude: -122.401460,
      accuracy: 8,
      wifiSSID: 'Edufyi-Office-5G',
      bssid: '9C:3D:CF:11:A2:01',
    }),
  })
  assert.equal(checkInRes.response.status, 200)
  const record = checkInRes.body.data
  assert.equal(record.employeeId, 'ETS21206')
  assert.equal(record.gpsVerified, true)
  assert.equal(record.wifiVerified, true)
  assert.equal(record.accuracy, 8)
  assert.ok(record.checkIn)
  assert.equal(record.checkOut, null)

  // 2. Fetch today record
  const todayRes = await request('/attendance/today', {
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(todayRes.response.status, 200)
  assert.equal(todayRes.body.data.employeeId, 'ETS21206')

  // 3. Check out
  const checkOutRes = await request('/attendance/check-out', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  })
  assert.equal(checkOutRes.response.status, 200)
  assert.ok(checkOutRes.body.data.checkOut)
  assert.ok(checkOutRes.body.data.totalHours)
})

test('HR can list roster and manage attendance records', async () => {
  const hrToken = await login('hr@example.test', 'hr-password')
  const empToken = await login('employee@example.test', 'employee-password')

  // Employee punches in
  await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${empToken}` },
    body: JSON.stringify({
      latitude: 37.789190,
      longitude: -122.401460,
      accuracy: 5,
      wifiSSID: 'Edufyi-Office-5G',
      bssid: '9C:3D:CF:11:A2:01',
    }),
  })

  // HR views roster
  const listRes = await request('/attendance', {
    headers: { authorization: `Bearer ${hrToken}` },
  })
  assert.equal(listRes.response.status, 200)
  assert.ok(listRes.body.data.length >= 1)

  // HR views summary
  const summaryRes = await request('/attendance/summary', {
    headers: { authorization: `Bearer ${hrToken}` },
  })
  assert.equal(summaryRes.response.status, 200)
  assert.ok(summaryRes.body.data.total >= 1)
})

test('Verification uses exact subnets, branch radius, GPS accuracy and strict policy without sample offices', () => {
  const repository = createMemoryAttendanceRepository([])
  const empty = createAttendanceService({ repository })
  assert.equal(empty.verifyLocation(37.789172, -122.401449, 'Edufyi-Office-5G', '127.0.0.1', null, 5).isEligible, false)
  const service = createAttendanceService({ repository, companySettings: {
    locations: [{ name: 'Small office', lat: 0, lng: 0, radiusMeters: 50 }],
    officeNetworkIPs: [{ ip: '10.1.1.0/24' }],
    attendanceRules: { requireOfficeNetworkAndGps: false },
  } })
  assert.equal(service.verifyLocation(null, null, null, '10.1.10.2').isEligible, false)
  assert.equal(service.verifyLocation(null, null, null, '10.1.1.2').isEligible, true)
  assert.equal(service.verifyLocation(0, 0, null, '203.0.113.1', null, 500).isEligible, false)
  assert.equal(service.verifyLocation(0, 0, null, '203.0.113.1', null, 5).isEligible, true)
  assert.equal(service.verifyLocation(0, 0.0004, null, '203.0.113.1', null, 10).isEligible, false)
  service.updateConfig({ attendanceRules: { strictGeofenceRequired: true } })
  assert.equal(service.verifyLocation(null, null, null, '10.1.1.2').isEligible, false)
})

test('Self punches reject historical dates and preserve completed shifts on retries', async () => {
  const token = await login('employee@example.test', 'employee-password')
  const headers = { authorization: `Bearer ${token}` }
  const backdated = await request('/attendance/check-in', { method: 'POST', headers, body: JSON.stringify({ date: '2000-01-01' }) })
  assert.equal(backdated.response.status, 400)
  const body = JSON.stringify({ latitude: 37.789172, longitude: -122.401449, accuracy: 5 })
  const first = await request('/attendance/check-in', { method: 'POST', headers, body })
  const out = await request('/attendance/check-out', { method: 'POST', headers, body: '{}' })
  const retryOut = await request('/attendance/check-out', { method: 'POST', headers, body: '{}' })
  const retryIn = await request('/attendance/check-in', { method: 'POST', headers, body })
  assert.equal(first.response.status, 200)
  assert.equal(retryIn.body.data.id, first.body.data.id)
  assert.equal(retryIn.body.data.checkOut, out.body.data.checkOut)
  assert.equal(retryOut.body.data.checkOutAt, out.body.data.checkOutAt)
  assert.match(out.body.data.totalHours, /^0h \d+m/)
})

test('Strict default accepts only office network AND accurate in-office GPS with distinct failure feedback', async () => {
  const service = createAttendanceService({ repository: createMemoryAttendanceRepository([]), companySettings: {
    locations: [{ name: 'Office', lat: 0, lng: 0, radiusMeters: 100 }],
    officeNetworkIPs: [{ ip: '203.0.113.10' }],
  } })
  assert.equal(service.verifyLocation(0, 0, null, '203.0.113.10', null, 5).isEligible, true)
  assert.equal(service.verifyLocation(0, 0, null, '203.0.113.11', null, 5).isEligible, false)
  assert.equal(service.verifyLocation(null, null, null, '203.0.113.10').isEligible, false)
  assert.equal(service.verifyLocation(0, 0, null, '203.0.113.10', null, 500).isEligible, false)
  assert.equal(service.verifyLocation(1, 1, null, '203.0.113.10', null, 5).isEligible, false)

  // 1. Network IP check fails while GPS passes
  await assert.rejects(
    service.checkIn({ employeeId: 'TEST-1', latitude: 0, longitude: 0, accuracy: 5, clientIp: '203.0.113.11' }),
    /Office Network verification failed/
  )

  // 2. GPS check fails while Network IP passes
  await assert.rejects(
    service.checkIn({ employeeId: 'TEST-2', latitude: 1, longitude: 1, accuracy: 5, clientIp: '203.0.113.10' }),
    /GPS geofence verification failed/
  )

  // 3. Both Network IP and GPS checks fail
  await assert.rejects(
    service.checkIn({ employeeId: 'TEST-3', latitude: 1, longitude: 1, accuracy: 5, clientIp: '203.0.113.11' }),
    /Both Office Network \(IP\) and GPS Geofence verification failed/
  )

  // 4. Both Network IP and GPS checks pass -> punch in succeeds
  const success = await service.checkIn({ employeeId: 'TEST-4', latitude: 0, longitude: 0, accuracy: 5, clientIp: '203.0.113.10' })
  assert.equal(success.employeeId, 'TEST-4')
  assert.equal(success.gpsVerified, true)
  assert.equal(success.wifiVerified, true)
})

test('Router SSID or BSSID does not authenticate punch without verified office IP', async () => {
  const service = createAttendanceService({ repository: createMemoryAttendanceRepository([]), companySettings: {
    locations: [{ name: 'Office', lat: 0, lng: 0, radiusMeters: 100 }],
    allowedWifiSSIDs: ['Office-5G'],
    wifiNetworks: [{ ssid: 'Office-5G', bssid: 'AA:BB:CC:DD:EE:FF' }],
    officeNetworkIPs: [{ ip: '203.0.113.10' }],
  } })

  // Attacker at home submits exact SSID and BSSID with valid coordinates, but from home IP 198.51.100.5
  const res = service.verifyLocation(0, 0, 'Office-5G', '198.51.100.5', 'AA:BB:CC:DD:EE:FF', 5)
  assert.equal(res.isBssidVerified, true) // recorded as metadata
  assert.equal(res.isIpVerified, false)
  assert.equal(res.isEligible, false)
  assert.equal(res.failureReason, 'NETWORK_VERIFICATION_FAILED')
  await assert.rejects(
    service.checkIn({ employeeId: 'ATTACKER', latitude: 0, longitude: 0, accuracy: 5, wifiSSID: 'Office-5G', bssid: 'AA:BB:CC:DD:EE:FF', clientIp: '198.51.100.5' }),
    /Office Network verification failed/
  )
})

test('Employee cannot punch in, take break, or check out for another employee (anti-buddy-punching)', async () => {
  const employeeToken = await login('employee@example.test', 'employee-password')

  // Employee ETS21206 tries to check in for ETS99999
  const punchRes = await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${employeeToken}` },
    body: JSON.stringify({
      employeeId: 'ETS99999',
      latitude: 37.789190,
      longitude: -122.401460,
    }),
  })
  assert.equal(punchRes.response.status, 403)
  assert.equal(punchRes.body.error.code, 'FORBIDDEN')
  assert.match(punchRes.body.error.message, /not authorized to record attendance for another employee/)

  // Employee tries to start break for another employee
  const breakRes = await request('/attendance/break/start', {
    method: 'POST',
    headers: { authorization: `Bearer ${employeeToken}` },
    body: JSON.stringify({
      employeeId: 'ETS99999',
    }),
  })
  assert.equal(breakRes.response.status, 403)
  assert.equal(breakRes.body.error.code, 'FORBIDDEN')

  // Employee tries to check out for another employee
  const checkoutRes = await request('/attendance/check-out', {
    method: 'POST',
    headers: { authorization: `Bearer ${employeeToken}` },
    body: JSON.stringify({
      employeeId: 'ETS99999',
    }),
  })
  assert.equal(checkoutRes.response.status, 403)
  assert.equal(checkoutRes.body.error.code, 'FORBIDDEN')
})

test('GET /attendance/config masks raw office IPs and BSSIDs for non-admin/HR employees', async () => {
  const employeeToken = await login('employee@example.test', 'employee-password')
  const adminToken = await login('admin@example.test', 'admin-password')

  // Admin sees full config
  const adminConfig = await request('/attendance/config', {
    headers: { authorization: `Bearer ${adminToken}` },
  })
  assert.equal(adminConfig.response.status, 200)
  assert.ok(Array.isArray(adminConfig.body.data.wifiNetworks))
  assert.equal(adminConfig.body.data.wifiNetworks[0]?.bssid, '9C:3D:CF:11:A2:01')

  // Employee config masks BSSIDs and raw IPs
  const empConfig = await request('/attendance/config', {
    headers: { authorization: `Bearer ${employeeToken}` },
  })
  assert.equal(empConfig.response.status, 200)
  assert.equal(empConfig.body.data.wifiNetworks[0]?.bssid, undefined)
  assert.equal(empConfig.body.data.wifiNetworks[0]?.ssid, 'Edufyi-Office-5G')
  assert.deepEqual(empConfig.body.data.officeNetworkIPs, [])
})

test('Self-service breaks reject historical dates', async () => {
  const token = await login('employee@example.test', 'employee-password')
  const res = await request('/attendance/break/start', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ date: '2020-01-01' }),
  })
  assert.equal(res.response.status, 400)
  assert.equal(res.body.error.code, 'INVALID_ATTENDANCE_DATE')
})

test('Negative or excessive GPS accuracy is rejected by verification', () => {
  const service = createAttendanceService({ repository: createMemoryAttendanceRepository([]), companySettings: {
    locations: [{ name: 'Office', lat: 0, lng: 0, radiusMeters: 100 }],
    officeNetworkIPs: [{ ip: '203.0.113.10' }],
  } })
  // Negative accuracy: spoofed / impossible
  assert.equal(service.verifyLocation(0, 0, null, '203.0.113.10', null, -10).isEligible, false)
  // Accuracy beyond 250m radius limit
  assert.equal(service.verifyLocation(0, 0, null, '203.0.113.10', null, 300).isEligible, false)
})

test('Office Wi-Fi router matches all devices on the same /24 subnet when last digit varies', () => {
  const service = createAttendanceService({ repository: createMemoryAttendanceRepository([]), companySettings: {
    locations: [{ name: 'HQ Office', lat: 0, lng: 0, radiusMeters: 200 }],
    officeNetworkIPs: [{ ip: '192.168.1.15', label: 'Office Wi-Fi Router' }],
  } })

  // Device 1 (e.g. laptop): 192.168.1.15 matches exactly
  assert.equal(service.verifyLocation(0, 0, null, '192.168.1.15', null, 5).isIpVerified, true)
  // Device 2 (e.g. phone): 192.168.1.18 matches via /24 office gateway subnet (only last octet differs)
  assert.equal(service.verifyLocation(0, 0, null, '192.168.1.18', null, 5).isIpVerified, true)
  // Device 3 (e.g. tablet): 192.168.1.250 matches
  assert.equal(service.verifyLocation(0, 0, null, '192.168.1.250', null, 5).isIpVerified, true)
  // Device on different subnet: 192.168.2.18 fails
  assert.equal(service.verifyLocation(0, 0, null, '192.168.2.18', null, 5).isIpVerified, false)

  // Returns gatewaySubnet correctly in verification result
  const v = service.verifyLocation(0, 0, null, '192.168.1.18', null, 5)
  assert.equal(v.gatewaySubnet, '192.168.1.* (/24)')
})

test('Wildcard notation 192.168.1.* and IPv6 /64 prefixes match all devices on office network', () => {
  const service = createAttendanceService({ repository: createMemoryAttendanceRepository([]), companySettings: {
    locations: [{ name: 'HQ Office', lat: 0, lng: 0, radiusMeters: 200 }],
    officeNetworkIPs: [
      { ip: '192.168.1.*', label: 'Wildcard Subnet' },
      { ip: '2405:201:6804:10b6::1', label: 'IPv6 Office Router' },
    ],
  } })

  // Wildcard matches any client on 192.168.1.x
  assert.equal(service.verifyLocation(0, 0, null, '192.168.1.99', null, 5).isIpVerified, true)

  // IPv6 SLAAC randomized device address sharing the /64 router prefix matches
  assert.equal(service.verifyLocation(0, 0, null, '2405:201:6804:10b6:c18b:9912:a245:1101', null, 5).isIpVerified, true)
  // Different IPv6 prefix fails
  assert.equal(service.verifyLocation(0, 0, null, '2405:201:9999:1111:c18b:9912:a245:1101', null, 5).isIpVerified, false)
})

test('Repository faithfully persists explicit status records (e.g. historical early-logout or lop) and summarizes them', async () => {
  const repository = createMemoryAttendanceRepository([])
  const service = createAttendanceService({ repository })

  // 1. Test repository save with early-logout and lop statuses
  const earlyRec = await service.saveRecord({
    employeeId: 'EMP-EARLY-2',
    employeeName: 'Bob Early',
    date: '2026-10-20',
    checkIn: '09:30 AM',
    checkOut: '06:45 PM',
    status: 'early-logout',
    isEarlyLogout: true,
  })
  assert.equal(earlyRec.status, 'early-logout')
  assert.equal(earlyRec.isEarlyLogout, true)

  const lopRec = await service.saveRecord({
    employeeId: 'EMP-LOP-1',
    employeeName: 'Charlie MonthEnd',
    date: '2026-10-26',
    checkIn: '09:30 AM',
    checkOut: '07:15 PM',
    status: 'lop',
    isLop: true,
    isEarlyLogout: true,
  })
  assert.equal(lopRec.status, 'lop')
  assert.equal(lopRec.isLop, true)
  assert.equal(lopRec.isEarlyLogout, true)

  // 2. Summary includes earlyLogout and lop counts
  const summary = await service.getSummary('2026-10-26')
  assert.equal(summary.lop, 1)
})

test('HR or Admin can permanently delete attendance record via DELETE /records/:id and query params', async () => {
  const hrToken = await login('hr@example.test', 'hr-password')

  // Create an attendance record
  const createRes = await request('/attendance/records', {
    method: 'POST',
    headers: { authorization: `Bearer ${hrToken}` },
    body: JSON.stringify({
      employeeId: 'ETS21206',
      employeeName: 'Chandana Somaih',
      date: '2026-10-27',
      checkIn: '09:30 AM',
      status: 'present',
    }),
  })
  assert.equal(createRes.response.status, 201)
  const recordId = createRes.body.data.id

  // Verify record exists
  const listBefore = await request('/attendance?search=ETS21206', {
    headers: { authorization: `Bearer ${hrToken}` },
  })
  assert.equal(listBefore.body.data.some((r) => r.id === recordId || (r.employeeId === 'ETS21206' && r.date === '2026-10-27')), true)

  // Delete record by ID and query params
  const deleteRes = await request(`/attendance/records/${recordId}?employeeId=ETS21206&date=2026-10-27`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${hrToken}` },
  })
  assert.equal(deleteRes.response.status, 200)
  assert.equal(deleteRes.body.success, true)

  // Verify record is permanently removed
  const listAfter = await request('/attendance?search=ETS21206', {
    headers: { authorization: `Bearer ${hrToken}` },
  })
  assert.equal(listAfter.body.data.some((r) => r.id === recordId || (r.employeeId === 'ETS21206' && r.date === '2026-10-27')), false)
})

test('Admin can update attendance security configuration via PATCH /config', async () => {
  const adminToken = await login('admin@example.test', 'admin-password')

  // Update attendance geofence rules via PATCH /config
  const patchRes = await request('/attendance/config', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      attendanceRules: {
        maxGeofenceRadiusMeters: 60,
      },
    }),
  })
  assert.equal(patchRes.response.status, 200)
  assert.equal(patchRes.body.data.attendanceRules.maxGeofenceRadiusMeters, 60)
})

test('Neutral check-in records factual timestamp and presence verification without automatic late classification', async () => {
  const adminToken = await login('admin@example.test', 'admin-password')
  await request('/attendance/config', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      attendanceRules: {
        workStartTime: '00:00',
        workEndTime: '23:59',
        gracePeriodMinutes: 1440,
      },
    }),
  })

  const token = await login('employee@example.test', 'employee-password')

  const res = await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({
      latitude: 37.789172,
      longitude: -122.401449,
      wifiSSID: 'Edufyi-Office-5G',
      bssid: '9C:3D:CF:11:A2:01',
      accuracy: 5,
    }),
  })

  assert.equal(res.response.status, 200)
  assert.equal(res.body.data.status, 'present')
  assert.equal(res.body.data.isLate, false)
  assert.equal(res.body.data.lateCount, 0)
  assert.ok(res.body.data.checkIn)
  assert.equal(res.body.data.gpsVerified, true)
  assert.equal(res.body.data.wifiVerified, true)
})

test('Neutral check-out records actual duration and completed status without early logout penalties', async () => {
  const token = await login('employee@example.test', 'employee-password')

  // Check in first
  const inRes = await request('/attendance/check-in', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({
      latitude: 37.789172,
      longitude: -122.401449,
      wifiSSID: 'Edufyi-Office-5G',
      bssid: '9C:3D:CF:11:A2:01',
    }),
  })
  assert.equal(inRes.response.status, 200)

  // Check out
  const res = await request('/attendance/check-out', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  })

  assert.equal(res.response.status, 200)
  assert.equal(res.body.data.isEarlyLogout, false)
  assert.equal(res.body.data.isLop, false)
  assert.equal(res.body.data.status, 'present')
  assert.ok(res.body.data.checkOut)
  assert.ok(res.body.data.totalHours.includes('Completed'))
})

test('Recalculate attendance safely preserves historical records without rewriting labels', async () => {
  const { createAttendanceService } = await import('../src/modules/attendance/attendance.service.js')

  // Historical records preserved exactly as recorded
  const historicalRecords = [
    {
      id: 'att-hist-1',
      employeeId: 'ETS113828',
      employeeName: 'Naitik Raj',
      date: '2026-10-28',
      checkIn: '09:00 PM',
      checkOut: null,
      status: 'late',
      isLate: true,
      lateCount: 1,
      shift: 'General (09:00 PM – 11:00 PM)',
      totalHours: 'Active (Late)',
      notes: 'Late Login #1/2 (General Shift)',
    },
  ]

  let updateCalled = false
  const mockRepo = {
    list: async () => historicalRecords,
    updateFields: async () => {
      updateCalled = true
      return null
    },
    save: async () => {
      updateCalled = true
      return null
    },
  }

  const svc = createAttendanceService({ repository: mockRepo })
  const result = await svc.recalculateAttendance('2026-10-28')

  // In neutral baseline: No records rewritten, 0 updates executed
  assert.equal(result.updatedCount, 0)
  assert.equal(updateCalled, false, 'Historical records must NOT be rewritten or modified')
  assert.equal(historicalRecords[0].status, 'late', 'Historical status must be preserved intact')
  assert.equal(historicalRecords[0].notes, 'Late Login #1/2 (General Shift)')
  assert.ok(result.message.includes('inactive pending replacement policy'))
})

test('Policy-dependent shift and lateness functions safely return neutral state pending replacement policy', async () => {
  const { resolveShift, evaluateShiftLateness } = await import('../src/modules/attendance/attendance.service.js')

  // Lateness evaluation is neutral
  const lateness = evaluateShiftLateness({ punchTime: 1260, shiftStartMins: 1260 })
  assert.equal(lateness.isLate, false)
  assert.equal(lateness.lateMinutes, 0)
  assert.equal(lateness.policyPending, true)

  // Shift resolution returns neutral representation without inventing default morning hours
  const shift = resolveShift('Evening (06:00 PM – 10:00 PM)')
  assert.equal(shift.display, 'Evening (06:00 PM – 10:00 PM)')
  assert.equal(shift.isOvernight, false)
  assert.equal(shift.startTime, null)
})





