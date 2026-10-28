import test from 'node:test'
import assert from 'node:assert/strict'
import { numberToWordsINR } from '../src/utils/numberToWords.js'
import { generatePayslipHtml, normalizePayrollData } from '../src/services/payslip.service.js'

test('Number to Words INR conversion works accurately with Indian numbering system', () => {
  // Test reference prompt case: ₹31,747
  assert.equal(
    numberToWordsINR(31747),
    'RUPEES THIRTY ONE THOUSAND SEVEN HUNDRED FORTY SEVEN ONLY'
  )

  // Zero
  assert.equal(numberToWordsINR(0), 'RUPEES ZERO ONLY')

  // Hundreds
  assert.equal(numberToWordsINR(500), 'RUPEES FIVE HUNDRED ONLY')

  // Thousands
  assert.equal(
    numberToWordsINR(15000),
    'RUPEES FIFTEEN THOUSAND ONLY'
  )

  // Lakhs
  assert.equal(
    numberToWordsINR(125000),
    'RUPEES ONE LAKH TWENTY FIVE THOUSAND ONLY'
  )

  // Crores
  assert.equal(
    numberToWordsINR(10500000),
    'RUPEES ONE CRORE FIVE LAKH ONLY'
  )

  // Decimals / Paise
  assert.equal(
    numberToWordsINR(31747.5),
    'RUPEES THIRTY ONE THOUSAND SEVEN HUNDRED FORTY SEVEN AND FIFTY PAISE ONLY'
  )
})

test('Payslip Service renders professional HTML adhering to reference design', () => {
  const sampleEmployee = {
    employeeId: 'ETS21206',
    name: 'Chandana Somaih',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Bangalore, India',
    bankAccount: '123456789012',
    bankName: 'HDFC Bank',
    joiningDate: '2023-01-15',
    dob: '1995-06-20',
    gender: 'Male',
    panTaxId: 'ABCDE1234F',
    pfNumber: 'PF1234567',
    uan: '100987654321',
  }

  const samplePayroll = {
    month: 'October 2026',
    standardDays: 31,
    payableDays: 30,
    lopDays: 1,
    lopReversalDays: 0,
    arrearDays: 0,
    earningsList: [
      { name: 'Basic Salary', monthlyRate: 50000, currentMonth: 48387, arrear: 0, total: 48387 },
      { name: 'House Rent Allowance', monthlyRate: 25000, currentMonth: 24193, arrear: 0, total: 24193 },
      { name: 'Special Allowance', monthlyRate: 15000, currentMonth: 14516, arrear: 0, total: 14516 },
    ],
    deductionsList: [
      { name: 'Provident Fund', amount: 5806 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'TDS / Income Tax', amount: 4500 },
    ],
  }

  const sampleSettings = {
    companyName: 'Elythra Edufyi Tech Solutions Pvt Ltd',
    companyLegalName: 'Elythra Edufyi Tech Solutions Pvt Ltd',
    address: 'Third Floor, 7 Hills, #424, 10th Cross Rd, 4th Phase, Dollar Layout, Bengaluru, Karnataka 560078',
    phone: '+91 80 4123 4567',
    email: 'payroll@elythra.com',
    website: 'www.elythra.com',
    primaryColor: '#087E9E',
    secondaryColor: '#0B3155',
    currency: 'INR',
    maskBankAccount: true,
  }

  const normalized = normalizePayrollData(samplePayroll, sampleEmployee, sampleSettings)
  const html = generatePayslipHtml(normalized)

  // Verify structure
  assert.ok(html.includes('Elythra Edufyi Tech Solutions Pvt Ltd'))
  assert.ok(html.toUpperCase().includes('OCTOBER 2026'))
  assert.ok(html.includes('ETS21206'))
  assert.ok(html.includes('Chandana Somaih'))
  assert.ok(html.includes('●●●●●●●●9012'), 'Bank account must be masked')
  assert.ok(html.includes('Standard Days'))
  assert.ok(html.includes('Payable Days'))
  assert.ok(html.toUpperCase().includes('BASIC SALARY'))
  assert.ok(html.toUpperCase().includes('PROVIDENT FUND'))
  assert.ok(html.includes('GROSS EARNINGS'))
  assert.ok(html.includes('TOTAL DEDUCTIONS'))
  assert.ok(html.includes('NET PAY'))
  assert.ok(html.includes('RUPEES'))
  assert.ok(html.toLowerCase().includes('computer generated document') || html.toLowerCase().includes('computer-generated document'))
})

test('Payslip Service handles missing optional fields and zero deductions gracefully', () => {
  const minimalEmployee = {
    employeeId: 'EMP-001',
    name: 'Minimal Test Employee',
  }

  const zeroDeductionsPayroll = {
    month: 'November 2026',
    earningsList: [{ name: 'Basic Stipend', total: 20000 }],
    deductionsList: [],
  }

  const normalized = normalizePayrollData(zeroDeductionsPayroll, minimalEmployee, {})
  const html = generatePayslipHtml(normalized)

  assert.ok(html.includes('Minimal Test Employee'))
  assert.ok(html.toUpperCase().includes('BASIC STIPEND'))
  assert.ok(html.includes('20,000'))
  assert.ok(html.includes('RUPEES'))
})

test('Payslip Service respects company defaultBranch and record-specific branch location overrides', () => {
  const employee = {
    employeeId: 'EMP-BR1',
    name: 'Branch Test Emp',
    location: 'Bengaluru Campus',
  }

  // 1. Fallback to settings defaultBranch when employee has no branch
  const normDefault = normalizePayrollData({}, { employeeId: 'EMP-002', name: 'No Location' }, { defaultBranch: 'HYDERABAD TECH HUB' })
  assert.equal(normDefault.location, 'HYDERABAD TECH HUB')

  // 2. Fallback to employee location
  const normEmpLoc = normalizePayrollData({}, employee, { defaultBranch: 'IGNITE CAMPUS' })
  assert.equal(normEmpLoc.location, 'Bengaluru Campus')

  // 3. Record-specific branch override takes highest precedence
  const normOverride = normalizePayrollData({ branch: 'MUMBAI REGIONAL OFFICE' }, employee, { defaultBranch: 'IGNITE CAMPUS' })
  assert.equal(normOverride.location, 'MUMBAI REGIONAL OFFICE')

  const html = generatePayslipHtml(normOverride)
  assert.ok(html.includes('MUMBAI REGIONAL OFFICE'))
})
