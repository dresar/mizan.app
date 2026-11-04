"use client";

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  count?: number;
  itemName?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Cari data...",
  count,
  itemName = "data",
  className = "",
  autoFocus = false
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        if (value) {
          onChange("");
          if (onClear) onClear();
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, onChange, onClear]);

  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3 text-[#94A3B8] pointer-events-none shrink-0">
        <Search className="w-4 h-4" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-9 rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-20 text-xs text-[#172033] font-medium outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E]/30"
      />

      <div className="absolute right-2.5 flex items-center gap-1.5">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Hapus pencarian"
            className="p-1 text-[#94A3B8] hover:text-[#172033] hover:bg-[#F1F5F9] rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {count !== undefined && !value && (
          <span className="text-[10px] font-mono font-bold text-[#64748B] bg-[#EEF2F6] px-1.5 py-0.5 rounded-md shrink-0">
            {count} {itemName}
          </span>
        )}
      </div>
    </div>
  );
}
