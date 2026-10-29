// Edufyi HR Progressive Web App (PWA) Service Worker
const CACHE_NAME = 'edufyi-hr-pwa-v1'
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/elythra-edufyitech-logo.png',
  '/fonts/dm-sans-normal-400700.woff2'
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
            cache.put(event.request, responseToCache)
          })
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
        .catch((err) => console.warn('[PWA SW] Background sync failed:', err))
    )
  }
})

// 5. Periodic Background Sync Event (for supported browsers)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'edufyi-bg-keepalive') {
    event.waitUntil(
      fetch('/api/v1/health')
        .then(() => console.log('[PWA SW] Periodic keep-alive ping dispatched'))
        .catch(() => {})
    )
  }
})

// 6. Push Notifications Event
self.addEventListener('push', (event) => {
  let data = { title: 'Edufyi Workforce Notification', body: 'You have a new update in your HR portal.' }
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch {
    if (event.data) data.body = event.data.text()
  }

  const options = {
    body: data.body,
    icon: '/elythra-edufyitech-logo.png',
    badge: '/elythra-edufyitech-logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/#/'
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// 7. Notification Click: Focus existing window or open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/#/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
