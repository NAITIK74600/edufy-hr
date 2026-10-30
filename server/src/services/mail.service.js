import fs from 'node:fs'
import path from 'node:path'
let nodemailer = null
try {
  const mod = await import('nodemailer')
  nodemailer = mod.default || mod
} catch {
  // nodemailer package is optional at boot; install via npm install to enable live SMTP
}
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')

// Locate official Edufy logo on disk for inline CID attachment
function findLogoPath() {
  const candidates = [
    path.resolve(rootDir, 'public', 'elythra-edufyitech-logo.png'),
    path.resolve(rootDir, 'public', 'edufy-logo.jpg'),
    path.resolve(rootDir, 'public', 'edufyi-official-logo.jpeg'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}

const logoFilePath = findLogoPath()

export const DEFAULT_COMPANY = {
  name: 'Elythra Edufyi Tech Solutions Pvt Ltd',
  legalName: 'Elythra Edufyi Tech Solutions Pvt Ltd',
  brandName: 'Edufyi Tech Solutions',
  address: 'Third Floor, 7 Hills, #424, 10th Cross, 27th Main, Sector 1, HSR Layout, Bengaluru, Karnataka 560102',
  city: 'Bengaluru',
  phone: '+91 80 4567 8900',
  email: 'hr@edufyitech.in',
  website: 'https://edufyione.edufyitech.in',
  taxId: '29AABCE1234F1Z5',
  logoUrl: 'https://edufyione.edufyitech.in/elythra-edufyitech-logo.png',
  primaryColor: '#087E9E',
  secondaryColor: '#0B3155',
}

function cleanPassword(val) {
  if (!val || typeof val !== 'string') return ''
  let cleaned = val.trim().replace(/^["']|["']$/g, '').trim()
  // Strip spaces if user pasted 16-character Google App Password with spaces ("xxxx xxxx xxxx xxxx")
  if (/^[a-zA-Z0-9]{4}(\s+[a-zA-Z0-9]{4}){3}$/.test(cleaned) || (cleaned.length >= 16 && cleaned.includes(' '))) {
    cleaned = cleaned.replace(/\s+/g, '')
  }
  return cleaned
}

function isPlaceholder(val, host = '', isPassword = false) {
  if (!val || typeof val !== 'string') return true
  const lower = val.trim().toLowerCase()
  if (
    !lower ||
    lower.includes('yourdomain.com') ||
    lower.includes('admin_app_password') ||
    lower.includes('hr_app_password') ||
    lower === 'changeme' ||
    lower === 'change-me'
  ) {
    return true
  }
  // When connecting to Google Workspace / Gmail SMTP, Google strictly enforces 16-character App Passwords.
  // Standard webmail/portal passwords with special characters (e.g. "3CD<u&3S>rUQ6uD*") are rejected with 535 BadCredentials.
  if (isPassword && host && host.includes('gmail.com')) {
    const clean = val.replace(/\s+/g, '')
    if (clean.length !== 16 || !/^[a-zA-Z0-9]+$/.test(clean)) {
      return true
    }
  }
  return false
}

export function getMailConfig() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim()
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@edufyitech.in').trim()
  const adminPass = cleanPassword(process.env.ADMIN_EMAIL_PASS)

  const hrEmail = (process.env.HR_EMAIL || 'hr@edufyitech.in').trim()
  const hrPass = cleanPassword(process.env.HR_EMAIL_PASS)

  const itEmail = (process.env.IT_EMAIL || 'itsupport@edufyitech.in').trim()
  const itPass = cleanPassword(process.env.IT_EMAIL_PASS)

  const helpdeskEmail = (process.env.HELPDESK_EMAIL || 'helpsupport@edufyitechsolution.in').trim()
  const helpdeskPass = cleanPassword(process.env.HELPDESK_EMAIL_PASS)

  const publicUrl = process.env.APP_PUBLIC_URL || 'https://edufyione.edufyitech.in'

  return { host, port, secure, adminEmail, adminPass, hrEmail, hrPass, itEmail, itPass, helpdeskEmail, helpdeskPass, publicUrl }
}

export function createTransporter(type = 'hr') {
  const config = getMailConfig()
  const isHr = type === 'hr'
  const isIt = type === 'it'
  const isSupport = type === 'support' || type === 'helpdesk'

  // Pick primary credentials or fall back to alternate
  let user = isIt ? config.itEmail : isSupport ? config.helpdeskEmail : isHr ? config.hrEmail : config.adminEmail
  let pass = isIt ? config.itPass : isSupport ? config.helpdeskPass : isHr ? config.hrPass : config.adminPass
  let fromName = isIt
    ? `${DEFAULT_COMPANY.brandName} IT Support`
    : isSupport
    ? `${DEFAULT_COMPANY.brandName} Help Support`
    : isHr
    ? `${DEFAULT_COMPANY.brandName} HR Operations`
    : `${DEFAULT_COMPANY.brandName} Administration`

  if (isPlaceholder(pass, config.host, true)) {
    // If IT or Support pass is not yet provided or invalid for Gmail, fall back to configured admin or hr credentials
    const altPass = !isPlaceholder(config.adminPass, config.host, true) ? config.adminPass : config.hrPass
    const altUser = !isPlaceholder(config.adminPass, config.host, true) ? config.adminEmail : config.hrEmail
    if (!isPlaceholder(altPass, config.host, true)) {
      user = altUser
      pass = altPass
    }
  }

  const configured = Boolean(nodemailer) && !isPlaceholder(user, config.host, false) && !isPlaceholder(pass, config.host, true)

  if (!configured) {
    return {
      configured: false,
      isConfigured: false,
      user,
      from: `"${fromName}" <${user}>`,
      async sendMail(mailOptions) {
        console.log(`[MailService:Simulated] [${type.toUpperCase()}] To: ${mailOptions.to} | Subject: "${mailOptions.subject}"`)
        return {
          messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          simulated: true,
          configured: false,
          to: mailOptions.to,
          recipient: mailOptions.to,
          subject: mailOptions.subject,
          fromRole: type,
        }
      },
      async verify() {
        return { success: false, configured: false, message: 'SMTP credentials contain placeholders or are not configured in .env' }
      },
    }
  }

  const is465 = config.port === 465 || config.secure === true
  const transportOpts = {
    host: config.host,
    port: config.port,
    secure: is465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed / local proxy cert errors
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  }

  const transporter = nodemailer.createTransport(transportOpts)

  return {
    configured: true,
    isConfigured: true,
    user,
    from: `"${fromName}" <${user}>`,
    async sendMail(mailOptions) {
      const fullOptions = {
        from: `"${fromName}" <${user}>`,
        replyTo: mailOptions.replyTo || (isIt ? config.itEmail : isSupport ? config.helpdeskEmail : user),
        ...mailOptions,
      }
      console.log(`[MailService:DISPATCH] Attempting email via [${type.toUpperCase()}] from "${user}" to "${mailOptions.to}" | Subject: "${mailOptions.subject}"`)
      try {
        const info = await transporter.sendMail(fullOptions)
        console.log(`[MailService:SUCCESS] Delivered to "${mailOptions.to}" (Message ID: ${info.messageId})`)
        return {
          ...info,
          success: true,
          to: mailOptions.to,
          recipient: mailOptions.to,
          subject: mailOptions.subject,
          fromRole: type,
          configured: true,
        }
      } catch (sendErr) {
        console.error(`[MailService:ERROR] Failed sending [${type.toUpperCase()}] to "${mailOptions.to}":`, sendErr?.message || sendErr)
        if (type !== 'admin' && !isPlaceholder(config.adminPass, config.host)) {
          console.warn(`[MailService] Primary transport failed for ${type.toUpperCase()}. Falling back to verified Admin channel (admin@edufyitech.in)...`)
          try {
            const adminT = createTransporter('admin')
            return await adminT.sendMail({
              replyTo: mailOptions.replyTo || (isIt ? config.itEmail : isSupport ? config.helpdeskEmail : user),
              ...mailOptions,
            })
          } catch (fallbackErr) {
            console.error('[MailService:ERROR] Admin fallback delivery also failed:', fallbackErr?.message || fallbackErr)
          }
        }
        if (sendErr?.code === 'EAUTH' || sendErr?.responseCode === 535) {
          console.error(`[MailService:AUTH_HINT] Authentication failed for ${user}. For Gmail/Workspace, ensure 2-Step Verification is ON and a 16-character App Password (not your portal password) is placed in ADMIN_EMAIL_PASS / HR_EMAIL_PASS in .env.`)
        }
        throw sendErr
      }
    },
    async verify() {
      try {
        await transporter.verify()
        return { success: true, configured: true, message: 'SMTP connection verified successfully.' }
      } catch (err) {
        return { success: false, configured: true, message: err.message }
      }
    },
  }
}

// ---------------------------------------------------------------------------
// HTML EMAIL WRAPPER TEMPLATE WITH OFFICIAL EDUFY BRANDING
// ---------------------------------------------------------------------------
export function wrapInEmailLayout({
  title,
  preheader = '',
  contentHtml,
  callToAction = null,
  showConfidentialNotice = true,
  inlineLogoCid = true,
}) {
  const currentYear = new Date().getFullYear()
  const publicUrl = process.env.APP_PUBLIC_URL || 'https://edufyione.edufyitech.in'

  const logoImgSrc = (inlineLogoCid && logoFilePath)
    ? 'cid:edufyilogo'
    : (DEFAULT_COMPANY.logoUrl || 'https://edufyione.edufyitech.in/elythra-edufyitech-logo.png')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Edufyi Tech Solutions'}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 30px 10px;
    }
    .container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0B3155 0%, #087E9E 100%);
      padding: 30px 32px;
      text-align: left;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
    }
    .logo-img {
      height: 48px;
      max-width: 180px;
      object-fit: contain;
      border-radius: 6px;
      display: inline-block;
      vertical-align: middle;
      background: #ffffff;
      padding: 4px;
    }
    .header-text {
      color: #ffffff;
      text-align: right;
      vertical-align: middle;
    }
    .company-title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.02em;
      margin: 0;
      color: #ffffff;
    }
    .sub-title {
      font-size: 11px;
      color: #cbd5e1;
      margin: 2px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.6;
      font-size: 14px;
      color: #334155;
    }
    .title-h2 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 16px 0;
      letter-spacing: -0.01em;
    }
    .meta-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #087E9E;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 13px;
    }
    .meta-row:last-child {
      border-bottom: none;
    }
    .meta-label {
      color: #64748b;
      font-weight: 600;
    }
    .meta-val {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .cta-btn {
      display: inline-block;
      background-color: #087E9E;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.02em;
      margin: 20px 0 10px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(8, 126, 158, 0.25);
    }
    .footer {
      background-color: #0B3155;
      color: #94a3b8;
      padding: 24px 32px;
      font-size: 11px;
      line-height: 1.5;
      border-top: 1px solid #1e293b;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
    }
    .badge-approved {
      background-color: #dcfce7;
      color: #15803d;
      padding: 3px 10px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
    }
    .badge-pending {
      background-color: #fef3c7;
      color: #b45309;
      padding: 3px 10px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
    }
    .badge-rejected {
      background-color: #fee2e2;
      color: #b91c1c;
      padding: 3px 10px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12px;
    }
    table.data-table th {
      background-color: #f1f5f9;
      color: #475569;
      padding: 9px 12px;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      border-bottom: 2px solid #cbd5e1;
    }
    table.data-table td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <table class="header-table">
          <tr>
            <td>
              <img src="${logoImgSrc}" alt="Edufy Logo" class="logo-img">
            </td>
            <td class="header-text">
              <div class="company-title">${DEFAULT_COMPANY.legalName}</div>
              <div class="sub-title">Human Capital Management</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- MAIN CONTENT -->
      <div class="content">
        ${contentHtml}

        ${callToAction ? `
          <div style="text-align: center; margin-top: 24px;">
            <a href="${callToAction.url || publicUrl}" class="cta-btn" target="_blank">${callToAction.label || 'Open Portal'}</a>
          </div>
        ` : ''}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <strong style="color: #ffffff;">${DEFAULT_COMPANY.legalName}</strong><br>
            ${DEFAULT_COMPANY.address}
          </div>
        </div>
        <div style="margin-top: 8px; border-top: 1px solid #1e293b; padding-top: 8px;">
          Support: <a href="mailto:${DEFAULT_COMPANY.email}">${DEFAULT_COMPANY.email}</a> | Tel: ${DEFAULT_COMPANY.phone} | <a href="${publicUrl.replace(/\/+$/, '')}/#/employee/login" target="_blank">Employee Portal</a>
        </div>
        ${showConfidentialNotice ? `
          <div style="margin-top: 8px; font-size: 10px; color: #64748b;">
            Confidentiality Notice: This communication is confidential and intended solely for the addressee. If you are not the intended recipient, please notify the sender immediately and delete this message.
          </div>
        ` : ''}
        <div style="margin-top: 6px; font-size: 10px; color: #475569;">
          &copy; ${currentYear} ${DEFAULT_COMPANY.legalName}. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
}

