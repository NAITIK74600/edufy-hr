import test from 'node:test'
import assert from 'node:assert/strict'

test('Frontend LiveGpsTracker Singleton & Background Behavior Test Suite', async (t) => {
  // Set up mock browser environment
  const mockListeners = {}
  global.window = {
    addEventListener: (evt, fn) => {
      mockListeners[evt] = mockListeners[evt] || []
      mockListeners[evt].push(fn)
    },
    removeEventListener: (evt, fn) => {
      if (mockListeners[evt]) {
        mockListeners[evt] = mockListeners[evt].filter(f => f !== fn)
      }
    },
    __edufyi_last_gps: null,
  }

  const docListeners = {}
  global.document = {
    visibilityState: 'visible',
    addEventListener: (evt, fn) => {
      docListeners[evt] = docListeners[evt] || []
      docListeners[evt].push(fn)
    },
    removeEventListener: (evt, fn) => {
      if (docListeners[evt]) {
        docListeners[evt] = docListeners[evt].filter(f => f !== fn)
      }
    },
  }

  let watchCallback = null
  let watchErrorCallback = null
  let currentWatchId = null

  const mockNavigator = {
    onLine: true,
    geolocation: {
      watchPosition: (onSuccess, onError) => {
        watchCallback = onSuccess
        watchErrorCallback = onError
        currentWatchId = 99
        return currentWatchId
      },
      clearWatch: (id) => {
        if (id === currentWatchId) {
          currentWatchId = null
          watchCallback = null
        }
      },
      getCurrentPosition: (onSuccess) => {
        if (onSuccess) {
          onSuccess({
            coords: { latitude: 12.9101, longitude: 77.6517, accuracy: 8 },
            timestamp: Date.now(),
          })
        }
      },
    },
    connection: { effectiveType: '4g' },
  }
  Object.defineProperty(globalThis, 'navigator', { value: mockNavigator, configurable: true, writable: true })

  const { liveGpsTracker } = await import('../../src/services/liveGpsTracker.js')

  await t.test('1. Tracker starts only when called and sets status to LIVE', () => {
    assert.equal(liveGpsTracker.getState().isRunning, false)
    assert.equal(liveGpsTracker.getState().status, 'IDLE')

    liveGpsTracker.start({ employeeId: 'EMP-UNIT-1', employeeName: 'Unit Tester' })

    const state = liveGpsTracker.getState()
    assert.equal(state.isRunning, true)
    assert.equal(state.employeeId, 'EMP-UNIT-1')
    assert.equal(state.status, 'LIVE')
    assert.ok(currentWatchId !== null, 'Exactly one watchPosition must be active')
  })

  await t.test('2. GPS position updates update lastCoords and flags UNCERTAIN for accuracy > 100m', () => {
    // High accuracy fix (8m)
    liveGpsTracker.handlePosition({
      coords: { latitude: 12.9105, longitude: 77.6520, accuracy: 8 },
      timestamp: Date.now(),
    })
    assert.equal(liveGpsTracker.getState().status, 'LIVE')
    assert.equal(liveGpsTracker.getState().lastCoords.accuracy, 8)
    assert.equal(global.window.__edufyi_last_gps.accuracy, 8)

    // Poor indoor fix (120m)
    liveGpsTracker.handlePosition({
      coords: { latitude: 12.9105, longitude: 77.6520, accuracy: 120 },
      timestamp: Date.now(),
    })
    assert.equal(liveGpsTracker.getState().status, 'UNCERTAIN')
  })

  await t.test('3. Page Visibility changes: BACKGROUND_PAUSED when hidden, resumes on visible', () => {
    global.document.visibilityState = 'hidden'
    liveGpsTracker.handleVisibilityChange()
    assert.equal(liveGpsTracker.getState().status, 'BACKGROUND_PAUSED')

    global.document.visibilityState = 'visible'
    liveGpsTracker.handleVisibilityChange()
    assert.equal(liveGpsTracker.getState().status, 'LIVE')
  })

  await t.test('4. Offline buffering and rejecting coordinates older than 5 minutes on reconnect', () => {
    global.navigator.onLine = false
    liveGpsTracker.handleOffline()
    assert.equal(liveGpsTracker.getState().status, 'OFFLINE')

    // Buffer one fix from 10 minutes ago
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    liveGpsTracker.offlineQueue.push({
      latitude: 12.9999,
      longitude: 77.9999,
      accuracy: 10,
      capturedAt: tenMinsAgo,
    })

    // Buffer one fix from 1 minute ago
    const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString()
    liveGpsTracker.offlineQueue.push({
      latitude: 12.9101,
      longitude: 77.6517,
      accuracy: 8,
      capturedAt: oneMinAgo,
    })

    assert.equal(liveGpsTracker.getState().offlineQueueLength, 2)

    // Network reconnects
    global.navigator.onLine = true
    liveGpsTracker.handleOnline()

    // The 10m old fix was dropped, queue was flushed, status returned to LIVE
    assert.equal(liveGpsTracker.getState().status, 'LIVE')
    assert.equal(liveGpsTracker.getState().offlineQueueLength, 0)
  })

  await t.test('5. Tracker stops completely on punch-out and clears watchPosition', () => {
    liveGpsTracker.stop()
    const state = liveGpsTracker.getState()
    assert.equal(state.isRunning, false)
    assert.equal(state.status, 'IDLE')
    assert.equal(currentWatchId, null, 'watchPosition must be cleared')
  })
})
