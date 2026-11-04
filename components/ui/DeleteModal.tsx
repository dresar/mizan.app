"use client";

import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Portal } from "./Portal";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  count?: number;
  isLoading?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Hapus Data",
  message,
  count,
  isLoading = false
}: DeleteModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
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
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          onClick={!isLoading ? onClose : undefined}
        />

        <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-xs">
            <Trash2 className="w-7 h-7 stroke-[1.8]" />
          </div>

          <div className="space-y-1.5 w-full">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-600 px-2 leading-relaxed">
              {message || (count && count > 1 ? `Yakin ingin menghapus ${count} data yang dipilih?` : "Yakin ingin menghapus data ini?")}
            </p>
            <p className="text-[11px] font-medium text-red-500 pt-0.5">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 active:scale-[0.98] shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Hapus</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
