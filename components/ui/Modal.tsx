"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  className = ""
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let maxWidthClass = "max-w-md";
  if (maxWidth === "sm") maxWidthClass = "max-w-sm";
  else if (maxWidth === "lg") maxWidthClass = "max-w-lg";
  else if (maxWidth === "xl") maxWidthClass = "max-w-xl";
  else if (maxWidth === "2xl") maxWidthClass = "max-w-2xl";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={onClose}
        className="fixed inset-0"
        aria-hidden="true"
      />

      <div
        className={`relative w-full ${maxWidthClass} bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-150 ${className}`}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-[#EEF2F6]">
          <div>
            <h3 className="font-bold text-[#172033] text-sm sm:text-base leading-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[#64748B] mt-0.5 leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="p-3.5 bg-[#FAF7F2] border-t border-[#EEF2F6] flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
