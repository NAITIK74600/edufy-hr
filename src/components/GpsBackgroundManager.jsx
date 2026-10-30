import React, { useState, useEffect } from 'react'
import {
  MapPin,
  ShieldCheck,
  AlertCircle,
  X,
  Download,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Monitor,
  Share,
  PlusSquare,
} from 'lucide-react'

export function GpsBackgroundManager({ user }) {
  const [showGpsModal, setShowGpsModal] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('checking') // 'checking' | 'granted' | 'prompt' | 'denied'
  const [accuracy, setAccuracy] = useState(null)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [inlineTip, setInlineTip] = useState('')
  const [isStandalone, setIsStandalone] = useState(false)
  const [gpsErrorMsg, setGpsErrorMsg] = useState('')
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [installedNotice, setInstalledNotice] = useState(false)

  // 1. Check Geolocation Permission & Setup Warm Watcher
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if already running in standalone PWA mode
    const checkStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    setIsStandalone(Boolean(checkStandalone))

    // Check if install banner was dismissed recently (24 hrs)
    const bannerDismissedUntil = localStorage.getItem('edufyi_pwa_banner_dismissed')
    const now = Date.now()
    if (!checkStandalone && (!bannerDismissedUntil || now > Number(bannerDismissedUntil))) {
      // Delay showing banner slightly (3s) so it doesn't interrupt page load
      const bannerTimer = setTimeout(() => {
        setShowInstallBanner(true)
      }, 3000)
      return () => clearTimeout(bannerTimer)
    }

    if (!navigator.geolocation) {
      setGpsStatus('unsupported')
      return
    }

    const dismissedUntil = localStorage.getItem('edufyi_gps_prompt_dismissed')
    const isGpsDismissed = dismissedUntil && now < Number(dismissedUntil)

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((perm) => {
          setGpsStatus(perm.state)
          if (perm.state === 'prompt' && !isGpsDismissed) {
            setShowGpsModal(true)
          }
          perm.onchange = () => {
            setGpsStatus(perm.state)
            if (perm.state === 'granted') {
              setShowGpsModal(false)
              startWarmWatcher()
            }
          }
        })
        .catch(() => {
          if (!isGpsDismissed) setShowGpsModal(true)
        })
    } else {
      if (!isGpsDismissed) setShowGpsModal(true)
    }

    // Start background watcher if already granted
    startWarmWatcher()

    // 2. Background Heartbeat & Keep-Alive Daemon (pings when minimized)
    const heartbeatInterval = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'hidden') {
        fetch('/api/v1/health').catch(() => {})
      }
    }, 45000)

    // 3. PWA Install Event Listener
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      window.__edufyi_install_prompt = e
      if (!checkStandalone) {
        setShowInstallBanner(true)
      }
    }

    const handlePromptAvailable = (e) => {
      if (e.detail) {
        setDeferredPrompt(e.detail)
        window.__edufyi_install_prompt = e.detail
      }
    }

    if (window.__edufyi_install_prompt) {
      setDeferredPrompt(window.__edufyi_install_prompt)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('edufyi-prompt-available', handlePromptAvailable)

    // Listen for custom trigger from sidebar or topbar button
    const handleCustomTrigger = () => {
      const isRunningStandalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
      if (isRunningStandalone) {
        setInstalledNotice(true)
        setTimeout(() => setInstalledNotice(false), 4000)
        return
      }
      triggerInstallFlow()
    }
    window.addEventListener('edufyi-trigger-install', handleCustomTrigger)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false)
      setShowInstallModal(false)
      setDeferredPrompt(null)
      setIsStandalone(true)
      setInstalledNotice(true)
      setTimeout(() => setInstalledNotice(false), 5000)
      window.__edufyi_install_prompt = null
    })

    return () => {
      clearInterval(heartbeatInterval)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('edufyi-prompt-available', handlePromptAvailable)
      window.removeEventListener('edufyi-trigger-install', handleCustomTrigger)
      if (window.__edufyi_watch_id !== undefined) {
        navigator.geolocation.clearWatch(window.__edufyi_watch_id)
      }
    }
  }, [])

  function startWarmWatcher() {
    if (!navigator.geolocation) return
    try {
      window.__edufyi_watch_id = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            timestamp: pos.timestamp,
          }
          window.__edufyi_last_gps = coords
          setAccuracy(coords.accuracy)
          setGpsStatus('granted')
          setGpsErrorMsg('')
        },
        (err) => {
          if (err.code === 1) {
            setGpsStatus('denied')
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }
      )
    } catch {}
  }

  const handleRequestGps = () => {
    setGpsErrorMsg('')
    if (!navigator.geolocation) {
      setGpsErrorMsg('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp,
        }
        window.__edufyi_last_gps = coords
        setAccuracy(coords.accuracy)
        setGpsStatus('granted')
        setShowGpsModal(false)
        startWarmWatcher()
      },
      (err) => {
        if (err.code === 1) {
          setGpsStatus('denied')
          setGpsErrorMsg('Location access was denied. Please click the lock icon in your browser URL bar and set Location to "Allow".')
        } else {
          setGpsErrorMsg('Unable to retrieve high-accuracy GPS fix. Please ensure device location is enabled.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const handleDismissGps = () => {
    setShowGpsModal(false)
    localStorage.setItem('edufyi_gps_prompt_dismissed', String(Date.now() + 24 * 60 * 60 * 1000))
  }

  const triggerInstallFlow = async () => {
    const promptEvent = deferredPrompt || window.__edufyi_install_prompt
    if (promptEvent) {
      try {
        promptEvent.prompt()
        const { outcome } = await promptEvent.userChoice
        if (outcome === 'accepted') {
          setShowInstallBanner(false)
          setShowInstallModal(false)
          setDeferredPrompt(null)
          window.__edufyi_install_prompt = null
          setIsStandalone(true)
          setInstalledNotice(true)
          setTimeout(() => setInstalledNotice(false), 5000)
          return
        }
      } catch (err) {
        console.warn('Install prompt error:', err)
      }
    }

    // Open Direct Install Dialog with 1-click and platform instructions
    setShowInstallModal(true)
  }

  const handleDismissInstallBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('edufyi_pwa_banner_dismissed', String(Date.now() + 24 * 60 * 60 * 1000))
  }

  return (
    <>
      {/* 1. Small Floating Notification Banner (Unobtrusive toast in corner, NEVER full-screen) */}
      {!isStandalone && showInstallBanner && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            maxWidth: '360px',
            width: 'calc(100% - 40px)',
            background: '#0A2328',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            border: '1px solid rgba(0, 110, 111, 0.45)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/icon-192.png"
                alt="Edufyi HR"
                style={{ width: '30px', height: '30px', borderRadius: '7px', flexShrink: 0 }}
              />
              <div>
                <strong style={{ fontSize: '13px', color: '#fff', display: 'block', lineHeight: 1.2 }}>
                  Install Edufyi HR App
                </strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Fast access &amp; instant attendance</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissInstallBanner}
              title="Dismiss for 24 hours"
              style={{
                background: 'transparent',
                border: 0,
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {inlineTip && (
            <div
              style={{
                fontSize: '11.5px',
                color: '#6ee7b7',
                background: 'rgba(110, 231, 183, 0.12)',
                padding: '6px 10px',
                borderRadius: '6px',
                lineHeight: 1.4,
              }}
            >
              {inlineTip}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '2px' }}>
            <button
              type="button"
              onClick={handleDismissInstallBanner}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#cbd5e1',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Not Now
            </button>
            <button
              type="button"
              onClick={triggerInstallFlow}
              style={{
                background: '#006E6F',
                color: '#fff',
                border: 0,
                borderRadius: '6px',
                padding: '4px 14px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Download size={12} />
              <span>Install</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. GPS Location Permission Modal */}
            {/* Installed Toast Notification */}
      {installedNotice && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #064e3b, #047857)',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 100002,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="#a7f3d0" />
          <span>Edufyi HR App is installed on this device!</span>
        </div>
      )}

      {/* Direct Install Modal (Zero 3-dot menu needed) */}
      {showInstallModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 15, 20, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100001,
            padding: '16px',
          }}
          onClick={() => setShowInstallModal(false)}
        >
          <div
            style={{
              background: '#0a2328',
              color: '#fff',
              border: '1px solid rgba(0, 180, 160, 0.35)',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img
                  src="/icon-192.png"
                  alt="Edufyi HR"
                  style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', color: '#fff', fontWeight: 700 }}>Edufyi HR App</h3>
                    <span style={{ fontSize: '10px', background: 'rgba(0, 210, 255, 0.2)', color: '#00d2ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>PWA</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Official Enterprise Management App</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                style={{ background: 'transparent', border: 0, color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Benefits */}
            <div style={{ background: 'rgba(0, 110, 111, 0.2)', border: '1px solid rgba(0, 110, 111, 0.4)', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#e2e8f0' }}>
                <Sparkles size={14} color="#2dd4bf" style={{ flexShrink: 0 }} />
                <span><strong>Instant 1-Click Launch</strong> from your Desktop or Home Screen</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#e2e8f0' }}>
                <ShieldCheck size={14} color="#2dd4bf" style={{ flexShrink: 0 }} />
                <span><strong>Seamless Attendance</strong> with automatic GPS and Geofencing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#e2e8f0' }}>
                <CheckCircle2 size={14} color="#2dd4bf" style={{ flexShrink: 0 }} />
                <span><strong>Clean Fullscreen Window</strong> without browser tabs or clutter</span>
              </div>
            </div>

            {/* Direct Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={async () => {
                  const promptEvent = deferredPrompt || window.__edufyi_install_prompt
                  if (promptEvent) {
                    try {
                      promptEvent.prompt()
                      const { outcome } = await promptEvent.userChoice
                      if (outcome === 'accepted') {
                        setShowInstallModal(false)
                        setShowInstallBanner(false)
                        setIsStandalone(true)
                        setInstalledNotice(true)
                        setTimeout(() => setInstalledNotice(false), 5000)
                      }
                    } catch (err) {
                      console.warn('Install error:', err)
                    }
                  } else {
                    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
                    if (isIOS) {
                      alert('On iPhone/iPad Safari: Tap the Share button [↑] at the bottom, then choose "Add to Home Screen" [+]')
                    } else {
                      alert('Click the Install icon (⊕ or 💻) on the right side of your browser address bar at the top!')
                    }
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #008788, #0d9488)',
                  color: '#fff',
                  border: 0,
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 110, 111, 0.4)',
                }}
              >
                <Download size={18} />
                <span>⚡ Direct Install App Now</span>
              </button>

              {/* Platform-Specific Quick Instructions */}
              <div style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                {typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) ? (
                  <div>
                    <strong style={{ color: '#2dd4bf' }}>iPhone / iPad Installation:</strong>
                    <div style={{ marginTop: '4px' }}>1. Tap <strong>Share [↑]</strong> in the bottom bar of Safari.</div>
                    <div>2. Scroll down and tap <strong>Add to Home Screen [+]</strong>.</div>
                    <div>3. Tap <strong>Add</strong> in the top-right.</div>
                  </div>
                ) : (
                  <div>
                    <strong style={{ color: '#2dd4bf' }}>Direct Browser Install:</strong>
                    <div style={{ marginTop: '4px' }}>• <strong>Chrome / Edge:</strong> Look at your URL address bar at the top-right and click the <strong>Install (⊕ or 💻)</strong> icon.</div>
                    <div>• <strong>Android:</strong> Tap the button above, or tap <strong>Add to Home screen</strong> in the prompt.</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#94a3b8',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showGpsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #0A2328 0%, #006E6F 100%)',
                padding: '18px 20px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={20} style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                    Enable Geofence GPS Access
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#a7f3d0' }}>
                    Required for 50-meter Office Attendance Check-In
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissGps}
                style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Edufyi HR enforces an automated <strong>50-meter office geofence policy</strong> for daily check-ins.
                Enabling device location eliminates GPS spin delay during punch-in.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
                  <ShieldCheck size={16} />
                  <span>Privacy Protected: GPS is only queried during office check-in.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7' }}>
                  <MapPin size={16} />
                  <span>
                    Status:{' '}
                    <strong>
                      {gpsStatus === 'granted'
                        ? `Connected (${accuracy ? `±${accuracy}m` : 'Accurate'})`
                        : gpsStatus === 'denied'
                        ? 'Blocked in Browser Settings'
                        : 'Permission Requested'}
                    </strong>
                  </span>
                </div>
              </div>

              {gpsErrorMsg && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '16px',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{gpsErrorMsg}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleDismissGps}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Later
                </button>
                <button
                  type="button"
                  onClick={handleRequestGps}
                  style={{
                    background: '#006E6F',
                    border: 0,
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0, 110, 111, 0.3)',
                  }}
                >
                  <MapPin size={15} />
                  <span>Allow GPS Access</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
