import React from 'react'
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Cake,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '../ui'

export function UpcomingEventsView({
  events = [],
  onSelectEvent,
  categoryStyles = {},
}) {
  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const sevenDaysAhead = new Date()
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7)
  const sevenDaysAheadStr = sevenDaysAhead.toISOString().split('T')[0]

  // Filter only upcoming / today onwards
  const upcomingList = events
    .filter((e) => e.date >= todayStr && e.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))

  // Groups
  const todayEvents = upcomingList.filter((e) => e.date === todayStr)
  const tomorrowEvents = upcomingList.filter((e) => e.date === tomorrowStr)
  const thisWeekEvents = upcomingList.filter((e) => e.date > tomorrowStr && e.date <= sevenDaysAheadStr)
  const futureEvents = upcomingList.filter((e) => e.date > sevenDaysAheadStr)

  const renderEventCard = (ev) => {
    const styleInfo = categoryStyles[ev.category] || {
      bg: '#eff6ff',
      text: '#1d4ed8',
      border: '#bfdbfe',
    }

    return (
      <div
        key={ev.id || ev._id}
        onClick={() => onSelectEvent(ev)}
        style={{
          padding: '16px',
          borderRadius: '12px',
          background: '#ffffff',
          border: '1px solid var(--border, #e2e8f0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--teal, #006E6F)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)'
          e.currentTarget.style.transform = 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: '4px',
                background: styleInfo.bg,
                color: styleInfo.text,
                border: `1px solid ${styleInfo.border}`,
              }}
            >
              {ev.category}
            </span>

            {ev.priority === 'urgent' && (
              <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c' }}>
                URGENT
              </span>
            )}
          </div>

          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal, #006E6F)' }}>
            {ev.allDay ? 'All Day' : (ev.startTime12 || ev.startTime || 'Scheduled')}
          </span>
        </div>

        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: 'var(--ink, #0f172a)' }}>
            {ev.title}
          </h4>
          {ev.description && (
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ev.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CalendarDays size={13} color="var(--teal, #006E6F)" />
            <span>{ev.date} ({ev.day || ''})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {ev.meetingLink?.url && (
              <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Video size={13} /> Video Call
              </span>
            )}
            {ev.location?.name && (
              <span style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={13} /> {ev.location.name}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderGroup = (title, items, badgeColor) => {
    if (items.length === 0) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink, #0f172a)', letterSpacing: '0.02em' }}>
            {title}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '9999px',
              background: badgeColor.bg,
              color: badgeColor.text,
            }}
          >
            {items.length}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {items.map(renderEventCard)}
        </div>
      </div>
    )
  }

  if (upcomingList.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <CalendarDays size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--ink, #0f172a)' }}>
          No Upcoming Events Scheduled
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Your schedule is clear! Click "+ Schedule Event" above to plan a meeting, interview, or team session.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {renderGroup('Happening Today', todayEvents, { bg: '#fee2e2', text: '#b91c1c' })}
      {renderGroup('Tomorrow', tomorrowEvents, { bg: '#fef3c7', text: '#b45309' })}
      {renderGroup('This Week (Next 7 Days)', thisWeekEvents, { bg: '#e0f2fe', text: '#0369a1' })}
      {renderGroup('Upcoming Later', futureEvents, { bg: '#f1f5f9', text: '#475569' })}
    </div>
  )
}
