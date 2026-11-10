import mongoose from 'mongoose'
import { encryptToken, decryptToken } from '../utils/encryption.js'

const googleIntegrationSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'default_org', index: true },
    userId: { type: String, index: true }, // Optional for delegated per-user connections
    accountEmail: { type: String, trim: true, required: true },
    calendarId: { type: String, default: 'primary' },
    encryptedAccessToken: { type: String, default: null },
    encryptedRefreshToken: { type: String, default: null },
    tokenExpiry: { type: Date },
    scopes: { type: [String], default: [] },
    isConnected: { type: Boolean, default: true, index: true },
    connectionStatus: {
      type: String,
      enum: ['active', 'expired', 'error', 'revoked', 'disconnected'],
      default: 'active',
      index: true,
    },
    lastSyncAt: { type: Date, default: Date.now },
    lastError: { type: String, default: null },
    connectedBy: { type: String }, // Actor ID
    connectedByName: { type: String },
    settings: {
      autoCreateMeetLinks: { type: Boolean, default: true },
      syncCompanyHolidays: { type: Boolean, default: true },
      sendGoogleInvitations: { type: Boolean, default: true },
      defaultTimezone: { type: String, default: 'Asia/Kolkata' },
    },
  },
  { timestamps: true }
)

// Virtual getters for decrypted tokens in server-side services (never serialized to JSON)
googleIntegrationSchema.virtual('accessToken').get(function () {
  return decryptToken(this.encryptedAccessToken)
})

googleIntegrationSchema.virtual('refreshToken').get(function () {
  return decryptToken(this.encryptedRefreshToken)
})

// Safe JSON transform: Never expose tokens or secrets to client
googleIntegrationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.encryptedAccessToken
    delete ret.encryptedRefreshToken
    delete ret.__v
    return ret
  },
})

export const GoogleIntegration =
  mongoose.models.GoogleIntegration ?? mongoose.model('GoogleIntegration', googleIntegrationSchema)
