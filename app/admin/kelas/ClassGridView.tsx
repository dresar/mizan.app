"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  Edit2,
  UserCheck,
  Trash2,
  Building2
} from "lucide-react";
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
  const formatDecimal = (val: number) => val.toFixed(2).replace(".", ",");

  const getPredikatBadge = (score: number) => {
    if (score >= 85) {
      return {
        label: "Mumtaz",
        dotColor: "bg-[#C5A059]",
        badgeClass: "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
      };
    }
    if (score >= 75) {
      return {
        label: "Jayyid Jiddan",
        dotColor: "bg-[#10B981]",
        badgeClass: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
      };
    }
    if (score >= 65) {
      return {
        label: "Jayyid",
        dotColor: "bg-blue-500",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200"
      };
    }
    return {
      label: "Perhatian",
      dotColor: "bg-rose-500",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200"
    };
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {classes.map((cls) => {
        const predikat = getPredikatBadge(cls.avgScore);
        const defaultAvatar =
          cls.gender === "Putri"
            ? "/default-avatar-ustadzah.svg"
            : "/default-avatar-ustadz.svg";
        const teacherPhoto = cls.teacherAvatarUrl || defaultAvatar;

        return (
          <div
            key={cls.name}
            onClick={() => router.push(`/admin/kelas/${cls.name}`)}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E2EBF4] shadow-2xs hover:shadow-2xl hover:border-[#1B4D3E]/40 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between cursor-pointer text-left"
          >
            <div className="sheen-wrapper relative w-full aspect-square overflow-hidden bg-[#0E271F] shrink-0">
              <img
                src={teacherPhoto}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== defaultAvatar && !target.src.endsWith(defaultAvatar)) {
                    target.src = defaultAvatar;
                  }
                }}
                alt={cls.waliKelas}
                className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
            </div>

            <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 bg-white space-y-2.5">
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 truncate">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20 truncate">
                      Kelas {cls.name}
                    </span>
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[8px] sm:text-[10px] font-bold border shrink-0 ${
                        cls.gender === "Putra"
                          ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                          : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                      }`}
                    >
                      {cls.gender}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[8px] sm:text-[10px] font-bold border flex items-center gap-1 ${predikat.badgeClass}`}
                    >
                      <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${predikat.dotColor} animate-pulse`} />
                      {predikat.label}
                    </span>

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
                        className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#EEF2F6] transition-colors cursor-pointer"
                        aria-label="Aksi"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
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
                </div>

                <div>
                  <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-[#C5A059] block">
                    Wali Kelas
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-[#172033] group-hover:text-[#1B4D3E] transition-colors truncate mt-0.5">
                    {cls.waliKelas}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-[#64748B] flex items-center gap-1 pt-0.5 truncate">
                    <Building2 className="w-3 h-3 text-[#C5A059] shrink-0" />
                    <span>{cls.studentCount} Santri Terdaftar</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-[#64748B] font-medium">Rata-Rata</span>
                <span className="font-mono font-bold text-[#1B4D3E] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 sm:px-2 py-0.5 rounded-lg shadow-2xs">
                  {formatDecimal(cls.avgScore)}
                </span>
              </div>

              <div
                className="grid grid-cols-3 gap-1 pt-0.5 sm:pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => router.push(`/admin/kelas/${cls.name}`)}
                  className="py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] text-[10px] sm:text-xs font-bold text-center transition-all shadow-2xs active:scale-95 cursor-pointer truncate"
                >
                  Detail
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEditClass(cls)}
                  className="py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#FAF7EE] text-[#A8833E] hover:bg-[#F3EBD8] border border-[#C5A059]/40 text-[10px] sm:text-xs font-bold text-center transition-all shadow-2xs active:scale-95 cursor-pointer truncate"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEditWali(cls)}
                  className="py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-[10px] sm:text-xs font-bold text-center transition-all shadow-2xs active:scale-95 cursor-pointer truncate"
                >
                  Wali
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {classes.length === 0 && (
        <div className="col-span-full py-12 text-center text-xs text-[#94A3B8]">
          Tidak ada kelas yang cocok dengan pencarian
        </div>
      )}
    </div>
  );
}
