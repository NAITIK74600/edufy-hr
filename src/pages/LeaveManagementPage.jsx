import { parseLocationHash } from '../navigation/navigationResolver.js'
import { useEffect, useState, useMemo } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Layers,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Sun,
  Moon,
  Table as TableIcon,
  Trash2,
  UserCheck,
  Users,
  X,
  ShieldAlert,
} from 'lucide-react'
import { Button, ConfirmationDialog, DataTable, EmptyState, Field, PageHeader, StatePanel, StatusBadge } from '../components/ui'
import { apiClient } from '../services/apiClient'
import { hrStore, storeAction } from '../services/hrStore'
import { todayKey } from '../services/connectedStore'
import { LeaveBalanceTable, LeavePolicySettings } from './LeavePolicySettings'
import { useAuth } from '../auth/AuthContext'

const labels = {
  pending_tl: 'Pending TL Approval',
  pending_manager: 'Pending Manager Approval',
  pending_director: 'Pending Director Sign-Off',
  pending_hr: 'Pending HR Review',
  pending_admin: 'Pending Admin Approval (LOP)',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

const leaveTypeLabels = {
  casual: 'Casual Leave (CL)',
  sick: 'Sick / Medical Leave (SL)',
  earned: 'Earned / Privilege Leave (EL)',
  comp_off: 'Compensatory Off',
  maternity: 'Maternity / Paternity Leave',
  lop: 'Loss of Pay (LOP) / Unpaid',
}

const PUBLIC_HOLIDAYS_2026 = [
  { date: '2026-01-26', day: 'Monday', name: 'Republic Day', type: 'Gazetted Mandatory' },
  { date: '2026-03-17', day: 'Tuesday', name: 'Holi (Festival of Colors)', type: 'Gazetted Mandatory' },
  { date: '2026-04-03', day: 'Friday', name: 'Good Friday', type: 'Restricted / Optional' },
  { date: '2026-04-14', day: 'Tuesday', name: 'Dr. B.R. Ambedkar Jayanti', type: 'Gazetted Mandatory' },
  { date: '2026-05-01', day: 'Friday', name: 'International Labor Day', type: 'Corporate Holiday' },
  { date: '2026-08-15', day: 'Saturday', name: 'Independence Day', type: 'Gazetted Mandatory' },
  { date: '2026-10-02', day: 'Friday', name: 'Mahatma Gandhi Jayanti', type: 'Gazetted Mandatory' },
  { date: '2026-10-20', day: 'Tuesday', name: 'Dussehra (Vijayadashami)', type: 'Gazetted Mandatory' },
  { date: '2026-11-08', day: 'Sunday', name: 'Diwali (Deepavali)', type: 'Gazetted Mandatory' },
  { date: '2026-12-25', day: 'Friday', name: 'Christmas Day', type: 'Gazetted Mandatory' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function RequestStatus({ status }) {
  const tone =
    status === 'approved'
      ? 'info'
      : status === 'rejected' || status === 'cancelled'
      ? 'warning'
      : status === 'pending_admin'
      ? 'danger'
      : status === 'pending_director'
      ? 'purple'
      : status === 'pending_manager'
      ? 'blue'
      : status === 'pending_tl'
      ? 'teal'
      : status === 'pending_hr'
      ? 'warning'
      : 'neutral'

  return (
    <StatusBadge tone={tone}>
      {labels[status] ?? status}
    </StatusBadge>
  )
}

function RequestCard({ request, onSelect, selected, onQuickApprove, onQuickReject }) {
  if (!request) return null
  const employee = request.employeeName || request.employeeId?.name || 'Employee'
  const empCode = request.employeeCode || (typeof request.employeeId === 'object' ? request.employeeId?.employeeId : '') || ''
  const isHalfDay = Boolean(request.isHalfDay || request.days === 0.5 || request.units === 0.5)
  const isPending =
    request.status === 'pending_tl' ||
    request.status === 'pending_manager' ||
    request.status === 'pending_director' ||
    request.status === 'pending_hr' ||
    request.status === 'pending_admin'

  const initials = (employee || 'E')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const hue = (employee || 'A').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360

  return (
    <div
      className={`leave-request-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(request)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '13px 15px',
        borderRadius: '11px',
        border: selected ? '1.5px solid var(--teal, #006e6f)' : '1px solid var(--line)',
        background: selected ? 'rgba(0, 110, 111, 0.03)' : '#ffffff',
        boxShadow: selected ? '0 4px 14px rgba(0, 110, 111, 0.08)' : '0 2px 6px rgba(35, 38, 35, 0.02)',
        transition: 'all 0.18s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', width: '100%' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: `hsl(${hue}, 65%, 92%)`,
            color: `hsl(${hue}, 80%, 28%)`,
            display: 'grid',
            placeItems: 'center',
            fontSize: '12.5px',
            fontWeight: 700,
            flexShrink: 0,
            border: `1px solid hsl(${hue}, 50%, 82%)`,
          }}
        >
          {initials}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <strong style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {employee}
              </strong>
              {empCode && (
                <span style={{ fontSize: '9.5px', color: 'var(--muted)', background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px', fontWeight: 500, flexShrink: 0 }}>
                  {empCode}
                </span>
              )}
            </div>
            <RequestStatus status={request.status} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 500 }}>
              {isHalfDay ? formatDate(request.startDate) : `${formatDate(request.startDate)} → ${formatDate(request.endDate)}`}
            </span>
            <span style={{ fontSize: '9.5px', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
              {isHalfDay ? '0.5 Day' : `${request.days || request.units || 1}d`}
            </span>
            {isHalfDay && (
              <span className="half-day-badge" style={{ fontSize: '9.5px' }}>
                {request.halfDayPeriod === 'second_half' ? '2nd Half' : '1st Half'}
              </span>
            )}
            {/* Accurate Leave Badges */}
            {Boolean(request.isDoubleLop || request.doubleLopDays > 0 || request.doubleLopUnits > 0 || request.leaveType === 'double_lop') ? (
              <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Double LOP (25th+)
              </span>
            ) : Boolean(request.normalLopUnits > 0 || request.leaveType === 'lop' || (request.unpaidUnits > 0 && !request.isDoubleLop)) ? (
              <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Normal LOP
              </span>
            ) : Boolean(request.casualLeaveUnits > 0 && request.sickLeaveUnits > 0) ? (
              <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                CL + SL (Paid)
              </span>
            ) : Boolean(request.casualLeaveUnits > 0 || request.leaveType === 'casual') ? (
              <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Casual Leave (Paid)
              </span>
            ) : Boolean(request.sickLeaveUnits > 0 || request.leaveType === 'sick') ? (
              <span style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Sick Leave (Paid)
              </span>
            ) : (
              <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {leaveTypeLabels[request.leaveType] || request.leaveType}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px', paddingTop: '6px', borderTop: '1px solid #f3f4f6' }}>
        <span
          style={{
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '11px',
            color: '#64748b'
          }}
          title={request.reason}
        >
          <strong style={{ color: '#334155' }}>Note:</strong> {request.reason || 'No justification specified'}
        </span>

        {isPending && onQuickApprove && (
          <div
            className="emp-action-group"
            onClick={(e) => e.stopPropagation()}
            style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', gap: '6px' }}
          >
            <button
              type="button"
              className="emp-action-btn view"
              onClick={() => onQuickApprove(request)}
              title="Quick Approve"
              style={{ padding: '3px 8px', fontSize: '10.5px' }}
            >
              <Check size={11} /> Approve
            </button>
            <button
              type="button"
              className="emp-action-btn delete"
              onClick={() => onQuickReject(request)}
              title="Quick Reject"
              style={{ padding: '3px 8px', fontSize: '10.5px' }}
            >
              <X size={11} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RequestDetail({ request, mode, onRefresh, onDeleteRequest }) {
  const { user } = useAuth()
  const [decisionReason, setDecisionReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [localStatus, setLocalStatus] = useState(null)

  useEffect(() => {
    setLocalStatus(null)
  }, [request?.id, request?.status])

  if (!request) {
    return (
      <div className="leave-detail-empty">
        <CalendarDays size={26} />
        <strong>Select a Leave Request</strong>
        <span>Choose a request from the list or table to review employee details, notes, and approval timeline.</span>
      </div>
    )
  }

  const currentStatus = localStatus || request?.status

  const isAdmin = user?.role === 'admin' || (user?.permissions || []).includes('admin.access')
  const isDirector = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
  const isManager = ['manager', 'revenue_growth_manager', 'senior_manager'].includes(user?.role)
  const isTeamLead = ['team_lead', 'team_leader'].includes(user?.role)
  const isHrOrAdmin = mode === 'hr' || mode === 'admin' || ['admin', 'hr', 'director', 'managing_director'].includes(user?.role) || (user?.permissions || []).includes('leave.hr.review')

  // Resolve candidate IDs of current viewer
  const userCandIds = [user?.id, user?._id, user?.employeeId].filter(Boolean).map(String)
  const reqMgrId = request?.managerId?._id || request?.managerId?.id || request?.managerId
  const isAssignedManagerOfThisRequest = Boolean(reqMgrId && userCandIds.includes(String(reqMgrId)))

  const reqEmpId = request?.employeeId?._id || request?.employeeId?.id || request?.employeeId
  const reqEmpCode = request?.employeeId?.employeeId || (typeof request?.employeeId === 'string' ? request?.employeeId : null)
  const isOwnRequest = Boolean(userCandIds.includes(String(reqEmpId)) || (reqEmpCode && userCandIds.includes(String(reqEmpCode))))

  // Team Lead does not approve leaves; TL is only notified of squad member leaves. Manager approves!
  const canTlDecide = false

  // Can Manager decide? (Assigned manager, Department Manager, Director, or HR)
  const canManagerDecide = (isManager || isDirector || isHrOrAdmin || isAssignedManagerOfThisRequest) && (currentStatus === 'pending_manager' || currentStatus === 'pending_tl' || request.currentApproverRole === 'manager' || request.currentApproverRole === 'team_lead')

  // Can Director decide? (Manager leave pending Director approval or executive review)
  const canDirectorDecide = (isDirector || isHrOrAdmin) && (currentStatus === 'pending_director' || request.currentApproverRole === 'director')

  // Can Admin decide? (25th Month LOP leave pending final Admin sign-off)
  const canAdminDecide = isAdmin && (currentStatus === 'pending_admin' || request.currentApproverRole === 'admin')

  // Can HR decide? (HR reviews pending_hr or advances 25th month LOP to admin)
  const canHrDecide = isHrOrAdmin && ['pending_hr', 'pending_manager', 'pending_director'].includes(currentStatus)
  const canDecide = canAdminDecide || canManagerDecide || canDirectorDecide || canHrDecide

  // Cancel is strictly for the applicant on their own request in self-service mode (never in HR/Admin review mode)
  const canCancel = isOwnRequest && mode === 'ess' && ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin'].includes(currentStatus)

  async function handleApprove() {
    setBusy(true)
    setError('')
    try {
      let role = 'hr'
      if (canAdminDecide || (isAdmin && currentStatus === 'pending_admin')) {
        role = 'admin'
      } else if (isAssignedManagerOfThisRequest && !isHrOrAdmin) {
        role = isTeamLead ? 'team_lead' : 'manager'
      } else if (canTlDecide && !isHrOrAdmin) {
        role = 'team_lead'
      } else if (canManagerDecide && !isHrOrAdmin) {
        role = 'manager'
      } else if (canDirectorDecide && !isHrOrAdmin) {
        role = 'director'
      } else if (isDirector) {
        role = 'director'
      } else if (currentStatus === 'pending_tl') {
        role = 'team_lead'
      } else if (currentStatus === 'pending_manager') {
        role = 'manager'
      } else if (currentStatus === 'pending_director') {
        role = 'director'
      } else if (currentStatus === 'pending_admin') {
        role = 'admin'
      }
      await hrStore.approveLeave(request.id, role, decisionReason, user)
      setLocalStatus('approved')
      setDecisionReason('')
      onRefresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    if (!decisionReason.trim()) {
      setError('A decision comment or reason is required to reject a leave request.')
      return
    }
    setBusy(true)
    setError('')
    try {
      let role = 'hr'
      if (canAdminDecide || (isAdmin && currentStatus === 'pending_admin')) {
        role = 'admin'
      } else if (isAssignedManagerOfThisRequest && !isHrOrAdmin) {
        role = isTeamLead ? 'team_lead' : 'manager'
      } else if (canTlDecide && !isHrOrAdmin) {
        role = 'team_lead'
      } else if (canManagerDecide && !isHrOrAdmin) {
        role = 'manager'
      } else if (canDirectorDecide && !isHrOrAdmin) {
        role = 'director'
      } else if (isDirector) {
        role = 'director'
      } else if (currentStatus === 'pending_tl') {
        role = 'team_lead'
      } else if (currentStatus === 'pending_manager') {
        role = 'manager'
      } else if (currentStatus === 'pending_director') {
        role = 'director'
      } else if (currentStatus === 'pending_admin') {
        role = 'admin'
      }
      await hrStore.rejectLeave(request.id, role, decisionReason, user)
      setLocalStatus('rejected')
      setDecisionReason('')
      onRefresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel leave-detail-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Leave Dossier</p>
          <h2>{leaveTypeLabels[request.leaveType] || request.leaveType?.toUpperCase()}</h2>
        </div>
        <RequestStatus status={currentStatus} />
      </div>

      <div className="leave-detail-summary">
        <div>
          <span>Dates</span>
          <strong>
            {Boolean(request.isHalfDay || request.days === 0.5 || request.units === 0.5)
              ? formatDate(request.startDate)
              : `${formatDate(request.startDate)} – ${formatDate(request.endDate)}`}
          </strong>
          {Boolean(request.isHalfDay || request.days === 0.5 || request.units === 0.5) && (
            <span style={{ display: 'block', color: 'var(--teal)', fontSize: '10px', fontWeight: 600, marginTop: '2px' }}>
              {request.halfDayPeriod === 'second_half' ? 'Second Half (Afternoon Session)' : 'First Half (Morning Session)'}
            </span>
          )}
        </div>
        <div>
          <span>Duration</span>
          <strong>
            {Boolean(request.isHalfDay || request.days === 0.5 || request.units === 0.5)
              ? '0.5 Working Day (Half Day)'
              : `${request.days || request.units || 1} Working Day(s)`}
          </strong>
          {(request.isDoubleLop || request.doubleLopDays > 0) && (
            <span style={{ display: 'block', color: '#b91c1c', fontSize: '10px', fontWeight: 700, marginTop: '2px' }}>
              ⚠️ Double LOP Applied (25th+ Month-End)
            </span>
          )}
        </div>
        <div>
          <span>Employee</span>
          <strong>{request.employeeName || request.employeeId?.name || 'Employee'}</strong>
          <small style={{ color: 'var(--muted)', fontSize: '9px' }}>
            {(typeof request.employeeId === 'object' ? request.employeeId?.employeeId : request.employeeId) || request.employeeCode || 'N/A'} · {request.department || 'General'}{' '}
            {request.applicantRole && `(${request.applicantRole.replace('_', ' ')})`}
          </small>
        </div>
      </div>

      {/* Centralized Leave Policy Breakdown */}
      <div className="leave-detail-section" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
        <div className="detail-section-title" style={{ marginBottom: '8px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={15} color="#475569" />
          <strong>Leave Policy & Balance Breakdown</strong>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', marginBottom: '10px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Working Days</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{request.units || request.days || 1} day(s)</strong>
          </div>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '8px 10px' }}>
            <span style={{ fontSize: '10px', color: '#065f46', display: 'block' }}>CL Used</span>
            <strong style={{ fontSize: '14px', color: '#047857' }}>{request.casualLeaveUnits ?? (request.leaveType === 'casual' ? (request.paidUnits || request.units || 0) : 0)} day(s)</strong>
          </div>
          <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '8px 10px' }}>
            <span style={{ fontSize: '10px', color: '#115e59', display: 'block' }}>SL Used</span>
            <strong style={{ fontSize: '14px', color: '#0f766e' }}>{request.sickLeaveUnits ?? (request.leaveType === 'sick' ? (request.paidUnits || request.units || 0) : 0)} day(s)</strong>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 10px' }}>
            <span style={{ fontSize: '10px', color: '#92400e', display: 'block' }}>Normal LOP</span>
            <strong style={{ fontSize: '14px', color: '#b45309' }}>{request.normalLopUnits ?? (request.leaveType === 'lop' && !request.isDoubleLop ? (request.units || 0) : 0)} day(s)</strong>
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 10px' }}>
            <span style={{ fontSize: '10px', color: '#991b1b', display: 'block' }}>Double LOP (25th+)</span>
            <strong style={{ fontSize: '14px', color: '#b91c1c' }}>{request.doubleLopUnits ?? request.doubleLopDays ?? (request.isDoubleLop ? (request.units || 0) : 0)} day(s)</strong>
          </div>
        </div>

        {Array.isArray(request.dayBreakdown) && request.dayBreakdown.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Date-by-Date Evaluation:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {request.dayBreakdown.map((d, idx) => {
                const isDbl = d.isDoubleLop || d.leaveCategory === 'double_lop'
                const isNorm = d.leaveCategory === 'normal_lop'
                const bg = isDbl ? '#fee2e2' : isNorm ? '#fef3c7' : '#dcfce7'
                const col = isDbl ? '#b91c1c' : isNorm ? '#92400e' : '#15803d'
                const border = isDbl ? '#fca5a5' : isNorm ? '#fde047' : '#86efac'
                const label = isDbl ? 'Double LOP (2x)' : isNorm ? 'Normal LOP (1x)' : (d.leaveCategory ? d.leaveCategory.toUpperCase() : 'Paid')
                return (
                  <span key={idx} style={{ background: bg, color: col, border: `1px solid ${border}`, fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    {d.date}: {label}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="leave-reason">
        <span>Reason for Leave</span>
        <p>{request.reason || 'No specific notes entered by employee.'}</p>
      </div>

      <div className="leave-detail-section">
        <div className="detail-section-title">
          <Clock3 size={15} />
          <strong>Approval Timeline & Audit Trail</strong>
        </div>
        <div className="leave-timeline">
          <div className="timeline-item">
            <span className="timeline-dot" />
            <div>
              <strong>Request Submitted</strong>
              <small>
                {formatDate(request.createdAt)} • By {request.employeeName || 'Employee'}{' '}
                {request.applicantRole && (
                  <span style={{ textTransform: 'capitalize', color: 'var(--primary)', fontWeight: 600 }}>
                    ({request.applicantRole.replace('_', ' ')})
                  </span>
                )}
              </small>
            </div>
          </div>
          {request.tlComment && (
            <div className="timeline-item">
              <span className="timeline-dot" />
              <div>
                <strong>Team Lead Review</strong>
                <small>Reviewed by {request.tlName || 'Team Lead'}</small>
                <p>{request.tlComment}</p>
              </div>
            </div>
          )}
          {request.managerComment && (
            <div className="timeline-item">
              <span className="timeline-dot" />
              <div>
                <strong>Department Manager Review</strong>
                <small>Reviewed by {request.managerName || 'Manager'}</small>
                <p>{request.managerComment}</p>
              </div>
            </div>
          )}
          {request.directorComment && (
            <div className="timeline-item">
              <span className="timeline-dot" />
              <div>
                <strong>Managing Director Sign-off</strong>
                <small>Executive Approval by {request.directorName || 'Managing Director'}</small>
                <p>{request.directorComment}</p>
              </div>
            </div>
          )}
          {(request.hrNotified || request.hrComment) && (
            <div className="timeline-item">
              <span className="timeline-dot" />
              <div>
                <strong>HR Panel Verification</strong>
                <small>
                  {currentStatus === 'approved'
                    ? 'Synced to HR Panel for Payroll & Leave Balance Deductions'
                    : currentStatus === 'pending_admin'
                    ? 'Verified by HR Operations — Escalated to Admin for 25th Month LOP Approval'
                    : 'HR Operations Review'}
                </small>
                {request.hrComment && <p>{request.hrComment}</p>}
              </div>
            </div>
          )}
          {(request.adminComment || request.adminApprovedBy || request.adminDecisionAt) && (
            <div className="timeline-item">
              <span className="timeline-dot" />
              <div>
                <strong>Admin LOP Approval Sign-off</strong>
                <small>
                  Executive LOP Authorization by {request.adminApprovedBy || 'Administrator'}
                </small>
                {request.adminComment && <p>{request.adminComment}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {canDecide && (
        <div className="decision-box">
          <label>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Decision Remarks & Notes</span>
            <textarea
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
              placeholder={
                canAdminDecide
                  ? 'Add Administrator remarks for 25th Month LOP approval...'
                  : (mode === 'hr' || user?.role === 'hr')
                  ? 'Add HR remarks / resolution comments...'
                  : (isDirector && currentStatus === 'pending_director')
                  ? 'Add Managing Director remarks (Approved request will sync to HR Panel)...'
                  : canTlDecide
                  ? 'Add Team Lead remarks (Manager & Director will be notified; not Admin)...'
                  : canManagerDecide
                  ? 'Add Manager remarks (Director will be notified; not Admin)...'
                  : 'Add official resolution comments...'
              }
              rows={2}
            />
          </label>
          <div className="detail-actions">
            <Button disabled={busy} onClick={handleApprove}>
              <Check size={14} />
              {currentStatus === 'pending_admin'
                ? 'Approve LOP (Admin Sign-off)'
                : (currentStatus === 'pending_hr' && (request.isDoubleLop || request.doubleLopDays > 0 || (new Date(request.startDate).getDate() >= 25) || (new Date(request.endDate).getDate() >= 25)))
                ? 'Verify & Advance to Admin'
                : 'Approve Request'}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={handleReject}>
              <X size={14} /> Reject Request
            </Button>
            {onDeleteRequest && (
              <button
                type="button"
                className="emp-action-btn delete"
                style={{ marginLeft: 'auto', padding: '7px 12px' }}
                onClick={() => onDeleteRequest(request)}
              >
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action for HR if already decided: Delete option */}
      {mode === 'hr' && !canHrDecide && onDeleteRequest && (
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="emp-action-btn delete"
            style={{ padding: '7px 12px' }}
            onClick={() => onDeleteRequest(request)}
          >
            <Trash2 size={13} /> Delete Record
          </button>
        </div>
      )}

      {canCancel && (
        <div className="decision-box">
          <p style={{ fontSize: '11px', margin: 0, color: 'var(--muted)' }}>
            Your request is currently under review. You may cancel it if your plans have changed.
          </p>
          <Button variant="secondary" onClick={storeAction(async () => { await hrStore.cancelLeave(request.id); onRefresh() })}>
            Cancel Leave Request
          </Button>
        </div>
      )}

      {error && <p className="inline-error">{error}</p>}
    </div>
  )
}

function LeaveDateRangePicker({ startDate, endDate, days, onChange, required = false }) {
  const todayStr = todayKey()
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (startDate) {
      const d = new Date(startDate)
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1)
    }
    const t = new Date()
    return new Date(t.getFullYear(), t.getMonth(), 1)
  })
  const [hoverDate, setHoverDate] = useState('')
  const [showCalendar, setShowCalendar] = useState(true)

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Quick Range Presets
  const applyPreset = (presetKey) => {
    const today = new Date()
    let s = new Date(today)
    let e = new Date(today)

    if (presetKey === 'today') {
      // 1 day (today)
    } else if (presetKey === 'tomorrow') {
      s.setDate(s.getDate() + 1)
      e.setDate(e.getDate() + 1)
    } else if (presetKey === '2days') {
      e.setDate(e.getDate() + 1)
    } else if (presetKey === '3days') {
      e.setDate(e.getDate() + 2)
    } else if (presetKey === 'rest_of_week') {
      const dayOfWeek = today.getDay() // 0 = Sun, 5 = Fri, 6 = Sat
      const diffToFriday = 5 - dayOfWeek
      if (diffToFriday > 0) {
        e.setDate(today.getDate() + diffToFriday)
      } else {
        e.setDate(today.getDate() + 1)
      }
    } else if (presetKey === 'next_week') {
      const dayOfWeek = today.getDay()
      const daysUntilNextMon = (8 - dayOfWeek) % 7 || 7
      s.setDate(today.getDate() + daysUntilNextMon)
      e = new Date(s)
      e.setDate(s.getDate() + 4) // Mon to Fri (5 days)
    }

    const sStr = s.toISOString().split('T')[0]
    const eStr = e.toISOString().split('T')[0]
    const diff = Math.max(1, Math.round((new Date(eStr) - new Date(sStr)) / (1000 * 60 * 60 * 24)) + 1)

    onChange({ startDate: sStr, endDate: eStr, days: diff })
    setCurrentMonth(new Date(s.getFullYear(), s.getMonth(), 1))
  }

  // Handle Day Click in Range Calendar (Smart 1-click single day, 2nd-click range)
  const handleDayClick = (dayStr) => {
    if (!startDate || (startDate && endDate && startDate !== endDate)) {
      // Clean first click: sets valid 1-day selection immediately
      onChange({ startDate: dayStr, endDate: dayStr, days: 1 })
    } else if (startDate && (!endDate || startDate === endDate)) {
      // Second click: if clicking later date, expand range; otherwise change start date
      if (dayStr > startDate) {
        const diff = Math.max(1, Math.round((new Date(dayStr) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)
        onChange({ startDate, endDate: dayStr, days: diff })
      } else {
        onChange({ startDate: dayStr, endDate: dayStr, days: 1 })
      }
    } else {
      onChange({ startDate: dayStr, endDate: dayStr, days: 1 })
    }
  }

  // Calendar math
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const blanks = Array.from({ length: firstDayIndex })
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  })

  return (
    <div className="leave-range-picker-wrap">
      {/* Header with Title and Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarDays size={14} style={{ color: 'var(--teal)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
            Date Range & Working Days
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {showCalendar ? 'Hide Visual Calendar' : '📅 Open Range Calendar'}
        </button>
      </div>

      {/* Quick Range Presets Row */}
      <div className="leave-range-presets-row">
        <span style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600 }}>Quick Range:</span>
        <button
          type="button"
          className={`leave-range-preset-btn ${startDate === todayStr && endDate === todayStr ? 'active' : ''}`}
          onClick={() => applyPreset('today')}
        >
          Today (1d)
        </button>
        <button type="button" className="leave-range-preset-btn" onClick={() => applyPreset('tomorrow')}>
          Tomorrow (1d)
        </button>
        <button type="button" className="leave-range-preset-btn" onClick={() => applyPreset('2days')}>
          2 Days
        </button>
        <button type="button" className="leave-range-preset-btn" onClick={() => applyPreset('3days')}>
          3 Days
        </button>
        <button type="button" className="leave-range-preset-btn" onClick={() => applyPreset('rest_of_week')}>
          Rest of Week
        </button>
        <button type="button" className="leave-range-preset-btn" onClick={() => applyPreset('next_week')}>
          Next Week (Mon-Fri)
        </button>
      </div>

      {/* Interactive Visual Range Calendar */}
      {showCalendar && (
        <div className="range-calendar-card">
          <div className="range-calendar-header">
            <button type="button" className="icon-button" onClick={handlePrevMonth} style={{ padding: '3px 8px' }}>
              <ChevronLeft size={16} />
            </button>
            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{monthName}</strong>
            <button type="button" className="icon-button" onClick={handleNextMonth} style={{ padding: '3px 8px' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="range-calendar-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
              <div key={w} className="range-cal-weekday">
                {w}
              </div>
            ))}

            {blanks.map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {monthDays.map((dateStr) => {
              const dayNum = parseInt(dateStr.slice(8), 10)
              const isPast = dateStr < todayStr
              const isToday = dateStr === todayStr
              const isStart = dateStr === startDate
              const isEnd = dateStr === endDate
              const isSingle = isStart && (isEnd || !endDate)
              const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate
              const isHovered = startDate && (!endDate || startDate === endDate) && hoverDate && hoverDate > startDate && dateStr > startDate && dateStr <= hoverDate

              let dayClass = 'range-cal-day'
              if (isPast) dayClass += ' disabled'
              if (isToday) dayClass += ' today'
              if (isStart && isEnd) {
                dayClass += ' single-selected'
              } else if (isStart) {
                dayClass += ' selected-start'
              } else if (isEnd) {
                dayClass += ' selected-end'
              } else if (isInRange) {
                dayClass += ' in-range'
              } else if (isHovered) {
                dayClass += ' hover-range'
              }

              return (
                <div
                  key={dateStr}
                  className={dayClass}
                  onClick={() => !isPast && handleDayClick(dateStr)}
                  onMouseEnter={() => !isPast && setHoverDate(dateStr)}
                  onMouseLeave={() => setHoverDate('')}
                  title={dateStr}
                >
                  {dayNum}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <span>Click any date for 1-day leave, or click a 2nd date to select a range.</span>
            {startDate && endDate && (
              <span style={{ color: 'var(--teal)', fontWeight: 700 }}>
                ✓ {days} Day(s) Selected ({startDate}{startDate !== endDate ? ` to ${endDate}` : ''})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Synchronized From & To Date Inputs (Strictly enforces min={startDate} on To Date!) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
            From Date
          </label>
          <input
            type="date"
            value={startDate}
            min={todayStr}
            required={required}
            onChange={(e) => {
              const newStart = e.target.value
              let newEnd = endDate
              if (newEnd && newEnd < newStart) {
                newEnd = newStart
              }
              const diff = newEnd ? Math.max(1, Math.round((new Date(newEnd) - new Date(newStart)) / (1000 * 60 * 60 * 24)) + 1) : 1
              onChange({ startDate: newStart, endDate: newEnd, days: diff })
            }}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '12px', background: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
            To Date (Cannot be earlier than From Date)
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || todayStr}
            required={required}
            onChange={(e) => {
              const newEnd = e.target.value
              if (startDate && newEnd < startDate) return // Strictly prevent inverted date
              const diff = Math.max(1, Math.round((new Date(newEnd) - new Date(startDate || newEnd)) / (1000 * 60 * 60 * 24)) + 1)
              onChange({ startDate: startDate || newEnd, endDate: newEnd, days: diff })
            }}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '12px', background: '#fff' }}
          />
        </div>
      </div>

      {/* Selected Duration Pill */}
      {startDate && endDate && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: '#e6fffa', border: '1px solid #b2f5ea', color: '#006E6F', fontSize: '11.5px', fontWeight: 700 }}>
          <span>
            ✨ {days} Day(s) Range: {startDate} to {endDate}
          </span>
          <button
            type="button"
            onClick={() => onChange({ startDate: '', endDate: '', days: 1 })}
            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            Clear Range
          </button>
        </div>
      )}
    </div>
  )
}

function ApplyLeaveSelf({ onSubmitted }) {
  const { user } = useAuth()
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [halfDayPeriod, setHalfDayPeriod] = useState('first_half')
  const [form, setForm] = useState({
    leaveType: 'casual',
    startDate: todayKey(),
    endDate: todayKey(),
    days: 1,
    reason: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [overlapInfo, setOverlapInfo] = useState(null)
  const [success, setSuccess] = useState(false)

  // Retrieve user balances
  const storeLeaves = hrStore.getState().leaves || []
  const balances = hrStore.getState().leaveBalances || []
  const userEmpId = user?.employeeId
  const userId = user?.id || user?._id
  const userEmpCode = String(userEmpId || '').trim()
  const userIdentifier = String(userId || '').trim()
  const userBalances = balances.filter((b) => {
    if (!b) return false
    const bEmpObj = typeof b.employeeId === 'object' && b.employeeId !== null ? b.employeeId : null
    const bEmpCode = String(bEmpObj?.employeeId || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
    const bEmpId = String(bEmpObj?._id || bEmpObj?.id || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
    return (userEmpCode && (bEmpCode === userEmpCode || bEmpId === userEmpCode)) || (userIdentifier && (bEmpId === userIdentifier || bEmpCode === userIdentifier))
  })

  // Find user's active pending requests
  const myPendingLeaves = storeLeaves.filter((l) => {
    const isOwner = (userEmpId && (l.employeeId === userEmpId || l.employeeRef === userEmpId)) ||
      (userId && (l.employeeRef === userId || l.employeeId === userId))
    return isOwner && ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin'].includes(l.status)
  })

  const getAvailDays = (type) => {
    const match = userBalances.find((b) => (b.leaveType || '').toLowerCase() === type.toLowerCase())
    if (!match) return null
    return (match.allowance || 0) - (match.used || 0) - (match.reserved || 0)
  }

  function handleRangeChange({ startDate, endDate, days }) {
    setForm((current) => ({
      ...current,
      startDate,
      endDate,
      days: days || 1,
    }))
    if (overlapInfo) setOverlapInfo(null)
  }

  function update(field, value) {
    setForm((current) => {
      const updated = { ...current, [field]: value }
      if (updated.startDate && updated.endDate) {
        if (updated.endDate < updated.startDate) {
          updated.endDate = updated.startDate
        }
        const start = new Date(updated.startDate)
        const end = new Date(updated.endDate)
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1)
        if (!isNaN(diffDays)) {
          updated.days = diffDays
        }
      }
      return updated
    })
  }

  async function submit(event) {
    event?.preventDefault?.()
    if (!form.startDate || !form.endDate) {
      setError('Please select both a Start Date and an End Date.')
      return
    }
    if (form.endDate < form.startDate) {
      setError('To Date cannot be earlier than From Date.')
      return
    }

    setBusy(true)
    setError('')
    setOverlapInfo(null)
    try {
      await hrStore.applyLeave(
        {
          ...form,
          startDate: form.startDate,
          endDate: isHalfDay ? form.startDate : form.endDate,
          days: isHalfDay ? 0.5 : form.days,
          isHalfDay,
          halfDayPeriod: isHalfDay ? halfDayPeriod : null,
          employeeId: user?.employeeId || user?.id,
          employeeName: user?.displayName || user?.name,
          department: user?.department,
          applicantRole: user?.role,
        },
        user
      )
      setSuccess(true)
      setOverlapInfo(null)
      setTimeout(() => setSuccess(false), 4500)
      setForm({ leaveType: 'casual', startDate: '', endDate: '', days: 1, reason: '' })
      setIsHalfDay(false)
      setHalfDayPeriod('first_half')
      onSubmitted()
    } catch (requestError) {
      setError(requestError.message)
      if (requestError.code === 'LEAVE_OVERLAP' || requestError.fields?.canCancelExisting) {
        setOverlapInfo(requestError.fields || { canCancelExisting: true })
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleReplaceAndSubmit() {
    setBusy(true)
    setError('')
    try {
      await hrStore.applyLeave(
        {
          ...form,
          startDate: form.startDate,
          endDate: isHalfDay ? form.startDate : form.endDate,
          days: isHalfDay ? 0.5 : form.days,
          isHalfDay,
          halfDayPeriod: isHalfDay ? halfDayPeriod : null,
          replaceOverlap: true,
          employeeId: user?.employeeId || user?.id,
          employeeName: user?.displayName || user?.name,
          department: user?.department,
          applicantRole: user?.role,
        },
        user
      )
      setSuccess(true)
      setOverlapInfo(null)
      setTimeout(() => setSuccess(false), 4500)
      setForm({ leaveType: 'casual', startDate: '', endDate: '', days: 1, reason: '' })
      setIsHalfDay(false)
      setHalfDayPeriod('first_half')
      onSubmitted()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleCancelExisting(reqId) {
    const targetId = reqId || overlapInfo?.overlappingRequestId
    if (!targetId) return
    setBusy(true)
    setError('')
    try {
      await hrStore.cancelLeave(targetId)
      setOverlapInfo(null)
      setError('')
      onSubmitted()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const cl = getAvailDays('casual')
  const sl = getAvailDays('sick')
  const el = getAvailDays('earned')
  const co = getAvailDays('comp_off')
  const ml = getAvailDays('maternity')
  const lop = getAvailDays('lop')

  return (
    <div className="panel apply-leave-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Self Service</p>
          <h2>Apply for Leave</h2>
        </div>
        <Plus size={18} className="muted-icon" />
      </div>

      {/* Active pending leaves notification */}
      {myPendingLeaves.length > 0 && (
        <div style={{ background: 'var(--soft-blue, #eff6ff)', border: '1px solid var(--blue-border, #bfdbfe)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock3 size={15} color="var(--blue, #2563eb)" />
              <strong style={{ color: 'var(--blue, #1d4ed8)' }}>Your Active Pending Leave:</strong>
              <span>
                {myPendingLeaves.map((l) => `${leaveTypeLabels[l.leaveType] || l.leaveType} (${formatDate(l.startDate)} to ${formatDate(l.endDate)})`).join('; ')}
              </span>
            </div>
            {myPendingLeaves.map((l, idx) => (
              <button
                key={l?.id || l?._id || idx}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px', height: 'auto', lineHeight: '1.2' }}
                onClick={() => handleCancelExisting(l?.id || l?._id)}
                disabled={busy}
              >
                Withdraw / Cancel
              </button>
            ))}
          </div>
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--soft-teal)', color: 'var(--teal)', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' }}>
          <CheckCircle2 size={16} />
          <span>
            {user?.role === 'manager'
              ? 'Leave request submitted! Routed to Managing Director for executive approval (approved request automatically syncs to HR Panel).'
              : user?.role === 'team_lead'
              ? 'Leave request submitted! Routed to Department Manager for approval (Director will be notified; not to Admin).'
              : 'Leave request submitted! Routed to Manager for approval (Team Lead, Squad, and Director will be notified; not to Admin).'}
          </span>
        </div>
      )}

      <form className="leave-form" onSubmit={submit}>
        <label>
          Leave Type
          <select value={form.leaveType} onChange={(event) => update('leaveType', event.target.value)} required>
            <option value="casual">Casual Leave ({cl !== null ? `${cl} available` : '1 available'})</option>
            <option value="sick">Sick / Medical Leave ({sl !== null ? `${sl} available` : '1 available'})</option>
            <option value="earned">Earned / Privilege Leave ({el !== null ? `${el} available` : '0 available'})</option>
            <option value="comp_off">Compensatory Off ({co !== null ? `${co} available` : '0 available'})</option>
            <option value="maternity">Maternity / Paternity Leave ({ml !== null ? `${ml} available` : 'Available'})</option>
            <option value="lop">Loss of Pay (LOP) / Unpaid ({lop !== null ? `${lop} days` : 'Allowed'})</option>
          </select>
        </label>

        {/* LEAVE DURATION OPTION: FULL DAY VS HALF DAY */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>
            Leave Duration Option
          </label>
          <div className="leave-mode-toggle">
            <button
              type="button"
              className={`leave-mode-btn ${!isHalfDay ? 'active' : ''}`}
              onClick={() => {
                setIsHalfDay(false)
                setForm((prev) => ({
                  ...prev,
                  days: prev.startDate && prev.endDate && prev.startDate !== prev.endDate
                    ? Math.max(1, Math.round((new Date(prev.endDate) - new Date(prev.startDate)) / (1000 * 60 * 60 * 24)) + 1)
                    : 1
                }))
              }}
            >
              Full Day Leave
            </button>
            <button
              type="button"
              className={`leave-mode-btn ${isHalfDay ? 'active' : ''}`}
              onClick={() => {
                setIsHalfDay(true)
                const d = form.startDate || todayKey()
                setForm((prev) => ({ ...prev, startDate: d, endDate: d, days: 0.5 }))
              }}
            >
              Half Day Leave (0.5 Day)
            </button>
          </div>
        </div>

        {/* IF HALF DAY: SHOW TIMING / SESSION SELECTOR & SINGLE DATE */}
        {isHalfDay ? (
          <div style={{ display: 'grid', gap: '14px', background: '#f8faf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                Select Half Day Session
              </span>
              <div className="half-day-options">
                <div
                  className={`half-day-card ${halfDayPeriod === 'first_half' ? 'selected' : ''}`}
                  onClick={() => setHalfDayPeriod('first_half')}
                >
                  <Sun size={16} color={halfDayPeriod === 'first_half' ? 'var(--teal)' : 'var(--muted)'} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px' }}>First Half (Morning Session)</strong>
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>09:30 AM – 01:30 PM</small>
                  </div>
                </div>
                <div
                  className={`half-day-card ${halfDayPeriod === 'second_half' ? 'selected' : ''}`}
                  onClick={() => setHalfDayPeriod('second_half')}
                >
                  <Moon size={16} color={halfDayPeriod === 'second_half' ? 'var(--teal)' : 'var(--muted)'} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px' }}>Second Half (Afternoon Session)</strong>
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>02:00 PM – 06:30 PM</small>
                  </div>
                </div>
              </div>
            </div>

            <label>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Date of Half Day Leave</span>
              <input
                type="date"
                value={form.startDate || todayKey()}
                min={todayKey()}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value, endDate: e.target.value, days: 0.5 }))}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '12px' }}
              />
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--teal)', fontWeight: 500 }}>
              <Clock3 size={15} />
              <span>
                Applying for <strong>0.5 Day (Half Day)</strong> on <strong>{formatDate(form.startDate || todayKey())}</strong> ({halfDayPeriod === 'second_half' ? 'Second Half / Afternoon' : 'First Half / Morning'}). Only 0.5 quota will be deducted.
              </span>
            </div>
          </div>
        ) : (
          /* INTERACTIVE DATE RANGE PICKER & CALENDAR */
          <LeaveDateRangePicker
            startDate={form.startDate}
            endDate={form.endDate}
            days={form.days}
            onChange={handleRangeChange}
            required={true}
          />
        )}

        {(() => {
          if (!form.startDate) return false
          const s = new Date(form.startDate)
          const e = form.endDate ? new Date(form.endDate) : s
          for (const cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) {
            if (cur.getDate() >= 25) return true
          }
          return false
        })() && (
          <div style={{
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderRadius: '8px',
            padding: '10px 14px',
            margin: '8px 0 12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '11.5px',
            color: '#9a3412',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ea580c' }} />
            <div>
              <strong>Month-End Policy (From 25th):</strong> Any leave on or after the 25th of the month is considered <strong>Double LOP</strong> (2 days salary deduction per day in payroll).
            </div>
          </div>
        )}

        <label>
          Reason for Absence
          <textarea
            value={form.reason}
            onChange={(event) => update('reason', event.target.value)}
            placeholder="Explain the purpose of your time off..."
            required
          />
        </label>

        {error && !overlapInfo && <p className="inline-error">{error}</p>}

        {/* Interactive Overlap Resolution Banner */}
        {overlapInfo && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 14px',
            margin: '8px 0 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 600, fontSize: '12px' }}>
              <AlertCircle size={16} />
              <span>
                {overlapInfo.overlappingStatus === 'approved' ? 'Existing Approved Leave' : 'Existing Active Leave Request'}: {overlapInfo.overlappingStartDate || 'selected dates'} to {overlapInfo.overlappingEndDate || 'selected dates'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#78350f' }}>
              {overlapInfo.canCancelExisting
                ? `You already have ${overlapInfo.overlappingStatus === 'approved' ? 'an approved leave' : 'a pending leave request'}${overlapInfo.overlappingReason ? ` ("${overlapInfo.overlappingReason}")` : ''} covering these dates. Click "Replace Previous & Submit New Range" to replace it with this new ${form.days}-day request, or cancel the previous request.`
                : 'This date range conflicts with an active leave request.'}
            </p>
            {overlapInfo.canCancelExisting && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                <Button
                  type="button"
                  onClick={handleReplaceAndSubmit}
                  disabled={busy}
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} /> Replace Previous &amp; Submit New Range
                </Button>
                {overlapInfo.overlappingRequestId && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleCancelExisting(overlapInfo.overlappingRequestId)}
                    disabled={busy}
                    style={{ fontSize: '11px', padding: '6px 14px' }}
                  >
                    <X size={13} /> Cancel Previous Request Only
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <Button disabled={busy || !form.leaveType}>
          <Send size={15} /> Submit Leave Request
        </Button>
      </form>
    </div>
  )
}

function GrantLeaveHR({ employees, onGranted, preselectedEmpId }) {
  const [form, setForm] = useState({
    employeeId: preselectedEmpId || '',
    leaveType: 'casual',
    startDate: todayKey(),
    endDate: todayKey(),
    days: 1,
    status: 'approved',
    reason: '',
    hrComment: 'Granted directly by HR Operations with manager alignment.',
  })
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [overlapConflict, setOverlapConflict] = useState(false)

  const allBalances = hrStore.getState().leaveBalances || []
  const selectedEmp = employees.find((x) => x && (x.employeeId === form.employeeId || x.id === form.employeeId || x._id === form.employeeId))

  const empBalances = useMemo(() => {
    if (!selectedEmp) return null
    const empId = String(selectedEmp.employeeId || selectedEmp.id || selectedEmp._id || '').trim()
    const rawBal = allBalances.filter((b) => {
      if (!b) return false
      const bEmpObj = typeof b.employeeId === 'object' && b.employeeId !== null ? b.employeeId : null
      const bEmpCode = String(bEmpObj?.employeeId || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
      const bEmpId = String(bEmpObj?._id || bEmpObj?.id || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
      return (empId && (bEmpCode === empId || bEmpId === empId))
    })
    const casual = rawBal.find((b) => b.leaveType === 'casual')
    const sick = rawBal.find((b) => b.leaveType === 'sick')
    const earned = rawBal.find((b) => b.leaveType === 'earned' || b.leaveType === 'paid')
    return {
      casual: Math.max(0, (casual?.allowance ?? 1) - (casual?.used ?? 0) - (casual?.reserved ?? 0)),
      sick: Math.max(0, (sick?.allowance ?? 1) - (sick?.used ?? 0) - (sick?.reserved ?? 0)),
      earned: Math.max(0, (earned?.allowance ?? 0) - (earned?.used ?? 0) - (earned?.reserved ?? 0)),
    }
  }, [selectedEmp, allBalances])

  useEffect(() => {
    if (preselectedEmpId) {
      setForm((f) => ({ ...f, employeeId: preselectedEmpId }))
    }
  }, [preselectedEmpId])

  function update(field, value) {
    setError('')
    setOverlapConflict(false)
    setForm((current) => {
      const updated = { ...current, [field]: value }
      if (field === 'startDate') {
        if (updated.endDate && updated.endDate < value) {
          updated.endDate = value
        }
      } else if (field === 'endDate') {
        if (updated.startDate && value < updated.startDate) {
          updated.endDate = updated.startDate
        }
      }
      if (updated.startDate && updated.endDate) {
        const start = new Date(updated.startDate)
        const end = new Date(updated.endDate)
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1)
        if (!isNaN(diffDays)) {
          updated.days = diffDays
        }
      }
      return updated
    })
  }

  const handleSubmit = storeAction(async (e, forceOverride = false) => {
    if (e && e.preventDefault) e.preventDefault()
    const emp = employees.find((x) => x && (x.employeeId === form.employeeId || x.id === form.employeeId || x._id === form.employeeId))
    if (!emp) return

    setBusy(true)
    setError('')
    setOverlapConflict(false)
    try {
      await hrStore.applyLeave({
        ...form,
        isHalfDay: Boolean(form.isHalfDay),
        halfDayPeriod: form.isHalfDay ? (form.halfDayPeriod || 'first_half') : null,
        days: form.isHalfDay ? 0.5 : form.days,
        endDate: form.isHalfDay ? form.startDate : form.endDate,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        replaceOverlap: forceOverride || Boolean(overlapConflict),
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3500)
      setForm({
        employeeId: '',
        leaveType: 'casual',
        isHalfDay: false,
        halfDayPeriod: 'first_half',
        startDate: todayKey(),
        endDate: todayKey(),
        days: 1,
        status: 'approved',
        reason: '',
        hrComment: 'Granted directly by HR Operations with manager alignment.',
      })
      onGranted()
    } catch (err) {
      console.error('HR Grant Leave failed:', err)
      const msg = err.message || 'The leave request could not be granted.'
      setError(msg)
      if (
        msg.toLowerCase().includes('overlap') ||
        msg.toLowerCase().includes('conflict') ||
        msg.toLowerCase().includes('already has') ||
        msg.toLowerCase().includes('existing')
      ) {
        setOverlapConflict(true)
      }
    } finally {
      setBusy(false)
    }
  })

  return (
    <div className="panel" style={{ maxWidth: '880px', margin: '0 auto 24px', borderRadius: '14px', border: '1px solid var(--line)', boxShadow: '0 4px 20px rgba(35, 38, 35, 0.04)' }}>
      <div className="panel-heading" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
        <div>
          <p className="section-kicker" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="var(--teal)" /> HR Administrative Authority
          </p>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0 0' }}>Grant / Record Leave on Behalf of Employee</h2>
        </div>
      </div>

      <p className="foundation-copy" style={{ margin: '14px 0 18px', fontSize: '11.5px', color: '#64748b' }}>
        HR Operations and Admin leadership can authorize and log approved leaves directly. Instant grants automatically synchronize with daily attendance logs and payroll deductions.
      </p>

      {success && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', animation: 'fadeUp 0.3s ease' }}>
          <CheckCircle2 size={16} color="#059669" />
          <span><strong>Success!</strong> Leave record granted successfully and synchronized with attendance records.</span>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '13px 16px',
          color: '#991b1b',
          fontSize: '11.5px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '18px',
          animation: 'fadeUp 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>Unable to Record Leave: {error}</span>
          </div>
          {overlapConflict && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #fee2e2' }}>
              <span style={{ fontSize: '11px', color: '#b91c1c', flex: 1, minWidth: '220px' }}>
                A pending or existing leave overlaps with this date range. You can perform an administrative force override to supersede conflicting records.
              </span>
              <Button
                type="button"
                variant="danger"
                disabled={busy}
                onClick={() => handleSubmit(null, true)}
                style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700 }}
              >
                Force Override &amp; Grant
              </Button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} style={{ display: 'grid', gap: '16px' }}>
        <Field label="Select Employee" required>
          <select
            value={form.employeeId}
            onChange={(e) => update('employeeId', e.target.value)}
            required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '12px', color: 'var(--ink)' }}
          >
            <option value="">-- Choose employee to grant leave --</option>
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.name} ({emp.employeeId} · {emp.department || 'Operations'})
              </option>
            ))}
          </select>
        </Field>

        {empBalances && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '10px 14px',
            background: 'rgba(0, 110, 111, 0.04)',
            borderRadius: '9px',
            border: '1px solid rgba(0, 110, 111, 0.12)',
            fontSize: '11px'
          }}>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Employee Available Balances:</span>
            <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 700 }}>
              CL: {empBalances.casual}d
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', fontWeight: 700 }}>
              SL: {empBalances.sick}d
            </span>
            {empBalances.earned > 0 && (
              <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700 }}>
                EL: {empBalances.earned}d
              </span>
            )}
            {empBalances.casual === 0 && empBalances.sick === 0 && (
              <span style={{ color: '#b45309', fontWeight: 600, marginLeft: 'auto' }}>
                ⚠️ Paid balance exhausted (will be recorded as LOP)
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <Field label="Leave Classification" required>
            <select
              value={form.leaveType}
              onChange={(e) => update('leaveType', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '11.5px' }}
            >
              <option value="casual">Casual Leave (CL)</option>
              <option value="sick">Sick / Medical Leave (SL)</option>
              <option value="earned">Earned / Privilege Leave (EL)</option>
              <option value="comp_off">Compensatory Off</option>
              <option value="maternity">Maternity / Paternity Leave</option>
              <option value="lop">Loss of Pay (LOP) / Unpaid</option>
            </select>
          </Field>

          <Field label="Grant Status" required>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '11.5px' }}
            >
              <option value="approved">Direct HR Approval (Instant Grant)</option>
              <option value="pending_hr">Submit as Pending HR Review</option>
            </select>
          </Field>
        </div>

        {/* LEAVE DURATION OPTION: FULL DAY VS HALF DAY */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>
            Leave Duration Option
          </label>
          <div className="leave-mode-toggle">
            <button
              type="button"
              className={`leave-mode-btn ${!form.isHalfDay ? 'active' : ''}`}
              onClick={() => {
                update('isHalfDay', false)
                const s = form.startDate
                const e = form.endDate && form.endDate >= s ? form.endDate : s
                const diff = s && e ? Math.max(1, Math.round((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24)) + 1) : 1
                update('days', diff)
              }}
            >
              Full Day Leave
            </button>
            <button
              type="button"
              className={`leave-mode-btn ${form.isHalfDay ? 'active' : ''}`}
              onClick={() => {
                update('isHalfDay', true)
                update('endDate', form.startDate || todayKey())
                update('days', 0.5)
              }}
            >
              Half Day Leave (0.5 Day)
            </button>
          </div>
        </div>

        {form.isHalfDay ? (
          <div style={{ display: 'grid', gap: '14px', background: '#f8faf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                Select Half Day Session
              </span>
              <div className="half-day-options">
                <div
                  className={`half-day-card ${form.halfDayPeriod !== 'second_half' ? 'selected' : ''}`}
                  onClick={() => update('halfDayPeriod', 'first_half')}
                >
                  <Sun size={16} color={form.halfDayPeriod !== 'second_half' ? 'var(--teal)' : 'var(--muted)'} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px' }}>First Half (Morning Session)</strong>
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>09:30 AM – 01:30 PM</small>
                  </div>
                </div>
                <div
                  className={`half-day-card ${form.halfDayPeriod === 'second_half' ? 'selected' : ''}`}
                  onClick={() => update('halfDayPeriod', 'second_half')}
                >
                  <Moon size={16} color={form.halfDayPeriod === 'second_half' ? 'var(--teal)' : 'var(--muted)'} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px' }}>Second Half (Afternoon Session)</strong>
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>02:00 PM – 06:30 PM</small>
                  </div>
                </div>
              </div>
            </div>

            <Field label="Date of Half Day Leave" required>
              <input
                type="date"
                value={form.startDate || todayKey()}
                onChange={(e) => {
                  update('startDate', e.target.value)
                  update('endDate', e.target.value)
                  update('days', 0.5)
                }}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '12px' }}
              />
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--teal)', fontWeight: 500 }}>
              <Clock3 size={15} />
              <span>
                Recording <strong>0.5 Day (Half Day)</strong> on <strong>{formatDate(form.startDate || todayKey())}</strong> ({form.halfDayPeriod === 'second_half' ? 'Second Half / Afternoon' : 'First Half / Morning'}).
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <Field label="Start Date" required>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '11.5px' }}
              />
            </Field>

            <Field label="End Date" required>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || todayKey()}
                onChange={(e) => update('endDate', e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '11.5px' }}
              />
            </Field>

            <Field label="Duration (Days)">
              <input
                type="number"
                min="1"
                step="1"
                value={form.days}
                onChange={(e) => update('days', Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '11.5px' }}
              />
            </Field>
          </div>
        )}

        {(() => {
          if (!form.startDate) return false
          const s = new Date(form.startDate)
          const e = form.endDate ? new Date(form.endDate) : s
          for (const cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) {
            if (cur.getDate() >= 25) return true
          }
          return false
        })() && (
          <div style={{
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderRadius: '9px',
            padding: '11px 15px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '11.5px',
            color: '#9a3412',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ea580c' }} />
            <div>
              <strong>Month-End Policy Alert (From 25th):</strong> This date range includes days on or after the 25th of the month. Under company policy, these are treated as <strong>Double LOP</strong> (2 days loss of pay deduction per day in payroll).
            </div>
          </div>
        )}

        <Field label="Reason / Administrative Justification" required>
          <textarea
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
            placeholder="e.g. Urgent family emergency, scheduled health check-up, pre-approved earned leave..."
            rows={2}
            required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '11.5px' }}
          />
        </Field>

        <Field label="HR Operations Remarks">
          <input
            type="text"
            value={form.hrComment}
            onChange={(e) => update('hrComment', e.target.value)}
            placeholder="Official resolution note..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '9px', background: '#fff', fontSize: '11.5px' }}
          />
        </Field>

        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
          <Button type="submit" disabled={busy || !form.employeeId} style={{ padding: '10px 22px', fontSize: '12px', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Grant &amp; Record Leave
          </Button>
        </div>
      </form>
    </div>
  )
}

export function LeaveManagementPage({ mode = 'self', route, query: propQuery }) {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const isManagement = mode === 'hr' || mode === 'admin'
  const isSelf = mode === 'self'

  const getHashInfo = () => {
    const hash = (typeof window !== 'undefined' ? window.location.hash : '') || ''
    const { query = {} } = parseLocationHash(hash)
    const effectiveQuery = { ...(propQuery || {}), ...query }
    let tab = effectiveQuery.tab || ''
    if (!tab) {
      if (hash.includes('tab=policy')) tab = 'policy'
      else if (hash.includes('tab=approvals')) tab = 'approvals'
      else if (hash.includes('tab=grant')) tab = 'grant'
      else if (hash.includes('tab=quotas')) tab = 'quotas'
      else if (hash.includes('tab=lop')) tab = 'lop'
      else tab = 'approvals'
    }
    const filterVal = effectiveQuery.filter || (hash.includes('filter=pending_admin') || tab === 'lop' ? 'pending_admin' : '')
    const idVal = effectiveQuery.id || effectiveQuery.leaveId || ''
    return { tab: tab === 'lop' ? 'approvals' : tab, filter: filterVal, id: idVal, isLopTab: tab === 'lop' }
  }

  const initialInfo = getHashInfo()
  const [activeTab, setActiveTab] = useState(initialInfo.tab || 'approvals')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState(initialInfo.filter || '')
  const [targetEntityId, setTargetEntityId] = useState(initialInfo.id || '')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('split') // 'split' | 'table'
  const [refreshKey, setRefreshKey] = useState(0)

  const [feedbackNotice, setFeedbackNotice] = useState('')
  const [leaveToDelete, setLeaveToDelete] = useState(null)
  const [rejectingLeave, setRejectingLeave] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [preselectedEmpId, setPreselectedEmpId] = useState('')

  useEffect(() => {
    if (!storeState.employees?.length) {
      hrStore.refresh().catch(() => {})
    }
    return hrStore.subscribe((state) => {
      setStoreState(state)
    })
  }, [])

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash || ''
      const { query = {} } = parseLocationHash(hash)
      const effectiveQuery = { ...(propQuery || {}), ...query }
      if (effectiveQuery.tab) {
        setActiveTab(effectiveQuery.tab === 'lop' ? 'approvals' : effectiveQuery.tab)
      }
      if (effectiveQuery.filter !== undefined) {
        setFilter(effectiveQuery.filter)
      } else if (effectiveQuery.tab === 'lop' || hash.includes('filter=pending_admin')) {
        setFilter('pending_admin')
      }
      if (effectiveQuery.id || effectiveQuery.leaveId) {
        const tid = effectiveQuery.id || effectiveQuery.leaveId
        setTargetEntityId(tid)
        const matched = (storeState.leaves || []).find((l) => (l.id || l._id) === tid)
        if (matched) setSelected(matched)
      }
    }
    window.addEventListener('hashchange', syncFromHash)
    syncFromHash()
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [propQuery, storeState.leaves])

  function showFeedback(msg) {
    setFeedbackNotice(msg)
    setTimeout(() => setFeedbackNotice(''), 4000)
  }

  const allLeaves = storeState.leaves || []
  const allEmployees = storeState.employees || []

  // Filter requests based on mode
  let filteredRequests = allLeaves
  if (mode === 'self') {
    const userEmpId = user?.employeeId
    const userId = user?.id || user?._id
    const userRef = user?.employeeRef
    filteredRequests = filteredRequests.filter((l) => {
      if (userEmpId && (l.employeeId === userEmpId || l.employeeRef === userEmpId)) return true
      if (userId && (l.employeeRef === userId || l.employeeId === userId)) return true
      if (userRef && (l.employeeRef === userRef || l.employeeId === userRef)) return true
      return false
    })
  } else if (mode === 'team') {
    const userEmpId = String(user?.employeeId || '')
    const userId = String(user?.id || user?._id || '')
    const userRole = user?.role
    const candidateIds = [userId, userEmpId].filter(Boolean)

    // Direct reportees in workforce registry
    const directReportIds = new Set(
      allEmployees
        .filter((e) => {
          const mgrId = String(e.managerId?._id || e.managerId?.id || e.managerId || '')
          return candidateIds.includes(mgrId)
        })
        .map((e) => String(e.id || e._id || e.employeeId || ''))
        .filter(Boolean)
    )

    filteredRequests = filteredRequests.filter((l) => {
      const lMgrId = String(l.managerId?._id || l.managerId?.id || l.managerId || '')
      const lEmpId = String(l.employeeId?._id || l.employeeId?.id || l.employeeId || l.employeeRef || '')
      const isDirectReport = candidateIds.includes(lMgrId) || directReportIds.has(lEmpId)

      // Managing Director / Executive: views all leadership, manager, and team requests
      if (['director', 'managing_director', 'co_founder', 'vertical_head'].includes(userRole) || user?.email === 'jagadishbabu@edufyitech.in') {
        return (
          isDirectReport ||
          l.status === 'pending_director' ||
          l.status === 'pending_manager' ||
          l.applicantRole === 'manager'
        )
      }

      // Department Manager / Assigned Manager
      if (['manager', 'revenue_growth_manager', 'senior_manager'].includes(userRole) || isDirectReport) {
        return (
          isDirectReport ||
          l.status === 'pending_manager' ||
          (user?.department && l.department === user.department)
        )
      }

      // Team Lead
      if (userRole === 'team_lead' || userRole === 'team_leader') {
        return (
          isDirectReport ||
          (userEmpId && (l.tlId === userEmpId || l.managerId === userEmpId)) ||
          (userId && (l.tlId === userId || l.managerId === userId)) ||
          (user?.department && l.department === user.department)
        )
      }

      // Fallback
      return isDirectReport || candidateIds.includes(lMgrId)
    })
  }

  // Filter by status, type, and search
  filteredRequests = filteredRequests.filter((r) => {
    if (filter && r.status !== filter) return false
    if (typeFilter !== 'all' && r.leaveType !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = (r.employeeName || '').toLowerCase()
      const id = (r.employeeId || '').toLowerCase()
      const reason = (r.reason || '').toLowerCase()
      if (!name.includes(q) && !id.includes(q) && !reason.includes(q)) return false
    }
    return true
  })

  // Synchronize selection with targetEntityId support
  useEffect(() => {
    if (targetEntityId) {
      const targetMatch = filteredRequests.find((r) => (r.id || r._id) === targetEntityId)
      if (targetMatch) {
        setSelected(targetMatch)
        return
      }
    }
    const latest = filteredRequests.find((request) => request?.id === selected?.id) ?? filteredRequests[0] ?? null
    if (latest !== selected) setSelected(latest)
  }, [filteredRequests, targetEntityId])

  // KPIs
  const totalRequests = allLeaves.length
  const pendingAdminCount = allLeaves.filter((l) => l.status === 'pending_admin').length
  const pendingCount = allLeaves.filter(
    (l) =>
      l.status === 'pending_manager' ||
      l.status === 'pending_director' ||
      l.status === 'pending_hr' ||
      l.status === 'pending_admin'
  ).length
  const approvedCount = allLeaves.filter((l) => l.status === 'approved').length

  const today = todayKey()
  const onLeaveToday = allLeaves.filter(
    (l) => l.status === 'approved' && l.startDate <= today && l.endDate >= today
  )

  const handleQuickApprove = storeAction(async (request) => {
    let role = 'hr'
    if (user?.role === 'admin' || request.status === 'pending_admin') role = 'admin'
    else if (['director', 'managing_director', 'co_founder'].includes(user?.role) || request.status === 'pending_director') role = 'director'
    else if (['manager', 'revenue_growth_manager'].includes(user?.role) || request.status === 'pending_manager') role = 'manager'
    await hrStore.approveLeave(request.id, role, 'Approved after review', user)
    showFeedback(`Approved ${leaveTypeLabels[request.leaveType] || request.leaveType} for ${request.employeeName}.`)
  })

  function handleQuickRejectPrompt(request) {
    setRejectingLeave(request)
    setRejectReason('')
  }

  const handleConfirmReject = storeAction(async () => {
    if (!rejectingLeave) return
    const reason = rejectReason.trim() || 'Declined due to operational coverage requirements.'
    let role = 'hr'
    if (user?.role === 'admin' || rejectingLeave.status === 'pending_admin') role = 'admin'
    else if (['director', 'managing_director', 'co_founder'].includes(user?.role) || rejectingLeave.status === 'pending_director') role = 'director'
    else if (['manager', 'revenue_growth_manager'].includes(user?.role) || rejectingLeave.status === 'pending_manager') role = 'manager'
    await hrStore.rejectLeave(rejectingLeave?.id, role, reason, user)
    setRejectingLeave(null)
    setRejectReason('')
    showFeedback(`Declined leave request for ${rejectingLeave?.employeeName || 'employee'}.`)
  })

  const handleDeleteLeave = storeAction(async () => {
    if (!leaveToDelete?.id) return
    await hrStore.deleteLeave(leaveToDelete.id)
    setLeaveToDelete(null)
    showFeedback('Leave record removed from system.')
  })

  function handleGrantForEmployee(empId) {
    setPreselectedEmpId(empId)
    setActiveTab('grant')
  }

  function handleExportCSV() {
    const headers = [
      'Leave ID',
      'Employee ID',
      'Employee Name',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Days',
      'Status',
      'Reason',
      'Manager Comment',
      'HR Comment',
      'Created Date',
    ]
    const rows = filteredRequests.map((l) => [
      l?.id || l?._id || '',
      l?.employeeId || '',
      l?.employeeName || '',
      l?.department || 'General',
      l?.leaveType || '',
      l?.startDate || '',
      l?.endDate || '',
      l?.days || 1,
      l?.status || '',
      `"${(l?.reason || '').replace(/"/g, '""')}"`,
      `"${(l?.managerComment || '').replace(/"/g, '""')}"`,
      `"${(l?.hrComment || '').replace(/"/g, '""')}"`,
      l?.createdAt || '',
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `edufyi_leaves_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showFeedback('Exported leave requests to CSV successfully.')
  }

  const balancesRaw = storeState.leaveBalances ?? []
  const userEmpId = String(user?.employeeId || '').trim()
  const userId = String(user?.id || user?._id || '').trim()
  const isIntern = String(user?.role || '').toLowerCase().includes('intern') || String(user?.designation || '').toLowerCase().includes('intern')
  const defaultFallbackBalances = [
    { leaveType: 'casual', allowance: isIntern ? 0 : 1, used: 0, reserved: 0 },
    { leaveType: 'sick', allowance: 1, used: 0, reserved: 0 },
  ]
  const myBalances = balancesRaw.filter((b) => {
    if (!b) return false
    const bEmpObj = typeof b.employeeId === 'object' && b.employeeId !== null ? b.employeeId : null
    const bEmpCode = String(bEmpObj?.employeeId || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
    const bEmpId = String(bEmpObj?._id || bEmpObj?.id || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
    return (userEmpId && (bEmpCode === userEmpId || bEmpId === userEmpId)) || (userId && (bEmpId === userId || bEmpCode === userId))
  })
  const balancesToMap = myBalances.length > 0 ? myBalances : defaultFallbackBalances
  const balancesSelf = balancesToMap.map((balance) => ({
    leaveType: balance?.leaveType || 'General Leave',
    available: Math.max(0, (balance?.allowance || 0) - (balance?.used || 0) - (balance?.reserved || 0)),
    total: balance?.allowance || 0,
    used: balance?.used || 0,
    reserved: balance?.reserved || 0,
  }))

  const title = isSelf
    ? 'My Leave & Time Off'
    : mode === 'team'
    ? 'Team Leave Approvals'
    : mode === 'admin'
    ? 'Admin Leave Management'
    : 'HR Leave Management'

  const eyebrow = isSelf
    ? 'Employee Self-Service'
    : mode === 'admin'
    ? 'Admin Executive Authority'
    : mode === 'team'
    ? 'Direct Reports Governance'
    : 'Workforce Governance'

  const description = isSelf
    ? 'Monitor leave balances, apply for time off, and follow the approval workflow.'
    : mode === 'team'
    ? 'Review and endorse leave requests for your direct engineering reports.'
    : mode === 'admin'
    ? 'Review workforce leave approvals, sign off on Month-End (25th+) LOP escalations, and manage organizational quotas.'
    : 'Manage leave policies, employee entitlements, approvals, and holiday rules.'

  return (
    <div className="leave-management-shell">
      <PageHeader eyebrow={eyebrow} title={title} description={description}>
        {isManagement && (
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </Button>
        )}
        {isManagement && (
          <Button onClick={() => setActiveTab('grant')}>
            <Plus size={15} /> Grant Leave
          </Button>
        )}
      </PageHeader>

      {/* Feedback Toast Banner */}
      {feedbackNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--soft-teal)',
            border: '1px solid rgba(29, 138, 122, 0.3)',
            borderRadius: '9px',
            padding: '11px 16px',
            marginBottom: '16px',
            color: 'var(--teal)',
            fontSize: '11px',
            fontWeight: 600,
            animation: 'fadeUp 0.3s ease',
          }}
        >
          <CheckCircle2 size={16} />
          <span style={{ flex: 1 }}>{feedbackNotice}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice('')}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--teal)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Management (Admin & HR) Executive KPIs */}
      {isManagement && (
        <section className="leave-kpi-grid">
          <div className="leave-kpi-card pending">
            <div className="leave-kpi-header">
              <span className="leave-kpi-title">{mode === 'admin' ? 'Pending Admin LOP Sign-Off' : 'Pending HR Approvals'}</span>
              <div className="leave-kpi-icon-wrap pending">
                <Clock3 size={16} />
              </div>
            </div>
            <div className="leave-kpi-value">
              {mode === 'admin' ? pendingAdminCount : pendingCount}
              <span className="leave-kpi-unit">Requests</span>
            </div>
            <div className="leave-kpi-sub">
              {mode === 'admin' ? (pendingAdminCount ? 'Requires administrative authorization' : 'All LOP queues cleared') : (pendingCount ? 'Action required by HR' : 'All queues cleared')}
            </div>
          </div>

          <div className="leave-kpi-card approved">
            <div className="leave-kpi-header">
              <span className="leave-kpi-title">Approved Leaves (YTD)</span>
              <div className="leave-kpi-icon-wrap approved">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="leave-kpi-value">
              {approvedCount}
              <span className="leave-kpi-unit">Records</span>
            </div>
            <div className="leave-kpi-sub">Authorized workforce absences</div>
          </div>

          <div className="leave-kpi-card on-leave">
            <div className="leave-kpi-header">
              <span className="leave-kpi-title">Staff On Leave Today</span>
              <div className="leave-kpi-icon-wrap on-leave">
                <CalendarDays size={16} />
              </div>
            </div>
            <div className="leave-kpi-value" style={{ color: onLeaveToday.length ? 'var(--blue)' : 'inherit' }}>
              {onLeaveToday.length}
              <span className="leave-kpi-unit">Staff</span>
            </div>
            <div className="leave-kpi-sub" title={onLeaveToday.length ? onLeaveToday.map((x) => x.employeeName).join(', ') : 'Full on-site coverage'}>
              {onLeaveToday.length
                ? onLeaveToday.map((x) => x.employeeName).join(', ')
                : 'Full on-site coverage'}
            </div>
          </div>

          <div className="leave-kpi-card total">
            <div className="leave-kpi-header">
              <span className="leave-kpi-title">Total Requests</span>
              <div className="leave-kpi-icon-wrap total">
                <FileText size={16} />
              </div>
            </div>
            <div className="leave-kpi-value">
              {totalRequests}
              <span className="leave-kpi-unit">Total</span>
            </div>
            <div className="leave-kpi-sub">All-time company requests</div>
          </div>
        </section>
      )}

      {/* Sub Navigation Tabs for Management Mode (Admin & HR) */}
      {isManagement && (
        <div className="subnav-tabs">
          <button
            type="button"
            className={`subnav-tab ${activeTab === 'approvals' && filter !== 'pending_admin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('approvals'); if (filter === 'pending_admin') setFilter(''); }}
          >
            <CalendarDays size={14} />
            <span>Leave Requests & Approvals</span>
            <span className="badge-pill">{pendingCount ? `${pendingCount} Pending` : filteredRequests.length}</span>
          </button>

          <button
            type="button"
            className={`subnav-tab ${filter === 'pending_admin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('approvals'); setFilter('pending_admin'); }}
          >
            <ShieldAlert size={14} style={{ color: pendingAdminCount > 0 ? '#ef4444' : 'inherit' }} />
            <span>25th+ Month-End LOP Sign-Offs</span>
            <span className="badge-pill" style={pendingAdminCount > 0 ? { background: '#ef4444', color: '#fff', fontWeight: 700 } : {}}>
              {pendingAdminCount} Awaiting
            </span>
          </button>

          <button
            type="button"
            className={`subnav-tab ${activeTab === 'grant' ? 'active' : ''}`}
            onClick={() => setActiveTab('grant')}
          >
            <Plus size={14} />
            <span>Grant / Record Leave</span>
          </button>

          <button
            type="button"
            className={`subnav-tab ${activeTab === 'quotas' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotas')}
          >
            <Users size={14} />
            <span>Employee Leave Balances & Quotas</span>
            <span className="badge-pill">{allEmployees.length} Staff</span>
          </button>

          <button
            type="button"
            className={`subnav-tab ${activeTab === 'policy' ? 'active' : ''}`}
            onClick={() => setActiveTab('policy')}
          >
            <FileText size={14} />
            <span>Leave Policies & Holidays</span>
            <span className="badge-pill">2026 Rules</span>
          </button>
        </div>
      )}

      {/* SELF-SERVICE BALANCES */}
      {isSelf && (
        <div className="leave-balance-grid">
          {balancesSelf.map((b) => {
            const isCasual = b.leaveType.toLowerCase().includes('casual')
            const isSick = b.leaveType.toLowerCase().includes('sick')
            const isEarned = b.leaveType.toLowerCase().includes('earned') || b.leaveType.toLowerCase().includes('privilege')
            const borderTopColor = isCasual ? '#10b981' : isSick ? '#0d9488' : isEarned ? '#3b82f6' : '#6366f1'
            const bgGradient = isCasual
              ? 'linear-gradient(135deg, rgba(209, 250, 229, 0.4) 0%, #ffffff 100%)'
              : isSick
              ? 'linear-gradient(135deg, rgba(204, 251, 241, 0.4) 0%, #ffffff 100%)'
              : isEarned
              ? 'linear-gradient(135deg, rgba(219, 234, 254, 0.4) 0%, #ffffff 100%)'
              : 'linear-gradient(135deg, rgba(243, 244, 246, 0.5) 0%, #ffffff 100%)'
            return (
              <div
                className="leave-balance-card"
                key={b.leaveType}
                style={{
                  background: bgGradient,
                  borderTop: `3px solid ${borderTopColor}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{b.leaveType}</span>
                  {isCasual ? <Sun size={15} color="#059669" /> : isSick ? <Clock3 size={15} color="#0d9488" /> : <CalendarDays size={15} color="#3b82f6" />}
                </div>
                <strong>{typeof b.available === 'number' ? (b.available % 1 === 0 ? b.available : b.available.toFixed(1)) : b.available} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}>Days</span></strong>
                <small style={{ color: '#4b5563' }}>Used: {typeof b.used === 'number' ? (b.used % 1 === 0 ? b.used : b.used.toFixed(1)) : b.used}d · Reserved: {typeof b.reserved === 'number' ? (b.reserved % 1 === 0 ? b.reserved : b.reserved.toFixed(1)) : b.reserved}d</small>
              </div>
            )
          })}
        </div>
      )}

      {/* SELF-SERVICE APPLY */}
      {isSelf && <ApplyLeaveSelf onSubmitted={() => { hrStore.refresh().catch(() => {}); setRefreshKey((k) => k + 1) }} />}

      {/* TAB 1: LEAVE REQUESTS & APPROVALS */}
      {activeTab === 'approvals' && (
        <>
          {filter === 'pending_admin' && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#991b1b', fontSize: '12.5px' }}>
                    Showing Month-End (25th+) LOP Requests Awaiting Admin Sign-off
                  </strong>
                  <div style={{ color: '#b91c1c', fontSize: '11px', marginTop: '2px' }}>
                    HR Operations has verified these 25th+ month-end loss of pay leaves and forwarded them for final administrative sign-off.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="ui-button secondary"
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
                onClick={() => setFilter('')}
              >
                Clear LOP Filter
              </button>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="module-search" style={{ minWidth: '220px' }}>
                <Search size={15} />
                <input
                  placeholder="Search employee name, ID, or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="leave-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                {Object.entries(labels).map(([val, lbl]) => (
                  <option value={val} key={val}>
                    {lbl}
                  </option>
                ))}
              </select>

              <select
                className="leave-filter"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">All leave types</option>
                <option value="casual">Casual Leave (CL)</option>
                <option value="sick">Sick Leave (SL)</option>
                <option value="earned">Earned Leave (EL)</option>
                <option value="comp_off">Compensatory Off</option>
                <option value="maternity">Maternity/Paternity</option>
                <option value="lop">Loss of Pay (LOP)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
                title="Split Review View"
              >
                <Layers size={13} /> Split View
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Data Table View"
              >
                <TableIcon size={13} /> Table View
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: SPLIT INTERACTIVE REVIEW VIEW */}
          {viewMode === 'split' && (
            <section className="leave-workspace-grid">
              <div className="panel leave-list-panel">
                <div className="panel-heading">
                  <div>
                    <p className="section-kicker">Queue & History</p>
                    <h2>{mode === 'team' ? 'Direct Reports' : isManagement ? (filter === 'pending_admin' ? 'Pending Admin LOP Requests' : 'All Company Requests') : 'My Requests'}</h2>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                    {filteredRequests.length} record(s)
                  </span>
                </div>

                <div className="leave-request-list">
                  {filteredRequests.length ? (
                    filteredRequests.map((request, idx) => (
                      <RequestCard
                        request={request}
                        selected={selected?.id === request?.id}
                        onSelect={setSelected}
                        onQuickApprove={isManagement ? handleQuickApprove : null}
                        onQuickReject={isManagement ? handleQuickRejectPrompt : null}
                        key={request?.id || request?._id || idx}
                      />
                    ))
                  ) : (
                    filter === 'pending_admin' ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                        <CheckCircle2 size={28} style={{ color: '#16a34a', margin: '0 auto 8px', display: 'block' }} />
                        <strong style={{ fontSize: '12.5px', color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                          No Pending LOP Approvals
                        </strong>
                        <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '10px' }}>
                          No month-end (25th+) loss of pay requests are currently awaiting Admin sign-off.
                        </small>
                        <button
                          type="button"
                          className="ui-button secondary"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => setFilter('')}
                        >
                          Show All Requests
                        </button>
                      </div>
                    ) : (
                      <EmptyState
                        title="No matching leave requests"
                        message="Adjust filters or search criteria to view requests."
                      />
                    )
                  )}
                </div>
              </div>

              <RequestDetail
                request={selected}
                mode={mode}
                onRefresh={() => setRefreshKey((k) => k + 1)}
                onDeleteRequest={setLeaveToDelete}
              />
            </section>
          )}

          {/* VIEW MODE 2: FULL DATA TABLE VIEW */}
          {viewMode === 'table' && (
            <section className="panel">
              <DataTable
                caption="Company leave management queue"
                columns={[
                  {
                    key: 'employee',
                    label: 'Employee',
                    render: (r) => (
                      <div>
                        <strong>{r.employeeName || 'Employee'}</strong>
                        <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
                          {(typeof r.employeeId === 'object' ? r.employeeId?.employeeId : r.employeeId) || 'N/A'} · {r.department || 'General'}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'leaveType',
                    label: 'Leave Type',
                    render: (r) => (
                      <span style={{ fontWeight: 600 }}>
                        {leaveTypeLabels[r.leaveType] || r.leaveType}
                      </span>
                    ),
                  },
                  {
                    key: 'dates',
                    label: 'Date Range',
                    render: (r) => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`,
                  },
                  {
                    key: 'days',
                    label: 'Days',
                    render: (r) => (
                      <strong>
                        {Boolean(r.isHalfDay || r.days === 0.5 || r.units === 0.5)
                          ? '0.5 d (Half)'
                          : `${r.days || 1} d`}
                      </strong>
                    ),
                  },
                  {
                    key: 'reason',
                    label: 'Reason',
                    render: (r) => (
                      <span
                        style={{
                          maxWidth: '180px',
                          display: 'inline-block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--muted)',
                        }}
                      >
                        {r.reason}
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (r) => <RequestStatus status={r.status} />,
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (r) => {
                      const isPending = (r.status === 'pending_hr' || r.status === 'pending_manager' || r.status === 'pending_director' || r.status === 'pending_admin') && user?.role !== 'team_lead'
                      return (
                        <div className="emp-action-group">
                          {isPending && (
                            <button
                              type="button"
                              className="emp-action-btn view"
                              onClick={() => handleQuickApprove(r)}
                              title="Quick Approve"
                            >
                              <Check size={12} /> Approve
                            </button>
                          )}
                          {isPending && (
                            <button
                              type="button"
                              className="emp-action-btn delete"
                              onClick={() => handleQuickRejectPrompt(r)}
                              title="Quick Reject"
                            >
                              <X size={12} /> Reject
                            </button>
                          )}
                          <button
                            type="button"
                            className="emp-action-btn edit"
                            onClick={() => {
                              setSelected(r)
                              setViewMode('split')
                            }}
                            title="View Full Details"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            type="button"
                            className="emp-action-btn delete"
                            onClick={() => setLeaveToDelete(r)}
                            title="Delete Request"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )
                    },
                  },
                ]}
                rows={filteredRequests}
                emptyMessage="No leave records matching the selected filters."
              />
            </section>
          )}
        </>
      )}

      {/* TAB 2: GRANT LEAVE */}
      {activeTab === 'grant' && (
        <GrantLeaveHR
          employees={allEmployees}
          preselectedEmpId={preselectedEmpId}
          onGranted={() => {
            setActiveTab('approvals')
            setPreselectedEmpId('')
            showFeedback('Leave granted and recorded successfully.')
          }}
        />
      )}

      {/* TAB 3: EMPLOYEE LEAVE BALANCES & QUOTAS */}
      {activeTab === 'quotas' && (
        <LeaveBalanceTable
          balances={storeState.leaveBalances ?? []}
          employees={allEmployees}
          onSwitchTab={setActiveTab}
        />
      )}

      {/* TAB 4: LEAVE POLICIES & HOLIDAYS */}
      {activeTab === 'policy' && (
        <LeavePolicySettings
          employees={allEmployees}
          allRequests={allLeaves}
          onSwitchTab={setActiveTab}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationDialog
        open={Boolean(leaveToDelete)}
        title="Delete Leave Request"
        message={`Are you sure you want to permanently remove the leave record for ${leaveToDelete?.employeeName} (${leaveToDelete?.leaveType}, ${formatDate(leaveToDelete?.startDate)} to ${formatDate(leaveToDelete?.endDate)})?`}
        confirmLabel="Yes, Delete Record"
        isDestructive={true}
        onConfirm={handleDeleteLeave}
        onCancel={() => setLeaveToDelete(null)}
      />

      {/* REJECT LEAVE MODAL WITH DECISION NOTES */}
      {rejectingLeave && (
        <div className="reject-modal-backdrop" onClick={() => setRejectingLeave(null)}>
          <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Decline Leave Request: {rejectingLeave.employeeName}
              </h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setRejectingLeave(null)}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 14px' }}>
              Please provide the official reason for declining {rejectingLeave.employeeName}'s {leaveTypeLabels[rejectingLeave.leaveType] || rejectingLeave.leaveType} request ({rejectingLeave.days || 1} day(s)).
            </p>

            <Field label="Rejection Reason" required>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Critical project sprint milestone, overlapping team members on leave, delivery deadline..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  fontSize: '11px',
                }}
                required
              />
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setRejectingLeave(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
