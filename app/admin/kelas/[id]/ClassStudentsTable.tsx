"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Users, Search } from "lucide-react";
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

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri berdasarkan nama/NIS..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-full text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#94A3B8]">
          Tidak ada santri yang cocok dengan pencarian di Kelas {classNameTitle}.
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
