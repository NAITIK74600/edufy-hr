import mongoose from 'mongoose'

const companySettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'primary' },
  companyName: { type: String, default: 'Elythra Edufyi Tech Solutions Pvt Ltd', trim: true },
  companyLegalName: { type: String, default: 'Elythra Edufyi Tech Solutions Pvt Ltd', trim: true },
  address: { type: String, default: 'Third Floor, 7 Hills, #424, 10th Cross, 27th Main, Sector 1, HSR Layout', trim: true },
  city: { type: String, default: 'Bengaluru', trim: true },
  state: { type: String, default: 'Karnataka', trim: true },
  country: { type: String, default: 'India', trim: true },
  pincode: { type: String, default: '560102', trim: true },
  phone: { type: String, default: '+91 80 4567 8900', trim: true },
  email: { type: String, default: 'hr@edufyitech.in', trim: true },
  website: { type: String, default: 'https://edufyitech.in', trim: true },
  taxId: { type: String, default: '29AABCE1234F1Z5', trim: true },
  currency: { type: String, default: 'INR', trim: true },
  currencySymbol: { type: String, default: '₹', trim: true },
  logoUrl: { type: String, default: '/elythra-edufyitech-logo.png', trim: true },
  primaryColor: { type: String, default: '#087E9E', trim: true },
  secondaryColor: { type: String, default: '#0B3155', trim: true },
  footerText: {
    type: String,
    default: 'This Computer generated document, No signature is required. This document contains confidential information.',
    trim: true,
  },
  maskBankAccount: { type: Boolean, default: true },
  defaultBranch: { type: String, default: 'Bengaluru HQ', trim: true },
  branchAddress: { type: String, default: '', trim: true },
  branchCity: { type: String, default: 'Bengaluru', trim: true },
  branches: { type: [String], default: [] },
  visibleFields: {
    type: [String],
    default: ['employeeCode', 'employeeName', 'location', 'designation', 'department', 'bankAccount', 'bankName', 'joinDate', 'dob', 'gender', 'pan', 'pfNo', 'uan'],
  },
}, { timestamps: true, strict: true })

export const CompanySettings = mongoose.models.CompanySettings ?? mongoose.model('CompanySettings', companySettingsSchema)
