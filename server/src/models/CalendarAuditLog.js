import mongoose from 'mongoose'

const calendarAuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // 'CREATE_HOLIDAY', 'UPDATE_HOLIDAY', 'DELETE_HOLIDAY', 'DUPLICATE_HOLIDAY', 'BULK_IMPORT_HOLIDAYS', 'CREATE_EVENT'
  entityType: { type: String, default: 'Holiday' },
  entityId: { type: String },
  actorId: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  details: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
}, { timestamps: true })

calendarAuditLogSchema.index({ createdAt: -1 })
calendarAuditLogSchema.index({ entityId: 1 })

export const CalendarAuditLog = mongoose.models.CalendarAuditLog ?? mongoose.model('CalendarAuditLog', calendarAuditLogSchema)

