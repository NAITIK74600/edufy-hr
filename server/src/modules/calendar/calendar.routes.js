import { Router } from 'express'
import mongoose from 'mongoose'
import { workspaceModels } from '../../models/Workspace.js'
import { Employee } from '../../models/Employee.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'
import { CalendarAuditLog } from '../../models/CalendarAuditLog.js'
import { CalendarEvent } from '../../models/CalendarEvent.js'
import { CalendarPreference } from '../../models/CalendarPreference.js'
import { CalendarIntegration } from '../../models/CalendarIntegration.js'
import { CalendarInvitation } from '../../models/CalendarInvitation.js'
import { createUnifiedNotification } from '../../services/unifiedNotification.service.js'
import { calendarService } from './calendar.service.js'
import { googleMapsService } from './googleMaps.service.js'
import { googleCalendarService } from './googleCalendar.service.js'
import { calendarSyncService } from './calendarSync.service.js'
import { calendarNotificationService } from './calendarNotification.service.js'
import { extractEmployeeDob } from './dobHelper.js'
import { normalizeDateString, parseYearMonthSafe } from '../../utils/dateHelper.js'

const MANAGEMENT_ROLES = new Set(['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'])
const isManagement = (user) => Boolean(user?.role && MANAGEMENT_ROLES.has(user.role.toLowerCase()))
const isManager = (user) => ['manager', 'team_leader', 'team_lead', 'vertical_head'].includes(user?.role?.toLowerCase())

const VALID_CATEGORIES = [
  'National Holiday',
  'Public Holiday',
  'Regional Holiday',
  'Festival',
  'Company Holiday',
  'Optional Holiday',
  'Restricted Holiday',
  'Special Holiday',
  'Emergency Holiday',
]

function getWeekday(dateStr) {
  try {
    const d = new Date(`${dateStr}T00:00:00Z`)
    if (isNaN(d.getTime())) return 'Unknown'
    return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
  } catch {
    return 'Unknown'
  }
}

function calculateDaysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  if (isNaN(target.getTime())) return null
  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function createCalendarRouter({ auth, useDatabase = true }) {
  const router = Router()

  // Guard for database availability
  router.use((req, res, next) => {
    if (!useDatabase && !mongoose.connection?.readyState) {
      // In offline/in-memory test mode, let tests or fallback handle
    }
    next()
  })

  // =========================================================================
  // 1. GET /api/v1/calendar/events - Merged Unified Stream
  // =========================================================================
  router.get('/events', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      const canManage = isManagement(actor)
      const actorIsManager = isManager(actor)
      const targetYear = parseInt(req.query.year, 10) || new Date().getFullYear()
      const targetMonth = req.query.month ? parseInt(req.query.month, 10) : null // 1-12
      const filterCategory = req.query.category || 'all'
      const filterDept = req.query.department || 'all'
      const searchQuery = (req.query.search || '').trim().toLowerCase()

      const events = []

      // 1. Fetch Official Holidays
      let holidayQuery = { status: { $ne: 'inactive' } }
      const holidays = await workspaceModels.holidays.find(holidayQuery).lean().catch(() => [])

      for (const h of holidays) {
        const hDate = normalizeDateString(h.date)
        const hEndDate = normalizeDateString(h.endDate) || hDate
        if (!hDate) continue
        const { year: hYear, month: hMonth } = parseYearMonthSafe(hDate, targetYear)

        // Year filter (handle recurring holidays across all years)
        if (!h.isRecurring && hYear !== targetYear) continue
        if (targetMonth && hMonth !== targetMonth) continue

        // Department filter for non-management employees
        if (!canManage && Array.isArray(h.applicableDepartments) && h.applicableDepartments.length > 0 && !h.applicableDepartments.includes('All')) {
          if (actor.department && !h.applicableDepartments.includes(actor.department)) {
            continue
          }
        }

        // Category filter
        const cat = h.category || h.type || 'Company Holiday'
        if (filterCategory !== 'all' && cat.toLowerCase() !== filterCategory.toLowerCase()) {
          continue
        }

        // Search query
        const name = (h.name || h.title || '').toLowerCase()
        if (searchQuery && !name.includes(searchQuery) && !hDate.includes(searchQuery)) {
          continue
        }

        const effectiveDate = h.isRecurring ? `${targetYear}-${hDate.slice(5)}` : hDate
        const effectiveEndDate = h.endDate ? (h.isRecurring ? `${targetYear}-${hEndDate.slice(5)}` : hEndDate) : effectiveDate

        events.push({
          id: String(h._id),
          entityId: String(h._id),
          sourceType: 'company_holiday',
          sourceId: `holiday_${h._id}`,
          title: h.name || h.title,
          name: h.name || h.title,
          date: effectiveDate,
          endDate: effectiveEndDate,
          day: h.day || getWeekday(effectiveDate),
          category: cat,
          type: 'holiday',
          isPaid: h.isPaid !== false,
          isRecurring: Boolean(h.isRecurring),
          location: h.location || 'All Locations',
          applicableDepartments: h.applicableDepartments || ['All'],
          applicableEmploymentTypes: h.applicableEmploymentTypes || ['All'],
          description: h.description || '',
          bannerUrl: h.bannerUrl || null,
          status: h.status || 'active',
          canManage,
        })
      }

      // 2. Fetch Employee Birthdays (Respecting privacy permissions)
      try {
        const employees = await Employee.find({
          status: { $nin: ['inactive', 'resigned', 'terminated', 'deleted'] },
        }).select('_id employeeId firstName lastName name displayName department designation avatarUrl dob identity dateOfBirth birthDate personalDetails').lean().catch((err) => {
          console.warn('[Calendar Birthday Query Error]:', err.message)
          return []
        })

        for (const emp of employees) {
          const dobInfo = extractEmployeeDob(emp)
          if (!dobInfo) continue

          const bMonth = dobInfo.month
          const bDay = dobInfo.day

          if (targetMonth && bMonth !== targetMonth) continue

          const bdayDate = `${targetYear}-${String(bMonth).padStart(2, '0')}-${bDay}`
          const displayName = emp.displayName || ((emp.firstName || '') + ' ' + (emp.lastName || '')).trim() || emp.name || 'Team Member'

          if (searchQuery && !displayName.toLowerCase().includes(searchQuery)) {
            continue
          }

          if (filterDept !== 'all' && emp.department && emp.department.toLowerCase() !== filterDept.toLowerCase()) {
            continue
          }

          const isBirthdayFilter = filterCategory === 'all' ||
            ['birthday', 'employee birthday', 'celebration', 'birthdays', 'celebrations'].includes(filterCategory.toLowerCase())

          if (isBirthdayFilter) {
            events.push({
              id: `bday-${emp._id}-${targetYear}`,
              entityId: String(emp._id),
              employeeId: String(emp.employeeId || emp._id),
              sourceType: 'employee_birthday',
              sourceId: `bday_${emp.employeeId || emp._id}_${targetYear}`,
              title: `${displayName}'s Birthday`,
              name: displayName,
              date: bdayDate,
              endDate: bdayDate,
              allDay: true,
              day: getWeekday(bdayDate),
              category: 'Employee Birthday',
              type: 'birthday',
              department: emp.department || 'General',
              designation: emp.designation || 'Team Member',
              avatarUrl: emp.avatarUrl || null,
              isCelebration: true,
              canManage: false,
            })
          }
        }
      } catch (err) {
        console.warn('Calendar birthday fetch warning:', err.message)
      }

      // 3. Fetch Employee Work Anniversaries
      try {
        const employees = await Employee.find({
          status: { $in: ['active', 'onboarding'] },
          joiningDate: { $exists: true, $ne: null },
        }).select('_id employeeId firstName lastName name displayName department designation avatarUrl joiningDate').lean().catch(() => [])

        for (const emp of employees) {
          if (!emp.joiningDate) continue
          const jDate = new Date(emp.joiningDate)
          if (isNaN(jDate.getTime())) continue

          const jYear = jDate.getUTCFullYear()
          const jMonth = jDate.getUTCMonth() + 1
          const jDay = String(jDate.getUTCDate()).padStart(2, '0')
          const completedYears = targetYear - jYear

          // Only show if at least 1 completed year
          if (completedYears <= 0) continue
          if (targetMonth && jMonth !== targetMonth) continue

          const annivDate = `${targetYear}-${String(jMonth).padStart(2, '0')}-${jDay}`
          const displayName = emp.displayName || ((emp.firstName || '') + ' ' + (emp.lastName || '')).trim() || emp.name || 'Team Member'

          if (searchQuery && !displayName.toLowerCase().includes(searchQuery)) {
            continue
          }

          if (filterDept !== 'all' && emp.department && emp.department.toLowerCase() !== filterDept.toLowerCase()) {
            continue
          }

          const isAnnivFilter = filterCategory === 'all' ||
            ['work anniversary', 'anniversary', 'celebration', 'anniversaries'].includes(filterCategory.toLowerCase())

          if (isAnnivFilter) {
            events.push({
              id: `anniv-${emp._id}-${targetYear}`,
              entityId: String(emp._id),
              employeeId: String(emp.employeeId || emp._id),
              sourceType: 'employee_anniversary',
              sourceId: `anniv_${emp.employeeId || emp._id}_${targetYear}`,
              title: `${displayName} (${completedYears} Year${completedYears > 1 ? 's' : ''} at Edufyi)`,
              name: displayName,
              date: annivDate,
              endDate: annivDate,
              day: getWeekday(annivDate),
              category: 'Work Anniversary',
              type: 'anniversary',
              completedYears,
              department: emp.department || 'General',
              designation: emp.designation || 'Team Member',
              avatarUrl: emp.avatarUrl || null,
              isCelebration: true,
              canManage: false,
            })
          }
        }
      } catch (err) {
        console.warn('Calendar work anniversary fetch warning:', err.message)
      }

      // 4. Fetch Leave Requests (Role-filtered)
      try {
        let leaveFilter = {}
        if (!canManage) {
          if (actorIsManager && actor.department) {
            // Manager can view team leaves or own leaves
            leaveFilter = {
              $or: [
                { employeeId: actor.id || actor.employeeId },
                { department: actor.department, status: 'approved' },
              ],
            }
          } else {
            // Regular employee only views own leaves
            leaveFilter = {
              employeeId: String(actor.id || actor.employeeId || actor._id),
            }
          }
        }

        const leaves = await LeaveRequest.find(leaveFilter).lean().catch(() => [])

        for (const l of leaves) {
          const lStartStr = normalizeDateString(l.startDate)
          const lEndStr = normalizeDateString(l.endDate) || lStartStr
          if (!lStartStr) continue
          const { year: lYear, month: lMonth } = parseYearMonthSafe(lStartStr, targetYear)
          const { year: lEndYear } = parseYearMonthSafe(lEndStr, targetYear)

          if (lYear !== targetYear && lEndYear !== targetYear) continue
          if (targetMonth && lMonth !== targetMonth) continue

          if (filterCategory !== 'all' && filterCategory.toLowerCase() !== 'leave') {
            continue
          }

          events.push({
            id: `leave-${l._id}`,
            entityId: String(l._id),
            sourceType: 'leave_approved',
            sourceId: `leave_${l._id}`,
            title: `${l.employeeName || 'Employee'} (${l.leaveType || 'Leave'})`,
            name: l.employeeName,
            leaveType: l.leaveType,
            status: l.status,
            date: lStartStr,
            endDate: lEndStr,
            day: getWeekday(lStartStr),
            category: 'Leave',
            type: 'leave',
            department: l.department || 'General',
            reason: canManage || l.employeeId === actor.id ? l.reason : 'Out of Office',
            isSelf: l.employeeId === String(actor.id || actor.employeeId),
            canManage: canManage || l.employeeId === String(actor.id || actor.employeeId),
          })
        }
      } catch (err) {
        console.warn('Calendar leave fetch warning:', err.message)
      }

      // 5. Fetch Smart Calendar Events (Meetings, Training, Deadlines, Client Visits, Lifecycle Events)
      try {
        const smartEvents = await calendarService.listEvents({
          actor,
          year: targetYear,
          month: targetMonth,
          category: filterCategory,
          department: filterDept,
          search: searchQuery,
          scope: req.query.scope || 'all',
        })
        for (const ev of smartEvents) {
          const evCat = (ev.category || ev.type || '').toLowerCase()
          const evSourceType = ev.sourceType || ''
          const evEmpId = String(ev.sourceData?.employeeId || ev.employeeId || '')

          const existingIdx = events.findIndex((existing) => {
            if (existing.id === ev.id || existing.entityId === ev.entityId) return true
            if (existing.sourceId && ev.sourceId && existing.sourceId === ev.sourceId) return true

            const exCat = (existing.category || existing.type || '').toLowerCase()

            // Match Work Anniversaries on same date for same employee or title
            if ((exCat.includes('anniversary') || existing.type === 'anniversary') &&
                (evCat.includes('anniversary') || evSourceType === 'employee_anniversary')) {
              if (existing.date === ev.date) {
                if (evEmpId && (existing.employeeId === evEmpId || existing.entityId === evEmpId)) return true
                const cleanExName = (existing.name || existing.title || '').replace(/\s*\(.*\)/, '').replace(/\s*·.*/, '').trim().toLowerCase()
                const cleanEvName = (ev.name || ev.title || '').replace(/\s*\(.*\)/, '').replace(/\s*·.*/, '').trim().toLowerCase()
                if (cleanExName && cleanEvName && cleanExName === cleanEvName) return true
              }
            }

            // Match Birthdays on same date for same employee or title
            if ((exCat.includes('birthday') || existing.type === 'birthday') &&
                (evCat.includes('birthday') || evSourceType === 'employee_birthday')) {
              if (existing.date === ev.date) {
                if (evEmpId && (existing.employeeId === evEmpId || existing.entityId === evEmpId)) return true
                const cleanExName = (existing.name || existing.title || '').replace(/'s birthday.*/i, '').trim().toLowerCase()
                const cleanEvName = (ev.name || ev.title || '').replace(/'s birthday.*/i, '').trim().toLowerCase()
                if (cleanExName && cleanEvName && cleanExName === cleanEvName) return true
              }
            }

            // Match Holidays on same date
            if ((exCat.includes('holiday') || existing.type === 'holiday') &&
                (evCat.includes('holiday') || evSourceType === 'company_holiday')) {
              if (existing.date === ev.date) {
                const exName = (existing.name || existing.title || '').trim().toLowerCase()
                const evName = (ev.name || ev.title || '').trim().toLowerCase()
                if (exName && evName && exName === evName) return true
              }
            }

            // Match Leaves on same date
            if ((exCat.includes('leave') || existing.type === 'leave') &&
                (evCat.includes('leave') || evSourceType === 'leave_approved')) {
              if (existing.date === ev.date) {
                if (existing.entityId && ev.sourceData?.leaveRequestId && existing.entityId === String(ev.sourceData.leaveRequestId)) return true
              }
            }

            return false
          })

          if (existingIdx !== -1) {
            // Already exists: enrich existing with description/location from smartEvents if missing
            if (ev.description && !events[existingIdx].description) {
              events[existingIdx].description = ev.description
            }
            if (ev.location && !events[existingIdx].location) {
              events[existingIdx].location = ev.location
            }
          } else {
            events.push(ev)
          }
        }
      } catch (err) {
        console.warn('Calendar smart event fetch warning:', err.message)
      }

      // Final bulletproof deduplication pass by semantic key (strictly 1 card per milestone/celebration)
      const seenSemanticKeys = new Set()
      const uniqueEvents = []
      for (const e of events) {
        const cat = (e.category || e.type || '').toLowerCase()
        let key
        if (cat.includes('anniversary') || e.type === 'anniversary') {
          const cleanName = (e.name || e.title || '').replace(/\s*\(.*\)/, '').replace(/\s*·.*/, '').trim().toLowerCase()
          key = `anniv:${cleanName}:${e.date}`
        } else if (cat.includes('birthday') || e.type === 'birthday') {
          const cleanName = (e.name || e.title || '').replace(/'s birthday.*/i, '').trim().toLowerCase()
          key = `bday:${cleanName}:${e.date}`
        } else if (e.sourceId) {
          key = `source:${e.sourceId}`
        } else if (cat.includes('holiday') || e.type === 'holiday') {
          const cleanName = (e.name || e.title || '').trim().toLowerCase()
          key = `holiday:${cleanName}:${e.date}`
        } else {
          key = `event:${e.id || e.entityId || e.title}:${e.date}`
        }

        if (seenSemanticKeys.has(key)) continue
        seenSemanticKeys.add(key)
        uniqueEvents.push(e)
      }
      events.length = 0
      events.push(...uniqueEvents)

      // Sort chronological by date
      events.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))

      const typeCounts = {}
      events.forEach(e => { typeCounts[e.type || e.category] = (typeCounts[e.type || e.category] || 0) + 1 })
      console.log(`[CALENDAR EVENTS] Returning ${events.length} events. Types:`, JSON.stringify(typeCounts))

      res.json({
        success: true,
        count: events.length,
        data: events,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 2. GET /api/v1/calendar/holidays - Filtered & Paginated Holidays
  // =========================================================================
  router.get('/holidays', auth.authenticate, async (req, res, next) => {
    try {
      const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear()
      const category = req.query.category
      const department = req.query.department
      const search = (req.query.search || '').trim().toLowerCase()
      const page = Math.max(1, parseInt(req.query.page, 10) || 1)
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50))

      const query = { status: { $ne: 'inactive' } }

      let holidays = await workspaceModels.holidays.find(query).lean().catch(() => [])

      // In-memory filter for flexible matching & recurring options
      holidays = holidays.filter((h) => {
        const hDate = normalizeDateString(h.date)
        if (!hDate) return false
        const { year: hYear } = parseYearMonthSafe(hDate, year)
        if (!h.isRecurring && year && hYear !== year) return false
        if (category && category !== 'all' && (h.category || h.type || '').toLowerCase() !== category.toLowerCase()) return false
        if (department && department !== 'all') {
          if (Array.isArray(h.applicableDepartments) && h.applicableDepartments.length > 0 && !h.applicableDepartments.includes('All')) {
            if (!h.applicableDepartments.includes(department)) return false
          }
        }
        if (search) {
          const name = (h.name || h.title || '').toLowerCase()
          if (!name.includes(search) && !hDate.includes(search)) return false
        }
        return true
      })

      holidays.sort((a, b) => a.date.localeCompare(b.date))

      const total = holidays.length
      const paginated = holidays.slice((page - 1) * limit, page * limit)

      res.json({
        success: true,
        total,
        page,
        limit,
        data: paginated.map((h) => ({
          id: String(h._id),
          name: h.name || h.title,
          title: h.name || h.title,
          date: h.date,
          endDate: h.endDate || h.date,
          day: h.day || getWeekday(h.date),
          category: h.category || h.type || 'Company Holiday',
          location: h.location || 'All Locations',
          applicableDepartments: h.applicableDepartments || ['All'],
          applicableEmploymentTypes: h.applicableEmploymentTypes || ['All'],
          isPaid: h.isPaid !== false,
          isRecurring: Boolean(h.isRecurring),
          description: h.description || '',
          bannerUrl: h.bannerUrl || null,
          status: h.status || 'active',
          createdBy: h.createdBy || 'Admin',
          updatedBy: h.updatedBy || null,
          createdAt: h.createdAt,
          updatedAt: h.updatedAt,
        })),
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 3. POST /api/v1/calendar/holidays - Add Holiday (Admin/HR with Duplication Check)
  // =========================================================================
  router.post('/holidays', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      if (!isManagement(actor)) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Only Admins and HR can manage holidays.' })
      }

      const body = req.body || {}
      const name = (body.name || body.title || '').trim()
      const date = (body.date || '').trim()
      const endDate = (body.endDate || '').trim() || date
      const category = (body.category || body.type || 'Company Holiday').trim()
      const location = (body.location || 'All Locations').trim()
      const description = (body.description || '').trim()
      const isPaid = body.isPaid !== false
      const isRecurring = Boolean(body.isRecurring)
      const bannerUrl = body.bannerUrl || null
      const applicableDepartments = Array.isArray(body.applicableDepartments) && body.applicableDepartments.length > 0 ? body.applicableDepartments : ['All']
      const applicableEmploymentTypes = Array.isArray(body.applicableEmploymentTypes) && body.applicableEmploymentTypes.length > 0 ? body.applicableEmploymentTypes : ['All']

      if (!name) {
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Holiday name is required.' })
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Invalid holiday date. Format must be YYYY-MM-DD.' })
      }

      if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Invalid holiday end date. Format must be YYYY-MM-DD.' })
      }

      if (endDate && endDate < date) {
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'End date cannot be earlier than start date.' })
      }

      // Duplicate Check: Check if same name and date already exists
      const existing = await workspaceModels.holidays.findOne({
        $or: [
          { date, name: { $regex: new RegExp(`^${name}$`, 'i') }, status: { $ne: 'inactive' } },
        ],
      }).lean().catch(() => null)

      if (existing) {
        return res.status(409).json({
          success: false,
          code: 'DUPLICATE_HOLIDAY',
          message: `A holiday named "${name}" is already registered on ${date}.`,
        })
      }

      const day = getWeekday(date)

      const doc = await workspaceModels.holidays.create({
        ownerId: String(actor.id || actor._id),
        name,
        title: name,
        date,
        endDate,
        day,
        type: category,
        category,
        location,
        description,
        isPaid,
        isRecurring,
        bannerUrl,
        applicableDepartments,
        applicableEmploymentTypes,
        status: 'active',
        createdBy: actor.name || actor.displayName || 'Admin',
        updatedBy: actor.name || actor.displayName || 'Admin',
      })

      // Audit Log
      await CalendarAuditLog.create({
        action: 'CREATE_HOLIDAY',
        entityId: String(doc._id),
        actorId: String(actor.id || actor._id),
        actorName: actor.name || actor.displayName || 'Admin',
        actorRole: actor.role,
        details: `Created holiday "${name}" on ${date} (${category})`,
        changes: { name, date, endDate, category, isPaid, isRecurring, location },
        ip: req.ip,
      }).catch((err) => console.warn('Audit log write error:', err.message))

      // Trigger Unified Notification for new holiday
      createUnifiedNotification({
        recipientId: 'all',
        recipientRole: 'all',
        title: `🌴 New Company Holiday: ${name}`,
        message: `${name} has been added to the official calendar for ${date} (${day}).`,
        category: 'announcement',
        eventType: 'NEW_HOLIDAY',
        relatedEntityId: String(doc._id),
        targetUrl: '#/employee/holidays',
        priority: 'normal',
        idempotencyKey: `holiday_create_${doc._id}`,
      }).catch((err) => console.warn('Holiday notification warning:', err.message))

      res.status(201).json({
        success: true,
        message: `Holiday "${name}" created successfully.`,
        data: {
          id: String(doc._id),
          name: doc.name,
          title: doc.title,
          date: doc.date,
          endDate: doc.endDate,
          day: doc.day,
          category: doc.category,
          location: doc.location,
          applicableDepartments: doc.applicableDepartments,
          applicableEmploymentTypes: doc.applicableEmploymentTypes,
          isPaid: doc.isPaid,
          isRecurring: doc.isRecurring,
          description: doc.description,
          bannerUrl: doc.bannerUrl,
          status: doc.status,
        },
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 4. PUT /api/v1/calendar/holidays/:id - Update Holiday
  // =========================================================================
  router.put('/holidays/:id', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      if (!isManagement(actor)) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Only Admins and HR can update holidays.' })
      }

      const holidayId = req.params.id
      const holiday = await workspaceModels.holidays.findById(holidayId).catch(() => null)
      if (!holiday) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Holiday not found.' })
      }

      const body = req.body || {}
      const updates = {}

      if (body.name !== undefined) {
        updates.name = String(body.name).trim()
        updates.title = updates.name
      }
      if (body.date !== undefined) {
        updates.date = String(body.date).trim()
        updates.day = getWeekday(updates.date)
      }
      if (body.endDate !== undefined) updates.endDate = String(body.endDate).trim()
      if (body.category !== undefined) {
        updates.category = String(body.category).trim()
        updates.type = updates.category
      }
      if (body.location !== undefined) updates.location = String(body.location).trim()
      if (body.description !== undefined) updates.description = String(body.description).trim()
      if (body.isPaid !== undefined) updates.isPaid = Boolean(body.isPaid)
      if (body.isRecurring !== undefined) updates.isRecurring = Boolean(body.isRecurring)
      if (body.status !== undefined) updates.status = String(body.status).trim()
      if (body.bannerUrl !== undefined) updates.bannerUrl = body.bannerUrl
      if (Array.isArray(body.applicableDepartments)) updates.applicableDepartments = body.applicableDepartments
      if (Array.isArray(body.applicableEmploymentTypes)) updates.applicableEmploymentTypes = body.applicableEmploymentTypes

      updates.updatedBy = actor.name || actor.displayName || 'Admin'

      const updated = await workspaceModels.holidays.findByIdAndUpdate(holidayId, { $set: updates }, { returnDocument: 'after' })

      // Audit Log
      await CalendarAuditLog.create({
        action: 'UPDATE_HOLIDAY',
        entityId: holidayId,
        actorId: String(actor.id || actor._id),
        actorName: actor.name || actor.displayName || 'Admin',
        actorRole: actor.role,
        details: `Updated holiday "${updated.name}" on ${updated.date}`,
        changes: updates,
        ip: req.ip,
      }).catch((err) => console.warn('Audit log write error:', err.message))

      res.json({
        success: true,
        message: `Holiday "${updated.name}" updated successfully.`,
        data: updated,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 5. DELETE /api/v1/calendar/holidays/:id - Delete Holiday
  // =========================================================================
  router.delete('/holidays/:id', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      if (!isManagement(actor)) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Only Admins and HR can delete holidays.' })
      }

      const holidayId = req.params.id
      const holiday = await workspaceModels.holidays.findById(holidayId).catch(() => null)
      if (!holiday) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Holiday not found.' })
      }

      await workspaceModels.holidays.findByIdAndDelete(holidayId)

      // Audit Log
      await CalendarAuditLog.create({
        action: 'DELETE_HOLIDAY',
        entityId: holidayId,
        actorId: String(actor.id || actor._id),
        actorName: actor.name || actor.displayName || 'Admin',
        actorRole: actor.role,
        details: `Deleted holiday "${holiday.name}" on ${holiday.date}`,
        changes: { deletedHoliday: holiday },
        ip: req.ip,
      }).catch((err) => console.warn('Audit log write error:', err.message))

      res.json({
        success: true,
        message: `Holiday "${holiday.name}" deleted successfully.`,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 6. POST /api/v1/calendar/holidays/:id/duplicate - Duplicate Holiday
  // =========================================================================
  router.post('/holidays/:id/duplicate', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      if (!isManagement(actor)) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Only Admins and HR can duplicate holidays.' })
      }

      const holidayId = req.params.id
      const original = await workspaceModels.holidays.findById(holidayId).lean().catch(() => null)
      if (!original) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Original holiday not found.' })
      }

      const targetYear = req.body.targetYear ? parseInt(req.body.targetYear, 10) : null
      const origDate = normalizeDateString(original.date)
      const targetDate = req.body.targetDate || (targetYear && origDate ? `${targetYear}-${origDate.slice(5)}` : null)

      if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Target date (YYYY-MM-DD) or valid targetYear is required.' })
      }

      // Check duplicates
      const exists = await workspaceModels.holidays.findOne({
        date: targetDate,
        name: { $regex: new RegExp(`^${original.name}$`, 'i') },
        status: { $ne: 'inactive' },
      }).lean().catch(() => null)

      if (exists) {
        return res.status(409).json({ success: false, code: 'DUPLICATE_HOLIDAY', message: `Holiday "${original.name}" already exists on ${targetDate}.` })
      }

      const newDay = getWeekday(targetDate)
      const cloned = await workspaceModels.holidays.create({
        ownerId: String(actor.id || actor._id),
        name: original.name,
        title: original.title || original.name,
        date: targetDate,
        endDate: targetDate,
        day: newDay,
        type: original.type,
        category: original.category || original.type || 'Company Holiday',
        location: original.location,
        description: original.description,
        isPaid: original.isPaid,
        isRecurring: original.isRecurring,
        bannerUrl: original.bannerUrl,
        applicableDepartments: original.applicableDepartments,
        applicableEmploymentTypes: original.applicableEmploymentTypes,
        status: 'active',
        createdBy: actor.name || actor.displayName || 'Admin',
        updatedBy: actor.name || actor.displayName || 'Admin',
      })

      // Audit Log
      await CalendarAuditLog.create({
        action: 'DUPLICATE_HOLIDAY',
        entityId: String(cloned._id),
        actorId: String(actor.id || actor._id),
        actorName: actor.name || actor.displayName || 'Admin',
        actorRole: actor.role,
        details: `Duplicated holiday "${original.name}" from ${original.date} to ${targetDate}`,
        changes: { originalId: holidayId, newId: String(cloned._id), targetDate },
        ip: req.ip,
      }).catch((err) => console.warn('Audit log write error:', err.message))

      res.status(201).json({
        success: true,
        message: `Holiday "${original.name}" duplicated to ${targetDate}.`,
        data: cloned,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 7. POST /api/v1/calendar/holidays/bulk-import - CSV Bulk Import with Preview & Validation
  // =========================================================================
  router.post('/holidays/bulk-import', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      if (!isManagement(actor)) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Only Admins and HR can bulk import holidays.' })
      }

      const { rows = [], dryRun = false } = req.body || {}
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ success: false, code: 'EMPTY_IMPORT', message: 'No rows provided for import.' })
      }

      // Fetch existing holidays to detect conflicts
      const existingHolidays = await workspaceModels.holidays.find({ status: { $ne: 'inactive' } }).lean().catch(() => [])
      const existingMap = new Set(existingHolidays.map((h) => `${(h.name || '').trim().toLowerCase()}_${h.date}`))

      const validRows = []
      const invalidRows = []
      const seenInBatch = new Set()

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] || {}
        const rowNum = i + 1
        const name = (row.name || row.title || row.Holiday || row['Holiday Name'] || '').trim()
        const rawDate = (row.date || row.Date || '').trim()
        const rawEndDate = (row.endDate || row['End Date'] || rawDate).trim()
        const category = (row.category || row.Category || row.type || row.Type || 'Company Holiday').trim()
        const location = (row.location || row.Location || 'All Locations').trim()
        const deptStr = (row.applicableDepartments || row.department || row.Departments || 'All').trim()
        const isPaid = row.isPaid !== undefined ? Boolean(row.isPaid) : !/unpaid/i.test(row['Paid/Unpaid'] || row.paidStatus || '')
        const isRecurring = Boolean(row.isRecurring || row.recurring)
        const description = (row.description || row.Description || '').trim()

        // Validation
        if (!name) {
          invalidRows.push({ rowNumber: rowNum, data: row, reason: 'Holiday name is required.' })
          continue
        }

        // Validate date format YYYY-MM-DD
        let formattedDate = rawDate
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
          // Attempt conversion from DD-MM-YYYY or MM/DD/YYYY
          const parsed = new Date(rawDate)
          if (!isNaN(parsed.getTime())) {
            formattedDate = parsed.toISOString().split('T')[0]
          } else {
            invalidRows.push({ rowNumber: rowNum, data: row, reason: `Invalid date format "${rawDate}". Use YYYY-MM-DD.` })
            continue
          }
        }

        // End date validation
        let formattedEndDate = rawEndDate || formattedDate
        if (formattedEndDate && !/^\d{4}-\d{2}-\d{2}$/.test(formattedEndDate)) {
          const parsedEnd = new Date(rawEndDate)
          if (!isNaN(parsedEnd.getTime())) {
            formattedEndDate = parsedEnd.toISOString().split('T')[0]
          } else {
            formattedEndDate = formattedDate
          }
        }

        // Check duplicate within batch
        const batchKey = `${name.toLowerCase()}_${formattedDate}`
        if (seenInBatch.has(batchKey)) {
          invalidRows.push({ rowNumber: rowNum, data: row, reason: `Duplicate entry within this CSV file: "${name}" on ${formattedDate}.` })
          continue
        }
        seenInBatch.add(batchKey)

        // Check duplicate in existing database
        if (existingMap.has(batchKey)) {
          invalidRows.push({ rowNumber: rowNum, data: row, reason: `Holiday "${name}" already exists in the calendar for ${formattedDate}.` })
          continue
        }

        const applicableDepartments = deptStr.split(',').map((d) => d.trim()).filter(Boolean)
        const day = getWeekday(formattedDate)

        validRows.push({
          ownerId: String(actor.id || actor._id),
          name,
          title: name,
          date: formattedDate,
          endDate: formattedEndDate || formattedDate,
          day,
          type: category,
          category,
          location,
          applicableDepartments: applicableDepartments.length > 0 ? applicableDepartments : ['All'],
          applicableEmploymentTypes: ['All'],
          isPaid,
          isRecurring,
          description,
          status: 'active',
          createdBy: actor.name || actor.displayName || 'Admin',
          updatedBy: actor.name || actor.displayName || 'Admin',
        })
      }

      // If dry run, just return preview
      if (dryRun) {
        return res.json({
          success: true,
          dryRun: true,
          summary: {
            totalRows: rows.length,
            validCount: validRows.length,
            invalidCount: invalidRows.length,
          },
          validPreview: validRows.slice(0, 10),
          invalidRows,
        })
      }

      // Real import: batch insert valid rows
      let inserted = []
      if (validRows.length > 0) {
        inserted = await workspaceModels.holidays.insertMany(validRows)

        // Audit Log
        await CalendarAuditLog.create({
          action: 'BULK_IMPORT_HOLIDAYS',
          actorId: String(actor.id || actor._id),
          actorName: actor.name || actor.displayName || 'Admin',
          actorRole: actor.role,
          details: `Imported ${inserted.length} holidays via bulk CSV upload.`,
          changes: { count: inserted.length, invalidCount: invalidRows.length },
          ip: req.ip,
        }).catch((err) => console.warn('Audit log write error:', err.message))
      }

      res.status(validRows.length > 0 ? 201 : 400).json({
        success: validRows.length > 0,
        message: `Successfully imported ${inserted.length} holidays.${invalidRows.length > 0 ? ` ${invalidRows.length} rows were skipped due to errors.` : ''}`,
        summary: {
          totalRows: rows.length,
          importedCount: inserted.length,
          skippedCount: invalidRows.length,
        },
        invalidRows,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 8. GET /api/v1/calendar/export - CSV / ICS iCalendar Format
  // =========================================================================
  router.get('/export', auth.authenticate, async (req, res, next) => {
    try {
      const format = (req.query.format || 'csv').toLowerCase()
      const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear()

      let holidays = await workspaceModels.holidays.find({ status: { $ne: 'inactive' } }).lean().catch(() => [])

      if (year) {
        holidays = holidays.filter((h) => {
          const hDate = normalizeDateString(h.date)
          if (!hDate) return false
          const { year: hYear } = parseYearMonthSafe(hDate, year)
          return h.isRecurring || hYear === year
        })
      }

      holidays.sort((a, b) => a.date.localeCompare(b.date))

      if (format === 'ics') {
        // Generate iCalendar RFC 5545 format
        let ics = [
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
            `UID:holiday-${h._id}@edufyitech.in`,
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
        const output = ics.join('\r\n')

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="edufyi_holidays_${year}.ics"`)
        return res.send(output)
      }

      // CSV format
      const headers = ['Holiday Name', 'Start Date', 'End Date', 'Day', 'Category', 'Paid Status', 'Location', 'Applicable Departments', 'Recurring', 'Description']
      const rows = holidays.map((h) => [
        `"${(h.name || h.title || '').replace(/"/g, '""')}"`,
        `"${h.date || ''}"`,
        `"${h.endDate || h.date || ''}"`,
        `"${h.day || getWeekday(h.date)}"`,
        `"${(h.category || h.type || 'Company Holiday').replace(/"/g, '""')}"`,
        `"${h.isPaid !== false ? 'Paid' : 'Unpaid'}"`,
        `"${(h.location || 'All Locations').replace(/"/g, '""')}"`,
        `"${(Array.isArray(h.applicableDepartments) ? h.applicableDepartments.join(', ') : 'All').replace(/"/g, '""')}"`,
        `"${h.isRecurring ? 'Yes' : 'No'}"`,
        `"${(h.description || '').replace(/"/g, '""')}"`,
      ])

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="edufyi_holidays_${year}.csv"`)
      return res.send(csvContent)
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 9. GET /api/v1/calendar/widgets - Dashboard Calendar Analytics Widgets
  // =========================================================================
  router.get('/widgets', auth.authenticate, async (req, res, next) => {
    try {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const todayStr = now.toISOString().split('T')[0]

      // 1. Total Holidays This Year
      const allHolidays = await workspaceModels.holidays.find({ status: { $ne: 'inactive' } }).lean().catch(() => [])
      const thisYearHolidays = allHolidays.filter((h) => {
        const hDate = normalizeDateString(h.date)
        if (!hDate) return false
        const { year: y } = parseYearMonthSafe(hDate, currentYear)
        return h.isRecurring || y === currentYear
      })

      // 2. Upcoming Holidays
      const upcomingHolidays = allHolidays
        .map((h) => {
          const hDate = normalizeDateString(h.date)
          if (!hDate) return null
          const effectiveDate = h.isRecurring ? `${currentYear}-${hDate.slice(5)}` : hDate
          const daysRemaining = calculateDaysUntil(effectiveDate)
          return {
            id: String(h._id),
            name: h.name || h.title,
            date: effectiveDate,
            day: h.day || getWeekday(effectiveDate),
            category: h.category || h.type || 'Company Holiday',
            daysRemaining,
          }
        })
        .filter((h) => h && h.daysRemaining !== null && h.daysRemaining >= 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)

      const nextHoliday = upcomingHolidays.length > 0 ? upcomingHolidays[0] : null

      // 3. Birthdays This Month & Upcoming Birthdays
      const birthdaysThisMonth = []
      const upcomingBirthdays = []
      try {
        const activeEmployees = await Employee.find({
          status: { $nin: ['inactive', 'resigned', 'terminated', 'deleted'] },
        })
          .select('_id employeeId firstName lastName name displayName department designation avatarUrl dob identity dateOfBirth birthDate personalDetails')
          .lean()
          .catch(() => [])

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const todayDateObj = new Date()
        todayDateObj.setHours(0, 0, 0, 0)

        const allMappedBirthdays = []
        for (const emp of activeEmployees) {
          const dobInfo = extractEmployeeDob(emp)
          if (!dobInfo) continue

          const bMonth = dobInfo.month
          const bDay = parseInt(dobInfo.day, 10)
          let nextYear = currentYear
          const thisYearDate = new Date(currentYear, bMonth - 1, bDay)
          if (thisYearDate < todayDateObj) nextYear = currentYear + 1
          const nextDate = new Date(nextYear, bMonth - 1, bDay)
          const daysRemaining = Math.max(0, Math.ceil((nextDate - todayDateObj) / (1000 * 60 * 60 * 24)))

          const bDate = `${nextYear}-${String(bMonth).padStart(2, '0')}-${String(bDay).padStart(2, '0')}`
          const bdayItem = {
            id: String(emp._id),
            employeeId: emp.employeeId,
            name: emp.displayName || ((emp.firstName || '') + ' ' + (emp.lastName || '')).trim() || emp.name || 'Team Member',
            department: emp.department || 'General',
            designation: emp.designation || 'Team Member',
            avatarUrl: emp.avatarUrl || null,
            date: bDate,
            month: bMonth,
            day: bDay,
            formattedDate: `${bDay} ${monthNames[bMonth - 1]}`,
            daysRemaining,
          }
          allMappedBirthdays.push(bdayItem)
          if (bMonth === currentMonth) {
            birthdaysThisMonth.push(bdayItem)
          }
        }
        allMappedBirthdays.sort((a, b) => a.daysRemaining - b.daysRemaining)
        birthdaysThisMonth.sort((a, b) => a.day - b.day)
        upcomingBirthdays.push(...allMappedBirthdays.slice(0, 5))
      } catch (err) {
        console.warn('Widgets birthday query warning:', err.message)
      }

      // 4. Work Anniversaries This Month
      const anniversariesThisMonth = []
      try {
        const activeEmployees = await Employee.find({
          status: { $in: ['active', 'onboarding'] },
          joiningDate: { $exists: true, $ne: null },
        })
          .select('_id employeeId firstName lastName name displayName department designation avatarUrl joiningDate')
          .lean()
          .catch(() => [])

        for (const emp of activeEmployees) {
          if (!emp.joiningDate) continue
          const jDate = new Date(emp.joiningDate)
          if (isNaN(jDate.getTime())) continue
          const jYear = jDate.getUTCFullYear()
          const jMonth = jDate.getUTCMonth() + 1
          const completedYears = currentYear - jYear
          if (completedYears > 0 && jMonth === currentMonth) {
            const aDate = `${currentYear}-${String(jMonth).padStart(2, '0')}-${String(jDate.getUTCDate()).padStart(2, '0')}`
            anniversariesThisMonth.push({
              id: String(emp._id),
              name: emp.displayName || ((emp.firstName || '') + ' ' + (emp.lastName || '')).trim() || emp.name || 'Team Member',
              department: emp.department || 'General',
              designation: emp.designation || 'Team Member',
              avatarUrl: emp.avatarUrl || null,
              date: aDate,
              completedYears,
              day: jDate.getUTCDate(),
              daysRemaining: calculateDaysUntil(aDate),
            })
          }
        }
        anniversariesThisMonth.sort((a, b) => a.day - b.day)
      } catch (err) {
        console.warn('Widgets anniversary query warning:', err.message)
      }

      // 5. Scheduled Meetings (with Google Meet video conference links)
      let upcomingMeetings = []
      let scheduledMeetingsCount = 0
      try {
        scheduledMeetingsCount = await CalendarEvent.countDocuments({
          status: { $ne: 'cancelled' },
          date: { $gte: todayStr },
          $or: [
            { category: { $regex: /meeting/i } },
            { type: 'meeting' },
            { 'meetingLink.url': { $exists: true, $ne: '' } },
          ],
        }).catch(() => 0)

        upcomingMeetings = await CalendarEvent.find({
          status: { $ne: 'cancelled' },
          date: { $gte: todayStr },
        })
          .sort({ date: 1, startTime: 1 })
          .limit(5)
          .lean()
          .catch(() => [])
      } catch {}

      // 6. Upcoming Company Events (deadlines, trainings, reviews)
      let upcomingCompanyEventsCount = 0
      try {
        upcomingCompanyEventsCount = await CalendarEvent.countDocuments({
          status: { $ne: 'cancelled' },
          date: { $gte: todayStr },
          category: { $nin: ['Company Holiday', 'Birthday', 'Employee Birthday', 'Work Anniversary'] },
        }).catch(() => 0)
      } catch {}

      // 7. Pending Invitations / Actions
      let pendingInvitationsCount = 0
      try {
        const actorId = String(req.auth.user?.id || req.auth.user?._id || req.auth.user?.employeeId || '')
        pendingInvitationsCount = await CalendarEvent.countDocuments({
          status: { $ne: 'cancelled' },
          date: { $gte: todayStr },
          participants: {
            $elemMatch: {
              $or: [{ employeeId: actorId }, { email: (req.auth.user?.email || '').toLowerCase() }],
              rsvpStatus: 'pending',
            },
          },
        }).catch(() => 0)
      } catch {}

      let pendingLeavesCount = 0
      try {
        pendingLeavesCount = await LeaveRequest.countDocuments({ status: { $in: ['pending', 'pending_manager', 'pending_hr'] } }).catch(() => 0)
      } catch {}

      res.json({
        success: true,
        data: {
          totalHolidaysThisYear: thisYearHolidays.length,
          upcomingHolidaysCount: upcomingHolidays.length,
          nextHoliday,
          upcomingHolidays: upcomingHolidays.slice(0, 5),
          birthdaysThisMonth,
          upcomingBirthdays,
          nextBirthday: upcomingBirthdays[0] || null,
          anniversariesThisMonth,
          upcomingMeetings,
          scheduledMeetingsCount,
          upcomingCompanyEventsCount,
          pendingInvitationsCount: pendingInvitationsCount || pendingLeavesCount,
          pendingActionsCount: pendingLeavesCount,
        },
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 10. GET /api/v1/calendar/audit-logs - Administrative Change History
  // =========================================================================
  router.get('/audit-logs', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      if (!isManagement(actor)) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Access denied.' })
      }

      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50))
      const logs = await CalendarAuditLog.find().sort({ createdAt: -1 }).limit(limit).lean().catch(() => [])

      res.json({
        success: true,
        count: logs.length,
        data: logs,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 11. POST /api/v1/calendar/events - Create Smart Calendar Event
  // =========================================================================
  router.post('/events', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      const saved = await calendarService.createEvent({
        eventData: req.body,
        actor,
        ip: req.ip,
      })
      res.status(201).json({
        success: true,
        message: 'Event created successfully.',
        data: saved,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 12. GET /api/v1/calendar/events/:id - Get Single Event Details
  // =========================================================================
  router.get('/events/:id', auth.authenticate, async (req, res, next) => {
    try {
      const event = await CalendarEvent.findById(req.params.id).lean()
      if (!event) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Event not found.' })
      }
      const formatted = calendarService.formatEventPayload(
        event,
        String(req.auth.user.id || req.auth.user.employeeId),
        isManagement(req.auth.user)
      )
      res.json({
        success: true,
        data: formatted,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 13. PUT /api/v1/calendar/events/:id - Update Event
  // =========================================================================
  router.put('/events/:id', auth.authenticate, async (req, res, next) => {
    try {
      const updated = await calendarService.updateEvent({
        eventId: req.params.id,
        updates: req.body,
        actor: req.auth.user,
        editScope: req.query.scope || 'this',
        ip: req.ip,
      })
      res.json({
        success: true,
        message: 'Event updated successfully.',
        data: updated,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 14. PATCH /api/v1/calendar/events/:id - Drag-and-Drop Reschedule
  // =========================================================================
  router.patch('/events/:id', auth.authenticate, async (req, res, next) => {
    try {
      const { date, startTime, endTime } = req.body || {}
      const updated = await calendarService.updateEvent({
        eventId: req.params.id,
        updates: { date, startTime, endTime },
        actor: req.auth.user,
        editScope: req.query.scope || 'this',
        ip: req.ip,
      })
      res.json({
        success: true,
        message: 'Event rescheduled successfully.',
        data: updated,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 15. DELETE /api/v1/calendar/events/:id - Cancel / Soft Delete Event
  // =========================================================================
  router.delete('/events/:id', auth.authenticate, async (req, res, next) => {
    try {
      const reason = req.body?.reason || req.query?.reason || ''
      const result = await calendarService.deleteEvent({
        eventId: req.params.id,
        actor: req.auth.user,
        reason,
      })
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 16. POST /api/v1/calendar/events/:id/respond - RSVP (Accept, Decline, Tentative)
  // =========================================================================
  router.post('/events/:id/respond', auth.authenticate, async (req, res, next) => {
    try {
      const { status, note } = req.body || {}
      const result = await calendarService.respondToInvitation({
        eventId: req.params.id,
        actor: req.auth.user,
        status: (status || '').toLowerCase(),
        responseNote: note || '',
      })
      res.json({
        success: true,
        message: `RSVP marked as ${status}.`,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 17. POST /api/v1/calendar/events/:id/meet - Generate / Attach Video Meeting
  // =========================================================================
  router.post('/events/:id/meet', auth.authenticate, async (req, res, next) => {
    try {
      const event = await CalendarEvent.findById(req.params.id)
      if (!event) return res.status(404).json({ success: false, message: 'Event not found.' })

      const meetDetails = await googleCalendarService.createGoogleMeetEvent({
        title: event.title,
        description: event.description,
        date: event.date,
        endDate: event.endDate || event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        timezone: event.timezone,
        participants: event.participants,
      })

      event.meetingLink = meetDetails
      await event.save()

      res.json({
        success: true,
        message: 'Google Meet link generated.',
        data: meetDetails,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 18. GET /api/v1/calendar/upcoming - Fast Upcoming Agenda
  // =========================================================================
  router.get('/upcoming', auth.authenticate, async (req, res, next) => {
    try {
      const actor = req.auth.user
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))
      const todayStr = new Date().toISOString().slice(0, 10)

      const events = await calendarService.listEvents({
        actor,
        search: '',
        scope: req.query.scope || 'all',
      })

      const upcoming = events.filter((e) => e.date >= todayStr).slice(0, limit)

      res.json({
        success: true,
        count: upcoming.length,
        data: upcoming,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 19. GET /api/v1/calendar/analytics - Scheduling Insights & Metrics
  // =========================================================================
  router.get('/analytics', auth.authenticate, async (req, res, next) => {
    try {
      const analytics = await calendarService.getAnalytics({ actor: req.auth.user })
      res.json({
        success: true,
        data: analytics,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 20. GET & PUT /api/v1/calendar/preferences - User Notification & View Settings
  // =========================================================================
  router.get('/preferences', auth.authenticate, async (req, res, next) => {
    try {
      const empId = String(req.auth.user.id || req.auth.user.employeeId)
      let prefs = await CalendarPreference.findOne({ employeeId: empId }).lean()
      if (!prefs) {
        prefs = {
          employeeId: empId,
          defaultView: 'month',
          enableInAppReminders: true,
          enableEmailReminders: true,
          enableBrowserNotifications: true,
          dailyDigestEnabled: true,
          weeklySummaryEnabled: true,
          birthdayAnnouncements: true,
          anniversaryAnnouncements: true,
          reminderMinutesBefore: [15, 60],
          timeZone: 'Asia/Kolkata',
        }
      }
      res.json({ success: true, data: prefs })
    } catch (error) {
      next(error)
    }
  })

  router.put('/preferences', auth.authenticate, async (req, res, next) => {
    try {
      const empId = String(req.auth.user.id || req.auth.user.employeeId)
      const allowed = [
        'defaultView',
        'enableInAppReminders',
        'enableEmailReminders',
        'enableBrowserNotifications',
        'dailyDigestEnabled',
        'weeklySummaryEnabled',
        'birthdayAnnouncements',
        'anniversaryAnnouncements',
        'reminderMinutesBefore',
        'timeZone',
      ]
      const updates = {}
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key]
      }

      const updated = await CalendarPreference.findOneAndUpdate(
        { employeeId: empId },
        { $set: updates },
        { upsert: true, returnDocument: 'after' }
      )
      res.json({ success: true, message: 'Preferences updated.', data: updated })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 21. GOOGLE INTEGRATION: Connect, Callback, Disconnect
  // =========================================================================
  router.get('/integrations', auth.authenticate, async (req, res, next) => {
    try {
      const integration = await CalendarIntegration.findOne({ provider: 'google' }).lean().catch(() => null)
      res.json({
        success: true,
        data: {
          googleConfigured: googleCalendarService.isConfigured(),
          isConnected: Boolean(integration?.isConnected),
          accountEmail: integration?.accountEmail || null,
          lastSyncAt: integration?.lastSyncAt || null,
          syncStatus: integration?.syncStatus || 'disconnected',
        },
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/google/connect', auth.authenticate, async (req, res, next) => {
    try {
      if (!isManagement(req.auth.user)) {
        return res.status(403).json({ success: false, message: 'Only Management or HR can connect Google Workspace.' })
      }
      const authUrl = googleCalendarService.getAuthUrl(`actor_${req.auth.user.id}`)
      if (!authUrl) {
        return res.status(400).json({
          success: false,
          message: 'Google Client ID & Secret not configured in environment variables (GOOGLE_CLIENT_ID).',
        })
      }
      res.json({ success: true, authUrl })
    } catch (error) {
      next(error)
    }
  })

  router.get('/google/callback', async (req, res, next) => {
    try {
      const { code } = req.query
      if (!code) return res.status(400).send('Missing authorization code.')
      await googleCalendarService.exchangeCodeForTokens(code)
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #006E6F;">✅ Google Calendar Successfully Connected!</h2>
            <p>You can close this tab and return to Edufyi HR.</p>
            <script>window.opener && window.opener.postMessage('google_calendar_connected', '*'); window.close();</script>
          </body>
        </html>
      `)
    } catch (error) {
      res.status(500).send(`Google Connection Error: ${error.message}`)
    }
  })

  router.post('/google/disconnect', auth.authenticate, async (req, res, next) => {
    try {
      if (!isManagement(req.auth.user)) {
        return res.status(403).json({ success: false, message: 'Permission denied.' })
      }
      await CalendarIntegration.findOneAndUpdate(
        { provider: 'google' },
        { isConnected: false, accessToken: null, refreshToken: null, syncStatus: 'disconnected' }
      )
      res.json({ success: true, message: 'Google integration disconnected.' })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 22. POST /api/v1/calendar/sync - On-Demand HR Lifecycle Synchronization
  // =========================================================================
  router.post('/sync', auth.authenticate, async (req, res, next) => {
    try {
      if (!isManagement(req.auth.user)) {
        return res.status(403).json({ success: false, message: 'Permission denied.' })
      }
      const targetYear = parseInt(req.body?.year, 10) || new Date().getFullYear()
      const summary = await calendarSyncService.syncAllHREvents(targetYear)
      res.json({
        success: true,
        message: 'HR lifecycle events synchronized successfully.',
        data: summary,
      })
    } catch (error) {
      next(error)
    }
  })

  // =========================================================================
  // 23. GET /api/v1/calendar/maps/autocomplete - Google Places Autocomplete Proxy
  // =========================================================================
  router.get('/maps/autocomplete', auth.authenticate, async (req, res, next) => {
    try {
      const input = (req.query.input || req.query.q || '').trim()
      const results = await googleMapsService.autocompletePlaces(input)
      res.json({
        success: true,
        count: results.length,
        data: results,
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}
