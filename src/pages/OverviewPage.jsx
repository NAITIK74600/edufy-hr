import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileText,
  LayoutDashboard,
  Network,
  Plus,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  Receipt,
  Zap,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { hasPermission } from '../auth/permissions'
import { findRoute } from '../app/routes'
import { hrStore } from '../services/hrStore'
import { Button, PageHeader, StatusBadge } from '../components/ui'
import { getTimeOfDayGreeting } from '../utils/greeting'
import { todayKey, currentPayrollMonth } from '../services/connectedStore'

const metricIcons = {
  activeHeadcount: Users,
  onLeaveToday: CalendarDays,
  pendingLeave: CalendarDays,
  attendanceExceptions: Clock3,
  upcomingHolidays: CalendarDays,
  openHelpdeskTickets: CircleHelp,
  pendingExpenses: Receipt,
}

const metricTones = {
  activeHeadcount: 'teal',
  onLeaveToday: 'coral',
  pendingLeave: 'gold',
  attendanceExceptions: 'blue',
  upcomingHolidays: 'gold',
  openHelpdeskTickets: 'teal',
  pendingExpenses: 'coral',
}

function MetricCard({ metric, user }) {
  const Icon = metricIcons[metric.key] ?? FileText
  const route = findRoute(metric.href)
  const canOpen = route && (!route.permission || hasPermission(user, route.permission))
  const content = (
    <>
      <div className={`metric-icon ${metricTones[metric.key] ?? 'teal'}`}>
        <Icon size={18} />
      </div>
      <div className="metric-copy">
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
        <small>{metric.detail}</small>
      </div>
      {canOpen && <ArrowUpRight className="metric-link-icon" size={16} />}
    </>
  )
  return canOpen ? (
    <a className="metric-card metric-link" href={`#${metric.href}`} aria-label={`Open ${metric.label}`}>
      {content}
    </a>
  ) : (
    <article className="metric-card">{content}</article>
  )
}

function LiveClockWidget({ storeState }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  const dateLabel = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  const presentCount = storeState.attendance.filter((a) => a.date === todayKey() && (a.status === 'present' || a.status === 'late')).length
  const totalEmployees = storeState.employees.filter((employee) => employee.status === 'active').length
  const presencePercent = totalEmployees ? Math.round((presentCount / totalEmployees) * 100) : 0

  return (
    <div className="clock-widget">
      <div className="clock-header">
        <p className="section-kicker">Operational Clock</p>
        <span className="live-pill">
          <span className="live-dot" /> Online
        </span>
      </div>
      <div className="clock-display">
        <span className="clock-time">{time}</span>
        <span className="clock-date">{dateLabel}</span>
      </div>
      <div className="clock-stats">
        <div>
          <span>Presence</span>
          <strong>{presencePercent}%</strong>
        </div>
        <div>
          <span>Active Staff</span>
          <strong>{presentCount} / {totalEmployees}</strong>
        </div>
      </div>
      <div className="activity-ticker" aria-label="Live HR updates">
        <span>Database-backed attendance records</span>
        <span>Configured leave approval workflow</span>
        <span>Payroll requires HR review</span>
      </div>
    </div>
  )
}

