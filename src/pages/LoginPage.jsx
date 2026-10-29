import { useState, useEffect } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Key,
  Fingerprint,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { isPasskeySupported, loginWithPasskey, registerPasskey } from '../services/passkeyAuth'

/**
 * Premium Card Layout & Pixel-Perfect Theme:
 * - Glassmorphic high-contrast dark card container with subtle cyan neon border & glow
 * - Official Elythra EdufyiTech banner logo from /elythra-edufyitech-logo.png
 * - Deep midnight inputs (#07101b) with crisp icon alignment and zero text overlap
 * - High-specificity scoped overrides to guarantee 100% immunity against global styles.css
 */
function LoginStyles() {
  return (
    <style>{`
      .edufyi-login-root,
      .edufyi-login-root * {
        box-sizing: border-box !important;
      }

      .edufyi-login-root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        background-color: #040812 !important;
        background-image: 
          radial-gradient(circle at 80% 12%, rgba(0, 180, 216, 0.20) 0%, transparent 45%),
          radial-gradient(circle at 18% 85%, rgba(2, 132, 199, 0.15) 0%, transparent 42%) !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        width: 100% !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 40px 16px !important;
        position: relative !important;
        overflow-x: hidden !important;
      }

      /* Premium Card Layout */
      .edufyi-login-card {
        width: 100% !important;
        max-width: 430px !important;
        background: rgba(11, 22, 38, 0.88) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(0, 180, 216, 0.25) !important;
        box-shadow: 
          0 24px 60px rgba(0, 0, 0, 0.65),
          0 0 35px rgba(0, 180, 216, 0.12) !important;
        border-radius: 22px !important;
        padding: 36px 30px 32px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        z-index: 2 !important;
        position: relative !important;
      }

      @media (max-width: 480px) {
        .edufyi-login-card {
          padding: 28px 18px 24px !important;
          border-radius: 18px !important;
        }
      }

      /* Official Logo Image */
      .edufyi-brand-logo {
        height: 48px !important;
        max-width: 240px !important;
        object-fit: contain !important;
        margin-bottom: 20px !important;
        filter: drop-shadow(0 0 16px rgba(0, 180, 216, 0.40)) !important;
        display: block !important;
      }

      /* Pill Badge */
      .edufyi-pill-badge {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.08em !important;
        padding: 5px 16px !important;
        border-radius: 9999px !important;
        background: rgba(0, 180, 216, 0.08) !important;
        border: 1px solid rgba(0, 180, 216, 0.45) !important;
        color: #00d2ff !important;
        margin-bottom: 14px !important;
      }

      /* Heading & Subtitle */
      .edufyi-login-title {
        font-size: 28px !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        margin: 0 0 8px 0 !important;
        letter-spacing: -0.025em !important;
        line-height: 1.2 !important;
      }

      .edufyi-login-subtitle {
        font-size: 13.5px !important;
        color: #7d8fa9 !important;
        margin: 0 0 22px 0 !important;
        line-height: 1.45 !important;
        max-width: 340px !important;
      }

      /* Management Role Tabs */
      .edufyi-mgmt-tabs {
        width: 100% !important;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
        margin-bottom: 18px !important;
      }

      .edufyi-mgmt-tab {
        height: 44px !important;
        background: #081322 !important;
        border: 1px solid rgba(30, 58, 95, 0.8) !important;
        border-radius: 10px !important;
        color: #64748b !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .edufyi-mgmt-tab:hover {
        color: #cbd5e1 !important;
        border-color: rgba(0, 180, 216, 0.4) !important;
      }

      .edufyi-mgmt-tab.active {
        background: #06172a !important;
        border: 2px solid #00b4d8 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        box-shadow: 0 0 16px rgba(0, 180, 216, 0.28) !important;
      }

      /* Form */
      .edufyi-login-form {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 14px !important;
      }

      /* Input Box Container */
      .edufyi-login-root .edufyi-field-box {
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        height: 50px !important;
        background: #07101b !important;
        background-color: #07101b !important;
        border: 1px solid rgba(30, 58, 95, 0.85) !important;
        border-radius: 12px !important;
        box-shadow: none !important;
        transition: all 0.2s ease !important;
        overflow: hidden !important;
      }

      .edufyi-login-root .edufyi-field-box:focus-within {
        border-color: #00b4d8 !important;
        box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.2) !important;
        background: #091626 !important;
        background-color: #091626 !important;
      }

      /* Input Icon */
      .edufyi-login-root .edufyi-field-icon {
        position: absolute !important;
        left: 17px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        color: #5a7194 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: none !important;
        z-index: 5 !important;
      }

      .edufyi-login-root .edufyi-field-box:focus-within .edufyi-field-icon {
        color: #00b4d8 !important;
      }

      /* Actual HTML Input Field (High specificity override) */
      .edufyi-login-root input.edufyi-field-input,
      .edufyi-login-root .edufyi-field-box input,
      .edufyi-login-root .edufyi-field-box input[type="text"],
      .edufyi-login-root .edufyi-field-box input[type="email"],
      .edufyi-login-root .edufyi-field-box input[type="password"] {
        display: block !important;
        width: 100% !important;
        height: 50px !important;
        min-height: 50px !important;
        max-height: 50px !important;
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        border-width: 0 !important;
        outline: none !important;
        box-shadow: none !important;
        color: #ffffff !important;
        font-size: 14.5px !important;
        font-weight: 500 !important;
        padding: 0 44px 0 50px !important;
        margin: 0 !important;
        line-height: 50px !important;
        font-family: inherit !important;
      }

      .edufyi-login-root input.edufyi-field-input:focus,
      .edufyi-login-root .edufyi-field-box input:focus,
      .edufyi-login-root .edufyi-field-box input[type="text"]:focus,
      .edufyi-login-root .edufyi-field-box input[type="email"]:focus,
      .edufyi-login-root .edufyi-field-box input[type="password"]:focus {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        color: #ffffff !important;
      }

      .edufyi-login-root input.edufyi-field-input::placeholder,
      .edufyi-login-root .edufyi-field-box input::placeholder {
        color: #556d8f !important;
        font-size: 14px !important;
        opacity: 1 !important;
      }

      /* Chrome autofill dark background preservation */
      .edufyi-login-root input:-webkit-autofill,
      .edufyi-login-root input:-webkit-autofill:hover,
      .edufyi-login-root input:-webkit-autofill:focus,
      .edufyi-login-root input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #07101b inset !important;
        -webkit-text-fill-color: #ffffff !important;
        caret-color: #ffffff !important;
        transition: background-color 5000s ease-in-out 0s !important;
      }

      /* Password Eye Toggle */
      .edufyi-login-root .edufyi-eye-toggle {
        position: absolute !important;
        right: 14px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        background: transparent !important;
        border: none !important;
        color: #5a7194 !important;
        cursor: pointer !important;
        padding: 4px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 5 !important;
      }

      .edufyi-login-root .edufyi-eye-toggle:hover {
        color: #00b4d8 !important;
      }

      /* Row with Remember me + recovery link */
      .edufyi-login-root .edufyi-action-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100% !important;
        margin-top: 4px !important;
        margin-bottom: 8px !important;
        font-size: 13.5px !important;
      }

      .edufyi-login-root .edufyi-remember-label {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        color: #cbd5e1 !important;
        cursor: pointer !important;
        user-select: none !important;
        font-size: 13.5px !important;
      }

      .edufyi-login-root .edufyi-checkbox {
        appearance: none !important;
        -webkit-appearance: none !important;
        width: 18px !important;
        height: 18px !important;
        border: 1.5px solid #00b4d8 !important;
        border-radius: 4px !important;
        background: #07101b !important;
        cursor: pointer !important;
        display: inline-grid !important;
        place-content: center !important;
        position: relative !important;
        margin: 0 !important;
        transition: all 0.2s ease !important;
      }

      .edufyi-login-root .edufyi-checkbox:checked {
        background: #00b4d8 !important;
        box-shadow: 0 0 10px rgba(0, 180, 216, 0.6) !important;
      }

      .edufyi-login-root .edufyi-checkbox:checked::before {
        content: "" !important;
        width: 10px !important;
        height: 5px !important;
        border-left: 2px solid #ffffff !important;
        border-bottom: 2px solid #ffffff !important;
        transform: rotate(-45deg) translate(1px, -1px) !important;
      }

      .edufyi-login-root .edufyi-link {
        color: #00b4d8 !important;
        font-weight: 600 !important;
        text-decoration: none !important;
        cursor: pointer !important;
        background: none !important;
        border: none !important;
        padding: 0 !important;
        font-size: 13.5px !important;
      }

      .edufyi-login-root .edufyi-link:hover {
        text-decoration: underline !important;
        color: #38bdf8 !important;
      }

      /* Primary Vibrant Cyan Button with Glowing Under Drop Shadow */
      .edufyi-login-root .edufyi-primary-btn {
        width: 100% !important;
        height: 50px !important;
        background: #00a8e8 !important;
        border: none !important;
        border-radius: 12px !important;
        color: #ffffff !important;
        font-size: 14px !important;
        font-weight: 800 !important;
        letter-spacing: 0.05em !important;
        text-transform: uppercase !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        box-shadow: 0 8px 24px rgba(0, 168, 232, 0.45) !important;
        transition: all 0.2s ease !important;
      }

      .edufyi-login-root .edufyi-primary-btn:hover:not(:disabled) {
        background: #00b4d8 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 12px 30px rgba(0, 180, 216, 0.6) !important;
      }

      .edufyi-login-root .edufyi-primary-btn:active:not(:disabled) {
        transform: translateY(0) !important;
      }

      .edufyi-login-root .edufyi-primary-btn:disabled {
        opacity: 0.65 !important;
        cursor: not-allowed !important;
      }

      /* Secondary Outline Button */
      .edufyi-login-root .edufyi-secondary-btn {
        width: 100% !important;
        height: 48px !important;
        background: #07101b !important;
        border: 1px solid rgba(30, 58, 95, 0.85) !important;
        border-radius: 12px !important;
        color: #ffffff !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 10px !important;
        transition: all 0.2s ease !important;
      }

      .edufyi-login-root .edufyi-secondary-btn:hover {
        background: #0c1c2e !important;
        border-color: rgba(0, 180, 216, 0.4) !important;
        color: #ffffff !important;
      }

      /* Error Alert */
      .edufyi-login-root .edufyi-error-box {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        background: rgba(239, 68, 68, 0.12) !important;
        border: 1px solid rgba(239, 68, 68, 0.35) !important;
        border-radius: 10px !important;
        padding: 10px 14px !important;
        margin-bottom: 14px !important;
        color: #fca5a5 !important;
        font-size: 12.5px !important;
        line-height: 1.4 !important;
        width: 100% !important;
        text-align: left !important;
      }

      /* Notice Box */
      .edufyi-login-root .edufyi-notice-box {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        background: rgba(0, 180, 216, 0.12) !important;
        border: 1px solid rgba(0, 180, 216, 0.35) !important;
        border-radius: 10px !important;
        padding: 10px 14px !important;
        margin-bottom: 14px !important;
        color: #7dd3fc !important;
        font-size: 12.5px !important;
        line-height: 1.4 !important;
        width: 100% !important;
        text-align: left !important;
      }
    `}</style>
  )
}

