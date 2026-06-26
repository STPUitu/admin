const CACHE_NAME = 'stpu-admin-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Network-first untuk GAS API calls, cache-first untuk shell statik
self.addEventListener('fetch', function(event) {
  const url = event.request.url;

  // GAS API — sentiasa ambil data terkini, jangan cache
  if (url.indexOf('script.google.com') !== -1 || url.indexOf('script.googleusercontent.com') !== -1) {
    event.respondWith(
      fetch(event.request).catch(function() {
        const requestUrl = new URL(event.request.url);
        const callback = requestUrl.searchParams.get('callback');
        if (callback) {
          return new Response(
            callback + '(' + JSON.stringify({ success: false, error: 'Tiada sambungan internet.' }) + ')',
            { headers: { 'Content-Type': 'application/javascript' } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: 'Tiada sambungan internet.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Shell statik — cache-first
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
