with open('server/src/services/unifiedNotification.service.js', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

old_deliver = """async function deliverDevicePush(employeeId, { notificationId, title, message, category, eventType, targetUrl, idempotencyKey }) {"""

new_deliver = """async function deliverDevicePush(employeeId, { notificationId, title, message, category, eventType, targetUrl, idempotencyKey }) {
  // Push notifications disabled per user policy - in-app bell & email channels active
  return 'disabled'
}

async function _deliverDevicePushOld(employeeId, { notificationId, title, message, category, eventType, targetUrl, idempotencyKey }) {"""

if old_deliver in text:
    text = text.replace(old_deliver, new_deliver, 1)
    print("Disabled deliverDevicePush")

output = text.replace('\n', '\r\n')
with open('server/src/services/unifiedNotification.service.js', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated server/src/services/unifiedNotification.service.js")

