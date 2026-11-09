import os

file_path = "src/components/calendar/EnterpriseCalendar.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find the start line for viewMode === 'month' and calendar-agenda-panel
start_idx = None
agenda_idx = None

for i, line in enumerate(lines):
    if "viewMode === 'month' && (" in line:
        start_idx = i
    if start_idx is not None and "className=\"panel calendar-agenda-panel\"" in line:
        agenda_idx = i
        break

print(f"start_idx: {start_idx}, agenda_idx: {agenda_idx}")

if start_idx is None or agenda_idx is None:
    raise Exception("Could not find start or agenda index")

# Find the end of the agenda panel div open tag (line containing `>` for the panel div)
panel_open_end_idx = agenda_idx
for i in range(agenda_idx, agenda_idx + 25):
    if lines[i].strip() == ">":
        panel_open_end_idx = i
        break

print(f"panel_open_end_idx: {panel_open_end_idx}")

new_chunk = """      {/* ============================================================== */}
      {/* 1. MONTH VIEW (Default)                                        */}
      {/* ============================================================== */}
      {viewMode === 'month' && (
        <div className={`calendar-grid-layout ${isMobile ? 'is-mobile-layout' : ''}`}>
          {/* Calendar Month Grid */}
          <div className="panel calendar-month-panel">
            {/* Day Header Row */}
            <div className="calendar-day-headers">
              {DAY_NAMES.map((day, idx) => (
                <div
                  key={day}
                  className="calendar-day-header"
                  style={{
                    color: idx === 0 || idx === 6 ? '#ef4444' : 'var(--muted, #64748b)',
                  }}
                >
                  <span className="day-name-full">{day.slice(0, 3)}</span>
                  <span className="day-name-micro">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            {/* 7-Column Days Grid */}
            <div className="calendar-days-grid">
              {monthCalendarDays.map((cell) => {
                const cellEvents = (eventsByDate.get(cell.dateStr) || []).filter((e) => showLeaves || e.type !== 'leave')
                const isSelected = selectedDate === cell.dateStr
                const maxVisible = 2
                const hiddenCount = cellEvents.length - maxVisible

                return (
                  <div
                    key={cell.dateStr}
                    className={`calendar-day-cell ${isSelected ? 'is-selected' : ''} ${cell.isToday ? 'is-today' : ''} ${!cell.isCurrentMonth ? 'is-other-month' : ''}`}
                    onClick={() => {
                      setSelectedDate(cell.dateStr)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                    }}
                    onDrop={(e) => handleDropOnDate(e, cell.dateStr)}
                    onDoubleClick={() => {
                      if (cell.isCurrentMonth) {
                        setEditingEventData({ date: cell.dateStr })
                        setIsEventModalOpen(true)
                      }
                    }}
                    style={{
                      border: isSelected
                        ? '2px solid var(--teal, #006E6F)'
                        : cell.isToday
                        ? '2px solid #38bdf8'
                        : '1px solid var(--border, #f1f5f9)',
                      background: isSelected
                        ? 'var(--teal-soft, #f0fdfa)'
                        : cell.isToday
                        ? '#f0f9ff'
                        : cell.isCurrentMonth
                        ? 'var(--card-bg, #ffffff)'
                        : 'var(--surface-hover, #f8fafc)',
                      opacity: cell.isCurrentMonth ? 1 : 0.45,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 110, 111, 0.14)' : 'none',
                    }}
                  >
                    {/* Day Number Header */}
                    <div className="calendar-day-header-inner">
                      <span
                        className="calendar-day-number"
                        style={{
                          fontWeight: cell.isToday || isSelected ? 800 : 600,
                          color: cell.isToday
                            ? '#0284c7'
                            : isSelected
                            ? 'var(--teal, #006E6F)'
                            : 'var(--ink, #1e293b)',
                          background: cell.isToday ? '#e0f2fe' : isSelected ? '#ccfbf1' : 'transparent',
                        }}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Small badge count if multiple events on desktop */}
                      <span
                        className="calendar-day-count-badge hidden-mobile"
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '10px',
                          background: '#f1f5f9',
                          color: '#475569',
                          display: cellEvents.length > 0 ? 'inline' : 'none',
                        }}
                      >
                        {cellEvents.length}
                      </span>
                    </div>

                    {/* Events display: Mobile dots */}
                    <div className="calendar-day-dots">
                      {cellEvents.slice(0, 3).map((ev) => {
                        const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS['Company Holiday']
                        return (
                          <span
                            key={ev.id}
                            title={`${ev.title} (${ev.category})`}
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: styleInfo.text || '#006E6F',
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                        )
                      })}
                      {cellEvents.length > 3 && (
                        <span style={{ fontSize: '8px', fontWeight: 800, color: 'var(--teal, #006E6F)', lineHeight: 1 }}>
                          +{cellEvents.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Events display: Desktop pills */}
                    <div className="calendar-day-pills">
                      {cellEvents.slice(0, maxVisible).map((ev) => {
                        const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS['Company Holiday']
                        return (
                          <div
                            key={ev.id}
                            draggable={Boolean(canManage || ev.isOwner)}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', JSON.stringify({ id: ev.entityId || ev.id, title: ev.title }))
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(ev)
                              setSelectedDate(cell.dateStr)
                            }}
                            title={`${ev.title} (${ev.category})`}
                            style={{
                              padding: '2px 5px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: styleInfo.bg,
                              color: styleInfo.text,
                              border: `1px solid ${styleInfo.border}`,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {(ev.type === 'birthday' || ev.category === 'Birthday' || ev.category === 'Employee Birthday') && <Cake size={10} />}
                            {(ev.type === 'anniversary' || ev.category === 'Work Anniversary') && <Award size={10} />}
                            {ev.meetingLink?.url && <Video size={10} color="#059669" />}
                            <span>{ev.title}</span>
                          </div>
                        )
                      })}

                      {hiddenCount > 0 && (
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'var(--teal, #006E6F)',
                            padding: '1px 4px',
                          }}
                        >
                          +{hiddenCount} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Side / Bottom Panel: Selected Date Agenda */}
          <div className="panel calendar-agenda-panel">
"""

# Replace lines from start_idx-3 to panel_open_end_idx
# First check what lines[start_idx-3] is
print(f"Replacing from line {start_idx-2}: {lines[start_idx-3]}")
print(f"Up to line {panel_open_end_idx+1}: {lines[panel_open_end_idx]}")

lines_before = lines[:start_idx-3]
lines_after = lines[panel_open_end_idx+1:]

new_lines = lines_before + [new_chunk] + lines_after

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("EnterpriseCalendar.jsx successfully updated!")
