/**
 * Robust DOB parsing and extraction utility for Edufyi HR Calendar.
 * Supports Date objects, ISO strings (YYYY-MM-DD), Indian formats (DD/MM/YYYY, DD-MM-YYYY),
 * and all employee schema field variants without static data injection.
 */

export function parseDobToMonthDay(rawDob) {
  if (!rawDob) return null

  // 1. Native Date instance
  if (rawDob instanceof Date && !isNaN(rawDob.getTime())) {
    // Standardize to IST / UTC day & month
    const utcMonth = rawDob.getUTCMonth() + 1
    const utcDay = String(rawDob.getUTCDate()).padStart(2, '0')
    return { month: utcMonth, day: utcDay }
  }

  const str = String(rawDob).trim()
  if (!str) return null

  // 2. YYYY-MM-DD or YYYY/MM/DD or ISO string (e.g. 1998-05-15 or 1998-05-15T00:00:00.000Z)
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (ymdMatch) {
    const month = parseInt(ymdMatch[2], 10)
    const day = String(parseInt(ymdMatch[3], 10)).padStart(2, '0')
    if (month >= 1 && month <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) {
      return { month, day }
    }
  }

  // 3. DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY (Common Indian standard e.g. 15/08/2001 or 15-08-2001)
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/)
  if (dmyMatch) {
    const day = String(parseInt(dmyMatch[1], 10)).padStart(2, '0')
    const month = parseInt(dmyMatch[2], 10)
    if (month >= 1 && month <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) {
      return { month, day }
    }
  }

  // 4. Fallback Date constructor
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

