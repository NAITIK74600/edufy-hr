import React, { useState } from 'react'
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export function ChangePasswordModal({ isOpen = true, isForced = false, onClose, onSuccess }) {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const mustChange = isForced || Boolean(user?.mustChangePassword)

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')
    setSuccess('')

    if (!mustChange && !currentPassword) {
      setError('Please enter your current password.')
      return
    }

    if (!newPassword || newPassword.trim().length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    if (currentPassword && currentPassword === newPassword) {
      setError('New password must be different from your current temporary password.')
      return
    }

    setLoading(true)
    try {
      await changePassword({
        currentPassword: currentPassword || undefined,
        newPassword: newPassword.trim(),
      })
      setSuccess('Your new password has been set successfully!')
      if (onSuccess) onSuccess()
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
    } catch (err) {
      setError(err?.message || 'Failed to update password. Please check your current password and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4, 8, 18, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (!mustChange && e.target === e.currentTarget && onClose) {
          onClose()
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#0b1626',
          border: '1px solid rgba(0, 180, 216, 0.35)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 180, 216, 0.15)',
          borderRadius: '18px',
          padding: '28px 24px 24px',
          color: '#ffffff',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: 'relative',
        }}
      >
        {/* Close Button (only if not forced) */}
        {!mustChange && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              border: 0,
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 12px',
              borderRadius: '14px',
              background: 'rgba(0, 180, 216, 0.12)',
              border: '1px solid rgba(0, 180, 216, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00d2ff',
            }}
          >
            <KeyRound size={24} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px', color: '#f8fafc' }}>
            {mustChange ? 'Set Your New Password' : 'Change Your Password'}
          </h2>

          <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
            {mustChange
              ? 'Your account was assigned an auto-generated temporary password. Please set a new personal password to secure your workspace account.'
              : 'Update your corporate workspace login password. Must be at least 8 characters long.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '14px',
              color: '#fca5a5',
              fontSize: '12px',
              lineHeight: 1.35,
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '14px',
              color: '#6ee7b7',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          {/* Current Password (if not forced or if user wants to supply) */}
          {!mustChange && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                CURRENT PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 40px 0 38px',
                    background: '#07101b',
                    border: '1px solid rgba(0, 180, 216, 0.25)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 0,
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              NEW PASSWORD (MIN. 8 CHARACTERS)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Lock size={15} />
              </span>
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 40px 0 38px',
                  background: '#07101b',
                  border: '1px solid rgba(0, 180, 216, 0.25)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 0,
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              CONFIRM NEW PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <ShieldCheck size={15} />
              </span>
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 16px 0 38px',
                  background: '#07101b',
                  border: '1px solid rgba(0, 180, 216, 0.25)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              marginTop: '8px',
              background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
              border: 0,
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(0, 180, 216, 0.35)',
              transition: 'opacity 0.2s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'SAVING PASSWORD...' : (mustChange ? 'SAVE & ENTER WORKSPACE' : 'UPDATE PASSWORD')}
          </button>
        </form>
      </div>
    </div>
  )
}
