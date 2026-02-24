const CACHE_NAME = 'nss-portal-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/nss-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(urlsToCache.map(url => cache.add(url)));
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Add this: Let API calls bypass the service worker entirely
  if (event.request.url.includes('localhost:5000')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/nss-logo.png',
    badge: '/nss-logo.png',
    tag: 'nss-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('NSS Portal', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle messages from client
self.addEventListener('message', (event) => {
  // Ensure we always respond to message events
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Send a response to prevent the message channel closed error
  if (event.ports && event.ports.length > 0) {
    event.ports[0].postMessage({ success: true });
  }
});