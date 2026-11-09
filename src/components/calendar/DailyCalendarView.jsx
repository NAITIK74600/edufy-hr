import React from 'react'
import { CalendarDays, Clock, Video, MapPin, Users, Plus } from 'lucide-react'
import { Button } from '../ui'

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

function formatHour(hour) {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 || 12
  return `${h}:00 ${ampm}`
}

export function DailyCalendarView({
  selectedDate,
  events = [],
  onSelectEvent,
  onQuickCreate,
  categoryStyles = {},
}) {
  const toLocalDateStr = (d = new Date()) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dayNum}`
  }

  const isToday = selectedDate === toLocalDateStr(new Date())
  const currentHour = new Date().getHours()

  // Filter events for this day
  const dayEvents = events.filter((ev) => ev.date === selectedDate && ev.status !== 'cancelled')
  const allDayEvents = dayEvents.filter((ev) => ev.allDay || !ev.startTime)
  const timedEvents = dayEvents.filter((ev) => !ev.allDay && ev.startTime)

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid var(--border, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Day Banner */}
      <div
        style={{
          padding: '16px 20px',
          background: isToday ? '#f0fdfa' : '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarDays size={20} color="var(--teal, #006E6F)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
              {(() => {
                const [y, m, d] = (selectedDate || '').split('-').map(Number)
                const dateObj = y && m && d ? new Date(y, m - 1, d) : new Date()
                return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
              })()}
            </h3>
            <span style={{ fontSize: '12px', color: isToday ? 'var(--teal, #006E6F)' : '#64748b', fontWeight: 600 }}>
              {isToday ? 'Today' : 'Daily Schedule'} • {dayEvents.length} Event(s)
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => onQuickCreate?.(selectedDate, '10:00')}
          style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <Plus size={14} /> Schedule on this Day
        </Button>
      </div>

      {/* All-Day Events Strip */}
      {allDayEvents.length > 0 && (
        <div style={{ padding: '12px 20px', background: '#fafafa', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            All-Day Events & Holidays
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {allDayEvents.map((ev) => {
              const styleInfo = categoryStyles[ev.category] || { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
              return (
                <div
                  key={ev.id || ev._id}
                  onClick={() => onSelectEvent(ev)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: styleInfo.bg,
                    color: styleInfo.text,
                    border: `1px solid ${styleInfo.border}`,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{ev.title}</span>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>({ev.category})</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hourly Timeline */}
      <div style={{ position: 'relative' }}>
        {HOURS.map((hour) => {
          const matchingEvents = timedEvents.filter((ev) => {
            const [h] = ev.startTime.split(':').map(Number)
            return h === hour
          })
          const isCurrentHourSlot = isToday && currentHour === hour

          return (
            <div
              key={hour}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr',
                borderBottom: '1px solid #f1f5f9',
                minHeight: '64px',
                background: isCurrentHourSlot ? '#f0fdfa' : 'transparent',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  fontSize: '11px',
                  color: isCurrentHourSlot ? 'var(--teal, #006E6F)' : '#94a3b8',
                  fontWeight: isCurrentHourSlot ? 800 : 600,
                  textAlign: 'right',
                  borderRight: '1px solid #e2e8f0',
                }}
              >
                {formatHour(hour)}
              </div>

              <div
                onClick={() => onQuickCreate?.(selectedDate, `${String(hour).padStart(2, '0')}:00`)}
                style={{
                  padding: '8px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                {matchingEvents.map((ev) => {
                  const styleInfo = categoryStyles[ev.category] || { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
                  return (
                    <div
                      key={ev.id || ev._id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvent(ev)
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: styleInfo.bg,
                        color: styleInfo.text,
                        border: `1px solid ${styleInfo.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800 }}>{ev.title}</div>
                        <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{ev.startTime12 || ev.startTime} - {ev.endTime12 || ev.endTime || 'End'}</span>
                          {ev.location?.name && <span>• 📍 {ev.location.name}</span>}
                        </div>
                      </div>

                      {ev.meetingLink?.url && (
                        <a
                          href={ev.meetingLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#059669',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Video size={12} /> Join Call
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

