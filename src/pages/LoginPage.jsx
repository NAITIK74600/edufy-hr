import { useState, useEffect } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

/**
 * Common shared styles for both Employee and Management login pages.
 * Ensures the exact same premium cyber-cyan aesthetic across both portals.
 */
function AuthStyles() {
  return (
    <style>{`
      .ely-auth-wrapper,
      .ely-auth-wrapper * {
        box-sizing: border-box;
        color-scheme: dark !important;
      }

      .ely-auth-wrapper {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #040811 !important;
        background-image: 
          radial-gradient(circle at 18% 18%, rgba(0, 210, 255, 0.16) 0%, transparent 40%),
          radial-gradient(circle at 82% 82%, rgba(2, 132, 199, 0.20) 0%, transparent 45%),
          radial-gradient(rgba(0, 210, 255, 0.10) 1px, transparent 1px);
        background-size: 100% 100%, 100% 100%, 28px 28px;
        min-height: 100vh;
        min-height: 100dvh;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 24px 16px;
        position: relative;
        overflow-x: hidden;
      }

      .ely-ambient-glow {
        position: absolute;
        width: 520px;
        height: 520px;
        filter: blur(100px);
        pointer-events: none;
        z-index: 1;
        opacity: 0.6;
      }

      .ely-card {
        position: relative;
        width: 100%;
        max-width: 480px;
        background: #08101e !important;
        border-radius: 24px;
        border: 1px solid rgba(0, 210, 255, 0.35) !important;
        box-shadow: 
          0 25px 80px rgba(0, 0, 0, 0.85),
          0 0 35px rgba(0, 210, 255, 0.16),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        padding: 38px 34px;
        z-index: 2;
        display: flex;
        flex-direction: column;
      }

      @media (max-width: 520px) {
        .ely-card {
          padding: 28px 20px;
          border-radius: 20px;
        }
      }

      .ely-logo-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 24px;
      }

      .ely-logo-img {
        height: 44px;
        max-width: 200px;
        object-fit: contain;
        margin-bottom: 14px;
      }

      .ely-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 4px 12px;
        border-radius: 9999px;
        margin-bottom: 12px;
      }

      .ely-badge-employee {
        background: rgba(0, 210, 255, 0.12);
        color: #00d2ff;
        border: 1px solid rgba(0, 210, 255, 0.3);
      }

      .ely-badge-mgmt {
        background: rgba(14, 165, 233, 0.12);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.3);
      }

      .ely-title {
        font-size: 23px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 6px 0;
        letter-spacing: -0.02em;
      }

      .ely-subtitle {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
        line-height: 1.5;
        max-width: 380px;
      }

      /* Tabs for Admin / HR */
      .ely-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        background: rgba(15, 23, 42, 0.7);
        padding: 4px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 22px;
      }

      .ely-tab-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 12.5px;
        font-weight: 600;
        padding: 9px 12px;
        border-radius: 9px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ely-tab-btn.active {
        background: linear-gradient(135deg, rgba(0, 210, 255, 0.22) 0%, rgba(2, 132, 199, 0.28) 100%);
        color: #ffffff;
        border: 1px solid rgba(0, 210, 255, 0.45);
        box-shadow: 0 2px 8px rgba(0, 210, 255, 0.2);
      }

      /* Form inputs */
      .ely-form-group {
        margin-bottom: 18px;
        width: 100%;
      }

      .ely-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #cbd5e1;
        margin-bottom: 6px;
        text-align: left;
      }

      .ely-input-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .ely-input-box:focus-within {
        border-color: #00d2ff;
        box-shadow: 0 0 0 3px rgba(0, 210, 255, 0.2);
        background: rgba(15, 23, 42, 0.98);
      }

      .ely-input-icon {
        position: absolute;
        left: 14px;
        color: #64748b;
        pointer-events: none;
        display: flex;
        align-items: center;
      }

      .ely-input-box:focus-within .ely-input-icon {
        color: #00d2ff;
      }

      .ely-input {
        width: 100%;
        height: 46px;
        background: transparent;
        border: none;
        outline: none;
        color: #ffffff;
        font-size: 14px;
        padding: 0 42px 0 42px;
        font-family: inherit;
      }

      .ely-input::placeholder {
        color: #64748b;
        font-size: 13px;
      }

      .ely-eye-btn {
        position: absolute;
        right: 12px;
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        transition: color 0.15s;
      }

      .ely-eye-btn:hover {
        color: #00d2ff;
      }

      /* Options row */
      .ely-options-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 22px;
        font-size: 12.5px;
      }

      .ely-remember-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #94a3b8;
        cursor: pointer;
        user-select: none;
      }

      .ely-checkbox {
        width: 15px;
        height: 15px;
        accent-color: #00d2ff;
        cursor: pointer;
      }

      .ely-help-link {
        color: #38bdf8;
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
      }

      .ely-help-link:hover {
        text-decoration: underline;
        color: #00d2ff;
      }

      /* Submit button */
      .ely-submit-btn {
        width: 100%;
        height: 48px;
        background: linear-gradient(135deg, #00d2ff 0%, #0284c7 100%);
        border: none;
        border-radius: 12px;
        color: #ffffff;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.02em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 18px rgba(0, 210, 255, 0.35);
        transition: all 0.2s ease;
      }

      .ely-submit-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(0, 210, 255, 0.45);
        filter: brightness(1.06);
      }

      .ely-submit-btn:active:not(:disabled) {
        transform: translateY(0);
      }

      .ely-submit-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      /* Error alert */
      .ely-error-box {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 10px;
        padding: 10px 14px;
        margin-bottom: 18px;
        color: #fca5a5;
        font-size: 12.5px;
        line-height: 1.4;
      }

      /* Footer notice */
      .ely-footer-notice {
        margin-top: 24px;
        padding-top: 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 11px;
        color: #64748b;
        text-align: center;
      }

      .spinning {
        animation: elySpin 1s linear infinite;
      }

      @keyframes elySpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  )
}

/**
 * DEDICATED EMPLOYEE LOGIN PAGE
 * Rendered strictly at #/employee/login
 * Exclusively for employees — NO option or toggle for admin/HR!
 */
export function EmployeeLoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [helpNotice, setHelpNotice] = useState('')

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')
    setHelpNotice('')

    if (!email.trim() || !password) {
      setError('Please enter your work email or employee ID and password.')
      return
    }

    setLoading(true)
    try {
      const loggedUser = await login(email.trim(), password, 'employee')
      if (loggedUser?.role === 'admin' || loggedUser?.role === 'hr') {
        throw new Error('Access denied: Management accounts must log in via the Management Console.')
      }
      window.location.hash = '#/employee'
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ely-auth-wrapper">
      <AuthStyles />
      <div className="ely-ambient-glow" style={{ top: '15%', left: '20%', background: 'rgba(0, 210, 255, 0.18)' }} />
      <div className="ely-ambient-glow" style={{ bottom: '15%', right: '20%', background: 'rgba(2, 132, 199, 0.22)' }} />

      <div className="ely-card">
        {/* LOGO & HEADER */}
        <div className="ely-logo-area">
          <img
            src="/elythra-edufyitech-logo.png"
            alt="Edufyi Tech Solutions"
            className="ely-logo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="ely-badge ely-badge-employee">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d2ff' }} />
            Employee Self-Service (ESS)
          </div>
          <h1 className="ely-title">Employee Portal Sign In</h1>
          <p className="ely-subtitle">
            Sign in with your corporate email or employee ID to access attendance, leaves, and workspace workflow.
          </p>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="ely-error-box">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* HELP NOTICE */}
        {helpNotice && (
          <div className="ely-error-box" style={{ background: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.35)', color: '#7dd3fc' }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>{helpNotice}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit}>
          <div className="ely-form-group">
            <label className="ely-label">Corporate Email or Employee ID</label>
            <div className="ely-input-box">
              <span className="ely-input-icon">
                <Fingerprint size={16} />
              </span>
              <input
                type="text"
                className="ely-input"
                placeholder="e.g. ETS21201 or name@edufyitechsolutions.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="ely-form-group">
            <label className="ely-label">Password</label>
            <div className="ely-input-box">
              <span className="ely-input-icon">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="ely-input"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="ely-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="ely-options-row">
            <label className="ely-remember-label">
              <input
                type="checkbox"
                className="ely-checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className="ely-help-link"
              onClick={() => setHelpNotice('For password reset or portal assistance, please contact your HR Operations team.')}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="ely-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinning">⏳</span> Signing in...
              </>
            ) : (
              <>
                Sign In to Employee Workspace <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* FOOTER NOTICE */}
        <div className="ely-footer-notice">
          <Shield size={13} style={{ color: '#00d2ff' }} />
          <span>Edufyi Tech Solutions • Employee Self-Service</span>
        </div>
      </div>
    </div>
  )
}

/**
 * DEDICATED MANAGEMENT (ADMIN & HR) LOGIN PAGE
 * Rendered at #/admin/login, #/hr/login, and default #/login
 * Strictly for Admin and HR — NO option or button for employee!
 */
export function ManagementLoginPage({ defaultRole = 'admin' }) {
  const { login } = useAuth()

  // Track role: 'admin' or 'hr'
  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('hr')) return 'hr'
    return defaultRole
  })

  const [email, setEmail] = useState(() => (role === 'hr' ? 'hr@edufyitech.in' : 'admin@edufyitech.in'))
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync hash changes dynamically between /admin/login and /hr/login
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || ''
      if (hash.includes('hr')) {
        setRole('hr')
        setEmail((prev) => (!prev || prev === 'admin@edufyitech.in' ? 'hr@edufyitech.in' : prev))
      } else if (hash.includes('admin')) {
        setRole('admin')
        setEmail((prev) => (!prev || prev === 'hr@edufyitech.in' ? 'admin@edufyitech.in' : prev))
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  function handleSelectRole(targetRole) {
    setRole(targetRole)
    setError('')
    if (targetRole === 'admin') {
      if (!email || email === 'hr@edufyitech.in') setEmail('admin@edufyitech.in')
      window.location.hash = '#/admin/login'
    } else {
      if (!email || email === 'admin@edufyitech.in') setEmail('hr@edufyitech.in')
      window.location.hash = '#/hr/login'
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')

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
      const targetPortal = role === 'hr' ? 'hr' : 'admin'
      const loggedUser = await login(email.trim(), password, targetPortal)

      if (loggedUser?.role === 'admin') {
        window.location.hash = '#/admin'
      } else if (loggedUser?.role === 'hr') {
        window.location.hash = '#/hr'
      } else {
        throw new Error('Access denied: Employee accounts cannot sign into the Management Console.')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ely-auth-wrapper">
      <AuthStyles />
      <div className="ely-ambient-glow" style={{ top: '15%', left: '20%', background: 'rgba(0, 210, 255, 0.16)' }} />
      <div className="ely-ambient-glow" style={{ bottom: '15%', right: '20%', background: 'rgba(2, 132, 199, 0.20)' }} />

      <div className="ely-card">
        {/* LOGO & HEADER */}
        <div className="ely-logo-area">
          <img
            src="/elythra-edufyitech-logo.png"
            alt="Edufyi Tech Solutions"
            className="ely-logo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="ely-badge ely-badge-mgmt">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
            Workforce Management Console
          </div>
          <h1 className="ely-title">{role === 'admin' ? 'Administrator Login' : 'HR Operations Login'}</h1>
          <p className="ely-subtitle">
            {role === 'admin'
              ? 'Authorized access for System Administration, global policies, and platform control.'
              : 'Authorized access for Human Resources People Operations and workforce management.'}
          </p>
        </div>

        {/* ROLE TABS (ADMIN vs HR ONLY) */}
        <div className="ely-tabs">
          <button
            type="button"
            className={`ely-tab-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleSelectRole('admin')}
          >
            <ShieldCheck size={14} /> Admin Console
          </button>
          <button
            type="button"
            className={`ely-tab-btn ${role === 'hr' ? 'active' : ''}`}
            onClick={() => handleSelectRole('hr')}
          >
            <KeyRound size={14} /> HR Operations
          </button>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="ely-error-box">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit}>
          <div className="ely-form-group">
            <label className="ely-label">
              {role === 'admin' ? 'Administrator Email or Username' : 'HR Operations Email or Username'}
            </label>
            <div className="ely-input-box">
              <span className="ely-input-icon">
                <Mail size={16} />
              </span>
              <input
                type="text"
                className="ely-input"
                placeholder={role === 'admin' ? 'admin@edufyitech.in' : 'hr@edufyitech.in'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="ely-form-group">
            <label className="ely-label">Security Password</label>
            <div className="ely-input-box">
              <span className="ely-input-icon">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="ely-input"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="ely-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="ely-options-row">
            <label className="ely-remember-label">
              <input
                type="checkbox"
                className="ely-checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember terminal session
            </label>
          </div>

          <button type="submit" className="ely-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinning">⏳</span> Authenticating...
              </>
            ) : (
              <>
                Authenticate {role === 'admin' ? 'Admin Terminal' : 'HR Console'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* FOOTER NOTICE */}
        <div className="ely-footer-notice">
          <Shield size={13} style={{ color: '#38bdf8' }} />
          <span>Restricted Executive Console • Authorized Personnel Only</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Main unified LoginPage router:
 * - If route is /employee/login or hash has employee -> renders EmployeeLoginPage
 * - Otherwise (/admin/login, /hr/login, /login) -> renders ManagementLoginPage
 */
export function LoginPage({ route }) {
  const isEmployee =
    route?.path === '/employee/login' ||
    (typeof window !== 'undefined' && window.location.hash.includes('employee'))

  if (isEmployee) {
    return <EmployeeLoginPage />
  }

  const defaultRole =
    route?.path === '/hr/login' ||
    (typeof window !== 'undefined' && window.location.hash.includes('hr'))
      ? 'hr'
      : 'admin'

  return <ManagementLoginPage defaultRole={defaultRole} />
}
