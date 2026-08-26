const CACHE_NAME = 'roamadic-mechanic-v23';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './rm-enhancements.js',
  './supabase-auth.js',
  './dashboard-redesign.js',
  './invoice/',
  './invoice/index.html',
  './estimate/',
  './estimate/index.html',
  './oil-change/',
  './oil-change/index.html',
  './vehicle-inspection/',
  './vehicle-inspection/index.html',
  './brake-job/',
  './brake-job/index.html',
  '/icons/hub/icon-192.png',
  '/icons/hub/icon-512.png',
  '/icons/hub/icon-192-maskable.png',
  '/icons/hub/icon-512-maskable.png',
  '/icons/hub/favicon.png',
  '/icons/hub/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(ASSETS.map(function (url) {
        return fetch(url, { cache: 'no-store' }).then(function (response) {
          if (response && response.status === 200) return cache.put(url, response);
        }).catch(function () {});
      }));
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      const networkFetch = fetch(event.request, { cache: 'no-store' }).then(function (response) {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        }
        return response;
      }).catch(function () { return cached; });
      return cached || networkFetch;
    })
  );
});
