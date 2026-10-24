import express from 'express'
import { PERMISSIONS } from '../../auth/permissions.js'

function directoryRecord(employee) {
  const fields = ['id', 'employeeId', 'name', 'displayName', 'email', 'department', 'designation', 'role', 'status', 'location']
  return {
    ...Object.fromEntries(fields.filter((field) => employee[field] !== undefined).map((field) => [field, employee[field]])),
    id: String(employee._id ?? employee.id),
    managerId: employee.managerId ? String(employee.managerId._id ?? employee.managerId.id ?? employee.managerId) : null,
  }
}

async function directory(repository) {
  const records = []
  let page = 1
  let total
  do {
    const result = await repository.list({ page: page++, limit: 100 })
    records.push(...result.records.map(directoryRecord))
    total = result.meta.total
  } while (records.length < total)
  return records
}

function isDefaultAdminOrHr(emp) {
  if (!emp) return false
  const role = String(emp.role || '').toLowerCase()
  const empId = String(emp.employeeId || '').toUpperCase()
  const id = String(emp.id || emp._id || '')
  const name = String(emp.name || '').trim().toLowerCase()
  return (
    empId === 'EDU-ADM-001' ||
    id === 'emp-3' ||
    id === 'user-admin-1' ||
    (role === 'admin' && (name === 'admin' || empId === 'EDU-ADM-001')) ||
    empId === 'EDU-HR-001' ||
    id === 'emp-4' ||
    (role === 'hr' && (name === 'hr' || empId === 'EDU-HR-001'))
  )
}

function buildHierarchyTree(rawEmployees = [], rootId = null) {
  const employees = rawEmployees.filter((e) => !isDefaultAdminOrHr(e))
  const byId = new Map()
  const childrenMap = new Map()

  employees.forEach((emp) => {
    const id = String(emp._id ?? emp.id)
    let effectiveMgrId = emp.managerId ? String(emp.managerId) : null
    if (effectiveMgrId === 'emp-3' || effectiveMgrId === 'EDU-ADM-001' || effectiveMgrId === 'emp-4' || effectiveMgrId === 'EDU-HR-001') {
      effectiveMgrId = null
    }
    byId.set(id, { ...emp, id, managerId: effectiveMgrId, children: [] })
    childrenMap.set(id, [])
  })

  // Also map by employeeId if referenced that way
  employees.forEach((emp) => {
    if (emp.employeeId) {
      const id = String(emp._id ?? emp.id)
      byId.set(emp.employeeId, byId.get(id))
    }
  })

  employees.forEach((emp) => {
    const id = String(emp._id ?? emp.id)
    const node = byId.get(id)
    const mgrId = node?.managerId
    if (mgrId && byId.has(mgrId)) {
      const actualMgrId = String(byId.get(mgrId)._id ?? byId.get(mgrId).id)
      if (actualMgrId !== id) {
        if (!childrenMap.has(actualMgrId)) childrenMap.set(actualMgrId, [])
        childrenMap.get(actualMgrId).push(id)
      }
    }
  })

  function calculateTeamCounts(nodeId) {
    const node = byId.get(nodeId)
    if (!node) return { direct: 0, total: 0 }
    const childIds = childrenMap.get(nodeId) || []
    node.children = childIds.map((cid) => byId.get(cid)).filter(Boolean)
    node.directReportCount = node.children.length
    let total = node.children.length
    node.children.forEach((c) => {
      const childCount = calculateTeamCounts(String(c._id ?? c.id))
      total += childCount.total
    })
    node.totalTeamCount = total
    return { direct: node.directReportCount, total }
  }

  let roots = []
  if (rootId) {
    const target = byId.get(String(rootId))
    if (target) {
      calculateTeamCounts(String(target._id ?? target.id))
      roots = [target]
    }
  } else {
    // Find top-level roots (no manager or manager not in list)
    roots = employees
      .filter((emp) => {
        const node = byId.get(String(emp._id ?? emp.id))
        const mgrId = node?.managerId
        return !mgrId || !byId.has(mgrId)
      })
      .map((emp) => byId.get(String(emp._id ?? emp.id)))
      .filter(Boolean)

    roots.forEach((root) => {
      calculateTeamCounts(String(root._id ?? root.id))
    })
  }

  return { roots, byId }
}

