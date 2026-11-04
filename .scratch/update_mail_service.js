import fs from 'node:fs'

let content = fs.readFileSync('server/src/services/mail.service.js', 'utf8')
let contentNorm = content.replace(/\r\n/g, '\n')

const targetSubmissionCc = `  return transporter.sendMail({
    to,
    cc: [employee?.email, hrEmail].filter((email) => email && email !== to),
    subject,
    html,
    attachments: getLogoAttachment(),
  })`

const replSubmissionCc = `  const directorEmail = process.env.DIRECTOR_EMAIL || 'jagadishbabu@edufyitech.in'
  return transporter.sendMail({
    to,
    cc: [employee?.email, hrEmail, directorEmail].filter((email) => email && email !== to),
    subject,
    html,
    attachments: getLogoAttachment(),
  })`

const targetStatusCc = `  return transporter.sendMail({
    to,
    cc: [managerEmail, hrEmail].filter((email) => email && email !== to),
    subject,
    html,
    attachments: getLogoAttachment(),
  })`

const replStatusCc = `  const directorEmail = process.env.DIRECTOR_EMAIL || 'jagadishbabu@edufyitech.in'
  return transporter.sendMail({
    to,
    cc: [managerEmail, hrEmail, directorEmail].filter((email) => email && email !== to),
    subject,
    html,
    attachments: getLogoAttachment(),
  })`

if (contentNorm.includes(targetSubmissionCc) && contentNorm.includes(targetStatusCc)) {
  contentNorm = contentNorm.replace(targetSubmissionCc, replSubmissionCc)
  contentNorm = contentNorm.replace(targetStatusCc, replStatusCc)
  if (content.includes('\r\n')) {
    contentNorm = contentNorm.replace(/\n/g, '\r\n')
  }
  fs.writeFileSync('server/src/services/mail.service.js', contentNorm, 'utf8')
  console.log('Successfully updated mail.service.js')
} else {
  console.error('Target blocks not found in mail.service.js')
}

