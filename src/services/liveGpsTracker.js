import { apiClient } from './apiClient.js'

/**
 * LiveGpsTracker - Authoritative Singleton GPS & Presence Tracker
 * 
 * Guarantees:
 * 1. Exactly ONE geolocation watchPosition across the entire portal.
 * 2. Starts ONLY when employee is actively checked in; terminates immediately upon punch-out.
 * 3. Handles Page Visibility API (resumes GPS refresh when app returns to foreground).
 * 4. Buffers offline updates and rejects outdated coordinates (>5 minutes) upon reconnect.
 * 5. Accurately reports states: IDLE, LIVE, BACKGROUND_PAUSED, STALE, OFFLINE, LOCATION_UNAVAILABLE, UNCERTAIN.
 */
class LiveGpsTracker {
  constructor() {
    this.isRunning = false
    this.employeeId = null
    this.employeeName = null
    this.status = 'IDLE' // 'IDLE' | 'LIVE' | 'BACKGROUND_PAUSED' | 'STALE' | 'OFFLINE' | 'LOCATION_UNAVAILABLE' | 'UNCERTAIN'
    this.lastCoords = null
    this.lastSyncAt = null
    this.lastServerVerification = null
    this.watchId = null
    this.syncTimer = null
    this.offlineQueue = []
    this.listeners = new Set()

    this.handlePosition = this.handlePosition.bind(this)
    this.handlePositionError = this.handlePositionError.bind(this)
    this.handleOnline = this.handleOnline.bind(this)
    this.handleOffline = this.handleOffline.bind(this)
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
  }

  getState() {
    return {
      isRunning: this.isRunning,
      employeeId: this.employeeId,
      employeeName: this.employeeName,
      status: this.status,
      lastCoords: this.lastCoords,
      lastSyncAt: this.lastSyncAt,
      lastServerVerification: this.lastServerVerification,
      offlineQueueLength: this.offlineQueue.length,
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  notify() {
    const state = this.getState()
    for (const listener of this.listeners) {
      try {
        listener(state)
      } catch (err) {
        console.warn('[LiveGpsTracker] Subscriber error:', err)
      }
    }
  }

  start({ employeeId, employeeName }) {
    if (typeof window === 'undefined') return

    if (this.isRunning && this.employeeId === employeeId) {
      return
    }

    if (this.isRunning) {
      this.stop()
    }

    this.isRunning = true
    this.employeeId = employeeId
    this.employeeName = employeeName

    if (!navigator.onLine) {
      this.status = 'OFFLINE'
    } else if (!navigator.geolocation) {
      this.status = 'LOCATION_UNAVAILABLE'
    } else {
      this.status = 'LIVE'
    }

    // Attach Network & Visibility Listeners
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    // Start Exactly ONE watchPosition
    if (navigator.geolocation) {
      try {
        this.watchId = navigator.geolocation.watchPosition(
          this.handlePosition,
          this.handlePositionError,
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
        )
      } catch (err) {
        console.warn('[LiveGpsTracker] watchPosition failed to start:', err)
      }

      // Initial immediate fix
      navigator.geolocation.getCurrentPosition(
        this.handlePosition,
        this.handlePositionError,
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      )
    }

    // Heartbeat Sync Timer (every 25 seconds while active)
    this.syncTimer = setInterval(() => {
      if (this.isRunning && navigator.onLine && document.visibilityState === 'visible') {
        this.syncWithServer()
      }
    }, 25000)

    console.log(`[LiveGpsTracker] Started tracking for employee: ${employeeId}`)
    this.notify()
  }

  stop() {
    if (!this.isRunning) return

    console.log(`[LiveGpsTracker] Stopping tracking for employee: ${this.employeeId}`)

    if (this.watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        navigator.geolocation.clearWatch(this.watchId)
      } catch {}
      this.watchId = null
    }

    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    }

    this.isRunning = false
    this.employeeId = null
    this.employeeName = null
    this.status = 'IDLE'
    this.offlineQueue = []

    this.notify()
  }

