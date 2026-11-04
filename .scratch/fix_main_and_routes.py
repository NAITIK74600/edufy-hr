# -*- coding: utf-8 -*-
import os

# ==========================================
# 1. Update src/main.jsx
# ==========================================
with open('src/main.jsx', 'r', encoding='utf-8') as f:
    main_c = f.read()

has_crlf = '\r\n' in main_c
if has_crlf:
    main_c = main_c.replace('\r\n', '\n')

old_auth_check = '''    // If authenticated and visiting a login URL:
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
    }'''

new_auth_check = '''    // If authenticated and visiting a login URL:
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
    }'''

assert old_auth_check in main_c, 'old_auth_check not found in src/main.jsx'
main_c = main_c.replace(old_auth_check, new_auth_check)

if has_crlf:
    main_c = main_c.replace('\n', '\r\n')

with open('src/main.jsx', 'w', encoding='utf-8') as f:
    f.write(main_c)
print('src/main.jsx updated successfully!')


# ==========================================
# 2. Update src/app/routes.js
# ==========================================
with open('src/app/routes.js', 'r', encoding='utf-8') as f:
    routes_c = f.read()

has_crlf = '\r\n' in routes_c
if has_crlf:
    routes_c = routes_c.replace('\r\n', '\n')

old_read_path = '''export function readPath() {
  const path = window.location.hash.replace(/^#/, '') || ''
  if (!path) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('edufyi.authUser')
        if (stored) {
          const u = JSON.parse(stored)
          if (u.role === 'admin') return '/admin'
          if (u.role === 'hr' || u.role === 'hr_executive') return '/hr'
          return '/employee'
        }
      } catch {}
    }
    return '/employee/login'
  }'''

new_read_path = '''export function readPath() {
  const path = window.location.hash.replace(/^#/, '') || ''
  if (!path || path === '/') {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('edufyi.authUser')
        if (stored) {
          const u = JSON.parse(stored)
          const isExec = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(u.role) || u.email === 'jagadishbabu@edufyitech.in'
          if (u.role === 'admin') return '/admin'
          if (u.role === 'hr' || u.role === 'hr_executive' || isExec) return '/hr'
          return '/employee'
        }
      } catch {}
    }
    return '/employee/login'
  }'''

assert old_read_path in routes_c, 'old_read_path not found in src/app/routes.js'
routes_c = routes_c.replace(old_read_path, new_read_path)

if has_crlf:
    routes_c = routes_c.replace('\n', '\r\n')

with open('src/app/routes.js', 'w', encoding='utf-8') as f:
    f.write(routes_c)
print('src/app/routes.js updated successfully!')


# ==========================================
# 3. Update src/pages/LoginPage.jsx
# ==========================================
with open('src/pages/LoginPage.jsx', 'r', encoding='utf-8') as f:
    login_c = f.read()

has_crlf = '\r\n' in login_c
if has_crlf:
    login_c = login_c.replace('\r\n', '\n')

old_emp_login = '''    try {
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
    }'''

new_emp_login = '''    try {
      const loggedUser = await login(email.trim(), password, 'employee')
      if (loggedUser?.mustChangePassword) {
        setMustSetNewPassword(true)
        setNotice('First-time login detected: An auto-generated temporary password was used. Please set a new password below.')
        return
      }
      const isExec = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(loggedUser?.role) || loggedUser?.email === 'jagadishbabu@edufyitech.in'
      if (loggedUser?.role === 'admin') {
        window.location.hash = '#/admin'
      } else if (loggedUser?.role === 'hr' || loggedUser?.role === 'hr_executive' || isExec) {
        window.location.hash = '#/hr'
      } else {
        window.location.hash = '#/employee'
      }
    }'''

assert old_emp_login in login_c, 'old_emp_login not found in src/pages/LoginPage.jsx'
login_c = login_c.replace(old_emp_login, new_emp_login)

