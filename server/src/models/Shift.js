import mongoose from 'mongoose'

const shiftSchema = new mongoose.Schema({
  shiftId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  startTime: { type: String, required: true, trim: true }, // e.g. '11:00 AM'
  endTime: { type: String, required: true, trim: true },   // e.g. '08:00 PM'
  startMinutes: { type: Number, required: true },          // 660 (11 * 60)
  endMinutes: { type: Number, required: true },            // 1200 (20 * 60)
  isOvernight: { type: Boolean, default: false },
  gracePeriodMinutes: { type: Number, default: 15 },       // Grace ends at 11:15 AM
  halfDayCutoffMinutes: { type: Number, default: 720 },    // After 12:00 PM (720m) triggers half day
  earlyLogoutWindow: {
    startMinutes: { type: Number, default: 1110 },        // 18:30 (6:30 PM)
    endMinutes: { type: Number, default: 1180 },          // 19:40 (7:40 PM)
    startTime: { type: String, default: '06:30 PM' },
    endTime: { type: String, default: '07:40 PM' },
  },
  requiredCampusHours: { type: Number, default: 4 },       // 4 hours required for half-day verified presence
  isDefault: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  notes: { type: String, trim: true, default: '' },
}, { timestamps: true, strict: true })

export const Shift = mongoose.models.Shift ?? mongoose.model('Shift', shiftSchema)

