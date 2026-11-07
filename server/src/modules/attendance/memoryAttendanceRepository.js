const INITIAL_ATTENDANCE = [
  {
    id: 'att-1',
    employeeId: 'ETS21206',
    employeeName: 'Chandana Somaih',
    date: '2026-09-30',
    checkIn: '09:14 AM',
    checkOut: null,
    status: 'present',
    wifiSSID: 'Edufyi-Office-5G',
    wifiVerified: true,
    clientIp: '127.0.0.1',
    ipVerified: true,
    latitude: 37.789190,
    longitude: -122.401460,
    accuracy: 8,
    distanceMeters: 25,
    gpsVerified: true,
    locationName: 'HQ - San Francisco',
    verificationMethod: 'wifi_and_gps',
    totalHours: 'Active (Live)',
    notes: 'Regular on-site shift',
  },
  {
    id: 'att-2',
    employeeId: 'EDU-EMP-101',
    employeeName: 'Priya Sharma',
    date: '2026-09-30',
    checkIn: '09:05 AM',
    checkOut: '06:10 PM',
    status: 'present',
    wifiSSID: 'Edufyi-Corp-Secure',
    wifiVerified: true,
    clientIp: '127.0.0.1',
    ipVerified: true,
    latitude: 37.789172,
    longitude: -122.401449,
    accuracy: 5,
    distanceMeters: 10,
    gpsVerified: true,
    locationName: 'HQ - San Francisco',
    verificationMethod: 'wifi_and_gps',
    totalHours: '9.0 hrs',
    notes: 'Shift completed',
  },
  {
    id: 'att-3',
    employeeId: 'EDU-EMP-102',
    employeeName: 'Marcus Chen',
    date: '2026-09-30',
    checkIn: '09:42 AM',
    checkOut: null,
    status: 'late',
    wifiSSID: 'Edufyi-Office-5G',
    wifiVerified: true,
    clientIp: '127.0.0.1',
    ipVerified: true,
    latitude: 37.789185,
    longitude: -122.401455,
    accuracy: 6,
    distanceMeters: 18,
    gpsVerified: true,
    locationName: 'HQ - San Francisco',
    verificationMethod: 'wifi_and_gps',
    totalHours: 'Active (Live)',
    notes: 'Traffic delay on Bay Bridge',
  },
  {
    id: 'att-4',
    employeeId: 'EDU-EMP-103',
    employeeName: 'Devon Vance',
    date: '2026-09-30',
    checkIn: '09:20 AM',
    checkOut: null,
    status: 'present',
    wifiSSID: 'Edufyi-Guest-HighSpeed',
    wifiVerified: true,
    clientIp: '127.0.0.1',
    ipVerified: true,
    latitude: 37.789195,
    longitude: -122.401470,
    accuracy: 10,
    distanceMeters: 30,
    gpsVerified: true,
    locationName: 'HQ - San Francisco',
    verificationMethod: 'wifi_and_gps',
    totalHours: 'Active (Live)',
    notes: 'In-office',
  },
]

