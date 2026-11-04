import fs from 'fs'
import path from 'path'

const filePath = path.resolve('server/src/modules/workspace/workspace.routes.js')
let content = fs.readFileSync(filePath, 'utf8')

// Helper for exact replacement
function safeReplace(str, target, replacement) {
  const targetCRLF = target.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
  const targetLF = target.replace(/\r\n/g, '\n')
  
  if (str.includes(targetCRLF)) {
    const idx = str.indexOf(targetCRLF)
    const repCRLF = replacement.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
    return str.slice(0, idx) + repCRLF + str.slice(idx + targetCRLF.length)
  }
  if (str.includes(targetLF)) {
    const idx = str.indexOf(targetLF)
    const repLF = replacement.replace(/\r\n/g, '\n')
    return str.slice(0, idx) + repLF + str.slice(idx + targetLF.length)
  }
  throw new Error('Target not found:\n' + target.slice(0, 100))
}

// 1. Add import
content = safeReplace(
  content,
  "import { ensureConnected } from '../leave/leave.repository.js'",
  "import { ensureConnected } from '../leave/leave.repository.js'\nimport { invalidateEmployeeListCache } from '../employees/employee.repository.js'"
)

// 2. In list(actor, resource, people): enhance teams list calculation
const oldListEnd = `    const result = records.map((record) => serialize(resource, record, actor, people))`

const newListTeams = `    if (resource === 'teams') {
      let teamDocs = await models.teams.find(query).sort({ createdAt: -1 }).lean()
      if (teamDocs.length === 0) {
        // Auto-discover squads already assigned to employees in MongoDB
        const empsWithTeams = await Employee.find({
          $or: [
            { team: { $nin: ['', null] } },
            { squad: { $nin: ['', null] } },
          ],
          status: { $ne: 'terminated' },
        }).select('_id name employeeId team teamId squad squadId department role managerId').lean()

        const teamMap = new Map()
        for (const emp of empsWithTeams) {
          const tName = String(emp.team || emp.squad || '').trim()
          if (!tName) continue
          const key = tName.toLowerCase()
          if (!teamMap.has(key)) {
            teamMap.set(key, {
              teamId: emp.teamId || emp.squadId || \`team-\${key.replace(/[^a-z0-9]/g, '_')}\`,
              name: tName,
              department: emp.department || 'Revenue Growth',
              teamLeadId: emp.role === 'team_lead' ? String(emp._id) : null,
              teamLeadName: emp.role === 'team_lead' ? emp.name : '',
              managerId: emp.managerId ? String(emp.managerId) : null,
              description: \`\${tName} operational squad\`,
              flaggedForVerification: false,
            })
          }
        }
        if (teamMap.size > 0) {
          const docsToInsert = Array.from(teamMap.values()).map((t) => ({
            ownerId: id(actor),
            ...t,
          }))
          await models.teams.insertMany(docsToInsert).catch(() => { })
          teamDocs = await models.teams.find(query).sort({ createdAt: -1 }).lean()
        }
      }

      const allEmps = await Employee.find({ status: { $ne: 'terminated' } })
        .select('_id name employeeId team teamId squad squadId department role designation')
        .lean()

      return teamDocs.map((t) => {
        const teamKey = String(t.teamId || t.id || t._id || '').toLowerCase()
        const teamNameKey = String(t.name || '').toLowerCase()
        const teamSlug = \`team-\${teamNameKey.replace(/[^a-z0-9]/g, '_')}\`
        const members = allEmps.filter((e) => {
          const eTeam = String(e.team || '').toLowerCase()
          const eTeamId = String(e.teamId || '').toLowerCase()
          const eSquad = String(e.squad || '').toLowerCase()
          const eSquadId = String(e.squadId || '').toLowerCase()
          return (
            (eTeamId && (eTeamId === teamKey || eTeamId === teamSlug)) ||
            (eTeam && (eTeam === teamNameKey || eTeam === teamKey)) ||
            (eSquadId && (eSquadId === teamKey || eSquadId === teamSlug)) ||
            (eSquad && (eSquad === teamNameKey || eSquad === teamKey))
          )
        })
        return {
          ...serialize('teams', t, actor, people),
          memberCount: members.length,
          members: members.map((m) => ({
            id: String(m._id),
            _id: String(m._id),
            employeeId: m.employeeId,
            name: m.name,
            role: m.role,
            designation: m.designation,
            department: m.department,
          })),
        }
      })
    }
    const result = records.map((record) => serialize(resource, record, actor, people))`

