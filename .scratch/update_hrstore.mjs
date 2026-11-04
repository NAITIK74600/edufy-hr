import fs from 'fs';

const path = 'src/services/hrStore.js';
let code = fs.readFileSync(path, 'utf8');

const target = `  getTeams() {
    const rawTeams = storeState.teams || []
    const defaultMap = new Map(INITIAL_TEAMS.map((t) => [t.id, { ...t }]))
    for (const t of rawTeams) {
      if (t.id) {
        defaultMap.set(t.id, { ...(defaultMap.get(t.id) || {}), ...t })
      }
    }
    const teams = Array.from(defaultMap.values())
    const employees = storeState.employees || []
    return teams.map((team) => {
      const members = employees.filter(
        (e) =>
          (e.team && (e.team.toLowerCase() === team.name.toLowerCase() || e.team === team.id)) ||
          e.teamId === team.id
      )
      return {
        ...team,
        memberCount: members.length,
        members: members.map((m) => ({ id: m.id, name: m.name, role: m.role, designation: m.designation, employeeId: m.employeeId })),
      }
    })
  },
  getTeam(teamId) {
    if (!teamId) return null
    return this.getTeams().find((t) => t.id === teamId || t.name.toLowerCase() === String(teamId).toLowerCase()) || null
  },`;

const replacement = `  getTeams() {
    const rawTeams = storeState.teams || []
    const defaultMap = new Map(INITIAL_TEAMS.map((t) => [t.teamId || t.id, { ...t }]))
    for (const t of rawTeams) {
      const key = t.teamId || t.id || t._id || (t.name ? \`team-\${t.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}\` : null)
      if (key) {
        defaultMap.set(key, { ...(defaultMap.get(key) || {}), ...t, id: t.id || key, teamId: t.teamId || key })
      }
    }
    const teams = Array.from(defaultMap.values())
    const employees = storeState.employees || []
    return teams.map((team) => {
      const teamId = String(team.teamId || team.id || '').toLowerCase()
      const teamName = String(team.name || '').toLowerCase()
      const teamSlug = \`team-\${teamName.replace(/[^a-z0-9]/g, '_')}\`
      const members = employees.filter((e) => {
        const eTeam = String(e.team || '').toLowerCase()
        const eTeamId = String(e.teamId || '').toLowerCase()
        const eSquad = String(e.squad || '').toLowerCase()
        const eSquadId = String(e.squadId || '').toLowerCase()
        return (
          (eTeamId && (eTeamId === teamId || eTeamId === teamSlug)) ||
          (eTeam && (eTeam === teamName || eTeam === teamId)) ||
          (eSquadId && (eSquadId === teamId || eSquadId === teamSlug)) ||
          (eSquad && (eSquad === teamName || eSquad === teamId))
        )
      })

      const tl = team.teamLeadId ? employees.find((e) => String(e.id || e._id) === String(team.teamLeadId) || e.employeeId === team.teamLeadId) : null
      const mgr = team.managerId ? employees.find((e) => String(e.id || e._id) === String(team.managerId) || e.employeeId === team.managerId) : null

      return {
        ...team,
        teamLeadName: tl?.name || team.teamLeadName || '',
        managerName: mgr?.name || team.managerName || '',
        memberCount: members.length,
        members: members.map((m) => ({ id: m.id || m._id, name: m.name, role: m.role, designation: m.designation, employeeId: m.employeeId })),
      }
    })
  },
  getTeam(teamId) {
    if (!teamId) return null
    return this.getTeams().find((t) => t.id === teamId || t.teamId === teamId || t.name.toLowerCase() === String(teamId).toLowerCase()) || null
  },
  assignEmployeesToTeam(teamIdOrName, employeeIds = [], actor) {
    const cleanTarget = String(teamIdOrName || '').toLowerCase().trim()
    const targetTeam = this.getTeams().find((t) =>
      String(t.id || t.teamId || '').toLowerCase() === cleanTarget ||
      String(t.name || '').toLowerCase() === cleanTarget
    )
    const teamName = targetTeam?.name || teamIdOrName
    const teamId = targetTeam?.id || targetTeam?.teamId || \`team-\${teamName.toLowerCase().replace(/[^a-z0-9]/g, '_')}\`
    const targetDept = targetTeam?.department || null
    const selectedSet = new Set(employeeIds.map(String))

    storeState.employees = (storeState.employees || []).map((emp) => {
      const empId = String(emp.id || emp._id)
      const isCurrentInTeam =
        (emp.team && (emp.team.toLowerCase() === teamName.toLowerCase() || emp.team === teamId)) ||
        (emp.teamId && (emp.teamId === teamId || emp.teamId.toLowerCase() === cleanTarget))

      if (selectedSet.has(empId)) {
        return {
          ...emp,
          team: teamName,
          teamId: teamId,
          squad: teamName,
          squadId: teamId,
          ...(targetDept && (!emp.department || emp.department === 'Unassigned') ? { department: targetDept } : {}),
        }
      } else if (isCurrentInTeam) {
        return {
          ...emp,
          team: '',
          teamId: '',
          squad: '',
          squadId: '',
        }
      }
      return emp
    })

    this.addAuditLog(actor?.name || 'Admin', 'TEAM_ASSIGN', \`Assigned \${selectedSet.size} members to squad '\${teamName}'\`)
    notifyListeners()
    return { success: true, teamId, teamName, count: selectedSet.size }
  },`;

const normCode = code.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (!normCode.includes(normTarget)) {
  console.error('Target not found in code');
  process.exit(1);
}

const updated = normCode.replace(normTarget, normReplacement);
fs.writeFileSync(path, updated, 'utf8');
console.log('Successfully updated hrStore.js');

