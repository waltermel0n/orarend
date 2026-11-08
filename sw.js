// Heti órarend – offline gyorsítótár
const CACHE = "orarend-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const put = r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; };
  if (u.origin === location.origin) {
    // saját fájlok: előbb a hálózat (így a frissítés azonnal látszik), offline a tárolt példány
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
  } else if (u.hostname === "www.gstatic.com") {
    // Firebase könyvtárak: verziózottak, tárolt példány elég
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(put)));
  }
});