function buildScopedHierarchy(rawEmployees, user) {
  const employees = rawEmployees.filter((e) => !isDefaultAdminOrHr(e))
  const byId = new Map()
  employees.forEach((emp) => {
    const id = String(emp._id ?? emp.id)
    byId.set(id, emp)
    if (emp.employeeId) byId.set(emp.employeeId, emp)
    if (emp.email) byId.set(emp.email.toLowerCase(), emp)
  })

  const targetEmp = byId.get(String(user.id)) ||
    byId.get(String(user._id)) ||
    (user.employeeId && byId.get(user.employeeId)) ||
    (user.email && byId.get(user.email.toLowerCase()))

  if (!targetEmp) {
    const { roots } = buildHierarchyTree(employees)
    return { roots, scoped: false, chain: [] }
  }

  // 1. Trace upward chain to top root
  const chain = []
  let curr = targetEmp
  const visited = new Set()
  while (curr) {
    const id = String(curr._id ?? curr.id)
    if (visited.has(id)) break
    visited.add(id)
    chain.unshift(curr)
    if (!curr.managerId) break
    const mgr = byId.get(String(curr.managerId))
    if (!mgr) break
    curr = mgr
  }

  const chainRoot = chain[0] || targetEmp
  const topRootId = String(chainRoot._id ?? chainRoot.id)

  // 2. Collect all subordinates of targetEmp (downward)
  const subordinateIds = new Set()
  function collectSubordinates(parentEmpId) {
    employees.forEach((e) => {
      const eId = String(e._id ?? e.id)
      const mgrId = e.managerId ? String(e.managerId) : null
      if (mgrId === parentEmpId && !subordinateIds.has(eId)) {
        subordinateIds.add(eId)
        collectSubordinates(eId)
      }
    })
  }
  collectSubordinates(String(targetEmp._id ?? targetEmp.id))

  // 3. User specification: "as manager I can see whom under I am and under me who is all tree will see not see another part"
  // Sibling branches and parallel peers are excluded. Only the direct upward chain + downward subordinates are visible.
  const chainIds = new Set(chain.map((c) => String(c._id ?? c.id)))
  const allowedIds = new Set([...chainIds, ...subordinateIds])

  // Filter employees to only allowed nodes
  const filteredEmployees = employees.filter((e) => allowedIds.has(String(e._id ?? e.id)))

  // Build tree rooted at top of the reporting chain
  const { roots } = buildHierarchyTree(filteredEmployees, topRootId)

  return {
    roots,
    scoped: true,
    chain,
    targetEmployee: targetEmp,
  }
}

function checkCircularAssignment(employees, employeeId, newManagerId) {
  if (!newManagerId) return { valid: true }
  if (String(employeeId) === String(newManagerId)) {
    return { valid: false, message: 'An employee cannot be assigned as their own reporting manager.' }
  }

  const byId = new Map(employees.map((e) => [String(e._id ?? e.id), e]))
  employees.forEach((e) => {
    if (e.employeeId) byId.set(e.employeeId, e)
  })

  const targetEmp = byId.get(String(employeeId))
  const newMgr = byId.get(String(newManagerId))

  if (!targetEmp) return { valid: false, message: 'Employee not found.' }
  if (!newMgr) return { valid: false, message: 'Target reporting manager not found.' }

  // Walk up the hierarchy from newManagerId
  let current = newMgr
  const visited = new Set()

  while (current && current.managerId) {
    const parentId = String(current.managerId)
    if (parentId === String(employeeId) || parentId === targetEmp.employeeId) {
      return {
        valid: false,
        message: `Circular reporting relationship detected: ${newMgr.name || newMgr.displayName} is in ${targetEmp.name || targetEmp.displayName}'s reporting chain.`,
      }
    }
    if (visited.has(parentId)) break
    visited.add(parentId)
    current = byId.get(parentId)
  }

  return { valid: true }
}

