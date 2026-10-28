/**
 * Utilities for formatting attendance statuses and grace occurrence options
 */

export function getLateOccurrence(record) {
  if (!record) return 1
  if (record.lateCount === 1) return 1
  if (record.lateCount === 2) return 2
  const notes = record.notes || ''
  if (typeof notes === 'string') {
    if (/#2\b|2 of 2|2\/2/i.test(notes)) return 2
    if (/#1\b|1 of 2|1\/2/i.test(notes)) return 1
  }
  return 1
}

export function formatAttendanceNotes(notes) {
  if (!notes) return null
  const shiftMatch = /\(([^)]+Shift)\)/i.exec(notes)
  const shiftName = shiftMatch ? `(${shiftMatch[1]})` : null

  // If the note is purely an auto-generated grace message, condense to just the shift name
  if (/^Late Login #\d+( of 2 accepted grace arrivals|\s*\(Grace period:[^)]+\)|\/2)(\s*\([^)]+\))?$/i.test(notes.trim())) {
    return shiftName
  }

  // If there are other notes attached, clean out the redundant grace arrival sentence
  const cleaned = notes
    .replace(/Late Login #\d+ of 2 accepted grace arrivals( \([^)]+\))?/gi, '')
    .replace(/Late Login #\d+ \(Grace period: \d+\/2 accepted\)/gi, '')
    .replace(/Late Login #\d+\/2( \([^)]+\))?/gi, '')
    .replace(/^[\s|·-]+|[\s|·-]+$/g, '')
    .trim()

  if (!cleaned && shiftName) return shiftName
  if (cleaned && shiftName && !cleaned.includes(shiftName)) return `${shiftName} · ${cleaned}`
  return cleaned || null
}

