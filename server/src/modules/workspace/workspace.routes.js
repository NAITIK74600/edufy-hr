import express from 'express'
import mongoose from 'mongoose'
import { workspaceModels as models } from '../../models/Workspace.js'
import { Employee } from '../../models/Employee.js'
import { Notification } from '../../models/Notification.js'
import { hasPermission } from '../../auth/permissions.js'
import { ensureConnected } from '../leave/leave.repository.js'

const permissions = { announcements: 'announcements.read', tasks: 'tasks.read', courses: 'training.read', enrollments: 'training.read', tickets: 'helpdesk.read', expenses: 'reports.read', dailyReports: 'reports.read', kudos: 'performance.read', performanceGoals: 'performance.read', performanceReviews: 'performance.read', holidays: 'holidays.read', documents: 'documents.read', requisitions: 'recruitment.read', notifications: 'dashboard.read', roles: 'dashboard.read', departments: 'dashboard.read' }
const shared = new Set(['announcements', 'courses', 'holidays', 'documents', 'roles', 'departments'])
const managementOnly = new Set([...shared, 'tasks', 'requisitions', 'performanceGoals', 'performanceReviews', 'roles', 'departments'])
function fail(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode, code: statusCode === 403 ? 'FORBIDDEN' : 'WORKSPACE_VALIDATION_ERROR' })
}
const management = (user) => ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(user.role)
const id = (user) => String(user.id ?? user._id)
function access(user, resource) {
  return hasPermission(user, permissions[resource]) || (!management(user) && resource !== 'requisitions' && hasPermission(user, 'dashboard.read'))
}
function filter(user, resource) {
  if (resource === 'notifications') {
    const actorId = id(user)
    const orConditions = [
      { ownerId: actorId },
      { ownerId: String(actorId) },
    ]
    if (user?.employeeId) {
      orConditions.push({ ownerId: user.employeeId })
    }
    if (management(user)) {
      orConditions.push(
        { ownerId: 'management' },
        { ownerId: 'admin' },
        { ownerId: 'hr' },
        { recipientRole: 'management' },
        { recipientRole: 'all' },
        { recipientRole: user.role }
      )
      if (['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'].includes(user.role)) {
        orConditions.push({ recipientRole: 'admin' }, { recipientRole: 'hr' })
      }
    }
    return { $or: orConditions }
  }
  if (management(user) || shared.has(resource) || resource === 'requisitions') return {}
  if (resource === 'tasks') return { assigneeRef: id(user) }
  if (resource === 'performanceGoals' || resource === 'performanceReviews') return { employeeRef: id(user) }
  if (resource === 'kudos') return { $or: [{ ownerId: id(user) }, { recipientId: id(user) }] }
  return { ownerId: id(user) }
}
function allowedBody(body, fields) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail('Enter a JSON object.')
  for (const field of Object.keys(body)) if (!fields.includes(field)) throw fail(`Unsupported field: ${field}.`)
}
function string(body, field, required = true, max = 10000) {
  const value = body[field]
  if ((value === undefined || value === null || value === '') && !required) return ''
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw fail(`Enter a valid ${field}.`)
  return value.trim()
}
function date(body, field) {
  const value = string(body, field, true, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw fail(`Enter a valid ${field}.`)
  return value
}
function number(body, field, min, max, integer = false) {
  const value = body[field]
  if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) throw fail(`Enter a valid ${field} between ${min} and ${max}.`)
  return value
}
function choice(body, field, values) {
  const raw = body[field]
  if (typeof raw === 'string') {
    const matched = values.find((v) => v.toLowerCase() === raw.toLowerCase())
    if (matched) return matched
  }
  if (!values.includes(raw)) throw fail(`Choose a valid ${field}.`)
  return raw
}
function url(body) {
  const value = string(body, 'url', true, 2048)
  let parsed
  try { parsed = new URL(value) } catch { throw fail('Enter a valid HTTPS document/course URL.') }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw fail('Only HTTPS URLs without credentials are accepted.')
  return value
}
async function employee(identifier) {
  if (typeof identifier !== 'string' || identifier.length > 200) throw fail('Choose an existing employee.')
  const record = await Employee.findOne(mongoose.isValidObjectId(identifier) ? { _id: identifier } : { employeeId: identifier }).lean()
  if (!record || record.status !== 'active') throw fail('Choose an active employee.', 404)
  return record
}
function serialize(resource, record, actor, people = new Map()) {
  const { __v, likedBy, ...data } = record
  const owner = people.get(String(record.ownerId))
  const subject = people.get(String(record.assigneeRef ?? record.employeeRef ?? record.ownerId))
  const recipient = people.get(String(record.recipientId))
  if (subject && ['tickets', 'expenses', 'dailyReports', 'performanceGoals', 'performanceReviews'].includes(resource)) {
    data.employeeName = subject.name
    data.employeeId = subject.employeeId
    data.department = subject.department
  }
  if (resource === 'tasks') {
    if (subject) { data.assigneeName = subject.name; data.assigneeId = subject.employeeId }
    if (owner) data.assignedBy = owner.name
  }
  if (resource === 'announcements' && owner) data.author = owner.name
  if (resource === 'performanceReviews' && owner) data.reviewerName = owner.name
  if (resource === 'kudos') {
    if (owner) data.from = owner.name
    if (recipient) data.to = recipient.name
  }
  data.id = String(record._id)
  if (resource === 'roles') {
    data.id = record.roleId || String(record._id)
    data._id = String(record._id)
    data.roleId = record.roleId || String(record._id)
  }
  if (resource === 'departments') {
    data.id = record.deptId || String(record._id)
    data._id = String(record._id)
    data.deptId = record.deptId || String(record._id)
  }
  if (resource === 'announcements') { data.likes = likedBy?.length ?? 0; data.liked = likedBy?.includes(id(actor)) ?? false }
  if (resource === 'dailyReports') { data.summary = data.tasksSummary; data.submittedAt = data.createdAt }
  if (resource === 'kudos') { data.fromName = data.from; data.toName = data.to; data.tag = data.badge }
  if (resource === 'tickets') data.responses = [{ sender: data.employeeName, text: data.description, time: data.createdAt }, ...(data.responses ?? [])]
  if (resource === 'notifications') {
    data.time = data.createdAt
    data.recipientId = record.recipientId || String(record.ownerId)
  }
  return data
}

