/**
 * Centralized Attendance Presence & Geofence Resolver
 * Resolves accuracy-aware physical presence, separates network type from physical location,
 * and tracks live location freshness.
 */

export function resolveAttendancePresence(r, maxGeofenceRadius = 50) {
  const live = r?.liveLocation || {}
  const punch = r?.punchInLocation || {}

  // 1. Accuracy-aware physical presence
  const effectiveGeofenceStatus = live.geofenceStatus || r?.geofenceStatus || 'unknown'
  const dist = live.distanceMeters !== undefined && live.distanceMeters !== null
    ? live.distanceMeters
    : (r?.distanceMeters !== undefined && r?.distanceMeters !== null ? r.distanceMeters : null)
  const acc = live.accuracy !== undefined && live.accuracy !== null
    ? live.accuracy
    : (r?.accuracy !== undefined && r?.accuracy !== null ? r.accuracy : null)
  const gpsVerified = Boolean(live.gpsVerified ?? r?.gpsVerified)
  const wifiVerified = Boolean(live.wifiVerified ?? r?.wifiVerified)

  // Confidence tolerance: indoor GPS jitter is up to 35m
  const tolerance = acc ? Math.min(Math.max(0, acc * 0.35), 35) : 0
  const isDistanceInside = dist !== null && (dist <= maxGeofenceRadius || (dist - tolerance) <= maxGeofenceRadius)

  const isInside = effectiveGeofenceStatus === 'inside' || gpsVerified || wifiVerified || isDistanceInside
  const isUncertain = !isInside && (effectiveGeofenceStatus === 'uncertain' || (acc !== null && acc > 100))
  const isOutside = !isInside && !isUncertain && (effectiveGeofenceStatus === 'outside' || (dist !== null && dist > maxGeofenceRadius))

  // 2. Network classification vs Physical presence
  const rawSsid = live.wifiSSID || r?.wifiSSID || ''
  const displaySsid = /airtel|dji|3052/i.test(rawSsid) ? 'Edufyi' : (/^edufyi$/i.test(rawSsid) ? 'Edufyi' : (rawSsid || (wifiVerified ? 'Edufyi' : '')))

  let networkLabel = 'Office Wi-Fi'
  let networkTone = 'verified'

  if (wifiVerified) {
    networkLabel = 'Office Wi-Fi'
    networkTone = 'verified'
  } else if (isInside) {
    networkLabel = 'Mobile Data • On-Site'
    networkTone = 'on-site'
  } else {
    networkLabel = 'External / Remote'
    networkTone = 'remote'
  }

  // 3. Location Freshness
  const freshness = live.locationFreshness || (r?.checkOut ? 'offline' : 'live')

  const distText = dist !== null ? `${Math.round(dist)}m` : (wifiVerified ? `≤${maxGeofenceRadius}m` : '—')
  const accText = acc ? `±${Math.round(acc)}m` : ''

  return {
    isInside,
    isUncertain,
    isOutside,
    dist,
    acc,
    distText,
    accText,
    networkLabel,
    networkTone,
    displaySsid,
    freshness,
    locationName: live.locationName || r?.locationName || 'Ignite Campus',
    punchInDist: punch.distanceMeters ?? r?.distanceMeters ?? null,
  }
}

