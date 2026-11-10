/**
 * Frontend DOB parsing and extraction utility for Edufyi HR Calendar & Celebration widgets.
 */

export function parseDobToMonthDay(rawDob) {
  if (!rawDob) return null

  if (rawDob instanceof Date && !isNaN(rawDob.getTime())) {
    const utcMonth = rawDob.getUTCMonth() + 1
    const utcDay = String(rawDob.getUTCDate()).padStart(2, '0')
    return { month: utcMonth, day: utcDay }
  }

  const str = String(rawDob).trim()
  if (!str) return null

  // YYYY-MM-DD or ISO
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (ymdMatch) {
    const month = parseInt(ymdMatch[2], 10)
    const day = String(parseInt(ymdMatch[3], 10)).padStart(2, '0')
    if (month >= 1 && month <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) {
      return { month, day }
    }
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/)
  if (dmyMatch) {
    const day = String(parseInt(dmyMatch[1], 10)).padStart(2, '0')
    const month = parseInt(dmyMatch[2], 10)
    if (month >= 1 && month <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) {
      return { month, day }
    }
  }

  const d = new Date(str)
  if (!isNaN(d.getTime())) {
    return {
      month: d.getUTCMonth() + 1,
      day: String(d.getUTCDate()).padStart(2, '0'),
    }
  }

  return null
}

export function extractEmployeeDob(emp) {
  if (!emp || typeof emp !== 'object') return null
  const rawDob =
    emp.dob ||
    emp.identity?.dob ||
    emp.dateOfBirth ||
    emp.birthDate ||
    emp.personalDetails?.dob ||
    emp.personalDetails?.dateOfBirth

  return parseDobToMonthDay(rawDob)
}

