import React, { useState } from 'react'
import {
  X,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Users,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '../ui'
import { calendarService } from '../../services/calendarService'
import { formatGoogleCalendarUrl, isGoogleMeet, getMeetCode } from '../../utils/googleCalendarHelper'

export function EventDetailModal({
  event: initialEvent,
  onClose,
  onEdit,
  onDeleted,
  onRsvpUpdated,
  user = null,
  canManage = false,
  categoryStyles = {},
}) {
  if (!initialEvent) return null

  const [event, setEvent] = useState(initialEvent)
  const [isCopied, setIsCopied] = useState(false)
  const [isMeetCopied, setIsMeetCopied] = useState(false)
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false)
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false)
  const [isRsvping, setIsRsvping] = useState(false)
  const [rsvpFeedback, setRsvpFeedback] = useState('')
  const [showCancelPrompt, setShowCancelPrompt] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const actorId = String(user?.id || user?.employeeId || user?._id || '')
  const isOwner = event.isOwner || event.ownerId === actorId || event.organizer?.employeeId === actorId
  const hasEditRights = canManage || isOwner

  const participants = Array.isArray(event.participants) ? event.participants : []
  const myParticipantRecord = participants.find((p) => p.employeeId === actorId)
  const currentRsvp = myParticipantRecord?.rsvpStatus || event.userRsvp || 'none'

  const styleInfo = categoryStyles[event.category] || {
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
  }

  const handleRsvp = async (status) => {
    setIsRsvping(true)
    try {
      await calendarService.respondToInvitation(event.entityId || event.id, { status })
      setRsvpFeedback(`RSVP marked as ${status.toUpperCase()}!`)
      onRsvpUpdated?.()
      setTimeout(() => setRsvpFeedback(''), 3000)
    } catch (err) {
      setRsvpFeedback('Failed to update RSVP: ' + err.message)
    } finally {
      setIsRsvping(false)
    }
  }

  const handleGenerateMeet = async () => {
    setIsGeneratingMeet(true)
    try {
      const res = await calendarService.generateMeetLink(event.entityId || event.id)
      if (res?.data) {
        setEvent((prev) => ({ ...prev, meetingLink: res.data }))
        setRsvpFeedback('✅ Google Meet link generated and attached!')
        onRsvpUpdated?.()
        setTimeout(() => setRsvpFeedback(''), 3000)
      }
    } catch (err) {
      alert('Could not generate Google Meet: ' + err.message)
    } finally {
      setIsGeneratingMeet(false)
    }
  }

  const handleCopyMeetLink = () => {
    const url = event.meetingLink?.url
    if (url) {
      navigator.clipboard?.writeText(url)
      setIsMeetCopied(true)
      setTimeout(() => setIsMeetCopied(false), 2000)
    }
  }

  const handleGoogleSync = async () => {
    setIsGoogleSyncing(true)
    try {
      const res = await calendarService.syncGoogleCalendarEvent(event.entityId || event.id)
      if (res?.data) {
        if (res.data.meetingLink) {
          setEvent((prev) => ({ ...prev, meetingLink: res.data.meetingLink }))
        }
        setRsvpFeedback('✅ Synchronized with Google Calendar & Google Meet!')
        onRsvpUpdated?.()
        setTimeout(() => setRsvpFeedback(''), 3000)
      }
    } catch (err) {
      alert('Google Calendar sync notice: ' + err.message)
    } finally {
      setIsGoogleSyncing(false)
    }
  }

  const handleConfirmCancel = async () => {
    try {
      await calendarService.deleteEvent(event.entityId || event.id, cancelReason)
      onDeleted?.()
      onClose()
    } catch (err) {
      alert('Could not cancel event: ' + err.message)
    }
  }

  const handleCopyDetails = () => {
    const meetStr = event.meetingLink?.url ? `\nGoogle Meet: ${event.meetingLink.url}` : ''
    const locStr = event.location?.name ? `\nLocation: ${event.location.name} (${event.location.address || ''})` : ''
    const text = `${event.title}\nDate: ${event.date} (${event.startTime || 'All Day'})\nCategory: ${event.category}${locStr}${meetStr}\n\n${event.description || ''}`
    navigator.clipboard?.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const gCalUrl = formatGoogleCalendarUrl(event)
  const isMeet = isGoogleMeet(event)
  const meetCode = event.meetingLink?.meetCode || getMeetCode(event.meetingLink?.url)

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
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border, #e2e8f0)',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: styleInfo.bg,
                  color: styleInfo.text,
                  border: `1px solid ${styleInfo.border}`,
                }}
              >
                {event.category}
              </span>

              {event.priority && event.priority !== 'normal' && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: event.priority === 'urgent' ? '#fee2e2' : '#fef3c7',
                    color: event.priority === 'urgent' ? '#b91c1c' : '#b45309',
                  }}
                >
                  {event.priority}
                </span>
              )}

              {event.status === 'cancelled' && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c' }}>
                  CANCELLED
                </span>
              )}
            </div>

            <h3 style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
              {event.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* RSVP Feedback Banner */}
        {rsvpFeedback && (
          <div style={{ padding: '8px 12px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
            {rsvpFeedback}
          </div>
        )}

        {/* Date & Time Row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink, #0f172a)' }}>
            <CalendarDays size={16} color="var(--teal, #006E6F)" />
            <span>
              <strong>Date:</strong> {event.date} {event.endDate && event.endDate !== event.date ? `to ${event.endDate}` : ''} ({event.day || ''})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink, #0f172a)' }}>
            <Clock size={16} color="var(--teal, #006E6F)" />
            <span>
              <strong>Time:</strong> {event.allDay ? 'All Day Event' : `${event.startTime12 || event.startTime || '10:00 AM'} - ${event.endTime12 || event.endTime || '11:00 AM'}`}
            </span>
          </div>

          {event.organizer?.name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
              <Users size={15} />
              <span>Organizer: <strong>{event.organizer.name}</strong> ({event.organizer.department || 'Edufyi'})</span>
            </div>
          )}
        </div>

        {/* Video Call (Google Meet) Action Card */}
        {event.meetingLink?.url ? (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                }}
              >
                <Video size={20} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{isMeet ? 'Google Meet Video Call' : 'Online Video Conference'}</span>
                  {event.meetingLink.googleEventId && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#dcfce7', color: '#15803d' }}>
                      {event.meetingLink.conferenceStatus === 'confirmed' ? '✓ Google Meet Confirmed' : 'Google Calendar Synced'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                  {meetCode ? `Room Code: ${meetCode}` : 'Ready for participants to join'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyMeetLink}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #a7f3d0',
                  background: '#ffffff',
                  color: '#065f46',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isMeetCopied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                <span>{isMeetCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={event.meetingLink.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#059669',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
                }}
              >
                <Video size={13} />
                <span>Join with Google Meet</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : (
          (event.category?.includes('Meeting') || event.category?.includes('Session') || event.category?.includes('Interview')) && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={16} color="#64748b" />
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  No video meeting attached yet.
                </span>
              </div>
              {hasEditRights && (
                <button
                  type="button"
                  onClick={handleGenerateMeet}
                  disabled={isGeneratingMeet}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={11} />
                  <span>{isGeneratingMeet ? 'Generating...' : '+ Generate Google Meet'}</span>
                </button>
              )}
            </div>
          )
        )}

        {/* Physical Location Card & Google Maps */}
        {event.location?.name && (
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--teal, #006E6F)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{event.location.name}</div>
                {event.location.address && <div style={{ fontSize: '11px', color: '#64748b' }}>{event.location.address}</div>}
              </div>
            </div>
            {event.location.mapsUrl && (
              <a
                href={event.location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                Maps <ExternalLink size={11} />
              </a>
            )}
          </div>
        )}

        {/* Description / Notes */}
        {event.description && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Agenda / Description
            </div>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12.5px', lineHeight: 1.5, color: '#334155' }}>
              {event.description}
            </div>
          </div>
        )}

        {/* Participant RSVP Statuses */}
        {participants.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Participants & RSVPs ({participants.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {participants.map((p) => {
                const rsvpColor =
                  p.rsvpStatus === 'accepted'
                    ? { bg: '#ecfdf5', text: '#059669', icon: CheckCircle2 }
                    : p.rsvpStatus === 'declined'
                    ? { bg: '#fee2e2', text: '#b91c1c', icon: XCircle }
                    : p.rsvpStatus === 'tentative'
                    ? { bg: '#fef3c7', text: '#b45309', icon: HelpCircle }
                    : { bg: '#f1f5f9', text: '#64748b', icon: Clock }
                const RsvpIcon = rsvpColor.icon

                return (
                  <div
                    key={p.employeeId}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: rsvpColor.bg,
                      color: rsvpColor.text,
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RsvpIcon size={12} />
                    <span>{p.name}</span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>({p.rsvpStatus || 'pending'})</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* User RSVP Action Bar (Accept / Tentative / Decline) */}
        {myParticipantRecord && (
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
              Your RSVP Status: <span style={{ textTransform: 'uppercase', color: 'var(--teal, #006E6F)' }}>{currentRsvp}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleRsvp('accepted')}
                disabled={isRsvping}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: currentRsvp === 'accepted' ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: currentRsvp === 'accepted' ? '#ecfdf5' : '#ffffff',
                  color: '#059669',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={13} /> Accept
              </button>

              <button
                type="button"
                onClick={() => handleRsvp('tentative')}
                disabled={isRsvping}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: currentRsvp === 'tentative' ? '2px solid #d97706' : '1px solid #cbd5e1',
                  background: currentRsvp === 'tentative' ? '#fffbeb' : '#ffffff',
                  color: '#d97706',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <HelpCircle size={13} /> Tentative
              </button>

              <button
                type="button"
                onClick={() => handleRsvp('declined')}
                disabled={isRsvping}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: currentRsvp === 'declined' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  background: currentRsvp === 'declined' ? '#fef2f2' : '#ffffff',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <XCircle size={13} /> Decline
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Reason Prompt */}
        {showCancelPrompt && (
          <div style={{ padding: '14px', borderRadius: '10px', background: '#fee2e2', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c', marginBottom: '6px' }}>
              Confirm Event Cancellation:
            </div>
            <input
              type="text"
              className="ui-input"
              placeholder="Reason for cancellation (optional)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setShowCancelPrompt(false)} style={{ fontSize: '11px', padding: '4px 10px' }}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleConfirmCancel} style={{ color: '#b91c1c', fontSize: '11px', padding: '4px 10px' }}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border, #e2e8f0)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href={gCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid #0284c7',
                background: '#eff6ff',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#0284c7',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 1px 2px rgba(2, 132, 199, 0.08)',
              }}
            >
              <CalendarDays size={13} color="#0284c7" />
              <span>+ Add to Google Calendar</span>
            </a>

            {hasEditRights && (
              <button
                type="button"
                onClick={handleGoogleSync}
                disabled={isGoogleSyncing}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={12} color="#0284c7" />
                <span>{isGoogleSyncing ? 'Syncing...' : 'Sync with Google'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyDetails}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isCopied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasEditRights && event.status !== 'cancelled' && event.sourceType !== 'holiday' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelPrompt(true)}
                  style={{ color: '#ef4444', fontSize: '11px', padding: '6px 12px' }}
                >
                  <Trash2 size={13} /> Cancel Event
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    onEdit?.(event)
                    onClose()
                  }}
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  <Edit2 size={13} /> Edit
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={onClose} style={{ fontSize: '11px', padding: '6px 12px' }}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

