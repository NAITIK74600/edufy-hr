import express from 'express'
import { PERMISSIONS } from '../../auth/permissions.js'
import { Employee } from '../../models/Employee.js'
import { LeaveBalance } from '../../models/LeaveBalance.js'
import mongoose from 'mongoose'
import { ensureConnected } from './leave.repository.js'

function listFilters(query = {}) {
  return {
    status: typeof query.status === 'string' ? query.status.trim() : undefined,
    leaveType: typeof query.leaveType === 'string' ? query.leaveType.trim() : undefined,
    from: typeof query.from === 'string' ? query.from.trim() : undefined,
    to: typeof query.to === 'string' ? query.to.trim() : undefined,
  }
}

export function createLeaveRouter({ auth, service }) {
  const router = express.Router()
  const protectedRoute = (permission) => [auth.authenticate, auth.requirePermission(permission)]

  router.post('/hr/grant', ...protectedRoute(PERMISSIONS.LEAVE_HR_REVIEW), async (request, response, next) => {
    try { return response.status(201).json({ success: true, data: await service.grant(request.body ?? {}, request.auth.user) }) } catch (error) { return next(error) }
  })
  router.put('/hr/balances/:employeeId/:leaveType', ...protectedRoute(PERMISSIONS.LEAVE_POLICY_ADMIN), async (request, response, next) => {
    try {
      ensureConnected()
      const allowance = request.body?.allowance
      if (!Number.isFinite(allowance) || allowance < 0 || !/^[a-z_]+$/.test(request.params.leaveType)) {
        throw Object.assign(new Error('Enter a valid leave type and non-negative allowance.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
      }
      let emp = null
      const targetParam = String(request.params.employeeId || '').trim()
      if (mongoose.isValidObjectId(targetParam)) {
        emp = await Employee.findById(targetParam).lean()
      }
      if (!emp && targetParam) {
        const upper = targetParam.toUpperCase()
        const strippedNum = targetParam.replace(/^[^0-9]*/, '')
        const queryOr = [
          { employeeId: upper },
          { employeeId: targetParam },
          { username: targetParam.toLowerCase() },
          { email: targetParam.toLowerCase() }
        ]
        if (strippedNum) {
          queryOr.push({ employeeId: new RegExp(strippedNum, 'i') })
        }
        emp = await Employee.findOne({ $or: queryOr }).lean()
      }
      if (!emp) throw Object.assign(new Error('Employee "' + targetParam + '" not found.'), { statusCode: 404, code: 'EMPLOYEE_NOT_FOUND' })
      const empObjectId = emp._id

      const current = await LeaveBalance.findOne({ employeeId: empObjectId, leaveType: request.params.leaveType }).lean()
      if (allowance < (current?.used ?? 0) + (current?.reserved ?? 0)) throw Object.assign(new Error('Allowance cannot be below used and reserved leave.'), { statusCode: 409, code: 'INVALID_ALLOWANCE' })
      const data = current ? await LeaveBalance.findOneAndUpdate(
        { _id: current._id, $expr: { $lte: [{ $add: ['$used', '$reserved'] }, allowance] } },
        { $set: { allowance } }, { new: true, returnDocument: 'after', runValidators: true },
      ).lean() : (await LeaveBalance.create({ employeeId: empObjectId, leaveType: request.params.leaveType, allowance })).toObject()
      if (!data) throw Object.assign(new Error('Leave balance changed; refresh and retry.'), { statusCode: 409, code: 'INVALID_ALLOWANCE' })
      return response.json({ success: true, data })
    } catch (error) { if (error.code === 11000) { error.statusCode = 409; error.message = 'Leave balance changed; refresh and retry.' } return next(error) }
  })

  router.post('/hr/balances/bulk-apply', ...protectedRoute(PERMISSIONS.LEAVE_POLICY_ADMIN), async (request, response, next) => {
    try {
      ensureConnected()
      const { defaults = {}, employeeIds } = request.body || {}
      const types = ['casual', 'sick', 'earned', 'comp_off', 'maternity', 'lop']

      const query = { status: { $ne: 'terminated' } }
      if (Array.isArray(employeeIds) && employeeIds.length > 0) {
        query._id = { $in: employeeIds.map((id) => (mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id)) }
      }
      const employees = await Employee.find(query).select('_id name employeeId').lean()
      if (!employees.length) {
        return response.json({ success: true, message: 'No employees found to update.', data: { updatedCount: 0 } })
      }

      const currentMonthKey = new Date().toISOString().slice(0, 7)
      const ops = []
      for (const emp of employees) {
        for (const t of types) {
          const allowanceVal = Number(defaults[t] ?? 0)
          if (Number.isFinite(allowanceVal) && allowanceVal >= 0) {
            ops.push({
              updateOne: {
                filter: { employeeId: emp._id, leaveType: t },
                update: {
                  $set: { allowance: allowanceVal, month: currentMonthKey, updatedAt: new Date() },
                  $setOnInsert: { used: 0, reserved: 0, createdAt: new Date() },
                },
                upsert: true,
              },
            })
          }
        }
      }

      if (ops.length > 0) {
        await LeaveBalance.bulkWrite(ops, { ordered: false })
      }

      return response.json({
        success: true,
        message: `Successfully applied default quotas to ${employees.length} employees!`,
        data: { updatedCount: employees.length },
      })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/hr/balances/auto-fill-policies', ...protectedRoute(PERMISSIONS.LEAVE_POLICY_ADMIN), async (request, response, next) => {
    try {
      ensureConnected()
      const currentMonthKey = new Date().toISOString().slice(0, 7)
      const employees = await Employee.find({ status: { $ne: 'terminated' } }).lean()
      let updatedCount = 0
      for (const emp of employees) {
        const empType = String(emp.employmentType || '').toLowerCase().replace(/[-\s]/g, '_')
        const isIntern = empType === 'intern' || String(emp.designation || '').toLowerCase().includes('intern') || String(emp.role || '').toLowerCase().includes('intern')
        
        const casualQuota = isIntern ? 0 : 1
        const sickQuota = 1

        // Upsert casual
        await LeaveBalance.updateOne(
          { employeeId: emp._id, leaveType: 'casual' },
          { $set: { allowance: casualQuota, month: currentMonthKey, updatedAt: new Date() }, $setOnInsert: { used: 0, reserved: 0 } },
          { upsert: true }
        )
        // Upsert sick
        await LeaveBalance.updateOne(
          { employeeId: emp._id, leaveType: 'sick' },
          { $set: { allowance: sickQuota, month: currentMonthKey, updatedAt: new Date() }, $setOnInsert: { used: 0, reserved: 0 } },
          { upsert: true }
        )
        updatedCount++
      }
      return response.json({
        success: true,
        message: `Successfully applied company leave policy to ${updatedCount} employees. Full-Time: 2 days (1 CL + 1 SL) | Interns: 1 day (1 SL).`,
        data: { updatedCount }
      })
    } catch (error) {
      return next(error)
    }
  })

  router.get('/self', ...protectedRoute(PERMISSIONS.LEAVE_SELF_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.listSelf(request.auth.user, listFilters(request.query)) }) } catch (error) { return next(error) } })
  router.post('/requests', ...protectedRoute(PERMISSIONS.LEAVE_SELF_WRITE), async (request, response, next) => { try { return response.status(201).json({ success: true, data: await service.submit(request.body ?? {}, request.auth.user) }) } catch (error) { return next(error) } })
  router.get('/requests/:id', auth.authenticate, async (request, response, next) => { try { const scope = request.query.scope === 'hr' ? 'hr' : request.query.scope === 'team' ? 'team' : 'self'; return response.json({ success: true, data: await service.detail(request.params.id, request.auth.user, scope) }) } catch (error) { return next(error) } })
  router.post('/requests/:id/comments', auth.authenticate, async (request, response, next) => { try { const scope = request.body.scope === 'hr' ? 'hr' : request.body.scope === 'team' ? 'team' : 'self'; return response.status(201).json({ success: true, data: await service.comment(request.params.id, request.body ?? {}, request.auth.user, scope) }) } catch (error) { return next(error) } })
  router.post('/requests/:id/cancel', ...protectedRoute(PERMISSIONS.LEAVE_SELF_WRITE), async (request, response, next) => { try { return response.json({ success: true, data: await service.cancel(request.params.id, request.auth.user) }) } catch (error) { return next(error) } })
  router.post('/requests/:id/amend', ...protectedRoute(PERMISSIONS.LEAVE_SELF_WRITE), async (request, response, next) => { try { return response.json({ success: true, data: await service.amend(request.params.id, request.body ?? {}, request.auth.user) }) } catch (error) { return next(error) } })

  router.get('/team', ...protectedRoute(PERMISSIONS.LEAVE_TEAM_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.listTeam(request.auth.user, listFilters(request.query)) }) } catch (error) { return next(error) } })
  router.get('/team/calendar', ...protectedRoute(PERMISSIONS.LEAVE_TEAM_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.calendar(request.auth.user, { ...listFilters(request.query), scope: 'team' }) }) } catch (error) { return next(error) } })
  router.post('/team/:id/approve', ...protectedRoute(PERMISSIONS.LEAVE_TEAM_APPROVE), async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'approve', request.body ?? {}, request.auth.user, 'team') }) } catch (error) { return next(error) } })
  router.post('/team/:id/reject', ...protectedRoute(PERMISSIONS.LEAVE_TEAM_APPROVE), async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'reject', request.body ?? {}, request.auth.user, 'team') }) } catch (error) { return next(error) } })

  router.get('/hr/requests', ...protectedRoute(PERMISSIONS.LEAVE_HR_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.listHr(request.auth.user, listFilters(request.query)) }) } catch (error) { return next(error) } })
  router.get('/hr/calendar', ...protectedRoute(PERMISSIONS.LEAVE_HR_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.calendar(request.auth.user, { ...listFilters(request.query), scope: 'hr' }) }) } catch (error) { return next(error) } })
  router.get('/hr/balances', ...protectedRoute(PERMISSIONS.LEAVE_HR_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.balances(request.auth.user, { employeeId: request.query.employeeId, leaveType: request.query.leaveType }) }) } catch (error) { return next(error) } })
  router.post('/hr/:id/approve', ...protectedRoute(PERMISSIONS.LEAVE_HR_REVIEW), async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'approve', request.body ?? {}, request.auth.user, 'hr') }) } catch (error) { return next(error) } })
  router.post('/hr/:id/reject', ...protectedRoute(PERMISSIONS.LEAVE_HR_REVIEW), async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'reject', request.body ?? {}, request.auth.user, 'hr') }) } catch (error) { return next(error) } })
  router.post('/admin/:id/approve', ...protectedRoute(PERMISSIONS.ADMIN_ACCESS), async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'approve', request.body ?? {}, request.auth.user, 'hr') }) } catch (error) { return next(error) } })
  router.post('/admin/:id/reject', ...protectedRoute(PERMISSIONS.ADMIN_ACCESS), async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'reject', request.body ?? {}, request.auth.user, 'hr') }) } catch (error) { return next(error) } })
  router.get('/policies', ...protectedRoute(PERMISSIONS.LEAVE_POLICY_ADMIN), async (request, response, next) => { try { return response.json({ success: true, data: await service.policies(request.auth.user) }) } catch (error) { return next(error) } })
  router.put('/policies/:leaveType', ...protectedRoute(PERMISSIONS.LEAVE_POLICY_ADMIN), async (request, response, next) => { try { return response.json({ success: true, data: await service.savePolicy(request.params.leaveType, request.body ?? {}, request.auth.user) }) } catch (error) { return next(error) } })
  router.get('/balances', ...protectedRoute(PERMISSIONS.LEAVE_SELF_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.balances(request.auth.user, { leaveType: request.query.leaveType }) }) } catch (error) { return next(error) } })
  router.delete('/requests/:id', ...protectedRoute(PERMISSIONS.LEAVE_HR_REVIEW), async (request, response, next) => { try { return response.json({ success: true, data: await service.delete(request.params.id, request.auth.user) }) } catch (error) { return next(error) } })
  router.delete('/:id', ...protectedRoute(PERMISSIONS.LEAVE_HR_REVIEW), async (request, response, next) => { try { return response.json({ success: true, data: await service.delete(request.params.id, request.auth.user) }) } catch (error) { return next(error) } })

  return router
}