content = safeReplace(content, oldListEnd, newListTeams)

// 3. Add handleAssignTeamMembers and its routes right before router.param('resource')
const oldBeforeParam = `  router.param('resource', (req, res, next, resource) => {`

const newAssignHandlers = `  // Authoritative Squad / Team Member Assignment Endpoint
  const handleAssignTeamMembers = async (req, res, next) => {
    try {
      const actor = req.auth.user
      if (!management(actor)) throw fail('HR or administrator access is required to assign squad members.', 403)
      const teamIdentifier = req.params.id || req.body.teamId || req.body.id
      if (!teamIdentifier) throw fail('Team identifier is required.', 400)
      const { employeeIds = [], department, teamLeadId, managerId } = req.body

      const escapedId = String(teamIdentifier).replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')
      let query = mongoose.isValidObjectId(teamIdentifier)
        ? { $or: [{ _id: teamIdentifier }, { teamId: teamIdentifier }] }
        : { $or: [{ teamId: teamIdentifier }, { name: new RegExp(\`^\${escapedId}$\`, 'i') }] }

      let team = await models.teams.findOne(query)
      const teamName = team?.name || req.body.name || teamIdentifier
      const cleanTeamId = team?.teamId || (team?._id ? String(team._id) : \`team-\${teamName.toLowerCase().replace(/[^a-z0-9]/g, '_')}\`)
      const teamDept = team?.department || department || 'Revenue Growth'

      if (!team) {
        team = await models.teams.create({
          ownerId: id(actor),
          teamId: cleanTeamId,
          name: teamName,
          department: teamDept,
          teamLeadId: teamLeadId || null,
          managerId: managerId || null,
          description: \`\${teamName} operational squad\`,
        })
      }

      const strIds = employeeIds.map(String).filter(Boolean)
      const validObjIds = strIds.filter((sid) => mongoose.isValidObjectId(sid))
      const codeList = Array.from(new Set([
        ...strIds,
        ...strIds.map((sid) => sid.toUpperCase()),
        ...strIds.map((sid) => sid.toLowerCase()),
      ]))

      // 1. Assign selected employees to this team
      if (strIds.length > 0) {
        const assignFilter = {
          $or: [
            ...(validObjIds.length ? [{ _id: { $in: validObjIds } }] : []),
            { employeeId: { $in: codeList } },
            { email: { $in: strIds.map((s) => s.toLowerCase()) } },
          ],
        }
        const assignUpdates = {
          team: teamName,
          teamId: cleanTeamId,
          squad: teamName,
          squadId: cleanTeamId,
        }
        if (teamDept) assignUpdates.department = teamDept
        if (team?.teamLeadId) {
          assignUpdates.teamLeadId = team.teamLeadId
          assignUpdates.teamLeadName = team.teamLeadName || ''
        }
        if (team?.managerId) {
          assignUpdates.managerId = team.managerId
          assignUpdates.managerName = team.managerName || ''
        }
        await Employee.updateMany(assignFilter, { $set: assignUpdates })
      }

      // 2. Unassign any employees who were previously in this team but deselected
      const escapedTeamName = teamName.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')
      const unassignFilter = {
        $or: [
          { teamId: cleanTeamId },
          { squadId: cleanTeamId },
          { team: new RegExp(\`^\${escapedTeamName}$\`, 'i') },
          { squad: new RegExp(\`^\${escapedTeamName}$\`, 'i') },
        ],
      }
      if (strIds.length > 0) {
        unassignFilter.$nor = [
          ...(validObjIds.length ? [{ _id: { $in: validObjIds } }] : []),
          { employeeId: { $in: codeList } },
        ]
      }
      await Employee.updateMany(unassignFilter, {
        $set: { team: '', teamId: '', squad: '', squadId: '' },
      })

      invalidateEmployeeListCache()

      // Count fresh roster directly from DB
      const assignedCount = await Employee.countDocuments({
        $or: [
          { teamId: cleanTeamId },
          { squadId: cleanTeamId },
          { team: new RegExp(\`^\${escapedTeamName}$\`, 'i') },
          { squad: new RegExp(\`^\${escapedTeamName}$\`, 'i') },
        ],
        status: { $ne: 'terminated' },
      })

      res.json({
        success: true,
        data: {
          id: cleanTeamId,
          teamId: cleanTeamId,
          name: teamName,
          department: teamDept,
          assignedCount,
        },
      })
    } catch (error) { next(error) }
  }

  router.post('/teams/:id/assign', handleAssignTeamMembers)
  router.put('/teams/:id/assign', handleAssignTeamMembers)
  router.post('/teams/:id/members', handleAssignTeamMembers)
  router.put('/teams/:id/members', handleAssignTeamMembers)
  router.post('/teams/assign', handleAssignTeamMembers)
  router.put('/teams/assign', handleAssignTeamMembers)

  router.param('resource', (req, res, next, resource) => {`

