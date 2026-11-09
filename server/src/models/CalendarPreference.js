import mongoose from 'mongoose'

const calendarPreferenceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, index: true },
  defaultView: { type: String, enum: ['month', 'week', 'day', 'agenda', 'upcoming'], default: 'month' },
  enableInAppReminders: { type: Boolean, default: true },
  enableEmailReminders: { type: Boolean, default: true },
  enableBrowserNotifications: { type: Boolean, default: true },
  dailyDigestEnabled: { type: Boolean, default: true },
  weeklySummaryEnabled: { type: Boolean, default: true },
  birthdayAnnouncements: { type: Boolean, default: true },
  anniversaryAnnouncements: { type: Boolean, default: true },
  reminderMinutesBefore: { type: [Number], default: [15, 60] },
  timeZone: { type: String, default: 'Asia/Kolkata' },
  workingHoursStart: { type: String, default: '09:00' },
  workingHoursEnd: { type: String, default: '18:00' },
}, { timestamps: true })

export const CalendarPreference = mongoose.models.CalendarPreference ?? mongoose.model('CalendarPreference', calendarPreferenceSchema)

