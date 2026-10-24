import React, { useState, useEffect, useMemo } from 'react'
import {
  Building2,
  CreditCard,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  FileText,
  Mail,
  Plus,
  Printer,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react'
import { PageHeader, StatusBadge } from '../components/ui'
import { useAuth } from '../auth/AuthContext'
import { hrStore } from '../services/hrStore'
import { currentPayrollMonth } from '../services/connectedStore'
import { doesPayrollMatchUser, unmaskBankAccount, findEmployeeForUser } from '../utils/payrollMatcher'
import { PayslipPreviewModal } from '../components/payroll/PayslipPreviewModal'
import { CompanySettingsModal } from '../components/payroll/CompanySettingsModal'
import { BulkGenerateModal } from '../components/payroll/BulkGenerateModal'
import { formatINR } from '../components/payroll/PayslipDocument'
import { numberToWordsINR } from '../utils/numberToWords'
import { apiClient } from '../services/apiClient'
import { printPayslipDocument, downloadPayslipDocument } from '../utils/payslipExport'
import { PayrollMonthPicker } from '../components/payroll/PayrollMonthPicker'
import { getPayrollMonthOptions, getDaysInMonth } from '../utils/monthHelper'

const DEFAULT_EARNINGS = [
  { name: 'Basic Salary', monthlyRate: 18000, currentMonth: 18000, arrear: 0, total: 18000 },
  { name: 'House Rent Allowance', monthlyRate: 9000, currentMonth: 9000, arrear: 0, total: 9000 },
  { name: 'Conveyance Allowance', monthlyRate: 1600, currentMonth: 1600, arrear: 0, total: 1600 },
  { name: 'Special Allowance', monthlyRate: 4000, currentMonth: 4000, arrear: 0, total: 4000 },
  { name: 'Other Allowance', monthlyRate: 1000, currentMonth: 1000, arrear: 0, total: 1000 },
  { name: 'Bonus', monthlyRate: 0, currentMonth: 0, arrear: 0, total: 0 },
  { name: 'Overtime', monthlyRate: 0, currentMonth: 0, arrear: 0, total: 0 },
]

const DEFAULT_DEDUCTIONS = [
  { name: 'Provident Fund (P.F.)', amount: 1800 },
  { name: 'Professional Tax', amount: 200 },
  { name: 'ESI', amount: 0 },
  { name: 'TDS / Income Tax', amount: 0 },
]

function normalizeBranch(b) {
  if (!b) return 'Bengaluru HQ'
  const trimmed = String(b).trim()
  if (['bengaluru', 'ignite campus', 'ignite campus (bengaluru)', 'bengaluru hq'].includes(trimmed.toLowerCase())) {
    return 'Bengaluru HQ'
  }
  return trimmed
}

export function PayrollPage() {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((next) => setStoreState(next))
  }, [])

  const employees = storeState.employees || []
  const payrollRecords = storeState.payroll || []
  const companySettings = storeState.companySettings || {}

  const isEmployeeRole = user?.role === 'employee' || (typeof window !== 'undefined' && window.location.hash?.includes('/employee/salary'))

  // View state
  const [activeTab, setActiveTab] = useState(isEmployeeRole ? 'my_payslips' : 'records')
  const [selectedMonth, setSelectedMonth] = useState(isEmployeeRole ? 'all' : currentPayrollMonth())
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')

  // Modals state
  const [previewRecord, setPreviewRecord] = useState(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [savingNotice, setSavingNotice] = useState(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  // Form State for creating/editing payslip
  const [editingRecordId, setEditingRecordId] = useState(null)
  const [formBankName, setFormBankName] = useState('')
  const [formAccountNumber, setFormAccountNumber] = useState('')
  const [formIfscCode, setFormIfscCode] = useState('')
  const [formPanTaxId, setFormPanTaxId] = useState('')
  const [formUanNumber, setFormUanNumber] = useState('')
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [formBranch, setFormBranch] = useState(() => normalizeBranch(companySettings.defaultBranch))
  const [isCustomBranch, setIsCustomBranch] = useState(false)
  const [customBranchInput, setCustomBranchInput] = useState('')
  const [userCustomBranches, setUserCustomBranches] = useState([])
  const [formMonth, setFormMonth] = useState(currentPayrollMonth())
  const [formStandardDays, setFormStandardDays] = useState(30)
  const [formPayableDays, setFormPayableDays] = useState(30)
  const [formLopDays, setFormLopDays] = useState(0)
  const [formLopReversalDays, setFormLopReversalDays] = useState(0)
  const [formArrearDays, setFormArrearDays] = useState(0)
  const [formEarnings, setFormEarnings] = useState(DEFAULT_EARNINGS)
  const [formDeductions, setFormDeductions] = useState(DEFAULT_DEDUCTIONS)

  // Filtered payroll records
  const filteredRecords = useMemo(() => {
    let list = payrollRecords
    if (isEmployeeRole) {
      list = list.filter((r) => doesPayrollMatchUser(r, user, employees))
    }
    if (selectedMonth && selectedMonth !== 'all') {
      list = list.filter((r) => r.month === selectedMonth)
    }
    if (departmentFilter !== 'all') {
      list = list.filter((r) => {
        const emp = findEmployeeForUser({ id: r.employeeId, employeeId: r.employeeId, name: r.employeeName }, employees)
        return emp?.department === departmentFilter
      })
    }
    if (branchFilter !== 'all') {
      list = list.filter((r) => {
        const emp = findEmployeeForUser({ id: r.employeeId, employeeId: r.employeeId, name: r.employeeName }, employees)
        const recBranch = normalizeBranch(r.branch || r.location || emp?.location || emp?.branch || companySettings.defaultBranch)
        return recBranch === branchFilter
      })
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((r) => {
        const emp = employees.find((e) => String(e._id || e.id) === String(r.employeeId))
        const recBranch = r.branch || r.location || emp?.location || emp?.branch || ''
        return (
          r.month?.toLowerCase().includes(q) ||
          emp?.name?.toLowerCase().includes(q) ||
          emp?.employeeId?.toLowerCase().includes(q) ||
          emp?.department?.toLowerCase().includes(q) ||
          recBranch.toLowerCase().includes(q)
        )
      })
    }
    return list
  }, [payrollRecords, isEmployeeRole, user, selectedMonth, departmentFilter, branchFilter, searchQuery, employees])

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set()
    employees.forEach((e) => {
      if (e.department) set.add(e.department)
    })
    return Array.from(set).sort()
  }, [employees])

  // Distinct branches - Only Bengaluru HQ by default + explicit custom branches
  const branches = useMemo(() => {
    const disallowed = new Set([
      'ignite campus',
      'ignite campus (bengaluru)',
      'bengaluru',
      'delhi ncr branch',
      'hyderabad tech hub',
      'mumbai regional office',
      'remote / distributed',
    ])

    const set = new Set(['Bengaluru HQ'])

    if (companySettings?.defaultBranch) {
      const norm = normalizeBranch(companySettings.defaultBranch)
      if (!disallowed.has(norm.toLowerCase())) set.add(norm)
    }

    if (Array.isArray(companySettings?.branches)) {
      companySettings.branches.forEach((b) => {
        if (b && !disallowed.has(String(b).trim().toLowerCase())) {
          set.add(String(b).trim())
        }
      })
    }

    if (Array.isArray(companySettings?.locations)) {
      companySettings.locations.forEach((loc) => {
        const name = typeof loc === 'string' ? loc : loc?.name
        if (name && !disallowed.has(String(name).trim().toLowerCase())) {
          set.add(String(name).trim())
        }
      })
    }

    userCustomBranches.forEach((b) => {
      if (b && !disallowed.has(String(b).trim().toLowerCase())) {
        set.add(String(b).trim())
      }
    })

    return Array.from(set)
  }, [companySettings, userCustomBranches])

  // Distinct & future months
  const availableMonths = useMemo(() => {
    return getPayrollMonthOptions(payrollRecords)
  }, [payrollRecords])

  // Form calculations
  const grossEarnings = useMemo(() => {
    return formEarnings.reduce((acc, row) => acc + (Number(row.total) || 0), 0)
  }, [formEarnings])

  const totalDeductions = useMemo(() => {
    return formDeductions.reduce((acc, row) => acc + (Number(row.amount) || 0), 0)
  }, [formDeductions])

  const netPay = Math.max(0, grossEarnings - totalDeductions)
  const netPayInWords = useMemo(() => numberToWordsINR(netPay), [netPay])

  // When selected employee changes in form, pre-populate standard salary
  const handleSelectEmployee = (empId) => {
    setSelectedEmpId(empId)
    const emp = employees.find((e) => String(e._id || e.id) === String(empId) || String(e.employeeId) === String(empId))
    if (!emp) return

    setFormBranch(normalizeBranch(emp.location || emp.branch || companySettings.defaultBranch))
    setFormBankName(emp.bankDetails?.bankName || emp.bankName || 'HDFC Bank')
    setFormAccountNumber(emp.bankDetails?.accountNumber || emp.accountNumber || '')
    setFormIfscCode(emp.bankDetails?.ifscCode || emp.ifscCode || '')
    setFormPanTaxId(emp.identity?.panNumber || emp.bankDetails?.panTaxId || emp.panTaxId || '')
    setFormUanNumber(emp.identity?.uanNumber || emp.bankDetails?.uanNumber || emp.uanNumber || '')

    const baseSalary = Number(emp.baseSalary || emp.salary || 30000)
    const struct = emp.salaryStructure || {}
    const hasStruct = Boolean(
      struct && (
        struct.basic !== undefined ||
        struct.hra !== undefined ||
        struct.ca !== undefined ||
        struct.conveyance !== undefined ||
        struct.sa !== undefined ||
        struct.specialAllowance !== undefined ||
        struct.oa !== undefined ||
        struct.otherAllowance !== undefined
      )
    )

    const basic = hasStruct && struct.basic !== undefined
      ? Math.max(0, Number(struct.basic) || 0)
      : Math.round(baseSalary * 0.5)

    const hra = hasStruct && struct.hra !== undefined
      ? Math.max(0, Number(struct.hra) || 0)
      : Math.round(basic * 0.4)

    const conveyance = hasStruct && (struct.conveyance !== undefined || struct.ca !== undefined)
      ? Math.max(0, Number(struct.conveyance ?? struct.ca) || 0)
      : (baseSalary > 8000 ? 1600 : Math.round(baseSalary * 0.1))

    const special = hasStruct && (struct.specialAllowance !== undefined || struct.sa !== undefined)
      ? Math.max(0, Number(struct.specialAllowance ?? struct.sa) || 0)
      : Math.max(0, baseSalary - basic - hra - conveyance)

    const other = hasStruct && (struct.otherAllowance !== undefined || struct.oa !== undefined)
      ? Math.max(0, Number(struct.otherAllowance ?? struct.oa) || 0)
      : 0

    setFormEarnings([
      { name: 'Basic Salary', monthlyRate: basic, currentMonth: basic, arrear: 0, total: basic },
      { name: 'House Rent Allowance', monthlyRate: hra, currentMonth: hra, arrear: 0, total: hra },
      { name: 'Conveyance Allowance', monthlyRate: conveyance, currentMonth: conveyance, arrear: 0, total: conveyance },
      { name: 'Special Allowance', monthlyRate: special, currentMonth: special, arrear: 0, total: special },
      { name: 'Other Allowance', monthlyRate: other, currentMonth: other, arrear: 0, total: other },
      { name: 'Bonus', monthlyRate: 0, currentMonth: 0, arrear: 0, total: 0 },
      { name: 'Overtime', monthlyRate: 0, currentMonth: 0, arrear: 0, total: 0 },
    ])

    const pf = Math.min(1800, Math.round(basic * 0.12))
    const pt = 200
    setFormDeductions([
      { name: 'Provident Fund (P.F.)', amount: pf },
      { name: 'Professional Tax', amount: pt },
      { name: 'ESI', amount: 0 },
      { name: 'TDS / Income Tax', amount: 0 },
    ])
  }

  // Edit existing record in form
  const handleEditRecord = (record) => {
    setEditingRecordId(record._id || record.id)
    const emp = employees.find((e) => String(e._id || e.id) === String(record.employeeId) || String(e.employeeId) === String(record.employeeId))
    setSelectedEmpId(emp?._id || emp?.id || record.employeeId)
    setFormBranch(normalizeBranch(record.branch || record.location || emp?.location || emp?.branch || companySettings.defaultBranch))
    setFormBankName(record.bankName || emp?.bankDetails?.bankName || emp?.bankName || 'HDFC Bank')
    setFormAccountNumber(record.accountNumber || emp?.bankDetails?.accountNumber || emp?.accountNumber || '')
    setFormIfscCode(record.ifscCode || emp?.bankDetails?.ifscCode || emp?.ifscCode || '')
    setFormPanTaxId(record.panTaxId || emp?.identity?.panNumber || emp?.bankDetails?.panTaxId || emp?.panTaxId || '')
    setFormUanNumber(record.uanNumber || emp?.identity?.uanNumber || emp?.bankDetails?.uanNumber || emp?.uanNumber || '')
    setFormMonth(record.month || currentPayrollMonth())
    setFormStandardDays(record.standardDays ?? 30)
    setFormPayableDays(record.payableDays ?? record.paidDays ?? 30)
    setFormLopDays(record.lopDays ?? 0)
    setFormLopReversalDays(record.lopReversalDays ?? 0)
    setFormArrearDays(record.arrearDays ?? 0)

    if (Array.isArray(record.earningsList) && record.earningsList.length > 0) {
      setFormEarnings(record.earningsList)
    } else if (record.earnings) {
      const e = record.earnings
      setFormEarnings([
        { name: 'Basic Salary', monthlyRate: e.basic || 0, currentMonth: e.basic || 0, arrear: 0, total: e.basic || 0 },
        { name: 'House Rent Allowance', monthlyRate: e.hra || 0, currentMonth: e.hra || 0, arrear: 0, total: e.hra || 0 },
        { name: 'Special Allowance', monthlyRate: e.specialAllowance || 0, currentMonth: e.specialAllowance || 0, arrear: 0, total: e.specialAllowance || 0 },
        { name: 'Other Allowance', monthlyRate: e.otherAllowances || 0, currentMonth: e.otherAllowances || 0, arrear: 0, total: e.otherAllowances || 0 },
      ])
    }

    if (Array.isArray(record.deductionsList) && record.deductionsList.length > 0) {
      setFormDeductions(record.deductionsList)
    } else if (record.deductions) {
      const d = record.deductions
      setFormDeductions([
        { name: 'Provident Fund (P.F.)', amount: d.pf || 0 },
        { name: 'Professional Tax', amount: d.professionalTax || 0 },
        { name: 'TDS / Income Tax', amount: d.tdsTax || 0 },
        { name: 'ESI', amount: d.esi || 0 },
      ])
    }

    setActiveTab('generate')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Update dynamic earning row
  const updateEarningRow = (index, field, value) => {
    setFormEarnings((prev) => {
      const next = [...prev]
      const row = { ...next[index], [field]: value }
      if (field === 'monthlyRate' || field === 'currentMonth' || field === 'arrear') {
        const current = Number(field === 'currentMonth' ? value : row.currentMonth) || 0
        const arr = Number(field === 'arrear' ? value : row.arrear) || 0
        row.total = current + arr
      }
      next[index] = row
      return next
    })
  }

  const addEarningRow = () => {
    setFormEarnings((prev) => [
      ...prev,
      { name: 'Other Allowance', monthlyRate: 0, currentMonth: 0, arrear: 0, total: 0 },
    ])
  }

  const removeEarningRow = (index) => {
    setFormEarnings((prev) => prev.filter((_, i) => i !== index))
  }

  // Update dynamic deduction row
  const updateDeductionRow = (index, field, value) => {
    setFormDeductions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addDeductionRow = () => {
    setFormDeductions((prev) => [...prev, { name: 'Other Deduction', amount: 0 }])
  }

  const removeDeductionRow = (index) => {
    setFormDeductions((prev) => prev.filter((_, i) => i !== index))
  }

  // Save/Generate payslip
  const handleSavePayslip = async () => {
    if (!selectedEmpId) {
      alert('Please select an employee.')
      return
    }

    const emp = employees.find((e) => String(e._id || e.id) === String(selectedEmpId) || String(e.employeeId) === String(selectedEmpId))
    const payload = {
      ...(editingRecordId ? { id: editingRecordId, _id: editingRecordId } : {}),
      employeeId: emp?.employeeId || emp?.id || selectedEmpId,
      employeeRef: emp?._id || emp?.id || selectedEmpId,
      employeeName: emp?.name || 'Employee',
      designation: emp?.designation || '',
      department: emp?.department || '',
      location: normalizeBranch(formBranch || emp?.location || emp?.branch || companySettings.defaultBranch),
      branch: normalizeBranch(formBranch || emp?.location || emp?.branch || companySettings.defaultBranch),
      bankName: formBankName,
      accountNumber: formAccountNumber,
      ifscCode: formIfscCode,
      panTaxId: formPanTaxId,
      uanNumber: formUanNumber,
      month: formMonth,
      standardDays: Number(formStandardDays) || 30,
      payableDays: Number(formPayableDays) || 30,
      lopDays: Number(formLopDays) || 0,
      lopReversalDays: Number(formLopReversalDays) || 0,
      arrearDays: Number(formArrearDays) || 0,
      earningsList: formEarnings.map((e) => ({
        name: e.name,
        monthlyRate: Number(e.monthlyRate) || 0,
        currentMonth: Number(e.currentMonth) || 0,
        arrear: Number(e.arrear) || 0,
        total: Number(e.total) || 0,
      })),
      deductionsList: formDeductions.map((d) => ({
        name: d.name,
        amount: Number(d.amount) || 0,
      })),
      grossEarnings,
      totalDeductions,
      netPay,
      netPayInWords,
      status: 'processed',
    }

    try {
      setActionInProgress(true)
      await hrStore.savePayrollRecord(payload)
      setSavingNotice(editingRecordId ? 'Payslip successfully updated.' : 'Payslip successfully generated and saved.')
      setEditingRecordId(null)
      setTimeout(() => setSavingNotice(null), 4000)
      setActiveTab('records')
    } catch (err) {
      alert(err.message || 'Failed to save payslip.')
    } finally {
      setActionInProgress(false)
    }
  }

  // Delete payslip record
  const handleDeleteRecord = async (record) => {
    const id = record._id || record.id
    const name = record.employeeName || 'this employee'
    if (!confirm(`Are you sure you want to delete the payslip for ${name} (${record.month})?`)) return
    try {
      setActionInProgress(true)
      await hrStore.deletePayrollRecord(id)
      setSavingNotice(`Payslip for ${name} deleted successfully.`)
      setTimeout(() => setSavingNotice(null), 4000)
    } catch (err) {
      alert(err.message || 'Failed to delete payslip.')
    } finally {
      setActionInProgress(false)
    }
  }

  // Finalize monthly drafts into official disbursed payslips
  const handleFinalizeMonth = async () => {
    const targetMonth = selectedMonth !== 'all' ? selectedMonth : currentPayrollMonth()
    if (!confirm(`Finalize and disburse all draft payslips for ${targetMonth}? Once finalized, all employees will see their official payslips in their ESS dashboard.`)) return
    try {
      setActionInProgress(true)
      const res = await hrStore.executePayrollRun(targetMonth)
      setSavingNotice(res?.data?.message || res?.message || `Payslips for ${targetMonth} finalized and disbursed.`)
      setTimeout(() => setSavingNotice(null), 4500)
    } catch (err) {
      alert(err.message || 'Failed to finalize monthly payroll.')
    } finally {
      setActionInProgress(false)
    }
  }

  // Open Preview of current form
  const handlePreviewCurrentForm = () => {
    if (!selectedEmpId) {
      alert('Please select an employee first.')
      return
    }
    const emp = employees.find((e) => String(e._id || e.id) === String(selectedEmpId))
    const syntheticRecord = {
      _id: editingRecordId || 'draft',
      employeeId: selectedEmpId,
      employeeName: emp?.name || 'Employee',
      designation: emp?.designation || '',
      department: emp?.department || '',
      location: normalizeBranch(formBranch || emp?.location || emp?.branch || companySettings.defaultBranch),
      branch: normalizeBranch(formBranch || emp?.location || emp?.branch || companySettings.defaultBranch),
      bankName: formBankName,
      accountNumber: formAccountNumber,
      ifscCode: formIfscCode,
      panTaxId: formPanTaxId,
      uanNumber: formUanNumber,
      month: formMonth,
      standardDays: Number(formStandardDays) || 30,
      payableDays: Number(formPayableDays) || 30,
      lopDays: Number(formLopDays) || 0,
      lopReversalDays: Number(formLopReversalDays) || 0,
      arrearDays: Number(formArrearDays) || 0,
      earningsList: formEarnings,
      deductionsList: formDeductions,
      grossEarnings,
      totalDeductions,
      netPay,
      netPayInWords,
      status: 'Draft',
    }
    setPreviewRecord({ record: syntheticRecord, employee: emp })
  }

  // Open Preview for saved record
  const handlePreviewRecord = (record) => {
    const emp = findEmployeeForUser({ id: record.employeeId, employeeId: record.employeeId, name: record.employeeName }, employees) ||
                employees.find((e) => String(e._id || e.id) === String(record.employeeId) || String(e.employeeId || '').toUpperCase() === String(record.employeeId || '').toUpperCase() || String(e._id || e.id) === String(record.employeeRef)) ||
                employees.find((e) => e.name === record.employeeName) || user
    setPreviewRecord({ record, employee: emp })
  }

  // Email payslip
  const handleEmailPayslip = async (record) => {
    if (!confirm('Send payslip via email to the employee?')) return
    try {
      setActionInProgress(true)
      await hrStore.emailPayslip(record._id || record.id)
      alert('Payslip email sent successfully.')
    } catch (err) {
      alert(err.message || 'Failed to send email.')
    } finally {
      setActionInProgress(false)
    }
  }

  // Download PDF
  const handleDownloadPDF = async (record) => {
    const emp = findEmployeeForUser({ id: record.employeeId, employeeId: record.employeeId, name: record.employeeName }, employees) || employees.find((e) => String(e._id || e.id) === String(record.employeeId) || String(e.employeeId || '').toUpperCase() === String(record.employeeId || '').toUpperCase() || String(e._id || e.id) === String(record.employeeRef)) || {}
    try {
      setActionInProgress(true)
      await downloadPayslipDocument(record, emp, companySettings)
    } catch (err) {
      console.error('Download failed, opening preview:', err)
      handlePreviewRecord(record)
    } finally {
      setActionInProgress(false)
    }
  }

  // Print Record directly
  const handlePrintRecord = (record) => {
    const emp = findEmployeeForUser({ id: record.employeeId, employeeId: record.employeeId, name: record.employeeName }, employees) || employees.find((e) => String(e._id || e.id) === String(record.employeeId) || String(e.employeeId || '').toUpperCase() === String(record.employeeId || '').toUpperCase() || String(e._id || e.id) === String(record.employeeRef)) || {}
    printPayslipDocument(record, emp, companySettings)
  }

  // Quick stats
  const totalDisbursed = useMemo(() => {
    return filteredRecords.reduce((acc, r) => acc + (Number(r.netPay) || Number(r.netSalary) || 0), 0)
  }, [filteredRecords])

  const totalGross = useMemo(() => {
    return filteredRecords.reduce((acc, r) => acc + (Number(r.grossEarnings) || Number(r.grossSalary) || 0), 0)
  }, [filteredRecords])

  return (
    <div className="payroll-workspace">
      
      {/* 1. Header Bar */}
      <PageHeader
        eyebrow={isEmployeeRole ? 'Employee Self Service' : 'Financial Operations'}
        title={isEmployeeRole ? 'My Payslips & Compensation' : 'Enterprise Payroll & Payslip Generator'}
        description={
          isEmployeeRole
            ? 'Access and download verified monthly corporate salary slips and tax statements'
            : 'Generate, manage, preview and disburse professional A4 corporate payslips'
        }
      >
        {!isEmployeeRole && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="ui-button secondary"
            >
              <Settings size={14} />
              Company Branding
            </button>

            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="ui-button secondary"
            >
              <Users size={14} />
              Bulk Generate
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingRecordId(null)
                setActiveTab('generate')
              }}
              className="ui-button primary"
            >
              <Plus size={14} />
              Create Payslip
            </button>
          </div>
        )}
      </PageHeader>

      {/* 2. Notice / Feedback Banner */}
      {savingNotice && (
        <div style={{
          background: '#eaf4f1',
          border: '1px solid #c7ded7',
          color: '#1d8a7a',
          padding: '12px 18px',
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={16} />
          <span>{savingNotice}</span>
        </div>
      )}

      {/* 3. Metric KPI Cards (Admin/HR) */}
      {!isEmployeeRole && (
        <section className="metric-grid">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
              <DollarSign size={18} />
            </div>
            <div className="metric-copy">
              <span>Total Net Disbursed</span>
              <strong>₹{formatINR(totalDisbursed)}</strong>
              <small>For selected filter</small>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#e8eff8', color: 'var(--blue)' }}>
              <TrendingUp size={18} />
            </div>
            <div className="metric-copy">
              <span>Gross Payroll</span>
              <strong>₹{formatINR(totalGross)}</strong>
              <small>Before statutory deductions</small>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#eaf4f1', color: '#16a34a' }}>
              <FileText size={18} />
            </div>
            <div className="metric-copy">
              <span>Payslips Generated</span>
              <strong>{filteredRecords.length}</strong>
              <small>Records in registry</small>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#f9f0da', color: 'var(--gold)' }}>
              <Users size={18} />
            </div>
            <div className="metric-copy">
              <span>Active Employees</span>
              <strong>{employees.filter((e) => e.status !== 'inactive').length}</strong>
              <small>Eligible for payroll</small>
            </div>
          </div>
        </section>
      )}

      {/* 4. Tab Navigation (Admin/HR) */}
      {!isEmployeeRole && (
        <div className="payroll-tabs-bar">
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={'payroll-tab-btn' + (activeTab === 'records' ? ' active' : '')}
          >
            <FileText size={14} />
            Payslips Registry ({payrollRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={'payroll-tab-btn' + (activeTab === 'generate' ? ' active' : '')}
          >
            <Plus size={14} />
            {editingRecordId ? 'Edit / Adjust Payslip' : 'Create / Adjust Payslip'}
          </button>
        </div>
      )}

      {/* TAB 1: GENERATE / EDIT PAYSLIP FORM */}
      {!isEmployeeRole && activeTab === 'generate' && (
        <section className="panel" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--line)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                {editingRecordId ? 'Update Employee Payslip' : 'Generate Corporate Payslip'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                Customize earnings, statutory deductions and attendance parameters before generating the official document
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePreviewCurrentForm}
                className="ui-button secondary"
              >
                <Eye size={13} />
                Preview Payslip
              </button>
              <button
                type="button"
                onClick={handleSavePayslip}
                disabled={actionInProgress}
                className="ui-button primary"
              >
                <CheckCircle2 size={13} />
                {actionInProgress ? 'Saving...' : editingRecordId ? 'Save Changes' : 'Generate & Save'}
              </button>
            </div>
          </div>

          {/* Basic Info: Employee & Month & Company */}
          <div className="payroll-form-grid">
            <div className="payroll-form-field">
              <label>Select Employee *</label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
              >
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.employeeId || emp.code || 'EMP'} - {emp.name} ({emp.designation || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div className="payroll-form-field">
              <PayrollMonthPicker
                label="Payroll Month *"
                value={formMonth}
                onChange={(newMonth) => {
                  setFormMonth(newMonth)
                  const d = getDaysInMonth(newMonth)
                  setFormStandardDays(d)
                  setFormPayableDays(Math.max(0, d - formLopDays + formLopReversalDays + formArrearDays))
                }}
                existingRecords={payrollRecords}
                showPresets={true}
                showSteppers={true}
              />
            </div>

            <div className="payroll-form-field">
              <label>Office Branch & Location *</label>
              {!isCustomBranch ? (
                <div style={{ display: 'grid', gap: '6px' }}>
                  <select
                    value={branches.includes(formBranch) ? formBranch : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomBranch(true)
                        setCustomBranchInput('')
                      } else {
                        setFormBranch(e.target.value)
                      }
                    }}
                  >
                    {branches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom Branch...</option>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Enter new custom branch name..."
                      value={customBranchInput}
                      onChange={(e) => setCustomBranchInput(e.target.value)}
                      autoFocus
                      style={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const trimmed = customBranchInput.trim()
                          if (trimmed) {
                            setUserCustomBranches((prev) => Array.from(new Set([...prev, trimmed])))
                            setFormBranch(trimmed)
                            setIsCustomBranch(false)
                            setCustomBranchInput('')
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="ui-button primary"
                      style={{ fontSize: '11px', padding: '6px 12px', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        const trimmed = customBranchInput.trim()
                        if (trimmed) {
                          setUserCustomBranches((prev) => Array.from(new Set([...prev, trimmed])))
                          setFormBranch(trimmed)
                          setIsCustomBranch(false)
                          setCustomBranchInput('')
                        }
                      }}
                      disabled={!customBranchInput.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="ui-button secondary"
                      style={{ fontSize: '11px', padding: '6px 10px', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        setIsCustomBranch(false)
                        setFormBranch(branches[0] || 'Bengaluru HQ')
                        setCustomBranchInput('')
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Type your custom branch name and click <strong>Add</strong> to use it.
                  </span>
                </div>
              )}
            </div>

            <div className="payroll-form-field">
              <label>Company Profile</label>
              <div style={{
                minHeight: '38px',
                padding: '0 12px',
                background: '#f8fafc',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Building2 size={14} style={{ color: 'var(--teal)' }} />
                <span style={{ fontWeight: 600 }}>{companySettings.companyName || 'Default Company'}</span>
              </div>
            </div>
          </div>

          {/* Attendance Days Parameters */}
          <div className="attendance-parameters-card">
            <h3>
              <Calendar size={14} />
              Attendance & Payable Days Parameters
            </h3>
            <div className="attendance-inputs-row">
              <div>
                <label>Standard Days</label>
                <input
                  type="number"
                  value={formStandardDays}
                  onChange={(e) => setFormStandardDays(e.target.value)}
                />
              </div>
              <div>
                <label>Payable Days</label>
                <input
                  type="number"
                  value={formPayableDays}
                  onChange={(e) => setFormPayableDays(e.target.value)}
                />
              </div>
              <div>
                <label>Loss of Pay (LOP)</label>
                <input
                  type="number"
                  value={formLopDays}
                  onChange={(e) => setFormLopDays(e.target.value)}
                />
              </div>
              <div>
                <label>LOP Reversal Days</label>
                <input
                  type="number"
                  value={formLopReversalDays}
                  onChange={(e) => setFormLopReversalDays(e.target.value)}
                />
              </div>
              <div>
                <label>Arrear Days</label>
                <input
                  type="number"
                  value={formArrearDays}
                  onChange={(e) => setFormArrearDays(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Two-Column Payroll Table: Earnings (Left) vs Deductions (Right) */}
          <div className="payroll-two-col-grid">
            {/* Earnings Column */}
            <div className="payroll-table-box">
              <div className="payroll-table-box-header">
                <h3>Earnings Components</h3>
                <button
                  type="button"
                  onClick={addEarningRow}
                  className="ui-button secondary"
                  style={{ minHeight: '28px', padding: '0 10px', fontSize: '11px' }}
                >
                  <Plus size={12} /> Add Component
                </button>
              </div>
              <div className="payroll-components-wrap">
                <div className="payroll-components-list">
                  <div className="payroll-component-header">
                    <span>Component</span>
                    <span style={{ textAlign: 'right' }}>Rate</span>
                    <span style={{ textAlign: 'right' }}>Current</span>
                    <span style={{ textAlign: 'right' }}>Arrear</span>
                    <span style={{ textAlign: 'right' }}>Total</span>
                    <span></span>
                  </div>
                  {formEarnings.map((row, idx) => (
                    <div key={idx} className="payroll-component-row">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateEarningRow(idx, 'name', e.target.value)}
                        placeholder="Component name"
                      />
                      <input
                        type="number"
                        style={{ textAlign: 'right' }}
                        value={row.monthlyRate}
                        onChange={(e) => updateEarningRow(idx, 'monthlyRate', e.target.value)}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        style={{ textAlign: 'right' }}
                        value={row.currentMonth}
                        onChange={(e) => updateEarningRow(idx, 'currentMonth', e.target.value)}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        style={{ textAlign: 'right' }}
                        value={row.arrear}
                        onChange={(e) => updateEarningRow(idx, 'arrear', e.target.value)}
                        placeholder="0"
                      />
                      <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '11px', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                        ₹{formatINR(row.total)}
                      </div>
                      {formEarnings.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeEarningRow(idx)}
                          className="payroll-icon-btn danger"
                          style={{ width: '26px', height: '26px', flexShrink: 0 }}
                          title="Delete Row"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <div style={{ width: '26px' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="payroll-total-footer">
                <span style={{ color: '#586D72', textTransform: 'uppercase', fontSize: '11px' }}>Gross Earnings</span>
                <span style={{ fontSize: '14px', color: 'var(--ink)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ₹{formatINR(grossEarnings)}
                </span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="payroll-table-box">
              <div className="payroll-table-box-header">
                <h3>Deductions Components</h3>
                <button
                  type="button"
                  onClick={addDeductionRow}
                  className="ui-button secondary"
                  style={{ minHeight: '28px', padding: '0 10px', fontSize: '11px' }}
                >
                  <Plus size={12} /> Add Component
                </button>
              </div>
              <div className="payroll-components-wrap">
                <div className="payroll-components-list deductions-list">
                  <div className="payroll-component-header deduction">
                    <span>Component</span>
                    <span style={{ textAlign: 'right' }}>Amount</span>
                    <span></span>
                  </div>
                  {formDeductions.map((row, idx) => (
                    <div key={idx} className="payroll-component-row deduction">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateDeductionRow(idx, 'name', e.target.value)}
                        placeholder="Deduction name"
                      />
                      <input
                        type="number"
                        style={{ textAlign: 'right' }}
                        value={row.amount}
                        onChange={(e) => updateDeductionRow(idx, 'amount', e.target.value)}
                        placeholder="0"
                      />
                      {formDeductions.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeDeductionRow(idx)}
                          className="payroll-icon-btn danger"
                          style={{ width: '26px', height: '26px', flexShrink: 0 }}
                          title="Delete Row"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <div style={{ width: '26px' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="payroll-total-footer">
                <span style={{ color: '#586D72', textTransform: 'uppercase', fontSize: '11px' }}>Total Deductions</span>
                <span style={{ fontSize: '14px', color: '#DC2E3F', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ₹{formatINR(totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay & Words Banner */}
          <div className="payroll-net-banner">
            <div>
              <span className="net-kicker">Net Payable Salary</span>
              <div className="net-amount">₹{formatINR(netPay)}</div>
              <div className="net-words">({netPayInWords} ONLY)</div>
            </div>
            <div className="payroll-net-banner-actions">
              <button
                type="button"
                onClick={handlePreviewCurrentForm}
                className="ui-button secondary"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <Eye size={14} /> Preview A4 Payslip
              </button>
              <button
                type="button"
                onClick={handleSavePayslip}
                disabled={actionInProgress}
                className="ui-button primary"
                style={{ background: '#7ef0c8', color: '#0b3155', fontWeight: 700 }}
              >
                <CheckCircle2 size={14} /> Save Record
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2 / MAIN: PAYSLIPS REGISTRY (Admin/HR & Employee ESS) */}
      {(isEmployeeRole || activeTab === 'records') && (
        <section className="panel" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Filter toolbar */}
          <div className="payroll-filter-toolbar">
            <div className="payroll-filter-group">
              <div className="payroll-search-input">
                <Search size={14} style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee or month..."
                />
              </div>

              <PayrollMonthPicker
                value={selectedMonth}
                onChange={(m) => setSelectedMonth(m)}
                allowAll={true}
                allLabel="All Months"
                existingRecords={payrollRecords}
                showPresets={false}
                showSteppers={true}
              />

              {!isEmployeeRole && (
                <>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="payroll-select"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="payroll-select"
                  >
                    <option value="all">All Branches</option>
                    {branches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!isEmployeeRole && (
                <button
                  type="button"
                  onClick={handleFinalizeMonth}
                  disabled={actionInProgress}
                  className="ui-button primary"
                  style={{ minHeight: '32px', padding: '0 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Finalize drafts and disburse for this month"
                >
                  <CheckCircle2 size={13} />
                  Finalize {selectedMonth !== 'all' ? selectedMonth : 'Current'} Drafts
                </button>
              )}
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>
                Showing {filteredRecords.length} payslip{filteredRecords.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Registry Table */}
          {filteredRecords.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#94a3b8',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 12px'
              }}>
                <FileText size={20} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: 'var(--ink)' }}>
                No payslips found {selectedMonth !== 'all' ? `for ${selectedMonth}` : ''}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', maxWidth: '440px', margin: '0 auto' }}>
                {isEmployeeRole
                  ? `No payslips have been generated for your profile ${selectedMonth !== 'all' ? `for ${selectedMonth}` : 'yet'}.`
                  : `No payslip records match ${selectedMonth !== 'all' ? `"${selectedMonth}"` : 'the selected filters'}. You can create or bulk generate for this period.`}
              </p>
              {!isEmployeeRole && selectedMonth !== 'all' && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFormMonth(selectedMonth)
                      const d = getDaysInMonth(selectedMonth)
                      setFormStandardDays(d)
                      setFormPayableDays(d)
                      setActiveTab('generate')
                    }}
                    className="ui-button primary"
                    style={{ fontSize: '12px' }}
                  >
                    <Plus size={13} />
                    Create Payslip for {selectedMonth}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    className="ui-button secondary"
                    style={{ fontSize: '12px' }}
                  >
                    <Users size={13} />
                    Bulk Generate for {selectedMonth}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Employee</th>
                    <th style={{ width: '16%' }}>Month</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Gross</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Deductions</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Net Pay</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => {
                    const emp = findEmployeeForUser({ id: r.employeeId, employeeId: r.employeeId, name: r.employeeName }, employees) ||
                                employees.find((e) => String(e._id || e.id) === String(r.employeeId) || String(e.employeeId || '').toUpperCase() === String(r.employeeId || '').toUpperCase() || String(e._id || e.id) === String(r.employeeRef)) || {}
                    const gross = Number(r.grossEarnings || r.grossSalary || 0)
                    const deductions = Number(r.totalDeductions || r.totalDeduction || 0)
                    const net = Number(r.netPay || r.netSalary || 0)
                    const visibleAccount = unmaskBankAccount(r.accountNumber || emp.bankDetails?.accountNumber || emp.accountNumber, '50100488577650')
                    const isDraft = String(r.status || '').toLowerCase() === 'draft'

                    return (
                      <tr key={r._id || r.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ink)' }}>{emp?.name || r.employeeName || 'Employee'}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                            {emp?.employeeId || r.employeeId || 'EMP'} • {emp?.department || r.department || 'General'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#006E6F', fontWeight: 600, marginTop: '2px' }}>
                            📍 {normalizeBranch(r.branch || r.location || emp?.location || emp?.branch || companySettings.defaultBranch)}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 600, marginTop: '2px' }}>
                            A/C: {visibleAccount}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{r.month}</td>
                        <td style={{ textAlign: 'right', fontWeight: 500, fontSize: '13.5px', color: 'var(--muted)' }}>
                          ₹{formatINR(gross)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500, fontSize: '13.5px', color: '#e11d48' }}>
                          -₹{formatINR(deductions)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '13.5px', color: 'var(--ink)' }}>
                          ₹{formatINR(net)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <StatusBadge tone={isDraft ? 'gold' : 'teal'}>
                            {isDraft ? 'Draft' : 'Disbursed'}
                          </StatusBadge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="payroll-action-icons">
                            <button
                              type="button"
                              onClick={() => handlePreviewRecord(r)}
                              title="Preview A4 Payslip"
                              className="payroll-icon-btn primary"
                            >
                              <Eye size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(r)}
                              title="Download PDF"
                              className="payroll-icon-btn"
                            >
                              <Download size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePrintRecord(r)}
                              title="Print Payslip"
                              className="payroll-icon-btn"
                            >
                              <Printer size={13} />
                            </button>

                            {!isEmployeeRole && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEmailPayslip(r)}
                                  title="Email Payslip to Employee"
                                  className="payroll-icon-btn"
                                >
                                  <Mail size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEditRecord(r)}
                                  title="Edit / Adjust"
                                  className="payroll-icon-btn"
                                >
                                  <SlidersHorizontal size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(r)}
                                  title="Delete Payslip"
                                  className="payroll-icon-btn danger"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* MODAL 1: A4 PAYSLIP PREVIEW */}
      {previewRecord && (
        <PayslipPreviewModal
          record={previewRecord.record}
          employee={previewRecord.employee}
          settings={companySettings}
          onClose={() => setPreviewRecord(null)}
          canEmail={!isEmployeeRole}
        />
      )}

      {/* MODAL 2: COMPANY BRANDING & SETTINGS */}
      {showSettingsModal && (
        <CompanySettingsModal
          settings={companySettings}
          onSave={async (newSettings) => {
            await hrStore.updateCompanySettings(newSettings)
            setShowSettingsModal(false)
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* MODAL 3: BULK GENERATE PAYSLIPS */}
      {showBulkModal && (
        <BulkGenerateModal
          employees={employees}
          onGenerate={async (payload) => {
            const res = await hrStore.bulkGeneratePayroll(payload)
            setShowBulkModal(false)
            setSavingNotice(res?.message || 'Bulk payslip generation completed successfully.')
            setTimeout(() => setSavingNotice(null), 4500)
            setActiveTab('records')
            return res
          }}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </div>
  )
}
