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
import { numberToWordsINR } from '../utils/numberToWords.js'

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
  website: 'https://empoyee.edufyitechsolutions.com',
  taxId: '29AABCE1234F1Z5',
  logoUrl: 'https://empoyee.edufyitechsolutions.com/elythra-edufyitech-logo.png',
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

function isPlaceholder(val) {
  if (!val || typeof val !== 'string') return true
  const lower = val.trim().toLowerCase()
  return (
    !lower ||
    lower.includes('yourdomain.com') ||
    lower.includes('admin_app_password') ||
    lower.includes('hr_app_password') ||
    lower === 'changeme' ||
    lower === 'change-me'
  )
}

function getMailConfig() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim()
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@edufyitech.in').trim()
  const adminPass = cleanPassword(process.env.ADMIN_EMAIL_PASS)

  const hrEmail = (process.env.HR_EMAIL || 'hr@edufyitech.in').trim()
  const hrPass = cleanPassword(process.env.HR_EMAIL_PASS)

  const publicUrl = process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com'

  return { host, port, secure, adminEmail, adminPass, hrEmail, hrPass, publicUrl }
}

export function createTransporter(type = 'hr') {
  const config = getMailConfig()
  const isHr = type === 'hr'

  // Pick primary credentials or fall back to alternate
  let user = isHr ? config.hrEmail : config.adminEmail
  let pass = isHr ? config.hrPass : config.adminPass
  let fromName = isHr ? `${DEFAULT_COMPANY.brandName} HR Operations` : `${DEFAULT_COMPANY.brandName} Administration`

  if (isPlaceholder(pass)) {
    // Try falling back to alternate
    const altPass = isHr ? config.adminPass : config.hrPass
    const altUser = isHr ? config.adminEmail : config.hrEmail
    if (!isPlaceholder(altPass)) {
      user = altUser
      pass = altPass
    }
  }

  const configured = Boolean(nodemailer) && !isPlaceholder(user) && !isPlaceholder(pass)

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
  const publicUrl = process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com'

  const logoImgSrc = (inlineLogoCid && logoFilePath)
    ? 'cid:edufyilogo'
    : (DEFAULT_COMPANY.logoUrl || 'https://empoyee.edufyitechsolutions.com/elythra-edufyitech-logo.png')

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
          Support: <a href="mailto:${DEFAULT_COMPANY.email}">${DEFAULT_COMPANY.email}</a> | Tel: ${DEFAULT_COMPANY.phone} | <a href="${publicUrl}" target="_blank">Employee Portal</a>
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

  const portalUrl = loginUrl || process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com'
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

  const portalUrl = loginUrl || process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com'
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
  const empCode = employee?.employeeId || record?.employeeId || 'N/A'
  const designation = employee?.designation || record?.designation || 'Staff'
  const department = employee?.department || record?.department || 'Operations'
  const bankName = employee?.bankDetails?.bankName || record?.bankName || 'HDFC Bank'
  const netPay = Math.round(Number(record?.netPay || record?.netSalary || 0))
  const netPayWords = numberToWordsINR(netPay)
  const earnings = record?.earnings || {}
  const deductions = record?.deductions || {}

  const basic = Math.round(Number(earnings.basic || 0))
  const hra = Math.round(Number(earnings.hra || 0))
  const conveyance = Math.round(Number(earnings.conveyance || 0))
  const specialAllowance = Math.round(Number(earnings.specialAllowance || 0))
  const otherAllowance = Math.round(Number(earnings.otherAllowance || 0))
  const gross = Math.round(Number(record?.grossTotal || record?.grossEarnings || (basic + hra + conveyance + specialAllowance + otherAllowance)))

  const pf = Math.round(Number(deductions.pf || 0))
  const pt = Math.round(Number(deductions.professionalTax || 0))
  const tds = Math.round(Number(deductions.tdsTax || 0))
  const totalDeductions = Math.round(Number(record?.totalDeductions || (pf + pt + tds)))

  const contentHtml = `
    <h2 class="title-h2">Salary Payslip — ${payMonth}</h2>
    <p>Dear <strong>${empName}</strong>,</p>
    <p>Please find attached your official salary payslip for the month of <strong>${payMonth}</strong> from <strong>${DEFAULT_COMPANY.legalName}</strong>.</p>

    <!-- SUMMARY CARD -->
    <div style="background: linear-gradient(135deg, #087E9E 0%, #0B3155 100%); color: #ffffff; border-radius: 10px; padding: 20px 24px; margin: 20px 0; box-shadow: 0 4px 15px rgba(8, 126, 158, 0.2);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px; margin-bottom: 12px;">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.85;">Net Take-Home Salary</div>
          <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-top: 4px;">₹${netPay.toLocaleString('en-IN')}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.85;">Pay Period</div>
          <div style="font-size: 15px; font-weight: 700; margin-top: 4px;">${month}</div>
        </div>
      </div>
      <div style="font-size: 11px; opacity: 0.9; font-style: italic;">
        Amount in words: ${netPayWords}
      </div>
    </div>

    <!-- EMPLOYEE INFO -->
    <table class="data-table" style="margin-bottom: 20px;">
      <tr>
        <th style="width: 25%;">Employee ID</th>
        <td style="width: 25%; font-weight: 700;">${empCode}</td>
        <th style="width: 25%;">Department</th>
        <td style="width: 25%; font-weight: 600;">${department}</td>
      </tr>
      <tr>
        <th>Designation</th>
        <td style="font-weight: 600;">${designation}</td>
        <th>Bank Name</th>
        <td>${bankName}</td>
      </tr>
      <tr>
        <th>Paid / Payable Days</th>
        <td style="font-weight: 700;">${record?.paidDays ?? record?.payableDays ?? 30} Days</td>
        <th>Loss of Pay (LOP)</th>
        <td>${record?.lopDays ?? 0} Day(s)</td>
      </tr>
    </table>

    <!-- BREAKDOWN TABLE -->
    <table class="data-table">
      <thead>
        <tr>
          <th>Earnings Component</th>
          <th style="text-align: right;">Amount (₹)</th>
          <th>Deduction Component</th>
          <th style="text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td style="text-align: right; font-weight: 600;">₹${basic.toLocaleString('en-IN')}</td>
          <td>Provident Fund (PF)</td>
          <td style="text-align: right; font-weight: 600;">₹${pf.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>House Rent Allowance (HRA)</td>
          <td style="text-align: right; font-weight: 600;">₹${hra.toLocaleString('en-IN')}</td>
          <td>Professional Tax (PT)</td>
          <td style="text-align: right; font-weight: 600;">₹${pt.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>Conveyance Allowance</td>
          <td style="text-align: right; font-weight: 600;">₹${conveyance.toLocaleString('en-IN')}</td>
          <td>Income Tax (TDS)</td>
          <td style="text-align: right; font-weight: 600;">₹${tds.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>Special Allowance</td>
          <td style="text-align: right; font-weight: 600;">₹${specialAllowance.toLocaleString('en-IN')}</td>
          <td>Other Deductions</td>
          <td style="text-align: right; font-weight: 600;">₹${(totalDeductions - pf - pt - tds).toLocaleString('en-IN')}</td>
        </tr>
        ${otherAllowance > 0 ? `
          <tr>
            <td>Other Allowances</td>
            <td style="text-align: right; font-weight: 600;">₹${otherAllowance.toLocaleString('en-IN')}</td>
            <td>-</td>
            <td style="text-align: right;">-</td>
          </tr>
        ` : ''}
        <tr style="background-color: #f8fafc; font-weight: 700; border-top: 2px solid #cbd5e1;">
          <td>Total Gross Earnings</td>
          <td style="text-align: right; color: #087E9E;">₹${gross.toLocaleString('en-IN')}</td>
          <td>Total Deductions</td>
          <td style="text-align: right; color: #b91c1c;">₹${totalDeductions.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
      This is an official computer-generated payslip disbursed by the Finance & HR department of ${DEFAULT_COMPANY.legalName}. No signature is required.
    </p>
  `

  const subject = `Official Payslip for ${payMonth} — ${empName} (${empCode})`
  const html = wrapInEmailLayout({
    title: subject,
    preheader: `Your official salary payslip for ${payMonth} has been processed. Net Pay: ₹${netPay.toLocaleString('en-IN')}`,
    contentHtml,
    callToAction: {
      label: 'View Detailed Payslip in Portal',
      url: `${process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com'}#/employee/payroll`,
    },
    inlineLogoCid: false,
  })

  // Only the PDF is attached to the email
  const attachments = []
  if (pdfAttachment && pdfAttachment.buffer) {
    attachments.push({
      filename: pdfAttachment.filename || `Payslip-${empCode}-${payMonth.replace(/\s+/g, '_')}.pdf`,
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
      url: `${process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com'}#/employee/leave`,
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
      url: `${process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com'}#/onboarding`,
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
// 7. TEST / VERIFICATION EMAIL
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
  sendTestEmail,
  wrapInEmailLayout,
}

export default mailService
