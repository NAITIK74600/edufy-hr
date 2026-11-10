import { apiClient } from './apiClient.js'
import { hrStore } from './hrStore.js'
import { extractEmployeeDob } from '../utils/dobHelper.js'

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
        const hMonth = parseInt(h.date.slice(5, 7), 10)
        if (!h.isRecurring && hYear !== targetYear) return
        if (month && hMonth !== parseInt(month, 10)) return
        events.push({
          id: String(h.id || h._id),
          entityId: String(h.id || h._id),
          title: h.name || h.title,
          name: h.name || h.title,
          date: h.isRecurring ? `${targetYear}-${h.date.slice(5)}` : h.date,
          endDate: h.endDate ? (h.isRecurring ? `${targetYear}-${h.endDate.slice(5)}` : h.endDate) : h.date,
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

      // Birthdays fallback (Strictly real dynamic DOB from employee records, 0 dummy data)
      employees.forEach((emp) => {
        const dobInfo = extractEmployeeDob(emp)
        if (!dobInfo) return
        const m = dobInfo.month
        const day = dobInfo.day

        if (month && m !== parseInt(month, 10)) return
        const bDate = `${targetYear}-${String(m).padStart(2, '0')}-${day}`
        events.push({
          id: `bday-${emp.id || emp._id}`,
          title: `${emp.displayName || emp.name}'s Birthday`,
          name: emp.displayName || emp.name,
          date: bDate,
          endDate: bDate,
          allDay: true,
          category: 'Employee Birthday',
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
        if (month && m !== parseInt(month, 10)) return
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

      // Leaves fallback (only approved leaves)
      leaves.forEach((l) => {
        if (!l.startDate) return
        if (l.status && !['approved', 'Approved'].includes(l.status)) return
        if (month) {
          const lMonth = parseInt(l.startDate.slice(5, 7), 10)
          if (lMonth !== parseInt(month, 10)) return
        }
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

      // Apply category, department, and search filters to fallback
      return events.filter((ev) => {
        if (category && category !== 'all' && (ev.category || '').toLowerCase() !== category.toLowerCase() && (ev.type || '').toLowerCase() !== category.toLowerCase()) {
          return false
        }
        if (department && department !== 'all') {
          const dept = (ev.department || '').toLowerCase()
          const appDepts = (ev.applicableDepartments || []).map((d) => d.toLowerCase())
          if (dept !== department.toLowerCase() && !appDepts.includes('all') && !appDepts.includes(department.toLowerCase())) {
            return false
          }
        }
        if (search) {
          const term = search.toLowerCase()
          const matchTitle = (ev.title || '').toLowerCase().includes(term)
          const matchName = (ev.name || '').toLowerCase().includes(term)
          const matchDate = (ev.date || '').includes(term)
          if (!matchTitle && !matchName && !matchDate) return false
        }
        return true
      })
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
   * Download CSV or ICS file with offline/local fallback.
   */
  async downloadExport(format = 'csv', year = new Date().getFullYear()) {
    try {
      const blob = await apiClient.downloadBlob(`/calendar/export?format=${format}&year=${year}`)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `edufyi_holidays_${year}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.warn('API export failed, generating client-side export fallback:', err.message)
      const state = hrStore.getState()
      const holidays = (state.holidays || []).filter((h) => {
        if (!h.date) return false
        const hYear = parseInt(h.date.slice(0, 4), 10)
        return h.isRecurring || hYear === parseInt(year, 10)
      }).sort((a, b) => a.date.localeCompare(b.date))

      if (format === 'ics') {
        const ics = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Edufyi HR//Official Holiday Calendar//EN',
          'CALSCALE:GREGORIAN',
          'METHOD:PUBLISH',
          `X-WR-CALNAME:Edufyi HR Holidays ${year}`,
          'X-WR-TIMEZONE:Asia/Kolkata',
        ]
        for (const h of holidays) {
          const dateClean = (h.date || '').replace(/-/g, '')
          const nextDay = new Date(h.endDate || h.date)
          nextDay.setDate(nextDay.getDate() + 1)
          const nextDayClean = nextDay.toISOString().split('T')[0].replace(/-/g, '')
          ics.push(
            'BEGIN:VEVENT',
            `UID:holiday-${h.id || h._id || Math.random().toString(36).slice(2)}@edufyitech.in`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            `DTSTART;VALUE=DATE:${dateClean}`,
            `DTEND;VALUE=DATE:${nextDayClean}`,
            `SUMMARY:${(h.name || h.title || 'Holiday').replace(/,/g, '\\,')}`,
            `DESCRIPTION:${(h.description || h.category || 'Official Holiday').replace(/,/g, '\\,')}`,
            `LOCATION:${(h.location || 'All Offices').replace(/,/g, '\\,')}`,
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT',
            'END:VEVENT'
          )
        }
        ics.push('END:VCALENDAR')
        const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `edufyi_holidays_${year}.ics`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        // CSV fallback
        const headers = ['Holiday Name', 'Date', 'End Date', 'Category', 'Location', 'Departments', 'Paid/Unpaid', 'Description']
        const csvRows = [headers.join(',')]
        holidays.forEach((h) => {
          const row = [
            `"${(h.name || h.title || '').replace(/"/g, '""')}"`,
            `"${h.date || ''}"`,
            `"${h.endDate || h.date || ''}"`,
            `"${(h.category || h.type || 'Company Holiday').replace(/"/g, '""')}"`,
            `"${(h.location || 'All Locations').replace(/"/g, '""')}"`,
            `"${(Array.isArray(h.applicableDepartments) ? h.applicableDepartments.join('; ') : 'All').replace(/"/g, '""')}"`,
            `"${h.isPaid !== false ? 'Paid' : 'Unpaid'}"`,
            `"${(h.description || '').replace(/"/g, '""')}"`,
          ]
          csvRows.push(row.join(','))
        })
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `edufyi_holidays_${year}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    }
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

  // =========================================================================
  // SMART CALENDAR UPGRADE METHODS
  // =========================================================================

  /**
   * Create a new smart calendar event (meetings, interviews, deadlines, training, etc.)
   */
  async createEvent(eventData) {
    const res = await apiClient.post('/calendar/events', eventData)
    return res.data
  },

  /**
   * Update an existing event (scope: 'this' | 'series')
   */
  async updateEvent(eventId, updates, scope = 'this') {
    const res = await apiClient.put(`/calendar/events/${encodeURIComponent(eventId)}?scope=${scope}`, updates)
    return res.data
  },

  /**
   * Drag-and-drop or quick reschedule
   */
  async rescheduleEvent(eventId, { date, startTime, endTime }) {
    const res = await apiClient.patch(`/calendar/events/${encodeURIComponent(eventId)}`, { date, startTime, endTime })
    return res.data
  },

  /**
   * Cancel or soft delete an event
   */
  async deleteEvent(eventId, reason = '') {
    const res = await apiClient.delete(`/calendar/events/${encodeURIComponent(eventId)}`, { data: { reason } })
    return res
  },

  /**
   * Respond to invitation (RSVP: accepted, declined, tentative)
   */
  async respondToInvitation(eventId, { status, note = '' }) {
    const res = await apiClient.post(`/calendar/events/${encodeURIComponent(eventId)}/respond`, { status, note })
    return res.data
  },

  /**
   * Generate or refresh Google Meet link for an event
   */
  async generateMeetLink(eventId) {
    const res = await apiClient.post(`/calendar/events/${encodeURIComponent(eventId)}/meet`)
    return res.data
  },

  /**
   * Fetch upcoming agenda feed
   */
  async getUpcomingEvents(limit = 10, scope = 'all') {
    try {
      const res = await apiClient.get(`/calendar/upcoming?limit=${limit}&scope=${scope}`)
      return res.data || []
    } catch {
      return []
    }
  },

  /**
   * Fetch calendar scheduling analytics & metrics
   */
  async getAnalytics() {
    try {
      const res = await apiClient.get('/calendar/analytics')
      return res.data || null
    } catch {
      return null
    }
  },

  /**
   * Fetch user calendar preferences
   */
  async getPreferences() {
    try {
      const res = await apiClient.get('/calendar/preferences')
      return res.data || null
    } catch {
      return null
    }
  },

  /**
   * Update user calendar preferences
   */
  async updatePreferences(prefs) {
    const res = await apiClient.put('/calendar/preferences', prefs)
    return res.data
  },

  /**
   * Check Google Calendar & Meet integration status
   */
  async getIntegrations() {
    try {
      const res = await apiClient.get('/calendar/integrations')
      return res.data || { googleConfigured: false, isConnected: false }
    } catch {
      return { googleConfigured: false, isConnected: false }
    }
  },

  /**
   * Connect Google Calendar / Meet
   */
  async connectGoogle() {
    const res = await apiClient.post('/calendar/google/connect')
    return res
  },

  /**
   * Disconnect Google Calendar
   */
  async disconnectGoogle() {
    const res = await apiClient.post('/calendar/google/disconnect')
    return res
  },

  /**
   * Trigger on-demand HR lifecycle sync
   */
  async syncHRLifecycle(year) {
    const res = await apiClient.post('/calendar/sync', { year })
    return res.data
  },

  /**
   * Google Places Autocomplete search
   */
  async searchPlaces(input) {
    if (!input || input.trim().length < 2) return []
    try {
      const res = await apiClient.get(`/calendar/maps/autocomplete?input=${encodeURIComponent(input.trim())}`)
      return res.data || []
    } catch {
      return []
    }
  },
}

