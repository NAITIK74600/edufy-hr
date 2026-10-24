import { useEffect, useState, useMemo, useRef } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Clock3,
  Coffee,
  Compass,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Heart,
  HelpCircle,
  Laptop,
  LocateFixed,
  Lock,
  Unlock,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquare,
  Navigation,
  Network,
  Paperclip,
  Pause,
  Phone,
  Play,
  Plus,
  Printer,
  Radio,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Ticket,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Utensils,
  Wallet,
  WalletCards,
  Wifi,
  BookOpen,
  Trash2,
  X,
} from 'lucide-react'
import {
  Button,
  DataTable,
  EmptyState,
  Field,
  PageHeader,
  StatusBadge,
} from '../components/ui'
import { useAuth } from '../auth/AuthContext'
import { hrStore } from '../services/hrStore'
import { workspaceAction } from '../services/workspaceStore'
import { PerformanceWorkspace } from '../components/WorkspaceRecords'
import { apiClient } from '../services/apiClient'
import { todayKey, currentPayrollMonth } from '../services/connectedStore'
import { getTimeOfDayGreeting, getRoleBadgeLabel, resolveUserDisplayName } from '../utils/greeting'
import { formatINR, formatINRRaw, amountInWordsINR } from '../utils/currency'
import { PayslipPreviewModal } from '../components/payroll/PayslipPreviewModal'
import { doesPayrollMatchUser, unmaskBankAccount, findEmployeeForUser } from '../utils/payrollMatcher'
import { OnboardingDossierView } from '../components/OnboardingDossierView'
import { CompanyPoliciesView } from '../components/CompanyPoliciesView'
import { CompanyDocumentsView } from '../components/CompanyDocumentsView'

// ==============================================================
// GPS ATTENDANCE STATION COMPONENT (DEDICATED DUAL VERIFIER + SHIFTS & BREAKS)
// ==============================================================


