import re

with open('server/src/services/mail.service.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update subtitle
assert 'Human Capital Management' in content, 'Human Capital Management not found'
content = content.replace('Human Capital Management', 'Human Resources')

# 2. Update sendLeaveSubmissionEmail
# Replace the to assignment and initial config check
pattern_sub = r'export async function sendLeaveSubmissionEmail\(\{ employee, manager, leaveRequest \}\) \{[\s\S]*?const contentHtml = `'
replacement_sub = '''export async function sendLeaveSubmissionEmail({ employee, manager, leaveRequest }) {
  const to = manager?.email
  if (!to) {
    console.warn('[MailService:CONFIG_ERROR] Assigned reporting manager has no valid email for employee:', employee?.email)
    return { success: false, reason: 'Assigned reporting manager has no valid email' }
  }
  const transporter = createTransporter('hr')
  const config = getMailConfig()

  const empName = employee?.name || 'Employee'
  const empCode = employee?.employeeId || 'N/A'
  const dept = employee?.department || 'General'
  const leaveType = (leaveRequest?.leaveType || 'General Leave').toUpperCase()
  const startDate = leaveRequest?.startDate ? new Date(leaveRequest.startDate).toLocaleDateString('en-GB') : 'N/A'
  const endDate = leaveRequest?.endDate ? new Date(leaveRequest.endDate).toLocaleDateString('en-GB') : 'N/A'
  const units = leaveRequest?.units ?? 1
  const reason = leaveRequest?.reason || 'Personal / General'
  const managerName = manager?.name || 'Reporting Manager'

  const contentHtml = `'''

content = re.sub(pattern_sub, replacement_sub, content, count=1)

# Remove CC from sendLeaveSubmissionEmail
pattern_sub_send = r'const recipients = \[to\]\.filter\(Boolean\)[\s\S]*?attachments: getLogoAttachment\(\),\s*\}\)'
replacement_sub_send = '''// Direct reporting manager ONLY. No CC to applicant, HR, or Director
  return transporter.sendMail({
    to,
    subject,
    html,
    attachments: getLogoAttachment(),
  })'''
content = re.sub(pattern_sub_send, replacement_sub_send, content, count=1)

# 3. Update sendLeaveStatusEmail - remove CC
pattern_status_send = r'const directorEmail = process\.env\.DIRECTOR_EMAIL[\s\S]*?attachments: getLogoAttachment\(\),\s*\}\)'
replacement_status_send = '''// Applying employee ONLY. No CC to manager, HR, or Director
  return transporter.sendMail({
    to,
    subject,
    html,
    attachments: getLogoAttachment(),
  })'''
content = re.sub(pattern_status_send, replacement_status_send, content, count=1)

with open('server/src/services/mail.service.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated mail.service.js successfully')