export function createWorkspaceRouter({ auth, useDatabase }) {
  const router = express.Router()
  router.use(auth.authenticate)
  router.use((req, res, next) => {
    try {
      if (!useDatabase) throw Object.assign(new Error('MongoDB is not configured. Workspace data cannot be loaded or saved.'), { statusCode: 503, code: 'DATA_SOURCE_UNAVAILABLE' })
      ensureConnected()
      next()
    } catch (error) { next(error) }
  })
  async function list(actor, resource, people) {
    if (!access(actor, resource)) return []
    const query = filter(actor, resource)
    if (resource === 'announcements' && !management(actor)) query.targetAudience = { $in: ['All Employees', actor.department].filter(Boolean) }
    const records = await models[resource].find(query).sort({ createdAt: -1 }).lean()
    if (!people) {
      const references = [...new Set(records.flatMap((record) => [record.ownerId, record.assigneeRef, record.employeeRef, record.recipientId]).filter((value) => mongoose.isValidObjectId(value)))]
      const employees = references.length ? await Employee.find({ _id: { $in: references } }).select('name employeeId department').lean() : []
      people = new Map(employees.map((employee) => [String(employee._id), employee]))
    }
    const result = records.map((record) => serialize(resource, record, actor, people))
    if (resource === 'courses') {
      const enrollments = await models.enrollments.find({ ownerId: id(actor) }).lean()
      return result.map((course) => {
        const enrollment = enrollments.find((record) => String(record.courseId) === course.id)
        return { ...course, enrolled: Boolean(enrollment), progress: enrollment?.progress ?? 0, completed: enrollment?.progress === 100, status: !enrollment ? 'Not Enrolled' : enrollment.progress === 100 ? 'Completed (self-reported)' : 'In Progress' }
      })
    }
    if (resource === 'notifications' && mongoose.isValidObjectId(id(actor))) {
      const leave = await Notification.find({ recipientId: id(actor) }).sort({ createdAt: -1 }).lean()
      result.push(...leave.map((record) => ({ id: String(record._id), title: 'Leave update', message: record.message, type: record.event, read: Boolean(record.readAt), time: record.createdAt })))
    }
    return result
  }
  router.get('/snapshot', async (req, res, next) => {
    try {
      const people = await Employee.find().select('name employeeId department status').lean()
      const byId = new Map(people.map((employee) => [String(employee._id), employee]))
      const entries = await Promise.all(Object.keys(models).map(async (resource) => [resource, await list(req.auth.user, resource, byId)]))
      res.json({ success: true, data: { ...Object.fromEntries(entries), workspacePeople: people.filter((record) => record.status === 'active').map((record) => ({ id: String(record._id), name: record.name, employeeId: record.employeeId })) } })
    } catch (error) { next(error) }
  })
  router.param('resource', (req, res, next, resource) => {
    if (!Object.hasOwn(models, resource)) return next(fail('Unknown workspace resource.', 404))
    if (!access(req.auth.user, resource)) return next(fail('Workspace access is not permitted.', 403))
    next()
  })
  router.get('/:resource', async (req, res, next) => {
    try { res.json({ success: true, data: await list(req.auth.user, req.params.resource) }) } catch (error) { next(error) }
  })
  router.post('/:resource', async (req, res, next) => {
    try {
      const { resource } = req.params
      const actor = req.auth.user
      if (managementOnly.has(resource) && !management(actor)) throw fail('HR or administrator access is required.', 403)
      const body = req.body
      let values = { ownerId: id(actor) }
      const today = new Date().toISOString().slice(0, 10)
      const actorName = actor.name ?? actor.displayName
      switch (resource) {
        case 'announcements':
          allowedBody(body, ['title', 'content', 'category', 'priority', 'targetAudience', 'pinned'])
          if (body.pinned !== undefined && typeof body.pinned !== 'boolean') throw fail('pinned must be a boolean.')
          values = { ...values, title: string(body, 'title', true, 200), content: string(body, 'content'), category: string(body, 'category'), priority: choice(body, 'priority', ['Normal', 'High', 'Urgent']), targetAudience: string(body, 'targetAudience', true, 200), pinned: body.pinned ?? false, author: actorName, date: today, likedBy: [] }
          break
        case 'tasks': {
          allowedBody(body, ['title', 'assigneeId', 'priority', 'category', 'dueDate'])
          const assignee = await employee(body.assigneeId)
          values = { ...values, assignedBy: actorName, title: string(body, 'title', true, 200), assigneeRef: String(assignee._id), assigneeId: assignee.employeeId, assigneeName: assignee.name, priority: choice(body, 'priority', ['Low', 'Medium', 'High', 'Urgent']), category: string(body, 'category'), dueDate: date(body, 'dueDate'), status: 'todo' }
          break
        }
        case 'courses':
          allowedBody(body, ['title', 'category', 'duration', 'url', 'modules'])
          if (!Array.isArray(body.modules) || body.modules.length > 100 || body.modules.some((value) => typeof value !== 'string' || !value.trim() || value.length > 200)) throw fail('Enter up to 100 module titles.')
          values = { ...values, title: string(body, 'title', true, 200), category: string(body, 'category'), duration: string(body, 'duration', true, 100), url: url(body), modules: body.modules.map((value) => value.trim()) }
          break
        case 'enrollments':
          allowedBody(body, ['courseId'])
          if (!mongoose.isValidObjectId(body.courseId) || !await models.courses.exists({ _id: body.courseId })) throw fail('Course not found.', 404)
          values = { ...values, courseId: body.courseId, progress: 0 }
          break
        case 'tickets':
          allowedBody(body, ['subject', 'description', 'category', 'priority'])
          values = { ...values, employeeId: actor.employeeId, employeeName: actorName, subject: string(body, 'subject', true, 200), description: string(body, 'description'), category: string(body, 'category'), priority: choice(body, 'priority', ['Low', 'Medium', 'High', 'Urgent']), status: 'open' }
          break
        case 'expenses': {
          allowedBody(body, ['category', 'amount', 'merchant', 'date', 'comments', 'attachmentUrl', 'attachmentName', 'attachmentType', 'attachmentSize'])
          const amount = number(body, 'amount', 0.01, 100000000)
          if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) throw fail('Use at most two decimal places for amount.')
          values = {
            ...values,
            employeeId: actor.employeeId,
            employeeName: actorName,
            category: string(body, 'category'),
            amount,
            merchant: string(body, 'merchant'),
            date: date(body, 'date'),
            comments: string(body, 'comments', false),
            status: 'submitted',
            attachmentUrl: (body.attachmentUrl && typeof body.attachmentUrl === 'string') ? string(body, 'attachmentUrl', false, 25000000) : '',
            attachmentName: (body.attachmentName && typeof body.attachmentName === 'string') ? string(body, 'attachmentName', false, 500) : '',
            attachmentType: (body.attachmentType && typeof body.attachmentType === 'string') ? string(body, 'attachmentType', false, 100) : '',
            attachmentSize: (body.attachmentSize && typeof body.attachmentSize === 'string') ? string(body, 'attachmentSize', false, 100) : '',
          }
          break
        }
        case 'dailyReports':
          allowedBody(body, ['date', 'hoursLogged', 'tasksSummary', 'challenges', 'tomorrowPlan'])
          values = { ...values, employeeId: actor.employeeId, employeeName: actorName, date: date(body, 'date'), hoursLogged: number(body, 'hoursLogged', 0, 24), tasksSummary: string(body, 'tasksSummary'), challenges: string(body, 'challenges', false), tomorrowPlan: string(body, 'tomorrowPlan', false) }
          break
        case 'kudos': {
          allowedBody(body, ['recipientId', 'badge', 'message'])
          const recipient = await employee(body.recipientId)
          if (String(recipient._id) === id(actor)) throw fail('Choose another employee for kudos.')
          values = { ...values, recipientId: String(recipient._id), from: actorName, to: recipient.name, badge: string(body, 'badge', true, 200), message: string(body, 'message'), date: today }
          break
        }
        case 'performanceGoals':
        case 'performanceReviews': {
          allowedBody(body, resource === 'performanceGoals' ? ['employeeId', 'title', 'target', 'dueDate', 'progress'] : ['employeeId', 'period', 'rating', 'comments'])
          const subject = await employee(body.employeeId)
          values = { ...values, employeeRef: String(subject._id), employeeName: subject.name }
          if (resource === 'performanceGoals') values = { ...values, title: string(body, 'title', true, 200), target: string(body, 'target', true, 500), dueDate: date(body, 'dueDate'), progress: number(body, 'progress', 0, 100, true) }
          else {
            if (String(subject._id) === id(actor)) throw fail('You cannot submit your own performance review.', 403)
            values = { ...values, period: string(body, 'period', true, 100), rating: number(body, 'rating', 1, 5), comments: string(body, 'comments'), reviewerName: actorName }
          }
          break
        }
        case 'holidays':
          allowedBody(body, ['name', 'date', 'type'])
          values = { ...values, name: string(body, 'name', true, 200), title: string(body, 'name', true, 200), date: date(body, 'date'), type: string(body, 'type', false), day: new Date(`${date(body, 'date')}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }) }
          break
        case 'documents':
          allowedBody(body, ['title', 'category', 'url', 'size'])
          values = { ...values, title: string(body, 'title', true, 200), category: string(body, 'category'), url: url(body), size: string(body, 'size', false, 100), date: today }
          break
        case 'requisitions':
          allowedBody(body, ['title', 'department', 'location', 'openings'])
          values = { ...values, title: string(body, 'title', true, 200), department: string(body, 'department', true, 200), location: string(body, 'location', true, 200), openings: number(body, 'openings', 1, 10000, true), status: 'Active' }
          break
        case 'notifications': {
          allowedBody(body, ['recipientId', 'recipientRole', 'title', 'message', 'type', 'id'])
          let owner = id(actor)
          let role = (typeof body.recipientRole === 'string' && body.recipientRole.trim()) ? body.recipientRole.trim().toLowerCase() : null
          const rawRecipient = body.recipientId
          if (typeof rawRecipient === 'string' && rawRecipient.trim()) {
            const clean = rawRecipient.trim()
            if (['admin', 'hr', 'management', 'all'].includes(clean.toLowerCase())) {
              role = clean.toLowerCase()
            } else {
              try {
                const recipient = await employee(clean)
                if (recipient) owner = String(recipient._id)
              } catch {
                owner = id(actor)
                if (!role) role = 'all'
              }
            }
          }
          values = {
            ownerId: owner,
            recipientRole: role,
            title: string(body, 'title', true, 200),
            message: (body.message && typeof body.message === 'string') ? string(body, 'message', false, 10000) : '',
            type: (body.type && typeof body.type === 'string') ? string(body, 'type', false, 100) : 'notification',
            read: false,
          }
          break
        }
        case 'roles':
          allowedBody(body, ['roleId', 'id', 'name', 'description', 'badge', 'isSystem', 'permissions'])
          values = {
            ...values,
            roleId: string(body, 'roleId', false, 100) || string(body, 'id', false, 100) || string(body, 'name', true, 100).toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: string(body, 'name', true, 100),
            description: string(body, 'description', false, 500),
            badge: string(body, 'badge', false, 100) || 'Custom Role',
            isSystem: Boolean(body.isSystem),
            permissions: Array.isArray(body.permissions) ? body.permissions : ['dashboard.read'],
          }
          break
        case 'departments':
          allowedBody(body, ['deptId', 'id', 'name', 'code', 'description', 'head'])
          values = {
            ...values,
            deptId: string(body, 'deptId', false, 100) || string(body, 'id', false, 100) || string(body, 'name', true, 100).toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: string(body, 'name', true, 100),
            code: string(body, 'code', false, 50) || string(body, 'name', true, 100).slice(0, 4).toUpperCase(),
            description: string(body, 'description', false, 500),
            head: string(body, 'head', false, 100) || 'Unassigned',
          }
          break
      }
      const record = await models[resource].create(values)

      if (resource === 'expenses') {
        const formattedAmt = Number(values.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
        // Confirmation for employee
        await models.notifications.create({
          ownerId: id(actor),
          recipientId: id(actor),
          title: 'Expense Claim Submitted',
          message: `Your claim for ₹${formattedAmt} (${values.category}) has been submitted for approval.`,
          type: 'expense',
          read: false,
        })
        // Notification for all Admin & HR members
        const adminAndHr = await Employee.find({
          status: 'active',
          role: { $in: ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'] },
        }).select('_id role').lean()
        if (adminAndHr.length > 0) {
          const notifDocs = adminAndHr.map((staff) => ({
            ownerId: String(staff._id),
            recipientRole: staff.role,
            title: 'New Expense Claim Submitted',
            message: `${actorName} submitted an expense claim of ₹${formattedAmt} (${values.category}${values.merchant ? ' · ' + values.merchant : ''}) for approval.`,
            type: 'expense',
            read: false,
          }))
          await models.notifications.insertMany(notifDocs)
        }
      } else if (resource === 'tickets') {
        // Confirmation for employee
        await models.notifications.create({
          ownerId: id(actor),
          recipientId: id(actor),
          title: 'Support Ticket Submitted',
          message: `Your ticket "${values.subject}" has been received. Our support team will assist you shortly.`,
          type: 'ticket',
          read: false,
        })
        // Notification for all Admin & HR members
        const adminAndHr = await Employee.find({
          status: 'active',
          role: { $in: ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'] },
        }).select('_id role').lean()
        if (adminAndHr.length > 0) {
          const notifDocs = adminAndHr.map((staff) => ({
            ownerId: String(staff._id),
            recipientRole: staff.role,
            title: `New Support Ticket [${values.priority || 'Medium'}]`,
            message: `${actorName} opened support ticket #${String(record._id).slice(-6).toUpperCase()}: "${values.subject}" (${values.category || 'General Support'}).`,
            type: 'ticket',
            read: false,
          }))
          await models.notifications.insertMany(notifDocs)
        }
      } else {
        const recipient = resource === 'tasks' ? values.assigneeRef : resource === 'kudos' ? values.recipientId : !managementOnly.has(resource) ? id(actor) : null
        if (recipient) await models.notifications.create({ ownerId: recipient, title: resource === 'tasks' ? 'Task assigned' : resource === 'kudos' ? 'Kudos received' : resource === 'enrollments' ? 'Training enrollment saved' : `${resource} submitted`, message: values.title ?? values.subject ?? values.message ?? `Your ${resource} record was saved.`, type: resource, read: false })
      }

      if (resource === 'announcements' || resource === 'documents' || resource === 'courses') {
        const audience = { status: 'active' }
        if (resource === 'announcements' && values.targetAudience !== 'All Employees') audience.department = values.targetAudience
        const recipients = await Employee.find(audience).select('_id').lean()
        if (recipients.length) await models.notifications.insertMany(recipients.map((person) => ({ ownerId: String(person._id), title: resource === 'announcements' ? 'Company announcement' : resource === 'courses' ? 'Training course published' : 'Document published', message: values.title, type: resource, read: false })))
      }
      res.status(201).json({ success: true, data: serialize(resource, record.toObject(), actor) })
    } catch (error) {
      if (error.code === 11000) { error.statusCode = 409; error.message = 'This enrollment or daily report already exists.' }
      next(error)
    }
  })
  router.patch('/notifications/read-all', async (req, res, next) => {
    try {
      const actorId = id(req.auth.user)
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.updateMany(targetQuery, { $set: { read: true } })
      if (mongoose.isValidObjectId(actorId)) await Notification.updateMany({ recipientId: actorId, readAt: null }, { $set: { readAt: new Date() } })
      res.json({ success: true, data: { read: true } })
    } catch (error) { next(error) }
  })
  router.delete('/notifications/clear-all', async (req, res, next) => {
    try {
      const actorId = id(req.auth.user)
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.deleteMany(targetQuery)
      if (mongoose.isValidObjectId(actorId)) await Notification.deleteMany({ recipientId: actorId })
      res.json({ success: true, data: { cleared: true } })
    } catch (error) { next(error) }
  })
  router.post('/notifications/clear-all', async (req, res, next) => {
    try {
      const actorId = id(req.auth.user)
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.deleteMany(targetQuery)
      if (mongoose.isValidObjectId(actorId)) await Notification.deleteMany({ recipientId: actorId })
      res.json({ success: true, data: { cleared: true } })
    } catch (error) { next(error) }
  })
  router.patch('/:resource/:id', async (req, res, next) => {
    try {
      const { resource, id: recordId } = req.params
      const actor = req.auth.user
      let query
      let update
      if (resource === 'roles') {
        if (!management(actor)) throw fail('HR or administrator access is required to update roles.', 403)
        allowedBody(req.body, ['name', 'description', 'badge', 'permissions'])
        update = { $set: {} }
        if (req.body.name !== undefined) update.$set.name = string(req.body, 'name', true, 100)
        if (req.body.description !== undefined) update.$set.description = string(req.body, 'description', false, 500)
        if (req.body.badge !== undefined) update.$set.badge = string(req.body, 'badge', false, 100)
        if (req.body.permissions !== undefined && Array.isArray(req.body.permissions)) update.$set.permissions = req.body.permissions
        query = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { roleId: recordId }] } : { roleId: recordId }
      } else if (resource === 'departments') {
        if (!management(actor)) throw fail('HR or administrator access is required to update departments.', 403)
        allowedBody(req.body, ['name', 'code', 'description', 'head'])
        update = { $set: {} }
        if (req.body.name !== undefined) update.$set.name = string(req.body, 'name', true, 100)
        if (req.body.code !== undefined) update.$set.code = string(req.body, 'code', false, 50)
        if (req.body.description !== undefined) update.$set.description = string(req.body, 'description', false, 500)
        if (req.body.head !== undefined) update.$set.head = string(req.body, 'head', false, 100)
        query = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { deptId: recordId }] } : { deptId: recordId }
      } else if (resource === 'notifications') {
        if (recordId === 'read-all') {
          const actorId = id(actor)
          const targetQuery = filter(actor, 'notifications')
          await models.notifications.updateMany(targetQuery, { $set: { read: true } })
          if (mongoose.isValidObjectId(actorId)) await Notification.updateMany({ recipientId: actorId, readAt: null }, { $set: { readAt: new Date() } })
          return res.json({ success: true, data: { read: true } })
        }
        allowedBody(req.body, ['read'])
        if (req.body.read !== true) throw fail('Only marking a notification read is supported.')
        if (mongoose.isValidObjectId(recordId)) {
          query = { ...filter(actor, resource), _id: recordId }
          update = { $set: { read: true } }
        } else {
          // Synthetic or client-generated ID
          return res.json({ success: true, data: { id: recordId, read: true } })
        }
      } else {
        if (!mongoose.isValidObjectId(recordId)) throw fail('Invalid record identifier.')
        query = { ...filter(actor, resource), _id: recordId }
        if (resource === 'announcements') {
          if (req.body.liked !== undefined) {
            allowedBody(req.body, ['liked'])
            if (typeof req.body.liked !== 'boolean') throw fail('liked must be a boolean.')
            if (!management(actor)) query.targetAudience = { $in: ['All Employees', actor.department].filter(Boolean) }
            update = req.body.liked ? { $addToSet: { likedBy: id(actor) } } : { $pull: { likedBy: id(actor) } }
          } else {
            if (!management(actor)) throw fail('HR or administrator access is required to update announcements.', 403)
            allowedBody(req.body, ['title', 'content', 'category', 'priority', 'targetAudience', 'pinned'])
            update = { $set: {} }
            if (req.body.title !== undefined) update.$set.title = string(req.body, 'title', true, 200)
            if (req.body.content !== undefined) update.$set.content = string(req.body, 'content', true, 10000)
            if (req.body.category !== undefined) update.$set.category = string(req.body, 'category', false, 100)
            if (req.body.priority !== undefined) update.$set.priority = choice(req.body, 'priority', ['Normal', 'High', 'Urgent'])
            if (req.body.targetAudience !== undefined) update.$set.targetAudience = string(req.body, 'targetAudience', false, 200)
            if (req.body.pinned !== undefined) {
              if (typeof req.body.pinned !== 'boolean') throw fail('pinned must be a boolean.')
              update.$set.pinned = req.body.pinned
            }
          }
        } else if (resource === 'tasks' || resource === 'tickets') {
          allowedBody(req.body, resource === 'tickets' ? ['status', 'response'] : ['status'])
          if (resource === 'tickets' && req.body.response !== undefined) {
            if (req.body.status !== undefined) throw fail('Send a reply or change status separately.')
            update = { $push: { responses: { sender: actor.name ?? actor.displayName, text: string(req.body, 'response'), time: new Date() } } }
          } else {
            if (resource === 'tickets' && !management(actor)) throw fail('HR or administrator access is required to resolve tickets.', 403)
            update = { $set: { status: choice(req.body, 'status', resource === 'tasks' ? ['todo', 'in_progress', 'completed'] : ['open', 'in_progress', 'resolved', 'closed']) } }
          }
        } else if (resource === 'expenses') {
          if (!management(actor)) throw fail('HR or administrator access is required to review expenses.', 403)
          allowedBody(req.body, ['status', 'rejectionReason'])
          const status = choice(req.body, 'status', ['approved', 'rejected'])
          query.status = 'submitted'
          update = { $set: { status, reviewerId: id(actor), rejectionReason: string(req.body, 'rejectionReason', status === 'rejected') } }
        } else if (resource === 'enrollments') {
          allowedBody(req.body, ['progress'])
          query.ownerId = id(actor)
          const progress = number(req.body, 'progress', 0, 100, true)
          update = { $set: { progress, completedAt: progress === 100 ? new Date() : null } }
        } else if (resource === 'performanceGoals') {
          if (!management(actor)) throw fail('HR or administrator access is required to update goals.', 403)
          allowedBody(req.body, ['progress'])
          update = { $set: { progress: number(req.body, 'progress', 0, 100, true) } }
        } else throw fail('This resource does not support this update.', 405)
      }
      let record = await models[resource].findOneAndUpdate(query, update, { returnDocument: 'after', runValidators: true }).lean()
      if (!record && resource === 'roles') {
        const roleName = req.body.name || (recordId.charAt(0).toUpperCase() + recordId.slice(1))
        const createdRole = await models.roles.create({
          ownerId: id(actor),
          roleId: recordId,
          name: roleName,
          description: req.body.description || 'Custom/System role permissions',
          badge: req.body.badge || (['admin', 'hr', 'manager', 'employee'].includes(recordId) ? 'System Role' : 'Custom Role'),
          isSystem: ['admin', 'hr', 'manager', 'employee'].includes(recordId),
          permissions: Array.isArray(req.body.permissions) ? req.body.permissions : ['dashboard.read'],
        })
        record = createdRole.toObject()
      }
      if (!record && resource === 'departments') {
        const createdDept = await models.departments.create({
          ownerId: id(actor),
          deptId: recordId,
          name: req.body.name || recordId,
          code: req.body.code || recordId.slice(0, 4).toUpperCase(),
          description: req.body.description || '',
          head: req.body.head || 'Unassigned',
        })
        record = createdDept.toObject()
      }
      if (!record && resource === 'notifications' && mongoose.isValidObjectId(id(actor))) {
        const leave = await Notification.findOneAndUpdate({ _id: recordId, recipientId: id(actor) }, { $set: { readAt: new Date() } }, { returnDocument: 'after' }).lean()
        if (leave) record = { ...leave, read: true }
      }
      if (!record) throw fail('Record not found or action not allowed.', 404)
      if (resource === 'expenses') {
        const formattedAmt = Number(record.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
        const isApproved = record.status === 'approved'
        await models.notifications.create({
          ownerId: record.ownerId,
          recipientId: record.ownerId,
          title: isApproved ? 'Expense Claim Approved' : 'Expense Claim Rejected',
          message: isApproved
            ? `Your expense claim of ₹${formattedAmt} was approved by ${actor.name || actor.displayName || 'HR/Admin'}.`
            : `Your expense claim of ₹${formattedAmt} was rejected.${record.rejectionReason ? ' Reason: ' + record.rejectionReason : ''}`,
          type: 'expense',
          read: false,
        })
      } else if (resource === 'tickets') {
        if (req.body.response !== undefined) {
          if (!management(actor)) {
            // Employee replied -> notify all active Admin & HR users
            const adminAndHr = await Employee.find({
              status: 'active',
              role: { $in: ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'] },
            }).select('_id role').lean()
            if (adminAndHr.length > 0) {
              const notifDocs = adminAndHr.map((staff) => ({
                ownerId: String(staff._id),
                recipientRole: staff.role,
                title: `New Reply on Ticket: ${record.subject}`,
                message: `${actor.name || actor.displayName || 'Employee'} replied to support ticket "${record.subject}".`,
                type: 'ticket',
                read: false,
              }))
              await models.notifications.insertMany(notifDocs)
            }
          } else {
            // Management replied -> notify employee
            await models.notifications.create({
              ownerId: record.ownerId,
              recipientId: record.ownerId,
              title: `Support Reply: ${record.subject}`,
              message: `${actor.name || actor.displayName || 'Support Team'} replied to your ticket "${record.subject}".`,
              type: 'ticket',
              read: false,
            })
          }
        } else if (req.body.status !== undefined) {
          // Status updated -> notify employee
          await models.notifications.create({
            ownerId: record.ownerId,
            recipientId: record.ownerId,
            title: `Ticket Status Updated: ${record.status}`,
            message: `Your support ticket "${record.subject}" is now marked as ${record.status}.`,
            type: 'ticket',
            read: false,
          })
        }
      }
      if (resource === 'enrollments') await models.notifications.create({ ownerId: record.ownerId, title: 'Training progress saved', message: `Your self-reported course progress is ${record.progress}%.`, type: 'training', read: false })
      res.json({ success: true, data: serialize(resource, record, actor) })
    } catch (error) { next(error) }
  })
  router.delete('/:resource/:id', async (req, res, next) => {
    try {
      const { resource, id: recordId } = req.params
      if (resource === 'notifications') {
        const actorId = id(req.auth.user)
        if (recordId === 'clear-all') {
          const targetQuery = filter(req.auth.user, 'notifications')
          await models.notifications.deleteMany(targetQuery)
          if (mongoose.isValidObjectId(actorId)) await Notification.deleteMany({ recipientId: actorId })
          return res.json({ success: true, data: { cleared: true } })
        }
        let deleted = false
        if (mongoose.isValidObjectId(recordId)) {
          const r1 = await models.notifications.deleteOne({ _id: recordId, ...(management(req.auth.user) ? {} : { ownerId: actorId }) })
          const r2 = await Notification.deleteOne({ _id: recordId, ...(management(req.auth.user) ? {} : { recipientId: actorId }) })
          deleted = Boolean(r1.deletedCount || r2.deletedCount)
        } else {
          try {
            const r1 = await models.notifications.deleteOne({ entityId: recordId, ...(management(req.auth.user) ? {} : { ownerId: actorId }) })
            deleted = Boolean(r1.deletedCount)
          } catch {
            deleted = true
          }
        }
        return res.json({ success: true, data: { id: recordId, deleted } })
      }
      if (resource === 'expenses') {
        if (req.auth.user.role !== 'admin') {
          throw fail('Only administrators have access to delete expense claims.', 403)
        }
        const query = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { id: recordId }] } : { id: recordId }
        const result = await models.expenses.deleteOne(query)
        if (!result.deletedCount) throw fail('Expense claim record not found.', 404)
        return res.json({ success: true, data: { id: recordId } })
      }
      if (resource === 'dailyReports') {
        const actorId = id(req.auth.user)
        const isMgmt = management(req.auth.user)
        const query = {
          ...(mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { id: recordId }] } : { id: recordId }),
          ...(isMgmt ? {} : { ownerId: actorId }),
        }
        const result = await models.dailyReports.deleteOne(query)
        if (!result.deletedCount) throw fail('Record not found or deletion not permitted.', 404)
        return res.json({ success: true, data: { id: recordId } })
      }
      if (!management(req.auth.user) || !['announcements', 'courses', 'holidays', 'documents', 'requisitions', 'roles', 'departments'].includes(resource)) throw fail('Deletion is not permitted.', 403)
      let deleteQuery
      if (resource === 'roles') {
        deleteQuery = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { roleId: recordId }] } : { roleId: recordId }
      } else if (resource === 'departments') {
        deleteQuery = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { deptId: recordId }] } : { deptId: recordId }
      } else {
        if (!mongoose.isValidObjectId(recordId)) throw fail('Invalid record identifier.')
        deleteQuery = { _id: recordId }
      }
      const result = await models[resource].deleteOne(deleteQuery)
      if (!result.deletedCount) throw fail('Record not found.', 404)
      if (resource === 'courses') await models.enrollments.deleteMany({ courseId: recordId })
      res.json({ success: true, data: { id: recordId } })
    } catch (error) { next(error) }
  })
  return router
}
