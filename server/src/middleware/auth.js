import jwt from 'jsonwebtoken'
import { hasAnyPermission, hasPermission } from '../auth/permissions.js'

export function createAuthMiddleware({ userStore, jwtSecret, issuer = 'edufyi-hr-api', audience = 'edufyi-ess', revokedTokens = new Set() }) {
  function authenticate(request, response, next) {
    const authorization = request.get('authorization')
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null
    if (!token) return response.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } })

    try {
      const claims = jwt.verify(token, jwtSecret, { algorithms: ['HS256'], issuer, audience })
      if (revokedTokens.has(claims.jti)) return response.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } })
      return userStore.findById(claims.sub).then((user) => {
        const tokenVersion = claims.version ?? 0
        const userVersion = user?.authVersion ?? 0
        const isRevoked = userVersion > 0 && tokenVersion < userVersion
        if (!user || user.status !== 'active' || isRevoked) return response.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } })
        request.auth = { user, claims }
        return next()
      }).catch(next)
    } catch {
      return response.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } })
    }
  }

  function requirePermission(permission) {
    return (request, response, next) => {
      if (!hasPermission(request.auth.user, permission)) return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } })
      return next()
    }
  }

  function requireAnyPermission(permissions) {
    return (request, response, next) => {
      if (!hasAnyPermission(request.auth.user, permissions)) return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } })
      return next()
    }
  }

  function requireManagerOf(paramName) {
    return (request, response, next) => userStore.isManagerOf(request.auth.user.id, request.params[paramName]).then((allowed) => {
      if (!allowed) return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this team member.' } })
      return next()
    }).catch(next)
  }

  return { authenticate, requirePermission, requireAnyPermission, requireManagerOf, revokedTokens }
}
