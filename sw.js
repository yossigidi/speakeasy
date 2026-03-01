const CACHE_NAME = 'speakli-v62';
const STATIC_CACHE = 'speakli-static-v62';

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
    .catch(err => {
      console.error('Speakli: SW install failed:', err);
    })
  );
});

// Activate event - delete ALL old caches, claim clients, force reload
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
    })
    .then(() => self.clients.claim())
    .then(() => {
      // Force ALL open clients to reload with fresh content
      return self.clients.matchAll({ type: 'window' });
    })
    .then(windowClients => {
      windowClients.forEach(client => {
        try {
          client.navigate(client.url);
        } catch (e) {
          client.postMessage({ type: 'SW_UPDATED' });
        }
      });
    })
  );
});

// Fetch event - NETWORK FIRST with cache-busting for HTML
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests, API calls, and range requests (audio streaming)
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/') || event.request.headers.get('range')) {
    return;
  }

  // For navigation requests (HTML pages): bypass HTTP cache entirely
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // For all other requests: network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && response.status !== 206) {
          const clone = response.clone();
          const cacheName = url.pathname.match(/\.(js|css|png|jpg|webp|svg|woff2?|mp3)$/)
            ? STATIC_CACHE
            : CACHE_NAME;
          caches.open(cacheName).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Push notification handler
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

// Notification click handler
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