  handlePosition(pos) {
    if (!this.isRunning) return

    const coords = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy),
      timestamp: pos.timestamp || Date.now(),
    }

    this.lastCoords = coords
    if (typeof window !== 'undefined') {
      window.__edufyi_last_gps = coords
    }

    if (!navigator.onLine) {
      this.offlineQueue.push({
        ...coords,
        capturedAt: new Date().toISOString(),
      })
      if (this.offlineQueue.length > 10) {
        this.offlineQueue.shift()
      }
      this.status = 'OFFLINE'
      this.notify()
      return
    }

    if (document.visibilityState === 'hidden') {
      this.status = 'BACKGROUND_PAUSED'
    } else if (coords.accuracy > 100) {
      this.status = 'UNCERTAIN'
    } else {
      this.status = 'LIVE'
    }

    // Throttle immediate sync to at least 15s between fixes
    const now = Date.now()
    if (!this.lastSyncAt || (now - this.lastSyncAt >= 15000)) {
      this.syncWithServer(coords)
    } else {
      this.notify()
    }
  }

  handlePositionError(err) {
    if (!this.isRunning) return

    if (err?.code === 1) {
      // Permission denied
      this.status = 'LOCATION_UNAVAILABLE'
    } else if (err?.code === 2 || err?.code === 3) {
      // Position unavailable or timeout
      if (!this.lastCoords) {
        this.status = 'LOCATION_UNAVAILABLE'
      } else {
        const ageSecs = (Date.now() - (this.lastCoords.timestamp || 0)) / 1000
        if (ageSecs > 300) {
          this.status = 'STALE'
        }
      }
    }

    this.notify()
  }

  handleOnline() {
    if (!this.isRunning) return
    console.log('[LiveGpsTracker] Network reconnected. Verifying and synchronizing buffered updates...')

    // Reject outdated buffered coordinates (>5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const validBuffered = this.offlineQueue.filter((item) => {
      const itemTime = item.capturedAt ? new Date(item.capturedAt).getTime() : 0
      return itemTime >= fiveMinutesAgo
    })
    const droppedCount = this.offlineQueue.length - validBuffered.length
    if (droppedCount > 0) {
      console.log(`[LiveGpsTracker] Discarded ${droppedCount} outdated offline coordinates (>5m old)`)
    }
    this.offlineQueue = []

    this.status = 'LIVE'
    this.notify()

    // Immediately trigger fresh GPS fix upon network restoration
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.handlePosition(pos)
          this.syncWithServer(this.lastCoords, { reconnected: true })
        },
        () => {
          if (validBuffered.length > 0) {
            this.syncWithServer(validBuffered[validBuffered.length - 1], { reconnected: true })
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }

  handleOffline() {
    if (!this.isRunning) return
    console.log('[LiveGpsTracker] Network disconnected. Pausing live server sync and buffering fixes.')
    this.status = 'OFFLINE'
    this.notify()
  }

  handleVisibilityChange() {
    if (!this.isRunning) return

    if (document.visibilityState === 'hidden') {
      // Browser minimized or screen locked
      this.status = 'BACKGROUND_PAUSED'
      this.notify()
    } else if (document.visibilityState === 'visible') {
      // Returned from background suspension / screen unlock
      console.log('[LiveGpsTracker] Page visible. Resuming active monitoring and refreshing GPS fix...')
      this.status = 'LIVE'
      this.notify()

      // Immediately acquire fresh GPS fix
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.handlePosition(pos)
            this.syncWithServer(this.lastCoords, { resumedFromBackground: true })
          },
          () => {
            this.syncWithServer(this.lastCoords, { resumedFromBackground: true })
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      }
    }
  }

  async syncWithServer(coordsOverride = null, meta = {}) {
    if (!this.isRunning || !this.employeeId || !navigator.onLine) return

    const coords = coordsOverride || this.lastCoords
    const hasCoords = Boolean(coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude))

    // Reject outdated coordinates older than 5 minutes as current live position
    let isStale = false
    if (coords?.timestamp) {
      const ageMs = Date.now() - coords.timestamp
      if (ageMs > 5 * 60 * 1000) {
        isStale = true
      }
    }

    const payload = {
      ...(hasCoords ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      } : {}),
      deviceCapturedAt: coords?.timestamp ? new Date(coords.timestamp).toISOString() : new Date().toISOString(),
      locationPermission: hasCoords ? 'granted' : (this.status === 'LOCATION_UNAVAILABLE' ? 'denied' : 'unknown'),
      networkType: typeof navigator !== 'undefined' && navigator.connection?.effectiveType ? navigator.connection.effectiveType : 'unknown',
      isStale,
      ...meta,
    }

    try {
      const res = await apiClient.post('/attendance/presence', payload)
      const data = res.data?.data || res.data || {}
      this.lastSyncAt = Date.now()
      this.lastServerVerification = data

      if (isStale) {
        this.status = 'STALE'
      } else if (coords?.accuracy > 100) {
        this.status = 'UNCERTAIN'
      } else if (document.visibilityState === 'hidden') {
        this.status = 'BACKGROUND_PAUSED'
      } else {
        this.status = 'LIVE'
      }

      this.notify()
      return data
    } catch (err) {
      console.warn('[LiveGpsTracker] Server presence sync notice:', err.message)
      return null
    }
  }
}

export const liveGpsTracker = new LiveGpsTracker()
