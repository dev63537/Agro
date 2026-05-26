/* ============================================================
   Agro Billing SaaS — Service Worker  (#20 PWA)
   Strategy:
     - App shell (HTML/JS/CSS): Cache-first, fallback to network
     - API calls (/api/*): Network-first, fallback to cache (stale)
     - Static assets: Cache-first
============================================================ */

const CACHE_NAME      = 'agro-billing-v1';
const APP_SHELL_CACHE = 'agro-shell-v1';
const API_CACHE       = 'agro-api-v1';

const SHELL_URLS = [
  '/',
  '/index.html',
  '/shop',
  '/shop/billing',
  '/shop/farmers',
  '/shop/dashboard',
];

// ── Install: cache the app shell ─────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_URLS).catch((err) => {
        console.warn('[SW] Shell cache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: clear old caches ───────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== APP_SHELL_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: routing strategy ──────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // API calls — network-first, stale fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Everything else — cache-first
  event.respondWith(cacheFirstWithNetwork(request));
});

async function networkFirstWithCache(request, cacheName) {
  try {
    const networkRes = await fetch(request.clone());
    if (networkRes.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline — cached data unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkRes = await fetch(request.clone());
    if (networkRes.ok) {
      const cache = await caches.open(APP_SHELL_CACHE);
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  } catch {
    // Return offline page if navigation request
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/index.html');
      if (offlinePage) return offlinePage;
    }
    return new Response('Offline', { status: 503 });
  }
}
