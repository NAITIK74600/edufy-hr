import { useEffect, useState, useRef, useMemo } from 'react'
import {
  AlertTriangle,
  Clock,
  FileCheck,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Edit3,
  ExternalLink,
  FileText,
  Lock,
  Mail,
  Phone,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { OnboardingDossierView } from '../components/OnboardingDossierView'
import { EmployeeComplianceStatusCard } from '../components/EmployeeComplianceStatusCard'
import { SalaryBreakdownFields } from '../components/common/SalaryBreakdownFields'
import { normalizeSalaryStructure } from '../utils/salaryCalculator'
import { useAuth } from '../auth/AuthContext'
import { hasPermission } from '../auth/permissions'
import { hrStore, storeAction, getRecommendedRoleConfig } from '../services/hrStore'
import { generateNextEmployeeCode, generateAutoPassword, formatCredentialsShareText, copyTextToClipboard } from '../utils/credentialsHelper'
import { formatINR } from '../utils/currency'
import {
  Button,
  ConfirmationDialog,
  DataTable,
  EmptyState,
  Field,
  PageHeader,
  StatePanel,
  StatusBadge,
} from '../components/ui'

const emptyFilters = {
  search: '',
  department: '',
  designation: '',
  campus: '',
  employmentType: '',
  status: '',
  page: 1,
  limit: 10,
}

export const CAMPUSES = [
  'Ignite Campus',
  'Velocity Hub',
]

export const EMPLOYMENT_TYPES = [
  { id: 'full_time', label: 'Full-Time Staff' },
  { id: 'intern', label: 'Intern / Trainee' },
]

const statusLabels = {
  invited: 'Invited',
  active: 'Active',
  inactive: 'Inactive',
  onboarding: 'Onboarding',
  notice: 'Notice Period',
}

const DEPARTMENTS = {
  map: (...args) => hrStore.getDepartments().map((d) => d.name).map(...args),
  filter: (...args) => hrStore.getDepartments().map((d) => d.name).filter(...args),
  includes: (...args) => hrStore.getDepartments().map((d) => d.name).includes(...args),
  forEach: (...args) => hrStore.getDepartments().map((d) => d.name).forEach(...args),
  get length() {
    return hrStore.getDepartments().length
  },
  [Symbol.iterator]: function* () {
    yield* hrStore.getDepartments().map((d) => d.name)
  },
}

const BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
]

function EmployeeAvatar({ name }) {
  return (
    <span className="avatar avatar-teal">
      {String(name ?? '?')
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()}
    </span>
  )
}

const workforcePath = (suffix) => `#/${window.location.hash.startsWith('#/admin') ? 'admin' : 'hr'}${suffix}`

