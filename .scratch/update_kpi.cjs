const fs = require('fs');
let code = fs.readFileSync('src/pages/WorkspaceModulePage.jsx', 'utf8');

const oldKpi = `      {/* KPI Cards */}
      <section className="module-kpi-grid">
        <div className="panel module-kpi">
          <span>Present on-site ({selectedDate})</span>
          <strong>{presentCount} Staff</strong>
          <small>Verified via office Wi-Fi network</small>
        </div>
        <div className="panel module-kpi">
          <span>Active check-ins</span>
          <strong style={{ color: 'var(--teal)' }}>{dayRecords.filter((a) => Boolean(a.checkIn) && !a.checkOut).length} Staff</strong>
          <small>Currently checked-in live</small>
        </div>
        <div className="panel module-kpi">
          <span>Approved leaves / Out</span>
          <strong>{onLeaveCount} Staff</strong>
          <small>Authorized absence</small>
        </div>
      </section>`;

const newKpi = `      {/* KPI Cards - Interactive Pulse */}
      <section className="module-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div
          className="panel module-kpi"
          onClick={() => setPresenceViewMode('working')}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', border: presenceViewMode === 'working' ? '2px solid #059669' : '1px solid rgba(5, 150, 105, 0.3)', background: presenceViewMode === 'working' ? '#ecfdf5' : 'rgba(5, 150, 105, 0.05)', borderRadius: '10px', padding: '14px 16px' }}
        >
          <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🟢 Working Now (Punched In)</span>
          <strong style={{ font: '700 28px "Space Grotesk", sans-serif', color: '#047857', lineHeight: 1.1, margin: '4px 0' }}>{punchedInWorking.length} Staff</strong>
          <small style={{ color: '#059669', fontSize: '11px' }}>Click to view on-duty staff</small>
        </div>

        <div
          className="panel module-kpi"
          onClick={() => setPresenceViewMode('punched_out')}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', border: presenceViewMode === 'punched_out' ? '2px solid #0284c7' : '1px solid rgba(2, 132, 199, 0.3)', background: presenceViewMode === 'punched_out' ? '#eff6ff' : 'rgba(2, 132, 199, 0.05)', borderRadius: '10px', padding: '14px 16px' }}
        >
          <span style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔵 Punched Out</span>
          <strong style={{ font: '700 28px "Space Grotesk", sans-serif', color: '#0369a1', lineHeight: 1.1, margin: '4px 0' }}>{punchedOutList.length} Staff</strong>
          <small style={{ color: '#0284c7', fontSize: '11px' }}>Click to view completed shifts</small>
        </div>

        <div
          className="panel module-kpi"
          onClick={() => setPresenceViewMode('not_punched')}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', border: presenceViewMode === 'not_punched' ? '2px solid #dc2626' : '1px solid rgba(239, 68, 68, 0.3)', background: presenceViewMode === 'not_punched' ? '#fef2f2' : 'rgba(239, 68, 68, 0.05)', borderRadius: '10px', padding: '14px 16px' }}
        >
          <span style={{ fontSize: '10.5px', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔴 Not Punched In</span>
          <strong style={{ font: '700 28px "Space Grotesk", sans-serif', color: '#dc2626', lineHeight: 1.1, margin: '4px 0' }}>{notPunchedInList.length} Staff</strong>
          <small style={{ color: '#dc2626', fontSize: '11px' }}>Click to view missing punches</small>
        </div>

        <div
          className="panel module-kpi"
          onClick={() => setPresenceViewMode('all')}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease', border: presenceViewMode === 'all' ? '2px solid var(--teal)' : '1px solid var(--border)', background: presenceViewMode === 'all' ? 'var(--soft-teal)' : '#fff', borderRadius: '10px', padding: '14px 16px' }}
        >
          <span style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📋 All Logs / On-site</span>
          <strong style={{ font: '700 28px "Space Grotesk", sans-serif', color: 'var(--ink)', lineHeight: 1.1, margin: '4px 0' }}>{presentCount} Present</strong>
          <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{onLeaveCount} on leave · Click to view all</small>
        </div>
      </section>`;

const normalizedCode = code.replace(/\r\n/g, '\n');
const normalizedOld = oldKpi.replace(/\r\n/g, '\n');

if (normalizedCode.includes(normalizedOld)) {
  const updated = normalizedCode.replace(normalizedOld, newKpi);
  fs.writeFileSync('src/pages/WorkspaceModulePage.jsx', updated.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated Attendance KPI cards in WorkspaceModulePage.jsx');
} else {
  console.error('Target KPI block not found');
}

