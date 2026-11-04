import { apiClient } from './apiClient.js'
import { hrStore } from './hrStore.js'

export const calendarService = {
  /**
   * Fetch merged stream of holidays, birthdays, work anniversaries, leaves, and custom events.
   */
  async getEvents({ year, month, category = 'all', department = 'all', search = '' } = {}) {
    const params = new URLSearchParams()
    if (year) params.set('year', year)
    if (month) params.set('month', month)
    if (category && category !== 'all') params.set('category', category)
    if (department && department !== 'all') params.set('department', department)
    if (search) params.set('search', search)

    try {
      const res = await apiClient.get(`/calendar/events?${params.toString()}`)
      return res.data || []
    } catch (err) {
      console.warn('Backend calendar events failed, falling back to local store:', err.message)
      // Fallback to local hrStore state
      const state = hrStore.getState()
      const holidays = state.holidays || []
      const leaves = state.leaves || []
      const employees = state.employees || []

      const targetYear = parseInt(year, 10) || new Date().getFullYear()
      const events = []

      // Holidays fallback
      holidays.forEach((h) => {
        if (!h.date) return
        const hYear = parseInt(h.date.slice(0, 4), 10)
        if (!h.isRecurring && hYear !== targetYear) return
        events.push({
          id: String(h.id || h._id),
          entityId: String(h.id || h._id),
          title: h.name || h.title,
          name: h.name || h.title,
          date: h.date,
          endDate: h.endDate || h.date,
          day: h.day,
          category: h.category || h.type || 'Company Holiday',
          type: 'holiday',
          isPaid: h.isPaid !== false,
          location: h.location || 'All Locations',
          applicableDepartments: h.applicableDepartments || ['All'],
          description: h.description || '',
          bannerUrl: h.bannerUrl || null,
          canManage: true,
        })
      })

      // Birthdays fallback
      employees.forEach((emp) => {
        if (!emp.dob) return
        const d = new Date(emp.dob)
        if (isNaN(d.getTime())) return
        const m = d.getUTCMonth() + 1
        const day = String(d.getUTCDate()).padStart(2, '0')
        const bDate = `${targetYear}-${String(m).padStart(2, '0')}-${day}`
        events.push({
          id: `bday-${emp.id || emp._id}`,
          title: `${emp.displayName || emp.name}'s Birthday`,
          name: emp.displayName || emp.name,
          date: bDate,
          endDate: bDate,
          category: 'Birthday',
          type: 'birthday',
          department: emp.department || 'General',
          isCelebration: true,
        })
      })

      // Work Anniversaries fallback
      employees.forEach((emp) => {
        if (!emp.joiningDate) return
        const j = new Date(emp.joiningDate)
        if (isNaN(j.getTime())) return
        const jYear = j.getUTCFullYear()
        const completedYears = targetYear - jYear
        if (completedYears <= 0) return
        const m = j.getUTCMonth() + 1
        const day = String(j.getUTCDate()).padStart(2, '0')
        const aDate = `${targetYear}-${String(m).padStart(2, '0')}-${day}`
        events.push({
          id: `anniv-${emp.id || emp._id}`,
          title: `${emp.displayName || emp.name} (${completedYears} Year${completedYears > 1 ? 's' : ''})`,
          name: emp.displayName || emp.name,
          date: aDate,
          endDate: aDate,
          category: 'Work Anniversary',
          type: 'anniversary',
          completedYears,
          department: emp.department || 'General',
          isCelebration: true,
        })
      })

      // Leaves fallback
      leaves.forEach((l) => {
        if (!l.startDate) return
        events.push({
          id: `leave-${l.id || l._id}`,
          title: `${l.employeeName || 'Employee'} (${l.leaveType || 'Leave'})`,
          name: l.employeeName,
          date: l.startDate,
          endDate: l.endDate || l.startDate,
          category: 'Leave',
          type: 'leave',
          status: l.status,
          department: l.department || 'General',
        })
      })

      return events
    }
  },

  /**
   * Fetch paginated holidays list.
   */
  async getHolidays(query = {}) {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, v)
    })
    try {
      const res = await apiClient.get(`/calendar/holidays?${params.toString()}`)
      return res
    } catch {
      const state = hrStore.getState()
      return { success: true, data: state.holidays || [], total: (state.holidays || []).length }
    }
  },

  /**
   * Add a new holiday.
   */
  async createHoliday(holidayData) {
    const res = await apiClient.post('/calendar/holidays', holidayData)
    // Synchronize to hrStore
    if (res.data) {
      hrStore.addHoliday(res.data)
    }
    return res
  },

  /**
   * Update an existing holiday.
   */
  async updateHoliday(id, updates) {
    const res = await apiClient.put(`/calendar/holidays/${encodeURIComponent(id)}`, updates)
    // Synchronize local hrStore
    const current = hrStore.getState().holidays || []
    const updated = current.map((h) => (String(h.id || h._id) === String(id) ? { ...h, ...updates } : h))
    hrStore.setState?.({ holidays: updated })
    return res
  },

  /**
   * Delete a holiday.
   */
  async deleteHoliday(id) {
    const res = await apiClient.delete(`/calendar/holidays/${encodeURIComponent(id)}`)
    hrStore.deleteHoliday(id)
    return res
  },

  /**
   * Duplicate a holiday to a new year or date.
   */
  async duplicateHoliday(id, data) {
    const res = await apiClient.post(`/calendar/holidays/${encodeURIComponent(id)}/duplicate`, data)
    if (res.data) {
      hrStore.addHoliday(res.data)
    }
    return res
  },

  /**
   * Bulk import holidays.
   */
  async bulkImportHolidays(rows, dryRun = false) {
    return apiClient.post('/calendar/holidays/bulk-import', { rows, dryRun })
  },

  /**
   * Download CSV or ICS file.
   */
  async downloadExport(format = 'csv', year = new Date().getFullYear()) {
    const blob = await apiClient.downloadBlob(`/calendar/export?format=${format}&year=${year}`)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edufyi_holidays_${year}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  },

  /**
   * Fetch calendar dashboard widgets.
   */
  async getWidgets() {
    try {
      const res = await apiClient.get('/calendar/widgets')
      return res.data
    } catch {
      return null
    }
  },

  /**
   * Fetch audit logs.
   */
  async getAuditLogs(limit = 50) {
    try {
      const res = await apiClient.get(`/calendar/audit-logs?limit=${limit}`)
      return res.data || []
    } catch {
      return []
    }
  },
}

