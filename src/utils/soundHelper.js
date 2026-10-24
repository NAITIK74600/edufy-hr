// Web Audio API notification sound generator
// Synthesizes pleasant, modern chimes locally without any external asset dependencies.

let audioContext = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null

  if (!audioContext) {
    try {
      audioContext = new AudioCtx()
    } catch {
      return null
    }
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }

  return audioContext
}

const SOUND_STORAGE_KEY = 'edufyi_notification_sound_muted_v1'

export function isSoundMuted() {
  if (typeof window === 'undefined' || !window.localStorage) return false
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setSoundMuted(muted) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, muted ? 'true' : 'false')
  } catch {}
}

export function toggleSoundMuted() {
  const current = isSoundMuted()
  setSoundMuted(!current)
  return !current
}

/**
 * Play a notification chime
 * @param {'notification' | 'announcement' | 'success'} type
 */
export function playNotificationSound(type = 'notification') {
  if (isSoundMuted()) return

  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    if (type === 'announcement') {
      // Harmonic 3-tone celebratory broadcast chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      const tones = [
        { freq: 523.25, time: 0, duration: 0.18, gain: 0.18 },
        { freq: 659.25, time: 0.11, duration: 0.22, gain: 0.22 },
        { freq: 783.99, time: 0.24, duration: 0.38, gain: 0.26 },
      ]

      tones.forEach(({ freq, time, duration, gain }) => {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + time)

        gainNode.gain.setValueAtTime(0, now + time)
        gainNode.gain.linearRampToValueAtTime(gain, now + time + 0.02)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration)

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.start(now + time)
        osc.stop(now + time + duration)
      })
    } else {
      // Clean modern 2-tone notification chime: D5 (587Hz) -> A5 (880Hz)
      const tones = [
        { freq: 587.33, time: 0, duration: 0.16, gain: 0.20 },
        { freq: 880.00, time: 0.09, duration: 0.28, gain: 0.24 },
      ]

      tones.forEach(({ freq, time, duration, gain }) => {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + time)

        gainNode.gain.setValueAtTime(0, now + time)
        gainNode.gain.linearRampToValueAtTime(gain, now + time + 0.015)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration)

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.start(now + time)
        osc.stop(now + time + duration)
      })
    }
  } catch (err) {
    // Ignore audio playback exceptions if autoplay blocked by user agent
    console.debug('Audio playback note:', err?.message)
  }
}
