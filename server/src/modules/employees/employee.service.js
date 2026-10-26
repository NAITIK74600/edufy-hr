import { hasPermission } from '../../auth/permissions.js'
import { hashPassword } from '../../auth/passwords.js'
import { sendWelcomeEmail, sendDocumentStatusEmail } from '../../services/mail.service.js'

const protectedFields = ['permissions', 'passwordHash', 'authVersion', 'salaryRecord']
const editableFields = ['employeeId', 'name', 'email', 'password', 'department', 'designation', 'location', 'employmentType', 'joiningDate', 'employmentEndDate', 'managerId', 'phone', 'bankDetails', 'emergencyContact', 'exitDetails', 'onboardingChecklist', 'offboardingChecklist', 'role', 'status', 'salary', 'salaryStructure', 'parentsContact', 'identity', 'onboardingDocs', 'documents', 'onboardingStatus', 'onboardingSubmittedAt', 'onboardingVerifiedAt', 'onboardingVerifiedBy', 'onboardingNotes', 'onboardingRejectionReason', 'financeDetails', 'reportingManager', 'policyConsents', 'complianceDocs', 'avatarUrl']
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validationError(message, fields = {}) {
  const error = new Error(message)
  error.statusCode = 400
  error.code = 'VALIDATION_ERROR'
  error.fields = fields
  return error
}

function normalizeDate(value, field) {
  if (value === undefined || value === null || value === '') return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw validationError(`Invalid ${field}.`, { [field]: 'Use an ISO date.' })
  return date
}

function validatePayload(payload, { partial = false, canAssignManager = false, canManageSalary = false, currentRole, actorRole } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw validationError('Enter an employee object.')
  for (const field of protectedFields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) throw validationError(`The field ${field} cannot be changed through this endpoint.`, { [field]: 'Protected field.' })
  }
  const fields = {}
  const errors = {}
  for (const field of Object.keys(payload)) {
    if (!editableFields.includes(field)) throw validationError(`The field ${field} is not editable.`, { [field]: 'Unknown or restricted field.' })
    if (field === 'managerId' && !canAssignManager) throw validationError('Manager assignment requires an explicit permission.', { managerId: 'Not permitted.' })
    fields[field] = payload[field]
  }
  if (!partial) {
    for (const required of ['name', 'email', 'joiningDate']) {
      if (!payload[required]) errors[required] = 'Required.'
    }
    if (Object.keys(errors).length) throw validationError('Please provide all required employee fields.', errors)
  }
  for (const field of ['name', 'email', 'employeeId', 'phone', 'department', 'designation', 'location']) {
    if (payload[field] !== undefined && typeof payload[field] !== 'string') errors[field] = 'Enter text.'
  }
  if (payload.email !== undefined && !emailPattern.test(String(payload.email).trim())) errors.email = 'Enter a valid email address.'
  if (payload.name !== undefined && !String(payload.name).trim()) errors.name = 'Name is required.'
  if (payload.employeeId !== undefined && !/^[A-Za-z0-9_-]+$/.test(String(payload.employeeId).trim())) errors.employeeId = 'Use letters, numbers, hyphens, or underscores.'
  if (payload.employmentType !== undefined && !['full_time', 'part_time', 'contractor', 'intern'].includes(payload.employmentType)) errors.employmentType = 'Invalid employment type.'
  if (payload.role !== undefined && payload.role !== currentRole && (['admin', 'hr'].includes(payload.role) || ['admin', 'hr'].includes(currentRole))) {
    if (actorRole !== 'admin' && !(actorRole === 'hr' && payload.role === 'hr')) {
      throw validationError('The field role cannot be changed to or from Admin/HR through this endpoint.', { role: 'Protected role.' })
    }
  }
  if (payload.status !== undefined && !['invited', 'active', 'inactive', 'onboarding', 'notice'].includes(payload.status)) errors.status = 'Choose invited, active, inactive, or notice.'
  if (payload.onboardingStatus !== undefined && !['invited', 'draft', 'submitted', 'in_review', 'action_required', 'revision_requested', 'verified', 'completed'].includes(payload.onboardingStatus)) {
    errors.onboardingStatus = 'Choose a valid onboarding status.'
  }
  if (payload.password !== undefined && (typeof payload.password !== 'string' || payload.password.length < 8)) {
    errors.password = 'Enter a password of at least eight characters.'
  }
  if (payload.salary !== undefined) {
    if (!canManageSalary) throw Object.assign(validationError('Payroll management permission is required to change salary.'), { statusCode: 403, code: 'FORBIDDEN' })
    if (!Number.isFinite(payload.salary) || payload.salary < 0 || payload.salary > 100000000) errors.salary = 'Enter a non-negative annual salary up to 100000000.'
  }
  if (payload.salaryStructure !== undefined) {
    if (!canManageSalary) throw Object.assign(validationError('Payroll management permission is required to change salary.'), { statusCode: 403, code: 'FORBIDDEN' })
    if (typeof payload.salaryStructure === 'object' && payload.salaryStructure !== null) {
      const basic = Math.max(0, Number(payload.salaryStructure.basic) || 0)
      const hra = Math.max(0, Number(payload.salaryStructure.hra) || 0)
      const conveyance = Math.max(0, Number(payload.salaryStructure.conveyance ?? payload.salaryStructure.ca) || 0)
      const specialAllowance = Math.max(0, Number(payload.salaryStructure.specialAllowance ?? payload.salaryStructure.sa) || 0)
      const otherAllowance = Math.max(0, Number(payload.salaryStructure.otherAllowance ?? payload.salaryStructure.oa) || 0)
      fields.salaryStructure = { basic, hra, conveyance, specialAllowance, otherAllowance }
      const monthlySum = basic + hra + conveyance + specialAllowance + otherAllowance
      if (monthlySum > 0 && (payload.salary === undefined || Number(payload.salary) === 0)) {
        fields.salary = monthlySum * 12
      }
    }
  }
  if (payload.joiningDate !== undefined && !payload.joiningDate) errors.joiningDate = 'Joining date is required.'
  for (const dateField of ['joiningDate', 'employmentEndDate']) {
    if (payload[dateField] !== undefined) fields[dateField] = normalizeDate(payload[dateField], dateField) || null
  }
  if (fields.joiningDate && fields.employmentEndDate && fields.employmentEndDate < fields.joiningDate) errors.employmentEndDate = 'Employment end date must be on or after joining date.'
  if (Object.keys(errors).length) throw validationError('Please correct the employee fields.', errors)
  return fields
}

