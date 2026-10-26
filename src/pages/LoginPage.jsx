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
 * Pixel-perfect styles matching the exact Edufy design in the user screenshot:
 * - Deep dark navy/midnight background with top-right cyan glow
 * - Dark navy rounded input fields (#0c1829)
 * - Vivid cyan buttons with glowing under-drop shadows (#00a8e8 / #00b4d8)
 * - Inactive / Active tab pills with cyan neon borders
 * - Passkey login not configured bottom button
 */
function LoginStyles() {
  return (
    <style>{`
      .edufyi-login-root,
      .edufyi-login-root * {
        box-sizing: border-box;
      }

      .edufyi-login-root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #050a14 !important;
        background-image: 
          radial-gradient(circle at 85% 15%, rgba(0, 180, 216, 0.16) 0%, transparent 45%),
          radial-gradient(circle at 15% 85%, rgba(2, 132, 199, 0.12) 0%, transparent 40%);
        min-height: 100vh;
        min-height: 100dvh;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 30px 16px;
        position: relative;
        overflow-x: hidden;
      }

      .edufyi-login-card {
        width: 100%;
        max-width: 410px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        z-index: 2;
      }

      /* Logo */
      .edufyi-brand-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .edufyi-brand-logo {
        height: 48px;
        width: 48px;
        border-radius: 12px;
        object-fit: cover;
      }

      .edufyi-brand-text {
        text-align: left;
        display: flex;
        flex-direction: column;
      }

      .edufyi-brand-kicker {
        font-size: 11px;
        letter-spacing: 0.18em;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        line-height: 1.1;
      }

      .edufyi-brand-name {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.02em;
        line-height: 1.15;
      }

      .edufyi-brand-name span {
        color: #00c0f0;
      }

      /* Pill Badge */
      .edufyi-pill-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 5px 16px;
        border-radius: 9999px;
        background: rgba(0, 180, 216, 0.08);
        border: 1px solid rgba(0, 180, 216, 0.45);
        color: #00d2ff;
        margin-bottom: 16px;
      }

      /* Heading & Subtitle */
      .edufyi-login-title {
        font-size: 32px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 10px 0;
        letter-spacing: -0.025em;
      }

      .edufyi-login-subtitle {
        font-size: 13.5px;
        color: #889bb5;
        margin: 0 0 24px 0;
        line-height: 1.45;
        max-width: 340px;
      }

      /* Management Role Tabs */
      .edufyi-mgmt-tabs {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 20px;
      }

      .edufyi-mgmt-tab {
        height: 44px;
        background: #0c1829;
        border: 1px solid rgba(30, 58, 95, 0.8);
        border-radius: 10px;
        color: #64748b;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .edufyi-mgmt-tab:hover {
        color: #cbd5e1;
        border-color: rgba(0, 180, 216, 0.4);
      }

      .edufyi-mgmt-tab.active {
        background: #091a2e;
        border: 2px solid #00b4d8;
        color: #ffffff;
        font-weight: 700;
        box-shadow: 0 0 16px rgba(0, 180, 216, 0.28);
      }

      /* Form */
      .edufyi-login-form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .edufyi-field-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        background: #0c1829;
        border: 1px solid rgba(30, 58, 95, 0.85);
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .edufyi-field-box:focus-within {
        border-color: #00b4d8;
        box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.2);
        background: #0e1c31;
      }

      .edufyi-field-icon {
        position: absolute;
        left: 16px;
        color: #5a7194;
        display: flex;
        align-items: center;
        pointer-events: none;
      }

      .edufyi-field-box:focus-within .edufyi-field-icon {
        color: #00b4d8;
      }

      .edufyi-field-input {
        width: 100%;
        height: 50px;
        background: transparent;
        border: none;
        outline: none;
        color: #ffffff;
        font-size: 14.5px;
        padding: 0 46px 0 48px;
        font-family: inherit;
      }

      .edufyi-field-input::placeholder {
        color: #5a7194;
        font-size: 14px;
      }

      .edufyi-eye-toggle {
        position: absolute;
        right: 14px;
        background: transparent;
        border: none;
        color: #5a7194;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
      }

      .edufyi-eye-toggle:hover {
        color: #00b4d8;
      }

      /* Row with Remember me + recovery link */
      .edufyi-action-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-top: 4px;
        margin-bottom: 8px;
        font-size: 13px;
      }

      .edufyi-remember-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #cbd5e1;
        cursor: pointer;
        user-select: none;
        font-size: 13.5px;
      }

      .edufyi-checkbox {
        width: 16px;
        height: 16px;
        accent-color: #00b4d8;
        cursor: pointer;
        border-radius: 4px;
      }

      .edufyi-link {
        color: #00b4d8;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        font-size: 13.5px;
      }

      .edufyi-link:hover {
        text-decoration: underline;
        color: #38bdf8;
      }

      /* Primary Vibrant Blue/Cyan Button with Under Glow */
      .edufyi-primary-btn {
        width: 100%;
        height: 50px;
        background: #00a8e8;
        border: none;
        border-radius: 12px;
        color: #ffffff;
        font-size: 13.5px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 10px 24px rgba(0, 168, 232, 0.45);
        transition: all 0.2s ease;
      }

      .edufyi-primary-btn:hover:not(:disabled) {
        background: #00b4d8;
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(0, 180, 216, 0.6);
      }

      .edufyi-primary-btn:active:not(:disabled) {
        transform: translateY(0);
      }

      .edufyi-primary-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      /* Secondary Outline Button */
      .edufyi-secondary-btn {
        width: 100%;
        height: 48px;
        background: rgba(10, 21, 38, 0.6);
        border: 1px solid rgba(30, 58, 95, 0.85);
        border-radius: 12px;
        color: #cbd5e1;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.2s ease;
      }

      .edufyi-secondary-btn:hover {
        background: rgba(14, 28, 50, 0.8);
        border-color: rgba(0, 180, 216, 0.4);
        color: #ffffff;
      }

      /* Error Alert */
      .edufyi-error-box {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 10px;
        padding: 10px 14px;
        margin-bottom: 14px;
        color: #fca5a5;
        font-size: 12.5px;
        line-height: 1.4;
        width: 100%;
        text-align: left;
      }

      /* Notice Box */
      .edufyi-notice-box {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(0, 180, 216, 0.12);
        border: 1px solid rgba(0, 180, 216, 0.35);
        border-radius: 10px;
        padding: 10px 14px;
        margin-bottom: 14px;
        color: #7dd3fc;
        font-size: 12.5px;
        line-height: 1.4;
        width: 100%;
        text-align: left;
      }
    `}</style>
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
        {/* LOGO */}
        <div className="edufyi-brand-header">
          <img
            src="/elythra-edufyitech-logo.png"
            alt="Edufyi"
            className="edufyi-brand-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="edufyi-brand-text">
            <span className="edufyi-brand-kicker">ELYTHRA</span>
            <span className="edufyi-brand-name">
              Edufyi<span>Tech</span>
            </span>
          </div>
        </div>

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
            <Fingerprint size={17} style={{ color: '#00b4d8' }} />
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

  const [email, setEmail] = useState(() => (role === 'admin' ? 'admin@edufyitech.in' : 'hr@edufyitech.in'))
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
        setEmail((prev) => (!prev || prev === 'hr@edufyitech.in' || prev === 'hr@edufyi.in' ? 'admin@edufyitech.in' : prev))
      } else if (hash.includes('hr')) {
        setRole('hr')
        setEmail((prev) => (!prev || prev === 'admin@edufyitech.in' || prev === 'admin@edufyi.in' ? 'hr@edufyitech.in' : prev))
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
      if (!email || email === 'hr@edufyitech.in' || email === 'hr@edufyi.in') setEmail('admin@edufyitech.in')
      window.location.hash = '#/admin/login'
    } else {
      if (!email || email === 'admin@edufyitech.in' || email === 'admin@edufyi.in') setEmail('hr@edufyitech.in')
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
        {/* LOGO */}
        <div className="edufyi-brand-header">
          <img
            src="/elythra-edufyitech-logo.png"
            alt="Edufyi"
            className="edufyi-brand-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="edufyi-brand-text">
            <span className="edufyi-brand-kicker">ELYTHRA</span>
            <span className="edufyi-brand-name">
              Edufyi<span>Tech</span>
            </span>
          </div>
        </div>

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
              placeholder={isHr ? 'hr@edufyitech.in' : 'admin@edufyitech.in'}
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
            <Key size={16} style={{ color: '#00b4d8' }} />
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