function formatTimerSeconds(totalSecs) {
  if (!totalSecs || totalSecs < 0) totalSecs = 0
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

function GPSAttendanceStation({ user, todayRecord, onPunch, onStartBreak, onEndBreak, currentTime }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const settings = storeState.companySettings
  const officeNetworkIPs = settings?.officeNetworkIPs || []

  const [customCoords, setCustomCoords] = useState(null)
  const [gpsLive, setGpsLive] = useState(false)
  const [detectingGps, setDetectingGps] = useState(false)
  const [isPunching, setIsPunching] = useState(false)
  const [isBreaking, setIsBreaking] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [permissionStatus, setPermissionStatus] = useState('prompt') // 'granted' | 'prompt' | 'denied' | 'unsupported'
  const [publicIp, setPublicIp] = useState(null)
  const [ipLoading, setIpLoading] = useState(true)
  const [serverVerification, setServerVerification] = useState(null)
  const [disconnectedMinutes, setDisconnectedMinutes] = useState(0)
  const [isAutoPunchedOut, setIsAutoPunchedOut] = useState(false)

  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut
  const isCompleted = !!todayRecord?.checkIn && !!todayRecord?.checkOut
  const isOnBreak = Boolean(todayRecord?.isOnBreak)
  const currentBreak = todayRecord?.currentBreak

  const hasAutoPunchedOut = Boolean(
    isAutoPunchedOut ||
    todayRecord?.autoPunchOut ||
    todayRecord?.punchOutType === 'auto' ||
    todayRecord?.totalHours?.includes('Auto Punch Out') ||
    todayRecord?.notes?.includes('Auto Punch Out')
  )

  // Query location permissions if supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          setPermissionStatus(status.state)
          status.onchange = () => setPermissionStatus(status.state)
        })
        .catch(() => {})
    } else if (typeof navigator !== 'undefined' && !navigator.geolocation) {
      setPermissionStatus('unsupported')
    }
  }, [])

  // Auto-detect the device's public IP and a live GPS fix on mount
  useEffect(() => {
    let active = true
    setIpLoading(true)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!active) return
          setCustomCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: Math.ceil(pos.coords.accuracy) })
          setGpsLive(true)
          setPermissionStatus('granted')
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      )
    }
    return () => { active = false }
  }, [])

  const primaryWifiSSID = settings?.allowedWifiSSIDs?.[0] || 'Edufyi'
  const matchedNetwork = (settings?.wifiNetworks || []).find((n) => n.ssid === primaryWifiSSID)
  const targetBranch = matchedNetwork?.branchName || settings?.locations?.[0]?.name || 'IGNITE CAMPUS'

  async function handleRefreshNetwork(coordsOverride) {
    setIpLoading(true)
    try {
      const coords = coordsOverride || customCoords
      const result = await apiClient.post('/attendance/verify', {
        ...coords,
      })
      setPublicIp(result.data.clientIp)
      setServerVerification(result.data)
      setGpsError('')
    } catch (error) {
      setServerVerification(null)
      setGpsError(error.message)
    } finally { setIpLoading(false) }
  }

  useEffect(() => {
    let active = true
    setIpLoading(true)
    apiClient.post('/attendance/verify', {
      ...customCoords,
    })
      .then((result) => { if (active) { setServerVerification(result.data); setPublicIp(result.data.clientIp) } })
      .catch((error) => { if (active) { setServerVerification(null); setGpsError(error.message) } })
      .finally(() => { if (active) setIpLoading(false) })
    return () => { active = false }
  }, [customCoords, settings])

  // Presence Heartbeat & Auto Punch-Out Detection (2 hours disconnected threshold)
  useEffect(() => {
    if (!isCheckedIn || isCompleted) {
      setDisconnectedMinutes(0)
      return
    }

    const empKey = user?.employeeId || user?.id || 'STAFF'
    const storageKey = `att_disc_since_${empKey}`

    async function evaluatePresence() {
      let coords = customCoords
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          coords = await getFreshCoordinates()
          setCustomCoords(coords)
          setGpsLive(true)
        } catch {}
      }

      try {
        const res = await apiClient.post('/attendance/presence', {
          ...coords,
        })
        const data = res.data?.data || res.data || {}
        setServerVerification(data)
        if (data.clientIp) setPublicIp(data.clientIp)

        if (data.autoPunchedOut) {
          setIsAutoPunchedOut(true)
          if (typeof localStorage !== 'undefined') localStorage.removeItem(storageKey)
          return
        }

        const isOfficeConnected = Boolean(data.isGpsVerified || data.isWifiVerified || data.isIpVerified)
        if (isOfficeConnected) {
          if (typeof localStorage !== 'undefined') localStorage.removeItem(storageKey)
          setDisconnectedMinutes(0)
        } else {
          let since = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null
          if (!since) {
            since = String(Date.now())
            if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey, since)
          }
          const elapsedMins = Math.floor((Date.now() - Number(since)) / 60000)
          setDisconnectedMinutes(elapsedMins)

          if (elapsedMins >= 120) {
            if (typeof localStorage !== 'undefined') localStorage.removeItem(storageKey)
            try {
              await onPunch({
                autoPunchOut: true,
                punchOutReason: 'Auto Punch Out (GPS & WiFi disconnected for 2 hrs)',
              })
              setIsAutoPunchedOut(true)
            } catch (err) {
              setGpsError(err.message)
            }
          }
        }
      } catch (err) {
        let since = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null
        if (!since) {
          since = String(Date.now())
          if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey, since)
        }
        const elapsedMins = Math.floor((Date.now() - Number(since)) / 60000)
        setDisconnectedMinutes(elapsedMins)
        if (elapsedMins >= 120) {
          if (typeof localStorage !== 'undefined') localStorage.removeItem(storageKey)
          try {
            await onPunch({
              autoPunchOut: true,
              punchOutReason: 'Auto Punch Out (GPS & WiFi disconnected for 2 hrs)',
            })
            setIsAutoPunchedOut(true)
          } catch {}
        }
      }
    }

    const timer = setInterval(evaluatePresence, 60000)
    const initTimer = setTimeout(evaluatePresence, 8000)

    return () => {
      clearInterval(timer)
      clearTimeout(initTimer)
    }
  }, [isCheckedIn, isCompleted, customCoords, user])

  const matchedOfficeNet = { label: serverVerification?.matchedNetworkLabel }
  const isRealOfficeIp = Boolean(serverVerification?.isIpVerified)
  const isRealOfficeWifi = Boolean(serverVerification?.isWifiVerified)
  const isOnOfficeNetwork = isRealOfficeIp || isRealOfficeWifi
  const networkLabel = isOnOfficeNetwork
    ? (matchedOfficeNet?.label || (serverVerification?.isWifiVerified ? `${primaryWifiSSID} (${targetBranch})` : `Office Network (${targetBranch})`))
    : (publicIp ? 'External Network' : (ipLoading ? 'Detecting…' : 'Unknown Network'))

  const verification = serverVerification ?? {}
  const isGpsInside = Boolean(verification.isGpsVerified)
  const hasGps = Boolean(verification.hasGps)
  const distance = verification.distanceMeters
  const distanceLabel = distance != null ? `${distance}m` : '—'
  const isWifiVerified = isOnOfficeNetwork
  const primaryLocation = settings?.locations?.[0] || null
  const nearestOfficeName = verification.nearestLocation || primaryLocation?.name || 'Office'

  // Net active work & break timers calculation
  const checkInEpoch = useMemo(() => {
    if (!todayRecord?.checkIn) return null
    if (todayRecord.checkInAt) {
      const parsed = new Date(todayRecord.checkInAt).getTime()
      if (!isNaN(parsed)) return parsed
    }
    try {
      const match = /(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i.exec(todayRecord.checkIn)
      if (match) {
        let h = parseInt(match[1], 10)
        const m = parseInt(match[2], 10)
        const s = match[3] ? parseInt(match[3], 10) : 0
        const meridiem = match[4]?.toUpperCase()
        if (meridiem === 'PM' && h < 12) h += 12
        if (meridiem === 'AM' && h === 12) h = 0
        const d = new Date()
        d.setHours(h, m, s, 0)
        return d.getTime()
      }
    } catch {}
    return null
  }, [todayRecord?.checkIn, todayRecord?.checkInAt])

  const completedBreaksDurationSec = useMemo(() => {
    const list = todayRecord?.breaks || []
    return list.reduce((sum, b) => sum + (Number(b.durationMinutes || 0) * 60), 0)
  }, [todayRecord?.breaks])

  // When on break, freeze work timer at the start of break; when not on break, tick live!
  const currentBreakStartEpoch = useMemo(() => {
    if (!isOnBreak) return null
    if (currentBreak?.startAt) {
      const parsed = new Date(currentBreak.startAt).getTime()
      if (!isNaN(parsed)) return parsed
    }
    return currentTime.getTime()
  }, [isOnBreak, currentBreak?.startAt, currentTime])

  const netWorkSeconds = useMemo(() => {
    if (!checkInEpoch) return 0
    if (isCompleted && todayRecord?.checkOutAt) {
      const endEpoch = new Date(todayRecord.checkOutAt).getTime()
      return Math.max(0, Math.floor((endEpoch - checkInEpoch) / 1000) - completedBreaksDurationSec)
    }
    if (isOnBreak && currentBreakStartEpoch) {
      return Math.max(0, Math.floor((currentBreakStartEpoch - checkInEpoch) / 1000) - completedBreaksDurationSec)
    }
    return Math.max(0, Math.floor((currentTime.getTime() - checkInEpoch) / 1000) - completedBreaksDurationSec)
  }, [checkInEpoch, isCompleted, todayRecord?.checkOutAt, isOnBreak, currentBreakStartEpoch, currentTime, completedBreaksDurationSec])

  const currentBreakSeconds = useMemo(() => {
    if (!isOnBreak || !currentBreakStartEpoch) return 0
    return Math.max(0, Math.floor((currentTime.getTime() - currentBreakStartEpoch) / 1000))
  }, [isOnBreak, currentBreakStartEpoch, currentTime])

  function getFreshCoordinates() {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser or environment.'))
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.ceil(pos.coords.accuracy),
          }
          resolve(coords)
        },
        (err) => {
          let msg = 'Unable to acquire location.'
          if (err.code === 1) {
            msg = 'Location permission was denied. Please allow location access in your browser settings.'
            setPermissionStatus('denied')
          } else if (err.code === 2) {
            msg = 'Location unavailable. Ensure device GPS / Location Services is turned on.'
          } else if (err.code === 3) {
            msg = 'Location request timed out. Please retry in an area with better GPS reception.'
          }
          reject(new Error(msg))
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      )
    })
  }

  async function handleDetectRealGPS() {
    setDetectingGps(true)
    setGpsError('')
    try {
      const coords = await getFreshCoordinates()
      setCustomCoords(coords)
      setGpsLive(true)
      setPermissionStatus('granted')
      await handleRefreshNetwork(coords)
    } catch (err) {
      setGpsError(err.message)
    } finally {
      setDetectingGps(false)
    }
  }

  async function handlePunchClick() {
    if (isPunching || isCompleted) return
    setIsPunching(true)
    setGpsError('')

    if (isCheckedIn) {
      try { await onPunch({}) } catch (error) { setGpsError(error.message) }
      finally { setIsPunching(false) }
      return
    }

    // Live Device GPS Acquisition for Punch-In (cannot be spoofed with presets)
    let currentCoords = null
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        currentCoords = await getFreshCoordinates()
        setCustomCoords(currentCoords)
        setGpsLive(true)
        setPermissionStatus('granted')
      } catch (err) {
        setGpsError(err.message)
        setIsPunching(false)
        return
      }
    } else {
      setGpsError('Real-time geolocation is required to authenticate punch attendance.')
      setIsPunching(false)
      return
    }

    try {
      const result = await apiClient.post('/attendance/verify', {
        ...currentCoords,
      })
      const latestVerification = result.data
      setServerVerification(latestVerification)

      // Strict security: Verification must be validated by the server
      if (!latestVerification.isEligible) {
        setGpsError(latestVerification.message || 'Attendance verification failed: You must be connected to the registered office network and inside the office GPS geofence.')
        setIsPunching(false)
        return
      }

      await Promise.resolve(
        onPunch({
          wifiSSID: isOnOfficeNetwork ? primaryWifiSSID : 'External Network',
          bssid: null,
          publicIp,
          shift: 'General (09:30 AM – 06:30 PM)',
          shiftCode: 'general',
          latitude: currentCoords?.latitude ?? null,
          longitude: currentCoords?.longitude ?? null,
          accuracy: currentCoords?.accuracy ?? null,
          distanceMeters: latestVerification.distanceMeters,
          locationName: latestVerification.nearestLocation || primaryLocation?.name || 'Office',
          gpsData: {
            latitude: currentCoords?.latitude ?? null,
            longitude: currentCoords?.longitude ?? null,
            accuracy: currentCoords?.accuracy ?? null,
            distanceMeters: latestVerification.distanceMeters,
            locationName: latestVerification.nearestLocation || primaryLocation?.name || 'Office',
          },
        })
      )
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message || err.message || 'Error recording attendance. Please try again.'
      setGpsError(serverMsg)
    } finally {
      setIsPunching(false)
    }
  }

  async function handleTakeBreak(type = 'lunch') {
    if (!onStartBreak || isBreaking) return
    setIsBreaking(true)
    setGpsError('')
    try {
      await onStartBreak(type)
    } catch (err) {
      setGpsError(err.message || 'Failed to start break')
    } finally {
      setIsBreaking(false)
    }
  }

  async function handleResumeFromBreak() {
    if (!onEndBreak || isBreaking) return
    setIsBreaking(true)
    setGpsError('')
    try {
      await onEndBreak()
    } catch (err) {
      setGpsError(err.message || 'Failed to end break')
    } finally {
      setIsBreaking(false)
    }
  }

  return (
    <section className="panel punch-station-card">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className={`pulse-indicator ${isOnBreak ? 'warning' : 'online'}`} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: isOnBreak ? '#b45309' : 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isOnBreak ? 'On Break' : 'GPS & Wi-Fi Attendance Station'}
            </span>
            <span className={`wifi-verified-badge ${isWifiVerified ? '' : 'remote'}`} title={publicIp ? `Public IP: ${publicIp}` : 'Detecting network…'}>
              <Wifi size={11} /> {networkLabel}
            </span>
            <span className={`gps-verified-badge ${isGpsInside ? 'in-range' : 'out-range'}`}>
              <MapPin size={11} /> GPS: {hasGps ? `${distanceLabel} (${isGpsInside ? '≤200m Verified' : 'Outside Geofence'})` : 'Not detected'}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: permissionStatus === 'granted' ? 'rgba(29, 138, 122, 0.12)' : permissionStatus === 'denied' ? 'rgba(203, 58, 49, 0.12)' : 'rgba(84, 123, 179, 0.12)',
                color: permissionStatus === 'granted' ? 'var(--teal)' : permissionStatus === 'denied' ? 'var(--coral)' : 'var(--blue)',
              }}
              title="Browser Geolocation Permission Status"
            >
              GPS: {permissionStatus.toUpperCase()}
            </span>
            {hasAutoPunchedOut && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#fef3e2',
                  color: '#b45309',
                  border: '1px solid #fbd38d',
                }}
              >
                Auto Punched Out
              </span>
            )}
          </div>

          {/* DUAL DISPLAY: LIVE WALL CLOCK + LIVE WORK / BREAK TIMER */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '16px', marginTop: '4px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Time</div>
              <div className="live-clock-digits" style={{ fontSize: '28px', lineHeight: 1.1 }}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>

            {isCheckedIn && (
              <div style={{ padding: '6px 12px', background: isOnBreak ? '#fffbeb' : '#eaf4f1', border: `1px solid ${isOnBreak ? '#fde68a' : '#c7ded7'}`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: isOnBreak ? '#92400e' : 'var(--teal)' }}>
                  {isOnBreak ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isOnBreak ? 'Active Work (Paused)' : 'Active Net Work Time'}</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 800, color: isOnBreak ? '#b45309' : 'var(--teal)', marginTop: '2px' }}>
                  {formatTimerSeconds(netWorkSeconds)}
                </div>
              </div>
            )}

            {isOnBreak && (
              <div style={{ padding: '6px 12px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', animation: 'pulse 2s infinite' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#92400e' }}>
                  <Coffee size={12} />
                  <span>On Break</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                  {formatTimerSeconds(currentBreakSeconds)}
                </div>
              </div>
            )}
          </div>

          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • Office: <strong>{nearestOfficeName}</strong>
          </p>
        </div>

        {/* PUNCH & BREAK ACTION BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--muted)', paddingRight: '4px' }}>
              <div>In: <strong>{todayRecord?.checkIn || '–'}</strong></div>
              <div>
                Out: <strong>{todayRecord?.checkOut || '–'}</strong>
                {hasAutoPunchedOut && (
                  <span
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
              {todayRecord?.totalBreakMinutes ? (
                <div style={{ color: '#b45309' }}>Breaks: <strong>{todayRecord.totalBreakMinutes}m</strong></div>
              ) : null}
            </div>

            {/* BREAK CONTROLS (ACTIVE WHEN CHECKED IN) */}
            {isCheckedIn && !isCompleted && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {isOnBreak ? (
                  <button
                    type="button"
                    className="ui-button primary"
                    onClick={handleResumeFromBreak}
                    disabled={isBreaking}
                    style={{ background: '#059669', borderColor: '#059669', minWidth: '150px', height: '44px', fontSize: '12px', fontWeight: 700 }}
                  >
                    <Play size={15} /> Resume Work (End Break)
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ui-button secondary"
                    onClick={() => handleTakeBreak('break')}
                    disabled={isBreaking}
                    title="Take a Break. Work timer will pause until resumed."
                    style={{ height: '44px', fontSize: '13px', fontWeight: 600, color: '#b45309', borderColor: '#fde68a', background: '#fffbeb', minWidth: '120px' }}
                  >
                    <Coffee size={15} /> Take Break
                  </button>
                )}
              </div>
            )}

            {/* MAIN PUNCH BUTTON */}
            <button
              type="button"
              className={`ui-button ${isCheckedIn ? 'secondary' : 'primary'}`}
              onClick={handlePunchClick}
              disabled={isCompleted || isPunching || detectingGps}
              style={{
                minWidth: '150px',
                height: '44px',
                fontSize: '13px',
                fontWeight: 700,
                ...(isCheckedIn ? { background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' } : {}),
              }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 size={16} /> Punched Out Today
                </>
              ) : isPunching ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Verifying...
                </>
              ) : isCheckedIn ? (
                <>
                  <Clock3 size={16} /> Punch Out
                </>
              ) : (
                <>
                  <Clock3 size={16} /> Punch In
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE BREAK STATUS BANNER */}
      {isOnBreak && (
        <div style={{ marginTop: '12px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pause size={16} />
            <span>
              <strong>Break in Progress:</strong> Work timer is currently paused. When you return, click <strong>Resume Work</strong> or punch out.
            </span>
          </div>
          <button
            type="button"
            onClick={handleResumeFromBreak}
            disabled={isBreaking}
            style={{ padding: '4px 10px', borderRadius: '6px', background: '#059669', color: '#fff', border: 0, fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
          >
            Resume Work
          </button>
        </div>
      )}

      {/* AUTO PUNCHED OUT NOTICE BANNER */}
      {hasAutoPunchedOut && (
        <div style={{ marginTop: '12px', background: '#fef3e2', border: '1px solid #fbd38d', color: '#92400e', padding: '9px 13px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, color: '#b45309' }} />
          <div>
            <strong>Auto Punched Out:</strong> Device GPS and Office Wi-Fi were disconnected for 2 hours, so attendance was automatically closed.
          </div>
        </div>
      )}

      {/* DISCONNECTED WARNING BANNER (WHEN ACTIVE) */}
      {isCheckedIn && !isCompleted && disconnectedMinutes > 0 && (
        <div style={{ marginTop: '12px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '9px 13px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, color: '#b45309' }} />
          <div>
            <strong>Office GPS & Wi-Fi Disconnected:</strong> Disconnected for <strong>{disconnectedMinutes} min{disconnectedMinutes === 1 ? '' : 's'}</strong>. If not reconnected within <strong>{Math.max(0, 120 - disconnectedMinutes)} mins</strong> (2 hours total), the system will automatically punch you out.
          </div>
        </div>
      )}

      {/* DUAL GEOFENCE & WI-FI VERIFICATION RADAR */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(29, 138, 122, 0.15)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {/* OFFICE NETWORK (PUBLIC IP) — REAL, AUTO-DETECTED VERIFICATION */}
        <div style={{ background: '#faf9f5', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Wifi size={13} color={isOnOfficeNetwork ? 'var(--teal)' : 'var(--coral)'} /> Office Network Security
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleRefreshNetwork()}
                disabled={ipLoading}
                title="Re-check the current network"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: 'var(--teal)', background: 'transparent', border: 0, cursor: 'pointer' }}
              >
                <RefreshCw size={11} className={ipLoading ? 'animate-spin' : ''} /> {ipLoading ? 'Checking…' : 'Re-check'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: 'var(--muted)' }}>Device IP</span>
            <strong style={{ fontFamily: 'monospace' }}>{ipLoading ? 'Detecting…' : (publicIp || 'Unavailable')}</strong>
          </div>
          {publicIp && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span style={{ color: 'var(--muted)' }}>Office Gateway Subnet</span>
              <strong style={{ fontFamily: 'monospace', color: isOnOfficeNetwork ? 'var(--teal)' : 'var(--muted)' }}>
                {serverVerification?.gatewaySubnet || (publicIp.includes('.') ? `${publicIp.split('.').slice(0, 3).join('.')}.* (/24)` : '—')}
              </strong>
            </div>
          )}

          <div style={{
            fontSize: '10px', fontWeight: 600, padding: '4px 6px', borderRadius: '4px',
            background: isOnOfficeNetwork ? 'rgba(29, 138, 122, 0.1)' : '#fef2f2',
            color: isOnOfficeNetwork ? 'var(--teal)' : '#991b1b',
            border: isOnOfficeNetwork ? '1px solid rgba(29, 138, 122, 0.2)' : '1px solid #fecaca',
          }}>
            {isOnOfficeNetwork
              ? `✓ Authenticated Office Network: ${networkLabel}`
              : `✕ Office Network Verification Failed: Connect to registered office Wi-Fi.`}
          </div>
          <span style={{ fontSize: '9px', color: '#6b7280' }}>
            Each device on Wi-Fi receives a unique device IP (last digits vary), authenticated via the shared office gateway subnet.
          </span>
        </div>

        {/* GPS GEOFENCE RADAR */}
        <div style={{ background: '#faf9f5', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Radio size={13} color={isGpsInside ? 'var(--teal)' : '#c25e00'} /> GPS Geofence (Max {verification.maxAllowedRadius || 200}m)
            </span>
            <span style={{ fontSize: '10px', color: isGpsInside ? 'var(--teal)' : '#c25e00', fontWeight: 600 }}>
              {!hasGps
                ? 'Not detected'
                : isGpsInside
                ? `✓ Verified (${distanceLabel})`
                : distance != null && distance <= (verification.maxAllowedRadius || 200)
                ? `✓ Within Zone (${distanceLabel})`
                : `✕ ${distanceLabel} (Outside ${verification.maxAllowedRadius || 200}m)`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '6px 8px', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--line)', background: '#fff', color: 'var(--muted)' }}>
              {gpsLive && customCoords
                ? <>📍 Live: <strong style={{ color: 'var(--ink)' }}>{customCoords.latitude.toFixed(5)}°, {customCoords.longitude.toFixed(5)}°</strong> (±{customCoords.accuracy || 10}m)</>
                : <>Tap “GPS Detect” to acquire real device coordinates.</>}
            </div>

            <button
              type="button"
              onClick={handleDetectRealGPS}
              disabled={detectingGps || isPunching}
              title="Detect real device GPS coordinates"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: '#fff',
                color: 'var(--teal)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <LocateFixed size={12} className={detectingGps ? 'animate-spin' : ''} />
              {detectingGps ? 'Locating...' : 'GPS Detect'}
            </button>
          </div>
          {gpsError && (
            <div style={{ fontSize: '10px', color: '#b91c1c', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} />
              <span>{gpsError}</span>
            </div>
          )}
        </div>
      </div>

      {/* VERIFICATION SUMMARY CHIP */}
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', background: (isGpsInside && isWifiVerified) ? 'rgba(29, 138, 122, 0.08)' : '#fef2f2', padding: '6px 12px', borderRadius: '6px', border: (isGpsInside && isWifiVerified) ? '1px solid rgba(29, 138, 122, 0.2)' : '1px solid #fecaca' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(isGpsInside && isWifiVerified) ? (
            <ShieldCheck size={14} color="var(--teal)" />
          ) : (
            <AlertCircle size={14} color="#b91c1c" />
          )}
          <span>
            <strong>Punch-In Verification:</strong>{' '}
            {isGpsInside && isWifiVerified
              ? `✓ Ready to Punch In — Dual Verified (Office Network: ${publicIp || 'Verified'} & GPS: ${distanceLabel} within ${verification.maxAllowedRadius || 200}m)`
              : !isWifiVerified && !isGpsInside
              ? `✕ Blocked: Both Office Network and GPS Geofence checks failed`
              : !isWifiVerified
              ? `✕ Blocked: Office Network verification failed (Must connect to registered office Wi-Fi)`
              : `✕ Blocked: GPS Geofence verification failed (${distanceLabel} away, max permitted: ${verification.maxAllowedRadius || 200}m)`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px' }}>
          <span>Accuracy: <strong>{customCoords ? `±${customCoords.accuracy || 8}m` : '—'}</strong></span>
          <span>Coords: {customCoords ? `${customCoords.latitude.toFixed(4)}°, ${customCoords.longitude.toFixed(4)}°` : 'Not detected'}</span>
        </div>
      </div>
    </section>
  )
}

// ==============================================================
// 1. ESS OVERVIEW (HUB)
// ==============================================================
function ESSOverview({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [punchNotice, setPunchNotice] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const empId = user?.employeeId
  const todayStr = todayKey()
  const todayAttendance = storeState.attendance.find((a) => {
    const aEmp = String(a.employeeId || '').toUpperCase()
    const uEmp = String(empId || '').toUpperCase()
    const uId = String(user?.id || '').toUpperCase()
    const aUser = String(a.userId || '').toUpperCase()
    return (
      (uEmp && (aEmp === uEmp || aUser === uEmp)) ||
      (uId && (aUser === uId || aEmp === uId))
    ) && a.date === todayStr
  })

  const recentUserLogs = (storeState.attendance || [])
    .filter((a) => {
      const aEmp = String(a.employeeId || '').toUpperCase()
      const uEmp = String(empId || '').toUpperCase()
      const uId = String(user?.id || '').toUpperCase()
      const aUser = String(a.userId || '').toUpperCase()
      return (
        (uEmp && (aEmp === uEmp || aUser === uEmp)) ||
        (uId && (aUser === uId || aEmp === uId)) ||
        (user?.email && a.email?.toLowerCase() === user.email.toLowerCase())
      )
    })
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, 5)

  const isCheckedIn = !!todayAttendance?.checkIn && !todayAttendance?.checkOut
  const isCompleted = !!todayAttendance?.checkIn && !!todayAttendance?.checkOut

  async function handlePunch(opts = {}) {
    const wifi = opts.wifiSSID || storeState.companySettings?.allowedWifiSSIDs?.[0] || 'Edufyi'
    const bssid = opts.bssid || null
    const publicIp = opts.publicIp || null
    const gps = opts.gpsData
    const shift = 'General (09:30 AM – 06:30 PM)'
    const shiftCode = 'general'
    if (!isCheckedIn && !isCompleted) {
      const rec = await hrStore.checkIn({
        employeeId: empId,
        employeeName: user?.displayName || 'Employee',
        wifiSSID: wifi,
        bssid,
        publicIp,
        date: todayStr,
        latitude: gps?.latitude ?? null,
        longitude: gps?.longitude ?? null,
        accuracy: gps?.accuracy ?? null,
        distanceMeters: gps?.distanceMeters ?? null,
        locationName: gps?.locationName ?? null,
        shift,
        shiftCode,
      })
      setPunchNotice(`Successfully punched in at ${rec?.checkIn || 'now'}! (${rec?.ipVerified ? 'Office network verified' : rec?.gpsVerified ? 'GPS Geofence verified' : 'Recorded'})`)
    } else if (isCheckedIn) {
      const isAuto = Boolean(opts.autoPunchOut)
      await hrStore.checkOut({
        employeeId: empId,
        employeeName: user?.displayName || 'Employee',
        date: todayStr,
        autoPunchOut: isAuto,
        punchOutReason: opts.punchOutReason || (isAuto ? 'Auto Punch Out (GPS & WiFi disconnected for 2 hrs)' : null),
      })
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`att_disc_since_${empId}`)
      }
      setPunchNotice(
        isAuto
          ? 'Auto Punched Out: GPS and Office Wi-Fi were disconnected for 2 hours.'
          : 'Successfully punched out at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    }
    setTimeout(() => setPunchNotice(''), 6000)
  }

  async function handleStartBreak(type = 'lunch') {
    try {
      await hrStore.startBreak(type, todayStr, empId)
      setPunchNotice(`Break started (${type === 'lunch' ? 'Lunch Break' : 'Short Break'}). Work timer is paused.`)
      setTimeout(() => setPunchNotice(''), 5500)
    } catch (err) {
      setPunchNotice(`Break error: ${err.message}`)
      setTimeout(() => setPunchNotice(''), 5500)
    }
  }

  async function handleEndBreak() {
    try {
      await hrStore.endBreak(todayStr, empId)
      setPunchNotice('Break ended. Net work timer resumed!')
      setTimeout(() => setPunchNotice(''), 5500)
    } catch (err) {
      setPunchNotice(`Break error: ${err.message}`)
      setTimeout(() => setPunchNotice(''), 5500)
    }
  }

  const tasks = storeState.tasks || []
  const myTasks = tasks.slice(0, 3)
  const announcements = storeState.announcements || []
  const latestAnnouncements = announcements.slice(0, 3)
  const holidays = (storeState.holidays || []).slice(0, 3)
  const myAttendance = storeState.attendance.filter((record) => record.employeeId === empId && record.date.startsWith(todayKey().slice(0, 7)))
  const presentDays = myAttendance.filter((record) => ['present', 'late', 'half-day'].includes(record.status)).length
  const availableLeave = (storeState.leaveBalances ?? []).reduce((sum, balance) => sum + balance.allowance - balance.used - balance.reserved, 0)
  const userMatchedPayslips = useMemo(() => {
    return (storeState.payroll || []).filter((r) => doesPayrollMatchUser(r, user, storeState.employees))
  }, [storeState.payroll, user, storeState.employees])
  const latestPayslip = userMatchedPayslips[0] || (storeState.payroll || [])[0]
  const netSalary = latestPayslip
    ? (Number(latestPayslip.netPay || latestPayslip.netSalary) || (latestPayslip.earnings ? Object.values(latestPayslip.earnings).reduce((sum, value) => sum + value, 0) - Object.values(latestPayslip.deductions).reduce((sum, value) => sum + value, 0) : 84200))
    : null

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Employee Self-Service (ESS)"
        title={`${getTimeOfDayGreeting()}, ${resolveUserDisplayName(user, storeState.employees)} 👋`}
        description="Welcome to your personal work portal. Track daily attendance, view salary breakdown, request leaves, and review company bulletins."
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="role-badge" style={{ background: '#eaf4f1', color: 'var(--teal)', border: '1px solid #c7ded7' }}>
            {getRoleBadgeLabel(user?.role)}
          </span>
          <a href="#/employee/profile" className="ui-button secondary">
            <User size={13} /> My Profile
          </a>
        </div>
      </PageHeader>

      {/* QUICK PUNCH STATION HERO WITH GPS & WI-FI DUAL VERIFICATION */}
      <GPSAttendanceStation
        user={user}
        todayRecord={todayAttendance}
        onPunch={handlePunch}
        onStartBreak={handleStartBreak}
        onEndBreak={handleEndBreak}
        currentTime={currentTime}
      />
      {punchNotice && (
        <div style={{ background: '#eaf4f1', border: '1px solid #c7ded7', color: 'var(--teal)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={15} />
          <span>{punchNotice}</span>
        </div>
      )}

      {/* METRIC GRID */}
      <section className="metric-grid">
        <a href="#/employee/attendance" className="metric-card metric-link">
          <div className="metric-icon" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
            <Clock3 size={20} />
          </div>
          <div className="metric-copy">
            <span>Attendance Rate</span>
            <strong>{myAttendance.length ? `${Math.round(presentDays / myAttendance.length * 100)}%` : '-'}</strong>
            <small>{presentDays} / {myAttendance.length} recorded days this month</small>
          </div>
          <ArrowRight size={14} className="metric-link-icon" />
        </a>

        <a href="#/employee/leave" className="metric-card metric-link">
          <div className="metric-icon" style={{ background: '#eef2f6', color: 'var(--blue)' }}>
            <CalendarDays size={20} />
          </div>
          <div className="metric-copy">
            <span>Leave Balance</span>
            <strong>{availableLeave} Days</strong>
            <small>Saved allowance minus used and reserved leave</small>
          </div>
          <ArrowRight size={14} className="metric-link-icon" />
        </a>

        <a href="#/employee/tasks" className="metric-card metric-link">
          <div className="metric-icon" style={{ background: '#fbf3e6', color: '#b97926' }}>
            <FileText size={20} />
          </div>
          <div className="metric-copy">
            <span>Active Tasks</span>
            <strong>3 Pending</strong>
            <small>Sprint cycle deliverables</small>
          </div>
          <ArrowRight size={14} className="metric-link-icon" />
        </a>

        <a href="#/employee/salary" className="metric-card metric-link">
          <div className="metric-icon" style={{ background: '#f6eff7', color: '#88438e' }}>
            <WalletCards size={20} />
          </div>
          <div className="metric-copy">
            <span>Net Monthly Salary</span>
            <strong>{netSalary === null ? 'Not finalized' : formatINR(netSalary)}</strong>
            <small>{latestPayslip?.month ?? 'No finalized payslip available'}</small>
          </div>
          <ArrowRight size={14} className="metric-link-icon" />
        </a>
      </section>

      {/* QUICK ACTIONS ROW */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <a href="#/employee/leave" className="ui-button secondary" style={{ fontSize: '11px' }}>
          <CalendarDays size={13} /> Apply for Leave
        </a>
        <a href="#/employee/expenses" className="ui-button secondary" style={{ fontSize: '11px' }}>
          <Receipt size={13} /> Submit Expense Claim
        </a>
        <a href="#/employee/salary" className="ui-button secondary" style={{ fontSize: '11px' }}>
          <Download size={13} /> View Latest Payslip
        </a>
        <a href="#/employee/documents" className="ui-button secondary" style={{ fontSize: '11px' }}>
          <FileCheck size={13} /> Company Policies & NDA
        </a>
      </div>

      {/* TWO-COLUMN WORKSPACE GRID */}
      <section className="dashboard-grid">
        <div style={{ display: 'grid', gap: '18px' }}>
          {/* ASSIGNED TASKS */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Deliverables</p>
                <h2>My Active Tasks</h2>
              </div>
              <a href="#/employee/tasks" className="panel-footer-link">
                View all tasks <ArrowRight size={12} />
              </a>
            </div>
            <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
              {myTasks.map((t) => (
                <div key={t.id} className="task-row-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      className={`task-check-circle ${t.status === 'completed' ? 'checked' : ''}`}
                      onClick={workspaceAction(hrStore, () => hrStore.updateTaskStatus(t.id, t.status === 'completed' ? 'in_progress' : 'completed'))}
                      title="Toggle task completion"
                    >
                      {t.status === 'completed' && <Check size={12} />}
                    </button>
                    <div>
                      <strong style={{ fontSize: '13px', textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? 'var(--muted)' : 'var(--ink)' }}>
                        {t.title}
                      </strong>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>Due: {t.dueDate || 'This week'}</span>
                        <span>•</span>
                        <span>Assigned by {t.assignedBy || 'Manager'}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge tone={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'neutral'}>
                    {t.priority || 'Normal'}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>

          {/* ATTENDANCE RECENT LOG */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Log History</p>
                <h2>Recent Attendance Records</h2>
              </div>
              <a href="#/employee/attendance" className="panel-footer-link">
                Full attendance sheet <ArrowRight size={12} />
              </a>
            </div>
            <div style={{ marginTop: '14px', overflowX: 'auto' }}>
              <table className="ui-table compact">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUserLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--muted)', fontSize: '12px' }}>
                        No attendance records logged yet. Use the Punch In button above to record your attendance.
                      </td>
                    </tr>
                  ) : (
                    recentUserLogs.map((log) => (
                      <tr key={log.id || log._id || log.date}>
                        <td><strong>{log.date}</strong></td>
                        <td>{log.checkIn || '–'}</td>
                        <td>{log.checkOut || '–'}</td>
                        <td>{log.totalHours || '–'}</td>
                        <td>
                          <StatusBadge tone={log.status === 'present' ? 'success' : log.status === 'late' ? 'warning' : log.status === 'half_day' ? 'info' : 'neutral'}>
                            {log.status === 'present' ? 'Present' : log.status === 'late' ? 'Late In' : log.status === 'half_day' ? 'Half Day' : (log.status || 'Present')}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'grid', gap: '18px' }}>
          {/* ANNOUNCEMENTS */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Company Pulse</p>
                <h2>Announcements</h2>
              </div>
              <a href="#/employee/announcements" className="panel-footer-link">
                All bulletins <ArrowRight size={12} />
              </a>
            </div>
            <div style={{ display: 'grid', gap: '12px', marginTop: '14px' }}>
              {latestAnnouncements.map((a) => (
                <div key={a.id} className="announcement-mini-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <strong style={{ fontSize: '12px' }}>{a.title}</strong>
                    <span style={{ fontSize: '9px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{a.date}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 6px', lineHeight: 1.4 }}>
                    {a.content?.slice(0, 100)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="role-badge" style={{ fontSize: '9px', background: '#f5f8f7', color: 'var(--teal)' }}>
                      {a.category || 'Company'}
                    </span>
                    <button
                      type="button"
                      className="announcement-like-btn"
                      onClick={workspaceAction(hrStore, () => hrStore.likeAnnouncement(a.id))}
                      title="Cheer this announcement"
                    >
                      <Heart size={11} fill={a.likes > 0 ? '#e05345' : 'none'} color={a.likes > 0 ? '#e05345' : 'currentColor'} />
                      <span>{a.likes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UPCOMING HOLIDAYS */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Calendar</p>
                <h2>Upcoming Holidays</h2>
              </div>
              <span className="role-badge" style={{ fontSize: '10px' }}>2026 Schedule</span>
            </div>
            <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
              {holidays.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#faf9f5', borderRadius: '6px', fontSize: '11px' }}>
                  <div>
                    <strong>{h.name || h.title}</strong>
                    <div style={{ fontSize: '9px', color: 'var(--muted)' }}>{h.day || 'National Holiday'}</div>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--teal)' }}>{h.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ==============================================================
// 2. ESS ATTENDANCE VIEW
// ==============================================================
function ESSAttendanceView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [selectedMonth, setSelectedMonth] = useState(currentPayrollMonth)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [punchNotice, setPunchNotice] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const empId = user?.employeeId
  const todayStr = todayKey()
  const todayRecord = storeState.attendance.find((a) => a.employeeId === empId && a.date === todayStr)

  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut
  const isCompleted = !!todayRecord?.checkIn && !!todayRecord?.checkOut

  async function handlePunch(opts = {}) {
    const wifi = opts.wifiSSID || storeState.companySettings?.allowedWifiSSIDs?.[0] || 'Edufyi'
    const bssid = opts.bssid || null
    const publicIp = opts.publicIp || null
    const gps = opts.gpsData
    const shift = opts.shift || 'General (09:30 AM – 06:30 PM)'
    const shiftCode = opts.shiftCode || 'general'
    if (!isCheckedIn && !isCompleted) {
      const rec = await hrStore.checkIn({
        employeeId: empId,
        employeeName: user?.displayName || 'Employee',
        wifiSSID: wifi,
        bssid,
        publicIp,
        date: todayStr,
        latitude: gps?.latitude ?? null,
        longitude: gps?.longitude ?? null,
        accuracy: gps?.accuracy ?? null,
        distanceMeters: gps?.distanceMeters ?? null,
        locationName: gps?.locationName ?? null,
        shift,
        shiftCode,
      })
      setPunchNotice(`Successfully punched in at ${rec?.checkIn || 'now'}! (${rec?.ipVerified ? 'Office network verified' : rec?.gpsVerified ? 'GPS Geofence verified' : 'Recorded'}, Shift: ${rec?.shift || shift})`)
    } else if (isCheckedIn) {
      await hrStore.checkOut({
        employeeId: empId,
        employeeName: user?.displayName || 'Employee',
        date: todayStr,
      })
      setPunchNotice('Successfully punched out at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    setTimeout(() => setPunchNotice(''), 5500)
  }

  async function handleStartBreak(type = 'lunch') {
    try {
      await hrStore.startBreak(type, todayStr, empId)
      setPunchNotice(`Break started (${type === 'lunch' ? 'Lunch Break' : 'Short Break'}). Work timer is paused.`)
      setTimeout(() => setPunchNotice(''), 5500)
    } catch (err) {
      setPunchNotice(`Break error: ${err.message}`)
      setTimeout(() => setPunchNotice(''), 5500)
    }
  }

  async function handleEndBreak() {
    try {
      await hrStore.endBreak(todayStr, empId)
      setPunchNotice('Break ended. Net work timer resumed!')
      setTimeout(() => setPunchNotice(''), 5500)
    } catch (err) {
      setPunchNotice(`Break error: ${err.message}`)
      setTimeout(() => setPunchNotice(''), 5500)
    }
  }

  const monthlyLogs = storeState.attendance.filter((record) => record.employeeId === empId && record.date.startsWith(todayKey().slice(0, 7))).map((record) => ({
    date: record.date, day: new Date(`${record.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }),
    shift: record.shift || 'General (09:30 AM – 06:30 PM)', in: record.checkIn || '-', out: record.checkOut || '-',
    hours: record.totalHours || '-', wifi: record.ipVerified ? 'Server-verified network' : record.wifiSSID || '-',
    breaks: record.totalBreakMinutes ? `${record.totalBreakMinutes}m` : (record.breaks?.length ? `${record.breaks.length} breaks` : '–'),
    isOnBreak: record.isOnBreak,
    currentBreak: record.currentBreak,
    status: record.status,
  }))
  const completedDurations = monthlyLogs.map((record) => /^(\d+)h (\d+)m/.exec(record.hours)).filter(Boolean).map((match) => Number(match[1]) * 60 + Number(match[2]))
  const averageMinutes = completedDurations.length ? Math.round(completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length) : null
  const approvedRequests = storeState.leaves.filter((leave) => leave.employeeId === empId && leave.status === 'approved' && leave.startDate.slice(0, 7) <= todayKey().slice(0, 7) && leave.endDate.slice(0, 7) >= todayKey().slice(0, 7))

  const filteredLogs = monthlyLogs.filter((log) => {
    if (statusFilter === 'all') return true
    return log.status === statusFilter
  })

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Attendance & Shift Logs"
        title="My Attendance Tracker"
        description="Punch in/out with automatic corporate Wi-Fi authentication and GPS Geofencing (≤ 200m max distance), review monthly timesheets, and view shift metrics."
      />

      {/* PUNCH STATION WITH GPS & WI-FI DUAL VERIFICATION */}
      <GPSAttendanceStation
        user={user}
        todayRecord={todayRecord}
        onPunch={handlePunch}
        onStartBreak={handleStartBreak}
        onEndBreak={handleEndBreak}
        currentTime={currentTime}
      />
      {punchNotice && (
        <div style={{ background: '#eaf4f1', border: '1px solid #c7ded7', color: 'var(--teal)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={15} />
          <span>{punchNotice}</span>
        </div>
      )}

      {/* MONTH STATS */}
      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-copy">
            <span>Days Present</span>
            <strong>{monthlyLogs.filter((record) => ['present', 'late'].includes(record.status)).length} Days</strong>
            <small>Recorded this month</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fbf3e6', color: '#b97926' }}>
            <Clock3 size={20} />
          </div>
          <div className="metric-copy">
            <span>Late In</span>
            <strong>{monthlyLogs.filter((record) => record.status === 'late').length} Days</strong>
            <small>Recorded late arrivals</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fcf0f0', color: '#cb3a31' }}>
            <CalendarDays size={20} />
          </div>
          <div className="metric-copy">
            <span>Approved Leaves</span>
            <strong>{approvedRequests.length} Requests</strong>
            <small>Approved leave overlapping this month</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eef2f6', color: 'var(--blue)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="metric-copy">
            <span>Avg Working Hours</span>
            <strong>{averageMinutes === null ? '-' : `${Math.floor(averageMinutes / 60)}h ${averageMinutes % 60}m`}</strong>
            <small>Completed punches this month</small>
          </div>
        </div>
      </section>

      {/* DETAILED ATTENDANCE TABLE & MOBILE CARDS */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Timesheet</p>
            <h2>Monthly Attendance Log</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="select-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="late">Late In Only</option>
              <option value="half-day">Half Day</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Mobile Attendance Cards */}
        <div className="attendance-cards-mobile" style={{ display: 'none', gap: '10px', marginTop: '14px' }}>
          {filteredLogs.map((row, idx) => (
            <div
              key={idx}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '13px' }}>{row.date}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '6px' }}>({row.day})</span>
                </div>
                <StatusBadge
                  tone={
                    row.status === 'present'
                      ? 'success'
                      : row.status === 'late'
                      ? 'warning'
                      : row.status === 'half_day'
                      ? 'info'
                      : 'danger'
                  }
                >
                  {row.status === 'present' ? 'Present' : row.status === 'late' ? 'Late In' : row.status === 'half_day' ? 'Half Day' : 'On Leave'}
                </StatusBadge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px', background: 'var(--surface-sunken)', padding: '8px 10px', borderRadius: '6px' }}>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>In</span>
                  <strong>{row.in}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Out</span>
                  <strong>{row.out}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Hours</span>
                  <strong style={{ color: 'var(--teal)' }}>{row.hours}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--muted)' }}>
                {row.breaks !== '–' ? <span style={{ color: '#b45309', fontWeight: 600 }}>☕ Break: {row.breaks}</span> : <span />}
                {row.wifi !== '–' && (
                  <span className="wifi-verified-badge" style={{ fontSize: '9px', padding: '2px 6px' }}>
                    <Wifi size={10} /> {row.wifi}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Attendance Table */}
        <div className="attendance-table-desktop" style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Total Work Hours</th>
                <th>Break Taken</th>
                <th>Network Verification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--muted)', fontSize: '12px' }}>
                    No attendance records found for this period.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.date}</strong></td>
                    <td>{row.day}</td>
                    <td>{row.in}</td>
                    <td>{row.out}</td>
                    <td><strong>{row.hours}</strong></td>
                    <td>
                      <span style={{ fontSize: '11px', color: row.breaks !== '–' ? '#b45309' : 'var(--muted)', fontWeight: row.breaks !== '–' ? 600 : 400 }}>
                        {row.breaks}
                      </span>
                    </td>
                    <td>
                      {row.wifi !== '–' ? (
                        <span className="wifi-verified-badge" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          <Wifi size={10} /> {row.wifi}
                        </span>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td>
                      <StatusBadge
                        tone={
                          row.status === 'present'
                            ? 'success'
                            : row.status === 'late'
                            ? 'warning'
                            : row.status === 'half_day'
                            ? 'info'
                            : 'danger'
                        }
                      >
                        {row.status === 'present' ? 'Present' : row.status === 'late' ? 'Late In' : row.status === 'half_day' ? 'Half Day' : 'On Leave'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ==============================================================
// 3. ESS SALARY & PAYSLIP VIEW
// ==============================================================
function ESSSalaryView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const employee = useMemo(() => {
    return findEmployeeForUser(user, storeState.employees) || user
  }, [storeState.employees, user])

  const userPayrollRecords = useMemo(() => {
    return (storeState.payroll || []).filter(
      (r) => doesPayrollMatchUser(r, user, storeState.employees)
    )
  }, [storeState.payroll, user, storeState.employees])

  const ctcAnnual = 1200000
  const grossMonthly = 100000
  const deductionsMonthly = 15800
  const netMonthly = 84200

  // Combine store records or fallback archive
  const fbGross = employee?.salary ? Math.round(employee.salary / 12) : 100000
  const fbDed = Math.round(fbGross * 0.158)
  const fbNet = fbGross - fbDed
  const fallbackPayslips = [
    { id: `PS-${employee?.employeeId || 'ETS21206'}-2026-10`, month: 'October 2026', gross: fbGross, deductions: fbDed, net: fbNet, payDate: 'Oct 31, 2026', status: 'Processed', accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, '50100488577650') },
    { id: `PS-${employee?.employeeId || 'ETS21206'}-2026-09`, month: 'September 2026', gross: fbGross, deductions: fbDed, net: fbNet, payDate: 'Sep 30, 2026', status: 'Disbursed', accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, '50100488577650') },
    { id: `PS-${employee?.employeeId || 'ETS21206'}-2026-08`, month: 'August 2026', gross: fbGross, deductions: fbDed, net: fbNet, payDate: 'Aug 31, 2026', status: 'Disbursed', accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, '50100488577650') },
    { id: `PS-${employee?.employeeId || 'ETS21206'}-2026-07`, month: 'July 2026', gross: fbGross, deductions: fbDed, net: fbNet, payDate: 'Jul 31, 2026', status: 'Disbursed', accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, '50100488577650') },
    { id: `PS-${employee?.employeeId || 'ETS21206'}-2026-06`, month: 'June 2026', gross: fbGross, deductions: fbDed, net: fbNet, payDate: 'Jun 30, 2026', status: 'Disbursed', accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, '50100488577650') },
  ]

  const displayList = userPayrollRecords.length > 0 ? userPayrollRecords : fallbackPayslips

  const handleOpenPayslip = (ps) => {
    const rawAcc = ps.accountNumber || employee?.bankDetails?.accountNumber || '50100488577650'
    const cleanAcc = unmaskBankAccount(rawAcc, '50100488577650')

    if (ps.earningsList || ps.earnings) {
      setSelectedPayslip({ ...ps, accountNumber: cleanAcc, employeeName: ps.employeeName || employee?.name })
      return
    }
    const basicAmount = Math.round((ps.gross || fbGross) * 0.5)
    const hraAmount = Math.round((ps.gross || fbGross) * 0.25)
    const specialAmount = Math.round((ps.gross || fbGross) * 0.2)
    const conveyanceAmount = (ps.gross || fbGross) - basicAmount - hraAmount - specialAmount

    const pfAmount = Math.min(1800, Math.round(basicAmount * 0.12))
    const ptAmount = 200
    const tdsAmount = Math.max(0, (ps.deductions || fbDed) - pfAmount - ptAmount)

    const synthetic = {
      _id: ps.id || 'PS-ESS',
      id: ps.id || 'PS-ESS',
      month: ps.month || 'October 2026',
      employeeId: employee?.employeeId || user?.employeeId || 'ETS21206',
      employeeName: employee?.name || user?.displayName || 'Employee',
      department: employee?.department || 'Operations',
      designation: employee?.designation || 'Associate',
      bankName: employee?.bankDetails?.bankName || 'HDFC Bank Limited',
      accountNumber: cleanAcc,
      ifscCode: employee?.bankDetails?.ifscCode || 'HDFC0001234',
      panTaxId: employee?.identity?.panNumber || employee?.bankDetails?.panTaxId || 'BROPJ5764Q',
      uanNumber: employee?.identity?.uanNumber || employee?.bankDetails?.uanNumber || '101595355837',
      standardDays: 30,
      payableDays: 30,
      lopDays: 0,
      lopReversalDays: 0,
      arrearDays: 0,
      grossEarnings: ps.gross || fbGross,
      totalDeductions: ps.deductions || fbDed,
      netPay: ps.net || fbNet,
      earningsList: [
        { name: 'Basic Salary', monthlyRate: basicAmount, currentMonth: basicAmount, arrear: 0, total: basicAmount },
        { name: 'House Rent Allowance', monthlyRate: hraAmount, currentMonth: hraAmount, arrear: 0, total: hraAmount },
        { name: 'Special Allowance', monthlyRate: specialAmount, currentMonth: specialAmount, arrear: 0, total: specialAmount },
        { name: 'Conveyance Allowance', monthlyRate: conveyanceAmount, currentMonth: conveyanceAmount, arrear: 0, total: conveyanceAmount },
      ],
      deductionsList: [
        { name: 'Provident Fund (EPF)', amount: pfAmount },
        { name: 'Professional Tax (PT)', amount: ptAmount },
        { name: 'TDS / Income Tax', amount: tdsAmount },
      ],
      status: ps.status || 'Disbursed',
    }
    setSelectedPayslip(synthetic)
  }

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Compensation & Benefits"
        title="My Salary & Payslips"
        description="Review your monthly CTC structure, statutory PF/ESI deductions, and download official corporate salary slips."
      >
        <button
          type="button"
          className="ui-button primary"
          onClick={() => handleOpenPayslip(displayList[0])}
        >
          <FileText size={14} /> View Latest Payslip Voucher
        </button>
      </PageHeader>

      {/* COMPENSATION KPI METRICS */}
      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
            <WalletCards size={20} />
          </div>
          <div className="metric-copy">
            <span>Annual CTC</span>
            <strong>{formatINR(ctcAnnual)}</strong>
            <small>Gross Cost-to-Company</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eef2f6', color: 'var(--blue)' }}>
            <Wallet size={20} />
          </div>
          <div className="metric-copy">
            <span>Monthly Gross</span>
            <strong>{formatINR(grossMonthly)}</strong>
            <small>Fixed monthly component</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fcf0f0', color: '#cb3a31' }}>
            <Receipt size={20} />
          </div>
          <div className="metric-copy">
            <span>Monthly Deductions</span>
            <strong>{formatINR(deductionsMonthly)}</strong>
            <small>PF, PT, TDS & Insurance</small>
          </div>
        </div>

        <div className="metric-card" style={{ borderColor: 'rgba(29, 138, 122, 0.4)', background: '#f5fbf9' }}>
          <div className="metric-icon" style={{ background: 'var(--teal)', color: '#fff' }}>
            <Sparkles size={20} />
          </div>
          <div className="metric-copy">
            <span>Net Take-Home Pay</span>
            <strong style={{ color: 'var(--teal)' }}>{formatINR(netMonthly)}</strong>
            <small>Credited directly to bank A/C</small>
          </div>
        </div>
      </section>

      {/* SALARY BREAKDOWN GRID */}
      <section className="foundation-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Earnings Component</p>
              <h2>Monthly Earnings (Gross)</h2>
            </div>
            <StatusBadge tone="success">{formatINR(grossMonthly)} / mo</StatusBadge>
          </div>
          <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
            <div className="profile-detail-row">
              <span>Basic Salary (50%)</span>
              <strong>{formatINR(50000)}</strong>
            </div>
            <div className="profile-detail-row">
              <span>House Rent Allowance (HRA 25%)</span>
              <strong>{formatINR(25000)}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Special Allowance</span>
              <strong>{formatINR(20000)}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Conveyance Allowance</span>
              <strong>{formatINR(5000)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1px solid var(--line)', fontWeight: 700 }}>
              <span>Total Monthly Earnings</span>
              <span style={{ color: 'var(--teal)' }}>{formatINR(grossMonthly)}</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Statutory & Taxes</p>
              <h2>Deductions & Retentions</h2>
            </div>
            <StatusBadge tone="neutral">{formatINR(deductionsMonthly)} / mo</StatusBadge>
          </div>
          <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
            <div className="profile-detail-row">
              <span>Employee Provident Fund (EPF 12% on Basic)</span>
              <strong>{formatINR(6000)}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Professional Tax (PT Karnataka)</span>
              <strong>{formatINR(200)}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Tax Deducted at Source (TDS / Income Tax)</span>
              <strong>{formatINR(9600)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1px solid var(--line)', fontWeight: 700 }}>
              <span>Total Deductions</span>
              <span style={{ color: '#cb3a31' }}>{formatINR(deductionsMonthly)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATUTORY & BANKING INFO */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Disbursal Account</p>
            <h2>Banking & Statutory Identification</h2>
          </div>
          <StatusBadge tone="info">Direct Deposit Active</StatusBadge>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
          <div style={{ background: '#faf9f5', padding: '12px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Bank Name</span>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>HDFC Bank Limited</div>
          </div>
          <div style={{ background: '#faf9f5', padding: '12px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Account Number</span>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>•••• •••• •••• 4819</div>
          </div>
          <div style={{ background: '#faf9f5', padding: '12px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>IFSC Code</span>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>HDFC0001234</div>
          </div>
          <div style={{ background: '#faf9f5', padding: '12px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Permanent Account No. (PAN)</span>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>ABCDE1234F</div>
          </div>
          <div style={{ background: '#faf9f5', padding: '12px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Universal Account No. (UAN)</span>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>100987654321</div>
          </div>
        </div>
      </section>

      {/* PAYSLIPS ARCHIVE TABLE & MOBILE CARDS */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Disbursals</p>
            <h2>Historical Payslips Archive</h2>
          </div>
        </div>

        {/* Mobile Payslip Cards */}
        <div className="attendance-cards-mobile" style={{ display: 'none', gap: '10px', marginTop: '14px' }}>
          {displayList.map((ps) => {
            const gross = ps.grossEarnings || ps.grossSalary || ps.gross || 0
            const deductions = ps.totalDeductions || ps.deductions || 0
            const net = ps.netPay || ps.netSalary || ps.net || 0
            const id = ps._id || ps.id || 'PS'
            return (
              <div
                key={id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '13px' }}>{ps.month}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Ref: {id}</span>
                  </div>
                  <StatusBadge tone="success">{ps.status || 'Disbursed'}</StatusBadge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px', background: 'var(--surface-sunken)', padding: '8px 10px', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Gross</span>
                    <strong>{formatINR(gross)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Deductions</span>
                    <strong style={{ color: '#cb3a31' }}>{formatINR(deductions)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Net Pay</span>
                    <strong style={{ color: 'var(--teal)' }}>{formatINR(net)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Paid: {ps.paymentDate || ps.payDate || 'On-schedule'}</span>
                  <button
                    type="button"
                    className="ui-button secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => handleOpenPayslip(ps)}
                  >
                    <Eye size={12} /> View Slip
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop Table View */}
        <div className="attendance-table-desktop" style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Payslip ID</th>
                <th>Month</th>
                <th>Gross Pay</th>
                <th>Total Deductions</th>
                <th>Net Disbursed</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((ps) => {
                const gross = ps.grossEarnings || ps.grossSalary || ps.gross || 0
                const deductions = ps.totalDeductions || ps.deductions || 0
                const net = ps.netPay || ps.netSalary || ps.net || 0
                const id = ps._id || ps.id || 'PS'
                return (
                  <tr key={id}>
                    <td>
                      <strong>{id}</strong>
                      <span style={{ fontSize: '10px', color: 'var(--teal)', display: 'block', fontWeight: 600 }}>
                        A/C: {unmaskBankAccount(ps.accountNumber || employee?.bankDetails?.accountNumber, '50100488577650')}
                      </span>
                    </td>
                    <td>{ps.month}</td>
                    <td>{formatINR(gross)}</td>
                    <td>{formatINR(deductions)}</td>
                    <td><strong style={{ color: 'var(--teal)' }}>{formatINR(net)}</strong></td>
                    <td>{ps.paymentDate || ps.payDate || 'On-schedule'}</td>
                    <td><StatusBadge tone="success">{ps.status || 'Disbursed'}</StatusBadge></td>
                    <td>
                      <button
                        type="button"
                        className="ui-button secondary"
                        style={{ fontSize: '10px', padding: '3px 8px' }}
                        onClick={() => handleOpenPayslip(ps)}
                      >
                        <Eye size={11} /> View Slip
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* A4 CORPORATE PREVIEW MODAL */}
      {selectedPayslip && (
        <PayslipPreviewModal
          record={selectedPayslip}
          employee={employee}
          settings={storeState.companySettings}
          onClose={() => setSelectedPayslip(null)}
          canEmail={false}
        />
      )}
    </div>
  )
}

// 4. ESS TASKS VIEW
// ==============================================================
function ESSTasksView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [activeTab, setActiveTab] = useState('all')
  const [reportText, setReportText] = useState('')
  const [reportHours, setReportHours] = useState('8')
  const [reportNotice, setReportNotice] = useState('')

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const tasks = storeState.tasks || []

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'all') return true
    return t.status === activeTab
  })

  const handleDailyReportSubmit = workspaceAction(hrStore, async (e) => {
    e.preventDefault()
    if (!reportText.trim()) return
    await hrStore.submitDailyReport({
      employeeId: user?.employeeId || user?.id || '',
      employeeName: user?.displayName || user?.name || user?.email?.split('@')[0] || 'Employee',
      date: todayKey(),
      hoursLogged: reportHours,
      summary: reportText,
    })
    setReportNotice('Daily work report logged successfully!')
    setReportText('')
    setTimeout(() => setReportNotice(''), 4000)
  })

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Work & Execution"
        title="My Tasks & Daily Reports"
        description="Review assigned sprint tasks, manage delivery progress, and submit daily work accomplishment logs."
      />

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
        {['all', 'todo', 'in_progress', 'completed'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`ui-button ${activeTab === tab ? 'primary' : 'secondary'}`}
            style={{ fontSize: '11px', textTransform: 'capitalize' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace('_', ' ')} ({tab === 'all' ? tasks.length : tasks.filter((t) => t.status === tab).length})
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* TASKS LIST */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredTasks.length === 0 ? (
            <div className="panel">
              <EmptyState title="No tasks found" message="You have no deliverables in this category." />
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="panel" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                      <StatusBadge tone={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'neutral'}>
                        {task.priority} Priority
                      </StatusBadge>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Due: {task.dueDate}</span>
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px' }}>{task.title}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {task.category}
                    </p>
                  </div>
                  <StatusBadge tone={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'neutral'}>
                    {task.status?.replace('_', ' ')}
                  </StatusBadge>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    Assigned by: <strong>{task.assignedBy}</strong>
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {task.status !== 'in_progress' && task.status !== 'completed' && (
                      <button
                        type="button"
                        className="ui-button secondary"
                        style={{ fontSize: '10px', padding: '3px 8px' }}
                        onClick={workspaceAction(hrStore, () => hrStore.updateTaskStatus(task.id, 'in_progress'))}
                      >
                        Start Task
                      </button>
                    )}
                    {task.status !== 'completed' && (
                      <button
                        type="button"
                        className="ui-button primary"
                        style={{ fontSize: '10px', padding: '3px 8px' }}
                        onClick={workspaceAction(hrStore, () => hrStore.updateTaskStatus(task.id, 'completed'))}
                      >
                        <Check size={11} /> Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* LOG WORK REPORT */}
        <div>
          <div className="panel" style={{ position: 'sticky', top: '90px' }}>
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Standup</p>
                <h2>Log Daily Work Report</h2>
              </div>
            </div>
            <form onSubmit={handleDailyReportSubmit} style={{ display: 'grid', gap: '12px', marginTop: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Hours Logged Today
                </label>
                <select
                  className="select-control"
                  value={reportHours}
                  onChange={(e) => setReportHours(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="4">4 Hours (Half Day)</option>
                  <option value="8">8 Hours (Full Shift)</option>
                  <option value="9">9 Hours (Full Shift + Overtime)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Work Done & Key Accomplishments
                </label>
                <textarea
                  className="text-input"
                  rows={4}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Outline key deliverables completed today, client deliverables pushed, or any sprint blockers..."
                  style={{ width: '100%', fontSize: '12px', padding: '8px' }}
                  required
                />
              </div>

              <Button type="submit" style={{ width: '100%' }}>
                <Send size={13} /> Submit Daily Work Log
              </Button>

              {reportNotice && (
                <div style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> {reportNotice}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================================================
// 5. ESS EXPENSES VIEW
// ==============================================================
function ESSExpensesView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [modalOpen, setModalOpen] = useState(false)
  const [claimCategory, setClaimCategory] = useState('Travel & Cab')
  const [claimAmount, setClaimAmount] = useState('')
  const [claimMerchant, setClaimMerchant] = useState('')
  const [claimDate, setClaimDate] = useState(() => new Date().toISOString().split('T')[0])
  const [claimNotes, setClaimNotes] = useState('')
  const [claimAttachment, setClaimAttachment] = useState(null)
  const [attachmentError, setAttachmentError] = useState('')
  const [previewAttachmentModal, setPreviewAttachmentModal] = useState(null)
  const fileInputRef = useRef(null)
  const [statusTab, setStatusTab] = useState('all') // 'all' | 'submitted' | 'approved' | 'rejected'
  const [searchTerm, setSearchTerm] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      setAttachmentError('Attachment size must be under 8MB.')
      return
    }
    setAttachmentError('')
    const reader = new FileReader()
    reader.onload = () => {
      setClaimAttachment({
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        url: reader.result,
      })
    }
    reader.readAsDataURL(file)
  }

  const myExpenses = (storeState.expenses || []).filter((e) => {
    if (!user) return true
    if (['admin', 'hr'].includes(user.role)) return true
    return (
      e.ownerId === user.id ||
      e.ownerId === user._id ||
      e.employeeId === user.employeeId ||
      e.employeeId === user.id ||
      e.employeeName === user.displayName ||
      e.employeeName === user.name
    )
  })

  const filteredExpenses = myExpenses.filter((e) => {
    const s = (e.status || 'submitted').toLowerCase()
    if (statusTab === 'submitted' && s !== 'submitted' && s !== 'pending') return false
    if (statusTab === 'approved' && s !== 'approved' && s !== 'reimbursed') return false
    if (statusTab === 'rejected' && s !== 'rejected') return false

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchMerchant = (e.merchant || '').toLowerCase().includes(q)
      const matchCategory = (e.category || '').toLowerCase().includes(q)
      const matchId = (e.id || '').toLowerCase().includes(q)
      const matchNotes = (e.comments || e.notes || '').toLowerCase().includes(q)
      if (!matchMerchant && !matchCategory && !matchId && !matchNotes) return false
    }
    return true
  })

  const totalClaimed = myExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  const approvedTotal = myExpenses.filter((e) => e.status === 'approved' || e.status === 'reimbursed').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  const pendingTotal = myExpenses.filter((e) => (e.status === 'submitted' || e.status === 'pending')).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  const rejectedCount = myExpenses.filter((e) => e.status === 'rejected').length

  const handleClaimSubmit = workspaceAction(hrStore, async (e) => {
    e.preventDefault()
    if (!claimAmount || Number(claimAmount) <= 0) return

    await hrStore.submitExpense({
      employeeId: user?.employeeId || user?.id || 'STAFF',
      employeeName: user?.displayName || user?.name || user?.email?.split('@')[0] || 'Employee',
      category: claimCategory,
      amount: Number(claimAmount),
      merchant: claimMerchant.trim(),
      date: claimDate || new Date().toISOString().split('T')[0],
      comments: claimNotes.trim(),
      notes: claimNotes.trim(),
      status: 'submitted',
      attachmentUrl: claimAttachment?.url || '',
      attachmentName: claimAttachment?.name || '',
      attachmentType: claimAttachment?.type || '',
      attachmentSize: claimAttachment?.size || '',
    })

    setModalOpen(false)
    setClaimAmount('')
    setClaimMerchant('')
    setClaimNotes('')
    setClaimAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setFeedback('Reimbursement claim submitted successfully with proof attachment! Assigned to finance review queue.')
    setTimeout(() => setFeedback(''), 4500)
  })

  const isAdmin = user?.role === 'admin'

  const handleDeleteExpense = workspaceAction(hrStore, async (expenseId) => {
    if (!isAdmin) {
      alert('Only administrators have access to delete expense claims.')
      return
    }
    if (!window.confirm('Are you sure you want to delete this expense claim record? This action cannot be undone.')) return
    await hrStore.deleteExpense(expenseId)
    setFeedback('Expense reimbursement claim deleted successfully.')
    setTimeout(() => setFeedback(''), 4000)
  })

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Reimbursements & Claims"
        title="Expense Claims & Travel"
        description="Submit and track official reimbursement claims for client visits, hardware accessories, travel, and broadband allowances."
      >
        <button
          type="button"
          className="ui-button primary"
          onClick={() => setModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} /> Submit Expense Claim
        </button>
      </PageHeader>

      {feedback && (
        <div style={{ padding: '11px 16px', background: '#eaf4f1', color: 'var(--teal)', border: '1px solid #c7ded7', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={15} />
          <span style={{ flex: 1 }}>{feedback}</span>
          <button type="button" onClick={() => setFeedback('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--teal)', fontSize: '13px' }}>✕</button>
        </div>
      )}

      {/* METRIC GRID */}
      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eef2f6', color: 'var(--blue)' }}>
            <Receipt size={20} />
          </div>
          <div className="metric-copy">
            <span>Total Claimed</span>
            <strong>{formatINR(totalClaimed)}</strong>
            <small>{myExpenses.length} total claims filed</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-copy">
            <span>Approved & Reimbursed</span>
            <strong>{formatINR(approvedTotal)}</strong>
            <small>Processed by finance desk</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fbf3e6', color: '#b97926' }}>
            <Clock3 size={20} />
          </div>
          <div className="metric-copy">
            <span>Pending Audit</span>
            <strong>{formatINR(pendingTotal)}</strong>
            <small>Awaiting manager/HR review</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fdf2f2', color: '#dc2626' }}>
            <AlertCircle size={20} />
          </div>
          <div className="metric-copy">
            <span>Rejected Claims</span>
            <strong>{rejectedCount} Claims</strong>
            <small>Requires clarification</small>
          </div>
        </div>
      </section>

      {/* EXPENSE CLAIMS TABLE & CONTROLS */}
      <section className="panel">
        <div className="panel-heading" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p className="section-kicker">Claims Archive</p>
            <h2>My Expense Reimbursements</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--muted)' }} />
              <input
                type="text"
                className="text-input"
                placeholder="Search merchant, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '190px', paddingLeft: '28px', fontSize: '11px', height: '30px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'submitted', label: 'Pending' },
                { key: 'approved', label: 'Approved' },
                { key: 'rejected', label: 'Rejected' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 0,
                    cursor: 'pointer',
                    background: statusTab === tab.key ? '#fff' : 'transparent',
                    color: statusTab === tab.key ? 'var(--teal)' : 'var(--muted)',
                    boxShadow: statusTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Justification</th>
                <th>Proof Receipt</th>
                <th>Status</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                    <Receipt size={28} style={{ opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>No expense claims found</strong>
                    <span style={{ fontSize: '11.5px' }}>Click "Submit Expense Claim" above to log a new reimbursement.</span>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp, idx) => {
                  const s = (exp.status || 'submitted').toLowerCase()
                  return (
                    <tr key={exp.id || idx}>
                      <td><strong style={{ color: 'var(--teal)' }}>#{exp.id || `EXP-${idx + 101}`}</strong></td>
                      <td>{exp.date ? new Date(exp.date).toLocaleDateString() : 'Recent'}</td>
                      <td>
                        <span className="role-badge" style={{ fontSize: '9.5px' }}>
                          {exp.category || 'General'}
                        </span>
                      </td>
                      <td><strong style={{ color: 'var(--ink)' }}>{exp.merchant || 'Merchant'}</strong></td>
                      <td><strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{formatINR(exp.amount)}</strong></td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={exp.comments || exp.notes}>
                        {exp.comments || exp.notes || 'No description provided'}
                      </td>
                      <td>
                        {exp.attachmentUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewAttachmentModal(exp)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#eaf4f1',
                              border: '1px solid #c7ded7',
                              color: 'var(--teal)',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Paperclip size={12} />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>No proof</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge tone={s === 'approved' || s === 'reimbursed' ? 'success' : s === 'rejected' ? 'danger' : 'warning'}>
                          {s === 'submitted' ? 'pending review' : s}
                        </StatusBadge>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            title="Delete Claim"
                            style={{
                              color: 'var(--coral)',
                              background: 'rgba(220, 38, 38, 0.08)',
                              borderRadius: '6px',
                              padding: '4px 7px',
                              border: 0,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CLAIM SUBMISSION MODAL */}
      {modalOpen && (
        <div className="payslip-voucher-overlay" onClick={() => setModalOpen(false)}>
          <div className="payslip-voucher" style={{ maxWidth: '540px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #E1F1F0 0%, #CEEAE8 100%)', color: 'var(--teal)' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="modal-title-text">File Expense Claim</h3>
                  <p className="modal-subtitle-text">Submit an official reimbursement claim with proof bill or receipt</p>
                </div>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit}>
              <div className="modal-body-premium">
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Expense Category</label>
                  <select
                    className="select-control"
                    style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                    value={claimCategory}
                    onChange={(e) => setClaimCategory(e.target.value)}
                  >
                    <option value="Travel & Cab">🚕 Travel & Cab / Fuel</option>
                    <option value="Client Hospitality">🍽️ Client Hospitality & Meals</option>
                    <option value="Tech Peripherals">💻 Tech Peripherals & Hardware</option>
                    <option value="Books & Learning">📚 Books & Professional Certification</option>
                    <option value="Internet / Phone">📶 Home Office Internet / Phone</option>
                  </select>
                </div>

                <div className="form-row-2col">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>Claim Amount (₹)</label>
                      {claimAmount && Number(claimAmount) > 0 && (
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--teal)' }}>{formatINR(Number(claimAmount))}</span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      className="text-input"
                      placeholder="e.g. 1850"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Expense Date</label>
                    <input
                      type="date"
                      className="text-input"
                      value={claimDate}
                      onChange={(e) => setClaimDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Merchant / Vendor Name</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="e.g., Uber India, Amazon, Chroma Electronics..."
                    value={claimMerchant}
                    onChange={(e) => setClaimMerchant(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>Business Justification</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                      {claimNotes.length > 0 ? `${claimNotes.length} characters` : 'Reason for expense'}
                    </span>
                  </div>
                  <textarea
                    className="text-input"
                    rows={3}
                    placeholder="Explain the purpose of the business expenditure (e.g. Travel to client site for deployment demo)..."
                    value={claimNotes}
                    onChange={(e) => setClaimNotes(e.target.value)}
                    style={{ width: '100%', minHeight: '70px', maxHeight: '140px', resize: 'vertical', fontSize: '12.5px' }}
                    required
                  />
                </div>

                {/* ATTACHMENT / PROOF UPLOAD */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>Proof / Receipt Attachment</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Bill, receipt or invoice (JPG, PNG, PDF up to 8MB)</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="employee-claim-file-upload"
                  />
                  {claimAttachment ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#eaf4f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', flexShrink: 0 }}>
                          {claimAttachment.type?.includes('pdf') ? <FileText size={18} /> : <Paperclip size={18} />}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <strong style={{ fontSize: '12px', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px', color: 'var(--ink)' }}>
                            {claimAttachment.name}
                          </strong>
                          <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{claimAttachment.size}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setClaimAttachment(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        style={{ border: 0, background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, padding: '4px 8px' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="employee-claim-file-upload"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: '#f8fafc',
                        transition: 'border-color 0.2s',
                        textAlign: 'center',
                        gap: '4px'
                      }}
                    >
                      <Upload size={20} style={{ color: 'var(--teal)', marginBottom: '2px' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>Click to upload bill / receipt</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Supports PNG, JPG, JPEG, WEBP or PDF</span>
                    </label>
                  )}
                  {attachmentError && (
                    <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: '4px' }}>{attachmentError}</span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#F0F9F8',
                    border: '1px solid #D1EBE9',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    color: 'var(--teal)',
                  }}
                >
                  <Receipt size={15} style={{ flexShrink: 0 }} />
                  <span>
                    Receipt proof will be verified by HR and Accounts before reimbursement is disbursed.
                  </span>
                </div>
              </div>

              <div className="modal-footer-premium">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!claimAmount || Number(claimAmount) <= 0 || !claimMerchant.trim()}>
                  <Receipt size={13} /> Submit Claim
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROOF RECEIPT PREVIEW MODAL */}
      {previewAttachmentModal && (
        <div className="payslip-voucher-overlay" onClick={() => setPreviewAttachmentModal(null)}>
          <div className="payslip-voucher" style={{ maxWidth: '640px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="modal-title-text">Proof of Expense: {previewAttachmentModal.merchant || previewAttachmentModal.category}</h3>
                  <p className="modal-subtitle-text">
                    Amount: {formatINR(previewAttachmentModal.amount)} • Date: {previewAttachmentModal.date ? new Date(previewAttachmentModal.date).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>
              <button type="button" className="icon-button" onClick={() => setPreviewAttachmentModal(null)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body-premium" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                <div>
                  <strong>File: </strong> {previewAttachmentModal.attachmentName || 'Receipt Document'}
                  {previewAttachmentModal.attachmentSize && <span style={{ color: 'var(--muted)', marginLeft: '6px' }}>({previewAttachmentModal.attachmentSize})</span>}
                </div>
                <a
                  href={previewAttachmentModal.attachmentUrl}
                  download={previewAttachmentModal.attachmentName || 'expense_receipt'}
                  target="_blank"
                  rel="noreferrer"
                  className="ui-button secondary"
                  style={{ padding: '4px 10px', fontSize: '11.5px', height: '28px', textDecoration: 'none' }}
                >
                  Open Full Size
                </a>
              </div>

              {/* PREVIEW CONTAINER */}
              <div style={{ textAlign: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '12px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previewAttachmentModal.attachmentType?.includes('pdf') || previewAttachmentModal.attachmentUrl?.startsWith('data:application/pdf') ? (
                  <iframe
                    src={previewAttachmentModal.attachmentUrl}
                    title="Receipt PDF"
                    style={{ width: '100%', height: '480px', border: 0, borderRadius: '6px' }}
                  />
                ) : (
                  <img
                    src={previewAttachmentModal.attachmentUrl}
                    alt="Expense Proof"
                    style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                )}
              </div>

              {previewAttachmentModal.comments && (
                <div style={{ marginTop: '14px', padding: '10px 12px', background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '12px' }}>
                  <strong style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Justification</strong>
                  <span>{previewAttachmentModal.comments || previewAttachmentModal.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="ui-button secondary" onClick={() => setPreviewAttachmentModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==============================================================
// 6. ESS PERFORMANCE VIEW
// ==============================================================
// ==============================================================
// 7. ESS DOCUMENTS VIEW
// ==============================================================
function ESSDocumentsView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const employee = findEmployeeForUser(storeState.employees, user)
  return <CompanyDocumentsView user={user} employee={employee} />
}

// ==============================================================
// 8. ESS ANNOUNCEMENTS VIEW
// ==============================================================
function ESSAnnouncementsView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const announcements = storeState.announcements || []

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Company Newsfeed"
        title="Announcements & Bulletins"
        description="Stay informed with executive updates, festival schedules, product milestones, and internal events."
      />

      <div style={{ display: 'grid', gap: '16px' }}>
        {announcements.map((ann) => (
          <div key={ann.id} className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <StatusBadge tone={ann.priority === 'urgent' ? 'danger' : 'info'}>
                    {ann.category || 'Company'}
                  </StatusBadge>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{ann.date}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>• By {ann.author || 'HR Operations'}</span>
                </div>
                <h2 style={{ margin: '0 0 10px', fontSize: '17px' }}>{ann.title}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>
                  {ann.content}
                </p>
              </div>

              <button
                type="button"
                className="announcement-like-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={workspaceAction(hrStore, () => hrStore.likeAnnouncement(ann.id))}
                title="Cheer announcement"
              >
                <Heart size={14} fill={ann.likes > 0 ? '#e05345' : 'none'} color={ann.likes > 0 ? '#e05345' : 'currentColor'} />
                <span>{ann.likes || 0} Likes</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==============================================================
// 9. ESS PROFILE VIEW
// ==============================================================
function ESSProfileView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [profileTab, setProfileTab] = useState('personal') // 'personal' | 'employment' | 'onboarding' | 'bank' | 'emergency'

  useEffect(() => {
    return hrStore.subscribe(setStoreState)
  }, [])

  const employee = useMemo(() => {
    const list = storeState.employees || []
    return (
      list.find((e) => String(e.id || e._id || e.employeeId) === String(user?.employeeId || user?._id || user?.id)) ||
      list.find((e) => e.email?.toLowerCase() === user?.email?.toLowerCase()) ||
      user ||
      {}
    )
  }, [storeState.employees, user])

  const bank = employee?.bankDetails || {}
  const identity = employee?.identity || {}
  const emergency = employee?.emergencyContact || {}
  const parents = employee?.parentsContact || {}
  const isVerified = employee?.onboardingStatus === 'verified'

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Identity & Records"
        title="My Employee Profile"
        description="Manage your verified personal details, organizational hierarchy, bank information, and statutory credentials."
      />

      {/* Profile Header Summary Card */}
      <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div className="profile-avatar-box">
          <img
            src={user?.avatarUrl || employee?.avatarUrl || '/avatar.jpg'}
            alt={employee?.name || user?.displayName || 'User'}
            className="user-profile-img lg"
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div
            className="avatar avatar-teal"
            style={{ width: '60px', height: '60px', fontSize: '18px', display: 'grid', borderRadius: '50%' }}
          >
            {(employee?.name || user?.displayName || user?.name || user?.email?.split('@')[0] || 'EM').slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '-0.3px' }}>
              {employee?.name || user?.displayName || user?.name || user?.email?.split('@')[0] || 'Employee'}
            </h2>
            <StatusBadge tone="success">Active ESS</StatusBadge>
            {isVerified ? (
              <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, border: '1px solid #86efac', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Verified by HR
              </span>
            ) : (
              <span style={{ fontSize: '10px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, border: '1px solid #fde68a' }}>
                Onboarding Pending
              </span>
            )}
            <span className="role-badge" style={{ fontSize: '9px' }}>{employee?.employeeId || user?.employeeId || 'ETS21206'}</span>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
            {employee?.designation || user?.designation || 'Staff Member'} • {employee?.department || user?.department || 'Operations'}
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: '12px' }}>
          <span style={{ color: 'var(--muted)', display: 'block' }}>Annual CTC Compensation</span>
          <strong style={{ fontSize: '16px', color: 'var(--teal)' }}>₹{formatINR(employee?.salary || 1200000)}</strong>
          <small style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Linked to Monthly Payslips</small>
        </div>
      </div>

      {/* Sub Navigation Tabs for Mobile / Desktop Profile View */}
      <div className="subnav-tabs" style={{ overflowX: 'auto' }}>
        <button
          type="button"
          className={`subnav-tab ${profileTab === 'personal' ? 'active' : ''}`}
          onClick={() => setProfileTab('personal')}
        >
          <User size={14} />
          <span>Personal Info</span>
        </button>
        <button
          type="button"
          className={`subnav-tab ${profileTab === 'employment' ? 'active' : ''}`}
          onClick={() => setProfileTab('employment')}
        >
          <BriefcaseBusiness size={14} />
          <span>Employment Record</span>
        </button>
        <button
          type="button"
          className={`subnav-tab ${profileTab === 'verification' ? 'active' : ''}`}
          onClick={() => setProfileTab('verification')}
        >
          <FileCheck size={14} />
          <span>Verification</span>
        </button>
        <button
          type="button"
          className={`subnav-tab ${profileTab === 'onboarding' ? 'active' : ''}`}
          onClick={() => setProfileTab('onboarding')}
        >
          <ShieldCheck size={14} />
          <span>Documents & Dossier</span>
        </button>
        <button
          type="button"
          className={`subnav-tab ${profileTab === 'bank' ? 'active' : ''}`}
          onClick={() => setProfileTab('bank')}
        >
          <WalletCards size={14} />
          <span>Banking & Statutory</span>
        </button>
        <button
          type="button"
          className={`subnav-tab ${profileTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setProfileTab('emergency')}
        >
          <Phone size={14} />
          <span>Emergency Contacts</span>
        </button>
      </div>

      {/* TAB 1: PERSONAL DETAILS */}
      {profileTab === 'personal' && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Personal Dossier</p>
              <h2>Personal Information</h2>
            </div>
            {isVerified ? (
              <StatusBadge tone="success">Verified</StatusBadge>
            ) : (
              <StatusBadge tone="warning">Pending Verification</StatusBadge>
            )}
          </div>
          <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
            <div className="profile-detail-row">
              <span>Full Legal Name</span>
              <strong>{employee?.name || user?.name || user?.displayName || user?.email?.split('@')[0] || 'Employee'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Work Email Address</span>
              <strong>{employee?.email || user?.email || '-'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Contact Number</span>
              <strong>{employee?.phone || '+91 98765 43210'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Date of Birth</span>
              <strong>{employee?.dob ? new Date(employee.dob).toLocaleDateString('en-GB') : (identity.dob ? new Date(identity.dob).toLocaleDateString('en-GB') : '14 August 1994')}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Residential Address</span>
              <strong>{parents.address || employee?.address || '#42, 4th Cross, Indiranagar, Bengaluru, KA 560038'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Father's Name</span>
              <strong>{parents.fatherName || 'Not recorded'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Mother's Name</span>
              <strong>{parents.motherName || 'Not recorded'}</strong>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: EMPLOYMENT DETAILS */}
      {profileTab === 'employment' && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Job Profile</p>
              <h2>Employment Record</h2>
            </div>
            <StatusBadge tone="info">Active</StatusBadge>
          </div>
          <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
            <div className="profile-detail-row">
              <span>Employee Code</span>
              <strong>{employee?.employeeId || user?.employeeId || 'ETS21206'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Designation</span>
              <strong>{employee?.designation || user?.designation || 'Product Designer'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Department</span>
              <strong>{employee?.department || user?.department || 'Design & User Experience'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Reporting Manager</span>
              <strong>{employee?.managerName || 'Operations Executive'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Joining Date</span>
              <strong>{employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : '01 February 2024'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Work Location</span>
              <strong>{employee?.location || 'Bengaluru HQ'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Employment Type</span>
              <strong style={{ textTransform: 'capitalize' }}>{employee?.employmentType?.replace('_', ' ') || 'Full time'}</strong>
            </div>
          </div>
        </section>
      )}

      {/* TAB: VERIFICATION FORMS (Download Blank, Sign, Re-upload & HR Verification Locker) */}
      {profileTab === 'verification' && (
        <section className="panel" style={{ padding: '20px' }}>
          <OnboardingDossierView
            employee={employee}
            canEdit={true}
            canVerify={false}
            initialTab="verification"
          />
        </section>
      )}

      {/* TAB 3: ONBOARDING DOCUMENTS & VERIFICATION */}
      {profileTab === 'onboarding' && (
        <section className="panel" style={{ padding: '20px' }}>
          <OnboardingDossierView
            employee={employee}
            canEdit={true}
            canVerify={false}
          />
        </section>
      )}


      {/* TAB 4: BANK & STATUTORY */}
      {profileTab === 'bank' && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Banking & Tax</p>
              <h2>Official Remittance Account & Statutory Identifiers</h2>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--teal)', background: 'rgba(0, 110, 111, 0.08)', padding: '3px 8px', borderRadius: '10px', fontWeight: 600 }}>
              ⚡ Auto-linked to Monthly Payslip
            </span>
          </div>

          <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
            <div className="profile-detail-row">
              <span>Bank Name</span>
              <strong>{bank.bankName || 'HDFC Bank Limited'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Bank Account No. (Visible)</span>
              <strong style={{ fontFamily: 'monospace', letterSpacing: '0.5px', color: 'var(--teal)', fontSize: '13px' }}>
                {unmaskBankAccount(bank.accountNumber, '50100488577650')}
              </strong>
            </div>
            <div className="profile-detail-row">
              <span>Bank IFSC Code</span>
              <strong style={{ fontFamily: 'monospace' }}>{bank.ifscCode || 'HDFC0001234'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Permanent Account Number (PAN)</span>
              <strong style={{ fontFamily: 'monospace' }}>{identity.panNumber || bank.panTaxId || 'BROPJ5764Q'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Universal Account Number (PF UAN)</span>
              <strong style={{ fontFamily: 'monospace' }}>{identity.uanNumber || bank.uanNumber || '101595355837'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Aadhaar Number</span>
              <strong style={{ fontFamily: 'monospace' }}>{identity.aadharNumber || '•••• •••• 9821'}</strong>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f8fafc', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '12px', color: 'var(--muted)' }}>
            ℹ <strong>HR & Admin Note:</strong> Banking credentials above are automatically pulled whenever official payslips are generated. If updates are required, update your details in the Onboarding tab or request an adjustment from HR.
          </div>
        </section>
      )}

      {/* TAB 5: EMERGENCY CONTACTS */}
      {profileTab === 'emergency' && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Safety & Next of Kin</p>
              <h2>Emergency Contacts</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
            <div className="profile-detail-row">
              <span>Primary Contact Name</span>
              <strong>{emergency.name || 'Elena Rivera'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Relationship</span>
              <strong>{emergency.relationship || 'Spouse'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Contact Number</span>
              <strong>{emergency.phone || '+91 98765 11223'}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Parents Phone Contact</span>
              <strong>{parents.parentPhone || parents.phone || '+91 98450 99887'}</strong>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
// ==============================================================
// 10. ESS MY TEAM (MANAGER VIEW)
// ==============================================================
function ESSTeamView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const allEmployees = storeState.employees || []
  const currentEmp = allEmployees.find(
    (e) => e.id === user?.id || e._id === user?.id || e.employeeId === user?.employeeId || (user?.email && e.email && e.email.toLowerCase() === user.email.toLowerCase())
  )

  // Find teams assigned to this manager or team lead
  const userTeams = hrStore.getTeams().filter(
    (t) =>
      t.managerId === currentEmp?.id ||
      t.managerName?.toLowerCase() === currentEmp?.name?.toLowerCase() ||
      t.teamLeadId === currentEmp?.id ||
      t.teamLeadName?.toLowerCase() === currentEmp?.name?.toLowerCase()
  )

  // Collect team members dynamically
  const teamMembers = useMemo(() => {
    if (!currentEmp) return []

    // If Director or Admin: show all team members or all employees
    if (['director', 'admin', 'hr'].includes(currentEmp.role)) {
      return allEmployees.filter((e) => e.id !== currentEmp.id && e.role !== 'admin')
    }

    // If Manager: show all members in all teams reporting to this manager + direct reports
    if (currentEmp.role === 'manager') {
      const teamNames = new Set(userTeams.map((t) => t.name.toLowerCase()))
      const teamIds = new Set(userTeams.map((t) => t.id))
      return allEmployees.filter((e) => {
        if (e.id === currentEmp.id) return false
        if (e.managerId === currentEmp.id) return true
        if (e.team && (teamNames.has(e.team.toLowerCase()) || teamIds.has(e.teamId))) return true
        return false
      })
    }

    // If Team Lead: show all members assigned to their team
    if (currentEmp.role === 'team_lead') {
      const myTeam = userTeams[0] || hrStore.getTeam(currentEmp.teamId || currentEmp.team)
      return allEmployees.filter((e) => {
        if (e.id === currentEmp.id) return false
        if (e.teamLeadId === currentEmp.id) return true
        if (myTeam && (e.teamId === myTeam.id || (e.team && e.team.toLowerCase() === myTeam.name.toLowerCase()))) return true
        return false
      })
    }

    // Regular employee: show teammates in the same team
    if (currentEmp.team) {
      return allEmployees.filter((e) => e.id !== currentEmp.id && e.team && e.team.toLowerCase() === currentEmp.team.toLowerCase())
    }

    return []
  }, [allEmployees, currentEmp, userTeams])

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Leadership Controls"
        title="My Team Roster"
        description="Direct reports overview, real-time daily attendance, shift logs, and team leave approvals."
      >
        <a href="#/employee/team-leave" className="ui-button primary">
          <UserCheck size={14} /> Review Team Leave Requests
        </a>
      </PageHeader>

      {teamMembers.length === 0 ? (
        <EmptyState
          title="No Team Members Assigned Yet"
          message="Your team does not have any direct reporting members assigned yet. Administrators can assign employees through the Employee Management directory."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {teamMembers.map((m) => (
            <div key={m.id || m.employeeId} className="panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <div className="avatar avatar-teal" style={{ width: '42px', height: '42px', fontSize: '14px' }}>
                  {(m.displayName || m.name || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <strong style={{ fontSize: '14px' }}>{m.displayName || m.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {m.designation || m.role} • {m.department}
                    {m.team && <span style={{ marginLeft: '6px', color: '#7e22ce', fontWeight: 600 }}>({m.team})</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '6px', fontSize: '11px', background: '#faf9f5', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                <div><strong>Code:</strong> {m.employeeId || m.id}</div>
                <div><strong>Email:</strong> {m.email || '—'}</div>
                <div><strong>Phone:</strong> {m.phone || '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Status:</span>
                  <strong style={{ color: m.status === 'active' ? 'var(--teal)' : '#cb3a31' }}>
                    {m.status === 'active' ? 'Active' : m.status}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <a href="#/employee/team-leave" className="ui-button secondary" style={{ fontSize: '10px', padding: '3px 8px' }}>
                  View Leave Requests
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==============================================================

// ==============================================================
// 11. ESS DAILY WORK REPORT VIEW
// ==============================================================
function ESSDailyReportView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState('8')
  const [accomplishments, setAccomplishments] = useState('')
  const [challenges, setChallenges] = useState('')
  const [tomorrowPlan, setTomorrowPlan] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const empId = user?.employeeId || user?.id || 'STAFF'
  const myReports = (storeState.dailyReports || []).filter((r) => {
    if (!user) return true
    if (['admin', 'hr'].includes(user.role)) return true
    return (
      r.ownerId === user.id ||
      r.ownerId === user._id ||
      r.employeeId === empId ||
      r.employeeId === user?.id ||
      r.employeeName === user?.displayName ||
      r.employeeName === user?.name
    )
  })

  const filteredReports = myReports.filter((r) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchSummary = (r.tasksSummary || r.summary || '').toLowerCase().includes(q)
      const matchChallenges = (r.challenges || '').toLowerCase().includes(q)
      const matchDate = (r.date || '').toLowerCase().includes(q)
      const matchPlan = (r.tomorrowPlan || '').toLowerCase().includes(q)
      if (!matchSummary && !matchChallenges && !matchDate && !matchPlan) return false
    }
    return true
  })

  const totalHours = myReports.reduce((sum, r) => sum + (Number(r.hoursLogged) || 0), 0)
  const avgHours = myReports.length > 0 ? (totalHours / myReports.length).toFixed(1) : '0.0'
  const blockersCount = myReports.filter((r) => r.challenges && r.challenges.toLowerCase() !== 'none' && r.challenges.trim()).length

  const handleSubmit = workspaceAction(hrStore, async (e) => {
    e.preventDefault()
    if (!accomplishments.trim()) return

    await hrStore.submitDailyReport({
      employeeId: empId,
      employeeName: user?.displayName || user?.name || user?.email?.split('@')[0] || 'Employee',
      date: reportDate || new Date().toISOString().split('T')[0],
      hoursLogged: Number(hours) || 8,
      summary: accomplishments.trim(),
      tasksSummary: accomplishments.trim(),
      challenges: challenges.trim() || 'None',
      tomorrowPlan: tomorrowPlan.trim(),
    })

    setAccomplishments('')
    setChallenges('')
    setTomorrowPlan('')
    setNotice('Daily work report logged and submitted to manager review queue!')
    setTimeout(() => setNotice(''), 4500)
  })

  const handleDeleteReport = workspaceAction(hrStore, async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this daily work report entry? This cannot be undone.')) return
    await hrStore.deleteDailyReport(reportId)
    setNotice('Daily work report record deleted successfully.')
    setTimeout(() => setNotice(''), 4000)
  })

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Work Logs & Standup"
        title="Daily Work Report"
        description="Submit your daily deliverables, time allocation, blockers, and tomorrow's delivery plan for team review."
      />

      {notice && (
        <div style={{ padding: '11px 16px', background: '#eaf4f1', color: 'var(--teal)', border: '1px solid #c7ded7', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={15} />
          <span style={{ flex: 1 }}>{notice}</span>
          <button type="button" onClick={() => setNotice('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--teal)', fontSize: '13px' }}>✕</button>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eef2f6', color: 'var(--blue)' }}>
            <FileText size={20} />
          </div>
          <div className="metric-copy">
            <span>Reports Logged</span>
            <strong>{myReports.length} Reports</strong>
            <small>Active standup history</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
            <Clock size={20} />
          </div>
          <div className="metric-copy">
            <span>Total Hours Logged</span>
            <strong>{totalHours} hrs</strong>
            <small>Cumulated project effort</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fbf3e6', color: '#b97926' }}>
            <TrendingUp size={20} />
          </div>
          <div className="metric-copy">
            <span>Average Shift Pace</span>
            <strong>{avgHours} hrs/day</strong>
            <small>Standard workday average</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: blockersCount > 0 ? '#fdf2f2' : '#eaf4f1', color: blockersCount > 0 ? '#dc2626' : 'var(--teal)' }}>
            <AlertCircle size={20} />
          </div>
          <div className="metric-copy">
            <span>Blockers / Roadblocks</span>
            <strong>{blockersCount} Logged</strong>
            <small>{blockersCount > 0 ? 'Requires attention' : 'Smooth progress'}</small>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        {/* REPORT SUBMISSION FORM */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Today's Entry</p>
              <h2>Log Daily Work Summary</h2>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 600, background: 'var(--soft-teal)', padding: '2px 8px', borderRadius: '4px' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
            <div className="form-row-2col">
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--ink)' }}>Work Date</label>
                <input
                  type="date"
                  className="text-input"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--ink)' }}>Hours Spent Today</label>
                <select className="select-control" value={hours} onChange={(e) => setHours(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '10px' }}>
                  <option value="4">4 Hours (Half Day Shift)</option>
                  <option value="8">8 Hours (Full Standard Shift)</option>
                  <option value="9">9 Hours (Full Shift + 1h Overtime)</option>
                  <option value="10">10 Hours (Extended Delivery)</option>
                  <option value="12">12 Hours (Sprint Critical Delivery)</option>
                </select>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>Key Deliverables & Accomplishments</label>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {accomplishments.length > 0 ? `${accomplishments.length} characters` : 'Required'}
                </span>
              </div>
              <textarea
                className="text-input"
                rows={4}
                value={accomplishments}
                onChange={(e) => setAccomplishments(e.target.value)}
                placeholder="What did you complete today?&#10;• Built and audited navigation routes&#10;• Resolved QA tickets #412 and #418&#10;• Pushed pull request for team review..."
                style={{ width: '100%', minHeight: '96px', maxHeight: '180px', resize: 'vertical', fontSize: '12.5px', lineHeight: '1.45' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--ink)' }}>
                Challenges & Roadblocks <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '10px' }}>(Optional)</span>
              </label>
              <input
                type="text"
                className="text-input"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="Any dependencies, blocked API endpoints, or waiting on reviews?"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--ink)' }}>
                Tomorrow's Delivery Plan <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '10px' }}>(Optional)</span>
              </label>
              <input
                type="text"
                className="text-input"
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                placeholder="Top goals planned for next business day..."
                style={{ width: '100%' }}
              />
            </div>

            <Button type="submit" disabled={!accomplishments.trim()} style={{ marginTop: '4px' }}>
              <Send size={13} /> Submit Daily Work Report
            </Button>
          </form>
        </div>

        {/* PAST LOGS */}
        <div className="panel">
          <div className="panel-heading" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p className="section-kicker">History</p>
              <h2>Previous Work Reports</h2>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--muted)' }} />
              <input
                type="text"
                className="text-input"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '160px', paddingLeft: '28px', fontSize: '11px', height: '30px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px', marginTop: '14px', maxHeight: '580px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--muted)' }}>
                <FileText size={26} style={{ opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
                <strong style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>No work reports found</strong>
                <span style={{ fontSize: '11.5px' }}>Submit today's summary using the form on the left.</span>
              </div>
            ) : (
              filteredReports.map((r, i) => (
                <div
                  key={r.id || r._id || i}
                  style={{
                    background: '#FCFDFD',
                    border: '1px solid var(--line)',
                    borderLeft: '3.5px solid var(--teal)',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '11.5px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>
                        {r.date ? new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </strong>
                      <span className="role-badge" style={{ fontSize: '9.5px', background: 'var(--soft-teal)', color: 'var(--teal)', fontWeight: 700 }}>
                        {r.hoursLogged || 8} hrs logged
                      </span>
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => handleDeleteReport(r.id || r._id)}
                      title="Delete Report Entry"
                      style={{
                        color: 'var(--coral)',
                        background: 'rgba(220, 38, 38, 0.08)',
                        borderRadius: '6px',
                        padding: '3px 6px',
                        border: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '10.5px',
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>

                  <p style={{ margin: '0 0 8px', color: 'var(--ink)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {r.tasksSummary || r.summary}
                  </p>

                  {r.challenges && r.challenges.toLowerCase() !== 'none' && r.challenges.trim() && (
                    <div style={{ padding: '6px 10px', background: '#fef3e2', border: '1px solid #fbd38d', borderRadius: '6px', color: '#b45309', marginBottom: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={13} style={{ flexShrink: 0 }} />
                      <span><strong>Blocker:</strong> {r.challenges}</span>
                    </div>
                  )}

                  {r.tomorrowPlan && (
                    <div style={{ padding: '6px 10px', background: '#f0f9f8', border: '1px solid #d1ebe9', borderRadius: '6px', color: 'var(--teal)', fontSize: '11px' }}>
                      <strong>Tomorrow's Plan:</strong> {r.tomorrowPlan}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================================================
// 12. ESS TRAINING PORTAL VIEW
// ==============================================================
function ESSTrainingView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const courses = storeState.courses ?? []

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Learning & Development"
        title="Training & Certifications Portal"
        description="Enroll in published courses and report your learning progress. Completion is self-reported, not a verified assessment."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {courses.map((c) => (
          <div key={c.id} className="panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="role-badge" style={{ fontSize: '9px', background: '#f5f8f7', color: 'var(--teal)' }}>
                  {c.category || 'Skill'}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>{c.duration}</span>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '14px' }}>{c.title}</h3>
              <div style={{ margin: '10px 0 4px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)' }}>
                <span>Progress</span>
                <strong>{c.progress}%</strong>
              </div>
              <div className="ess-progress-bar">
                <div className="ess-progress-fill" style={{ width: `${c.progress}%` }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
              <a href={c.url} target="_blank" rel="noopener noreferrer">Open course</a>
              {!c.enrolled ? <Button onClick={workspaceAction(hrStore, () => hrStore.enrollCourse(c.id))}>Enroll</Button> :
                <select aria-label={`Progress for ${c.title}`} value={c.progress} onChange={workspaceAction(hrStore, (event) => hrStore.updateCourseProgress(c.id, Number(event.target.value)))}>
                  {[0, 25, 50, 75, 100].map((value) => <option key={value} value={value}>{value}% self-reported</option>)}
                </select>}
              <span style={{ fontSize: '10px', color: c.completed ? 'var(--teal)' : 'var(--muted)', fontWeight: 600 }}>
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && <p>No training courses have been published.</p>}
    </div>
  )
}

// ==============================================================
// 13. ESS HELP DESK VIEW
// ==============================================================
function ESSHelpDeskView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [employeeReply, setEmployeeReply] = useState('')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketCat, setTicketCat] = useState('IT Support')
  const [ticketPriority, setTicketPriority] = useState('Medium')
  const [ticketDesc, setTicketDesc] = useState('')
  const [notice, setNotice] = useState('')
  const [statusTab, setStatusTab] = useState('all') // 'all' | 'open' | 'in_progress' | 'resolved'
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    return hrStore.subscribe((state) => {
      setStoreState(state)
      if (selectedTicket) {
        const updated = (state.tickets || []).find((t) => t.id === selectedTicket.id)
        if (updated) setSelectedTicket(updated)
      }
    })
  }, [selectedTicket])

  const myTickets = (storeState.tickets || []).filter((t) => {
    if (!user) return true
    if (['admin', 'hr'].includes(user.role)) return true
    return (
      t.ownerId === user.id ||
      t.ownerId === user._id ||
      t.employeeId === user.employeeId ||
      t.employeeId === user.id ||
      t.employeeName === user.displayName ||
      t.employeeName === user.name
    )
  })

  const filteredTickets = myTickets.filter((t) => {
    const s = (t.status || 'open').toLowerCase()
    if (statusTab === 'open' && s !== 'open') return false
    if (statusTab === 'in_progress' && s !== 'in_progress') return false
    if (statusTab === 'resolved' && s !== 'resolved' && s !== 'closed') return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchSubject = (t.subject || '').toLowerCase().includes(q)
      const matchId = (t.id || '').toLowerCase().includes(q)
      const matchCat = (t.category || '').toLowerCase().includes(q)
      if (!matchSubject && !matchId && !matchCat) return false
    }
    return true
  })

  const openCount = myTickets.filter((t) => (t.status || 'open').toLowerCase() === 'open').length
  const inProgressCount = myTickets.filter((t) => (t.status || '').toLowerCase() === 'in_progress').length
  const resolvedCount = myTickets.filter((t) => (t.status || '').toLowerCase() === 'resolved' || (t.status || '').toLowerCase() === 'closed').length

  const handleCreateTicket = workspaceAction(hrStore, async (e) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketDesc.trim()) return

    await hrStore.createTicket({
      employeeId: user?.employeeId || user?.id || 'STAFF',
      employeeName: user?.displayName || user?.name || user?.email?.split('@')[0] || 'Employee',
      subject: ticketSubject.trim(),
      category: ticketCat,
      priority: ticketPriority,
      description: ticketDesc.trim(),
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    })

    setModalOpen(false)
    setTicketSubject('')
    setTicketDesc('')
    setTicketPriority('Medium')
    setNotice('Help desk ticket submitted successfully! The support team has been assigned.')
    setTimeout(() => setNotice(''), 4500)
  })

  const handleSendEmployeeReply = workspaceAction(hrStore, async () => {
    if (!employeeReply.trim() || !selectedTicket) return
    await hrStore.replyToTicket(
      selectedTicket.id,
      employeeReply.trim(),
      user?.displayName || user?.name || 'Employee'
    )
    setEmployeeReply('')
    setNotice('Your message has been posted to the ticket thread.')
    setTimeout(() => setNotice(''), 4000)
  })

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Support & Ticketing"
        title="Employee Help Desk"
        description="Submit support requests for IT hardware, HR inquiries, payroll clarifications, and workplace facilities."
      >
        <button
          type="button"
          className="ui-button primary"
          onClick={() => setModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} /> Raise Support Ticket
        </button>
      </PageHeader>

      {notice && (
        <div style={{ padding: '11px 16px', background: '#eaf4f1', color: 'var(--teal)', border: '1px solid #c7ded7', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={15} />
          <span style={{ flex: 1 }}>{notice}</span>
          <button type="button" onClick={() => setNotice('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--teal)', fontSize: '13px' }}>✕</button>
        </div>
      )}

      {/* KPI STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>My Tickets</p>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>{myTickets.length}</h3>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(10,35,40,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
            <Ticket size={20} />
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #f59e0b' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#b45309', textTransform: 'uppercase', fontWeight: 600 }}>Awaiting Support</p>
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

      {/* TICKETS TABLE & FILTERS */}
      <section className="panel">
        <div className="panel-heading" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p className="section-kicker">My Inquiries</p>
            <h2>Support Tickets Track Record</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--muted)' }} />
              <input
                type="text"
                className="text-input"
                placeholder="Search my tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '180px', paddingLeft: '28px', fontSize: '11px', height: '30px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              {['all', 'open', 'in_progress', 'resolved'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusTab(tab)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 0,
                    cursor: 'pointer',
                    background: statusTab === tab ? '#fff' : 'transparent',
                    color: statusTab === tab ? 'var(--teal)' : 'var(--muted)',
                    boxShadow: statusTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Created Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                    <Ticket size={28} style={{ opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>No support tickets found</strong>
                    <span style={{ fontSize: '11.5px' }}>Click "Raise Support Ticket" to submit a new inquiry.</span>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t, idx) => {
                  const p = (t.priority || 'Medium').toLowerCase()
                  const s = (t.status || 'open').toLowerCase()
                  return (
                    <tr
                      key={t.id || idx}
                      onClick={() => setSelectedTicket(t)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                    >
                      <td><strong style={{ color: 'var(--teal)' }}>#{t.id || `TCK-${idx + 101}`}</strong></td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.subject || t.title}</span>
                      </td>
                      <td><span className="role-badge" style={{ fontSize: '9.5px' }}>{t.category || 'General'}</span></td>
                      <td>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: p === 'urgent' || p === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: p === 'urgent' || p === 'high' ? '#dc2626' : '#d97706',
                          }}
                        >
                          {t.priority || 'Medium'}
                        </span>
                      </td>
                      <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent'}</td>
                      <td>
                        <StatusBadge tone={s === 'resolved' || s === 'closed' ? 'success' : s === 'in_progress' ? 'info' : 'warning'}>
                          {s.replace('_', ' ')}
                        </StatusBadge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTicket(t)
                          }}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          <Eye size={12} /> View Thread
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* TICKET CONVERSATION & DETAIL MODAL */}
      {selectedTicket && (
        <div className="payslip-voucher-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="payslip-voucher" style={{ maxWidth: '620px', width: '94%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #E1F1F0 0%, #CEEAE8 100%)', color: 'var(--teal)' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>#{selectedTicket.id || 'TCK'}</span>
                    <StatusBadge tone={(selectedTicket.status || '').toLowerCase() === 'resolved' || (selectedTicket.status || '').toLowerCase() === 'closed' ? 'success' : (selectedTicket.status || '').toLowerCase() === 'in_progress' ? 'info' : 'warning'}>
                      {(selectedTicket.status || 'open').replace('_', ' ')}
                    </StatusBadge>
                  </div>
                  <h3 className="modal-title-text" style={{ fontSize: '16px', marginTop: '2px' }}>{selectedTicket.subject}</h3>
                </div>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedTicket(null)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body-premium" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
              {/* Metadata Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#F8FAF9', padding: '12px 14px', borderRadius: '12px', fontSize: '11.5px', border: '1px solid var(--line)' }}>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Category</span>
                  <strong style={{ color: 'var(--ink)' }}>{selectedTicket.category || 'General'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Priority</span>
                  <strong style={{ color: (selectedTicket.priority || '').toLowerCase() === 'urgent' ? '#dc2626' : (selectedTicket.priority || '').toLowerCase() === 'high' ? '#ea580c' : 'var(--ink)' }}>
                    {selectedTicket.priority || 'Medium'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Logged Date</span>
                  <strong style={{ color: 'var(--ink)' }}>{selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : 'Recent'}</strong>
                </div>
              </div>

              {/* Initial Problem Description */}
              {selectedTicket.description && (
                <div style={{ background: '#FCFDFD', border: '1px solid var(--line)', borderLeft: '3.5px solid var(--teal)', padding: '12px 14px', borderRadius: '10px', fontSize: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--teal)', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>
                    Initial Inquiry Summary
                  </span>
                  <p style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {selectedTicket.description}
                  </p>
                </div>
              )}

              {/* Discussion Thread */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>
                    Official Conversation Thread ({Array.isArray(selectedTicket.responses) ? selectedTicket.responses.length : 0})
                  </strong>
                  <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Official support audit</span>
                </div>
                <div style={{ display: 'grid', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {(!Array.isArray(selectedTicket.responses) || selectedTicket.responses.length === 0) ? (
                    <div style={{ padding: '16px', background: '#fafaf9', border: '1px dashed var(--line)', borderRadius: '10px', textAlign: 'center', color: 'var(--muted)', fontSize: '11.5px' }}>
                      Awaiting response from Support Team. Responses will appear here.
                    </div>
                  ) : (
                    selectedTicket.responses.map((resp, i) => {
                      const isSupport = resp.sender?.toLowerCase().includes('it') || resp.sender?.toLowerCase().includes('hr') || resp.sender?.toLowerCase().includes('support') || resp.sender?.toLowerCase().includes('admin')
                      return (
                        <div
                          key={i}
                          style={{
                            background: isSupport ? '#f0f9f8' : '#f8fafc',
                            border: '1px solid var(--line)',
                            borderLeft: isSupport ? '3.5px solid var(--teal)' : '3.5px solid #64748b',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
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

              {/* Employee Reply Input */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>
                  Send Message to Support Desk
                </label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <textarea
                    rows={2}
                    className="text-input"
                    style={{ width: '100%', padding: '10px 12px', fontSize: '12px', resize: 'vertical', minHeight: '64px' }}
                    placeholder="Provide additional details or reply to support team..."
                    value={employeeReply}
                    onChange={(e) => setEmployeeReply(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button onClick={handleSendEmployeeReply} disabled={!employeeReply.trim()}>
                      <Send size={13} /> Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-premium">
              <Button variant="secondary" onClick={() => setSelectedTicket(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* RAISE TICKET MODAL */}
      {modalOpen && (
        <div className="payslip-voucher-overlay" onClick={() => setModalOpen(false)}>
          <div className="payslip-voucher" style={{ maxWidth: '540px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #E1F1F0 0%, #CEEAE8 100%)', color: 'var(--teal)' }}>
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="modal-title-text">Raise Support Ticket</h3>
                  <p className="modal-subtitle-text">Submit an inquiry to IT, HR, Payroll, or Workplace teams</p>
                </div>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <div className="modal-body-premium">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>Ticket Subject</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500 }}>Required</span>
                  </div>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Brief summary of inquiry (e.g. VPN Disconnected / Salary Query)..."
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2col">
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Category</label>
                    <select
                      className="select-control"
                      style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                      value={ticketCat}
                      onChange={(e) => setTicketCat(e.target.value)}
                    >
                      <option value="IT Support">💻 IT & Hardware</option>
                      <option value="HR Policies">👥 HR & People Policy</option>
                      <option value="Payroll">💰 Payroll & Compensation</option>
                      <option value="Facilities">🏢 Workplace & Desk</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Priority Level</label>
                    <select
                      className="select-control"
                      style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                    >
                      <option value="Low">🟢 Low Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="High">🟠 High Priority</option>
                      <option value="Urgent">🔴 Urgent Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>Issue Description</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                      {ticketDesc.length > 0 ? `${ticketDesc.length} characters` : 'Provide complete context'}
                    </span>
                  </div>
                  <textarea
                    className="text-input"
                    rows={4}
                    placeholder="Provide complete details to help support resolve quickly:&#10;• What problem are you experiencing?&#10;• Steps to reproduce or affected equipment..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
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

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#F0F9F8',
                    border: '1px solid #D1EBE9',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    color: 'var(--teal)',
                  }}
                >
                  <Clock3 size={15} style={{ flexShrink: 0 }} />
                  <span>
                    Our dedicated support desk reviews new inquiries during operating hours. Tickets are tracked with full audit history.
                  </span>
                </div>
              </div>

              <div className="modal-footer-premium">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!ticketSubject.trim() || !ticketDesc.trim()}>
                  <Send size={13} /> Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ==============================================================
// 14. ESS HOLIDAY CALENDAR VIEW
// ==============================================================
function ESSHolidaysView() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const holidays = storeState.holidays || []

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Company Schedule"
        title="Holiday Calendar (2026)"
        description="Official list of national holidays, festival holidays, and optional company leave observances."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {holidays.map((h, i) => (
          <div key={i} className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span className="role-badge" style={{ fontSize: '9px', background: '#f5f8f7', color: 'var(--teal)' }}>
                {h.type || 'Festival Holiday'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal)' }}>{h.date}</span>
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>{h.name || h.title}</h3>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
              {h.day}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==============================================================
// 15. ESS REWARDS & RECOGNITION VIEW
// ==============================================================
function ESSRewardsView({ user }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [modalOpen, setModalOpen] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [tag, setTag] = useState('Team Collaboration')
  const [kudosNote, setKudosNote] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const kudos = storeState.kudos || []

  const handleSendKudos = workspaceAction(hrStore, async (e) => {
    e.preventDefault()
    if (!kudosNote.trim()) return

    await hrStore.sendKudos({
      fromName: user?.displayName || user?.name || user?.email?.split('@')[0] || 'Employee',
      recipientId: recipient,
      tag,
      message: kudosNote.trim(),
      date: 'Just now',
    })

    setModalOpen(false)
    setKudosNote('')
    setNotice(`Kudos sent to ${recipient}!`)
    setTimeout(() => setNotice(''), 4000)
  })

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Culture & Badges"
        title="Rewards & Recognition"
        description="Send and view saved peer recognition. Points and leaderboards are not configured."
      >
        <button type="button" className="ui-button primary" onClick={() => setModalOpen(true)}>
          <Heart size={14} /> Send Peer Kudos
        </button>
      </PageHeader>

      {notice && (
        <div style={{ padding: '10px 14px', background: '#eaf4f1', color: 'var(--teal)', border: '1px solid #c7ded7', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
          <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '6px' }} />
          {notice}
        </div>
      )}

      {/* KPI CARDS */}
      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fbf3e6', color: '#b97926' }}>
            <Award size={20} />
          </div>
          <div className="metric-copy">
            <span>Recognition Points</span>
            <strong>Not configured</strong>
            <small>No points program configured</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#f5fbf9', color: 'var(--teal)' }}>
            <Sparkles size={20} />
          </div>
          <div className="metric-copy">
            <span>Badges Earned</span>
            <strong>{new Set(kudos.filter((k) => k.recipientId === user?.id).map((k) => k.badge)).size} Badges</strong>
            <small>From received recognition</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eef2f6', color: 'var(--blue)' }}>
            <Heart size={20} />
          </div>
          <div className="metric-copy">
            <span>Kudos Received</span>
            <strong>{kudos.filter((k) => k.recipientId === user?.id).length} Kudos</strong>
            <small>Recorded peer recognition</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#f6eff7', color: '#88438e' }}>
            <Users size={20} />
          </div>
          <div className="metric-copy">
            <span>Company Rank</span>
            <strong>Not configured</strong>
            <small>No leaderboard configured</small>
          </div>
        </div>
      </section>

      {/* KUDOS WALL */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Peer Recognition</p>
            <h2>Company Kudos Wall</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
          {kudos.map((k, idx) => (
            <div key={idx} style={{ background: '#faf9f5', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="role-badge" style={{ fontSize: '9px', background: '#fff', color: 'var(--teal)' }}>
                  {k.tag || 'Excellence'}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>{k.date}</span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--ink)', lineHeight: 1.5 }}>
                "{k.message}"
              </p>
              <div style={{ fontSize: '11px', color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: '6px' }}>
                From <strong>{k.fromName || 'Colleague'}</strong> to <strong>{k.toName || 'Team Member'}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEND KUDOS MODAL */}
      {modalOpen && (
        <div className="payslip-voucher-overlay" onClick={() => setModalOpen(false)}>
          <div className="payslip-voucher" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '10px', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Send Peer Recognition</h3>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendKudos} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Select Colleague</label>
                <select className="select-control" style={{ width: '100%' }} value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                  <option value="">Select colleague</option>
                  {(storeState.workspacePeople ?? []).filter((person) => person.id !== user?.id).map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Recognition Core Value</label>
                <select className="select-control" style={{ width: '100%' }} value={tag} onChange={(e) => setTag(e.target.value)}>
                  <option value="Team Collaboration">Team Collaboration & Support</option>
                  <option value="Product Excellence">Product Excellence & Craft</option>
                  <option value="Customer Obsession">Customer Empathy & Delivery</option>
                  <option value="Innovation & Speed">Innovation & Speed</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Appreciation Message</label>
                <textarea
                  className="text-input"
                  rows={3}
                  placeholder="Share what makes this person's contribution remarkable..."
                  value={kudosNote}
                  onChange={(e) => setKudosNote(e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit"><Heart size={13} /> Send Kudos</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ==============================================================
// 16. ESS NOTIFICATIONS CENTER VIEW
// ==============================================================
function ESSNotificationsView() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const notifs = storeState.notifications || []

  const filteredNotifs = notifs.filter((n) => {
    if (filterType === 'all') return true
    return n.type === filterType
  })

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Communications"
        title="Notifications Center"
        description="Stay updated with leave approvals, monthly salary credits, company broadcasts, and organizational alerts."
      >
        <button type="button" className="ui-button secondary" onClick={workspaceAction(hrStore, () => hrStore.markAllNotificationsRead())}>
          <Check size={14} /> Mark All as Read
        </button>
      </PageHeader>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
        {['all', 'leave', 'salary', 'announcement', 'system'].map((t) => (
          <button
            key={t}
            type="button"
            className={`ui-button ${filterType === t ? 'primary' : 'secondary'}`}
            style={{ fontSize: '11px', textTransform: 'capitalize' }}
            onClick={() => setFilterType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        {filteredNotifs.length === 0 ? (
          <div className="panel">
            <EmptyState title="No notifications" message="You have no notifications in this category." />
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className="panel"
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: n.read ? '#ffffff' : '#f5fbf9',
                borderColor: n.read ? 'var(--line)' : 'rgba(29, 138, 122, 0.3)',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="role-badge" style={{ fontSize: '9px', textTransform: 'capitalize' }}>
                    {n.type || 'Notice'}
                  </span>
                  <strong style={{ fontSize: '13px' }}>{n.title}</strong>
                  {!n.read && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)' }} />}
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{n.message}</p>
              </div>

              {!n.read && (
                <button
                  type="button"
                  className="icon-button"
                  onClick={workspaceAction(hrStore, () => hrStore.markNotificationRead(n.id))}
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ==============================================================
// MASTER ESS ROUTER
// ==============================================================
export function EmployeeDashboardPage({ route }) {
  const { user } = useAuth()
  const p = route?.path || '/employee'

  if (p === '/employee/attendance') return <ESSAttendanceView user={user} />
  if (p === '/employee/salary') return <ESSSalaryView user={user} />
  if (p === '/employee/tasks') return <ESSTasksView user={user} />
  if (p === '/employee/daily-report') return <ESSDailyReportView user={user} />
  if (p === '/employee/training') return <ESSTrainingView user={user} />
  if (p === '/employee/helpdesk') return <ESSHelpDeskView user={user} />
  if (p === '/employee/holidays') return <ESSHolidaysView />
  if (p === '/employee/rewards') return <ESSRewardsView user={user} />
  if (p === '/employee/notifications') return <ESSNotificationsView />
  if (p === '/employee/expenses') return <ESSExpensesView user={user} />
  if (p === '/employee/performance') return <PerformanceWorkspace />
  if (p === '/employee/documents') return <ESSDocumentsView user={user} />
  if (p === '/employee/policies' || p.includes('policies')) return <CompanyPoliciesView />
  if (p === '/employee/announcements') return <ESSAnnouncementsView user={user} />
  if (p === '/employee/profile') return <ESSProfileView user={user} />
  if (p === '/employee/my-team') return <ESSTeamView user={user} />

  // Default Overview
  return <ESSOverview user={user} />
}

// ==============================================================
// ACCESS RESTRICTED ERROR PAGE
// ==============================================================
export function AccessDeniedPage({ title, message }) {
  const { user, logout } = useAuth()
  const defaultTitle = user?.role === 'hr' ? 'Administrator Privileges Required' : 'Access Restricted'
  const defaultMessage =
    user?.role === 'hr'
      ? `Signed in as ${user?.displayName || 'HR Lead'} (HR Operations). HR accounts do not have administrative privileges and cannot access System Administration modules.`
      : `Hello ${user?.displayName || 'User'}, your account does not have permission to view this module.`

  return (
    <div className="panel access-denied-panel">
      <div className="access-denied-icon">
        <ShieldAlert size={34} />
      </div>
      <h2>{title || defaultTitle}</h2>
      <p>{message || defaultMessage}</p>

      <div className="access-denied-user-info">
        <span>Active Authenticated Session</span>
        <strong>{user?.displayName || 'User'} ({getRoleBadgeLabel(user?.role)})</strong>
        <small>{user?.email}</small>
      </div>

      <div className="access-denied-actions">
        <Button
          variant="secondary"
          onClick={() => {
            window.location.hash = user?.role === 'employee' ? '#/employee' : '#/hr'
          }}
        >
          Return to {user?.role === 'employee' ? 'My ESS Dashboard' : 'HR Portal'}
        </Button>
        <Button onClick={logout}>
          <LogOut size={14} /> Sign Out & Switch Account
        </Button>
      </div>
    </div>
  )
}
