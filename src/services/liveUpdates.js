import { ApiError } from './apiClient.js'

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '/api/v1'

export function connectLiveUpdates(token, refresh, failed) {
  const controller = new AbortController()
  let retry
  let backoffMs = 3000
  async function connect() {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      if (!response.ok) throw new ApiError('Live updates unavailable. Background refresh remains active.', { status: response.status })
      if (!response.body) throw new Error('Live update streaming is not supported by this browser.')
      backoffMs = 3000
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (!controller.signal.aborted) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
          let end
          while ((end = buffer.indexOf('\n\n')) !== -1) {
            const event = buffer.slice(0, end)
            buffer = buffer.slice(end + 2)
            if (event === 'data: changed' || event === 'data: connected') refresh()
          }
        }
      } finally { reader.releaseLock() }
    } catch (error) {
      if (controller.signal.aborted) return
      if (error?.status === 401 && failed) failed(error)
      // Exponential backoff to avoid hammering proxy/server during brief network drop
      backoffMs = Math.min(20000, Math.round(backoffMs * 1.5))
    }
    if (!controller.signal.aborted) retry = setTimeout(connect, backoffMs)
  }
  connect()
  return () => { controller.abort(); clearTimeout(retry) }
}
