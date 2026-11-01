"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, User, ChevronRight, GraduationCap } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";

export default function GuruSantriListPage() {
  const { accessibleSantriList, currentUser } = useMizan();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const classes = useMemo(() => {
    const set = new Set(accessibleSantriList.map((s) => s.class));
    return ["ALL", ...Array.from(set)];
  }, [accessibleSantriList]);

  const filteredSantri = useMemo(() => {
    return accessibleSantriList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);
      const matchClass = selectedClass === "ALL" || s.class === selectedClass;
      return matchSearch && matchClass;
    });
  }, [accessibleSantriList, searchQuery, selectedClass]);

  const totalPages = Math.ceil(filteredSantri.length / PAGE_SIZE) || 1;

  const paginatedSantri = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSantri.slice(start, start + PAGE_SIZE);
  }, [filteredSantri, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setCurrentPage(1);
  };

  const formatScore = (score: number) => {
    return score.toFixed(3).replace(".", ",");
  };

  const getPredikatBadge = (score: number) => {
    if (score >= 90) return { label: "MUMTAZ", color: "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]" };
    if (score >= 80) return { label: "JAYYID JIDDAN", color: "text-[#1B4D3E] bg-[#E8F0EC] border-[#1B4D3E]/30" };
    if (score >= 70) return { label: "JAYYID", color: "text-[#854D0E] bg-[#FEFCE8] border-[#FEF08A]" };
    if (score >= 60) return { label: "MAQBUL", color: "text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]" };
    return { label: "RASIB", color: "text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]" };
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
              Daftar Santri
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Santri {currentUser.gender === "Putri" ? "Putri" : "Putra"} • Total {filteredSantri.length} santri
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mizan-pill bg-[#ECFDF5] text-[#065F46]">
            <GraduationCap className="w-3.5 h-3.5" />
            {currentUser.assignedClass ? `Kelas ${currentUser.assignedClass}` : "Semua"}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari santri..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
              {classes.map((cls) => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleClassChange(cls)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? "bg-[#1B4D3E] text-white shadow-sm"
                        : "bg-white text-[#64748B] border border-[#E2EBF4] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {cls === "ALL" ? "Semua" : `Kelas ${cls}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
            {paginatedSantri.map((santri) => {
              const pred = getPredikatBadge(santri.currentScore);

              return (
                <Link
                  key={santri.id}
                  href={`/guru/santri/${santri.id}`}
                  className="mizan-card-sub p-3 flex flex-col justify-between gap-2.5 hover:border-[#1B4D3E]/40 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      initials={santri.avatar}
                      size="sm"
                      variant={santri.gender === "Putra" ? "primary" : "gold"}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors truncate">
                        {santri.name}
                      </h3>
                      <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                        {santri.class} • {santri.nis}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#EEF2F6]">
                    <div>
                      <span className="font-mono text-xs font-black text-[#1B4D3E]">
                        {formatScore(santri.currentScore)}
                      </span>
                    </div>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${pred.color}`}>
                      {pred.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredSantri.length}
            itemsPerPage={PAGE_SIZE}
            itemName="santri"
          />

          {filteredSantri.length === 0 && (
            <div className="text-center py-12 mizan-card p-6">
              <User className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-[#172033]">Santri tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </RoleShell>
  );
}
