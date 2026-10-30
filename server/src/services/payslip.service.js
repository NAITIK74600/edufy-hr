import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { numberToWordsINR } from '../utils/numberToWords.js'
import { CompanySettings } from '../models/CompanySettings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templateHtmlPath = path.resolve(__dirname, '../templates/payslip.html')
const templateCssPath = path.resolve(__dirname, '../templates/payslip.css')

export function formatINR(val) {
  const num = Math.round(Number(val) || 0)
  return num.toLocaleString('en-IN')
}

export function maskAccount(accNumber) {
  if (!accNumber) return 'N/A'
  const str = String(accNumber).trim()
  if (str.length <= 4) return str
  return '●●●●●●●●' + str.slice(-4)
}

export const DEFAULT_COMPANY_SETTINGS = {
  companyName: 'Elythra Edufyi Tech Solutions Pvt Ltd',
  companyLegalName: 'Elythra Edufyi Tech Solutions Pvt Ltd',
  address: 'Third Floor, 7 Hills, #424, 10th Cross, 27th Main, Sector 1, HSR Layout, Bengaluru, Karnataka 560102',
  city: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
  pincode: '560102',
  phone: '+91 80 4567 8900',
  email: 'hr@edufyitech.in',
  website: 'https://edufyitech.in',
  taxId: '29AABCE1234F1Z5',
  currency: 'INR',
  currencySymbol: '₹',
  logoUrl: '/elythra-edufyitech-logo.png',
  primaryColor: '#087E9E',
  secondaryColor: '#0B3155',
  footerText: 'This Computer generated document, No signature is required. This document contains confidential information.',
  maskBankAccount: false,
  defaultBranch: 'Bengaluru HQ',
}

export async function getCompanySettings() {
  try {
    const doc = await CompanySettings.findOne({ key: 'primary' }).lean()
    if (doc) return { ...DEFAULT_COMPANY_SETTINGS, ...doc }
  } catch {}
  return { ...DEFAULT_COMPANY_SETTINGS }
}

