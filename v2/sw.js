/* JACKED v2 — service worker propriu (scope: folderul v2/). Cache separat de v1. */
const CACHE = "jacked2-v1";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "data.js",
  "videos.js",
  "engine.js",
  "ui.js",
  "app.js",
  "manifest.webmanifest",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-180.png",
  "assets/icon-maskable-512.png",
  "assets/barlow-500-latin.woff2",
  "assets/barlow-500-latin-ext.woff2",
  "assets/barlow-600-latin.woff2",
  "assets/barlow-600-latin-ext.woff2",
  "assets/barlow-700-latin.woff2",
  "assets/barlow-700-latin-ext.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith("jacked2-v") && k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// stale-while-revalidate: răspuns instant din cache, actualizare în fundal pentru următoarea deschidere
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // YouTube etc. merg direct la rețea
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request).then(res => {
        if (res && res.ok) c.put(e.request, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
