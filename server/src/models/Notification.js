import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, index: true },
  recipientId: { type: String, index: true, required: true },
  ownerId: { type: String, index: true },
  employeeId: { type: String, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['gps', 'network', 'attendance', 'hr', 'leave', 'task', 'payroll', 'announcement', 'system'],
    default: 'system',
    index: true,
  },
  eventType: { type: String, required: true, index: true },
  relatedEntityId: { type: String, default: null },
  targetUrl: { type: String, default: null },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  readAt: { type: Date, default: null },
  read: { type: Boolean, default: false, index: true },
  pushDeliveryStatus: {
    type: String,
    enum: ['pending', 'delivered', 'failed', 'unsubscribed', 'skipped'],
    default: 'pending',
  },
  idempotencyKey: { type: String, sparse: true, unique: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, strict: false })

export const Notification = mongoose.models.Notification ?? mongoose.model('Notification', notificationSchema)
