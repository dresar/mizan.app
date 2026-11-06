"use client";

import React, { useState, useMemo } from "react";
import {
  HeartPulse,
  Search,
  Calendar,
  Filter,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";

export default function AdminKesehatanPage() {
  const { kesehatanList, deleteKesehatan } = useMizan();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    let list = kesehatanList;
    if (genderFilter !== "ALL") {
      list = list.filter((k) => k.gender === genderFilter);
    }
    if (statusFilter !== "ALL") {
      list = list.filter((k) => k.statusRawat === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (k) =>
          k.santriName.toLowerCase().includes(q) ||
          k.keluhan.toLowerCase().includes(q) ||
          k.diagnosa.toLowerCase().includes(q)
      );
    }
    return list;
  }, [kesehatanList, genderFilter, statusFilter, searchQuery]);

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmId) return;
    await deleteKesehatan(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  return (
    <RoleShell>
      <div className="space-y-3.5 pb-24">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-serif font-black text-[#172033] tracking-tight">
                  Kesehatan Santri
                </h1>
                <p className="text-[10px] text-[#64748B]">Rekam medis & poskestren</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-[#EEF2F6] self-start sm:self-auto">
              {(["ALL", "Putra", "Putri"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenderFilter(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    genderFilter === g
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {g === "ALL" ? "Semua" : g === "Putra" ? "L" : "P"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E2EBF4]">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-medium text-[#172033] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {[
                { key: "ALL", label: "Semua" },
                { key: "Rawat Jalan", label: "Rawat Jalan" },
                { key: "Istirahat di Kamar", label: "Kamar" },
                { key: "Rawat Inap Klinik", label: "Klinik" },
                { key: "Rujuk RS", label: "Rujuk RS" }
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setStatusFilter(st.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st.key
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "bg-[#FAF7EE] text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {deleteConfirmId && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Hapus rekam medis ini secara permanen?</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
              >
                Hapus
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRecords.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-[#E2EBF4] text-[#64748B] space-y-1">
              <HeartPulse className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p className="text-xs font-semibold">Tidak ada catatan kesehatan</p>
            </div>
          ) : (
            filteredRecords.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] flex flex-col justify-between space-y-2.5 shadow-2xs hover:border-[#1B4D3E]/30 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-[#172033] truncate">
                          {r.santriName}
                        </h3>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-black shrink-0 ${
                            r.gender === "Putra"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {r.gender === "Putra" ? "L" : "P"}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#64748B] font-mono">{r.tanggal}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                        r.statusRawat === "Istirahat di Kamar"
                          ? "bg-amber-100 text-amber-800"
                          : r.statusRawat === "Rawat Inap Klinik"
                          ? "bg-rose-100 text-rose-800"
                          : r.statusRawat === "Rujuk RS"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {r.statusRawat}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF7EE] text-[11px] space-y-1">
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Keluhan:</span>
                      <p className="font-medium text-[#172033]">{r.keluhan}</p>
                    </div>
                    <div className="pt-1 border-t border-[#D4C9B5]/40">
                      <span className="text-[#94A3B8] block text-[10px]">Diagnosa & Terapi:</span>
                      <p className="font-bold text-[#172033]">{r.diagnosa}</p>
                      {r.tindakanObat && (
                        <p className="text-[10px] text-[#64748B] mt-0.5">{r.tindakanObat}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>Petugas: {r.petugasNama}</span>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(r.id)}
                    className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RoleShell>
  );
}
