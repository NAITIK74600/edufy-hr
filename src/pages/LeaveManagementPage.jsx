import { useEffect, useState } from 'react'
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
  Table as TableIcon,
  Trash2,
  UserCheck,
  Users,
  X,
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
  const employee = request.employeeName || request.employeeId?.name || 'Employee'
  const isPending =
    request.status === 'pending_tl' ||
    request.status === 'pending_manager' ||
    request.status === 'pending_director' ||
    request.status === 'pending_hr' ||
    request.status === 'pending_admin'

  return (
    <div
      className={`leave-request-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(request)}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <div className="leave-request-top">
        <div>
          <strong style={{ fontSize: '12px' }}>{employee}</strong>
          <span>
            {leaveTypeLabels[request.leaveType] || request.leaveType} · {formatDate(request.startDate)} to {formatDate(request.endDate)}
            {(request.isDoubleLop || request.doubleLopDays > 0 || (new Date(request.startDate).getDate() >= 25) || (new Date(request.endDate).getDate() >= 25)) && (
              <span style={{ marginLeft: '6px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '9px', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                Double LOP (25th+)
              </span>
            )}
          </span>
        </div>
        <RequestStatus status={request.status} />
      </div>

      <div className="leave-request-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          <strong>{request.days || request.units || 1} day(s)</strong> — {request.reason}
        </span>

        {isPending && onQuickApprove && (
          <div
            className="emp-action-group"
            onClick={(e) => e.stopPropagation()}
            style={{ marginLeft: 'auto' }}
          >
            <button
              type="button"
              className="emp-action-btn view"
              onClick={() => onQuickApprove(request)}
              title="Quick Approve"
            >
              <Check size={11} /> Approve
            </button>
            <button
              type="button"
              className="emp-action-btn delete"
              onClick={() => onQuickReject(request)}
              title="Quick Reject"
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

  if (!request) {
    return (
      <div className="leave-detail-empty">
        <CalendarDays size={26} />
        <strong>Select a Leave Request</strong>
        <span>Choose a request from the list or table to review employee details, notes, and approval timeline.</span>
      </div>
    )
  }

  const isAdmin = user?.role === 'admin' || (user?.permissions || []).includes('admin.access')
  const isDirector = user?.role === 'director'
  const isManager = user?.role === 'manager'
  const isTeamLead = user?.role === 'team_lead'
  const isHrOrAdmin = mode === 'hr' || ['admin', 'hr'].includes(user?.role) || (user?.permissions || []).includes('leave.hr.review')

  // Team Lead does not approve leaves; TL is only notified of squad member leaves. Manager approves!
  const canTlDecide = false

  // Can Manager decide? (Employee leave or TL leave pending Manager approval)
  const canManagerDecide = (isManager || isDirector || isHrOrAdmin) && (request.status === 'pending_manager' || request.currentApproverRole === 'manager')

  // Can Director decide? (Manager leave pending Director approval)
  const canDirectorDecide = (isDirector || isHrOrAdmin) && (request.status === 'pending_director' || request.currentApproverRole === 'director')

  // Can Admin decide? (25th Month LOP leave pending final Admin sign-off)
  const canAdminDecide = isAdmin && (request.status === 'pending_admin' || request.currentApproverRole === 'admin')

  // Can HR decide? (HR reviews pending_hr or advances 25th month LOP to admin)
  const canHrDecide = isHrOrAdmin && ['pending_hr', 'pending_manager', 'pending_director'].includes(request.status)
  const canDecide = canAdminDecide || canManagerDecide || canDirectorDecide || canHrDecide
  const canCancel = (mode === 'self' || isHrOrAdmin) && ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved'].includes(request.status)

  async function handleApprove() {
    setBusy(true)
    setError('')
    try {
      let role = 'hr'
      if (canAdminDecide || (isAdmin && request.status === 'pending_admin')) {
        role = 'admin'
      } else if (canTlDecide && !isHrOrAdmin) {
        role = 'team_lead'
      } else if (canManagerDecide && !isHrOrAdmin) {
        role = 'manager'
      } else if (canDirectorDecide && !isHrOrAdmin) {
        role = 'director'
      } else if (isDirector) {
        role = 'director'
      } else if (request.status === 'pending_tl') {
        role = 'team_lead'
      } else if (request.status === 'pending_manager') {
        role = 'manager'
      } else if (request.status === 'pending_director') {
        role = 'director'
      } else if (request.status === 'pending_admin') {
        role = 'admin'
      }
      await hrStore.approveLeave(request.id, role, decisionReason, user)
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
      if (canAdminDecide || (isAdmin && request.status === 'pending_admin')) {
        role = 'admin'
      } else if (canTlDecide && !isHrOrAdmin) {
        role = 'team_lead'
      } else if (canManagerDecide && !isHrOrAdmin) {
        role = 'manager'
      } else if (canDirectorDecide && !isHrOrAdmin) {
        role = 'director'
      } else if (isDirector) {
        role = 'director'
      } else if (request.status === 'pending_tl') {
        role = 'team_lead'
      } else if (request.status === 'pending_manager') {
        role = 'manager'
      } else if (request.status === 'pending_director') {
        role = 'director'
      } else if (request.status === 'pending_admin') {
        role = 'admin'
      }
      await hrStore.rejectLeave(request.id, role, decisionReason, user)
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
        <RequestStatus status={request.status} />
      </div>

      <div className="leave-detail-summary">
        <div>
          <span>Dates</span>
          <strong>
            {formatDate(request.startDate)} – {formatDate(request.endDate)}
          </strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>{request.days || request.units || 1} Working Day(s)</strong>
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
            {request.employeeId} · {request.department || 'General'}{' '}
            {request.applicantRole && `(${request.applicantRole.replace('_', ' ')})`}
          </small>
        </div>
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
                  {request.status === 'approved'
                    ? 'Synced to HR Panel for Payroll & Leave Balance Deductions'
                    : request.status === 'pending_admin'
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
                  : canTlDecide
                  ? 'Add Team Lead remarks (Manager & Director will be notified; not Admin)...'
                  : canManagerDecide
                  ? 'Add Manager remarks (Director will be notified; not Admin)...'
                  : canDirectorDecide
                  ? 'Add Managing Director remarks (Approved request will sync to HR Panel)...'
                  : 'Add official resolution comments...'
              }
              rows={2}
            />
          </label>
          <div className="detail-actions">
            <Button disabled={busy} onClick={handleApprove}>
              <Check size={14} />
              {request.status === 'pending_admin'
                ? 'Approve LOP (Admin Sign-off)'
                : (request.status === 'pending_hr' && (request.isDoubleLop || request.doubleLopDays > 0 || (new Date(request.startDate).getDate() >= 25) || (new Date(request.endDate).getDate() >= 25)))
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

  // Handle Day Click in Range Calendar
  const handleDayClick = (dayStr) => {
    if (!startDate || (startDate && endDate)) {
      // First click: select start date
      onChange({ startDate: dayStr, endDate: '', days: 1 })
    } else {
      // Second click: select end date
      if (dayStr >= startDate) {
        const diff = Math.max(1, Math.round((new Date(dayStr) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)
        onChange({ startDate, endDate: dayStr, days: diff })
      } else {
        // Clicked date is earlier than start date -> set as new start date
        onChange({ startDate: dayStr, endDate: '', days: 1 })
      }
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
              const isHovered = startDate && !endDate && hoverDate && dateStr > startDate && dateStr <= hoverDate

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

          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Click Start Date, then click End Date to complete your range.</span>
            {startDate && !endDate && (
              <span style={{ color: 'var(--teal)', fontWeight: 700 }}>
                👉 Select End Date (&gt;= {startDate})
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
  const userBalances = balances.filter((b) => {
    if (typeof b.employeeId === 'object' && b.employeeId !== null) {
      return (userEmpId && b.employeeId.employeeId === userEmpId) || (userId && b.employeeId._id === userId)
    }
    return (userEmpId && b.employeeId === userEmpId) || (userId && b.employeeId === userId)
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
      setForm({ leaveType: 'casual', startDate: todayKey(), endDate: todayKey(), days: 1, reason: '' })
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
      setForm({ leaveType: 'casual', startDate: todayKey(), endDate: todayKey(), days: 1, reason: '' })
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
            {myPendingLeaves.map((l) => (
              <button
                key={l.id}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px', height: 'auto', lineHeight: '1.2' }}
                onClick={() => handleCancelExisting(l.id)}
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

        {/* INTERACTIVE DATE RANGE PICKER & CALENDAR */}
        <LeaveDateRangePicker
          startDate={form.startDate}
          endDate={form.endDate}
          days={form.days}
          onChange={handleRangeChange}
          required={true}
        />

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

        {error && <p className="inline-error">{error}</p>}

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
                Existing {overlapInfo.overlappingStatus?.replace('pending_', 'Pending ') || 'Pending'} Request: {overlapInfo.overlappingStartDate || 'selected dates'} to {overlapInfo.overlappingEndDate || 'selected dates'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#78350f' }}>
              {overlapInfo.canCancelExisting
                ? `You have an unapproved leave request for these dates${overlapInfo.overlappingReason ? ` ("${overlapInfo.overlappingReason}")` : ''}. You can replace it with your new ${form.days}-day request, or cancel the previous request.`
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

  useEffect(() => {
    if (preselectedEmpId) {
      setForm((f) => ({ ...f, employeeId: preselectedEmpId }))
    }
  }, [preselectedEmpId])

  function update(field, value) {
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

  const handleSubmit = storeAction(async (e) => {
    e.preventDefault()
    const emp = employees.find((x) => x.employeeId === form.employeeId || x.id === form.employeeId)
    if (!emp) return

    setBusy(true)
    try {
      await hrStore.applyLeave({
        ...form,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3500)
    } finally {
      setBusy(false)
    }
    setForm({
      employeeId: '',
      leaveType: 'casual',
      startDate: todayKey(),
      endDate: todayKey(),
      days: 1,
      status: 'approved',
      reason: '',
      hrComment: 'Granted directly by HR Operations with manager alignment.',
    })
    onGranted()
  })

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">HR Administrative Action</p>
          <h2>Grant / Record Leave on Behalf of Employee</h2>
        </div>
      </div>
      <p className="foundation-copy" style={{ margin: '10px 0 20px' }}>
        HR personnel can record approved or pending leaves for any staff member. Immediate approvals automatically sync with daily attendance records.
      </p>

      {success && (
        <div style={{ background: 'var(--soft-teal)', color: 'var(--teal)', padding: '12px 16px', borderRadius: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <CheckCircle2 size={16} /> Leave recorded successfully and synchronized with attendance records!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', maxWidth: '780px' }}>
        <Field label="Select Employee" required>
          <select
            value={form.employeeId}
            onChange={(e) => update('employeeId', e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '11px' }}
          >
            <option value="">-- Choose employee --</option>
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.name} ({emp.employeeId} · {emp.department})
              </option>
            ))}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <Field label="Leave Classification" required>
            <select
              value={form.leaveType}
              onChange={(e) => update('leaveType', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '11px' }}
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
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '11px' }}
            >
              <option value="approved">Direct HR Approval (Instant Grant)</option>
              <option value="pending_hr">Submit as Pending HR Review</option>
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '14px' }}>
          <Field label="Start Date" required>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '11px' }}
            />
          </Field>

          <Field label="End Date" required>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate || todayKey()}
              onChange={(e) => update('endDate', e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '11px' }}
            />
          </Field>

          <Field label="Duration">
            <input
              type="number"
              min="1"
              value={form.days}
              onChange={(e) => update('days', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '11px' }}
            />
          </Field>
        </div>

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
            margin: '0 0 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
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
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '11px' }}
          />
        </Field>

        <Field label="HR Operations Remarks">
          <input
            type="text"
            value={form.hrComment}
            onChange={(e) => update('hrComment', e.target.value)}
            placeholder="Official resolution note..."
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff', fontSize: '11px' }}
          />
        </Field>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <Button type="submit" disabled={busy || !form.employeeId}>
            <CheckCircle2 size={15} /> Grant & Record Leave
          </Button>
        </div>
      </form>
    </div>
  )
}

export function LeaveManagementPage({ mode = 'self' }) {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || ''
      if (hash.includes('tab=policy')) return 'policy'
      if (hash.includes('tab=approvals')) return 'approvals'
      if (hash.includes('tab=grant')) return 'grant'
      if (hash.includes('tab=quotas')) return 'quotas'
      if (hash.startsWith('#/admin/leave')) {
        const state = hrStore.getState()
        const hasPendingAdmin = (state.leaves || []).some((l) => l.status === 'pending_admin')
        return hasPendingAdmin ? 'approvals' : 'policy'
      }
    }
    return 'approvals'
  })
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('split') // 'split' | 'table'
  const [refreshKey, setRefreshKey] = useState(0)

  const [feedbackNotice, setFeedbackNotice] = useState('')
  const [leaveToDelete, setLeaveToDelete] = useState(null)
  const [rejectingLeave, setRejectingLeave] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [preselectedEmpId, setPreselectedEmpId] = useState('')

  const isSelf = mode === 'self'

  useEffect(() => {
    if (!storeState.employees?.length) {
      hrStore.refresh().catch(() => {})
    }
    return hrStore.subscribe((state) => {
      setStoreState(state)
    })
  }, [])

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

    filteredRequests = filteredRequests.filter((l) => {
      // Team Lead: views squad leaves (only notified/info, not an approval gate)
      if (userRole === 'team_lead') {
        return (
          (userEmpId && (l.tlId === userEmpId || l.managerId === userEmpId)) ||
          (userId && (l.tlId === userId || l.managerId === userId)) ||
          (user?.department && l.department === user.department)
        )
      }
      // Department Manager: reviews pending_manager from employees and TLs
      if (userRole === 'manager') {
        return (
          l.status === 'pending_manager' ||
          (userEmpId && l.managerId === userEmpId) ||
          (userId && l.managerId === userId) ||
          (user?.department && l.department === user.department)
        )
      }
      // Managing Director: reviews pending_director from Managers and high-level leaves
      if (userRole === 'director') {
        return (
          l.status === 'pending_director' ||
          l.applicantRole === 'manager' ||
          l.status === 'pending_manager'
        )
      }
      // Fallback team view
      return (
        l.status === 'pending_manager' ||
        l.status === 'pending_director' ||
        (userEmpId && (l.managerId === userEmpId || l.tlId === userEmpId)) ||
        (userId && (l.managerId === userId || l.tlId === userId))
      )
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

  // Synchronize selection
  useEffect(() => {
    const latest = filteredRequests.find((request) => request.id === selected?.id) ?? filteredRequests[0] ?? null
    if (latest !== selected) setSelected(latest)
  }, [filteredRequests])

  // KPIs
  const totalRequests = allLeaves.length
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
    else if (user?.role === 'manager' || request.status === 'pending_manager') role = 'manager'
    else if (user?.role === 'director' || request.status === 'pending_director') role = 'director'
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
    else if (user?.role === 'manager' || rejectingLeave.status === 'pending_manager') role = 'manager'
    else if (user?.role === 'director' || rejectingLeave.status === 'pending_director') role = 'director'
    await hrStore.rejectLeave(rejectingLeave.id, role, reason, user)
    setRejectingLeave(null)
    setRejectReason('')
    showFeedback(`Declined leave request for ${rejectingLeave.employeeName}.`)
  })

  const handleDeleteLeave = storeAction(async () => {
    if (!leaveToDelete) return
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
      l.id,
      l.employeeId,
      l.employeeName,
      l.department || 'General',
      l.leaveType,
      l.startDate,
      l.endDate,
      l.days || 1,
      l.status,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      `"${(l.managerComment || '').replace(/"/g, '""')}"`,
      `"${(l.hrComment || '').replace(/"/g, '""')}"`,
      l.createdAt || '',
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

  const balancesSelf = (storeState.leaveBalances ?? []).map((balance) => ({
    leaveType: balance.leaveType, available: balance.allowance - balance.used - balance.reserved,
    total: balance.allowance, used: balance.used, reserved: balance.reserved,
  }))

  const title = isSelf
    ? 'My Leave & Time Off'
    : mode === 'team'
    ? 'Team Leave Approvals'
    : 'Leave Management'

  const description = isSelf
    ? 'Monitor leave balances, apply for time off, and follow the approval workflow.'
    : mode === 'team'
    ? 'Review and endorse leave requests for your direct engineering reports.'
    : 'Manage leave policies, employee entitlements, approvals, and holiday rules.'

  return (
    <>
      <PageHeader eyebrow={mode === 'hr' ? 'Workforce Governance' : 'Employee Self-Service'} title={title} description={description}>
        {mode === 'hr' && (
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </Button>
        )}
        {mode === 'hr' && (
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

      {/* HR Executive KPIs */}
      {mode === 'hr' && (
        <section className="module-kpi-grid">
          <div className="panel module-kpi">
            <span>Pending HR Approvals</span>
            <strong style={{ color: pendingCount ? 'var(--gold)' : 'var(--teal)' }}>
              {pendingCount} Request(s)
            </strong>
            <small>{pendingCount ? 'Action required by HR' : 'All queues cleared'}</small>
          </div>
          <div className="panel module-kpi">
            <span>Approved Leaves (YTD)</span>
            <strong>{approvedCount} Records</strong>
            <small>Authorized absences</small>
          </div>
          <div className="panel module-kpi">
            <span>Staff On Leave Today</span>
            <strong style={{ color: onLeaveToday.length ? 'var(--blue)' : 'inherit' }}>
              {onLeaveToday.length} Staff
            </strong>
            <small>
              {onLeaveToday.length
                ? onLeaveToday.map((x) => x.employeeName).join(', ')
                : 'Full on-site coverage'}
            </small>
          </div>
          <div className="panel module-kpi">
            <span>Total Leave Requests</span>
            <strong>{totalRequests} Total</strong>
            <small>All time company requests</small>
          </div>
        </section>
      )}

      {/* Sub Navigation Tabs for HR Mode */}
      {mode === 'hr' && (
        <div className="subnav-tabs">
          <button
            type="button"
            className={`subnav-tab ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            <CalendarDays size={14} />
            <span>Leave Requests & Approvals</span>
            <span className="badge-pill">{pendingCount ? `${pendingCount} Pending` : filteredRequests.length}</span>
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
          {balancesSelf.map((b) => (
            <div className="panel leave-balance-card" key={b.leaveType}>
              <span>{b.leaveType}</span>
              <strong>{b.available} Days</strong>
              <small>Used: {b.used} · Reserved: {b.reserved}</small>
            </div>
          ))}
        </div>
      )}

      {/* SELF-SERVICE APPLY */}
      {isSelf && <ApplyLeaveSelf onSubmitted={() => setRefreshKey((k) => k + 1)} />}

      {/* TAB 1: LEAVE REQUESTS & APPROVALS */}
      {activeTab === 'approvals' && (
        <>
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
                    <h2>{mode === 'team' ? 'Direct Reports' : mode === 'hr' ? 'All Company Requests' : 'My Requests'}</h2>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                    {filteredRequests.length} record(s)
                  </span>
                </div>

                <div className="leave-request-list">
                  {filteredRequests.length ? (
                    filteredRequests.map((request) => (
                      <RequestCard
                        request={request}
                        selected={selected?.id === request.id}
                        onSelect={setSelected}
                        onQuickApprove={mode === 'hr' ? handleQuickApprove : null}
                        onQuickReject={mode === 'hr' ? handleQuickRejectPrompt : null}
                        key={request.id}
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="No matching leave requests"
                      message="Adjust filters or search criteria to view requests."
                    />
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
                          {r.employeeId} · {r.department || 'General'}
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
                    render: (r) => <strong>{r.days || 1} d</strong>,
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
    </>
  )
}
