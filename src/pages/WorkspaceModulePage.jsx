import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileBarChart,
  FileText,
  Filter,
  FolderOpen,
  Heart,
  HelpCircle,
  LocateFixed,
  MapPin,
  Megaphone,
  MessageSquare,
  Network,
  Plus,
  Printer,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  WalletCards,
  Wifi,
  X,
  Edit3,
  Copy,
  Calculator,
} from 'lucide-react'
import { Button, ConfirmationDialog, DataTable, EmptyState, Field, PageHeader, StatusBadge } from '../components/ui'
import { formatAttendanceNotes, getDailyAttendanceStatus, getLateCountInfo } from '../utils/attendanceUtils'
import { hrStore, storeAction } from '../services/hrStore'
import { workspaceAction } from '../services/workspaceStore'
import { PerformanceWorkspace, WorkspaceReports, WorkspaceNotifications } from '../components/WorkspaceRecords'
import { CompanyPoliciesView } from '../components/CompanyPoliciesView'
import { CompanyDocumentsView } from '../components/CompanyDocumentsView'
import { AdminUsersModule } from './AdminDashboardPage'
import { HolidayCalendarShowcase } from '../components/HolidayCalendarShowcase'
import { todayKey } from '../services/connectedStore'
import { useAuth } from '../auth/AuthContext'
import { formatINR, formatINRRaw, amountInWordsINR } from '../utils/currency'
const workspaceHandler = (handler) => workspaceAction(hrStore, handler)

function formatShiftDisplay(shiftStr, shiftCode, attendanceRules) {
  if (attendanceRules?.workStartTime && attendanceRules?.workEndTime) {
    const f12 = (t, isEnd = false) => {
      if (!t) return ''
      const clean = String(t).trim().replace(/[\u202F\u00A0]/g, ' ')
      const m = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
      if (!m) return t
      let h = parseInt(m[1], 10)
      const min = m[2]
      const meridiem = m[3]?.toUpperCase()
      if (meridiem === 'PM' && h < 12) h += 12
      if (meridiem === 'AM' && h === 12) h = 0
      if (!meridiem && isEnd && h >= 1 && h <= 11) h += 12
      const ampm = h >= 12 ? 'PM' : 'AM'
      h = h % 12 || 12
      return `${String(h).padStart(2, '0')}:${min} ${ampm}`
    }
    return `General (${f12(attendanceRules.workStartTime, false)} – ${f12(attendanceRules.workEndTime, true)})`
  }
  if (!shiftStr || shiftStr.includes('09:30')) {
    return 'General (11:00 AM – 08:00 PM)'
  }
  return shiftStr
}

