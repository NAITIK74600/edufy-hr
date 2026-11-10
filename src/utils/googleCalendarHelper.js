/**
 * Google Calendar & Google Meet Integration Utilities
 * Generates standards-compliant Google Calendar 1-click template URLs,
 * parses Google Meet links, and handles timed and all-day occurrences.
 */

/**
 * Format an event into a 1-click Google Calendar web link (calendar.google.com/calendar/render)
 * @param {Object} event Calendar event object
 * @returns {string} Google Calendar Add URL
 */
export function formatGoogleCalendarUrl(event) {
  if (!event || (!event.date && !event.startDate)) {
    return 'https://calendar.google.com'
  }

  const startDateStr = event.date || event.startDate || ''
  const endDateStr = event.endDate || startDateStr
  const title = encodeURIComponent(event.title || event.name || 'Edufyi HR Event')

  // Date and Time formatting
  let datesParam = ''
  const isAllDay = Boolean(event.allDay || (!event.startTime && !event.endTime))

  if (isAllDay) {
    const startClean = startDateStr.replace(/-/g, '')
    // All day in Google Calendar requires end date to be exclusive (day + 1)
    const endObj = new Date(endDateStr)
    if (!isNaN(endObj.getTime())) {
      endObj.setDate(endObj.getDate() + 1)
      const endClean = endObj.toISOString().slice(0, 10).replace(/-/g, '')
      datesParam = `${startClean}/${endClean}`
    } else {
      datesParam = `${startClean}/${startClean}`
    }
  } else {
    // Timed Event (format: YYYYMMDDTHHmm00/YYYYMMDDTHHmm00)
    const sDateClean = startDateStr.replace(/-/g, '')
    const eDateClean = endDateStr.replace(/-/g, '')
    const sTimeClean = (event.startTime || '10:00').replace(/:/g, '').slice(0, 4) + '00'
    const eTimeClean = (event.endTime || '11:00').replace(/:/g, '').slice(0, 4) + '00'
    datesParam = `${sDateClean}T${sTimeClean}/${eDateClean}T${eTimeClean}`
  }

  // Location formatting
  const meetUrl = event.meetingLink?.url || (typeof event.meetingLink === 'string' ? event.meetingLink : '')
  const physicalLoc = event.location?.formattedAddress || event.location?.name || (typeof event.location === 'string' ? event.location : '')
  const locString = meetUrl || physicalLoc || 'Edufyi Technologies'
  const location = encodeURIComponent(locString)

  // Description & Details formatting
  const detailsParts = []
  if (event.description) {
    detailsParts.push(event.description.trim())
  }
  if (meetUrl) {
    detailsParts.push(`🎥 Google Meet Video Call: ${meetUrl}`)
  }
  if (physicalLoc && physicalLoc !== meetUrl) {
    detailsParts.push(`📍 Venue: ${physicalLoc}`)
  }
  if (event.organizer?.name) {
    detailsParts.push(`👤 Organizer: ${event.organizer.name}`)
  }
  detailsParts.push('— Scheduled via Edufyi HR Portal')
  const details = encodeURIComponent(detailsParts.join('\n\n'))

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}&ctz=Asia/Kolkata`

  // Attendees
  if (Array.isArray(event.participants) && event.participants.length > 0) {
    const emails = event.participants
      .map((p) => p.email)
      .filter((e) => e && e.includes('@'))
    if (emails.length > 0) {
      url += `&add=${encodeURIComponent(emails.join(','))}`
    }
  }

  return url
}

/**
 * Check if a URL or event is associated with Google Meet
 */
export function isGoogleMeet(eventOrUrl) {
  if (!eventOrUrl) return false
  if (typeof eventOrUrl === 'string') {
    return eventOrUrl.includes('meet.google.com')
  }
  const url = eventOrUrl.meetingLink?.url || eventOrUrl.meetingUrl || ''
  return Boolean(url.includes('meet.google.com') || eventOrUrl.meetingLink?.provider === 'google_meet')
}

/**
 * Extract meet code from URL (e.g. "abc-defg-hij")
 */
export function getMeetCode(url) {
  if (!url || typeof url !== 'string') return ''
  const match = url.match(/meet\.google\.com\/([a-z0-9-]+)/i)
  return match ? match[1] : ''
}
