"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

export function ToastContainer() {
  const { toasts, dismissToast } = useMizan();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex flex-col gap-1.5 max-w-[290px] sm:max-w-xs w-auto pointer-events-none"
      role="region"
      aria-label="Notifikasi"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl shadow-md border transition-all text-xs font-semibold ${
              isSuccess
                ? "bg-white border-[#1B4D3E]/30 text-[#065F46]"
                : isError
                ? "bg-white border-red-300 text-red-700"
                : "bg-white border-amber-300 text-[#172033]"
            }`}
          >
            <div className="shrink-0">
              {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />}
              {isError && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
              {!isSuccess && !isError && <Info className="w-3.5 h-3.5 text-[#A8833E]" />}
            </div>

            <div className="flex-1 text-[11px] leading-tight truncate">
              {toast.message}
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 p-0.5 rounded text-[#94A3B8] hover:text-[#172033]"
              aria-label="Tutup"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
