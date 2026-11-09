import mongoose from 'mongoose'

const calendarReminderSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'CalendarEvent', required: true, index: true },
  eventTitle: { type: String, required: true },
  employeeId: { type: String, required: true, index: true },
  recipientEmail: { type: String, trim: true },
  recipientName: { type: String },
  scheduledFor: { type: Date, required: true, index: true },
  minutesBefore: { type: Number, required: true },
  channel: { type: String, enum: ['in_app', 'email', 'both'], default: 'both' },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  sentAt: { type: Date, default: null },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  retryCount: { type: Number, default: 0 },
  error: { type: String, default: null },
}, { timestamps: true })

calendarReminderSchema.index({ status: 1, scheduledFor: 1 })

export const CalendarReminder = mongoose.models.CalendarReminder ?? mongoose.model('CalendarReminder', calendarReminderSchema)