content = safeReplace(content, oldBeforeParam, newAssignHandlers)

// 4. In POST /teams: auto-resolve managerName and teamLeadName
const oldPostTeams = `        case 'teams':
          allowedBody(body, ['teamId', 'id', 'name', 'department', 'managerId', 'managerName', 'teamLeadId', 'teamLeadName', 'description', 'flaggedForVerification', 'verificationNote'])
          values = {
            ...values,
            teamId: string(body, 'teamId', false, 100) || string(body, 'id', false, 100) || \`team-\${string(body, 'name', true, 100).toLowerCase().replace(/[^a-z0-9]/g, '_')}\`,
            name: string(body, 'name', true, 100),
            department: string(body, 'department', false, 100) || 'Revenue Growth',
            managerId: string(body, 'managerId', false, 100) || null,
            managerName: string(body, 'managerName', false, 100) || '',
            teamLeadId: string(body, 'teamLeadId', false, 100) || null,
            teamLeadName: string(body, 'teamLeadName', false, 100) || '',
            description: string(body, 'description', false, 1000) || '',
            flaggedForVerification: Boolean(body.flaggedForVerification),
            verificationNote: string(body, 'verificationNote', false, 500) || '',
          }
          break`

const newPostTeams = `        case 'teams': {
          allowedBody(body, ['teamId', 'id', 'name', 'department', 'managerId', 'managerName', 'teamLeadId', 'teamLeadName', 'description', 'flaggedForVerification', 'verificationNote'])
          let mgrName = string(body, 'managerName', false, 100) || ''
          let tlName = string(body, 'teamLeadName', false, 100) || ''
          const mgrId = string(body, 'managerId', false, 100) || null
          const tlId = string(body, 'teamLeadId', false, 100) || null
          if (mgrId && !mgrName) {
            try {
              const mDoc = await Employee.findOne(mongoose.isValidObjectId(mgrId) ? { _id: mgrId } : { employeeId: mgrId }).select('name').lean()
              if (mDoc) mgrName = mDoc.name
            } catch { }
          }
          if (tlId && !tlName) {
            try {
              const tlDoc = await Employee.findOne(mongoose.isValidObjectId(tlId) ? { _id: tlId } : { employeeId: tlId }).select('name').lean()
              if (tlDoc) tlName = tlDoc.name
            } catch { }
          }
          values = {
            ...values,
            teamId: string(body, 'teamId', false, 100) || string(body, 'id', false, 100) || \`team-\${string(body, 'name', true, 100).toLowerCase().replace(/[^a-z0-9]/g, '_')}\`,
            name: string(body, 'name', true, 100),
            department: string(body, 'department', false, 100) || 'Revenue Growth',
            managerId: mgrId,
            managerName: mgrName,
            teamLeadId: tlId,
            teamLeadName: tlName,
            description: string(body, 'description', false, 1000) || '',
            flaggedForVerification: Boolean(body.flaggedForVerification),
            verificationNote: string(body, 'verificationNote', false, 500) || '',
          }
          invalidateEmployeeListCache()
          break
        }`

content = safeReplace(content, oldPostTeams, newPostTeams)

