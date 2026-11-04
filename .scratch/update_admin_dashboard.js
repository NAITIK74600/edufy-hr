import fs from 'node:fs'

// 1. Update src/pages/AdminDashboardPage.jsx
let adminContent = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8')
let adminNorm = adminContent.replace(/\r\n/g, '\n')

const targetAdminIsDir = `    const isDir = u.role === 'director' || u.email === 'jagadishbabu@edufyitech.in' || u.email === 'director@edufyitech.in'`
const replAdminIsDir = `    const isDir = u.role === 'director' || u.role === 'managing_director' || u.email === 'jagadishbabu@edufyitech.in' || u.email === 'director@edufyitech.in'`

const targetCards = `            {/* Punched In */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Punched In</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#059669', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Live
                </span>
              </div>
              <strong style={{ font: '700 30px "Space Grotesk", sans-serif', color: '#047857', lineHeight: 1.1 }}>{punchedInCount}</strong>
              <small style={{ fontSize: '11px', color: '#059669' }}>Working on-site now</small>
            </div>

            {/* Punched Out */}
            <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Punched Out</span>
                <CheckCircle2 size={16} style={{ color: '#0284c7' }} />
              </div>
              <strong style={{ font: '700 30px "Space Grotesk", sans-serif', color: '#0369a1', lineHeight: 1.1 }}>{punchedOutCount}</strong>
              <small style={{ fontSize: '11px', color: '#0284c7' }}>Shift completed today</small>
            </div>

            {/* Not Checked In */}
            <div style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Not Checked In</span>
                <Clock size={16} style={{ color: 'var(--muted)' }} />
              </div>
              <strong style={{ font: '700 30px "Space Grotesk", sans-serif', color: 'var(--muted)', lineHeight: 1.1 }}>{notPunchedInCount}</strong>
              <small style={{ fontSize: '11px', color: 'var(--muted)' }}>Pending punch or off</small>
            </div>`

const replCards = `            {/* Punched In */}
            <a href="#/admin/attendance" title="Click to view employees working now" style={{ textDecoration: 'none', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Punched In</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#059669', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Live
                </span>
              </div>
              <strong style={{ font: '700 30px "Space Grotesk", sans-serif', color: '#047857', lineHeight: 1.1 }}>{punchedInCount}</strong>
              <small style={{ fontSize: '11px', color: '#059669' }}>Working on-site now → View roster</small>
            </a>

            {/* Punched Out */}
            <a href="#/admin/attendance" title="Click to view employees who punched out" style={{ textDecoration: 'none', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Punched Out</span>
                <CheckCircle2 size={16} style={{ color: '#0284c7' }} />
              </div>
              <strong style={{ font: '700 30px "Space Grotesk", sans-serif', color: '#0369a1', lineHeight: 1.1 }}>{punchedOutCount}</strong>
              <small style={{ fontSize: '11px', color: '#0284c7' }}>Shift completed today → View roster</small>
            </a>

            {/* Not Checked In */}
            <a href="#/admin/attendance" title="Click to view employees not checked in" style={{ textDecoration: 'none', background: 'var(--surface-sunken)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Not Checked In</span>
                <Clock size={16} style={{ color: 'var(--muted)' }} />
              </div>
              <strong style={{ font: '700 30px "Space Grotesk", sans-serif', color: 'var(--muted)', lineHeight: 1.1 }}>{notPunchedInCount}</strong>
              <small style={{ fontSize: '11px', color: 'var(--muted)' }}>Pending punch or off → View roster</small>
            </a>`

if (adminNorm.includes(targetAdminIsDir)) {
  adminNorm = adminNorm.replace(targetAdminIsDir, replAdminIsDir)
}
if (adminNorm.includes(targetCards)) {
  adminNorm = adminNorm.replace(targetCards, replCards)
}
if (adminContent.includes('\r\n')) adminNorm = adminNorm.replace(/\n/g, '\r\n')
fs.writeFileSync('src/pages/AdminDashboardPage.jsx', adminNorm, 'utf8')
console.log('Successfully updated AdminDashboardPage.jsx')

// 2. Update src/pages/EmployeesPage.jsx
let empContent = fs.readFileSync('src/pages/EmployeesPage.jsx', 'utf8')
let empNorm = empContent.replace(/\r\n/g, '\n')

const targetEmpIsDir = `    const isDir = emp.role === 'director' || emp.email === 'jagadishbabu@edufyitech.in' || emp.email === 'director@edufyitech.in'`
const replEmpIsDir = `    const isDir = emp.role === 'director' || emp.role === 'managing_director' || emp.email === 'jagadishbabu@edufyitech.in' || emp.email === 'director@edufyitech.in'`

if (empNorm.includes(targetEmpIsDir)) {
  empNorm = empNorm.replace(targetEmpIsDir, replEmpIsDir)
  if (empContent.includes('\r\n')) empNorm = empNorm.replace(/\n/g, '\r\n')
  fs.writeFileSync('src/pages/EmployeesPage.jsx', empNorm, 'utf8')
  console.log('Successfully updated EmployeesPage.jsx')
} else {
  console.error('Target not found in EmployeesPage.jsx')
}