function DashboardWidgets({ storeState }) {
  const [range, setRange] = useState('Week')
  const ranges = {
    Week: [85, 92, 88, 95, 90, 78, 86],
    Month: [80, 84, 87, 89, 91, 88, 92],
    Quarter: [76, 82, 85, 88, 90, 93, 94],
  }
  const chartValues = ranges[range]
  const headcount = storeState.employees.length
  const onboardingCount = storeState.employees.filter((e) => e.status === 'onboarding').length
  const noticeCount = storeState.employees.filter((e) => e.status === 'notice').length
  const activeCount = storeState.employees.filter((e) => e.status === 'active').length

  return (
    <section className="widget-board" aria-label="HR insights and actions">
      <div className="panel rhythm-widget">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Presence Analytics</p>
            <h2>Attendance Rhythm</h2>
          </div>
          <div className="range-tabs" role="tablist" aria-label="Attendance range">
            {Object.keys(ranges).map((option) => (
              <button
                type="button"
                role="tab"
                aria-selected={range === option}
                className={range === option ? 'selected' : ''}
                onClick={() => setRange(option)}
                key={option}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="rhythm-summary">
          <strong>88.4%</strong>
          <span>
            <TrendingUp size={13} /> +3.2% vs last {range.toLowerCase()} (Wi-Fi Verified)
          </span>
        </div>
        <div className="rhythm-chart" aria-label={`${range} attendance chart`}>
          {chartValues.map((value, index) => (
            <div className="rhythm-column" key={index}>
              <span className="rhythm-value">{value}%</span>
              <div className="rhythm-track">
                <span style={{ height: `${value}%` }} />
              </div>
              <small>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="panel pipeline-widget">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">People Pipeline</p>
            <h2>Workforce Movement</h2>
          </div>
          <BarChart3 size={18} className="muted-icon" />
        </div>
        <div className="pipeline-total">
          <strong>{headcount}</strong>
          <span>Total personnel in roster</span>
        </div>
        <div className="pipeline-list">
          <div>
            <span>
              <i className="pipeline-dot teal" /> Active & Engaged
            </span>
            <strong>{activeCount}</strong>
            <b>
              <em style={{ width: `${(activeCount / headcount) * 100}%` }} />
            </b>
          </div>
          <div>
            <span>
              <i className="pipeline-dot blue" /> In Onboarding
            </span>
            <strong>{onboardingCount}</strong>
            <b>
              <em style={{ width: `${(onboardingCount / headcount) * 100}%` }} />
            </b>
          </div>
          <div>
            <span>
              <i className="pipeline-dot gold" /> Notice / Transition
            </span>
            <strong>{noticeCount}</strong>
            <b>
              <em style={{ width: `${(noticeCount / headcount) * 100}%` }} />
            </b>
          </div>
        </div>
        <a className="widget-link" href="#/hr/people">
          Manage workforce directory <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="panel command-widget">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Command Center</p>
            <h2>Workforce Actions</h2>
          </div>
          <Zap size={18} className="muted-icon" />
        </div>
        <div className="command-actions">
          <a href="#/hr/people">
            <span className="command-icon teal">
              <UserPlus size={15} />
            </span>
            <span>
              <strong>Add New Employee</strong>
              <small>Onboard profile & documents</small>
            </span>
            <ArrowRight size={14} />
          </a>
          <a href="#/hr/leave">
            <span className="command-icon coral">
              <BellRing size={15} />
            </span>
            <span>
              <strong>Review Leave Approvals</strong>
              <small>{storeState.leaves.filter((l) => l.status.startsWith('pending')).length} requests pending review</small>
            </span>
            <ArrowRight size={14} />
          </a>
          <a href="#/hr/payroll">
            <span className="command-icon blue">
              <WalletCards size={15} />
            </span>
            <span>
              <strong>Run Monthly Payroll</strong>
              <small>Salary breakup & PDF payslips</small>
            </span>
            <ArrowRight size={14} />
          </a>
          <a href="#/hr/attendance">
            <span className="command-icon gold">
              <Clock3 size={15} />
            </span>
            <span>
              <strong>Verify Wi-Fi Attendance</strong>
              <small>Check-in logs & geofence</small>
            </span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}

export function OverviewPage() {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((newState) => {
      setStoreState(newState)
    })
  }, [])

  const activeEmployees = storeState.employees.filter((e) => e.status === 'active' || e.status === 'onboarding').length
  const pendingLeaves = storeState.leaves.filter((l) => l.status === 'pending_hr' || l.status === 'pending_manager').length
  const todayStr = todayKey()
  const todayAttendance = (storeState.attendance || []).filter((a) => a.date === todayStr)
  const punchedInCount = todayAttendance.filter((a) => Boolean(a.checkIn) && !a.checkOut).length
  const punchedOutCount = todayAttendance.filter((a) => Boolean(a.checkIn) && Boolean(a.checkOut)).length
  const checkedInEmpIds = new Set(todayAttendance.filter((a) => Boolean(a.checkIn)).map((a) => String(a.employeeId || '').toUpperCase()))
  const notPunchedInCount = Math.max(0, activeEmployees - checkedInEmpIds.size)
  const lateAttendance = 0
  const onLeaveToday = new Set(storeState.leaves.filter((leave) => leave.status === 'approved' && leave.startDate <= todayKey() && leave.endDate >= todayKey()).map((leave) => leave.employeeId)).size
  const openTickets = (storeState.tickets || []).filter((t) => (t.status || 'open') !== 'resolved' && t.status !== 'closed').length
  const pendingExpenses = (storeState.expenses || []).filter((e) => (e.status || 'submitted') === 'submitted' || e.status === 'pending').length
  const upcomingHolidays = storeState.holidays.length

  const nextHoliday = (storeState.holidays || [])
    .filter((h) => h.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  const nextHolidayDetail = nextHoliday ? `Next: ${nextHoliday.name || nextHoliday.title} (${nextHoliday.date})` : 'Company annual calendar'

  const metrics = [
    { key: 'activeHeadcount', label: 'Active headcount', value: `${activeEmployees} Staff`, detail: 'Full-time & contracted', href: '/hr/people' },
    { key: 'onLeaveToday', label: 'On leave today', value: `${onLeaveToday} Out`, detail: 'Scheduled absence', href: '/hr/leave' },
    { key: 'pendingLeave', label: 'Pending leave requests', value: `${pendingLeaves} Requests`, detail: 'Needs HR approval', href: '/hr/leave' },
    { key: 'attendanceExceptions', label: 'Attendance exceptions', value: `${lateAttendance} Late`, detail: 'Grace period flagged', href: '/hr/attendance' },
    { key: 'upcomingHolidays', label: 'Upcoming holidays', value: `${upcomingHolidays} Days`, detail: nextHolidayDetail, href: '/hr/holidays' },
    { key: 'openHelpdeskTickets', label: 'Open help-desk tickets', value: `${openTickets} Tickets`, detail: 'IT & Payroll queries', href: '/hr/helpdesk' },
    { key: 'pendingExpenses', label: 'Pending expenses', value: `${pendingExpenses} Claims`, detail: 'Reimbursement queue', href: '/hr/reports' },
  ]

  const isAdmin = user?.role === 'admin'

  // Dynamic live Daily HR Priorities
  const currentMonth = currentPayrollMonth()
  const pendingDocReviews = (storeState.employees || []).filter((e) => {
    if (e.onboardingStatus === 'verified') return false
    if (e.onboardingStatus === 'submitted' || e.onboardingStatus === 'in_review') return true
    if (e.onboardingDocs && typeof e.onboardingDocs === 'object') {
      return Object.values(e.onboardingDocs).some(
        (d) => d && typeof d === 'object' && (d.fileName || d.url) && d.status !== 'verified' && d.status !== 'rejected'
      )
    }
    return false
  })
  const onboardingEmployees = (storeState.employees || []).filter(
    (e) => e.status === 'onboarding' || e.status === 'invited'
  )
  const monthPayrollRecords = (storeState.payroll || []).filter(
    (p) => (p.month || p.payPeriod || '').toLowerCase() === currentMonth.toLowerCase()
  )
  const urgentTasks = (storeState.tasks || []).filter(
    (t) => t.status !== 'completed' && (t.priority === 'Urgent' || t.priority === 'High')
  )

  const dailyPriorities = []

  // 1. Onboarding / Document Verification
  if (pendingDocReviews.length > 0) {
    const first = pendingDocReviews[0]
    dailyPriorities.push({
      id: 'p-docs',
      icon: Users,
      tone: 'coral',
      title: `${pendingDocReviews.length} Document Verification${pendingDocReviews.length > 1 ? 's' : ''}`,
      detail: `${first.name} (${first.department || 'Staff'}) submitted onboarding documents requiring HR review.`,
      actionLabel: 'Review',
      href: '#/hr/people',
    })
  } else if (onboardingEmployees.length > 0) {
    const first = onboardingEmployees[0]
    dailyPriorities.push({
      id: 'p-onboarding',
      icon: Users,
      tone: 'teal',
      title: 'Active Onboarding Candidates',
      detail: `${onboardingEmployees.length} personnel in pipeline. Next: ${first.name} (${first.department || 'Staff'}).`,
      actionLabel: 'Track',
      href: '#/hr/people',
    })
  } else {
    dailyPriorities.push({
      id: 'p-team',
      icon: Users,
      tone: 'teal',
      title: 'Workforce Onboarding',
      detail: `All ${activeEmployees} team members active with verified compliance records.`,
      actionLabel: 'Directory',
      href: '#/hr/people',
    })
  }

  // 2. Leave Approvals
  if (pendingLeaves > 0) {
    const firstLeave = storeState.leaves.find((l) => l.status === 'pending_hr' || l.status === 'pending_manager')
    const applicant = firstLeave?.employeeName || 'Staff member'
    dailyPriorities.push({
      id: 'p-leaves',
      icon: CalendarDays,
      tone: 'coral',
      title: `${pendingLeaves} Pending Leave Request${pendingLeaves > 1 ? 's' : ''}`,
      detail: `${applicant} requested ${firstLeave?.leaveType ? (firstLeave.leaveType.toUpperCase() + ' leave') : 'leave'} awaiting approval.`,
      actionLabel: 'Approve',
      href: '#/hr/leave',
    })
  } else {
    dailyPriorities.push({
      id: 'p-leaves-clear',
      icon: CalendarDays,
      tone: 'teal',
      title: 'Leave Approvals Current',
      detail: `${onLeaveToday} staff on approved leave today. No leave approvals pending.`,
      actionLabel: 'Calendar',
      href: '#/hr/leave',
    })
  }

  // 3. Current Payroll Calculation & Disbursement
  if (monthPayrollRecords.length > 0) {
    dailyPriorities.push({
      id: 'p-payroll',
      icon: WalletCards,
      tone: 'teal',
      title: `${currentMonth} Payroll Generated`,
      detail: `${monthPayrollRecords.length} payslip(s) calculated with tax, PF, and net disbursements.`,
      actionLabel: 'View Run',
      href: '#/hr/payroll',
    })
  } else {
    dailyPriorities.push({
      id: 'p-payroll-pending',
      icon: WalletCards,
      tone: 'blue',
      title: `${currentMonth} Payroll Cycle`,
      detail: `Monthly salary calculation, PF, and statutory tax deductions ready to generate.`,
      actionLabel: 'Generate',
      href: '#/hr/payroll',
    })
  }

  // 4. Urgent Tasks / Late Attendance Exceptions
  if (urgentTasks.length > 0) {
    const firstTask = urgentTasks[0]
    dailyPriorities.push({
      id: 'p-task',
      icon: Zap,
      tone: 'coral',
      title: `Urgent Task: ${firstTask.title}`,
      detail: `Assigned to ${firstTask.assigneeName || 'HR'} due ${firstTask.dueDate || 'today'} (${firstTask.category || 'Operations'}).`,
      actionLabel: 'Open',
      href: '#/hr/tasks',
    })
  } else if (lateAttendance > 0) {
    dailyPriorities.push({
      id: 'p-late',
      icon: Clock3,
      tone: 'gold',
      title: `${lateAttendance} Shift Exceptions Today`,
      detail: `Employees marked late outside the grace threshold. Review check-in alerts.`,
      actionLabel: 'Attendance',
      href: '#/hr/attendance',
    })
  }

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? 'Executive Administration' : 'Enterprise HR Operations'}
        title={`${getTimeOfDayGreeting()}, ${isAdmin ? 'Admin' : 'HR'} ${isAdmin ? '🛡️' : '✦'}`}
        description={
          isAdmin
            ? 'Centralized administration, user account provisioning, office Wi-Fi security parameters, and live workforce telemetry.'
            : 'Comprehensive workforce management, real-time presence verification, automated payroll, and employee self-service.'
        }
      >
        <Button as="a" href={isAdmin ? '#/admin/users' : '#/hr/people'}>
          <Users size={16} /> {isAdmin ? 'Manage System Users' : 'View Employee Directory'}
        </Button>
      </PageHeader>

      <section className="overview-hero">
        <div className="hero-card main-hero">
          <div className="hero-card-header">
            <div>
              <p className="section-kicker">Operational Health</p>
              <h2>Workforce Overview & Stability</h2>
            </div>
            <StatusBadge tone="info">Live Sync</StatusBadge>
          </div>
          {/* REAL-TIME WORKFORCE ATTENDANCE TELEMETRY */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', margin: '20px 0 16px' }}>
            {/* Active Personnel */}
            <div style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Active Personnel</span>
                <Users size={14} style={{ color: 'var(--primary)' }} />
              </div>
              <strong style={{ font: '700 28px "Space Grotesk", sans-serif', color: 'var(--foreground)', lineHeight: 1.1 }}>{activeEmployees}</strong>
              <small style={{ fontSize: '11px', color: 'var(--muted)' }}>Registered staff</small>
            </div>

            {/* Punched In */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Punched In</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#059669', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Live
                </span>
              </div>
              <strong style={{ font: '700 28px "Space Grotesk", sans-serif', color: '#047857', lineHeight: 1.1 }}>{punchedInCount}</strong>
              <small style={{ fontSize: '11px', color: '#059669' }}>Working on-site now</small>
            </div>

            {/* Punched Out */}
            <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Punched Out</span>
                <CheckCircle2 size={14} style={{ color: '#0284c7' }} />
              </div>
              <strong style={{ font: '700 28px "Space Grotesk", sans-serif', color: '#0369a1', lineHeight: 1.1 }}>{punchedOutCount}</strong>
              <small style={{ fontSize: '11px', color: '#0284c7' }}>Shift completed today</small>
            </div>

            {/* Not Checked In */}
            <div style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Not Checked In</span>
                <Clock3 size={14} style={{ color: 'var(--muted)' }} />
              </div>
              <strong style={{ font: '700 28px "Space Grotesk", sans-serif', color: 'var(--muted)', lineHeight: 1.1 }}>{notPunchedInCount}</strong>
              <small style={{ fontSize: '11px', color: 'var(--muted)' }}>Pending punch or off</small>
            </div>
          </div>

          <div className="mini-bars" aria-label="Department health chart">
            {[78, 88, 92, 85, 90, 94, 96].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="hero-footnote">
            <span>
              <CheckCircle2 size={13} /> Wi-Fi Attendance Verification Active
            </span>
            <span>
              <TrendingUp size={13} /> {punchedInCount + punchedOutCount} / {activeEmployees} Punched Today ({activeEmployees > 0 ? Math.round(((punchedInCount + punchedOutCount) / activeEmployees) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="hero-stack">
          <LiveClockWidget storeState={storeState} />

          <div className="hero-card compact-card accent">
            <div className="compact-icon">
              <Clock3 size={16} />
            </div>
            <div>
              <span className="card-label">Office Wi-Fi Presence</span>
              <strong>Edufyi-Office-5G</strong>
              <small>Auto-verified device attendance</small>
            </div>
          </div>

          <div className="hero-card compact-card neutral">
            <div className="compact-icon">
              <CalendarDays size={16} />
            </div>
            <div>
              <span className="card-label">Leave Approvals</span>
              <strong>{pendingLeaves} Actionable</strong>
              <small>Click to review and approve</small>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="metric-grid" aria-label="HR dashboard summary">
        {metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} user={user} />
        ))}
      </section>

      {/* Interactive Charts & Action Board */}
      <DashboardWidgets storeState={storeState} />

      {/* Focus & Priority Section */}
      <section className="advanced-grid">
        <div className="panel insight-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">HR Operational Focus</p>
              <h2>Daily HR Priorities</h2>
            </div>
            <StatusBadge tone="neutral">Today</StatusBadge>
          </div>
          <div className="focus-list">
            {dailyPriorities.slice(0, 4).map((item) => {
              const IconComp = item.icon
              return (
                <div key={item.id} className="focus-row">
                  <div className={`focus-icon ${item.tone}`}>
                    <IconComp size={14} />
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <button type="button" onClick={() => (window.location.hash = item.href)}>
                    {item.actionLabel}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel action-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Live Feed</p>
              <h2>Recent System Audit</h2>
            </div>
            <StatusBadge tone="info">Live Stream</StatusBadge>
          </div>
          <ul className="priority-list">
            {(storeState.auditLogs || []).slice(0, 4).map((log) => (
              <li key={log.id}>
                <span className="dot teal" />
                <div style={{ flex: 1 }}>
                  <strong>{log.actor}: </strong>
                  <span style={{ fontSize: '10px' }}>{log.details}</span>
                </div>
                <small style={{ color: 'var(--muted)', fontSize: '9px' }}>{log.timestamp.split(' ')[1]}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quick shortcuts */}
      <section className="panel quick-links-panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Quick Navigation</p>
            <h2>All HR Panel Modules</h2>
          </div>
          <LayoutDashboard size={18} className="muted-icon" />
        </div>
        <div className="quick-links" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '14px' }}>
          <a href="#/hr/people">
            <Users size={16} /> <span>Employee Directory & Onboarding</span> <ArrowUpRight size={14} />
          </a>
          <a href="#/hr/attendance">
            <Clock3 size={16} /> <span>Attendance & Wi-Fi Tracking</span> <ArrowUpRight size={14} />
          </a>
          <a href="#/hr/leave">
            <CalendarDays size={16} /> <span>Leave Approvals & Calendar</span> <ArrowUpRight size={14} />
          </a>
          <a href="#/hr/payroll">
            <WalletCards size={16} /> <span>Payroll & Payslip Generator</span> <ArrowUpRight size={14} />
          </a>
          <a href="#/hr/recruitment">
            <BriefcaseBusiness size={16} /> <span>Recruitment & Referrals</span> <ArrowUpRight size={14} />
          </a>
          <a href="#/hr/performance">
            <Sparkles size={16} /> <span>Performance & OKRs</span> <ArrowUpRight size={14} />
          </a>
          <a href="#/hr/tasks">
            <FileText size={16} /> <span>Task Delegation Board</span> <ArrowUpRight size={14} />
          </a>
          <a href="#/hr/learning">
            <Sparkles size={16} /> <span>Training & Certifications</span> <ArrowUpRight size={14} />
          </a>
          <a href="#/hr/helpdesk">
            <CircleHelp size={16} /> <span>Employee Help Desk</span> <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
    </>
  )
}
