import test from 'node:test'
import assert from 'node:assert/strict'
import { mailService } from '../src/services/mail.service.js'

test('mailService correctly reports configuration status based on credentials', () => {
  const hrStatus = mailService.isConfigured('hr')
  const adminStatus = mailService.isConfigured('admin')
  // Both return booleans without throwing
  assert.equal(typeof hrStatus, 'boolean')
  assert.equal(typeof adminStatus, 'boolean')
})

test('mailService wrapInEmailLayout embeds corporate branding, logo CID, and legal details', () => {
  const innerHtml = '<p>Test email message content</p>'
  const rendered = mailService.wrapInEmailLayout({
    preheader: 'Welcome to the team',
    title: 'Welcome to Edufyi',
    contentHtml: innerHtml,
  })

  // Check Edufy branding
  assert.match(rendered, /Edufy|Elythra Edufyi Tech Solutions/i)
  // Check CID inline logo reference
  assert.match(rendered, /cid:edufyilogo/)
  // Check legal / contact details
  assert.match(rendered, /HSR Layout/i)
  assert.match(rendered, /Confidentiality Notice/i)
  assert.match(rendered, /All rights reserved/i)
  // Check inner body injection
  assert.match(rendered, /Test email message content/)
})

test('sendWelcomeEmail generates professional employee onboarding dispatch', async () => {
  const result = await mailService.sendWelcomeEmail({
    employee: {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      employeeId: 'EDU-EMP-201',
      designation: 'Frontend Engineer',
      department: 'Engineering',
    },
    temporaryPassword: 'TempPass#2026',
    loginUrl: 'https://empoyee.edufyitechsolutions.com/login',
  })

  assert.equal(result.recipient, 'rohan.sharma@example.com')
  assert.match(result.subject, /Welcome to Edufy/i)
  assert.equal(result.fromRole, 'admin')
})

test('sendPasswordResetEmail generates secure credential reset notification', async () => {
  const result = await mailService.sendPasswordResetEmail({
    user: {
      name: 'Anjali Nair',
      email: 'anjali.nair@example.com',
    },
    temporaryPassword: 'NewSecretPass!2026',
    loginUrl: 'https://empoyee.edufyitechsolutions.com/login',
  })

  assert.equal(result.recipient, 'anjali.nair@example.com')
  assert.match(result.subject, /Password.*Updated/i)
  assert.equal(result.fromRole, 'admin')
})

test('sendPayslipEmail generates payslip with earnings breakdown and PDF attachment', async () => {
  const record = {
    employeeName: 'Venkatesh Rao',
    employeeId: 'EDU-EMP-102',
    designation: 'Senior Developer',
    department: 'Software Engineering',
    month: 'October 2026',
    earnings: {
      basic: 30000,
      hra: 15000,
      special: 5000,
    },
    deductions: {
      pf: 1800,
      tax: 1500,
    },
    grossSalary: 50000,
    totalDeductions: 3300,
    netSalary: 46700,
  }

  const result = await mailService.sendPayslipEmail({
    employee: {
      name: 'Venkatesh Rao',
      email: 'venkatesh.rao@example.com',
    },
    record,
    pdfBuffer: Buffer.from('%PDF-1.4 Mock PDF Content'),
  })

  assert.equal(result.recipient, 'venkatesh.rao@example.com')
  assert.match(result.subject, /October 2026/i)
  assert.match(result.subject, /Payslip/i)
  assert.equal(result.fromRole, 'hr')
})

test('sendLeaveStatusEmail generates approved, rejected, and cancelled notifications', async () => {
  const employee = { name: 'Pooja Verma', email: 'pooja.verma@example.com' }
  const leaveRequest = {
    leaveType: 'sick',
    startDate: '2026-11-01',
    endDate: '2026-11-02',
    units: 2,
  }

  // Approved
  const approvedResult = await mailService.sendLeaveStatusEmail({
    employee,
    leaveRequest,
    action: 'approved',
    approver: { name: 'Jagadish Babu', role: 'manager' },
  })
  assert.match(approvedResult.subject, /Approved/i)

  // Rejected
  const rejectedResult = await mailService.sendLeaveStatusEmail({
    employee,
    leaveRequest,
    action: 'rejected',
    approver: { name: 'HR Operations', role: 'hr' },
    reason: 'Operational deadlines during launch week.',
  })
  assert.match(rejectedResult.subject, /Rejected|Update/i)

  // Cancelled
  const cancelledResult = await mailService.sendLeaveStatusEmail({
    employee,
    leaveRequest,
    action: 'cancelled',
    approver: { name: 'Pooja Verma', role: 'employee' },
  })
  assert.match(cancelledResult.subject, /Cancelled|Update/i)
})

test('sendDocumentStatusEmail generates verification notices', async () => {
  const result = await mailService.sendDocumentStatusEmail({
    employee: { name: 'Karthik S', email: 'karthik@example.com' },
    docType: 'aadhaar',
    action: 'verified',
  })

  assert.equal(result.recipient, 'karthik@example.com')
  assert.match(result.subject, /Verification|Approved|Verified/i)
})