// ==========================================
// 1. ATTENDANCE MANAGEMENT MODULE
// ==========================================
// ==========================================
// 1. ATTENDANCE MANAGEMENT MODULE
// ==========================================
function AttendanceModule() {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [activeTab, setActiveTab] = useState('roster') // 'roster' | 'summary' | 'wifi'
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showMarkModal, setShowMarkModal] = useState(false)
  const [markForm, setMarkForm] = useState({
    employeeId: '',
    date: todayKey(),
    status: 'present',
    checkIn: '09:15 AM',
    checkOut: '06:15 PM',
    wifiSSID: storeState.companySettings?.allowedWifiSSIDs?.[0] || 'Edufyi',
    notes: '',
  })

  const [editingAttendance, setEditingAttendance] = useState(null)
  const [attendanceToDelete, setAttendanceToDelete] = useState(null)
  const [newWifiSSID, setNewWifiSSID] = useState('')
  const branchLocations = storeState.companySettings?.locations || []
  const [hrWifiBranch, setHrWifiBranch] = useState(() => branchLocations[0]?.name || 'IGNITE CAMPUS')
  const [exportNotice, setExportNotice] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [feedbackNotice, setFeedbackNotice] = useState('')

  useEffect(() => {
    return hrStore.subscribe((state) => {
      setStoreState(state)
      const locs = state.companySettings?.locations || []
      if (locs.length > 0) {
        setHrWifiBranch((prev) => (!prev || prev === 'HQ - San Francisco' ? locs[0].name : prev))
      }
    })
  }, [])

  function showFeedback(msg) {
    setFeedbackNotice(msg)
    setTimeout(() => setFeedbackNotice(''), 4000)
  }

  const allAttendance = storeState.attendance || []
  const allEmployees = storeState.employees || []
  const wifiNetworks = storeState.companySettings?.wifiNetworks || []
  const maxGeofenceRadius = Number(storeState.companySettings?.attendanceRules?.maxGeofenceRadiusMeters) || 50
  const monthlyAttendance = allAttendance.filter((record) => record.date.startsWith(selectedDate.slice(0, 7)))
  const calendarDays = new Date(Number(selectedDate.slice(0, 4)), Number(selectedDate.slice(5, 7)), 0).getDate()

  // Filtered by selected date and search/status
  const dailyAttendance = allAttendance.filter((item) => {
    if (item.date !== selectedDate) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !item.employeeName?.toLowerCase().includes(q) &&
        !item.employeeId?.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    return true
  })

  // KPIs for the selected date
  const dayRecords = allAttendance.filter((a) => a.date === selectedDate)
  const presentCount = dayRecords.filter((a) => a.status === 'present').length
  const lateCount = dayRecords.filter((a) => a.status === 'late').length
  const halfDayCount = dayRecords.filter((a) => a.status === 'half-day').length
  const onLeaveCount = dayRecords.filter((a) => a.status === 'on-leave').length
  const absentCount = dayRecords.filter((a) => a.status === 'absent').length
  const totalRoster = allEmployees.length
  const attendanceRate = totalRoster
    ? Math.round(((presentCount + lateCount + halfDayCount * 0.5) / totalRoster) * 100)
    : 0

  // User's own attendance record for selected date
  const currentUserPunch = dayRecords.find(
    (a) => a.employeeId === user?.employeeId || a.employeeName === user?.displayName
  )

  const handleQuickCheckIn = storeAction(async () => {
    await hrStore.checkIn(
      user?.employeeId || 'EDU-HR-001',
      user?.displayName || 'HR',
      'Edufyi-Office-5G',
      selectedDate
    )
    showFeedback('Check-in saved by the server.')
  })

  const handleQuickCheckOut = storeAction(async () => {
    await hrStore.checkOut(
      user?.employeeId || 'EDU-HR-001',
      user?.displayName || 'HR',
      selectedDate
    )
    showFeedback('Check-out saved by the server.')
  })

  const handleSaveAttendance = storeAction(async (e) => {
    e.preventDefault()
    const emp = allEmployees.find(
      (e) => e.employeeId === markForm.employeeId || e.id === markForm.employeeId
    )
    if (!emp) return

    await hrStore.markAttendance({
      ...markForm,
      employeeName: emp.name,
      employeeId: emp.employeeId,
      date: markForm.date || selectedDate,
    })
    setShowMarkModal(false)
    setMarkForm({
      employeeId: '',
      date: selectedDate,
      status: 'present',
      checkIn: '09:15 AM',
      checkOut: '06:15 PM',
      wifiSSID: 'Edufyi-Office-5G',
      notes: '',
    })
    showFeedback(`Recorded attendance for ${emp.name} as ${markForm.status.toUpperCase()}.`)
  })

  const handleUpdateAttendance = storeAction(async (e) => {
    e.preventDefault()
    if (!editingAttendance) return
    const isNowPresent = editingAttendance.status === 'present'
    const isCheckOutCleared = !editingAttendance.checkOut || editingAttendance.checkOut.trim() === '' || editingAttendance.checkOut === '—'
    const payload = {
      ...editingAttendance,
      checkOut: isCheckOutCleared ? null : editingAttendance.checkOut,
      checkOutAt: isCheckOutCleared ? null : editingAttendance.checkOutAt,
      autoPunchOut: isCheckOutCleared ? false : Boolean(editingAttendance.autoPunchOut),
      punchOutReason: isCheckOutCleared ? '' : (editingAttendance.punchOutReason || ''),
      punchOutType: isCheckOutCleared ? 'manual' : (editingAttendance.punchOutType || 'manual'),
      isLate: isNowPresent ? false : Boolean(editingAttendance.isLate ?? (editingAttendance.status === 'late')),
      lateCount: isNowPresent ? 0 : (editingAttendance.lateCount || 0),
      isHalfDay: isNowPresent ? false : Boolean(editingAttendance.isHalfDay ?? (editingAttendance.status === 'half-day')),
      isEarlyLogout: isNowPresent ? false : Boolean(editingAttendance.isEarlyLogout ?? (editingAttendance.status === 'early-logout')),
      isLop: isNowPresent ? false : Boolean(editingAttendance.isLop ?? (editingAttendance.status === 'lop')),
      totalHours: isCheckOutCleared
        ? 'Active (Live)'
        : (isNowPresent && typeof editingAttendance.totalHours === 'string' && editingAttendance.totalHours.includes('Late')
            ? (editingAttendance.checkOut ? '8.0 hrs' : 'Active (Live)')
            : editingAttendance.totalHours),
      notes: isNowPresent && typeof editingAttendance.notes === 'string' && (editingAttendance.notes.includes('Late') || editingAttendance.notes.includes('Auto Punch Out'))
        ? 'Verified Attendance (General Shift)'
        : (editingAttendance.notes || ''),
    }
    await hrStore.markAttendance(payload)
    setEditingAttendance(null)
    showFeedback(`Updated attendance record for ${editingAttendance.employeeName}.`)
  })

  const handleDeleteAttendance = storeAction(async () => {
    if (!attendanceToDelete) return
    const idToDelete = attendanceToDelete._id || attendanceToDelete.id
    await hrStore.deleteAttendance(idToDelete, {
      employeeId: attendanceToDelete.employeeId,
      date: attendanceToDelete.date,
    })
    setAttendanceToDelete(null)
    showFeedback('Attendance record permanently deleted from database.')
  })



  const handleAddWifi = storeAction(async (e) => {
    e.preventDefault()
    if (!newWifiSSID.trim()) return
    await hrStore.addWifiSSID(newWifiSSID.trim(), hrWifiBranch, 'HR')
    showFeedback(`Registered Wi-Fi "${newWifiSSID.trim()}" for ${hrWifiBranch}! Active immediately for all employees.`)
    setNewWifiSSID('')
  })

  const handleRemoveWifi = storeAction(async (ssid) => {
    await hrStore.removeWifiSSID(ssid, 'HR')
    showFeedback(`Removed ${ssid} from verified office networks.`)
  })

  function handlePopulateStandardRoster() {
    showFeedback('Automatic shift filling is disabled. Record actual attendance or let employees punch in.')
  }

  function handleSyncPayrollAttendance() {
    window.location.hash = `#/${user.role === 'admin' ? 'admin' : 'hr'}/payroll`
  }

  function handleExportCSV() {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Date',
      'Check-In',
      'Check-Out',
      'Status',
      'Wi-Fi Network',
      'Office Wi-Fi Verified',
      'Hours',
      'Notes',
    ]
    const rows = dailyAttendance.map((a) => [
      a.employeeId,
      a.employeeName,
      a.date,
      a.checkIn || 'N/A',
      a.checkOut || (a.status === 'present' || a.status === 'late' ? 'Active (Live)' : 'N/A'),
      a.status,
      a.wifiSSID || 'None',
      a.wifiVerified ? 'YES' : 'NO',
      a.totalHours || '0.0',
      a.notes || '',
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `edufyi_attendance_${selectedDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setExportNotice(true)
    setTimeout(() => setExportNotice(false), 3000)
  }

  return (
    <>
      <PageHeader
        eyebrow="Workforce Operations"
        title="Attendance & Presence Control Center"
        description="Monitor daily workforce presence, live Wi-Fi SSID geofencing, check-in / check-out actions, and monthly working day summaries."
      >
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              const res = await hrStore.recalculateTodayAttendance()
              showFeedback(res?.message || 'Attendance roster preserved in neutral mode pending replacement policy.')
            } catch (err) {
              showFeedback(`✕ Failed to check attendance: ${err.message}`)
            }
          }}
          title="Verify attendance records status"
        >
          <span>⚡</span> Recalculate Roster
        </Button>
        <Button variant="secondary" onClick={handleExportCSV}>
          <Download size={15} /> Export CSV
        </Button>
        <Button onClick={() => setShowMarkModal(true)}>
          <Plus size={15} /> Record Attendance
        </Button>
      </PageHeader>

      {/* Notifications */}
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

      {/* Sub Navigation Tabs */}
      <div className="subnav-tabs">
        <button
          type="button"
          className={`subnav-tab ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          <Users size={14} />
          <span>Daily Presence Roster</span>
          <span className="badge-pill">{dailyAttendance.length}</span>
        </button>

        <button
          type="button"
          className={`subnav-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <BarChart3 size={14} />
          <span>Monthly Summary & LOP Tracker</span>
          <span className="badge-pill">{allEmployees.length}</span>
        </button>

        <button
          type="button"
          className={`subnav-tab ${activeTab === 'wifi' ? 'active' : ''}`}
          onClick={() => setActiveTab('wifi')}
        >
          <Wifi size={14} />
          <span>Office Wi-Fi & Geofencing</span>
          <span className="badge-pill">{storeState.companySettings?.allowedWifiSSIDs?.length || 3}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <section className="module-kpi-grid">
        <div className="panel module-kpi">
          <span>Present on-site ({selectedDate})</span>
          <strong>{presentCount} Staff</strong>
          <small>Verified via office Wi-Fi network</small>
        </div>
        <div className="panel module-kpi">
          <span>Active check-ins</span>
          <strong style={{ color: 'var(--teal)' }}>{dayRecords.filter((a) => Boolean(a.checkIn) && !a.checkOut).length} Staff</strong>
          <small>Currently checked-in live</small>
        </div>
        <div className="panel module-kpi">
          <span>Approved leaves / Out</span>
          <strong>{onLeaveCount} Staff</strong>
          <small>Authorized absence</small>
        </div>
      </section>

      {/* TAB 1: DAILY ROSTER */}
      {activeTab === 'roster' && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Date Roster</p>
              <h2>Presence Log ({selectedDate})</h2>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f7f6f2', border: '1px solid var(--line)', borderRadius: '8px', padding: '0 10px', height: '36px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ border: 0, outline: 0, background: 'transparent', fontSize: '11px', color: 'var(--ink)' }}
                />
              </div>

              <div className="module-search" style={{ minWidth: '180px' }}>
                <Search size={15} />
                <input
                  placeholder="Search employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="leave-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '36px' }}
              >
                <option value="all">All statuses</option>
                <option value="present">Present (On-Time)</option>
                <option value="early-logout">Early Logout (6:30–7:30 PM)</option>
                <option value="lop">Loss of Pay (LOP)</option>
                <option value="half-day">Half Day</option>
                <option value="on-leave">On Leave</option>
                <option value="absent">Absent</option>
              </select>

              <button
                type="button"
                className="ui-button secondary"
                onClick={handleExportCSV}
                title="Export current attendance log to CSV"
                style={{ height: '36px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>



          {/* Mobile Attendance Cards for HR */}
          <div className="attendance-cards-mobile" style={{ display: 'none', gap: '10px', marginTop: '14px' }}>
            {dailyAttendance.length === 0 ? (
              <EmptyState title="No attendance entries" message={`No records for ${selectedDate}. Record actual attendance or wait for employee punches.`} />
            ) : (
              dailyAttendance.map((r) => {
                const isInside = r.distanceMeters !== undefined && r.distanceMeters !== null ? r.distanceMeters <= maxGeofenceRadius : r.gpsVerified
                const distText = r.distanceMeters !== undefined && r.distanceMeters !== null ? `${r.distanceMeters}m` : (r.wifiVerified ? `<${maxGeofenceRadius}m` : '—')
                const statusInfo = getDailyAttendanceStatus(r)
                const lateInfo = getLateCountInfo(r, storeState.attendance, selectedDate)
                return (
                  <div
                    key={r.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '13px' }}>{r.employeeName}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '6px' }}>({r.employeeId})</span>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StatusBadge tone={statusInfo.tone}>
                          {statusInfo.label}
                        </StatusBadge>
                        {lateInfo.count > 0 && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: lateInfo.count >= 3 ? '#fee2e2' : '#fef3c7',
                              color: lateInfo.count >= 3 ? '#b91c1c' : '#b45309',
                              border: `1px solid ${lateInfo.count >= 3 ? '#fca5a5' : '#fde68a'}`,
                            }}
                          >
                            #{lateInfo.count}{lateInfo.lopDays > 0 ? ` (${lateInfo.lopDays} LOP)` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px', background: 'var(--surface-sunken)', padding: '8px 10px', borderRadius: '6px' }}>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Check In</span>
                        <strong>{r.checkIn || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Check Out</span>
                        <strong>{r.checkOut || (r.status === 'present' ? 'Active' : '—')}</strong>
                        {(r.autoPunchOut || r.punchOutType === 'auto' || r.totalHours?.includes('Auto Punch Out')) && (
                          <span
                            title={r.punchOutReason || 'Auto punched out: GPS and WiFi disconnected for 2 hours'}
                            style={{
                              display: 'inline-block',
                              marginLeft: '4px',
                              fontSize: '8.5px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '1px 4px',
                              borderRadius: '3px',
                              background: '#fef3e2',
                              color: '#b45309',
                              border: '1px solid #fbd38d',
                            }}
                          >
                            Auto Out
                          </span>
                        )}
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Duration</span>
                        <strong style={{ color: 'var(--teal)' }}>{r.totalHours || '—'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--muted)' }}>
                      <span>Shift: <strong>{formatShiftDisplay(r.shift, r.shiftCode, storeState.companySettings?.attendanceRules)}</strong></span>
                      {r.isOnBreak ? (
                        <span style={{ color: '#b45309', fontWeight: 700 }}>⏸️ On Break ({r.currentBreak?.type || 'lunch'})</span>
                      ) : r.totalBreakMinutes > 0 ? (
                        <span style={{ color: '#b45309' }}>☕ {r.totalBreakMinutes}m break</span>
                      ) : null}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '10px' }}>
                      <span className={`wifi-badge ${r.wifiVerified ? 'verified' : 'remote'}`}>
                        <Wifi size={10} /> {r.wifiVerified ? 'Office Wi-Fi' : 'Remote'} {r.wifiSSID && `(${r.wifiSSID})`}
                      </span>
                      <span className={`gps-verified-badge ${isInside ? 'in-range' : 'out-range'}`}>
                        <MapPin size={10} /> {isInside ? `GPS ≤${maxGeofenceRadius}m (${distText})` : `GPS Out (${distText})`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                      {!r.checkOut && (r.status === 'present' || r.status === 'late' || r.status === 'half-day') && (
                        <button
                          type="button"
                          className="emp-action-btn edit"
                          onClick={storeAction(() => hrStore.checkOut(r.employeeId, r.employeeName, selectedDate))}
                          style={{ flex: '1 1 auto', justifyContent: 'center' }}
                        >
                          <Clock3 size={12} /> Punch Out
                        </button>
                      )}
                      <button
                        type="button"
                        className="emp-action-btn edit"
                        onClick={() => setEditingAttendance(r)}
                        style={{ flex: '1 1 auto', justifyContent: 'center' }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        className="emp-action-btn delete"
                        onClick={() => setAttendanceToDelete(r)}
                        style={{ flex: '1 1 auto', justifyContent: 'center' }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="attendance-table-desktop">
            <DataTable
              caption="Daily attendance log"
              columns={[
                {
                  key: 'employeeName',
                  label: 'Employee',
                  render: (r) => (
                    <div>
                      <strong>{r.employeeName}</strong>
                      <div style={{ fontSize: '9px', color: 'var(--muted)' }}>{r.employeeId}</div>
                    </div>
                  ),
                },
                {
                  key: 'shift',
                  label: 'Shift',
                  render: (r) => (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>
                      {formatShiftDisplay(r.shift, r.shiftCode, storeState.companySettings?.attendanceRules)}
                    </span>
                  ),
                },
                { key: 'checkIn', label: 'Check-In', render: (r) => r.checkIn || '—' },
                {
                  key: 'checkOut',
                  label: 'Check-Out',
                  render: (r) =>
                    r.checkOut ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{r.checkOut}</span>
                        {(r.autoPunchOut || r.punchOutType === 'auto' || r.totalHours?.includes('Auto Punch Out')) && (
                          <span
                            title={r.punchOutReason || 'Auto punched out: GPS and WiFi disconnected for 2 hours'}
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              background: '#fef3e2',
                              color: '#b45309',
                              border: '1px solid #fbd38d',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Auto Punch Out
                          </span>
                        )}
                      </div>
                    ) : r.status === 'present' || r.status === 'late' ? (
                      <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Active (Live)</span>
                    ) : (
                      '—'
                    ),
                },
                {
                  key: 'totalHours',
                  label: 'Work Duration / Breaks',
                  render: (r) => {
                    const isLateStatus = r.status === 'late'
                    let displayHours = r.totalHours || '—'
                    if (!r.checkOut || (typeof displayHours === 'string' && displayHours.includes('Active'))) {
                      displayHours = 'Active (Live)'
                    }
                    return (
                      <div>
                        <strong style={{ color: r.isOnBreak ? '#b45309' : (displayHours === 'Active (Live)' ? 'var(--teal)' : (isLateStatus ? '#dc2626' : 'var(--teal)')) }}>
                          {r.isOnBreak ? `⏸️ On ${r.currentBreak?.type === 'tea' ? 'Tea Break' : 'Lunch Break'}` : displayHours}
                        </strong>
                        {r.totalBreakMinutes > 0 && (
                          <div style={{ fontSize: '10px', color: '#b45309' }}>
                            ☕ {r.totalBreakMinutes}m Break Taken
                          </div>
                        )}
                      </div>
                    )
                  },
                },
                {
                  key: 'wifi',
                  label: 'Network Verification',
                  render: (r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wifi size={13} style={{ color: r.wifiVerified ? 'var(--teal)' : 'var(--muted)' }} />
                      <span className={`wifi-badge ${r.wifiVerified ? 'verified' : 'remote'}`}>
                        {r.wifiVerified ? 'Office Wi-Fi' : 'Remote / Hotspot'}
                      </span>
                      {r.wifiSSID && (
                        <small style={{ color: 'var(--muted)', fontSize: '9px' }}>({r.wifiSSID})</small>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'geofence',
                  label: `GPS Geofence (≤ ${maxGeofenceRadius}m)`,
                  render: (r) => {
                    const isInside = r.distanceMeters !== undefined && r.distanceMeters !== null
                      ? r.distanceMeters <= maxGeofenceRadius
                      : r.gpsVerified
                    const distText = r.distanceMeters !== undefined && r.distanceMeters !== null
                      ? `${r.distanceMeters}m`
                      : (r.wifiVerified ? `<${maxGeofenceRadius}m` : '—')
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <MapPin size={13} style={{ color: isInside ? 'var(--teal)' : '#c25e00', flexShrink: 0 }} />
                        <span className={`gps-verified-badge ${isInside ? 'in-range' : 'out-range'}`}>
                          {isInside ? `≤${maxGeofenceRadius}m (${distText})` : `Outside (${distText})`}
                        </span>
                        {r.locationName && (
                          <small style={{ color: 'var(--muted)', fontSize: '9px' }}>{r.locationName}</small>
                        )}
                      </div>
                    )
                  },
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => {
                    const statusInfo = getDailyAttendanceStatus(r)
                    return (
                      <StatusBadge tone={statusInfo.tone}>
                        {statusInfo.label}
                      </StatusBadge>
                    )
                  },
                },
                {
                  key: 'lateCount',
                  label: 'Late Count',
                  render: (r) => {
                    const { count, lopDays } = getLateCountInfo(r, storeState.attendance, selectedDate)
                    if (!count || count <= 0) {
                      return <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>
                    }
                    return (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: count >= 3 ? '#fee2e2' : '#fef3c7',
                            color: count >= 3 ? '#b91c1c' : '#b45309',
                            border: `1px solid ${count >= 3 ? '#fca5a5' : '#fde68a'}`,
                          }}
                        >
                          #{count}
                        </span>
                        {lopDays > 0 && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: '#dc2626',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {lopDays} LOP
                          </span>
                        )}
                      </div>
                    )
                  },
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (r) => (
                    <div className="emp-action-group">
                      {/* Check out button if still active */}
                      {!r.checkOut && (r.status === 'present' || r.status === 'late' || r.status === 'half-day') && (
                        <button
                          type="button"
                          className="emp-action-btn edit"
                          onClick={storeAction(() => hrStore.checkOut(r.employeeId, r.employeeName, selectedDate))}
                          title="Punch Out"
                        >
                          <Clock3 size={12} /> Out
                        </button>
                      )}

                      <button
                        type="button"
                        className="emp-action-btn edit"
                        onClick={() => setEditingAttendance(r)}
                        title="Edit Punch Details"
                      >
                        <Edit3 size={12} /> Edit
                      </button>

                      <button
                        type="button"
                        className="emp-action-btn delete"
                        onClick={() => setAttendanceToDelete(r)}
                        title="Delete Record"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ),
                },
              ]}
              rows={dailyAttendance}
              emptyMessage={`No attendance entries recorded for ${selectedDate}. Click "Auto-Fill Shift" or "Record Attendance" above to log punches.`}
            />
          </div>
        </section>
      )}

      {/* TAB 2: MONTHLY SUMMARY & LOP TRACKER */}
      {activeTab === 'summary' && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Payroll Impact</p>
              <h2>Attendance & Payroll Review ({selectedDate.slice(0, 7)})</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={handleSyncPayrollAttendance}>
                <RefreshCw size={14} /> Review linked payroll
              </Button>
            </div>
          </div>
          <p className="foundation-copy" style={{ margin: '10px 0 20px' }}>
            Attendance and approved leave are linked to each employee's payroll review. HR reviews earnings, paid days, and deductions before finalizing; nothing is automatically deducted.
          </p>

          <DataTable
            caption="Monthly attendance calculation"
            columns={[
              {
                key: 'employee',
                label: 'Employee',
                render: (emp) => (
                  <div>
                    <strong>{emp.name}</strong>
                    <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
                      {emp.employeeId} · {emp.department}
                    </div>
                  </div>
                ),
              },
              { key: 'totalDays', label: 'Calendar Days', render: () => calendarDays },
              {
                key: 'presentDays',
                label: 'Days Present',
                render: (emp) => {
                  const pCount = monthlyAttendance.filter(
                    (a) => a.employeeId === emp.employeeId && (a.status === 'present' || a.status === 'late')
                  ).length
                  return <strong style={{ color: 'var(--teal)' }}>{pCount}</strong>
                },
              },
              {
                key: 'lateDays',
                label: 'Late Check-ins',
                render: (emp) => {
                  const lCount = monthlyAttendance.filter(
                    (a) => a.employeeId === emp.employeeId && a.status === 'late'
                  ).length
                  return lCount
                },
              },
              {
                key: 'leaves',
                label: 'Approved Leaves',
                render: (emp) => {
                  const leaves = (storeState.leaves || []).filter(
                    (l) => l.employeeId === emp.employeeId && l.status === 'approved'
                  )
                  const totalDays = leaves.reduce((sum, l) => sum + (l.days || 1), 0)
                  return totalDays
                },
              },
              {
                key: 'lop',
                label: 'LOP (Unpaid)',
                render: (emp) => {
                  const absents = monthlyAttendance.filter(
                    (a) => a.employeeId === emp.employeeId && a.status === 'absent'
                  ).length
                  return <span style={{ color: absents ? 'var(--coral)' : 'inherit' }}>{absents} days</span>
                },
              },
              {
                key: 'payableDays',
                label: 'Payable Days',
                render: (emp) => {
                  const record = storeState.payroll.find((payroll) => payroll.employeeId === emp.employeeId && payroll.month === new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
                  return <strong>{record ? `${record.paidDays} / ${record.workingDays}` : 'Not reviewed'}</strong>
                },
              },
              {
                key: 'status',
                label: 'Status',
                render: () => <StatusBadge tone="info">Eligible for Full Salary</StatusBadge>,
              },
            ]}
            rows={allEmployees}
            emptyMessage="No employees registered."
          />
        </section>
      )}

      {/* TAB 3: WI-FI & GPS GEOFENCE NETWORKS */}
      {activeTab === 'wifi' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* WI-FI WHITELIST PANEL */}
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Network Security</p>
                <h2>Office Wi-Fi SSID Whitelist ({storeState.companySettings?.allowedWifiSSIDs?.length || 0})</h2>
              </div>
              <StatusBadge tone="success">Active for All Employees</StatusBadge>
            </div>
            <p className="foundation-copy" style={{ margin: '10px 0 20px' }}>
              Employees connected to any of these corporate wireless networks are automatically verified as physically on-site without requiring manual biometric devices.
            </p>

            {/* REGISTER NEW WI-FI FORM */}
            <form onSubmit={handleAddWifi} style={{ background: '#f5f8f7', border: '1px solid rgba(29, 138, 122, 0.25)', borderRadius: '10px', padding: '14px', marginBottom: '20px', display: 'grid', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Register & Link Office Wi-Fi Network
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>Wi-Fi SSID Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Edufyi-Floor2-5G, MyOffice-WiFi..."
                    value={newWifiSSID}
                    onChange={(e) => setNewWifiSSID(e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      background: '#fff',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '3px' }}>Target Branch *</label>
                  <select
                    value={hrWifiBranch}
                    onChange={(e) => setHrWifiBranch(e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      background: '#fff',
                    }}
                  >
                    {branchLocations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} ({loc.city})
                      </option>
                    ))}
                    <option value="All Company Branches">All Company Branches (Global)</option>
                  </select>
                </div>

                <Button type="submit">
                  <Check size={14} /> Register Network
                </Button>
              </div>
            </form>

            <div style={{ display: 'grid', gap: '10px' }}>
              {(storeState.companySettings?.allowedWifiSSIDs || []).map((ssid) => {
                const matched = wifiNetworks.find((n) => n.ssid === ssid)
                const branchLabel = matched?.branchName && matched.branchName !== 'HQ - San Francisco' ? matched.branchName : (branchLocations[0]?.name || 'IGNITE CAMPUS')
                return (
                  <div
                    key={ssid}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      background: '#fffefa',
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'var(--soft-teal)',
                          color: 'var(--teal)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Wifi size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '13px' }}>{ssid}</strong>
                          <span className="wifi-verified-badge" style={{ fontSize: '9px' }}>✓ Verified</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} color="var(--teal)" />
                          <span>Branch: <strong>{branchLabel}</strong> • Geofence: ≤{maxGeofenceRadius}m</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="emp-action-btn delete"
                      onClick={() => handleRemoveWifi(ssid)}
                      title="Remove from Whitelist"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {/* GPS GEOFENCING CONFIGURATION PANEL */}
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Geographic Coordinates</p>
                <h2>Office GPS Geofence Perimeters (≤{maxGeofenceRadius}m Distance)</h2>
              </div>
              <span className="gps-verified-badge in-range">
                <Radio size={12} /> Geofence Rule: ≤{maxGeofenceRadius}m
              </span>
            </div>
            <p className="foundation-copy" style={{ margin: '10px 0 16px' }}>
              Employees punching attendance from mobile devices or laptops must be physically located within <strong>{maxGeofenceRadius} meters</strong> of any registered office coordinates to obtain automatic in-office GPS verification.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {(storeState.companySettings?.locations || []).map((loc) => (
                <div
                  key={loc.id}
                  style={{
                    padding: '14px 16px',
                    background: '#fffefa',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color="var(--teal)" />
                      <strong style={{ fontSize: '13px' }}>{loc.name}</strong>
                    </div>
                    <span className="role-badge" style={{ fontSize: '9px', background: 'var(--soft-teal)', color: 'var(--teal)' }}>
                      Radius: {loc.radiusMeters || maxGeofenceRadius}m
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'grid', gap: '3px' }}>
                    <div>City: <strong style={{ color: 'var(--ink)' }}>{loc.city}</strong></div>
                    <div>Latitude: <code>{loc.lat ?? '37.789172'}°</code></div>
                    <div>Longitude: <code>{loc.lng ?? '-122.401449'}°</code></div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '6px', fontSize: '10px', color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={11} /> {loc.radiusMeters || maxGeofenceRadius}m Geofence Active
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* RECORD ATTENDANCE MODAL */}
      {showMarkModal && (
        <div className="hr-modal-backdrop" onClick={() => setShowMarkModal(false)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h2>Record Attendance Entry</h2>
              <button className="icon-button" onClick={() => setShowMarkModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveAttendance}>
              <div className="hr-modal-body">
                <Field label="Select Employee" required>
                  <select
                    value={markForm.employeeId}
                    onChange={(e) => setMarkForm({ ...markForm, employeeId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose employee --</option>
                    {allEmployees.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId} · {emp.department})
                      </option>
                    ))}
                  </select>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Date" required>
                    <input
                      type="date"
                      value={markForm.date}
                      onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                      required
                    />
                  </Field>

                  <Field label="Attendance Status" required>
                    <select
                      value={markForm.status}
                      onChange={(e) => {
                        const nextStatus = e.target.value;
                        setMarkForm({ ...markForm, status: nextStatus, lateCount: 0, notes: 'Verified Attendance (General Shift)' });
                      }}
                    >
                      <option value="present">Present (On-Time)</option>
                      <option value="early-logout">Early Logout (6:30–7:30 PM)</option>
                      <option value="lop">Loss of Pay (LOP)</option>
                      <option value="half-day">Half Day</option>
                      <option value="on-leave">On Leave</option>
                      <option value="absent">Absent / Unpaid</option>
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Check-In Time">
                    <input
                      type="text"
                      placeholder="e.g. 09:15 AM"
                      value={markForm.checkIn}
                      onChange={(e) => setMarkForm({ ...markForm, checkIn: e.target.value })}
                    />
                  </Field>

                  <Field label="Check-Out Time">
                    <input
                      type="text"
                      placeholder="e.g. 06:15 PM"
                      value={markForm.checkOut}
                      onChange={(e) => setMarkForm({ ...markForm, checkOut: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Wi-Fi Network / SSID Verification">
                  <select
                    value={markForm.wifiSSID}
                    onChange={(e) => setMarkForm({ ...markForm, wifiSSID: e.target.value })}
                  >
                    {(storeState.companySettings?.allowedWifiSSIDs || []).map((s) => (
                      <option key={s} value={s}>
                        {s} (Office Geofence Verified)
                      </option>
                    ))}
                    <option value="Home-Fiber-WiFi">Home-Fiber-WiFi (Remote Work)</option>
                    <option value="Cellular-Hotspot">Cellular-Hotspot (Client Site)</option>
                  </select>
                </Field>

                <Field label="Notes / Reason">
                  <input
                    type="text"
                    placeholder="e.g. On-site client meeting"
                    value={markForm.notes}
                    onChange={(e) => setMarkForm({ ...markForm, notes: e.target.value })}
                  />
                </Field>
              </div>

              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setShowMarkModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Verify & Save Attendance</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ATTENDANCE MODAL */}
      {editingAttendance && (
        <div className="hr-modal-backdrop" onClick={() => setEditingAttendance(null)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h2>Edit Attendance: {editingAttendance.employeeName}</h2>
              <button className="icon-button" onClick={() => setEditingAttendance(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateAttendance}>
              <div className="hr-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Date" required>
                    <input
                      type="date"
                      value={editingAttendance.date}
                      onChange={(e) => setEditingAttendance({ ...editingAttendance, date: e.target.value })}
                      required
                    />
                  </Field>

                  <Field label="Status" required>
                    <select
                      value={editingAttendance.status}
                      onChange={(e) => {
                        const nextStatus = e.target.value;
                        let updates = { ...editingAttendance, status: nextStatus };
                        if (nextStatus === 'present' || nextStatus === 'late') {
                          updates.isLate = false;
                          updates.lateCount = 0;
                          updates.isHalfDay = false;
                          updates.isEarlyLogout = false;
                          updates.isLop = false;
                          updates.notes = 'Verified Attendance (General Shift)';
                          if (typeof updates.totalHours === 'string' && updates.totalHours.includes('Late')) {
                            updates.totalHours = updates.checkOut ? '8.0 hrs' : 'Active (Live)';
                          }
                        } else if (nextStatus === 'half-day') {
                          updates.isHalfDay = true;
                          updates.isLate = false;
                        } else if (nextStatus === 'early-logout') {
                          updates.isEarlyLogout = true;
                        } else if (nextStatus === 'lop') {
                          updates.isLop = true;
                        }
                        setEditingAttendance(updates);
                      }}
                    >
                      <option value="present">Present (On-Time)</option>
                      <option value="early-logout">Early Logout (6:30–7:30 PM)</option>
                      <option value="lop">Loss of Pay (LOP)</option>
                      <option value="half-day">Half Day</option>
                      <option value="on-leave">On Leave</option>
                      <option value="absent">Absent</option>
                    </select>
                  </Field>
                </div>

                <Field label="Shift Timings">
                  <input
                    type="text"
                    value={editingAttendance.shift || ''}
                    placeholder={formatShiftDisplay(null, null, storeState.companySettings?.attendanceRules)}
                    onChange={(e) => setEditingAttendance({ ...editingAttendance, shift: e.target.value })}
                    style={{ background: '#fff', color: 'var(--ink)' }}
                  />
                  <small style={{ color: 'var(--muted)', fontSize: '10px', marginTop: '2px', display: 'block' }}>
                    Active Org Shift: {formatShiftDisplay(null, null, storeState.companySettings?.attendanceRules)} (configured in System Configuration)
                  </small>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Check-In Time">
                    <input
                      type="text"
                      value={editingAttendance.checkIn || ''}
                      onChange={(e) => setEditingAttendance({ ...editingAttendance, checkIn: e.target.value })}
                    />
                  </Field>

                  <Field label="Check-Out Time">
                    <input
                      type="text"
                      value={editingAttendance.checkOut || ''}
                      onChange={(e) => setEditingAttendance({ ...editingAttendance, checkOut: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Wi-Fi SSID">
                  <select
                    value={editingAttendance.wifiSSID || storeState.companySettings?.allowedWifiSSIDs?.[0] || 'Edufyi'}
                    onChange={(e) => setEditingAttendance({ ...editingAttendance, wifiSSID: e.target.value })}
                  >
                    {(storeState.companySettings?.allowedWifiSSIDs || []).map((s) => (
                      <option key={s} value={s}>
                        {s} (Office Geofence Verified)
                      </option>
                    ))}
                    <option value="Home-Fiber-WiFi">Home-Fiber-WiFi (Remote Work)</option>
                    <option value="Cellular-Hotspot">Cellular-Hotspot</option>
                  </select>
                </Field>

                <Field label="Notes / Comments">
                  <input
                    type="text"
                    value={editingAttendance.notes || ''}
                    onChange={(e) => setEditingAttendance({ ...editingAttendance, notes: e.target.value })}
                  />
                </Field>
              </div>

              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setEditingAttendance(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationDialog
        open={Boolean(attendanceToDelete)}
        title={`Delete Attendance Entry`}
        message={`Are you sure you want to remove the attendance punch for ${attendanceToDelete?.employeeName} on ${attendanceToDelete?.date}?`}
        confirmLabel="Yes, Delete Record"
        isDestructive={true}
        onConfirm={handleDeleteAttendance}
        onCancel={() => setAttendanceToDelete(null)}
      />
    </>
  )
}

// ==========================================
// 2. SALARY & PAYROLL MANAGEMENT MODULE
// ==========================================
// ==========================================
// 2. SALARY & PAYROLL MANAGEMENT MODULE (INR ₹)
// ==========================================
function PayrollModule() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [selectedPayslip, setSelectedPayslip] = useState(null)
  const [payrollEditor, setPayrollEditor] = useState(null)
  const [runningPayroll, setRunningPayroll] = useState(false)
  const [payrollSuccess, setPayrollSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Escape key and scroll lock when viewing payslip
  useEffect(() => {
    if (!selectedPayslip) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => {
      if (e.key === 'Escape') setSelectedPayslip(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', handleKey)
    }
  }, [selectedPayslip])

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const payrollList = storeState.payroll || []
  const employees = storeState.employees || []

  // Filtered by search
  const filteredList = payrollList.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (p.employeeName && p.employeeName.toLowerCase().includes(q)) ||
      (p.employeeId && p.employeeId.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q))
    )
  })

  // Calculate live totals for KPI in INR (₹)
  const totalGross = payrollList.reduce((acc, p) => {
    const e = p.earnings || {}
    return (
      acc +
      (Number(e.basic) || 0) +
      (Number(e.hra) || 0) +
      (Number(e.specialAllowance) || 0) +
      (Number(e.conveyance) || 0) +
      (Number(e.medicalAllowance) || 0) +
      (Number(e.performanceBonus) || 0) +
      (Number(e.overtime) || 0)
    )
  }, 0)

  const totalDeductions = payrollList.reduce((acc, p) => {
    const d = p.deductions || {}
    return (
      acc +
      (Number(d.pf) || 0) +
      (Number(d.esi) || 0) +
      (Number(d.professionalTax) || 0) +
      (Number(d.tdsTax) || 0) +
      (Number(d.loanAdvance) || 0) +
      (Number(d.lossOfPay) || 0) +
      (Number(d.otherDeductions) || 0)
    )
  }, 0)

  const totalNet = Math.max(0, totalGross - totalDeductions)

  function runPayroll() {
    setRunningPayroll(true)
    setTimeout(() => {
      setRunningPayroll(false)
      setPayrollSuccess(true)
      hrStore.executePayrollRun('September 2026')
      setTimeout(() => setPayrollSuccess(false), 4500)
    }, 1000)
  }

  // Open editor for brand-new payslip
  function handleOpenNewPayslip() {
    const defaultEmp = storeState.employees[0] || {}
    const basic = 45000
    const hra = Math.round(basic * 0.5)
    const special = 12500
    const conveyance = 3000
    const medical = 2500
    const gross = basic + hra + special + conveyance + medical
    const pf = Math.round(basic * 0.12)
    const profTax = 200
    const tds = Math.round(gross * 0.05)

    setPayrollEditor({
      id: `pay-${Date.now()}`,
      employeeId: defaultEmp.employeeId || '',
      employeeName: defaultEmp.name || 'Employee',
      department: defaultEmp.department || 'Operations',
      designation: defaultEmp.designation || 'Specialist',
      month: 'September 2026',
      workingDays: 30,
      paidDays: 30,
      lopDays: 0,
      bankName: defaultEmp.bankDetails?.bankName || 'HDFC Bank',
      accountNumber: defaultEmp.bankDetails?.accountNumber || '5010049288492',
      ifscCode: 'HDFC0001234',
      panTaxId: defaultEmp.bankDetails?.panTaxId || 'ALX-9821-R',
      uanNumber: '100984120982',
      earnings: {
        basic,
        hra,
        specialAllowance: special,
        conveyance,
        medicalAllowance: medical,
        performanceBonus: 0,
        overtime: 0,
      },
      deductions: {
        pf,
        esi: 0,
        professionalTax: profTax,
        tdsTax: tds,
        loanAdvance: 0,
        lossOfPay: 0,
        otherDeductions: 0,
      },
      status: 'processed',
      paymentDate: '2026-09-30',
      notes: 'Monthly compensation in INR (₹) with statutory deductions',
    })
  }

  // Open editor for an existing payslip
  function handleEditPayslip(record) {
    setPayrollEditor({
      ...record,
      earnings: { ...(record.earnings || {}) },
      deductions: { ...(record.deductions || {}) },
    })
  }

  // Employee picker change in editor
  function handleEmployeeSelectChange(empId) {
    const foundEmp = storeState.employees.find((e) => e.employeeId === empId || e.id === empId)
    if (!foundEmp) return

    setPayrollEditor((prev) => {
      const basic = prev.earnings?.basic || 45000
      return {
        ...prev,
        employeeId: foundEmp.employeeId,
        employeeName: foundEmp.name,
        department: foundEmp.department,
        designation: foundEmp.designation,
        bankName: foundEmp.bankDetails?.bankName || 'HDFC Bank',
        accountNumber: foundEmp.bankDetails?.accountNumber || '5010049288492',
        panTaxId: foundEmp.bankDetails?.panTaxId || 'PAN-9821-X',
      }
    })
  }

  // Save changes from editor
  function handleSaveEditor(e) {
    e.preventDefault()
    if (!payrollEditor) return

    hrStore.savePayrollRecord(payrollEditor)
    if (selectedPayslip && selectedPayslip.id === payrollEditor.id) {
      setSelectedPayslip(payrollEditor)
    }
    setPayrollEditor(null)
    setPayrollSuccess(true)
    setTimeout(() => setPayrollSuccess(false), 3500)
  }

  // Compute sub-breakup of any record
  function getRecordTotals(record) {
    const e = record.earnings || {}
    const d = record.deductions || {}

    const basic = Number(e.basic) || 0
    const hra = Number(e.hra) || 0
    const special = Number(e.specialAllowance) || 0
    const conveyance = Number(e.conveyance) || 0
    const medical = Number(e.medicalAllowance) || 0
    const bonus = Number(e.performanceBonus) || 0
    const overtime = Number(e.overtime) || 0
    const gross = basic + hra + special + conveyance + medical + bonus + overtime

    const pf = Number(d.pf) || 0
    const esi = Number(d.esi) || 0
    const pt = Number(d.professionalTax) || 0
    const tds = Number(d.tdsTax) || 0
    const loan = Number(d.loanAdvance) || 0
    const lop = Number(d.lossOfPay) || 0
    const performanceDeduction = Number(d.performanceDeduction) || 0
    const other = Number(d.otherDeductions) || 0
    const totalDed = pf + esi + pt + tds + loan + lop + performanceDeduction + other

    const net = Math.max(0, gross - totalDed)

    return {
      gross,
      totalDed,
      net,
      basic,
      hra,
      special,
      conveyance,
      medical,
      bonus,
      overtime,
      pf,
      esi,
      pt,
      tds,
      loan,
      lop,
      performanceDeduction,
      other,
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Compensation & Benefits"
        title="Salary & Payroll Workspace (INR ₹)"
        description="Organize employee payroll in Indian Rupees (₹), manually configure earnings and statutory deductions (PF, ESI, PT, TDS), and generate official payslips."
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={handleOpenNewPayslip}>
            <Plus size={15} /> Fill / Add Employee Payslip
          </Button>
          <Button onClick={runPayroll} disabled={runningPayroll}>
            <WalletCards size={16} /> {runningPayroll ? 'Processing Direct Bank Runs...' : 'Disburse September Payroll'}
          </Button>
        </div>
      </PageHeader>

      {payrollSuccess && (
        <div
          style={{
            background: 'var(--soft-teal)',
            color: 'var(--teal)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <CheckCircle2 size={16} /> Payroll & Payslips updated successfully! All deductions and earnings computed in INR (₹).
        </div>
      )}

      {/* KPI Cards in INR (₹) */}
      <section className="module-kpi-grid">
        <div className="panel module-kpi">
          <span>Current Pay Cycle</span>
          <strong>September 2026</strong>
          <small>Disbursement: 30 Sep 2026 • INR (₹)</small>
        </div>
        <div className="panel module-kpi">
          <span>Total Monthly Gross</span>
          <strong style={{ color: 'var(--ink)' }}>{formatINR(totalGross)}</strong>
          <small>{payrollList.length} Active employee payslips</small>
        </div>
        <div className="panel module-kpi">
          <span>Total Statutory Deductions</span>
          <strong style={{ color: 'var(--coral)' }}>{formatINR(totalDeductions)}</strong>
          <small>EPF (12%), ESIC, PT (₹200), TDS</small>
        </div>
        <div className="panel module-kpi">
          <span>Net Disbursed Take-Home</span>
          <strong style={{ color: 'var(--teal)' }}>{formatINR(totalNet)}</strong>
          <small>Direct NEFT/RTGS Bank Transfers</small>
        </div>
      </section>

      {/* Payroll Table */}
      <section className="panel">
        <div className="panel-heading" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="section-kicker">Indian Payroll Registry</p>
            <h2>Employee Salary Breakup & Custom Payslip Generator</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="search-box" style={{ width: '220px' }}>
              <Search size={14} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee or dept..."
              />
            </div>
            <StatusBadge tone="success">INR ₹ Active</StatusBadge>
          </div>
        </div>

        <DataTable
          caption="Salary records"
          columns={[
            {
              key: 'employee',
              label: 'Employee & Department',
              render: (p) => (
                <div>
                  <strong>{p.employeeName}</strong>
                  <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
                    {p.employeeId} • {p.department} ({p.designation})
                  </div>
                </div>
              ),
            },
            {
              key: 'period',
              label: 'Period & Days',
              render: (p) => (
                <div>
                  <span>{p.month || 'September 2026'}</span>
                  <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
                    {p.paidDays || 30}/{p.workingDays || 30} Days
                    {Number(p.lopDays) > 0 && (
                      <span style={{ color: 'var(--coral)', marginLeft: '4px' }}>
                        ({p.lopDays} LOP)
                      </span>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'gross',
              label: 'Monthly Gross (₹)',
              render: (p) => {
                const { gross } = getRecordTotals(p)
                return <strong>{formatINR(gross)}</strong>
              },
            },
            {
              key: 'deductions',
              label: 'Deductions (₹)',
              render: (p) => {
                const { totalDed, performanceDeduction } = getRecordTotals(p)
                return (
                  <div>
                    <span style={{ color: 'var(--coral)', fontWeight: 600 }}>-{formatINR(totalDed)}</span>
                    {performanceDeduction > 0 && (
                      <div style={{ fontSize: '9px', color: '#c0392b', fontWeight: 600, marginTop: '2px' }}>
                        Incl. {formatINR(performanceDeduction)} Perf Ded
                      </div>
                    )}
                  </div>
                )
              },
            },
            {
              key: 'net',
              label: 'Net Pay (₹)',
              render: (p) => {
                const { net } = getRecordTotals(p)
                return <strong style={{ color: 'var(--teal)', fontSize: '12px' }}>{formatINR(net)}</strong>
              },
            },
            {
              key: 'status',
              label: 'Disbursement',
              render: (p) => (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: p.status === 'processed' ? 'var(--soft-teal)' : '#f0efe9',
                    color: p.status === 'processed' ? 'var(--teal)' : 'var(--muted)',
                  }}
                >
                  <Check size={11} /> {p.status || 'Processed'}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (p) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedPayslip(p)}
                    title="View official printable payslip"
                  >
                    <FileText size={13} /> View Slip
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEditPayslip(p)}
                    title="Manually fill or edit earnings and deductions in INR"
                  >
                    <Edit3 size={13} /> Edit Values
                  </Button>
                </div>
              ),
            },
          ]}
          rows={filteredList}
        />
      </section>

      {/* ======================================================== */}
      {/* 1. MANUAL PAYROLL DATA & DEDUCTION EDITOR MODAL (INR ₹)  */}
      {/* ======================================================== */}
      {payrollEditor && (
        <div className="hr-modal-backdrop" onClick={() => setPayrollEditor(null)}>
          <div
            className="payroll-editor-modal"
            onClick={(e) => e.stopPropagation()}
            aria-labelledby="payroll-editor-title"
          >
            <div className="hr-modal-header">
              <div>
                <h2 id="payroll-editor-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={18} style={{ color: 'var(--teal)' }} />
                  Fill & Customize Employee Payslip (INR ₹)
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Manually adjust earnings, statutory EPF/ESIC/PT, and deductions in Indian Rupees.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPayrollEditor(null)}
                className="icon-button"
                aria-label="Close editor"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditor} style={{ display: 'grid', gap: '14px' }}>
              {/* SECTION 1: EMPLOYEE SELECTION & ATTENDANCE */}
              <div className="payroll-form-section">
                <div className="payroll-section-title">
                  <span>1. Employee & Attendance Details</span>
                  <span style={{ fontSize: '9px', color: 'var(--teal)' }}>Auto-populates from directory</span>
                </div>
                <div className="payroll-inputs-grid">
                  <div className="payroll-input-row">
                    <label>Select Registered Employee</label>
                    <div className="payroll-input-wrapper">
                      <select
                        value={payrollEditor.employeeId}
                        onChange={(e) => handleEmployeeSelectChange(e.target.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        {storeState.employees.map((emp) => (
                          <option key={emp.employeeId || emp.id} value={emp.employeeId}>
                            {emp.name} ({emp.employeeId}) — {emp.department}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Employee Name</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={payrollEditor.employeeName || ''}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, employeeName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Employee ID</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={payrollEditor.employeeId || ''}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, employeeId: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Department & Designation</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={`${payrollEditor.department || ''} - ${payrollEditor.designation || ''}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('-')
                          setPayrollEditor({
                            ...payrollEditor,
                            department: parts[0]?.trim() || '',
                            designation: parts[1]?.trim() || '',
                          })
                        }}
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Pay Month / Period</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={payrollEditor.month || 'September 2026'}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, month: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Total Working Days</label>
                    <div className="payroll-input-wrapper">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={payrollEditor.workingDays ?? 30}
                        onChange={(e) =>
                          setPayrollEditor({ ...payrollEditor, workingDays: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Paid Days</label>
                    <div className="payroll-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={payrollEditor.paidDays ?? 30}
                        onChange={(e) =>
                          setPayrollEditor({ ...payrollEditor, paidDays: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>
                      <span>Loss of Pay (LOP) Days</span>
                      <button
                        type="button"
                        className="payroll-calc-chip"
                        onClick={() => {
                          const lopDays = Number(payrollEditor.lopDays) || 0
                          const basic = Number(payrollEditor.earnings?.basic) || 0
                          const perDay = basic / (Number(payrollEditor.workingDays) || 30)
                          const lopDeduction = Math.round(perDay * lopDays)
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              lossOfPay: lopDeduction,
                            },
                          })
                        }}
                      >
                        Auto Calc LOP
                      </button>
                    </label>
                    <div className="payroll-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={payrollEditor.lopDays ?? 0}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, lopDays: Number(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BANK & STATUTORY DETAILS (INR / INDIA) */}
              <div className="payroll-form-section">
                <div className="payroll-section-title">
                  <span>2. Bank & Statutory Identifiers</span>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>Indian Banking & Compliance</span>
                </div>
                <div className="payroll-inputs-grid">
                  <div className="payroll-input-row">
                    <label>Bank Name</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={payrollEditor.bankName || ''}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, bankName: e.target.value })}
                        placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Account Number</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={payrollEditor.accountNumber || ''}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, accountNumber: e.target.value })}
                        placeholder="5010049288492"
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>IFSC Code</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={payrollEditor.ifscCode || ''}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, ifscCode: e.target.value })}
                        placeholder="HDFC0001234"
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>PAN Card Number</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={payrollEditor.panTaxId || ''}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, panTaxId: e.target.value })}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>PF UAN Number</label>
                    <div className="payroll-input-wrapper">
                      <input
                        value={payrollEditor.uanNumber || ''}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, uanNumber: e.target.value })}
                        placeholder="100984120982"
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Disbursement Status</label>
                    <div className="payroll-input-wrapper">
                      <select
                        value={payrollEditor.status || 'processed'}
                        onChange={(e) => setPayrollEditor({ ...payrollEditor, status: e.target.value })}
                      >
                        <option value="processed">Processed (Paid)</option>
                        <option value="draft">Draft (Review Pending)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: EARNINGS BREAKDOWN IN INR */}
              <div className="payroll-form-section">
                <div className="payroll-section-title">
                  <span style={{ color: 'var(--teal)' }}>3. Monthly Earnings Breakdown (INR ₹)</span>
                  <button
                    type="button"
                    className="payroll-calc-chip"
                    onClick={() => {
                      const basic = Number(payrollEditor.earnings?.basic) || 50000
                      const hra = Math.round(basic * 0.5)
                      const special = Math.round(basic * 0.3)
                      setPayrollEditor({
                        ...payrollEditor,
                        earnings: {
                          ...payrollEditor.earnings,
                          basic,
                          hra,
                          specialAllowance: special,
                        },
                      })
                    }}
                  >
                    Apply 50% Basic + 50% HRA
                  </button>
                </div>
                <div className="payroll-inputs-grid">
                  <div className="payroll-input-row">
                    <label>Basic Salary (₹)</label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.earnings?.basic ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            earnings: {
                              ...(payrollEditor.earnings || {}),
                              basic: Number(e.target.value) || 0,
                            },
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>House Rent Allowance - HRA (₹)</label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.earnings?.hra ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            earnings: {
                              ...(payrollEditor.earnings || {}),
                              hra: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Special Allowance (₹)</label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.earnings?.specialAllowance ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            earnings: {
                              ...(payrollEditor.earnings || {}),
                              specialAllowance: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Conveyance Allowance (₹)</label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.earnings?.conveyance ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            earnings: {
                              ...(payrollEditor.earnings || {}),
                              conveyance: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Medical Allowance (₹)</label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.earnings?.medicalAllowance ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            earnings: {
                              ...(payrollEditor.earnings || {}),
                              medicalAllowance: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Performance Bonus / Incentive (₹)</label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.earnings?.performanceBonus ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            earnings: {
                              ...(payrollEditor.earnings || {}),
                              performanceBonus: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>Overtime / Extra Earnings (₹)</label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.earnings?.overtime ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            earnings: {
                              ...(payrollEditor.earnings || {}),
                              overtime: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--soft-teal)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--teal)' }}>
                      Total Gross Earnings
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--teal)' }}>
                      {formatINR(getRecordTotals(payrollEditor).gross)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION 4: MANUAL DEDUCTIONS IN INR */}
              <div className="payroll-form-section">
                <div className="payroll-section-title">
                  <span style={{ color: 'var(--coral)' }}>4. Deductions Breakdown (Manual & Statutory ₹)</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="payroll-calc-chip"
                      onClick={() => {
                        setPayrollEditor({
                          ...payrollEditor,
                          deductions: {
                            ...(payrollEditor.deductions || {}),
                            performanceDeduction: 2500,
                          },
                        })
                      }}
                      title="Quick apply ₹2,500 Performance / KPI deduction"
                    >
                      + Perf Ded ₹2.5k
                    </button>
                    <button
                      type="button"
                      className="payroll-calc-chip"
                      onClick={() => {
                        const basic = Number(payrollEditor.earnings?.basic) || 0
                        const pf = Math.round(basic * 0.12)
                        setPayrollEditor({
                          ...payrollEditor,
                          deductions: {
                            ...(payrollEditor.deductions || {}),
                            pf,
                          },
                        })
                      }}
                    >
                      Calc 12% PF
                    </button>
                    <button
                      type="button"
                      className="payroll-calc-chip"
                      onClick={() => {
                        setPayrollEditor({
                          ...payrollEditor,
                          deductions: {
                            ...(payrollEditor.deductions || {}),
                            professionalTax: 200,
                          },
                        })
                      }}
                    >
                      Set PT ₹200
                    </button>
                  </div>
                </div>
                <div className="payroll-inputs-grid">
                  <div className="payroll-input-row">
                    <label>
                      <span>Employees' Provident Fund - EPF (₹)</span>
                      <small style={{ color: 'var(--muted)', fontSize: '9px' }}>12% of Basic</small>
                    </label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.deductions?.pf ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              pf: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>
                      <span>ESIC (Employee State Insurance) (₹)</span>
                      <small style={{ color: 'var(--muted)', fontSize: '9px' }}>0.75% of Gross</small>
                    </label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.deductions?.esi ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              esi: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>
                      <span>Professional Tax - PT (₹)</span>
                      <small style={{ color: 'var(--muted)', fontSize: '9px' }}>Standard ₹200</small>
                    </label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.deductions?.professionalTax ?? 200}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              professionalTax: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>
                      <span>Tax Deducted at Source - TDS / Income Tax (₹)</span>
                    </label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.deductions?.tdsTax ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              tdsTax: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>
                      <span>Salary Advance / Loan Recovery (₹)</span>
                    </label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.deductions?.loanAdvance ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              loanAdvance: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>
                      <span>Loss of Pay (LOP) Deduction (₹)</span>
                    </label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.deductions?.lossOfPay ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              lossOfPay: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>
                      <span>Performance / KPI Deduction (₹)</span>
                      <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Shortfall, SLA breach, or performance penalty deduction</small>
                    </label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.deductions?.performanceDeduction ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              performanceDeduction: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="payroll-input-row">
                    <label>
                      <span>Other Manual Deductions (₹)</span>
                    </label>
                    <div className="payroll-input-wrapper">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={payrollEditor.deductions?.otherDeductions ?? 0}
                        onChange={(e) =>
                          setPayrollEditor({
                            ...payrollEditor,
                            deductions: {
                              ...(payrollEditor.deductions || {}),
                              otherDeductions: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--soft-coral)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--coral)' }}>
                      Total Monthly Deductions
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--coral)' }}>
                      -{formatINR(getRecordTotals(payrollEditor).totalDed)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* LIVE COMPUTATION PREVIEW BANNER */}
              {(() => {
                const totals = getRecordTotals(payrollEditor)
                return (
                  <div className="payroll-summary-banner">
                    <div className="payroll-summary-cols">
                      <div>
                        <span style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase' }}>
                          Gross Earnings:
                        </span>{' '}
                        <strong>{formatINR(totals.gross)}</strong>
                      </div>
                      <div>
                        <span style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase' }}>
                          Total Deductions:
                        </span>{' '}
                        <strong style={{ color: '#ffb3a7' }}>-{formatINR(totals.totalDed)}</strong>
                      </div>
                    </div>
                    <div className="payroll-summary-net">
                      <div>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Net Take-Home Salary (₹)
                        </span>
                        <div className="payroll-summary-words">{amountInWordsINR(totals.net)}</div>
                      </div>
                      <strong>{formatINR(totals.net)}</strong>
                    </div>
                  </div>
                )
              })()}

              <div className="hr-modal-footer">
                <Button type="button" variant="secondary" onClick={() => setPayrollEditor(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <CheckCircle2 size={15} /> Save & Apply Payslip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. OFFICIAL PRINTABLE INDIAN PAYSLIP MODAL (INR ₹)       */}
      {/* ======================================================== */}
      {selectedPayslip && typeof document !== 'undefined' && createPortal(
        <div
          className="hr-modal-backdrop"
          onClick={() => setSelectedPayslip(null)}
          style={{
            zIndex: 2147483647,
            backgroundColor: 'rgba(11, 23, 39, 0.85)',
            backdropFilter: 'blur(5px)',
            position: 'fixed',
            inset: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 16px 60px',
          }}
        >
          {/* Prominent floating close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedPayslip(null)
            }}
            title="Close Payslip (Esc)"
            aria-label="Close"
            style={{
              position: 'fixed',
              top: '12px',
              right: '16px',
              zIndex: 2147483647,
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              border: '2px solid #ffffff',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <X size={20} strokeWidth={3} />
          </button>

          {/* Sticky top bar within modal */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '760px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              marginBottom: '16px',
              background: '#002D33',
              borderRadius: '8px',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <ArrowLeft size={13} /> Back
              </button>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                Payslip: {selectedPayslip.employeeName} ({selectedPayslip.month || 'September 2026'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPayslip(null)}
              style={{
                background: '#e11d48',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <X size={14} /> Close (Esc)
            </button>
          </div>

          <div className="hr-modal" style={{ maxWidth: '760px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div className="payslip-sheet">
              {/* Official Header */}
              <div className="payslip-header">
                <div className="payslip-brand">
                  <img src="/edufyi%20logo.jpg.jpeg" alt="Edufyi Logo" />
                  <div>
                    <h2>edufy</h2>
                    <span style={{ fontSize: '11px', color: '#555', fontWeight: 600 }}>
                      Edufyi Technologies Pvt. Ltd. • People Operations & Payroll Cell
                    </span>
                    <div style={{ fontSize: '9px', color: '#777' }}>
                      Registered Office: Bengaluru & San Francisco • Corporate ID: U72200KA2024PTC189021
                    </div>
                  </div>
                </div>
                <div className="payslip-title-block">
                  <h3>Payslip for {selectedPayslip.month || 'September 2026'}</h3>
                  <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>
                    Strictly Private & Confidential
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--teal)', fontWeight: 700 }}>
                    Status: {selectedPayslip.status?.toUpperCase() || 'PROCESSED'}
                  </span>
                </div>
              </div>

              {/* Employee Meta Grid */}
              <div className="payslip-info-grid">
                <div>
                  <span>Employee Name</span>
                  <strong>{selectedPayslip.employeeName}</strong>
                </div>
                <div>
                  <span>Employee ID</span>
                  <strong>{selectedPayslip.employeeId}</strong>
                </div>
                <div>
                  <span>Department</span>
                  <strong>{selectedPayslip.department}</strong>
                </div>
                <div>
                  <span>Designation</span>
                  <strong>{selectedPayslip.designation}</strong>
                </div>
                <div>
                  <span>Bank Name</span>
                  <strong>{selectedPayslip.bankName || 'HDFC Bank'}</strong>
                </div>
                <div>
                  <span>Bank Account No.</span>
                  <strong>{selectedPayslip.accountNumber || employees.find((e) => String(e.id || e._id || e.employeeId) === String(selectedPayslip.employeeId))?.bankDetails?.accountNumber || 'Pending Account Linking'}</strong>
                </div>
                <div>
                  <span>IFSC Code</span>
                  <strong>{selectedPayslip.ifscCode || 'HDFC0001234'}</strong>
                </div>
                <div>
                  <span>PAN Card Number</span>
                  <strong>{selectedPayslip.panTaxId || 'ALX-9821-R'}</strong>
                </div>
                <div>
                  <span>PF UAN Number</span>
                  <strong>{selectedPayslip.uanNumber || '100984120982'}</strong>
                </div>
                <div>
                  <span>Total Working Days</span>
                  <strong>{selectedPayslip.workingDays || 30} Days</strong>
                </div>
                <div>
                  <span>Paid Days</span>
                  <strong>{selectedPayslip.paidDays || 30} Days</strong>
                </div>
                <div>
                  <span>Loss of Pay (LOP)</span>
                  <strong style={{ color: Number(selectedPayslip.lopDays) > 0 ? 'var(--coral)' : '#111' }}>
                    {selectedPayslip.lopDays || 0} Days
                  </strong>
                </div>
              </div>

              {/* Earnings & Deductions Table in INR (₹) */}
              {(() => {
                const b = getRecordTotals(selectedPayslip)
                return (
                  <>
                    <div className="payslip-table-grid">
                      {/* Left: Earnings */}
                      <div>
                        <h4
                          style={{
                            margin: '0 0 8px',
                            fontSize: '11px',
                            color: 'var(--teal)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Earnings (₹ INR)
                        </h4>
                        <table className="payslip-table">
                          <thead>
                            <tr>
                              <th>Component</th>
                              <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Basic Salary</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.basic)}</td>
                            </tr>
                            <tr>
                              <td>House Rent Allowance (HRA)</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.hra)}</td>
                            </tr>
                            <tr>
                              <td>Special Allowance</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.special)}</td>
                            </tr>
                            <tr>
                              <td>Conveyance Allowance</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.conveyance)}</td>
                            </tr>
                            <tr>
                              <td>Medical Allowance</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.medical)}</td>
                            </tr>
                            {b.bonus > 0 && (
                              <tr>
                                <td>Performance Bonus</td>
                                <td style={{ textAlign: 'right' }}>{formatINR(b.bonus)}</td>
                              </tr>
                            )}
                            {b.overtime > 0 && (
                              <tr>
                                <td>Overtime / Extra</td>
                                <td style={{ textAlign: 'right' }}>{formatINR(b.overtime)}</td>
                              </tr>
                            )}
                            <tr style={{ fontWeight: 700, background: '#f5f7f6', borderTop: '2px solid #ccc' }}>
                              <td>Total Gross Earnings</td>
                              <td style={{ textAlign: 'right', color: 'var(--teal)' }}>{formatINR(b.gross)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Right: Deductions */}
                      <div>
                        <h4
                          style={{
                            margin: '0 0 8px',
                            fontSize: '11px',
                            color: 'var(--coral)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Deductions (₹ INR)
                        </h4>
                        <table className="payslip-table">
                          <thead>
                            <tr>
                              <th>Component</th>
                              <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Provident Fund (EPF 12%)</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.pf)}</td>
                            </tr>
                            <tr>
                              <td>ESIC Contribution</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.esi)}</td>
                            </tr>
                            <tr>
                              <td>Professional Tax (PT)</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.pt)}</td>
                            </tr>
                            <tr>
                              <td>Income Tax (TDS)</td>
                              <td style={{ textAlign: 'right' }}>{formatINR(b.tds)}</td>
                            </tr>
                            {b.loan > 0 && (
                              <tr>
                                <td>Loan / Advance Recovery</td>
                                <td style={{ textAlign: 'right' }}>{formatINR(b.loan)}</td>
                              </tr>
                            )}
                            {b.lop > 0 && (
                              <tr>
                                <td>Loss of Pay (LOP)</td>
                                <td style={{ textAlign: 'right' }}>{formatINR(b.lop)}</td>
                              </tr>
                            )}
                            {b.performanceDeduction > 0 && (
                              <tr style={{ background: '#fff5f5' }}>
                                <td style={{ color: '#c0392b', fontWeight: 600 }}>Performance / KPI Deduction</td>
                                <td style={{ textAlign: 'right', color: '#c0392b', fontWeight: 700 }}>
                                  -{formatINR(b.performanceDeduction)}
                                </td>
                              </tr>
                            )}
                            {b.other > 0 && (
                              <tr>
                                <td>Other Deductions</td>
                                <td style={{ textAlign: 'right' }}>{formatINR(b.other)}</td>
                              </tr>
                            )}
                            <tr style={{ fontWeight: 700, background: '#fcf6f5', borderTop: '2px solid #ccc' }}>
                              <td>Total Deductions</td>
                              <td style={{ textAlign: 'right', color: 'var(--coral)' }}>-{formatINR(b.totalDed)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Net Salary Highlight Box */}
                    <div className="payslip-net-box">
                      <div>
                        <span>Net Take-Home Salary Payable (INR)</span>
                        <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>
                          In Words: <em>{amountInWordsINR(b.net)}</em>
                        </div>
                        <small style={{ display: 'block', opacity: 0.8, fontSize: '9px', marginTop: '4px' }}>
                          Remitted via NEFT to {selectedPayslip.bankName || 'HDFC Bank'} (A/C:{' '}
                          {selectedPayslip.accountNumber || employees.find((e) => String(e.id || e._id || e.employeeId) === String(selectedPayslip.employeeId))?.bankDetails?.accountNumber || 'Pending Link'})
                        </small>
                      </div>
                      <strong style={{ fontSize: '26px' }}>{formatINR(b.net)}</strong>
                    </div>

                    <div
                      style={{
                        marginTop: '20px',
                        paddingTop: '14px',
                        borderTop: '1px dashed #ccc',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '9px',
                        color: '#777',
                      }}
                    >
                      <span>
                        • This is a system-generated electronic payslip and does not require a physical signature.
                      </span>
                      <span>Authorized by Edufyi Technologies Pvt. Ltd. HR Operations</span>
                    </div>
                  </>
                )
              })()}

              <div
                className="no-print"
                style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}
              >
                <Button variant="secondary" onClick={() => setSelectedPayslip(null)} style={{ color: '#e11d48' }}>
                  <X size={14} /> Close
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const slipToEdit = selectedPayslip
                    setSelectedPayslip(null)
                    handleEditPayslip(slipToEdit)
                  }}
                >
                  <Edit3 size={14} /> Edit This Payslip
                </Button>
                <Button onClick={() => window.print()}>
                  <Printer size={15} /> Print / Save PDF
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ==========================================
// 3. RECRUITMENT & REFERRALS MODULE
// ==========================================
function RecruitmentModule() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [showAddJob, setShowAddJob] = useState(false)
  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', openings: 1 })
  const candidateList = []

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const handleCreateJob = workspaceHandler(async (e) => {
    e.preventDefault()
    await hrStore.addRequisition(jobForm)
    setShowAddJob(false)
    setJobForm({ title: '', department: '', location: '', openings: 1 })
  })

  function advanceCandidate(candidateId) {
    return candidateId
  }

  return (
    <>
      <PageHeader
        eyebrow="Talent Acquisition"
        title="Recruitment & Referral Command Center"
        description="Track active job requisitions, candidate interview pipelines, and employee referral bonus rewards."
      >
        <Button onClick={() => setShowAddJob(true)}>
          <Plus size={16} /> Post Job Requisition
        </Button>
      </PageHeader>

      {/* Requisitions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        {storeState.requisitions.map((req) => (
          <div key={req.id} className="panel" style={{ padding: '16px' }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700 }}>{req.department}</span>
            <h3 style={{ margin: '6px 0 4px', fontSize: '13px' }}>{req.title}</h3>
            <p style={{ margin: '0 0 12px', fontSize: '10px', color: 'var(--muted)' }}>{req.location} • {req.openings} opening(s)</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '10px', fontSize: '10px' }}>
              <span>Applicant tracking not configured</span>
              <StatusBadge tone="info">{req.status}</StatusBadge>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Pipeline Kanban */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Interactive Kanban</p>
            <h2>Candidate Interview Pipeline</h2>
          </div>
          <StatusBadge tone="info">{candidateList.length} Active Candidates</StatusBadge>
        </div>

        <div className="kanban-board">
          {['Applied', 'Screening', 'Technical Interview', 'Offer'].map((col) => {
            const candidates = candidateList.filter((c) => c.stage === col)
            return (
              <div className="kanban-col" key={col}>
                <div className="kanban-col-header">
                  <h3>{col}</h3>
                  <span className="badge-pill">{candidates.length}</span>
                </div>
                <div className="kanban-cards">
                  {candidates.map((cand) => (
                    <div className="kanban-card" key={cand.id} onClick={() => advanceCandidate(cand.id)} title="Click to advance stage">
                      <h4>{cand.name}</h4>
                      <p>{cand.role} • {cand.experience}</p>
                      <div className="kanban-card-footer">
                        <span>Score: {cand.rating}</span>
                        <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Advance Stage →</span>
                      </div>
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <div style={{ color: 'var(--muted)', fontSize: '10px', textAlign: 'center', padding: '24px 0' }}>
                      No candidates in {col}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Referrals Section */}
      <section className="panel" style={{ marginTop: '18px' }}>
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Incentive Program</p>
            <h2>Employee Referral Bonus Tracker</h2>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Referral payments not configured</span>
        </div>
        <DataTable
          caption="Referral program"
          columns={[
            { key: 'referrer', label: 'Referring Employee', render: (row) => row.referrer || '-' },
            { key: 'candidate', label: 'Candidate Referred', render: (row) => row.candidate || '-' },
            { key: 'role', label: 'Applied Role', render: (row) => row.role || '-' },
            { key: 'bonus', label: 'Referral Bonus', render: (row) => row.bonus ? <strong style={{ color: 'var(--teal)' }}>{row.bonus}</strong> : '-' },
            { key: 'status', label: 'Bonus Status', render: (row) => <StatusBadge tone="info">{row.status || 'Under Review'}</StatusBadge> },
          ]}
          rows={[]}
        />
      </section>

      {/* POST JOB MODAL */}
      {showAddJob && (
        <div className="hr-modal-backdrop" onClick={() => setShowAddJob(false)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h2>Post New Job Requisition</h2>
              <button className="icon-button" onClick={() => setShowAddJob(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateJob}>
              <div className="hr-modal-body">
                <Field label="Job Title" required>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Mobile Engineer"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Department" required>
                    <select value={jobForm.department} onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}>
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </Field>
                  <Field label="Open Positions" required>
                    <input
                      type="number"
                      value={jobForm.openings}
                      onChange={(e) => setJobForm({ ...jobForm, openings: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setShowAddJob(false)}>Cancel</Button>
                <Button type="submit">Publish Job Requisition</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ==========================================
// 4. PERFORMANCE & OKRS MODULE
// ==========================================
function PerformanceModule() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  return <><PageHeader eyebrow="People Development" title="Performance & Recognition" description="Persisted peer recognition. Formal appraisal cycles and OKRs are not configured." />
    <DataTable caption="Peer recognition" columns={[{ key: 'from', label: 'From' }, { key: 'to', label: 'Recipient' }, { key: 'badge', label: 'Recognition' }, { key: 'message', label: 'Message' }, { key: 'date', label: 'Date' }]} rows={storeState.kudos ?? []} />
  </>
}

// ==========================================
// 5. TASK MANAGEMENT MODULE
// ==========================================
function TasksModule() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [showAddModal, setShowAddModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', assigneeId: '', priority: 'Medium', dueDate: '', category: 'General' })

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const handleCreateTask = workspaceHandler(async (e) => {
    e.preventDefault()
    const emp = storeState.employees.find((e) => e.employeeId === taskForm.assigneeId)
    await hrStore.addTask({
      ...taskForm,
      assigneeName: emp?.name || 'Assigned Staff',
    })
    setShowAddModal(false)
    setTaskForm({ title: '', assigneeId: '', priority: 'Medium', dueDate: '', category: 'General' })
  })

  const advanceTask = workspaceHandler(async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'todo' ? 'in_progress' : currentStatus === 'in_progress' ? 'completed' : 'todo'
    await hrStore.updateTaskStatus(taskId, nextStatus)
  })

  return (
    <>
      <PageHeader
        eyebrow="Workforce Execution"
        title="Task Management & Delegation"
        description="Coordinate team duties, set priorities, manage deadlines, and balance operational workload."
      >
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Task
        </Button>
      </PageHeader>

      <div className="kanban-board">
        {[
          { key: 'todo', label: 'To Do' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map((col) => {
          const colTasks = storeState.tasks.filter((t) => t.status === col.key)
          return (
            <div className="kanban-col" key={col.key}>
              <div className="kanban-col-header">
                <h3>{col.label}</h3>
                <span className="badge-pill">{colTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {colTasks.map((t) => (
                  <div className="kanban-card" key={t.id} onClick={() => advanceTask(t.id, t.status)} title="Click to advance status">
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', color: t.priority === 'Urgent' ? 'var(--coral)' : 'var(--teal)', fontWeight: 700 }}>
                      {t.priority} • {t.category}
                    </span>
                    <h4>{t.title}</h4>
                    <p>Assignee: {t.assigneeName}</p>
                    <div className="kanban-card-footer">
                      <span>Due: {t.dueDate}</span>
                      <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Update Status →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showAddModal && (
        <div className="hr-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h2>Assign New Team Task</h2>
              <button className="icon-button" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="hr-modal-body">
                <Field label="Task Description" required>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Verify employee tax declarations for Q3"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Assignee" required>
                    <select value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                      <option value="">Select employee</option>
                      {storeState.employees.map((emp) => (
                        <option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Priority" required>
                    <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </Field>
                </div>
                <Field label="Due Date" required>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    required
                  />
                </Field>
              </div>
              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Assign Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ==========================================
// 6. TRAINING & LEARNING MODULE
// ==========================================
function LearningModule() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [courseForm, setCourseForm] = useState({ title: '', category: '', duration: '', url: '' })
  const publishCourse = workspaceHandler(async (event) => {
    event.preventDefault()
    await hrStore.addCourse({ ...courseForm, modules: [] })
    setCourseForm({ title: '', category: '', duration: '', url: '' })
  })

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  return (
    <>
      <PageHeader
        eyebrow="Skill Development"
        title="Training & Certification Portal"
        description="Publish actual course links and track persisted enrollment and self-reported learning progress."
      >
      </PageHeader>
      <form className="panel" onSubmit={publishCourse} style={{ padding: '16px', marginBottom: '16px', display: 'grid', gap: '10px' }}>
        <h3>Publish training course</h3>
        {['title', 'category', 'duration', 'url'].map((key) => <Field key={key} label={key} required><input type={key === 'url' ? 'url' : 'text'} required value={courseForm[key]} onChange={(event) => setCourseForm({ ...courseForm, [key]: event.target.value })} /></Field>)}
        <Button type="submit">Publish course</Button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '22px' }}>
        {storeState.courses.map((course) => (
          <div key={course.id} className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700 }}>{course.category} • {course.duration}</span>
              <StatusBadge tone={course.completed ? 'info' : 'warning'}>
                {course.status}
              </StatusBadge>
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>{course.title}</h3>
            <div style={{ height: '6px', background: '#eee', borderRadius: '99px', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--teal)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Modules: {course.modules.length} lessons</span>
              <a href={course.url} target="_blank" rel="noopener noreferrer">Open course</a>
              <Button variant="secondary" onClick={workspaceHandler(() => course.enrolled ? hrStore.updateCourseProgress(course.id, 100) : hrStore.enrollCourse(course.id))}>{course.enrolled ? 'Report completion' : 'Enroll'}</Button>
            </div>
          </div>
        ))}
      </div>

      <p>Completion is self-reported; verified assessments and certificates are not configured.</p>
      <DataTable caption="Training enrollments" columns={[
        { key: 'ownerId', label: 'Employee', render: (record) => (storeState.workspacePeople ?? []).find((person) => person.id === record.ownerId)?.name ?? record.ownerId },
        { key: 'courseId', label: 'Course', render: (record) => storeState.courses.find((course) => course.id === record.courseId)?.title ?? record.courseId },
        { key: 'progress', label: 'Self-reported progress', render: (record) => `${record.progress}%` },
        { key: 'completedAt', label: 'Completion reported at' },
      ]} rows={storeState.enrollments ?? []} />
    </>
  )
}

// ==========================================
// 7. HELP DESK MANAGEMENT MODULE
// ==========================================
function HelpDeskModule() {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'open' | 'in_progress' | 'resolved'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [activeTab, setActiveTab] = useState('queue') // 'queue' | 'config'

  // Help Desk Configuration Form State
  const initialHelpDesk = storeState.companySettings?.helpDeskSettings || {}
  const [itSupportEmail, setItSupportEmail] = useState(initialHelpDesk.itSupportEmail || 'itsupport@edufyitech.in')
  const [itSupportEmployeeId, setItSupportEmployeeId] = useState(initialHelpDesk.itSupportEmployeeId || '')
  const [itSupportEmployeeName, setItSupportEmployeeName] = useState(initialHelpDesk.itSupportEmployeeName || '')
  const [itSupportEmployeeEmail, setItSupportEmployeeEmail] = useState(initialHelpDesk.itSupportEmployeeEmail || '')

  const [generalSupportEmail, setGeneralSupportEmail] = useState(initialHelpDesk.generalSupportEmail || initialHelpDesk.supportEmail || 'helpsupport@edufyitechsolution.in')
  const [generalSupportEmployeeId, setGeneralSupportEmployeeId] = useState(initialHelpDesk.generalSupportEmployeeId || '')
  const [generalSupportEmployeeName, setGeneralSupportEmployeeName] = useState(initialHelpDesk.generalSupportEmployeeName || '')
  const [generalSupportEmployeeEmail, setGeneralSupportEmployeeEmail] = useState(initialHelpDesk.generalSupportEmployeeEmail || '')

  const [defaultPriority, setDefaultPriority] = useState(initialHelpDesk.defaultPriority || 'Medium')
  const [autoAssignToManager, setAutoAssignToManager] = useState(initialHelpDesk.autoAssignToManager ?? true)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(initialHelpDesk.emailNotificationsEnabled ?? true)
  const [configSaving, setConfigSaving] = useState(false)

  // Sync Help Desk settings when store updates
  useEffect(() => {
    const hd = storeState.companySettings?.helpDeskSettings
    if (hd) {
      if (hd.itSupportEmail !== undefined) setItSupportEmail(hd.itSupportEmail)
      if (hd.itSupportEmployeeId !== undefined) setItSupportEmployeeId(hd.itSupportEmployeeId)
      if (hd.itSupportEmployeeName !== undefined) setItSupportEmployeeName(hd.itSupportEmployeeName)
      if (hd.itSupportEmployeeEmail !== undefined) setItSupportEmployeeEmail(hd.itSupportEmployeeEmail)

      if (hd.generalSupportEmail !== undefined) setGeneralSupportEmail(hd.generalSupportEmail)
      else if (hd.supportEmail !== undefined) setGeneralSupportEmail(hd.supportEmail)
      if (hd.generalSupportEmployeeId !== undefined) setGeneralSupportEmployeeId(hd.generalSupportEmployeeId)
      if (hd.generalSupportEmployeeName !== undefined) setGeneralSupportEmployeeName(hd.generalSupportEmployeeName)
      if (hd.generalSupportEmployeeEmail !== undefined) setGeneralSupportEmployeeEmail(hd.generalSupportEmployeeEmail)

      if (hd.defaultPriority !== undefined) setDefaultPriority(hd.defaultPriority)
      if (hd.autoAssignToManager !== undefined) setAutoAssignToManager(hd.autoAssignToManager)
      if (hd.emailNotificationsEnabled !== undefined) setEmailNotificationsEnabled(hd.emailNotificationsEnabled)
    }
  }, [storeState.companySettings])

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    setConfigSaving(true)
    try {
      await hrStore.updateCompanySettings({
        helpDeskSettings: {
          itSupportEmail: itSupportEmail.trim() || 'itsupport@edufyitech.in',
          itSupportEmployeeId,
          itSupportEmployeeName,
          itSupportEmployeeEmail,
          generalSupportEmail: generalSupportEmail.trim() || 'helpsupport@edufyitechsolution.in',
          generalSupportEmployeeId,
          generalSupportEmployeeName,
          generalSupportEmployeeEmail,
          supportEmail: generalSupportEmail.trim() || 'helpsupport@edufyitechsolution.in',
          defaultPriority,
          autoAssignToManager: Boolean(autoAssignToManager),
          emailNotificationsEnabled: Boolean(emailNotificationsEnabled),
        },
      })
      setFeedback('✓ Help desk & support routing configuration saved successfully!')
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback(`✕ Failed to save configuration: ${err.message || 'Please try again.'}`)
      setTimeout(() => setFeedback(''), 5000)
    } finally {
      setConfigSaving(false)
    }
  }

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'IT Support',
    priority: 'Medium',
    description: '',
    employeeId: '',
    employeeName: '',
  })

  useEffect(() => {
    return hrStore.subscribe((state) => {
      setStoreState(state)
    })
  }, [])

  const allTickets = storeState.tickets || []

  // Auto-select first ticket if none selected
  useEffect(() => {
    if (!selectedTicketId && allTickets.length > 0) {
      setSelectedTicketId(allTickets[0].id)
    }
  }, [allTickets, selectedTicketId])

  const selectedTicket = allTickets.find((t) => t.id === selectedTicketId) || null

  const filteredTickets = allTickets.filter((ticket) => {
    const status = (ticket.status || 'open').toLowerCase()
    if (statusFilter === 'open' && status !== 'open') return false
    if (statusFilter === 'in_progress' && status !== 'in_progress') return false
    if (statusFilter === 'resolved' && status !== 'resolved' && status !== 'closed') return false
    if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchSubject = (ticket.subject || '').toLowerCase().includes(q)
      const matchId = (ticket.id || '').toLowerCase().includes(q)
      const matchName = (ticket.employeeName || '').toLowerCase().includes(q)
      const matchCat = (ticket.category || '').toLowerCase().includes(q)
      if (!matchSubject && !matchId && !matchName && !matchCat) return false
    }
    return true
  })

  // Quick Stats
  const openCount = allTickets.filter((t) => (t.status || 'open') === 'open').length
  const inProgressCount = allTickets.filter((t) => t.status === 'in_progress').length
  const resolvedCount = allTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length

  const sendReply = workspaceHandler(async () => {
    if (!replyText.trim() || !selectedTicket) return
    await hrStore.replyToTicket(selectedTicket.id, replyText.trim(), user?.displayName || user?.name || 'HR Operations Desk')
    setReplyText('')
    setFeedback('Resolution response posted to ticket thread.')
    setTimeout(() => setFeedback(''), 3500)
  })

  const updateStatus = workspaceHandler(async (ticketId, nextStatus) => {
    await hrStore.updateTicketStatus(ticketId, nextStatus)
    setFeedback(`Ticket status updated to ${nextStatus.replace('_', ' ').toUpperCase()}.`)
    setTimeout(() => setFeedback(''), 3500)
  })

  const handleCreateTicketSubmit = workspaceHandler(async (e) => {
    e.preventDefault()
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return
    const emp = (storeState.employees || []).find((e) => e.id === newTicket.employeeId || e.employeeId === newTicket.employeeId)
    await hrStore.createTicket({
      subject: newTicket.subject.trim(),
      category: newTicket.category,
      priority: newTicket.priority,
      description: newTicket.description.trim(),
      employeeId: emp?.employeeId || emp?.id || user?.employeeId || 'STAFF',
      employeeName: emp?.name || newTicket.employeeName || user?.displayName || 'Internal Staff',
    })
    setShowCreateModal(false)
    setNewTicket({ subject: '', category: 'IT Support', priority: 'Medium', description: '', employeeId: '', employeeName: '' })
    setFeedback('New support ticket raised and dispatched to service queue.')
    setTimeout(() => setFeedback(''), 3500)
  })

  return (
    <>
      <PageHeader
        eyebrow="Employee Support"
        title="Help Desk & Ticket Resolution"
        description="Triage employee inquiries, hardware/IT requests, payroll questions, and maintain service SLAs."
      >
        <button
          type="button"
          className="ui-button secondary"
          onClick={() => setActiveTab(activeTab === 'config' ? 'queue' : 'config')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Settings2 size={14} /> {activeTab === 'config' ? 'View Ticket Queue' : 'Help Desk Configuration'}
        </button>
        <button
          type="button"
          className="ui-button primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} /> Raise Support Ticket
        </button>
      </PageHeader>

      {/* Sub Navigation Tabs */}
      <div className="subnav-tabs" style={{ marginBottom: '18px' }}>
        <button
          type="button"
          className={`subnav-tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <Ticket size={14} />
          <span>Support Tickets Queue</span>
          <span className="badge-pill">{allTickets.length}</span>
        </button>

        <button
          type="button"
          className={`subnav-tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Settings2 size={14} />
          <span>Help Desk Configuration & SLAs</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eaf4f1', color: 'var(--teal)', border: '1px solid #c7ded7', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '12px', fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span style={{ flex: 1 }}>{feedback}</span>
          <button type="button" onClick={() => setFeedback('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--teal)', fontSize: '13px' }}>✕</button>
        </div>
      )}

      {activeTab === 'config' ? (
        <section className="panel" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Support Infrastructure</p>
              <h2>Help Desk Configuration & Department Routing</h2>
            </div>
            <span className="role-badge" style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
              Multi-Tier SLA Engine
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '8px 0 16px' }}>
            Configure enterprise support ticket routing emails, manager escalation protocols, and automated notification triggers for employee IT, HR, Payroll, and Facilities requests.
          </p>

          <form onSubmit={handleSaveConfig}>
            <div style={{ maxWidth: '780px', marginBottom: '16px' }}>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '18px' }}>
                <strong style={{ fontSize: '14px', color: '#0369a1', display: 'block', marginBottom: '14px' }}>
                  Department Support Routing & Dispatch Emails
                </strong>

                <div style={{ display: 'grid', gap: '14px' }}>
                  {/* 1. IT Support Team Assignment */}
                  <div style={{ background: '#fff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>IT SUPPORT</span>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>IT &amp; Hardware Assignment</strong>
                    </div>

                    <label style={{ fontSize: '11.5px', display: 'block', color: 'var(--muted)', marginBottom: '5px', fontWeight: 600 }}>
                      Select Support Employee for IT Issues (All hardware &amp; IT tickets route to this person):
                    </label>
                    <select
                      className="select-control"
                      value={itSupportEmployeeId}
                      onChange={(e) => {
                        const selId = e.target.value
                        setItSupportEmployeeId(selId)
                        const emp = (storeState.employees || []).find((x) => String(x.id || x._id || x.employeeId) === selId)
                        if (emp) {
                          setItSupportEmployeeName(emp.name || emp.displayName || '')
                          setItSupportEmployeeEmail(emp.email || '')
                        } else {
                          setItSupportEmployeeName('')
                          setItSupportEmployeeEmail('')
                        }
                      }}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}
                    >
                      <option value="">-- Choose Dedicated IT Support Employee from Staff List --</option>
                      {(storeState.employees || []).map((emp) => (
                        <option key={emp.id || emp._id} value={String(emp.id || emp._id || emp.employeeId)}>
                          {emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || emp.department || 'IT Specialist'}
                        </option>
                      ))}
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Assigned Employee:</span>{' '}
                        <strong>{itSupportEmployeeName ? `${itSupportEmployeeName} (${itSupportEmployeeEmail || 'No email'})` : 'None selected'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Dedicated IT Email Channel:</span>{' '}
                        <strong style={{ color: '#0284c7' }}>{itSupportEmail || 'itsupport@edufyitech.in'}</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '6px', display: 'block' }}>
                      When an employee submits an IT inquiry, it arrives on <strong>itsupport@edufyitech.in</strong> and directly in this employee&apos;s portal queue. When resolved, an email response is sent from <strong>itsupport@edufyitech.in</strong> to the requester.
                    </span>
                  </div>

                  {/* 2. General Support Assignment (HR, Payroll, Facilities) */}
                  <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: '#16a34a', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>GENERAL SUPPORT</span>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>HR, Payroll &amp; Facilities Assignment</strong>
                    </div>

                    <label style={{ fontSize: '11.5px', display: 'block', color: 'var(--muted)', marginBottom: '5px', fontWeight: 600 }}>
                      Select Support Employee for HR, Payroll &amp; Facilities:
                    </label>
                    <select
                      className="select-control"
                      value={generalSupportEmployeeId}
                      onChange={(e) => {
                        const selId = e.target.value
                        setGeneralSupportEmployeeId(selId)
                        const emp = (storeState.employees || []).find((x) => String(x.id || x._id || x.employeeId) === selId)
                        if (emp) {
                          setGeneralSupportEmployeeName(emp.name || emp.displayName || '')
                          setGeneralSupportEmployeeEmail(emp.email || '')
                        } else {
                          setGeneralSupportEmployeeName('')
                          setGeneralSupportEmployeeEmail('')
                        }
                      }}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}
                    >
                      <option value="">-- Choose Dedicated General Support Employee from Staff List --</option>
                      {(storeState.employees || []).map((emp) => (
                        <option key={emp.id || emp._id} value={String(emp.id || emp._id || emp.employeeId)}>
                          {emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || emp.department || 'General'}
                        </option>
                      ))}
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Assigned Employee:</span>{' '}
                        <strong>{generalSupportEmployeeName ? `${generalSupportEmployeeName} (${generalSupportEmployeeEmail || 'No email'})` : 'None selected'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Unified Gateway Address:</span>{' '}
                        <strong style={{ color: '#16a34a' }}>{generalSupportEmail || 'helpsupport@edufyitechsolution.in'}</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '6px', display: 'block' }}>
                      All HR Policies, Payroll, and Facilities tickets are routed to this employee and dispatched via the unified <strong>helpsupport@edufyitechsolution.in</strong> gateway.
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid #e0f2fe', paddingTop: '14px', marginTop: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#0369a1', display: 'block', marginBottom: '12px' }}>
                      Ticket Workflow & Automation Rules
                    </strong>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', display: 'block', color: 'var(--muted)', marginBottom: '3px', fontWeight: 600 }}>
                          Default Ticket Priority Level
                        </label>
                        <select
                          className="text-input"
                          value={defaultPriority}
                          onChange={(e) => setDefaultPriority(e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '12px', background: '#fff' }}
                        >
                          <option value="Low">Low — Non-urgent query</option>
                          <option value="Medium">Medium — Standard SLA (24 hrs)</option>
                          <option value="High">High — Critical blocker</option>
                          <option value="Urgent">Urgent — Immediate intervention</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          id="autoAssignManagerHelp"
                          checked={autoAssignToManager}
                          onChange={(e) => setAutoAssignToManager(e.target.checked)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <label htmlFor="autoAssignManagerHelp" style={{ fontSize: '12px', cursor: 'pointer' }}>
                          Auto-assign & notify direct reporting manager when employee raises a ticket
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          id="emailNotifsHelp"
                          checked={emailNotificationsEnabled}
                          onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <label htmlFor="emailNotifsHelp" style={{ fontSize: '12px', cursor: 'pointer' }}>
                          Enable automatic email notifications for ticket status transitions and replies
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', alignItems: 'center' }}>
              <button
                type="submit"
                className="ui-button primary"
                disabled={configSaving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '13px' }}
              >
                <Check size={14} /> {configSaving ? 'Saving Help Desk Configuration...' : 'Save Help Desk Configuration'}
              </button>
              <button
                type="button"
                className="ui-button secondary"
                onClick={() => setActiveTab('queue')}
                style={{ fontSize: '12px', padding: '10px 16px' }}
              >
                Back to Ticket Queue
              </button>
            </div>
          </form>
        </section>
      ) : (
        <>
          {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
        <div className="panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>All Tickets</p>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>{allTickets.length}</h3>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(10,35,40,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
            <Ticket size={20} />
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #f59e0b' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#b45309', textTransform: 'uppercase', fontWeight: 600 }}>Awaiting Response</p>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#b45309' }}>{openCount}</h3>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <Clock3 size={20} />
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #0284c7' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#0369a1', textTransform: 'uppercase', fontWeight: 600 }}>In Progress</p>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0369a1' }}>{inProgressCount}</h3>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(2,132,199,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <RefreshCw size={20} />
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #10b981' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#047857', textTransform: 'uppercase', fontWeight: 600 }}>Resolved</p>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#047857' }}>{resolvedCount}</h3>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      <section className="leave-workspace-grid" style={{ minHeight: '560px' }}>
        {/* TICKET QUEUE LIST */}
        <div className="panel leave-list-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-heading" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p className="section-kicker">Queue</p>
              <h2>Support Tickets ({filteredTickets.length})</h2>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="role-badge" style={{ fontSize: '10px', padding: '3px 8px' }}>
                {statusFilter === 'all' ? 'All Status' : statusFilter.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'grid', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--muted)' }} />
              <input
                type="text"
                className="text-input"
                placeholder="Search subject, requester, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', fontSize: '11.5px', height: '34px' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '10px', top: '9px', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)', fontSize: '12px' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select
                className="select-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '11px', height: '32px' }}
              >
                <option value="all">Status: All</option>
                <option value="open">Status: Open ({openCount})</option>
                <option value="in_progress">Status: In Progress ({inProgressCount})</option>
                <option value="resolved">Status: Resolved ({resolvedCount})</option>
              </select>

              <select
                className="select-control"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ fontSize: '11px', height: '32px' }}
              >
                <option value="all">Category: All</option>
                <option value="IT Support">IT & Hardware</option>
                <option value="HR Policies">HR & Policies</option>
                <option value="Payroll">Payroll</option>
                <option value="Facilities">Workplace/Facilities</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div style={{ display: 'grid', gap: '8px', marginTop: '12px', flex: 1, overflowY: 'auto', maxHeight: '520px' }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                <Ticket size={28} style={{ opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
                <strong style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>No tickets found</strong>
                <span style={{ fontSize: '11.5px' }}>Try clearing filters or raise a new inquiry.</span>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id
                const p = (ticket.priority || 'Medium').toLowerCase()
                const s = (ticket.status || 'open').toLowerCase()
                return (
                  <div
                    key={ticket.id}
                    className={`leave-request-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    style={{
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid var(--teal)' : (s === 'resolved' ? '4px solid #10b981' : p === 'urgent' || p === 'high' ? '4px solid #ef4444' : '4px solid #f59e0b'),
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: isSelected ? '#f0f9f8' : '#fff',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div className="leave-request-top" style={{ marginBottom: '6px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                            {ticket.employeeName || 'Staff'}
                          </strong>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>#{ticket.id}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                          {ticket.category || 'General'} • {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <StatusBadge tone={s === 'resolved' || s === 'closed' ? 'success' : s === 'in_progress' ? 'info' : 'warning'}>
                        {s.replace('_', ' ')}
                      </StatusBadge>
                    </div>
                    <div className="leave-request-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {ticket.subject}
                      </span>
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: p === 'urgent' || p === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: p === 'urgent' || p === 'high' ? '#dc2626' : '#d97706',
                        }}
                      >
                        {ticket.priority || 'Medium'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* TICKET DETAILS & RESOLUTION WORKSPACE */}
        <div className="panel leave-detail-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedTicket ? (
            <>
              {/* Ticket Top Header */}
              <div className="panel-heading" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="section-kicker">Ticket #{selectedTicket.id}</p>
                  <h2 style={{ fontSize: '17px', margin: '2px 0 0', color: 'var(--ink)' }}>{selectedTicket.subject}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge tone={selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? 'success' : selectedTicket.status === 'in_progress' ? 'info' : 'warning'}>
                    {(selectedTicket.status || 'open').replace('_', ' ')}
                  </StatusBadge>
                </div>
              </div>

              {/* Status Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid var(--line)', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Triage & Status Actions:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {selectedTicket.status !== 'in_progress' && selectedTicket.status !== 'resolved' && (
                    <Button variant="secondary" onClick={() => updateStatus(selectedTicket.id, 'in_progress')} style={{ padding: '4px 10px', fontSize: '11px' }}>
                      <RefreshCw size={12} /> Mark In Progress
                    </Button>
                  )}
                  {selectedTicket.status !== 'resolved' && (
                    <Button variant="primary" onClick={() => updateStatus(selectedTicket.id, 'resolved')} style={{ padding: '4px 10px', fontSize: '11px', background: '#10b981', borderColor: '#10b981' }}>
                      <Check size={12} /> Resolve Ticket
                    </Button>
                  )}
                  {selectedTicket.status === 'resolved' && (
                    <Button variant="secondary" onClick={() => updateStatus(selectedTicket.id, 'open')} style={{ padding: '4px 10px', fontSize: '11px' }}>
                      <RefreshCw size={12} /> Reopen Ticket
                    </Button>
                  )}
                </div>
              </div>

              {/* Requester Metadata Strip */}
              <div style={{ background: '#f8f7f2', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '11px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Requester</span>
                  <strong style={{ color: 'var(--ink)' }}>{selectedTicket.employeeName || 'Staff Member'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Category</span>
                  <strong style={{ color: 'var(--ink)' }}>{selectedTicket.category || 'IT Support'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Assigned Specialist</span>
                  <strong style={{ color: '#0284c7' }}>{selectedTicket.assignedToName || 'General Queue'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Priority</span>
                  <span style={{ fontWeight: 700, color: (selectedTicket.priority || '').toLowerCase() === 'urgent' ? '#dc2626' : '#d97706' }}>
                    {selectedTicket.priority || 'Medium'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Created</span>
                  <span style={{ color: 'var(--ink)' }}>
                    {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>

              {/* Initial Issue Description */}
              {selectedTicket.description && (
                <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--teal)', display: 'block', marginBottom: '4px' }}>
                    Initial Inquiry Description
                  </span>
                  <p style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {selectedTicket.description}
                  </p>
                </div>
              )}

              {/* Discussion Thread */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '280px', marginBottom: '14px', paddingRight: '4px' }}>
                <strong style={{ fontSize: '12px', display: 'block', marginBottom: '10px', color: 'var(--ink)' }}>
                  Resolution Thread ({Array.isArray(selectedTicket.responses) ? selectedTicket.responses.length : 0})
                </strong>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {(!Array.isArray(selectedTicket.responses) || selectedTicket.responses.length === 0) ? (
                    <div style={{ padding: '16px', background: '#fafaf9', border: '1px dashed var(--line)', borderRadius: '8px', textAlign: 'center', color: 'var(--muted)', fontSize: '11.5px' }}>
                      No responses posted yet. Type a reply below to communicate with the employee.
                    </div>
                  ) : (
                    selectedTicket.responses.map((resp, i) => {
                      const isSupport = resp.sender?.toLowerCase().includes('it') || resp.sender?.toLowerCase().includes('hr') || resp.sender?.toLowerCase().includes('support') || resp.sender?.toLowerCase().includes('admin')
                      return (
                        <div
                          key={i}
                          style={{
                            background: isSupport ? '#f0f9f8' : '#fff',
                            border: '1px solid var(--line)',
                            borderLeft: isSupport ? '3px solid var(--teal)' : '3px solid #64748b',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: isSupport ? 'var(--teal)' : '#334155' }}>{resp.sender || 'Staff'}</strong>
                              {isSupport && (
                                <span style={{ fontSize: '9px', background: 'var(--soft-teal)', color: 'var(--teal)', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                  Support Desk
                                </span>
                              )}
                            </div>
                            <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                              {resp.time ? (resp.time.length > 20 ? new Date(resp.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : resp.time) : 'Recent'}
                            </small>
                          </div>
                          <p style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{resp.text}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Reply Box Composer */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: 'auto' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <textarea
                    rows={2}
                    className="text-input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', resize: 'vertical' }}
                    placeholder="Type official HR / IT resolution response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault()
                        sendReply()
                      }
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Tip: Press Ctrl+Enter to send response</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button onClick={sendReply} disabled={!replyText.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Send size={13} /> Send Response
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="leave-detail-empty" style={{ margin: 'auto' }}>
              <Ticket size={32} style={{ opacity: 0.4, margin: '0 auto 10px', display: 'block' }} />
              <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>Select a Support Ticket</strong>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Choose an inquiry from the queue to view full thread and submit resolution.</span>
            </div>
          )}
        </div>
      </section>
        </>
      )}

      {/* RAISE SUPPORT TICKET MODAL */}
      {showCreateModal && (
        <div className="payslip-voucher-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="payslip-voucher" style={{ maxWidth: '560px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #E1F1F0 0%, #CEEAE8 100%)', color: 'var(--teal)' }}>
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="modal-title-text">Log Support Desk Ticket</h3>
                  <p className="modal-subtitle-text">Create and assign a ticket on behalf of staff or departmental queues</p>
                </div>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowCreateModal(false)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit}>
              <div className="modal-body-premium">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>Subject / Inquiry Summary</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500 }}>Required</span>
                  </div>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="e.g., VPN Access Disconnected / Salary Slip Query..."
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2col">
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Category</label>
                    <select
                      className="select-control"
                      style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    >
                      <option value="IT Support">💻 IT & Hardware</option>
                      <option value="HR Policies">👥 HR & People Policy</option>
                      <option value="Payroll">💰 Payroll & Compensation</option>
                      <option value="Facilities">🏢 Workplace & Facilities</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Priority Level</label>
                    <select
                      className="select-control"
                      style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    >
                      <option value="Low">🟢 Low Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="High">🟠 High Priority</option>
                      <option value="Urgent">🔴 Urgent Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Assign Requester Employee</label>
                  <select
                    className="select-control"
                    style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                    value={newTicket.employeeId}
                    onChange={(e) => {
                      const emp = (storeState.employees || []).find((x) => x.id === e.target.value || x.employeeId === e.target.value)
                      setNewTicket({
                        ...newTicket,
                        employeeId: e.target.value,
                        employeeName: emp?.name || '',
                      })
                    }}
                  >
                    <option value="">Select Employee...</option>
                    {(storeState.employees || []).map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeId}) • {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>Detailed Description</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                      {newTicket.description?.length > 0 ? `${newTicket.description.length} characters` : 'Troubleshooting context'}
                    </span>
                  </div>
                  <textarea
                    className="text-input"
                    rows={4}
                    placeholder="Provide all relevant details to help the support desk troubleshoot effectively:&#10;• Root cause or problem details...&#10;• Hardware asset ID or relevant application..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    style={{
                      width: '100%',
                      minHeight: '96px',
                      maxHeight: '180px',
                      resize: 'vertical',
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                    }}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer-premium">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newTicket.subject.trim() || !newTicket.description.trim()}>
                  <Send size={13} /> Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ==========================================
// 8. ANNOUNCEMENTS MODULE
// ==========================================
function AnnouncementsModule() {
  const { user } = useAuth()
  const isManagerOrAdmin = ['admin', 'hr'].includes(user?.role)
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [announcementToDelete, setAnnouncementToDelete] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [audienceFilter, setAudienceFilter] = useState('all')

  const [annForm, setAnnForm] = useState({
    title: '',
    category: 'News',
    targetAudience: 'All Employees',
    content: '',
    priority: 'Normal',
    pinned: false,
  })

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const departments = storeState.departments?.length ? storeState.departments : (hrStore.getDepartments ? hrStore.getDepartments() : [])

  const showNotice = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 4000)
  }

  const handleCreate = workspaceHandler(async (e) => {
    e.preventDefault()
    if (!annForm.title.trim() || !annForm.content.trim()) return
    await hrStore.createAnnouncement({
      ...annForm,
      title: annForm.title.trim(),
      content: annForm.content.trim(),
      author: user?.displayName || user?.name || 'HR Operations',
    })
    setShowCreateModal(false)
    setAnnForm({ title: '', category: 'News', targetAudience: 'All Employees', content: '', priority: 'Normal', pinned: false })
    showNotice('Announcement published and broadcast to enterprise feed.')
  })

  const handleUpdate = workspaceHandler(async (e) => {
    e.preventDefault()
    if (!editingAnnouncement?.id || !editingAnnouncement.title?.trim() || !editingAnnouncement.content?.trim()) return
    await hrStore.updateAnnouncement(editingAnnouncement.id, {
      title: editingAnnouncement.title.trim(),
      content: editingAnnouncement.content.trim(),
      category: editingAnnouncement.category,
      priority: editingAnnouncement.priority || 'Normal',
      targetAudience: editingAnnouncement.targetAudience || 'All Employees',
      pinned: Boolean(editingAnnouncement.pinned),
    })
    setEditingAnnouncement(null)
    showNotice('Announcement updated successfully.')
  })

  const handleDelete = workspaceHandler(async () => {
    if (!announcementToDelete?.id) return
    await hrStore.deleteAnnouncement(announcementToDelete.id)
    setAnnouncementToDelete(null)
    showNotice('Announcement permanently removed.')
  })

  const handleTogglePin = workspaceHandler(async (id, currentPinned) => {
    await hrStore.togglePinAnnouncement(id, !currentPinned)
    showNotice(currentPinned ? 'Announcement unpinned.' : 'Announcement pinned to top of feed.')
  })

  const handleLike = workspaceHandler(async (id) => {
    await hrStore.likeAnnouncement(id)
  })

  const handleRecreate = (ann) => {
    setAnnForm({
      title: ann.title?.startsWith('[Re]') ? ann.title : `[Re] ${ann.title}`,
      category: ann.category || 'News',
      targetAudience: ann.targetAudience || 'All Employees',
      content: ann.content || '',
      priority: ann.priority || 'Normal',
      pinned: Boolean(ann.pinned),
    })
    setShowCreateModal(true)
    showNotice(`Loaded "${ann.title}" into creator. Adjust details and broadcast.`)
  }

  const rawAnnouncements = storeState.announcements || []

  // Metrics
  const totalCount = rawAnnouncements.length
  const pinnedCount = rawAnnouncements.filter((a) => a.pinned).length
  const newsCount = rawAnnouncements.filter((a) => a.category === 'News' || a.category === 'Company News').length
  const urgentCount = rawAnnouncements.filter((a) => a.priority === 'High' || a.priority === 'Urgent').length

  // Sort pinned to top, then by date descending
  const sorted = [...rawAnnouncements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return (b.date || '').localeCompare(a.date || '')
  })

  const filteredAnnouncements = sorted.filter((ann) => {
    if (categoryFilter !== 'all' && ann.category !== categoryFilter) return false
    if (audienceFilter !== 'all' && ann.targetAudience !== audienceFilter && ann.targetAudience !== 'All Employees') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        ann.title?.toLowerCase().includes(q) ||
        ann.content?.toLowerCase().includes(q) ||
        ann.author?.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <PageHeader
        eyebrow="Internal Communications"
        title="Company Announcements & Broadcasts"
        description="Share official news, policy updates, cultural events, townhalls, and holiday notices across the enterprise."
      >
        {isManagerOrAdmin && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Announcement
          </Button>
        )}
      </PageHeader>

      {/* KPI Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Broadcasts</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
        </div>
        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pinned by Leadership</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: '4px' }}>{pinnedCount}</div>
        </div>
        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Company News</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>{newsCount}</div>
        </div>
        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Urgent Notices</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626', marginTop: '4px' }}>{urgentCount}</div>
        </div>
      </div>

      {/* Action Notice */}
      {feedback && (
        <div style={{ padding: '10px 14px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
          {feedback}
        </div>
      )}

      {/* Search & Filters */}
      <div className="panel" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid var(--border)', borderRadius: '6px' }}
          >
            <option value="all">All Categories</option>
            <option value="News">Company News</option>
            <option value="Policy">Policy & Compliance</option>
            <option value="Event">Event & Townhall</option>
            <option value="Holiday">Holiday Notice</option>
            <option value="General">General Office Notice</option>
            <option value="Celebration">Celebration & Milestones</option>
          </select>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid var(--border)', borderRadius: '6px' }}
          >
            <option value="all">All Audiences</option>
            <option value="All Employees">All Employees</option>
            {departments.map((dept) => (
              <option key={dept.id || dept.deptId || dept.name} value={dept.name}>
                {dept.name}
              </option>
            ))}
            <option value="Managers">People Managers</option>
          </select>

          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Showing {filteredAnnouncements.length} of {rawAnnouncements.length} broadcasts
          </span>
        </div>

        <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: '11px', border: '1px solid var(--border)', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredAnnouncements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', border: '1px dashed var(--line)', borderRadius: '12px' }}>
            <Megaphone size={40} style={{ color: 'var(--muted)', margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>No announcements found</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              {searchQuery ? 'Try clearing your search query or filters.' : 'No company announcements have been broadcasted yet.'}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="panel"
              style={{
                padding: '22px',
                position: 'relative',
                border: ann.pinned ? '1px solid var(--teal)' : '1px solid var(--line)',
                boxShadow: ann.pinned ? '0 3px 12px rgba(2, 132, 199, 0.08)' : 'none',
              }}
            >
              {/* Top Tags Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {ann.pinned && (
                    <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📌 Pinned by Leadership
                    </span>
                  )}
                  <StatusBadge tone={ann.category === 'Holiday' ? 'warning' : ann.category === 'Policy' ? 'danger' : 'info'}>
                    {ann.category}
                  </StatusBadge>
                  {ann.priority === 'High' || ann.priority === 'Urgent' ? (
                    <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                      🔥 {ann.priority}
                    </span>
                  ) : null}
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Target: <strong>{ann.targetAudience}</strong> • {ann.date || 'Recent'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleLike(ann.id)}
                    style={{
                      border: '1px solid var(--line)',
                      background: '#fff',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title="Like this announcement"
                  >
                    <Heart size={13} style={{ color: (ann.likes > 0 || ann.liked) ? '#ef4444' : 'var(--muted)', fill: (ann.likes > 0 || ann.liked) ? '#ef4444' : 'transparent' }} />
                    <strong>{ann.likes || 0}</strong>
                  </button>

                  {isManagerOrAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRecreate(ann)}
                        style={{
                          border: '1px solid var(--line)',
                          background: '#fff',
                          color: '#0284c7',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Re-create / Duplicate this announcement"
                      >
                        <Copy size={13} />
                        <span>Re-create</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePin(ann.id, Boolean(ann.pinned))}
                        style={{
                          border: '1px solid var(--line)',
                          background: ann.pinned ? '#e0f2fe' : '#fff',
                          color: ann.pinned ? '#0284c7' : '#64748b',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                        title={ann.pinned ? 'Unpin announcement' : 'Pin to top of feed'}
                      >
                        {ann.pinned ? 'Unpin' : '📌 Pin'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingAnnouncement({ ...ann })}
                        style={{
                          border: '1px solid var(--line)',
                          background: '#fff',
                          color: '#475569',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                        title="Edit announcement"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setAnnouncementToDelete(ann)}
                        style={{
                          border: '1px solid var(--line)',
                          background: '#fff',
                          color: '#ef4444',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                        title="Delete announcement"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Body */}
              <h3 style={{ margin: '0 0 8px', fontSize: '17px', color: '#0f172a' }}>{ann.title}</h3>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {ann.content}
              </p>

              {/* Author footer */}
              <div style={{ fontSize: '11px', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  Broadcasted by: <strong style={{ color: '#0f172a' }}>{ann.author || 'HR Management'}</strong>
                </span>
                {ann.updatedAt && (
                  <span style={{ fontSize: '10px' }}>
                    Edited on {new Date(ann.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / RECREATE ANNOUNCEMENT MODAL */}
      {showCreateModal && (
        <div className="hr-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="hr-modal" style={{ width: 'min(100%, 640px)' }} onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h2>Post Company Announcement</h2>
              <button className="icon-button" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="hr-modal-body">
                <Field label="Announcement Title" required>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 All-Hands Meeting & Awards Ceremony"
                    value={annForm.title}
                    onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Category" required>
                    <select value={annForm.category} onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}>
                      <option value="News">Company News</option>
                      <option value="Policy">Policy & Compliance</option>
                      <option value="Event">Event & Townhall</option>
                      <option value="Holiday">Holiday Notice</option>
                      <option value="General">General Office Notice</option>
                      <option value="Celebration">Celebration & Milestones</option>
                    </select>
                  </Field>
                  <Field label="Target Audience" required>
                    <select value={annForm.targetAudience} onChange={(e) => setAnnForm({ ...annForm, targetAudience: e.target.value })}>
                      <option value="All Employees">All Employees (Company-Wide)</option>
                      {departments.map((dept) => (
                        <option key={dept.id || dept.deptId || dept.name} value={dept.name}>
                          {dept.name} Department
                        </option>
                      ))}
                      <option value="Managers">People Managers & Team Leads</option>
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Priority Level">
                    <select value={annForm.priority} onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}>
                      <option value="Normal">Normal Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent / Action Required</option>
                    </select>
                  </Field>
                  <Field label="Leadership Pin">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', cursor: 'pointer', fontSize: '12px' }}>
                      <input
                        type="checkbox"
                        checked={annForm.pinned}
                        onChange={(e) => setAnnForm({ ...annForm, pinned: e.target.checked })}
                      />
                      <span>Pin to top of feed</span>
                    </label>
                  </Field>
                </div>

                <Field label="Announcement Content" required>
                  <textarea
                    rows={5}
                    required
                    placeholder="Write detailed announcement message for employees..."
                    value={annForm.content}
                    onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  />
                </Field>
              </div>
              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit">Broadcast Announcement</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL */}
      {editingAnnouncement && (
        <div className="hr-modal-backdrop" onClick={() => setEditingAnnouncement(null)}>
          <div className="hr-modal" style={{ width: 'min(100%, 640px)' }} onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h2>Edit Company Announcement</h2>
              <button className="icon-button" onClick={() => setEditingAnnouncement(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="hr-modal-body">
                <Field label="Announcement Title" required>
                  <input
                    type="text"
                    required
                    value={editingAnnouncement.title}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Category" required>
                    <select value={editingAnnouncement.category} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value })}>
                      <option value="News">Company News</option>
                      <option value="Policy">Policy & Compliance</option>
                      <option value="Event">Event & Townhall</option>
                      <option value="Holiday">Holiday Notice</option>
                      <option value="General">General Office Notice</option>
                      <option value="Celebration">Celebration & Milestones</option>
                    </select>
                  </Field>
                  <Field label="Target Audience" required>
                    <select value={editingAnnouncement.targetAudience} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, targetAudience: e.target.value })}>
                      <option value="All Employees">All Employees (Company-Wide)</option>
                      {departments.map((dept) => (
                        <option key={dept.id || dept.deptId || dept.name} value={dept.name}>
                          {dept.name} Department
                        </option>
                      ))}
                      <option value="Managers">People Managers & Team Leads</option>
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Priority Level">
                    <select value={editingAnnouncement.priority || 'Normal'} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, priority: e.target.value })}>
                      <option value="Normal">Normal Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent / Action Required</option>
                    </select>
                  </Field>
                  <Field label="Leadership Pin">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', cursor: 'pointer', fontSize: '12px' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(editingAnnouncement.pinned)}
                        onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, pinned: e.target.checked })}
                      />
                      <span>Pin to top of feed</span>
                    </label>
                  </Field>
                </div>

                <Field label="Announcement Content" required>
                  <textarea
                    rows={5}
                    required
                    value={editingAnnouncement.content}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                  />
                </Field>
              </div>
              <div className="hr-modal-footer">
                <Button variant="secondary" onClick={() => setEditingAnnouncement(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmationDialog
        open={Boolean(announcementToDelete)}
        title="Delete Announcement"
        message={`Are you sure you want to permanently delete "${announcementToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete Broadcast"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setAnnouncementToDelete(null)}
      />
    </div>
  )
}

// ==========================================
// 9. HOLIDAY CALENDAR MODULE
// ==========================================
function HolidaysModule() {
  const { user } = useAuth()
  const canManage = Boolean(user && (user.role === 'admin' || user.role === 'hr' || user.role === 'operations_executive'))

  return (
    <>
      <PageHeader
        eyebrow="Time Off Schedules"
        title="Company Holiday Calendar"
        description="Official company holiday schedule with published flyers, national observances, and festival calendar gallery."
      />

      <HolidayCalendarShowcase canManage={canManage} user={user} />
    </>
  )
}

// ==========================================
// 10. COMPANY DOCUMENTS MODULE
// ==========================================
function DocumentsModule() {
  const { user } = useAuth()
  return <CompanyDocumentsView user={user} />
}

// ==========================================
// 11. HR SETTINGS & WI-FI MANAGEMENT MODULE
// ==========================================
function SettingsModule() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [newSsid, setNewSsid] = useState('')
  const [savedNotice, setSavedNotice] = useState(false)

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const addSsid = storeAction(async (e) => {
    e.preventDefault()
    if (!newSsid.trim()) return
    await hrStore.addWifiSSID(newSsid.trim())
    setNewSsid('')
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 3000)
  })

  const removeSsid = storeAction(async (ssid) => {
    await hrStore.removeWifiSSID(ssid)
  })

  return (
    <>
      <PageHeader
        eyebrow="System Configuration"
        title="HR Policy & Attendance Wi-Fi Setup"
        description="Configure verified office Wi-Fi networks for seamless attendance authentication, shift rules, and leave quotas."
      />

      {savedNotice && (
        <div style={{ background: 'var(--soft-teal)', color: 'var(--teal)', padding: '10px 14px', borderRadius: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> Office Wi-Fi settings updated! Employees on this network will auto-verify presence.
        </div>
      )}

      {/* WI-FI SSID CONFIGURATION (From Flowchart) */}
      <section className="panel" style={{ marginBottom: '18px' }}>
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Geofence & Network</p>
            <h2>Office Wi-Fi SSID Verification Setup</h2>
          </div>
          <StatusBadge tone="info">Active Guard</StatusBadge>
        </div>
        <p className="foundation-copy" style={{ margin: '8px 0 16px' }}>
          When employees connect to any of these configured Wi-Fi networks and click "Check-In", their physical office attendance is verified automatically without manual approvals.
        </p>

        <form onSubmit={addSsid} style={{ display: 'flex', gap: '8px', marginBottom: '16px', maxWidth: '480px' }}>
          <input
            type="text"
            placeholder="Add new office SSID (e.g. Edufyi-Bangalore-5G)"
            value={newSsid}
            onChange={(e) => setNewSsid(e.target.value)}
            style={{ flex: 1, border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', fontSize: '11px' }}
          />
          <Button type="submit"><Plus size={15} /> Add Wi-Fi SSID</Button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {storeState.companySettings.allowedWifiSSIDs.map((ssid) => (
            <div
              key={ssid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f8f7f2',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={14} style={{ color: 'var(--teal)' }} />
                <strong>{ssid}</strong>
              </div>
              <button
                type="button"
                onClick={() => removeSsid(ssid)}
                style={{ border: 0, background: 'transparent', color: 'var(--coral)', cursor: 'pointer' }}
                title="Remove network"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* LEAVE & ATTENDANCE RULES */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Policy Quotas</p>
            <h2>Workforce Operating Parameters</h2>
          </div>
          <StatusBadge tone="neutral">Enforced</StatusBadge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
          <div style={{ background: '#f8f7f2', padding: '14px', borderRadius: '8px', fontSize: '11px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase' }}>Attendance Policy</span>
            <h4 style={{ margin: '4px 0' }}>Policy Update Pending</h4>
            <small style={{ color: 'var(--teal)' }}>Shift & punch rules pending replacement policy configuration</small>
          </div>
          <div style={{ background: '#f8f7f2', padding: '14px', borderRadius: '8px', fontSize: '11px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase' }}>Annual Leave Quota</span>
            <h4 style={{ margin: '4px 0' }}>27 Days Total</h4>
            <small style={{ color: 'var(--teal)' }}>12 Casual • 10 Sick • 15 Earned</small>
          </div>
          <div style={{ background: '#f8f7f2', padding: '14px', borderRadius: '8px', fontSize: '11px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '9px', textTransform: 'uppercase' }}>Audit Logs Retention</span>
            <h4 style={{ margin: '4px 0' }}>365 Days Rolling</h4>
            <small style={{ color: 'var(--teal)' }}>SOC-2 & ISO 27001 Compliant</small>
          </div>
        </div>
      </section>
    </>
  )
}

// ==========================================
// MASTER WORKSPACE MODULE ROUTER
// ==========================================
export function WorkspaceModulePage({ route }) {
  const p = route.path

  if (p === '/hr/users' || p === '/admin/users' || p.includes('users')) return <AdminUsersModule />
  if (p === '/hr/attendance' || p.includes('attendance')) return <AttendanceModule />
  if (p === '/hr/payroll' || p.includes('payroll') || p.includes('salary')) return <PayrollModule />
  if (p === '/hr/recruitment' || p.includes('recruitment')) return <RecruitmentModule />
  if (p === '/hr/performance' || p.includes('performance')) return <PerformanceWorkspace />
  if (p.includes('reports') || p.includes('expenses')) return <WorkspaceReports />
  if (p.includes('notifications')) return <WorkspaceNotifications />
  if (p === '/hr/tasks' || p.includes('tasks')) return <TasksModule />
  if (p === '/hr/learning' || p.includes('learning') || p.includes('training')) return <LearningModule />
  if (p === '/hr/helpdesk' || p.includes('helpdesk')) return <HelpDeskModule />
  if (p === '/hr/announcements' || p.includes('announcements')) return <AnnouncementsModule />
  if (p === '/hr/holidays' || p.includes('holidays')) return <HolidaysModule />
  if (p === '/hr/documents' || p.includes('documents')) return <DocumentsModule />
  if (p.includes('policies')) return <CompanyPoliciesView />
  if (p === '/hr/settings' || p.includes('settings')) return <SettingsModule />

  // Fallback module view
  return (
    <>
      <PageHeader eyebrow="HR Workspace" title={route.label} description={route.description} />
      <div className="panel">
        <EmptyState title={`${route.label} is fully active`} message="This module is integrated with the central HR store." />
      </div>
    </>
  )
}