// 5. In PATCH /teams: auto-resolve managerName and teamLeadName
const oldPatchTeams = `      } else if (resource === 'teams') {
        if (!management(actor)) throw fail('HR or administrator access is required to update teams.', 403)
        allowedBody(req.body, ['name', 'department', 'managerId', 'managerName', 'teamLeadId', 'teamLeadName', 'description', 'flaggedForVerification', 'verificationNote'])
        update = { $set: {} }
        if (req.body.name !== undefined) update.$set.name = string(req.body, 'name', true, 100)
        if (req.body.department !== undefined) update.$set.department = string(req.body, 'department', false, 100)
        if (req.body.managerId !== undefined) update.$set.managerId = req.body.managerId ? string(req.body, 'managerId', false, 100) : null
        if (req.body.managerName !== undefined) update.$set.managerName = string(req.body, 'managerName', false, 100)
        if (req.body.teamLeadId !== undefined) update.$set.teamLeadId = req.body.teamLeadId ? string(req.body, 'teamLeadId', false, 100) : null
        if (req.body.teamLeadName !== undefined) update.$set.teamLeadName = string(req.body, 'teamLeadName', false, 100)
        if (req.body.description !== undefined) update.$set.description = string(req.body, 'description', false, 1000)
        if (req.body.flaggedForVerification !== undefined) update.$set.flaggedForVerification = Boolean(req.body.flaggedForVerification)
        if (req.body.verificationNote !== undefined) update.$set.verificationNote = string(req.body, 'verificationNote', false, 500)
        query = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { teamId: recordId }] } : { teamId: recordId }`

const newPatchTeams = `      } else if (resource === 'teams') {
        if (!management(actor)) throw fail('HR or administrator access is required to update teams.', 403)
        allowedBody(req.body, ['name', 'department', 'managerId', 'managerName', 'teamLeadId', 'teamLeadName', 'description', 'flaggedForVerification', 'verificationNote'])
        update = { $set: {} }
        if (req.body.name !== undefined) update.$set.name = string(req.body, 'name', true, 100)
        if (req.body.department !== undefined) update.$set.department = string(req.body, 'department', false, 100)
        if (req.body.managerId !== undefined) {
          update.$set.managerId = req.body.managerId ? string(req.body, 'managerId', false, 100) : null
          let mName = string(req.body, 'managerName', false, 100) || ''
          if (update.$set.managerId && !mName) {
            try {
              const mDoc = await Employee.findOne(mongoose.isValidObjectId(update.$set.managerId) ? { _id: update.$set.managerId } : { employeeId: update.$set.managerId }).select('name').lean()
              if (mDoc) mName = mDoc.name
            } catch { }
          }
          update.$set.managerName = mName
        } else if (req.body.managerName !== undefined) {
          update.$set.managerName = string(req.body, 'managerName', false, 100)
        }
        if (req.body.teamLeadId !== undefined) {
          update.$set.teamLeadId = req.body.teamLeadId ? string(req.body, 'teamLeadId', false, 100) : null
          let tName = string(req.body, 'teamLeadName', false, 100) || ''
          if (update.$set.teamLeadId && !tName) {
            try {
              const tDoc = await Employee.findOne(mongoose.isValidObjectId(update.$set.teamLeadId) ? { _id: update.$set.teamLeadId } : { employeeId: update.$set.teamLeadId }).select('name').lean()
              if (tDoc) tName = tDoc.name
            } catch { }
          }
          update.$set.teamLeadName = tName
        } else if (req.body.teamLeadName !== undefined) {
          update.$set.teamLeadName = string(req.body, 'teamLeadName', false, 100)
        }
        if (req.body.description !== undefined) update.$set.description = string(req.body, 'description', false, 1000)
        if (req.body.flaggedForVerification !== undefined) update.$set.flaggedForVerification = Boolean(req.body.flaggedForVerification)
        if (req.body.verificationNote !== undefined) update.$set.verificationNote = string(req.body, 'verificationNote', false, 500)
        query = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { teamId: recordId }] } : { teamId: recordId }`

content = safeReplace(content, oldPatchTeams, newPatchTeams)

