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

/**
 * Pixel-perfect styles matching the exact Edufyi design in the user reference screenshots:
 * - Deep midnight background with top-right cyan glow
 * - Dark navy rounded input fields (#0c1829) with perfect icon clearance
 * - Solid cyan primary buttons with glowing under-drop shadows (#00a8e8 / #00b4d8)
 * - Stylized brand badge + ELYTHRA EdufyiTech typography
 * - High-specificity scoped rules to prevent global styles.css override
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
        background-color: #050a14 !important;
        background-image: 
          radial-gradient(circle at 85% 15%, rgba(0, 180, 216, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 15% 85%, rgba(2, 132, 199, 0.12) 0%, transparent 40%) !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        width: 100% !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 30px 16px !important;
        position: relative !important;
        overflow-x: hidden !important;
      }

      .edufyi-login-card {
        width: 100% !important;
        max-width: 410px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        z-index: 2 !important;
      }

      /* Logo Header */
      .edufyi-brand-header {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 12px !important;
        margin-bottom: 22px !important;
        filter: drop-shadow(0 0 18px rgba(0, 180, 216, 0.35)) !important;
      }

      .edufyi-brand-emblem-box {
        width: 46px !important;
        height: 46px !important;
        background: #ffffff !important;
        border-radius: 12px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 0 20px rgba(0, 180, 216, 0.5) !important;
        flex-shrink: 0 !important;
      }

      .edufyi-brand-text {
        text-align: left !important;
        display: flex !important;
        flex-direction: column !important;
      }

      .edufyi-brand-kicker {
        font-size: 11px !important;
        letter-spacing: 0.22em !important;
        font-weight: 700 !important;
        color: #94a3b8 !important;
        text-transform: uppercase !important;
        line-height: 1.1 !important;
      }

      .edufyi-brand-name {
        font-size: 25px !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        letter-spacing: -0.02em !important;
        line-height: 1.15 !important;
      }

      .edufyi-brand-name span {
        color: #00b4d8 !important;
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
        margin-bottom: 16px !important;
      }

      /* Heading & Subtitle */
      .edufyi-login-title {
        font-size: 32px !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        margin: 0 0 10px 0 !important;
        letter-spacing: -0.025em !important;
        line-height: 1.2 !important;
      }

      .edufyi-login-subtitle {
        font-size: 13.5px !important;
        color: #7d8fa9 !important;
        margin: 0 0 24px 0 !important;
        line-height: 1.45 !important;
        max-width: 340px !important;
      }

      /* Management Role Tabs */
      .edufyi-mgmt-tabs {
        width: 100% !important;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
        margin-bottom: 20px !important;
      }

      .edufyi-mgmt-tab {
        height: 44px !important;
        background: #0c1829 !important;
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
        background: #091a2e !important;
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
        height: 52px !important;
        background: #0c1829 !important;
        background-color: #0c1829 !important;
        border: 1px solid rgba(30, 58, 95, 0.85) !important;
        border-radius: 12px !important;
        box-shadow: none !important;
        transition: all 0.2s ease !important;
        overflow: hidden !important;
      }

      .edufyi-login-root .edufyi-field-box:focus-within {
        border-color: #00b4d8 !important;
        box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.2) !important;
        background: #0e1c31 !important;
        background-color: #0e1c31 !important;
      }

      /* Input Icon */
      .edufyi-login-root .edufyi-field-icon {
        position: absolute !important;
        left: 18px !important;
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
        height: 52px !important;
        min-height: 52px !important;
        max-height: 52px !important;
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        border-width: 0 !important;
        outline: none !important;
        box-shadow: none !important;
        color: #ffffff !important;
        font-size: 14.5px !important;
        font-weight: 500 !important;
        padding: 0 46px 0 52px !important;
        margin: 0 !important;
        line-height: 52px !important;
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
        -webkit-box-shadow: 0 0 0 1000px #0c1829 inset !important;
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
        background: #091a2e !important;
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
        background: #0c1829 !important;
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
        background: #112239 !important;
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
 * Pixel-perfect EdufyiTech Brand Header matching Screenshot 1 & 2
 */
function BrandLogo() {
  return (
    <div className="edufyi-brand-header">
      <div className="edufyi-brand-emblem-box">
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="13" stroke="#00b4d8" strokeWidth="2.5" />
          <path
            d="M12 13.5H23C23.8 13.5 24.5 14.2 24.5 15C24.5 15.8 23.8 16.5 23 16.5H15.5M12 18H21C21.8 18 22.5 18.7 22.5 19.5C22.5 20.3 21.8 21 21 21H12M12 22.5H24"
            stroke="#0096c7"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="edufyi-brand-text">
        <span className="edufyi-brand-kicker">ELYTHRA</span>
        <span className="edufyi-brand-name">
          Edufyi<span>Tech</span>
        </span>
      </div>
    </div>
  )
}

/**
 * EMPLOYEE LOGIN PAGE
 * Rendered at #/employee/login
 * Exactly matching Image 2:
 * - NO tabs! NO Admin Terminal / HR Operations buttons!
 * - NO switch console option!
 */
export function EmployeeLoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

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
      window.location.hash = '#/employee'
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="edufyi-login-root">
      <LoginStyles />
      <div className="edufyi-login-card">
        {/* BRAND LOGO */}
        <BrandLogo />

        {/* BADGE: EMPLOYEE SELF-SERVICE */}
        <div className="edufyi-pill-badge">
          <Sparkles size={13} style={{ color: '#00d2ff' }} />
          <span>EMPLOYEE SELF-SERVICE</span>
        </div>

        {/* TITLE & SUBTITLE */}
        <h1 className="edufyi-login-title">Employee Login</h1>
        <p className="edufyi-login-subtitle">
          Sign in with your Admin or HR-created account
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

        {/* FORM */}
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
            onClick={() => setNotice('Hardware Passkey authentication is currently in private preview. Please use your standard credentials.')}
          >
            <Fingerprint size={17} style={{ color: '#00d2ff' }} />
            Passkey login is not configured
          </button>
        </form>
      </div>
    </div>
  )
}

/**
 * HR & ADMIN MANAGEMENT LOGIN PAGE
 * Rendered at #/admin/login, #/hr/login, and default #/login
 * Exactly matching Image 1:
 * - Tabs: Admin Terminal | HR Operations
 * - NO option for Employee!
 * - NO switch console option!
 */
export function ManagementLoginPage({ defaultRole = 'hr' }) {
  const { login } = useAuth()

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
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

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

  const isHr = role === 'hr'

  return (
    <div className="edufyi-login-root">
      <LoginStyles />
      <div className="edufyi-login-card">
        {/* BRAND LOGO */}
        <BrandLogo />

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

        {/* FORM */}
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
            onClick={() => setNotice('Hardware Passkey authentication is currently in private preview. Please use your standard credentials.')}
          >
            <Key size={16} style={{ color: '#00d2ff' }} />
            Passkey login is not configured
          </button>
        </form>
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
  const isEmployee =
    route?.path === '/employee/login' ||
    (typeof window !== 'undefined' && window.location.hash.includes('employee'))

  if (isEmployee) {
    return <EmployeeLoginPage />
  }

  const defaultRole =
    route?.path === '/admin/login' ||
    (typeof window !== 'undefined' && window.location.hash.includes('admin'))
      ? 'admin'
      : 'hr'

  return <ManagementLoginPage defaultRole={defaultRole} />
}
