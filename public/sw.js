self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Enrutamiento simple transparente para desarrollo y compatibilidad de Next.js
  event.respondWith(fetch(event.request));
});
