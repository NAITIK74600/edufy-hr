import fs from 'node:fs'

let content = fs.readFileSync('src/services/hrStore.js', 'utf8')
let contentNorm = content.replace(/\r\n/g, '\n')

// 1. Jagadish Babu user definition
const targetJagadishUser = `    "employeeId": "EDU-DIR-001",
    "name": "Jagadish Babu",
    "displayName": "Jagadish Babu (Managing Director)",
    "email": "jagadishbabu@edufyitech.in",
    "role": "director",
    "department": "Executive Leadership",
    "team": null,
    "teamId": null,
    "designation": "Managing Director",
    "status": "active",
    "avatarTone": "purple",
    "managerId": null,
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "employees.write",
      "employees.manager.assign",
      "leave.self.read",
      "leave.team.read",
      "leave.team.approve",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read",
      "reports.read"
    ]`

const replJagadishUser = `    "employeeId": "EDU-DIR-001",
    "name": "Jagadish Babu",
    "displayName": "Jagadish Babu (Managing Director)",
    "email": "jagadishbabu@edufyitech.in",
    "role": "managing_director",
    "department": "Executive Leadership",
    "team": null,
    "teamId": null,
    "designation": "Managing Director",
    "status": "active",
    "avatarTone": "purple",
    "managerId": null,
    "teamLeadId": null,
    "permissions": [
      "*"
    ]`

// 2. In approveLeave & rejectLeave
const targetDirLookup = `    const directorEmp = employees.find(e => e.role === 'director' || e.role === 'managing_director')`
const replDirLookup = `    const directorEmp = employees.find(e => e.role === 'director' || e.role === 'managing_director' || e.email === 'jagadishbabu@edufyitech.in')`

const targetApproveDir = `    else if (reviewerRole === 'director' || req.status === 'pending_director') {`
const replApproveDir = `    else if (['director', 'managing_director'].includes(reviewerRole) || req.status === 'pending_director') {`

const targetRejectDir = `    else if (reviewerRole === 'director' || req.applicantRole === 'manager') {`
const replRejectDir = `    else if (['director', 'managing_director'].includes(reviewerRole) || req.applicantRole === 'manager') {`

if (contentNorm.includes(targetJagadishUser)) {
  contentNorm = contentNorm.replace(targetJagadishUser, replJagadishUser)
}
if (contentNorm.includes(targetDirLookup)) {
  contentNorm = contentNorm.replace(targetDirLookup, replDirLookup)
}
if (contentNorm.includes(targetApproveDir)) {
  contentNorm = contentNorm.replace(targetApproveDir, replApproveDir)
}
if (contentNorm.includes(targetRejectDir)) {
  contentNorm = contentNorm.replace(targetRejectDir, replRejectDir)
}

if (content.includes('\r\n')) {
  contentNorm = contentNorm.replace(/\n/g, '\r\n')
}
fs.writeFileSync('src/services/hrStore.js', contentNorm, 'utf8')
console.log('Successfully updated hrStore.js')

