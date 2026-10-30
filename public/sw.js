// Edufyi HR Progressive Web App (PWA) Service Worker
const CACHE_NAME = 'edufyi-hr-pwa-v5'
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/elythra-edufyitech-logo.png',
  '/fonts/dm-sans-normal-400700.woff2',
]

// 1. Install Event: Cache essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache non-critical item warning:', err)
      })
    }).then(() => self.skipWaiting())
  )
})

// 2. Activate Event: Clean up stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Deleting old cache:', key)
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// 3. Fetch Event: Network-first with cache fallback (always prefer live server for API & auth)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Ignore non-HTTP / non-HTTPS requests (like chrome-extension://, moz-extension://)
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Never cache API, auth, or event streams
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth') || event.request.method !== 'GET') {
    return
  }

  // Static assets and pages: network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {})
          }).catch(() => {})
        }
        return networkResponse
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })
      })
  )
})

// 4. Background Sync Event (Sync attendance / pending data when network restores)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance-heartbeat') {
    event.waitUntil(
      fetch('/api/v1/health')
        .then(() => console.log('[PWA SW] Background sync attendance heartbeat succeeded'))
        .catch((err) => console.warn('[PWA SW] Background sync attendance heartbeat notice:', err))
    )
  }
})

// 5. Push Event: Handle incoming Web Push notifications from server
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (err) {
    data = { title: 'Edufyi HR', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Edufyi HR'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || 'edufyi-notification',
    data: data.data || {},
    vibrate: [100, 50, 100],
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// 6. Notification Click Event: Navigate to relevant HR page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.targetUrl || '/'
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if available
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(fullTargetUrl)
          }
          return client.focus()
        }
      }
      // If no window is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl)
      }
    })
  )
})
