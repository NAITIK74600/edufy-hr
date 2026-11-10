import React, { useState, useEffect, useMemo } from 'react'
import {
  Video,
  Calendar,
  Clock,
  Users,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  User,
  Sparkles,
} from 'lucide-react'
import { apiClient } from '../../services/apiClient.js'
import { Button } from '../ui'

export function MeetingsDashboardView({
  onScheduleMeeting,
  onSelectMeeting,
  canSchedule = true,
  currentUser,
}) {
  const [filter, setFilter] = useState('upcoming') // 'today' | 'upcoming' | 'completed' | 'cancelled' | 'my'
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    summary: { today: 0, upcoming: 0, completed: 0, cancelled: 0, my: 0 },
    today: [],
    upcoming: [],
    completed: [],
    cancelled: [],
    my: [],
  })

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/calendar/meetings/dashboard')
      if (res.data?.success && res.data?.data) {
        setDashboardData(res.data.data)
      }
    } catch (err) {
      console.warn('[MeetingsDashboard] Failed to fetch dashboard meetings:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const currentList = useMemo(() => {
    const list = dashboardData[filter] || []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter((m) =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q) ||
      (m.organizer?.name || '').toLowerCase().includes(q) ||
      (m.attendees || []).some((a) => (a.name || a.email || '').toLowerCase().includes(q))
    )
  }, [dashboardData, filter, search])

  const tabs = [
    { id: 'today', label: "Today's Meetings", count: dashboardData.summary?.today ?? 0, icon: Clock, color: '#0d9488' },
    { id: 'upcoming', label: 'Upcoming', count: dashboardData.summary?.upcoming ?? 0, icon: CalendarDays, color: '#2563eb' },
    { id: 'completed', label: 'Completed', count: dashboardData.summary?.completed ?? 0, icon: CheckCircle2, color: '#16a34a' },
    { id: 'cancelled', label: 'Cancelled', count: dashboardData.summary?.cancelled ?? 0, icon: XCircle, color: '#dc2626' },
    { id: 'my', label: 'Created By Me', count: dashboardData.summary?.my ?? 0, icon: User, color: '#7c3aed' },
  ]

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Top Header & Metrics Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff',
          padding: '18px 22px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(13, 148, 136, 0.1)',
                color: '#0d9488',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Video size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
              Meetings Dashboard
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
            Schedule and track Google Calendar events and genuine Google Meet video conferences.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            title="Refresh meetings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            Refresh
          </button>

          {canSchedule && (
            <button
              type="button"
              onClick={onScheduleMeeting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
              }}
            >
              <Plus size={15} />
              Schedule Meeting
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = filter === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: isActive ? `2px solid ${t.color}` : '1px solid #e2e8f0',
                background: isActive ? '#f8fafc' : '#ffffff',
                color: isActive ? t.color : '#64748b',
                fontWeight: isActive ? 700 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} color={isActive ? t.color : '#94a3b8'} />
              <span>{t.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: isActive ? t.color : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                }}
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', maxWidth: '380px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search meeting title, organizer, or attendee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ui-input"
          style={{ paddingLeft: '34px', fontSize: '12.5px' }}
        />
      </div>

      {/* Meetings List */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
          <p style={{ margin: 0, fontSize: '13px' }}>Loading Google Calendar meetings...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '14px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#f1f5f9',
              color: '#94a3b8',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Video size={22} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
            No meetings found
          </h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
            {search
              ? 'No meetings match your search query.'
              : filter === 'today'
              ? 'No meetings scheduled for today.'
              : filter === 'upcoming'
              ? 'No upcoming meetings on your calendar.'
              : filter === 'cancelled'
              ? 'No cancelled meetings recorded.'
              : 'No meetings created yet.'}
          </p>
          {canSchedule && (
            <button
              type="button"
              onClick={onScheduleMeeting}
              style={{
                marginTop: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #0d9488',
                background: '#ffffff',
                color: '#0d9488',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Schedule Now
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {currentList.map((m) => {
            const isConfirmedMeet = m.conferenceStatus === 'confirmed' || Boolean(m.meetUrl)
            const attendeeCount = (m.attendees || []).length
            const isCancelled = m.status === 'cancelled'

            return (
              <div
                key={m._id || m.id}
                onClick={() => onSelectMeeting && onSelectMeeting(m)}
                style={{
                  background: '#ffffff',
                  border: isCancelled ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isCancelled ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isCancelled ? '#ef4444' : '#0d9488'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isCancelled ? '#fecaca' : '#e2e8f0'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                {/* Left Column: Date & Time Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px' }}>
                  <div
                    style={{
                      background: isCancelled ? '#fef2f2' : '#f0fdf4',
                      border: isCancelled ? '1px solid #fecaca' : '1px solid #bbf7d0',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      textAlign: 'center',
                      minWidth: '70px',
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: isCancelled ? '#dc2626' : '#15803d' }}>
                      {m.date ? new Date(m.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' }) : 'DATE'}
                    </span>
                    <strong style={{ fontSize: '16px', fontWeight: 800, color: isCancelled ? '#b91c1c' : '#166534' }}>
                      {m.date ? new Date(m.date + 'T00:00:00').getDate() : '--'}
                    </strong>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} color="#64748b" />
                      <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                        {m.startTime || '10:00'} - {m.endTime || '11:00'}
                      </strong>
                    </div>
                    <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                      {m.timezone || 'Asia/Kolkata'}
                    </small>
                  </div>
                </div>

                {/* Middle Column: Title, Organizer, Attendees */}
                <div style={{ flex: '1 1 300px', minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                      {m.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: isCancelled ? '#fee2e2' : '#ecfdf5',
                        color: isCancelled ? '#b91c1c' : '#047857',
                        border: isCancelled ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                        textTransform: 'uppercase',
                      }}
                    >
                      {m.status || 'Confirmed'}
                    </span>
                  </div>

                  {m.description && (
                    <p style={{ margin: '3px 0 6px', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '450px' }}>
                      {m.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', color: '#64748b', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span>
                      Organizer: <strong style={{ color: '#334155' }}>{m.organizer?.name || 'Staff'}</strong>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} />
                      {attendeeCount} Attendee{attendeeCount === 1 ? '' : 's'}
                    </span>
                    {m.googleEventId && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#0d9488', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <ShieldCheck size={12} /> Google Calendar Synced
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Google Meet Join Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isConfirmedMeet && m.meetUrl ? (
                    <a
                      href={m.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: '#047857',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)',
                      }}
                    >
                      <Video size={14} />
                      Join Google Meet
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#64748b',
                      }}
                    >
                      No Video Link
                    </span>
                  )}
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
