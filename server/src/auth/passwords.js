import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `scrypt$${salt}$${derivedKey}`
}

export function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return false
  const [algorithm, salt, key] = storedHash.split('$')
  if (algorithm !== 'scrypt' || !salt || !key) return false
  try {
    const expected = Buffer.from(key, 'hex')
    const actual = scryptSync(password, salt, KEY_LENGTH)
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}
