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
  const [tookLong, setTookLong] = useState(false)

  useEffect(() => hrStore.subscribe(setState), [])

  useEffect(() => {
    if (state.dataReady) {
      setTookLong(false)
      return
    }
    const timer = setTimeout(() => setTookLong(true), 20000)
    return () => clearTimeout(timer)
  }, [state.dataReady])

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
      {!state.dataReady ? (
        state.dataError ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ color: '#b42318', marginBottom: '16px', fontSize: '14.5px', fontWeight: 600 }}>
              {state.dataError}
            </p>
            <button
              type="button"
              className="ui-button primary"
              onClick={() => hrStore.perform(() => hrStore.refresh())}
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <LoadingState />
            {tookLong && (
              <div style={{ marginTop: '16px', color: '#586D72', fontSize: '13px' }}>
                <p>Syncing enterprise database records... Still working.</p>
                <button
                  type="button"
                  className="ui-button secondary"
                  style={{ marginTop: '8px', padding: '4px 12px', fontSize: '12px' }}
                  onClick={() => hrStore.perform(() => hrStore.refresh())}
                >
                  Retry Sync
                </button>
              </div>
            )}
          </div>
        )
      ) : children}
    </>
  )
}

function useRoute() {
  const [path, setPath] = useState(readPath)
  useEffect(() => {
    const update = () => setPath(readPath())
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return findRoute(path) ?? { path, label: 'Not found', group: 'Error', description: 'Unknown route' }
}

function App() {
  const route = useRoute()
  const { user, status } = useAuth()

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
        window.location.hash = '#/login'
      }
      return
    }

    // If authenticated and visiting a login URL:
    if (status === 'authenticated' && isAuthRoute) {
      const userPortal = user?.role === 'admin' ? '/admin' : (user?.role === 'hr' ? '/hr' : '/employee')
      const targetPortal =
        route.path === '/admin/login' ? '/admin' :
        route.path === '/hr/login' ? '/hr' :
        route.path === '/employee/login' ? '/employee' : null

      // Only auto-redirect if visiting their own portal's login or generic /login
      if (!targetPortal || targetPortal === userPortal) {
        window.location.hash = '#' + userPortal
        return
      }
      // If visiting a different portal's login (e.g. employee visiting /admin/login),
      // allow LoginPage to display so they can authenticate into the intended portal
    }

    // STRICT ROLE-BASED ACCESS: Each role is locked to their own portal ONLY
    if (status === 'authenticated' && user && !isAuthRoute) {
      const rolePath = user.role === 'admin' ? '/admin' : (user.role === 'hr' ? '/hr' : '/employee')
      // If the user is trying to access ANY portal other than their own, redirect
      if (!route.path.startsWith(rolePath)) {
        window.location.hash = '#' + rolePath
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
      ? <LeaveManagementPage mode="hr" />
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
      ? <LeaveManagementPage mode="hr" />
      : route.path === '/employee/leave'
      ? <LeaveManagementPage mode="self" />
      : route.path === '/employee/team-leave'
      ? <LeaveManagementPage mode="team" />
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
if (container) {
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
