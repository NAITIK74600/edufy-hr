import mongoose from 'mongoose'

const pushSubscriptionSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, index: true },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  userAgent: { type: String, default: null },
  platform: { type: String, default: 'web' },
  deviceType: { type: String, enum: ['android', 'ios', 'desktop', 'web'], default: 'web' },
  active: { type: Boolean, default: true, index: true },
  preferences: {
    gps: { type: Boolean, default: true },
    network: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    leave: { type: Boolean, default: true },
    tasks: { type: Boolean, default: true },
    payroll: { type: Boolean, default: true },
    hr: { type: Boolean, default: true },
  },
  lastUsedAt: { type: Date, default: Date.now },
}, { timestamps: true })

export const PushSubscription = mongoose.models.PushSubscription ?? mongoose.model('PushSubscription', pushSubscriptionSchema)

