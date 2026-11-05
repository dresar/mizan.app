const CACHE_NAME = "mizan-pwa-v2.2.0";
const PRECACHE_ASSETS = [
  "/",
  "/login",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/default-avatar.jpg",
  "/default-avatar-ustadz.jpg",
  "/default-avatar-ustadzah.jpg",
  "/default-avatar.svg",
  "/default-avatar-ustadz.svg",
  "/default-avatar-ustadzah.svg"
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
    if (url.pathname === "/api/data") {
      event.respondWith(
        fetch(event.request)
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
            return caches.match(event.request).then((cached) => {
              if (cached) return cached;
              return new Response(JSON.stringify({ success: true, offline: true, santri: [], users: [] }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
              });
            });
          })
      );
      return;
    }

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
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
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
    return;
  }

  const isNavigation =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone).catch(() => void 0);
                cache.put("/index.html", clone.clone()).catch(() => void 0);
              }).catch(() => void 0);
            }
            return networkResponse;
          })
          .catch(async () => {
            if (cachedResponse) {
              return cachedResponse;
            }
            const fallbackIndex = await caches.match("/index.html");
            if (fallbackIndex) return fallbackIndex;
            const fallbackLogin = await caches.match("/login");
            if (fallbackLogin) return fallbackLogin;
            const fallbackOffline = await caches.match("/offline.html");
            if (fallbackOffline) return fallbackOffline;
            return new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain" }
            });
          });

        return cachedResponse || fetchPromise;
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
