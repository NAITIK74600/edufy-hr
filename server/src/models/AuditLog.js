import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  actorId: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true, trim: true },
  entityType: { type: String, required: true, trim: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  changedFields: { type: [String], default: [] },
  reason: { type: String, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false })

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })

export const AuditLog = mongoose.models.AuditLog ?? mongoose.model('AuditLog', auditLogSchema)
