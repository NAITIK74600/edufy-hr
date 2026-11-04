const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/EmployeeDashboardPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Line 2170
content = content.replace(
  "designation: employee?.designation || 'Associate',",
  "designation: employee?.designation || 'Pending Designation',"
);

// 2. Line 3443
content = content.replace(
  "{employee?.designation || user?.designation || 'Staff Member'} • {employee?.department || user?.department || 'Operations'}",
  "{employee?.designation || user?.designation || 'Pending Designation'} • {employee?.department || user?.department || 'Operations'}"
);

// 3. Line 3570
content = content.replace(
  "<strong>{employee?.designation || user?.designation || 'Product Designer'}</strong>",
  "<strong>{employee?.designation || user?.designation || 'Pending Designation'}</strong>"
);

// 4. Update teamMembers calculation
const oldTeamCalc = `    // If Manager: show all members in all teams reporting to this manager + direct reports
    if (currentEmp.role === 'manager') {
      const teamNames = new Set(userTeams.map((t) => t.name.toLowerCase()))
      const teamIds = new Set(userTeams.map((t) => t.id))
      return allEmployees.filter((e) => {
        if (e.id === currentEmp.id) return false
        if (e.managerId === currentEmp.id) return true
        if (e.team && (teamNames.has(e.team.toLowerCase()) || teamIds.has(e.teamId))) return true
        return false
      })
    }

    // If Team Lead: show all members assigned to their team
    if (currentEmp.role === 'team_lead') {
      const myTeam = userTeams[0] || hrStore.getTeam(currentEmp.teamId || currentEmp.team)
      return allEmployees.filter((e) => {
        if (e.id === currentEmp.id) return false
        if (e.teamLeadId === currentEmp.id) return true
        if (myTeam && (e.teamId === myTeam.id || (e.team && e.team.toLowerCase() === myTeam.name.toLowerCase()))) return true
        return false
      })
    }`;

const newTeamCalc = `    // If Manager / Vertical Head / Revenue Growth Manager: show all members in teams + direct reports
    const isMgrRole = ['manager', 'revenue_growth_manager', 'senior_manager', 'vertical_head'].includes(currentEmp.role)
    if (isMgrRole) {
      const teamNames = new Set(userTeams.map((t) => (t.name || '').toLowerCase()))
      const teamIds = new Set(userTeams.map((t) => t.id))
      const myIds = new Set([String(currentEmp.id || ''), String(currentEmp._id || ''), String(currentEmp.employeeId || '')].filter(Boolean))
      return allEmployees.filter((e) => {
        if (e.id === currentEmp.id || e._id === currentEmp.id) return false
        if (e.managerId && myIds.has(String(e.managerId))) return true
        if (e.team && (teamNames.has(e.team.toLowerCase()) || teamIds.has(e.teamId))) return true
        return false
      })
    }

    // If Team Lead / Team Leader: show all members assigned to their team or direct reports
    const isTlRole = ['team_lead', 'team_leader'].includes(currentEmp.role)
    if (isTlRole) {
      const myTeam = userTeams[0] || hrStore.getTeam(currentEmp.teamId || currentEmp.team)
      const myIds = new Set([String(currentEmp.id || ''), String(currentEmp._id || ''), String(currentEmp.employeeId || '')].filter(Boolean))
      return allEmployees.filter((e) => {
        if (e.id === currentEmp.id || e._id === currentEmp.id) return false
        if (e.teamLeadId && myIds.has(String(e.teamLeadId))) return true
        if (e.managerId && myIds.has(String(e.managerId))) return true
        if (myTeam && (e.teamId === myTeam.id || (e.team && e.team.toLowerCase() === myTeam.name.toLowerCase()))) return true
        return false
      })
    }`;

content = content.replace(oldTeamCalc, newTeamCalc);

// 5. Update team member card to show full metadata required by Phase 3
const oldTeamCard = `                <div>
                  <strong style={{ fontSize: '14px' }}>{m.displayName || m.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {m.designation || m.role} • {m.department}
                    {m.team && <span style={{ marginLeft: '6px', color: '#7e22ce', fontWeight: 600 }}>({m.team})</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '6px', fontSize: '11px', background: '#faf9f5', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                <div><strong>Code:</strong> {m.employeeId || m.id}</div>
                <div><strong>Email:</strong> {m.email || '—'}</div>
                <div><strong>Phone:</strong> {m.phone || '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Status:</span>
                  <strong style={{ color: m.status === 'active' ? 'var(--teal)' : '#cb3a31' }}>
                    {m.status === 'active' ? 'Active' : m.status}
                  </strong>
                </div>
              </div>`;

const newTeamCard = `                <div>
                  <strong style={{ fontSize: '14px' }}>{m.displayName || m.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    <strong>{m.designation || 'Pending Designation'}</strong> • {m.department || 'General'}
                    {m.team && <span style={{ marginLeft: '6px', color: '#7e22ce', fontWeight: 600 }}>({m.team})</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '6px', fontSize: '11px', background: '#faf9f5', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                <div><strong>Code:</strong> {m.employeeId || m.id}</div>
                <div><strong>Type:</strong> <span style={{ color: (m.employmentType === 'intern' || String(m.role || '').includes('intern')) ? '#0284c7' : 'inherit', fontWeight: 600 }}>{(m.employmentType === 'intern' || String(m.role || '').includes('intern')) ? '🎓 Intern' : 'Full-Time'}</span></div>
                <div><strong>Email:</strong> {m.email || '—'}</div>
                <div><strong>Phone:</strong> {m.phone || '—'}</div>
                <div><strong>Joining:</strong> {m.joiningDate ? new Date(m.joiningDate).toLocaleDateString('en-GB') : '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Status:</span>
                  <strong style={{ color: m.status === 'active' ? 'var(--teal)' : '#cb3a31' }}>
                    {m.status === 'active' ? 'Active' : m.status}
                  </strong>
                </div>
              </div>`;

content = content.replace(oldTeamCard, newTeamCard);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated EmployeeDashboardPage.jsx');

