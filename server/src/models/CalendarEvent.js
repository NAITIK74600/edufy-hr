import mongoose from 'mongoose'

const calendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 250 },
  description: { type: String, trim: true, maxlength: 5000 },
  date: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String }, // YYYY-MM-DD
  startTime: { type: String }, // e.g. "10:00"
  endTime: { type: String }, // e.g. "11:30"
  category: {
    type: String,
    enum: ['Meeting', 'Training', 'Announcement', 'Deadline', 'Department', 'Company', 'Celebration', 'Other'],
    default: 'Company',
  },
  location: { type: String, default: 'Head Office / Online' },
  department: { type: String, default: 'All' },
  applicableDepartments: { type: [String], default: ['All'] },
  organizer: { type: String },
  ownerId: { type: String, ref: 'Employee' },
  createdBy: { type: String },
  updatedBy: { type: String },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
}, { timestamps: true })

calendarEventSchema.index({ date: 1 })
calendarEventSchema.index({ department: 1 })

export const CalendarEvent = mongoose.models.CalendarEvent ?? mongoose.model('CalendarEvent', calendarEventSchema)

