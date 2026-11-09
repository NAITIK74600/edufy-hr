import { calendarNotificationService } from './calendarNotification.service.js'
import { calendarSyncService } from './calendarSync.service.js'

let isReminderJobRunning = false
let reminderIntervalHandle = null

/**
 * Smart Calendar Background Daemon
 * 1. Checks every 60s for due meeting reminders and dispatches them with idempotency.
 * 2. Runs once per day (or on startup) an automated sync of employee birthdays, anniversaries, and holidays.
 */
export function startCalendarBackgroundDaemon() {
  if (reminderIntervalHandle) return

  // Run immediate startup sweep
  runReminderSweep().catch((err) => console.warn('[Calendar Reminder Startup Notice]:', err.message))

  // Run initial HR sync on server startup
  calendarSyncService.syncAllHREvents().catch((err) => console.warn('[Calendar HR Sync Startup Notice]:', err.message))

  // Set recurring 60s sweep
  reminderIntervalHandle = setInterval(() => {
    runReminderSweep().catch((err) => console.warn('[Calendar Reminder Daemon Notice]:', err.message))
  }, 60000)

  // Daily HR Lifecycle Sync (every 24 hours)
  setInterval(() => {
    calendarSyncService.syncAllHREvents().catch((err) => console.warn('[Calendar Daily HR Sync Notice]:', err.message))
  }, 24 * 60 * 60 * 1000)
}

async function runReminderSweep() {
  if (isReminderJobRunning) return
  isReminderJobRunning = true
  try {
    const sentCount = await calendarNotificationService.processDueReminders()
    if (sentCount > 0) {
      console.log(`[Smart Calendar] Dispatched ${sentCount} scheduled reminder(s).`)
    }
  } catch (err) {
    console.error('[Calendar Reminder Daemon Error]:', err.message)
  } finally {
    isReminderJobRunning = false
  }
}

export function stopCalendarBackgroundDaemon() {
  if (reminderIntervalHandle) {
    clearInterval(reminderIntervalHandle)
    reminderIntervalHandle = null
  }
}
