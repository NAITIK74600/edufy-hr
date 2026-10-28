import mongoose from 'mongoose'

const shiftAssignmentSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, uppercase: true, trim: true, index: true },
  shiftId: { type: String, required: true, uppercase: true, trim: true, index: true },
  effectiveFrom: { type: String, required: true, trim: true, index: true }, // 'YYYY-MM-DD'
  effectiveTo: { type: String, default: null, trim: true, index: true },    // 'YYYY-MM-DD' or null for current/ongoing
  assignedBy: { type: String, default: 'SYSTEM', trim: true },
  assignedAt: { type: Date, default: Date.now },
  reason: { type: String, trim: true, default: '' },
  history: [
    {
      shiftId: { type: String, required: true, uppercase: true },
      effectiveFrom: { type: String, required: true },
      effectiveTo: { type: String, default: null },
      assignedBy: { type: String },
      assignedAt: { type: Date, default: Date.now },
      reason: { type: String },
    },
  ],
}, { timestamps: true, strict: true })

shiftAssignmentSchema.index({ employeeId: 1, effectiveFrom: 1 })

export const ShiftAssignment = mongoose.models.ShiftAssignment ?? mongoose.model('ShiftAssignment', shiftAssignmentSchema)