export function createHierarchyRouter({ auth, repository }) {
  const router = express.Router()
  router.get('/directory', auth.authenticate, async (request, response, next) => {
    try {
      response.json({ success: true, data: await directory(repository) })
    } catch (error) { next(error) }
  })

  // 1. Get Organization Hierarchy (Full tree for Admin/HR, scoped upward-chain + downward-reports for Manager/Employee)
  router.get('/', auth.authenticate, async (req, res, next) => {
    try {
      const user = req.auth?.user || {}
      const isAdminOrHr = user.role === 'admin' || user.role === 'hr'

      const employees = await directory(repository)

      // Allow Admin/HR to preview viewAs scope if requested
      const simulatedEmpId = (isAdminOrHr && (req.query.viewAs || req.query.scopeUser)) ? String(req.query.viewAs || req.query.scopeUser) : null

      let roots = []
      let isScoped = false
      let chain = []

      if (!isAdminOrHr) {
        // Manager / Team Lead / Employee: strictly scoped to upward management chain + downward subordinates
        const scopedResult = buildScopedHierarchy(employees, user)
        roots = scopedResult.roots
        isScoped = true
        chain = scopedResult.chain
      } else if (simulatedEmpId) {
        const simulatedUser = { id: simulatedEmpId, role: 'employee' }
        const scopedResult = buildScopedHierarchy(employees, simulatedUser)
        roots = scopedResult.roots
        isScoped = true
        chain = scopedResult.chain
      } else {
        // Admin and HR see full organization tree
        const result = buildHierarchyTree(employees)
        roots = result.roots
        isScoped = false
      }

      // Gather department statistics (scoped to visible employees if scoped)
      const visibleEmployees = isScoped && roots.length > 0
        ? (() => {
            const list = []
            function traverse(node) {
              if (!node) return
              list.push(node)
              ;(node.children || []).forEach(traverse)
            }
            roots.forEach(traverse)
            return list
          })()
        : employees

      const deptMap = new Map()
      visibleEmployees.forEach((e) => {
        const dept = e.department || 'General'
        if (!deptMap.has(dept)) {
          deptMap.set(dept, { name: dept, employeeCount: 0, activeCount: 0, head: null })
        }
        const item = deptMap.get(dept)
        item.employeeCount++
        if (e.status === 'active') item.activeCount++
        if (!item.head && (e.designation?.toLowerCase().includes('head') || e.designation?.toLowerCase().includes('director') || e.designation?.toLowerCase().includes('manager'))) {
          item.head = { id: e.id, name: e.name || e.displayName, designation: e.designation }
        }
      })

      const stats = {
        totalEmployees: visibleEmployees.length,
        activeEmployees: visibleEmployees.filter((e) => e.status === 'active').length,
        totalDepartments: deptMap.size,
        departments: Array.from(deptMap.values()),
      }

      return res.json({
        success: true,
        data: {
          roots,
          stats,
          departments: Array.from(deptMap.keys()),
          scoped: isScoped,
          chain: chain.map((c) => ({
            id: String(c._id ?? c.id),
            employeeId: c.employeeId,
            name: c.name || c.displayName,
            designation: c.designation,
            role: c.role,
            department: c.department,
          })),
        },
      })
    } catch (err) {
      return next(err)
    }
  })

  // 2. Get Department Specific Subtree
  router.get('/department/:dept', auth.authenticate, async (req, res, next) => {
    try {
      const deptName = decodeURIComponent(req.params.dept)
      const allEmployees = await directory(repository)

      const deptEmployees = allEmployees.filter(
        (e) => (e.department || '').toLowerCase() === deptName.toLowerCase()
      )

      if (deptEmployees.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `No employees found in department '${deptName}'` },
        })
      }

      // Department head or top manager in this department
      const deptHeads = deptEmployees.filter((e) => {
        const mgr = allEmployees.find(
          (m) => String(m._id ?? m.id) === String(e.managerId) || m.employeeId === String(e.managerId)
        )
        return !mgr || (mgr.department || '').toLowerCase() !== deptName.toLowerCase()
      })

      const rootNode = deptHeads[0] || deptEmployees[0]
      const { roots } = buildHierarchyTree(allEmployees, rootNode._id ?? rootNode.id)

      return res.json({
        success: true,
        data: {
          department: deptName,
          totalInDepartment: deptEmployees.length,
          root: roots[0] || null,
        },
      })
    } catch (err) {
      return next(err)
    }
  })

  // 3. Get Reporting Chain for a given Employee
  router.get('/chain/:id', auth.authenticate, async (req, res, next) => {
    try {
      const employees = await directory(repository)
      const byId = new Map(employees.map((e) => [String(e._id ?? e.id), e]))
      employees.forEach((e) => {
        if (e.employeeId) byId.set(e.employeeId, e)
      })

      const target = byId.get(String(req.params.id))
      if (!target) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Employee not found.' },
        })
      }

      const chain = []
      let curr = target
      const visited = new Set()

      while (curr) {
        const id = String(curr._id ?? curr.id)
        if (visited.has(id)) break
        visited.add(id)
        chain.unshift({
          id,
          employeeId: curr.employeeId,
          name: curr.name || curr.displayName,
          designation: curr.designation,
          department: curr.department,
          role: curr.role,
          status: curr.status,
          managerId: curr.managerId,
        })

        if (!curr.managerId) break
        curr = byId.get(String(curr.managerId))
      }

      return res.json({ success: true, data: { employee: target, chain } })
    } catch (err) {
      return next(err)
    }
  })

  // 4. Update Employee Manager (Strictly Admin and HR only)
  router.patch(
    '/manager',
    auth.authenticate,
    async (req, res, next) => {
      try {
        const user = req.auth?.user || {}
        if (user.role !== 'admin' && user.role !== 'hr') {
          return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Reporting manager updates are restricted to Admin and HR roles only.' },
          })
        }

        const { employeeId, newManagerId } = req.body || {}
        if (!employeeId) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required.' },
          })
        }

        const employees = await directory(repository)

        const check = checkCircularAssignment(employees, employeeId, newManagerId)
        if (!check.valid) {
          return res.status(400).json({
            success: false,
            error: { code: 'CIRCULAR_DEPENDENCY', message: check.message },
          })
        }

        const emp = await repository.findForUpdate(employeeId)
        if (!emp) {
          return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Employee not found.' },
          })
        }

        let newManagerName = null
        if (newManagerId) {
          const mgr = employees.find(
            (e) => String(e._id ?? e.id) === String(newManagerId) || e.employeeId === String(newManagerId)
          )
          newManagerName = mgr ? (mgr.name || mgr.displayName) : null
        }

        emp.managerId = newManagerId || null
        emp.managerName = newManagerName
        await repository.save(emp)

        if (repository.addAudit) {
          await repository.addAudit({
            actorId: req.auth.user.id,
            actorRole: req.auth.user.role,
            action: 'MANAGER_REASSIGNMENT',
            entityType: 'employee',
            entityId: employeeId,
            changedFields: ['managerId', 'managerName'],
            reason: `Reassigned reporting manager to ${newManagerName || 'None (Company Root)'}`,
          })
        }

        return res.json({
          success: true,
          data: emp,
          message: `Successfully updated reporting manager for ${emp.name || emp.displayName}.`,
        })
      } catch (err) {
        return next(err)
      }
    }
  )

  // 5. Transfer Department (Strictly Admin and HR only)
  router.patch(
    '/department',
    auth.authenticate,
    async (req, res, next) => {
      try {
        const user = req.auth?.user || {}
        if (user.role !== 'admin' && user.role !== 'hr') {
          return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Department transfers are restricted to Admin and HR roles only.' },
          })
        }

        const { employeeId, newDepartment, newManagerId } = req.body || {}
        if (!employeeId || !newDepartment) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Employee ID and new department are required.' },
          })
        }

        const employees = await directory(repository)

        if (newManagerId) {
          const check = checkCircularAssignment(employees, employeeId, newManagerId)
          if (!check.valid) {
            return res.status(400).json({
              success: false,
              error: { code: 'CIRCULAR_DEPENDENCY', message: check.message },
            })
          }
        }

        const emp = await repository.findForUpdate(employeeId)
        if (!emp) {
          return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Employee not found.' },
          })
        }

        emp.department = newDepartment
        if (newManagerId !== undefined) {
          const mgr = employees.find(
            (e) => String(e._id ?? e.id) === String(newManagerId) || e.employeeId === String(newManagerId)
          )
          emp.managerId = newManagerId || null
          emp.managerName = mgr ? (mgr.name || mgr.displayName) : null
        }

        await repository.save(emp)

        if (repository.addAudit) {
          await repository.addAudit({
            actorId: req.auth.user.id,
            actorRole: req.auth.user.role,
            action: 'DEPARTMENT_TRANSFER',
            entityType: 'employee',
            entityId: employeeId,
            changedFields: ['department', 'managerId'],
            reason: `Transferred to ${newDepartment}`,
          })
        }

        return res.json({
          success: true,
          data: emp,
          message: `Successfully transferred ${emp.name || emp.displayName} to ${newDepartment}.`,
        })
      } catch (err) {
        return next(err)
      }
    }
  )

  return router
}
