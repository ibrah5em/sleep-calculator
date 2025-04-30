// service-worker.js
const CACHE_NAME = 'sleep-calculator-v2'; // Increment version when updating assets
const OFFLINE_URL = '/404.html';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/images/preview-image.jpg',
  '/images/favicon/android-chrome-192x192.png',
  '/images/favicon/android-chrome-512x512.png',
  '/404.html',
  '/sitemap.xml',
  '/robots.txt',
  '/site.webmanifest'
];

// Install Event - Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch Event - Network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Cache successful network responses
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache then offline page
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || caches.match(OFFLINE_URL);
      })
  );
});