import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'office' },
  officeNetworkIPs: [{ ip: { type: String, required: true }, label: String, addedAt: String }],
  locations: [{ id: String, name: { type: String, required: true }, city: String, lat: { type: Number, min: -90, max: 90 }, lng: { type: Number, min: -180, max: 180 }, radiusMeters: { type: Number, min: 1, max: 1000 }, allowedIPs: [String] }],
  allowedWifiSSIDs: [String],
  wifiNetworks: [{ ssid: String, bssid: String, securityType: String, branchName: String, allowedIPs: [String] }],
  attendanceRules: { workStartTime: String, workEndTime: String, gracePeriodMinutes: { type: Number, min: 0, max: 120 }, maxGeofenceRadiusMeters: { type: Number, min: 1, max: 1000 }, strictGeofenceRequired: Boolean, requireOfficeNetworkAndGps: { type: Boolean, default: true } },
  leavePolicies: {
    casualQuota: { type: Number, default: 12 },
    sickQuota: { type: Number, default: 10 },
    earnedQuota: { type: Number, default: 15 },
    compOffQuota: { type: Number, default: 2 },
    maxCarryForwardDays: { type: Number, default: 8 },
    requireManagerApproval: { type: Boolean, default: true },
    requireHrApproval: { type: Boolean, default: true },
    approvalWorkflow: { type: String, default: 'manager_hr' },
  },
  holidayCalendarImages: [{
    id: String,
    url: String,
    title: String,
    uploadedAt: String,
    uploadedBy: String,
  }],
}, { timestamps: true, strict: false })
export const AttendanceSettings = mongoose.models.AttendanceSettings ?? mongoose.model('AttendanceSettings', settingsSchema)