export function normalizePayrollData(record = {}, employee = {}, settings = DEFAULT_COMPANY_SETTINGS) {
  const safeRecord = record || {}
  const safeSettings = settings || DEFAULT_COMPANY_SETTINGS
  const emp = (safeRecord.employeeRef && typeof safeRecord.employeeRef === 'object' ? safeRecord.employeeRef : null)
    || (employee && typeof employee === 'object' ? employee : null)
    || {}

  // Employee details
  const employeeCode = safeRecord.employeeId || emp.employeeId || 'N/A'
  const employeeName = emp.name || safeRecord.employeeName || 'N/A'
  const location = safeRecord.location || safeRecord.branch || emp.location || emp.branch || safeSettings.defaultBranch || 'Bengaluru HQ'
  const designation = emp.designation || 'Associate'
  const department = emp.department || 'Operations'

  const rawAccount = safeRecord.accountNumber || emp.bankDetails?.accountNumber || emp.bankAccount || emp.accountNumber || ''
  const maskedBankAccount = safeSettings.maskBankAccount ? maskAccount(rawAccount) : (rawAccount || 'N/A')
  const bankName = safeRecord.bankName || emp.bankDetails?.bankName || emp.bankName || 'HDFC BANK LIMITED'

  const joinDate = emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-GB') : '01/04/2022'
  const dob = emp.dob ? new Date(emp.dob).toLocaleDateString('en-GB') : (emp.identity?.dob ? new Date(emp.identity.dob).toLocaleDateString('en-GB') : '24/02/1999')
  const gender = emp.gender || (emp.identity?.gender || 'M')
  const pan = record.panTaxId || emp.identity?.panNumber || emp.bankDetails?.panTaxId || emp.panTaxId || 'BROPJ5764Q'
  const pfNo = emp.identity?.pfNumber || emp.pfNumber || 'PYKRP00531710000019308'
  const uan = record.uanNumber || emp.identity?.uanNumber || emp.bankDetails?.uanNumber || emp.uanNumber || '101595355837'

  // Attendance
  const standardDays = record.standardDays ?? record.workingDays ?? 31
  const payableDays = record.payableDays ?? record.paidDays ?? (standardDays - (record.lopDays ?? 0))
  const lopDays = record.lopDays ?? 0
  const lopReversalDays = record.lopReversalDays ?? 0
  const arrearDays = record.arrearDays ?? 0

  // Earnings
  let earningsList = []
  if (Array.isArray(record.earningsList) && record.earningsList.length > 0) {
    earningsList = record.earningsList.map((e) => ({
      name: e.name.toUpperCase(),
      monthlyRate: Number(e.monthlyRate) || Number(e.total) || 0,
      currentMonth: Number(e.currentMonth) || Number(e.total) || 0,
      arrear: Number(e.arrear) || 0,
      total: Number(e.total) || (Number(e.currentMonth) || 0) + (Number(e.arrear) || 0),
    }))
  } else if (record.earnings && typeof record.earnings === 'object') {
    const e = record.earnings
    const map = [
      { key: 'basic', label: 'BASIC' },
      { key: 'hra', label: 'HOUSE RENT ALLOWANCE (HRA)' },
      { key: 'conveyance', label: 'CONVEYANCE ALLOWANCE' },
      { key: 'otherAllowance', label: 'OTHER ALLOWANCE' },
      { key: 'specialAllowance', label: 'SPECIAL ALLOWANCE' },
      { key: 'medicalAllowance', label: 'MEDICAL ALLOWANCE' },
      { key: 'performanceBonus', label: 'BONUS' },
      { key: 'overtime', label: 'OVERTIME' },
    ]
    for (const item of map) {
      const val = Number(e[item.key]) || 0
      if (val > 0 || ['basic', 'hra'].includes(item.key)) {
        earningsList.push({
          name: item.label,
          monthlyRate: val,
          currentMonth: val,
          arrear: 0,
          total: val,
        })
      }
    }
  }

  if (earningsList.length === 0) {
    earningsList = [
      { name: 'BASIC', monthlyRate: 16265, currentMonth: 16265, arrear: 0, total: 16265 },
      { name: 'HOUSE RENT ALLOWANCE (HRA)', monthlyRate: 9759, currentMonth: 9759, arrear: 0, total: 9759 },
      { name: 'CONVEYANCE ALLOWANCE', monthlyRate: 1600, currentMonth: 1600, arrear: 0, total: 1600 },
      { name: 'OTHER ALLOWANCE', monthlyRate: 2500, currentMonth: 2500, arrear: 0, total: 2500 },
      { name: 'SPECIAL ALLOWANCE', monthlyRate: 3775, currentMonth: 3775, arrear: 0, total: 3775 },
    ]
  }

  // Deductions
  let deductionsList = []
  if (Array.isArray(record.deductionsList) && record.deductionsList.length > 0) {
    deductionsList = record.deductionsList.map((d) => ({
      name: d.name.toUpperCase(),
      amount: Number(d.amount) || 0,
    }))
  } else if (record.deductions && typeof record.deductions === 'object') {
    const d = record.deductions
    const dMap = [
      { key: 'pf', label: 'P.F.' },
      { key: 'professionalTax', label: 'PROFESSIONAL TAX' },
      { key: 'esi', label: 'ESI' },
      { key: 'tdsTax', label: 'TDS' },
      { key: 'loanAdvance', label: 'LOAN DEDUCTION' },
      { key: 'lossOfPay', label: 'LOSS OF PAY' },
      { key: 'performanceDeduction', label: 'OTHER DEDUCTION' },
      { key: 'otherDeductions', label: 'OTHER DEDUCTION' },
    ]
    for (const item of dMap) {
      const val = Number(d[item.key]) || 0
      if (val > 0) {
        deductionsList.push({
          name: item.label,
          amount: val,
        })
      }
    }
  }

  if (deductionsList.length === 0) {
    deductionsList = [
      { name: 'P.F.', amount: 1952 },
      { name: 'PROFESSIONAL TAX', amount: 200 },
    ]
  }

  // Totals
  const grossRate = earningsList.reduce((acc, curr) => acc + (curr.monthlyRate || 0), 0)
  const grossCurrent = earningsList.reduce((acc, curr) => acc + (curr.currentMonth || 0), 0)
  const grossArrear = earningsList.reduce((acc, curr) => acc + (curr.arrear || 0), 0)
  const grossTotal = earningsList.reduce((acc, curr) => acc + (curr.total || 0), 0)
  const totalDeductions = deductionsList.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const netPay = Math.max(0, grossTotal - totalDeductions)
  const netPayInWords = numberToWordsINR(netPay, settings.currency === 'INR' ? 'RUPEES' : settings.currency)

  return {
    id: record._id ? String(record._id) : (record.id || 'N/A'),
    payrollMonth: record.month || 'MAY 2024',
    currency: settings.currency || 'INR',
    currencySymbol: settings.currencySymbol || '₹',
    primaryColor: settings.primaryColor || '#087E9E',
    secondaryColor: settings.secondaryColor || '#0B3155',
    companyName: settings.companyName,
    companyLegalName: settings.companyLegalName,
    companyAddress: settings.address,
    companyContacts: [settings.phone, settings.email, settings.website].filter(Boolean).join(' | '),
    logoUrl: settings.logoUrl,
    footerText: settings.footerText || DEFAULT_COMPANY_SETTINGS.footerText,

    employeeCode,
    employeeName,
    location,
    designation,
    department,
    maskedBankAccount,
    rawBankAccount: rawAccount,
    bankName,
    joinDate,
    dob,
    gender,
    pan,
    pfNo,
    uan,

    standardDays,
    payableDays,
    lopDays,
    lopReversalDays,
    arrearDays,

    earningsList,
    deductionsList,

    grossRate,
    grossCurrent,
    grossArrear,
    grossTotal,
    totalDeductions,
    netPay,
    netPayInWords,

    status: record.status || 'draft',
    generatedDate: new Date().toLocaleDateString('en-GB'),
    generatedBy: record.reviewedBy || 'Payroll Administrator',
  }
}

