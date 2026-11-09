import React, { useState, useEffect } from 'react'
import { Calendar, Cake, Award, Sparkles, ChevronRight, Clock, Video, ExternalLink, Plus, MapPin } from 'lucide-react'
import { calendarService } from '../../services/calendarService'
import { hrStore } from '../../services/hrStore'

export function CalendarWidgets({ user = null }) {
  const [widgetsData, setWidgetsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    calendarService
      .getWidgets()
      .then((data) => {
        if (mounted && data) {
          setWidgetsData(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const portal = user?.role === 'admin' ? 'admin' : user?.role === 'employee' ? 'employee' : 'hr'

  // Fallback to hrStore if widget API data not yet ready
  const storeState = hrStore.getState()
  const toLocalDateStr = (d = new Date()) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dayNum}`
  }
  const todayStr = toLocalDateStr(new Date())
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // 1. Holidays
  const holidays =
    widgetsData?.upcomingHolidays ||
    (storeState.holidays || [])
      .filter((h) => h.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4)

  const nextHoliday = holidays[0]

  const daysLeft =
    nextHoliday?.daysRemaining !== undefined && nextHoliday?.daysRemaining !== null
      ? nextHoliday.daysRemaining
      : nextHoliday?.date
      ? Math.ceil((new Date(nextHoliday.date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
      : null

  const isLongWeekend = (dateStr) => {
    if (!dateStr) return false
    const d = new Date(`${dateStr}T00:00:00Z`)
    if (isNaN(d.getTime())) return false
    const day = d.getUTCDay()
    return day === 1 || day === 5
  }

  const getGoogleCalendarUrl = (h) => {
    if (!h?.date) return '#'
    const title = encodeURIComponent(h.name || h.title || 'Holiday')
    const start = (h.date || '').replace(/-/g, '')
    const d = new Date(h.endDate || h.date)
    d.setDate(d.getDate() + 1)
    const end = d.toISOString().split('T')[0].replace(/-/g, '')
    const desc = encodeURIComponent(`${h.category || 'Official Holiday'} - Edufyi HR Calendar`)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${desc}`
  }

  // 2. Birthdays
  const birthdays =
    widgetsData?.birthdaysThisMonth ||
    (storeState.employees || [])
      .filter((e) => {
        const rawDob = e.dob || e.identity?.dob
        if (!rawDob) return false
        const d = new Date(rawDob)
        if (isNaN(d.getTime())) return false
        const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000))
        return istDate.getUTCMonth() + 1 === currentMonth
      })
      .map((e) => {
        const rawDob = e.dob || e.identity?.dob
        const d = new Date(rawDob)
        const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000))
        const day = String(istDate.getUTCDate()).padStart(2, '0')
        return {
          id: e.id || e._id,
          name: e.displayName || e.name,
          department: e.department || 'General',
          date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${day}`,
        }
      })

  // 3. Anniversaries
  const anniversaries =
    widgetsData?.anniversariesThisMonth ||
    (storeState.employees || [])
      .filter((e) => {
        if (!e.joiningDate) return false
        const d = new Date(e.joiningDate)
        return !isNaN(d.getTime()) && d.getUTCMonth() + 1 === currentMonth && currentYear - d.getUTCFullYear() > 0
      })
      .map((e) => {
        const d = new Date(e.joiningDate)
        return {
          id: e.id || e._id,
          name: e.displayName || e.name,
          department: e.department || 'General',
          completedYears: currentYear - d.getUTCFullYear(),
          date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`,
        }
      })

  // 4. Upcoming Meetings & Google Meet Video Calls
  const upcomingMeetings = widgetsData?.upcomingMeetings || []

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
      className="calendar-widgets-container"
    >
      {/* 1. Upcoming Holiday Card */}
      <div
        className="panel hover-card"
        style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal, #006E6F)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> Upcoming Holiday
            </span>
            <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {widgetsData?.totalHolidaysThisYear || storeState.holidays?.length || 0} This Year
            </span>
          </div>

          {nextHoliday ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
                  {nextHoliday.name || nextHoliday.title}
                </h4>
                {daysLeft !== null && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '12px',
                      background: daysLeft <= 2 ? '#dcfce7' : '#e0f2fe',
                      color: daysLeft <= 2 ? '#166534' : '#0369a1',
                    }}
                  >
                    {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
                  </span>
                )}
                {isLongWeekend(nextHoliday.date) && (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '12px', background: '#fef3c7', color: '#b45309' }}>
                    🎉 3-Day Weekend
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted, #64748b)' }}>
                <Clock size={13} />
                <span>{nextHoliday.date} ({nextHoliday.day || 'Day'})</span>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--muted, #64748b)' }}>
              No upcoming company holidays scheduled soon.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border, #f1f5f9)' }}>
          <a
            href={`#/${portal}/holidays`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--teal, #006E6F)',
              textDecoration: 'none',
            }}
          >
            View Calendar <ChevronRight size={14} />
          </a>

          {nextHoliday && (
            <a
              href={getGoogleCalendarUrl(nextHoliday)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#0284c7',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
              title="Add this holiday to Google Calendar"
            >
              + G-Cal
            </a>
          )}
        </div>
      </div>

      {/* 2. Birthdays This Month */}
      <div
        className="panel hover-card"
        style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#db2777', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cake size={13} /> Birthdays This Month
            </span>
            <span style={{ fontSize: '11px', background: '#fdf2f8', color: '#db2777', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {birthdays.length} Celebrations
            </span>
          </div>

          {birthdays.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {birthdays.slice(0, 3).map((b) => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ink, #1e293b)' }}>🎂 {b.name}</span>
                  <span style={{ color: 'var(--muted, #64748b)', fontSize: '11px' }}>
                    {b.date ? b.date.slice(5) : ''} ({b.department})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--muted, #64748b)' }}>
              No employee birthdays this month.
            </p>
          )}
        </div>

        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border, #f1f5f9)' }}>
          <a
            href={`#/${portal}/holidays`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#db2777',
              textDecoration: 'none',
            }}
          >
            Celebrations Board <ChevronRight size={14} />
          </a>
        </div>
      </div>

      {/* 3. Work Anniversaries This Month */}
      <div
        className="panel hover-card"
        style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={13} /> Work Anniversaries
            </span>
            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {anniversaries.length} Milestones
            </span>
          </div>

          {anniversaries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {anniversaries.slice(0, 3).map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ink, #1e293b)' }}>🎖️ {a.name}</span>
                  <span style={{ color: '#b45309', fontWeight: 700, fontSize: '11px' }}>
                    {a.completedYears} Year{a.completedYears > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--muted, #64748b)' }}>
              No employment anniversaries this month.
            </p>
          )}
        </div>

        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border, #f1f5f9)' }}>
          <a
            href={`#/${portal}/holidays`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#d97706',
              textDecoration: 'none',
            }}
          >
            Celebrate Milestones <ChevronRight size={14} />
          </a>
        </div>
      </div>

      {/* 4. Meetings & Google Meet Video Calls Card */}
      <div
        className="panel hover-card"
        style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Video size={13} /> Team Meetings & Meet
            </span>
            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {upcomingMeetings.length} Scheduled
            </span>
          </div>

          {upcomingMeetings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingMeetings.slice(0, 2).map((m) => (
                <div key={m.id || m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                  <div style={{ minWidth: 0, flex: 1, marginRight: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink, #1e293b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--muted, #64748b)' }}>
                      {m.date} {m.startTime ? `• ${m.startTime}` : ''}
                    </div>
                  </div>
                  {m.meetingLink?.url && (
                    <a
                      href={m.meetingLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 8px',
                        background: '#059669',
                        color: '#ffffff',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0,
                      }}
                    >
                      <Video size={11} /> Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--muted, #64748b)' }}>
              No meetings scheduled. Click below to schedule a session with Google Meet.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border, #f1f5f9)' }}>
          <a
            href={`#/${portal}/holidays`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#059669',
              textDecoration: 'none',
            }}
          >
            + Schedule Session <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
