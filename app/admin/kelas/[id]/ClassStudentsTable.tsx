"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Users, Search, LayoutGrid, List } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import { Santri } from "@/lib/mock-data";

export interface ClassStudentsTableProps {
  classNameTitle: string;
  students: Santri[];
  studentMetricsMap: Map<string, { hasanahCount: number; sayyiahCount: number }>;
}

export function ClassStudentsTable({
  classNameTitle,
  students,
  studentMetricsMap
}: ClassStudentsTableProps) {
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const PAGE_SIZE = 20;

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.nis.includes(q)
    );
  }, [students, studentSearch]);

  useEffect(() => {
    setStudentPage(1);
  }, [studentSearch]);

  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const safeStudentPage = Math.min(Math.max(1, studentPage), totalStudentPages);
  const paginatedStudents = useMemo(() => {
    const start = (safeStudentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, safeStudentPage]);

  const formatDecimal = (val: number) => val.toFixed(3).replace(".", ",");

  return (
    <div className="mizan-card p-4 sm:p-5 bg-white border border-[#E2EBF4] space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#1B4D3E]" />
          <h2 className="text-sm font-serif font-black text-[#172033]">
            Daftar Santri Kelas {classNameTitle} ({filteredStudents.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri nama/NIS..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-full text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
            />
          </div>

          <div className="hidden md:flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#1B4D3E] shadow-2xs font-bold"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#1B4D3E] shadow-2xs font-bold"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
              title="Tampilan Tabel Lengkap"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#94A3B8]">
          Tidak ada santri yang cocok dengan pencarian di Kelas {classNameTitle}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:hidden">
            {paginatedStudents.map((santri, idx) => {
              const m = studentMetricsMap.get(santri.id) || { hasanahCount: 0, sayyiahCount: 0 };
              const rowNumber = (safeStudentPage - 1) * PAGE_SIZE + idx + 1;
              const defaultAvatar =
                santri.gender === "Putri"
                  ? "/default-avatar-ustadzah.jpg"
                  : "/default-avatar-ustadz.jpg";
              const santriPhoto = santri.avatar || defaultAvatar;

              return (
                <div
                  key={santri.id}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-[#E2EBF4] shadow-2xs hover:shadow-lg hover:border-[#1B4D3E]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left"
                >
                  <div className="sheen-wrapper relative w-full aspect-square overflow-hidden bg-[#FAF7EE] shrink-0">
                    <Avatar
                      src={santriPhoto}
                      initials={santri.name.slice(0, 2).toUpperCase()}
                      size="3xl"
                      gender={santri.gender}
                      variant={santri.gender === "Putri" ? "gold" : "primary"}
                      className="w-full h-full rounded-none"
                    />
                    <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-[#1B4D3E] shadow-xs">
                      #{rowNumber}
                    </span>
                    <span
                      className={`absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md text-[9px] font-bold border shadow-xs ${
                        santri.status === "Baik"
                          ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                          : santri.status === "Perhatian"
                          ? "bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]"
                          : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                      }`}
                    >
                      {santri.status}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
                  </div>

                  <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[9px] font-mono font-bold text-[#C5A059] block truncate">
                          NIS: {santri.nis}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${
                            santri.gender === "Putri"
                              ? "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                              : "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                          }`}
                        >
                          {santri.gender === "Putri" ? "P" : "L"}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-[#172033] group-hover:text-[#1B4D3E] transition-colors truncate">
                        {santri.name}
                      </h4>
                    </div>

                    <div className="p-1.5 rounded-xl bg-[#FAF7EE] border border-[#E8DFC8] space-y-1 text-center">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#64748B] font-medium">Skor</span>
                        <span className="font-mono font-black text-[#1B4D3E]">
                          {formatDecimal(santri.currentScore)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] pt-1 border-t border-[#E8DFC8]/70">
                        <span className="font-bold text-[#065F46]">+{m.hasanahCount}</span>
                        <span className="font-bold text-[#DC2626]">-{m.sayyiahCount}</span>
                      </div>
                    </div>

                    <Link
                      href={`/guru/santri/${santri.id}`}
                      className="w-full py-1.5 rounded-xl text-center text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors block shadow-2xs active:scale-98"
                    >
                      Profil Santri
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedStudents.map((santri, idx) => {
                  const m = studentMetricsMap.get(santri.id) || { hasanahCount: 0, sayyiahCount: 0 };
                  const rowNumber = (safeStudentPage - 1) * PAGE_SIZE + idx + 1;
                  const defaultAvatar =
                    santri.gender === "Putri"
                      ? "/default-avatar-ustadzah.jpg"
                      : "/default-avatar-ustadz.jpg";
                  const santriPhoto = santri.avatar || defaultAvatar;

                  return (
                    <div
                      key={santri.id}
                      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E2EBF4] shadow-2xs hover:shadow-2xl hover:border-[#1B4D3E]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between text-left"
                    >
                      <div className="sheen-wrapper relative w-full aspect-square overflow-hidden bg-[#FAF7EE] shrink-0">
                        <Avatar
                          src={santriPhoto}
                          initials={santri.name.slice(0, 2).toUpperCase()}
                          size="3xl"
                          gender={santri.gender}
                          variant={santri.gender === "Putri" ? "gold" : "primary"}
                          className="w-full h-full rounded-none"
                        />
                        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs text-xs font-mono font-bold text-[#1B4D3E] shadow-xs">
                          #{rowNumber}
                        </span>
                        <span
                          className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${
                            santri.status === "Baik"
                              ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                              : santri.status === "Perhatian"
                              ? "bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]"
                              : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                          }`}
                        >
                          {santri.status}
                        </span>
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
                      </div>

                      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold text-[#C5A059] block truncate">
                              NIS: {santri.nis}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                                santri.gender === "Putri"
                                  ? "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                                  : "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                              }`}
                            >
                              {santri.gender === "Putri" ? "Putri" : "Putra"}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-[#172033] group-hover:text-[#1B4D3E] transition-colors truncate">
                            {santri.name}
                          </h4>
                        </div>

                        <div className="p-2 rounded-xl bg-[#FAF7EE] border border-[#E8DFC8] space-y-1 text-center">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#64748B] font-medium">Skor Akhlak</span>
                            <span className="font-mono font-black text-[#1B4D3E]">
                              {formatDecimal(santri.currentScore)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#E8DFC8]/70">
                            <span className="font-bold text-[#065F46]">+{m.hasanahCount} Hasanah</span>
                            <span className="font-bold text-[#DC2626]">-{m.sayyiahCount} Sayyi'ah</span>
                          </div>
                        </div>

                        <Link
                          href={`/guru/santri/${santri.id}`}
                          className="w-full py-2 rounded-xl text-center text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors block shadow-2xs active:scale-98"
                        >
                          Lihat Profil Santri
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Santri</th>
                      <th className="py-2.5 px-3 text-center">Prestasi</th>
                      <th className="py-2.5 px-3 text-center">Pelanggaran</th>
                      <th className="py-2.5 px-3 text-center">Skor</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Kehadiran</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {paginatedStudents.map((santri, idx) => {
                      const m = studentMetricsMap.get(santri.id) || { hasanahCount: 0, sayyiahCount: 0 };
                      const rowNumber = (safeStudentPage - 1) * PAGE_SIZE + idx + 1;

                      return (
                        <tr key={santri.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-2.5 px-3 text-center text-[#94A3B8] font-mono">{rowNumber}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={santri.avatar}
                                initials={santri.name.slice(0, 2).toUpperCase()}
                                size="md"
                                gender={santri.gender}
                                variant={santri.gender === "Putri" ? "gold" : "primary"}
                                className="w-10 h-10 shadow-2xs shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-[#172033] truncate">
                                  {santri.name}
                                </p>
                                <span className="font-mono text-[10px] text-[#64748B]">
                                  NIS: {santri.nis}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold font-mono text-[#065F46]">
                            {m.hasanahCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold font-mono text-[#DC2626]">
                            {m.sayyiahCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black font-mono text-[#1B4D3E]">
                            {formatDecimal(santri.currentScore)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                santri.status === "Baik"
                                  ? "bg-[#ECFDF5] text-[#065F46]"
                                  : santri.status === "Perhatian"
                                  ? "bg-[#FEFCE8] text-[#854D0E]"
                                  : "bg-[#FEF2F2] text-[#991B1B]"
                              }`}
                            >
                              {santri.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#64748B]">
                            {santri.totalHadir || 28}H / {santri.totalAlpa || 0}A
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href={`/guru/santri/${santri.id}`}
                              className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors"
                            >
                              Profil
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <Pagination
        currentPage={safeStudentPage}
        totalPages={totalStudentPages}
        onPageChange={setStudentPage}
        totalItems={filteredStudents.length}
        itemsPerPage={PAGE_SIZE}
        itemName="santri"
      />
    </div>
  );
}
