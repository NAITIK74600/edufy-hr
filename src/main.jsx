import { Component, StrictMode, Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { hasPermission } from './auth/permissions'
import { HRLayout } from './components/HRLayout'
import { findRoute, readPath } from './app/routes'
import { LoadingState } from './components/ui'
import './styles.css'
import { hrStore } from './services/hrStore'
import { apiClient } from './services/apiClient'

// Route-based code splitting with React.lazy() for fast initial page load
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const NotFoundPage = lazy(() => import('./pages/ModulePlaceholder').then((m) => ({ default: m.NotFoundPage })))
const EmployeeDashboardPage = lazy(() => import('./pages/EmployeeDashboardPage').then((m) => ({ default: m.EmployeeDashboardPage })))
const AccessDeniedPage = lazy(() => import('./pages/EmployeeDashboardPage').then((m) => ({ default: m.AccessDeniedPage })))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminUsersModule = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminUsersModule })))
const EmployeesPage = lazy(() => import('./pages/EmployeesPage').then((m) => ({ default: m.EmployeesPage })))
const OverviewPage = lazy(() => import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage })))
const LeaveManagementPage = lazy(() => import('./pages/LeaveManagementPage').then((m) => ({ default: m.LeaveManagementPage })))
const WorkspaceModulePage = lazy(() => import('./pages/WorkspaceModulePage').then((m) => ({ default: m.WorkspaceModulePage })))
const OrgHierarchyPage = lazy(() => import('./components/OrgChart/OrgHierarchyPage').then((m) => ({ default: m.OrgHierarchyPage })))
const PayrollPage = lazy(() => import('./pages/PayrollPage').then((m) => ({ default: m.PayrollPage })))
const EmployeeProfilePage = lazy(() => import('./pages/EmployeeProfilePage').then((m) => ({ default: m.EmployeeProfilePage })))

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('Captured Render Error:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#F3F8F8',
          color: '#0A2328',
          fontFamily: "'DM Sans', sans-serif",
          textAlign: 'center',
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #D6E2E3',
            borderRadius: '16px',
            padding: '36px 32px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(10, 35, 40, 0.12)',
          }}>
            <h2 style={{ fontSize: '20px', margin: '0 0 10px', color: '#0A2328' }}>Workspace Session Notice</h2>
            <p style={{ color: '#586D72', fontSize: '13.5px', margin: '0 0 24px', lineHeight: 1.5 }}>
              {this.state.error?.message || 'An unexpected error interrupted the view. You can safely reset your local session below.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="ui-button primary"
                onClick={() => {
                  try {
                    sessionStorage.clear()
                    localStorage.removeItem('edufyi.authUser')
                  } catch {}
                  window.location.hash = '#/login'
                  window.location.reload()
                }}
              >
                Reset Session & Sign In
              </button>
              <button
                type="button"
                className="ui-button secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function DataStatus({ children }) {
  const [state, setState] = useState(() => hrStore.getState())

  useEffect(() => hrStore.subscribe(setState), [])

  return (
    <>
      {state.dataError && (
        <div
          role="alert"
          className="panel"
          style={{
            padding: '12px 18px',
            color: '#b42318',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 500, fontSize: '13px' }}>{state.dataError}</span>
            <button
              type="button"
              className="ui-button secondary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
              onClick={() => hrStore.perform(() => hrStore.refresh())}
            >
              Retry loading data
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (hrStore.clearError) hrStore.clearError()
              else {
                const s = hrStore.getState()
                if (s) s.dataError = ''
              }
              setState((prev) => ({ ...prev, dataError: '' }))
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#991b1b',
              fontSize: '18px',
              lineHeight: 1,
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            title="Dismiss error message"
            aria-label="Dismiss error message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Non-intrusive enterprise sync progress bar when syncing in background */}
      {!state.dataReady && !state.dataError && (
        <div
          style={{
            height: '3px',
            width: '100%',
            background: 'linear-gradient(90deg, #006e6f 0%, #00d2ff 50%, #006e6f 100%)',
            backgroundSize: '200% 100%',
            animation: 'edufyiShimmer 1.5s infinite linear',
            borderRadius: '2px',
            marginBottom: '10px',
          }}
        />
      )}

      {children}
    </>
  )
}

function useRoute() {
  const [rawHash, setRawHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''))
  useEffect(() => {
    const update = () => setRawHash(window.location.hash || '')
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  const cleanPath = readPath()
  const matched = findRoute(rawHash || cleanPath)
  return matched ?? { path: cleanPath, query: {}, label: 'Not found', group: 'Error', description: 'Unknown route' }
}

function App() {
  const route = useRoute()
  const { user, status } = useAuth()

  // Detect and exchange Google OAuth 2.0 authorization code on redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const scope = searchParams.get('scope')

    if (code && (state?.includes('actor_') || state?.includes('edufyi') || scope?.includes('calendar') || scope?.includes('google'))) {
      const exchangeOAuthCode = async () => {
        try {
          const res = await apiClient.post('/calendar/google/exchange-code', { code })
          if (res?.success) {
            // Clean the query parameters from URL without full reload
            const cleanUrl = window.location.origin + window.location.pathname + window.location.hash
            window.history.replaceState({}, document.title, cleanUrl)
            window.dispatchEvent(new CustomEvent('edufyi:google-calendar-connected', { detail: res }))
          }
        } catch (err) {
          console.warn('[Google OAuth Code Exchange Error]:', err?.message)
        }
      }
      exchangeOAuthCode()
    }
  }, [])

  const isAuthRoute =
    route.path === '/login' ||
    route.path === '/admin/login' ||
    route.path === '/hr/login' ||
    route.path === '/employee/login'

  useEffect(() => {
    // If signed out and trying to access a protected URL, redirect to that portal's dedicated login URL
    if (status === 'signed-out' && !isAuthRoute) {
      if (route.path.startsWith('/admin')) {
        window.location.hash = '#/admin/login'
      } else if (route.path.startsWith('/hr')) {
        window.location.hash = '#/hr/login'
      } else if (route.path.startsWith('/employee')) {
        window.location.hash = '#/employee/login'
      } else {
        window.location.hash = '#/employee/login'
      }
      return
    }

    // If authenticated and visiting a login URL:
    if (status === 'authenticated' && isAuthRoute) {
      const isExec = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
      const isAdmin = user?.role === 'admin'
      const isHR = user?.role === 'hr' || user?.role === 'hr_executive'
      
      let defaultPortal = '/employee'
      if (isAdmin) defaultPortal = '/admin'
      else if (isHR) defaultPortal = '/hr'
      else if (isExec) {
        // MD logging in via employee login -> lands in employee self-service console!
        defaultPortal = route.path === '/hr/login' ? '/hr' : '/employee'
      }

      window.location.hash = '#' + defaultPortal
      return
    }

    // ROLE-BASED ACCESS CONTROL & NAVIGATION
    if (status === 'authenticated' && user && !isAuthRoute) {
      const isExec = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
      const isAdmin = user.role === 'admin' || (user.permissions || []).includes('admin.access')
      const isHR = user.role === 'hr' || user.role === 'hr_executive' || (user.permissions || []).includes('leave.hr.review')

      // 1. Executives and Admins have unrestricted access to all consoles (/admin, /hr, /employee)
      if (isExec || isAdmin) {
        // No forced redirection - seamless navigation across all tabs and panels
      } else if (isHR) {
        // 2. HR can access /hr and /employee; redirect /admin to /hr
        if (route.path.startsWith('/admin')) {
          window.location.hash = '#/hr'
        }
      } else {
        // 3. Regular employees and managers are restricted to /employee
        if (!route.path.startsWith('/employee')) {
          window.location.hash = '#/employee'
        }
      }
    }
  }, [route.path, status, user, isAuthRoute])

  if (status === 'loading') return <LoadingState />
  if (status === 'signed-out' || isAuthRoute) {
    return (
      <Suspense fallback={<LoadingState />}>
        <LoginPage route={route} />
      </Suspense>
    )
  }
  if (route.path === '/not-found' || route.group === 'Error') {
    return (
      <HRLayout route={route}>
        <Suspense fallback={<LoadingState />}>
          <NotFoundPage />
        </Suspense>
      </HRLayout>
    )
  }

  // All cross-portal access is blocked by the redirect above - no access denied pages needed

  if (route.permission && !hasPermission(user, route.permission)) {
    return (
      <HRLayout route={route}>
        <Suspense fallback={<LoadingState />}>
          <AccessDeniedPage
            title="Access Restricted"
            message={`Your account (${user?.displayName || 'User'}) does not have permission (${route.permission}) to view this module.`}
          />
        </Suspense>
      </HRLayout>
    )
  }

  const page =
    route.path === '/hr/payroll' || route.path === '/admin/payroll' || route.path === '/employee/salary'
      ? <PayrollPage />
      : route.path === '/employee/profile'
      ? <EmployeeProfilePage />
      : route.path === '/hr/users' || route.path === '/admin/users'
      ? <AdminUsersModule />
      : route.path.startsWith('/admin/people')
      ? <EmployeesPage route={{ ...route, path: route.path.replace('/admin/people', '/hr/people') }} />
      : route.path === '/admin/leave'
      ? <LeaveManagementPage mode="admin" route={route} query={route.query} />
      : route.path === '/admin/attendance'
      ? <WorkspaceModulePage route={{ ...route, path: '/hr/attendance' }} />
      : route.path === '/admin/hierarchy' || route.path === '/hr/hierarchy' || route.path === '/employee/hierarchy' || route.path === '/employee/organization'
      ? <OrgHierarchyPage />
      : route.workspace
      ? <WorkspaceModulePage route={route} />
      : route.path.startsWith('/admin')
      ? <AdminDashboardPage route={route} />
      : route.path === '/hr'
      ? <OverviewPage />
      : route.path === '/hr/people' || route.path === '/hr/people/new' || route.path.startsWith('/hr/people/')
      ? <EmployeesPage route={route} />
      : route.path === '/hr/leave'
      ? <LeaveManagementPage mode="hr" route={route} query={route.query} />
      : route.path === '/employee/leave'
      ? <LeaveManagementPage mode="self" route={route} query={route.query} />
      : route.path === '/employee/team-leave'
      ? <LeaveManagementPage mode="team" route={route} query={route.query} />
      : route.path.startsWith('/employee')
      ? <EmployeeDashboardPage route={route} />
      : <WorkspaceModulePage route={route} />

  return (
    <HRLayout route={route}>
      <DataStatus>
        <Suspense fallback={<LoadingState />}>
          {page}
        </Suspense>
      </DataStatus>
    </HRLayout>
  )
}

const container = document.getElementById('root')
if (container && (container instanceof Element || container.nodeType === 1)) {
  if (!window.__react_root) {
    window.__react_root = createRoot(container)
  }
  window.__react_root.render(
    <StrictMode>
      <ErrorBoundary>
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <App />
          </AuthProvider>
        </MotionConfig>
      </ErrorBoundary>
    </StrictMode>
  )
}

// Register PWA Service Worker for Offline, Mobile App & Background Execution
const ACTIVE_PWA_CACHE = 'edufyi-hr-pwa-v37'
function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    // Proactively purge old PWA caches
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== ACTIVE_PWA_CACHE) {
            console.log('[PWA] Purging legacy cache:', key)
            caches.delete(key)
          }
        })
      }).catch(() => {})
    }

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((reg) => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope)
        reg.update().catch(() => {})
        if ('sync' in reg) {
          reg.sync.register('sync-attendance-heartbeat').catch(() => {})
        }
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err)
      })
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'complete') {
    registerServiceWorker()
  } else {
    window.addEventListener('load', registerServiceWorker)
  }
}
