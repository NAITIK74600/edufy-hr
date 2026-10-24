/**
 * Comprehensive utilities for payroll months, calendars, and date conversions
 */

// Format a Date object or ISO string to "Month Year" (e.g. "October 2026")
export function formatToMonthYear(date) {
  if (!date || isNaN(new Date(date).getTime())) {
    date = new Date()
  }
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Convert HTML5 <input type="month" /> value ("YYYY-MM" like "2026-10") to "October 2026"
export function formatMonthInputToLabel(yearMonthStr) {
  if (!yearMonthStr) return ''
  const parts = yearMonthStr.split('-')
  if (parts.length < 2) return yearMonthStr
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(y) || isNaN(m)) return yearMonthStr
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Convert "October 2026" to "2026-10" for HTML5 <input type="month" />
export function formatLabelToMonthInput(label) {
  if (!label || label === 'all') return ''
  const parts = label.trim().split(/\s+/)
  if (parts.length === 2) {
    const d = new Date(`${parts[0]} 1, ${parts[1]}`)
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
  }
  const d = new Date(label)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  return ''
}

// Get the actual days in a given month (e.g. "October 2026" -> 31, "February 2028" -> 29)
export function getDaysInMonth(label) {
  const ym = formatLabelToMonthInput(label)
  if (!ym) return 30
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// Offset a month by +/- N months (e.g. ("October 2026", 1) -> "November 2026")
export function offsetMonth(label, offset = 1) {
  const ym = formatLabelToMonthInput(label)
  const base = ym ? new Date(Number(ym.split('-')[0]), Number(ym.split('-')[1]) - 1, 1) : new Date()
  base.setMonth(base.getMonth() + offset)
  return formatToMonthYear(base)
}

// Generate list of available months starting from Current Month continuously going backward
// Includes:
// - Current month (top)
// - Historical past 24 months
// - Any months present in existing payroll records
export function getPayrollMonthOptions(existingRecords = []) {
  const set = new Set()
  const now = new Date()

  // 1. Current month
  set.add(formatToMonthYear(now))

  // 2. Existing records' months
  if (Array.isArray(existingRecords)) {
    existingRecords.forEach((r) => {
      if (r?.month) set.add(r.month)
    })
  }

  // 3. Past continuous months (past 24 months from current)
  for (let offset = -1; offset >= -24; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    set.add(formatToMonthYear(d))
  }

  // Sort descending by date (current month at the top, past months descending)
  return Array.from(set).sort((a, b) => {
    const ymA = formatLabelToMonthInput(a)
    const ymB = formatLabelToMonthInput(b)
    return ymB.localeCompare(ymA)
  })
}
