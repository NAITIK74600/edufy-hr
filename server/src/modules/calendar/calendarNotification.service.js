import { CalendarReminder } from '../../models/CalendarReminder.js'
import { CalendarPreference } from '../../models/CalendarPreference.js'
import { createUnifiedNotification } from '../../services/unifiedNotification.service.js'
import { mailService } from '../../services/mail.service.js'

/**
 * Smart Calendar Notification & Reminder Service
 * Manages event invitations, reschedules, cancellations, and scheduled reminders.
 * Strictly guarantees idempotency, duplicate suppression, and user preference respect.
 */

export const calendarNotificationService = {
  /**
   * Schedule reminders for an event and all its participants
   */
  async scheduleEventReminders(event) {
    if (!event || !event._id || !event.date || event.status === 'cancelled') {
      return []
    }

    const eventId = event._id
    const eventDate = event.date
    const eventTime = event.startTime || '09:00'
    const eventTitle = event.title

    // Construct event start Date object
    const [year, month, day] = eventDate.split('-').map(Number)
    const [hours, minutes] = eventTime.split(':').map(Number)
    const startDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)
    if (isNaN(startDateTime.getTime())) return []

    // Cancel existing pending reminders for this event (handles rescheduling cleanly)
    await CalendarReminder.updateMany(
      { eventId, status: 'pending' },
      { $set: { status: 'cancelled' } }
    ).catch(() => {})

    // Collect all recipients: organizer + participants
    const recipients = []
    if (event.organizer?.employeeId) {
      recipients.push({
        employeeId: event.organizer.employeeId,
        name: event.organizer.name,
        email: event.organizer.email,
      })
    }
    for (const p of event.participants || []) {
      if (p.employeeId && !recipients.some((r) => r.employeeId === p.employeeId)) {
        recipients.push({
          employeeId: p.employeeId,
          name: p.name,
          email: p.email,
        })
      }
    }

    const remindersConfig = Array.isArray(event.reminders) && event.reminders.length > 0
      ? event.reminders
      : [{ minutesBefore: 15, channel: 'both' }]

    const createdReminders = []

    for (const recipient of recipients) {
      // Check user preferences if available
      const prefs = await CalendarPreference.findOne({ employeeId: recipient.employeeId }).lean().catch(() => null)
      if (prefs && prefs.enableInAppReminders === false && prefs.enableEmailReminders === false) {
        continue // User opted out of reminders
      }

      for (const rem of remindersConfig) {
        const minutesBefore = Number(rem.minutesBefore) || 15
        const scheduledFor = new Date(startDateTime.getTime() - minutesBefore * 60 * 1000)

        // If reminder time has already passed, skip
        if (scheduledFor.getTime() <= Date.now()) continue

        let channel = rem.channel || 'both'
        if (prefs) {
          if (!prefs.enableEmailReminders && channel === 'both') channel = 'in_app'
          if (!prefs.enableInAppReminders && channel === 'both') channel = 'email'
        }

        const idempotencyKey = `rem_${eventId}_${recipient.employeeId}_${minutesBefore}`

        try {
          const reminderDoc = await CalendarReminder.findOneAndUpdate(
            { idempotencyKey },
            {
              $setOnInsert: {
                eventId,
                eventTitle,
                employeeId: recipient.employeeId,
                recipientName: recipient.name,
                recipientEmail: recipient.email,
                scheduledFor,
                minutesBefore,
                channel,
                status: 'pending',
                idempotencyKey,
              },
            },
            { upsert: true, returnDocument: 'after' }
          )
          createdReminders.push(reminderDoc)
        } catch (err) {
          // Duplicate key safely ignored
        }
      }
    }

    return createdReminders
  },

  /**
   * Cancel pending reminders when an event is cancelled or deleted
   */
  async cancelEventReminders(eventId) {
    if (!eventId) return
    return CalendarReminder.updateMany(
      { eventId, status: 'pending' },
      { $set: { status: 'cancelled' } }
    ).catch(() => {})
  },

  /**
   * Notify participants of a new event invitation
   */
  async sendInvitationNotifications({ event, actor }) {
    if (!event || !Array.isArray(event.participants) || event.participants.length === 0) return

    for (const p of event.participants) {
      // Don't notify the actor who created the event
      if (actor?.id && (p.employeeId === actor.id || p.employeeId === actor.employeeId)) continue

      const title = `New Invitation: ${event.title}`
      const timeStr = event.allDay ? 'All Day' : `${event.startTime || '—'} to ${event.endTime || '—'}`
      const message = `${actor?.name || 'A team organizer'} invited you to "${event.title}" on ${event.date} (${timeStr}).`

      // 1. In-App Notification
      createUnifiedNotification({
        employeeId: p.employeeId,
        title,
        message,
        category: 'calendar',
        eventType: 'CALENDAR_INVITATION',
        relatedEntityId: String(event._id),
        targetUrl: `#/employee/holidays?view=agenda&eventId=${event._id}`,
        priority: event.priority === 'urgent' ? 'urgent' : 'high',
        idempotencyKey: `invite_${event._id}_${p.employeeId}`,
        metadata: {
          eventId: String(event._id),
          eventTitle: event.title,
          date: event.date,
          startTime: event.startTime,
          category: event.category,
        },
      }).catch((err) => console.warn('[Calendar In-App Notification Notice]:', err.message))

      // 2. Email Notification (if email available)
      if (p.email && p.email.includes('@')) {
        const meetBtnHtml = event.meetingLink?.url
          ? `<div style="margin: 16px 0;"><a href="${event.meetingLink.url}" style="background: #006E6F; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Join Video Meeting</a></div>`
          : ''
        const mapsBtnHtml = event.location?.mapsUrl
          ? `<div style="margin: 8px 0;"><a href="${event.location.mapsUrl}" style="color: #0284c7; text-decoration: none; font-weight: 600;">📍 Open Location in Google Maps (${event.location.formattedAddress || event.location.name})</a></div>`
          : ''

        mailService.sendGenericNotification({
          to: p.email,
          recipientName: p.name,
          subject: `Invitation: ${event.title} - ${event.date}`,
          title: `You are invited to ${event.title}`,
          message: `<p>You have been scheduled as a participant in the following event:</p>
            <ul style="line-height: 1.8; color: #334155;">
              <li><strong>Category:</strong> ${event.category}</li>
              <li><strong>Date:</strong> ${event.date}</li>
              <li><strong>Time:</strong> ${timeStr}</li>
              <li><strong>Organizer:</strong> ${event.organizer?.name || 'Edufyi HR'}</li>
              ${event.location?.name ? `<li><strong>Location:</strong> ${event.location.name}</li>` : ''}
            </ul>
            ${meetBtnHtml}
            ${mapsBtnHtml}
            <p style="color: #64748b; font-size: 13px;">Please log in to your Edufyi workspace to accept or decline this invitation.</p>`,
          actionLabel: 'View in HR Calendar',
          actionUrl: `https://edufyione.edufyitech.in/#/employee/holidays?view=agenda&eventId=${event._id}`,
        }).catch((err) => console.warn('[Calendar Invitation Email Notice]:', err.message))
      }
    }
  },

  /**
   * Notify participants when an event is rescheduled
   */
  async sendRescheduleNotifications({ event, actor, previousDate, previousTime }) {
    if (!event || !Array.isArray(event.participants) || event.participants.length === 0) return

    for (const p of event.participants) {
      if (actor?.id && (p.employeeId === actor.id || p.employeeId === actor.employeeId)) continue

      const title = `Rescheduled: ${event.title}`
      const newTime = event.allDay ? 'All Day' : `${event.startTime || '—'} to ${event.endTime || '—'}`
      const message = `"${event.title}" has been rescheduled to ${event.date} (${newTime}).`

      createUnifiedNotification({
        employeeId: p.employeeId,
        title,
        message,
        category: 'calendar',
        eventType: 'CALENDAR_RESCHEDULED',
        relatedEntityId: String(event._id),
        targetUrl: `#/employee/holidays?view=agenda&eventId=${event._id}`,
        priority: 'high',
        idempotencyKey: `resched_${event._id}_${p.employeeId}_${event.date}_${event.startTime}`,
      }).catch(() => {})

      if (p.email && p.email.includes('@')) {
        mailService.sendGenericNotification({
          to: p.email,
          recipientName: p.name,
          subject: `Rescheduled: ${event.title} is now on ${event.date}`,
          title: `Event Rescheduled: ${event.title}`,
          message: `<p>Please note that <strong>${event.title}</strong> has been rescheduled:</p>
            <p><strong>New Date & Time:</strong> ${event.date} at ${newTime}</p>
            ${previousDate ? `<p style="color: #64748b;">(Previously: ${previousDate} ${previousTime || ''})</p>` : ''}`,
          actionLabel: 'View Calendar',
          actionUrl: `https://edufyione.edufyitech.in/#/employee/holidays?view=agenda&eventId=${event._id}`,
        }).catch(() => {})
      }
    }
  },

  /**
   * Notify participants when an event is cancelled
   */
  async sendCancellationNotifications({ event, actor, reason = '' }) {
    if (!event || !Array.isArray(event.participants) || event.participants.length === 0) return

    for (const p of event.participants) {
      if (actor?.id && (p.employeeId === actor.id || p.employeeId === actor.employeeId)) continue

      const title = `Cancelled: ${event.title}`
      const message = `"${event.title}" scheduled for ${event.date} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`

      createUnifiedNotification({
        employeeId: p.employeeId,
        title,
        message,
        category: 'calendar',
        eventType: 'CALENDAR_CANCELLED',
        relatedEntityId: String(event._id),
        targetUrl: '#/employee/holidays',
        priority: 'high',
        idempotencyKey: `cancel_${event._id}_${p.employeeId}`,
      }).catch(() => {})

      if (p.email && p.email.includes('@')) {
        mailService.sendGenericNotification({
          to: p.email,
          recipientName: p.name,
          subject: `Cancelled: ${event.title} (${event.date})`,
          title: `Event Cancelled: ${event.title}`,
          message: `<p><strong>${event.title}</strong> originally scheduled on ${event.date} has been cancelled by ${actor?.name || 'the organizer'}.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}`,
          actionLabel: 'Go to Calendar',
          actionUrl: 'https://edufyione.edufyitech.in/#/employee/holidays',
        }).catch(() => {})
      }
    }
  },

  /**
   * Process pending reminders due for delivery
   */
  async processDueReminders() {
    const now = new Date()
    const dueReminders = await CalendarReminder.find({
      status: 'pending',
      scheduledFor: { $lte: now },
    }).limit(100).lean().catch(() => [])

    let sentCount = 0

    for (const rem of dueReminders) {
      try {
        const timeText = rem.minutesBefore >= 60 ? `${Math.round(rem.minutesBefore / 60)} hour(s)` : `${rem.minutesBefore} minutes`

        if (rem.channel === 'in_app' || rem.channel === 'both') {
          await createUnifiedNotification({
            employeeId: rem.employeeId,
            title: `Reminder: ${rem.eventTitle}`,
            message: `Starting in ${timeText}: "${rem.eventTitle}".`,
            category: 'calendar',
            eventType: 'CALENDAR_REMINDER',
            relatedEntityId: String(rem.eventId),
            targetUrl: `#/employee/holidays?view=agenda&eventId=${rem.eventId}`,
            priority: 'urgent',
            idempotencyKey: `deliver_${rem.idempotencyKey}`,
          })
        }

        if ((rem.channel === 'email' || rem.channel === 'both') && rem.recipientEmail && rem.recipientEmail.includes('@')) {
          await mailService.sendGenericNotification({
            to: rem.recipientEmail,
            recipientName: rem.recipientName,
            subject: `Reminder: ${rem.eventTitle} starts in ${timeText}`,
            title: `Upcoming Event Reminder`,
            message: `<p>This is a quick reminder that <strong>${rem.eventTitle}</strong> is starting in <strong>${timeText}</strong>.</p>`,
            actionLabel: 'Open in Calendar',
            actionUrl: `https://edufyione.edufyitech.in/#/employee/holidays?view=agenda&eventId=${rem.eventId}`,
          })
        }

        await CalendarReminder.findByIdAndUpdate(rem._id, {
          $set: { status: 'sent', sentAt: new Date() },
        })
        sentCount++
      } catch (err) {
        await CalendarReminder.findByIdAndUpdate(rem._id, {
          $set: { status: 'failed', error: err.message },
          $inc: { retryCount: 1 },
        })
      }
    }

    return sentCount
  },
}
