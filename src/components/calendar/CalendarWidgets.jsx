import { useState, useEffect } from 'react'
import { Calendar, Cake, Award, Sparkles, ChevronRight, Clock } from 'lucide-react'
import { calendarService } from '../../services/calendarService'
import { hrStore } from '../../services/hrStore'

export function CalendarWidgets({ user = null }) {
  const [widgetsData, setWidgetsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    calendarService.getWidgets().then((data) => {
      if (mounted && data) {
        setWidgetsData(data)
        setIsLoading(false)
      }
    }).catch(() => {
      if (mounted) setIsLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const portal = user?.role === 'admin' ? 'admin' : user?.role === 'employee' ? 'employee' : 'hr'

  // Fallback to hrStore if widget API data not yet ready
  const storeState = hrStore.getState()
  const todayStr = new Date().toISOString().split('T')[0]
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const holidays = widgetsData?.upcomingHolidays || (storeState.holidays || [])
    .filter((h) => h.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const nextHoliday = widgetsData?.nextHoliday || (holidays.length > 0 ? holidays[0] : null)

  const birthdays = widgetsData?.birthdaysThisMonth || (storeState.employees || [])
    .filter((e) => {
      if (!e.dob) return false
      const d = new Date(e.dob)
      return !isNaN(d.getTime()) && (d.getUTCMonth() + 1) === currentMonth
    })
    .map((e) => ({
      id: e.id || e._id,
      name: e.displayName || e.name,
      department: e.department || 'General',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(new Date(e.dob).getUTCDate()).padStart(2, '0')}`,
    }))

  const anniversaries = widgetsData?.anniversariesThisMonth || (storeState.employees || [])
    .filter((e) => {
      if (!e.joiningDate) return false
      const d = new Date(e.joiningDate)
      return !isNaN(d.getTime()) && (d.getUTCMonth() + 1) === currentMonth && (currentYear - d.getUTCFullYear()) > 0
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }} className="calendar-widgets-container">
      {/* 1. Next Holiday Card */}
      <div
        className="panel hover-card"
        style={{
          padding: '18px',
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
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal, #006E6F)', textTransform: 'uppercase' }}>
              Upcoming Holiday
            </span>
            <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {widgetsData?.totalHolidaysThisYear || storeState.holidays?.length || 0} This Year
            </span>
          </div>

          {nextHoliday ? (
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
                {nextHoliday.name || nextHoliday.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted, #64748b)' }}>
                <Clock size={13} />
                <span>{nextHoliday.date} ({nextHoliday.day || 'Day'})</span>
                {nextHoliday.daysRemaining !== undefined && nextHoliday.daysRemaining !== null && (
                  <span style={{ fontWeight: 700, color: '#0284c7' }}>
                    • In {nextHoliday.daysRemaining} days
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted, #64748b)' }}>
              No upcoming company holidays scheduled soon.
            </p>
          )}
        </div>

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
            marginTop: '12px',
          }}
        >
          View Full Calendar <ChevronRight size={14} />
        </a>
      </div>

      {/* 2. Birthdays This Month */}
      <div
        className="panel hover-card"
        style={{
          padding: '18px',
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
                  <span style={{ fontWeight: 700, color: 'var(--ink, #1e293b)' }}>{b.name}</span>
                  <span style={{ color: 'var(--muted, #64748b)', fontSize: '11px' }}>{b.date.slice(5)} ({b.department})</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted, #64748b)' }}>
              No employee birthdays this month.
            </p>
          )}
        </div>

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
            marginTop: '12px',
          }}
        >
          Send Celebration Wishes <ChevronRight size={14} />
        </a>
      </div>

      {/* 3. Work Anniversaries This Month */}
      <div
        className="panel hover-card"
        style={{
          padding: '18px',
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
                  <span style={{ fontWeight: 700, color: 'var(--ink, #1e293b)' }}>{a.name}</span>
                  <span style={{ color: '#b45309', fontWeight: 700, fontSize: '11px' }}>
                    {a.completedYears} Year{a.completedYears > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted, #64748b)' }}>
              No employment anniversaries this month.
            </p>
          )}
        </div>

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
            marginTop: '12px',
          }}
        >
          Celebrate Milestones <ChevronRight size={14} />
        </a>
      </div>
    </div>
  )
}

