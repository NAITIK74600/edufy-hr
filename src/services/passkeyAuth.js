import { apiClient } from './apiClient.js'

export function isPasskeySupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials !== 'undefined' &&
    typeof navigator.credentials.create === 'function' &&
    typeof navigator.credentials.get === 'function'
  )
}

function base64UrlToUint8Array(base64Url) {
  if (!base64Url) return new Uint8Array(0)
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64Url(buffer) {
  if (!buffer) return ''
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Sign in using WebAuthn Passkey (Touch ID, Windows Hello, Face ID, YubiKey)
 */
export async function loginWithPasskey({ email = '', portal = '' } = {}) {
  if (!isPasskeySupported()) {
    throw new Error('WebAuthn / Passkeys are not supported on this browser or device.')
  }

  // 1. Get challenge and options from backend
  const optionsRes = await apiClient.post('/auth/passkey/login-options', {
    email: email.trim() || undefined,
    portal: portal || undefined,
  })

  const { challengeId, challenge, rpId, allowCredentials, hasRegisteredPasskey, timeout } = optionsRes.data

  const publicKey = {
    challenge: base64UrlToUint8Array(challenge),
    rpId: rpId || window.location.hostname,
    timeout: timeout || 60000,
    userVerification: 'preferred',
  }

  if (Array.isArray(allowCredentials) && allowCredentials.length > 0) {
    publicKey.allowCredentials = allowCredentials.map((c) => ({
      id: base64UrlToUint8Array(c.id),
      type: 'public-key',
    }))
  }

  // 2. Request credential assertion from browser authenticator
  let credential
  try {
    credential = await navigator.credentials.get({ publicKey })
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Passkey verification was cancelled or timed out.')
    }
    throw new Error(err.message || 'Passkey verification failed on this device.')
  }

  if (!credential) {
    throw new Error('No credential returned by authenticator.')
  }

  // 3. Send assertion to server for verification
  const payload = {
    challengeId,
    email: email.trim() || undefined,
    portal: portal || undefined,
    credential: {
      id: credential.id,
      rawId: arrayBufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
        authenticatorData: arrayBufferToBase64Url(credential.response.authenticatorData),
        signature: arrayBufferToBase64Url(credential.response.signature),
        userHandle: credential.response.userHandle ? arrayBufferToBase64Url(credential.response.userHandle) : null,
      },
    },
  }

  const verifyRes = await apiClient.post('/auth/passkey/verify-login', payload)
  return verifyRes.data
}

/**
 * Register a new Passkey on the current device
 */
export async function registerPasskey({ email = '', password = '', deviceName = '' } = {}) {
  if (!isPasskeySupported()) {
    throw new Error('WebAuthn / Passkeys are not supported on this browser or device.')
  }

  // 1. Request registration options from backend
  const optionsRes = await apiClient.post('/auth/passkey/register-options', {
    email: email.trim() || undefined,
    password: password || undefined,
  })

  const { challengeId, challenge, rp, user, pubKeyCredParams, authenticatorSelection, timeout } = optionsRes.data

  const publicKey = {
    challenge: base64UrlToUint8Array(challenge),
    rp: rp || { name: 'Edufyi Tech Solutions', id: window.location.hostname },
    user: {
      id: base64UrlToUint8Array(user.id),
      name: user.name,
      displayName: user.displayName,
    },
    pubKeyCredParams: pubKeyCredParams || [
      { alg: -7, type: 'public-key' },
      { alg: -257, type: 'public-key' },
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
      residentKey: 'preferred',
      ...(authenticatorSelection || {}),
    },
    timeout: timeout || 60000,
  }

  // 2. Request credential creation from browser authenticator
  let credential
  try {
    credential = await navigator.credentials.create({ publicKey })
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Passkey creation was cancelled or timed out.')
    }
    throw new Error(err.message || 'Could not register passkey on this device.')
  }

  if (!credential) {
    throw new Error('No credential was generated by the authenticator.')
  }

  // 3. Send attestation to server for storage
  const payload = {
    challengeId,
    deviceName: deviceName || (window.navigator?.userAgent?.includes('Mac') ? 'Mac Touch ID' : 'Windows Hello / Security Key'),
    credential: {
      id: credential.id,
      rawId: arrayBufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
        attestationObject: arrayBufferToBase64Url(credential.response.attestationObject),
      },
    },
  }

  const verifyRes = await apiClient.post('/auth/passkey/register-verify', payload)
  return verifyRes.data
}

/**
 * List registered passkeys for the currently authenticated user
 */
export async function listPasskeys() {
  const res = await apiClient.get('/auth/passkey/list')
  return res.data?.data || []
}

/**
 * Remove a registered passkey by its credentialId
 */
export async function deletePasskey(credentialId) {
  const res = await apiClient.delete(`/auth/passkey/${encodeURIComponent(credentialId)}`)
  return res.data
}
