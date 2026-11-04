with open('src/main.jsx', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

old_auth_redirect = """    // If authenticated and visiting a login URL:
    if (status === 'authenticated' && isAuthRoute) {
      const isExec = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
      const userPortal = user?.role === 'admin' ? '/admin' : (user?.role === 'hr' || user?.role === 'hr_executive' || isExec ? '/hr' : '/employee')
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

    // STRICT ROLE-BASED ACCESS: Each role is locked to their designated console ONLY
    if (status === 'authenticated' && user && !isAuthRoute) {
      const isExec = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
      const rolePath = user.role === 'admin' ? '/admin' : (user.role === 'hr' || user.role === 'hr_executive' || isExec ? '/hr' : '/employee')
      // If the user is trying to access ANY portal other than their designated console, redirect
      if (!route.path.startsWith(rolePath)) {
        window.location.hash = '#' + rolePath
      }
    }"""

new_auth_redirect = """    // If authenticated and visiting a login URL:
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
    }"""

assert old_auth_redirect in text, "old_auth_redirect not found in main.jsx"
text = text.replace(old_auth_redirect, new_auth_redirect, 1)

output = text.replace('\n', '\r\n')
with open('src/main.jsx', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated src/main.jsx")