export function generatePayslipHtml(formattedData) {
  let templateHtml = fs.readFileSync(templateHtmlPath, 'utf8')
  const templateCss = fs.readFileSync(templateCssPath, 'utf8')

  // Build table rows HTML
  const maxRows = Math.max(formattedData.earningsList.length, formattedData.deductionsList.length, 5)
  let tableRowsHtml = ''

  for (let i = 0; i < maxRows; i++) {
    const earn = formattedData.earningsList[i]
    const ded = formattedData.deductionsList[i]

    const earnName = earn ? earn.name : ''
    const earnRate = earn ? formatINR(earn.monthlyRate) : ''
    const earnCurrent = earn ? formatINR(earn.currentMonth) : ''
    const earnArrear = earn ? formatINR(earn.arrear) : ''
    const earnTotal = earn ? formatINR(earn.total) : ''

    const dedName = ded ? ded.name : ''
    const dedTotal = ded ? formatINR(ded.amount) : ''

    tableRowsHtml += `
      <tr>
        <td style="font-weight: 500;">${earnName}</td>
        <td class="num">${earnRate}</td>
        <td class="num">${earnCurrent}</td>
        <td class="num">${earnArrear}</td>
        <td class="num ps-border-right-thick" style="font-weight: 600;">${earnTotal}</td>
        <td style="font-weight: 500;">${dedName}</td>
        <td class="num" style="font-weight: 600;">${dedTotal}</td>
      </tr>
    `
  }

  const replacements = {
    '{{inlineStyles}}': templateCss,
    '{{primaryColor}}': formattedData.primaryColor,
    '{{secondaryColor}}': formattedData.secondaryColor,
    '{{companyName}}': formattedData.companyName,
    '{{companyAddress}}': formattedData.companyAddress,
    '{{companyContacts}}': formattedData.companyContacts,
    '{{logoUrl}}': formattedData.logoUrl,
    '{{payrollMonth}}': formattedData.payrollMonth,
    '{{currency}}': formattedData.currency,

    '{{employeeCode}}': formattedData.employeeCode,
    '{{employeeName}}': formattedData.employeeName,
    '{{location}}': formattedData.location,
    '{{designation}}': formattedData.designation,
    '{{maskedBankAccount}}': formattedData.maskedBankAccount,
    '{{bankName}}': formattedData.bankName,

    '{{joinDate}}': formattedData.joinDate,
    '{{dob}}': formattedData.dob,
    '{{gender}}': formattedData.gender,
    '{{pan}}': formattedData.pan,
    '{{pfNo}}': formattedData.pfNo,
    '{{uan}}': formattedData.uan,

    '{{standardDays}}': String(formattedData.standardDays),
    '{{payableDays}}': typeof formattedData.payableDays === 'number' ? formattedData.payableDays.toFixed(2) : String(formattedData.payableDays),
    '{{lopDays}}': typeof formattedData.lopDays === 'number' ? formattedData.lopDays.toFixed(2) : String(formattedData.lopDays),
    '{{lopReversalDays}}': typeof formattedData.lopReversalDays === 'number' ? formattedData.lopReversalDays.toFixed(2) : String(formattedData.lopReversalDays),
    '{{arrearDays}}': typeof formattedData.arrearDays === 'number' ? formattedData.arrearDays.toFixed(2) : String(formattedData.arrearDays),

    '{{tableRowsHtml}}': tableRowsHtml,

    '{{grossRate}}': formatINR(formattedData.grossRate),
    '{{grossCurrent}}': formatINR(formattedData.grossCurrent),
    '{{grossArrear}}': formatINR(formattedData.grossArrear),
    '{{grossTotal}}': formatINR(formattedData.grossTotal),
    '{{totalDeductions}}': formatINR(formattedData.totalDeductions),

    '{{netPay}}': formatINR(formattedData.netPay),
    '{{netPayInWords}}': formattedData.netPayInWords,

    '{{footerText}}': formattedData.footerText,
    '{{generatedMeta}}': `Generated on: ${formattedData.generatedDate} | Authorized By: ${formattedData.generatedBy}`,
  }

  // Handle conditional sections
  templateHtml = templateHtml.replace(/\{\{#if logoUrl\}\}([\s\S]*?)\{\{\/if\}\}/g, formattedData.logoUrl ? '$1' : '')
  templateHtml = templateHtml.replace(/\{\{#if companyContacts\}\}([\s\S]*?)\{\{\/if\}\}/g, formattedData.companyContacts ? '$1' : '')
  templateHtml = templateHtml.replace(/\{\{#if generatedMeta\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1')

  for (const [key, value] of Object.entries(replacements)) {
    templateHtml = templateHtml.replaceAll(key, value || '')
  }

  return templateHtml
}

export default {
  getCompanySettings,
  normalizePayrollData,
  generatePayslipHtml,
  formatINR,
  maskAccount,
}
