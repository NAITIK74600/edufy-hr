// Push notification client - Completely disabled per user policy.
// Bell notifications, sound chimes, and email notifications remain fully active.

export function isPushNotificationSupported() {
  return false
}

export function getPushPermissionStatus() {
  return 'denied'
}

export function detectDevicePlatform() {
  return 'disabled'
}

export async function subscribeToPushNotifications() {
  return { success: false, disabled: true, message: 'Push notifications are disabled.' }
}

export async function sendTestPushNotification() {
  return { success: false, disabled: true, message: 'Push notifications are disabled.' }
}

export async function unsubscribeFromPushNotifications() {
  return { success: true, disabled: true }
}

export default {
  isPushNotificationSupported,
  getPushPermissionStatus,
  detectDevicePlatform,
  subscribeToPushNotifications,
  sendTestPushNotification,
  unsubscribeFromPushNotifications,
}
