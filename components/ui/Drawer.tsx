"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "md"
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass =
    width === "lg"
      ? "md:max-w-xl"
      : width === "xl"
      ? "md:max-w-2xl"
      : "md:max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto flex max-h-[92vh] md:max-h-full">
        <div
          className={`w-full ${widthClass} bg-white shadow-2xl rounded-t-2xl md:rounded-t-none md:rounded-l-2xl flex flex-col overflow-hidden transform transition-transform duration-300 ease-out`}
        >
          <div className="w-12 h-1.5 bg-[#D4C9B5] rounded-full mx-auto mt-2.5 mb-1 md:hidden" />

          <div className="px-5 py-4 border-b border-[#E5DECE] flex items-start justify-between gap-3 bg-[#FAF7F2]">
            <div>
              <h2 id="drawer-title" className="text-base font-bold text-[#1C2826]">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[#5C6B64] mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5C6B64] hover:text-[#1C2826] hover:bg-[#EAE3D2] transition-colors"
              aria-label="Tutup panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
