import fs from 'node:fs'

let content = fs.readFileSync('server/src/modules/auth/auth.routes.js', 'utf8')

// 1. In /login
const targetLogin = `      // Strict portal separation
      const userRole = result?.user?.role
      if (portal === 'admin' && userRole !== 'admin') {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Employee credentials cannot be used to log into the Admin portal. Please use Employee Self-Service.',
          },
        })
      }

      if (portal === 'hr' && !['hr', 'admin'].includes(userRole)) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Employee credentials cannot be used to log into the HR portal. Please use Employee Self-Service.',
          },
        })
      }

      if (portal === 'management' && !['hr', 'admin'].includes(userRole)) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Employee credentials cannot be used to log into the Management Console. Please use Employee Self-Service.',
          },
        })
      }

      if (portal === 'employee' && ['admin', 'hr'].includes(userRole)) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Administrative (Admin/HR) accounts must sign into the Management Console. Please switch to the Management portal.',
          },
        })
      }`

const replLogin = `      // Strict portal separation with full leadership authorization
      const userRole = result?.user?.role
      const isLeadership = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(userRole)

      if (portal === 'admin' && userRole !== 'admin' && !isLeadership) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Employee credentials cannot be used to log into the Admin portal. Please use Employee Self-Service.',
          },
        })
      }

      if ((portal === 'hr' || portal === 'management') && !['hr', 'admin'].includes(userRole) && !isLeadership) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Employee credentials cannot be used to log into the HR or Management Console. Please use Employee Self-Service.',
          },
        })
      }

      if (portal === 'employee' && ['admin', 'hr'].includes(userRole) && !isLeadership) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Administrative (Admin/HR) accounts must sign into the Management Console. Please switch to the Management portal.',
          },
        })
      }`

// 2. In /passkey/verify-login
const targetPasskey = `      // Check strict portal access
      const userRole = user.role
      const targetPortal = portal || session.portal
      if (targetPortal === 'admin' && userRole !== 'admin') {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Access denied: Employee credentials cannot be used to log into Admin portal.' } })
      }
      if (targetPortal === 'hr' && !['hr', 'admin'].includes(userRole)) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Access denied: Employee credentials cannot be used to log into HR portal.' } })
      }
      if (targetPortal === 'management' && !['hr', 'admin'].includes(userRole)) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Access denied: Employee credentials cannot be used to log into Management Console.' } })
      }
      if (targetPortal === 'employee' && ['admin', 'hr'].includes(userRole)) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Administrative accounts must sign into the Management Console.' } })
      }`

const replPasskey = `      // Check strict portal access with leadership authorization
      const userRole = user.role
      const isLeadership = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(userRole)
      const targetPortal = portal || session.portal
      if (targetPortal === 'admin' && userRole !== 'admin' && !isLeadership) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Access denied: Employee credentials cannot be used to log into Admin portal.' } })
      }
      if ((targetPortal === 'hr' || targetPortal === 'management') && !['hr', 'admin'].includes(userRole) && !isLeadership) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Access denied: Employee credentials cannot be used to log into HR or Management portal.' } })
      }
      if (targetPortal === 'employee' && ['admin', 'hr'].includes(userRole) && !isLeadership) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Administrative accounts must sign into the Management Console.' } })
      }`

const targetNorm1 = targetLogin.replace(/\r\n/g, '\n')
const targetNorm2 = targetPasskey.replace(/\r\n/g, '\n')
let contentNorm = content.replace(/\r\n/g, '\n')

if (contentNorm.includes(targetNorm1) && contentNorm.includes(targetNorm2)) {
  contentNorm = contentNorm.replace(targetNorm1, replLogin.replace(/\r\n/g, '\n'))
  contentNorm = contentNorm.replace(targetNorm2, replPasskey.replace(/\r\n/g, '\n'))
  if (content.includes('\r\n')) {
    contentNorm = contentNorm.replace(/\n/g, '\r\n')
  }
  fs.writeFileSync('server/src/modules/auth/auth.routes.js', contentNorm, 'utf8')
  console.log('Successfully updated auth.routes.js')
} else {
  console.error('Target blocks not found in auth.routes.js')
}

