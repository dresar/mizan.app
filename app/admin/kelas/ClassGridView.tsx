"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Edit2, UserCheck, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EnrichedClassItem } from "./ClassTableView";

interface ClassGridViewProps {
  classes: EnrichedClassItem[];
  activeDropdownId: string | null;
  onToggleDropdown: (name: string | null) => void;
  onOpenEditClass: (cls: EnrichedClassItem) => void;
  onOpenEditWali: (cls: EnrichedClassItem) => void;
  onDeleteClass: (name: string) => void;
}

export function ClassGridView({
  classes,
  activeDropdownId,
  onToggleDropdown,
  onOpenEditClass,
  onOpenEditWali,
  onDeleteClass
}: ClassGridViewProps) {
  const router = useRouter();
  const formatDecimal = (val: number) => val.toFixed(3).replace(".", ",");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {classes.map((cls) => (
        <div
          key={cls.name}
          onClick={() => router.push(`/admin/kelas/${cls.name}`)}
          className="p-4 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between bg-white border-[#E2EBF4] hover:border-[#1B4D3E]/40 hover:shadow-md space-y-3"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-lg font-serif font-black text-[#172033]">
                  Kelas {cls.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      cls.gender === "Putra"
                        ? "bg-[#ECFDF5] text-[#065F46]"
                        : "bg-[#FAF7EE] text-[#A8833E]"
                    }`}
                  >
                    {cls.gender}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {cls.studentCount} Santri
                  </span>
                </div>
              </div>

              <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleDropdown(activeDropdownId === cls.name ? null : cls.name);
                  }}
                  className="p-1.5 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#EEF2F6] transition-colors cursor-pointer"
                  aria-label="Aksi"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeDropdownId === cls.name && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1 w-32 rounded-2xl bg-white shadow-xl border border-[#E2EBF4] p-1.5 z-30"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onToggleDropdown(null);
                        router.push(`/admin/kelas/${cls.name}`);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#1B4D3E] hover:bg-[#ECFDF5] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEditClass(cls);
                        onToggleDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#A8833E] hover:bg-[#FAF7EE] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEditWali(cls);
                        onToggleDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Wali</span>
                    </button>
                    <div className="my-1 border-t border-[#F1F5F9]" />
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteClass(cls.name);
                        onToggleDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar
                src={cls.teacherAvatarUrl}
                initials={cls.teacherInitials}
                size="md"
                variant={cls.gender === "Putri" ? "gold" : "primary"}
                className="w-12 h-12 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-[#172033] text-sm truncate">
                  {cls.waliKelas}
                </p>
                <p className="text-[10px] text-[#64748B]">
                  Wali Pembina
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between font-mono">
            <span className="text-[10px] text-[#64748B] font-bold">Rata-Rata Skor</span>
            <span className="text-sm font-black text-[#1B4D3E] bg-[#ECFDF5] px-2 py-0.5 rounded-lg">
              {formatDecimal(cls.avgScore)}
            </span>
          </div>
        </div>
      ))}
      {classes.length === 0 && (
        <div className="col-span-full py-12 text-center text-xs text-[#94A3B8]">
          Tidak ada kelas yang cocok dengan pencarian
        </div>
      )}
    </div>
  );
}