/**
 * EMPLOYEE LOGIN PAGE
 * Rendered at #/employee/login
 * Exactly matching Image 2:
 * - Card container
 * - elythra-edufyitech-logo.png
 * - NO tabs! NO Admin Terminal / HR Operations buttons!
 * - NO switch console option!
 */
export function EmployeeLoginPage() {
  const { login, changePassword, completeSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mustSetNewPassword, setMustSetNewPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  async function handlePasskeyLogin() {
    setError('')
    setNotice('')
    if (!isPasskeySupported()) {
      setError('Biometric Passkeys (Touch ID, Windows Hello, Face ID) are not supported on this browser.')
      return
    }
    setPasskeyLoading(true)
    try {
      const res = await loginWithPasskey({ email: email.trim(), portal: 'employee' })
      if (res.token && res.user) {
        completeSession(res.token, res.user)
        window.location.hash = '#/employee'
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Passkey prompt was cancelled.')
      } else if (err.code === 'NO_PASSKEY_REGISTERED' || err.message?.includes('No registered passkey')) {
        if (password && email.trim()) {
          try {
            setNotice('Registering this device as your trusted passkey...')
            const reg = await registerPasskey({ email: email.trim(), password, deviceName: navigator.userAgent.includes('Windows') ? 'Windows Hello' : 'Biometric Key' })
            if (reg.token && reg.user) {
              completeSession(reg.token, reg.user)
              window.location.hash = '#/employee'
              return
            }
          } catch (regErr) {
            setError(regErr.message || 'Passkey registration cancelled.')
          }
        } else {
          setError('No passkey registered for this account yet. Please enter your password once to register your device.')
        }
      } else {
        setError(err.message || 'Passkey verification failed.')
      }
    } finally {
      setPasskeyLoading(false)
      setNotice('')
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')
    setNotice('')

    if (!email.trim() || !password) {
      setError('Please enter your work email, username, or employee ID and password.')
      return
    }

    setLoading(true)
    try {
      const loggedUser = await login(email.trim(), password, 'employee')
      if (loggedUser?.role === 'admin' || loggedUser?.role === 'hr') {
        throw new Error('Access denied: Management accounts must log in via the HR / Admin Console.')
      }
      if (loggedUser?.mustChangePassword) {
        setMustSetNewPassword(true)
        setNotice('First-time login detected: An auto-generated temporary password was used. Please set a new password below.')
        return
      }
      window.location.hash = '#/employee'
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSetNewPassword(e) {
    if (e) e.preventDefault()
    setError('')
    if (!newPassword || newPassword.trim().length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (newPassword === password) {
      setError('New password must be different from your temporary password.')
      return
    }
    setLoading(true)
    try {
      await changePassword({ currentPassword: password, newPassword: newPassword.trim() })
      window.location.hash = '#/employee'
    } catch (err) {
      setError(err?.message || 'Failed to set new password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="edufyi-login-root">
      <LoginStyles />
      <div className="edufyi-login-card">
        {/* OFFICIAL BRAND LOGO BANNER */}
        <img
          src="/elythra-edufyitech-logo.png"
          alt="Elythra EdufyiTech"
          className="edufyi-brand-logo"
        />

        {/* BADGE: EMPLOYEE SELF-SERVICE */}
        <div className="edufyi-pill-badge">
          <Sparkles size={13} style={{ color: '#00d2ff' }} />
          <span>{mustSetNewPassword ? 'SECURITY SETUP' : 'EMPLOYEE SELF-SERVICE'}</span>
        </div>

        {/* TITLE & SUBTITLE */}
        <h1 className="edufyi-login-title">
          {mustSetNewPassword ? 'Set New Password' : 'Employee Login'}
        </h1>
        <p className="edufyi-login-subtitle">
          {mustSetNewPassword
            ? 'Choose a permanent personal password to secure your account'
            : 'Sign in with your Admin or HR-created account'}
        </p>

        {/* ERROR BOX */}
        {error && (
          <div className="edufyi-error-box">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* NOTICE BOX */}
        {notice && (
          <div className="edufyi-notice-box">
            <Sparkles size={15} style={{ flexShrink: 0 }} />
            <span>{notice}</span>
          </div>
        )}

        {mustSetNewPassword ? (
          <form onSubmit={handleSetNewPassword} className="edufyi-login-form">
            <div className="edufyi-field-box">
              <span className="edufyi-field-icon">
                <Key size={17} />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="edufyi-field-input"
                placeholder="New Password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                className="edufyi-eye-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="edufyi-field-box">
              <span className="edufyi-field-icon">
                <Lock size={17} />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="edufyi-field-input"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <button type="submit" className="edufyi-primary-btn" disabled={loading}>
              {loading ? 'SAVING NEW PASSWORD...' : (
                <>
                  SAVE PASSWORD & ENTER <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="edufyi-login-form">
            <div className="edufyi-field-box">
              <span className="edufyi-field-icon">
                <Mail size={17} />
              </span>
              <input
                type="text"
                className="edufyi-field-input"
                placeholder="Work Email, Username or Employee ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="edufyi-field-box">
              <span className="edufyi-field-icon">
                <Lock size={17} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="edufyi-field-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="edufyi-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="edufyi-action-row">
              <label className="edufyi-remember-label">
                <input
                  type="checkbox"
                  className="edufyi-checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                className="edufyi-link"
                onClick={() => setNotice('For account recovery, password resets, or credentials lookup, please reach out to your HR Operations team.')}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="edufyi-primary-btn" disabled={loading}>
              {loading ? 'SIGNING IN...' : (
                <>
                  SIGN IN <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              className="edufyi-secondary-btn"
              onClick={handlePasskeyLogin}
              disabled={loading || passkeyLoading}
            >
              <Fingerprint size={17} style={{ color: '#00d2ff' }} />
              {passkeyLoading ? 'VERIFYING PASSKEY...' : 'Sign in with Passkey / Biometrics'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/**
 * HR & ADMIN MANAGEMENT LOGIN PAGE
 * Rendered at #/admin/login, #/hr/login, and default #/login
 * Exactly matching Image 1:
 * - Card container
 * - elythra-edufyitech-logo.png
 * - Tabs: Admin Terminal | HR Operations
 * - NO option for Employee!
 * - NO switch console option!
 */
export function ManagementLoginPage({ defaultRole = 'hr' }) {
  const { login, changePassword, completeSession } = useAuth()

  // Track active role: 'admin' or 'hr'
  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('admin')) return 'admin'
    return defaultRole
  })

  const [email, setEmail] = useState(() => (role === 'admin' ? 'admin@edufyitech.in' : 'hr@edufyi.in'))
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mustSetNewPassword, setMustSetNewPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  async function handlePasskeyLogin() {
    setError('')
    setNotice('')
    if (!isPasskeySupported()) {
      setError('Biometric Passkeys (Touch ID, Windows Hello, Face ID) are not supported on this browser.')
      return
    }
    setPasskeyLoading(true)
    try {
      const res = await loginWithPasskey({ email: email.trim(), portal: role })
      if (res.token && res.user) {
        completeSession(res.token, res.user)
        window.location.hash = role === 'admin' ? '#/admin' : '#/hr'
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Passkey prompt was cancelled.')
      } else if (err.code === 'NO_PASSKEY_REGISTERED' || err.message?.includes('No registered passkey')) {
        if (password && email.trim()) {
          try {
            setNotice('Registering this device as your trusted passkey...')
            const reg = await registerPasskey({ email: email.trim(), password, deviceName: navigator.userAgent.includes('Windows') ? 'Windows Hello' : 'Biometric Key' })
            if (reg.token && reg.user) {
              completeSession(reg.token, reg.user)
              window.location.hash = role === 'admin' ? '#/admin' : '#/hr'
              return
            }
          } catch (regErr) {
            setError(regErr.message || 'Passkey registration cancelled.')
          }
        } else {
          setError('No passkey registered for this account yet. Please enter your password once to register your device.')
        }
      } else {
        setError(err.message || 'Passkey verification failed.')
      }
    } finally {
      setPasskeyLoading(false)
      setNotice('')
    }
  }

  // Sync hash changes dynamically
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || ''
      if (hash.includes('admin')) {
        setRole('admin')
        setEmail((prev) => (!prev || prev === 'hr@edufyi.in' || prev === 'hr@edufyitech.in' ? 'admin@edufyitech.in' : prev))
      } else if (hash.includes('hr')) {
        setRole('hr')
        setEmail((prev) => (!prev || prev === 'admin@edufyitech.in' || prev === 'admin@edufyi.in' ? 'hr@edufyi.in' : prev))
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  function handleSelectRole(targetRole) {
    setRole(targetRole)
    setError('')
    setNotice('')
    if (targetRole === 'admin') {
      if (!email || email === 'hr@edufyi.in' || email === 'hr@edufyitech.in') setEmail('admin@edufyitech.in')
      window.location.hash = '#/admin/login'
    } else {
      if (!email || email === 'admin@edufyitech.in' || email === 'admin@edufyi.in') setEmail('hr@edufyi.in')
      window.location.hash = '#/hr/login'
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')
    setNotice('')

    if (!email.trim() || !password) {
      setError(
        role === 'admin'
          ? 'Please enter your administrator email and password.'
          : 'Please enter your HR operational email and password.'
      )
      return
    }

    setLoading(true)
    try {
      const targetPortal = role === 'admin' ? 'admin' : 'hr'
      const loggedUser = await login(email.trim(), password, targetPortal)

      if (loggedUser?.mustChangePassword) {
        setMustSetNewPassword(true)
        setNotice('First-time login detected: An auto-generated temporary password was used. Please set a new password below.')
        return
      }

      if (loggedUser?.role === 'admin') {
        window.location.hash = '#/admin'
      } else if (loggedUser?.role === 'hr') {
        window.location.hash = '#/hr'
      } else {
        throw new Error('Access denied: Employee accounts cannot sign into the HR or Admin Management Console.')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSetNewPassword(e) {
    if (e) e.preventDefault()
    setError('')
    if (!newPassword || newPassword.trim().length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (newPassword === password) {
      setError('New password must be different from your temporary password.')
      return
    }
    setLoading(true)
    try {
      await changePassword({ currentPassword: password, newPassword: newPassword.trim() })
      window.location.hash = role === 'admin' ? '#/admin' : '#/hr'
    } catch (err) {
      setError(err?.message || 'Failed to set new password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isHr = role === 'hr'

  return (
    <div className="edufyi-login-root">
      <LoginStyles />
      <div className="edufyi-login-card">
        {/* OFFICIAL BRAND LOGO BANNER */}
        <img
          src="/elythra-edufyitech-logo.png"
          alt="Elythra EdufyiTech"
          className="edufyi-brand-logo"
        />

        {/* PILL BADGE */}
        <div className="edufyi-pill-badge">
          <Shield size={13} style={{ color: '#00d2ff' }} />
          <span>{isHr ? 'HR OPERATIONS' : 'ADMIN CONSOLE'}</span>
        </div>

        {/* TITLE & SUBTITLE */}
        <h1 className="edufyi-login-title">
          {isHr ? 'HR Operations Sign In' : 'Admin Terminal Sign In'}
        </h1>
        <p className="edufyi-login-subtitle">
          {isHr
            ? 'People Operations & Workforce Management (Employee accounts not permitted)'
            : 'Executive System Administration & Global Configuration (Employee accounts not permitted)'}
        </p>

        {/* ROLE TABS (ADMIN TERMINAL vs HR OPERATIONS) */}
        <div className="edufyi-mgmt-tabs">
          <button
            type="button"
            className={`edufyi-mgmt-tab ${!isHr ? 'active' : ''}`}
            onClick={() => handleSelectRole('admin')}
          >
            Admin Terminal
          </button>
          <button
            type="button"
            className={`edufyi-mgmt-tab ${isHr ? 'active' : ''}`}
            onClick={() => handleSelectRole('hr')}
          >
            HR Operations
          </button>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="edufyi-error-box">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* NOTICE BOX */}
        {notice && (
          <div className="edufyi-notice-box">
            <Shield size={15} style={{ flexShrink: 0 }} />
            <span>{notice}</span>
          </div>
        )}

        {mustSetNewPassword ? (
          <form onSubmit={handleSetNewPassword} className="edufyi-login-form">
            <div className="edufyi-field-box">
              <span className="edufyi-field-icon">
                <Key size={17} />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="edufyi-field-input"
                placeholder="New Password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                className="edufyi-eye-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="edufyi-field-box">
              <span className="edufyi-field-icon">
                <Lock size={17} />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="edufyi-field-input"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <button type="submit" className="edufyi-primary-btn" disabled={loading}>
              {loading ? 'SAVING NEW PASSWORD...' : (
                <>
                  SET PASSWORD & ENTER <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORM */
          <form onSubmit={handleSubmit} className="edufyi-login-form">
          <div className="edufyi-field-box">
            <span className="edufyi-field-icon">
              <Mail size={17} />
            </span>
            <input
              type="text"
              className="edufyi-field-input"
              placeholder={isHr ? 'hr@edufyi.in' : 'admin@edufyitech.in'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="edufyi-field-box">
            <span className="edufyi-field-icon">
              <Lock size={17} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="edufyi-field-input"
              placeholder="Master Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="edufyi-eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="edufyi-action-row">
            <label className="edufyi-remember-label">
              <input
                type="checkbox"
                className="edufyi-checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className="edufyi-link"
              onClick={() => setNotice('Master emergency recovery keys are stored securely on the host server environment (.env). Contact System Architecture if recovery is required.')}
            >
              Recovery Key?
            </button>
          </div>

          <button type="submit" className="edufyi-primary-btn" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : (
              <>
                {isHr ? 'SIGN IN TO HR PORTAL' : 'SIGN IN TO ADMIN PORTAL'} <ArrowRight size={16} />
              </>
            )}
          </button>

          <button
            type="button"
            className="edufyi-secondary-btn"
            onClick={handlePasskeyLogin}
            disabled={loading || passkeyLoading}
          >
            <Fingerprint size={16} style={{ color: '#00b4d8' }} />
            {passkeyLoading ? 'VERIFYING PASSKEY...' : 'Sign in with Passkey / Biometrics'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}

/**
 * Main Router for Login:
 * - If path is /employee/login -> renders EmployeeLoginPage (matching Screenshot 2, NO switch console)
 * - If path is /admin/login, /hr/login, or /login -> renders ManagementLoginPage (matching Screenshot 1, NO switch console)
 */
export function LoginPage({ route }) {
  const hash = typeof window !== 'undefined' ? (window.location.hash || '').toLowerCase() : ''
  const path = (route?.path || '').toLowerCase()

  // 1. Explicit Admin Console Login URL
  if (path === '/admin/login' || hash.includes('/admin/login') || hash.startsWith('#/admin')) {
    return <ManagementLoginPage defaultRole="admin" />
  }

  // 2. Explicit HR Operations Login URL
  if (path === '/hr/login' || hash.includes('/hr/login') || hash.startsWith('#/hr')) {
    return <ManagementLoginPage defaultRole="hr" />
  }

  // 3. Default for /employee/login, /login, or base root (/):
  // Strictly renders the Employee Self-Service login portal
  return <EmployeeLoginPage />
}
