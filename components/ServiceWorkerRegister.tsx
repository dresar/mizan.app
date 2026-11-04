"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const r of regs) r.unregister();
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const k of keys) caches.delete(k);
        });
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.update();
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        }
      });
    }).catch(() => {
      void 0;
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const reason = "reason" in event ? event.reason : event.error;
      const rawMsg = (
        ("message" in event && typeof event.message === "string" ? event.message : "") ||
        reason?.message ||
        String(reason || "")
      ).toLowerCase();

      if (
        rawMsg.includes("chunkloaderror") ||
        rawMsg.includes("failed to load chunk") ||
        rawMsg.includes("loading chunk") ||
        rawMsg.includes("failed to fetch dynamically imported module") ||
        rawMsg.includes("error loading dynamically imported module")
      ) {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            for (const r of regs) r.unregister();
          });
        }
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const k of keys) caches.delete(k);
          });
        }
        const reloadKey = "mizan_chunk_reload";
        const lastReload = sessionStorage.getItem(reloadKey);
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 3000) {
          sessionStorage.setItem(reloadKey, String(now));
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);

    const handleVisibilityUpdate = () => {
      if (!document.hidden && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.update();
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityUpdate);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
      document.removeEventListener("visibilitychange", handleVisibilityUpdate);
    };
  }, []);

  return null;
}
