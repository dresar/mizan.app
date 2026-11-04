"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useMizan } from "@/lib/mizan-context";

export function InitialSplash() {
  const { isAuthLoading, settings } = useMizan();
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const appLogo = settings?.appLogoUrl || "/logo.png";

  useEffect(() => {
    try {
      const alreadyEntered = sessionStorage.getItem("mizan_entered_app");
      if (!alreadyEntered) {
        setShouldRender(true);
      }
    } catch {
      setShouldRender(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    if (!isAuthLoading) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const exitTimer = setTimeout(() => {
          setShouldRender(false);
          try {
            sessionStorage.setItem("mizan_entered_app", "1");
          } catch {
            void 0;
          }
        }, 320);
        return () => clearTimeout(exitTimer);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#FAF7EE] transition-all duration-300 ease-out ${
        isFadingOut ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
      }`}
      aria-live="polite"
      aria-label="Memuat Aplikasi"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(197,160,89,0.15)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col items-center text-center space-y-4 px-6 z-10 max-w-sm">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-[#C5A059]/50 animate-[spin_10s_linear_infinite]" />
          <div className="absolute -inset-1 rounded-3xl bg-[#1B4D3E]/10 blur-xs" />
          <div className="relative w-16 h-16 rounded-2xl bg-[#1B4D3E] p-2 flex items-center justify-center shadow-lg shadow-[#1B4D3E]/20">
            <Image
              src={appLogo}
              alt="Mizan Logo"
              width={56}
              height={56}
              className="w-full h-full object-contain"
              priority
              unoptimized
            />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-[#1B4D3E]">
            MIZAN
          </h1>
          <p className="text-[11px] font-bold text-[#A8833E] uppercase tracking-wider">
            Pesantren Modern Raudhatussalam Mahato
          </p>
        </div>

        <div className="w-48 space-y-2 pt-2">
          <div className="w-full h-1.5 bg-[#E2EBF4] rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-gradient-to-r from-[#1B4D3E] via-[#C5A059] to-[#10B981] rounded-full animate-[mizanProgressGlide_1.5s_ease-in-out_infinite] bg-[length:200%_200%]" />
          </div>
          <span className="text-[10px] text-[#64748B] block font-medium">
            Memuat sistem terpadu...
          </span>
        </div>
      </div>
    </div>
  );
}
