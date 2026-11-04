"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewModeToggle({
  mode,
  onChange,
  className = ""
}: ViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Tampilan mode"
      className={`inline-flex items-center rounded-lg bg-[#EEF2F6] p-0.5 border border-[#E2E8F0]/60 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label="Tampilan kisi"
        aria-pressed={mode === "grid"}
        className={`inline-flex items-center justify-center p-1.5 rounded-[6px] text-xs transition-all ${
          mode === "grid"
            ? "bg-white text-[#1B4D3E] shadow-2xs font-bold"
            : "text-[#64748B] hover:text-[#172033]"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label="Tampilan daftar"
        aria-pressed={mode === "list"}
        className={`inline-flex items-center justify-center p-1.5 rounded-[6px] text-xs transition-all ${
          mode === "list"
            ? "bg-white text-[#1B4D3E] shadow-2xs font-bold"
            : "text-[#64748B] hover:text-[#172033]"
        }`}
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
