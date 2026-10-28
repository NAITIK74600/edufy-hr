import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createAuthMiddleware } from '../src/middleware/auth.js'
import { errorHandler } from '../src/middleware/errorHandler.js'
import { createWorkspaceRouter } from '../src/modules/workspace/workspace.routes.js'
import { workspaceModels } from '../src/models/Workspace.js'
import { Employee } from '../src/models/Employee.js'
import { Notification } from '../src/models/Notification.js'
import { notifyWorkspaceEvent, workspaceNotificationService } from '../src/modules/workspace/workspace.notifications.js'
import { PayrollRecord } from '../src/models/PayrollRecord.js'
import { LeaveRequest } from '../src/models/LeaveRequest.js'
import { AttendanceRecord } from '../src/models/AttendanceRecord.js'

const secret = 'isolated-workspace-integration-secret'
function serverApp(users, useDatabase) {
  const app = express()
  const auth = createAuthMiddleware({ userStore: { findById: async (id) => users.find((user) => user.id === id) }, jwtSecret: secret })
  app.use(express.json())
  app.use('/workspace', createWorkspaceRouter({ auth, useDatabase }))
  app.use(errorHandler)
  return app
}
function token(user) { return jwt.sign({}, secret, { subject: user.id, issuer: 'edufyi-hr-api', audience: 'edufyi-ess', expiresIn: '10m' }) }
async function start(app) {
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  return server
}
async function request(server, path, user, body, method = body === undefined ? 'GET' : 'POST') {
  const response = await fetch(`http://127.0.0.1:${server.address().port}/workspace${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${token(user)}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: response.status, ...(await response.json()) }
}
const close = (server) => new Promise((resolve) => server.close(resolve))

test('workspace rejects unauthenticated access and explicitly reports absent database', async (t) => {
  const admin = { id: 'env-admin', role: 'admin', status: 'active' }
  const server = await start(serverApp([admin], false))
  t.after(() => close(server))
  assert.equal((await request(server, '/snapshot')).status, 401)
  assert.equal((await request(server, '/snapshot', admin)).status, 503)
  assert.equal((await request(server, '/tasks', admin, {})).status, 503)
})

test('all workspace resources persist in isolated MongoDB with permission, role and owner boundaries', { skip: !process.env.MONGODB_TEST_URI }, async (t) => {
  const dbName = `edufyi_workspace_test_${randomUUID().replaceAll('-', '')}`
  let server
  await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName, serverSelectionTimeoutMS: 5000 })
  t.after(async () => {
    if (server?.listening) await close(server)
    if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName })
    assert.equal(mongoose.connection.name, dbName)
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })
  await Promise.all([...Object.values(workspaceModels), Employee, Notification].map((model) => model.init()))
  const records = await Employee.create(['Alice', 'Bob', 'Manager'].map((name, index) => ({ name, employeeId: `WORK-${index}`, email: `${name.toLowerCase()}@example.test`, joiningDate: '2026-10-01', status: 'active', department: index === 0 ? 'Engineering' : 'Operations', role: index === 2 ? 'manager' : 'employee' })))
  const [alice, bob, manager] = records.map((record) => ({ ...record.toObject(), id: String(record._id) }))
  const admin = { id: 'env-admin', name: 'Admin', role: 'admin', status: 'active' }
  const hr = { id: 'env-hr', name: 'HR', role: 'hr', status: 'active', permissions: ['announcements.read', 'tasks.read', 'training.read', 'helpdesk.read', 'reports.read', 'performance.read', 'holidays.read', 'documents.read', 'recruitment.read', 'dashboard.read'] }
  const deniedHr = { id: 'denied-hr', name: 'Restricted HR', role: 'hr', status: 'active', permissions: [] }
  const users = [admin, hr, deniedHr, alice, bob, manager]
  server = await start(serverApp(users, true))
  assert.equal((await request(server, '/snapshot', alice)).data.tasks.length, 0)
  const samples = {
    announcements: { title: 'Update', content: 'Actual company news', category: 'News', priority: 'Normal', targetAudience: 'All Employees', pinned: true },
    tasks: { title: 'Actual task', assigneeId: alice.employeeId, priority: 'Medium', category: 'General', dueDate: '2026-10-10' },
    courses: { title: 'Real course', category: 'Compliance', duration: '1 hour', url: 'https://example.test/course', modules: ['Introduction'] },
    tickets: { subject: 'Support needed', description: 'Laptop needs repair', category: 'IT Support', priority: 'High' },
    expenses: { category: 'Travel', amount: 123.45, merchant: 'Actual merchant', date: '2026-10-03', comments: 'Work trip' },
    dailyReports: { date: '2026-10-03', hoursLogged: 7.5, tasksSummary: 'Completed task', challenges: '', tomorrowPlan: '' },
    kudos: { recipientId: bob.id, badge: 'Collaboration', message: 'Thanks for helping' },
    performanceGoals: { employeeId: alice.id, title: 'Ship project', target: 'Production release', dueDate: '2026-10-10', progress: 20 },
    performanceReviews: { employeeId: alice.id, period: 'Q4 2026', rating: 4.2, comments: 'Actual reviewer feedback' },
    holidays: { name: 'Company holiday', date: '2026-10-20', type: 'Company' },
    documents: { title: 'Policy', category: 'HR Policy', url: 'https://example.test/policy.pdf', size: '' },
    requisitions: { title: 'Engineer', department: 'Engineering', location: 'Bengaluru', openings: 2 },
    notifications: { recipientId: alice.id, title: 'Real update', message: 'Please read', type: 'info' },
  }
  const managementResources = new Set(['announcements', 'tasks', 'courses', 'performanceGoals', 'performanceReviews', 'holidays', 'documents', 'requisitions', 'notifications'])
  const saved = {}
  for (const [resource, body] of Object.entries(samples)) {
    assert.equal((await request(server, `/${resource}`, deniedHr)).status, 403, resource)
    if (managementResources.has(resource)) {
      assert.equal((await request(server, `/${resource}`, alice, body)).status, 403, resource)
      assert.equal((await request(server, `/${resource}`, manager, body)).status, 403, resource)
    }
    const actor = managementResources.has(resource) ? hr : alice
    const result = await request(server, `/${resource}`, actor, body)
    assert.equal(result.status, 201, `${resource}: ${JSON.stringify(result.error)}`)
    saved[resource] = result.data
    assert.equal(await workspaceModels[resource].countDocuments({ _id: result.data.id }), 1, resource)
    assert.equal((await request(server, `/${resource}`, actor, { ...body, ownerId: bob.id })).status, 400, `${resource} payload allowlist`)
  }
  const enroll = await request(server, '/enrollments', alice, { courseId: saved.courses.id })
  assert.equal(enroll.status, 201)
  saved.enrollments = enroll.data
  assert.equal((await request(server, '/enrollments', alice, { courseId: saved.courses.id })).status, 409)
  assert.equal((await request(server, '/dailyReports', alice, samples.dailyReports)).status, 409)
  const own = (await request(server, '/snapshot', alice)).data
  const other = (await request(server, '/snapshot', bob)).data
  const team = (await request(server, '/snapshot', manager)).data
  for (const resource of ['tasks', 'tickets', 'expenses', 'dailyReports', 'enrollments', 'performanceGoals', 'performanceReviews']) {
    assert.equal(own[resource].length, 1, `owner sees ${resource}`)
    assert.equal(other[resource].length, 0, `other cannot see ${resource}`)
    assert.equal(team[resource].length, 0, `manager role cannot bypass ${resource}`)
    assert.equal((await request(server, `/${resource}`, hr)).data.length, 1, `management sees ${resource}`)
  }
  assert.equal(other.kudos.length, 1, 'recipient sees recognition')
  assert.equal(team.kudos.length, 0)
  assert.equal(other.requisitions.length, 0)
  assert.equal((await request(server, '/requisitions', alice)).status, 403)
  assert.equal(other.notifications.length, 4, 'own kudos and company/course broadcast notifications')
  assert.ok(other.notifications.every((record) => record.ownerId === bob.id))
  assert.equal(own.workspacePeople.length, 3)
  assert.deepEqual(Object.keys(own.workspacePeople[0]).sort(), ['employeeId', 'id', 'name'])
  const departmentNews = await request(server, '/announcements', hr, { ...samples.announcements, targetAudience: 'Engineering' })
  assert.equal(departmentNews.status, 201)
  assert.equal((await request(server, '/announcements', bob)).data.length, 1)
  assert.equal((await request(server, `/announcements/${departmentNews.data.id}`, bob, { liked: true }, 'PATCH')).status, 404)
  for (let i = 0; i < 2; i++) assert.equal((await request(server, `/announcements/${saved.announcements.id}`, alice, { liked: true }, 'PATCH')).status, 200)
  assert.equal((await request(server, '/announcements', alice)).data.find((item) => item.id === saved.announcements.id).likes, 1)
  assert.equal((await request(server, `/tasks/${saved.tasks.id}`, bob, { status: 'completed' }, 'PATCH')).status, 404)
  assert.equal((await request(server, `/tasks/${saved.tasks.id}`, alice, { status: 'completed', role: 'admin' }, 'PATCH')).status, 400)
  assert.equal((await request(server, `/tasks/${saved.tasks.id}`, alice, { status: 'completed' }, 'PATCH')).data.status, 'completed')
  assert.equal((await request(server, `/tickets/${saved.tickets.id}`, alice, { status: 'resolved' }, 'PATCH')).status, 403)
  assert.equal((await request(server, `/tickets/${saved.tickets.id}`, hr, { response: 'Replacement scheduled' }, 'PATCH')).status, 200)
  assert.equal((await request(server, `/tickets/${saved.tickets.id}`, hr, { status: 'resolved' }, 'PATCH')).data.responses.length, 2)
  assert.equal((await request(server, `/expenses/${saved.expenses.id}`, manager, { status: 'approved' }, 'PATCH')).status, 403)
  assert.equal((await request(server, `/expenses/${saved.expenses.id}`, hr, { status: 'approved' }, 'PATCH')).data.status, 'approved')
  assert.equal((await request(server, `/expenses/${saved.expenses.id}`, hr, { status: 'rejected', rejectionReason: 'Not allowed' }, 'PATCH')).status, 404)
  const selfClaim = await request(server, '/expenses', hr, samples.expenses)
  assert.equal((await request(server, `/expenses/${selfClaim.data.id}`, hr, { status: 'approved' }, 'PATCH')).status, 404, 'cannot approve own expense')
  assert.equal((await request(server, `/enrollments/${enroll.data.id}`, bob, { progress: 100 }, 'PATCH')).status, 404)
  assert.equal((await request(server, `/enrollments/${enroll.data.id}`, hr, { progress: 100 }, 'PATCH')).status, 404, 'management cannot manufacture someone else completion')
  assert.equal((await request(server, `/enrollments/${enroll.data.id}`, alice, { progress: 100 }, 'PATCH')).status, 200)
  assert.equal((await request(server, '/courses', bob)).data[0].progress, 0)
  assert.equal((await request(server, '/courses', alice)).data[0].completed, true)
  assert.ok((await request(server, '/notifications', alice)).data.some((record) => record.title === 'Training progress saved'))
  const payslip = await PayrollRecord.create({ employeeRef: alice.id, employeeId: alice.employeeId, month: 'October 2026', workingDays: 30, paidDays: 30, reviewed: true, status: 'processed', finalizedAt: new Date() })
  const leaveSource = await LeaveRequest.create({ employeeId: alice.id, leaveType: 'lop', startDate: '2026-10-04', endDate: '2026-10-04', units: 1, reason: 'Personal', status: 'approved' })
  const punchSource = await AttendanceRecord.create({ employeeId: bob.employeeId, employeeName: bob.name, date: '2026-10-03', checkInAt: new Date() })
  const notificationEvent = { recipientId: alice.id, entityId: String(payslip._id), event: 'payroll.processed', message: 'Your reviewed payslip is available; no payment has been initiated.' }
  const notice = await notifyWorkspaceEvent(notificationEvent)
  assert.equal((await notifyWorkspaceEvent(notificationEvent)).id, notice.id, 'core event retries do not duplicate notices')
  await workspaceNotificationService.notify({ recipientId: alice.id, entityId: String(leaveSource._id), event: 'leave.approved', message: 'Your leave request was approved.' })
  await notifyWorkspaceEvent({ recipientId: bob.id, entityId: String(punchSource._id), event: 'attendance.checked_in', message: 'Your attendance check-in was saved.' })
  assert.ok((await request(server, '/notifications', alice)).data.some((record) => record.id === notice.id))
  assert.ok(!(await request(server, '/notifications', bob)).data.some((record) => record.id === notice.id))
  await assert.rejects(notifyWorkspaceEvent({ ...notificationEvent, recipientId: 'env-admin' }), /real employee/)
  await assert.rejects(notifyWorkspaceEvent({ ...notificationEvent, recipientId: new mongoose.Types.ObjectId() }), /does not exist/)
  await assert.rejects(notifyWorkspaceEvent({ ...notificationEvent, recipientId: bob.id }), /not available/)
  assert.equal((await request(server, `/performanceGoals/${saved.performanceGoals.id}`, alice, { progress: 100 }, 'PATCH')).status, 403)
  assert.equal((await request(server, `/performanceGoals/${saved.performanceGoals.id}`, hr, { progress: 30 }, 'PATCH')).data.progress, 30)
  assert.equal((await request(server, `/notifications/${saved.notifications.id}`, bob, { read: true }, 'PATCH')).status, 404)
  assert.equal((await request(server, `/notifications/${saved.notifications.id}`, admin, { read: true }, 'PATCH')).status, 404)
  assert.equal((await request(server, `/notifications/${saved.notifications.id}`, alice, { read: true }, 'PATCH')).status, 200)
  const leaveNotification = await Notification.create({ recipientId: alice.id, entityId: new mongoose.Types.ObjectId(), event: 'leave.approved', message: 'Leave approved' })
  const legacyInbox = (await request(server, '/snapshot', alice)).data.notifications
  const legacyItem = legacyInbox.find((record) => record.id === String(leaveNotification._id))
  assert.ok(legacyItem, 'snapshot includes the existing leave Notification collection')
  assert.equal(legacyItem.type, 'leave.approved')
  assert.equal(legacyItem.read, false)
  assert.equal((await request(server, `/notifications/${leaveNotification._id}`, bob, { read: true }, 'PATCH')).status, 404)
  assert.equal((await request(server, `/notifications/${leaveNotification._id}`, alice, { read: true }, 'PATCH')).status, 200)
  assert.ok((await Notification.findById(leaveNotification._id).lean()).readAt, 'single read updates the original leave notification, not a separate inbox')
  assert.equal((await request(server, '/notifications/read-all', alice, {}, 'PATCH')).status, 200)
  assert.ok((await request(server, '/notifications', alice)).data.every((item) => item.read))
  assert.equal((await request(server, '/documents', hr, { ...samples.documents, url: 'javascript:alert(1)' })).status, 400)
  assert.equal((await request(server, '/expenses', alice, { ...samples.expenses, amount: -1 })).status, 400)
  assert.equal((await request(server, '/dailyReports', alice, { ...samples.dailyReports, date: '2026-02-30' })).status, 400)
  for (const resource of ['documents', 'holidays', 'announcements', 'courses', 'requisitions']) {
    assert.equal((await request(server, `/${resource}/${saved[resource].id}`, alice, undefined, 'DELETE')).status, 403)
  }
  const counts = Object.fromEntries(await Promise.all(Object.entries(workspaceModels).map(async ([key, model]) => [key, await model.countDocuments()])))
  await close(server)
  await mongoose.disconnect()
  await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName, serverSelectionTimeoutMS: 5000 })
  server = await start(serverApp(users, true))
  for (const [resource, count] of Object.entries(counts)) assert.equal(await workspaceModels[resource].countDocuments(), count, `${resource} survives reconnect`)
  assert.equal((await request(server, '/tasks', alice)).data[0].status, 'completed')
  assert.equal((await request(server, '/courses', alice)).data[0].completed, true)
  assert.equal((await request(server, '/expenses', alice)).data[0].status, 'approved')
  assert.equal((await request(server, '/tickets', alice)).data[0].status, 'resolved')
  assert.equal((await request(server, `/documents/${saved.documents.id}`, hr, undefined, 'DELETE')).status, 200)
  assert.equal((await request(server, `/courses/${saved.courses.id}`, hr, undefined, 'DELETE')).status, 200)
  assert.equal(await workspaceModels.enrollments.countDocuments(), 0)
})
