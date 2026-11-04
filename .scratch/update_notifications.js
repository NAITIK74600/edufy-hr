import fs from 'node:fs'

// 1. Update server/src/app.js
let appContent = fs.readFileSync('server/src/app.js', 'utf8')
let appNorm = appContent.replace(/\r\n/g, '\n')

const targetAppInit = `      try {
        const { Notification } = await import('./models/Notification.js')
        const { workspaceModels } = await import('./models/Workspace.js')
        await Notification.updateMany({ idempotencyKey: null }, { $unset: { idempotencyKey: '' } })
        if (workspaceModels?.notifications) {
          await workspaceModels.notifications.updateMany({ dedupeKey: null }, { $unset: { dedupeKey: '' } })
        }
      } catch (notifCleanErr) {
        console.warn('[server] Clean null idempotency keys notice:', notifCleanErr.message)
      }`

const replAppInit = `      try {
        const { Notification } = await import('./models/Notification.js')
        const { workspaceModels } = await import('./models/Workspace.js')
        try {
          const indexes = await Notification.collection.indexes()
          const badIdx = indexes.find((i) => i.name === 'idempotencyKey_1' && !i.sparse)
          if (badIdx) {
            console.log('[server] Dropping non-sparse idempotencyKey_1 index on Notification...')
            await Notification.collection.dropIndex('idempotencyKey_1')
          }
        } catch {}
        await Notification.collection.createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true }).catch(() => {})
        await Notification.updateMany({ idempotencyKey: null }, { $unset: { idempotencyKey: '' } })
        if (workspaceModels?.notifications) {
          try {
            const wIndexes = await workspaceModels.notifications.collection.indexes()
            const badWIdx = wIndexes.find((i) => i.name === 'dedupeKey_1' && !i.sparse)
            if (badWIdx) {
              console.log('[server] Dropping non-sparse dedupeKey_1 index on WorkspaceNotification...')
              await workspaceModels.notifications.collection.dropIndex('dedupeKey_1')
            }
          } catch {}
          await workspaceModels.notifications.collection.createIndex({ dedupeKey: 1 }, { unique: true, sparse: true }).catch(() => {})
          await workspaceModels.notifications.updateMany({ dedupeKey: null }, { $unset: { dedupeKey: '' } })
        }
      } catch (notifCleanErr) {
        console.warn('[server] Clean null idempotency keys notice:', notifCleanErr.message)
      }`

if (appNorm.includes(targetAppInit)) {
  appNorm = appNorm.replace(targetAppInit, replAppInit)
  if (appContent.includes('\r\n')) appNorm = appNorm.replace(/\n/g, '\r\n')
  fs.writeFileSync('server/src/app.js', appNorm, 'utf8')
  console.log('Successfully updated app.js')
} else {
  console.error('Target not found in app.js')
}

// 2. Update server/src/services/unifiedNotification.service.js
let notifServiceContent = fs.readFileSync('server/src/services/unifiedNotification.service.js', 'utf8')
let notifServiceNorm = notifServiceContent.replace(/\r\n/g, '\n')

const targetCreateCatch = `  let notificationDoc
  try {
    notificationDoc = await Notification.create(docData)
  } catch (createErr) {
    if (createErr?.code === 11000) {
      if (docData.idempotencyKey) {
        const existing = await Notification.findOne({ idempotencyKey: docData.idempotencyKey }).lean()
        if (existing) return existing
      }
      delete docData.idempotencyKey
      docData.notificationId = \`notif_\${Date.now()}_\${Math.random().toString(36).slice(2, 9)}\`
      notificationDoc = await Notification.create(docData)
    } else {
      throw createErr
    }
  }`

const replCreateCatch = `  let notificationDoc
  try {
    notificationDoc = await Notification.create(docData)
  } catch (createErr) {
    if (createErr?.code === 11000) {
      if (docData.idempotencyKey) {
        const existing = await Notification.findOne({ idempotencyKey: docData.idempotencyKey }).lean()
        if (existing) return existing
      }
      docData.idempotencyKey = \`auto_\${Date.now()}_\${Math.random().toString(36).slice(2, 9)}\`
      docData.notificationId = \`notif_\${Date.now()}_\${Math.random().toString(36).slice(2, 9)}\`
      try {
        notificationDoc = await Notification.create(docData)
      } catch (fallbackErr) {
        return {
          notificationId: docData.notificationId,
          recipientId: targetRecipientId,
          title,
          message,
          category,
          eventType,
        }
      }
    } else {
      throw createErr
    }
  }`

if (notifServiceNorm.includes(targetCreateCatch)) {
  notifServiceNorm = notifServiceNorm.replace(targetCreateCatch, replCreateCatch)
  if (notifServiceContent.includes('\r\n')) notifServiceNorm = notifServiceNorm.replace(/\n/g, '\r\n')
  fs.writeFileSync('server/src/services/unifiedNotification.service.js', notifServiceNorm, 'utf8')
  console.log('Successfully updated unifiedNotification.service.js')
} else {
  console.error('Target not found in unifiedNotification.service.js')
}

