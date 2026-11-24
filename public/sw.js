/**
 * Progressive Web App Offline Service Worker (Public Scope Mirror).
 * Implements Cache-First / Network-First asset differentiation,
 * query-flood defense, and atomic old-version eviction.
 *
 * @module public/sw
 */

const CACHE_NAME = 'countdown-lockscreen-ghpages-v2.0.0';

/**
 * Precache asset inventory ensuring 100% offline functionality.
 *
 * @type {readonly string[]}
 */
const PRECACHE_ASSETS = Object.freeze([
  './',
  './index.html',
  './src/index.html',
  './manifest.json',
  './src/css/tokens.css',
  './src/css/safe-zones.css',
  './src/css/glassmorphism.css',
  './src/js/app.js',
  './src/js/config/constants.js',
  './src/js/config/themes.js',
  './src/js/core/ports.js',
  './src/js/core/LifecycleScope.js',
  './src/js/core/errors.js',
  './src/js/core/StateStore.js',
  './src/js/core/DualClockTimeEngine.js',
  './src/js/core/MilestoneManager.js',
  './src/js/core/UrlStateService.js',
  './src/js/core/TokenBucketHistoryGuard.js',
  './src/js/core/InputSanitizer.js',
  './src/js/ai/GeminiAiClient.js',
  './src/js/ai/GeminiRateLimiter.js',
  './src/js/ai/HeuristicGenerator.js',
  './src/js/canvas/AdaptiveBufferAllocator.js',
  './src/js/canvas/ResponsiveLayoutEngine.js',
  './src/js/canvas/CanvasTextWrapper.js',
  './src/js/canvas/SafeZoneOverlay.js',
  './src/js/canvas/CanvasRenderer.js',
  './src/js/canvas/ParticleEngine.js',
  './src/js/services/WorkerTickerAdapter.js',
  './src/js/services/ResilientStorageService.js',
  './src/js/services/AudioChimeService.js',
  './src/js/services/FontService.js',
  './src/js/services/HapticService.js',
  './src/js/services/SensoryCoordinator.js'
]);

/**
 * Strips tracking and search parameters to prevent query-flood cache busting.
 *
 * @param {string} urlString Source URL string
 * @returns {string} Normalized URL path
 */
export function normalizeUrl(urlString) {
  try {
    const parsed = new URL(urlString, 'http://localhost');
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return urlString.split('?')[0];
  }
}

/**
 * Classifies the appropriate caching strategy for an incoming request.
 *
 * @param {Request | Object} request Network request object
 * @returns {'network-only' | 'network-first' | 'stale-while-revalidate'}
 */
export function classifyRequestStrategy(request) {
  const url = request.url || '';
  if (url.includes('generativelanguage.googleapis.com')) {
    return 'network-only';
  }
  if (request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    return 'network-first';
  }
  return 'stale-while-revalidate';
}

if (typeof self !== 'undefined' && 'addEventListener' in self) {
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          await cache.addAll(PRECACHE_ASSETS);
        } catch {}
        return self.skipWaiting();
      })
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then(async (cacheKeys) => {
        const deletions = cacheKeys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key));
        await Promise.all(deletions);
        return self.clients.claim();
      })
    );
  });

  self.addEventListener('fetch', (event) => {
    const strategy = classifyRequestStrategy(event.request);

    if (strategy === 'network-only') {
      return;
    }

    if (strategy === 'network-first') {
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return networkResponse;
          })
          .catch(() => caches.match(event.request).then((res) => res || caches.match('./index.html')))
      );
      return;
    }

    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cleanUrl = normalizeUrl(event.request.url);
        const cachedResponse = await cache.match(cleanUrl);

        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(cleanUrl, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
  });
}
