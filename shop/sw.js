const CACHE_NAME = 'roamadic-mechanic-v21';
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
      // Fetch each asset explicitly with cache:'no-store' rather than cache.addAll() (which
      // uses the browser's default HTTP caching) so a fresh install always pulls real
      // current content instead of whatever GitHub Pages' CDN had the browser cache.
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

// Stale-while-revalidate: serve from cache instantly when available (works fully offline),
// and refresh the cache in the background whenever there's a signal, so the next open picks
// up any update without ever blocking on the network. The revalidation fetch uses
// cache:'no-store' so it always reaches the real network/CDN instead of silently re-reading
// whatever the browser's own HTTP cache already had stored — otherwise a page can stay
// stuck showing an old version indefinitely even though the SW "revalidates" every load.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  // Always fetch full HTML navigations directly. Some mobile browsers can retain the
  // response's compression header when restoring a large cached document, then decode
  // its body a second time and display binary-looking text instead of the ticket form.
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


