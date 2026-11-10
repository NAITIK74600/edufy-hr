import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Users,
  Bell,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
  Check,
  ChevronDown,
  AlertCircle,
  Repeat,
} from 'lucide-react'
import { Button, Field } from '../ui'
import { calendarService } from '../../services/calendarService'

export const EVENT_CATEGORIES = [
  'Company Meeting',
  'Department Meeting',
  'Individual Meeting',
  'Client Meeting',
  'Employee Birthday',
  'Work Anniversary',
  'Company Holiday',
  'Training Session',
  'Interview',
  'Performance Review',
  'Project Deadline',
  'Employee Onboarding',
  'Contract Expiry',
  'Probation Completion',
  'Office Event',
  'Custom Event',
]

export function EventFormModal({
  isOpen,
  onClose,
  onSaved,
  initialEvent = null,
  employees = [],
  departments = [],
  user = null,
  defaultDate = null,
}) {
  if (!isOpen) return null

  const isEditing = Boolean(initialEvent?.id || initialEvent?._id)

  const [activeTab, setActiveTab] = useState('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form State
  const [title, setTitle] = useState(initialEvent?.title || '')
  const [description, setDescription] = useState(initialEvent?.description || '')
  const [category, setCategory] = useState(initialEvent?.category || 'Company Meeting')
  const [priority, setPriority] = useState(initialEvent?.priority || 'normal')
  const [visibility, setVisibility] = useState(initialEvent?.visibility || 'public')
  const [department, setDepartment] = useState(initialEvent?.department || 'All')

  // Date & Time
  const todayKey = defaultDate || new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(initialEvent?.date || todayKey)
  const [endDate, setEndDate] = useState(initialEvent?.endDate || initialEvent?.date || todayKey)
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '10:00')
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '11:00')
  const [allDay, setAllDay] = useState(Boolean(initialEvent?.allDay))

  // Recurrence
  const [recurrencePattern, setRecurrencePattern] = useState(initialEvent?.recurrence?.pattern || 'none')
  const [recurrenceInterval, setRecurrenceInterval] = useState(initialEvent?.recurrence?.interval || 1)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(initialEvent?.recurrence?.endDate || '')

  // Physical Location & Google Maps
  const [locationName, setLocationName] = useState(initialEvent?.location?.name || 'Head Office')
  const [locationAddress, setLocationAddress] = useState(initialEvent?.location?.address || '')
  const [locationFormattedAddress, setLocationFormattedAddress] = useState(initialEvent?.location?.formattedAddress || '')
  const [latitude, setLatitude] = useState(initialEvent?.location?.latitude || null)
  const [longitude, setLongitude] = useState(initialEvent?.location?.longitude || null)
  const [isPhysicalLocation, setIsPhysicalLocation] = useState(Boolean(initialEvent?.location?.isPhysical))
  const [placeQuery, setPlaceQuery] = useState('')
  const [placeSuggestions, setPlaceSuggestions] = useState([])
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false)

  const isMeetingCategory = (cat) => Boolean(cat && (cat.includes('Meeting') || cat.includes('Session') || cat.includes('Interview')))

  // Video Meeting (Google Meet - Real API generation via conferenceData)
  const initialCat = initialEvent?.category || 'Company Meeting'
  const shouldAutoMeet = !initialEvent && isMeetingCategory(initialCat)
  const [meetingUrl, setMeetingUrl] = useState(initialEvent?.meetingLink?.url || '')
  const [meetingProvider, setMeetingProvider] = useState(
    initialEvent?.meetingLink?.provider || (shouldAutoMeet ? 'google_meet' : 'none')
  )
  const [autoCreateMeet, setAutoCreateMeet] = useState(shouldAutoMeet || Boolean(initialEvent?.meetingLink?.url))
  const [meetCopied, setMeetCopied] = useState(false)
  const [externalEmailInput, setExternalEmailInput] = useState('')

  // Participants
  const [participants, setParticipants] = useState(() => {
    if (Array.isArray(initialEvent?.participants) && initialEvent.participants.length > 0) {
      return initialEvent.participants
    }
    return []
  })
  const [participantSearch, setParticipantSearch] = useState('')

  // Reminders (minutes before)
  const [selectedReminders, setSelectedReminders] = useState(() => {
    if (Array.isArray(initialEvent?.reminders) && initialEvent.reminders.length > 0) {
      return initialEvent.reminders.map((r) => r.minutesBefore)
    }
    return [15, 60]
  })

  // Google Maps Autocomplete Search
  useEffect(() => {
    if (!placeQuery || placeQuery.trim().length < 2) {
      setPlaceSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true)
      try {
        const results = await calendarService.searchPlaces(placeQuery)
        setPlaceSuggestions(results)
      } catch {
        setPlaceSuggestions([])
      } finally {
        setIsSearchingPlaces(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [placeQuery])

  const handleSelectPlace = (place) => {
    setLocationName(place.name || place.mainText || 'Meeting Venue')
    setLocationAddress(place.address || place.formattedAddress || '')
    setLocationFormattedAddress(place.formattedAddress || place.description || '')
    if (place.latitude) setLatitude(place.latitude)
    if (place.longitude) setLongitude(place.longitude)
    setIsPhysicalLocation(true)
    setPlaceQuery('')
    setPlaceSuggestions([])
  }

  const handleAddParticipant = (emp) => {
    const empId = String(emp.employeeId || emp.id || emp._id)
    if (participants.some((p) => p.employeeId === empId)) return
    setParticipants([
      ...participants,
      {
        employeeId: empId,
        name: emp.displayName || emp.name,
        email: emp.email || '',
        department: emp.department || 'General',
        avatarUrl: emp.avatarUrl || null,
        role: 'required',
        rsvpStatus: 'pending',
      },
    ])
    setParticipantSearch('')
  }

  const handleRemoveParticipant = (empId) => {
    setParticipants(participants.filter((p) => p.employeeId !== empId))
  }

  const handleToggleParticipantRole = (empId) => {
    setParticipants(
      participants.map((p) => {
        if (p.employeeId !== empId) return p
        return { ...p, role: p.role === 'required' ? 'optional' : 'required' }
      })
    )
  }

  const handleGenerateGoogleMeet = () => {
    setAutoCreateMeet(true)
    setMeetingProvider('google_meet')
  }

  const handleCopyMeet = () => {
    if (meetingUrl) {
      navigator.clipboard?.writeText(meetingUrl)
      setMeetCopied(true)
      setTimeout(() => setMeetCopied(false), 2000)
    }
  }

  const handleCategoryChange = (newCat) => {
    setCategory(newCat)
    if (isMeetingCategory(newCat)) {
      setMeetingProvider('google_meet')
      setAutoCreateMeet(true)
    }
  }

  const handleAddExternalGuest = () => {
    const email = externalEmailInput.trim().toLowerCase()
    if (!email || !email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid guest email address.')
      return
    }
    if (participants.some((p) => (p.email || '').toLowerCase() === email)) {
      alert('This guest is already in the attendee list.')
      return
    }
    setParticipants([
      ...participants,
      {
        employeeId: 'ext_' + Math.random().toString(36).substring(2, 10),
        name: email.split('@')[0],
        email,
        department: 'External Guest',
        role: 'required',
        rsvpStatus: 'pending',
        isExternal: true,
      },
    ])
    setExternalEmailInput('')
  }

  const toggleReminder = (mins) => {
    if (selectedReminders.includes(mins)) {
      setSelectedReminders(selectedReminders.filter((m) => m !== mins))
    } else {
      setSelectedReminders([...selectedReminders, mins])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMessage('Please enter an event title.')
      setActiveTab('details')
      return
    }
    if (!date) {
      setErrorMessage('Please select an event date.')
      setActiveTab('schedule')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        visibility,
        department,
        date,
        startDate: date,
        endDate: endDate || date,
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
        allDay,
        recurrence: {
          pattern: recurrencePattern,
          interval: Number(recurrenceInterval) || 1,
          endDate: recurrenceEndDate || null,
        },
        location: {
          name: locationName,
          address: locationAddress,
          formattedAddress: locationFormattedAddress,
          latitude,
          longitude,
          isPhysical: isPhysicalLocation,
        },
        isPhysicalLocation,
        meetingLink: {
          url: meetingUrl.trim(),
          provider: meetingProvider,
        },
        meetingUrl: meetingUrl.trim(),
        meetingProvider,
        autoCreateMeet,
        participants,
        reminders: selectedReminders.map((mins) => ({
          minutesBefore: mins,
          channel: 'both',
          sent: false,
        })),
      }

      if (isEditing) {
        await calendarService.updateEvent(initialEvent.id || initialEvent._id, payload)
      } else {
        await calendarService.createEvent(payload)
      }

      onSaved?.()
      onClose()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const q = participantSearch.toLowerCase()
    const name = (emp.displayName || emp.name || '').toLowerCase()
    const empId = (emp.employeeId || emp.id || '').toLowerCase()
    const dept = (emp.department || '').toLowerCase()
    return name.includes(q) || empId.includes(q) || dept.includes(q)
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg, #f8fafc)',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
              {isEditing ? 'Edit Calendar Event' : 'Create Smart Calendar Event'}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--muted, #64748b)', marginTop: '2px' }}>
              Schedule meetings, training, deadlines, or company announcements with automated reminders.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border, #e2e8f0)',
            background: '#ffffff',
            padding: '0 16px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'details', label: '1. Event Details', icon: CalendarIcon },
            { id: 'schedule', label: '2. Timing & Recurrence', icon: Clock },
            { id: 'location', label: '3. Location & Meet', icon: MapPin },
            { id: 'participants', label: `4. Participants (${participants.length})`, icon: Users },
            { id: 'reminders', label: '5. Reminders & Notes', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 14px',
                  border: 'none',
                  background: 'none',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--teal, #006E6F)' : 'var(--muted, #64748b)',
                  borderBottom: isActive ? '2px solid var(--teal, #006E6F)' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 20px',
              background: '#fee2e2',
              color: '#b91c1c',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', flex: 1 }}>
            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Field label="Event Title" required>
                  <input
                    type="text"
                    className="ui-input"
                    placeholder="e.g. Q4 Strategy Review, Client Demo, Team Standup"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <Field label="Category" required>
                    <select
                      className="ui-select"
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      {EVENT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Department">
                    <select
                      className="ui-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="All">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.name || d} value={d.name || d}>{d.name || d}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <Field label="Priority">
                    <select
                      className="ui-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">🚨 Urgent Priority</option>
                    </select>
                  </Field>

                  <Field label="Visibility">
                    <select
                      className="ui-select"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                    >
                      <option value="public">Public (Visible to All)</option>
                      <option value="department">Department Only</option>
                      <option value="participants_only">Participants Only</option>
                      <option value="private">Private</option>
                    </select>
                  </Field>
                </div>

                <Field label="Description & Agenda">
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    placeholder="Meeting objectives, dial-in guidelines, or agenda notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>

                {/* Quick Google Meet Integration Card in Details Tab */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: (meetingUrl || autoCreateMeet) ? '#f0fdf4' : '#f8fafc',
                    border: (meetingUrl || autoCreateMeet) ? '1.5px solid #86efac' : '1px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: (meetingUrl || autoCreateMeet) ? '#059669' : '#e2e8f0',
                        color: (meetingUrl || autoCreateMeet) ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Video size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: (meetingUrl || autoCreateMeet) ? '#065f46' : 'var(--ink, #1e293b)' }}>
                        {meetingUrl ? 'Google Meet Video Call Attached' : autoCreateMeet ? 'Google Meet Auto-Generation Enabled' : 'Google Meet Video Conference'}
                      </div>
                      <div style={{ fontSize: '11px', color: (meetingUrl || autoCreateMeet) ? '#047857' : 'var(--muted, #64748b)' }}>
                        {meetingUrl
                          ? meetingUrl
                          : autoCreateMeet
                          ? 'Genuine Google Meet video link will be generated via Google Calendar API upon submission.'
                          : 'Attach a 1-click Google Meet video link for all participants.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!autoCreateMeet && !meetingUrl ? (
                      <button
                        type="button"
                        onClick={handleGenerateGoogleMeet}
                        style={{
                          padding: '6px 14px',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sparkles size={13} />
                        Add Google Meet
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAutoCreateMeet(false)
                          setMeetingUrl('')
                          setMeetingProvider('none')
                        }}
                        style={{
                          padding: '6px 10px',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Remove Meet
                      </button>
                    )}

                    {meetingUrl && (
                      <>
                        <a
                          href={meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 10px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <ExternalLink size={12} /> Test
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyMeet}
                          style={{
                            padding: '6px 10px',
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {meetCopied ? '✓ Copied' : 'Copy'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SCHEDULE & RECURRENCE */}
            {activeTab === 'schedule' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                  <input
                    type="checkbox"
                    id="allDayCheckbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="allDayCheckbox" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    All-day event (no specific start/end time)
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <Field label="Event Date (Start)" required>
                    <input
                      type="date"
                      className="ui-input"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value)
                        if (!endDate || endDate < e.target.value) setEndDate(e.target.value)
                      }}
                      required
                    />
                  </Field>

                  <Field label="End Date">
                    <input
                      type="date"
                      className="ui-input"
                      value={endDate}
                      min={date}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Field>
                </div>

                {!allDay && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <Field label="Start Time">
                      <input
                        type="time"
                        className="ui-input"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </Field>

                    <Field label="End Time">
                      <input
                        type="time"
                        className="ui-input"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {/* Recurrence Settings */}
                <div style={{ borderTop: '1px solid var(--border, #e2e8f0)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Repeat size={16} color="var(--teal, #006E6F)" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink, #0f172a)' }}>
                      Recurring Schedule
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <Field label="Repeats">
                      <select
                        className="ui-select"
                        value={recurrencePattern}
                        onChange={(e) => setRecurrencePattern(e.target.value)}
                      >
                        <option value="none">Does not repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </Field>

                    {recurrencePattern !== 'none' && (
                      <Field label="Recurrence End Date">
                        <input
                          type="date"
                          className="ui-input"
                          value={recurrenceEndDate}
                          min={date}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        />
                      </Field>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LOCATION & VIDEO MEETING */}
            {activeTab === 'location' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Google Meet & Video Conference */}
                <div style={{ padding: '16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={18} color="#059669" />
                      <strong style={{ fontSize: '13px', color: '#065f46' }}>Video Conference (Google Meet)</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateGoogleMeet}
                      style={{
                        padding: '6px 12px',
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{meetingUrl ? 'Regenerate Meet' : 'Generate Google Meet'}</span>
                    </button>
                  </div>

                  <Field label="Meeting Link / URL">
                    <input
                      type="url"
                      className="ui-input"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom / Teams link"
                      value={meetingUrl}
                      onChange={(e) => {
                        setMeetingUrl(e.target.value)
                        if (e.target.value.includes('meet.google.com')) setMeetingProvider('google_meet')
                        else if (e.target.value.includes('zoom.us')) setMeetingProvider('zoom')
                        else if (e.target.value.includes('teams.microsoft.com')) setMeetingProvider('teams')
                        else if (e.target.value) setMeetingProvider('custom')
                        else setMeetingProvider('none')
                      }}
                    />
                  </Field>

                  {meetingUrl && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ExternalLink size={13} /> Test Meeting Link
                      </a>
                    </div>
                  )}
                </div>

                {/* Physical Location & Google Maps */}
                <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <MapPin size={18} color="var(--teal, #006E6F)" />
                    <strong style={{ fontSize: '13px', color: 'var(--ink, #0f172a)' }}>Physical Meeting Location & Google Maps</strong>
                  </div>

                  {/* Google Places search autocomplete */}
                  <div style={{ position: 'relative', marginBottom: '14px' }}>
                    <Field label="Search Location / Places">
                      <input
                        type="text"
                        className="ui-input"
                        placeholder="Search office campuses, conference halls, hotels, client locations..."
                        value={placeQuery}
                        onChange={(e) => setPlaceQuery(e.target.value)}
                      />
                    </Field>

                    {placeSuggestions.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: '#ffffff',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #e2e8f0',
                          zIndex: 10,
                          maxHeight: '220px',
                          overflowY: 'auto',
                        }}
                      >
                        {placeSuggestions.map((place, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectPlace(place)}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              fontSize: '12px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                          >
                            <div style={{ fontWeight: 700, color: 'var(--ink, #0f172a)' }}>{place.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)' }}>{place.address}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <Field label="Venue Name">
                      <input
                        type="text"
                        className="ui-input"
                        value={locationName}
                        onChange={(e) => {
                          setLocationName(e.target.value)
                          setIsPhysicalLocation(true)
                        }}
                        placeholder="e.g. Ignite Campus Boardroom"
                      />
                    </Field>

                    <Field label="Address">
                      <input
                        type="text"
                        className="ui-input"
                        value={locationAddress}
                        onChange={(e) => {
                          setLocationAddress(e.target.value)
                          setIsPhysicalLocation(true)
                        }}
                        placeholder="Street, Landmark, City"
                      />
                    </Field>
                  </div>

                  {(locationAddress || locationName) && (
                    <div style={{ marginTop: '10px' }}>
                      <a
                        href={calendarService.searchPlaces ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locationName}, ${locationAddress}`)}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ExternalLink size={13} /> Open in Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: PARTICIPANTS */}
            {activeTab === 'participants' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Field label="Search & Add Participants">
                  <input
                    type="text"
                    className="ui-input"
                    placeholder="Search employee by name, ID, or department..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                  />
                </Field>

                {participantSearch && (
                  <div
                    style={{
                      maxHeight: '180px',
                      overflowY: 'auto',
                      border: '1px solid var(--border, #e2e8f0)',
                      borderRadius: '8px',
                      background: '#ffffff',
                    }}
                  >
                    {filteredEmployees.slice(0, 8).map((emp) => {
                      const empId = String(emp.employeeId || emp.id || emp._id)
                      const isAdded = participants.some((p) => p.employeeId === empId)
                      return (
                        <div
                          key={empId}
                          onClick={() => !isAdded && handleAddParticipant(emp)}
                          style={{
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: isAdded ? 'default' : 'pointer',
                            opacity: isAdded ? 0.5 : 1,
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '12px' }}>{emp.displayName || emp.name}</strong>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>
                              {emp.employeeId} • {emp.department || 'General'}
                            </div>
                          </div>
                          {isAdded ? (
                            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Added</span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--teal, #006E6F)', fontWeight: 700 }}>+ Add</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* External Guests / Outside Email Addresses */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--ink, #0f172a)', marginBottom: '6px' }}>
                    Invite External Guest (Client, Candidate, Investor)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      className="ui-input"
                      placeholder="e.g. client@partner.com, candidate@gmail.com"
                      value={externalEmailInput}
                      onChange={(e) => setExternalEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddExternalGuest()
                        }
                      }}
                      style={{ fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddExternalGuest}
                      style={{
                        padding: '6px 14px',
                        background: '#0d9488',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + Add Guest
                    </button>
                  </div>
                  <small style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    External guests receive official Google Calendar invitations and Google Meet access directly in their inbox.
                  </small>
                </div>

                {/* Selected Participants List */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted, #64748b)', marginBottom: '8px' }}>
                    Scheduled Participants ({participants.length})
                  </div>
                  {participants.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                      No participants added yet. Use the search bar above to invite team members.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {participants.map((p) => (
                        <div
                          key={p.employeeId}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>{p.employeeId} • {p.department}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleParticipantRole(p.employeeId)}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: p.role === 'required' ? '#e0f2fe' : '#f1f5f9',
                                color: p.role === 'required' ? '#0369a1' : '#475569',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {p.role === 'required' ? 'Required' : 'Optional'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveParticipant(p.employeeId)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: REMINDERS & NOTES */}
            {activeTab === 'reminders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink, #0f172a)', display: 'block', marginBottom: '8px' }}>
                    Automated Event Reminders (Email & In-App)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    {[
                      { mins: 5, label: '5 minutes before' },
                      { mins: 15, label: '15 minutes before' },
                      { mins: 30, label: '30 minutes before' },
                      { mins: 60, label: '1 hour before' },
                      { mins: 1440, label: '1 day before' },
                    ].map((rem) => {
                      const isChecked = selectedReminders.includes(rem.mins)
                      return (
                        <div
                          key={rem.mins}
                          onClick={() => toggleReminder(rem.mins)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${isChecked ? 'var(--teal, #006E6F)' : '#e2e8f0'}`,
                            background: isChecked ? '#f0fdfa' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            fontWeight: isChecked ? 700 : 500,
                            color: isChecked ? 'var(--teal, #006E6F)' : 'var(--ink, #0f172a)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{rem.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                  💡 <strong>Smart Notification Rule:</strong> Reminders are dispatched in the background with idempotency guarantees to prevent duplicate emails and bell alerts.
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg, #f8fafc)',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeTab !== 'details' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['details', 'schedule', 'location', 'participants', 'reminders']
                    const prevIdx = tabs.indexOf(activeTab) - 1
                    if (prevIdx >= 0) setActiveTab(tabs[prevIdx])
                  }}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Back
                </Button>
              )}
              {activeTab !== 'reminders' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['details', 'schedule', 'location', 'participants', 'reminders']
                    const nextIdx = tabs.indexOf(activeTab) + 1
                    if (nextIdx < tabs.length) setActiveTab(tabs[nextIdx])
                  }}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Next Step
                </Button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="button" variant="ghost" onClick={onClose} style={{ fontSize: '12px', padding: '6px 14px' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                style={{ fontSize: '12px', padding: '8px 18px', fontWeight: 700 }}
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

