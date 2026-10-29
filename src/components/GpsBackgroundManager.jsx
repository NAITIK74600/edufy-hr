import React, { useState, useEffect } from 'react'
import {
  MapPin,
  ShieldCheck,
  AlertCircle,
  X,
  Download,
  Smartphone,
  Monitor,
  Share,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

export function GpsBackgroundManager({ user }) {
  const [showGpsModal, setShowGpsModal] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('checking') // 'checking' | 'granted' | 'prompt' | 'denied'
  const [accuracy, setAccuracy] = useState(null)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [gpsErrorMsg, setGpsErrorMsg] = useState('')

  // 1. Check Geolocation Permission & Setup Warm Watcher
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if running in standalone PWA mode
    const checkStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    setIsStandalone(Boolean(checkStandalone))

    // Check if banner was dismissed recently (12 hrs)
    const bannerDismissedUntil = localStorage.getItem('edufyi_pwa_banner_dismissed')
    const now = Date.now()
    if (!checkStandalone && (!bannerDismissedUntil || now > Number(bannerDismissedUntil))) {
      setShowInstallBanner(true)
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

    // Capture global prompt if already captured before component mounted
    if (window.__edufyi_install_prompt) {
      setDeferredPrompt(window.__edufyi_install_prompt)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Listen for custom trigger from sidebar or topbar
    const handleCustomTrigger = () => {
      triggerInstallFlow()
    }
    window.addEventListener('edufyi-trigger-install', handleCustomTrigger)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false)
      setDeferredPrompt(null)
      setIsStandalone(true)
      window.__edufyi_install_prompt = null
    })

    return () => {
      clearInterval(heartbeatInterval)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
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
    localStorage.setItem('edufyi_gps_prompt_dismissed', String(Date.now() + 12 * 60 * 60 * 1000))
  }

  const triggerInstallFlow = async () => {
    const promptEvent = deferredPrompt || window.__edufyi_install_prompt
    if (promptEvent) {
      try {
        promptEvent.prompt()
        const { outcome } = await promptEvent.userChoice
        if (outcome === 'accepted') {
          setShowInstallBanner(false)
          setDeferredPrompt(null)
          window.__edufyi_install_prompt = null
          return
        }
      } catch (err) {
        console.warn('Install prompt error:', err)
      }
    }
    // If native prompt is unavailable (e.g. iOS, Safari, or Chrome desktop), show clear instructions modal
    setShowInstructionsModal(true)
  }

  const handleDismissInstallBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('edufyi_pwa_banner_dismissed', String(Date.now() + 12 * 60 * 60 * 1000))
  }

  // Device detection for tailored install guide
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent)

  return (
    <>
      {/* 1. Top PWA Install Banner */}
      {!isStandalone && showInstallBanner && (
        <div
          style={{
            background: 'linear-gradient(90deg, #0A2328 0%, #006E6F 100%)',
            color: '#fff',
            padding: '9px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone size={14} style={{ color: '#4ade80' }} />
            </div>
            <div>
              <strong style={{ color: '#ffffff' }}>Install Edufyi HR App:</strong>{' '}
              <span style={{ color: '#d1fae5' }}>
                Add to your Home Screen for one-tap access, fast attendance punching, and offline sync.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={triggerInstallFlow}
              style={{
                background: '#4ade80',
                color: '#064e3b',
                border: 0,
                borderRadius: '6px',
                padding: '5px 14px',
                fontWeight: 700,
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <Download size={13} />
              <span>Install App</span>
            </button>
            <button
              type="button"
              onClick={handleDismissInstallBanner}
              title="Dismiss for 12 hours"
              style={{
                background: 'transparent',
                border: 0,
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Step-by-Step Install Instructions Modal (When browser native prompt is suppressed/iOS) */}
      {showInstructionsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100001,
            padding: '16px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
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
                  <Download size={18} style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                    Install Edufyi HR Web App
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#a7f3d0' }}>
                    Follow simple steps for your device
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '22px' }}>
              {isIOS ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Tap the Safari Share button</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        In Safari at the bottom bar of your screen, tap the <strong>Share</strong> icon (the square with an arrow pointing up).
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Select "Add to Home Screen"</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Scroll down the menu list and tap <strong>Add to Home Screen</strong> (+).
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Tap "Add" in Top Right</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Confirm by tapping <strong>Add</strong>. The Edufyi HR icon will now appear on your iPhone/iPad home screen like a native app.
                      </p>
                    </div>
                  </div>
                </div>
              ) : isAndroid ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Tap the Chrome Menu (⋮)</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Tap the three dots in the top-right corner of Chrome.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Tap "Install app" or "Add to Home screen"</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Select the <strong>Install app</strong> or <strong>Add to Home screen</strong> option from the dropdown menu.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Tap "Install"</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        The app will be installed and open in full-screen mode with its own launcher icon!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Check the Browser Address Bar</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        In Chrome or Edge, click the <strong>Install App</strong> icon (a computer monitor with down arrow or circle with plus) on the right side of the URL bar.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Or via Browser Menu (⋮)</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Click the three dots in top-right &rarr; <strong>Cast, save, and share</strong> (or Apps) &rarr; <strong>Install Edufyi HR</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowInstructionsModal(false)}
                  style={{
                    background: '#006E6F',
                    color: '#fff',
                    border: 0,
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GPS Location Permission Modal */}
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
