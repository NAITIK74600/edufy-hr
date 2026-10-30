import { apiClient } from './apiClient.js'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function isPushNotificationSupported() {
  if (typeof window === 'undefined') return false
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function getPushPermissionStatus() {
  if (!isPushNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export function detectDevicePlatform() {
  if (typeof window === 'undefined') return 'unknown'
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }
  if (/android/i.test(ua)) return 'android'
  if (/macintosh|mac os x/i.test(ua)) return 'macos'
  if (/windows/i.test(ua)) return 'windows'
  if (/linux/i.test(ua)) return 'linux'
  return 'web'
}

export async function subscribeToPushNotifications() {
  if (!isPushNotificationSupported()) {
    return {
      success: false,
      error: 'Push notifications are not supported on this browser or device. On iOS, add Edufyi HR to your Home Screen first.',
    }
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return {
        success: false,
        permission,
        error: 'Notification permission was not granted.',
      }
    }

    const reg = await navigator.serviceWorker.ready
    if (!reg) {
      return { success: false, error: 'Service worker not ready.' }
    }

    // 1. Fetch VAPID Public Key from server
    const vapidRes = await apiClient.get('/notifications/vapid-public-key')
    const vapidPublicKey = vapidRes?.publicKey
    if (!vapidPublicKey) {
      return { success: false, error: 'VAPID public key unavailable from server.' }
    }

    // 2. Check existing subscription or create new
    let subscription = await reg.pushManager.getSubscription()
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })
    }

    // 3. Register subscription with Edufyi unified notification backend
    const platform = detectDevicePlatform()
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
    const deviceType = isMobile ? 'mobile' : 'desktop'

    const serverRes = await apiClient.post('/notifications/push-subscription', {
      subscription: subscription.toJSON ? subscription.toJSON() : subscription,
      platform,
      deviceType,
    })

    return {
      success: true,
      permission: 'granted',
      subscription,
      registered: serverRes?.registered ?? true,
    }
  } catch (err) {
    console.error('[Push Subscription Client Error]:', err)
    return {
      success: false,
      error: err.message || 'Failed to subscribe to push notifications.',
    }
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!isPushNotificationSupported()) return { success: false }

  try {
    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.getSubscription()
    if (subscription) {
      const endpoint = subscription.endpoint
      await subscription.unsubscribe()
      await apiClient.delete('/notifications/push-subscription', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      }).catch(() => {})
    }
    return { success: true }
  } catch (err) {
    console.warn('[Push Unsubscribe Error]:', err)
    return { success: false, error: err.message }
  }
}

export async function sendTestPushNotification() {
  return apiClient.post('/notifications/test-push', {})
}
