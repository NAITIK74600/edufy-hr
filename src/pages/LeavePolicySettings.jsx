import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Calendar,
  Activity,
  Briefcase,
  Clock,
  Heart,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Settings,
  Edit2,
  RotateCcw,
  Save,
  X,
  Users,
  ChevronRight,
  FileText,
  CalendarDays,
  Check,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  ChevronDown,
  SlidersHorizontal,
  Filter,
  RefreshCw,
  Plus,
  User,
} from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { hrStore, storeAction } from '../services/hrStore'
import { Button, Field, StatusBadge } from '../components/ui'

const LEAVE_TYPE_META = {
  casual: {
    name: 'Casual Leave',
    code: 'CL',
    icon: Calendar,
    color: '#0284c7',
    bg: '#f0f9ff',
    desc: 'Short-term personal time off and urgent personal commitments.',
    defaultWorkflow: 'manager',
  },
  sick: {
    name: 'Sick Leave',
    code: 'SL',
    icon: Activity,
    color: '#10b981',
    bg: '#ecfdf5',
    desc: 'Medical absence for illness, health recovery, and appointments.',
    defaultWorkflow: 'manager',
  },
  earned: {
    name: 'Earned / Privilege Leave',
    code: 'EL',
    icon: Briefcase,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    desc: 'Accrued annual privilege leave for vacations and planned rest.',
    defaultWorkflow: 'manager',
  },
  comp_off: {
    name: 'Compensatory Off',
    code: 'CO',
    icon: Clock,
    color: '#f59e0b',
    bg: '#fffbeb',
    desc: 'Compensatory off earned for working on weekends or holidays.',
    defaultWorkflow: 'manager_hr',
  },
  maternity: {
    name: 'Maternity / Paternity Leave',
    code: 'ML',
    icon: Heart,
    color: '#ec4899',
    bg: '#fdf2f8',
    desc: 'Extended parental leave for mothers and fathers welcoming a child.',
    defaultWorkflow: 'hr',
  },
  lop: {
    name: 'Loss of Pay (LOP) / Unpaid',
    code: 'LOP',
    icon: AlertCircle,
    color: '#ef4444',
    bg: '#fef2f2',
    desc: 'Unpaid time off requested when paid leave quotas are fully exhausted.',
    defaultWorkflow: 'manager_hr',
  },
}

const WORKFLOW_LABELS = {
  hr: 'HR Review',
  manager: 'Assigned Manager Review',
  manager_hr: 'Manager then HR Review',
}

