const fs = require('fs');
let code = fs.readFileSync('server/src/services/unifiedNotification.service.js', 'utf8');

// 1. Add EventEmitter and notificationBus
if (!code.includes('notificationBus')) {
  code = code.replace(
    "import mongoose from 'mongoose'",
    "import mongoose from 'mongoose'\nimport { EventEmitter } from 'events'\n\nexport const notificationBus = new EventEmitter()\nnotificationBus.setMaxListeners(300)"
  );
}

// 2. Add getVapidPublicKey and fallback generator
const vapidBlock = `let activeVapidPublicKey = process.env.VAPID_PUBLIC_KEY || ''

export function getVapidPublicKey() {
  if (activeVapidPublicKey) return activeVapidPublicKey
  if (process.env.VAPID_PUBLIC_KEY) {
    activeVapidPublicKey = process.env.VAPID_PUBLIC_KEY
    return activeVapidPublicKey
  }
  try {
    const keyFile = '.vapid_keys.json'
    if (fs.existsSync(keyFile)) {
      const saved = JSON.parse(fs.readFileSync(keyFile, 'utf8'))
      if (saved?.publicKey) {
        activeVapidPublicKey = saved.publicKey
        return activeVapidPublicKey
      }
    }
  } catch {}
  return activeVapidPublicKey || ''
}`;

if (!code.includes('getVapidPublicKey')) {
  code = code.replace(
    'let isVapidInitialized = false',
    `let isVapidInitialized = false\n\n${vapidBlock}`
  );
}

// 3. In initWebPush(), use getVapidPublicKey() and generate fallback if needed
const oldInit = `export function initWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@edufyitech.in'

  if (webpushInstance && publicKey && privateKey) {
    try {
      webpushInstance.setVapidDetails(subject, publicKey, privateKey)
      isVapidInitialized = true
      console.log('✅ Web Push VAPID initialized successfully.')
    } catch (err) {
      console.warn('⚠️ Web Push VAPID initialization warning:', err.message)
    }
  }
}`;

const newInit = `export function initWebPush() {
  let publicKey = process.env.VAPID_PUBLIC_KEY
  let privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@edufyitech.in'

  if (!publicKey || !privateKey) {
    try {
      const keyFile = '.vapid_keys.json'
      if (fs.existsSync(keyFile)) {
        const saved = JSON.parse(fs.readFileSync(keyFile, 'utf8'))
        if (saved?.publicKey && saved?.privateKey) {
          publicKey = saved.publicKey
          privateKey = saved.privateKey
          activeVapidPublicKey = publicKey
        }
      } else if (webpushInstance?.generateVAPIDKeys) {
        const generated = webpushInstance.generateVAPIDKeys()
        publicKey = generated.publicKey
        privateKey = generated.privateKey
        activeVapidPublicKey = publicKey
        fs.writeFileSync(keyFile, JSON.stringify(generated, null, 2), 'utf8')
        console.log('🔑 Auto-generated and persisted fallback VAPID keypair in .vapid_keys.json')
      }
    } catch (keyErr) {
      console.warn('[Web Push] Fallback key generation notice:', keyErr.message)
    }
  }

  if (webpushInstance && publicKey && privateKey) {
    try {
      webpushInstance.setVapidDetails(subject, publicKey, privateKey)
      isVapidInitialized = true
      activeVapidPublicKey = publicKey
      console.log('✅ Web Push VAPID initialized successfully.')
    } catch (err) {
      console.warn('⚠️ Web Push VAPID initialization warning:', err.message)
    }
  }
}`;

code = code.replace(oldInit, newInit);

// 4. Emit event on notificationBus in createUnifiedNotification
const emitBlock = `  // 2b. Broadcast to real-time SSE stream bus
  try {
    notificationBus.emit('new_notification', {
      id: notificationId,
      _id: String(notificationDoc?._id || notificationId),
      notificationId,
      title,
      message,
      category,
      type: category,
      eventType,
      recipientId: targetRecipientId,
      recipientRole: recipientRole || null,
      priority,
      targetUrl,
      createdAt: notificationDoc?.createdAt || new Date(),
      read: false,
    })
  } catch (busErr) {
    console.warn('[Notification Bus Emit Notice]:', busErr.message)
  }`;

if (!code.includes("notificationBus.emit('new_notification'")) {
  code = code.replace(
    "// 3. Send Web Push to registered devices",
    `${emitBlock}\n\n  // 3. Send Web Push to registered devices`
  );
}

// 5. Update tag isolation in deliverDevicePush
code = code.replace(
  "tag: idempotencyKey || notificationId,",
  "tag: `edufyi-${idempotencyKey || notificationId}`,"
);

fs.writeFileSync('server/src/services/unifiedNotification.service.js', code, 'utf8');
console.log('Successfully updated unifiedNotification.service.js');

