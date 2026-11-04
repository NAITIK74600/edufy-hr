const fs = require('fs');
let file = fs.readFileSync('src/pages/EmployeeDashboardPage.jsx', 'utf8');

const target1 = `  const myLeaveBalances = (storeState.leaveBalances ?? []).filter((b) => {
    if (!b) return false
    if (!b.employeeId) return true
    const bEmp = String(b.employeeId).toUpperCase()
    const matchEmp = currentEmpId && bEmp === String(currentEmpId).toUpperCase()
    const matchUser = currentUserId && (bEmp === currentUserId || bEmp === currentEmpRef)
    return Boolean(matchEmp || matchUser)
  })`;

const repl1 = `  const myLeaveBalances = (storeState.leaveBalances ?? []).filter((b) => {
    if (!b) return false
    if (!b.employeeId) return true
    const bEmp = typeof b.employeeId === 'object'
      ? String(b.employeeId.employeeId || b.employeeId._id || b.employeeId.id || '').toUpperCase()
      : String(b.employeeId).toUpperCase()
    const matchEmp = currentEmpId && (bEmp === String(currentEmpId).toUpperCase() || (typeof b.employeeId === 'object' && String(b.employeeId.employeeId || '').toUpperCase() === String(currentEmpId).toUpperCase()))
    const matchUser = currentUserId && (bEmp === currentUserId || bEmp === currentEmpRef || (typeof b.employeeId === 'object' && String(b.employeeId._id || b.employeeId.id || '') === currentUserId))
    return Boolean(matchEmp || matchUser)
  })`;

const target2 = `const approvedRequests = storeState.leaves.filter((leave) => leave.employeeId === empId && leave.status === 'approved' && leave.startDate.slice(0, 7) <= todayKey().slice(0, 7) && leave.endDate.slice(0, 7) >= todayKey().slice(0, 7))`;

const repl2 = `const approvedRequests = (storeState.leaves || []).filter((leave) => leave && leave.employeeId === empId && leave.status === 'approved' && (leave.startDate || '').slice(0, 7) <= todayKey().slice(0, 7) && (leave.endDate || '').slice(0, 7) >= todayKey().slice(0, 7))`;

const isCRLF = file.includes('\r\n');
const fileNormalized = file.replace(/\r\n/g, '\n');
const target1Norm = target1.replace(/\r\n/g, '\n');
const repl1Norm = repl1.replace(/\r\n/g, '\n');
const target2Norm = target2.replace(/\r\n/g, '\n');
const repl2Norm = repl2.replace(/\r\n/g, '\n');

if (!fileNormalized.includes(target1Norm)) {
  console.error('Target 1 not found!');
  process.exit(1);
}
if (!fileNormalized.includes(target2Norm)) {
  console.error('Target 2 not found!');
  process.exit(1);
}

let updated = fileNormalized.replace(target1Norm, repl1Norm).replace(target2Norm, repl2Norm);
if (isCRLF) {
  updated = updated.replace(/\n/g, '\r\n');
}
fs.writeFileSync('src/pages/EmployeeDashboardPage.jsx', updated, 'utf8');
console.log('Successfully updated EmployeeDashboardPage.jsx');

