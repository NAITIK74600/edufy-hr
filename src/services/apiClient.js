const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '/api/v1'
let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
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

export async function apiRequest(path, options = {}, retries = 3) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers
      },
      ...options
    })
  } catch (err) {
    if (retries > 0 && (!options.method || options.method === 'GET')) {
      const delay = (4 - retries) * 300
      await new Promise((r) => setTimeout(r, delay))
      return apiRequest(path, options, retries - 1)
    }
    throw new ApiError('The service is temporarily unavailable. Reconnecting...', { status: 0, code: 'NETWORK_ERROR' })
  }

  // Handle temporary 502/503/504 while server reloads
  if ((response.status === 502 || response.status === 503 || response.status === 504) && retries > 0 && (!options.method || options.method === 'GET')) {
    const delay = (4 - retries) * 350
    await new Promise((r) => setTimeout(r, delay))
    return apiRequest(path, options, retries - 1)
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const error = body?.error ?? {}
    if (response.status === 401 && accessToken && !path.startsWith('/auth/login')) {
      window.dispatchEvent(new Event('edufyi:auth-expired'))
      throw new ApiError('Your session expired. Please sign in again.', { status: 401, code: 'AUTH_REQUIRED' })
    }
    throw new ApiError(error.message ?? 'The request could not be completed.', {
      status: response.status,
      code: error.code ?? 'REQUEST_FAILED',
      fields: error.fields
    })
  }
  return body
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
