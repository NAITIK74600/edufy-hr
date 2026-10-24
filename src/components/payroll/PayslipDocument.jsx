import React from 'react'
import { numberToWordsINR } from '../../utils/numberToWords'
import { unmaskBankAccount } from '../../utils/payrollMatcher'

export function formatINR(val) {
  const num = Math.round(Number(val) || 0)
  return num.toLocaleString('en-IN')
}

export function maskAccount(accNumber) {
  return unmaskBankAccount(accNumber, '50100488577650')
}

export function PayslipDocument({
  record,
  employee,
  settings,
  scale = 1,
  id = 'printable-payslip',
}) {
  const emp = record?.employeeRef && typeof record.employeeRef === 'object' ? record.employeeRef : (employee || {})
  const company = settings || {}

  const companyName = company.companyName || 'Elythra Edufyi Tech Solutions Pvt Ltd'
  const companyAddress = company.branchAddress || company.address || 'Third Floor, 7 Hills, #424, 10th Cross, 27th Main, Sector 1, HSR Layout, Bengaluru, Karnataka 560102'
  const companyContacts = [company.phone || '+91 80 4567 8900', company.email || 'payroll@edufyitech.com', company.website || 'https://edufyitech.com'].filter(Boolean).join(' | ')
  const logoUrl = company.logoUrl || '/elythra-edufyitech-logo.png'
  const primaryColor = company.primaryColor || '#087E9E'
  const secondaryColor = company.secondaryColor || '#0B3155'
  const currency = company.currency || 'INR'

  // Employee data
  const employeeCode = record?.employeeId || emp?.employeeId || '-'
  const employeeName = emp?.name || record?.employeeName || 'Employee'
  const rawLoc = record?.branch || record?.location || emp?.location || emp?.branch || company.defaultBranch
  const location = (!rawLoc || ['bengaluru', 'ignite campus', 'ignite campus (bengaluru)', 'bengaluru hq'].includes(String(rawLoc).toLowerCase())) ? 'Bengaluru HQ' : rawLoc
  const designation = emp?.designation || record?.designation || 'Staff'
  const department = emp?.department || record?.department || 'Operations'
  // Primary banking & statutory identification from record (or fallback to employee database)
  const rawBankAcc = record?.accountNumber || emp?.bankDetails?.accountNumber || emp?.accountNumber || emp?.bankAccount || ''
  // Visible by default unless company explicitly configured masking to true
  const displayBankAccount = unmaskBankAccount(rawBankAcc, '-')
  const bankName = record?.bankName || emp?.bankDetails?.bankName || emp?.bankName || '-'
  const ifscCode = record?.ifscCode || emp?.bankDetails?.ifscCode || emp?.ifscCode || '-'

  const joinDate = emp?.joiningDate ? (typeof emp.joiningDate === 'string' && emp.joiningDate.includes('-') ? emp.joiningDate.slice(0, 10).split('-').reverse().join('/') : new Date(emp.joiningDate).toLocaleDateString('en-GB')) : '-'
  const dob = emp?.dob ? new Date(emp.dob).toLocaleDateString('en-GB') : (emp?.identity?.dob ? new Date(emp.identity.dob).toLocaleDateString('en-GB') : '-')
  const gender = emp?.gender || (emp?.identity?.gender || '-')
  const pan = record?.panTaxId || emp?.identity?.panNumber || emp?.bankDetails?.panTaxId || emp?.panTaxId || '-'
  const pfNo = record?.pfNumber || emp?.identity?.pfNumber || emp?.pfNumber || '-'
  const uan = record?.uanNumber || emp?.identity?.uanNumber || emp?.bankDetails?.uanNumber || emp?.uanNumber || '-'

  // Attendance
  const standardDays = record?.standardDays ?? record?.workingDays ?? 31
  const payableDays = record?.payableDays ?? record?.paidDays ?? (standardDays - (record?.lopDays ?? 0))
  const lopDays = record?.lopDays ?? 0
  const lopReversalDays = record?.lopReversalDays ?? 0
  const arrearDays = record?.arrearDays ?? 0

  // Earnings
  let earningsList = []
  if (Array.isArray(record?.earningsList) && record.earningsList.length > 0) {
    earningsList = record.earningsList.map((e) => ({
      name: (e.name || '').toUpperCase(),
      monthlyRate: Number(e.monthlyRate) || Number(e.total) || 0,
      currentMonth: Number(e.currentMonth) || Number(e.total) || 0,
      arrear: Number(e.arrear) || 0,
      total: Number(e.total) || ((Number(e.currentMonth) || 0) + (Number(e.arrear) || 0)),
    }))
  } else if (record?.earnings && typeof record.earnings === 'object') {
    const e = record.earnings
    const eMap = [
      { key: 'basic', label: 'BASIC' },
      { key: 'hra', label: 'HOUSE RENT ALLOWANCE (HRA)' },
      { key: 'conveyance', label: 'CONVEYANCE ALLOWANCE' },
      { key: 'otherAllowance', label: 'OTHER ALLOWANCE' },
      { key: 'specialAllowance', label: 'SPECIAL ALLOWANCE' },
      { key: 'medicalAllowance', label: 'MEDICAL ALLOWANCE' },
      { key: 'performanceBonus', label: 'BONUS' },
      { key: 'overtime', label: 'OVERTIME' },
    ]
    earningsList = eMap
      .filter((m) => (e[m.key] || 0) > 0 || ['basic', 'hra'].includes(m.key))
      .map((m) => ({
        name: m.label,
        monthlyRate: e[m.key] || 0,
        currentMonth: e[m.key] || 0,
        arrear: 0,
        total: e[m.key] || 0,
      }))
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
  if (Array.isArray(record?.deductionsList) && record.deductionsList.length > 0) {
    deductionsList = record.deductionsList.map((d) => ({
      name: (d.name || '').toUpperCase(),
      amount: Number(d.amount) || 0,
    }))
  } else if (record?.deductions && typeof record.deductions === 'object') {
    const d = record.deductions
    const dMap = [
      { key: 'pf', label: 'P.F.' },
      { key: 'professionalTax', label: 'PROFESSIONAL TAX' },
      { key: 'esi', label: 'ESI' },
      { key: 'tdsTax', label: 'TDS' },
      { key: 'loanAdvance', label: 'LOAN DEDUCTION' },
      { key: 'lossOfPay', label: 'LOSS OF PAY' },
      { key: 'performanceDeduction', label: 'PERFORMANCE DEDUCTION' },
      { key: 'otherDeductions', label: 'OTHER DEDUCTION' },
    ]
    deductionsList = dMap
      .filter((m) => (d[m.key] || 0) > 0)
      .map((m) => ({ name: m.label, amount: d[m.key] || 0 }))
  }

  if (deductionsList.length === 0) {
    deductionsList = [
      { name: 'P.F.', amount: 1952 },
      { name: 'PROFESSIONAL TAX', amount: 200 },
    ]
  }

  const grossRate = earningsList.reduce((acc, curr) => acc + (curr.monthlyRate || 0), 0)
  const grossCurrent = earningsList.reduce((acc, curr) => acc + (curr.currentMonth || 0), 0)
  const grossArrear = earningsList.reduce((acc, curr) => acc + (curr.arrear || 0), 0)
  const grossTotal = earningsList.reduce((acc, curr) => acc + (curr.total || 0), 0)
  const totalDeductions = deductionsList.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const netPay = Math.max(0, grossTotal - totalDeductions)
  const netPayInWords = numberToWordsINR(netPay, currency === 'INR' ? 'RUPEES' : currency)

  const maxRows = Math.max(earningsList.length, deductionsList.length, 5)

  return (
    <div
      id={id}
      className="payslip-a4-sheet"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '14mm 16mm',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        color: '#1a202c',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        fontSize: '11px',
        lineHeight: 1.4,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        boxShadow: scale !== 1 ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '12px' }}>
        <div style={{ flex: '0 0 auto' }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Company Logo"
              style={{ maxHeight: '60px', maxWidth: '190px', objectFit: 'contain', display: 'block' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : null}
        </div>
        <div style={{ flex: 1, textAlign: 'center', paddingRight: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: primaryColor, letterSpacing: '-0.01em' }}>
            {companyName}
          </h1>
          <div style={{ fontSize: '10.5px', color: '#4a5568', marginTop: '2px', lineHeight: 1.35 }}>
            {companyAddress}
          </div>
          {companyContacts && (
            <div style={{ fontSize: '10px', color: '#718096', marginTop: '2px' }}>
              {companyContacts}
            </div>
          )}
        </div>
      </div>

      {/* Sub-header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', padding: '0 2px' }}>
        <div style={{ flex: 1, textAlign: 'center', paddingLeft: '80px', fontSize: '13.5px', fontWeight: 700, color: secondaryColor }}>
          Payslip for the month of {record?.month || 'MAY 2024'}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 500, color: '#4a5568' }}>
          All amounts in {currency}
        </div>
      </div>

      {/* Employee Details Box */}
      <div style={{ border: '1px solid #a4d3df', borderRadius: '4px', padding: '8px 14px', marginBottom: '8px', background: '#ffffff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px', rowGap: '3px' }}>
          {/* Left Column */}
          <div>
            <InfoRow label="Emp Code" val={employeeCode} />
            <InfoRow label="Emp Name" val={employeeName} />
            <InfoRow label="Location" val={location} />
            <InfoRow label="Designation" val={designation} />
            <InfoRow label="Department" val={department} />
            <InfoRow label="Bank AC No" val={displayBankAccount} />
            <InfoRow label="Bank AC Name" val={bankName} />
          </div>

          {/* Right Column */}
          <div>
            <InfoRow label="Join Date" val={joinDate} />
            <InfoRow label="DOB" val={dob} />
            <InfoRow label="Gender" val={gender} />
            <InfoRow label="PAN" val={pan} />
            <InfoRow label="PF No" val={pfNo} />
            <InfoRow label="PF UAN" val={uan} />
          </div>
        </div>
      </div>

      {/* Attendance Bar */}
      <div
        style={{
          background: '#e1f3f8',
          border: '1px solid #a4d3df',
          borderRadius: '4px',
          padding: '5px 12px',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10.5px',
          fontWeight: 600,
          color: secondaryColor,
        }}
      >
        <div>Standard Days: <span style={{ fontWeight: 700 }}>{standardDays}</span></div>
        <div>Payable Days: <span style={{ fontWeight: 700 }}>{typeof payableDays === 'number' ? payableDays.toFixed(2) : payableDays}</span></div>
        <div>Loss of Pay Days: <span style={{ fontWeight: 700 }}>{typeof lopDays === 'number' ? lopDays.toFixed(2) : lopDays}</span></div>
        <div>LOP Reversal Days: <span style={{ fontWeight: 700 }}>{typeof lopReversalDays === 'number' ? lopReversalDays.toFixed(2) : lopReversalDays}</span></div>
        <div>Arrear Days: <span style={{ fontWeight: 700 }}>{typeof arrearDays === 'number' ? arrearDays.toFixed(2) : arrearDays}</span></div>
      </div>

      {/* Table Container */}
      <div style={{ border: `1.5px solid ${primaryColor}`, borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <thead>
            <tr>
              <th style={{ background: primaryColor, color: '#ffffff', fontWeight: 700, fontSize: '10px', padding: '6px 8px', textAlign: 'left', width: '28%', border: `1px solid ${primaryColor}` }}>
                EARNINGS
              </th>
              <th style={{ background: primaryColor, color: '#ffffff', fontWeight: 700, fontSize: '10px', padding: '6px 8px', textAlign: 'right', width: '14%', border: `1px solid ${primaryColor}` }}>
                MONTHLY RATE
              </th>
              <th style={{ background: primaryColor, color: '#ffffff', fontWeight: 700, fontSize: '10px', padding: '6px 8px', textAlign: 'right', width: '14%', border: `1px solid ${primaryColor}` }}>
                CURRENT MONTH
              </th>
              <th style={{ background: primaryColor, color: '#ffffff', fontWeight: 700, fontSize: '10px', padding: '6px 8px', textAlign: 'right', width: '12%', border: `1px solid ${primaryColor}` }}>
                ARREAR (+/-)
              </th>
              <th style={{ background: primaryColor, color: '#ffffff', fontWeight: 700, fontSize: '10px', padding: '6px 8px', textAlign: 'right', width: '14%', border: `1px solid ${primaryColor}`, borderRight: `1.5px solid ${primaryColor}` }}>
                TOTAL
              </th>
              <th style={{ background: primaryColor, color: '#ffffff', fontWeight: 700, fontSize: '10px', padding: '6px 8px', textAlign: 'left', width: '22%', border: `1px solid ${primaryColor}` }}>
                DEDUCTIONS
              </th>
              <th style={{ background: primaryColor, color: '#ffffff', fontWeight: 700, fontSize: '10px', padding: '6px 8px', textAlign: 'right', width: '14%', border: `1px solid ${primaryColor}` }}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, idx) => {
              const earn = earningsList[idx]
              const ded = deductionsList[idx]
              return (
                <tr key={idx}>
                  <td style={{ padding: '4px 8px', border: '1px solid #d2eaf1', fontWeight: 500 }}>
                    {earn?.name || ''}
                  </td>
                  <td style={{ padding: '4px 8px', border: '1px solid #d2eaf1', textAlign: 'right' }}>
                    {earn ? formatINR(earn.monthlyRate) : ''}
                  </td>
                  <td style={{ padding: '4px 8px', border: '1px solid #d2eaf1', textAlign: 'right' }}>
                    {earn ? formatINR(earn.currentMonth) : ''}
                  </td>
                  <td style={{ padding: '4px 8px', border: '1px solid #d2eaf1', textAlign: 'right' }}>
                    {earn ? formatINR(earn.arrear) : ''}
                  </td>
                  <td style={{ padding: '4px 8px', border: '1px solid #d2eaf1', borderRight: `1.5px solid ${primaryColor}`, textAlign: 'right', fontWeight: 600 }}>
                    {earn ? formatINR(earn.total) : ''}
                  </td>
                  <td style={{ padding: '4px 8px', border: '1px solid #d2eaf1', fontWeight: 500 }}>
                    {ded?.name || ''}
                  </td>
                  <td style={{ padding: '4px 8px', border: '1px solid #d2eaf1', textAlign: 'right', fontWeight: 600 }}>
                    {ded ? formatINR(ded.amount) : ''}
                  </td>
                </tr>
              )
            })}
            <tr style={{ background: '#e1f3f8', fontWeight: 800, color: secondaryColor, borderTop: `1.5px solid ${primaryColor}` }}>
              <td style={{ padding: '6px 8px', border: '1px solid #d2eaf1', fontWeight: 800 }}>GROSS EARNINGS</td>
              <td style={{ padding: '6px 8px', border: '1px solid #d2eaf1', textAlign: 'right', fontWeight: 800 }}>{formatINR(grossRate)}</td>
              <td style={{ padding: '6px 8px', border: '1px solid #d2eaf1', textAlign: 'right', fontWeight: 800 }}>{formatINR(grossCurrent)}</td>
              <td style={{ padding: '6px 8px', border: '1px solid #d2eaf1', textAlign: 'right', fontWeight: 800 }}>{formatINR(grossArrear)}</td>
              <td style={{ padding: '6px 8px', border: '1px solid #d2eaf1', borderRight: `1.5px solid ${primaryColor}`, textAlign: 'right', fontWeight: 800 }}>{formatINR(grossTotal)}</td>
              <td style={{ padding: '6px 8px', border: '1px solid #d2eaf1', fontWeight: 800 }}>TOTAL DEDUCTIONS</td>
              <td style={{ padding: '6px 8px', border: '1px solid #d2eaf1', textAlign: 'right', fontWeight: 800 }}>{formatINR(totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Pay Box */}
      <div style={{ border: `1.5px solid ${primaryColor}`, borderRadius: '4px', background: '#f4fbfe', padding: '8px 14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: secondaryColor, letterSpacing: '0.02em' }}>
            NET PAY
          </span>
          <span style={{ fontSize: '17px', fontWeight: 800, color: secondaryColor, letterSpacing: '-0.01em' }}>
            {formatINR(netPay)}
          </span>
        </div>
        <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#1a202c', letterSpacing: '0.01em' }}>
          ({netPayInWords})
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '12px', textAlign: 'center' }}>
        <div style={{ height: '2px', background: primaryColor, width: '100%', marginBottom: '8px' }} />
        <div style={{ fontSize: '9.5px', color: '#4a5568', lineHeight: 1.4 }}>
          {company.footerText || 'This Computer generated document, No signature is required. This document contains confidential information.'}
        </div>
        <div style={{ fontSize: '8.5px', color: '#a0aec0', marginTop: '4px' }}>
          Confidential - Payroll Document · Generated: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, val }) {
  return (
    <div style={{ display: 'flex', fontSize: '10.5px', lineHeight: 1.45 }}>
      <span style={{ width: '105px', flexShrink: 0, color: '#1a202c', fontWeight: 600 }}>{label}</span>
      <span style={{ width: '14px', textAlign: 'center', color: '#4a5568', flexShrink: 0 }}>:</span>
      <span style={{ flex: 1, color: '#1a202c', fontWeight: 500, wordBreak: 'break-word' }}>{val || 'N/A'}</span>
    </div>
  )
}

export default PayslipDocument
