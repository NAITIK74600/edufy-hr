import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

/**
 * Derives a deterministic 32-byte encryption key strictly from environment secrets.
 * Refuses to use insecure hardcoded fallback keys for encryption.
 */
function getPrimarySecret() {
  const secret = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET
  if (!secret) {
    throw new Error('[Security Exception]: GOOGLE_TOKEN_ENCRYPTION_KEY or JWT_SECRET must be configured in environment variables.')
  }
  return secret
}

function deriveKey(secret) {
  return crypto.createHash('sha256').update(secret).digest()
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: <iv_hex>:<authTag_hex>:<cipher_hex>
 * @param {string} text Plaintext to encrypt
 * @returns {string|null} Encrypted cipher string or null if empty
 */
export function encryptToken(text) {
  if (!text || typeof text !== 'string') return null
  try {
    const key = deriveKey(getPrimarySecret())
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('[Encryption Error]: Failed to encrypt token safely:', error.message)
    return null
  }
}

/**
 * Decrypt an AES-256-GCM encrypted token string.
 * Strictly requires encrypted format; rejects unencrypted legacy tokens.
 * Supports read-only migration fallback to prevent data loss for existing records.
 * @param {string} encryptedString Encrypted string in format <iv_hex>:<authTag_hex>:<cipher_hex>
 * @returns {string|null} Decrypted plaintext or null if decryption fails
 */
export function decryptToken(encryptedString) {
  if (!encryptedString || typeof encryptedString !== 'string') return null
  try {
    // Strictly require AES-256-GCM format <iv>:<authTag>:<ciphertext>
    const parts = encryptedString.split(':')
    if (parts.length !== 3) {
      console.warn('[Security Warning]: Refusing unencrypted or malformed token string in database.')
      return null
    }

    const [ivHex, authTagHex, cipherHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    // 1. Try primary configured key from environment
    try {
      const primaryKey = deriveKey(getPrimarySecret())
      const decipher = crypto.createDecipheriv(ALGORITHM, primaryKey, iv)
      decipher.setAuthTag(authTag)
      let decrypted = decipher.update(cipherHex, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (primaryErr) {
      // 2. Migration read fallback for existing records without losing or silently deleting data
      const legacySecrets = [
        process.env.JWT_SECRET,
        'edufyi-secure-google-token-key-2026-master',
      ].filter(Boolean)

      for (const legSec of legacySecrets) {
        try {
          const legKey = deriveKey(legSec)
          const decipher = crypto.createDecipheriv(ALGORITHM, legKey, iv)
          decipher.setAuthTag(authTag)
          let decrypted = decipher.update(cipherHex, 'hex', 'utf8')
          decrypted += decipher.final('utf8')
          if (decrypted) {
            console.info('[Security Migration]: Successfully decrypted token using historical key during migration.')
            return decrypted
          }
        } catch {}
      }
      throw primaryErr
    }
  } catch (error) {
    console.error('[Decryption Error]: Failed to decrypt token safely:', error.message)
    return null
  }
}