function getLogoAttachment() {
  if (logoFilePath && fs.existsSync(logoFilePath)) {
    return [
      {
        filename: path.basename(logoFilePath),
        path: logoFilePath,
        cid: 'edufyilogo', // matched in <img> tag
      },
    ]
  }
  return []
}

// ---------------------------------------------------------------------------
// 1. WELCOME EMAIL (On Account Creation / Employee Onboarding)
// ---------------------------------------------------------------------------
export async function sendWelcomeEmail({ employee, temporaryPassword, loginUrl }) {
  const transporter = createTransporter('admin')
  const to = employee.email
  if (!to) return { success: false, reason: 'No recipient email' }

  const rolePath = employee.role === 'admin' ? 'admin/login' : (employee.role === 'hr' ? 'hr/login' : 'employee/login')
  const baseAppUrl = (process.env.APP_PUBLIC_URL || 'https://edufyione.edufyitech.in').replace(/\/+$/, '')
  let portalUrl = loginUrl || `${baseAppUrl}/#/${rolePath}`
  if (!portalUrl.includes('#/')) {
    portalUrl = `${portalUrl.replace(/\/+$/, '')}/#/${rolePath}`
  }

  const empName = employee.name || employee.displayName || 'Team Member'
  const empCode = employee.employeeId || 'Assigned on Login'
  const designation = employee.designation || 'Staff Associate'
  const department = employee.department || 'Operations'
  const joiningDate = employee.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Immediate'

  const contentHtml = `
    <h2 class="title-h2">Welcome to the Team, ${empName}!</h2>
    <p>We are thrilled to welcome you to <strong>${DEFAULT_COMPANY.legalName}</strong>. Your corporate employee account has been created and your workspace portal is ready.</p>

    <div class="meta-box">
      <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #087E9E; margin-bottom: 8px;">
        Official Employment Credentials
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-size: 13px;"><strong>Employee ID:</strong></td>
          <td style="padding: 5px 0; color: #0f172a; font-weight: 700; font-size: 13px; text-align: right;">${empCode}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-size: 13px;"><strong>Designation:</strong></td>
          <td style="padding: 5px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${designation}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-size: 13px;"><strong>Department:</strong></td>
          <td style="padding: 5px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${department}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-size: 13px;"><strong>Date of Joining:</strong></td>
          <td style="padding: 5px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${joiningDate}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-size: 15px; margin: 20px 0 10px 0; color: #0f172a;">Your Portal Login Credentials:</h3>
    <div style="background-color: #ecfeff; border: 1px solid #a5f3fc; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
      <div style="margin-bottom: 8px; font-size: 13px;">
        <span style="color: #0e7490; font-weight: 600;">Login Portal:</span>
        <a href="${portalUrl}" style="color: #087E9E; font-weight: 700; text-decoration: underline;" target="_blank">${portalUrl}</a>
      </div>
      <div style="margin-bottom: 8px; font-size: 13px;">
        <span style="color: #0e7490; font-weight: 600;">Registered Email:</span>
        <strong style="color: #0f172a;">${employee.email}</strong>
      </div>
      <div style="font-size: 13px;">
        <span style="color: #0e7490; font-weight: 600;">Temporary Password:</span>
        <code style="background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a;">${temporaryPassword || 'Password@123'}</code>
      </div>
    </div>

    <p style="font-size: 12px; color: #64748b;">
      <strong>Important Security Note:</strong> For your security, please sign in to the portal and update your temporary password immediately under your Profile settings.
    </p>

    <h4 style="font-size: 13px; margin: 18px 0 8px 0; color: #0f172a;">Next Steps:</h4>
    <ul style="font-size: 13px; color: #475569; padding-left: 20px; margin: 0 0 16px 0;">
      <li>Log in to access your digital dashboard.</li>
      <li>Review company policies and complete your digital onboarding documents.</li>
      <li>Set up your attendance check-in profile.</li>
    </ul>

    <p style="margin-top: 24px;">If you have any questions, reach out to HR at <a href="mailto:${DEFAULT_COMPANY.email}" style="color: #087E9E; font-weight: 600;">${DEFAULT_COMPANY.email}</a>.</p>
  `

  const subject = `Welcome to Edufyi Tech Solutions - Your Corporate Portal Access Credentials`
  const html = wrapInEmailLayout({
    title: subject,
    preheader: `Welcome to ${DEFAULT_COMPANY.legalName}. Here are your employee portal access credentials.`,
    contentHtml,
    callToAction: { label: 'Sign In to Employee Portal', url: portalUrl },
  })

  return transporter.sendMail({
    to,
    subject,
    html,
    attachments: getLogoAttachment(),
  })
}

