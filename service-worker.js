const REPO_NAME = '/sleep-calculator'; // GitHub Pages repository name
const CACHE_NAME = 'sleep-calculator-v3'; // Increment version
const OFFLINE_URL = `${REPO_NAME}/404.html`;

// All paths must include repository name
const STATIC_ASSETS = [
  `${REPO_NAME}/`,
  `${REPO_NAME}/index.html`,
  `${REPO_NAME}/css/style.css`,
  `${REPO_NAME}/js/script.js`,
  `${REPO_NAME}/images/preview-image.jpg`,
  `${REPO_NAME}/images/favicon/android-chrome-192x192.png`,
  `${REPO_NAME}/images/favicon/android-chrome-512x512.png`,
  `${REPO_NAME}/404.html`,
  `${REPO_NAME}/site.webmanifest`
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cache => {
        if (cache !== CACHE_NAME) return caches.delete(cache);
      })
    )).then(() => self.clients.claim())
  );
});

// Fetch Event (Stale-While-Revalidate strategy)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Handle same-origin requests only
  if (requestUrl.origin !== location.origin) return;

  // Navigation fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(`${REPO_NAME}/index.html`)
        .then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Cache-first for assets
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const fetched = fetch(event.request)
          .then(network => {
            const clone = network.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return network;
          });
        return cached || fetched;
      })
      .catch(() => caches.match(OFFLINE_URL))
  );
});