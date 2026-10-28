const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '/api/v1'

function readStoredToken() {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage?.getItem('edufyi.accessToken') || window.sessionStorage?.getItem('edufyi.accessToken') || null
  } catch {
    return null
  }
}

let accessToken = readStoredToken()

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken || readStoredToken()
}

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', fields = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

const inFlightGets = new Map()

async function executeApiRequest(path, options = {}, retries = 3) {
  const activeToken = accessToken || readStoredToken()
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        ...options.headers
      },
      ...options
    })
  } catch (err) {
    if (retries > 0 && (!options.method || options.method === 'GET')) {
      const delay = (4 - retries) * 300
      await new Promise((r) => setTimeout(r, delay))
      return executeApiRequest(path, options, retries - 1)
    }
    throw new ApiError('The service is temporarily unavailable. Reconnecting...', { status: 0, code: 'NETWORK_ERROR' })
  }

  // Handle temporary 502/503/504 while server reloads
  if ((response.status === 502 || response.status === 503 || response.status === 504) && retries > 0 && (!options.method || options.method === 'GET')) {
    const delay = (4 - retries) * 350
    await new Promise((r) => setTimeout(r, delay))
    return executeApiRequest(path, options, retries - 1)
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const error = body?.error ?? {}
    if (response.status === 401 && !path.startsWith('/auth/login')) {
      accessToken = null
      try {
        window.localStorage?.removeItem('edufyi.accessToken')
        window.sessionStorage?.removeItem('edufyi.accessToken')
        window.localStorage?.removeItem('edufyi.authUser')
        window.sessionStorage?.removeItem('edufyi.authUser')
      } catch {}
      window.dispatchEvent(new Event('edufyi:auth-expired'))
      throw new ApiError('Your session expired. Please sign in again.', { status: 401, code: 'AUTH_REQUIRED' })
    }
    throw new ApiError(error.message ?? 'The request could not be completed.', {
      status: response.status,
      code: error.code ?? 'REQUEST_FAILED',
      fields: error.fields
    })
  }
  return body ?? { success: true }
}

export async function apiRequest(path, options = {}, retries = 3) {
  const isGet = !options.method || options.method === 'GET'
  if (isGet && retries === 3) {
    const cacheKey = `${path}::${accessToken || ''}`
    if (inFlightGets.has(cacheKey)) {
      return inFlightGets.get(cacheKey)
    }
    const promise = executeApiRequest(path, options, retries).finally(() => {
      inFlightGets.delete(cacheKey)
    })
    inFlightGets.set(cacheKey, promise)
    return promise
  }
  return executeApiRequest(path, options, retries)
}

export async function downloadBlob(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers
      },
      ...options
    })
  } catch {
    throw new ApiError('The service is unavailable. Try again shortly.')
  }

  if (!response.ok) {
    let msg = 'Failed to download file'
    try {
      const errJson = await response.json()
      msg = errJson?.error?.message || msg
    } catch {}
    throw new ApiError(msg, { status: response.status })
  }
  return await response.blob()
}

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
  downloadBlob: (path, options) => downloadBlob(path, options),
  getAccessToken: () => accessToken,
}