// ---------------------------------------------------------------------------
// 2. PASSWORD RESET / CREDENTIALS UPDATE EMAIL
// ---------------------------------------------------------------------------
export async function sendPasswordResetEmail({ employee, user, newPassword, temporaryPassword, loginUrl }) {
  const transporter = createTransporter('admin')
  const target = employee || user || {}
  const to = target.email
  if (!to) return { success: false, reason: 'No recipient email' }

  const role = target.role || 'employee'
  const rolePath = role === 'admin' ? 'admin/login' : (role === 'hr' ? 'hr/login' : 'employee/login')
  const baseAppUrl = (process.env.APP_PUBLIC_URL || 'https://edufyione.edufyitech.in').replace(/\/+$/, '')
  let portalUrl = loginUrl || `${baseAppUrl}/#/${rolePath}`
  if (!portalUrl.includes('#/')) {
    portalUrl = `${portalUrl.replace(/\/+$/, '')}/#/${rolePath}`
  }
  const empName = target.name || target.displayName || 'Employee'
  const pass = newPassword || temporaryPassword

  const contentHtml = `
    <h2 class="title-h2">Account Password Reset</h2>
    <p>Hello <strong>${empName}</strong>,</p>
    <p>Your password for the <strong>${DEFAULT_COMPANY.legalName}</strong> Employee Portal has been reset by an authorized administrator.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0B3155; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
      <div style="margin-bottom: 8px; font-size: 13px; color: #64748b;">
        Login Email: <strong style="color: #0f172a;">${to}</strong>
      </div>
      <div style="font-size: 13px; color: #64748b;">
        New Password: <code style="background: #ffffff; padding: 4px 10px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 700; color: #0B3155; font-size: 14px;">${pass}</code>
      </div>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      Please use this updated password to sign in. For security purposes, change this password once logged into your workspace profile.
    </p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
      If you did not request this update or suspect unauthorized access, please notify the IT & HR department immediately.
    </p>
  `

  const subject = `Your Edufyi Employee Portal Password Has Been Updated`
  const html = wrapInEmailLayout({
    title: subject,
    preheader: `Your account credentials for ${DEFAULT_COMPANY.brandName} have been updated.`,
    contentHtml,
    callToAction: { label: 'Sign In to Portal', url: portalUrl },
  })

  return transporter.sendMail({
    to,
    subject,
    html,
    attachments: getLogoAttachment(),
  })
}

