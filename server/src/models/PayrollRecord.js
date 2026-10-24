import mongoose from 'mongoose'

const money = () => ({ type: Number, min: 0, default: 0, validate: Number.isFinite })

const earningItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  monthlyRate: { type: Number, default: 0, min: 0 },
  currentMonth: { type: Number, default: 0, min: 0 },
  arrear: { type: Number, default: 0 },
  total: { type: Number, default: 0, min: 0 },
}, { _id: false })

const deductionItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, default: 0, min: 0 },
}, { _id: false })

const payrollSchema = new mongoose.Schema({
  employeeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  month: { type: String, required: true },
  workingDays: { type: Number, min: 0, max: 31, required: true },
  paidDays: { type: Number, min: 0, max: 31, required: true },
  lopDays: { type: Number, min: 0, max: 31, default: 0 },
  standardDays: { type: Number, min: 0, max: 31, default: 30 },
  payableDays: { type: Number, min: 0, max: 31, default: 30 },
  lopReversalDays: { type: Number, min: 0, max: 31, default: 0 },
  arrearDays: { type: Number, min: 0, max: 31, default: 0 },
  earnings: {
    basic: money(), hra: money(), specialAllowance: money(), conveyance: money(),
    medicalAllowance: money(), performanceBonus: money(), overtime: money(),
    otherAllowance: money(), otherAllowances: money(),
  },
  deductions: {
    pf: money(), esi: money(), professionalTax: money(), tdsTax: money(),
    loanAdvance: money(), lossOfPay: money(), performanceDeduction: money(), otherDeductions: money(),
  },
  earningsList: { type: [earningItemSchema], default: [] },
  deductionsList: { type: [deductionItemSchema], default: [] },
  grossEarnings: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netPay: { type: Number, default: 0 },
  netPayInWords: { type: String, default: '' },
  paymentDate: { type: String },
  branch: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  ifscCode: { type: String, trim: true },
  panTaxId: { type: String, trim: true },
  uanNumber: { type: String, trim: true },
  emailSentAt: { type: Date },
  status: { type: String, enum: ['draft', 'processed'], default: 'draft' },
  reviewed: { type: Boolean, default: false },
  reviewedBy: String,
  finalizedAt: Date,
  notes: { type: String, maxlength: 2000 },
}, { timestamps: true, strict: true })

payrollSchema.index({ employeeRef: 1, month: 1 }, { unique: true })
export const PayrollRecord = mongoose.models.PayrollRecord ?? mongoose.model('PayrollRecord', payrollSchema)
