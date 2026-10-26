import mongoose from 'mongoose'

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: String, required: true, trim: true, lowercase: true },
  allowance: { type: Number, required: true, min: 0 },
  used: { type: Number, default: 0, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  month: { type: String, trim: true }, // e.g. '2026-10'
  updatedAt: { type: Date, default: Date.now },
}, { strict: true })

leaveBalanceSchema.index({ employeeId: 1, leaveType: 1 }, { unique: true })

export const LeaveBalance = mongoose.models.LeaveBalance ?? mongoose.model('LeaveBalance', leaveBalanceSchema)