// ---------------------------------------------------------------------------
// 3. OFFICIAL PAYSLIP EMAIL
// ---------------------------------------------------------------------------
export async function sendPayslipEmail({ employee, record, month, settings = DEFAULT_COMPANY, pdfAttachment = null }) {
  const transporter = createTransporter('hr')
  const to = employee?.email || record?.employeeEmail
  if (!to) return { success: false, reason: 'No recipient email for payslip' }

  const payMonth = month || record?.month || record?.period || new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const empName = employee?.name || record?.employeeName || 'Employee'

  const contentHtml = `
    <h2 class="title-h2">Salary Payslip — ${payMonth}</h2>
    <p>Dear <strong>${empName}</strong>,</p>
    <p>Please find attached your official salary payslip for the month of <strong>${payMonth}</strong> from <strong>${DEFAULT_COMPANY.legalName}</strong>.</p>

    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
      This is an official computer-generated payslip. No signature is required.
    </p>
  `

  const subject = `Salary Payslip — ${payMonth}`
  const html = wrapInEmailLayout({
    title: subject,
    preheader: `Your salary payslip for ${payMonth} is attached.`,
    contentHtml,
    inlineLogoCid: false,
  })

  // Only the PDF is attached to the email
  const attachments = []
  if (pdfAttachment && pdfAttachment.buffer) {
    attachments.push({
      filename: pdfAttachment.filename || `Payslip-${employee?.employeeId || record?.employeeId || 'N/A'}-${payMonth.replace(/\s+/g, '_')}.pdf`,
      content: pdfAttachment.buffer,
      contentType: pdfAttachment.contentType || 'application/pdf',
    })
  }

  return transporter.sendMail({
    to,
    subject,
    html,
    attachments,
  })
}

