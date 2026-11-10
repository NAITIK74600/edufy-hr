import express from 'express'
import mongoose from 'mongoose'
import { PERMISSIONS, hasPermission } from '../../auth/permissions.js'
import { Employee } from '../../models/Employee.js'
import { toPublicEmployee, sanitizeEmployeeForViewer } from './employee.repository.js'

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
          complianceDocs: employee?.complianceDocs || employee?.onboardingDocs?.complianceDocs || {},
          policyConsents: employee?.policyConsents || employee?.onboardingDocs?.policyConsents || {},
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
      const allowed = ['identity', 'parentsContact', 'emergencyContact', 'bankDetails', 'onboardingDocs', 'phone', 'financeDetails', 'complianceDocs', 'policyConsents', 'avatarUrl', 'dob']
      for (const key of allowed) {
        if (request.body && request.body[key] !== undefined) payload[key] = request.body[key]
      }
      if (payload.emergencyContact) {
        if (typeof payload.emergencyContact !== 'object' || payload.emergencyContact === null) {
          payload.emergencyContact = {}
        }
        const ecPhone = String(payload.emergencyContact.phone || '').replace(/[^0-9+\s\-()]/g, '').trim()
        payload.emergencyContact = {
          name: String(payload.emergencyContact.name || '').trim(),
          relationship: String(payload.emergencyContact.relationship || '').trim(),
          phone: /\d/.test(ecPhone) ? ecPhone : '',
        }
      }
      if (payload.parentsContact) {
        if (typeof payload.parentsContact !== 'object' || payload.parentsContact === null) {
          payload.parentsContact = {}
        }
        const pPhone = String(payload.parentsContact.parentPhone || payload.parentsContact.phone || '').replace(/[^0-9+\s\-()]/g, '').trim()
        const validPhone = /\d/.test(pPhone) ? pPhone : ''
        payload.parentsContact = {
          fatherName: String(payload.parentsContact.fatherName || '').trim(),
          motherName: String(payload.parentsContact.motherName || '').trim(),
          parentPhone: validPhone,
          phone: validPhone,
          address: String(payload.parentsContact.address || '').trim(),
        }
      }
      if (payload.identity && typeof payload.identity === 'object' && payload.identity.dob && !payload.dob) {
        payload.dob = payload.identity.dob
      }
      if (payload.dob) {
        if (!payload.identity || typeof payload.identity !== 'object') payload.identity = {}
        payload.identity.dob = payload.dob
      }
      // If passportPhoto is uploaded, sync to avatarUrl automatically
      if (!payload.avatarUrl && payload.onboardingDocs?.passportPhoto?.url) {
        payload.avatarUrl = payload.onboardingDocs.passportPhoto.url
      }
      // Only force status to submitted on self-update if onboarding docs/profile data is being submitted
      if (payload.onboardingDocs && !payload.onboardingStatus) {
        payload.onboardingStatus = 'submitted'
        payload.onboardingSubmittedAt = new Date()
      }

      // Sanitize documents so an employee cannot self-verify documents and enforce locking
      if (payload.onboardingDocs && typeof payload.onboardingDocs === 'object') {
        const existingDocs = currentEmployee?.onboardingDocs || {}
        const sanitized = { ...existingDocs }
        for (const [k, doc] of Object.entries(payload.onboardingDocs)) {
          if (!doc || typeof doc !== 'object') continue
          const prev = existingDocs[k]
          const prevHasFile = Boolean(prev && (prev.url || prev.fileName || (Array.isArray(prev.files) && prev.files.length > 0)))
          const isReuploadAllowed = Boolean(
            currentEmployee?.onboardingStatus === 'revision_requested' ||
            currentEmployee?.onboardingStatus === 'action_required' ||
            currentEmployee?.onboardingStatus === 'draft' ||
            currentEmployee?.onboardingStatus === 'incomplete' ||
            !currentEmployee?.onboardingStatus ||
            prev?.reuploadRequested === true ||
            prev?.status === 'reupload_requested' ||
            prev?.status === 'rejected' ||
            prev?.status === 'draft'
          )
          const isReplacingFile = Boolean(
            prevHasFile &&
            ((doc.url && doc.url !== prev.url) || (doc.fileName && doc.fileName !== prev.fileName))
          )

          if (isReplacingFile && !isReuploadAllowed) {
            return response.status(403).json({
              success: false,
              error: {
                code: 'FORBIDDEN_DOCUMENT_LOCKED',
                message: `Document "${k}" is submitted and locked. You cannot replace it unless HR explicitly requests a re-upload.`
              }
            })
          }

          if (isReplacingFile && isReuploadAllowed) {
            const currentVer = Number(prev?.version || 1)
            const hist = Array.isArray(prev?.history) ? [...prev.history] : []
            hist.push({
              version: currentVer,
              fileName: prev.fileName,
              url: prev.url,
              size: prev.size,
              files: prev.files,
              uploadedAt: prev.uploadedAt,
              submittedAt: prev.submittedAt,
              status: prev.status,
              rejectionReason: prev.rejectionReason,
              reuploadRemarks: prev.reuploadRemarks,
              verifiedAt: prev.verifiedAt,
              verifiedBy: prev.verifiedBy,
              archivedAt: new Date().toISOString(),
            })
            sanitized[k] = {
              ...doc,
              version: currentVer + 1,
              status: 'submitted',
              reuploadRequested: false,
              reuploadRequestedAt: null,
              reuploadRequestedBy: null,
              reuploadRemarks: null,
              rejectionReason: null,
              submittedAt: new Date().toISOString(),
              history: hist,
              verifiedAt: null,
              verifiedBy: null,
            }
          } else if (!prevHasFile && (doc.url || doc.fileName)) {
            sanitized[k] = {
              ...doc,
              version: 1,
              status: 'submitted',
              reuploadRequested: false,
              reuploadRemarks: null,
              rejectionReason: null,
              submittedAt: new Date().toISOString(),
              history: [],
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
      if (avatarUrl.length > 500 * 1024) {
        return response.status(400).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Image size is too large (exceeds 500KB limit). Please select an image under 500KB.'
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
        // Use updateOne to write only avatarUrl without full document BSON materialization
        // This prevents "Plan executor error during findAndModify :: caused by :: BSONObj size" errors.
        const updateRes = await Employee.updateOne(
          filter,
          { $set: { avatarUrl: cleanAvatar } }
        )
        if (updateRes.matchedCount === 0) {
          return response.status(404).json({ success: false, error: { code: 'EMPLOYEE_NOT_FOUND', message: 'Employee record not found.' } })
        }
        updatedEmployee = await Employee.findOne(filter).select('-onboardingDocs -complianceDocs').lean()
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
    try {
      const result = await cachedList(parseListQuery(request.query))
      const sanitized = Array.isArray(result?.records)
        ? result.records.map((emp) => sanitizeEmployeeForViewer(emp, request.auth.user, { stripDocUrls: true }))
        : []
      return response.json({ success: true, data: sanitized, meta: result.meta })
    } catch (error) { return next(error) }
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
      const employee = await service.get(request.params.id)
      return response.json({ success: true, data: sanitizeEmployeeForViewer(employee, request.auth.user, { stripDocUrls: false }) })
    } catch (error) { return next(error) }
  })
  const VERIFIER_ROLES = ['admin', 'hr', 'director', 'managing_director', 'co_founder', 'hr_executive', 'vertical_head']
  function assertCanVerifyDocuments(actor, targetId) {
    const isSelf = String(targetId) === String(actor.id) ||
      String(targetId) === String(actor._id) ||
      (actor.employeeId && String(actor.employeeId).toUpperCase() === String(targetId).toUpperCase())
    if (isSelf) {
      const err = new Error('Self-verification is strictly prohibited. You cannot verify or approve your own profile or documentation.')
      err.statusCode = 403
      err.code = 'FORBIDDEN_SELF_VERIFICATION'
      throw err
    }
    const roleNormalized = String(actor?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_')
    const isSuper = Boolean(actor?.permissions?.includes('*'))
    if (!VERIFIER_ROLES.includes(roleNormalized) && !isSuper) {
      const err = new Error('Access Denied: Only Director, Admin, or HR level can approve or verify employee documentation.')
      err.statusCode = 403
      err.code = 'FORBIDDEN_ROLE'
      throw err
    }
  }

  router.patch('/:id', auth.authenticate, async (request, response, next) => {
    try {
      const isSelf = await checkIsSelf(request.auth.user, request.params.id)
      if (!isSelf && !hasPermission(request.auth.user, PERMISSIONS.EMPLOYEES_WRITE)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to update this employee.' } })
      }
      let updateBody = request.body ?? {}
      if (typeof updateBody === 'object' && updateBody !== null) {
        updateBody = { ...updateBody }
        delete updateBody.permissions
        delete updateBody.passwordHash
        delete updateBody.authVersion
        delete updateBody.salaryRecord
        delete updateBody._id
        delete updateBody.id
        delete updateBody.__v
        delete updateBody.createdAt
        delete updateBody.updatedAt
        if (updateBody.password === '' || updateBody.password === null) delete updateBody.password
        if (updateBody.phone !== undefined) {
          if (updateBody.phone === null) updateBody.phone = ''
          else if (typeof updateBody.phone === 'number') updateBody.phone = String(updateBody.phone)
        }
        if (updateBody.employeeId !== undefined && (!updateBody.employeeId || !String(updateBody.employeeId).trim())) {
          delete updateBody.employeeId
        }
        if (updateBody.joiningDate !== undefined && (!updateBody.joiningDate || updateBody.joiningDate === '')) {
          delete updateBody.joiningDate
        }
        if (updateBody.onboardingStatus) {
          const st = String(updateBody.onboardingStatus).trim().toLowerCase()
          if (st === 'pending') updateBody.onboardingStatus = 'submitted'
          else if (st === 'rejected') updateBody.onboardingStatus = 'action_required'
          else if (st === 'approved') updateBody.onboardingStatus = 'verified'
        }
      }
      if (updateBody.identity && typeof updateBody.identity === 'object' && updateBody.identity.dob && !updateBody.dob) {
        updateBody.dob = updateBody.identity.dob
      }
      if (updateBody.dob) {
        if (!updateBody.identity || typeof updateBody.identity !== 'object') updateBody.identity = {}
        updateBody.identity.dob = updateBody.dob
      }
      if (isSelf) {
        if (!hasPermission(request.auth.user, PERMISSIONS.EMPLOYEES_WRITE)) {
          const allowedSelfFields = ['identity', 'parentsContact', 'emergencyContact', 'bankDetails', 'onboardingDocs', 'phone', 'financeDetails', 'complianceDocs', 'policyConsents', 'avatarUrl', 'onboardingStatus', 'onboardingSubmittedAt', 'onboardingNotes', 'dob']
          updateBody = Object.fromEntries(Object.entries(updateBody).filter(([key]) => allowedSelfFields.includes(key)))
        }
        // Self-updates can NEVER set onboardingStatus to verified or self-verify documents, regardless of role!
        if (updateBody.onboardingStatus === 'verified') {
          updateBody.onboardingStatus = 'submitted'
          updateBody.onboardingSubmittedAt = new Date()
        }
        if (updateBody.onboardingDocs && typeof updateBody.onboardingDocs === 'object') {
          const sanitizedDocs = {}
          for (const [k, doc] of Object.entries(updateBody.onboardingDocs)) {
            if (doc && typeof doc === 'object') {
              sanitizedDocs[k] = {
                ...doc,
                status: doc.status === 'verified' ? 'submitted' : (doc.status || 'submitted'),
                verifiedAt: null,
                verifiedBy: null,
              }
            }
          }
          updateBody.onboardingDocs = sanitizedDocs
        }
      }
      if (updateBody.emergencyContact) {
        if (typeof updateBody.emergencyContact !== 'object' || updateBody.emergencyContact === null) {
          updateBody.emergencyContact = {}
        }
        const ecPhone = String(updateBody.emergencyContact.phone || '').replace(/[^0-9+\s\-()]/g, '').trim()
        updateBody.emergencyContact = {
          name: String(updateBody.emergencyContact.name || '').trim(),
          relationship: String(updateBody.emergencyContact.relationship || '').trim(),
          phone: /\d/.test(ecPhone) ? ecPhone : '',
        }
      }
      if (updateBody.parentsContact) {
        if (typeof updateBody.parentsContact !== 'object' || updateBody.parentsContact === null) {
          updateBody.parentsContact = {}
        }
        const pPhone = String(updateBody.parentsContact.parentPhone || updateBody.parentsContact.phone || '').replace(/[^0-9+\s\-()]/g, '').trim()
        const validPhone = /\d/.test(pPhone) ? pPhone : ''
        updateBody.parentsContact = {
          fatherName: String(updateBody.parentsContact.fatherName || '').trim(),
          motherName: String(updateBody.parentsContact.motherName || '').trim(),
          parentPhone: validPhone,
          phone: validPhone,
          address: String(updateBody.parentsContact.address || '').trim(),
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
      assertCanVerifyDocuments(request.auth.user, request.params.id)
      return response.json({ success: true, data: await service.approveDocument(request.params.id, request.params.docKey, request.auth.user, request.body) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/documents/:docKey/reject', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      assertCanVerifyDocuments(request.auth.user, request.params.id)
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
      assertCanVerifyDocuments(request.auth.user, request.params.id)
      return response.json({ success: true, data: await service.approveOnboarding(request.params.id, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/onboarding/reject', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_WRITE), async (request, response, next) => {
    try {
      assertCanVerifyDocuments(request.auth.user, request.params.id)
      return response.json({ success: true, data: await service.rejectOnboarding(request.params.id, request.body?.reason, request.auth.user) })
    } catch (error) { return next(error) }
  })
  router.post('/:id/exit/initiate', auth.authenticate, async (request, response, next) => {
    try {
      const isSelf = String(request.params.id) === String(request.auth.user.id) || String(request.params.id) === String(request.auth.user._id)
      const hasWrite = hasPermission(request.auth.user, PERMISSIONS.EMPLOYEES_WRITE)
      let isManager = false
      if (!isSelf && !hasWrite && employeeRepository) {
        try {
          const emp = await employeeRepository.findById(request.params.id)
          if (emp && (String(emp.managerId) === String(request.auth.user.id) || String(emp.managerId) === String(request.auth.user._id))) {
            isManager = true
          }
        } catch {}
      }
      if (!isSelf && !hasWrite && !isManager) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to initiate offboarding for this employee.' } })
      }
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
  router.post('/:id/offboarding/checklist/:key/toggle', auth.authenticate, async (request, response, next) => {
    try {
      const hasWrite = hasPermission(request.auth.user, PERMISSIONS.EMPLOYEES_WRITE)
      let isManager = false
      if (!hasWrite && employeeRepository) {
        try {
          const emp = await employeeRepository.findById(request.params.id)
          if (emp && (String(emp.managerId) === String(request.auth.user.id) || String(emp.managerId) === String(request.auth.user._id))) {
            isManager = true
          }
        } catch {}
      }
      if (!hasWrite && !isManager) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to update offboarding checklist items.' } })
      }
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
