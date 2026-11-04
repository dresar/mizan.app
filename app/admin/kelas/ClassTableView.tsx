"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Edit2, UserCheck, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export interface EnrichedClassItem {
  id: string;
  name: string;
  gender: "Putra" | "Putri";
  waliKelas: string;
  guruId: string;
  teacherAvatarUrl?: string;
  teacherInitials: string;
  studentCount: number;
  avgScore: number;
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
}

export function ClassTableView({
  classes,
  safePage,
  pageSize,
  activeDropdownId,
  onToggleDropdown,
  onOpenEditClass,
  onOpenEditWali,
  onDeleteClass
}: ClassTableViewProps) {
  const router = useRouter();
  const formatDecimal = (val: number) => val.toFixed(3).replace(".", ",");

  return (
    <div className="mizan-card overflow-hidden bg-white border border-[#E2EBF4]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E2EBF4] bg-[#F8FAFC] text-[#64748B] font-bold text-[10px] uppercase tracking-wider">
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
                <td className="py-3.5 px-3.5 text-center font-mono font-bold text-[#64748B]">
                  {(safePage - 1) * pageSize + idx + 1}
                </td>
                <td className="py-3.5 px-3.5">
                  <span className="font-serif font-black text-base text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                    Kelas {cls.name}
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
                    {cls.gender}
                  </span>
                </td>
                <td className="py-3.5 px-3.5">
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