async function validateManager(repository, managerId) {
  if (managerId === null || managerId === undefined || managerId === '') return null
  const manager = await repository.findManager(managerId)
  if (!manager) throw validationError('Manager must be an active admin, HR user, or manager.', { managerId: 'Invalid manager.' })
  return manager._id ?? manager.id
}

async function validateReportingChain(repository, employeeId, managerId) {
  const visited = new Set([String(employeeId)])
  let currentId = managerId
  while (currentId) {
    if (visited.has(String(currentId))) throw validationError('Circular reporting relationships are not allowed.')
    visited.add(String(currentId))
    const manager = await repository.findForUpdate(currentId)
    currentId = manager?.managerId
  }
}

function auditEvent(actor, action, entityId, changedFields = [], reason) {
  return { actorId: actor.id, actorRole: actor.role, action, entityType: 'employee', entityId, changedFields, reason }
}

export function createEmployeeService({ repository }) {
  function options(actor, employee) {
    return {
      partial: Boolean(employee), currentRole: employee?.role,
      actorRole: actor?.role,
      canAssignManager: hasPermission(actor, 'employees.manager.assign') || hasPermission(actor, 'employees.write'),
      canManageSalary: ['admin', 'hr'].includes(actor.role) && hasPermission(actor, 'payroll.write'),
    }
  }
  function preventSelfDeactivation(id, status, actor) {
    if (String(id) === String(actor.id) && status === 'inactive') throw validationError('You cannot deactivate your own account.')
  }
  return {
    async list(filters) {
      return repository.list(filters)
    },
    async get(id) {
      const employee = await repository.findById(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      return employee
    },
    async create(payload, actor) {
      const values = validatePayload(payload, options(actor))
      if (values.managerId !== undefined) values.managerId = await validateManager(repository, values.managerId)
      if (!payload.employeeId || !String(payload.employeeId).trim()) {
        let maxCode = 21200
        const allList = (await repository.list({ limit: 1000 }))?.records || []
        for (const emp of allList) {
          const m = String(emp.employeeId || '').match(/^ETS(\d+)$/i)
          if (m) {
            const n = parseInt(m[1], 10)
            if (n >= maxCode) maxCode = n
          }
        }
        values.employeeId = `ETS${maxCode + 1}`
      } else {
        values.employeeId = String(payload.employeeId).trim().toUpperCase()
      }
      values.email = String(payload.email).trim().toLowerCase()
      values.name = String(payload.name).trim()
      values.status ??= 'invited'
      values.role ??= 'employee'
      const envPassword = process.env.DEFAULT_EMPLOYEE_PASSWORD || process.env.EMPLOYEE_PASSWORD
      const rawPassword = envPassword || (values.password && String(values.password).trim().length >= 8
        ? String(values.password).trim()
        : 'Password@123')
      values.passwordHash = hashPassword(rawPassword)
      delete values.password
      const employee = await repository.create(values)
      await repository.addAudit(auditEvent(actor, 'employee.created', employee.id ?? employee._id, Object.keys(values)))

      if (employee.email) {
        const rolePath = (values.role === 'admin') ? 'admin/login' : (values.role === 'hr' ? 'hr/login' : 'employee/login')
        const publicBase = (process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com').replace(/\/+$/, '')
        const portalUrl = `${publicBase}/#/${rolePath}`

        sendWelcomeEmail({
          employee: { ...employee, ...values },
          temporaryPassword: rawPassword,
          loginUrl: portalUrl,
        })
          .then(() => console.log(`[MailService:SUCCESS] Welcome email delivered to ${employee.email} via ADMIN channel`))
          .catch((err) => console.error(`[MailService:ERROR] Failed sending welcome email to ${employee.email}:`, err?.message || err))
      }

      return {
        ...employee,
        temporaryPassword: rawPassword,
        hasLogin: true,
      }
    },
    async update(id, payload, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const values = validatePayload(payload, options(actor, employee))
      if (values.employeeId) {
        const newCode = String(values.employeeId).trim().toUpperCase()
        if (newCode !== employee.employeeId) {
          const existing = await repository.findById(newCode)
          if (existing && String(existing.id ?? existing._id) !== String(employee.id ?? employee._id)) {
            throw validationError(`Employee code "${newCode}" is already in use by ${existing.name || 'another employee'}.`, { employeeId: 'Code already in use.' })
          }
          const oldCode = employee.employeeId
          employee.employeeId = newCode
          values.employeeId = newCode
          if (repository.updateEmployeeCode) {
            await repository.updateEmployeeCode(oldCode, newCode, employee.id ?? employee._id)
          }
        } else {
          values.employeeId = employee.employeeId
        }
      }
      preventSelfDeactivation(id, values.status, actor)
      const isSelf = String(actor?.id) === String(id) ||
        String(actor?._id) === String(id) ||
        String(actor?.id) === String(employee.id ?? employee._id) ||
        String(actor?.employeeId) === String(employee.employeeId) ||
        (actor?.email && employee?.email && actor.email.toLowerCase() === employee.email.toLowerCase())
      if (isSelf && values.onboardingStatus === 'verified') {
        throw Object.assign(new Error('Self-verification is strictly prohibited. You cannot verify your own onboarding documents.'), { statusCode: 403, code: 'FORBIDDEN_SELF_VERIFICATION' })
      }
      const joiningDate = values.joiningDate ?? employee.joiningDate
      const endDate = values.employmentEndDate === undefined ? employee.employmentEndDate : values.employmentEndDate
      if (endDate && new Date(endDate) < new Date(joiningDate)) throw validationError('Employment end date must be on or after joining date.')
      if ((values.role && values.role !== employee.role) || (values.status && values.status !== employee.status)) employee.authVersion = (employee.authVersion ?? 0) + 1
      if (values.name) values.displayName = String(values.name).trim()
      if (Object.prototype.hasOwnProperty.call(values, 'managerId')) {
        values.managerId = await validateManager(repository, values.managerId)
        await validateReportingChain(repository, id, values.managerId)
      }
      if (values.email) values.email = String(values.email).trim().toLowerCase()
      if (values.name) values.name = String(values.name).trim()
      const changedFields = Object.keys(values)
      for (const [field, value] of Object.entries(values)) employee[field] = value
      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'employee.updated', employee.id ?? employee._id, changedFields))
      return repository.findById(id)
    },
    async setStatus(id, status, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      preventSelfDeactivation(id, status, actor)
      if (employee.status !== status) employee.authVersion = (employee.authVersion ?? 0) + 1
      employee.status = status
      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, `employee.${status}`, employee.id ?? employee._id, ['status']))

      if (status === 'invited' && employee.email) {
        const rolePath = (employee.role === 'admin') ? 'admin/login' : (employee.role === 'hr' ? 'hr/login' : 'employee/login')
        const publicBase = (process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com').replace(/\/+$/, '')
        const portalUrl = `${publicBase}/#/${rolePath}`
        const envPassword = process.env.DEFAULT_EMPLOYEE_PASSWORD || process.env.EMPLOYEE_PASSWORD || 'Password@123'
        sendWelcomeEmail({
          employee,
          temporaryPassword: envPassword,
          loginUrl: portalUrl,
        })
          .then(() => console.log(`[MailService:SUCCESS] Invite email delivered to ${employee.email} via ADMIN channel`))
          .catch((err) => console.error(`[MailService:ERROR] Failed sending invite email to ${employee.email}:`, err?.message || err))
      }

      return repository.findById(id)
    },
    async audit(id) {
      await this.get(id)
      return repository.listAudit(id)
    },
    async approveDocument(id, docKey, actor, body = {}) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const isSelf = String(actor?.id) === String(employee.id ?? employee._id) ||
        String(actor?._id) === String(employee.id ?? employee._id) ||
        String(actor?.employeeId) === String(employee.employeeId) ||
        (actor?.email && employee?.email && actor.email.toLowerCase() === employee.email.toLowerCase())
      if (isSelf) {
        const error = new Error('Self-verification is strictly prohibited. You cannot verify your own onboarding documents.')
        error.statusCode = 403
        error.code = 'FORBIDDEN_SELF_VERIFICATION'
        throw error
      }
      const docs = employee.onboardingDocs ? { ...employee.onboardingDocs } : {}
      const currentDoc = docs[docKey] ? { ...docs[docKey] } : {}
      const reviewer = actor?.displayName || actor?.name || actor?.email || 'HR Reviewer'
      const vAt = new Date().toISOString()
      docs[docKey] = {
        ...currentDoc,
        status: 'verified',
        verifiedAt: vAt,
        verifiedBy: reviewer,
        reviewerId: actor?.id ?? actor?._id,
        rejectionReason: null,
        comments: body?.comments || currentDoc.comments,
      }
      if (docKey === 'aadharCard') docs.aadharDoc = { ...docs[docKey] }
      if (docKey === 'panCard') docs.panDoc = { ...docs[docKey] }
      employee.onboardingDocs = docs

      const uploadedDocEntries = Object.entries(docs).filter(([k, d]) => d && typeof d === 'object' && (d.fileName || d.url))
      const allVerified = uploadedDocEntries.length > 0 && uploadedDocEntries.every(([, d]) => d.status === 'verified')
      if (allVerified) {
        employee.onboardingStatus = 'verified'
        employee.onboardingVerifiedAt = new Date()
        employee.onboardingVerifiedBy = actor?.id ?? actor?._id
      }
      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'document.approved', employee.id ?? employee._id, [docKey], body?.comments))

      if (employee.email) {
        sendDocumentStatusEmail({
          employee,
          documentName: docKey,
          status: 'approved',
          reviewer: actor,
        }).catch((err) => console.warn('[MailService] Document approval email notice:', err?.message || err))
      }

      return repository.findById(id)
    },
    async rejectDocument(id, docKey, reason, actor, body = {}) {
      if (!reason || !String(reason).trim()) {
        throw validationError('Rejection reason is required.', { reason: 'Required.' })
      }
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const isSelf = String(actor?.id) === String(employee.id ?? employee._id) ||
        String(actor?._id) === String(employee.id ?? employee._id) ||
        String(actor?.employeeId) === String(employee.employeeId) ||
        (actor?.email && employee?.email && actor.email.toLowerCase() === employee.email.toLowerCase())
      if (isSelf) {
        const error = new Error('Self-rejection is strictly prohibited. You cannot reject your own onboarding documents.')
        error.statusCode = 403
        error.code = 'FORBIDDEN_SELF_VERIFICATION'
        throw error
      }
      const docs = employee.onboardingDocs ? { ...employee.onboardingDocs } : {}
      const currentDoc = docs[docKey] ? { ...docs[docKey] } : {}
      const reviewer = actor?.displayName || actor?.name || actor?.email || 'HR Reviewer'
      const rAt = new Date().toISOString()
      const cleanReason = String(reason).trim()
      docs[docKey] = {
        ...currentDoc,
        status: 'rejected',
        rejectedAt: rAt,
        rejectedBy: reviewer,
        reviewerId: actor?.id ?? actor?._id,
        rejectionReason: cleanReason,
        comments: body?.comments || cleanReason,
      }
      if (docKey === 'aadharCard') docs.aadharDoc = { ...docs[docKey] }
      if (docKey === 'panCard') docs.panDoc = { ...docs[docKey] }
      employee.onboardingDocs = docs
      employee.onboardingStatus = 'action_required'
      employee.onboardingRejectionReason = cleanReason

      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'document.rejected', employee.id ?? employee._id, [docKey], cleanReason))

      if (employee.email) {
        sendDocumentStatusEmail({
          employee,
          documentName: docKey,
          status: 'revision_requested',
          reason: cleanReason,
          reviewer: actor,
        }).catch((err) => console.warn('[MailService] Document rejection email notice:', err?.message || err))
      }

      return repository.findById(id)
    },
    async uploadDocument(id, docKey, fileData, actor) {
      if (!fileData || (!fileData.url && !fileData.content)) {
        throw validationError('Document file content is required.', { file: 'Required.' })
      }
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const isSelf = String(actor.id) === String(employee.id ?? employee._id) ||
        String(actor._id) === String(employee.id ?? employee._id) ||
        (actor.employeeId && employee.employeeId && String(actor.employeeId).toUpperCase() === String(employee.employeeId).toUpperCase()) ||
        (actor.email && employee.email && String(actor.email).toLowerCase() === String(employee.email).toLowerCase())
      const canManage = ['admin', 'hr'].includes(actor.role) || hasPermission(actor, 'employees.write')
      if (!isSelf && !canManage) {
        const error = new Error('Not authorized to upload documents for this employee.')
        error.statusCode = 403
        error.code = 'FORBIDDEN'
        throw error
      }

      if (fileData.url && typeof fileData.url === 'string' && fileData.url.startsWith('data:')) {
        const mimeMatch = fileData.url.match(/^data:([^;]+);base64,/)
        if (mimeMatch) {
          const mime = mimeMatch[1].toLowerCase()
          const isAllowed = mime.startsWith('image/') ||
            mime.startsWith('video/') ||
            mime.startsWith('audio/') ||
            mime.startsWith('text/') ||
            mime === 'application/pdf' ||
            mime.includes('word') ||
            mime.includes('document') ||
            mime.includes('sheet') ||
            mime.includes('excel') ||
            mime === 'application/octet-stream' ||
            mime === 'application/zip' ||
            mime === 'application/msword' ||
            mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          if (!isAllowed) {
            throw validationError('Please upload a valid document or media file.', { file: 'Invalid format.' })
          }
        }
        const approxBytes = fileData.url.length * 0.75
        if (approxBytes > 15 * 1024 * 1024) {
          throw validationError('Document file size must not exceed 15 MB.', { file: 'File exceeds 15MB limit.' })
        }
      }

      const rawName = String(fileData.fileName || `${docKey}.pdf`).trim()
      const safeName = rawName.replace(/[/\\]/g, '_').slice(0, 100)

      const docs = employee.onboardingDocs ? { ...employee.onboardingDocs } : {}
      docs[docKey] = {
        status: 'submitted',
        fileName: safeName,
        url: fileData.url,
        size: fileData.size || `${Math.round((fileData.url?.length || 1000) * 0.75 / 1024)} KB`,
        uploadedAt: new Date().toISOString().slice(0, 10),
        submittedAt: new Date().toISOString(),
        uploadedBy: actor.id ?? actor._id,
        rejectionReason: null,
      }
      if (docKey === 'aadharCard') docs.aadharDoc = { ...docs[docKey] }
      if (docKey === 'panCard') docs.panDoc = { ...docs[docKey] }
      employee.onboardingDocs = docs
      employee.onboardingStatus = 'submitted'
      employee.onboardingSubmittedAt = new Date()

      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'document.uploaded', employee.id ?? employee._id, [docKey]))
      return repository.findById(id)
    },
    async approveOnboarding(id, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const isSelf = String(actor?.id) === String(employee.id ?? employee._id) ||
        String(actor?._id) === String(employee.id ?? employee._id) ||
        String(actor?.employeeId) === String(employee.employeeId) ||
        (actor?.email && employee?.email && actor.email.toLowerCase() === employee.email.toLowerCase())
      if (isSelf) {
        const error = new Error('Self-verification is strictly prohibited. You cannot verify your own onboarding documents.')
        error.statusCode = 403
        error.code = 'FORBIDDEN_SELF_VERIFICATION'
        throw error
      }
      const reviewer = actor?.displayName || actor?.name || actor?.email || 'HR Reviewer'
      const docs = employee.onboardingDocs ? { ...employee.onboardingDocs } : {}
      for (const k of Object.keys(docs)) {
        if (docs[k] && typeof docs[k] === 'object' && (docs[k].fileName || docs[k].url)) {
          docs[k] = {
            ...docs[k],
            status: 'verified',
            verifiedAt: new Date().toISOString(),
            verifiedBy: reviewer,
          }
        }
      }
      employee.onboardingDocs = docs
      employee.onboardingStatus = 'verified'
      employee.onboardingVerifiedAt = new Date()
      employee.onboardingVerifiedBy = actor?.id ?? actor?._id
      employee.onboardingRejectionReason = null

      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'onboarding.approved', employee.id ?? employee._id, ['onboardingStatus']))
      return repository.findById(id)
    },
    async rejectOnboarding(id, reason, actor) {
      if (!reason || !String(reason).trim()) {
        throw validationError('Rejection reason is required.', { reason: 'Required.' })
      }
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const isSelf = String(actor?.id) === String(employee.id ?? employee._id) ||
        String(actor?._id) === String(employee.id ?? employee._id) ||
        String(actor?.employeeId) === String(employee.employeeId) ||
        (actor?.email && employee?.email && actor.email.toLowerCase() === employee.email.toLowerCase())
      if (isSelf) {
        const error = new Error('Self-rejection is strictly prohibited. You cannot reject your own onboarding documents.')
        error.statusCode = 403
        error.code = 'FORBIDDEN_SELF_VERIFICATION'
        throw error
      }
      const cleanReason = String(reason).trim()
      employee.onboardingStatus = 'action_required'
      employee.onboardingRejectionReason = cleanReason

      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'onboarding.rejected', employee.id ?? employee._id, ['onboardingStatus'], cleanReason))
      return repository.findById(id)
    },
    async requestRevision(id, reason, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const cleanReason = String(reason || 'Employee requested document revision').trim()
      employee.onboardingStatus = 'revision_requested'
      employee.onboardingNotes = cleanReason
      employee.onboardingRejectionReason = null
      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'onboarding.revision_requested', employee.id ?? employee._id, ['onboardingStatus'], cleanReason))
      return repository.findById(id)
    },
    async initiateExit(id, exitData = {}, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const defaultChecklist = [
        { key: 'knowledge_transfer', label: 'Handover & Knowledge Transfer Completed', completed: false },
        { key: 'assets_returned', label: 'Company Assets & Laptop Returned', completed: false },
        { key: 'id_badge_access', label: 'ID Badge & Building Access Revoked', completed: false },
        { key: 'system_deprovisioning', label: 'Email & System Accounts Revoked', completed: false },
        { key: 'exit_interview', label: 'HR Exit Interview Conducted', completed: false },
        { key: 'fnf_settlement', label: 'Final Settlement (FnF) Calculated', completed: false },
      ]
      employee.status = 'notice'
      employee.exitDetails = {
        resignationDate: exitData.resignationDate || new Date().toISOString().split('T')[0],
        lastWorkingDay: exitData.lastWorkingDay ? new Date(exitData.lastWorkingDay).toISOString().split('T')[0] : '',
        noticePeriodDays: Number(exitData.noticePeriodDays) || 30,
        reason: exitData.reason || 'Resignation',
        handoverAssignee: exitData.handoverAssignee || 'Unassigned',
        handoverStatus: 'Initiated',
        exitInterviewCompleted: false,
        assetsReturned: false,
      }
      if (exitData.lastWorkingDay) {
        employee.employmentEndDate = new Date(exitData.lastWorkingDay)
      }
      employee.offboardingChecklist = Array.isArray(employee.offboardingChecklist) && employee.offboardingChecklist.length > 0
        ? employee.offboardingChecklist
        : defaultChecklist
      if (employee.markModified) {
        employee.markModified('exitDetails')
        employee.markModified('offboardingChecklist')
      }
      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'employee.exit_initiated', employee.id ?? employee._id, ['status', 'exitDetails', 'offboardingChecklist']))
      return repository.findById(id)
    },
    async toggleOffboardingItem(id, itemKey, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      const defaultChecklist = [
        { key: 'knowledge_transfer', label: 'Handover & Knowledge Transfer Completed', completed: false },
        { key: 'assets_returned', label: 'Company Assets & Laptop Returned', completed: false },
        { key: 'id_badge_access', label: 'ID Badge & Building Access Revoked', completed: false },
        { key: 'system_deprovisioning', label: 'Email & System Accounts Revoked', completed: false },
        { key: 'exit_interview', label: 'HR Exit Interview Conducted', completed: false },
        { key: 'fnf_settlement', label: 'Final Settlement (FnF) Calculated', completed: false },
      ]
      const currentList = Array.isArray(employee.offboardingChecklist) && employee.offboardingChecklist.length > 0
        ? employee.offboardingChecklist
        : defaultChecklist
      employee.offboardingChecklist = currentList.map((item) =>
        item.key === itemKey
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : undefined,
              completedBy: actor?.name || actor?.displayName || 'HR Lead',
            }
          : item
      )
      if (employee.markModified) employee.markModified('offboardingChecklist')
      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'employee.offboarding_item_toggled', employee.id ?? employee._id, ['offboardingChecklist'], itemKey))
      return repository.findById(id)
    },
    async cancelExit(id, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      employee.status = 'active'
      employee.exitDetails = null
      employee.employmentEndDate = null
      employee.offboardingChecklist = []
      if (employee.markModified) {
        employee.markModified('exitDetails')
        employee.markModified('offboardingChecklist')
      }
      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'employee.exit_cancelled', employee.id ?? employee._id, ['status', 'exitDetails', 'offboardingChecklist']))
      return repository.findById(id)
    },
    async finalizeExit(id, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      preventSelfDeactivation(id, 'inactive', actor)
      employee.status = 'inactive'
      employee.exitDetails = {
        ...(employee.exitDetails || {}),
        handoverStatus: 'Completed',
        assetsReturned: true,
        exitInterviewCompleted: true,
      }
      if (Array.isArray(employee.offboardingChecklist) && employee.offboardingChecklist.length > 0) {
        employee.offboardingChecklist = employee.offboardingChecklist.map((item) => ({
          ...item,
          completed: true,
          completedAt: item.completedAt || new Date().toISOString(),
          completedBy: item.completedBy || actor?.name || actor?.displayName || 'HR Operations',
        }))
        if (employee.markModified) employee.markModified('offboardingChecklist')
      }
      employee.authVersion = (employee.authVersion ?? 0) + 1
      if (employee.markModified) employee.markModified('exitDetails')
      await repository.save(employee)
      await repository.addAudit(auditEvent(actor, 'employee.exit_finalized', employee.id ?? employee._id, ['status', 'exitDetails', 'offboardingChecklist']))
      return repository.findById(id)
    },
    async remove(id, actor) {
      const employee = await repository.findForUpdate(id)
      if (!employee) {
        const error = new Error('Employee not found.')
        error.statusCode = 404
        error.code = 'EMPLOYEE_NOT_FOUND'
        throw error
      }
      if (String(id) === String(actor.id)) throw validationError('You cannot delete your own account.')
      if (['admin', 'hr'].includes(employee.role)) throw validationError('Admin and HR accounts are managed in the server environment and cannot be deleted here. Deactivate the person in People if they have left.')
      await repository.remove(employee)
      return { id: String(employee._id ?? employee.id), employeeId: employee.employeeId, name: employee.name }
    },
  }
}

export { editableFields, protectedFields, validatePayload }
