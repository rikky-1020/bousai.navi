/* ============================================================
   東京防災ナビ — Service Worker v3
   GitHub Pages対応 (サブパス自動検出)
   Cache strategy:
     Shell (HTML/CSS/JS) : Cache First  → 24h
     OSM tiles           : Cache First  → 30 days
     External APIs       : Network First → 10 min cache fallback
============================================================ */
const VER        = 'bousai-v5';
const TILE_CACHE = 'bousai-tiles-v5';
const API_CACHE  = 'bousai-api-v5';

// GitHub Pages: sw.js は /repo/ 直下に置かれるのでそこを scope にする
const BASE = self.registration.scope;

const SHELL_URLS = [
  BASE,
  BASE + 'index.html',
  BASE + 'app.css',
  BASE + 'app.js',
  BASE + 'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
];

const TILE_HOSTS = ['tile.openstreetmap.org'];
const API_HOSTS  = [
  'overpass-api.de',
  'router.project-osrm.org',
  'nominatim.openstreetmap.org',
  'opendata.metro.tokyo.lg.jp',   // 東京都オープンデータ
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VER)
      .then(c => c.addAll(SHELL_URLS).catch(err => console.warn('[SW] shell partial:', err)))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => ![VER, TILE_CACHE, API_CACHE].includes(k))
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (TILE_HOSTS.some(h => url.hostname.includes(h))) {
    e.respondWith(cacheFirst(e.request, TILE_CACHE, 60 * 24 * 30));
    return;
  }
  if (API_HOSTS.some(h => url.hostname.includes(h))) {
    e.respondWith(networkFirst(e.request, API_CACHE, 60 * 10));
    return;
  }
  if (e.request.mode === 'navigate') {
    e.respondWith(cacheFirst(e.request, VER, 60 * 60 * 24));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(cacheFirst(e.request, VER, 60 * 60 * 24));
    return;
  }
});

// ── Strategies ────────────────────────────────────────────────
async function cacheFirst(req, cacheName, maxAgeSec) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) {
    const date = cached.headers.get('date');
    if (!date || (Date.now() - new Date(date).getTime()) / 1000 < maxAgeSec) {
      return cached;
    }
  }
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(req, cacheName, maxAgeSec) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(req);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ── Update notification ───────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
