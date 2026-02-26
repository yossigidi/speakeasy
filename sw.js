const CACHE_NAME = 'speakli-v18';
const STATIC_CACHE = 'speakli-static-v18';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache essential files and skip waiting immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Speakli: Caching app shell');
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - delete ALL old caches and claim clients
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Speakli: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
      .then(() => {
        // Notify all clients to refresh
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
        });
      })
  );
});

// Fetch event - NETWORK FIRST for everything (prevents stale cache issues)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests, API calls, and range requests (audio streaming)
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/') || event.request.headers.get('range')) {
    return;
  }

  // Network first with cache fallback for ALL requests
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a copy of successful responses (skip partial 206 responses)
        if (response.ok && response.status !== 206) {
          const clone = response.clone();
          const cacheName = url.pathname.match(/\.(js|css|png|jpg|svg|woff2?|mp3)$/)
            ? STATIC_CACHE
            : CACHE_NAME;
          caches.open(cacheName).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // For navigation requests, serve cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Push notification handler - works even when app is closed
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : 'Time to practice English!' };
  }
  const title = data.title || 'Speakli';
  const options = {
    body: data.body || 'Time to practice English!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    dir: data.lang === 'he' ? 'rtl' : 'ltr',
    lang: data.lang || 'he',
    tag: data.tag || 'speakli-push',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler - opens app when user taps notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});
