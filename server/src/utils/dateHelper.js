/**
 * Universal date normalization and safety utility for Edufyi HR System.
 * Resiliently handles:
 * - JavaScript Date objects (without timezone date-shift)
 * - ISO Strings ('2026-11-15T00:00:00.000Z')
 * - YYYY-MM-DD strings
 * - Timestamps and legacy database date representations
 */

/**
 * Normalizes any date input into a clean 'YYYY-MM-DD' string safely.
 * Never throws an exception. Returns empty string if invalid/null.
 */
export function normalizeDateString(val) {
  if (!val) return ''
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (!trimmed) return ''
    // Already clean YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
    // YYYY-MM-DDTHH:mm:ss... or YYYY-MM-DD ...
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10)
    // DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
    // Attempt parsing as Date string
    const parsed = new Date(trimmed)
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getUTCFullYear()
      const m = String(parsed.getUTCMonth() + 1).padStart(2, '0')
      const d = String(parsed.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getUTCFullYear()
    const m = String(val.getUTCMonth() + 1).padStart(2, '0')
    const d = String(val.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof val === 'number' && !isNaN(val) && val > 0) {
    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getUTCFullYear()
      const m = String(parsed.getUTCMonth() + 1).padStart(2, '0')
      const d = String(parsed.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  }
  if (typeof val === 'object' && val !== null) {
    if (val.startDate) return normalizeDateString(val.startDate)
    if (val.date) return normalizeDateString(val.date)
  }
  return ''
}

/**
 * Safely parses year, month, and day integers from any date representation.
 */
export function parseYearMonthSafe(val, fallbackYear = null) {
  const dateStr = normalizeDateString(val)
  if (!dateStr || dateStr.length < 7) {
    return {
      year: fallbackYear || new Date().getFullYear(),
      month: 1,
      day: 1,
      dateStr: '',
      isValid: false,
    }
  }
  const year = parseInt(dateStr.slice(0, 4), 10)
  const month = parseInt(dateStr.slice(5, 7), 10)
  const day = parseInt(dateStr.slice(8, 10), 10) || 1
  const isValid = !isNaN(year) && !isNaN(month) && month >= 1 && month <= 12
  return {
    year: isNaN(year) ? (fallbackYear || new Date().getFullYear()) : year,
    month: isNaN(month) ? 1 : month,
    day: isNaN(day) ? 1 : day,
    dateStr,
    isValid,
  }
}

