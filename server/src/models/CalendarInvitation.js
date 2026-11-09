import mongoose from 'mongoose'

const calendarInvitationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'CalendarEvent', required: true, index: true },
  employeeId: { type: String, required: true, trim: true, index: true },
  employeeName: { type: String, required: true, trim: true },
  employeeEmail: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'tentative'],
    default: 'pending',
    index: true,
  },
  respondedAt: { type: Date, default: null },
  responseNote: { type: String, trim: true, maxlength: 500, default: '' },
  invitedBy: { type: String },
  role: { type: String, enum: ['organizer', 'required', 'optional'], default: 'required' },
  reminderPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    minutesBefore: { type: [Number], default: [15, 60] },
  },
}, { timestamps: true })

calendarInvitationSchema.index({ eventId: 1, employeeId: 1 }, { unique: true })

export const CalendarInvitation = mongoose.models.CalendarInvitation ?? mongoose.model('CalendarInvitation', calendarInvitationSchema)

