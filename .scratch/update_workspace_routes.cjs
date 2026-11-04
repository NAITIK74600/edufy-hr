const fs = require('fs');
let code = fs.readFileSync('server/src/modules/workspace/workspace.routes.js', 'utf8');

// 1. Update /notifications/read-all and /notifications/clear-all
const oldBlock1 = `  router.patch('/notifications/read-all', async (req, res, next) => {
    try {
      const actorId = id(req.auth.user)
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.updateMany(targetQuery, { $set: { read: true } })
      if (mongoose.isValidObjectId(actorId)) await Notification.updateMany({ recipientId: actorId, readAt: null }, { $set: { readAt: new Date() } })
      res.json({ success: true, data: { read: true } })
    } catch (error) { next(error) }
  })
  router.delete('/notifications/clear-all', async (req, res, next) => {
    try {
      const actorId = id(req.auth.user)
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.deleteMany(targetQuery)
      if (mongoose.isValidObjectId(actorId)) await Notification.deleteMany({ recipientId: actorId })
      res.json({ success: true, data: { cleared: true } })
    } catch (error) { next(error) }
  })
  router.post('/notifications/clear-all', async (req, res, next) => {
    try {
      const actorId = id(req.auth.user)
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.deleteMany(targetQuery)
      if (mongoose.isValidObjectId(actorId)) await Notification.deleteMany({ recipientId: actorId })
      res.json({ success: true, data: { cleared: true } })
    } catch (error) { next(error) }
  })`;

const newBlock1 = `  router.patch('/notifications/read-all', async (req, res, next) => {
    try {
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.updateMany(targetQuery, { $set: { read: true } })
      const candidateIds = Array.from(new Set([
        req.auth.user?.employeeId,
        req.auth.user?.id,
        req.auth.user?._id ? String(req.auth.user._id) : null,
        req.auth.user?.email,
      ].filter(Boolean)))
      const notifUserMatches = candidateIds.flatMap((cid) => [{ recipientId: cid }, { employeeId: cid }, { ownerId: cid }])
      await Notification.updateMany({ $or: notifUserMatches, read: false }, { $set: { read: true, readAt: new Date() } }).catch(() => {})
      res.json({ success: true, data: { read: true } })
    } catch (error) { next(error) }
  })
  router.delete('/notifications/clear-all', async (req, res, next) => {
    try {
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.deleteMany(targetQuery)
      const candidateIds = Array.from(new Set([
        req.auth.user?.employeeId,
        req.auth.user?.id,
        req.auth.user?._id ? String(req.auth.user._id) : null,
        req.auth.user?.email,
      ].filter(Boolean)))
      const notifUserMatches = candidateIds.flatMap((cid) => [{ recipientId: cid }, { employeeId: cid }, { ownerId: cid }])
      await Notification.deleteMany({ $or: notifUserMatches }).catch(() => {})
      res.json({ success: true, data: { cleared: true } })
    } catch (error) { next(error) }
  })
  router.post('/notifications/clear-all', async (req, res, next) => {
    try {
      const targetQuery = filter(req.auth.user, 'notifications')
      await models.notifications.deleteMany(targetQuery)
      const candidateIds = Array.from(new Set([
        req.auth.user?.employeeId,
        req.auth.user?.id,
        req.auth.user?._id ? String(req.auth.user._id) : null,
        req.auth.user?.email,
      ].filter(Boolean)))
      const notifUserMatches = candidateIds.flatMap((cid) => [{ recipientId: cid }, { employeeId: cid }, { ownerId: cid }])
      await Notification.deleteMany({ $or: notifUserMatches }).catch(() => {})
      res.json({ success: true, data: { cleared: true } })
    } catch (error) { next(error) }
  })`;

// 2. Update single notification read in router.patch('/:resource/:id')
const oldBlock2 = `      } else if (resource === 'notifications') {
        if (recordId === 'read-all') {
          const actorId = id(actor)
          const targetQuery = filter(actor, 'notifications')
          await models.notifications.updateMany(targetQuery, { $set: { read: true } })
          if (mongoose.isValidObjectId(actorId)) await Notification.updateMany({ recipientId: actorId, readAt: null }, { $set: { readAt: new Date() } })
          return res.json({ success: true, data: { read: true } })
        }
        allowedBody(req.body, ['read'])
        if (req.body.read !== true) throw fail('Only marking a notification read is supported.')
        if (mongoose.isValidObjectId(recordId)) {
          query = { ...filter(actor, resource), _id: recordId }
          update = { $set: { read: true } }
        } else {
          // Synthetic or client-generated ID
          return res.json({ success: true, data: { id: recordId, read: true } })
        }
      }`;

const newBlock2 = `      } else if (resource === 'notifications') {
        if (recordId === 'read-all') {
          const targetQuery = filter(actor, 'notifications')
          await models.notifications.updateMany(targetQuery, { $set: { read: true } })
          const candidateIds = Array.from(new Set([
            actor?.employeeId,
            actor?.id,
            actor?._id ? String(actor._id) : null,
            actor?.email,
          ].filter(Boolean)))
          const notifUserMatches = candidateIds.flatMap((cid) => [{ recipientId: cid }, { employeeId: cid }, { ownerId: cid }])
          await Notification.updateMany({ $or: notifUserMatches, read: false }, { $set: { read: true, readAt: new Date() } }).catch(() => {})
          return res.json({ success: true, data: { read: true } })
        }
        allowedBody(req.body, ['read'])
        if (req.body.read !== true) throw fail('Only marking a notification read is supported.')
        
        // Mark read in WorkspaceNotification
        const idMatches = [{ notificationId: recordId }, { dedupeKey: recordId }]
        if (mongoose.isValidObjectId(recordId)) idMatches.push({ _id: recordId })
        await models.notifications.updateOne({ $or: idMatches }, { $set: { read: true } }).catch(() => {})
        
        // Also mark read in unified Notification model
        await Notification.updateOne({ $or: idMatches }, { $set: { read: true, readAt: new Date() } }).catch(() => {})
        return res.json({ success: true, data: { id: recordId, read: true } })
      }`;

const normCode = code.replace(/\r\n/g, '\n');
const normOld1 = oldBlock1.replace(/\r\n/g, '\n');
const normOld2 = oldBlock2.replace(/\r\n/g, '\n');

if (normCode.includes(normOld1) && normCode.includes(normOld2)) {
  let updated = normCode.replace(normOld1, newBlock1).replace(normOld2, newBlock2);
  fs.writeFileSync('server/src/modules/workspace/workspace.routes.js', updated.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated workspace.routes.js');
} else {
  console.error('Target blocks not found in workspace.routes.js');
}

