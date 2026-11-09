import crypto from 'crypto'
import { CalendarEvent, EVENT_CATEGORIES } from '../../models/CalendarEvent.js'
import { CalendarInvitation } from '../../models/CalendarInvitation.js'
import { CalendarPreference } from '../../models/CalendarPreference.js'
import { CalendarAuditLog } from '../../models/CalendarAuditLog.js'
import { Employee } from '../../models/Employee.js'
import { googleCalendarService } from './googleCalendar.service.js'
import { googleMapsService } from './googleMaps.service.js'
import { calendarNotificationService } from './calendarNotification.service.js'

function formatTime12(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  if (isNaN(h)) return timeStr
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m || 0).padStart(2, '0')} ${ampm}`
}

function getWeekday(dateStr) {
  try {
    const d = new Date(`${dateStr}T00:00:00Z`)
    if (isNaN(d.getTime())) return 'Unknown'
    return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
  } catch {
    return 'Unknown'
  }
}

export const calendarService = {
  /**
   * List Events with full filters, recurrence expansion, and role permissions
   */
  async listEvents({ actor, year, month, viewMode = 'month', category = 'all', department = 'all', organizer = 'all', status = 'all', search = '', scope = 'all' }) {
    const canManage = Boolean(actor?.role && ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'].includes(actor.role.toLowerCase()))
    const isManager = Boolean(actor?.role && ['manager', 'team_leader', 'team_lead', 'vertical_head'].includes(actor.role.toLowerCase()))
    const actorId = String(actor?.id || actor?.employeeId || actor?._id || '')

    const query = { status: { $ne: 'cancelled' } }
    if (status && status !== 'all') {
      query.status = status
    }

    // Role-based visibility enforcement
    if (!canManage) {
      if (isManager && actor.department) {
        // Manager can see public events, events in their department, or events where they participate
        query.$or = [
          { visibility: 'public' },
          { department: actor.department },
          { department: 'All' },
          { ownerId: actorId },
          { 'organizer.employeeId': actorId },
          { 'participants.employeeId': actorId },
        ]
      } else {
        // Employee/Intern can see public events, department events, or where they participate
        query.$or = [
          { visibility: 'public' },
          { department: actor?.department || 'General' },
          { department: 'All' },
          { ownerId: actorId },
          { 'organizer.employeeId': actorId },
          { 'participants.employeeId': actorId },
        ]
      }
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }
    }

    // Department filter
    if (department && department !== 'all') {
      query.$and = query.$and || []
      query.$and.push({
        $or: [{ department }, { department: 'All' }, { applicableDepartments: department }],
      })
    }

    // Organizer filter
    if (organizer && organizer !== 'all') {
      query['organizer.employeeId'] = organizer
    }

    // Search query
    if (search && search.trim()) {
      const s = search.trim()
      query.$and = query.$and || []
      query.$and.push({
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { description: { $regex: s, $options: 'i' } },
          { 'location.name': { $regex: s, $options: 'i' } },
          { 'organizer.name': { $regex: s, $options: 'i' } },
        ],
      })
    }

    // Fetch matching events
    const rawEvents = await CalendarEvent.find(query).sort({ date: 1, startTime: 1 }).lean().catch(() => [])

    // Scope filter (My Calendar, Team Calendar, Company Calendar)
    let filteredEvents = rawEvents
    if (scope === 'my') {
      filteredEvents = rawEvents.filter((ev) =>
        ev.ownerId === actorId ||
        ev.organizer?.employeeId === actorId ||
        (ev.participants || []).some((p) => p.employeeId === actorId)
      )
    } else if (scope === 'team') {
      filteredEvents = rawEvents.filter((ev) =>
        ev.department === actor?.department ||
        (ev.applicableDepartments || []).includes(actor?.department)
      )
    } else if (scope === 'company') {
      filteredEvents = rawEvents.filter((ev) => ev.department === 'All' || ev.visibility === 'public')
    }

    // Process & expand recurring events within target year/month
    const results = []
    for (const ev of filteredEvents) {
      const eYear = parseInt(ev.date.slice(0, 4), 10)
      const eMonth = parseInt(ev.date.slice(5, 7), 10)

      // Check if recurring
      if (ev.recurrence?.pattern && ev.recurrence.pattern !== 'none') {
        const expanded = this.expandRecurringOccurrences(ev, year, month)
        results.push(...expanded)
      } else {
        // Standard single event
        if (year && eYear !== year) continue
        if (month && eMonth !== month) continue

        results.push(this.formatEventPayload(ev, actorId, canManage))
      }
    }

    return results.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
  },

  /**
   * Format clean event payload with RSVP details and permission flags
   */
  formatEventPayload(ev, actorId, canManage) {
    const isOwner = ev.ownerId === actorId || ev.organizer?.employeeId === actorId
    const selfParticipant = (ev.participants || []).find((p) => p.employeeId === actorId)
    const userRsvp = selfParticipant?.rsvpStatus || (isOwner ? 'accepted' : 'none')

    return {
      id: String(ev._id),
      entityId: String(ev._id),
      title: ev.title,
      name: ev.title,
      description: ev.description || '',
      category: ev.category,
      date: ev.date,
      startDate: ev.startDate || ev.date,
      endDate: ev.endDate || ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      startTime12: formatTime12(ev.startTime),
      endTime12: formatTime12(ev.endTime),
      allDay: Boolean(ev.allDay),
      day: getWeekday(ev.date),
      organizer: ev.organizer || { name: 'Edufyi HR' },
      participants: ev.participants || [],
      department: ev.department || 'All',
      applicableDepartments: ev.applicableDepartments || ['All'],
      location: ev.location || { name: 'Head Office' },
      meetingLink: ev.meetingLink || { url: '', provider: 'none' },
      priority: ev.priority || 'normal',
      visibility: ev.visibility || 'public',
      status: ev.status || 'scheduled',
      reminders: ev.reminders || [],
      recurrence: ev.recurrence || { pattern: 'none' },
      sourceType: ev.sourceType || 'manual',
      sourceId: ev.sourceId || null,
      userRsvp,
      canManage: canManage || isOwner,
      canEdit: canManage || isOwner,
      isOwner,
    }
  },

  /**
   * Expand recurring events for a specific year and month
   */
  expandRecurringOccurrences(ev, targetYear, targetMonth) {
    const occurrences = []
    const baseDate = new Date(`${ev.date}T00:00:00Z`)
    const pattern = ev.recurrence.pattern
    const interval = Math.max(1, Number(ev.recurrence.interval) || 1)
    const recurrenceEnd = ev.recurrence.endDate ? new Date(`${ev.recurrence.endDate}T23:59:59Z`) : null

    const startYear = targetYear || baseDate.getUTCFullYear()
    const monthsToProcess = targetMonth ? [targetMonth] : Array.from({ length: 12 }, (_, i) => i + 1)

    for (const m of monthsToProcess) {
      const daysInMonth = new Date(startYear, m, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const currDate = new Date(Date.UTC(startYear, m - 1, d))
        if (currDate < baseDate) continue
        if (recurrenceEnd && currDate > recurrenceEnd) continue

        let matches = false
        if (pattern === 'daily') {
          const diffDays = Math.floor((currDate - baseDate) / (1000 * 60 * 60 * 24))
          matches = diffDays % interval === 0
        } else if (pattern === 'weekly') {
          const daysOfWeek = ev.recurrence.daysOfWeek || [baseDate.getUTCDay()]
          matches = daysOfWeek.includes(currDate.getUTCDay())
        } else if (pattern === 'monthly') {
          matches = currDate.getUTCDate() === baseDate.getUTCDate()
        } else if (pattern === 'yearly') {
          matches = currDate.getUTCMonth() === baseDate.getUTCMonth() && currDate.getUTCDate() === baseDate.getUTCDate()
        }

        if (matches) {
          const dateStr = currDate.toISOString().slice(0, 10)
          const occId = `${ev._id}_occ_${dateStr}`
          occurrences.push({
            ...this.formatEventPayload(ev, null, false),
            id: occId,
            date: dateStr,
            startDate: dateStr,
            endDate: dateStr,
            day: getWeekday(dateStr),
            isRecurringInstance: true,
            seriesId: ev.recurrence.seriesId || String(ev._id),
          })
        }
      }
    }

    return occurrences
  },

  /**
   * Create Event with validation, Google Meet/Maps, and invitation dispatch
   */
  async createEvent({ eventData, actor, ip = '' }) {
    if (!eventData.title || !eventData.title.trim()) {
      const err = new Error('Event title is required.')
      err.statusCode = 400
      throw err
    }
    if (!eventData.date) {
      const err = new Error('Event date is required.')
      err.statusCode = 400
      throw err
    }

    const actorId = String(actor?.id || actor?.employeeId || actor?._id || 'SYSTEM')
    const actorName = actor?.displayName || actor?.name || 'Edufyi User'

    // Format location & Google Maps
    let locationObj = {
      name: eventData.locationName || eventData.location?.name || 'Head Office / Online',
      address: eventData.locationAddress || eventData.location?.address || '',
      formattedAddress: eventData.locationFormattedAddress || eventData.location?.formattedAddress || '',
      latitude: eventData.locationLatitude || eventData.location?.latitude || null,
      longitude: eventData.locationLongitude || eventData.location?.longitude || null,
      placeId: eventData.locationPlaceId || eventData.location?.placeId || null,
      mapsUrl: null,
      isPhysical: Boolean(eventData.isPhysicalLocation),
    }
    locationObj.mapsUrl = googleMapsService.generateMapsUrl(locationObj)

    // Format Video Meeting (Google Meet or Custom)
    let meetingLinkObj = {
      url: eventData.meetingUrl || eventData.meetingLink?.url || '',
      provider: eventData.meetingProvider || eventData.meetingLink?.provider || 'none',
      googleEventId: null,
      googleMeetCode: null,
      conferenceId: null,
      autoGenerated: false,
    }

    // If user clicked "Generate Google Meet"
    if (eventData.autoCreateMeet || meetingLinkObj.provider === 'google_meet' || (!meetingLinkObj.url && eventData.category?.includes('Meeting'))) {
      const meetDetails = await googleCalendarService.createGoogleMeetEvent({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        endDate: eventData.endDate || eventData.date,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        allDay: Boolean(eventData.allDay),
        timezone: eventData.timezone || 'Asia/Kolkata',
        participants: eventData.participants || [],
      })
      if (meetDetails) {
        meetingLinkObj = meetDetails
      }
    }

    // Series ID for recurrence
    let seriesId = null
    if (eventData.recurrence?.pattern && eventData.recurrence.pattern !== 'none') {
      seriesId = `series_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
    }

    // Build participants array with organizer included
    const participantsList = Array.isArray(eventData.participants) ? eventData.participants : []
    const organizerObj = {
      employeeId: actorId,
      name: actorName,
      email: actor?.email || '',
      department: actor?.department || 'General',
      avatarUrl: actor?.avatarUrl || null,
    }

    const newEvent = new CalendarEvent({
      title: eventData.title.trim(),
      description: eventData.description?.trim() || '',
      category: eventData.category || 'Company Meeting',
      date: eventData.date,
      startDate: eventData.startDate || eventData.date,
      endDate: eventData.endDate || eventData.date,
      startTime: eventData.startTime || null,
      endTime: eventData.endTime || null,
      allDay: Boolean(eventData.allDay),
      organizer: organizerObj,
      ownerId: actorId,
      createdBy: actorName,
      participants: participantsList,
      department: eventData.department || 'All',
      applicableDepartments: eventData.applicableDepartments || ['All'],
      location: locationObj,
      meetingLink: meetingLinkObj,
      priority: eventData.priority || 'normal',
      visibility: eventData.visibility || 'public',
      status: 'scheduled',
      reminders: eventData.reminders || [{ minutesBefore: 15, channel: 'both', sent: false }],
      recurrence: {
        pattern: eventData.recurrence?.pattern || 'none',
        interval: Number(eventData.recurrence?.interval) || 1,
        daysOfWeek: eventData.recurrence?.daysOfWeek || [],
        endDate: eventData.recurrence?.endDate || null,
        seriesId,
        isException: false,
      },
      timezone: eventData.timezone || 'Asia/Kolkata',
      sourceType: 'manual',
      auditHistory: [{
        action: 'CREATE_EVENT',
        actorId,
        actorName,
        timestamp: new Date(),
        details: `Created event "${eventData.title}" on ${eventData.date}`,
      }],
    })

    const saved = await newEvent.save()

    // 1. Audit log
    CalendarAuditLog.create({
      action: 'CREATE_EVENT',
      entityType: 'CalendarEvent',
      entityId: String(saved._id),
      actorId,
      actorName,
      actorRole: actor?.role || 'user',
      details: `Created event "${saved.title}" (${saved.category}) on ${saved.date}`,
      ip,
    }).catch(() => {})

    // 2. Schedule reminders
    calendarNotificationService.scheduleEventReminders(saved).catch(() => {})

    // 3. Dispatch invitations
    calendarNotificationService.sendInvitationNotifications({ event: saved, actor }).catch(() => {})

    return saved
  },

  /**
   * Update Event (support this occurrence, following occurrences, or entire series)
   */
  async updateEvent({ eventId, updates, actor, editScope = 'this', ip = '' }) {
    const event = await CalendarEvent.findById(eventId)
    if (!event) {
      const err = new Error('Calendar event not found.')
      err.statusCode = 404
      throw err
    }

    const actorId = String(actor?.id || actor?.employeeId || actor?._id || '')
    const canManage = Boolean(actor?.role && ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'].includes(actor.role.toLowerCase()))
    const isOwner = event.ownerId === actorId || event.organizer?.employeeId === actorId

    if (!canManage && !isOwner) {
      const err = new Error('You do not have permission to modify this event.')
      err.statusCode = 403
      throw err
    }

    const previousDate = event.date
    const previousTime = event.startTime

    // Handle Entire Series Update if recurring
    if (editScope === 'series' && event.recurrence?.seriesId) {
      await CalendarEvent.updateMany(
        { 'recurrence.seriesId': event.recurrence.seriesId },
        {
          $set: {
            title: updates.title || event.title,
            description: updates.description ?? event.description,
            category: updates.category || event.category,
            startTime: updates.startTime || event.startTime,
            endTime: updates.endTime || event.endTime,
            department: updates.department || event.department,
            priority: updates.priority || event.priority,
            location: updates.location || event.location,
            meetingLink: updates.meetingLink || event.meetingLink,
          },
        }
      )
    }

    // Update current document
    if (updates.title) event.title = updates.title.trim()
    if (updates.description !== undefined) event.description = updates.description.trim()
    if (updates.category) event.category = updates.category
    if (updates.date) event.date = updates.date
    if (updates.startDate) event.startDate = updates.startDate
    if (updates.endDate) event.endDate = updates.endDate
    if (updates.startTime !== undefined) event.startTime = updates.startTime
    if (updates.endTime !== undefined) event.endTime = updates.endTime
    if (updates.allDay !== undefined) event.allDay = Boolean(updates.allDay)
    if (updates.department) event.department = updates.department
    if (updates.priority) event.priority = updates.priority
    if (updates.visibility) event.visibility = updates.visibility
    if (updates.status) event.status = updates.status
    if (updates.participants) event.participants = updates.participants
    if (updates.reminders) event.reminders = updates.reminders

    if (updates.location) {
      event.location = {
        ...event.location,
        ...updates.location,
        mapsUrl: googleMapsService.generateMapsUrl(updates.location),
      }
    }
    if (updates.meetingLink) {
      event.meetingLink = { ...event.meetingLink, ...updates.meetingLink }
    }

    event.updatedBy = actor?.name || 'Edufyi User'
    event.auditHistory.push({
      action: 'UPDATE_EVENT',
      actorId,
      actorName: actor?.name,
      timestamp: new Date(),
      details: `Updated event details. Scope: ${editScope}`,
    })

    const updated = await event.save()

    // Reschedule reminders
    calendarNotificationService.scheduleEventReminders(updated).catch(() => {})

    // If rescheduled, notify participants
    if (updates.date && updates.date !== previousDate) {
      calendarNotificationService.sendRescheduleNotifications({
        event: updated,
        actor,
        previousDate,
        previousTime,
      }).catch(() => {})
    }

    return updated
  },

  /**
   * Respond to Meeting Invitation (RSVP: accept, decline, tentative)
   */
  async respondToInvitation({ eventId, actor, status, responseNote = '' }) {
    if (!['accepted', 'declined', 'tentative'].includes(status)) {
      const err = new Error('Invalid RSVP status. Must be accepted, declined, or tentative.')
      err.statusCode = 400
      throw err
    }

    const event = await CalendarEvent.findById(eventId)
    if (!event) {
      const err = new Error('Calendar event not found.')
      err.statusCode = 404
      throw err
    }

    const actorId = String(actor?.id || actor?.employeeId || actor?._id)
    const actorName = actor?.displayName || actor?.name || 'Staff'

    let participantIndex = (event.participants || []).findIndex((p) => p.employeeId === actorId)
    if (participantIndex === -1) {
      // Add as participant if self-responding
      event.participants.push({
        employeeId: actorId,
        name: actorName,
        email: actor?.email || '',
        department: actor?.department || 'General',
        rsvpStatus: status,
        respondedAt: new Date(),
        responseNote,
      })
    } else {
      event.participants[participantIndex].rsvpStatus = status
      event.participants[participantIndex].respondedAt = new Date()
      event.participants[participantIndex].responseNote = responseNote
    }

    // Upsert explicit CalendarInvitation document
    await CalendarInvitation.findOneAndUpdate(
      { eventId, employeeId: actorId },
      {
        eventId,
        employeeId: actorId,
        employeeName: actorName,
        employeeEmail: actor?.email || '',
        status,
        respondedAt: new Date(),
        responseNote,
      },
      { upsert: true }
    ).catch(() => {})

    await event.save()
    return { success: true, status, eventId, employeeId: actorId }
  },

  /**
   * Cancel or Delete Event
   */
  async deleteEvent({ eventId, actor, reason = '' }) {
    const event = await CalendarEvent.findById(eventId)
    if (!event) {
      const err = new Error('Event not found.')
      err.statusCode = 404
      throw err
    }

    const actorId = String(actor?.id || actor?.employeeId || actor?._id || '')
    const canManage = Boolean(actor?.role && ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'].includes(actor.role.toLowerCase()))
    const isOwner = event.ownerId === actorId || event.organizer?.employeeId === actorId

    if (!canManage && !isOwner) {
      const err = new Error('You do not have permission to delete this event.')
      err.statusCode = 403
      throw err
    }

    // Soft delete / cancel
    event.status = 'cancelled'
    event.cancellationReason = reason
    await event.save()

    // Cancel pending reminders
    calendarNotificationService.cancelEventReminders(eventId).catch(() => {})

    // Send cancellation emails & in-app alerts
    calendarNotificationService.sendCancellationNotifications({ event, actor, reason }).catch(() => {})

    // Clean Google Calendar if synced
    if (event.meetingLink?.googleEventId) {
      googleCalendarService.deleteGoogleEvent(event.meetingLink.googleEventId).catch(() => {})
    }

    return { success: true, message: 'Event successfully cancelled.' }
  },

  /**
   * Calendar Analytics & Insights
   */
  async getAnalytics({ actor }) {
    const todayStr = new Date().toISOString().slice(0, 10)
    const canManage = Boolean(actor?.role && ['admin', 'hr', 'director', 'managing_director'].includes(actor.role.toLowerCase()))
    const actorId = String(actor?.id || actor?.employeeId || actor?._id)

    const eventsToday = await CalendarEvent.find({
      date: todayStr,
      status: { $ne: 'cancelled' },
    }).lean().catch(() => [])

    const upcomingEvents = await CalendarEvent.find({
      date: { $gte: todayStr },
      status: { $ne: 'cancelled' },
    }).sort({ date: 1 }).limit(10).lean().catch(() => [])

    const pendingRsvps = await CalendarInvitation.countDocuments({
      employeeId: actorId,
      status: 'pending',
    }).catch(() => 0)

    const deadlines = await CalendarEvent.find({
      category: { $in: ['Project Deadline', 'Deadline', 'Compliance Deadline', 'Contract Expiry'] },
      date: { $gte: todayStr },
      status: { $ne: 'cancelled' },
    }).limit(5).lean().catch(() => [])

    return {
      todayMeetingsCount: eventsToday.filter((e) => e.category?.toLowerCase().includes('meeting')).length,
      todayTotalEvents: eventsToday.length,
      upcomingTotal: upcomingEvents.length,
      pendingRsvpsCount: pendingRsvps,
      activeDeadlinesCount: deadlines.length,
      upcomingDeadlines: deadlines.map((d) => ({ id: d._id, title: d.title, date: d.date, priority: d.priority })),
    }
  },
}
