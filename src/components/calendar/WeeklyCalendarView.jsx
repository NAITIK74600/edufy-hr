import React from 'react'
import { Video, MapPin } from 'lucide-react'

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

function formatHour(hour) {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 || 12
  return `${h} ${ampm}`
}

export function WeeklyCalendarView({
  currentDate,
  events = [],
  onSelectEvent,
  onQuickCreate,
  categoryStyles = {},
}) {
  // Compute start of week (Sunday)
  const curr = new Date(currentDate)
  const day = curr.getDay()
  const sunday = new Date(curr)
  sunday.setDate(curr.getDate() - day)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    return {
      date: d,
      dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: dateStr === new Date().toISOString().split('T')[0],
    }
  })

  // Index events by date
  const eventsByDate = new Map()
  events.forEach((ev) => {
    if (!ev.date) return
    if (!eventsByDate.has(ev.date)) eventsByDate.set(ev.date, [])
    eventsByDate.get(ev.date).push(ev)
  })

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid var(--border, #e2e8f0)',
        overflowX: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ minWidth: '750px', display: 'flex', flexDirection: 'column' }}>
        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ padding: '12px 8px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
            Time
          </div>
          {weekDays.map((d) => (
            <div
              key={d.dateStr}
              style={{
                padding: '10px 8px',
                textAlign: 'center',
                borderLeft: '1px solid #e2e8f0',
                background: d.isToday ? '#f0fdfa' : 'transparent',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: d.isToday ? 'var(--teal, #006E6F)' : '#64748b', textTransform: 'uppercase' }}>
                {d.dayName}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: d.isToday ? 'var(--teal, #006E6F)' : 'transparent',
                  color: d.isToday ? '#ffffff' : 'var(--ink, #0f172a)',
                  fontWeight: 800,
                  fontSize: '13px',
                  marginTop: '2px',
                }}
              >
                {d.dayNum}
              </div>
            </div>
          ))}
        </div>

        {/* All-Day Events Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', borderBottom: '2px solid #e2e8f0', minHeight: '36px', background: '#fafafa' }}>
          <div style={{ padding: '8px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textAlign: 'center' }}>
            All-Day
          </div>
          {weekDays.map((d) => {
            const dayEvents = (eventsByDate.get(d.dateStr) || []).filter((e) => e.allDay || !e.startTime)
            return (
              <div key={d.dateStr} style={{ borderLeft: '1px solid #e2e8f0', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {dayEvents.map((ev) => {
                  const styleInfo = categoryStyles[ev.category] || { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
                  return (
                    <div
                      key={ev.id || ev._id}
                      onClick={() => onSelectEvent(ev)}
                      style={{
                        padding: '2px 5px',
                        borderRadius: '4px',
                        background: styleInfo.bg,
                        color: styleInfo.text,
                        border: `1px solid ${styleInfo.border}`,
                        fontSize: '10px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                      }}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Hourly Grid Rows */}
        <div style={{ position: 'relative' }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{
                display: 'grid',
                gridTemplateColumns: '70px repeat(7, 1fr)',
                borderBottom: '1px solid #f1f5f9',
                minHeight: '52px',
              }}
            >
              <div style={{ padding: '6px 8px', fontSize: '10px', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>
                {formatHour(hour)}
              </div>
              {weekDays.map((d) => {
                const hourEvents = (eventsByDate.get(d.dateStr) || []).filter((e) => {
                  if (e.allDay || !e.startTime) return false
                  const [h] = e.startTime.split(':').map(Number)
                  return h === hour
                })

                return (
                  <div
                    key={d.dateStr}
                    onClick={() => onQuickCreate?.(d.dateStr, `${String(hour).padStart(2, '0')}:00`)}
                    style={{
                      borderLeft: '1px solid #f1f5f9',
                      padding: '2px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    {hourEvents.map((ev) => {
                      const styleInfo = categoryStyles[ev.category] || { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
                      return (
                        <div
                          key={ev.id || ev._id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectEvent(ev)
                          }}
                          style={{
                            padding: '4px 6px',
                            borderRadius: '5px',
                            background: styleInfo.bg,
                            color: styleInfo.text,
                            border: `1px solid ${styleInfo.border}`,
                            fontSize: '11px',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                          title={`${ev.title} (${ev.startTime || ''})`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ev.title}
                            </span>
                            {ev.meetingLink?.url && <Video size={10} />}
                          </div>
                          <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
                            {ev.startTime12 || ev.startTime}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
