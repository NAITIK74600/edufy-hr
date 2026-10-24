import { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { verifyPassword } from '../../auth/passwords.js'
import { getUserPermissions } from '../../auth/permissions.js'

const INVALID_LOGIN_MESSAGE = 'Invalid email or password.'

export function createAuthService({ userStore, jwtSecret, issuer = 'edufyi-hr-api', audience = 'edufyi-ess', accessTokenTtl = '15m', revokedTokens }) {
  async function login(email, password) {
    const user = await userStore.findByEmail(email)
    if (!user || user.status === 'inactive' || !verifyPassword(password, user.passwordHash)) {
      const error = new Error(INVALID_LOGIN_MESSAGE)
      error.statusCode = 401
      error.code = 'INVALID_CREDENTIALS'
      throw error
    }

    const jti = randomUUID()
    const token = jwt.sign({ sub: String(user.id), role: user.role, version: user.authVersion ?? 0, jti }, jwtSecret, { algorithm: 'HS256', expiresIn: accessTokenTtl, issuer, audience })
    return { token, user: toPublicUser(user), expiresIn: accessTokenTtl }
  }

  function logout(jti) {
    if (jti) revokedTokens.add(jti)
  }

  return { login, logout, toPublicUser }
}

export function toPublicUser(user) {
  const { passwordHash, authVersion, ...safeUser } = user
  const displayName = safeUser.displayName || safeUser.name || safeUser.username || (safeUser.email ? safeUser.email.split('@')[0] : 'Employee')
  return { ...safeUser, displayName, name: safeUser.name || displayName, permissions: getUserPermissions(user) }
}
