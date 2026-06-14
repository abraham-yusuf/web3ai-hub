// AI3 Hub Service Worker - Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'AI3 Hub', {
      body: data.body || 'New content available',
      icon: '/icons/icon-192.svg',
      badge: '/icons/favicon.svg',
      data: { url: data.url || '/' }
    })
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      const targetUrl = event.notification.data.url
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

self.addEventListener('install', function(event) {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim())
})
