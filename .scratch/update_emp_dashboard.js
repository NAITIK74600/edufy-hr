import fs from 'node:fs'

let content = fs.readFileSync('src/pages/EmployeeDashboardPage.jsx', 'utf8')
let norm = content.replace(/\r\n/g, '\n')

const target = `    // If Director or Admin: show all team members or all employees
    if (['director', 'admin', 'hr'].includes(currentEmp.role)) {
      return allEmployees.filter((e) => e.id !== currentEmp.id && e.role !== 'admin')
    }`

const repl = `    // If Director, Managing Director or Admin: show all team members or all employees
    if (['director', 'managing_director', 'admin', 'hr', 'co_founder', 'vertical_head'].includes(currentEmp.role)) {
      return allEmployees.filter((e) => e.id !== currentEmp.id && e.role !== 'admin')
    }`

if (norm.includes(target)) {
  norm = norm.replace(target, repl)
  if (content.includes('\r\n')) norm = norm.replace(/\n/g, '\r\n')
  fs.writeFileSync('src/pages/EmployeeDashboardPage.jsx', norm, 'utf8')
  console.log('Successfully updated EmployeeDashboardPage.jsx')
} else {
  console.error('Target not found in EmployeeDashboardPage.jsx')
}

