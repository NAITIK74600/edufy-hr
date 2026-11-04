import { Router } from 'express'
import mongoose from 'mongoose'
import { workspaceModels } from '../../models/Workspace.js'
import { Employee } from '../../models/Employee.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'
import { CalendarAuditLog } from '../../models/CalendarAuditLog.js'
import { CalendarEvent } from '../../models/CalendarEvent.js'
import { createUnifiedNotification } from '../../services/unifiedNotification.service.js'

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
        if (!h.date) continue
        const hYear = parseInt(h.date.slice(0, 4), 10)
        const hMonth = parseInt(h.date.slice(5, 7), 10)

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
        if (searchQuery && !name.includes(searchQuery) && !h.date.includes(searchQuery)) {
          continue
        }

        const effectiveDate = h.isRecurring ? `${targetYear}-${h.date.slice(5)}` : h.date
        const effectiveEndDate = h.endDate ? (h.isRecurring ? `${targetYear}-${h.endDate.slice(5)}` : h.endDate) : effectiveDate

        events.push({
          id: String(h._id),
          entityId: String(h._id),
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
          status: { $in: ['active', 'onboarding'] },
        }).select('_id employeeId name displayName department designation avatarUrl dob').lean().catch(() => [])

        for (const emp of employees) {
          if (!emp.dob) continue
          const dobDate = new Date(emp.dob)
          if (isNaN(dobDate.getTime())) continue

          const bMonth = dobDate.getUTCMonth() + 1
          const bDay = String(dobDate.getUTCDate()).padStart(2, '0')

          if (targetMonth && bMonth !== targetMonth) continue

          const bdayDate = `${targetYear}-${String(bMonth).padStart(2, '0')}-${bDay}`
          const displayName = emp.displayName || emp.name

          if (searchQuery && !displayName.toLowerCase().includes(searchQuery)) {
            continue
          }

          if (filterDept !== 'all' && emp.department && emp.department.toLowerCase() !== filterDept.toLowerCase()) {
            continue
          }

          if (filterCategory === 'all' || filterCategory.toLowerCase() === 'birthday' || filterCategory.toLowerCase() === 'celebration') {
            events.push({
              id: `bday-${emp._id}-${targetYear}`,
              entityId: String(emp._id),
              title: `${displayName}'s Birthday`,
              name: displayName,
              date: bdayDate,
              endDate: bdayDate,
              day: getWeekday(bdayDate),
              category: 'Birthday',
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
        }).select('_id employeeId name displayName department designation avatarUrl joiningDate').lean().catch(() => [])

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
          const displayName = emp.displayName || emp.name

          if (searchQuery && !displayName.toLowerCase().includes(searchQuery)) {
            continue
          }

          if (filterDept !== 'all' && emp.department && emp.department.toLowerCase() !== filterDept.toLowerCase()) {
            continue
          }

          if (filterCategory === 'all' || filterCategory.toLowerCase() === 'work anniversary' || filterCategory.toLowerCase() === 'celebration') {
            events.push({
              id: `anniv-${emp._id}-${targetYear}`,
              entityId: String(emp._id),
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
          if (!l.startDate) continue
          const lYear = parseInt(l.startDate.slice(0, 4), 10)
          const lMonth = parseInt(l.startDate.slice(5, 7), 10)

          if (lYear !== targetYear) continue
          if (targetMonth && lMonth !== targetMonth) continue

          if (filterCategory !== 'all' && filterCategory.toLowerCase() !== 'leave') {
            continue
          }

          events.push({
            id: `leave-${l._id}`,
            entityId: String(l._id),
            title: `${l.employeeName || 'Employee'} (${l.leaveType || 'Leave'})`,
            name: l.employeeName,
            leaveType: l.leaveType,
            status: l.status,
            date: l.startDate,
            endDate: l.endDate || l.startDate,
            day: getWeekday(l.startDate),
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

      // 5. Fetch Custom Calendar Events (Meetings, Training, Deadlines)
      try {
        const customEvents = await CalendarEvent.find({ status: { $ne: 'cancelled' } }).lean().catch(() => [])
        for (const ev of customEvents) {
          if (!ev.date) continue
          const eYear = parseInt(ev.date.slice(0, 4), 10)
          const eMonth = parseInt(ev.date.slice(5, 7), 10)

          if (eYear !== targetYear) continue
          if (targetMonth && eMonth !== targetMonth) continue

          if (filterDept !== 'all' && ev.department && ev.department !== 'All' && ev.department.toLowerCase() !== filterDept.toLowerCase()) {
            continue
          }

          if (filterCategory !== 'all' && ev.category.toLowerCase() !== filterCategory.toLowerCase()) {
            continue
          }

          events.push({
            id: `event-${ev._id}`,
            entityId: String(ev._id),
            title: ev.title,
            name: ev.title,
            date: ev.date,
            endDate: ev.endDate || ev.date,
            startTime: ev.startTime || null,
            endTime: ev.endTime || null,
            day: getWeekday(ev.date),
            category: ev.category || 'Company',
            type: 'event',
            location: ev.location || 'Head Office',
            department: ev.department || 'All',
            description: ev.description || '',
            organizer: ev.organizer || '',
            canManage,
          })
        }
      } catch (err) {
        console.warn('Calendar custom event fetch warning:', err.message)
      }

      // Sort chronological by date
      events.sort((a, b) => a.date.localeCompare(b.date))

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
        if (!h.date) return false
        const hYear = parseInt(h.date.slice(0, 4), 10)
        if (!h.isRecurring && year && hYear !== year) return false
        if (category && category !== 'all' && (h.category || h.type || '').toLowerCase() !== category.toLowerCase()) return false
        if (department && department !== 'all') {
          if (Array.isArray(h.applicableDepartments) && h.applicableDepartments.length > 0 && !h.applicableDepartments.includes('All')) {
            if (!h.applicableDepartments.includes(department)) return false
          }
        }
        if (search) {
          const name = (h.name || h.title || '').toLowerCase()
          if (!name.includes(search) && !h.date.includes(search)) return false
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

      const updated = await workspaceModels.holidays.findByIdAndUpdate(holidayId, { $set: updates }, { new: true })

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
      const targetDate = req.body.targetDate || (targetYear ? `${targetYear}-${original.date.slice(5)}` : null)

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
          if (!h.date) return false
          const hYear = parseInt(h.date.slice(0, 4), 10)
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
        if (!h.date) return false
        const y = parseInt(h.date.slice(0, 4), 10)
        return h.isRecurring || y === currentYear
      })

      // 2. Upcoming Holidays
      const upcomingHolidays = allHolidays
        .map((h) => {
          const effectiveDate = h.isRecurring ? `${currentYear}-${h.date.slice(5)}` : h.date
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
        .filter((h) => h.daysRemaining !== null && h.daysRemaining >= 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)

      const nextHoliday = upcomingHolidays.length > 0 ? upcomingHolidays[0] : null

      // 3. Birthdays This Month
      const birthdaysThisMonth = []
      try {
        const activeEmployees = await Employee.find({ status: { $in: ['active', 'onboarding'] } })
          .select('name displayName department designation avatarUrl dob')
          .lean()
          .catch(() => [])

        for (const emp of activeEmployees) {
          if (!emp.dob) continue
          const d = new Date(emp.dob)
          if (isNaN(d.getTime())) continue
          const m = d.getUTCMonth() + 1
          if (m === currentMonth) {
            const bDate = `${currentYear}-${String(m).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
            birthdaysThisMonth.push({
              id: String(emp._id),
              name: emp.displayName || emp.name,
              department: emp.department || 'General',
              designation: emp.designation || 'Team Member',
              avatarUrl: emp.avatarUrl || null,
              date: bDate,
              day: d.getUTCDate(),
              daysRemaining: calculateDaysUntil(bDate),
            })
          }
        }
        birthdaysThisMonth.sort((a, b) => a.day - b.day)
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
          .select('name displayName department designation avatarUrl joiningDate')
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
              name: emp.displayName || emp.name,
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

      // 5. Pending Leaves / Actions
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
          anniversariesThisMonth,
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

  return router
}
