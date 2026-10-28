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
  status: { type: String, enum: ['present', 'late', 'half-day', 'short-hours', 'early-logout', 'lop', 'absent', 'on-leave'], default: 'present' },
  isEarlyLogout: { type: Boolean, default: false },
  isLop: { type: Boolean, default: false },
  isDoubleLop: { type: Boolean, default: false },
  doubleLopStatus: { type: String, enum: ['none', 'pending_approval', 'approved', 'rejected'], default: 'none' },
  doubleLopApprovedBy: { type: String, default: null },
  doubleLopApprovedAt: { type: Date, default: null },
  doubleLopReason: { type: String, default: null },
  isLate: { type: Boolean, default: false },
  isHalfDay: { type: Boolean, default: false },
  lateCount: { type: Number, default: 0 },
  earlyLogoutCount: { type: Number, default: 0 },
  offCampusDurationMinutes: { type: Number, default: 0 },
  verifiedCampusMinutes: { type: Number, default: 0 },
  policyEvaluation: { type: mongoose.Schema.Types.Mixed, default: null },
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
    enum: [
      'wifi_and_gps',
      'gps_geofence',
      'office_network',
      'wifi_trusted',
      'wifi_only',
      'wifi_metadata_only',
      'ip_verified',
      'remote',
    ],
    default: 'remote',
  },
  totalHours: { type: String, default: 'Active (Live)' },
  notes: { type: String, trim: true, default: '' },
  autoPunchOut: { type: Boolean, default: false },
  punchOutReason: { type: String, trim: true, default: '' },
  punchOutType: { type: String, trim: true, default: 'manual' }, // 'manual' | 'auto'
  lastConnectedAt: { type: Date, default: null },
  disconnectedSince: { type: Date, default: null },
}, { timestamps: true, strict: true })

attendanceRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true })
attendanceRecordSchema.index({ date: 1, status: 1 })

export const AttendanceRecord = mongoose.models.AttendanceRecord ?? mongoose.model('AttendanceRecord', attendanceRecordSchema)