// ---------------------------------------------------------------------------
// 4. LEAVE DECISION EMAIL (Approved / Rejected)
// ---------------------------------------------------------------------------
export async function sendLeaveStatusEmail({ employee, leaveRequest, action, approver, reason }) {
  const transporter = createTransporter('hr')
  const to = employee?.email
  if (!to) return { success: false, reason: 'No recipient email' }

  const isApproved = action === 'approved' || action === 'approve'
  const isCancelled = action === 'cancelled' || action === 'cancel'
  const actionText = isApproved ? 'Approved' : isCancelled ? 'Cancelled' : 'Rejected'
  const empName = employee?.name || 'Team Member'
  const leaveType = (leaveRequest?.leaveType || 'General Leave').toUpperCase()
  const startDate = leaveRequest?.startDate ? new Date(leaveRequest.startDate).toLocaleDateString('en-GB') : 'N/A'
  const endDate = leaveRequest?.endDate ? new Date(leaveRequest.endDate).toLocaleDateString('en-GB') : 'N/A'
  const units = leaveRequest?.units ?? 1
  const approverName = approver?.displayName || approver?.name || 'HR Management'

  const statusBadge = isApproved
    ? `<span class="badge-approved">Approved</span>`
    : isCancelled
      ? `<span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #e2e8f0; color: #475569;">Cancelled</span>`
      : `<span class="badge-rejected">Rejected</span>`

  const contentHtml = `
    <h2 class="title-h2">Leave Request ${actionText}</h2>
    <p>Dear <strong>${empName}</strong>,</p>
    <p>Your leave request has been reviewed by <strong>${approverName}</strong> and is currently ${statusBadge}.</p>

    <div class="meta-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Leave Type:</strong></td>
          <td style="padding: 6px 0; font-weight: 700; font-size: 13px; text-align: right;">${leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Duration / Days:</strong></td>
          <td style="padding: 6px 0; font-weight: 700; font-size: 13px; text-align: right;">${units} Day(s)</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Date Range:</strong></td>
          <td style="padding: 6px 0; font-weight: 600; font-size: 13px; text-align: right;">${startDate} to ${endDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Decision Status:</strong></td>
          <td style="padding: 6px 0; text-align: right;">${statusBadge}</td>
        </tr>
        ${reason ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Remarks / Reason:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; font-style: italic; font-size: 13px; text-align: right;">"${reason}"</td>
          </tr>
        ` : ''}
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      ${isApproved
      ? 'Your leave balance and attendance records have been synchronized accordingly. Have a wonderful time off!'
      : isCancelled
        ? 'Your leave request has been cancelled and any reserved quota has been restored to your leave balance.'
        : 'If you have questions regarding this decision, please consult with your reporting manager or HR Operations.'
    }
    </p>
  `

  const subject = `Leave Request ${actionText}: ${leaveType} (${startDate} - ${endDate})`
  const html = wrapInEmailLayout({
    title: subject,
    preheader: `Your leave application for ${startDate} to ${endDate} was ${actionText.toLowerCase()}.`,
    contentHtml,
    callToAction: {
      label: 'View Leave Balances & History',
      url: `${process.env.APP_PUBLIC_URL || 'https://edufyione.edufyitech.in'}#/employee/leave`,
    },
  })

  return transporter.sendMail({
    to,
    subject,
    html,
    attachments: getLogoAttachment(),
  })
}

