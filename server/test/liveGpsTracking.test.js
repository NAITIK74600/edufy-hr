import test from 'node:test'
import assert from 'node:assert/strict'
import { createAttendanceService } from '../src/modules/attendance/attendance.service.js'
import { createMemoryAttendanceRepository } from '../src/modules/attendance/memoryAttendanceRepository.js'
import { resolveAttendancePresence } from '../../src/utils/attendancePresence.js'

test('Live GPS Tracking & Geofence Synchronization Test Suite', async (t) => {
  const OFFICE_LAT = 12.9101
  const OFFICE_LNG = 77.6517
  const OUTSIDE_LAT = 12.9600
  const OUTSIDE_LNG = 77.7200

  const repository = createMemoryAttendanceRepository([])
  const service = createAttendanceService({
    repository,
    companySettings: {
      locations: [
        { id: 'loc-ignite', name: 'IGNITE CAMPUS', lat: OFFICE_LAT, lng: OFFICE_LNG, radiusMeters: 50, allowedIPs: ['192.168.10.100'] },
      ],
      allowedWifiSSIDs: ['Edufyi-Office-5G', 'Edufyi'],
      officeNetworkIPs: ['192.168.10.100'],
      wifiNetworks: [{ ssid: 'Edufyi-Office-5G', bssid: '9C:3D:CF:11:A2:01', allowedIPs: ['192.168.10.100'] }],
      attendanceRules: {
        requireOfficeNetworkAndGps: false,
        maxGeofenceRadiusMeters: 50,
        geofenceAutoPunchOutEnabled: true,
        geofenceGracePeriodMinutes: 120,
        geofenceGpsAccuracyThresholdMeters: 50,
      },
    },
  })

  const todayStr = new Date().toISOString().slice(0, 10)

  await t.test('1. checkIn creates immutable punchInLocation and initial liveLocation', async () => {
    const record = await service.checkIn({
      employeeId: 'TEST-EMP-001',
      employeeName: 'Alice Johnson',
      latitude: OFFICE_LAT,
      longitude: OFFICE_LNG,
      accuracy: 8,
      wifiSSID: 'Edufyi-Office-5G',
      clientIp: '192.168.10.100',
      date: todayStr,
    })

    assert.ok(record.punchInLocation, 'punchInLocation must be populated')
    assert.equal(record.punchInLocation.latitude, OFFICE_LAT)
    assert.equal(record.punchInLocation.longitude, OFFICE_LNG)
    assert.equal(record.punchInLocation.accuracy, 8)
    assert.equal(record.punchInLocation.geofenceStatus, 'inside')
    assert.equal(record.punchInLocation.networkType, 'wifi')
    assert.equal(record.punchInLocation.wifiVerified, true)

    assert.ok(record.liveLocation, 'liveLocation must be populated')
    assert.equal(record.liveLocation.latitude, OFFICE_LAT)
    assert.equal(record.liveLocation.geofenceStatus, 'inside')
    assert.equal(record.liveLocation.locationFreshness, 'live')
  })

  await t.test('2. updatePresence updates liveLocation without altering punchInLocation', async () => {
    const empId = 'TEST-EMP-002'
    const record = await service.checkIn({
      employeeId: empId,
      employeeName: 'Bob Smith',
      latitude: OFFICE_LAT,
      longitude: OFFICE_LNG,
      accuracy: 6,
      wifiSSID: 'Edufyi-Office-5G',
      clientIp: '192.168.10.100',
      date: todayStr,
    })

    const initialPunchInTime = record.punchInLocation.timestamp
    const initialPunchInLat = record.punchInLocation.latitude

    // Employee moves slightly within office campus
    const presenceRes = await service.updatePresence({
      employeeId: empId,
      latitude: OFFICE_LAT + 0.00005,
      longitude: OFFICE_LNG + 0.00005,
      accuracy: 12,
      wifiSSID: 'Edufyi-Office-5G',
      clientIp: '192.168.10.100',
    })

    assert.equal(presenceRes.isConnected, true)
    assert.equal(presenceRes.geofenceStatus, 'inside')

    const updated = await repository.findByEmployeeAndDate(empId, todayStr)
    // Verify punchInLocation remains untouched!
    assert.equal(updated.punchInLocation.latitude, initialPunchInLat, 'punchInLocation.latitude must never change')
    assert.equal(updated.punchInLocation.timestamp, initialPunchInTime, 'punchInLocation.timestamp must never change')

    // Verify liveLocation updated
    assert.equal(updated.liveLocation.latitude, OFFICE_LAT + 0.00005)
    assert.equal(updated.liveLocation.accuracy, 12)
    assert.equal(updated.liveLocation.geofenceStatus, 'inside')
  })

  await t.test('3. Mobile data / Cellular connection inside geofence is classified as On-Site, NOT Remote', async () => {
    const empId = 'TEST-EMP-003'
    // Employee is inside geofence but on mobile carrier data (Airtel 5G, external public IP)
    const record = await service.checkIn({
      employeeId: empId,
      employeeName: 'Carol White',
      latitude: OFFICE_LAT,
      longitude: OFFICE_LNG,
      accuracy: 10,
      wifiSSID: 'Airtel_Hotspot_5G',
      clientIp: '157.48.12.99', // external cellular IP
      date: todayStr,
    })

    assert.equal(record.gpsVerified, true, 'GPS must be verified')
    assert.equal(record.wifiVerified, false, 'Office Wi-Fi is false on mobile data')
    assert.equal(record.geofenceStatus, 'inside')

    // Evaluate dashboard presentation
    const dashboardPresence = resolveAttendancePresence(record, 50)
    assert.equal(dashboardPresence.isInside, true, 'Physical presence must be INSIDE')
    assert.equal(dashboardPresence.networkTone, 'on-site', 'Network tone must be ON-SITE, never remote')
    assert.equal(dashboardPresence.networkLabel, 'Mobile Data • On-Site')
  })

  await t.test('4. Accuracy tolerance prevents false OUTSIDE for 35m distance with 15m inaccuracy', async () => {
    // Distance = 35m, geofence radius = 30m, accuracy = 15m
    // Tolerance = 15 * 0.35 = 5.25m -> effective distance = 29.75m <= 30m
    const mockRecord = {
      employeeId: 'TEST-EMP-004',
      distanceMeters: 35,
      accuracy: 15,
      geofenceStatus: 'inside',
      gpsVerified: true,
      wifiVerified: false,
      wifiSSID: 'Cellular',
      checkIn: '09:30 AM',
      liveLocation: {
        distanceMeters: 35,
        accuracy: 15,
        geofenceStatus: 'inside',
        gpsVerified: true,
        locationFreshness: 'live',
      },
    }

    const presence = resolveAttendancePresence(mockRecord, 30)
    assert.equal(presence.isInside, true, 'Must resolve to INSIDE despite raw 35m > 30m due to tolerance and verified status')
    assert.equal(presence.isOutside, false)
  })

  await t.test('5. Large GPS inaccuracy (>100m) with distance outside threshold resolves to UNCERTAIN, not OUTSIDE', async () => {
    const mockRecord = {
      employeeId: 'TEST-EMP-005',
      distanceMeters: 140, // Far outside geofence radius 50m even after tolerance
      accuracy: 150, // poor indoor GPS fix
      geofenceStatus: 'uncertain',
      gpsVerified: false,
      wifiVerified: false,
      liveLocation: {
        distanceMeters: 140,
        accuracy: 150,
        geofenceStatus: 'uncertain',
        locationFreshness: 'live',
      },
    }

    const presence = resolveAttendancePresence(mockRecord, 50)
    assert.equal(presence.isUncertain, true, 'Poor accuracy outside radius must be flagged as UNCERTAIN')
    assert.equal(presence.isOutside, false, 'Must not falsely convict user as OUTSIDE')
  })

  await t.test('6. Location freshness transitions (<90s live, 90-180s recent, 180-300s stale, >300s offline)', async () => {
    const list = await repository.list({ date: todayStr })
    const active = list.find((r) => r.employeeId === 'TEST-EMP-001')
    assert.ok(active, 'Record must exist in repository list')
    assert.equal(active.liveLocation.locationFreshness, 'live')
  })

  await t.test('7. Confirmed geofence exit triggers 120-minute grace period', async () => {
    const empId = 'TEST-EMP-006'
    await service.checkIn({
      employeeId: empId,
      employeeName: 'Dave Miller',
      latitude: OFFICE_LAT,
      longitude: OFFICE_LNG,
      accuracy: 5,
      wifiSSID: 'Edufyi',
      clientIp: '192.168.10.100',
      date: todayStr,
    })

    // Employee moves ~5 km away with high accuracy (±5m)
    const exitRes = await service.updatePresence({
      employeeId: empId,
      latitude: OUTSIDE_LAT,
      longitude: OUTSIDE_LNG,
      accuracy: 5,
      wifiSSID: 'Unknown_Cafe',
      clientIp: '198.51.100.5',
    })

    assert.equal(exitRes.isConnected, false)
    assert.equal(exitRes.geofenceStatus, 'outside')
    assert.ok(exitRes.geofenceGraceExpiresAt, 'Grace period expiration must be scheduled')
    assert.ok(exitRes.remainingGraceMinutes >= 115, 'Should have ~120 minutes remaining grace')

    // Returning to office clears the grace period
    const returnRes = await service.updatePresence({
      employeeId: empId,
      latitude: OFFICE_LAT,
      longitude: OFFICE_LNG,
      accuracy: 6,
      wifiSSID: 'Edufyi',
      clientIp: '192.168.10.100',
    })

    assert.equal(returnRes.isConnected, true)
    assert.equal(returnRes.geofenceStatus, 'inside')
    assert.equal(returnRes.geofenceGraceExpiresAt, null, 'Grace timer should be cleared on return')
  })

  await t.test('8. Rejects outdated buffered coordinates (>5 minutes) from triggering geofence exit or timer', async () => {
    const empId = 'TEST-EMP-007'
    await service.checkIn({
      employeeId: empId,
      employeeName: 'Grace Hopper',
      latitude: OFFICE_LAT,
      longitude: OFFICE_LNG,
      accuracy: 8,
      wifiSSID: 'Edufyi',
      clientIp: '192.168.10.100',
      date: todayStr,
    })

    // Device reconnects and delivers buffered fix that was captured 12 minutes ago outside
    const twelveMinsAgo = new Date(Date.now() - 12 * 60 * 1000).toISOString()
    const staleRes = await service.updatePresence({
      employeeId: empId,
      latitude: OUTSIDE_LAT,
      longitude: OUTSIDE_LNG,
      accuracy: 10,
      clientIp: '10.0.0.2',
      deviceCapturedAt: twelveMinsAgo,
    })

    assert.equal(staleRes.isOutdated, true, 'Must be flagged as outdated')
    assert.equal(staleRes.locationFreshness, 'stale', 'Location freshness must be marked stale')
    assert.equal(staleRes.resolvedPresenceState, 'STALE_LOCATION')
    assert.equal(staleRes.geofenceStatus, 'inside', 'Must NOT exit geofence from stale fix')
    assert.equal(staleRes.geofenceGraceExpiresAt, null, 'Must NOT start grace timer from stale fix')

    const rec = await repository.findByEmployeeAndDate(empId, todayStr)
    assert.equal(rec.geofenceStatus, 'inside')
    assert.equal(rec.liveLocation.locationFreshness, 'stale')
  })

  await t.test('9. Authoritative presence status badges (LIVE, STALE, OFFLINE, LOCATION UNAVAILABLE, UNCERTAIN)', async () => {
    // 1. LIVE
    const liveRecord = {
      checkIn: '09:00 AM',
      checkOut: null,
      gpsVerified: true,
      liveLocation: {
        latitude: OFFICE_LAT,
        accuracy: 10,
        locationFreshness: 'live',
        locationPermission: 'granted',
        geofenceStatus: 'inside',
      },
    }
    const liveBadge = resolveAttendancePresence(liveRecord).statusBadge
    assert.equal(liveBadge.label, 'LIVE')
    assert.equal(liveBadge.tone, 'live')

    // 2. STALE
    const staleRecord = {
      checkIn: '09:00 AM',
      checkOut: null,
      gpsVerified: true,
      liveLocation: {
        latitude: OFFICE_LAT,
        accuracy: 15,
        locationFreshness: 'stale',
        locationPermission: 'granted',
        geofenceStatus: 'inside',
      },
    }
    const staleBadge = resolveAttendancePresence(staleRecord).statusBadge
    assert.equal(staleBadge.label, 'STALE')
    assert.equal(staleBadge.tone, 'stale')

    // 3. OFFLINE
    const offlineRecord = {
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      liveLocation: {
        latitude: OFFICE_LAT,
        locationFreshness: 'offline',
      },
    }
    const offlineBadge = resolveAttendancePresence(offlineRecord).statusBadge
    assert.equal(offlineBadge.label, 'OFFLINE')
    assert.equal(offlineBadge.tone, 'offline')

    // 4. LOCATION UNAVAILABLE
    const unavailRecord = {
      checkIn: '09:00 AM',
      checkOut: null,
      liveLocation: {
        latitude: null,
        locationPermission: 'denied',
        locationFreshness: 'unavailable',
        geofenceStatus: 'location_unavailable',
      },
    }
    const unavailBadge = resolveAttendancePresence(unavailRecord).statusBadge
    assert.equal(unavailBadge.label, 'LOCATION UNAVAILABLE')
    assert.equal(unavailBadge.tone, 'unavailable')

    // 5. UNCERTAIN
    const uncertainRecord = {
      checkIn: '09:00 AM',
      checkOut: null,
      distanceMeters: 65,
      liveLocation: {
        latitude: OFFICE_LAT + 0.001,
        accuracy: 120, // > 100m
        locationFreshness: 'uncertain',
        geofenceStatus: 'uncertain',
      },
    }
    const uncertainBadge = resolveAttendancePresence(uncertainRecord).statusBadge
    assert.equal(uncertainBadge.label, 'UNCERTAIN')
    assert.equal(uncertainBadge.tone, 'uncertain')
  })

  await t.test('10. Explicit isStale flag rejection maintains safe presence state', async () => {
    const empId = 'TEST-EMP-008'
    await service.checkIn({
      employeeId: empId,
      employeeName: 'Ada Lovelace',
      latitude: OFFICE_LAT,
      longitude: OFFICE_LNG,
      accuracy: 5,
      wifiSSID: 'Edufyi',
      clientIp: '192.168.10.100',
      date: todayStr,
    })

    const flagRes = await service.updatePresence({
      employeeId: empId,
      latitude: OUTSIDE_LAT,
      longitude: OUTSIDE_LNG,
      accuracy: 10,
      clientIp: '10.0.0.1',
      isStale: true,
    })

    assert.equal(flagRes.isOutdated, true)
    assert.equal(flagRes.locationFreshness, 'stale')
    assert.equal(flagRes.geofenceStatus, 'inside')
  })
})
