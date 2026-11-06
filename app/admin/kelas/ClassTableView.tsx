"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Edit2, UserCheck, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export interface EnrichedClassStudent {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  currentScore: number;
}

export interface EnrichedClassItem {
  id: string;
  name: string;
  gender: "Putra" | "Putri";
  waliKelas: string;
  guruId: string;
  pendampingWali?: string;
  pendampingId?: string;
  asistenWali?: string[];
  teacherAvatarUrl?: string;
  teacherInitials: string;
  studentCount: number;
  avgScore: number;
  asrama?: string;
  students?: EnrichedClassStudent[];
}

interface ClassTableViewProps {
  classes: EnrichedClassItem[];
  safePage: number;
  pageSize: number;
  activeDropdownId: string | null;
  onToggleDropdown: (name: string | null) => void;
  onOpenEditClass: (cls: EnrichedClassItem) => void;
  onOpenEditWali: (cls: EnrichedClassItem) => void;
  onDeleteClass: (name: string) => void;
  isBulkDeleteMode?: boolean;
  selectedClassNames?: string[];
  onToggleSelectClass?: (name: string) => void;
  onSelectAllClasses?: () => void;
}

export function ClassTableView({
  classes,
  safePage,
  pageSize,
  activeDropdownId,
  onToggleDropdown,
  onOpenEditClass,
  onOpenEditWali,
  onDeleteClass,
  isBulkDeleteMode = false,
  selectedClassNames = [],
  onToggleSelectClass,
  onSelectAllClasses
}: ClassTableViewProps) {
  const router = useRouter();
  const formatDecimal = (val: number) => val.toFixed(3).replace(".", ",");

  return (
    <div className="mizan-card overflow-hidden bg-white border border-[#E2EBF4]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E2EBF4] bg-[#F8FAFC] text-[#64748B] font-bold text-[10px] uppercase tracking-wider">
              {isBulkDeleteMode && (
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={classes.length > 0 && classes.every((c) => selectedClassNames.includes(c.name))}
                    onChange={onSelectAllClasses}
                    className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer"
                  />
                </th>
              )}
              <th className="py-3 px-3.5 w-12 text-center">No</th>
              <th className="py-3 px-3.5">Nama Kelas</th>
              <th className="py-3 px-3.5 text-center">Gender</th>
              <th className="py-3 px-3.5">Wali Kelas</th>
              <th className="py-3 px-3.5 text-center">Jumlah Santri</th>
              <th className="py-3 px-3.5 text-center">Rata-rata Skor</th>
              <th className="py-3 px-3.5 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2EBF4]">
            {classes.map((cls, idx) => (
              <tr
                key={cls.name}
                onClick={() => router.push(`/admin/kelas/${cls.name}`)}
                className="hover:bg-[#FAF7EE]/60 transition-colors cursor-pointer group"
              >
                {isBulkDeleteMode && (
                  <td
                    className="py-3.5 px-3.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClassNames.includes(cls.name)}
                      onChange={() => onToggleSelectClass?.(cls.name)}
                      className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer"
                    />
                  </td>
                )}
                <td className="py-3.5 px-3.5 text-center font-mono font-bold text-[#64748B]">
                  {(safePage - 1) * pageSize + idx + 1}
                </td>
                <td className="py-3.5 px-3.5">
                  <span className="font-mono font-black text-base text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                    {cls.name}
                  </span>
                </td>
                <td className="py-3.5 px-3.5 text-center">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      cls.gender === "Putra"
                        ? "bg-[#ECFDF5] text-[#065F46]"
                        : "bg-[#FAF7EE] text-[#A8833E]"
                    }`}
                  >
                    {cls.gender === "Putra" ? "L" : "P"}
                  </span>
                </td>
                <td className="py-3.5 px-3.5">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={cls.teacherAvatarUrl}
                      initials={cls.teacherInitials}
                      size="md"
                      variant={cls.gender === "Putri" ? "gold" : "primary"}
                      className="w-11 h-11 shadow-2xs shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-bold text-[#172033] text-xs sm:text-sm truncate">
                        {cls.waliKelas}
                      </p>
                      {cls.pendampingWali && (
                        <p className="text-[11px] text-[#065F46] font-semibold truncate flex items-center gap-1">
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 border border-emerald-200">Pendamping</span>
                          <span>{cls.pendampingWali}</span>
                        </p>
                      )}
                      {cls.asistenWali && cls.asistenWali.length > 0 && (
                        <p className="text-[10px] text-[#64748B] truncate" title={cls.asistenWali.join(", ")}>
                          <span className="font-bold text-[#A8833E]">{cls.asistenWali.length} Asisten:</span> {cls.asistenWali.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3.5 text-center">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-[#EEF2F6] text-[#475569]">
                    {cls.studentCount} Santri
                  </span>
                </td>
                <td className="py-3.5 px-3.5 text-center">
                  <span className="font-mono font-black text-sm text-[#1B4D3E] bg-[#ECFDF5] px-2.5 py-1 rounded-xl">
                    {formatDecimal(cls.avgScore)}
                  </span>
                </td>
                <td
                  className="py-3.5 px-3.5 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDropdown(activeDropdownId === cls.name ? null : cls.name);
                      }}
                      className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#EEF2F6] transition-colors cursor-pointer"
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
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[#94A3B8]">
                  Tidak ada kelas yang cocok dengan pencarian
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