// ---------------------------------------------------------------------------
// 5. ONBOARDING / DOCUMENT STATUS EMAIL
// ---------------------------------------------------------------------------
export async function sendDocumentStatusEmail({ employee, documentName, docType, status, action, reason, reviewer }) {
  const transporter = createTransporter('hr')
  const to = employee?.email
  if (!to) return { success: false, reason: 'No recipient email' }

  const doc = documentName || docType || 'Document'
  const effectiveStatus = (status || action || 'approved').toLowerCase()
  const isApproved = effectiveStatus === 'approved' || effectiveStatus === 'verified'
  const isRevision = effectiveStatus === 'revision_requested' || effectiveStatus === 'rejected'
  const empName = employee?.name || 'Team Member'
  const reviewerName = reviewer?.displayName || reviewer?.name || 'HR Verification'

  const contentHtml = `
    <h2 class="title-h2">Document Verification Status Update</h2>
    <p>Dear <strong>${empName}</strong>,</p>
    <p>Your submitted onboarding document <strong>${doc}</strong> has been reviewed by <strong>${reviewerName}</strong>.</p>

    <div class="meta-box">
      <div style="font-size: 13px; margin-bottom: 8px;">
        <strong>Document:</strong> ${documentName}
      </div>
      <div style="font-size: 13px; margin-bottom: 8px;">
        <strong>Verification Status:</strong>
        ${isApproved
      ? '<span class="badge-approved">Approved & Verified</span>'
      : '<span class="badge-rejected">Action Required / Resubmit</span>'
    }
      </div>
      ${reason ? `
        <div style="font-size: 13px; color: #b91c1c; margin-top: 8px; font-weight: 600;">
          Feedback from HR: "${reason}"
        </div>
      ` : ''}
    </div>

    ${isRevision ? `
      <p style="font-size: 13px; color: #0f172a;">
        Please sign in to your onboarding portal, upload a clear and updated copy of the document according to the reviewer's instructions, and resubmit.
      </p>
    ` : `
      <p style="font-size: 13px; color: #166534;">
        Thank you! This document meets compliance standards and your employee file has been updated.
      </p>
    `}
  `

  const subject = `Onboarding Document Verification: ${doc} - ${isApproved ? 'Approved' : 'Action Required'}`
  const html = wrapInEmailLayout({
    title: subject,
    preheader: `Status update regarding your ${doc} submission.`,
    contentHtml,
    callToAction: {
      label: 'Open Onboarding Documents',
      url: `${process.env.APP_PUBLIC_URL || 'https://edufyione.edufyitech.in'}#/onboarding`,
    },
  })

  return transporter.sendMail({
    to,
    subject,
    html,
    attachments: getLogoAttachment(),
  })
}

// ---------------------------------------------------------------------------
// 6. GENERIC MULTI-PURPOSE NOTIFICATION EMAIL
// ---------------------------------------------------------------------------
export async function sendGenericNotification({
  to,
  subject,
  title,
  message,
  actionText = null,
  actionUrl = null,
  details = null,
  senderType = 'hr',
}) {
  const transporter = createTransporter(senderType)
  if (!to) return { success: false, reason: 'No recipient email' }

  let detailsHtml = ''
  if (details && typeof details === 'object') {
    detailsHtml = `
      <div class="meta-box">
        <table style="width: 100%; border-collapse: collapse;">
          ${Object.entries(details).map(([k, v]) => `
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-size: 13px;"><strong>${k}:</strong></td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${v}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `
  }

  const contentHtml = `
    <h2 class="title-h2">${title || subject}</h2>
    <div style="font-size: 14px; line-height: 1.6; color: #334155;">
      ${message}
    </div>
    ${detailsHtml}
  `

  const html = wrapInEmailLayout({
    title: subject,
    preheader: title || subject,
    contentHtml,
    callToAction: actionText && actionUrl ? { label: actionText, url: actionUrl } : null,
  })

  return transporter.sendMail({
    to,
    subject,
    html,
    attachments: getLogoAttachment(),
  })
}

