// @ts-nocheck
// Service Worker for KLIP PWA

const CACHE_NAME = 'klip-v2';
const urlsToCache = [
    '/manifest.json',
    '/logo.png',
    '/logo-192x192.png',
    '/logo-512x512.png',
];

// Install event - cache essential files
self.addEventListener('install', (/** @type {ExtendableEvent} */ event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    // @ts-ignore
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (/** @type {ExtendableEvent} */ event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // @ts-ignore
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (/** @type {FetchEvent} */ event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Don't cache if not a valid response
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache static assets only (images, fonts, etc.)
                if (
                    event.request.url.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
                ) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }

                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request);
            })
    );
});
