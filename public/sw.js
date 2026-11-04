const CACHE_NAME = "mizan-pwa-v1.0.9";
const PRECACHE_ASSETS = [
  "/login",
  "/manifest.json",
  "/favicon.ico",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cached) => {
          return (
            cached ||
            new Response(JSON.stringify({ error: "Offline" }), {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "application/json" }
            })
          );
        });
      })
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone).catch(() => void 0);
            }).catch(() => void 0);
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || new Response("", { status: 404, statusText: "Not Found" });
          });
        })
    );
    return;
  }

  const isHtmlOrRsc =
    event.request.mode === "navigate" ||
    event.request.headers.get("rsc") === "1" ||
    url.searchParams.has("_rsc") ||
    (event.request.headers.get("accept") || "").includes("text/x-component");

  if (isHtmlOrRsc) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && event.request.mode === "navigate") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone).catch(() => void 0);
            }).catch(() => void 0);
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return (
              cached ||
              caches.match("/login") ||
              new Response("Offline", {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "text/html" }
              })
            );
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone).catch(() => void 0);
            }).catch(() => void 0);
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response("", { status: 404, statusText: "Not Found" });
        });
    })
  );
});
