import React, { useState, useEffect } from 'react'
import {
  Fingerprint,
  ShieldCheck,
  KeyRound,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Laptop,
  Smartphone,
  Loader2,
} from 'lucide-react'
import {
  isPasskeySupported,
  registerPasskey,
  listPasskeys,
  deletePasskey,
} from '../services/passkeyAuth'
import { useAuth } from '../auth/AuthContext'

export function PasskeyModal({
  isOpen,
  onClose,
  initialEmail = '',
  initialPassword = '',
  onRegistered,
}) {
  const { user, completeSession } = useAuth()
  const isLoggedIn = Boolean(user && user.id)

  const [email, setEmail] = useState(initialEmail || user?.email || '')
  const [password, setPassword] = useState(initialPassword || '')
  const [deviceName, setDeviceName] = useState(() => {
    if (typeof navigator === 'undefined') return 'My Device'
    const ua = navigator.userAgent || ''
    if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone / iPad (Face ID)'
    if (/Mac/.test(ua)) return 'Mac (Touch ID)'
    if (/Android/.test(ua)) return 'Android Biometrics'
    if (/Windows/.test(ua)) return 'Windows PC (Windows Hello)'
    return 'Security Key / Biometric Device'
  })

  const [passkeys, setPasskeys] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supported = isPasskeySupported()

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      loadPasskeys()
    }
    if (initialEmail) setEmail(initialEmail)
    if (initialPassword) setPassword(initialPassword)
    setError('')
    setSuccess('')
  }, [isOpen, isLoggedIn, initialEmail, initialPassword])

  async function loadPasskeys() {
    setLoadingList(true)
    try {
      const list = await listPasskeys()
      setPasskeys(Array.isArray(list) ? list : [])
    } catch {
      // If error or unauthenticated, ignore
    } finally {
      setLoadingList(false)
    }
  }

  async function handleRegister(e) {
    if (e) e.preventDefault()
    setError('')
    setSuccess('')

    if (!supported) {
      setError('WebAuthn / Passkeys (Windows Hello, Face ID, Touch ID) are not supported on this browser or platform.')
      return
    }

    if (!isLoggedIn && (!email.trim() || !password)) {
      setError('Please provide your work email and password to authorize your device.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        deviceName: deviceName.trim() || undefined,
      }
      if (!isLoggedIn) {
        payload.email = email.trim()
        payload.password = password
      }

      const res = await registerPasskey(payload)

      setSuccess('Biometric Passkey registered successfully! You can now use 1-click login on this device.')

      if (onRegistered) {
        onRegistered(res)
      }

      if (!isLoggedIn && res.token && res.user && completeSession) {
        completeSession(res.token, res.user)
        const portal = res.user.role === 'admin' ? '/admin' : res.user.role === 'hr' ? '/hr' : '/employee'
        window.location.hash = `#${portal}`
        onClose?.()
        return
      }

      if (isLoggedIn) {
        await loadPasskeys()
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Passkey setup was cancelled by the user.')
      } else {
        setError(err.message || 'Failed to register Passkey.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(credentialId) {
    if (!window.confirm('Are you sure you want to remove this passkey? You will not be able to sign in with this device without re-registering.')) {
      return
    }
    setError('')
    setSuccess('')
    setDeletingId(credentialId)
    try {
      await deletePasskey(credentialId)
      setPasskeys((prev) => prev.filter((k) => k.credentialId !== credentialId))
      setSuccess('Passkey removed successfully.')
    } catch (err) {
      setError(err.message || 'Failed to remove passkey.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 12, 18, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0a1d24',
          color: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          border: '1px solid rgba(0, 180, 160, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(0, 110, 111, 0.25) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 210, 255, 0.15)',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00d2ff',
              }}
            >
              <Fingerprint size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                {isLoggedIn ? 'Biometric Passkeys & Security' : 'Add / Register Device Passkey'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                {isLoggedIn
                  ? 'Manage your fingerprints, Face ID & Windows Hello keys'
                  : 'Link this device for instant passwordless sign-in'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 0,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Compatibility Alert */}
          {!supported && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>Biometric Passkeys (WebAuthn) are not supported on this browser. Please use Chrome, Edge, Safari, or an updated mobile browser.</span>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Quick Info Box */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(0, 110, 111, 0.15)',
              border: '1px solid rgba(0, 180, 160, 0.25)',
              fontSize: '12.5px',
              color: '#cbd5e1',
              lineHeight: 1.5,
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={18} style={{ color: '#2dd4bf', flexShrink: 0, marginTop: '2px' }} />
            <div>
              Passkeys use your device&apos;s built-in secure hardware (<strong>Windows Hello, Apple Touch ID / Face ID, or Android Biometrics</strong>). No passwords to remember, highly secure and phishing-resistant.
            </div>
          </div>

          {/* Registration Form / Action */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!isLoggedIn && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                    Work Email / Username
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. employee@edufyitech.in"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                    Account Password (one-time verification)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your current password"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Device Label
              </label>
              <input
                type="text"
                required
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. My Laptop (Windows Hello)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !supported}
              style={{
                marginTop: '6px',
                padding: '12px 18px',
                borderRadius: '8px',
                border: 0,
                background: 'linear-gradient(135deg, #008788 0%, #0d9488 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: submitting || !supported ? 'not-allowed' : 'pointer',
                opacity: submitting || !supported ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 110, 111, 0.35)',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Scanning Biometrics on Device...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>{isLoggedIn ? 'Register Passkey for this Device' : 'Register Passkey & Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* List of Registered Passkeys (when logged in) */}
          {isLoggedIn && (
            <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>Enrolled Passkeys ({passkeys.length})</span>
                {loadingList && <Loader2 size={14} className="animate-spin" color="#94a3b8" />}
              </div>

              {passkeys.length === 0 && !loadingList ? (
                <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12.5px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  No passkey enrolled on this account yet. Click the button above to register your current device.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {passkeys.map((k) => (
                    <div
                      key={k.credentialId}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/iPhone|iPad|Android|Mobile/i.test(k.deviceName) ? (
                          <Smartphone size={16} color="#00d2ff" />
                        ) : (
                          <Laptop size={16} color="#00d2ff" />
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                            {k.deviceName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Added {new Date(k.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(k.credentialId)}
                        disabled={deletingId === k.credentialId}
                        title="Remove passkey"
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: '#ef4444',
                          cursor: deletingId === k.credentialId ? 'wait' : 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {deletingId === k.credentialId ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
