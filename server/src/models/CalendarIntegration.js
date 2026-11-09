import mongoose from 'mongoose'

const calendarIntegrationSchema = new mongoose.Schema({
  provider: { type: String, enum: ['google'], default: 'google', required: true, unique: true },
  isConnected: { type: Boolean, default: false },
  connectedBy: { type: String }, // Actor ID who connected
  connectedByName: { type: String },
  connectedAt: { type: Date },
  accountEmail: { type: String, trim: true },
  calendarId: { type: String, default: 'primary' },
  accessToken: { type: String },
  refreshToken: { type: String },
  tokenExpiry: { type: Date },
  scopes: { type: [String], default: [] },
  lastSyncAt: { type: Date },
  syncStatus: { type: String, enum: ['idle', 'syncing', 'active', 'error', 'disconnected'], default: 'disconnected' },
  lastError: { type: String, default: null },
  settings: {
    autoCreateMeetLinks: { type: Boolean, default: true },
    syncCompanyHolidays: { type: Boolean, default: true },
    syncMeetings: { type: Boolean, default: true },
  },
}, { timestamps: true })

export const CalendarIntegration = mongoose.models.CalendarIntegration ?? mongoose.model('CalendarIntegration', calendarIntegrationSchema)

