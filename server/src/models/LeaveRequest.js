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
  reason: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'approved', 'rejected', 'cancelled'], required: true, index: true },
  managerDecisionAt: Date,
  hrDecisionAt: Date,
  decisionReason: { type: String, trim: true, maxlength: 2000 },
  comments: [{ actorId: String, actorRole: String, body: { type: String, trim: true, maxlength: 2000 }, createdAt: { type: Date, default: Date.now } }],
  approvalHistory: { type: [approvalHistorySchema], default: [] },
}, { timestamps: true, strict: true })

leaveRequestSchema.index({ employeeId: 1, startDate: 1, endDate: 1, status: 1 })
leaveRequestSchema.index({ managerId: 1, status: 1 })
leaveRequestSchema.index({ status: 1, startDate: 1 })

export const LeaveRequest = mongoose.models.LeaveRequest ?? mongoose.model('LeaveRequest', leaveRequestSchema)
