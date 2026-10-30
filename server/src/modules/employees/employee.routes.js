import express from 'express'
import mongoose from 'mongoose'
import { PERMISSIONS, hasPermission } from '../../auth/permissions.js'
import { Employee } from '../../models/Employee.js'
import { toPublicEmployee } from './employee.repository.js'

function parseListQuery(query) {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search,
    department: query.department,
    designation: query.designation,
    status: query.status,
    managerId: query.managerId,
    sort: query.sort,
    direction: query.direction,
  }
}

export function createEmployeeRouter({ auth, service, userStore, employeeRepository }) {
  const router = express.Router()
  // Shared short-TTL cache of list results (same for every HR/Admin); any write clears it.
  const listCache = new Map()
  const LIST_TTL_MS = 8000
  router.use((request, response, next) => {
    if (request.method !== 'GET') {
      response.once('finish', () => {
        listCache.clear()
        service?.repository?.clearCache?.()
        employeeRepository?.clearCache?.()
      })
    }
    next()
  })
  function cachedList(query) {
    const key = JSON.stringify(query)
    const hit = listCache.get(key)
    if (hit && hit.expires > Date.now()) return hit.promise
    const promise = service.list(query)
    listCache.set(key, { promise, expires: Date.now() + LIST_TTL_MS })
    promise.catch(() => listCache.delete(key))
    if (listCache.size > 200) listCache.clear()
    return promise
  }
  router.get('/me/onboarding', auth.authenticate, async (request, response, next) => {
    try {
      const employee = (await service.get(request.auth.user.id)) || (await service.get(request.auth.user.employeeId))
      return response.json({
        success: true,
        data: {
          identity: employee?.identity || {},
          parentsContact: employee?.parentsContact || {},
          emergencyContact: employee?.emergencyContact || {},
          bankDetails: employee?.bankDetails || {},
          onboardingDocs: employee?.onboardingDocs || {},
          avatarUrl: employee?.avatarUrl || null,
        },
      })
    } catch (error) { return next(error) }
  })

  router.post('/me/request-revision', auth.authenticate, async (request, response, next) => {
    try {
      const targetId = request.auth.user.id || request.auth.user._id
      const currentEmployee = (await service.get(targetId).catch(() => null)) ||
        (request.auth.user.employeeId ? await service.get(request.auth.user.employeeId).catch(() => null) : null)
      const empId = currentEmployee?.id || currentEmployee?._id || targetId
      const result = await service.requestRevision(empId, request.body?.reason, request.auth.user)
      return response.json({ success: true, data: result })
    } catch (error) { return next(error) }
  })

  router.patch('/me/onboarding', auth.authenticate, async (request, response, next) => {
    try {
      const targetId = request.auth.user.id || request.auth.user._id
      const currentEmployee = (await service.get(targetId).catch(() => null)) ||
        (request.auth.user.employeeId ? await service.get(request.auth.user.employeeId).catch(() => null) : null)
      const payload = {}
      const allowed = ['identity', 'parentsContact', 'emergencyContact', 'bankDetails', 'onboardingDocs', 'phone', 'financeDetails', 'complianceDocs', 'policyConsents', 'avatarUrl']
      for (const key of allowed) {
        if (request.body && request.body[key] !== undefined) payload[key] = request.body[key]
      }
      // If passportPhoto is uploaded, sync to avatarUrl automatically
      if (!payload.avatarUrl && payload.onboardingDocs?.passportPhoto?.url) {
        payload.avatarUrl = payload.onboardingDocs.passportPhoto.url
      }
      // Force status to submitted on self-update, never verified or action_required
      payload.onboardingStatus = 'submitted'
      payload.onboardingSubmittedAt = new Date()

      // Sanitize documents so an employee cannot self-verify documents
      if (payload.onboardingDocs && typeof payload.onboardingDocs === 'object') {
        const existingDocs = currentEmployee?.onboardingDocs || {}
        const sanitized = { ...existingDocs }
        for (const [k, doc] of Object.entries(payload.onboardingDocs)) {
          if (doc && typeof doc === 'object') {
            sanitized[k] = {
              ...doc,
              status: doc.status === 'verified' ? 'submitted' : (doc.status || 'submitted'),
              verifiedAt: null,
              verifiedBy: null,
            }
          }
        }
        payload.onboardingDocs = sanitized
      }

      const empId = currentEmployee?.id || currentEmployee?._id || request.auth.user.employeeId || targetId
      const updated = await service.update(empId, payload, request.auth.user)
      return response.json({ success: true, data: updated })
    } catch (error) { return next(error) }
  })

  router.patch('/me/avatar', auth.authenticate, async (request, response, next) => {
    try {
      const { avatarUrl } = request.body ?? {}
      if (typeof avatarUrl !== 'string' || !avatarUrl.trim()) {
        return response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid avatarUrl string is required.' } })
      }
      if (avatarUrl.length > 2 * 1024 * 1024) {
        return response.status(400).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Image size is too large (exceeds 2MB limit). Please select an image under 2MB.'
          }
        })
      }
      const user = request.auth.user
      const cleanAvatar = avatarUrl.trim()

      const query = []
      if (user.id && mongoose.isValidObjectId(user.id)) query.push({ _id: user.id })
      if (user._id && mongoose.isValidObjectId(user._id)) query.push({ _id: user._id })
      if (user.employeeId) query.push({ employeeId: String(user.employeeId).toUpperCase() })
      if (user.email) query.push({ email: String(user.email).toLowerCase() })

      const filter = query.length === 1 ? query[0] : { $or: query }

      let updatedEmployee = null
      if (mongoose.connection.readyState === 1) {
        updatedEmployee = await Employee.findOneAndUpdate(
          filter,
          { $set: { avatarUrl: cleanAvatar } },
          { returnDocument: 'after', lean: true }
        )
      } else {
        const empId = user.id || user._id || user.employeeId
        updatedEmployee = await service.update(empId, { avatarUrl: cleanAvatar }, request.auth.user)
      }

      if (!updatedEmployee) {
        return response.status(404).json({ success: false, error: { code: 'EMPLOYEE_NOT_FOUND', message: 'Employee record not found.' } })
      }

      // Invalidate memory caches across auth, userStore, and employee repository
      const finalId = updatedEmployee._id || updatedEmployee.id || user.id || user._id
      auth.clearUserCache?.(finalId)
      auth.clearUserCache?.(user.id || user._id)
      userStore?.clearUserCache?.(finalId)
      userStore?.clearUserCache?.(user.email)
      userStore?.clearUserCache?.(updatedEmployee.email)
      userStore?.clearUserCache?.(updatedEmployee.employeeId)
      listCache.clear()
      service?.repository?.clearCache?.()
      employeeRepository?.clearCache?.()

      const publicEmp = toPublicEmployee ? toPublicEmployee(updatedEmployee) : updatedEmployee
      return response.json({ success: true, data: publicEmp })
    } catch (error) { return next(error) }
  })

  router.get('/', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_READ), async (request, response, next) => {
    try { const result = await cachedList(parseListQuery(request.query)); return response.json({ success: true, data: result.records, meta: result.meta }) } catch (error) { return next(error) }
  })
  router.post('/', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try { const employee = await service.create(request.body ?? {}, request.auth.user); return response.status(201).json({ success: true, data: employee }) } catch (error) { return next(error) }
  })
  async function checkIsSelf(user, targetIdentifier) {
    if (!user) return false
    const idStr = String(targetIdentifier)
    if (idStr === String(user.id) || idStr === String(user._id) || idStr === String(user.employeeId)) return true
    try {
      const targetEmp = await service.get(targetIdentifier).catch(() => null)
      if (targetEmp) {
        if (user.employeeId && targetEmp.employeeId && String(user.employeeId).toUpperCase() === String(targetEmp.employeeId).toUpperCase()) return true
        if (user.email && targetEmp.email && String(user.email).toLowerCase() === String(targetEmp.email).toLowerCase()) return true
        if (String(targetEmp.id || targetEmp._id) === String(user.id || user._id)) return true
      }
    } catch {}
    return false
  }

  router.get('/:id/audit', auth.authenticate, async (request, response, next) => {
    try {
      const isSelf = await checkIsSelf(request.auth.user, request.params.id)
      if (!isSelf && !hasPermission(request.auth.user, PERMISSIONS.EMPLOYEES_READ)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to view audit history.' } })
      }
      return response.json({ success: true, data: await service.audit(request.params.id) })
    } catch (error) { return next(error) }
  })
  router.get('/:id', auth.authenticate, async (request, response, next) => {
    try {
      const isSelf = await checkIsSelf(request.auth.user, request.params.id)
      if (!isSelf && !hasPermission(request.auth.user, PERMISSIONS.EMPLOYEES_READ)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to view this employee.' } })
      }
      return response.json({ success: true, data: await service.get(request.params.id) })
    } catch (error) { return next(error) }
  })
  router.patch('/:id', auth.authenticate, async (request, response, next) => {
    try {
      const isSelf = await checkIsSelf(request.auth.user, request.params.id)
      if (!isSelf && !hasPermission(request.auth.user, PERMISSIONS.EMPLOYEES_WRITE)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to update this employee.' } })
      }
      let updateBody = request.body ?? {}
      if (isSelf && !hasPermission(request.auth.user, PERMISSIONS.EMPLOYEES_WRITE)) {
        const allowedSelfFields = ['identity', 'parentsContact', 'emergencyContact', 'bankDetails', 'onboardingDocs', 'phone', 'financeDetails', 'complianceDocs', 'policyConsents', 'avatarUrl']
        updateBody = Object.fromEntries(Object.entries(updateBody).filter(([key]) => allowedSelfFields.includes(key)))
        if (request.body?.onboardingStatus) {
          updateBody.onboardingStatus = 'submitted'
          updateBody.onboardingSubmittedAt = new Date()
        }
        if (updateBody.onboardingDocs && typeof updateBody.onboardingDocs === 'object') {
          const sanitizedDocs = {}
          for (const [k, doc] of Object.entries(updateBody.onboardingDocs)) {
            if (doc && typeof doc === 'object') {
              sanitizedDocs[k] = {
                ...doc,
                status: 'submitted',
                verifiedAt: null,
                verifiedBy: null,
              }
            }
          }
          updateBody.onboardingDocs = sanitizedDocs
        }
      }
      const updated = await service.update(request.params.id, updateBody, request.auth.user)
      auth.clearUserCache?.(request.params.id)
      auth.clearUserCache?.(updated?.id || updated?._id)
      userStore?.clearUserCache?.(request.params.id)
      userStore?.clearUserCache?.(updated?.email)
      userStore?.clearUserCache?.(updated?.employeeId)
      employeeRepository?.clearCache?.()
      return response.json({ success: true, data: updated })
    } catch (error) { return next(error) }
  })
  router.post('/:id/invite', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try { return response.json({ success: true, data: await service.setStatus(request.params.id, 'invited', request.auth.user) }) } catch (error) { return next(error) }
  })
  router.post('/:id/activate', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try { return response.json({ success: true, data: await service.setStatus(request.params.id, 'active', request.auth.user) }) } catch (error) { return next(error) }
  })
  router.post('/:id/documents/:docKey/approve', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.approveDocument(request.params.id, request.params.docKey, request.auth.user, request.body) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/documents/:docKey/reject', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.rejectDocument(request.params.id, request.params.docKey, request.body?.reason, request.auth.user, request.body) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/documents/:docKey/upload', auth.authenticate, async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.uploadDocument(request.params.id, request.params.docKey, request.body, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/onboarding/approve', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.approveOnboarding(request.params.id, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/onboarding/reject', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.rejectOnboarding(request.params.id, request.body?.reason, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/exit/initiate', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.initiateExit(request.params.id, request.body ?? {}, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/exit/cancel', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.cancelExit(request.params.id, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/exit/finalize', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.finalizeExit(request.params.id, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/offboarding/checklist/:key/toggle', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      return response.json({ success: true, data: await service.toggleOffboardingItem(request.params.id, request.params.key, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/deactivate', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try { return response.json({ success: true, data: await service.setStatus(request.params.id, 'inactive', request.auth.user) }) } catch (error) { return next(error) }
  })
  router.delete('/:id', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      if (!['admin', 'hr'].includes(request.auth.user.role)) return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only an administrator or HR can permanently delete an employee.' } })
      return response.json({ success: true, data: await service.remove(request.params.id, request.auth.user) })
    } catch (error) { return next(error) }
  })
  return router
}
