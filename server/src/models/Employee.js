import mongoose from 'mongoose'

const checklistItemSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  completedAt: Date,
  completedBy: { type: mongoose.Schema.Types.Mixed },
}, { _id: false })

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  fileKey: { type: String, required: true, select: false },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { _id: true })

const employmentHistorySchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  effectiveDate: { type: Date, required: true },
  details: { type: String, trim: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false })

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  displayName: { type: String, trim: true, maxlength: 120 },
  username: { type: String, trim: true, lowercase: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  authVersion: { type: Number, default: 0, select: false },
  mustChangePassword: { type: Boolean, default: false },
  role: { type: String, trim: true, default: 'employee' },
  avatarUrl: { type: String, trim: true, default: null },
  permissions: { type: [String], default: [] },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  department: { type: String, trim: true, maxlength: 100 },
  designation: { type: String, trim: true, maxlength: 120 },
  location: { type: String, trim: true, maxlength: 120 },
  phone: { type: String, trim: true, maxlength: 40 },
  salary: { type: Number, min: 0, default: 0 },
  salaryStructure: {
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    panTaxId: String,
    uanNumber: String,
  },
  emergencyContact: { name: String, relationship: String, phone: String },
  parentsContact: { fatherName: String, motherName: String, phone: String, parentPhone: String, address: String },
  identity: { aadharNumber: String, panNumber: String, passportNumber: String, uanNumber: String, hasExistingUan: Boolean },
  onboardingDocs: { type: mongoose.Schema.Types.Mixed, select: false },
  onboardingStatus: {
    type: String,
    enum: ['invited', 'draft', 'submitted', 'in_review', 'action_required', 'revision_requested', 'verified', 'completed'],
    default: 'invited',
    index: true,
  },
  onboardingSubmittedAt: Date,
  onboardingVerifiedAt: Date,
  onboardingVerifiedBy: { type: mongoose.Schema.Types.Mixed },
  onboardingNotes: { type: String, trim: true },
  onboardingRejectionReason: { type: String, trim: true },
  financeDetails: mongoose.Schema.Types.Mixed,
  policyConsents: mongoose.Schema.Types.Mixed,
  complianceDocs: mongoose.Schema.Types.Mixed,
  reportingManager: { type: String, trim: true },
  exitDetails: mongoose.Schema.Types.Mixed,
  employmentType: {
    type: String,
    enum: [
      'full_time',
      'part_time',
      'contractor',
      'intern',
      'Full-time',
      'Part-time',
      'Contractor',
      'Intern',
      'full-time',
      'part-time',
      'contract',
      'Contract',
      'Full Time',
      'Part Time',
    ],
    default: 'full_time',
    set: (val) => {
      if (!val) return 'full_time'
      const s = String(val).trim().toLowerCase().replace(/[-\s]/g, '_')
      if (s === 'contract') return 'contractor'
      return s
    },
  },
  joiningDate: { type: Date, required: true },
  employmentEndDate: Date,
  status: { type: String, enum: ['invited', 'active', 'inactive', 'onboarding', 'notice'], default: 'invited', index: true },
  documents: { type: [documentSchema], default: [] },
  onboardingChecklist: { type: [checklistItemSchema], default: [] },
  offboardingChecklist: { type: [checklistItemSchema], default: [] },
  employmentHistory: { type: [employmentHistorySchema], default: [] },
}, { timestamps: true, strict: true })

employeeSchema.index({ department: 1, status: 1 })
employeeSchema.index({ managerId: 1, status: 1 })
employeeSchema.index({ designation: 1, status: 1 })
employeeSchema.index({ name: 1 })

export const Employee = mongoose.models.Employee ?? mongoose.model('Employee', employeeSchema)
