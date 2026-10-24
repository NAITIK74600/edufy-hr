import mongoose from 'mongoose'

const attendanceRecordSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, trim: true, uppercase: true, index: true },
  employeeName: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  date: { type: String, required: true, trim: true, index: true }, // YYYY-MM-DD
  checkIn: { type: String, trim: true },
  checkInAt: { type: Date },
  checkOut: { type: String, trim: true, default: null },
  checkOutAt: { type: Date },
  status: { type: String, enum: ['present', 'late', 'half-day', 'absent', 'on-leave'], default: 'present' },
  shift: { type: String, trim: true, default: 'General (09:30 AM – 06:30 PM)' },
  shiftCode: { type: String, trim: true, default: 'general' },
  isOnBreak: { type: Boolean, default: false },
  currentBreak: {
    type: { type: String, default: null }, // 'lunch', 'tea', 'other'
    startTime: { type: String, default: null },
    startAt: { type: Date, default: null },
  },
  breaks: [
    {
      type: { type: String, default: 'lunch' },
      startTime: { type: String },
      startAt: { type: Date },
      endTime: { type: String },
      endAt: { type: Date },
      durationMinutes: { type: Number, default: 0 },
    },
  ],
  totalBreakMinutes: { type: Number, default: 0 },
  wifiSSID: { type: String, trim: true, default: '' },
  bssid: { type: String, trim: true, default: '', uppercase: true },
  wifiVerified: { type: Boolean, default: false },
  clientIp: { type: String, trim: true, default: '' },
  ipVerified: { type: Boolean, default: false },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  accuracy: { type: Number, default: null },
  distanceMeters: { type: Number, default: null },
  gpsVerified: { type: Boolean, default: false },
  locationName: { type: String, trim: true, default: '' },
  verificationMethod: {
    type: String,
    enum: ['wifi_and_gps', 'gps_geofence', 'wifi_trusted', 'wifi_only', 'ip_verified', 'remote'],
    default: 'remote',
  },
  totalHours: { type: String, default: 'Active (Live)' },
  notes: { type: String, trim: true, default: '' },
}, { timestamps: true, strict: true })

attendanceRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true })
attendanceRecordSchema.index({ date: 1, status: 1 })

export const AttendanceRecord = mongoose.models.AttendanceRecord ?? mongoose.model('AttendanceRecord', attendanceRecordSchema)