// After updating team, sync team members if name/lead/manager changed
const oldAfterCreateTeams = `      if (!record && resource === 'teams') {
        const createdTeam = await models.teams.create({
          ownerId: id(actor),
          teamId: recordId,
          name: req.body.name || recordId,
          department: req.body.department || 'Revenue Growth',
          managerId: req.body.managerId || null,
          managerName: req.body.managerName || '',
          teamLeadId: req.body.teamLeadId || null,
          teamLeadName: req.body.teamLeadName || '',
          description: req.body.description || '',
          flaggedForVerification: Boolean(req.body.flaggedForVerification),
          verificationNote: req.body.verificationNote || '',
        })
        record = createdTeam.toObject()
      }`

const newAfterCreateTeams = `      if (!record && resource === 'teams') {
        const createdTeam = await models.teams.create({
          ownerId: id(actor),
          teamId: recordId,
          name: req.body.name || recordId,
          department: req.body.department || 'Revenue Growth',
          managerId: req.body.managerId || null,
          managerName: req.body.managerName || '',
          teamLeadId: req.body.teamLeadId || null,
          teamLeadName: req.body.teamLeadName || '',
          description: req.body.description || '',
          flaggedForVerification: Boolean(req.body.flaggedForVerification),
          verificationNote: req.body.verificationNote || '',
        })
        record = createdTeam.toObject()
      }
      if (resource === 'teams' && record) {
        const newTeamName = update.$set?.name || record.name
        const newLeadId = update.$set?.teamLeadId !== undefined ? update.$set.teamLeadId : record.teamLeadId
        const newLeadName = update.$set?.teamLeadName !== undefined ? update.$set.teamLeadName : record.teamLeadName
        const newMgrId = update.$set?.managerId !== undefined ? update.$set.managerId : record.managerId
        const newMgrName = update.$set?.managerName !== undefined ? update.$set.managerName : record.managerName
        const teamIdentifier = record.teamId || recordId

        const empFilter = {
          $or: [
            { teamId: teamIdentifier },
            { squadId: teamIdentifier },
            { team: record.name },
            { squad: record.name },
          ],
        }
        const empUpdate = {
          $set: {
            team: newTeamName,
            squad: newTeamName,
            teamId: teamIdentifier,
            squadId: teamIdentifier,
          },
        }
        if (newLeadId) {
          empUpdate.$set.teamLeadId = newLeadId
          empUpdate.$set.teamLeadName = newLeadName || ''
        }
        if (newMgrId) {
          empUpdate.$set.managerId = newMgrId
          empUpdate.$set.managerName = newMgrName || ''
        }
        await Employee.updateMany(empFilter, empUpdate)
        invalidateEmployeeListCache()
      }`

content = safeReplace(content, oldAfterCreateTeams, newAfterCreateTeams)

// 6. In DELETE /teams: clear squad & squadId as well
const lastTeamIdx = content.lastIndexOf("} else if (resource === 'teams') {")
const endOfDeleteTeams = content.indexOf("return res.json({ success: true, data: { id: recordId } })", lastTeamIdx) + "return res.json({ success: true, data: { id: recordId } })".length

const oldDeleteSection = content.slice(lastTeamIdx, endOfDeleteTeams)
const newDeleteSection = `} else if (resource === 'teams') {
        deleteQuery = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { teamId: recordId }] } : { teamId: recordId }
        const teamToDelete = await models.teams.findOne(deleteQuery).lean()
        const result = await models.teams.deleteOne(deleteQuery)
        if (!result.deletedCount) throw fail('Record not found.', 404)
        const teamName = teamToDelete?.name
        const teamId = teamToDelete?.teamId || recordId
        const escaped = (teamName || '').replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')
        const clearFilter = {
          $or: [
            { teamId },
            { squadId: teamId },
            ...(escaped ? [{ team: new RegExp(\`^\${escaped}$\`, 'i') }, { squad: new RegExp(\`^\${escaped}$\`, 'i') }] : []),
          ],
        }
        await Employee.updateMany(clearFilter, {
          $set: { team: '', teamId: '', squad: '', squadId: '' },
        })
        invalidateEmployeeListCache()
        return res.json({ success: true, data: { id: recordId } })`

content = content.slice(0, lastTeamIdx) + newDeleteSection + content.slice(endOfDeleteTeams)

fs.writeFileSync(filePath, content, 'utf8')
console.log('Successfully applied patches to server/src/modules/workspace/workspace.routes.js')
