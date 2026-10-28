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
    async findActiveTodayRecords(date) {
      return records.filter((r) => r.date === date && r.checkIn && !r.checkOut)
    },
    async findByEmployeeAndDate(employeeId, date) {
      return records.find((r) => r.employeeId?.toUpperCase() === employeeId?.toUpperCase() && r.date === date) ?? null
    },
    async findById(id) {
      return records.find((r) => r.id === id || String(r._id) === String(id)) ?? null
    },
    async list(filters = {}) {
      return records.filter((r) => {
        if (filters.date && r.date !== filters.date) return false
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
      const idx = records.findIndex((r) => {
        if (cleanId && (r.id === cleanId || String(r._id) === cleanId)) return true
        if (options?.employeeId && options?.date && r.employeeId?.toUpperCase() === String(options.employeeId).toUpperCase() && r.date === options.date) return true
        if (cleanId && r.employeeId?.toUpperCase() === cleanId.toUpperCase()) return true
        return false
      })
      if (idx >= 0) {
        records.splice(idx, 1)
        return true
      }
      return false
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
