import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

/**
 * Derives a deterministic 32-byte encryption key from environment secrets.
 */
function getDerivedKey() {
  const secret =
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    'edufyi-secure-google-token-key-2026-master'
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
    const key = getDerivedKey()
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
 * @param {string} encryptedString Encrypted string in format <iv_hex>:<authTag_hex>:<cipher_hex>
 * @returns {string|null} Decrypted plaintext or null if decryption fails
 */
export function decryptToken(encryptedString) {
  if (!encryptedString || typeof encryptedString !== 'string') return null
  try {
    // Check if format is <iv>:<authTag>:<ciphertext>
    const parts = encryptedString.split(':')
    if (parts.length !== 3) {
      // Legacy plaintext support during migration
      if (encryptedString.startsWith('ya29.') || encryptedString.startsWith('1//')) {
        return encryptedString
      }
      return null
    }

    const [ivHex, authTagHex, cipherHex] = parts
    const key = getDerivedKey()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('[Decryption Error]: Failed to decrypt token safely:', error.message)
    return null
  }
}