function EmployeeDirectory({ route } = {}) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('directory') // 'directory' | 'onboarding' | 'exit'
  const [filters, setFilters] = useState(emptyFilters)
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [feedbackMessage, setFeedbackMessage] = useState('')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalActiveTab, setModalActiveTab] = useState('basic') // 'basic' | 'identity' | 'bank' | 'education' | 'family'

  const allEmployees = storeState.employees || []

  const allRoleOptions = useMemo(() => {
    const list = storeState.roles?.length ? storeState.roles : (hrStore.getRoles ? hrStore.getRoles() : [])
    return list.map((r) => ({ id: r.id || r.roleId, name: r.name || r.label || r.id }))
  }, [storeState.roles])

  const defaultNewForm = {
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    campus: 'Ignite Campus',
    employmentType: 'full_time',
    department: 'Technology',
    team: '',
    teamId: '',
    teamLeadId: '',
    teamLeadName: '',
    designation: '',
    role: 'employee',
    status: 'active',
    salary: '',
    salaryStructure: { basic: '', hra: '', conveyance: '', ca: '', specialAllowance: '', sa: '', otherAllowance: '', oa: '' },
    joiningDate: new Date().toISOString().split('T')[0],
    managerId: '',
    managerName: '',
    // Official Banking & Statutory Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panTaxId: '',
    hasExistingUan: false,
    uanNumber: '',
  }
  const [newEmpForm, setNewEmpForm] = useState(defaultNewForm)
  const [createdCredentials, setCreatedCredentials] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null)
  const [emailMessage, setEmailMessage] = useState('')

  function openAddModal() {
    const nextCode = generateNextEmployeeCode(allEmployees, storeState.users)
    const autoPass = generateAutoPassword()
    setNewEmpForm({ ...defaultNewForm, employeeId: nextCode, password: autoPass })
    setModalActiveTab('basic')
    setShowAddModal(true)
  }

  useEffect(() => {
    if (route?.path?.endsWith('/new') || (typeof window !== 'undefined' && window.location.hash.includes('/people/new'))) {
      openAddModal()
    }
  }, [route?.path])
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [rejectingEmp, setRejectingEmp] = useState(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')

  // Exit management modal
  const [showExitModal, setShowExitModal] = useState(false)
  const defaultExitForm = {
    employeeId: '',
    reason: 'Career Growth & Better Opportunity',
    noticePeriodDays: '30',
    lastWorkingDay: (() => {
      const d = new Date()
      d.setDate(d.getDate() + 30)
      return d.toISOString().split('T')[0]
    })(),
    handoverAssignee: '',
    comments: '',
  }
  const [exitForm, setExitForm] = useState(defaultExitForm)

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  function showFeedback(msg) {
    setFeedbackMessage(msg)
    setTimeout(() => setFeedbackMessage(''), 4500)
  }

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: 1 }))

  // Managers list for dropdowns
  const availableManagers = allEmployees.filter(
    (e) => e.status === 'active' && [
      'director', 'manager', 'admin', 'hr', 'team_lead', 'team_leader',
      'senior_manager', 'general_manager', 'assistant_general_manager',
      'head_of_sales', 'head_of_marketing', 'vertical_head', 'managing_director',
    ].includes(e.role)
  )

  const filteredEmployees = allEmployees.filter((emp) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !emp.name.toLowerCase().includes(q) &&
        !emp.email.toLowerCase().includes(q) &&
        !emp.employeeId.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    if (filters.status === 'notice' ? !emp.exitDetails || emp.status === 'inactive' : filters.status && emp.status !== filters.status) return false
    if (filters.department && !String(emp.department ?? '').toLowerCase().includes(filters.department.toLowerCase())) return false
    if (filters.designation && !String(emp.designation ?? '').toLowerCase().includes(filters.designation.toLowerCase())) return false
    if (filters.campus && (emp.campus || 'Ignite Campus') !== filters.campus) return false
    if (filters.employmentType) {
      const isIntern = String(emp.employmentType || '').toLowerCase().includes('intern') ||
        String(emp.role || '').toLowerCase().includes('intern') ||
        String(emp.designation || '').toLowerCase().includes('intern')
      if (filters.employmentType === 'intern' && !isIntern) return false
      if (filters.employmentType === 'full_time' && isIntern) return false
    }
    return true
  })

  // Onboarding employees
  const onboardingEmployees = allEmployees.filter(
    (e) => e.status === 'invited' || (e.onboardingChecklist && e.onboardingChecklist.some((it) => !it.completed))
  )

  // Exit employees
  const exitEmployees = allEmployees.filter((e) => e.status === 'notice' || e.exitDetails)

  // Employees with onboarding documents awaiting HR approval
  const pendingApprovalEmployees = allEmployees.filter((e) => {
    if (e.onboardingStatus === 'verified') return false
    if (e.onboardingStatus === 'action_required' || e.onboardingStatus === 'revision_requested') return false
    if (e.onboardingStatus === 'submitted' || e.onboardingStatus === 'in_review') return true
    if (e.onboardingDocs && typeof e.onboardingDocs === 'object') {
      const hasPendingDoc = Object.values(e.onboardingDocs).some(
        (d) => d && typeof d === 'object' && (d.fileName || d.url || d.submittedAt) && d.status !== 'verified' && d.status !== 'rejected'
      )
      if (hasPendingDoc) return true
    }
    return false
  })

  const handleCreateEmployee = storeAction(async (e) => {
    e.preventDefault()
    if (!newEmpForm.name || !newEmpForm.email) {
      showFeedback('Please provide employee full name and work email.')
      return
    }

    const finalEmpCode = (newEmpForm.employeeId && newEmpForm.employeeId.trim())
      ? newEmpForm.employeeId.trim().toUpperCase()
      : generateNextEmployeeCode(allEmployees, storeState.users)

    const finalPassword = (newEmpForm.password && newEmpForm.password.trim().length >= 8)
      ? newEmpForm.password.trim()
      : generateAutoPassword()

    const mgr = allEmployees.find((m) => m.id === newEmpForm.managerId || m.employeeId === newEmpForm.managerId)
    const empData = {
      ...newEmpForm,
      campus: newEmpForm.campus || 'Ignite Campus',
      location: newEmpForm.campus || newEmpForm.location || 'Ignite Campus',
      employmentType: newEmpForm.employmentType || (newEmpForm.role?.includes('intern') ? 'intern' : 'full_time'),
      employeeId: finalEmpCode,
      password: finalPassword,
      managerName: mgr?.name || '',
      salary: Number(newEmpForm.salary) || 0,
      salaryStructure: newEmpForm.salaryStructure || {},
      bankDetails: {
        bankName: newEmpForm.bankName,
        accountNumber: newEmpForm.accountNumber,
        ifscCode: newEmpForm.ifscCode,
        panTaxId: newEmpForm.panTaxId,
        uanNumber: newEmpForm.hasExistingUan ? newEmpForm.uanNumber : '',
      },
      onboardingStatus: 'draft',
    }

    try {
      const created = await hrStore.addEmployee(empData)
      setShowAddModal(false)
      setNewEmpForm(defaultNewForm)
      setModalActiveTab('basic')
      setCopySuccess(false)
      setSendingEmail(false)
      setEmailStatus('success')
      setEmailMessage(`Official credentials email automatically dispatched directly to ${created?.email || empData.email}!`)
      setCreatedCredentials({
        name: created?.name || empData.name,
        email: created?.email || empData.email,
        employeeId: created?.employeeId || finalEmpCode,
        role: created?.role || empData.role || 'employee',
        password: created?.temporaryPassword || finalPassword,
      })
      showFeedback(`Successfully registered ${created?.name || empData.name} (${created?.employeeId || finalEmpCode}). Welcome email dispatched directly.`)
    } catch (err) {
      showFeedback(`Failed to add employee: ${err.message}`)
    }
  })

  function startEditEmployee(emp) {
    const isDir = emp.role === 'director' || emp.email === 'jagadishbabu@edufyitech.in' || emp.email === 'director@edufyitech.in'
    const cleanDept = isDir ? 'Executive' : (emp.department || 'Executive')
    const rec = getRecommendedRoleConfig(emp.role, cleanDept)
    const isInternEmp = String(emp.employmentType || '').toLowerCase().includes('intern') ||
      String(emp.role || '').toLowerCase().includes('intern') ||
      String(emp.designation || '').toLowerCase().includes('intern')
    setEditingEmployee({
      ...emp,
      campus: emp.campus || 'Ignite Campus',
      employmentType: emp.employmentType || (isInternEmp ? 'intern' : 'full_time'),
      department: cleanDept,
      designation: isDir ? (emp.designation && emp.designation.toLowerCase().includes('director') ? emp.designation : 'Managing Director') : (emp.designation || rec.designation),
      bankName: emp.bankDetails?.bankName || '',
      accountNumber: emp.bankDetails?.accountNumber || '',
      ifscCode: emp.bankDetails?.ifscCode || '',
      panTaxId: emp.bankDetails?.panTaxId || '',
      uanNumber: emp.bankDetails?.uanNumber || '',
      salary: emp.salary ?? '',
      salaryStructure: normalizeSalaryStructure(emp),
    })
  }

  const handleUpdateEmployee = storeAction(async (e) => {
    e.preventDefault()
    if (!editingEmployee || !editingEmployee.name || !editingEmployee.email) return

    const mgr = allEmployees.find((m) => m.id === editingEmployee.managerId || m.employeeId === editingEmployee.managerId)
    const updates = {
      ...editingEmployee,
      campus: editingEmployee.campus || 'Ignite Campus',
      location: editingEmployee.campus || editingEmployee.location || 'Ignite Campus',
      employmentType: editingEmployee.employmentType || (editingEmployee.role?.includes('intern') ? 'intern' : 'full_time'),
      managerName: mgr ? mgr.name : editingEmployee.managerName,
      salary: Number(editingEmployee.salary),
      salaryStructure: editingEmployee.salaryStructure || {},
    }

    await hrStore.updateEmployee(editingEmployee.id, updates)
    setEditingEmployee(null)
    showFeedback(`Updated profile for ${editingEmployee.name} (${editingEmployee.employeeId}).`)
  })

  const handleDeleteEmployee = storeAction(async () => {
    if (!employeeToDelete) return
    const empName = employeeToDelete.name
    const empCode = employeeToDelete.employeeId
    await hrStore.deleteEmployee(employeeToDelete.id, { force: true, purge: true })
    setEmployeeToDelete(null)
    showFeedback(`Permanently deleted ${empName} (${empCode}) and all of their linked records.`)
  })

  const handleRejectOnboarding = storeAction(async (e) => {
    e.preventDefault()
    if (!rejectingEmp || !rejectionReasonInput.trim()) {
      showFeedback('Please provide a specific rejection reason.')
      return
    }
    const targetId = rejectingEmp.id || rejectingEmp._id || rejectingEmp.employeeId
    try {
      if (hrStore.rejectOnboarding) {
        await hrStore.rejectOnboarding(targetId, rejectionReasonInput.trim())
      } else {
        await hrStore.updateOnboardingDocs(targetId, {
          onboardingStatus: 'action_required',
          onboardingRejectionReason: rejectionReasonInput.trim(),
        })
      }
    } catch {
      await hrStore.updateOnboardingDocs(targetId, {
        onboardingStatus: 'action_required',
        onboardingRejectionReason: rejectionReasonInput.trim(),
      })
    }
    showFeedback(`Requested onboarding revisions for ${rejectingEmp.name}: "${rejectionReasonInput.trim()}".`)
    setRejectingEmp(null)
    setRejectionReasonInput('')
  })

  const handleToggleStatus = storeAction(async (emp) => {
    const newStatus = await hrStore.toggleEmployeeStatus(emp.id)
    showFeedback(`Changed status for ${emp.name} to "${statusLabels[newStatus] || newStatus}".`)
  })

  const handleInitiateExit = storeAction(async (e) => {
    e.preventDefault()
    if (!exitForm.employeeId) return
    const emp = allEmployees.find((x) => x.id === exitForm.employeeId || x._id === exitForm.employeeId || x.employeeId === exitForm.employeeId)
    await hrStore.initiateExit(exitForm.employeeId, exitForm)
    setShowExitModal(false)
    setExitForm(defaultExitForm)
    setActiveTab('exit')
    showFeedback(`Exit process recorded in database for ${emp?.name || 'employee'}. Notice period and clearance tasks are now active.`)
  })

  const handleCancelExit = storeAction(async (emp) => {
    if (!confirm(`Cancel the exit process for ${emp.name}? This will reinstate them as an Active employee.`)) return
    await hrStore.cancelExit(emp.id)
    showFeedback(`Cancelled exit process. ${emp.name} is reinstated as Active.`)
  })

  const handleFinalizeExit = storeAction(async (emp) => {
    if (!confirm(`Finalize departure for ${emp.name}? This will complete offboarding and mark the employee as Inactive/Exited.`)) return
    await hrStore.finalizeExit(emp.id)
    showFeedback(`Finalized offboarding for ${emp.name}. Profile is now marked Exited (Inactive).`)
  })

  return (
    <>
      
      <PageHeader
        eyebrow="Workforce Operations"
        title="Employee Management"
        description="Manage employee profiles, corporate hierarchy, designations, and payroll compensation."
      >
        {hasPermission(user, 'employees.write') && (
          <Button onClick={openAddModal}>
            <Plus size={16} /> Add Employee
          </Button>
        )}
      </PageHeader>

      {/* Action Feedback Banner */}
      {feedbackMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--soft-teal)',
            border: '1px solid rgba(29, 138, 122, 0.3)',
            borderRadius: '9px',
            padding: '11px 16px',
            marginBottom: '18px',
            color: 'var(--teal)',
            fontSize: '11px',
            fontWeight: 600,
            animation: 'fadeUp 0.3s ease',
          }}
        >
          <CheckCircle2 size={16} />
          <span style={{ flex: 1 }}>{feedbackMessage}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage('')}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--teal)', fontSize: '13px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* PENDING ONBOARDING DOCUMENT APPROVALS NOTIFICATION BANNER */}
      {pendingApprovalEmployees.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(245, 158, 11, 0.12) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '18px',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#ea580c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#9a3412' }}>Document Approval Required</strong>
                <span
                  style={{
                    background: '#ea580c',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {pendingApprovalEmployees.length} Pending
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7c2d12', opacity: 0.95 }}>
                {pendingApprovalEmployees.length === 1
                  ? `${pendingApprovalEmployees[0].name} has submitted onboarding verification documents awaiting HR approval.`
                  : `${pendingApprovalEmployees.length} employees have submitted onboarding verification documents awaiting HR approval.`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="ui-button primary"
              onClick={() => setActiveTab('approvals')}
              style={{
                background: '#ea580c',
                borderColor: '#ea580c',
                color: '#fff',
                fontWeight: 600,
                fontSize: '12px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '7px',
              }}
            >
              Review Documents ({pendingApprovalEmployees.length})
            </button>
          </div>
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="subnav-tabs">
        <button
          type="button"
          className={`subnav-tab ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          <Users size={14} />
          <span>Employee Directory</span>
          <span className="badge-pill">{allEmployees.length}</span>
        </button>

        <button
          type="button"
          className={`subnav-tab ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
          style={{ position: 'relative' }}
        >
          <ShieldCheck size={14} />
          <span>Document Approvals</span>
          {pendingApprovalEmployees.length > 0 ? (
            <span
              style={{
                background: '#ea580c',
                color: '#ffffff',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 700,
                marginLeft: '6px',
              }}
            >
              {pendingApprovalEmployees.length}
            </span>
          ) : (
            <span className="badge-pill">0</span>
          )}
        </button>

        <button
          type="button"
          className={`subnav-tab ${activeTab === 'onboarding' ? 'active' : ''}`}
          onClick={() => setActiveTab('onboarding')}
        >
          <UserPlus size={14} />
          <span>Onboarding Pipeline</span>
          <span className="badge-pill">{onboardingEmployees.length}</span>
        </button>

        <button
          type="button"
          className={`subnav-tab ${activeTab === 'exit' ? 'active' : ''}`}
          onClick={() => setActiveTab('exit')}
        >
          <UserX size={14} />
          <span>Exit & Offboarding</span>
          <span className="badge-pill">{exitEmployees.length}</span>
        </button>
      </div>

      {/* TAB 1: DIRECTORY */}
      {activeTab === 'directory' && (
        <>
          <section className="employee-toolbar panel">
            <div className="employee-search">
              <Search size={16} />
              <input
                aria-label="Search employees"
                placeholder="Search by employee name, email, or ID..."
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
              />
            </div>
            <div className="employee-filters">
              <select
                aria-label="Filter by status"
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="notice">Notice Period</option>
                <option value="inactive">Inactive</option>
              </select>
              <input
                aria-label="Filter by department"
                placeholder="Department (e.g. Engineering)"
                value={filters.department}
                onChange={(event) => updateFilter('department', event.target.value)}
              />
              <input
                aria-label="Filter by designation"
                placeholder="Designation"
                value={filters.designation}
                onChange={(event) => updateFilter('designation', event.target.value)}
              />
              <select
                aria-label="Filter by campus"
                value={filters.campus}
                onChange={(event) => updateFilter('campus', event.target.value)}
              >
                <option value="">All campuses</option>
                <option value="Ignite Campus">Ignite Campus</option>
                <option value="Velocity Hub">Velocity Hub</option>
              </select>
              <select
                aria-label="Filter by employment type"
                value={filters.employmentType}
                onChange={(event) => updateFilter('employmentType', event.target.value)}
              >
                <option value="">All Types (Full-Time & Interns)</option>
                <option value="full_time">Full-Time Staff</option>
                <option value="intern">🎓 Interns Only</option>
              </select>
            </div>
          </section>

          <section className="panel employee-table-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Roster</p>
                <h2>{filteredEmployees.length} Registered Employees</h2>
              </div>
              <StatusBadge tone="info">Live Synced ({allEmployees.length} total)</StatusBadge>
            </div>

            {/* Mobile Card Grid (Visible on smaller screens) */}
            <div className="employee-cards-mobile" style={{ display: 'none', gap: '12px', marginTop: '14px' }}>
              {filteredEmployees.length === 0 ? (
                <EmptyState title="No employees found" message="Try clearing your search or filters." />
              ) : (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <EmployeeAvatar name={emp.name} />
                        <div>
                          <strong style={{ fontSize: '13px', display: 'block' }}>{emp.name}</strong>
                          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{emp.email}</small>
                        </div>
                      </div>
                      <StatusBadge
                        tone={
                          emp.status === 'active'
                            ? 'info'
                            : emp.status === 'notice'
                            ? 'warning'
                            : emp.status === 'onboarding'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {statusLabels[emp.status] ?? emp.status}
                      </StatusBadge>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', background: 'var(--surface-sunken)', padding: '8px 10px', borderRadius: '6px' }}>
                      <div><span style={{ color: 'var(--muted)' }}>ID: </span><strong>{emp.employeeId}</strong></div>
                      <div><span style={{ color: 'var(--muted)' }}>Campus: </span><strong style={{ color: 'var(--teal)' }}>{emp.campus || 'Ignite Campus'}</strong></div>
                      <div><span style={{ color: 'var(--muted)' }}>Dept: </span><strong>{emp.department}</strong></div>
                      <div><span style={{ color: 'var(--muted)' }}>Role: </span><strong>{emp.designation}</strong></div>
                      <div><span style={{ color: 'var(--muted)' }}>Type: </span><strong style={{ color: (emp.employmentType === 'intern' || String(emp.role || '').includes('intern') || String(emp.designation || '').toLowerCase().includes('intern')) ? '#0284c7' : 'inherit' }}>{(emp.employmentType === 'intern' || String(emp.role || '').includes('intern') || String(emp.designation || '').toLowerCase().includes('intern')) ? '🎓 Intern' : 'Full-Time'}</strong></div>
                      <div><span style={{ color: 'var(--muted)' }}>CTC: </span><strong style={{ color: 'var(--teal)' }}>{formatINR(emp.salary ?? 0)}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                      <a
                        className="emp-action-btn view"
                        href={workforcePath(`/people/${emp._id ?? emp.id}`)}
                        style={{ flex: '1 1 auto', justifyContent: 'center' }}
                      >
                        <ExternalLink size={12} /> View
                      </a>
                      {hasPermission(user, 'employees.write') && (
                        <>
                          <button
                            type="button"
                            className="emp-action-btn edit"
                            onClick={() => startEditEmployee(emp)}
                            style={{ flex: '1 1 auto', justifyContent: 'center' }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            className="emp-action-btn status-toggle"
                            onClick={() => handleToggleStatus(emp)}
                            style={{ flex: '1 1 auto', justifyContent: 'center' }}
                          >
                            <Power size={12} /> {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="employee-table-desktop">
              <DataTable
                caption="Employee directory"
                columns={[
                  {
                    key: 'employee',
                    label: 'Employee',
                    render: (employee) => (
                      <a className="employee-link" href={workforcePath(`/people/${employee._id ?? employee.id}`)}>
                        <EmployeeAvatar name={employee.name} />
                        <span>
                          <strong>{employee.name}</strong>
                          <small>{employee.email}</small>
                        </span>
                      </a>
                    ),
                  },
                  { key: 'employeeId', label: 'Employee ID' },
                  { key: 'department', label: 'Department' },
                  {
                    key: 'designation',
                    label: 'Designation',
                    render: (employee) => {
                      const isIntern = employee.employmentType === 'intern' ||
                        String(employee.role || '').toLowerCase().includes('intern') ||
                        String(employee.designation || '').toLowerCase().includes('intern')
                      return (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span>{employee.designation}</span>
                          {isIntern && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '1px 6px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                fontWeight: 700,
                                background: '#e0f2fe',
                                color: '#0284c7',
                                border: '1px solid #bae6fd',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              🎓 Intern
                            </span>
                          )}
                        </div>
                      )
                    },
                  },
                  {
                    key: 'campus',
                    label: 'Campus',
                    render: (e) => {
                      const isVelocity = (e.campus || '').toLowerCase().includes('velocity')
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: isVelocity ? '#eff6ff' : '#f0fdf4',
                            color: isVelocity ? '#1d4ed8' : '#15803d',
                            border: `1px solid ${isVelocity ? '#bfdbfe' : '#bbf7d0'}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {e.campus || 'Ignite Campus'}
                        </span>
                      )
                    },
                  },
                  {
                    key: 'salary',
                    label: 'Annual CTC',
                    render: (e) => (
                      <strong style={{ color: 'var(--teal)' }}>{formatINR(e.salary ?? 0)}</strong>
                    ),
                  },
                  {
                    key: 'onboardingDocs',
                    label: 'Onboarding / Documents',
                    render: (emp) => {
                      const isVerified = emp.onboardingStatus === 'verified'
                      const isSubmitted = emp.onboardingStatus === 'submitted' || emp.onboardingStatus === 'in_review'
                      if (isVerified) {
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        )
                      }
                      if (isSubmitted) {
                        return (
                          <a
                            href={workforcePath(`/people/${emp._id ?? emp.id}`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#fff7ed',
                              color: '#c2410c',
                              border: '1px solid #fed7aa',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                            title="Click to review submitted documents"
                          >
                            <Clock size={12} /> Needs Approval
                          </a>
                        )
                      }
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                          }}
                        >
                          Pending Upload
                        </span>
                      )
                    },
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (employee) => (
                      <StatusBadge
                        tone={
                          employee.status === 'active'
                            ? 'info'
                            : employee.status === 'notice'
                            ? 'warning'
                            : employee.status === 'onboarding'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {statusLabels[employee.status] ?? employee.status}
                      </StatusBadge>
                    ),
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (emp) => (
                      <div className="emp-action-group">
                        <a
                          className="emp-action-btn view"
                          href={workforcePath(`/people/${emp._id ?? emp.id}`)}
                          title="View Full Profile"
                        >
                          <ExternalLink size={12} /> View
                        </a>

                        {hasPermission(user, 'employees.write') && (
                          <>
                            <button
                              type="button"
                              className="emp-action-btn edit"
                              onClick={() => startEditEmployee(emp)}
                              title="Edit Employee"
                            >
                              <Edit3 size={12} /> Edit
                            </button>

                            {emp.status === 'notice' ? (
                              <button
                                type="button"
                                className="emp-action-btn edit"
                                style={{ color: '#d97706', borderColor: '#fde68a' }}
                                onClick={() => setActiveTab('exit')}
                                title="View Exit & Clearance details"
                              >
                                <UserX size={12} /> Notice
                              </button>
                            ) : emp.status === 'active' ? (
                              <button
                                type="button"
                                className="emp-action-btn edit"
                                onClick={() => {
                                  setExitForm({ employeeId: emp.id, reason: '', lastWorkingDay: '' })
                                  setShowExitModal(true)
                                }}
                                title="Initiate Exit / Offboarding"
                              >
                                <UserX size={12} /> Exit
                              </button>
                            ) : null}

                            <button
                              type="button"
                              className="emp-action-btn status-toggle"
                              onClick={() => handleToggleStatus(emp)}
                              title={emp.status === 'active' ? 'Deactivate Employee' : 'Activate Employee'}
                            >
                              <Power size={12} /> {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              className="emp-action-btn delete"
                              onClick={() => setEmployeeToDelete(emp)}
                              title="Permanently delete employee and linked records"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    ),
                  },
                ]}
                rows={filteredEmployees}
                emptyMessage="No employees match these filters."
              />
            </div>
          </section>
        </>
      )}

      {/* TAB: DOCUMENT APPROVALS & VERIFICATION */}
      {activeTab === 'approvals' && (
        <section className="panel" style={{ padding: '24px' }}>
          <div className="panel-heading" style={{ marginBottom: '16px' }}>
            <div>
              <p className="section-kicker">HR Compliance & Verification</p>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} style={{ color: 'var(--teal)' }} />
                Onboarding Document Approvals ({pendingApprovalEmployees.length} Pending)
              </h2>
            </div>
            <StatusBadge tone={pendingApprovalEmployees.length > 0 ? 'warning' : 'info'}>
              {pendingApprovalEmployees.length > 0 ? `${pendingApprovalEmployees.length} Awaiting Review` : 'All Verified'}
            </StatusBadge>
          </div>

          <p className="foundation-copy" style={{ marginBottom: '20px' }}>
            Review official identification proofs, educational certificates, and statutory submissions provided by employees. Approving verifies the documents and locks the profile from unauthorized employee modifications.
          </p>

          {pendingApprovalEmployees.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
              }}
            >
              <CheckCircle2 size={44} style={{ color: 'var(--teal)', margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#0f172a' }}>All Onboarding Documents Verified</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                There are no pending employee document approval requests at this time.
              </p>
              <button
                type="button"
                className="ui-button secondary"
                onClick={() => setActiveTab('directory')}
                style={{ marginTop: '16px' }}
              >
                Return to Employee Directory
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {pendingApprovalEmployees.map((emp) => {
                const docKeys = emp.onboardingDocs ? Object.keys(emp.onboardingDocs) : []
                const uploadedDocs = docKeys.filter((k) => emp.onboardingDocs[k]?.fileName || emp.onboardingDocs[k]?.url)

                return (
                  <div
                    key={emp.id}
                    style={{
                      border: '1px solid #fed7aa',
                      background: '#fffbf5',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: '0 2px 6px rgba(234, 88, 12, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <EmployeeAvatar name={emp.name} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{emp.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--muted)', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                              {emp.employeeId}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {emp.designation || 'Specialist'} · {emp.department} · {emp.email}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#ffedd5',
                            color: '#9a3412',
                            border: '1px solid #fed7aa',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          <Clock size={12} /> Awaiting HR Approval
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '10px 14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        <strong>{uploadedDocs.length} Documents Submitted</strong>
                        {uploadedDocs.length > 0 && (
                          <span style={{ color: '#64748b', marginLeft: '6px' }}>
                            ({uploadedDocs.slice(0, 3).join(', ')}{uploadedDocs.length > 3 ? ` +${uploadedDocs.length - 3} more` : ''})
                          </span>
                        )}
                        {emp.onboardingSubmittedAt && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            Submitted on: {new Date(emp.onboardingSubmittedAt).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          className="ui-button secondary"
                          href={workforcePath(`/people/${emp._id ?? emp.id}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            padding: '6px 12px',
                            textDecoration: 'none',
                          }}
                        >
                          <FileText size={13} /> Review Full Dossier
                        </a>

                        {hasPermission(user, 'employees.write') && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="ui-button secondary"
                              onClick={() => {
                                setRejectingEmp(emp)
                                setRejectionReasonInput('')
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                padding: '6px 12px',
                                borderColor: '#fca5a5',
                                color: '#b91c1c',
                                cursor: 'pointer',
                              }}
                            >
                              <AlertTriangle size={13} /> Reject / Request Revision
                            </button>
                            <button
                              type="button"
                              className="ui-button primary"
                              onClick={storeAction(async () => {
                                const targetId = emp.id || emp._id || emp.employeeId
                                try {
                                  if (hrStore.approveOnboarding) {
                                    await hrStore.approveOnboarding(targetId)
                                  } else {
                                    await hrStore.updateOnboardingDocs(targetId, {
                                      onboardingStatus: 'verified',
                                      onboardingVerifiedAt: new Date().toISOString(),
                                      onboardingVerifiedBy: user?.name || 'HR Lead',
                                    })
                                  }
                                } catch {
                                  const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {}
                                  for (const k of Object.keys(docs)) {
                                    if (docs[k] && typeof docs[k] === 'object') {
                                      docs[k] = { ...docs[k], status: 'verified', verifiedAt: new Date().toISOString(), verifiedBy: user?.name || 'HR Lead' }
                                    }
                                  }
                                  await hrStore.updateOnboardingDocs(targetId, { onboardingDocs: docs }).catch(() => {})
                                }
                                hrStore.clearError?.()
                                showFeedback(`Approved and verified all onboarding documents for ${emp.name}. Dossier is now marked verified.`)
                              })}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                padding: '6px 14px',
                                background: 'var(--teal)',
                                borderColor: 'var(--teal)',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <CheckCircle2 size={13} /> Quick Approve & Verify
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {rejectingEmp && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100005,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                display: 'grid',
                placeItems: 'center',
                padding: '20px',
              }}
              onClick={() => setRejectingEmp(null)}
            >
              <div
                className="panel"
                style={{
                  width: '92%',
                  maxWidth: '520px',
                  padding: '24px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'grid', placeItems: 'center' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                        Request Onboarding Revisions
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                        Employee: <strong>{rejectingEmp.name}</strong> ({rejectingEmp.employeeId})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setRejectingEmp(null)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleRejectOnboarding} style={{ display: 'grid', gap: '14px' }}>
                  <label style={{ display: 'grid', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                    Specific Rejection / Revision Reason *
                    <textarea
                      rows={4}
                      className="ui-input"
                      style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      placeholder="e.g. Aadhar card scan is missing back side. Please upload both sides in high resolution."
                      required
                      autoFocus
                    />
                  </label>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="ui-button secondary"
                      onClick={() => setRejectingEmp(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ui-button primary"
                      style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff', fontWeight: 600 }}
                      disabled={!rejectionReasonInput.trim()}
                    >
                      Confirm & Notify Employee
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: ONBOARDING PIPELINE */}
      {activeTab === 'onboarding' && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">New Hires</p>
              <h2>Onboarding Tracker ({onboardingEmployees.length} active)</h2>
            </div>
            <StatusBadge tone="info">Workflow Active</StatusBadge>
          </div>
          <p className="foundation-copy" style={{ margin: '10px 0 20px' }}>
            Track every new hire’s readiness before their day 1. Check off completed items directly to advance their status.
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {onboardingEmployees.length === 0 ? (
              <EmptyState title="No active onboarding tasks" message="All active employees have completed orientation." />
            ) : (
              onboardingEmployees.map((emp) => {
                const checklist = emp.onboardingChecklist || []
                const completedCount = checklist.filter((i) => i.completed).length
                const progressPct = checklist.length ? Math.round((completedCount / checklist.length) * 100) : 100

                return (
                  <div
                    key={emp.id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                      padding: '16px',
                      background: '#fffefa',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <EmployeeAvatar name={emp.name} />
                        <div>
                          <strong>{emp.name}</strong> •{' '}
                          <small style={{ color: 'var(--muted)' }}>
                            {emp.designation} ({emp.department})
                          </small>
                          <div style={{ fontSize: '10px', color: 'var(--teal)', marginTop: '2px' }}>
                            Joining Date: {emp.joiningDate}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <StatusBadge tone={progressPct === 100 ? 'info' : 'warning'}>
                          {completedCount}/{checklist.length} Completed ({progressPct}%)
                        </StatusBadge>
                      </div>
                    </div>

                    {/* Checklist Items */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px' }}>
                      {checklist.map((item) => (
                        <label
                          key={item.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '11px',
                            background: item.completed ? '#f0f8f5' : '#f7f6f2',
                            padding: '8px 12px',
                            borderRadius: '7px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={storeAction(() => hrStore.toggleOnboardingItem(emp.id, item.key))}
                          />
                          <span
                            style={{
                              textDecoration: item.completed ? 'line-through' : 'none',
                              color: item.completed ? 'var(--teal)' : 'var(--ink)',
                            }}
                          >
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      )}

      {/* TAB 3: EXIT MANAGEMENT */}
      {activeTab === 'exit' && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Offboarding</p>
              <h2>Exit Management & Departures</h2>
            </div>
            {hasPermission(user, 'employees.write') && (
              <Button onClick={() => setShowExitModal(true)}>
                <UserX size={15} /> Initiate Exit Process
              </Button>
            )}
          </div>
          <p className="foundation-copy" style={{ margin: '10px 0 20px' }}>
            Manage resignations, notice period commitments, handover task assignments, exit interviews, and clearance.
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {exitEmployees.length === 0 ? (
              <EmptyState title="No active exit processes" message="Employees serving notice period will appear here." />
            ) : (
              exitEmployees.map((emp) => (
                <div
                  key={emp.id}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    padding: '16px',
                    background: '#fffefa',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <EmployeeAvatar name={emp.name} />
                      <div>
                        <strong>{emp.name}</strong> •{' '}
                        <small style={{ color: 'var(--muted)' }}>
                          {emp.designation} ({emp.department})
                        </small>
                        <div style={{ fontSize: '10px', color: 'var(--coral)', marginTop: '2px' }}>
                          Status: {emp.status === 'inactive' ? 'Exited' : 'Notice Period'} (Last Working Day: {emp.exitDetails?.lastWorkingDay || 'Not configured'})
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <StatusBadge tone={emp.status === 'inactive' ? 'danger' : 'warning'}>
                        {emp.status === 'inactive' ? 'Exited / Inactive' : 'Notice Period'}
                      </StatusBadge>
                      {emp.status !== 'inactive' && (
                        <>
                          <button
                            type="button"
                            className="ui-button primary"
                            style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleFinalizeExit(emp)}
                            title="Complete offboarding and mark as Inactive"
                          >
                            <UserCheck size={12} /> Finalize Departure
                          </button>
                          <button
                            type="button"
                            className="ui-button secondary"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => handleCancelExit(emp)}
                            title="Cancel exit and reinstate as Active"
                          >
                            Cancel Exit
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="emp-action-btn delete"
                        onClick={() => setEmployeeToDelete(emp)}
                        title="Permanently delete employee and linked records"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#f8f7f2',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reason</span>
                      <strong style={{ display: 'block', color: 'var(--ink)', marginTop: '2px' }}>{emp.exitDetails?.reason || 'Resignation'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reporting Manager</span>
                      <strong style={{ display: 'block', color: 'var(--ink)', marginTop: '2px' }}>{emp.managerName || emp.reportingManager || 'Not assigned'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Handover Assignee</span>
                      <strong style={{ display: 'block', color: 'var(--ink)', marginTop: '2px' }}>{emp.exitDetails?.handoverAssignee || 'Unassigned'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notice Period</span>
                      <strong style={{ display: 'block', color: 'var(--ink)', marginTop: '2px' }}>
                        {emp.exitDetails?.noticePeriodDays ? `${emp.exitDetails.noticePeriodDays} Days` : '30 Days'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last Working Day</span>
                      <strong style={{ display: 'block', color: 'var(--coral)', marginTop: '2px' }}>
                        {emp.exitDetails?.lastWorkingDay || emp.employmentEndDate?.slice(0, 10) || 'Not configured'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Exit Clearance</span>
                      <strong style={{ display: 'block', color: 'var(--teal)', marginTop: '2px' }}>
                        {emp.offboardingChecklist?.length
                          ? `${emp.offboardingChecklist.filter((item) => item.completed).length}/${emp.offboardingChecklist.length} completed (${Math.round((emp.offboardingChecklist.filter((item) => item.completed).length / emp.offboardingChecklist.length) * 100)}%)`
                          : 'Clearance active'}
                      </strong>
                    </div>
                  </div>

                  {/* Interactive Clearance Checklist */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>Exit Clearance Tasks</span>
                      <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Click tasks to record completed department handovers directly in database</small>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                      {(emp.offboardingChecklist && emp.offboardingChecklist.length > 0 ? emp.offboardingChecklist : [
                        { key: 'knowledge_transfer', label: 'Handover & Knowledge Transfer Completed' },
                        { key: 'assets_returned', label: 'Company Assets & Laptop Returned' },
                        { key: 'id_badge_access', label: 'ID Badge & Building Access Revoked' },
                        { key: 'system_deprovisioning', label: 'Email & System Accounts Revoked' },
                        { key: 'exit_interview', label: 'HR Exit Interview Conducted' },
                        { key: 'fnf_settlement', label: 'Final Settlement (FnF) Calculated' },
                      ]).map((item) => (
                        <label
                          key={item.key}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '11px',
                            background: item.completed ? '#f0fdf4' : '#f8fafc',
                            border: `1px solid ${item.completed ? '#bbf7d0' : 'var(--line)'}`,
                            padding: '8px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(item.completed)}
                            onChange={storeAction(async () => {
                              await hrStore.toggleOffboardingItem(emp.id, item.key)
                              showFeedback(`Updated clearance for "${item.label}" in database.`)
                            })}
                            style={{ marginTop: '2px' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <span
                              style={{
                                textDecoration: item.completed ? 'line-through' : 'none',
                                color: item.completed ? '#15803d' : 'var(--ink)',
                                fontWeight: item.completed ? 600 : 400,
                              }}
                            >
                              {item.label}
                            </span>
                            {item.completed && (
                              <span style={{ fontSize: '9px', color: '#16a34a', marginTop: '2px' }}>
                                ✓ Recorded by {item.completedBy || 'HR'} {item.completedAt ? `• ${new Date(item.completedAt).toLocaleDateString()}` : ''}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="hr-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="hr-modal" style={{ width: 'min(100%, 720px)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Add New Employee Profile</h2>
                <small style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                  Official Employment & Payroll Setup. Personal records, education certificates, and family information are submitted directly by the employee in the Onboarding Portal.
                </small>
              </div>
              <button className="icon-button" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            {/* TAB SELECTOR: Official HR & Admin Tabs Only */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '6px 16px', borderBottom: '1px solid var(--border)' }}>
              {[
                { key: 'basic', label: '1. Employment & Role' },
                { key: 'bank', label: '2. Banking & Statutory Payroll' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setModalActiveTab(t.key)}
                  style={{
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: modalActiveTab === t.key ? 700 : 500,
                    borderRadius: '6px',
                    border: 0,
                    background: modalActiveTab === t.key ? '#fff' : 'transparent',
                    color: modalActiveTab === t.key ? 'var(--teal, #0284c7)' : '#64748b',
                    boxShadow: modalActiveTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="hr-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {modalActiveTab === 'basic' && (
                  <div>
                    <p className="form-section-title">Official Employment & Contact Information</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="Employee Code (ETS ID)" hint="Auto-generated sequentially. Locked permanently once created.">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="e.g. ETS21207"
                            value={newEmpForm.employeeId}
                            onChange={(e) => setNewEmpForm({ ...newEmpForm, employeeId: e.target.value.toUpperCase() })}
                            style={{ fontWeight: 600, letterSpacing: '0.04em' }}
                          />
                          <span style={{ fontSize: '10px', color: 'var(--teal)', fontWeight: 700, background: 'rgba(0,110,111,0.1)', padding: '5px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            Auto ETS
                          </span>
                        </div>
                      </Field>
                      <Field label="Full Name" required>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rachel Adams"
                          value={newEmpForm.name}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, name: e.target.value })}
                        />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <Field label="Corporate Work Email" required>
                        <input
                          type="email"
                          required
                          placeholder="rachel.adams@edufyi.local"
                          value={newEmpForm.email}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                        />
                      </Field>
                      <Field label="Work Phone Number" required>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={newEmpForm.phone}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                        />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <Field label="Joining Date" required>
                        <input
                          type="date"
                          required
                          value={newEmpForm.joiningDate}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, joiningDate: e.target.value })}
                        />
                      </Field>
                      <Field label="Initial Login Password" hint="Auto-generated credentials for first sign-in (min 8 chars).">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="text"
                            required
                            minLength={8}
                            placeholder="e.g. Edufyi@4821"
                            value={newEmpForm.password || ''}
                            onChange={(e) => setNewEmpForm({ ...newEmpForm, password: e.target.value })}
                            style={{ fontWeight: 600, letterSpacing: '0.04em' }}
                          />
                          <button
                            type="button"
                            className="ui-button secondary"
                            style={{ fontSize: '11px', padding: '6px 10px', whiteSpace: 'nowrap' }}
                            onClick={() => setNewEmpForm({ ...newEmpForm, password: generateAutoPassword() })}
                          >
                            Auto
                          </button>
                        </div>
                      </Field>
                    </div>

                    <p className="form-section-title" style={{ marginTop: '18px' }}>Role & Organization</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="Role Level">
                        <select
                          value={newEmpForm.role}
                          onChange={(e) => {
                            const newRole = e.target.value
                            const rec = getRecommendedRoleConfig(newRole, newEmpForm.department)
                            const shouldSwitchDept = ['director', 'admin', 'hr'].includes(newRole) || !newEmpForm.department || (newRole === 'director' && newEmpForm.department !== 'Executive')
                            const isInternRole = newRole === 'intern' || newRole.includes('intern')
                            setNewEmpForm({
                              ...newEmpForm,
                              role: newRole,
                              employmentType: isInternRole ? 'intern' : (newEmpForm.employmentType === 'intern' ? 'full_time' : newEmpForm.employmentType),
                              department: shouldSwitchDept ? rec.department : newEmpForm.department,
                              designation: rec.designation,
                            })
                          }}
                        >
                          {allRoleOptions.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Department" required>
                        <select
                          value={newEmpForm.department}
                          onChange={(e) => {
                            const newDept = e.target.value
                            const rec = getRecommendedRoleConfig(newEmpForm.role, newDept)
                            setNewEmpForm({
                              ...newEmpForm,
                              department: newDept,
                              designation: rec.designation,
                            })
                          }}
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <Field label="Assigned Campus" hint="Office campus for geofence & attendance" required>
                        <select
                          value={newEmpForm.campus || 'Ignite Campus'}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, campus: e.target.value })}
                        >
                          {CAMPUSES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Employment Type" hint="Determines leave quota policy (Full-Time: 2 days, Intern: 1 day)" required>
                        <select
                          value={newEmpForm.employmentType || 'full_time'}
                          onChange={(e) => {
                            const et = e.target.value
                            setNewEmpForm({
                              ...newEmpForm,
                              employmentType: et,
                              role: et === 'intern' && newEmpForm.role === 'employee' ? 'intern' : newEmpForm.role,
                            })
                          }}
                        >
                          {EMPLOYMENT_TYPES.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <Field label="Designation" required>
                        <input
                          type="text"
                          required
                          list="new-emp-designations"
                          placeholder="e.g. Managing Director"
                          value={newEmpForm.designation}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                        />
                        <datalist id="new-emp-designations">
                          {getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department).suggestions.map((sug) => (
                            <option key={sug} value={sug} />
                          ))}
                        </datalist>
                      </Field>
                      <Field label="Reporting Manager">
                        <select
                          value={newEmpForm.managerId}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, managerId: e.target.value })}
                        >
                          <option value="">No reporting manager</option>
                          {availableManagers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.displayName || m.name} ({m.designation || m.role})
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <Field label="Assigned Team / Squad">
                        <select
                          value={newEmpForm.teamId || ''}
                          onChange={(e) => {
                            const selectedTeamId = e.target.value
                            const teamObj = hrStore.getTeam(selectedTeamId)
                            if (teamObj) {
                              setNewEmpForm({
                                ...newEmpForm,
                                teamId: teamObj.id,
                                team: teamObj.name,
                                department: teamObj.department || newEmpForm.department,
                                managerId: teamObj.managerId || newEmpForm.managerId,
                                managerName: teamObj.managerName || newEmpForm.managerName,
                                teamLeadId: teamObj.teamLeadId || newEmpForm.teamLeadId,
                                teamLeadName: teamObj.teamLeadName || newEmpForm.teamLeadName,
                              })
                            } else {
                              setNewEmpForm({
                                ...newEmpForm,
                                teamId: '',
                                team: '',
                              })
                            }
                          }}
                        >
                          <option value="">-- No Specific Team / General --</option>
                          {hrStore.getTeams().map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.department} • TL: {t.teamLeadName || 'Unassigned'})
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Team Leader (TL)">
                        <select
                          value={newEmpForm.teamLeadId || ''}
                          onChange={(e) => {
                            const tl = hrStore.getTeamLeads().find((x) => x.id === e.target.value)
                            setNewEmpForm({
                              ...newEmpForm,
                              teamLeadId: e.target.value,
                              teamLeadName: tl ? tl.name : '',
                            })
                          }}
                        >
                          <option value="">-- No Team Leader Assigned --</option>
                          {hrStore.getTeamLeads().map((tl) => (
                            <option key={tl.id} value={tl.id}>
                              {tl.displayName || tl.name} ({tl.team ? `Team ${tl.team}` : tl.designation})
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Recommended for {getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department).roleLabel}:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department).suggestions.map((sug) => {
                          const isSelected = (newEmpForm.designation || '').trim().toLowerCase() === sug.trim().toLowerCase()
                          return (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => setNewEmpForm({ ...newEmpForm, designation: sug })}
                              style={{
                                background: isSelected ? 'var(--primary)' : 'rgba(0, 110, 111, 0.08)',
                                color: isSelected ? '#ffffff' : 'var(--primary)',
                                border: '1px solid ' + (isSelected ? 'var(--primary)' : 'rgba(0, 110, 111, 0.2)'),
                                borderRadius: '12px',
                                padding: '2px 8px',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {isSelected ? '✓ ' : ''}{sug}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <SalaryBreakdownFields
                      salary={newEmpForm.salary}
                      annualCtc={newEmpForm.salary}
                      salaryStructure={newEmpForm.salaryStructure}
                      onChange={({ salary, annualCtc, salaryStructure }) => {
                        setNewEmpForm({
                          ...newEmpForm,
                          salary: annualCtc !== undefined ? annualCtc : salary,
                          salaryStructure,
                        })
                      }}
                      sectionTitle="Compensation & Salary Breakdown (₹ INR)"
                    />
                  </div>
                )}

                {modalActiveTab === 'bank' && (
                  <div>
                    <p className="form-section-title">Official Bank Account for Payroll Transfer</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="Bank Name">
                        <select
                          value={newEmpForm.bankName}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, bankName: e.target.value })}
                        >
                          <option value="">Select Bank</option>
                          {BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Bank Account Number">
                        <input
                          type="text"
                          placeholder="e.g. 5010049281923"
                          value={newEmpForm.accountNumber}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, accountNumber: e.target.value })}
                        />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '12px' }}>
                      <Field label="IFSC Code">
                        <input
                          type="text"
                          placeholder="e.g. HDFC0001234"
                          value={newEmpForm.ifscCode}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, ifscCode: e.target.value.toUpperCase() })}
                        />
                      </Field>
                    </div>

                    <p className="form-section-title" style={{ marginTop: '20px' }}>Statutory Tax & PF Identifiers (HR Payroll Setup)</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="PAN Card Number (TDS)">
                        <input
                          type="text"
                          placeholder="10-digit PAN (e.g. ABCDE1234F)"
                          value={newEmpForm.panTaxId}
                          onChange={(e) => setNewEmpForm({ ...newEmpForm, panTaxId: e.target.value.toUpperCase() })}
                        />
                      </Field>
                      <div>
                        <Field label="Existing UAN / EPF Number">
                          <input
                            type="text"
                            placeholder="12-digit UAN (e.g. 100902847123)"
                            value={newEmpForm.uanNumber}
                            onChange={(e) => setNewEmpForm({ ...newEmpForm, uanNumber: e.target.value, hasExistingUan: Boolean(e.target.value) })}
                          />
                        </Field>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#64748b' }}>
                      <strong>Employee Onboarding Self-Service:</strong> Educational degrees, marksheets, personal Aadhar verification, and family details will be uploaded directly by the employee in their dedicated onboarding dashboard.
                    </div>
                  </div>
                )}
              </div>

              <div className="hr-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {modalActiveTab === 'bank' && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setModalActiveTab('basic')}
                    >
                      ← Previous: Employment & Role
                    </Button>
                  )}
                  {modalActiveTab === 'basic' && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setModalActiveTab('bank')}
                    >
                      Next: Banking & Statutory →
                    </Button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Complete & Onboard Employee
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS SHARING MODAL */}
      {createdCredentials && (
        <div className="hr-modal-backdrop" onClick={() => setCreatedCredentials(null)}>
          <div
            className="hr-modal"
            style={{ width: 'min(100%, 540px)', padding: '0', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', background: 'var(--teal, #006E6F)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#fff' }}>Employee Login Credentials</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.9 }}>Login account provisioned & ready for employee sign-in</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreatedCredentials(null)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', opacity: 0.8 }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                Share these official login credentials with <strong>{createdCredentials.name}</strong> so they can log in to the employee portal.
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Full Name</span>
                  <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{createdCredentials.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Work Email (Login ID)</span>
                  <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{createdCredentials.email}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Employee Code</span>
                  <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '12.5px' }}>
                    {createdCredentials.employeeId}
                  </code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Assigned Role</span>
                  <span style={{ fontSize: '12px', textTransform: 'capitalize', fontWeight: 600, color: '#0f172a' }}>{createdCredentials.role}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Login Password</span>
                  <code style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em' }}>
                    {createdCredentials.password}
                  </code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Login Portal URL</span>
                  <a
                    href={`${window.location.origin}/#/${createdCredentials.role === 'admin' ? 'admin/login' : (createdCredentials.role === 'hr' ? 'hr/login' : 'employee/login')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: 'var(--teal, #006E6F)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Open Login Portal <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {copySuccess && (
                <div style={{ marginTop: '14px', padding: '10px 14px', background: '#e6fffa', border: '1px solid #b2f5ea', borderRadius: '8px', color: '#006E6F', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> All login credentials copied to clipboard! Ready to share with employee.
                </div>
              )}

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ui-button primary"
                    onClick={async () => {
                      const text = formatCredentialsShareText({
                        name: createdCredentials.name,
                        email: createdCredentials.email,
                        employeeId: createdCredentials.employeeId,
                        password: createdCredentials.password,
                        role: createdCredentials.role,
                        origin: window.location.origin,
                      })
                      const copied = await copyTextToClipboard(text)
                      if (copied) {
                        setCopySuccess(true)
                        setTimeout(() => setCopySuccess(false), 4500)
                      } else {
                        window.prompt('Copy credentials:', text)
                      }
                    }}
                  >
                    {copySuccess ? (
                      <Check size={14} style={{ marginRight: '6px' }} />
                    ) : (
                      <Copy size={14} style={{ marginRight: '6px' }} />
                    )}
                    {copySuccess ? 'Copied to Clipboard!' : 'Copy All Login Details'}
                  </button>

                  <button
                    type="button"
                    className="ui-button secondary"
                    disabled={sendingEmail}
                    onClick={async () => {
                      try {
                        setSendingEmail(true)
                        setEmailStatus(null)
                        setEmailMessage('')
                        const rolePath = createdCredentials.role === 'admin' ? 'admin/login' : (createdCredentials.role === 'hr' ? 'hr/login' : 'employee/login')
                        const portalUrl = `${window.location.origin}/#/${rolePath}`

                        const res = await apiClient.post('/mail/welcome', {
                          employee: {
                            name: createdCredentials.name,
                            email: createdCredentials.email,
                            employeeId: createdCredentials.employeeId,
                            designation: createdCredentials.role ? createdCredentials.role.toUpperCase() : 'Staff Member',
                            department: 'Workforce',
                          },
                          temporaryPassword: createdCredentials.password,
                          loginUrl: portalUrl,
                        })

                        setEmailStatus('success')
                        setEmailMessage(res?.data?.message || `Credentials email successfully dispatched to ${createdCredentials.email}!`)
                      } catch (err) {
                        console.error('Failed to dispatch welcome email:', err)
                        setEmailStatus('error')
                        setEmailMessage(err?.message || 'Failed to dispatch email. Check SMTP settings.')
                      } finally {
                        setSendingEmail(false)
                      }
                    }}
                  >
                    {sendingEmail ? (
                      <RefreshCw size={14} className="spinning" style={{ marginRight: '6px' }} />
                    ) : emailStatus === 'success' ? (
                      <Check size={14} style={{ marginRight: '6px', color: '#059669' }} />
                    ) : (
                      <Mail size={14} style={{ marginRight: '6px' }} />
                    )}
                    {sendingEmail ? 'Sending Email...' : emailStatus === 'success' ? 'Email Sent (Resend)' : 'Send via Email'}
                  </button>
                </div>

                {emailMessage && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    marginTop: '12px',
                    background: emailStatus === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: emailStatus === 'success' ? '#065F46' : '#991B1B',
                    border: `1px solid ${emailStatus === 'success' ? '#A7F3D0' : '#FECACA'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {emailStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{emailMessage}</span>
                  </div>
                )}

                <Button type="button" variant="secondary" onClick={() => setCreatedCredentials(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div className="hr-modal-backdrop" onClick={() => setEditingEmployee(null)}>
          <div className="hr-modal" style={{ width: 'min(100%, 680px)' }} onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <div>
                <h2>Edit Employee: {editingEmployee.name}</h2>
                <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                  Update workforce profile, designation, CTC compensation, or bank details.
                </small>
              </div>
              <button className="icon-button" onClick={() => setEditingEmployee(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
              <div className="hr-modal-body">
                <p className="form-section-title">Official Employment & Contact Info</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Employee Code" required hint="Unique workforce code used for login, attendance, and payroll.">
                    <input
                      type="text"
                      required
                      value={editingEmployee.employeeId || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, employeeId: e.target.value.toUpperCase() })}
                      placeholder="e.g. ETS26210"
                      style={{ fontWeight: 600, textTransform: 'uppercase' }}
                    />
                  </Field>

                  <Field label="Full Name" required>
                    <input
                      type="text"
                      required
                      value={editingEmployee.name || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <Field label="Work Email" required>
                    <input
                      type="email"
                      required
                      value={editingEmployee.email || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    />
                  </Field>

                  <Field label="Phone Number" required>
                    <input
                      type="tel"
                      required
                      value={editingEmployee.phone || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    />
                  </Field>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <Field label="Status" required>
                    <select
                      value={editingEmployee.status || 'active'}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="invited">Invited</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </Field>
                </div>

                <p className="form-section-title">Role & Organization</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Role Level">
                    <select
                      value={editingEmployee.role || 'employee'}
                      onChange={(e) => {
                        const newRole = e.target.value
                        const rec = getRecommendedRoleConfig(newRole, editingEmployee.department)
                        const shouldSwitchDept = ['director', 'admin', 'hr'].includes(newRole) || !editingEmployee.department || (newRole === 'director' && editingEmployee.department !== 'Executive')
                        const isInternRole = newRole === 'intern' || newRole.includes('intern')
                        setEditingEmployee({
                          ...editingEmployee,
                          role: newRole,
                          employmentType: isInternRole ? 'intern' : (editingEmployee.employmentType === 'intern' ? 'full_time' : editingEmployee.employmentType),
                          department: shouldSwitchDept ? rec.department : editingEmployee.department,
                          designation: rec.designation,
                        })
                      }}
                    >
                      {allRoleOptions.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Department" required>
                    <select
                      value={editingEmployee.department || 'Executive'}
                      onChange={(e) => {
                        const newDept = e.target.value
                        const rec = getRecommendedRoleConfig(editingEmployee.role, newDept)
                        setEditingEmployee({
                          ...editingEmployee,
                          department: newDept,
                          designation: rec.designation,
                        })
                      }}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <Field label="Assigned Campus" hint="Office campus for geofence & attendance" required>
                    <select
                      value={editingEmployee.campus || 'Ignite Campus'}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, campus: e.target.value })}
                    >
                      {CAMPUSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Employment Type" hint="Determines leave quota policy (Full-Time: 2 days, Intern: 1 day)" required>
                    <select
                      value={editingEmployee.employmentType || 'full_time'}
                      onChange={(e) => {
                        const et = e.target.value
                        setEditingEmployee({
                          ...editingEmployee,
                          employmentType: et,
                          role: et === 'intern' && editingEmployee.role === 'employee' ? 'intern' : editingEmployee.role,
                        })
                      }}
                    >
                      {EMPLOYMENT_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <Field label="Designation" required>
                    <input
                      type="text"
                      required
                      list="edit-emp-designations"
                      placeholder="e.g. Managing Director"
                      value={editingEmployee.designation || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    />
                    <datalist id="edit-emp-designations">
                      {getRecommendedRoleConfig(editingEmployee.role, editingEmployee.department).suggestions.map((sug) => (
                        <option key={sug} value={sug} />
                      ))}
                    </datalist>
                  </Field>

                  <Field label="Reporting Manager">
                    <select
                      value={editingEmployee.managerId || ''}
                      onChange={(e) => {
                        const m = allEmployees.find((x) => x.id === e.target.value)
                        setEditingEmployee({
                          ...editingEmployee,
                          managerId: e.target.value,
                          managerName: m ? m.name : editingEmployee.managerName,
                        })
                      }}
                    >
                      <option value="">No reporting manager</option>
                      {availableManagers.filter((manager) => manager.id !== editingEmployee.id).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.designation})
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <Field label="Assigned Team / Squad">
                    <select
                      value={editingEmployee.teamId || ''}
                      onChange={(e) => {
                        const selectedTeamId = e.target.value
                        const teamObj = hrStore.getTeam(selectedTeamId)
                        if (teamObj) {
                          setEditingEmployee({
                            ...editingEmployee,
                            teamId: teamObj.id,
                            team: teamObj.name,
                            department: teamObj.department || editingEmployee.department,
                            managerId: teamObj.managerId || editingEmployee.managerId,
                            managerName: teamObj.managerName || editingEmployee.managerName,
                            teamLeadId: teamObj.teamLeadId || editingEmployee.teamLeadId,
                            teamLeadName: teamObj.teamLeadName || editingEmployee.teamLeadName,
                          })
                        } else {
                          setEditingEmployee({
                            ...editingEmployee,
                            teamId: '',
                            team: '',
                          })
                        }
                      }}
                    >
                      <option value="">-- No Specific Team / General --</option>
                      {hrStore.getTeams().map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.department} • TL: {t.teamLeadName || 'Unassigned'})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Team Leader (TL)">
                    <select
                      value={editingEmployee.teamLeadId || ''}
                      onChange={(e) => {
                        const tl = hrStore.getTeamLeads().find((x) => x.id === e.target.value)
                        setEditingEmployee({
                          ...editingEmployee,
                          teamLeadId: e.target.value,
                          teamLeadName: tl ? tl.name : '',
                        })
                      }}
                    >
                      <option value="">-- No Team Leader Assigned --</option>
                      {hrStore.getTeamLeads().filter((tl) => tl.id !== editingEmployee.id).map((tl) => (
                        <option key={tl.id} value={tl.id}>
                          {tl.displayName || tl.name} ({tl.team ? `Team ${tl.team}` : tl.designation})
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Recommended for {getRecommendedRoleConfig(editingEmployee.role, editingEmployee.department).roleLabel}:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {getRecommendedRoleConfig(editingEmployee.role, editingEmployee.department).suggestions.map((sug) => {
                      const isSelected = (editingEmployee.designation || '').trim().toLowerCase() === sug.trim().toLowerCase()
                      return (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setEditingEmployee({ ...editingEmployee, designation: sug })}
                          style={{
                            background: isSelected ? 'var(--primary)' : 'rgba(0, 110, 111, 0.08)',
                            color: isSelected ? '#ffffff' : 'var(--primary)',
                            border: '1px solid ' + (isSelected ? 'var(--primary)' : 'rgba(0, 110, 111, 0.2)'),
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected ? '✓ ' : ''}{sug}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <SalaryBreakdownFields
                  salary={editingEmployee.salary}
                  annualCtc={editingEmployee.salary}
                  salaryStructure={editingEmployee.salaryStructure}
                  onChange={({ salary, annualCtc, salaryStructure }) => {
                    setEditingEmployee({
                      ...editingEmployee,
                      salary: annualCtc !== undefined ? annualCtc : salary,
                      salaryStructure,
                    })
                  }}
                  sectionTitle="Compensation & Salary Breakdown (₹ INR)"
                />

                <p className="form-section-title">Bank & Statutory Information</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Bank Name">
                    <select
                      value={editingEmployee.bankName || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, bankName: e.target.value })}
                    >
                      <option value="">Not configured</option>
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Bank Account Number">
                    <input
                      type="text"
                      value={editingEmployee.accountNumber || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, accountNumber: e.target.value })}
                    />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <Field label="IFSC Code">
                    <input
                      type="text"
                      value={editingEmployee.ifscCode || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, ifscCode: e.target.value.toUpperCase() })}
                    />
                  </Field>

                  <Field label="PAN Card Number">
                    <input
                      type="text"
                      value={editingEmployee.panTaxId || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, panTaxId: e.target.value.toUpperCase() })}
                    />
                  </Field>

                  <Field label="UAN / PF Number">
                    <input
                      type="text"
                      value={editingEmployee.uanNumber || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, uanNumber: e.target.value })}
                    />
                  </Field>
                </div>
              </div>

              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setEditingEmployee(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INITIATE EXIT MODAL */}
      {showExitModal && (
        <div className="hr-modal-backdrop" onClick={() => setShowExitModal(false)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h2>Initiate Employee Offboarding</h2>
              <button className="icon-button" onClick={() => setShowExitModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleInitiateExit}>
              <div className="hr-modal-body">
                <Field label="Select Resigning Employee" required>
                  <select
                    value={exitForm.employeeId}
                    onChange={(e) => setExitForm({ ...exitForm, employeeId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose employee --</option>
                    {allEmployees
                      .filter((e) => e.status !== 'notice' && e.status !== 'inactive')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.designation} - {e.department})
                        </option>
                      ))}
                  </select>
                </Field>

                <Field label="Primary Reason for Departure" required>
                  <select
                    value={exitForm.reason}
                    onChange={(e) => setExitForm({ ...exitForm, reason: e.target.value })}
                    required
                  >
                    <option value="Career Growth & Better Opportunity">Career Growth & Better Opportunity</option>
                    <option value="Higher Education / Studies">Higher Education / Studies</option>
                    <option value="Relocation / Moving Abroad">Relocation / Moving Abroad</option>
                    <option value="Personal / Family Reasons">Personal / Family Reasons</option>
                    <option value="Health / Medical">Health / Medical</option>
                    <option value="Career Break / Sabbatical">Career Break / Sabbatical</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Compensation & Benefits">Compensation & Benefits</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Notice Period Duration">
                    <select
                      value={exitForm.noticePeriodDays}
                      onChange={(e) => {
                        const days = Number(e.target.value) || 0
                        const d = new Date()
                        d.setDate(d.getDate() + days)
                        setExitForm({
                          ...exitForm,
                          noticePeriodDays: e.target.value,
                          lastWorkingDay: d.toISOString().split('T')[0],
                        })
                      }}
                    >
                      <option value="0">Immediate / None (0 days)</option>
                      <option value="15">15 Days</option>
                      <option value="30">Standard 30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </Field>

                  <Field label="Last Working Day" required>
                    <input
                      type="date"
                      required
                      value={exitForm.lastWorkingDay}
                      onChange={(e) => setExitForm({ ...exitForm, lastWorkingDay: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Handover Assignee (Knowledge Transfer Lead)">
                  <select
                    value={exitForm.handoverAssignee}
                    onChange={(e) => setExitForm({ ...exitForm, handoverAssignee: e.target.value })}
                  >
                    <option value="">-- Unassigned / To be decided --</option>
                    {allEmployees
                      .filter((e) => e.id !== exitForm.employeeId && e.status === 'active')
                      .map((e) => (
                        <option key={e.id} value={e.name}>
                          {e.name} ({e.designation} - {e.department})
                        </option>
                      ))}
                  </select>
                </Field>

                <Field label="Handover Notes / Transition Summary">
                  <textarea
                    rows={2}
                    placeholder="Key deliverables, projects handover notes, or departure details..."
                    value={exitForm.comments || ''}
                    onChange={(e) => setExitForm({ ...exitForm, comments: e.target.value })}
                  />
                </Field>
              </div>

              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setShowExitModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Confirm & Start Handover</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationDialog
        open={Boolean(employeeToDelete)}
        title={`Remove Employee: ${employeeToDelete?.name}`}
        message={`Permanently delete ${employeeToDelete?.name} (${employeeToDelete?.employeeId})? This removes their profile, login, attendance, leave, and payroll records. This cannot be undone. Use Deactivate instead to keep history.`}
        confirmLabel="Delete Permanently"
        isDestructive={true}
        onConfirm={handleDeleteEmployee}
        onCancel={() => setEmployeeToDelete(null)}
      />
    </>
  )
}

function EmployeeDetail({ id }) {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [employee, setEmployee] = useState(null)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)

  useEffect(() => {
    return hrStore.subscribe((state) => {
      setStoreState(state)
      const found = state.employees.find((e) => e.id === id || e._id === id || e.employeeId === id)
      setEmployee(found || null)
    })
  }, [id])

  if (!employee) return <StatePanel title={storeState.dataReady ? 'Employee not found' : 'Loading employee'} message={storeState.dataError || (storeState.dataReady ? 'Return to People and select an existing employee.' : 'Fetching employee record.')} tone={storeState.dataReady ? 'error' : 'loading'} />

  const handleDeleteEmployee = storeAction(async () => {
    await hrStore.deleteEmployee(employee.id, { force: true, purge: true })
    setEmployeeToDelete(null)
    window.location.hash = workforcePath('/people')
  })

  const handleUpdateEmployee = storeAction(async (e) => {
    e.preventDefault()
    if (!editingEmployee || !editingEmployee.name || !editingEmployee.email) return

    await hrStore.updateEmployee(editingEmployee.id, {
      ...editingEmployee,
      salary: Number(editingEmployee.salary),
    })
    setEditingEmployee(null)
  })

  return (
    <>
      <PageHeader
        eyebrow="Employee profile"
        title={employee.name}
        description={`${employee.designation || 'Specialist'} · ${employee.department} · ${employee.employeeId}`}
      >
        <div className="profile-actions-bar">
          <Button as="a" href={workforcePath('/people')} variant="secondary">
            <ArrowLeft size={15} /> Back to Directory
          </Button>

          {hasPermission(user, 'employees.write') && (
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  setEditingEmployee({
                    ...employee,
                    bankName: employee.bankDetails?.bankName || '',
                    accountNumber: employee.bankDetails?.accountNumber || '',
                    ifscCode: employee.bankDetails?.ifscCode || '',
                    panTaxId: employee.bankDetails?.panTaxId || '',
                    uanNumber: employee.bankDetails?.uanNumber || '',
                    salary: employee.salary ?? 0,
                  })
                }
              >
                <Edit3 size={15} /> Edit Profile
              </Button>

              <Button
                variant="secondary"
                onClick={storeAction(() => hrStore.toggleEmployeeStatus(employee.id))}
              >
                <Power size={15} /> {employee.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>

              <Button
                variant="danger"
                onClick={() => setEmployeeToDelete(employee)}
              >
                <UserX size={15} /> Deactivate Employee
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      <section className="employee-detail-grid">
        <div className="panel profile-panel">
          <div className="profile-heading">
            <EmployeeAvatar name={employee.name} />
            <div>
              <h2>{employee.name}</h2>
              <span>{employee.email}</span>
            </div>
            <StatusBadge tone={employee.status === 'active' ? 'info' : employee.status === 'notice' ? 'warning' : 'neutral'}>
              {statusLabels[employee.status] ?? employee.status}
            </StatusBadge>
          </div>

          <div className="detail-fields">
            <div>
              <span>Employee ID</span>
              <strong>{employee.employeeId}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{employee.phone || 'Not configured'}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>{employee.department}</strong>
            </div>
            <div>
              <span>Designation</span>
              <strong>{employee.designation}</strong>
            </div>
            <div>
              <span>Role / Permissions</span>
              <strong style={{ textTransform: 'uppercase' }}>{employee.role || 'employee'}</strong>
            </div>
            <div>
              <span>Annual CTC (INR)</span>
              <strong style={{ color: 'var(--teal)' }}>{formatINR(employee.salary ?? 0)}</strong>
            </div>
            <div>
              <span>Joining Date</span>
              <strong>{employee.joiningDate}</strong>
            </div>
            <div>
              <span>Reporting Manager</span>
              <strong>{employee.managerName || 'Not assigned'}</strong>
            </div>
            <div>
              <span>Bank Name</span>
              <strong>{employee.bankDetails?.bankName || 'Not configured'}</strong>
            </div>
            <div>
              <span>Account Number</span>
              <strong>{employee.bankDetails?.accountNumber || 'Not configured'}</strong>
            </div>
            <div>
              <span>IFSC Code</span>
              <strong>{employee.bankDetails?.ifscCode || 'Not configured'}</strong>
            </div>
            <div>
              <span>PAN Card Number</span>
              <strong>{employee.bankDetails?.panTaxId || 'Not configured'}</strong>
            </div>
            <div>
              <span>Emergency Contact</span>
              <strong>{employee.emergencyContact?.name || 'Emergency Contact'} ({employee.emergencyContact?.phone || employee.phone})</strong>
            </div>
          </div>
        </div>

        <div className="panel detail-side-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Vault</p>
              <h2>Employee Documents</h2>
            </div>
            <FileText size={18} className="muted-icon" />
          </div>
          {(employee.documents || []).length > 0 ? (
            employee.documents.map((doc) => (
              <div className="document-row" key={doc.id || doc.name}>
                <FileText size={15} />
                <span>
                  <strong>{doc.name}</strong>
                  <small>
                    {doc.type} • {doc.size}
                  </small>
                </span>
                <ExternalLink size={14} />
              </div>
            ))
          ) : (
            <div style={{ padding: '16px 0', fontSize: '11px', color: 'var(--muted)' }}>
              No employee documents have been saved.
            </div>
          )}
        </div>
      </section>


      <EmployeeComplianceStatusCard employee={employee} />

      {/* ONBOARDING DOCUMENTS & STATUTORY DOSSIER */}
      <section className="panel" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: 'var(--teal)' }} /> Onboarding Verification & Submitted Documents
        </h3>
        <OnboardingDossierView employee={employee} canEdit={false} canVerify={true} />
      </section>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationDialog
        open={Boolean(employeeToDelete)}
        title={`Remove Employee: ${employee?.name}`}
        message={`Deactivate ${employee?.name} (${employee?.employeeId})? Login will be disabled and linked history preserved.`}
        confirmLabel="Deactivate Employee"
        isDestructive={true}
        onConfirm={handleDeleteEmployee}
        onCancel={() => setEmployeeToDelete(null)}
      />

      {/* EDIT MODAL */}
      {editingEmployee && (
        <div className="hr-modal-backdrop" onClick={() => setEditingEmployee(null)}>
          <div className="hr-modal" style={{ width: 'min(100%, 680px)' }} onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h2>Edit Employee Profile</h2>
              <button className="icon-button" onClick={() => setEditingEmployee(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
              <div className="hr-modal-body">
                <p className="form-section-title">Personal & Contact Info</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Employee Code" required hint="Unique workforce code.">
                    <input
                      type="text"
                      required
                      value={editingEmployee.employeeId || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, employeeId: e.target.value.toUpperCase() })}
                      placeholder="e.g. ETS26210"
                      style={{ fontWeight: 600, textTransform: 'uppercase' }}
                    />
                  </Field>
                  <Field label="Full Name" required>
                    <input
                      type="text"
                      required
                      value={editingEmployee.name || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <Field label="Work Email" required>
                    <input
                      type="email"
                      required
                      value={editingEmployee.email || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Phone Number" required>
                    <input
                      type="tel"
                      required
                      value={editingEmployee.phone || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    />
                  </Field>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <Field label="Status" required>
                    <select
                      value={editingEmployee.status || 'active'}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="invited">Invited</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </Field>
                </div>

                <p className="form-section-title">Organization & CTC Compensation</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Department" required>
                    <select
                      value={editingEmployee.department || 'Engineering'}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Designation" required>
                    <input
                      type="text"
                      required
                      value={editingEmployee.designation || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <Field label="Reporting Manager">
                    <select value={editingEmployee.managerId || ''} onChange={(event) => setEditingEmployee({ ...editingEmployee, managerId: event.target.value })}>
                      <option value="">No reporting manager</option>
                      {storeState.employees.filter((manager) => manager.id !== employee.id && manager.status === 'active' && ['director', 'admin', 'hr', 'manager', 'team_lead'].includes(manager.role)).map((manager) => (
                        <option key={manager.id} value={manager.id}>{manager.name} ({manager.employeeId})</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <SalaryBreakdownFields
                  salary={editingEmployee.salary}
                  annualCtc={editingEmployee.salary}
                  salaryStructure={editingEmployee.salaryStructure}
                  onChange={({ salary, annualCtc, salaryStructure }) => {
                    setEditingEmployee({
                      ...editingEmployee,
                      salary: annualCtc !== undefined ? annualCtc : salary,
                      salaryStructure,
                    })
                  }}
                  sectionTitle="Compensation & Salary Breakdown (₹ INR)"
                />

                <p className="form-section-title">Bank & Statutory Details</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Bank Name">
                    <select
                      value={editingEmployee.bankName || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, bankName: e.target.value })}
                    >
                      <option value="">Not configured</option>
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Bank Account Number">
                    <input
                      type="text"
                      value={editingEmployee.accountNumber || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, accountNumber: e.target.value })}
                    />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="IFSC Code">
                    <input
                      type="text"
                      value={editingEmployee.ifscCode || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, ifscCode: e.target.value.toUpperCase() })}
                    />
                  </Field>
                  <Field label="PAN Card Number">
                    <input
                      type="text"
                      value={editingEmployee.panTaxId || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, panTaxId: e.target.value.toUpperCase() })}
                    />
                  </Field>
                </div>
              </div>

              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setEditingEmployee(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function EmployeeForm({ id }) {
  const editing = Boolean(id)
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [form, setForm] = useState({
    employeeId: `EDU-EMP-${crypto.randomUUID()}`,
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    role: 'employee',
    status: 'active',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '0',
    managerId: '',
    managerName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panTaxId: '',
    uanNumber: '',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    let initialized = false
    return hrStore.subscribe((state) => {
      setStoreState(state)
      const emp = state.employees.find((employee) => employee.id === id || employee.employeeId === id)
      if (editing && emp && !initialized) {
        initialized = true
        setForm({
          ...emp,
          phone: emp.phone || '',
          bankName: emp.bankDetails?.bankName || '',
          accountNumber: emp.bankDetails?.accountNumber || '',
          ifscCode: emp.bankDetails?.ifscCode || '',
          panTaxId: emp.bankDetails?.panTaxId || '',
          uanNumber: emp.bankDetails?.uanNumber || '',
          salary: String(emp.salary ?? 0),
          salaryStructure: emp.salaryStructure || {},
        })
      }
    })
  }, [id, editing])

  const submit = storeAction(async (e) => {
    e.preventDefault()
    if (editing) {
      await hrStore.updateEmployee(id, {
        ...form,
        salary: Number(form.salary),
        salaryStructure: form.salaryStructure || {},
      })
    } else {
      await hrStore.addEmployee({
        ...form,
        salary: Number(form.salary),
        salaryStructure: form.salaryStructure || {},
      })
    }
    window.location.hash = workforcePath('/people')
  })

  const confirmDelete = storeAction(async () => {
    await hrStore.updateEmployee(id, { status: 'inactive' })
    setShowDeleteModal(false)
    window.location.hash = workforcePath('/people')
  })

  return (
    <>
      <PageHeader
        eyebrow="Employee management"
        title={editing ? `Edit Employee: ${form.name || form.employeeId}` : 'Add New Employee'}
        description={
          editing
            ? 'Update this employee’s profile, compensation package, and banking records.'
            : 'Create a database-backed employee profile. Provision login through User Accounts; HR reviews payroll separately.'
        }
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button as="a" href={workforcePath('/people')} variant="secondary">
            <ArrowLeft size={15} /> Cancel
          </Button>

          {editing && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <UserX size={15} /> Deactivate Employee
            </Button>
          )}
        </div>
      </PageHeader>

      <form className="panel employee-form" onSubmit={submit}>
        <div className="form-grid">
          <p className="form-section-title">Personal & Contact Details</p>

          <Field label="Employee ID" required>
            <input
              value={form.employeeId}
              readOnly={editing}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
            />
          </Field>

          <Field label="Full name" required>
            <input
              value={form.name}
              placeholder="e.g. Jordan Miller"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>

          <Field label="Work email" required>
            <input
              type="email"
              placeholder="jordan.miller@edufyi.local"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Field>

          <Field label="Phone number" required>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </Field>

          <p className="form-section-title">Organization & Role</p>

          <Field label="Department" required>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Designation" required>
            <input
              value={form.designation}
              placeholder="e.g. Senior Frontend Engineer"
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              required
            />
          </Field>

          <Field label="Role Level">
            <select
              value={form.role || 'employee'}
              disabled={['admin', 'hr'].includes(form.role)}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              {['admin', 'hr'].includes(form.role) && <option value={form.role}>{form.role.toUpperCase()}</option>}
            </select>
          </Field>

          <Field label="Status">
            <select
              value={form.status || 'active'}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>

          <Field label="Joining date" required>
            <input
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              required
            />
          </Field>

          <Field label="Reporting Manager">
            <select value={form.managerId || ''} onChange={(event) => setForm({ ...form, managerId: event.target.value })}>
              <option value="">No reporting manager</option>
              {storeState.employees.filter((employee) => employee.id !== id && employee.status === 'active' && ['director', 'admin', 'hr', 'manager', 'team_lead'].includes(employee.role)).map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name} ({employee.employeeId})</option>
              ))}
            </select>
          </Field>

          <div style={{ gridColumn: 'span 2' }}>
            <SalaryBreakdownFields
              salary={form.salary}
              annualCtc={form.salary}
              salaryStructure={form.salaryStructure}
              onChange={({ salary, annualCtc, salaryStructure }) => {
                setForm({
                  ...form,
                  salary: annualCtc !== undefined ? annualCtc : salary,
                  salaryStructure,
                })
              }}
              sectionTitle="Compensation & Salary Breakdown (₹ INR)"
            />
          </div>

          <p className="form-section-title">Bank & Statutory Details</p>

          <Field label="Bank Name">
            <select
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            >
              <option value="">Not configured</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Account Number">
            <input
              type="text"
              placeholder="5010049281923"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            />
          </Field>

          <Field label="IFSC Code">
            <input
              type="text"
              placeholder="HDFC0001234"
              value={form.ifscCode}
              onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
            />
          </Field>

          <Field label="PAN Card Number">
            <input
              type="text"
              placeholder="ABCDE1234F"
              value={form.panTaxId}
              onChange={(e) => setForm({ ...form, panTaxId: e.target.value.toUpperCase() })}
            />
          </Field>
        </div>

        <div className="form-actions">
          <Button as="a" href={workforcePath('/people')} variant="secondary">
            Cancel
          </Button>
          <Button type="submit">{editing ? 'Save Changes' : 'Create & Onboard Employee'}</Button>
        </div>
      </form>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationDialog
        open={showDeleteModal}
        title={`Deactivate Employee: ${form.name}`}
        message={`Disable login for ${form.name} (${form.employeeId}) while preserving attendance, leave, and payroll history?`}
        confirmLabel="Deactivate Employee"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  )
}

function OnboardingDocUploader({ label, fileValue, onUpload, onClear, accept = ".pdf,.jpg,.jpeg,.png", preview = false }) {
  const inputRef = useRef(null)
  return (
    <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>{label}</span>
        {fileValue ? (
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>✓ Uploaded</span>
        ) : (
          <span style={{ fontSize: '10px', color: '#64748b' }}>Upload file</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => onUpload(file.name, reader.result)
          reader.readAsDataURL(file)
        }}
      />
      {fileValue ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            {preview && fileValue.startsWith('data:image') && (
              <img src={fileValue} alt="Preview" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
            )}
            <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#0f172a', fontWeight: 600 }}>
              {fileValue.startsWith('data:') ? (preview ? 'Passport Photo' : 'Document attached') : fileValue}
            </span>
          </div>
          <button type="button" onClick={onClear} style={{ color: '#ef4444', background: 'none', border: 0, cursor: 'pointer', fontWeight: 700, padding: '2px 6px' }}>✕</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{ width: '100%', fontSize: '11px', color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600 }}
        >
          <span>📎 Select Document</span>
        </button>
      )}
    </div>
  )
}

export function EmployeesPage({ route } = {}) {
  const currentPath = route?.path || (typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '/hr/people')
  const cleanPath = currentPath.replace(/^#/, '')
  const parts = cleanPath.split('/').filter(Boolean)
  
  // Create / new profile
  if (parts[parts.length - 1] === 'new') return <EmployeeForm />
  
  // Edit profile: e.g. /hr/people/:id/edit or /admin/people/:id/edit
  if (parts[parts.length - 1] === 'edit' && parts.length >= 3) {
    return <EmployeeForm id={parts[parts.length - 2]} />
  }
  
  // View detail profile: e.g. /hr/people/:id or /admin/people/:id or /people/:id
  let targetId = null
  if (parts.length >= 3 && (parts[0] === 'hr' || parts[0] === 'admin') && parts[1] === 'people') {
    targetId = parts[2]
  } else if (parts.length >= 2 && parts[0] === 'people') {
    targetId = parts[1]
  }
  
  if (targetId && targetId !== 'new' && targetId !== 'edit') {
    return <EmployeeDetail id={targetId} />
  }
  
  return <EmployeeDirectory route={route || { path: currentPath }} />
}
