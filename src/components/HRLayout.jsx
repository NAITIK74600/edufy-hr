import React, { useEffect, useRef, useState } from 'react'
import {
  Network,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Clock3,
  FileBarChart,
  FileText,
  FolderOpen,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MoreHorizontal,
  Plus,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  WalletCards,
  X,
  Volume2,
  VolumeX,
  Receipt,
  LifeBuoy,
  BellRing,
  KeyRound,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { adminRoutes, hrRoutes, employeeRoutes } from '../app/routes'
import { useAuth } from '../auth/AuthContext'
import { hasPermission } from '../auth/permissions'
import { hrStore } from '../services/hrStore'
import { workspaceAction } from '../services/workspaceStore'
import { getTimeOfDayGreeting, getRoleBadgeLabel, resolveUserDisplayName } from '../utils/greeting'
import { apiClient } from '../services/apiClient'
import { AIHRAssistant } from './AIHRAssistant'
import { isSoundMuted, toggleSoundMuted, playNotificationSound } from '../utils/soundHelper'
import { ChangePasswordModal } from './ChangePasswordModal'


class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('RouteErrorBoundary caught:', error, errorInfo)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="panel" style={{ padding: '32px', textAlign: 'center', margin: '24px auto', maxWidth: '640px', borderLeft: '4px solid #cb3a31' }}>
          <h2 style={{ color: '#cb3a31', fontSize: '18px', marginBottom: '8px' }}>Module Render Notice</h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
            {this.state.error?.message || 'An error occurred during page rendering.'}
          </p>
          <button
            type="button"
            className="ui-button primary"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Refresh and Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const icons = {
  'Org Hierarchy': Network,
  'Admin Overview': ShieldCheck,
  'User Management': Users,
  'Role & Access': ShieldCheck,
  'System Configuration': Settings2,
  'Reports & Analytics': FileBarChart,
  'System Maintenance': Settings2,
  'Daily Work Report': FileBarChart,
  'Training Portal': BookOpen,
  'Support Help Desk': Ticket,
  'Holiday Calendar': CalendarDays,
  'Rewards & Recognition': Sparkles,
  'Notifications': Bell,
  'Expense Claims': WalletCards,
  'My Team': Users,
  'Team Approvals': UserCheck,
  Overview: LayoutDashboard,
  'Admin Overview': ShieldCheck,
  'User Management': Users,
  'Role & Access': ShieldCheck,
  Departments: Building,
  'Company Settings': Settings2,
  'Reports & Analytics': FileBarChart,
  'System Configuration': Settings2,
  People: Users,
  Attendance: Clock3,
  Leave: CalendarDays,
  'Payroll & Salary': WalletCards,
  Payroll: WalletCards,
  Recruitment: UserPlus,
  Performance: Target,
  'Task Management': FileText,
  Tasks: FileText,
  'Training & Learning': BookOpen,
  Learning: BookOpen,
  'Help Desk': Ticket,
  'Help desk': Ticket,
  Announcements: Megaphone,
  'Holiday Calendar': CalendarDays,
  'Holiday calendar': CalendarDays,
  'Org Hierarchy': Network,
  'Company Documents': FolderOpen,
  'Company documents': FolderOpen,
  'Company Policy': ShieldCheck,
  'Company policy': ShieldCheck,
  'Company Policies': ShieldCheck,
  'Company policies': ShieldCheck,
  'HR Settings': Settings2,
  'HR settings': Settings2,
  'ESS Dashboard': LayoutDashboard,
  'My Attendance': Clock3,
  'My Leave': CalendarDays,
  'Team Approvals': UserCheck,
  'My Salary & Payslip': WalletCards,
  'My Profile': Users,
  'My Tasks': FileText,
  'Daily Work Report': FileBarChart,
  'Training Portal': BookOpen,
  'Support Help Desk': Ticket,
  'Rewards & Recognition': Sparkles,
  'Expense Claims': WalletCards,
  'My Performance': Target,
  'Team Approvals': UserCheck,
  'My Team': Users,
  'Company Documents': FolderOpen,
}

export function HRLayout({ route, children }) {
  const { user, logout, updateUser } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [photoNotice, setPhotoNotice] = useState(false)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [soundMuted, setSoundMutedState] = useState(() => isSoundMuted())
  const [incomingAlert, setIncomingAlert] = useState(null)
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [notifications, setNotifications] = useState(() => (hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : hrStore.getNotifications()))
  const navRef = useRef(null)
  const fileInputRef = useRef(null)
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const prevNotifIdsRef = useRef(new Set())
  const isFirstLoadRef = useRef(true)

  useEffect(() => {
    return hrStore.subscribe((state) => {
      setStoreState(state)
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setNotifOpen(false)
    setProfileOpen(false)
  }, [route.path])

  useEffect(() => {
    if (!incomingAlert) return
    const timer = setTimeout(() => setIncomingAlert(null), 6000)
    return () => clearTimeout(timer)
  }, [incomingAlert])

  useEffect(() => {
    const initialList = hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : hrStore.getNotifications()
    setNotifications(initialList)
    const initialUnread = (initialList || []).filter((n) => !n.read)
    prevNotifIdsRef.current = new Set(initialUnread.map((n) => n.id))

    return hrStore.subscribe(() => {
      const fresh = hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : hrStore.getNotifications()
      setNotifications(fresh)
      const freshUnread = (fresh || []).filter((n) => !n.read)
      const newArrivals = freshUnread.filter((n) => !prevNotifIdsRef.current.has(n.id))

      if (newArrivals.length > 0 && !isFirstLoadRef.current) {
        // Trigger notification bell chime sound
        try {
          playNotificationSound('notification')
        } catch (err) {
          console.debug('Sound error:', err)
        }
        // Trigger visual floating banner alert
        setIncomingAlert(newArrivals[0])
      }
      isFirstLoadRef.current = false
      prevNotifIdsRef.current = new Set(freshUnread.map((n) => n.id))
    })
  }, [user])

  function resolveNotificationRoute(n) {
    if (!n) return `#/${isAdmin ? 'admin' : (isHR ? 'hr' : 'employee')}`
    const portal = isAdmin ? 'admin' : (isHR ? 'hr' : 'employee')

    // 1. Explicit link/path provided
    const direct = n.link || n.url || n.path || n.route || n.targetUrl || n.target
    if (direct && typeof direct === 'string') {
      if (direct.startsWith('#')) return direct
      if (direct.startsWith('/')) return `#${direct}`
      return `#/${direct}`
    }

    const type = (n.type || '').toLowerCase()
    const title = (n.title || '').toLowerCase()
    const msg = (n.message || '').toLowerCase()
    const text = `${type} ${title} ${msg}`

    // 2. Salary & Payroll
    if (type === 'salary' || text.includes('salary') || text.includes('payslip') || text.includes('payroll') || text.includes('wage') || text.includes('disbursement')) {
      return portal === 'employee' ? '#/employee/salary' : `#/${portal}/payroll`
    }

    // 3. Team approvals (manager view)
    if (portal === 'employee' && (type === 'team_leave' || text.includes('team lead leave') || text.includes('manager approval') || text.includes('approval request') || n.metadata?.type === 'approval_request')) {
      return '#/employee/team-leave'
    }

    // 4. Leave
    if (type === 'leave' || type === 'leave_hr' || text.includes('leave') || text.includes('vacation') || text.includes('sick leave')) {
      return `#/${portal}/leave`
    }

    // 5. Attendance & Punch
    if (type === 'attendance' || text.includes('attendance') || text.includes('punch') || text.includes('clock-in') || text.includes('check-in') || text.includes('geofence') || text.includes('shift')) {
      return `#/${portal}/attendance`
    }

    // 6. Tasks & Daily Reports
    if (text.includes('daily report') || text.includes('standup') || text.includes('work report')) {
      return portal === 'employee' ? '#/employee/daily-report' : (isAdmin ? '#/admin/reports' : '#/hr/reports')
    }
    if (type === 'task' || type === 'tasks' || text.includes('task') || text.includes('todo') || text.includes('assignment')) {
      return `#/${portal}/tasks`
    }

    // 7. Announcements & Broadcasts
    if (type === 'announcement' || text.includes('announcement') || text.includes('broadcast')) {
      return `#/${portal}/announcements`
    }

    // 8. Helpdesk & Support Tickets
    if (type === 'ticket' || type === 'tickets' || type === 'helpdesk' || text.includes('ticket') || text.includes('support ticket') || text.includes('help desk')) {
      return `#/${portal}/helpdesk`
    }

    // 9. Expenses
    if (type === 'expense' || type === 'expenses' || text.includes('expense') || text.includes('reimbursement')) {
      return portal === 'employee' ? '#/employee/expenses' : (isAdmin ? '#/admin/reports' : '#/hr/reports')
    }

    // 10. Training & Learning Courses
    if (type === 'training' || type === 'learning' || type === 'course' || text.includes('training') || text.includes('course') || text.includes('certificate') || text.includes('quiz')) {
      return portal === 'employee' ? '#/employee/training' : `#/${portal}/learning`
    }

    // 11. Performance & Appraisals
    if (type === 'performance' || text.includes('performance') || text.includes('appraisal') || text.includes('kpi') || text.includes('okr')) {
      return `#/${portal}/performance`
    }

    // 12. Onboarding & People
    if (type.startsWith('onboarding') || text.includes('onboarding') || text.includes('employee profile')) {
      return portal === 'employee' ? '#/employee/profile' : `#/${portal}/people`
    }

    // 13. Policies & Handbooks
    if (type === 'document' || type === 'policy' || type === 'policies' || text.includes('policy') || text.includes('handbook') || text.includes('nda')) {
      return `#/${portal}/policies`
    }

    // 14. Holidays
    if (type === 'holiday' || type === 'holidays' || text.includes('holiday')) {
      return `#/${portal}/holidays`
    }

    // 15. User accounts & Credentials
    if (type === 'user' || type === 'users' || text.includes('account created') || text.includes('credential')) {
      return portal === 'employee' ? '#/employee/profile' : `#/${portal}/users`
    }

    // 16. Fallback to Notifications Center
    return `#/${portal}/notifications`
  }

  function handleNotificationNavigation(n) {
    const targetHash = resolveNotificationRoute(n)
    if (targetHash) {
      if (window.location.hash === targetHash) {
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      } else {
        window.location.hash = targetHash
      }
    }
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target.result
      if (dataUrl) {
        try {
          if (hrStore.updateMyAvatar) {
            await hrStore.updateMyAvatar(dataUrl)
          } else {
            await apiClient.patch('/employees/me/avatar', { avatarUrl: dataUrl })
          }
        } catch (err) {
          console.warn('Failed to persist profile picture to database:', err.message)
        }
        if (updateUser) updateUser({ avatarUrl: dataUrl })
        setPhotoNotice(true)
        setTimeout(() => setPhotoNotice(false), 3500)
      }
    }
    reader.readAsDataURL(file)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // STRICT ROLE-BASED: Each role sees ONLY their own portal
  const isAdmin = user?.role === 'admin'
  const isHR = user?.role === 'hr'
  const isManager = user?.role === 'manager'
  const isEmployee = user?.role === 'employee'

  const portalClass = isAdmin ? 'portal-theme-admin' : (isHR ? 'portal-theme-hr' : 'portal-theme-employee')
  const dashboardHref = isAdmin ? '#/admin' : (isHR ? '#/hr' : '#/employee')
  const portalLabel = isAdmin ? 'System Admin Console' : (isHR ? 'HR People Operations' : 'Employee Self-Service')
  const portalPillLabel = isAdmin ? 'Admin Console' : (isHR ? 'HR Operations' : 'ESS Portal')
  const activeRoutes = isAdmin ? adminRoutes : (isHR ? hrRoutes : employeeRoutes)
  const visibleRoutes = activeRoutes.filter((item) => !item.permission || hasPermission(user, item.permission))

  // Group names present in visible routes
  const groups = [...new Set(visibleRoutes.map((r) => r.group))]

  const mobileBottomNavItems = React.useMemo(() => {
    if (isAdmin) {
      return [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/roles', label: 'Roles', icon: ShieldCheck },
        { path: '/admin/hierarchy', label: 'Hierarchy', icon: Network },
        { path: '/admin/settings', label: 'Settings', icon: Settings2 },
      ]
    }
    if (isHR) {
      return [
        { path: '/hr', label: 'Overview', icon: LayoutDashboard },
        { path: '/hr/people', label: 'People', icon: Users },
        { path: '/hr/attendance', label: 'Attendance', icon: Clock3 },
        { path: '/hr/leave', label: 'Leaves', icon: CalendarDays },
        { path: '/hr/hierarchy', label: 'Hierarchy', icon: Network },
      ]
    }
    return [
      { path: '/employee', label: 'Home', icon: Home },
      { path: '/employee/attendance', label: 'Attendance', icon: Clock3 },
      { path: '/employee/leave', label: 'Leave', icon: CalendarDays },
      { path: isManager ? '/employee/team-leave' : '/employee/tasks', label: isManager ? 'Team' : 'Tasks', icon: isManager ? UserCheck : Target },
      { path: '/employee/profile', label: 'Profile', icon: User },
    ]
  }, [isAdmin, isHR, isManager])

  async function handleLogout() {
    await logout()
  }

  return (
    <div className={`app-shell ${portalClass}`}>

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-row">
            <a
              href={dashboardHref}
              className="brand-link"
              title="Go to Dashboard"
              onClick={(e) => {
                e.preventDefault()
                window.location.hash = dashboardHref
              }}
            >
              <img
                className="brand-wordmark"
                src="/elythra-edufyitech-logo.png"
                alt="Elythra EdufyiTech"
              />
            </a>
            <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
              <X size={18} />
            </button>
          </div>

          {/* ROLE INDICATOR - No portal switching, strict role isolation */}
          <div style={{ padding: '0 16px 14px 16px' }}>
            <div className={`role-indicator-box role-indicator-${user?.role || 'employee'}`}>
              {isAdmin && (
                <>
                  <ShieldCheck size={13} />
                  <span>Administrator Access</span>
                </>
              )}
              {isHR && (
                <>
                  <Users size={13} />
                  <span>HR Operations Access</span>
                </>
              )}
              {isManager && (
                <>
                  <UserCheck size={13} />
                  <span>Manager Access</span>
                </>
              )}
              {isEmployee && (
                <>
                  <UserCheck size={13} />
                  <span>Employee Self-Service</span>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="nav-area" aria-label="Primary navigation" ref={navRef}>
          {groups.map((group) => {
            const groupRoutes = visibleRoutes.filter((item) => item.group === group)
            if (groupRoutes.length === 0) return null
            return (
              <div key={group} className="nav-group">
                <span className="nav-group-title">{group}</span>
                {groupRoutes.map((item) => {
                  const Icon = icons[item.label] || icons[item.group] || LayoutDashboard
                  const active = route.path === item.path
                  return (
                    <a
                      key={item.path}
                      href={`#${item.path}`}
                      className={`nav-item ${active ? 'active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </a>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {!isAdmin && (
          <div className="sidebar-bottom">
            <a
              className="nav-item"
              href={isHR ? '#/hr/helpdesk' : '#/employee/helpdesk'}
              onClick={() => setMobileOpen(false)}
            >
              <CircleHelp size={16} />
              <span>Help & Support</span>
            </a>
          </div>
        )}
      </aside>

      {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-trigger" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            {isAdmin ? (
              <span className="topbar-portal-indicator admin">
                <ShieldCheck size={13} />
                <span>Admin Console</span>
              </span>
            ) : isHR ? (
              <span className="topbar-portal-indicator hr">
                <Users size={13} />
                <span>HR Operations</span>
              </span>
            ) : (
              <span className="topbar-portal-indicator ess">
                <UserCheck size={13} />
                <span>Employee Workspace</span>
              </span>
            )}
            <span className="slash">/</span>
            <a href={dashboardHref} onClick={(e) => { e.preventDefault(); window.location.hash = dashboardHref; }} style={{ color: "inherit", textDecoration: "none" }} title="Go to Dashboard">Edufyi</a>
            <span className="slash">/</span>
            <span>{route.group || 'HR Hub'}</span>
            <span className="slash">/</span>
            <strong>{route.label}</strong>
          </div>

          <div className="topbar-actions">
            {/* Personalized Greeting with Role-Based Title */}
            <div className="topbar-greeting-pill" title={`Logged in as ${isAdmin ? 'Admin' : isHR ? 'HR' : resolveUserDisplayName(user, storeState?.employees || [])} (${user?.role})`}>
              <span className="greeting-sparkle">👋</span>
              <span className="greeting-text">
                {getTimeOfDayGreeting()},{' '}
                <strong className="greeting-name">{isAdmin ? 'Admin' : isHR ? 'HR' : resolveUserDisplayName(user, storeState?.employees || [])}</strong>
              </span>
              <span className={`role-badge role-${user?.role ?? 'hr'}`}>
                {isAdmin ? 'Admin' : isHR ? 'HR' : getRoleBadgeLabel(user?.role)}
              </span>
            </div>

            {/* AI Assistant Launch Button - Role Aware */}
            <button
              className="ai-copilot-btn"
              type="button"
              onClick={() => setAiAssistantOpen(true)}
              title={isAdmin ? 'Open AI Admin Copilot' : (isHR ? 'Open AI HR Copilot' : 'Open AI Copilot')}
            >
              <Sparkles size={14} />
              <span>{isAdmin ? 'AI Admin Copilot' : (isHR ? 'AI HR Copilot' : 'AI Copilot')}</span>
            </button>

            {/* Notifications Button with Badge */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                className={`topbar-badge-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setNotifOpen((prev) => !prev)
                  setProfileOpen(false)
                }}
                aria-label="View notifications"
                title={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
              >
                <Bell size={18} className={unreadCount > 0 ? 'bell-icon-pulse' : ''} />
                {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
              </button>

              {/* Notifications Popover */}
              {notifOpen && (
                <div className="notif-popover" style={{ width: '360px', maxHeight: '480px', display: 'flex', flexDirection: 'column' }}>
                  <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                    <strong style={{ fontSize: '13px' }}>Notifications ({unreadCount} new)</strong>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        style={{
                          border: '1px solid var(--border, #e2e8f0)',
                          background: soundMuted ? '#f1f5f9' : '#ecfdf5',
                          color: soundMuted ? '#64748b' : '#047857',
                          fontSize: '10.5px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 7px',
                          borderRadius: '6px',
                        }}
                        title={soundMuted ? 'Notification chime muted (Click to unmute)' : 'Notification chime enabled (Click to mute)'}
                        onClick={() => {
                          const nextState = toggleSoundMuted()
                          setSoundMutedState(nextState)
                          if (!nextState) playNotificationSound('notification')
                        }}
                      >
                        {soundMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        <span>{soundMuted ? 'Muted' : 'Sound'}</span>
                      </button>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          style={{ border: 0, background: 'transparent', color: 'var(--teal)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                          onClick={workspaceAction(hrStore, () => hrStore.markAllNotificationsRead())}
                        >
                          Mark read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          style={{ border: 0, background: 'transparent', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                          onClick={workspaceAction(hrStore, () => hrStore.clearAllNotifications())}
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="notif-list" style={{ flex: 1, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ padding: '24px 16px', color: 'var(--muted)', textAlign: 'center', fontSize: '12px' }}>
                        No notifications right now.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.read ? 'unread' : ''}`}
                          style={{ cursor: 'pointer', position: 'relative' }}
                          onClick={() => {
                            hrStore.markNotificationRead(n.id)
                            handleNotificationNavigation(n)
                            setNotifOpen(false)
                          }}
                        >
                          <div className={`notif-item-icon ${n.type || 'leave'}`}>
                            {n.type === 'salary' ? <WalletCards size={14} /> :
                             n.type === 'announcement' ? <Megaphone size={14} /> :
                             n.type?.startsWith('onboarding') ? <ShieldCheck size={14} /> :
                             (n.type === 'expense' || n.type === 'expenses') ? <Receipt size={14} /> :
                             (n.type === 'ticket' || n.type === 'tickets' || n.type === 'helpdesk') ? <CircleHelp size={14} /> :
                             <CalendarDays size={14} />}
                          </div>
                          <div className="notif-item-copy" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong>{n.title}</strong>
                              <button
                                type="button"
                                title="Dismiss notification"
                                style={{ border: 0, background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', padding: '2px 4px' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  hrStore.deleteNotification(n.id)
                                }}
                              >
                                ✕
                              </button>
                            </div>
                            <p>{n.message}</p>
                            <small>{n.time}</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', textAlign: 'center', background: '#f8fafc' }}>
                    <a
                      href={`#/${isAdmin ? 'admin' : (isHR ? 'hr' : 'employee')}/notifications`}
                      onClick={() => setNotifOpen(false)}
                      style={{ fontSize: '11px', fontWeight: 600, color: 'var(--teal)', textDecoration: 'none' }}
                    >
                      View All in Notifications Center →
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="status-strip">
              <span className="status-dot" /> Operational
            </div>

            {/* Topbar Logout / Account Controls */}
            {isAdmin || isHR ? (
              <button
                type="button"
                className="topbar-direct-logout-btn"
                onClick={handleLogout}
                title="Sign out of workspace"
                aria-label="Sign out of workspace"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            ) : (
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  className="topbar-profile-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setProfileOpen((prev) => !prev)
                    setNotifOpen(false)
                  }}
                  aria-label="Open account menu"
                  title={`${user?.displayName} (${user?.role})`}
                >
                  <div className="profile-avatar-box">
                    <img
                      src={user?.avatarUrl || '/avatar.jpg'}
                      alt={user?.displayName || 'User'}
                      className="user-profile-img sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'grid'
                        }
                      }}
                    />
                    <div
                      className={`avatar avatar-${user?.avatarTone ?? 'teal'}`}
                      style={{ display: 'none', width: '28px', height: '28px', fontSize: '10px' }}
                    >
                      {user?.displayName?.slice(0, 2).toUpperCase() ?? 'HR'}
                    </div>
                    <span className="profile-online-badge" />
                  </div>
                  <ChevronDown size={14} className="muted-icon" />
                </button>

                {profileOpen && (
                  <div className="profile-menu-popover">
                    <div className="profile-popover-header">
                      <div className="profile-avatar-box" style={{ position: 'relative' }}>
                        <img
                          src={user?.avatarUrl || '/avatar.jpg'}
                          alt={user?.displayName || 'User'}
                          className="user-profile-img lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'grid'
                            }
                          }}
                        />
                        <div
                          className={`avatar avatar-${user?.avatarTone ?? 'teal'}`}
                          style={{ display: 'none', width: '64px', height: '64px', fontSize: '18px' }}
                        >
                          {user?.displayName?.slice(0, 2).toUpperCase() ?? 'HR'}
                        </div>
                        <span className="profile-online-badge lg" title="Active & Online" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: '14px' }}>{user?.displayName}</strong>
                        <span className="profile-popover-email">{user?.email}</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
                          <span className={`role-badge role-${user?.role}`}>
                            {getRoleBadgeLabel(user?.role)}
                          </span>
                          <span style={{ fontSize: '9px', color: 'var(--teal)', fontWeight: '600' }}>● Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="profile-popover-body">
                      {/* Photo upload / avatar picker section */}
                      <div style={{ padding: '8px 10px', background: '#f5f8f7', borderRadius: '8px', border: '1px solid rgba(29, 138, 122, 0.15)', display: 'grid', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--ink)' }}>Profile Photo</span>
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handlePhotoUpload}
                          />
                          <button
                            type="button"
                            className="profile-photo-change-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload new profile picture"
                          >
                            <Camera size={12} />
                            <span>Change Photo</span>
                          </button>
                        </div>

                        {photoNotice && (
                          <div style={{ fontSize: '9px', color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Profile photo updated successfully!
                          </div>
                        )}
                      </div>

                      <div className="profile-detail-row">
                        <span>Employee ID</span>
                        <strong>{user?.employeeId || 'EDU-EMP-001'}</strong>
                      </div>
                      <div className="profile-detail-row">
                        <span>Department</span>
                        <strong>{user?.department || 'People Operations'}</strong>
                      </div>
                      <div className="profile-detail-row">
                        <span>Designation</span>
                        <strong>{user?.designation || 'Head of People Operations'}</strong>
                      </div>
                      <div className="profile-detail-row">
                        <span>Assigned Shift</span>
                        <strong>{(() => {
                          const r = storeState?.companySettings?.attendanceRules
                          if (r?.workStartTime && r?.workEndTime) {
                            const f12 = (t, referenceTime = null, isEnd = false) => {
                              const clean = String(t || '').trim().replace(/[\u202F\u00A0]/g, ' ')
                              const m = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
                              if (!m) return t
                              let h = parseInt(m[1], 10)
                              const min = m[2]
                              const meridiem = m[3]?.toUpperCase()
                              if (meridiem === 'PM' && h < 12) h += 12
                              if (meridiem === 'AM' && h === 12) h = 0
                              if (!meridiem && isEnd && h >= 1 && h <= 11) h += 12
                              else if (!meridiem && !isEnd && referenceTime) {
                                const refClean = String(referenceTime).trim().replace(/[\u202F\u00A0]/g, ' ')
                                const refMatch = refClean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
                                if (refMatch) {
                                  let rh = parseInt(refMatch[1], 10)
                                  if (refMatch[3]?.toUpperCase() === 'PM' && rh < 12) rh += 12
                                  if (rh >= 13 && h < 12 && (rh - h) > 8 && (h + 12) < rh + 2) h += 12
                                }
                              }
                              const ampm = h >= 12 ? 'PM' : 'AM'
                              h = h % 12 || 12
                              return `${String(h).padStart(2, '0')}:${min} ${ampm}`
                            }
                            return `General (${f12(r.workStartTime, r.workEndTime, false)} – ${f12(r.workEndTime, r.workStartTime, true)})`
                          }
                          return 'General (11:00 AM – 08:00 PM)'
                        })()}</strong>
                      </div>

                      <div className="profile-role-notice">
                        <ShieldCheck size={14} />
                        <span>Authorized Employee session • Self-Service Portal</span>
                      </div>

                      <button
                        type="button"
                        className="profile-photo-change-btn"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '7px 10px', background: '#ffffff', border: '1px solid var(--border)' }}
                        onClick={() => {
                          setProfileOpen(false)
                          setChangePasswordOpen(true)
                        }}
                      >
                        <KeyRound size={13} style={{ color: 'var(--teal)' }} />
                        <span>Change Password</span>
                      </button>
                    </div>

                    <div className="profile-popover-footer">
                      <button type="button" className="popover-logout-btn" onClick={handleLogout}>
                        <LogOut size={14} /> Sign out of workspace
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Force Password Change on Auto-Generated / Temporary Password */}
        {user?.mustChangePassword && (
          <ChangePasswordModal isOpen={true} isForced={true} />
        )}

        {/* User-Triggered Change Password Modal */}
        {changePasswordOpen && (
          <ChangePasswordModal
            isOpen={true}
            isForced={false}
            onClose={() => setChangePasswordOpen(false)}
          />
        )}

        {/* Real-time Floating Notification Alert Toast */}
        <AnimatePresence>
          {incomingAlert && (
            <motion.div
              className="incoming-notif-toast"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={() => {
                hrStore.markNotificationRead(incomingAlert.id)
                handleNotificationNavigation(incomingAlert)
                setIncomingAlert(null)
              }}
              role="alert"
            >
              <div className="incoming-notif-bell-icon">
                <BellRing size={18} />
              </div>
              <div className="incoming-notif-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`role-badge notif-badge-${incomingAlert.type || 'info'}`} style={{ fontSize: '9px', textTransform: 'uppercase', padding: '1px 5px' }}>
                    {incomingAlert.type || 'Alert'}
                  </span>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>{incomingAlert.title}</strong>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#475569', lineHeight: 1.35 }}>{incomingAlert.message}</p>
                <span style={{ fontSize: '10px', color: 'var(--teal)', fontWeight: 600, display: 'inline-block', marginTop: '3px' }}>Click to view details →</span>
              </div>
              <button
                type="button"
                className="incoming-notif-close"
                onClick={(e) => {
                  e.stopPropagation()
                  setIncomingAlert(null)
                }}
                aria-label="Close alert"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="page-content">
          <RouteErrorBoundary resetKey={route?.path || 'default-route'}>
            <motion.div
              className="route-motion"
              key={route?.path || 'default-route'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </RouteErrorBoundary>

          <footer className="page-footer">
            <span>{isAdmin ? 'Edufyi Enterprise System Administration Console' : isHR ? 'Edufyi Enterprise People Operations Portal' : 'Edufyi Employee Self-Service Workspace'}</span>
            <span>
              Realtime Sync Active <i className="sync-dot" />
            </span>
          </footer>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
          {mobileBottomNavItems.map((item) => {
            const Icon = item.icon
            const active = route.path === item.path
            return (
              <a
                key={item.path}
                href={`#${item.path}`}
                className={`mobile-bottom-nav-item ${active ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <div className="mobile-bottom-nav-icon">
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </a>
            )
          })}
          <button
            type="button"
            className={`mobile-bottom-nav-item ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open Full Menu"
          >
            <div className="mobile-bottom-nav-icon">
              <Menu size={18} />
            </div>
            <span>Menu</span>
          </button>
        </nav>
      </main>

      {/* Embedded AI HR Assistant */}
      <AIHRAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </div>
  )
}
