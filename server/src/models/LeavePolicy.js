import mongoose from 'mongoose'

const leavePolicySchema = new mongoose.Schema({
  leaveType: { type: String, required: true, unique: true, trim: true, lowercase: true },
  label: { type: String, required: true, trim: true },
  configured: { type: Boolean, default: false },
  unit: { type: String, enum: ['days', 'hours'], default: 'days' },
  approvalStage: { type: String, enum: ['hr', 'manager', 'manager_hr'], default: 'manager_hr' },
  countWeekends: { type: Boolean, default: false },
  countHolidays: { type: Boolean, default: false },
  holidayDates: { type: [Date], default: [] },
  carryForward: { type: Boolean, default: false },
  annualAllowance: { type: Number, min: 0 },
  requiresReason: { type: Boolean, default: true },
  allowCancellationAfterApproval: { type: Boolean, default: false },
  allowAmendment: { type: Boolean, default: false },
  updatedBy: String,
}, { timestamps: true, strict: true })

export const LeavePolicy = mongoose.models.LeavePolicy ?? mongoose.model('LeavePolicy', leavePolicySchema)
