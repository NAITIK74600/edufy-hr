/**
 * Defensive Input Sanitization & Anti-NoSQL Query Pollution Middleware
 * Strips MongoDB operator keys (starting with '$') and document path traversal keys (containing '.')
 * Modifies objects in-place to support Express / Node IncomingMessage getters on req.query and req.params.
 */

export function cleanInPlace(obj) {
  if (!obj || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        cleanInPlace(obj[i])
      }
    }
    return obj
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (obj[key] instanceof Date || obj[key] instanceof RegExp || Buffer.isBuffer(obj[key])) {
        continue
      }
      cleanInPlace(obj[key])
    }
  }
  return obj
}

export function sanitizeMiddleware(request, response, next) {
  try {
    if (request.body && typeof request.body === 'object') cleanInPlace(request.body)
    if (request.query && typeof request.query === 'object') cleanInPlace(request.query)
    if (request.params && typeof request.params === 'object') cleanInPlace(request.params)
  } catch (err) {
    return next(err)
  }
  next()
}
