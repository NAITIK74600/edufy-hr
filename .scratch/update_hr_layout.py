with open('src/components/HRLayout.jsx', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

# 1. Remove push imports
old_push_imports = """import {
  isPushNotificationSupported,
  getPushPermissionStatus,
  subscribeToPushNotifications,
  sendTestPushNotification,
} from '../services/pushNotificationClient'"""

new_push_imports = """// Push notifications disabled by system policy (push notification channel removed)"""

if old_push_imports in text:
    text = text.replace(old_push_imports, new_push_imports, 1)
    print("Removed push imports")

# 2. Remove push state hooks
old_push_state = """  const [pushStatus, setPushStatus] = useState(() => (typeof window !== 'undefined' ? getPushPermissionStatus() : 'unsupported'))
  const [pushLoading, setPushLoading] = useState(false)
  const [pushNotice, setPushNotice] = useState('')"""

new_push_state = """  // Push notification states removed"""

if old_push_state in text:
    text = text.replace(old_push_state, new_push_state, 1)
    print("Removed push state")

# 3. Remove push handlers
old_push_handlers = """  const handleEnablePush = async () => {
    setPushLoading(true)
    setPushNotice('')
    const result = await subscribeToPushNotifications()
    setPushLoading(false)
    setPushStatus(getPushPermissionStatus())
    if (result.success) {
      setPushNotice('✓ Push enabled! Notifications will now appear on your device.')
      setTimeout(() => setPushNotice(''), 5000)
    } else {
      setPushNotice(result.error || 'Push permission was denied.')
      setTimeout(() => setPushNotice(''), 6000)
    }
  }

  const handleTestPush = async () => {
    setPushLoading(true)
    setPushNotice('')
    try {
      await sendTestPushNotification()
      setPushNotice('✓ Test push notification sent to your device!')
      setTimeout(() => setPushNotice(''), 5000)
    } catch {
      setPushNotice('Could not send test push. Please check subscription.')
      setTimeout(() => setPushNotice(''), 5000)
    }
    setPushLoading(false)
  }"""

new_push_handlers = """  // Push handlers removed"""

if old_push_handlers in text:
    text = text.replace(old_push_handlers, new_push_handlers, 1)
    print("Removed push handlers")

# 4. Remove push banner in Notifications dropdown
old_push_banner = """                  {/* Device Push Notification Channel Banner */}
                  <div
                    style={{
                      padding: '8px 12px',
                      background: pushStatus === 'granted' ? '#f0fdf4' : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pushStatus === 'granted' ? '#166534' : '#475569' }}>
                      <span style={{ fontSize: '13px' }}>{pushStatus === 'granted' ? '📱' : '🔔'}</span>
                      <span>
                        {pushStatus === 'granted'
                          ? 'Device Push: Active'
                          : pushStatus === 'denied'
                          ? 'Device Push: Blocked in browser'
                          : 'Receive instant device push alerts'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {pushStatus !== 'granted' && (
                        <button
                          type="button"
                          onClick={handleEnablePush}
                          disabled={pushLoading}
                          style={{
                            border: '1px solid #0d9488',
                            background: '#0d9488',
                            color: '#ffffff',
                            borderRadius: '6px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          {pushLoading ? 'Enabling...' : 'Enable Push'}
                        </button>
                      )}

                      {pushStatus === 'granted' && (
                        <button
                          type="button"
                          onClick={handleTestPush}
                          disabled={pushLoading}
                          style={{
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f766e',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            cursor: 'pointer',
                          }}
                          title="Send a sample notification to your device lock screen"
                        >
                          {pushLoading ? 'Testing...' : 'Test Push'}
                        </button>
                      )}
                    </div>
                  </div>

                  {pushNotice && (
                    <div style={{ padding: '4px 12px', background: '#ecfdf5', color: '#047857', fontSize: '10.5px', fontWeight: 500, textAlign: 'center' }}>
                      {pushNotice}
                    </div>
                  )}"""

if old_push_banner in text:
    text = text.replace(old_push_banner, "", 1)
    print("Removed push banner in dropdown")

# 5. Fix isHR and activeRoutes in HRLayout
old_roles_setup = """  // STRICT ROLE-BASED: Admin, HR/Executive Leadership, and Employee portals
  const isAdmin = user?.role === 'admin'
  const isExecutive = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
  const isHR = user?.role === 'hr' || user?.role === 'hr_executive' || isExecutive
  const isManager = !isAdmin && !isExecutive && (user?.role === 'manager' || ['team_lead', 'team_leader', 'revenue_growth_manager', 'senior_manager', 'head_of_sales', 'head_of_marketing'].includes(user?.role))
  const isEmployee = !isAdmin && !isExecutive && !isHR && !isManager

  const portalClass = isAdmin ? 'portal-theme-admin' : (isHR ? 'portal-theme-hr' : 'portal-theme-employee')
  const dashboardHref = isAdmin ? '#/admin' : (isHR ? '#/hr' : '#/employee')
  const portalLabel = isAdmin ? 'System Admin Console' : (isExecutive ? 'Managing Director Executive Console' : isHR ? 'HR People Operations' : 'Employee Self-Service')
  const portalPillLabel = isAdmin ? 'Admin Console' : (isExecutive ? 'Managing Director' : isHR ? 'HR Operations' : 'ESS Portal')
  const activeRoutes = isAdmin ? adminRoutes : (isHR ? hrRoutes : employeeRoutes)"""

new_roles_setup = """  // STRICT ROLE-BASED: Admin, HR, Executive Leadership, and Employee portals
  const isAdmin = user?.role === 'admin'
  const isExecutive = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
  const isHR = !isAdmin && !isExecutive && (user?.role === 'hr' || user?.role === 'hr_executive')
  const isManager = !isAdmin && !isExecutive && !isHR && (user?.role === 'manager' || ['team_lead', 'team_leader', 'revenue_growth_manager', 'senior_manager', 'head_of_sales', 'head_of_marketing'].includes(user?.role))
  const isEmployee = !isAdmin && !isExecutive && !isHR && !isManager

  const activeRoutes = route.path.startsWith('/admin')
    ? adminRoutes
    : route.path.startsWith('/hr')
    ? hrRoutes
    : isAdmin
    ? adminRoutes
    : isHR
    ? hrRoutes
    : employeeRoutes

  const portalClass = route.path.startsWith('/admin')
    ? 'portal-theme-admin'
    : route.path.startsWith('/hr')
    ? 'portal-theme-hr'
    : isAdmin
    ? 'portal-theme-admin'
    : isHR
    ? 'portal-theme-hr'
    : 'portal-theme-employee'

  const dashboardHref = isAdmin ? '#/admin' : (isExecutive ? '#/employee' : isHR ? '#/hr' : '#/employee')
  const portalLabel = isAdmin ? 'System Admin Console' : (isExecutive ? 'Managing Director Console' : isHR ? 'HR People Operations' : 'Employee Self-Service')
  const portalPillLabel = isAdmin ? 'Admin Console' : (isExecutive ? 'Managing Director' : isHR ? 'HR Operations' : 'ESS Portal')"""

assert old_roles_setup in text, "old_roles_setup not found in HRLayout.jsx"
text = text.replace(old_roles_setup, new_roles_setup, 1)
print("Updated role setup in HRLayout.jsx")

output = text.replace('\n', '\r\n')
with open('src/components/HRLayout.jsx', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated src/components/HRLayout.jsx")

