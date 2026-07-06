// Zimazao service worker — enables "Add to Home Screen" + basic offline shell.
const CACHE = "zimazao-v1";
const SHELL = ["/", "/manifest.json", "/favicon.svg", "/icon-192x192.png", "/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Never cache the API — always go to network.
  if (req.method !== "GET" || new URL(req.url).pathname.startsWith("/api/")) return;

  // Navigation requests: network-first, fall back to cached shell when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/").then((r) => r || Response.error())),
    );
    return;
  }

  // Static assets: cache-first, then network (and cache it).
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached),
    ),
  );
});
