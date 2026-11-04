"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("#") ||
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          if (url.pathname !== window.location.pathname) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsVisible(true);
            setProgress(30);

            let current = 30;
            timerRef.current = setInterval(() => {
              current = Math.min(current + (85 - current) * 0.25, 88);
              setProgress(current);
            }, 100);
          }
        }
      } catch {
        void 0;
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 180);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!isVisible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none overflow-hidden">
      <div
        className="h-full mizan-top-progress transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 120ms ease-out, opacity 180ms ease-out" : "width 150ms ease-out"
        }}
      />
    </div>
  );
}
