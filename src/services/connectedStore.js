import { apiClient } from './apiClient.js'
import { createWorkspaceStore, workspaceKeys } from './workspaceStore.js'
import { generateNextEmployeeCode } from '../utils/credentialsHelper.js'

export function todayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function currentPayrollMonth() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function normalizeEmployee(employee) {
  return {
    ...employee, id: String(employee.id ?? employee._id),
    managerName: employee.managerId?.name ?? '',
    managerId: employee.managerId?._id ? String(employee.managerId._id) : employee.managerId,
    joiningDate: employee.joiningDate?.slice(0, 10) ?? '',
    employmentEndDate: employee.employmentEndDate?.slice(0, 10) ?? '',
    exitDetails: employee.exitDetails
      ? {
          ...employee.exitDetails,
          resignationDate: employee.exitDetails.resignationDate ? String(employee.exitDetails.resignationDate).slice(0, 10) : '',
          lastWorkingDay: employee.exitDetails.lastWorkingDay ? String(employee.exitDetails.lastWorkingDay).slice(0, 10) : '',
        }
      : null,
    offboardingChecklist: Array.isArray(employee.offboardingChecklist) ? employee.offboardingChecklist : [],
  }
}

export function normalizeLeave(request, employees) {
  const empObj = typeof request.employeeId === 'object' ? request.employeeId : null
  const empFound = (employees || []).find((record) =>
    String(record.id) === String(request.employeeId) ||
    String(record._id) === String(request.employeeId) ||
    String(record.employeeId) === String(request.employeeId)
  )
  const employee = empObj || empFound

  const employeeName = employee?.name || request.employeeName || (empObj?.name) || 'Employee'
  const department = employee?.department || request.department || (empObj?.department) || 'General'
  const employeeId = employee?.employeeId || (empObj?.employeeId) || (typeof request.employeeId === 'string' ? request.employeeId : '')
  const employeeRef = String(employee?._id || employee?.id || (empObj?._id || empObj?.id) || request.employeeId || '')

  return {
    ...request,
    id: String(request.id ?? request._id),
    _id: String(request._id ?? request.id),
    employeeRef,
    employeeId,
    employeeName,
    department,
    managerId: request.managerId?.employeeId ?? request.managerId,
    startDate: request.startDate ? String(request.startDate).slice(0, 10) : '',
    endDate: request.endDate ? String(request.endDate).slice(0, 10) : '',
    days: request.units ?? request.days ?? 1,
  }
}

