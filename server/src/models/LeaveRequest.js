import mongoose from 'mongoose'

const approvalHistorySchema = new mongoose.Schema({
  action: { type: String, enum: ['submitted', 'commented', 'approved', 'rejected', 'cancelled', 'amended'], required: true },
  fromStatus: String,
  toStatus: String,
  actorId: { type: String, required: true },
  actorRole: String,
  comment: { type: String, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
}, { _id: true })

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  tlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  leaveType: { type: String, required: true, trim: true, lowercase: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  units: { type: Number, required: true, min: 0 },
  paidUnits: { type: Number, default: 0 },
  casualLeaveUnits: { type: Number, default: 0 },
  sickLeaveUnits: { type: Number, default: 0 },
  normalLopUnits: { type: Number, default: 0 },
  doubleLopUnits: { type: Number, default: 0 },
  dayBreakdown: [{
    date: { type: String, required: true },
    dayOfWeek: Number,
    isWorkingDay: Boolean,
    leaveCategory: { type: String, enum: ['casual', 'sick', 'other_paid', 'normal_lop', 'double_lop', 'holiday', 'weekend'] },
    isPaid: Boolean,
    isDoubleLop: Boolean,
    units: Number,
    deductionMultiplier: Number,
  }],
  policySnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  isHalfDay: { type: Boolean, default: false },
  halfDayPeriod: { type: String, enum: ['first_half', 'second_half', null], default: null },
  isDoubleLop: { type: Boolean, default: false },
  doubleLopDays: { type: Number, default: 0 },
  reason: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved', 'rejected', 'cancelled'], required: true, index: true },
  managerDecisionAt: Date,
  hrDecisionAt: Date,
  adminDecisionAt: Date,
  adminApprovedBy: String,
  decisionReason: { type: String, trim: true, maxlength: 2000 },
  comments: [{ actorId: String, actorRole: String, body: { type: String, trim: true, maxlength: 2000 }, createdAt: { type: Date, default: Date.now } }],
  approvalHistory: { type: [approvalHistorySchema], default: [] },
}, { timestamps: true, strict: true })

leaveRequestSchema.index({ employeeId: 1, startDate: 1, endDate: 1, status: 1 })
leaveRequestSchema.index({ managerId: 1, status: 1 })
leaveRequestSchema.index({ status: 1, startDate: 1 })

export const LeaveRequest = mongoose.models.LeaveRequest ?? mongoose.model('LeaveRequest', leaveRequestSchema)
