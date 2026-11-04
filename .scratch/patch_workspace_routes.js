import fs from 'fs'
import path from 'path'

const filePath = path.resolve('server/src/modules/workspace/workspace.routes.js')
let content = fs.readFileSync(filePath, 'utf8')

// Helper for exact replacement without $& pitfalls
function safeReplace(str, target, replacement) {
  const idx = str.indexOf(target)
  if (idx === -1) {
    throw new Error('Target not found: ' + target.slice(0, 50))
  }
  return str.slice(0, idx) + replacement + str.slice(idx + target.length)
}

// 1. Add import
if (!content.includes('invalidateEmployeeListCache')) {
  content = safeReplace(
    content,
    "import { ensureConnected } from '../leave/leave.repository.js'",
    "import { ensureConnected } from '../leave/leave.repository.js'\r\nimport { invalidateEmployeeListCache } from '../employees/employee.repository.js'"
  )
}

// 2. Enhance team members matching in list(actor, 'teams')
const oldMembersCheck = `        const teamKey = String(t.teamId || t.id || t._id || '').toLowerCase()
        const teamNameKey = String(t.name || '').toLowerCase()
        const members = allEmps.filter((e) => {
          const eTeam = String(e.team || '').toLowerCase()
          const eTeamId = String(e.teamId || '').toLowerCase()
          const eSquad = String(e.squad || '').toLowerCase()
          const eSquadId = String(e.squadId || '').toLowerCase()
          return (
            (eTeamId && eTeamId === teamKey) ||
            (eTeam && eTeam === teamNameKey) ||
            (eSquadId && eSquadId === teamKey) ||
            (eSquad && eSquad === teamNameKey)
          )
        })`.replace(/\n/g, '\r\n')

const newMembersCheck = `        const teamKey = String(t.teamId || t.id || t._id || '').toLowerCase()
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
        })`.replace(/\n/g, '\r\n')

content = safeReplace(content, oldMembersCheck, newMembersCheck)

// 3. Update handleAssignTeamMembers
const oldAssignUpdates = `        const assignUpdates = {
          team: teamName,
          teamId: cleanTeamId,
          squad: teamName,
          squadId: cleanTeamId,
        }
        if (teamDept) assignUpdates.department = teamDept
        await Employee.updateMany(assignFilter, { $set: assignUpdates })`.replace(/\n/g, '\r\n')

const newAssignUpdates = `        const assignUpdates = {
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
        await Employee.updateMany(assignFilter, { $set: assignUpdates })`.replace(/\n/g, '\r\n')

content = safeReplace(content, oldAssignUpdates, newAssignUpdates)

// Invalidate cache in handleAssignTeamMembers and add route aliases
const oldAssignResponse = `      res.json({
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
  router.post('/teams/assign', handleAssignTeamMembers)`.replace(/\n/g, '\r\n')

const newAssignResponse = `      invalidateEmployeeListCache()
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
  router.put('/teams/assign', handleAssignTeamMembers)`.replace(/\n/g, '\r\n')

content = safeReplace(content, oldAssignResponse, newAssignResponse)

// 4. In POST /teams: Auto-resolve managerName & teamLeadName
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
          break`.replace(/\n/g, '\r\n')

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
        }`.replace(/\n/g, '\r\n')

content = safeReplace(content, oldPostTeams, newPostTeams)

// 5. In PATCH /teams: Auto-resolve managerName & teamLeadName
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
        query = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { teamId: recordId }] } : { teamId: recordId }`.replace(/\n/g, '\r\n')

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
        query = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { teamId: recordId }] } : { teamId: recordId }`.replace(/\n/g, '\r\n')

content = safeReplace(content, oldPatchTeams, newPatchTeams)

// After updating employees in patch teams:
const oldPatchEmpUpdate = `        await Employee.updateMany(empFilter, empUpdate)
      }`.replace(/\n/g, '\r\n')

const newPatchEmpUpdate = `        await Employee.updateMany(empFilter, empUpdate)
        invalidateEmployeeListCache()
      }`.replace(/\n/g, '\r\n')

content = safeReplace(content, oldPatchEmpUpdate, newPatchEmpUpdate)

// 6. In DELETE /teams:
const oldDeleteTeams = `      } else if (resource === 'teams') {
        deleteQuery = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { teamId: recordId }] } : { teamId: recordId }
        const teamToDelete = await models.teams.findOne(deleteQuery).lean()
        const result = await models.teams.deleteOne(deleteQuery)
        if (!result.deletedCount) throw fail('Record not found.', 404)
        const teamName = teamToDelete?.name
        if (teamName) {
          const escaped = teamName.replace(/[.*+?^$\${}()|[\\]\\\\]/g, '\\\\$&')
          await Employee.updateMany(
            { team: { $regex: new RegExp(\`^\${escaped}$\`, 'i') } },
            { $set: { team: '', teamId: '' } }
          )
        }
        return res.json({ success: true, data: { id: recordId } })`.replace(/\n/g, '\r\n')

const newDeleteTeams = `      } else if (resource === 'teams') {
        deleteQuery = mongoose.isValidObjectId(recordId) ? { $or: [{ _id: recordId }, { teamId: recordId }] } : { teamId: recordId }
        const teamToDelete = await models.teams.findOne(deleteQuery).lean()
        const result = await models.teams.deleteOne(deleteQuery)
        if (!result.deletedCount) throw fail('Record not found.', 404)
        const teamName = teamToDelete?.name
        const teamId = teamToDelete?.teamId || recordId
        const escaped = (teamName || '').replace(/[.*+?^$\${}()|[\\]\\\\]/g, '\\\\$&')
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
        return res.json({ success: true, data: { id: recordId } })`.replace(/\n/g, '\r\n')

content = safeReplace(content, oldDeleteTeams, newDeleteTeams)

fs.writeFileSync(filePath, content, 'utf8')
console.log('Successfully patched server/src/modules/workspace/workspace.routes.js')
