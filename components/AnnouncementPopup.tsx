"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bell,
  BookOpen,
  AlertCircle,
  X,
  Check,
  Building2
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

export function AnnouncementPopup() {
  const { settings, activeRole } = useMizan();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!settings?.popupActive) {
      setIsOpen(false);
      return;
    }

    if (!settings.popupTitle && !settings.popupMessage) {
      setIsOpen(false);
      return;
    }

    if (settings.popupTarget && settings.popupTarget !== "Semua") {
      if (settings.popupTarget === "GURU" && activeRole !== "GURU") {
        setIsOpen(false);
        return;
      }
      if (settings.popupTarget === "PENGASUHAN" && activeRole !== "PENGASUHAN") {
        setIsOpen(false);
        return;
      }
    }

    const versionKey = settings.popupUpdatedAt || `${settings.popupTitle}_${settings.popupMessage?.substring(0, 20)}`;
    const dismissedKey = `mizan_popup_dismissed_${versionKey}`;

    try {
      const isDismissed = sessionStorage.getItem(dismissedKey);
      if (!isDismissed) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, [settings, activeRole]);

  const handleClose = () => {
    const versionKey = settings?.popupUpdatedAt || `${settings?.popupTitle}_${settings?.popupMessage?.substring(0, 20)}`;
    const dismissedKey = `mizan_popup_dismissed_${versionKey}`;
    try {
      sessionStorage.setItem(dismissedKey, "1");
    } catch {
      void 0;
    }
    setIsOpen(false);
  };

  if (!isOpen || !settings?.popupActive) return null;

  const type = settings.popupType || "Nasihat";
  const icon =
    type === "Nasihat" ? (
      <Sparkles className="w-5 h-5 text-[#C5A059]" />
    ) : type === "Pengumuman" ? (
      <Bell className="w-5 h-5 text-[#1B4D3E]" />
    ) : type === "Tausiyah" ? (
      <BookOpen className="w-5 h-5 text-[#A8833E]" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-600" />
    );

  const badgeColor =
    type === "Nasihat"
      ? "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/30"
      : type === "Pengumuman"
      ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
      : type === "Tausiyah"
      ? "bg-[#FDF4FF] text-[#86198F] border-[#F0ABFC]"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#C5A059]/40 relative space-y-4 animate-scaleUp overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#1B4D3E] via-[#C5A059] to-[#1B4D3E]" />

        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 flex items-center justify-center shrink-0 shadow-2xs">
              {icon}
            </div>
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${badgeColor}`}>
                {type}
              </span>
              <p className="text-[10px] text-[#94A3B8] font-bold mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {settings.popupSender || "Pimpinan Pesantren"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#172033] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 border-y border-[#F1F5F9] py-3.5 max-h-[55vh] overflow-y-auto pr-1">
          <h2 className="text-base sm:text-lg font-serif font-black text-[#172033] leading-snug">
            {settings.popupTitle || "Pemberitahuan"}
          </h2>
          <div className="text-xs text-[#475569] leading-relaxed whitespace-pre-line font-medium">
            {settings.popupMessage}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-[10px] text-[#94A3B8] italic truncate">
            Pesantren Modern Raudhatussalam Mahato
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