export function createConnectedStore(store, notify, rawLocal = {}) {
  let user = null
  let generation = 0
  let refreshing = null
  let refreshAgain = false
  let mutationQueue = Promise.resolve()
  const state = () => store.getState()
  function reportError(error) {
    console.error('Connected data operation failed:', error)
    if (error?.status === 401) return
    if (!state().dataReady) {
      state().dataError = error?.message || 'The service is temporarily unavailable.'
    }
    notify()
  }
  async function refresh() {
    if (!user) return
    if (refreshing) {
      refreshAgain = true
      return refreshing
    }
    const activeGeneration = generation
    const actor = user
    refreshing = (async () => {
      const management = ['admin', 'hr'].includes(actor.role)
      const permissions = actor.permissions ?? []
      const can = (permission) => permissions.includes('*') || permissions.includes(permission)
      const payrollAllowed = management
        ? (can('payroll.read') || actor.role === 'admin')
        : can('payroll.self.read')

      async function fetchEmployees() {
        if (management) {
          const list = []
          let page = 1
          let total
          do {
            const result = await apiClient.get(`/employees?limit=100&page=${page++}`)
            list.push(...result.data.map(normalizeEmployee))
            total = result.meta.total
          } while (list.length < total)
          return { data: list }
        } else {
          const result = await apiClient.get('/auth/me')
          return { data: [normalizeEmployee(result.data.user)] }
        }
      }

      const requests = {
        employees: fetchEmployees(),
        attendance: apiClient.get(management ? '/attendance' : '/attendance/self'),
        leaves: apiClient.get(management ? '/leave/hr/requests' : '/leave/self'),
        payroll: payrollAllowed ? apiClient.get('/payroll') : Promise.resolve({ data: [] }),
        balances: apiClient.get(management ? '/leave/hr/balances' : '/leave/balances'),
        users: management ? apiClient.get('/auth/users') : Promise.resolve({ data: [] }),
        teamLeaves: !management && can('leave.team.read') ? apiClient.get('/leave/team') : Promise.resolve({ data: [] }),
        config: apiClient.get('/attendance/config'),
        payrollSettings: apiClient.get('/payroll/settings').catch(() => ({ data: {} })),
        directory: management ? Promise.resolve({ data: [] }) : apiClient.get('/hierarchy/directory'),
        workspace: apiClient.get('/workspace/snapshot').then((result) => {
          if (!result?.data || !workspaceKeys.every((key) => Array.isArray(result.data[key]))) {
            throw new Error('Workspace data is invalid. Refresh or contact your administrator.')
          }
          return result
        }),
      }
      const results = await Promise.allSettled(Object.values(requests))
      if (generation !== activeGeneration) return
      const dataErrors = {}
      const data = {}
      const keys = Object.keys(requests)
      results.forEach((result, index) => {
        const key = keys[index]
        if (result.status === 'fulfilled') data[key] = result.value.data
        else {
          if (result.reason.status === 401) throw result.reason
          console.error(`Could not load ${key}:`, result.reason)
          dataErrors[key] = result.reason.message
          data[key] = key === 'config' || key === 'workspace' ? {} : []
        }
      })
      const employees = data.employees || []
      if (!payrollAllowed) dataErrors.payroll = 'Your account does not have payroll access. Contact HR.'
      const prevEmployees = state().employees || []
      const listToProcess = management ? employees : [...employees, ...data.directory.filter((record) => record.id !== employees[0].id).map(normalizeEmployee)]
      const resolvedEmployees = listToProcess.map((fresh) => {
        const prev = prevEmployees.find((p) => p.id === fresh.id || p.employeeId === fresh.employeeId)
        if (prev?.status === 'notice' && fresh.status !== 'inactive' && !fresh.exitDetails && prev.exitDetails) {
          return {
            ...fresh,
            status: 'notice',
            exitDetails: prev.exitDetails,
            offboardingChecklist: (fresh.offboardingChecklist?.length ? fresh.offboardingChecklist : prev.offboardingChecklist) || [],
          }
        }
        return fresh
      })
      // In connected mode, the backend database (MongoDB) is the authoritative source of truth.
      // Do not revive or merge hardcoded mock test employees or users from local storage.
      const finalEmployees = resolvedEmployees
      const resolvedUsers = Array.isArray(data.users) ? data.users : []

      const baseDepts = rawLocal.getDepartments ? rawLocal.getDepartments() : []
      const currentDepts = (state().departments && state().departments.length > 0)
        ? state().departments
        : baseDepts
      const serverDepts = Array.isArray(data.workspace?.departments) ? data.workspace.departments : []

      const deptMap = new Map()
      currentDepts.forEach((d) => {
        if (!d) return
        const key = (d.deptId || d.id || d.name || '').toLowerCase()
        if (key) deptMap.set(key, { ...d })
      })
      baseDepts.forEach((d) => {
        if (!d) return
        const key = (d.deptId || d.id || d.name || '').toLowerCase()
        if (key && !deptMap.has(key)) deptMap.set(key, { ...d })
      })
      serverDepts.forEach((s) => {
        if (!s) return
        const key = (s.deptId || s.id || s.name || '').toLowerCase()
        if (key) {
          const prev = deptMap.get(key) || {}
          deptMap.set(key, {
            ...prev,
            ...s,
            id: s.id || s.deptId || prev.id,
            deptId: s.deptId || s.id || prev.deptId,
            isCustom: s.isCustom !== undefined ? s.isCustom : (prev.isCustom !== undefined ? prev.isCustom : true),
          })
        }
      })
      const finalDepts = Array.from(deptMap.values())

      const baseTeams = rawLocal.getTeams ? rawLocal.getTeams() : []
      const currentTeams = (state().teams && state().teams.length > 0)
        ? state().teams
        : baseTeams
      const serverTeams = Array.isArray(data.workspace?.teams) ? data.workspace.teams : []

      const teamMap = new Map()
      currentTeams.forEach((t) => {
        if (!t) return
        const key = (t.teamId || t.id || t.name || '').toLowerCase()
        if (key) teamMap.set(key, { ...t })
      })
      baseTeams.forEach((t) => {
        if (!t) return
        const key = (t.teamId || t.id || t.name || '').toLowerCase()
        if (key && !teamMap.has(key)) teamMap.set(key, { ...t })
      })
      serverTeams.forEach((s) => {
        if (!s) return
        const key = (s.teamId || s.id || s.name || '').toLowerCase()
        if (key) {
          const prev = teamMap.get(key) || {}
          teamMap.set(key, {
            ...prev,
            ...s,
            id: s.id || s.teamId || prev.id,
            teamId: s.teamId || s.id || prev.teamId,
          })
        }
      })
      const finalTeams = Array.from(teamMap.values())

      const baseRoles = rawLocal.getRoles ? rawLocal.getRoles() : []
      const currentRoles = (state().roles && state().roles.length > 0)
        ? state().roles
        : baseRoles
      const serverRoles = Array.isArray(data.workspace?.roles) ? data.workspace.roles : []
      const deletedRoleIds = new Set(rawLocal.getState?.()?.deletedRoleIds || state().deletedRoleIds || [])

      const roleMap = new Map()
      baseRoles.forEach((r) => {
        if (!r) return
        const key = (r.roleId || r.id || r.name || '').toLowerCase()
        if (key && !deletedRoleIds.has(r.id) && !deletedRoleIds.has(r.roleId)) roleMap.set(key, { ...r })
      })
      currentRoles.forEach((r) => {
        if (!r) return
        const key = (r.roleId || r.id || r.name || '').toLowerCase()
        if (key && !deletedRoleIds.has(r.id) && !deletedRoleIds.has(r.roleId) && !roleMap.has(key)) roleMap.set(key, { ...r })
      })
      serverRoles.forEach((s) => {
        if (!s) return
        const key = (s.roleId || s.id || s.name || '').toLowerCase()
        if (key && !deletedRoleIds.has(s.id) && !deletedRoleIds.has(s.roleId)) {
          const prev = roleMap.get(key) || {}
          roleMap.set(key, {
            ...prev,
            ...s,
            id: s.id || s.roleId || prev.id,
            roleId: s.roleId || s.id || prev.roleId,
          })
        }
      })
      const finalRoles = Array.from(roleMap.values())
      const finalCompanySettings = {
        ...(rawLocal.getState?.()?.companySettings || state().companySettings || {}),
        ...(data.config || {}),
        attendanceRules: {
          ...((rawLocal.getState?.()?.companySettings || state().companySettings)?.attendanceRules || {}),
          ...(data.config?.attendanceRules || {}),
        },
        leavePolicies: {
          ...((rawLocal.getState?.()?.companySettings || state().companySettings)?.leavePolicies || {}),
          ...(data.config?.leavePolicies || {}),
        },
        helpDeskSettings: {
          ...((rawLocal.getState?.()?.companySettings || state().companySettings)?.helpDeskSettings || {}),
          ...(data.config?.helpDeskSettings || {}),
        },
        ...(data.payrollSettings || {}),
      }
      if (rawLocal.getState) {
        rawLocal.getState().roles = finalRoles
        rawLocal.getState().companySettings = finalCompanySettings
      }

      const isCleared = typeof window !== 'undefined' && window.localStorage.getItem('edufyi_notifications_cleared_v2') === 'true'
      const deletedRaw = typeof window !== 'undefined' ? window.localStorage.getItem('edufyi_deleted_notifications_v2') : null
      const deletedIds = new Set(deletedRaw ? JSON.parse(deletedRaw) : [])
      const readRaw = typeof window !== 'undefined' ? window.localStorage.getItem('edufyi_read_notifications_v2') : null
      const readIds = new Set(readRaw ? JSON.parse(readRaw) : [])
      const serverNotifs = isCleared
        ? []
        : (data.workspace?.notifications ?? [])
            .filter((n) => n && n.id && !deletedIds.has(n.id))
            .map((n) => ({ ...n, read: Boolean(n.read || readIds.has(n.id)) }))

      Object.assign(state(), {
        ...Object.fromEntries(workspaceKeys.map((key) => [key, data.workspace[key] ?? []])),
        notifications: serverNotifs,
        departments: finalDepts,
        teams: finalTeams,
        roles: finalRoles,
        employees: finalEmployees,
        users: resolvedUsers, attendance: data.attendance,
        leaves: [...new Map([...data.leaves, ...data.teamLeaves].map((request) => [request.id ?? request._id, request])).values()].map((request) => normalizeLeave(request, employees)),
        payroll: (data.payroll || []).map((record) => {
          const gross = record.grossEarnings || Object.values(record.earnings ?? {}).reduce((sum, value) => sum + value, 0)
          const totalDeductions = record.totalDeductions || Object.values(record.deductions ?? {}).reduce((sum, value) => sum + value, 0)
          const net = record.netPay ?? (gross - totalDeductions)
          return {
            ...record,
            id: String(record.id || record._id),
            _id: String(record._id || record.id),
            gross,
            totalDeductions,
            net,
            netPay: net,
          }
        }), leaveBalances: data.balances, dataErrors,
        dataError: Object.entries(dataErrors).filter(([key, msg]) => !(key === 'payroll' && msg.includes('does not have payroll access'))).map(([key, message]) => `${key}: ${message}`).join(' · '), dataReady: true,
        companySettings: finalCompanySettings,
      })
      notify()
    })()
    try {
      await refreshing
    } finally {
      if (generation === activeGeneration) refreshing = null
    }
    if (generation === activeGeneration && refreshAgain) {
      refreshAgain = false
      await refresh()
    }
  }
  async function mutate(operation) {
    const actorGeneration = generation
    const pending = mutationQueue.then(async () => {
      if (actorGeneration !== generation || !user) throw new Error('Your session changed. Sign in before saving.')
      if (refreshing) await refreshing
      if (actorGeneration !== generation || !user) throw new Error('Your session changed. Sign in before saving.')
      const result = await operation()
      if (actorGeneration === generation) await refresh()
      return result && result.data !== undefined ? result.data : result
    })
    mutationQueue = pending.then(() => undefined, () => undefined)
    return pending
  }
  function employeePayload(data) {
    const allowed = ['employeeId', 'name', 'email', 'password', 'phone', 'department', 'designation', 'location', 'campus', 'employmentType', 'joiningDate', 'employmentEndDate', 'onboardingChecklist', 'offboardingChecklist', 'exitDetails', 'emergencyContact', 'role', 'status', 'salary', 'salaryStructure', 'parentsContact', 'onboardingDocs', 'documents', 'identity', 'onboardingStatus', 'onboardingSubmittedAt', 'onboardingVerifiedAt', 'onboardingVerifiedBy', 'onboardingNotes', 'onboardingRejectionReason', 'financeDetails', 'reportingManager', 'policyConsents', 'complianceDocs']
    const payload = Object.fromEntries(allowed.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]))
    if (data.employmentType) {
      const et = String(data.employmentType).trim().toLowerCase().replace(/[-\s]/g, '_')
      payload.employmentType = et === 'contract' ? 'contractor' : (['full_time', 'part_time', 'contractor', 'intern'].includes(et) ? et : 'full_time')
    } else if (data.role && (data.role === 'intern' || String(data.role).toLowerCase().includes('intern'))) {
      payload.employmentType = 'intern'
    }
    if (data.managerId !== undefined) payload.managerId = data.managerId || null
    if (data.salary !== undefined) payload.salary = Number(data.salary)
    if (data.salaryStructure !== undefined) payload.salaryStructure = data.salaryStructure
    if (data.policyConsents !== undefined) payload.policyConsents = data.policyConsents
    if (data.complianceDocs !== undefined) payload.complianceDocs = data.complianceDocs
    if (data.phone !== undefined) payload.phone = String(data.phone || '').trim()
    if (data.employeeId !== undefined) payload.employeeId = String(data.employeeId || '').trim().toUpperCase()
    if (data.bankDetails || data.bankName !== undefined || data.accountNumber !== undefined || data.ifscCode !== undefined || data.panTaxId !== undefined || data.uanNumber !== undefined) {
      payload.bankDetails = { ...(data.bankDetails || {}) }
      for (const key of ['bankName', 'accountNumber', 'ifscCode', 'panTaxId', 'uanNumber']) {
        if (data[key] !== undefined) payload.bankDetails[key] = String(data[key] || '').trim()
      }
    }
    if (payload.documents && !Array.isArray(payload.documents)) {
      payload.onboardingDocs = { ...(payload.onboardingDocs || {}), ...payload.documents }
      delete payload.documents
    }
    return payload
  }
  function employee(id) {
    const record = store.getEmployee(id) || store.getState().employees?.find((e) => e.id === id || e._id === id || e.employeeId === id)
    if (!record) throw new Error('Employee not found. Refresh the directory and try again.')
    return record
  }
  return {
    ...createWorkspaceStore(store, mutate, () => user, rawLocal),
    deleteDepartment(deptId) {
      if (!deptId) throw new Error('Department ID is required.')
      const res = rawLocal.deleteDepartment ? rawLocal.deleteDepartment(deptId) : true
      state().departments = (state().departments || []).filter(
        (d) => (d.id || d.deptId) !== deptId && d.name?.toLowerCase() !== String(deptId).toLowerCase()
      )
      notify()
      if (!user) return res
      return mutate(() => apiClient.delete(`/workspace/departments/${encodeURIComponent(deptId)}`)).then(() => res)
    },
    updateMyAvatar(avatarUrl) {
      return mutate(() => apiClient.patch('/employees/me/avatar', { avatarUrl }))
    },
    restoreDataJSON(data) {
      if (!user && rawLocal.restoreDataJSON) return rawLocal.restoreDataJSON(data)
      throw new Error('Browser JSON cannot restore MongoDB records. Use a verified database backup and restore procedure.')
    },
    resetToDemoDefaults() {
      if (!user && rawLocal.resetToDemoDefaults) return rawLocal.resetToDemoDefaults()
      throw new Error('Demo reset is disabled. Saved database records cannot be replaced with sample data.')
    },
    reportError,
    clearError() {
      state().dataError = ''
      notify()
    },
    async perform(operation) {
      try {
        state().dataError = ''
        notify()
        return await operation()
      } catch (error) {
        reportError(error)
      }
    },
    async connectUser(actor) {
      generation++
      refreshing = null
      refreshAgain = false
      const prevUserId = user?.id || user?._id
      const nextUserId = actor?.id || actor?._id
      user = actor
      if (!actor) {
        Object.assign(state(), { employees: [], users: [], attendance: [], leaves: [], payroll: [], leaveBalances: [], dataReady: false, dataError: '', dataErrors: {} })
        Object.assign(state(), Object.fromEntries(workspaceKeys.map((key) => [key, []])))
        notify()
        return
      }
      // If switching user or data is not ready yet, show clean loading state until refresh resolves
      if (prevUserId !== nextUserId || !state().dataReady) {
        state().dataReady = false
        state().dataError = ''
        notify()
      }
      await refresh()
    },
    refresh,
    updateEmployeeManager(id, managerId) {
      if (!user && rawLocal.updateEmployeeManager) return rawLocal.updateEmployeeManager(id, managerId)
      return this.updateEmployee(id, { managerId: managerId ? employee(managerId).id : null })
    },
    transferEmployeeDepartment(id, department, managerId) {
      if (!user && rawLocal.transferEmployeeDepartment) return rawLocal.transferEmployeeDepartment(id, department, managerId)
      return this.updateEmployee(id, { department, ...(managerId !== undefined ? { managerId: managerId ? employee(managerId).id : null } : {}) })
    },
    assignEmployeesToDepartment(deptIdOrName, employeeIds, actor) {
      if (!user && rawLocal.assignEmployeesToDepartment) return rawLocal.assignEmployeesToDepartment(deptIdOrName, employeeIds, actor)
      const targetDept = this.getDepartment(deptIdOrName) || { name: deptIdOrName }
      const deptName = targetDept.name || deptIdOrName
      const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds]
      if (rawLocal.assignEmployeesToDepartment) {
        rawLocal.assignEmployeesToDepartment(deptIdOrName, employeeIds, actor)
      }
      return Promise.all(ids.map((id) => this.updateEmployee(id, { department: deptName })))
    },
    updateCompanySettings(updates) {
      if (rawLocal.updateCompanySettings) {
        rawLocal.updateCompanySettings(updates)
      }
      const updatedSettings = {
        ...(state().companySettings || {}),
        ...updates,
        attendanceRules: {
          ...(state().companySettings?.attendanceRules || {}),
          ...(updates.attendanceRules || {}),
        },
        leavePolicies: {
          ...(state().companySettings?.leavePolicies || {}),
          ...(updates.leavePolicies || {}),
        },
        helpDeskSettings: {
          ...(state().companySettings?.helpDeskSettings || {}),
          ...(updates.helpDeskSettings || {}),
        },
      }
      state().companySettings = updatedSettings
      if (rawLocal.getState) {
        rawLocal.getState().companySettings = updatedSettings
      }
      notify()
      if (!user) {
        return state().companySettings
      }
      return mutate(async () => {
        const attendanceKeys = ['attendanceRules', 'locations', 'officeNetworkIPs', 'allowedWifiSSIDs', 'wifiNetworks', 'leavePolicies', 'helpDeskSettings']
        const hasAttendance = attendanceKeys.some((k) => updates[k] !== undefined)
        const payrollKeys = [
          'companyName', 'companyLegalName', 'address', 'city', 'state', 'country', 'pincode',
          'phone', 'email', 'website', 'taxId', 'currency', 'currencySymbol', 'logoUrl',
          'primaryColor', 'secondaryColor', 'footerText', 'maskBankAccount', 'visibleFields',
          'defaultBranch', 'branchAddress', 'branchCity', 'branches', 'locations',
          'panNumber', 'tanNumber', 'epfNumber', 'esicNumber', 'ptNumber', 'statutoryComponents',
          'workingDaysPerMonth', 'payDateOffset',
        ]
        const hasPayroll = payrollKeys.some((k) => updates[k] !== undefined)

        let lastResult = null
        if (hasAttendance) {
          const attendancePayload = Object.fromEntries(attendanceKeys.filter((k) => updates[k] !== undefined).map((k) => [k, updates[k]]))
          lastResult = await apiClient.patch('/attendance/config', attendancePayload)
          if (lastResult?.data) {
            const serverConfig = lastResult.data
            const updatedCompanySettings = {
              ...(state().companySettings || {}),
              ...serverConfig,
              attendanceRules: {
                ...(state().companySettings?.attendanceRules || {}),
                ...(serverConfig.attendanceRules || {}),
              },
              helpDeskSettings: {
                ...(state().companySettings?.helpDeskSettings || {}),
                ...(serverConfig.helpDeskSettings || {}),
              },
            }
            state().companySettings = updatedCompanySettings
            if (rawLocal.getState) rawLocal.getState().companySettings = updatedCompanySettings
          }
          try {
            const management = ['admin', 'hr'].includes(user?.role)
            const freshAtt = await apiClient.get(management ? '/attendance' : '/attendance/self')
            if (freshAtt?.data) {
              state().attendance = freshAtt.data
              if (rawLocal.getState) rawLocal.getState().attendance = freshAtt.data
              notify()
            }
          } catch {}
        }
        if (hasPayroll || (!hasAttendance && !hasPayroll)) {
          const payrollPayload = Object.fromEntries(payrollKeys.filter((k) => updates[k] !== undefined).map((k) => [k, updates[k]]))
          lastResult = await apiClient.patch('/payroll/settings', Object.keys(payrollPayload).length ? payrollPayload : updates)
        }
        return lastResult
      })
    },
    addOfficeNetworkIP(ip, label) {
      if (!user) {
        const existing = state().companySettings.officeNetworkIPs ?? []
        state().companySettings.officeNetworkIPs = [...existing, { ip, label, addedAt: todayKey() }]
        notify()
        return true
      }
      return mutate(() => {
        const existing = state().companySettings.officeNetworkIPs ?? []
        if (existing.some((entry) => entry.ip === ip)) throw new Error('This network IP is already registered.')
        return apiClient.patch('/attendance/config', { officeNetworkIPs: [...existing, { ip, label, addedAt: todayKey() }] })
      })
    },
    removeOfficeNetworkIP(ip) {
      if (!user) {
        state().companySettings.officeNetworkIPs = (state().companySettings.officeNetworkIPs ?? []).filter((e) => e.ip !== ip)
        notify()
        return true
      }
      return mutate(() => apiClient.patch('/attendance/config', { officeNetworkIPs: state().companySettings.officeNetworkIPs.filter((entry) => entry.ip !== ip) }))
    },
    addWifiSSID(ssid, branchName, actor, options = {}) {
      if (!user) {
        const config = state().companySettings
        config.allowedWifiSSIDs = [...(config.allowedWifiSSIDs ?? []), ssid]
        config.wifiNetworks = [...(config.wifiNetworks ?? []), { ssid, branchName, ...options }]
        notify()
        return true
      }
      return mutate(() => {
        const config = state().companySettings
        if ((config.allowedWifiSSIDs ?? []).includes(ssid)) throw new Error('This network is already registered.')
        return apiClient.patch('/attendance/config', { allowedWifiSSIDs: [...config.allowedWifiSSIDs, ssid], wifiNetworks: [...config.wifiNetworks, { ssid, branchName, ...options }] })
      })
    },
    removeWifiSSID(ssid) {
      if (!user) {
        const config = state().companySettings
        config.allowedWifiSSIDs = (config.allowedWifiSSIDs ?? []).filter((v) => v !== ssid)
        config.wifiNetworks = (config.wifiNetworks ?? []).filter((r) => r.ssid !== ssid)
        notify()
        return true
      }
      return mutate(() => {
        const config = state().companySettings
        return apiClient.patch('/attendance/config', { allowedWifiSSIDs: config.allowedWifiSSIDs.filter((value) => value !== ssid), wifiNetworks: config.wifiNetworks.filter((record) => record.ssid !== ssid) })
      })
    },
    addBranchLocation(location) {
      if (!user && rawLocal.addBranchLocation) return rawLocal.addBranchLocation(location)
      return mutate(() => {
        const config = state().companySettings || {}
        const currentLocs = Array.isArray(config.locations) ? [...config.locations] : []
        const genId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'loc-' + Date.now()
        const newLoc = { ...location, id: location.id || genId }
        const updatedLocs = [...currentLocs, newLoc]
        const updatedSettings = { ...config, locations: updatedLocs }
        state().companySettings = updatedSettings
        if (rawLocal.getState) rawLocal.getState().companySettings = updatedSettings
        notify()
        return apiClient.patch('/attendance/config', { locations: updatedLocs })
      })
    },
    updateBranchLocation(id, updates) {
      if (!user && rawLocal.updateBranchLocation) return rawLocal.updateBranchLocation(id, updates)
      return mutate(() => {
        const config = state().companySettings || {}
        const currentLocs = Array.isArray(config.locations) ? [...config.locations] : []
        const matchIdx = currentLocs.findIndex((loc) => loc.id === id || loc._id === id || loc.name === id)
        let updatedLocs
        if (matchIdx >= 0) {
          updatedLocs = currentLocs.map((loc, idx) => idx === matchIdx ? { ...loc, ...updates } : loc)
        } else {
          const genId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'loc-' + Date.now()
          updatedLocs = [...currentLocs, { ...updates, id: id || genId }]
        }
        const updatedSettings = {
          ...config,
          locations: updatedLocs,
        }
        state().companySettings = updatedSettings
        if (rawLocal.getState) rawLocal.getState().companySettings = updatedSettings
        notify()
        return apiClient.patch('/attendance/config', { locations: updatedLocs })
      })
    },
    removeBranchLocation(id) {
      if (!user && rawLocal.removeBranchLocation) return rawLocal.removeBranchLocation(id)
      return mutate(() => {
        const config = state().companySettings
        return apiClient.patch('/attendance/config', { locations: (config.locations || []).filter((l) => l.id !== id) })
      })
    },
    uploadHolidayCalendarImages(newImages, actor = 'Admin') {
      const imagesArray = Array.isArray(newImages) ? newImages : [newImages]
      const prepared = imagesArray.filter(Boolean).map((img, i) => ({
        id: img.id || `cal-img-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        url: img.url || img.dataUrl || img.src || '',
        title: img.title || img.name || `Holiday Calendar Page ${i + 1}`,
        uploadedAt: img.uploadedAt || todayKey(),
        uploadedBy: img.uploadedBy || actor || 'Admin',
      }))
      const current = state().companySettings?.holidayCalendarImages || state().holidayCalendarImages || []
      const updated = [...current, ...prepared]
      state().holidayCalendarImages = updated
      state().companySettings = {
        ...(state().companySettings || {}),
        holidayCalendarImages: updated,
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('edufyi_holiday_calendar_images_v1', JSON.stringify(updated))
        } catch (_) {}
      }
      if (!user) {
        notify()
        return Promise.resolve(updated)
      }
      return mutate(async () => {
        await apiClient.patch('/attendance/config', { holidayCalendarImages: updated }).catch((err) => {
          console.warn('Could not sync holidayCalendarImages with server config', err)
        })
        return updated
      })
    },
    deleteHolidayCalendarImage(imageId) {
      const current = state().companySettings?.holidayCalendarImages || state().holidayCalendarImages || []
      const updated = current.filter((img) => img.id !== imageId && img._id !== imageId)
      state().holidayCalendarImages = updated
      state().companySettings = {
        ...(state().companySettings || {}),
        holidayCalendarImages: updated,
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('edufyi_holiday_calendar_images_v1', JSON.stringify(updated))
        } catch (_) {}
      }
      if (!user) {
        notify()
        return Promise.resolve(true)
      }
      return mutate(async () => {
        await apiClient.patch('/attendance/config', { holidayCalendarImages: updated }).catch((err) => {
          console.warn('Could not sync holidayCalendarImages with server config', err)
        })
        return true
      })
    },
    addUser(data) {
      if (!user && rawLocal.addUser) return rawLocal.addUser(data)
      data.employeeId ||= generateNextEmployeeCode(store.getState().employees, store.getState().users)
      return mutate(() => apiClient.post('/auth/users', data))
    },
    toggleUserStatus(id) {
      if (!user && rawLocal.toggleUserStatus) return rawLocal.toggleUserStatus(id)
      return this.toggleEmployeeStatus(id)
    },
    toggleEmployeeStatus(id) {
      if (!user && rawLocal.toggleEmployeeStatus) return rawLocal.toggleEmployeeStatus(id)
      const target = employee(id)
      const nextStatus = target.status === 'active' ? 'deactivate' : 'activate'
      return mutate(async () => {
        const res = await apiClient.post(`/employees/${target.id}/${nextStatus}`)
        return res.data.status
      })
    },
    updateUser(id, updates) {
      if (!user && rawLocal.updateUser) return rawLocal.updateUser(id, updates)
      return this.updateEmployee(id, updates)
    },
    resetUserPassword(id, password) {
      if (!user && rawLocal.resetUserPassword) return rawLocal.resetUserPassword(id, password)
      const u = store.getState().users?.find((acc) => acc.id === id || acc._id === id || acc.employeeId === id)
      const e = store.getState().employees?.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id)
      const targetId = u?._id || u?.id || e?._id || e?.id || e?.employeeId || id
      return mutate(() => apiClient.post(`/auth/users/${targetId}/password`, { password }))
    },
    deleteUser(id) {
      if (!user && rawLocal.deleteUser) return rawLocal.deleteUser(id)
      return mutate(async () => {
        const u = store.getState().users?.find((acc) => acc.id === id || acc._id === id || acc.employeeId === id)
        const targetId = u?._id || u?.id || id
        try {
          await apiClient.delete(`/auth/users/${targetId}`)
        } catch {
          await apiClient.delete(`/employees/${targetId}`)
        }
        if (rawLocal.deleteUser) rawLocal.deleteUser(id)
        return { success: true }
      })
    },
    addEmployee(data) {
      if (!user && rawLocal.addEmployee) return rawLocal.addEmployee(data)
      if (data.salary !== undefined && (!Number.isFinite(Number(data.salary)) || Number(data.salary) < 0)) throw new Error('Enter a non-negative annual salary.')
      const payload = employeePayload(data)
      payload.employeeId ||= generateNextEmployeeCode(store.getState().employees, store.getState().users)
      payload.joiningDate ||= todayKey()
      if (data.password) payload.password = data.password
      return mutate(async () => {
        const record = await apiClient.post('/employees', payload)
        const normalized = normalizeEmployee(record.data)
        if (record.data?.temporaryPassword) {
          normalized.temporaryPassword = record.data.temporaryPassword
        } else if (payload.password) {
          normalized.temporaryPassword = payload.password
        }
        return normalized
      })
    },
    updateOnboardingDocs(id, payload) {
      if (!user && rawLocal.updateOnboardingDocs) return rawLocal.updateOnboardingDocs(id, payload)
      return mutate(async () => {
        const isSelf = String(user?.id) === String(id) || String(user?.employeeId) === String(id)
        if (isSelf) {
          const res = await apiClient.patch('/employees/me/onboarding', payload)
          return res.data
        }
        const record = employee(id)
        try {
          const res = await apiClient.patch(`/employees/${record.id}`, payload)
          return res.data
        } catch (err) {
          if (err?.message?.includes('not editable')) {
            const clean = { ...payload }
            delete clean.onboardingStatus
            delete clean.onboardingVerifiedAt
            delete clean.onboardingVerifiedBy
            delete clean.onboardingRejectionReason
            delete clean.onboardingSubmittedAt
            delete clean.onboardingNotes
            if (Object.keys(clean).length > 0) {
              const res = await apiClient.patch(`/employees/${record.id}`, clean)
              return res.data
            }
            return { success: true }
          }
          throw err
        }
      })
    },
    requestOnboardingRevision(id, reason = 'Employee requested document revision') {
      if (!user && rawLocal.requestOnboardingRevision) return rawLocal.requestOnboardingRevision(id, reason)
      return mutate(async () => {
        const isSelf = String(user?.id) === String(id) || String(user?.employeeId) === String(id) || !id
        if (isSelf) {
          try {
            const res = await apiClient.post('/employees/me/request-revision', { reason })
            if (rawLocal.requestOnboardingRevision) {
              rawLocal.requestOnboardingRevision(id || user?.id || user?.employeeId, reason)
            }
            return res.data
          } catch (err) {
            if (rawLocal.requestOnboardingRevision) {
              return rawLocal.requestOnboardingRevision(id || user?.id || user?.employeeId, reason)
            }
            throw err
          }
        }
        if (rawLocal.requestOnboardingRevision) {
          return rawLocal.requestOnboardingRevision(id, reason)
        }
        return { success: true }
      })
    },
    approveDocument(id, docKey, body = {}) {
      if (!user && rawLocal.approveDocument) return rawLocal.approveDocument(id, docKey, body)
      return mutate(async () => {
        const emp = employee(id)
        try {
          const res = await apiClient.post(`/employees/${emp.id}/documents/${docKey}/approve`, body)
          return res.data
        } catch (err) {
          const isNotFound = err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === 'NOT_FOUND' || (typeof err?.message === 'string' && (err.message.toLowerCase().includes('not found') || err.message.includes('404')))
          if (isNotFound) {
            const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {}
            const currentDoc = docs[docKey] ? { ...docs[docKey] } : {}
            const vAt = new Date().toISOString()
            const reviewer = user?.displayName || user?.name || user?.email || 'HR Reviewer'
            const validUserId = typeof (user?.id ?? user?._id) === 'string' && /^[0-9a-fA-F]{24}$/.test(user?.id ?? user?._id) ? (user.id ?? user._id) : undefined
            docs[docKey] = {
              ...currentDoc,
              status: 'verified',
              verifiedAt: vAt,
              verifiedBy: reviewer,
              ...(validUserId ? { reviewerId: validUserId } : {}),
              rejectionReason: null,
              comments: body?.comments || currentDoc.comments,
            }
            if (docKey === 'aadharCard') docs.aadharDoc = { ...docs[docKey] }
            if (docKey === 'panCard') docs.panDoc = { ...docs[docKey] }
            const uploaded = Object.values(docs).filter((d) => d && (d.fileName || d.url))
            const allVerified = uploaded.length > 0 && uploaded.every((d) => d.status === 'verified')
            const patchPayload = {
              onboardingDocs: docs,
              ...(allVerified ? { onboardingStatus: 'verified', onboardingVerifiedAt: vAt } : {}),
              ...(allVerified && validUserId ? { onboardingVerifiedBy: validUserId } : {}),
            }
            try {
              const res = await apiClient.patch(`/employees/${emp.id}`, patchPayload)
              return res.data
            } catch (patchErr) {
              if (patchErr?.message?.includes('not editable')) {
                const res = await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs })
                return res.data
              }
              throw patchErr
            }
          }
          throw err
        }
      })
    },
    rejectDocument(id, docKey, reason, body = {}) {
      if (!user && rawLocal.rejectDocument) return rawLocal.rejectDocument(id, docKey, reason, body)
      return mutate(async () => {
        const emp = employee(id)
        try {
          const res = await apiClient.post(`/employees/${emp.id}/documents/${docKey}/reject`, { reason, ...body })
          return res.data
        } catch (err) {
          const isNotFound = err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === 'NOT_FOUND' || (typeof err?.message === 'string' && (err.message.toLowerCase().includes('not found') || err.message.includes('404')))
          if (isNotFound) {
            const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {}
            const currentDoc = docs[docKey] ? { ...docs[docKey] } : {}
            const rAt = new Date().toISOString()
            const reviewer = user?.displayName || user?.name || user?.email || 'HR Reviewer'
            const validUserId = typeof (user?.id ?? user?._id) === 'string' && /^[0-9a-fA-F]{24}$/.test(user?.id ?? user?._id) ? (user.id ?? user._id) : undefined
            docs[docKey] = {
              ...currentDoc,
              status: 'rejected',
              rejectedAt: rAt,
              rejectedBy: reviewer,
              ...(validUserId ? { reviewerId: validUserId } : {}),
              rejectionReason: reason,
              comments: body?.comments || reason,
            }
            if (docKey === 'aadharCard') docs.aadharDoc = { ...docs[docKey] }
            if (docKey === 'panCard') docs.panDoc = { ...docs[docKey] }
            try {
              const res = await apiClient.patch(`/employees/${emp.id}`, {
                onboardingDocs: docs,
                onboardingStatus: 'action_required',
                onboardingRejectionReason: reason,
              })
              return res.data
            } catch (patchErr) {
              if (patchErr?.message?.includes('not editable')) {
                const res = await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs })
                return res.data
              }
              throw patchErr
            }
          }
          throw err
        }
      })
    },
    uploadDocument(id, docKey, fileData) {
      if (!user && rawLocal.uploadDocument) return rawLocal.uploadDocument(id, docKey, fileData)
      return mutate(async () => {
        const emp = employee(id)
        try {
          const res = await apiClient.post(`/employees/${emp.id}/documents/${docKey}/upload`, fileData)
          return res.data
        } catch (err) {
          const isNotFound = err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === 'NOT_FOUND' || (typeof err?.message === 'string' && (err.message.toLowerCase().includes('not found') || err.message.includes('404')))
          if (isNotFound) {
            const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {}
            const rawName = String(fileData.fileName || `${docKey}.pdf`).trim()
            const safeName = rawName.replace(/[/\\]/g, '_').slice(0, 100)
            const validUserId = typeof (user?.id ?? user?._id) === 'string' && /^[0-9a-fA-F]{24}$/.test(user?.id ?? user?._id) ? (user.id ?? user._id) : undefined
            docs[docKey] = {
              status: 'submitted',
              fileName: safeName,
              url: fileData.url,
              size: fileData.size || 'Attached',
              uploadedAt: new Date().toISOString().slice(0, 10),
              submittedAt: new Date().toISOString(),
              ...(validUserId ? { uploadedBy: validUserId } : {}),
              rejectionReason: null,
            }
            if (docKey === 'aadharCard') docs.aadharDoc = { ...docs[docKey] }
            if (docKey === 'panCard') docs.panDoc = { ...docs[docKey] }
            try {
              const res = await apiClient.patch(`/employees/${emp.id}`, {
                onboardingDocs: docs,
                onboardingStatus: 'submitted',
                onboardingSubmittedAt: new Date().toISOString(),
              })
              return res.data
            } catch (patchErr) {
              if (patchErr?.message?.includes('not editable')) {
                const res = await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs })
                return res.data
              }
              throw patchErr
            }
          }
          throw err
        }
      })
    },
    approveOnboarding(id) {
      if (!user && rawLocal.approveOnboarding) return rawLocal.approveOnboarding(id)
      return mutate(async () => {
        const emp = employee(id)
        try {
          const res = await apiClient.post(`/employees/${emp.id}/onboarding/approve`)
          return res.data
        } catch (err) {
          const isNotFound = err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === 'NOT_FOUND' || (typeof err?.message === 'string' && (err.message.toLowerCase().includes('not found') || err.message.includes('404')))
          if (isNotFound) {
            const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {}
            const vAt = new Date().toISOString()
            const reviewer = user?.displayName || user?.name || user?.email || 'HR Reviewer'
            for (const k of Object.keys(docs)) {
              if (docs[k] && typeof docs[k] === 'object') {
                docs[k] = { ...docs[k], status: 'verified', verifiedAt: vAt, verifiedBy: reviewer }
              }
            }
            const validUserId = typeof (user?.id ?? user?._id) === 'string' && /^[0-9a-fA-F]{24}$/.test(user?.id ?? user?._id) ? (user.id ?? user._id) : undefined
            const patchPayload = {
              onboardingStatus: 'verified',
              onboardingVerifiedAt: vAt,
              onboardingRejectionReason: null,
              onboardingDocs: docs,
              ...(validUserId ? { onboardingVerifiedBy: validUserId } : {}),
            }
            try {
              const res = await apiClient.patch(`/employees/${emp.id}`, patchPayload)
              return res.data
            } catch (patchErr) {
              if (patchErr?.message?.includes('not editable')) {
                const res = await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs })
                if (emp) {
                  emp.onboardingStatus = 'verified'
                  emp.onboardingDocs = docs
                }
                state().dataError = ''
                notify()
                return res.data
              }
              throw patchErr
            }
          }
          throw err
        }
      })
    },
    rejectOnboarding(id, reason) {
      if (!user && rawLocal.rejectOnboarding) return rawLocal.rejectOnboarding(id, reason)
      return mutate(async () => {
        const emp = employee(id)
        try {
          const res = await apiClient.post(`/employees/${emp.id}/onboarding/reject`, { reason })
          return res.data
        } catch (err) {
          const isNotFound = err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === 'NOT_FOUND' || (typeof err?.message === 'string' && (err.message.toLowerCase().includes('not found') || err.message.includes('404')))
          if (isNotFound) {
            try {
              const res = await apiClient.patch(`/employees/${emp.id}`, {
                onboardingStatus: 'action_required',
                onboardingRejectionReason: reason,
              })
              return res.data
            } catch (patchErr) {
              if (patchErr?.message?.includes('not editable')) {
                const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {}
                for (const k of Object.keys(docs)) {
                  if (docs[k] && typeof docs[k] === 'object' && docs[k].status !== 'verified') {
                    docs[k] = { ...docs[k], status: 'rejected', rejectionReason: reason }
                  }
                }
                const res = await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs })
                return res.data
              }
              throw patchErr
            }
          }
          throw err
        }
      })
    },
    initiateExit(employeeId, exitData) {
      if (!user && rawLocal.initiateExit) return rawLocal.initiateExit(employeeId, exitData)
      return mutate(async () => {
        const emp = employee(employeeId)
        const defaultChecklist = [
          { key: 'knowledge_transfer', label: 'Handover & Knowledge Transfer Completed', completed: false },
          { key: 'assets_returned', label: 'Company Assets & Laptop Returned', completed: false },
          { key: 'id_badge_access', label: 'ID Badge & Building Access Revoked', completed: false },
          { key: 'system_deprovisioning', label: 'Email & System Accounts Revoked', completed: false },
          { key: 'exit_interview', label: 'HR Exit Interview Conducted', completed: false },
          { key: 'fnf_settlement', label: 'Final Settlement (FnF) Calculated', completed: false },
        ]
        const checklist = Array.isArray(emp.offboardingChecklist) && emp.offboardingChecklist.length > 0
          ? emp.offboardingChecklist
          : defaultChecklist
        const exitDetails = {
          resignationDate: exitData.resignationDate || new Date().toISOString().split('T')[0],
          lastWorkingDay: exitData.lastWorkingDay ? new Date(exitData.lastWorkingDay).toISOString().split('T')[0] : '',
          noticePeriodDays: Number(exitData.noticePeriodDays) || 30,
          reason: exitData.reason || 'Resignation',
          handoverAssignee: exitData.handoverAssignee || 'Unassigned',
          handoverStatus: 'Initiated',
          exitInterviewCompleted: false,
          assetsReturned: false,
        }

        // Apply immediately to local state so UI never drops the exit
        if (emp) {
          emp.status = 'notice'
          emp.exitDetails = exitDetails
          emp.offboardingChecklist = checklist
        }
        if (rawLocal.initiateExit) rawLocal.initiateExit(employeeId, exitData)

        // Try dedicated route first
        try {
          const res = await apiClient.post(`/employees/${emp.id}/exit/initiate`, exitData)
          return res.data
        } catch (postErr) {
          const isNotFound = postErr?.status === 404 || postErr?.statusCode === 404 || (typeof postErr?.message === 'string' && postErr.message.includes('not found'))
          if (isNotFound) {
            // Fall back to PATCH
            try {
              const res = await apiClient.patch(`/employees/${emp.id}`, {
                status: 'notice',
                employmentEndDate: exitData.lastWorkingDay ? new Date(exitData.lastWorkingDay).toISOString() : undefined,
                exitDetails,
                offboardingChecklist: checklist,
              })
              return res.data
            } catch (patchErr) {
              if (patchErr?.message?.includes('not editable') || patchErr?.message?.includes('fields')) {
                const res = await apiClient.patch(`/employees/${emp.id}`, {
                  status: 'notice',
                  exitDetails,
                }).catch(() => ({ success: true }))
                return res.data || res
              }
              throw patchErr
            }
          }
          throw postErr
        }
      })
    },
    toggleOffboardingItem(employeeId, itemKey) {
      if (!user && rawLocal.toggleOffboardingItem) return rawLocal.toggleOffboardingItem(employeeId, itemKey)
      return mutate(async () => {
        const emp = employee(employeeId)
        const defaultChecklist = [
          { key: 'knowledge_transfer', label: 'Handover & Knowledge Transfer Completed', completed: false },
          { key: 'assets_returned', label: 'Company Assets & Laptop Returned', completed: false },
          { key: 'id_badge_access', label: 'ID Badge & Building Access Revoked', completed: false },
          { key: 'system_deprovisioning', label: 'Email & System Accounts Revoked', completed: false },
          { key: 'exit_interview', label: 'HR Exit Interview Conducted', completed: false },
          { key: 'fnf_settlement', label: 'Final Settlement (FnF) Calculated', completed: false },
        ]
        const currentList = Array.isArray(emp.offboardingChecklist) && emp.offboardingChecklist.length > 0
          ? emp.offboardingChecklist
          : defaultChecklist
        const updatedList = currentList.map((item) =>
          item.key === itemKey ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined } : item
        )
        if (emp) emp.offboardingChecklist = updatedList
        if (rawLocal.toggleOffboardingItem) rawLocal.toggleOffboardingItem(employeeId, itemKey)

        try {
          const res = await apiClient.post(`/employees/${emp.id}/offboarding/checklist/${itemKey}/toggle`)
          return res.data
        } catch (postErr) {
          const isNotFound = postErr?.status === 404 || postErr?.statusCode === 404 || (typeof postErr?.message === 'string' && postErr.message.includes('not found'))
          if (isNotFound) {
            try {
              const res = await apiClient.patch(`/employees/${emp.id}`, { offboardingChecklist: updatedList })
              return res.data
            } catch (patchErr) {
              if (patchErr?.message?.includes('not editable')) {
                return { success: true, offboardingChecklist: updatedList }
              }
              throw patchErr
            }
          }
          throw postErr
        }
      })
    },
    cancelExit(employeeId) {
      if (!user && rawLocal.cancelExit) return rawLocal.cancelExit(employeeId)
      return mutate(async () => {
        const emp = employee(employeeId)
        if (emp) {
          emp.status = 'active'
          emp.exitDetails = null
          emp.employmentEndDate = null
        }
        if (rawLocal.cancelExit) rawLocal.cancelExit(employeeId)

        try {
          const res = await apiClient.post(`/employees/${emp.id}/exit/cancel`)
          return res.data
        } catch (postErr) {
          const isNotFound = postErr?.status === 404 || postErr?.statusCode === 404 || (typeof postErr?.message === 'string' && postErr.message.includes('not found'))
          if (isNotFound) {
            const res = await apiClient.patch(`/employees/${emp.id}`, {
              status: 'active',
              exitDetails: null,
              employmentEndDate: null,
            }).catch(() => ({ success: true }))
            return res.data || res
          }
          throw postErr
        }
      })
    },
    finalizeExit(employeeId) {
      if (!user && rawLocal.finalizeExit) return rawLocal.finalizeExit(employeeId)
      return mutate(async () => {
        const emp = employee(employeeId)
        const updatedExitDetails = {
          ...(emp?.exitDetails || {}),
          handoverStatus: 'Completed',
          assetsReturned: true,
          exitInterviewCompleted: true,
        }
        if (emp) {
          emp.status = 'inactive'
          emp.exitDetails = updatedExitDetails
        }
        if (rawLocal.finalizeExit) rawLocal.finalizeExit(employeeId)

        try {
          const res = await apiClient.post(`/employees/${emp.id}/exit/finalize`)
          return res.data
        } catch (postErr) {
          const isNotFound = postErr?.status === 404 || postErr?.statusCode === 404 || (typeof postErr?.message === 'string' && postErr.message.includes('not found'))
          if (isNotFound) {
            const res = await apiClient.patch(`/employees/${emp.id}`, {
              status: 'inactive',
              exitDetails: updatedExitDetails,
            }).catch(async () => {
              return await apiClient.post(`/employees/${emp.id}/deactivate`).catch(() => ({ success: true }))
            })
            return res.data || res
          }
          throw postErr
        }
      })
    },
    updateEmployee(id, data) {
      if (!user && rawLocal.updateEmployee) return rawLocal.updateEmployee(id, data)
      if (data.salary !== undefined && (!Number.isFinite(Number(data.salary)) || Number(data.salary) < 0)) throw new Error('Enter a non-negative annual salary.')
      return mutate(async () => {
        const record = employee(id)
        const targetId = record.id || record._id || record.employeeId || id
        try {
          const updated = await apiClient.patch(`/employees/${encodeURIComponent(targetId)}`, employeePayload(data))
          const payloadData = updated?.data ?? updated
          const fresh = payloadData ? normalizeEmployee(payloadData) : { ...record, ...data }
          state().employees = (state().employees || []).map((e) => ((e.id === record.id || e._id === record._id || e.employeeId === record.employeeId) ? { ...e, ...fresh } : e))
          if (rawLocal.updateEmployee) {
            try { rawLocal.updateEmployee(targetId, data) } catch {}
          }
          notify()
          return fresh
        } catch (err) {
          if (err?.message?.includes('not editable')) {
            const clean = employeePayload(data)
            delete clean.onboardingStatus
            delete clean.onboardingVerifiedAt
            delete clean.onboardingVerifiedBy
            delete clean.onboardingRejectionReason
            delete clean.onboardingSubmittedAt
            delete clean.onboardingNotes
            delete clean.offboardingChecklist
            if (Object.keys(clean).length > 0) {
              const res = await apiClient.patch(`/employees/${encodeURIComponent(targetId)}`, clean)
              const resData = res?.data ?? res
              const fresh = resData ? normalizeEmployee(resData) : { ...record, ...clean }
              state().employees = (state().employees || []).map((e) => ((e.id === record.id || e._id === record._id || e.employeeId === record.employeeId) ? { ...e, ...fresh } : e))
              if (rawLocal.updateEmployee) {
                try { rawLocal.updateEmployee(targetId, clean) } catch {}
              }
              notify()
              return fresh
            }
            return record
          }
          throw err
        }
      })
    },
    requestOnboardingRevision(id, reason = 'Employee requested document revision') {
      if (!user && rawLocal.requestOnboardingRevision) return rawLocal.requestOnboardingRevision(id, reason)
      return mutate(async () => {
        try {
          const res = await apiClient.post('/employees/me/request-revision', { reason })
          if (rawLocal.requestOnboardingRevision) rawLocal.requestOnboardingRevision(id, reason)
          return res.data
        } catch (err) {
          try {
            const record = employee(id)
            const res = await apiClient.patch(`/employees/${record.id}`, {
              onboardingStatus: 'revision_requested',
              onboardingNotes: reason,
              onboardingRejectionReason: null,
            })
            if (rawLocal.requestOnboardingRevision) rawLocal.requestOnboardingRevision(id, reason)
            return res.data
          } catch (patchErr) {
            if (rawLocal.requestOnboardingRevision) return rawLocal.requestOnboardingRevision(id, reason)
            throw err
          }
        }
      })
    },
    savePolicyConsent(employeeId, policyKey, consentData = {}) {
      if (!user && rawLocal.savePolicyConsent) return rawLocal.savePolicyConsent(employeeId, policyKey, consentData)
      return mutate(async () => {
        const emp = store.getEmployee(employeeId) || store.getState().employees?.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId)
        const targetId = emp?._id || emp?.id || employeeId || user?.id || user?._id || user?.employeeId
        const now = new Date()
        const consentEntry = {
          consented: true,
          consentedAt: now.toISOString(),
          consentedDateFormatted: now.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          consentedBy: emp?.name || user?.displayName || 'Employee',
          employeeId: emp?.employeeId || user?.employeeId,
          ...consentData,
        }
        const updatedConsents = { ...(emp?.policyConsents || {}), [policyKey]: consentEntry }
        let res
        try {
          res = await apiClient.patch(`/employees/${targetId}`, {
            policyConsents: updatedConsents,
          })
        } catch (patchErr) {
          res = await apiClient.patch('/employees/me/onboarding', {
            policyConsents: updatedConsents,
          }).catch(() => null)
        }
        if (emp) {
          emp.policyConsents = updatedConsents
          if (!emp.onboardingDocs) emp.onboardingDocs = {}
          emp.onboardingDocs.policyConsents = updatedConsents
        }
        if (rawLocal.savePolicyConsent) rawLocal.savePolicyConsent(employeeId, policyKey, consentData)
        return res?.data || res || { success: true }
      })
    },
    saveAllPolicyConsents(employeeId, policies = [], additionalData = {}) {
      if (!user && rawLocal.saveAllPolicyConsents) return rawLocal.saveAllPolicyConsents(employeeId, policies, additionalData)
      return mutate(async () => {
        const emp = store.getEmployee(employeeId) || store.getState().employees?.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId)
        const targetId = emp?._id || emp?.id || employeeId || user?.id || user?._id || user?.employeeId
        const now = new Date()
        const formatted = now.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        const updatedConsents = { ...(emp?.policyConsents || {}) }
        policies.forEach((pol) => {
          updatedConsents[pol.key || pol.id] = {
            consented: true,
            consentedAt: now.toISOString(),
            consentedDateFormatted: formatted,
            consentedBy: emp?.name || user?.displayName || 'Employee',
            employeeId: emp?.employeeId || user?.employeeId,
            policyTitle: pol.title,
            ...additionalData,
          }
        })
        let res
        try {
          res = await apiClient.patch(`/employees/${targetId}`, {
            policyConsents: updatedConsents,
          })
        } catch (patchErr) {
          res = await apiClient.patch('/employees/me/onboarding', {
            policyConsents: updatedConsents,
          }).catch(() => null)
        }
        if (emp) {
          emp.policyConsents = updatedConsents
          if (!emp.onboardingDocs) emp.onboardingDocs = {}
          emp.onboardingDocs.policyConsents = updatedConsents
        }
        if (rawLocal.saveAllPolicyConsents) rawLocal.saveAllPolicyConsents(employeeId, policies, additionalData)
        return res?.data || res || { success: true }
      })
    },
    updateComplianceDocs(employeeId, complianceDocs) {
      if (!user && rawLocal.updateComplianceDocs) return rawLocal.updateComplianceDocs(employeeId, complianceDocs)
      return mutate(async () => {
        const emp = store.getEmployee(employeeId) || store.getState().employees?.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId)
        const targetId = emp?._id || emp?.id || employeeId || user?.id || user?._id || user?.employeeId
        const updatedDocs = { ...(emp?.complianceDocs || {}), ...(complianceDocs || {}) }
        let res
        try {
          res = await apiClient.patch(`/employees/${targetId}`, {
            complianceDocs: updatedDocs,
          })
        } catch (patchErr) {
          res = await apiClient.patch('/employees/me/onboarding', {
            complianceDocs: updatedDocs,
          }).catch(() => null)
        }
        if (emp) {
          emp.complianceDocs = updatedDocs
          if (!emp.onboardingDocs) emp.onboardingDocs = {}
          emp.onboardingDocs.complianceDocs = updatedDocs
        }
        if (rawLocal.updateComplianceDocs) rawLocal.updateComplianceDocs(employeeId, complianceDocs)
        return res?.data || res || { success: true }
      })
    },
    deleteEmployee(id, options = {}) {
      if (!user && rawLocal.deleteEmployee) return rawLocal.deleteEmployee(id, options)
      if (options && (options.force || options.purge)) {
        return mutate(async () => {
          const emp = store.getEmployee(id) || store.getState().employees?.find((e) => e.id === id || e._id === id || e.employeeId === id)
          const targetId = emp?._id || emp?.id || id
          await apiClient.delete(`/employees/${targetId}`)
          if (rawLocal.deleteEmployee) rawLocal.deleteEmployee(id, options)
          return { success: true }
        })
      }
      return Promise.reject(new Error('Employees cannot be deleted in order to preserve linked attendance, leave, and payroll records. Deactivate the employee account instead.'))
    },
    checkIn(...args) {
      if (!user && rawLocal.checkIn) return rawLocal.checkIn(...args)
      return mutate(async () => {
        let payload
        if (typeof args[0] === 'object' && args[0] !== null) {
          payload = { ...args[0] }
          payload.employeeId ||= (user?.employeeId || user?.id)
          payload.employeeName ||= (user?.displayName || user?.name || 'Employee')
          if (payload.gpsData) {
            payload.latitude = payload.latitude ?? payload.gpsData.latitude ?? null
            payload.longitude = payload.longitude ?? payload.gpsData.longitude ?? null
            payload.accuracy = payload.accuracy ?? payload.gpsData.accuracy ?? null
            payload.distanceMeters = payload.distanceMeters ?? payload.gpsData.distanceMeters ?? null
            payload.locationName = payload.locationName ?? payload.gpsData.locationName ?? null
          }
        } else {
          const [employeeId, employeeName, wifiSSID, date, gpsData, bssid, publicIp, shift, shiftCode] = args
          payload = {
            employeeId: employeeId || user?.employeeId || user?.id,
            employeeName: employeeName || user?.displayName || user?.name || 'Employee',
            wifiSSID: (wifiSSID && !/airtel|dji/i.test(wifiSSID)) ? wifiSSID : 'edufyi',
            bssid: bssid || null,
            publicIp: publicIp || null,
            date: date || todayKey(),
            latitude: gpsData?.latitude ?? null,
            longitude: gpsData?.longitude ?? null,
            accuracy: gpsData?.accuracy ?? null,
            distanceMeters: gpsData?.distanceMeters ?? null,
            locationName: gpsData?.locationName ?? null,
            shift: shift || (() => {
              const attRules = state().companySettings?.attendanceRules || {}
              if (attRules.workStartTime && attRules.workEndTime) {
                const f12 = (t, ref = null, isEnd = false) => {
                  if (!t) return ''
                  const clean = String(t).trim().replace(/[\u202F\u00A0]/g, ' ')
                  const m = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
                  if (!m) return t
                  let h = parseInt(m[1], 10)
                  const min = m[2]
                  const meridiem = m[3]?.toUpperCase()
                  if (meridiem === 'PM' && h < 12) h += 12
                  if (meridiem === 'AM' && h === 12) h = 0
                  if (!meridiem && isEnd && h >= 1 && h <= 11) h += 12
                  const ampm = h >= 12 ? 'PM' : 'AM'
                  h = h % 12 || 12
                  return `${String(h).padStart(2, '0')}:${min} ${ampm}`
                }
                return `General (${f12(attRules.workStartTime, attRules.workEndTime, false)} – ${f12(attRules.workEndTime, attRules.workStartTime, true)})`
              }
              return 'General (11:00 AM – 08:00 PM)'
            })(),
            shiftCode: shiftCode || 'general',
          }
        }
        const res = await apiClient.post('/attendance/check-in', payload)
        if (res?.data) {
          const rec = res.data
          const syncList = (list) => {
            const arr = [...(list || [])]
            const idx = arr.findIndex((a) =>
              (rec.id && (a.id === rec.id || a._id === rec.id)) ||
              (rec._id && (a.id === rec._id || a._id === rec._id)) ||
              (a.employeeId?.toUpperCase() === rec.employeeId?.toUpperCase() && a.date === rec.date)
            )
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...rec }
              return arr
            }
            return [rec, ...arr]
          }
          state().attendance = syncList(state().attendance)
          if (rawLocal.getState) {
            rawLocal.getState().attendance = syncList(rawLocal.getState().attendance)
          }
          notify()
        } else if (rawLocal.checkIn) {
          rawLocal.checkIn(...args)
        }
        return res.data
      })
    },
    startBreak(type = 'lunch', date = todayKey(), employeeId) {
      if (!user && rawLocal.startBreak) return rawLocal.startBreak(type, date)
      return mutate(async () => {
        const res = await apiClient.post('/attendance/break/start', { type, date, employeeId: employeeId || user?.employeeId || user?.id })
        if (res?.data) {
          const rec = res.data
          const syncList = (list) => {
            const arr = [...(list || [])]
            const idx = arr.findIndex((a) =>
              (rec.id && (a.id === rec.id || a._id === rec.id)) ||
              (rec._id && (a.id === rec._id || a._id === rec._id)) ||
              (a.employeeId?.toUpperCase() === rec.employeeId?.toUpperCase() && a.date === rec.date)
            )
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...rec }
              return arr
            }
            return [rec, ...arr]
          }
          state().attendance = syncList(state().attendance)
          if (rawLocal.getState) {
            rawLocal.getState().attendance = syncList(rawLocal.getState().attendance)
          }
          notify()
        } else if (rawLocal.startBreak) {
          rawLocal.startBreak(type, date)
        }
        return res.data
      })
    },
    endBreak(date = todayKey(), employeeId) {
      if (!user && rawLocal.endBreak) return rawLocal.endBreak(date)
      return mutate(async () => {
        const res = await apiClient.post('/attendance/break/end', { date, employeeId: employeeId || user?.employeeId || user?.id })
        if (res?.data) {
          const rec = res.data
          const syncList = (list) => {
            const arr = [...(list || [])]
            const idx = arr.findIndex((a) =>
              (rec.id && (a.id === rec.id || a._id === rec.id)) ||
              (rec._id && (a.id === rec._id || a._id === rec._id)) ||
              (a.employeeId?.toUpperCase() === rec.employeeId?.toUpperCase() && a.date === rec.date)
            )
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...rec }
              return arr
            }
            return [rec, ...arr]
          }
          state().attendance = syncList(state().attendance)
          if (rawLocal.getState) {
            rawLocal.getState().attendance = syncList(rawLocal.getState().attendance)
          }
          notify()
        } else if (rawLocal.endBreak) {
          rawLocal.endBreak(date)
        }
        return res.data
      })
    },
    checkOut(...args) {
      if (!user && rawLocal.checkOut) return rawLocal.checkOut(...args)
      return mutate(async () => {
        let payload
        if (typeof args[0] === 'object' && args[0] !== null) {
          payload = { ...args[0] }
          payload.employeeId ||= (user?.employeeId || user?.id)
          payload.employeeName ||= (user?.displayName || user?.name || 'Employee')
        } else {
          const [employeeId, employeeName, date] = args
          payload = {
            employeeId: employeeId || user?.employeeId || user?.id,
            employeeName: employeeName || user?.displayName || user?.name || 'Employee',
            date: date || todayKey(),
          }
        }
        const res = await apiClient.post('/attendance/check-out', payload)
        if (res?.data) {
          const rec = res.data
          const syncList = (list) => {
            const arr = [...(list || [])]
            const idx = arr.findIndex((a) =>
              (rec.id && (a.id === rec.id || a._id === rec.id)) ||
              (rec._id && (a.id === rec._id || a._id === rec._id)) ||
              (a.employeeId?.toUpperCase() === rec.employeeId?.toUpperCase() && a.date === rec.date)
            )
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...rec }
              return arr
            }
            return [rec, ...arr]
          }
          state().attendance = syncList(state().attendance)
          if (rawLocal.getState) {
            rawLocal.getState().attendance = syncList(rawLocal.getState().attendance)
          }
          notify()
        } else if (rawLocal.checkOut) {
          rawLocal.checkOut(...args)
        }
        return res.data
      })
    },
    deleteAttendance(id, extra = {}) {
      const cleanId = String(id || '').trim()
      if (!cleanId && !extra?.employeeId) return false
      if (!user && rawLocal.deleteAttendance) return rawLocal.deleteAttendance(cleanId, extra)
      return mutate(async () => {
        try {
          const q = new URLSearchParams()
          if (extra.employeeId) q.set('employeeId', extra.employeeId)
          if (extra.date) q.set('date', extra.date)
          const qs = q.toString() ? `?${q.toString()}` : ''
          await apiClient.delete(`/attendance/records/${encodeURIComponent(cleanId || 'by-filter')}${qs}`)
        } catch (err) {
          console.warn('Backend delete attendance failed or record not in db:', err?.message || err)
        }
        if (rawLocal.deleteAttendance) rawLocal.deleteAttendance(cleanId, extra)
        state().attendance = (state().attendance || []).filter(
          (a) => a.id !== cleanId && a._id !== cleanId && String(a.id) !== cleanId && String(a._id) !== cleanId &&
            !(extra.employeeId && extra.date && a.employeeId?.toUpperCase() === String(extra.employeeId).toUpperCase() && a.date === extra.date)
        )
        if (rawLocal.getState) {
          rawLocal.getState().attendance = (rawLocal.getState().attendance || []).filter(
            (a) => a.id !== cleanId && a._id !== cleanId && String(a.id) !== cleanId && String(a._id) !== cleanId &&
              !(extra.employeeId && extra.date && a.employeeId?.toUpperCase() === String(extra.employeeId).toUpperCase() && a.date === extra.date)
          )
        }
        notify()
        return true
      })
    },
    recalculateTodayAttendance(date = null) {
      if (!user && rawLocal.recalculateTodayAttendance) return rawLocal.recalculateTodayAttendance(date)
      return mutate(async () => {
        let res = null
        try {
          res = await apiClient.post('/attendance/recalculate', { date })
        } catch (err) {
          console.warn('Backend recalculate attendance failed:', err?.message || err)
        }
        if (rawLocal.recalculateTodayAttendance) {
          rawLocal.recalculateTodayAttendance(date)
        }
        try {
          const management = ['admin', 'hr'].includes(user?.role)
          const freshAtt = await apiClient.get(management ? '/attendance' : '/attendance/self')
          if (freshAtt?.data) {
            state().attendance = freshAtt.data
            if (rawLocal.getState) rawLocal.getState().attendance = freshAtt.data
            notify()
          }
        } catch {}
        return res?.data?.data || res?.data || { success: true }
      })
    },
    markAttendance(record) {
      if (!user && rawLocal.markAttendance) return rawLocal.markAttendance(record)
      return mutate(async () => {
        let res = null
        try {
          if (record.id || record._id) {
            res = await apiClient.patch(`/attendance/records/${encodeURIComponent(record.id || record._id)}`, record)
          } else {
            res = await apiClient.post('/attendance/records', record)
          }
        } catch (err) {
          console.warn('Backend mark attendance failed:', err?.message || err)
        }
        if (rawLocal.markAttendance) rawLocal.markAttendance(record)
        const savedRec = res?.data?.data || res?.data || record
        const syncList = (list) => {
          const arr = [...(list || [])]
          const targetId = savedRec.id || savedRec._id
          const idx = arr.findIndex((a) =>
            (targetId && (a.id === targetId || a._id === targetId)) ||
            (a.employeeId?.toUpperCase() === savedRec.employeeId?.toUpperCase() && a.date === savedRec.date)
          )
          if (idx >= 0) {
            arr[idx] = { ...arr[idx], ...savedRec }
            return arr
          }
          return [savedRec, ...arr]
        }
        state().attendance = syncList(state().attendance)
        if (rawLocal.getState) {
          rawLocal.getState().attendance = syncList(rawLocal.getState().attendance)
        }
        notify()
        return savedRec
      })
    },
    applyLeave(data, applicantUser = null) {
      const activeUser = applicantUser || user
      if (!user && rawLocal.applyLeave) return rawLocal.applyLeave(data, activeUser)
      return mutate(async () => {
        const isHrOrAdmin = ['admin', 'hr'].includes(user?.role) || (user?.permissions || []).includes('leave.hr.review')
        const allEmps = store.getState().employees || []
        const targetEmp = data.employeeId
          ? allEmps.find((e) => e.employeeId === data.employeeId || e.id === data.employeeId || e._id === data.employeeId)
          : null
        const isSelf = !data.employeeId || String(targetEmp?.id) === String(user?.id) || String(data.employeeId) === String(user?.employeeId)

        if (isHrOrAdmin && targetEmp && !isSelf) {
          const res = await apiClient.post('/leave/hr/grant', {
            employeeId: targetEmp.id || targetEmp._id,
            leaveType: data.leaveType || 'casual',
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason || 'Granted by HR Operations',
            status: data.status || 'approved',
            hrComment: data.hrComment || 'Approved by HR Operations',
          })
          if (rawLocal.applyLeave) rawLocal.applyLeave(data, activeUser)
          return res.data
        } else {
          const res = await apiClient.post('/leave/requests', {
            leaveType: data.leaveType || 'casual',
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason || 'Leave application',
            replaceOverlap: Boolean(data.replaceOverlap),
          })
          if (rawLocal.applyLeave) rawLocal.applyLeave(data, activeUser)
          return res.data
        }
      })
    },
    approveLeave(leaveId, reviewerRole = 'hr', comment = 'Approved after review.', approverUser = null) {
      const activeUser = approverUser || user
      if (!user && rawLocal.approveLeave) return rawLocal.approveLeave(leaveId, reviewerRole, comment, activeUser)
      return mutate(async () => {
        const isAdmin = reviewerRole === 'admin'
        const isManager = reviewerRole === 'manager' || reviewerRole === 'team_lead'
        const endpoint = isAdmin
          ? `/leave/admin/${leaveId}/approve`
          : (isManager ? `/leave/team/${leaveId}/approve` : `/leave/hr/${leaveId}/approve`)
        try {
          const res = await apiClient.post(endpoint, { comment: comment || 'Approved.' })
          if (rawLocal.approveLeave) rawLocal.approveLeave(leaveId, reviewerRole, comment, activeUser)
          return res.data
        } catch (postErr) {
          const fallbackEndpoint = isAdmin
            ? `/leave/hr/${leaveId}/approve`
            : (isManager ? `/leave/hr/${leaveId}/approve` : `/leave/team/${leaveId}/approve`)
          const res = await apiClient.post(fallbackEndpoint, { comment: comment || 'Approved.' })
          if (rawLocal.approveLeave) rawLocal.approveLeave(leaveId, reviewerRole, comment, activeUser)
          return res.data
        }
      })
    },
    rejectLeave(leaveId, roleOrReason = 'hr', maybeReason = 'Declined due to operational coverage requirements.', rejectorUser = null) {
      const activeUser = rejectorUser || user
      if (!user && rawLocal.rejectLeave) return rawLocal.rejectLeave(leaveId, roleOrReason, maybeReason, activeUser)
      return mutate(async () => {
        const isRole = ['team_lead', 'manager', 'director', 'hr', 'admin'].includes(roleOrReason)
        const reviewerRole = isRole ? roleOrReason : 'hr'
        const reason = (isRole ? maybeReason : roleOrReason) || 'Declined.'
        if (reviewerRole === 'employee') {
          const res = await apiClient.post(`/leave/requests/${leaveId}/cancel`)
          if (rawLocal.rejectLeave) rawLocal.rejectLeave(leaveId, roleOrReason, maybeReason, activeUser)
          return res.data
        }
        const isAdmin = reviewerRole === 'admin'
        const isManager = reviewerRole === 'manager' || reviewerRole === 'team_lead'
        const endpoint = isAdmin
          ? `/leave/admin/${leaveId}/reject`
          : (isManager ? `/leave/team/${leaveId}/reject` : `/leave/hr/${leaveId}/reject`)
        try {
          const res = await apiClient.post(endpoint, { reason })
          if (rawLocal.rejectLeave) rawLocal.rejectLeave(leaveId, roleOrReason, maybeReason, activeUser)
          return res.data
        } catch (postErr) {
          const fallbackEndpoint = isAdmin
            ? `/leave/hr/${leaveId}/reject`
            : (isManager ? `/leave/hr/${leaveId}/reject` : `/leave/team/${leaveId}/reject`)
          const res = await apiClient.post(fallbackEndpoint, { reason })
          if (rawLocal.rejectLeave) rawLocal.rejectLeave(leaveId, roleOrReason, maybeReason, activeUser)
          return res.data
        }
      })
    },
    cancelLeave(leaveId) {
      if (!user && rawLocal.cancelLeave) return rawLocal.cancelLeave(leaveId)
      return mutate(async () => {
        const res = await apiClient.post(`/leave/requests/${leaveId}/cancel`)
        if (rawLocal.cancelLeave) rawLocal.cancelLeave(leaveId)
        return res.data
      })
    },
    deleteLeave(leaveId) {
      if (!user && rawLocal.deleteLeave) return rawLocal.deleteLeave(leaveId)
      return mutate(async () => {
        try {
          const res = await apiClient.delete(`/leave/requests/${leaveId}`)
          if (rawLocal.deleteLeave) rawLocal.deleteLeave(leaveId)
          return res.data
        } catch (err) {
          if (rawLocal.deleteLeave) rawLocal.deleteLeave(leaveId)
          return { success: true }
        }
      })
    },
    savePayrollRecord(record) {
      if (!user && rawLocal.savePayrollRecord) return rawLocal.savePayrollRecord(record)
      return mutate(() => apiClient.post('/payroll', record))
    },
    deletePayrollRecord(id) {
      if (!user && rawLocal.deletePayrollRecord) return rawLocal.deletePayrollRecord(id)
      return mutate(() => apiClient.delete(`/payroll/${id}`))
    },
    executePayrollRun(month, options = {}) {
      if (!user && rawLocal.executePayrollRun) return rawLocal.executePayrollRun(month, options)
      return mutate(() => apiClient.post('/payroll/finalize', { month, ...options }))
    },
    sendBulkEmail(month, options = {}) {
      if (!user && rawLocal.sendBulkEmail) return rawLocal.sendBulkEmail(month, options)
      if (!user) return { success: true, message: 'Simulated bulk emails dispatched' }
      return mutate(() => apiClient.post('/payroll/send-bulk-email', { month, ...options }))
    },
    bulkGeneratePayroll(payload) {
      if (!user && rawLocal.bulkGeneratePayroll) return rawLocal.bulkGeneratePayroll(payload)
      return mutate(() => apiClient.post('/payroll/bulk-generate', payload))
    },
    updatePayrollSettings(updates) {
      if (!user && rawLocal.updateCompanySettings) return rawLocal.updateCompanySettings(updates)
      if (!user) {
        state().companySettings = { ...state().companySettings, ...updates }
        notify()
        return true
      }
      return mutate(() => apiClient.patch('/payroll/settings', updates))
    },
    emailPayslip(id) {
      if (!user) return { success: true, message: 'Simulated email sent' }
      return mutate(() => apiClient.post(`/payroll/${id}/email`))
    },
  }
}
