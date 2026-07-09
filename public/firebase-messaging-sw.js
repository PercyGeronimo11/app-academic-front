/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')
importScripts('/firebase-config.js')

firebase.initializeApp(self.firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Notificación'
  const body = payload.notification?.body || payload.data?.body || ''
  const clickPath = payload.data?.click_action || '/assistances/alumno/reporte'

  self.registration.showNotification(title, {
    body,
    icon: '/android-icon-192x192.png',
    badge: '/android-icon-96x96.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: {
      url: clickPath,
    },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const clickPath = event.notification.data?.url || '/assistances/alumno/reporte'
  const targetUrl = new URL(clickPath, self.location.origin).href

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => clients.openWindow(targetUrl))
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }

      return null
    }),
  )
})
