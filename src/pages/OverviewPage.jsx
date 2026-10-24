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
  Zap,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { hasPermission } from '../auth/permissions'
import { findRoute } from '../app/routes'
import { hrStore } from '../services/hrStore'
import { Button, PageHeader, StatusBadge } from '../components/ui'
import { getTimeOfDayGreeting } from '../utils/greeting'
import { todayKey } from '../services/connectedStore'

const metricIcons = {
  activeHeadcount: Users,
  onLeaveToday: CalendarDays,
  pendingLeave: CalendarDays,
  attendanceExceptions: Clock3,
  upcomingHolidays: CalendarDays,
  openHelpdeskTickets: CircleHelp,
}

const metricTones = {
  activeHeadcount: 'teal',
  onLeaveToday: 'coral',
  pendingLeave: 'gold',
  attendanceExceptions: 'blue',
  upcomingHolidays: 'gold',
  openHelpdeskTickets: 'teal',
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
  const lateAttendance = storeState.attendance.filter((a) => a.date === todayKey() && a.status === 'late').length
  const onLeaveToday = new Set(storeState.leaves.filter((leave) => leave.status === 'approved' && leave.startDate <= todayKey() && leave.endDate >= todayKey()).map((leave) => leave.employeeId)).size
  const openTickets = (storeState.tickets || []).filter((t) => (t.status || 'open') !== 'resolved' && t.status !== 'closed').length
  const upcomingHolidays = storeState.holidays.length

  const metrics = [
    { key: 'activeHeadcount', label: 'Active headcount', value: `${activeEmployees} Staff`, detail: 'Full-time & contracted', href: '/hr/people' },
    { key: 'onLeaveToday', label: 'On leave today', value: `${onLeaveToday} Out`, detail: 'Scheduled absence', href: '/hr/leave' },
    { key: 'pendingLeave', label: 'Pending leave requests', value: `${pendingLeaves} Requests`, detail: 'Needs HR approval', href: '/hr/leave' },
    { key: 'attendanceExceptions', label: 'Attendance exceptions', value: `${lateAttendance} Late`, detail: 'Grace period flagged', href: '/hr/attendance' },
    { key: 'upcomingHolidays', label: 'Upcoming holidays', value: `${upcomingHolidays} Days`, detail: 'Next: Oct 2 Gandhi Jayanti', href: '/hr/holidays' },
    { key: 'openHelpdeskTickets', label: 'Open help-desk tickets', value: `${openTickets} Tickets`, detail: 'IT & Payroll queries', href: '/hr/helpdesk' },
  ]

  const isAdmin = user?.role === 'admin'

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
          <div className="hero-main-metric">
            <div>
              <span>Active Personnel In System</span>
              <strong>{activeEmployees}</strong>
            </div>
            <div className="trend-chip">
              <TrendingUp size={14} /> 100% System Operational
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
              <Sparkles size={13} /> Payroll Ready for Disbursement
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
            <div className="focus-row">
              <div className="focus-icon teal">
                <Users size={14} />
              </div>
              <div>
                <strong>Employee Onboarding</strong>
                <span>David Kim (DevOps) completed 2 of 4 onboarding milestones.</span>
              </div>
              <button type="button" onClick={() => (window.location.hash = '#/hr/people')}>
                Review
              </button>
            </div>

            <div className="focus-row">
              <div className="focus-icon coral">
                <CalendarDays size={14} />
              </div>
              <div>
                <strong>Pending Leave Reviews</strong>
                <span>{pendingLeaves} employee leave requests awaiting final HR approval.</span>
              </div>
              <button type="button" onClick={() => (window.location.hash = '#/hr/leave')}>
                Approve
              </button>
            </div>

            <div className="focus-row">
              <div className="focus-icon blue">
                <WalletCards size={14} />
              </div>
              <div>
                <strong>September Payroll Calculation</strong>
                <span>Monthly salary breakup, PF & tax calculations generated.</span>
              </div>
              <button type="button" onClick={() => (window.location.hash = '#/hr/payroll')}>
                Generate
              </button>
            </div>
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
