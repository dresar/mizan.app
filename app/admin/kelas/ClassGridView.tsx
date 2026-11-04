"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  Edit2,
  UserCheck,
  Trash2,
  Building2,
  GraduationCap
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {classes.map((cls) => {
        const predikat = getPredikatBadge(cls.avgScore);
        const sampleStudents = cls.students || [];
        const remainingCount = Math.max(0, cls.studentCount - sampleStudents.length);

        return (
          <div
            key={cls.name}
            onClick={() => router.push(`/admin/kelas/${cls.name}`)}
            className="group relative rounded-3xl overflow-hidden bg-white border border-[#E2EBF4] shadow-xs hover:shadow-2xl hover:border-[#1B4D3E]/40 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between cursor-pointer text-left"
          >
            <div className="sheen-wrapper relative w-full aspect-square overflow-hidden bg-slate-100 shrink-0">
              {cls.teacherAvatarUrl ? (
                <img
                  src={cls.teacherAvatarUrl}
                  alt={cls.waliKelas}
                  className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              ) : (
                <div
                  className={`w-full h-full flex flex-col items-center justify-center p-6 text-center select-none ${
                    cls.gender === "Putri"
                      ? "bg-gradient-to-br from-[#FAF7EE] via-[#F3EBD8] to-[#E8DCBF]"
                      : "bg-gradient-to-br from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0]"
                  }`}
                >
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-xl font-serif font-black text-[#1B4D3E] border border-[#C5A059]/40 group-hover:scale-110 transition-transform duration-500">
                    {cls.teacherInitials}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#1B4D3E]/70 mt-3 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Wali Kelas
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
            </div>

            <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-white space-y-3.5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20">
                      Kelas {cls.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        cls.gender === "Putra"
                          ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                          : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                      }`}
                    >
                      {cls.gender}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${predikat.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${predikat.dotColor} animate-pulse`} />
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
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#C5A059] block">
                    Wali Kelas
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-[#172033] group-hover:text-[#1B4D3E] transition-colors truncate">
                    {cls.waliKelas}
                  </h4>
                  <p className="text-xs text-[#64748B] flex items-center gap-1.5 pt-0.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span className="truncate">
                      {cls.asrama || "Asrama Binaan"} • {cls.studentCount} Santri
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2EBF4] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                    Santri Binaan
                  </span>
                  <div className="flex -space-x-2 overflow-visible">
                    {sampleStudents.slice(0, 3).map((st) => (
                      <div
                        key={st.id}
                        title={st.name}
                        className="relative inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover shadow-xs transition-transform duration-200 hover:-translate-y-1 hover:scale-125 hover:z-20 cursor-pointer overflow-hidden bg-slate-200"
                      >
                        {st.avatarUrl ? (
                          <img
                            src={st.avatarUrl}
                            alt={st.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#FAF7EE] text-[#A8833E] text-[8px] font-bold">
                            {st.avatar}
                          </div>
                        )}
                      </div>
                    ))}
                    {sampleStudents.length === 0 && (
                      <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 text-slate-400 text-[8px] font-bold flex items-center justify-center">
                        0
                      </div>
                    )}
                    {remainingCount > 0 && (
                      <div className="relative inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#1B4D3E] text-white text-[9px] font-black flex items-center justify-center shadow-xs transition-transform duration-200 hover:-translate-y-1 hover:scale-125 hover:z-20 cursor-pointer">
                        +{remainingCount}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                    Rata-Rata
                  </span>
                  <span className="text-xs font-mono font-black text-[#1B4D3E] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-xl shadow-xs inline-block">
                    {formatDecimal(cls.avgScore)}
                  </span>
                </div>
              </div>

              <div
                className="grid grid-cols-3 gap-1.5 pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => router.push(`/admin/kelas/${cls.name}`)}
                  className="py-2 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] text-xs font-bold text-center transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  Detail
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEditClass(cls)}
                  className="py-2 rounded-xl bg-[#FAF7EE] text-[#A8833E] hover:bg-[#F3EBD8] border border-[#C5A059]/40 text-xs font-bold text-center transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEditWali(cls)}
                  className="py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-center transition-all shadow-xs active:scale-95 cursor-pointer"
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
