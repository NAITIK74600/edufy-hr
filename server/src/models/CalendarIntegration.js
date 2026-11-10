import mongoose from 'mongoose'
import { encryptToken, decryptToken } from '../utils/encryption.js'

const calendarIntegrationSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['google'], default: 'google', required: true, unique: true },
    isConnected: { type: Boolean, default: false, index: true },
    connectedBy: { type: String }, // Actor ID who connected
    connectedByName: { type: String },
    connectedAt: { type: Date },
    accountEmail: { type: String, trim: true },
    calendarId: { type: String, default: 'primary' },
    encryptedAccessToken: { type: String, default: null },
    encryptedRefreshToken: { type: String, default: null },
    tokenExpiry: { type: Date },
    scopes: { type: [String], default: [] },
    lastSyncAt: { type: Date },
    syncStatus: {
      type: String,
      enum: ['idle', 'syncing', 'active', 'error', 'revoked', 'disconnected'],
      default: 'disconnected',
    },
    lastError: { type: String, default: null },
    settings: {
      autoCreateMeetLinks: { type: Boolean, default: true },
      syncCompanyHolidays: { type: Boolean, default: true },
      syncMeetings: { type: Boolean, default: true },
      defaultTimezone: { type: String, default: 'Asia/Kolkata' },
    },
  },
  { timestamps: true }
)

calendarIntegrationSchema.virtual('accessToken').get(function () {
  return decryptToken(this.encryptedAccessToken)
})

calendarIntegrationSchema.virtual('refreshToken').get(function () {
  return decryptToken(this.encryptedRefreshToken)
})

calendarIntegrationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.encryptedAccessToken
    delete ret.encryptedRefreshToken
    delete ret.__v
    return ret
  },
})

export const CalendarIntegration =
  mongoose.models.CalendarIntegration ?? mongoose.model('CalendarIntegration', calendarIntegrationSchema)
