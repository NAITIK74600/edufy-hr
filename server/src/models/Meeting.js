import mongoose from 'mongoose'

const attendeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    department: { type: String, trim: true },
    isOrganizer: { type: Boolean, default: false },
    role: { type: String, enum: ['organizer', 'required', 'optional'], default: 'required' },
    rsvpStatus: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'tentative'],
      default: 'pending',
    },
    respondedAt: { type: Date, default: null },
    responseNote: { type: String, trim: true, default: '' },
  },
  { _id: false }
)

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: [
        'Company Meeting',
        'Department Meeting',
        'Individual Meeting',
        'Client Meeting',
        'Interview',
        'Training Session',
        'Performance Review',
        'Project Review',
        'Other',
      ],
      default: 'Company Meeting',
      index: true,
    },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm (24-hr)
    endTime: { type: String, required: true }, // HH:mm (24-hr)
    startDateTime: { type: Date, index: true }, // UTC representation for precise querying
    endDateTime: { type: Date, index: true },
    timezone: { type: String, default: 'Asia/Kolkata' },

    organizer: {
      employeeId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      department: { type: String, default: 'General' },
      avatarUrl: { type: String, default: null },
    },

    attendees: { type: [attendeeSchema], default: [] },

    location: {
      name: { type: String, default: 'Google Meet / Online' },
      address: { type: String, default: '' },
      formattedAddress: { type: String, default: '' },
    },

    // Google Calendar & Meet Integration details
    calendarId: { type: String, default: 'primary' },
    googleEventId: { type: String, default: null, index: { unique: true, sparse: true } },
    googleCalendarHtmlLink: { type: String, default: null },
    meetUrl: { type: String, default: null, trim: true },
    meetCode: { type: String, default: null, trim: true },
    conferenceId: { type: String, default: null },
    conferenceStatus: {
      type: String,
      enum: ['none', 'pending', 'confirmed', 'failed'],
      default: 'none',
      index: true,
    },
    conferenceError: { type: String, default: null },

    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
      index: true,
    },
    cancellationReason: { type: String, default: '' },

    createdBy: { type: String, required: true },
    updatedBy: { type: String },
    calendarEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'CalendarEvent', default: null },
  },
  { timestamps: true }
)

meetingSchema.index({ date: 1, status: 1 })
meetingSchema.index({ 'attendees.employeeId': 1 })
meetingSchema.index({ 'attendees.email': 1 })
meetingSchema.index({ 'organizer.employeeId': 1 })

export const Meeting = mongoose.models.Meeting ?? mongoose.model('Meeting', meetingSchema)

