/**
 * Helper utilities for auto-generating employee codes (ETS),
 * strong random passwords, and formatted credential sharing messages.
 */

export function generateNextEmployeeCode(employees = [], users = []) {
  const codes = []
  if (Array.isArray(employees)) {
    for (const emp of employees) {
      if (emp?.employeeId) codes.push(String(emp.employeeId).trim())
    }
  }
  if (Array.isArray(users)) {
    for (const u of users) {
      if (u?.employeeId) codes.push(String(u.employeeId).trim())
    }
  }

  let maxNum = 21200
  for (const code of codes) {
    const match = code.match(/^ETS(\d+)$/i)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num >= maxNum) maxNum = num
    } else {
      const digitsMatch = code.match(/(\d{4,})/g)
      if (digitsMatch) {
        for (const d of digitsMatch) {
          const num = parseInt(d, 10)
          if (num >= maxNum) maxNum = num
        }
      }
    }
  }

  return `ETS${maxNum + 1}`
}

export function generateAutoPassword() {
  const prefixes = ['Edufyi', 'EtsWork', 'Welcome', 'Secure', 'Portal']
  const symbols = ['@', '#', '$', '!']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const symbol = symbols[Math.floor(Math.random() * symbols.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${symbol}${num}`
}

export function formatCredentialsShareText({ name, email, employeeId, password, role, origin }) {
  const currentOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '')
  const isHR = role === 'hr' || role === 'hr_executive'
  const portalPath = role === 'admin' ? 'admin/login' : (isHR ? 'hr/login' : 'employee/login')
  const portalUrl = currentOrigin ? `${currentOrigin}/#/${portalPath}` : `http://localhost:5173/#/${portalPath}`

  const portalName = role === 'admin'
    ? 'Admin Console'
    : (isHR ? 'HR Operations Portal' : 'Employee Self-Service (ESS)')

  return `🎉 Welcome to Edufyi Workforce!

Hello ${name || 'Team Member'},
Your company workforce account has been created. Here are your login details:

🌐 Portal: ${portalName}
🔗 Login Link: ${portalUrl}
🆔 Employee Code: ${employeeId || 'N/A'}
📧 Work Email: ${email}
🔑 Temporary Password: ${password}

⚠️ Important: Please log in using the credentials above and update your password on your first session.`
}

/**
 * Universal clipboard copy helper that works across both HTTPS / localhost
 * (modern Clipboard API) and LAN IP over HTTP (fallback via invisible textarea & execCommand).
 */
export async function copyTextToClipboard(text) {
  if (!text || typeof window === 'undefined') return false

  // 1. Try modern navigator.clipboard if available (secure context / localhost)
  if (window.isSecureContext && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to fallback
    }
  }

  // 2. Universal textarea + document.execCommand('copy') fallback (works on LAN IP / HTTP)
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '-9999px'
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = '0'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'
    textArea.style.opacity = '0'
    textArea.setAttribute('readonly', '')
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, text.length)
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    if (successful) return true
  } catch {
    // execCommand failed
  }

  return false
}
