"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Plus,
  Trash2,
  CalendarCheck,
  Award,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Santri } from "@/lib/mock-data";

export default function AdminSantriPage() {
  const { santriList, kelasList, addClass, removeClass } = useMizan();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [newClassInput, setNewClassInput] = useState("");
  const [showClassModal, setShowClassModal] = useState(false);

  const filteredSantri = santriList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery);
    const matchGender =
      selectedGender === "ALL" || s.gender === selectedGender;
    const matchClass =
      selectedClass === "ALL" || s.class === selectedClass;
    return matchSearch && matchGender && matchClass;
  });

  const getStatusBadgeVariant = (status: Santri["status"]) => {
    if (status === "Baik") return "baik";
    if (status === "Perhatian") return "perhatian";
    return "pembinaan";
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassInput.trim()) {
      addClass(newClassInput.trim());
      setNewClassInput("");
      setShowClassModal(false);
    }
  };

  const putraCount = santriList.filter((s) => s.gender === "Putra").length;
  const putriCount = santriList.filter((s) => s.gender === "Putri").length;

  return (
    <RoleShell>
      <div className="space-y-4 max-w-5xl mx-auto overflow-x-hidden">
        <div className="mizan-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              Data Santri & Santriwati
            </h1>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Kelola kelas, pemisahan gender santri putra dan santriwati putri
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowClassModal(!showClassModal)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full mizan-btn-primary text-xs font-bold shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kelola Kelas</span>
          </button>
        </div>

        {showClassModal && (
          <Card className="p-4 space-y-3 bg-[#FAF7EE] border-[#C5A059]/40">
            <span className="text-xs font-bold text-[#172033] block">
              Daftar Kelas Aktif (Contoh: 1A, 1B, 1C, 1D)
            </span>

            <div className="flex flex-wrap gap-2">
              {kelasList.map((cls) => (
                <span
                  key={cls}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full mizan-pill bg-white text-xs font-bold text-[#172033]"
                >
                  <span>Kelas {cls}</span>
                  {kelasList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeClass(cls)}
                      className="text-[#94A3B8] hover:text-[#DC2626] ml-1"
                      title="Hapus kelas"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <form onSubmit={handleCreateClass} className="flex gap-2 pt-1 max-w-sm">
              <input
                type="text"
                placeholder="Tambah kelas baru (misal: 1E, 2E)..."
                value={newClassInput}
                onChange={(e) => setNewClassInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full mizan-btn-primary text-xs font-bold"
              >
                Tambah
              </button>
            </form>
          </Card>
        )}

        <div className="flex items-center gap-1.5 p-1 rounded-full mizan-pill bg-white max-w-md text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedGender("ALL")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all text-center ${
              selectedGender === "ALL"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Semua ({santriList.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender("Putra")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all text-center ${
              selectedGender === "Putra"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Putra ({putraCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender("Putri")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all text-center ${
              selectedGender === "Putri"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Putri ({putriCount})
          </button>
        </div>

        <Card className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama santri atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E2EBF4] rounded-2xl text-[#172033]"
              />
            </div>

            <div>
              <select
                aria-label="Filter kelas santri"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] font-bold"
              >
                <option value="ALL">Semua Kelas</option>
                {kelasList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {filteredSantri.length === 0 ? (
          <EmptyState
            title="Santri tidak ditemukan"
            description="Tidak ada data santri yang cocok dengan kriteria filter gender atau kelas."
            action={{
              label: "Reset Filter",
              onClick: () => {
                setSearchQuery("");
                setSelectedGender("ALL");
                setSelectedClass("ALL");
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredSantri.map((santri) => (
              <Link
                key={santri.id}
                href={`/guru/santri/${santri.id}`}
                className="mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/40 group transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        initials={santri.avatar}
                        size="md"
                        variant={santri.gender === "Putra" ? "primary" : "gold"}
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-[#172033] leading-tight truncate group-hover:text-[#1B4D3E] transition-colors">
                          {santri.name}
                        </h3>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">
                          NIS: {santri.nis} • Kelas {santri.class}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full mizan-pill shrink-0 ${
                        santri.gender === "Putra"
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : "bg-[#FAF7EE] text-[#A8833E]"
                      }`}
                    >
                      {santri.gender}
                    </span>
                  </div>

                  <CardInset className="p-2.5 grid grid-cols-2 gap-2 text-center my-2">
                    <div>
                      <span className="text-[9px] text-[#94A3B8] block font-bold uppercase">
                        Skor Akhlak
                      </span>
                      <span className="text-xs font-black font-mono text-[#1B4D3E]">
                        {santri.currentScore.toFixed(3).replace(".", ",")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-[#94A3B8] block font-bold uppercase">
                        Kehadiran
                      </span>
                      <span className="text-xs font-black font-mono text-[#065F46]">
                        {santri.totalHadir || 0} Hari
                      </span>
                    </div>
                  </CardInset>
                </div>

                <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Wali: {santri.waliName || "Bapak Santri"}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#1B4D3E] group-hover:translate-x-0.5 transition-transform">
                    Rapor PDF <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RoleShell>
  );
}
