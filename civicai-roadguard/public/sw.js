const CACHE_NAME = 'civicai-roadguard-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/camera.js',
  '/js/detection.js',
  '/js/geolocation.js',
  '/js/audio.js',
  '/js/v2x.js',
  '/js/incident.js',
  '/js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
