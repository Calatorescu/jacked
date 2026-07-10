const CACHE = "jacked-v2";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "data.js",
  "manifest.webmanifest",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-180.png",
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
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// stale-while-revalidate: răspunde instant din cache (offline-friendly),
// dar aduce în fundal versiunea nouă pentru următoarea deschidere
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // YouTube etc. — direct la rețea
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