old_emp_pwd_change = '''    try {
      await changePassword({ currentPassword: password, newPassword: newPassword.trim() })
      window.location.hash = '#/employee'
    }'''

new_emp_pwd_change = '''    try {
      await changePassword({ currentPassword: password, newPassword: newPassword.trim() })
      const isExec = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
      if (user?.role === 'admin') window.location.hash = '#/admin'
      else if (user?.role === 'hr' || user?.role === 'hr_executive' || isExec) window.location.hash = '#/hr'
      else window.location.hash = '#/employee'
    }'''

assert old_emp_pwd_change in login_c, 'old_emp_pwd_change not found in src/pages/LoginPage.jsx'
login_c = login_c.replace(old_emp_pwd_change, new_emp_pwd_change)

old_mgmt_login = '''      if (loggedUser?.role === 'admin') {
        window.location.hash = '#/admin'
      } else if (['hr', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(loggedUser?.role)) {
        window.location.hash = '#/hr'
      } else {
        throw new Error('Access denied: Employee accounts cannot sign into the HR or Admin Management Console.')
      }'''

new_mgmt_login = '''      const isExec = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(loggedUser?.role) || loggedUser?.email === 'jagadishbabu@edufyitech.in'
      if (loggedUser?.role === 'admin') {
        window.location.hash = '#/admin'
      } else if (['hr', 'hr_executive', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(loggedUser?.role) || isExec) {
        window.location.hash = '#/hr'
      } else {
        throw new Error('Access denied: Employee accounts cannot sign into the HR or Admin Management Console.')
      }'''

assert old_mgmt_login in login_c, 'old_mgmt_login not found in src/pages/LoginPage.jsx'
login_c = login_c.replace(old_mgmt_login, new_mgmt_login)

if has_crlf:
    login_c = login_c.replace('\n', '\r\n')

with open('src/pages/LoginPage.jsx', 'w', encoding='utf-8') as f:
    f.write(login_c)
print('src/pages/LoginPage.jsx updated successfully!')


# ==========================================
# 4. Update src/styles.css for role badge styling
# ==========================================
with open('src/styles.css', 'r', encoding='utf-8') as f:
    styles_c = f.read()

has_crlf = '\r\n' in styles_c
if has_crlf:
    styles_c = styles_c.replace('\r\n', '\n')

old_role_css = '''.role-indicator-manager {
  background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.10));
  color: #d97706;
  border: 1px solid rgba(245,158,11,0.22);
}'''

new_role_css = '''.role-indicator-managing_director,
.role-indicator-director,
.role-indicator-executive {
  background: linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.14)) !important;
  color: #f59e0b !important;
  border: 1px solid rgba(245,158,11,0.38) !important;
}

.role-indicator-box.role-indicator-managing_director,
.role-indicator-box.role-indicator-director,
.role-indicator-box.role-indicator-executive {
  background: rgba(245, 158, 11, 0.16) !important;
  border: 1px solid rgba(245, 158, 11, 0.38) !important;
  color: #fbbf24 !important;
}

.role-indicator-box.role-indicator-managing_director svg,
.role-indicator-box.role-indicator-director svg,
.role-indicator-box.role-indicator-executive svg {
  color: #fbbf24 !important;
}

.topbar-portal-indicator.executive {
  background: rgba(245, 158, 11, 0.14) !important;
  color: #b45309 !important;
  border: 1px solid rgba(245, 158, 11, 0.35) !important;
}

.role-indicator-manager {
  background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.10));
  color: #d97706;
  border: 1px solid rgba(245,158,11,0.22);
}'''

assert old_role_css in styles_c, 'old_role_css not found in src/styles.css'
styles_c = styles_c.replace(old_role_css, new_role_css)

if has_crlf:
    styles_c = styles_c.replace('\n', '\r\n')

with open('src/styles.css', 'w', encoding='utf-8') as f:
    f.write(styles_c)
print('src/styles.css updated successfully!')

