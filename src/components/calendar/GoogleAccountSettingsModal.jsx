import React, { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Video,
  Key,
  Globe,
  Radio,
} from 'lucide-react'
import { apiClient } from '../../services/apiClient.js'

export function GoogleAccountSettingsModal({ isOpen, onClose, onIntegrationChanged }) {
  const [loading, setLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchStatus = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await apiClient.get('/calendar/integrations')
      const statusData = res?.data || res
      if (res?.success || statusData?.googleConfigured !== undefined) {
        setStatus(statusData)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch Google integration status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchStatus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleConnected = () => {
      setFeedback('Google Workspace successfully connected!')
      fetchStatus()
      if (onIntegrationChanged) onIntegrationChanged()
    }

    window.addEventListener('edufyi:google-calendar-connected', handleConnected)
    const handleMsg = (e) => {
      if (e.origin && e.origin !== window.location.origin && e.origin !== 'https://edufyione.edufyitech.in') {
        return
      }
      if (e.data === 'google_calendar_connected' || e.data?.type === 'google_calendar_connected') {
        handleConnected()
      } else if (e.data?.type === 'google_calendar_error') {
        setErrorMsg(e.data.error || 'Google connection was cancelled or denied.')
      }
    }
    window.addEventListener('message', handleMsg)

    return () => {
      window.removeEventListener('edufyi:google-calendar-connected', handleConnected)
      window.removeEventListener('message', handleMsg)
    }
  }, [onIntegrationChanged])

  if (!isOpen) return null

  const handleConnect = async () => {
    setConnecting(true)
    setErrorMsg('')
    setFeedback('')
    try {
      const res = await apiClient.post('/calendar/google/connect', {})
      const authUrl = res?.authUrl || res?.data?.authUrl || (res?.data && typeof res.data === 'string' ? res.data : null)
      if (authUrl) {
        // Open authorization in a clean centered popup window
        const width = 600
        const height = 720
        const left = Math.max(0, Math.round((window.screen.width - width) / 2))
        const top = Math.max(0, Math.round((window.screen.height - height) / 2))
        const popup = window.open(
          authUrl,
          'google_oauth_popup',
          `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
        )
        // If popup was blocked by browser policy, fallback directly to full page redirect
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          window.location.href = authUrl
        }
      } else {
        setErrorMsg(res?.message || 'Failed to generate Google authorization URL. Please verify GOOGLE_CLIENT_ID in server environment.')
      }
    } catch (err) {
      const detailedError = err?.fields?.message || err?.message || 'Failed to initiate Google OAuth.'
      setErrorMsg(detailedError)
    } finally {
      setConnecting(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setErrorMsg('')
    setFeedback('')
    try {
      const res = await apiClient.post('/calendar/google/sync')
      if (res?.success) {
        setFeedback(res.message || 'Successfully synchronized Google Calendar events.')
        await fetchStatus()
        if (onIntegrationChanged) onIntegrationChanged()
      } else {
        setErrorMsg(res?.message || 'Failed to sync with Google Calendar.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync with Google Calendar.')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar & Google Meet integration? Calendar sync and automatic Meet link creation will be disabled.')) {
      return
    }
    setDisconnecting(true)
    setErrorMsg('')
    try {
      const res = await apiClient.post('/calendar/google/disconnect')
      if (res?.success) {
        setFeedback('Google Workspace integration disconnected.')
        await fetchStatus()
        if (onIntegrationChanged) onIntegrationChanged()
      } else {
        setErrorMsg(res?.message || 'Failed to disconnect Google account.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to disconnect Google account.')
    } finally {
      setDisconnecting(false)
    }
  }

  const isConnected = Boolean(status?.connected || status?.isConnected)
  const isExpired = Boolean(status?.expired)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 100010,
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                Google Workspace Integration
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                Production OAuth 2.0 connection for Calendar events and Meet links
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'grid', gap: '18px' }}>
          {feedback && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#dcfce7',
                border: '1px solid #86efac',
                color: '#166534',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              {feedback}
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              {errorMsg}
            </div>
          )}

          {/* Connection Status Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: isConnected ? '#f0fdf4' : '#fffbeb',
              border: isConnected ? '1px solid #bbf7d0' : '1px solid #fef3c7',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isConnected ? '#dcfce7' : '#fef3c7',
                  color: isConnected ? '#15803d' : '#b45309',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {isConnected ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '14px', color: isConnected ? '#166534' : '#92400e' }}>
                    {isConnected ? 'Google Account Connected' : 'Google Integration Inactive'}
                  </strong>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      background: isConnected ? '#15803d' : '#d97706',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isConnected ? (isExpired ? 'Token Expired' : 'Active') : 'Disconnected'}
                  </span>
                </div>

                <p style={{ margin: '4px 0 0', fontSize: '12px', color: isConnected ? '#14532d' : '#78350f' }}>
                  {isConnected
                    ? `Connected as ${status?.email || 'Authorized Workspace User'}`
                    : 'Connect an authorized Google account to generate genuine Meet conferences and sync meetings.'}
                </p>

                {isConnected && status?.lastSync && (
                  <small style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                    Last synchronized: {new Date(status.lastSync).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </small>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={fetchStatus}
              disabled={loading}
              title="Refresh status"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>

          {/* Configuration & Environment Details */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '12px',
              display: 'grid',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Google Cloud Project:</span>
              <strong style={{ color: 'var(--ink)' }}>hr-ed-514310</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Authorized Redirect URI:</span>
              <strong style={{ color: 'var(--ink)' }}>https://edufyione.edufyitech.in</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Backend Port / Proxy:</span>
              <strong style={{ color: 'var(--teal)' }}>30005 (Production VPS)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Token Storage:</span>
              <strong style={{ color: '#16a34a' }}>AES-256-GCM Encrypted in MongoDB</strong>
            </div>
          </div>

          {/* Scopes Overview */}
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
              Authorized Permissions (Scopes)
            </h4>
            <div style={{ display: 'grid', gap: '6px', fontSize: '11.5px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#0d9488" />
                <span>Google Calendar Events (Create, Update, Cancel meetings)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#0d9488" />
                <span>Google Meet Conferencing (`conferenceDataVersion=1`)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#0d9488" />
                <span>Offline Access with automatic token renewal via encrypted refresh token</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {isConnected ? (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnecting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #fca5a5',
                background: '#ffffff',
                color: '#dc2626',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={13} />
              {disconnecting ? 'Disconnecting...' : 'Disconnect Account'}
            </button>
          ) : (
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Ready to authenticate
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #0d9488',
                  background: '#f0fdf4',
                  color: '#0f766e',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} className={syncing ? 'spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync Calendar Events'}
              </button>
            )}

            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
              }}
            >
              {connecting ? (
                <>
                  <RefreshCw size={13} className="spin" />
                  Connecting...
                </>
              ) : isConnected ? (
                <>
                  <RefreshCw size={13} />
                  Reconnect Google
                </>
              ) : (
                <>
                  <ExternalLink size={13} />
                  Connect Google Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