export function createMemoryAttendanceRepository(seedRecords = []) {
  let records = seedRecords.map((r) => ({ ...r }))

  return {
    async punchIn(record) {
      const existing = await this.findByEmployeeAndDate(record.employeeId, record.date)
      return existing?.checkIn ? existing : this.save(record)
    },
    async punchOut(record) {
      const existing = await this.findByEmployeeAndDate(record.employeeId, record.date)
      return existing?.checkOut ? existing : this.save(record)
    },
    async updatePresence(employeeId, date, isConnected) {
      const rec = await this.findByEmployeeAndDate(employeeId, date)
      if (rec && !rec.checkOut) {
        const now = new Date()
        if (isConnected) {
          rec.lastConnectedAt = now
          rec.disconnectedSince = null
        } else if (!rec.disconnectedSince) {
          rec.disconnectedSince = now
        }
      }
    },
    async updatePresenceDetails(employeeId, date, updates = {}, auditEvent = null) {
      const targetDate = date || new Date().toISOString().slice(0, 10)
      const rec = await this.findByEmployeeAndDate(employeeId, targetDate) || records.find((r) => r.employeeId?.toUpperCase() === employeeId?.toUpperCase() && r.checkIn && !r.checkOut)
      if (rec && !rec.checkOut) {
        Object.assign(rec, updates)
        if (auditEvent) {
          rec.auditEvents = rec.auditEvents || []
          rec.auditEvents.push(auditEvent)
        }
        return { ...rec }
      }
      return null
    },
    async findExpiredGeofenceRecords(now = new Date()) {
      return records.filter(
        (r) => r.checkIn && !r.checkOut && r.geofenceGraceExpiresAt && new Date(r.geofenceGraceExpiresAt).getTime() <= now.getTime()
      )
    },
    async findExpiredOfflineRecords(cutoffDate) {
      return records.filter(
        (r) =>
          r.checkIn &&
          !r.checkOut &&
          r.lastConnectedAt &&
          new Date(r.lastConnectedAt).getTime() <= cutoffDate.getTime() &&
          r.geofenceStatus !== 'outside'
      )
    },
    async findActiveSessionsForCutoff(date) {
      return records.filter((r) =>
        (!date || r.date === date) &&
        r.checkIn &&
        (!r.checkOut || r.checkOut === '—' || r.checkOut === '-' || (typeof r.totalHours === 'string' && r.totalHours.includes('Active')))
      )
    },
    async findUnclosedPastSessions(todayDate) {
      return records.filter((r) =>
        r.date < todayDate &&
        r.checkIn &&
        (!r.checkOut || r.checkOut === '—' || r.checkOut === '-' || (typeof r.totalHours === 'string' && r.totalHours.includes('Active')))
      )
    },
    async findRecordsPendingAdvanceWarning(date) {
      return records.filter((r) =>
        (!date || r.date === date) &&
        r.checkIn &&
        (!r.checkOut || r.checkOut === '—' || r.checkOut === '-' || (typeof r.totalHours === 'string' && r.totalHours.includes('Active'))) &&
        !r.advanceWarningSentAt
      )
    },
    async atomicFinalizePunchOut(recordId, finalData = {}, auditEvent = null) {
      const rec = records.find((r) => r.id === recordId || String(r._id) === String(recordId))
      const isUnclosed = !rec?.checkOut || rec?.checkOut === '—' || rec?.checkOut === '-' || (typeof rec?.totalHours === 'string' && rec?.totalHours.includes('Active'))
      if (!rec || !rec.checkIn || !isUnclosed) {
        return null // Already punched out or not checked in
      }
      Object.assign(rec, finalData)
      if (auditEvent) {
        rec.auditEvents = rec.auditEvents || []
        rec.auditEvents.push(auditEvent)
      }
      return { ...rec }
    },
    async recordAuditEvent(recordId, auditEvent) {
      const rec = records.find((r) => r.id === recordId || String(r._id) === String(recordId))
      if (rec) {
        rec.auditEvents = rec.auditEvents || []
        rec.auditEvents.push(auditEvent)
        return { ...rec }
      }
      return null
    },
    async listAutoPunchOuts({ date, reviewStatus, limit = 50, skip = 0 } = {}) {
      let filtered = records.filter((r) => r.autoPunchOut)
      if (date) filtered = filtered.filter((r) => r.date === date)
      if (reviewStatus && reviewStatus !== 'all') filtered = filtered.filter((r) => r.reviewStatus === reviewStatus)
      const total = filtered.length
      const page = filtered.slice(Number(skip) || 0, (Number(skip) || 0) + (Number(limit) || 50))
      return { records: page.map((r) => ({ ...r, id: r.id || String(r._id) })), total }
    },
    async reviewAutoPunchOut(recordId, { reviewStatus, reviewedBy, reviewRemarks, correction = null } = {}) {
      const rec = records.find((r) => r.id === recordId || String(r._id) === String(recordId))
      if (!rec) return null
      rec.reviewStatus = reviewStatus || 'confirmed'
      rec.reviewedBy = reviewedBy || 'HR Admin'
      rec.reviewedAt = new Date()
      rec.reviewRemarks = reviewRemarks || ''
      rec.auditEvents = rec.auditEvents || []
      if (correction) {
        if (correction.checkOut) rec.checkOut = correction.checkOut
        if (correction.checkOutAt) rec.checkOutAt = correction.checkOutAt
        if (correction.totalHours) rec.totalHours = correction.totalHours
        if (correction.status) rec.status = correction.status
        rec.correctionHistory = rec.correctionHistory || []
        rec.correctionHistory.push({
          correctedBy: reviewedBy || 'HR Admin',
          correctedAt: new Date(),
          previousCheckOut: correction.previousCheckOut || '',
          newCheckOut: correction.checkOut || '',
          reason: reviewRemarks || 'Administrative correction',
        })
        rec.auditEvents.push({
          eventType: 'HR_MANUAL_CORRECTION',
          eventTimestamp: new Date(),
          description: `Attendance manually corrected by ${reviewedBy || 'HR Admin'}`,
          source: 'hr',
          metadata: correction,
        })
      } else {
        rec.auditEvents.push({
          eventType: 'HR_AUTO_PUNCHOUT_CONFIRMED',
          eventTimestamp: new Date(),
          description: `Auto punch-out reviewed and confirmed by ${reviewedBy || 'HR Admin'}`,
          source: 'hr',
          metadata: { reviewRemarks },
        })
      }
      return { ...rec }
    },
    async findActiveTodayRecords(date) {
      return records.filter((r) => (!date || r.date === date) && r.checkIn && !r.checkOut)
    },
    async findByEmployeeAndDate(employeeId, date) {
      return records.find((r) => r.employeeId?.toUpperCase() === employeeId?.toUpperCase() && r.date === date) ?? null
    },
    async findById(id) {
      return records.find((r) => r.id === id || String(r._id) === String(id)) ?? null
    },
    async list(filters = {}) {
      const nowMs = Date.now()
      return records
        .filter((r) => {
          if (filters.date && r.date !== filters.date) return false
          if (filters.month && (!r.date || !r.date.startsWith(filters.month))) return false
          if (filters.employeeId && r.employeeId?.toUpperCase() !== filters.employeeId?.toUpperCase()) return false
          if (filters.status && filters.status !== 'all' && r.status !== filters.status) return false
          if (filters.search) {
            const q = filters.search.toLowerCase()
            const nameMatch = r.employeeName?.toLowerCase().includes(q)
            const idMatch = r.employeeId?.toLowerCase().includes(q)
            if (!nameMatch && !idMatch) return false
          }
          return true
        })
        .map((record) => {
          const punchInLocation = record.punchInLocation && record.punchInLocation.latitude !== null ? record.punchInLocation : {
            latitude: record.latitude,
            longitude: record.longitude,
            accuracy: record.accuracy,
            distanceMeters: record.distanceMeters,
            geofenceStatus: record.geofenceStatus || (record.gpsVerified ? 'inside' : 'unknown'),
            networkType: record.wifiVerified ? 'wifi' : (record.clientIp ? 'cellular' : 'unknown'),
            wifiSSID: record.wifiSSID,
            bssid: record.bssid,
            clientIp: record.clientIp,
            wifiVerified: record.wifiVerified,
            ipVerified: record.ipVerified,
            gpsVerified: record.gpsVerified,
            locationName: record.locationName,
            timestamp: record.checkInAt || record.createdAt,
          }

          let liveLocation = record.liveLocation ? { ...record.liveLocation } : null
          if (!liveLocation || liveLocation.latitude === null) {
            liveLocation = {
              latitude: record.lastVerifiedLatitude ?? record.latitude,
              longitude: record.lastVerifiedLongitude ?? record.longitude,
              accuracy: record.lastVerifiedAccuracy ?? record.accuracy,
              distanceMeters: record.distanceMeters,
              geofenceStatus: record.geofenceStatus,
              locationFreshness: 'unavailable',
              locationPermission: 'unknown',
              connectivityStatus: record.checkOut ? 'offline' : 'online',
              networkType: record.wifiVerified ? 'wifi' : (record.clientIp ? 'cellular' : 'unknown'),
              wifiSSID: record.wifiSSID,
              bssid: record.bssid,
              clientIp: record.clientIp,
              wifiVerified: record.wifiVerified,
              ipVerified: record.ipVerified,
              gpsVerified: record.gpsVerified,
              locationSource: record.gpsVerified ? 'gps' : 'network',
              locationName: record.lastVerifiedLocationName || record.locationName || 'IGNITE CAMPUS',
              deviceCapturedAt: record.lastVerifiedLocationAt || record.lastConnectedAt,
              serverReceivedAt: record.lastConnectedAt,
              lastSyncAt: record.lastConnectedAt,
            }
          }

          const syncTime = liveLocation.deviceCapturedAt ? new Date(liveLocation.deviceCapturedAt).getTime() : (record.lastConnectedAt ? new Date(record.lastConnectedAt).getTime() : null)
          let freshness = 'unavailable'
          if (record.checkOut) {
            freshness = 'offline'
          } else if (syncTime) {
            const ageSecs = (nowMs - syncTime) / 1000
            if (ageSecs <= 90) freshness = 'live'
            else if (ageSecs <= 180) freshness = 'recent'
            else if (ageSecs <= 300) freshness = 'stale'
            else freshness = 'offline'
          }
          liveLocation.locationFreshness = freshness

          return {
            ...record,
            punchInLocation,
            liveLocation,
          }
        })
    },
    async updateFields(id, fields = {}) {
      const cleanId = String(id || '').trim()
      const rec = records.find((r) =>
        (cleanId && (r.id === cleanId || String(r._id) === cleanId)) ||
        (fields.employeeId && fields.date && r.employeeId?.toUpperCase() === String(fields.employeeId).toUpperCase() && r.date === fields.date)
      )
      if (!rec) return null
      Object.assign(rec, fields, { updatedAt: new Date() })
      if (fields.status === 'present') {
        rec.isLate = false
        rec.isHalfDay = false
        rec.lateCount = 0
        rec.isEarlyLogout = false
        rec.isLop = false
      }
      return { ...rec }
    },
    async save(record) {
      const existingIdx = records.findIndex(
        (r) => (record.id && r.id === record.id) || (r.employeeId?.toUpperCase() === record.employeeId?.toUpperCase() && r.date === record.date)
      )
      if (existingIdx >= 0) {
        records[existingIdx] = { ...records[existingIdx], ...record, updatedAt: new Date() }
        return records[existingIdx]
      }
      const newRecord = {
        id: record.id || `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...record,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      records.unshift(newRecord)
      return newRecord
    },
    async delete(id, options = {}) {
      const cleanId = String(id || '').trim()
      const initialCount = records.length
      const targetEmp = options?.employeeId ? String(options.employeeId).toUpperCase() : null
      const targetDate = options?.date ? String(options.date) : null

      const targetDoc = cleanId ? records.find((r) => r.id === cleanId || String(r._id) === cleanId) : null
      const resolvedEmp = targetEmp || targetDoc?.employeeId?.toUpperCase()
      const resolvedDate = targetDate || targetDoc?.date

      for (let i = records.length - 1; i >= 0; i--) {
        const r = records[i]
        const rEmp = r.employeeId?.toUpperCase()
        const matchEmpDate = resolvedEmp && resolvedDate && rEmp === resolvedEmp && r.date === resolvedDate
        const matchId = cleanId && (r.id === cleanId || String(r._id) === cleanId)
        if (matchEmpDate || matchId) {
          records.splice(i, 1)
        }
      }
      return records.length < initialCount
    },
    async getSummary(date) {
      const dayRecords = records.filter((r) => r.date === date)
      const present = dayRecords.filter((r) => r.status === 'present').length
      const late = dayRecords.filter((r) => r.status === 'late').length
      const halfDay = dayRecords.filter((r) => r.status === 'half-day').length
      const earlyLogout = dayRecords.filter((r) => r.status === 'early-logout' || r.isEarlyLogout).length
      const lop = dayRecords.filter((r) => r.status === 'lop' || r.isLop).length
      const onLeave = dayRecords.filter((r) => r.status === 'on-leave').length
      const absent = dayRecords.filter((r) => r.status === 'absent').length
      return { total: dayRecords.length, present, late, halfDay, earlyLogout, lop, onLeave, absent }
    },
  }
}
