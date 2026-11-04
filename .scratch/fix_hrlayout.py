# -*- coding: utf-8 -*-
import os

with open('src/components/HRLayout.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Normalize CRLF to LF for consistent replacement
has_crlf = '\r\n' in c
if has_crlf:
    c = c.replace('\r\n', '\n')

old_role_vars = '''  // STRICT ROLE-BASED: Admin, HR/Executive Leadership, and Employee portals
  const isAdmin = user?.role === 'admin'
  const isExecutive = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
  const isHR = user?.role === 'hr' || isExecutive
  const isManager = user?.role === 'manager' || isExecutive || ['team_lead', 'team_leader'].includes(user?.role)
  const isEmployee = user?.role === 'employee'

  const portalClass = isAdmin ? 'portal-theme-admin' : (isHR ? 'portal-theme-hr' : 'portal-theme-employee')
  const dashboardHref = isAdmin ? '#/admin' : (isHR ? '#/hr' : '#/employee')
  const portalLabel = isAdmin ? 'System Admin Console' : (isExecutive ? 'Managing Director Executive Console' : isHR ? 'HR People Operations' : 'Employee Self-Service')
  const portalPillLabel = isAdmin ? 'Admin Console' : (isExecutive ? 'Executive MD' : isHR ? 'HR Operations' : 'ESS Portal')
  const activeRoutes = isAdmin ? adminRoutes : (isHR ? hrRoutes : employeeRoutes)'''

new_role_vars = '''  // STRICT ROLE-BASED: Admin, HR/Executive Leadership, and Employee portals
  const isAdmin = user?.role === 'admin'
  const isExecutive = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
  const isHR = user?.role === 'hr' || user?.role === 'hr_executive' || isExecutive
  const isManager = !isAdmin && !isExecutive && (user?.role === 'manager' || ['team_lead', 'team_leader', 'revenue_growth_manager', 'senior_manager', 'head_of_sales', 'head_of_marketing'].includes(user?.role))
  const isEmployee = !isAdmin && !isExecutive && !isHR && !isManager

  const portalClass = isAdmin ? 'portal-theme-admin' : (isHR ? 'portal-theme-hr' : 'portal-theme-employee')
  const dashboardHref = isAdmin ? '#/admin' : (isHR ? '#/hr' : '#/employee')
  const portalLabel = isAdmin ? 'System Admin Console' : (isExecutive ? 'Managing Director Executive Console' : isHR ? 'HR People Operations' : 'Employee Self-Service')
  const portalPillLabel = isAdmin ? 'Admin Console' : (isExecutive ? 'Managing Director' : isHR ? 'HR Operations' : 'ESS Portal')
  const activeRoutes = isAdmin ? adminRoutes : (isHR ? hrRoutes : employeeRoutes)'''

assert old_role_vars in c, 'old_role_vars not found in HRLayout.jsx'
c = c.replace(old_role_vars, new_role_vars)

old_box = '''          {/* ROLE INDICATOR - No portal switching, strict role isolation */}
          <div style={{ padding: '0 16px 14px 16px' }}>
            <div className={`role-indicator-box role-indicator-${user?.role || 'employee'}`}>
              {isAdmin && (
                <>
                  <ShieldCheck size={13} />
                  <span>Administrator Access</span>
                </>
              )}
              {isHR && (
                <>
                  <Users size={13} />
                  <span>HR Operations Access</span>
                </>
              )}
              {isManager && (
                <>
                  <UserCheck size={13} />
                  <span>Manager Access</span>
                </>
              )}
              {isEmployee && (
                <>
                  <UserCheck size={13} />
                  <span>Employee Self-Service</span>
                </>
              )}
            </div>
          </div>'''

new_box = '''          {/* ROLE INDICATOR - Strict, mutually exclusive badge */}
          <div style={{ padding: '0 16px 14px 16px' }}>
            <div className={`role-indicator-box role-indicator-${isExecutive ? 'managing_director' : (user?.role || 'employee')}`}>
              {isAdmin ? (
                <>
                  <ShieldCheck size={13} />
                  <span>Administrator Access</span>
                </>
              ) : isExecutive ? (
                <>
                  <ShieldCheck size={13} />
                  <span>{user?.role === 'managing_director' ? 'Managing Director Console' : 'Executive Leadership Access'}</span>
                </>
              ) : (user?.role === 'hr' || user?.role === 'hr_executive') ? (
                <>
                  <Users size={13} />
                  <span>HR Operations Access</span>
                </>
              ) : isManager ? (
                <>
                  <UserCheck size={13} />
                  <span>Manager Access</span>
                </>
              ) : (
                <>
                  <UserCheck size={13} />
                  <span>Employee Self-Service</span>
                </>
              )}
            </div>
          </div>'''

assert old_box in c, 'old_box not found in HRLayout.jsx'
c = c.replace(old_box, new_box)

old_bread = '''            {isAdmin ? (
              <span className="topbar-portal-indicator admin">
                <ShieldCheck size={13} />
                <span>Admin Console</span>
              </span>
            ) : isHR ? (
              <span className="topbar-portal-indicator hr">
                <Users size={13} />
                <span>HR Operations</span>
              </span>
            ) : (
              <span className="topbar-portal-indicator ess">
                <UserCheck size={13} />
                <span>Employee Workspace</span>
              </span>
            )}'''

new_bread = '''            {isAdmin ? (
              <span className="topbar-portal-indicator admin">
                <ShieldCheck size={13} />
                <span>Admin Console</span>
              </span>
            ) : isExecutive ? (
              <span className="topbar-portal-indicator executive">
                <ShieldCheck size={13} />
                <span>{user?.role === 'managing_director' ? 'Managing Director Console' : 'Executive Console'}</span>
              </span>
            ) : isHR ? (
              <span className="topbar-portal-indicator hr">
                <Users size={13} />
                <span>HR Operations</span>
              </span>
            ) : (
              <span className="topbar-portal-indicator ess">
                <UserCheck size={13} />
                <span>Employee Workspace</span>
              </span>
            )}'''

assert old_bread in c, 'old_bread not found in HRLayout.jsx'
c = c.replace(old_bread, new_bread)

old_copilot = '''            {/* AI Assistant Launch Button - Role Aware */}
            <button
              className="ai-copilot-btn"
              type="button"
              onClick={() => setAiAssistantOpen(true)}
              title={isAdmin ? 'Open AI Admin Copilot' : (isHR ? 'Open AI HR Copilot' : 'Open AI Copilot')}
            >
              <Sparkles size={14} />
              <span>{isAdmin ? 'AI Admin Copilot' : (isHR ? 'AI HR Copilot' : 'AI Copilot')}</span>
            </button>'''

new_copilot = '''            {/* AI Assistant Launch Button - Role Aware */}
            <button
              className="ai-copilot-btn"
              type="button"
              onClick={() => setAiAssistantOpen(true)}
              title={isAdmin ? 'Open AI Admin Copilot' : (isExecutive ? 'Open AI Executive Copilot' : isHR ? 'Open AI HR Copilot' : 'Open AI Copilot')}
            >
              <Sparkles size={14} />
              <span>{isAdmin ? 'AI Admin Copilot' : (isExecutive ? 'AI Executive Copilot' : isHR ? 'AI HR Copilot' : 'AI Copilot')}</span>
            </button>'''

assert old_copilot in c, 'old_copilot not found in HRLayout.jsx'
c = c.replace(old_copilot, new_copilot)

old_desig = "<strong>{user?.designation || 'Head of People Operations'}</strong>"
new_desig = "<strong>{user?.designation || (isAdmin ? 'System Administrator' : isExecutive ? 'Managing Director' : isHR ? 'HR Operations' : 'Staff Member')}</strong>"
assert old_desig in c, 'old_desig not found in HRLayout.jsx'
c = c.replace(old_desig, new_desig)

if has_crlf:
    c = c.replace('\n', '\r\n')

with open('src/components/HRLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('HRLayout.jsx updated successfully!')

