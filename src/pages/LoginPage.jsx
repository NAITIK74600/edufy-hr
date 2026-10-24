import { useState, useEffect } from 'react'
import {
  Mail,
  Lock,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Sparkles,
  Check,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export function LoginPage({ route }) {
  const { login, logout, user } = useAuth()

  // Determine starting mode based on route/hash
  const initialIsManagement =
    route?.path === '/admin/login' ||
    route?.path === '/hr/login' ||
    (typeof window !== 'undefined' &&
      (window.location.hash.includes('admin') || window.location.hash.includes('hr')))

  const [isManagement, setIsManagement] = useState(initialIsManagement)

  // Employee Login form state
  const [empEmail, setEmpEmail] = useState('')
  const [empPassword, setEmpPassword] = useState('')
  const [empRemember, setEmpRemember] = useState(true)
  const [empLoading, setEmpLoading] = useState(false)
  const [empError, setEmpError] = useState('')

  // Management Login form state
  const [mgmtEmail, setMgmtEmail] = useState('')
  const [mgmtPassword, setMgmtPassword] = useState('')
  const [mgmtRemember, setMgmtRemember] = useState(true)
  const [mgmtRoleType, setMgmtRoleType] = useState('admin') // 'admin' or 'hr'
  const [mgmtLoading, setMgmtLoading] = useState(false)
  const [mgmtError, setMgmtError] = useState('')

  // Sync hash changes
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('admin') || hash.includes('hr')) {
      setIsManagement(true)
      if (hash.includes('hr')) {
        setMgmtRoleType('hr')
        setMgmtEmail((prev) => (!prev || prev === 'admin@edufyi.in' ? 'hr@edufyi.in' : prev))
      } else {
        setMgmtRoleType('admin')
        setMgmtEmail((prev) => (!prev || prev === 'hr@edufyi.in' ? 'admin@edufyi.in' : prev))
      }
    } else if (hash.includes('employee')) {
      setIsManagement(false)
    }
  }, [route?.path])

  function handleSwitchToManagement() {
    setIsManagement(true)
    setEmpError('')
    setMgmtError('')
    if (!mgmtEmail) setMgmtEmail('admin@edufyi.in')
    window.location.hash = '#/admin/login'
  }

  function handleSwitchToEmployee() {
    setIsManagement(false)
    setEmpError('')
    setMgmtError('')
    window.location.hash = '#/employee/login'
  }

  function handleSelectAdmin() {
    setMgmtRoleType('admin')
    setMgmtError('')
    if (!mgmtEmail || mgmtEmail === 'hr@edufyi.in' || mgmtEmail === 'hr') {
      setMgmtEmail('admin@edufyi.in')
    }
    window.location.hash = '#/admin/login'
  }

  function handleSelectHr() {
    setMgmtRoleType('hr')
    setMgmtError('')
    if (!mgmtEmail || mgmtEmail === 'admin@edufyi.in' || mgmtEmail === 'admin') {
      setMgmtEmail('hr@edufyi.in')
    }
    window.location.hash = '#/hr/login'
  }

  async function handleEmployeeLogin(e) {
    if (e) e.preventDefault()
    setEmpError('')
    if (!empEmail.trim() || !empPassword) {
      setEmpError('Please enter your work email and password.')
      return
    }

    setEmpLoading(true)
    try {
      const user = await login(empEmail.trim(), empPassword, 'employee')
      if (user?.role === 'admin' || user?.role === 'hr') {
        throw new Error('Access denied: Management (Admin/HR) accounts must log in via the Executive Management Console.')
      }
      window.location.hash = '#/employee'
    } catch (err) {
      setEmpError(err.message || 'Invalid email or password.')
    } finally {
      setEmpLoading(false)
    }
  }

  async function handleManagementLogin(e) {
    if (e) e.preventDefault()
    setMgmtError('')
    if (!mgmtEmail.trim() || !mgmtPassword) {
      setMgmtError(
        mgmtRoleType === 'admin'
          ? 'Please enter your administrator email and password.'
          : 'Please enter your HR operational email and password.'
      )
      return
    }

    setMgmtLoading(true)
    try {
      const targetPortal = mgmtRoleType === 'hr' ? 'hr' : 'admin'
      const user = await login(mgmtEmail.trim(), mgmtPassword, targetPortal)

      if (user?.role === 'admin') {
        window.location.hash = '#/admin'
      } else if (user?.role === 'hr') {
        window.location.hash = '#/hr'
      } else {
        throw new Error('Access denied: Employee accounts cannot sign into the Admin or HR Management Console.')
      }
    } catch (err) {
      setMgmtError(err.message || 'Invalid email or password.')
    } finally {
      setMgmtLoading(false)
    }
  }

  return (
    <div className="ely-auth-wrapper">
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
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Ambient Cyber Lights (Cohesive Blue & Cyan) */
        .ely-ambient-glow {
          position: absolute;
          width: 550px;
          height: 550px;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }

        .ely-container {
          position: relative;
          width: 100%;
          max-width: 980px;
          height: 640px;
          background: #08101e !important;
          border-radius: 28px;
          border: 1px solid rgba(0, 210, 255, 0.35) !important;
          box-shadow: 
            0 30px 90px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(0, 210, 255, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          overflow: hidden;
          z-index: 2;
        }

        .ely-forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .ely-signin-slot {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .ely-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 3.2rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          background: transparent !important;
        }

        .ely-form.mgmt-form {
          opacity: 0;
          z-index: 1;
          pointer-events: none;
        }

        .ely-form.emp-form {
          opacity: 1;
          z-index: 2;
          pointer-events: all;
        }

        /* BRAND LOGO BADGE */
        .ely-logo-img {
          display: block;
          border-radius: 10px;
          object-fit: cover;
          box-shadow: 0 0 16px rgba(0, 210, 255, 0.45);
          border: 1px solid rgba(0, 210, 255, 0.35);
          flex-shrink: 0;
          background: #ffffff;
        }

        /* PORTAL ROLE BADGE (BLUE / CYAN FOR BOTH) */
        .ely-portal-badge {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 14px;
          border-radius: 999px;
          margin: 10px 0 6px 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .ely-portal-badge.emp {
          background: rgba(0, 210, 255, 0.14) !important;
          color: #00d2ff !important;
          border: 1px solid rgba(0, 210, 255, 0.45) !important;
          box-shadow: 0 0 14px rgba(0, 210, 255, 0.25) !important;
        }

        .ely-portal-badge.mgmt {
          background: rgba(0, 210, 255, 0.14) !important;
          color: #00d2ff !important;
          border: 1px solid rgba(0, 210, 255, 0.45) !important;
          box-shadow: 0 0 14px rgba(0, 210, 255, 0.25) !important;
        }

        .ely-title {
          font-size: 1.85rem;
          color: #ffffff !important;
          margin: 2px 0 4px 0;
          font-weight: 800;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8) !important;
        }

        .ely-subtitle {
          font-size: 0.83rem;
          color: #94a3b8 !important;
          margin-bottom: 16px;
          text-align: center;
        }

        .ely-alert-box {
          width: 100%;
          max-width: 360px;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.18) !important;
          color: #fca5a5 !important;
          border: 1px solid rgba(239, 68, 68, 0.45) !important;
        }

        .ely-input-field {
          max-width: 360px;
          width: 100%;
          background: #0f1c30 !important;
          margin: 7px 0;
          height: 48px;
          border-radius: 12px;
          display: grid;
          grid-template-columns: 14% 86%;
          padding: 0 0.8rem;
          position: relative;
          transition: 0.25s ease;
          border: 1px solid rgba(0, 210, 255, 0.25) !important;
        }

        .ely-input-field:focus-within {
          background: #14243d !important;
          border-color: #00d2ff !important;
          box-shadow: 0 0 16px rgba(0, 210, 255, 0.4) !important;
        }

        .ely-input-field i {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: 0.25s;
        }

        .ely-input-field:focus-within i {
          color: #00d2ff;
        }

        .ely-input-field input {
          background: transparent !important;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 0.92rem;
          color: #ffffff !important;
          width: 100%;
        }

        .ely-input-field input::placeholder {
          color: #64748b !important;
          font-weight: 400;
        }

        /* REMEMBER ME & RECOVERY OPTIONS */
        .ely-options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 360px;
          margin: 10px 0 14px 0;
          font-size: 0.82rem;
        }

        .ely-remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e2e8f0 !important;
          cursor: pointer;
          user-select: none;
        }

        .ely-custom-checkbox {
          width: 19px;
          height: 19px;
          border-radius: 5px;
          border: 1px solid rgba(0, 210, 255, 0.4) !important;
          background: #0f1c30 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .ely-remember-label:hover .ely-custom-checkbox {
          border-color: #00d2ff !important;
        }

        .ely-custom-checkbox.checked {
          background: #00d2ff !important;
          border-color: #00d2ff !important;
          box-shadow: 0 0 10px rgba(0, 210, 255, 0.6) !important;
        }

        .ely-forgot-link {
          color: #00d2ff !important;
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
        }

        .ely-forgot-link:hover {
          color: #38bdf8 !important;
          text-decoration: underline;
        }

        /* VIBRANT HIGH-CONTRAST PRIMARY BUTTON (BLUE FOR BOTH) */
        .ely-btn-primary {
          width: 100%;
          max-width: 360px;
          background: linear-gradient(135deg, #00d2ff 0%, #0284c7 100%) !important;
          border: none;
          outline: none;
          height: 48px;
          border-radius: 12px;
          color: #040914 !important;
          text-transform: uppercase;
          font-weight: 800;
          margin: 4px 0 10px 0;
          cursor: pointer;
          transition: 0.25s ease;
          font-size: 0.88rem;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 22px rgba(0, 210, 255, 0.45) !important;
        }

        .ely-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(0, 210, 255, 0.7) !important;
          filter: brightness(1.1);
        }

        .ely-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        /* PASSKEY / HARDWARE SECURITY BUTTON */
        .ely-passkey-btn {
          width: 100%;
          max-width: 360px;
          background: rgba(15, 28, 48, 0.85) !important;
          border: 1px solid rgba(0, 210, 255, 0.35) !important;
          outline: none;
          height: 44px;
          border-radius: 12px;
          color: #e2e8f0 !important;
          font-weight: 600;
          font-size: 0.84rem;
          cursor: pointer;
          transition: 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .ely-passkey-btn:hover {
          background: #14233c !important;
          border-color: #00d2ff !important;
          color: #00d2ff !important;
          box-shadow: 0 0 18px rgba(0, 210, 255, 0.3) !important;
          transform: translateY(-1px);
        }

        .ely-passkey-btn.active {
          border-color: #00d2ff !important;
          background: rgba(0, 210, 255, 0.18) !important;
          color: #00d2ff !important;
          animation: elyPulse 1.2s infinite;
        }

        @keyframes elyPulse {
          0% { box-shadow: 0 0 5px rgba(0, 210, 255, 0.3); }
          50% { box-shadow: 0 0 22px rgba(0, 210, 255, 0.7); }
          100% { box-shadow: 0 0 5px rgba(0, 210, 255, 0.3); }
        }

        /* MANAGEMENT ROLE SELECTOR (BLUE ACCENTS) */
        .ely-mgmt-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
          width: 100%;
          max-width: 360px;
        }

        .ely-mgmt-pill {
          flex: 1;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          background: #0f1c30 !important;
          color: #94a3b8 !important;
          cursor: pointer;
          transition: 0.2s;
          text-align: center;
        }

        .ely-mgmt-pill.active {
          background: rgba(0, 210, 255, 0.22) !important;
          color: #ffffff !important;
          border-color: #00d2ff !important;
          box-shadow: 0 0 14px rgba(0, 210, 255, 0.35) !important;
        }

        /* PANELS CONTAINER */
        .ely-panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .ely-panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
          background: transparent !important;
        }

        .ely-left-panel {
          pointer-events: all;
          padding: 3rem 16% 2rem 10%;
        }

        .ely-right-panel {
          pointer-events: none;
          padding: 3rem 10% 2rem 16%;
        }

        .ely-panel .ely-content {
          color: #ffffff !important;
          transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0.6s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ely-panel h3 {
          font-weight: 800;
          line-height: 1.25;
          font-size: 1.75rem;
          margin: 16px 0 10px 0;
          color: #ffffff !important;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8) !important;
        }

        .ely-panel p {
          font-size: 0.88rem;
          line-height: 1.6;
          color: #cbd5e1 !important;
          margin-bottom: 24px;
          max-width: 330px;
        }

        .ely-btn-switch {
          background: rgba(4, 18, 31, 0.75) !important;
          border: 1px solid #00d2ff !important;
          padding: 0 28px;
          height: 46px;
          font-weight: 700;
          font-size: 0.85rem;
          border-radius: 999px;
          color: #ffffff !important;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 0 16px rgba(0, 210, 255, 0.3) !important;
        }

        .ely-btn-switch:hover {
          background: #00d2ff !important;
          color: #040914 !important;
          box-shadow: 0 0 28px rgba(0, 210, 255, 0.75) !important;
          transform: translateY(-2px);
        }

        .ely-right-panel .ely-content {
          transform: translateX(800px);
        }

        /* ANIMATED SLIDER SWEEP (DEEP RICH BLUE ACCENTS FOR BOTH) */
        .ely-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #00d2ff 0%, #0284c7 35%, #050e1c 95%) !important;
          transition: 1.8s cubic-bezier(0.77, 0, 0.175, 1);
          border-radius: 50%;
          z-index: 6;
          box-shadow: 0 0 90px rgba(0, 210, 255, 0.4) !important;
        }

        .ely-container.role-management-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
          background: linear-gradient(-45deg, #00d2ff 0%, #0284c7 35%, #050e1c 95%) !important;
          box-shadow: 0 0 90px rgba(0, 210, 255, 0.4) !important;
        }

        .ely-container.role-management-mode .ely-left-panel .ely-content {
          transform: translateX(-800px);
        }

        .ely-container.role-management-mode .ely-signin-slot {
          left: 25%;
        }

        .ely-container.role-management-mode .ely-form.mgmt-form {
          opacity: 1;
          z-index: 2;
          pointer-events: all;
        }

        .ely-container.role-management-mode .ely-form.emp-form {
          opacity: 0;
          z-index: 1;
          pointer-events: none;
        }

        .ely-container.role-management-mode .ely-right-panel .ely-content {
          transform: translateX(0%);
        }

        .ely-container.role-management-mode .ely-left-panel {
          pointer-events: none;
        }

        .ely-container.role-management-mode .ely-right-panel {
          pointer-events: all;
        }

        @media (max-width: 870px) {
          .ely-container {
            min-height: 840px;
            height: auto;
          }
          .ely-signin-slot {
            width: 100%;
            top: 92%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .ely-signin-slot,
          .ely-container.role-management-mode .ely-signin-slot {
            left: 50%;
          }
          .ely-panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .ely-panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .ely-right-panel {
            grid-row: 3 / 4;
          }
          .ely-left-panel {
            grid-row: 1 / 2;
          }
          .ely-panel .ely-content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .ely-panel h3 {
            font-size: 1.25rem;
          }
          .ely-panel p {
            font-size: 0.78rem;
          }
          .ely-container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .ely-container.role-management-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .ely-container.role-management-mode .ely-left-panel .ely-content {
            transform: translateY(-300px);
          }
          .ely-container.role-management-mode .ely-right-panel .ely-content {
            transform: translateY(0px);
          }
          .ely-right-panel .ely-content {
            transform: translateY(300px);
          }
          .ely-container.role-management-mode .ely-signin-slot {
            top: 6%;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      {/* Cyber Ambient Halo Lights (Blue & Cyan) */}
      <div className="ely-ambient-glow" style={{ top: '10%', left: '15%', background: 'radial-gradient(circle, rgba(0, 210, 255, 0.22) 0%, transparent 70%)' }} />
      <div className="ely-ambient-glow" style={{ bottom: '10%', right: '15%', background: 'radial-gradient(circle, rgba(2, 132, 199, 0.22) 0%, transparent 70%)' }} />

      <div className={isManagement ? 'ely-container role-management-mode' : 'ely-container'}>
        <div className="ely-forms-container">
          <div className="ely-signin-slot">
            {/* 1. EMPLOYEE LOGIN FORM */}
            <form className="ely-form emp-form" onSubmit={handleEmployeeLogin}>
              <EdufyiOfficialBrandUnit />

              <span className="ely-portal-badge emp">
                <Sparkles size={13} />
                Employee Self-Service
              </span>
              <h2 className="ely-title">Employee Login</h2>
              <p className="ely-subtitle">Sign in with your Admin or HR-created account</p>

              {user && (
                <div style={{
                  width: '100%',
                  maxWidth: '360px',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  marginBottom: '10px',
                  background: 'rgba(0, 210, 255, 0.08)',
                  color: '#7dd3fc',
                  border: '1px solid rgba(0, 210, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}>
                  <span>Active Session: <strong>{user.displayName || user.name}</strong> ({user.role})</span>
                  <a
                    href={`#/${user.role === 'admin' ? 'admin' : (user.role === 'hr' ? 'hr' : 'employee')}`}
                    style={{ color: '#00d2ff', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Open Portal →
                  </a>
                </div>
              )}

              {empError && (
                <div className="ely-alert-box">
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{empError}</span>
                </div>
              )}

              <div className="ely-input-field">
                <i><Mail size={18} /></i>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Work Email, Username or Employee ID"
                  value={empEmail}
                  onChange={(e) => {
                    setEmpEmail(e.target.value)
                    setEmpError('')
                  }}
                />
              </div>

              <div className="ely-input-field">
                <i><Lock size={18} /></i>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={empPassword}
                  onChange={(e) => {
                    setEmpPassword(e.target.value)
                    setEmpError('')
                  }}
                />
              </div>

              {/* REMEMBER ME & FORGOT PASSWORD */}
              <div className="ely-options-row">
                <label className="ely-remember-label" onClick={() => setEmpRemember(!empRemember)}>
                  <div className={`ely-custom-checkbox ${empRemember ? 'checked' : ''}`}>
                    {empRemember && <Check size={13} color="#040811" strokeWidth={3.5} />}
                  </div>
                  <span>Remember me</span>
                </label>
                <a
                  href="#/employee/login"
                  className="ely-forgot-link"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Please reach out to your HR administrator to reset your employee access credentials.')
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* PRIMARY SIGN IN BUTTON */}
              <button type="submit" disabled={empLoading} className="ely-btn-primary">
                {empLoading ? 'Signing In...' : 'Sign In'}
                <ArrowRight size={16} />
              </button>

              {/* PASSKEY / BIOMETRIC OPTION */}
              <button
                type="button"
                className="ely-passkey-btn"
                disabled
              >
                <Fingerprint size={18} color="#00d2ff" />
                <span>Passkey login is not configured</span>
              </button>
            </form>

            {/* 2. MANAGEMENT LOGIN FORM (ADMIN / HR) - Styled in same Blue/Cyan */}
            <form className="ely-form mgmt-form" onSubmit={handleManagementLogin}>
              <EdufyiOfficialBrandUnit />

              <span className="ely-portal-badge mgmt">
                <Shield size={13} />
                {mgmtRoleType === 'admin' ? 'Admin Terminal' : 'HR Operations'}
              </span>
              <h2 className="ely-title">
                {mgmtRoleType === 'admin' ? 'Admin Portal Sign In' : 'HR Operations Sign In'}
              </h2>
              <p className="ely-subtitle">
                {mgmtRoleType === 'admin'
                  ? 'System Administration & Global Controls (Employee accounts not permitted)'
                  : 'People Operations & Workforce Management (Employee accounts not permitted)'}
              </p>

              {/* Quick switch between Admin and HR preset credential */}
              <div className="ely-mgmt-selector">
                <button
                  type="button"
                  className={`ely-mgmt-pill ${mgmtRoleType === 'admin' ? 'active' : ''}`}
                  onClick={handleSelectAdmin}
                >
                  Admin Terminal
                </button>
                <button
                  type="button"
                  className={`ely-mgmt-pill ${mgmtRoleType === 'hr' ? 'active' : ''}`}
                  onClick={handleSelectHr}
                >
                  HR Operations
                </button>
              </div>

              {user && (
                <div style={{
                  width: '100%',
                  maxWidth: '360px',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  marginBottom: '10px',
                  background: 'rgba(0, 210, 255, 0.08)',
                  color: '#7dd3fc',
                  border: '1px solid rgba(0, 210, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}>
                  <span>Active Session: <strong>{user.displayName || user.name}</strong> ({user.role})</span>
                  <a
                    href={`#/${user.role === 'admin' ? 'admin' : (user.role === 'hr' ? 'hr' : 'employee')}`}
                    style={{ color: '#00d2ff', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Open Portal →
                  </a>
                </div>
              )}

              {mgmtError && (
                <div className="ely-alert-box">
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{mgmtError}</span>
                </div>
              )}

              <div className="ely-input-field">
                <i><Mail size={18} /></i>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={
                    mgmtRoleType === 'admin'
                      ? 'Admin Email or Username (e.g. admin@edufyi.in)'
                      : 'HR Email or Username (e.g. hr@edufyi.in)'
                  }
                  value={mgmtEmail}
                  onChange={(e) => {
                    setMgmtEmail(e.target.value)
                    setMgmtError('')
                  }}
                />
              </div>

              <div className="ely-input-field">
                <i><Lock size={18} /></i>
                <input
                  type="password"
                  required
                  placeholder="Master Password"
                  value={mgmtPassword}
                  onChange={(e) => {
                    setMgmtPassword(e.target.value)
                    setMgmtError('')
                  }}
                />
              </div>

              {/* Quick credential helper button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (mgmtRoleType === 'admin') {
                      setMgmtEmail('admin@edufyi.in')
                      setMgmtPassword('Password@123')
                    } else {
                      setMgmtEmail('hr@edufyi.in')
                      setMgmtPassword('Password@123')
                    }
                    setMgmtError('')
                  }}
                  style={{
                    background: 'rgba(0, 210, 255, 0.08)',
                    border: '1px dashed rgba(0, 210, 255, 0.35)',
                    color: '#00d2ff',
                    borderRadius: '7px',
                    padding: '3px 9px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                  }}
                  title="Click to fill standard credentials"
                >
                  <Sparkles size={11} />
                  Fill {mgmtRoleType === 'admin' ? 'admin@edufyi.in' : 'hr@edufyi.in'} (Password@123)
                </button>
              </div>

              {/* REMEMBER ME & RECOVERY KEY */}
              <div className="ely-options-row">
                <label className="ely-remember-label" onClick={() => setMgmtRemember(!mgmtRemember)}>
                  <div className={`ely-custom-checkbox ${mgmtRemember ? 'checked' : ''}`}>
                    {mgmtRemember && <Check size={13} color="#040811" strokeWidth={3.5} />}
                  </div>
                  <span>Remember me</span>
                </label>
                <a
                  href={mgmtRoleType === 'admin' ? '#/admin/login' : '#/hr/login'}
                  className="ely-forgot-link"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Contact your IT Systems Security Officer to regenerate administrative keys.')
                  }}
                >
                  Recovery Key?
                </a>
              </div>

              {/* PRIMARY SIGN IN BUTTON (BLUE SAME AS EMPLOYEE) */}
              <button type="submit" disabled={mgmtLoading} className="ely-btn-primary">
                {mgmtLoading
                  ? 'Authenticating...'
                  : mgmtRoleType === 'admin'
                  ? 'Sign In to Admin Portal'
                  : 'Sign In to HR Portal'}
                <ArrowRight size={16} />
              </button>

              {/* PASSKEY / BIOMETRIC OPTION */}
              <button
                type="button"
                className="ely-passkey-btn"
                disabled
              >
                <KeyRound size={18} color="#00d2ff" />
                <span>Passkey login is not configured</span>
              </button>
            </form>
          </div>
        </div>

        {/* SIDE PANELS TRIGGERING THE SLIDING ROLE ANIMATION */}
        <div className="ely-panels-container">
          {/* LEFT PANEL: Shown in Employee mode -> Prompts to slide to Management */}
          <div className="ely-panel ely-left-panel">
            <div className="ely-content">
              <EdufyiOfficialBrandUnit large />
              <h3>Admin or HR Lead?</h3>
              <p>
                Access enterprise controls, workforce directories, policy configs, and compensation engines.
              </p>
              <button
                type="button"
                className="ely-btn-switch"
                onClick={handleSwitchToManagement}
              >
                <span>Switch to Console</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Shown in Management mode -> Prompts to slide to Employee */}
          <div className="ely-panel ely-right-panel">
            <div className="ely-content">
              <EdufyiOfficialBrandUnit large />
              <h3>Employee Self-Service</h3>
              <p>
                Looking for your personal workspace? Punch attendance, review payslips, and submit requests.
              </p>
              <button
                type="button"
                className="ely-btn-switch"
                onClick={handleSwitchToEmployee}
              >
                <span>Switch to Employee ESS</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * OFFICIAL EDUFYI BRANDING COMPONENT
 * Utilizes the official image asset requested by user:
 * [e:\hr dashbord\edufyi logo.jpg.jpeg] (served via /edufyi%20logo.jpg.jpeg or /edufy-logo.jpg)
 */
export function EdufyiOfficialBrandUnit({ large = false }) {
  const sizePx = large ? 52 : 40

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: large ? '14px' : '11px',
        userSelect: 'none',
        background: 'transparent',
      }}
    >
      {/* Official Edufyi Logo Image from user */}
      <img
        src="/edufyi%20logo.jpg.jpeg"
        alt="Edufy"
        style={{
          width: sizePx + 'px',
          height: sizePx + 'px',
          borderRadius: '10px',
          objectFit: 'cover',
          boxShadow: '0 0 16px rgba(0, 210, 255, 0.45)',
          border: '1px solid rgba(0, 210, 255, 0.35)',
          flexShrink: 0,
          background: '#ffffff',
          display: 'block',
        }}
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/edufy-logo.jpg'
        }}
      />

      {/* Brand Typography */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          lineHeight: 1.15,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: large ? '12px' : '10px',
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: '#a5f3fc',
            textTransform: 'uppercase',
            opacity: 0.92,
            marginBottom: '2px',
          }}
        >
          ELYTHRA
        </span>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: large ? '26px' : '22px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
            Edufyi
          </span>
          <span
            style={{
              color: '#00d2ff',
              textShadow: '0 0 16px rgba(0, 210, 255, 0.85)',
              marginLeft: '1px',
            }}
          >
            Tech
          </span>
        </div>
      </div>
    </div>
  )
}
