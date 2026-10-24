import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  event: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest', required: true },
  message: { type: String, required: true, trim: true },
  readAt: Date,
}, { timestamps: true, strict: true })

export const Notification = mongoose.models.Notification ?? mongoose.model('Notification', notificationSchema)
