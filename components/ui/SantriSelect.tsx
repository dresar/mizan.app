"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, User } from "lucide-react";
import { Avatar } from "./Avatar";
import { Santri } from "@/lib/mock-data";

export interface SantriSelectProps {
  santriList: Santri[];
  value: string;
  onChange: (santriId: string, santri?: Santri) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  renderExtra?: (santri: Santri) => React.ReactNode;
}

export function SantriSelect({
  santriList,
  value,
  onChange,
  label,
  placeholder = "-- Pilih Santri --",
  required = false,
  disabled = false,
  error,
  className = "",
  renderExtra
}: SantriSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedSantri = useMemo(() => {
    return santriList.find((s) => s.id === value);
  }, [santriList, value]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return santriList;
    const q = searchQuery.toLowerCase();
    return santriList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        (s.asrama && s.asrama.toLowerCase().includes(q))
    );
  }, [santriList, searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (santri: Santri) => {
    onChange(santri.id, santri);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", undefined);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className={`relative w-full space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-[#172033]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full p-2.5 rounded-2xl bg-[#FAF7EE] border transition-all text-left flex items-center justify-between gap-3 ${
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-200"
            : isOpen
            ? "border-[#1B4D3E] ring-2 ring-[#1B4D3E]/20 bg-white"
            : "border-[#D4C9B5] hover:border-[#1B4D3E]/60"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selectedSantri ? (
            <>
              <Avatar
                src={selectedSantri.avatarUrl || (selectedSantri.gender === "Putri" ? "/default-avatar-ustadzah.jpg" : "/default-avatar-ustadz.jpg")}
                initials={selectedSantri.avatar}
                name={selectedSantri.name}
                gender={selectedSantri.gender}
                size="sm"
                variant={selectedSantri.gender === "Putri" ? "gold" : "primary"}
                className="w-9 h-9 shrink-0 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#172033] truncate">
                  {selectedSantri.name}
                </p>
                <p className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">
                  Kelas {selectedSantri.class} • NIS {selectedSantri.nis}
                  {selectedSantri.asrama ? ` • Asr: ${selectedSantri.asrama}` : ""}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 text-[#8A9BA8]">
              <div className="w-9 h-9 rounded-2xl bg-[#EDE7D9] flex items-center justify-center shrink-0 text-[#8A9BA8]">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">{placeholder}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[#8A9BA8]">
          {selectedSantri && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 hover:bg-[#EAE4D5] rounded-lg transition-colors cursor-pointer text-[#64748B]"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#1B4D3E]" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-[#D4C9B5] shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, kelas, NIS santri..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-semibold text-[#172033] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1B4D3E]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#172033]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {filteredList.length === 0 ? (
              <div className="p-4 text-center text-xs font-semibold text-[#94A3B8]">
                Santri tidak ditemukan
              </div>
            ) : (
              filteredList.map((santri) => {
                const isSelected = santri.id === value;
                return (
                  <button
                    key={santri.id}
                    type="button"
                    onClick={() => handleSelect(santri)}
                    className={`w-full p-2 rounded-xl flex items-center justify-between gap-3 text-left transition-all ${
                      isSelected
                        ? "bg-[#FAF7EE] border border-[#C5A059]/50 shadow-xs"
                        : "hover:bg-[#FAF7EE]/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        src={santri.avatarUrl || (santri.gender === "Putri" ? "/default-avatar-ustadzah.jpg" : "/default-avatar-ustadz.jpg")}
                        initials={santri.avatar}
                        name={santri.name}
                        gender={santri.gender}
                        size="sm"
                        variant={santri.gender === "Putri" ? "gold" : "primary"}
                        className="w-9 h-9 shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${
                          isSelected ? "text-[#1B4D3E]" : "text-[#172033]"
                        }`}>
                          {santri.name}
                        </p>
                        <p className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">
                          Kelas {santri.class} • NIS {santri.nis}
                          {santri.asrama ? ` • Asr: ${santri.asrama}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {renderExtra && renderExtra(santri)}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}