// ---------------------------------------------------------------------------
// 7. SUPPORT TICKET NOTIFICATIONS (IT SUPPORT & UNIFIED HELPDESK)
// ---------------------------------------------------------------------------
export async function sendSupportTicketEmail({
  type = 'created', // 'created' | 'reply' | 'resolved'
  ticket,
  employee,
  recipientEmail,
  senderName = 'Support Desk',
  replyText = '',
}) {
  if (!recipientEmail) return { success: false, reason: 'No recipient email' }
  const isIt = (ticket.category || '').toLowerCase().includes('it')
  const transporter = createTransporter(isIt ? 'it' : 'support')
  const config = getMailConfig()
  const publicUrl = config.publicUrl

  const channelEmail = isIt ? config.itEmail : config.helpdeskEmail
  const channelName = isIt ? 'Edufyi IT Support' : 'Edufyi Help Support'
  const ticketIdStr = String(ticket._id || ticket.id || '').slice(-6).toUpperCase()

  let emailSubject = ''
  let heading = ''
  let contentHtml = ''

  if (type === 'created') {
    emailSubject = `[${channelName} #${ticketIdStr}] New Ticket: ${ticket.subject} [${ticket.priority || 'Medium'}]`
    heading = `Support Ticket #${ticketIdStr} Logged`
    contentHtml = `
      <h2 class="title-h2">${heading}</h2>
      <p>Hello <strong>${employee?.name || ticket.employeeName || 'Team Member'}</strong>,</p>
      <p>Your support ticket has been registered with <strong>${channelName}</strong>. Our assigned support specialist is reviewing your inquiry.</p>
      
      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Ticket ID:</span>
          <span class="meta-val">#${ticketIdStr}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Category:</span>
          <span class="meta-val">${ticket.category || 'Support'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Priority:</span>
          <span class="meta-val">${ticket.priority || 'Medium'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Subject:</span>
          <span class="meta-val">${ticket.subject}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Inquiry Details:</span>
          <span class="meta-val" style="white-space:pre-wrap;">${ticket.description || '—'}</span>
        </div>
      </div>
    `
  } else if (type === 'reply') {
    emailSubject = `[${channelName} #${ticketIdStr}] Update on: ${ticket.subject}`
    heading = `New Response on Ticket #${ticketIdStr}`
    contentHtml = `
      <h2 class="title-h2">${heading}</h2>
      <p>Hello <strong>${employee?.name || ticket.employeeName || 'Team Member'}</strong>,</p>
      <p><strong>${senderName}</strong> posted a response to your ticket:</p>

      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; padding: 14px 16px; margin: 16px 0; font-size: 13px; color: #166534; line-height: 1.5;">
        ${replyText}
      </div>

      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Ticket:</span>
          <span class="meta-val">#${ticketIdStr} — ${ticket.subject}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Current Status:</span>
          <span class="meta-val">${String(ticket.status || 'open').toUpperCase()}</span>
        </div>
      </div>
    `
  } else if (type === 'resolved') {
    emailSubject = `[${channelName} #${ticketIdStr}] Ticket Resolved: ${ticket.subject}`
    heading = `Ticket #${ticketIdStr} Resolved`
    contentHtml = `
      <h2 class="title-h2" style="color: #059669;">✔ Ticket Marked as Resolved</h2>
      <p>Hello <strong>${employee?.name || ticket.employeeName || 'Team Member'}</strong>,</p>
      <p>Your support ticket #${ticketIdStr} (<em>${ticket.subject}</em>) has been resolved by <strong>${senderName}</strong>.</p>

      ${replyText ? `
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; padding: 14px 16px; margin: 16px 0; font-size: 13px; color: #166534; line-height: 1.5;">
        <strong>Resolution Notes:</strong><br />${replyText}
      </div>` : ''}
    `
  } else if (type === 'assigned') {
    emailSubject = `[${channelName} #${ticketIdStr}] Ticket Assigned to You: ${ticket.subject} [${ticket.priority || 'Medium'}]`
    heading = `Support Ticket #${ticketIdStr} Assigned to You`
    contentHtml = `
      <h2 class="title-h2">${heading}</h2>
      <p>Hello <strong>${employee?.name || 'Support Specialist'}</strong>,</p>
      <p>A support ticket has been assigned to you by <strong>${senderName}</strong> for investigation and resolution.</p>

      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Ticket ID:</span>
          <span class="meta-val">#${ticketIdStr}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Requester:</span>
          <span class="meta-val">${ticket.employeeName || 'Staff Member'} (${ticket.department || 'Workforce'})</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Category:</span>
          <span class="meta-val">${ticket.category || 'Support'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Priority:</span>
          <span class="meta-val">${ticket.priority || 'Medium'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Subject:</span>
          <span class="meta-val">${ticket.subject}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Inquiry Details:</span>
          <span class="meta-val" style="white-space:pre-wrap;">${ticket.description || '—'}</span>
        </div>
      </div>

      <p style="margin-top: 14px;">Please log in to your Edufyi HR portal to update the status, post replies, and resolve this inquiry.</p>
    `
  }

  const html = wrapInEmailLayout({
    title: emailSubject,
    preheader: `Ticket #${ticketIdStr} - ${ticket.subject}`,
    contentHtml,
    callToAction: {
      label: 'Open Help Desk Portal',
      url: `${publicUrl}/#/employee/helpdesk`,
    },
  })

  try {
    return await transporter.sendMail({
      to: recipientEmail,
      subject: emailSubject,
      html,
      replyTo: channelEmail,
      attachments: getLogoAttachment(),
    })
  } catch (primaryErr) {
    console.error(`[MailService] Primary transport failed for ${isIt ? 'IT' : 'Support'} (${primaryErr.message}). Falling back to HR/Admin transporter...`)
    const fallbackTransporter = createTransporter('hr')
    if (fallbackTransporter.configured) {
      return await fallbackTransporter.sendMail({
        to: recipientEmail,
        subject: emailSubject,
        html,
        replyTo: channelEmail,
        attachments: getLogoAttachment(),
      })
    }
    throw primaryErr
  }
}

