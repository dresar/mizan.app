"use client";

import React, { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Portal } from "./ui/Portal";

export interface PhotoItem {
  id: string;
  name: string;
  subtitle?: string;
  tag?: string;
  photoUrl?: string;
  initials?: string;
  gender?: "Putra" | "Putri";
}

export interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PhotoItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function PhotoViewerModal({
  isOpen,
  onClose,
  items,
  currentIndex,
  onIndexChange
}: PhotoViewerModalProps) {
  const currentItem = items[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  }, [currentIndex, items.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentItem) return null;

  const defaultAvatar =
    currentItem.gender === "Putri"
      ? "/default-avatar-ustadzah.svg"
      : "/default-avatar-ustadz.svg";

  const resolvedPhoto = currentItem.photoUrl || defaultAvatar;

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      >
        <div
          onClick={onClose}
          className="fixed inset-0"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-sm sm:max-w-md w-full bg-[#111A24] rounded-3xl border border-white/15 p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
            <span className="font-mono text-[11px] font-bold text-white/70 bg-white/10 px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Pratinjau Foto"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#091017] flex items-center justify-center shrink-0">
            {resolvedPhoto ? (
              <img
                key={resolvedPhoto}
                src={resolvedPhoto}
                alt={currentItem.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== defaultAvatar && !target.src.endsWith(defaultAvatar)) {
                    target.src = defaultAvatar;
                  }
                }}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1B4D3E] to-[#0D241D] text-white">
                <span className="text-4xl sm:text-5xl font-black font-mono">
                  {currentItem.initials || "MZ"}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-1 w-full">
            <h3 className="text-base sm:text-lg font-bold font-serif text-white tracking-tight truncate">
              {currentItem.name}
            </h3>
            {currentItem.subtitle && (
              <p className="text-xs text-white/60 font-mono truncate">
                {currentItem.subtitle}
              </p>
            )}
            {currentItem.tag && (
              <div className="pt-1">
                <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#C5A059]/20 text-[#E5C98E] border border-[#C5A059]/40">
                  {currentItem.tag}
                </span>
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentIndex === 0
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= items.length - 1}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentIndex >= items.length - 1
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#1B4D3E] hover:bg-[#153e32] text-white shadow-md"
              }`}
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
