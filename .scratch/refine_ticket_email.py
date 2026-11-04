import re

with open('server/src/services/mail.service.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for sendSupportTicketEmail body creation
target_old = '''  let emailSubject = ''
  let heading = ''
  let contentHtml = ''

  if (type === 'created') {
    emailSubject = `[${channelName} #${ticketIdStr}] New Ticket: ${ticket.subject} [${ticket.priority || 'Medium'}]`
    heading = `Support Ticket #${ticketIdStr} Logged`
    contentHtml = `
      <h2 class="title-h2">${heading}</h2>
      <p>Hello <strong>${employee?.name || ticket.employeeName || 'Team Member'}</strong>,</p>
      <p>Your support ticket has been registered with <strong>${channelName}</strong>. Our assigned support specialist is reviewing your inquiry.</p>'''

replacement_new = '''  let emailSubject = ''
  let heading = ''
  let contentHtml = ''

  const isSupportTeam = recipientEmail.toLowerCase() === channelEmail.toLowerCase() ||
    (config.helpdeskEmail && recipientEmail.toLowerCase() === config.helpdeskEmail.toLowerCase()) ||
    (config.itEmail && recipientEmail.toLowerCase() === config.itEmail.toLowerCase()) ||
    (config.hrEmail && recipientEmail.toLowerCase() === config.hrEmail.toLowerCase()) ||
    (config.adminEmail && recipientEmail.toLowerCase() === config.adminEmail.toLowerCase())

  const empName = employee?.name || ticket.employeeName || 'Team Member'

  if (type === 'created') {
    emailSubject = `[${channelName} #${ticketIdStr}] New Ticket: ${ticket.subject} [${ticket.priority || 'Medium'}]`
    heading = isSupportTeam ? `New Support Inquiry #${ticketIdStr} Logged` : `Support Ticket #${ticketIdStr} Logged`
    const greetingText = isSupportTeam
      ? `<p>Dear <strong>${channelName} Team</strong>,</p><p>A new support ticket has been submitted by <strong>${empName}</strong>.</p>`
      : `<p>Dear <strong>${empName}</strong>,</p><p>Your support ticket has been registered with <strong>${channelName}</strong>. Our assigned support specialist is reviewing your inquiry.</p>`

    contentHtml = `
      <h2 class="title-h2">${heading}</h2>
      ${greetingText}'''

assert target_old in content, 'target_old in mail.service.js not found'
content = content.replace(target_old, replacement_new, 1)

# Also update 'Hello' in type === 'reply' and type === 'resolved' to 'Dear'
content = content.replace(
    "<p>Hello <strong>${employee?.name || ticket.employeeName || 'Team Member'}</strong>,</p>",
    "<p>Dear <strong>${employee?.name || ticket.employeeName || 'Team Member'}</strong>,</p>"
)

with open('server/src/services/mail.service.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully refined sendSupportTicketEmail')