// ---------------------------------------------------------------------------
// 8. COMPANY ANNOUNCEMENT EMAIL BROADCAST (ADMIN CHANNEL)
// ---------------------------------------------------------------------------
export async function sendAnnouncementEmailBroadcast({ announcement, recipients = [], publicUrl }) {
  const transporter = createTransporter('admin')
  const config = getMailConfig()
  const baseAppUrl = (publicUrl || config.publicUrl || 'https://edufyione.edufyitech.in').replace(/\/+$/, '')

  let validRecipients = (recipients || []).filter((r) => r && r.email && r.email.includes('@'))

  // Always ensure corporate admin receives a copy of every broadcast
  if (config.adminEmail && !validRecipients.some((r) => r.email?.toLowerCase() === config.adminEmail.toLowerCase())) {
    validRecipients.push({ email: config.adminEmail, name: 'Edufyi Administration' })
  }

  if (!validRecipients.length) {
    console.warn('[MailService] No valid recipient emails found for announcement broadcast')
    return { success: false, reason: 'No valid recipient emails' }
  }

  const subject = `[Company Announcement] ${announcement.title}`
  const priorityBadge = announcement.priority === 'Urgent'
    ? '<span style="background:#fee2e2;color:#dc2626;padding:3px 9px;border-radius:4px;font-weight:700;font-size:11px;letter-spacing:0.5px;">URGENT / ACTION REQUIRED</span>'
    : announcement.priority === 'High'
    ? '<span style="background:#ffedd5;color:#c2410c;padding:3px 9px;border-radius:4px;font-weight:700;font-size:11px;letter-spacing:0.5px;">HIGH PRIORITY</span>'
    : '<span style="background:#e0f2fe;color:#0284c7;padding:3px 9px;border-radius:4px;font-weight:700;font-size:11px;letter-spacing:0.5px;">OFFICIAL ANNOUNCEMENT</span>'

  const contentHtml = `
    <div style="margin-bottom: 14px;">${priorityBadge}</div>
    <h2 class="title-h2" style="margin-top: 4px; color: #0B3155;">${announcement.title}</h2>
    <p>Dear Team,</p>
    <p>An official corporate broadcast has been published by <strong>${announcement.author || 'Corporate Administration'}</strong> for <strong>${announcement.targetAudience || 'All Employees'}</strong>.</p>

    <div class="meta-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
      <div class="meta-row" style="display:flex; justify-content:space-between; padding:4px 0;">
        <span class="meta-label" style="color:#64748b; font-size:12px;">Category:</span>
        <span class="meta-val" style="font-weight:600; color:#0f172a; font-size:12.5px;">${announcement.category || 'Company News'}</span>
      </div>
      <div class="meta-row" style="display:flex; justify-content:space-between; padding:4px 0;">
        <span class="meta-label" style="color:#64748b; font-size:12px;">Audience:</span>
        <span class="meta-val" style="font-weight:600; color:#0f172a; font-size:12.5px;">${announcement.targetAudience || 'All Employees'}</span>
      </div>
      <div class="meta-row" style="display:flex; justify-content:space-between; padding:4px 0;">
        <span class="meta-label" style="color:#64748b; font-size:12px;">Published By:</span>
        <span class="meta-val" style="font-weight:600; color:#0f172a; font-size:12.5px;">${announcement.author || 'Corporate Administration'}</span>
      </div>
    </div>

    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #087E9E; border-radius: 8px; padding: 18px 20px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
${announcement.content}
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
      To view this broadcast, acknowledge receipts, or interact with team updates, click below to open your Employee Portal.
    </p>
  `

  const html = wrapInEmailLayout({
    title: subject,
    preheader: `${announcement.title} - Official Announcement from ${DEFAULT_COMPANY.brandName}`,
    contentHtml,
    callToAction: {
      label: 'View in Employee Portal',
      url: `${baseAppUrl}/#/employee/announcements`,
    },
  })

  // Fast, reliable batch dispatch via BCC to prevent Gmail SMTP connection exhaustion
  const BATCH_SIZE = 40
  let sentCount = 0

  for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
    const batch = validRecipients.slice(i, i + BATCH_SIZE)
    const bccList = batch.map((r) => r.email)

    try {
      await transporter.sendMail({
        to: config.adminEmail || 'admin@edufyitech.in',
        bcc: bccList,
        subject,
        html,
        attachments: getLogoAttachment(),
      })
      sentCount += batch.length
      console.log(`[MailService:Announcement] Successfully broadcasted to batch of ${batch.length} recipients via BCC`)
    } catch (err) {
      console.error(`[MailService:Announcement] Batch broadcast error:`, err?.message || err)
    }
  }

  return { success: true, sentCount, total: validRecipients.length }
}

// ---------------------------------------------------------------------------
// 9. TEST / VERIFICATION EMAIL
// ---------------------------------------------------------------------------
export async function sendTestEmail({ to, senderType = 'hr' }) {
  const transporter = createTransporter(senderType)
  const config = getMailConfig()
  const recipient = to || (senderType === 'hr' ? config.hrEmail : config.adminEmail)

  const subject = `SMTP Configuration Test — ${DEFAULT_COMPANY.brandName} (${senderType.toUpperCase()})`
  const contentHtml = `
    <h2 class="title-h2">SMTP Test Email Successful!</h2>
    <p>This message confirms that your SMTP workspace mail server is properly connected and delivering emails from <strong>${DEFAULT_COMPANY.legalName}</strong>.</p>

    <div class="meta-box">
      <div class="meta-row">
        <span class="meta-label">SMTP Host:</span>
        <span class="meta-val">${config.host}:${config.port}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Sender Channel:</span>
        <span class="meta-val">${senderType.toUpperCase()} (${transporter.user})</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Recipient:</span>
        <span class="meta-val">${recipient}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Dispatched At:</span>
        <span class="meta-val">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
      </div>
    </div>

    <p style="font-size: 13px; color: #059669; font-weight: 600;">
      ✔ Automatic email notifications for Account Welcome, Password Updates, Monthly Payslips, and Leave approvals are fully operational.
    </p>
  `

  const html = wrapInEmailLayout({
    title: subject,
    preheader: `SMTP verification successful from ${DEFAULT_COMPANY.brandName}.`,
    contentHtml,
    callToAction: {
      label: 'Open Dashboard',
      url: config.publicUrl,
    },
  })

  return transporter.sendMail({
    to: recipient,
    subject,
    html,
    attachments: getLogoAttachment(),
  })
}

export const mailService = {
  createTransporter,
  isConfigured: (role = 'hr') => createTransporter(role).isConfigured,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPayslipEmail,
  sendLeaveStatusEmail,
  sendDocumentStatusEmail,
  sendGenericNotification,
  sendSupportTicketEmail,
  sendAnnouncementEmailBroadcast,
  sendTestEmail,
  wrapInEmailLayout,
}

export default mailService
