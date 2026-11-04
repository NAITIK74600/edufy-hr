/**
 * In-Memory Sliding-Window Rate Limiter
 * Zero-dependency, lightweight, production-grade rate limiting.
 */
export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
  message = 'Too many requests. Please try again later.',
  statusCode = 429,
  keyGenerator = (req) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
    return String(ip)
  },
  skip = () => false,
} = {}) {
  const hits = new Map()

  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of hits.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs)
      if (valid.length === 0) hits.delete(key)
      else hits.set(key, valid)
    }
  }, Math.max(windowMs, 60000))

  if (cleanupInterval?.unref) cleanupInterval.unref()

  return function rateLimitMiddleware(req, res, next) {
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next()
    }

    if (skip(req)) {
      return next()
    }

    const key = keyGenerator(req)
    const now = Date.now()
    const timestamps = hits.get(key) || []
    const recentHits = timestamps.filter((t) => now - t < windowMs)

    const remaining = Math.max(0, max - recentHits.length)
    const oldestHit = recentHits[0] || now
    const resetTime = Math.max(1, Math.ceil((oldestHit + windowMs - now) / 1000))

    res.setHeader('RateLimit-Limit', max)
    res.setHeader('RateLimit-Remaining', remaining)
    res.setHeader('RateLimit-Reset', resetTime)

    if (recentHits.length >= max) {
      res.setHeader('Retry-After', resetTime)
      return res.status(statusCode).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfterSeconds: resetTime,
        },
      })
    }

    recentHits.push(now)
    hits.set(key, recentHits)
    next()
  }
}

