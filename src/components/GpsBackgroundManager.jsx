import React, { useState, useEffect } from 'react'
import { MapPin, ShieldCheck, AlertCircle, X, Download, Bell } from 'lucide-react'

export function GpsBackgroundManager({ user }) {
  const [showGpsModal, setShowGpsModal] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('checking') // 'checking' | 'granted' | 'prompt' | 'denied'
  const [accuracy, setAccuracy] = useState(null)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [gpsErrorMsg, setGpsErrorMsg] = useState('')

  // 1. Check Geolocation Permission & Setup Warm Watcher
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unsupported')
      return
    }

    const dismissedUntil = localStorage.getItem('edufyi_gps_prompt_dismissed')
    const now = Date.now()
    const isDismissed = dismissedUntil && now < Number(dismissedUntil)

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((perm) => {
          setGpsStatus(perm.state)
          if (perm.state === 'prompt' && !isDismissed) {
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
          if (!isDismissed) setShowGpsModal(true)
        })
    } else {
      if (!isDismissed) setShowGpsModal(true)
    }

    // Start background watcher if already granted
    startWarmWatcher()

    // 2. Background Heartbeat & Keep-Alive Daemon
    const heartbeatInterval = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'hidden') {
        fetch('/api/v1/health').catch(() => {})
      }
    }, 45000)

    // 3. PWA Install Event Listener
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      clearInterval(heartbeatInterval)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
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
          setGpsErrorMsg('Location access was denied. Please click the padlock or settings icon in your browser URL bar and set Location to "Allow".')
        } else {
          setGpsErrorMsg('Unable to retrieve high-accuracy GPS fix. Please ensure device location is enabled.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const handleDismissGps = () => {
    setShowGpsModal(false)
    // Dismiss prompt for 12 hours
    localStorage.setItem('edufyi_gps_prompt_dismissed', String(Date.now() + 12 * 60 * 60 * 1000))
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }
  }

  return (
    <>
      {/* 1. PWA Install Banner (Mobile / Desktop App install) */}
      {showInstallBanner && deferredPrompt && (
        <div
          style={{
            background: 'linear-gradient(90deg, #004d40 0%, #006e6f 100%)',
            color: '#fff',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={15} style={{ color: '#4ade80' }} />
            <span>
              <strong>Install Edufyi HR App:</strong> Add to Home Screen for fast standalone access &amp; instant notifications.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleInstallApp}
              style={{
                background: '#fff',
                color: '#006e6f',
                border: 0,
                borderRadius: '6px',
                padding: '4px 12px',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Install App
            </button>
            <button
              type="button"
              onClick={() => setShowInstallBanner(false)}
              style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. GPS Location Permission Modal */}
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
              animation: 'fadeInUp 0.25s ease-out',
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
                    Enable Location (GPS)
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                    Campus Geofence &amp; Attendance Verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissGps}
                style={{
                  background: 'transparent',
                  border: 0,
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--ink, #1e293b)', lineHeight: 1.55 }}>
                Edufyi HR uses high-accuracy GPS to verify you are within the registered office campus boundary (<span style={{ fontWeight: 600, color: 'var(--teal, #006e6f)' }}>&lt; 50m</span>) when punching in and out.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#475569',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>Prevents punch-in failures and anti-spoofing flags.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>Runs continuously in the background for zero-wait check-ins.</span>
                </div>
              </div>

              {gpsErrorMsg && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    marginBottom: '14px',
                    lineHeight: 1.45,
                  }}
                >
                  <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                  {gpsErrorMsg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleDismissGps}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 0,
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
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
                    background: 'var(--teal, #006e6f)',
                    color: '#fff',
                    border: 0,
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,110,111,0.3)',
                  }}
                >
                  <MapPin size={14} /> Allow GPS Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