export function LeavePolicySettings({ employees = [], onSwitchTab, allRequests }) {
  const [policies, setPolicies] = useState([])
  const [policy, setPolicy] = useState({
    leaveType: 'casual',
    label: 'Casual Leave',
    approvalStage: 'manager',
    countWeekends: false,
    countHolidays: false,
    holidayDates: [],
    requiresReason: true,
    configured: true,
  })
  const [balance, setBalance] = useState({ employeeId: '', leaveType: 'casual', allowance: 12 })
  const [allInOneOpen, setAllInOneOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('success') // 'success' | 'error'
  const [busy, setBusy] = useState(false)
  const editorRef = useRef(null)

  const load = async () => {
    try {
      const result = await apiClient.get('/leave/policies')
      if (Array.isArray(result.data) && result.data.length > 0) {
        setPolicies(result.data)
        // If current policy is loaded, sync it
        setPolicy((prev) => {
          const match = result.data.find((p) => p.leaveType === prev.leaveType)
          return match ? { ...match } : prev
        })
      }
    } catch (err) {
      hrStore.reportError(err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Derive summary metrics from live data
  const configuredTypesCount = policies.length || 6
  const activePoliciesCount = policies.filter((p) => p.configured !== false).length || configuredTypesCount
  const liveLeaveRequests = allRequests || hrStore.getState().leaveRequests || []
  const pendingRequestsCount = liveLeaveRequests.filter((r) => r.status === 'pending').length
  const coveredEmployeesCount = employees.length || (hrStore.getState().employees || []).length

  // Directly open the edit policy modal for any policy
  function handleSelectPolicy(targetPolicy) {
    setEditingPolicy({
      ...targetPolicy,
      holidayDates: Array.isArray(targetPolicy.holidayDates) ? [...targetPolicy.holidayDates] : [],
    })
  }

  // Save updated policy directly from the modal
  const handleSavePolicyModal = storeAction(async (updatedPolicy) => {
    setBusy(true)
    try {
      await apiClient.put(`/leave/policies/${updatedPolicy.leaveType}`, updatedPolicy)
      await load()
      setNotice(`Leave policy for "${updatedPolicy.label || updatedPolicy.leaveType}" updated and saved successfully!`)
      setNoticeType('success')
      setTimeout(() => setNotice(''), 4500)
      setEditingPolicy(null)
    } catch (err) {
      setNotice(err.response?.data?.error?.message || err.message || 'Failed to save leave policy.')
      setNoticeType('error')
    } finally {
      setBusy(false)
    }
  })

  // Cancel / Discard Changes
  function handleDiscardChanges() {
    const saved = policies.find((p) => p.leaveType === policy.leaveType)
    if (saved) {
      setPolicy({ ...saved })
      setNotice(`Reverted changes for ${saved.label || saved.leaveType}.`)
      setNoticeType('info')
      setTimeout(() => setNotice(''), 3500)
    }
  }

  // Reset to Defaults
  function handleResetDefaults() {
    const meta = LEAVE_TYPE_META[policy.leaveType]
    setPolicy((prev) => ({
      ...prev,
      label: meta?.name || prev.label,
      approvalStage: meta?.defaultWorkflow || 'manager',
      countWeekends: false,
      countHolidays: false,
      holidayDates: [],
    }))
    setNotice(`Reset calculation rules to standard defaults. Click Save Policy to apply.`)
    setNoticeType('info')
    setTimeout(() => setNotice(''), 4000)
  }

  const savePolicy = storeAction(async (event) => {
    if (event?.preventDefault) event.preventDefault()
    setBusy(true)
    try {
      await apiClient.put(`/leave/policies/${policy.leaveType}`, policy)
      await load()
      setNotice(`Leave policy for "${policy.label || policy.leaveType}" saved successfully!`)
      setNoticeType('success')
      setTimeout(() => setNotice(''), 5000)
    } catch (err) {
      setNotice(err.response?.data?.error?.message || err.message || 'Failed to save leave policy.')
      setNoticeType('error')
    } finally {
      setBusy(false)
    }
  })

  const saveBalance = storeAction(async (event) => {
    if (event?.preventDefault) event.preventDefault()
    if (!balance.employeeId) {
      setNotice('Please select an employee.')
      setNoticeType('error')
      return
    }
    setBusy(true)
    try {
      const targetAllowance = Number(balance.allowance ?? 0)
      await apiClient.put(`/leave/hr/balances/${balance.employeeId}/${balance.leaveType}`, { allowance: targetAllowance })
      await hrStore.refresh()
      setNotice('Employee leave entitlement quota saved successfully.')
      setNoticeType('success')
      setTimeout(() => setNotice(''), 4500)
    } catch (err) {
      setNotice(err.response?.data?.error?.message || err.message || 'Failed to save employee allowance.')
      setNoticeType('error')
    } finally {
      setBusy(false)
    }
  })

  // Normalize all 6 leave types so all 6 are always visible even before backend returns
  const allLeaveKeys = ['casual', 'sick', 'earned', 'comp_off', 'maternity', 'lop']
  const displayPolicies = allLeaveKeys.map((key) => {
    const found = policies.find((p) => p.leaveType === key)
    if (found) return found
    const meta = LEAVE_TYPE_META[key]
    return {
      leaveType: key,
      label: meta.name,
      approvalStage: meta.defaultWorkflow,
      countWeekends: false,
      countHolidays: false,
      holidayDates: [],
      configured: true,
    }
  })

  const currentMeta = LEAVE_TYPE_META[policy.leaveType] || LEAVE_TYPE_META.casual
  const CurrentIcon = currentMeta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 0. HEADER TITLE & SUBTITLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink, #0f172a)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--teal, #006E6F)" />
            Leave Management
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--muted, #64748b)' }}>
            Manage leave policies, employee entitlements, approvals, and holiday rules.
          </p>
        </div>
      </div>

      {/* 1. TOP SUMMARY METRIC CARDS */}
      <div className="leave-summary-grid">
        <div className="leave-summary-card">
          <div className="leave-summary-icon-wrap" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <CalendarDays size={20} />
          </div>
          <div className="leave-summary-info">
            <span className="leave-summary-label">Configured Types</span>
            <strong className="leave-summary-value">{configuredTypesCount}</strong>
            <span className="leave-summary-sub">Leave categories live</span>
          </div>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-icon-wrap" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="leave-summary-info">
            <span className="leave-summary-label">Active Policies</span>
            <strong className="leave-summary-value">{activePoliciesCount}</strong>
            <span className="leave-summary-sub">Governed rules active</span>
          </div>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-icon-wrap" style={{ background: pendingRequestsCount ? '#fffbeb' : '#f8fafc', color: pendingRequestsCount ? '#d97706' : '#64748b' }}>
            <Clock size={20} />
          </div>
          <div className="leave-summary-info">
            <span className="leave-summary-label">Pending Requests</span>
            <strong className="leave-summary-value" style={{ color: pendingRequestsCount ? '#d97706' : 'inherit' }}>
              {pendingRequestsCount}
            </strong>
            <span className="leave-summary-sub">{pendingRequestsCount ? 'Action required in queue' : 'All queues cleared'}</span>
          </div>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-icon-wrap" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Users size={20} />
          </div>
          <div className="leave-summary-info">
            <span className="leave-summary-label">Covered Workforce</span>
            <strong className="leave-summary-value">{coveredEmployeesCount}</strong>
            <span className="leave-summary-sub">Staff members enrolled</span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT TOOLBAR */}
      <div className="leave-action-toolbar">
        <div className="leave-toolbar-left">
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
            Quick Navigation:
          </span>
          <button
            type="button"
            className="ui-button secondary"
            onClick={() => handleSelectPolicy(displayPolicies[0])}
            style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Settings size={13} /> Edit Policies Directly
          </button>
          <button
            type="button"
            className="ui-button secondary"
            onClick={() => {
              const hash = window.location.hash.includes('/admin') ? '#/admin/holidays' : '#/hr/holidays'
              window.location.hash = hash
            }}
            style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Calendar size={13} /> Manage Holidays
          </button>
        </div>

        <div className="leave-toolbar-right">
          <button
            type="button"
            className="ui-button primary"
            onClick={() => {
              if (onSwitchTab) {
                onSwitchTab('approvals')
              } else {
                const hash = window.location.hash.includes('/admin') ? '#/admin/leave' : '#/hr/leave'
                window.location.hash = hash
              }
            }}
            style={{ padding: '6px 14px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <FileText size={13} /> View Leave Requests ({pendingRequestsCount} Pending)
          </button>
        </div>
      </div>

      {/* 3. FEEDBACK ALERT NOTICE */}
      {notice && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '12.5px',
            fontWeight: 600,
            background: noticeType === 'error' ? '#fef2f2' : noticeType === 'info' ? '#f0f9ff' : '#e6fffa',
            border: noticeType === 'error' ? '1px solid #fecaca' : noticeType === 'info' ? '1px solid #bae6fd' : '1px solid #b2f5ea',
            color: noticeType === 'error' ? '#dc2626' : noticeType === 'info' ? '#0369a1' : '#006E6F',
            animation: 'fadeUp 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {noticeType === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice('')}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', padding: '2px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 4. VISUAL LEAVE TYPE CARDS GRID */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              Configured Leave Categories
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0 0' }}>
              Select a category card to edit its entitlement rules, approval workflows, and holiday calculations.
            </p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
            {displayPolicies.length} Categories
          </span>
        </div>

        <div className="leave-type-cards-grid">
          {displayPolicies.map((rec) => {
            const isSelected = policy.leaveType === rec.leaveType
            const meta = LEAVE_TYPE_META[rec.leaveType] || LEAVE_TYPE_META.casual
            const Icon = meta.icon
            const workflowLabel = WORKFLOW_LABELS[rec.approvalStage] || 'Manager Review'

            return (
              <div
                key={rec.leaveType}
                className={`leave-type-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectPolicy(rec)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectPolicy(rec) }}
              >
                <div>
                  <div className="leave-type-card-header">
                    <div
                      className="leave-type-card-icon-box"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isSelected && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 700, color: 'var(--teal)', background: 'rgba(0, 110, 111, 0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                          <Check size={11} /> Selected
                        </span>
                      )}
                      <span className="leave-policy-pill">
                        {meta.code}
                      </span>
                    </div>
                  </div>

                  <h3 className="leave-type-card-title">
                    {rec.label || meta.name}
                  </h3>
                  <p className="leave-type-card-desc">
                    {meta.desc}
                  </p>
                </div>

                <div className="leave-type-card-footer">
                  <span className="leave-workflow-pill" title={`Approval Flow: ${workflowLabel}`}>
                    <ShieldCheck size={11} /> {workflowLabel}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    Edit Policy <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 6. POLICY OVERVIEW TABLE */}
      <section className="policy-overview-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Layers size={16} style={{ color: 'var(--teal)' }} /> All Configured Leave Policies Overview
            </h3>
            <p style={{ fontSize: '11.5px', color: 'var(--muted)', margin: '2px 0 0 0' }}>
              Summary matrix of leave calculation rules, approval chains, and holiday inclusions.
            </p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Showing {displayPolicies.length} Categories
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table" style={{ width: '100%', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Leave Type</th>
                <th style={{ textAlign: 'left' }}>Policy Label</th>
                <th style={{ textAlign: 'left' }}>Approval Workflow</th>
                <th style={{ textAlign: 'center' }}>Weekend Rule</th>
                <th style={{ textAlign: 'center' }}>Holiday Rule</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayPolicies.map((rec) => {
                const meta = LEAVE_TYPE_META[rec.leaveType] || LEAVE_TYPE_META.casual
                const Icon = meta.icon
                const isSelected = policy.leaveType === rec.leaveType

                return (
                  <tr
                    key={rec.leaveType}
                    style={{
                      background: isSelected ? 'rgba(0, 110, 111, 0.04)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: meta.bg,
                            color: meta.color,
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '12px' }}>{meta.code}</strong>
                          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                            {rec.leaveType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink)' }}>
                        {rec.label || meta.name}
                      </span>
                    </td>
                    <td>
                      <span className="leave-workflow-pill">
                        <ShieldCheck size={11} /> {WORKFLOW_LABELS[rec.approvalStage] || 'Manager Review'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: rec.countWeekends ? '#fef2f2' : '#f0fdf4',
                          color: rec.countWeekends ? '#dc2626' : '#16a34a',
                        }}
                      >
                        {rec.countWeekends ? 'Counted' : 'Excluded'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: rec.countHolidays ? '#fef2f2' : '#f0fdf4',
                          color: rec.countHolidays ? '#dc2626' : '#16a34a',
                        }}
                      >
                        {rec.countHolidays ? 'Counted' : 'Excluded'}
                        {rec.holidayDates?.length > 0 && ` (${rec.holidayDates.length} exempt)`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="ui-button secondary"
                        onClick={() => handleSelectPolicy(rec)}
                        style={{ padding: '5px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                      >
                        <Edit2 size={12} /> Edit Policy
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. PRESERVED EMPLOYEE LEAVE ALLOWANCE ALLOCATION FORM */}
      <section className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Users size={16} style={{ color: 'var(--teal)' }} /> Individual Employee Leave Allowance
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '3px 0 0 0' }}>
              Assign explicit annual leave quotas for specific team members. Used and reserved leave days are automatically preserved.
            </p>
          </div>
          <button
            type="button"
            className="ui-button secondary"
            onClick={() => setAllInOneOpen(true)}
            style={{ fontSize: '11px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Sparkles size={12} style={{ color: 'var(--teal)' }} /> Set All Quotas in One Page (CL, SL, EL, CO, ML, LOP)
          </button>
        </div>

        <form onSubmit={saveBalance} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <Field label="Target Employee" required>
            <select
              required
              value={balance.employeeId}
              onChange={(event) => {
                const newEmpId = event.target.value
                const empBal = (hrStore.getState().leaveBalances || []).find((b) => {
                  const bEmpId = typeof b.employeeId === 'object' ? (b.employeeId?._id || b.employeeId?.id || b.employeeId?.employeeId) : b.employeeId
                  return String(bEmpId).toLowerCase() === String(newEmpId).toLowerCase() && b.leaveType === balance.leaveType
                })
                setBalance({
                  ...balance,
                  employeeId: newEmpId,
                  allowance: empBal ? empBal.allowance : balance.allowance,
                })
              }}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '12px' }}
            >
              <option value="">Choose employee…</option>
              {employees.map((employee) => (
                <option key={employee.id || employee._id} value={employee.id || employee._id || employee.employeeId}>
                  {employee.name} ({employee.employeeId || 'No Code'})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Configured Leave Type" required>
            <select
              value={balance.leaveType}
              onChange={(event) => {
                const newType = event.target.value
                const empBal = (hrStore.getState().leaveBalances || []).find((b) => {
                  const bEmpId = typeof b.employeeId === 'object' ? (b.employeeId?._id || b.employeeId?.id || b.employeeId?.employeeId) : b.employeeId
                  return String(bEmpId).toLowerCase() === String(balance.employeeId).toLowerCase() && b.leaveType === newType
                })
                setBalance({
                  ...balance,
                  leaveType: newType,
                  allowance: empBal ? empBal.allowance : balance.allowance,
                })
              }}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '12px' }}
            >
              {displayPolicies.map((record) => (
                <option key={record.leaveType} value={record.leaveType}>
                  {record.label || record.leaveType}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Total Annual Allowance (Days)" required>
            <input
              required
              type="number"
              min="0"
              step="0.5"
              value={balance.allowance !== undefined && balance.allowance !== null ? balance.allowance : ''}
              onChange={(event) => {
                const v = event.target.value
                setBalance({ ...balance, allowance: v === '' ? '' : Number(v) })
              }}
              onBlur={() => {
                setBalance((prev) => ({ ...prev, allowance: Number(prev.allowance || 0) }))
              }}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '12px', fontWeight: 600 }}
            />
          </Field>

          <div>
            <Button
              type="submit"
              disabled={busy || !balance.employeeId}
              onClick={saveBalance}
              style={{ width: '100%', height: '38px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Save size={14} /> Save Employee Allowance
            </Button>
          </div>
        </form>
      </section>

      {/* ALL-IN-ONE QUOTA MODAL FOR POLICY TAB */}
      <AllInOneQuotaModal
        open={allInOneOpen}
        onClose={() => setAllInOneOpen(false)}
        employees={employees}
        defaults={getDefaultCompanyQuotas()}
        onSuccess={(msg) => {
          setNotice(msg)
          setNoticeType('success')
          setTimeout(() => setNotice(''), 4500)
        }}
      />

      {/* DIRECT EDIT POLICY MODAL */}
      <EditPolicyModal
        open={Boolean(editingPolicy)}
        policy={editingPolicy}
        onClose={() => setEditingPolicy(null)}
        onSave={handleSavePolicyModal}
        busy={busy}
      />
    </div>
  )
}

export function EditPolicyModal({ open, policy, onClose, onSave, busy }) {
  const [form, setForm] = useState(policy ? { ...policy } : null)

  useEffect(() => {
    if (policy) {
      setForm({
        ...policy,
        holidayDates: Array.isArray(policy.holidayDates) ? [...policy.holidayDates] : [],
      })
    }
  }, [policy, open])

  // Escape key and backdrop listener
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !form) return null

  const meta = LEAVE_TYPE_META[form.leaveType] || LEAVE_TYPE_META.casual
  const Icon = meta.icon

  const handleResetDefaults = () => {
    setForm((prev) => ({
      ...prev,
      label: meta.name || prev.label,
      approvalStage: meta.defaultWorkflow || 'manager',
      countWeekends: false,
      countHolidays: false,
      holidayDates: [],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div
      className="hr-modal-backdrop"
      onClick={onClose}
      style={{ zIndex: 1100, display: 'grid', placeItems: 'center', padding: '16px' }}
    >
      <div
        className="hr-modal"
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: meta.bg,
                color: meta.color,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
                Edit Leave Policy: {form.label || meta.name}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                System Key: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>{form.leaveType}</code> • Code: <strong>{meta.code}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {/* Policy Display Label */}
          <div style={{ display: 'grid', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              Policy Display Label <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={form.label || ''}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Casual Leave"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '12.5px' }}
            />
          </div>

          {/* Authorizing Review Stage */}
          <div style={{ display: 'grid', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              Authorizing Review Stage / Approval Workflow
            </label>
            <select
              value={form.approvalStage || 'manager'}
              onChange={(e) => setForm({ ...form, approvalStage: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '12px', fontWeight: 600 }}
            >
              <option value="hr">HR review (Direct HR approval only)</option>
              <option value="manager">Assigned manager review (Direct supervisor approval)</option>
              <option value="manager_hr">Manager then HR review (Two-stage sequential sign-off)</option>
            </select>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Determines the approval authorization path before leave days are deducted from employee balances.
            </span>
          </div>

          {/* Calendar & Holiday Rules */}
          <div style={{ display: 'grid', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              Calendar & Leave Calculation Rules
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {/* Weekend rule */}
              <label className={`policy-rule-toggle-box ${form.countWeekends ? 'active' : ''}`} style={{ margin: 0, padding: '12px 14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'var(--ink)', marginBottom: '2px' }}>
                    Count weekends as leave
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.35, display: 'block' }}>
                    Saturdays & Sundays inside the leave period consume balance days.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.countWeekends)}
                  onChange={(e) => setForm({ ...form, countWeekends: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--teal)', cursor: 'pointer' }}
                />
              </label>

              {/* Holiday rule */}
              <label className={`policy-rule-toggle-box ${form.countHolidays ? 'active' : ''}`} style={{ margin: 0, padding: '12px 14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'var(--ink)', marginBottom: '2px' }}>
                    Count holidays as leave
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.35, display: 'block' }}>
                    Declared holidays falling within leave duration count as taken.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.countHolidays)}
                  onChange={(e) => setForm({ ...form, countHolidays: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--teal)', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* Excluded Holiday Dates */}
          <div style={{ display: 'grid', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              Excluded Holiday Dates (Exemptions)
            </label>
            <input
              type="text"
              value={(form.holidayDates ?? []).map((date) => String(date).slice(0, 10)).join(', ')}
              onChange={(e) =>
                setForm({
                  ...form,
                  holidayDates: e.target.value
                    .split(',')
                    .map((date) => date.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. 2026-01-26, 2026-08-15, 2026-10-02"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
            />
            {Array.isArray(form.holidayDates) && form.holidayDates.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}>
                {form.holidayDates.map((d, i) => (
                  <span key={i} className="holiday-chip" style={{ fontSize: '10.5px' }}>
                    <Calendar size={10} /> {String(d).slice(0, 10)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '14px', marginTop: '10px' }}>
            <button
              type="button"
              className="ui-button secondary"
              onClick={handleResetDefaults}
              disabled={busy}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              Reset Defaults
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="ui-button secondary"
                onClick={onClose}
                disabled={busy}
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={busy}
                style={{ fontSize: '12px', padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={13} /> {busy ? 'Saving…' : 'Save Policy'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export const FULLTIME_MONTHLY_QUOTAS = {
  casual: 1,
  sick: 1,
  earned: 0,
  comp_off: 0,
  maternity: 0,
  lop: 0,
}

export const INTERN_MONTHLY_QUOTAS = {
  casual: 0,
  sick: 1,
  earned: 0,
  comp_off: 0,
  maternity: 0,
  lop: 0,
}

export const STANDARD_DEFAULT_QUOTAS = {
  casual: 1,
  sick: 1,
  earned: 0,
  comp_off: 0,
  maternity: 0,
  lop: 0,
}

export function isInternEmployee(emp) {
  if (!emp) return false
  const type = String(emp.employmentType || '').toLowerCase().replace(/[-\s]/g, '_')
  const desig = String(emp.designation || '').toLowerCase()
  const role = String(emp.role || '').toLowerCase()
  return type === 'intern' || desig.includes('intern') || role.includes('intern')
}

const STORAGE_DEFAULT_QUOTAS_KEY = 'edufyi_default_leave_quotas'

export function getDefaultCompanyQuotas() {
  try {
    const raw = localStorage.getItem(STORAGE_DEFAULT_QUOTAS_KEY)
    if (raw) return { ...STANDARD_DEFAULT_QUOTAS, ...JSON.parse(raw) }
  } catch {}
  return { ...STANDARD_DEFAULT_QUOTAS }
}

export function saveDefaultCompanyQuotas(quotas) {
  try {
    localStorage.setItem(STORAGE_DEFAULT_QUOTAS_KEY, JSON.stringify(quotas))
  } catch {}
}

export function AllInOneQuotaModal({ open, onClose, targetEmployee, employees = [], defaults, onSuccess }) {
  const [empId, setEmpId] = useState('')
  const [quotas, setQuotas] = useState(() => ({ ...(defaults || getDefaultCompanyQuotas()) }))
  const [showExtra, setShowExtra] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Stable key so parent re-renders don't wipe newly typed values
  const targetId = targetEmployee?.id || targetEmployee?._id || targetEmployee?.employeeId || ''

  useEffect(() => {
    if (!open) return
    setErrorMsg('')
    const target = targetEmployee || (employees.length > 0 ? employees[0] : null)
    const chosenId = target?.id || target?._id || target?.employeeId || ''
    setEmpId(chosenId)

    const isIntern = isInternEmployee(target)
    const standardPreset = isIntern ? INTERN_MONTHLY_QUOTAS : FULLTIME_MONTHLY_QUOTAS
    const baseDefaults = defaults || standardPreset
    if (target && target.balances) {
      setQuotas({
        casual: target.balances.casual?.allowance ?? (isIntern ? 0 : 1),
        sick: target.balances.sick?.allowance ?? 1,
        earned: target.balances.earned?.allowance ?? 0,
        comp_off: target.balances.comp_off?.allowance ?? 0,
        maternity: target.balances.maternity?.allowance ?? 0,
        lop: target.balances.lop?.allowance ?? 0,
      })
      const hasExtra = (
        (target.balances.earned?.allowance > 0) ||
        (target.balances.comp_off?.allowance > 0) ||
        (target.balances.maternity?.allowance > 0) ||
        (target.balances.lop?.allowance > 0)
      )
      setShowExtra(Boolean(hasExtra))
    } else {
      setQuotas({ ...baseDefaults })
      setShowExtra(false)
    }
  }, [open, targetId])

  if (!open) return null

  const activeEmp = employees.find((e) => (e.id || e._id || e.employeeId) === empId) || targetEmployee

  const handleApplyDefaults = () => {
    const baseDefaults = defaults || getDefaultCompanyQuotas()
    setQuotas({ ...baseDefaults })
  }

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (!empId) {
      setErrorMsg('Please select an employee.')
      return
    }
    setBusy(true)
    setErrorMsg('')
    try {
      const types = ['casual', 'sick', 'earned', 'comp_off', 'maternity', 'lop']
      for (const type of types) {
        const raw = quotas[type]
        const val = Math.max(0, Number(raw === '' || raw === undefined ? 0 : raw))
        await apiClient.put(`/leave/hr/balances/${empId}/${type}`, { allowance: val })
      }
      await hrStore.refresh()
      if (onSuccess) {
        onSuccess(`All leave quotas for ${activeEmp?.name || 'employee'} saved successfully!`)
      }
      onClose()
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to save all leave quotas.')
    } finally {
      setBusy(false)
    }
  }

  const primaryKeys = ['casual', 'sick']
  const extraKeys = ['earned', 'comp_off', 'maternity', 'lop']

  const renderQuotaBox = (key) => {
    const meta = LEAVE_TYPE_META[key]
    const Icon = meta.icon
    const currBalance = activeEmp?.balances?.[key]
    const used = currBalance?.used || 0
    const reserved = currBalance?.reserved || 0
    const minAllowed = used + reserved

    return (
      <div key={key} className="quota-input-box" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: meta.bg, color: meta.color, display: 'grid', placeItems: 'center' }}>
              <Icon size={13} />
            </span>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
              {meta.name}
            </span>
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', background: meta.bg, color: meta.color }}>
            {meta.code}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <input
            type="number"
            min={minAllowed}
            step="0.5"
            required
            value={quotas[key] !== undefined && quotas[key] !== null ? quotas[key] : ''}
            onChange={(e) => {
              const v = e.target.value
              setQuotas((prev) => ({ ...prev, [key]: v === '' ? '' : Number(v) }))
            }}
            onBlur={() => {
              setQuotas((prev) => ({
                ...prev,
                [key]: Math.max(minAllowed, Number(prev[key] || 0)),
              }))
            }}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '14px', fontWeight: 700, textAlign: 'right' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Days</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--muted)', marginTop: '4px' }}>
          <span>Used: {used}d | Reserved: {reserved}d</span>
          <span>Min: {minAllowed}d</span>
        </div>
      </div>
    )
  }

  const modalContent = (
    <div className="quota-modal-backdrop" onClick={onClose}>
      <div className="quota-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="quota-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
              Configure Employee Leave Quotas
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              {activeEmp ? `Configuring quotas for ${activeEmp.name}` : 'Assign monthly leave quotas'}
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="quota-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* Target Employee */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '5px' }}>
                Target Employee
              </label>
              <select
                value={empId}
                onChange={(e) => {
                  const newId = e.target.value
                  setEmpId(newId)
                  const chosen = employees.find((x) => (x.id || x._id || x.employeeId) === newId)
                  const isIntern = isInternEmployee(chosen)
                  const baseDefaults = defaults || (isIntern ? INTERN_MONTHLY_QUOTAS : FULLTIME_MONTHLY_QUOTAS)
                  if (chosen && chosen.balances) {
                    setQuotas({
                      casual: chosen.balances.casual?.allowance ?? (isIntern ? 0 : 1),
                      sick: chosen.balances.sick?.allowance ?? 1,
                      earned: chosen.balances.earned?.allowance ?? 0,
                      comp_off: chosen.balances.comp_off?.allowance ?? 0,
                      maternity: chosen.balances.maternity?.allowance ?? 0,
                      lop: chosen.balances.lop?.allowance ?? 0,
                    })
                  } else {
                    setQuotas({ ...baseDefaults })
                  }
                }}
                disabled={Boolean(targetEmployee)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: targetEmployee ? '#f1f5f9' : '#fff', fontSize: '13px' }}
              >
                {employees.map((emp) => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id || emp.employeeId}>
                    {emp.name} ({emp.employeeId || 'ID'} - {emp.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Policy Preset Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setQuotas({ ...FULLTIME_MONTHLY_QUOTAS })}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span>💼 Full-Time Policy</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#3b82f6' }}>2 Days (1 CL + 1 SL)</span>
              </button>

              <button
                type="button"
                onClick={() => setQuotas({ ...INTERN_MONTHLY_QUOTAS })}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #a7f3d0',
                  background: '#ecfdf5',
                  color: '#047857',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span>🎓 Intern Policy</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#10b981' }}>1 Day (1 SL)</span>
              </button>
            </div>

            {/* Primary Monthly Quota Inputs (Casual & Sick) */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                Monthly Active Quotas:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {primaryKeys.map(renderQuotaBox)}
              </div>
            </div>

            {/* Advanced / Additional Leave Types Toggle */}
            <div style={{ borderTop: '1px dashed var(--line)', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowExtra(!showExtra)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--teal)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {showExtra ? '▲ Hide Advanced Categories' : '+ Show Advanced Categories (Privilege, Comp-Off, Maternity, LOP)'}
              </button>

              {showExtra && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  {extraKeys.map(renderQuotaBox)}
                </div>
              )}
            </div>
          </div>

          <div className="quota-modal-footer">
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Values persist immediately across payroll and ESS attendance calculations.
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="ui-button secondary" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button
                type="submit"
                className="ui-button primary"
                disabled={busy}
                onClick={handleSubmit}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {busy ? <RefreshCw size={14} className="spin-slow" /> : <Save size={14} />}
                {busy ? 'Saving Quotas…' : 'Save All Quotas'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}

export function CompanyDefaultsModal({ open, onClose, currentDefaults, employees = [], onSaveDefaults, onBulkApply }) {
  const [form, setForm] = useState({ ...currentDefaults })
  const [busy, setBusy] = useState(false)
  const [confirmBulk, setConfirmBulk] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ ...currentDefaults })
      setConfirmBulk(false)
    }
  }, [open])

  if (!open) return null

  const handleSave = (e) => {
    if (e?.preventDefault) e.preventDefault()
    onSaveDefaults(form)
    onClose()
  }

  const handleApplyAll = async () => {
    setBusy(true)
    try {
      await onBulkApply(form)
      onClose()
    } catch (err) {
      alert(err.message || 'Failed to bulk apply defaults.')
    } finally {
      setBusy(false)
    }
  }

  const leaveKeys = ['casual', 'sick', 'earned', 'comp_off', 'maternity', 'lop']

  const modalContent = (
    <div className="quota-modal-backdrop" onClick={onClose}>
      <div className="quota-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="quota-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
              Configure Default Company Leave Quotas
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Define standard default leave allowances for the organization.
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="quota-modal-body">
            <div className="quota-inputs-grid">
              {leaveKeys.map((key) => {
                const meta = LEAVE_TYPE_META[key]
                const Icon = meta.icon
                return (
                  <div key={key} className="quota-input-box">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: meta.bg, color: meta.color, display: 'grid', placeItems: 'center' }}>
                          <Icon size={12} />
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                          {meta.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: meta.bg, color: meta.color }}>
                        {meta.code}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        required
                        value={form[key] !== undefined && form[key] !== null ? form[key] : ''}
                        onChange={(e) => {
                          const v = e.target.value
                          setForm((prev) => ({ ...prev, [key]: v === '' ? '' : Number(v) }))
                        }}
                        onBlur={() => {
                          setForm((prev) => ({ ...prev, [key]: Math.max(0, Number(prev[key] || 0)) }))
                        }}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', fontWeight: 700, textAlign: 'right' }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Days</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                      Default annual entitlement
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Bulk Apply Notice Card */}
            <div style={{ background: '#f8fafc', border: '1px dashed var(--line)', borderRadius: '10px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: 'var(--ink)', display: 'block' }}>
                    Bulk Apply Defaults to All Employees ({employees.length} Staff)
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Overwrites or initializes all employees with these default quotas.
                  </span>
                </div>
                {!confirmBulk ? (
                  <button
                    type="button"
                    className="ui-button secondary"
                    onClick={() => setConfirmBulk(true)}
                    style={{ fontSize: '11px', padding: '5px 12px' }}
                  >
                    ⚡ Apply to All Staff
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="ui-button primary"
                      disabled={busy}
                      onClick={handleApplyAll}
                      style={{ fontSize: '11px', padding: '5px 12px', background: '#dc2626' }}
                    >
                      {busy ? 'Applying…' : 'Confirm Bulk Apply'}
                    </button>
                    <button
                      type="button"
                      className="ui-button secondary"
                      onClick={() => setConfirmBulk(false)}
                      style={{ fontSize: '11px', padding: '5px 8px' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="quota-modal-footer">
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Saved default quotas will be suggested for all employee configurations.
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="ui-button secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="ui-button primary"
                onClick={handleSave}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={14} /> Save Company Defaults
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}

export function LeaveBalanceTable({ balances = [], employees = [], onSwitchTab }) {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'full_time' | 'intern'
  const [expandedEmpIds, setExpandedEmpIds] = useState(() => new Set())
  const [modalEmployee, setModalEmployee] = useState(null)
  const [allInOneOpen, setAllInOneOpen] = useState(false)
  const [defaultsModalOpen, setDefaultsModalOpen] = useState(false)
  const [companyDefaults, setCompanyDefaults] = useState(() => getDefaultCompanyQuotas())
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('success')
  const [busy, setBusy] = useState(false)

  // Resolve employees from prop or store
  const rawEmployees = employees.length > 0 ? employees : (hrStore.getState().employees || [])

  // Helper to match a balance record to an employee
  const matchBalance = (b, emp) => {
    if (!b || !emp) return false
    const empIdStr = String(emp.id || emp._id || '').trim().toLowerCase()
    const empCode = String(emp.employeeId || '').trim().toLowerCase()

    if (typeof b.employeeId === 'object' && b.employeeId !== null) {
      const bObjId = String(b.employeeId._id || b.employeeId.id || '').trim().toLowerCase()
      const bObjCode = String(b.employeeId.employeeId || '').trim().toLowerCase()
      if (bObjId && empIdStr && bObjId === empIdStr) return true
      if (bObjCode && empCode && bObjCode === empCode) return true
      if (bObjId && empCode && bObjId === empCode) return true
      if (bObjCode && empIdStr && bObjCode === empIdStr) return true
    } else if (b.employeeId) {
      const bStr = String(b.employeeId).trim().toLowerCase()
      if (empIdStr && bStr === empIdStr) return true
      if (empCode && bStr === empCode) return true
    }
    return false
  }

  // Build unique employee map with structured balances
  const employeeMap = new Map()

  // 1. Register active employees
  for (const emp of rawEmployees) {
    const key = emp.id || emp._id || emp.employeeId
    if (key) {
      employeeMap.set(String(key), {
        id: emp.id || emp._id,
        _id: emp._id || emp.id,
        name: emp.name || 'Unnamed Employee',
        employeeId: emp.employeeId || '',
        department: emp.department || 'General',
        designation: emp.designation || emp.role || 'Team Member',
        employmentType: emp.employmentType || '',
        avatar: emp.avatar || '',
        balances: {},
      })
    }
  }

  // 2. Map balances
  for (const b of balances) {
    let matchedKey = null
    for (const [key, emp] of employeeMap.entries()) {
      if (matchBalance(b, emp)) {
        matchedKey = key
        break
      }
    }

    if (!matchedKey) {
      const empObj = typeof b.employeeId === 'object' && b.employeeId !== null ? b.employeeId : null
      const key = empObj?._id || empObj?.id || empObj?.employeeId || b.employeeId || `emp-${employeeMap.size}`
      const empEntry = {
        id: key,
        _id: empObj?._id || key,
        name: empObj?.name || 'Employee',
        employeeId: empObj?.employeeId || (typeof b.employeeId === 'string' ? b.employeeId : ''),
        department: empObj?.department || 'General',
        designation: 'Team Member',
        employmentType: empObj?.employmentType || '',
        avatar: '',
        balances: {},
      }
      employeeMap.set(String(key), empEntry)
      matchedKey = String(key)
    }

    const emp = employeeMap.get(matchedKey)
    if (emp && b.leaveType) {
      const allowance = Number(b.allowance || 0)
      const used = Number(b.used || 0)
      const reserved = Number(b.reserved || 0)
      emp.balances[b.leaveType.toLowerCase()] = {
        allowance,
        used,
        reserved,
        available: allowance - used - reserved,
        _id: b._id,
      }
    }
  }

  const allStaffList = Array.from(employeeMap.values()).map((emp) => {
    const leaveKeys = ['casual', 'sick', 'earned', 'comp_off', 'maternity', 'lop']
    const isIntern = isInternEmployee(emp)

    // Check if HR has configured leave balances with explicit values
    const configuredList = Object.entries(emp.balances || {}).filter(([_, b]) => b?.allowance !== undefined && b?.allowance !== null && Number(b.allowance) > 0)
    const hasConfigured = configuredList.length > 0

    let isAutoFilled = false
    if (!hasConfigured) {
      // Auto-fill from policy: Full-Time: 2 days (1 CL + 1 SL), Intern: 1 day (1 SL)
      isAutoFilled = true
      const defaultCasual = isIntern ? 0 : 1
      const defaultSick = 1
      emp.balances.casual = { allowance: defaultCasual, used: 0, reserved: 0, available: defaultCasual }
      emp.balances.sick = { allowance: defaultSick, used: 0, reserved: 0, available: defaultSick }
      for (const k of ['earned', 'comp_off', 'maternity', 'lop']) {
        if (!emp.balances[k]) {
          emp.balances[k] = { allowance: 0, used: 0, reserved: 0, available: 0 }
        }
      }
    } else {
      // Ensure missing keys have structured objects
      if (!emp.balances.casual) emp.balances.casual = { allowance: isIntern ? 0 : 1, used: 0, reserved: 0, available: isIntern ? 0 : 1 }
      if (!emp.balances.sick) emp.balances.sick = { allowance: 1, used: 0, reserved: 0, available: 1 }
      for (const k of ['earned', 'comp_off', 'maternity', 'lop']) {
        if (!emp.balances[k]) emp.balances[k] = { allowance: 0, used: 0, reserved: 0, available: 0 }
      }
    }

    let totalAllowance = 0
    let totalUsed = 0
    let totalReserved = 0
    let totalAvailable = 0

    for (const k of leaveKeys) {
      const item = emp.balances[k]
      if (item) {
        totalAllowance += item.allowance
        totalUsed += item.used
        totalReserved += item.reserved
        totalAvailable += item.available
      }
    }

    return {
      ...emp,
      isIntern,
      isAutoFilled,
      totalAllowance,
      totalUsed,
      totalReserved,
      totalAvailable,
    }
  })

  // Extract departments for filter
  const departments = Array.from(new Set(allStaffList.map((e) => e.department).filter(Boolean)))

  // Filter employees
  const filteredStaff = allStaffList.filter((emp) => {
    if (selectedDept !== 'all' && emp.department !== selectedDept) return false
    if (typeFilter === 'intern' && !emp.isIntern) return false
    if (typeFilter === 'full_time' && emp.isIntern) return false
    if (!search.trim()) return true
    const q = search.toLowerCase().trim()
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    )
  })

  // Toggle single employee expansion
  const toggleExpand = (empId) => {
    setExpandedEmpIds((prev) => {
      const next = new Set(prev)
      if (next.has(empId)) {
        next.delete(empId)
      } else {
        next.add(empId)
      }
      return next
    })
  }

  // Toggle expand all / collapse all
  const toggleExpandAll = () => {
    if (expandedEmpIds.size === filteredStaff.length && filteredStaff.length > 0) {
      setExpandedEmpIds(new Set())
    } else {
      setExpandedEmpIds(new Set(filteredStaff.map((e) => e.id || e._id || e.employeeId)))
    }
  }

  // Open modal for specific employee
  const handleEditEmployeeQuotas = (emp, e) => {
    if (e) e.stopPropagation()
    setModalEmployee(emp)
    setAllInOneOpen(true)
  }

  // 1-Click Auto Apply Policy to ALL employees
  const handleApplyPolicyToAll = async () => {
    setBusy(true)
    try {
      const res = await apiClient.post('/leave/hr/balances/auto-fill-policies')
      await hrStore.refresh()
      setNotice(res.data?.message || `Successfully applied standard policy to all ${allStaffList.length} employees (Full-Time: 2 days, Intern: 1 day)!`)
      setNoticeType('success')
      setTimeout(() => setNotice(''), 5000)
    } catch {
      // Fallback: save individually
      try {
        for (const emp of allStaffList) {
          const empId = emp.id || emp._id || emp.employeeId
          const isIntern = isInternEmployee(emp)
          await apiClient.put(`/leave/hr/balances/${empId}/casual`, { allowance: isIntern ? 0 : 1 })
          await apiClient.put(`/leave/hr/balances/${empId}/sick`, { allowance: 1 })
        }
        await hrStore.refresh()
        setNotice(`Successfully applied standard monthly policy to all ${allStaffList.length} employees!`)
        setNoticeType('success')
        setTimeout(() => setNotice(''), 5000)
      } catch (fallbackErr) {
        setNotice(fallbackErr.message || 'Failed to auto-apply policy.')
        setNoticeType('error')
        setTimeout(() => setNotice(''), 5000)
      }
    } finally {
      setBusy(false)
    }
  }

  // Quick apply standard policy to a single employee
  const handleApplyPolicyToSingleEmployee = async (emp, e) => {
    if (e) e.stopPropagation()
    const empId = emp.id || emp._id || emp.employeeId
    const isIntern = isInternEmployee(emp)
    try {
      await apiClient.put(`/leave/hr/balances/${empId}/casual`, { allowance: isIntern ? 0 : 1 })
      await apiClient.put(`/leave/hr/balances/${empId}/sick`, { allowance: 1 })
      await hrStore.refresh()
      setNotice(`Applied ${isIntern ? 'Intern Policy (1 SL)' : 'Full-Time Policy (1 CL + 1 SL)'} to ${emp.name}!`)
      setNoticeType('success')
      setTimeout(() => setNotice(''), 4000)
    } catch (err) {
      setNotice(err.message || 'Failed to apply policy.')
      setNoticeType('error')
      setTimeout(() => setNotice(''), 4000)
    }
  }

  // Save new company defaults
  const handleSaveCompanyDefaults = (newDefaults) => {
    saveDefaultCompanyQuotas(newDefaults)
    setCompanyDefaults(newDefaults)
    setNotice('Company default leave quotas saved successfully!')
    setNoticeType('success')
    setTimeout(() => setNotice(''), 4000)
  }

  // Bulk apply defaults to all employees via high-performance batch endpoint
  const handleBulkApply = async (newDefaults) => {
    try {
      const res = await apiClient.post('/leave/hr/balances/bulk-apply', { defaults: newDefaults })
      await hrStore.refresh()
      setNotice(res?.data?.message || res?.message || `Successfully applied default quotas to all employees!`)
      setNoticeType('success')
    } catch (bulkErr) {
      console.warn('Batch bulk-apply error, trying batch fallback:', bulkErr.message)
      // Fallback in chunks of 5 employees
      const types = ['casual', 'sick', 'earned', 'comp_off', 'maternity', 'lop']
      for (const emp of allStaffList) {
        const empId = emp.id || emp._id || emp.employeeId
        for (const t of types) {
          try {
            await apiClient.put(`/leave/hr/balances/${empId}/${t}`, { allowance: newDefaults[t] })
          } catch (e) {
            console.warn(`Allowance skip for ${empId}/${t}:`, e.message)
          }
        }
      }
      await hrStore.refresh()
      setNotice(`Applied default quotas to ${allStaffList.length} employees!`)
      setNoticeType('success')
    }
    setTimeout(() => setNotice(''), 5000)
  }

  // Compute overall KPI aggregates
  const totalStaffCount = allStaffList.length
  const totalAllocatedAll = allStaffList.reduce((sum, e) => sum + e.totalAllowance, 0)
  const totalUsedAll = allStaffList.reduce((sum, e) => sum + e.totalUsed, 0)
  const totalAvailableAll = allStaffList.reduce((sum, e) => sum + e.totalAvailable, 0)

  const leaveKeys = ['casual', 'sick', 'earned', 'comp_off', 'maternity', 'lop']

  return (
    <section className="panel" style={{ padding: '24px' }}>
      {/* 1. TOP HEADER & DIRECT ACTION BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} style={{ color: 'var(--teal)' }} /> Leave Balances & Quotas
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '3px 0 0 0' }}>
            Monthly allocations. Unconfigured employees are automatically assigned policy leaves (Full-Time: 2 days, Interns: 1 day).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ui-button primary"
            onClick={handleApplyPolicyToAll}
            disabled={busy}
            style={{ fontSize: '12px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {busy ? <RefreshCw size={13} className="spin-slow" /> : <Sparkles size={13} />}
            ⚡ Auto-Fill All by Policy
          </button>
          <button
            type="button"
            className="ui-button secondary"
            onClick={() => {
              setModalEmployee(null)
              setAllInOneOpen(true)
            }}
            style={{ fontSize: '12px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={13} /> Custom Quota
          </button>
          <button
            type="button"
            className="ui-button secondary"
            onClick={() => setDefaultsModalOpen(true)}
            style={{ fontSize: '12px', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            title="Configure advanced templates"
          >
            <Settings size={13} /> Defaults
          </button>
        </div>
      </div>

      {/* 1.1 CLEAN, MODERN POLICY CARDS STRIP (REPLACES CROWDED TEXT WALL) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '10px',
        marginBottom: '18px',
      }}>
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center', fontSize: '15px', flexShrink: 0 }}>
            💼
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#166534' }}>
              Full-Time: 2 Paid Days / mo
            </div>
            <div style={{ fontSize: '11px', color: '#15803d' }}>
              1 Casual Leave (CL) + 1 Sick Leave (SL)
            </div>
          </div>
        </div>

        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', display: 'grid', placeItems: 'center', fontSize: '15px', flexShrink: 0 }}>
            🎓
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#075985' }}>
              Interns: 1 Paid Day / mo
            </div>
            <div style={{ fontSize: '11px', color: '#0284c7' }}>
              1 Sick Leave (SL) • Monthly refresh
            </div>
          </div>
        </div>

        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', fontSize: '15px', flexShrink: 0 }}>
            ⚠️
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#92400e' }}>
              Month-End Rule (25th+)
            </div>
            <div style={{ fontSize: '11px', color: '#b45309' }}>
              Leaves from 25th onwards = Double LOP
            </div>
          </div>
        </div>
      </div>

      {/* 2. NOTICE BANNER */}
      {notice && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '16px',
            background: noticeType === 'error' ? '#fef2f2' : '#e6fffa',
            border: noticeType === 'error' ? '1px solid #fecaca' : '1px solid #b2f5ea',
            color: noticeType === 'error' ? '#dc2626' : '#006E6F',
            animation: 'fadeUp 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {noticeType === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit' }}>
            ✕
          </button>
        </div>
      )}

      {/* 3. KPI SUMMARY CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: '#fafbfc', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Covered Workforce
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
            {totalStaffCount} Staff
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Active enrolled team</span>
        </div>

        <div style={{ background: '#fafbfc', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Monthly Quota Pool
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
            {totalAllocatedAll} Days
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Standard monthly entitlement</span>
        </div>

        <div style={{ background: '#fafbfc', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Leave Taken
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: totalUsedAll > 0 ? '#d97706' : 'var(--muted)', marginTop: '2px' }}>
            {totalUsedAll} Days
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Approved leaves this month</span>
        </div>

        <div style={{ background: '#fafbfc', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Available Remaining
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#006E6F', marginTop: '2px' }}>
            {totalAvailableAll} Days
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Remaining company pool</span>
        </div>
      </div>

      {/* 4. SEARCH & FILTER TOOLBAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          background: '#fafbfc',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 260px', maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search employee by name, ID, or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                fontSize: '12.5px',
                background: '#fff',
              }}
            />
          </div>
          {search && (
            <button
              type="button"
              className="icon-button"
              onClick={() => setSearch('')}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Employment Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '12px', background: '#fff' }}
          >
            <option value="all">All Roles (Full-Time & Interns)</option>
            <option value="full_time">💼 Full-Time Only</option>
            <option value="intern">🎓 Interns Only</option>
          </select>

          {/* Department Filter */}
          {departments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={13} style={{ color: 'var(--muted)' }} />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '12px', background: '#fff' }}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            className="ui-button secondary"
            onClick={toggleExpandAll}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            {expandedEmpIds.size === filteredStaff.length && filteredStaff.length > 0
              ? 'Collapse All'
              : 'Expand All'}
          </button>
        </div>
      </div>

      {/* 5. GROUPED EMPLOYEE DIRECTORY & DE-CROWDED ROW CARDS */}
      {filteredStaff.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', background: '#fafbfc', borderRadius: '12px', border: '1px dashed var(--line)' }}>
          <Users size={28} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
            No matching employees found
          </p>
          <span style={{ fontSize: '12px' }}>
            {search ? 'Try clearing or modifying your search filter.' : 'Add employees to assign leave quotas.'}
          </span>
        </div>
      ) : (
        <div>
          {filteredStaff.map((emp) => {
            const empKey = emp.id || emp._id || emp.employeeId
            const isExpanded = expandedEmpIds.has(empKey)

            // Extract ONLY leave types where allowance > 0 (prevents 4-5 zero-badges clutter!)
            const activeLeaveTypes = leaveKeys.filter((k) => {
              const bal = emp.balances[k]
              return bal && Number(bal.allowance) > 0
            })

            return (
              <div key={empKey} className={`emp-balance-row-card ${isExpanded ? 'expanded' : ''}`}>
                {/* Clickable Header Row */}
                <div className="emp-balance-header-row" onClick={() => toggleExpand(empKey)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
                    <div style={{ color: isExpanded ? 'var(--teal)' : 'var(--muted)', transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={18} />
                    </div>

                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: emp.isIntern ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(2, 132, 199, 0.05))' : 'linear-gradient(135deg, rgba(0, 110, 111, 0.15), rgba(0, 110, 111, 0.05))',
                        color: emp.isIntern ? '#0284c7' : 'var(--teal)',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        border: emp.isIntern ? '1px solid rgba(2, 132, 199, 0.2)' : '1px solid rgba(0, 110, 111, 0.2)',
                        flexShrink: 0,
                      }}
                    >
                      {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{emp.name}</strong>
                        {emp.employeeId && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                            {emp.employeeId}
                          </span>
                        )}
                        {/* Clear Employment Type Badge */}
                        {emp.isIntern ? (
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                            🎓 Intern
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                            💼 Full-Time
                          </span>
                        )}
                        {emp.isAutoFilled && (
                          <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }} title="Automatically initialized from company monthly policy">
                            ⚡ Auto-Policy
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', display: 'block' }}>
                        {emp.department} • {emp.designation}
                      </span>
                    </div>
                  </div>

                  {/* Clean Middle & Right Badges (No more crowded zeros!) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {/* Active Leaves Only (Hides 0s) */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {activeLeaveTypes.length > 0 ? (
                        activeLeaveTypes.map((k) => {
                          const bal = emp.balances[k]
                          const meta = LEAVE_TYPE_META[k]
                          if (!bal || !meta) return null
                          return (
                            <span
                              key={k}
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: meta.bg,
                                border: `1px solid ${meta.color}33`,
                                color: meta.color,
                              }}
                            >
                              {meta.code}: {bal.allowance}d
                            </span>
                          )
                        })
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                          No active quota
                        </span>
                      )}
                    </div>

                    {/* Available Days Pill */}
                    <div style={{ textAlign: 'right', minWidth: '130px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '12px',
                          fontWeight: 800,
                          padding: '3px 12px',
                          borderRadius: '999px',
                          background: emp.totalAvailable > 0 ? '#ecfdf5' : '#fef2f2',
                          color: emp.totalAvailable > 0 ? '#047857' : '#dc2626',
                          border: emp.totalAvailable > 0 ? '1px solid #a7f3d0' : '1px solid #fecaca',
                        }}
                      >
                        {emp.totalAvailable} {emp.totalAvailable === 1 ? 'Day' : 'Days'} Available
                      </span>
                      <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        Quota: {emp.totalAllowance}d | Used: {emp.totalUsed}d
                      </div>
                    </div>

                    {/* Quick Edit Action Button */}
                    <button
                      type="button"
                      className="ui-button secondary"
                      onClick={(e) => handleEditEmployeeQuotas(emp, e)}
                      style={{ fontSize: '11px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={11} /> Edit Quotas
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown Drawer */}
                {isExpanded && (
                  <div className="emp-balance-details-drawer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
                        Detailed Leave Category Quotas for {emp.name}:
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="ui-button secondary"
                          onClick={(e) => handleApplyPolicyToSingleEmployee(emp, e)}
                          style={{ fontSize: '11px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Sparkles size={11} style={{ color: 'var(--teal)' }} />
                          Apply {emp.isIntern ? 'Intern Policy (1 SL)' : 'Full-Time Policy (1 CL + 1 SL)'}
                        </button>
                        <button
                          type="button"
                          className="ui-button primary"
                          onClick={(e) => handleEditEmployeeQuotas(emp, e)}
                          style={{ fontSize: '11px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit2 size={11} /> Customize Quotas
                        </button>
                      </div>
                    </div>

                    {/* 6 Category Breakdown Cards */}
                    <div className="emp-leave-breakdown-grid">
                      {leaveKeys.map((key) => {
                        const meta = LEAVE_TYPE_META[key]
                        const Icon = meta.icon
                        const record = emp.balances[key]
                        const allowance = record ? record.allowance : 0
                        const used = record ? record.used : 0
                        const reserved = record ? record.reserved : 0
                        const available = allowance - used - reserved
                        const percentUsed = allowance > 0 ? Math.min(100, Math.round((used / allowance) * 100)) : 0

                        return (
                          <div key={key} className="emp-leave-item-card">
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: meta.bg, color: meta.color, display: 'grid', placeItems: 'center' }}>
                                    <Icon size={12} />
                                  </span>
                                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink)' }}>
                                    {meta.name}
                                  </span>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: meta.bg, color: meta.color }}>
                                  {meta.code}
                                </span>
                              </div>

                              <div style={{ marginTop: '8px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: available > 0 ? '#006E6F' : '#dc2626' }}>
                                  {available} <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Days Rem.</span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span>Allowance: <strong>{allowance}d</strong></span>
                                  <button
                                    type="button"
                                    className="ui-button secondary"
                                    onClick={(e) => handleEditEmployeeQuotas(emp, e)}
                                    style={{ fontSize: '10px', padding: '1px 6px', height: 'auto', lineHeight: '1.4' }}
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div style={{ marginTop: '10px' }}>
                              {/* Mini progress bar */}
                              <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '4px' }}>
                                <div style={{ width: `${percentUsed}%`, height: '100%', background: percentUsed > 80 ? '#dc2626' : 'var(--teal)', borderRadius: '999px' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)' }}>
                                <span>Used: {used}d</span>
                                <span>Res: {reserved}d</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 6. ALL-IN-ONE QUOTA MODAL */}
      <AllInOneQuotaModal
        open={allInOneOpen}
        onClose={() => {
          setAllInOneOpen(false)
          setModalEmployee(null)
        }}
        targetEmployee={modalEmployee}
        employees={allStaffList}
        defaults={companyDefaults}
        onSuccess={(msg) => {
          setNotice(msg)
          setNoticeType('success')
          setTimeout(() => setNotice(''), 4500)
        }}
      />

      {/* 7. COMPANY DEFAULTS MODAL */}
      <CompanyDefaultsModal
        open={defaultsModalOpen}
        onClose={() => setDefaultsModalOpen(false)}
        currentDefaults={companyDefaults}
        employees={allStaffList}
        onSaveDefaults={handleSaveCompanyDefaults}
        onBulkApply={handleBulkApply}
      />
    </section>
  )
}

