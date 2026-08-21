const CACHE_NAME = 'roamadic-vehicle-inspection-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  '/icons/vehicle-inspection/icon-192.png',
  '/icons/vehicle-inspection/icon-512.png',
  '/icons/vehicle-inspection/icon-192-maskable.png',
  '/icons/vehicle-inspection/icon-512-maskable.png',
  '/icons/vehicle-inspection/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).catch(function () {})
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

// Stale-while-revalidate: serve from cache instantly when available (works fully offline),
// and refresh the cache in the background whenever there's a signal, so the next open picks
// up any update without ever blocking on the network.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      const networkFetch = fetch(event.request).then(function (response) {
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
