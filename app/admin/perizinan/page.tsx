"use client";

import React, { useState, useMemo } from "react";
import {
  Ticket,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  Users,
  Trash2,
  AlertTriangle,
  Download,
  X
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { PerizinanRecord } from "@/lib/mock-data";
import { QrPassCard } from "@/components/QrPassCard";

export default function AdminPerizinanPage() {
  const {
    perizinanList,
    sambanganList,
    approvePerizinan,
    deletePerizinan,
    deleteSambangan
  } = useMizan();

  const [activeTab, setActiveTab] = useState<"IZIN" | "SAMBANG">("IZIN");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [selectedQrRecord, setSelectedQrRecord] = useState<PerizinanRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<"IZIN" | "SAMBANG">("IZIN");

  const filteredPerizinan = useMemo(() => {
    let list = perizinanList;
    if (genderFilter !== "ALL") {
      list = list.filter((p) => p.gender === genderFilter);
    }
    if (statusFilter !== "ALL") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.santriName.toLowerCase().includes(q) ||
          p.jenisIzin.toLowerCase().includes(q) ||
          p.alasan.toLowerCase().includes(q) ||
          p.qrCodeToken.toLowerCase().includes(q)
      );
    }
    return list;
  }, [perizinanList, genderFilter, statusFilter, searchQuery]);

  const filteredSambangan = useMemo(() => {
    let list = sambanganList;
    if (genderFilter !== "ALL") {
      list = list.filter((s) => s.gender === genderFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.santriName.toLowerCase().includes(q) ||
          s.waliName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sambanganList, genderFilter, searchQuery]);

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmId) return;
    if (deleteTargetType === "IZIN") {
      await deletePerizinan(deleteConfirmId);
    } else {
      await deleteSambangan(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  return (
    <RoleShell>
      <div className="space-y-3.5 pb-24">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-serif font-black text-[#172033] tracking-tight">
                  Perizinan & Sambang
                </h1>
                <p className="text-[10px] text-[#64748B]">Log izin santri & pos gerbang</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="inline-flex rounded-xl p-0.5 bg-[#EEF2F6]">
                <button
                  type="button"
                  onClick={() => setActiveTab("IZIN")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "IZIN"
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  Izin ({filteredPerizinan.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("SAMBANG")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "SAMBANG"
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  Sambang ({filteredSambangan.length})
                </button>
              </div>

              <div className="inline-flex rounded-xl p-0.5 bg-[#EEF2F6]">
                {(["ALL", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenderFilter(g)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
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

            {activeTab === "IZIN" && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {[
                  { key: "ALL", label: "Semua" },
                  { key: "MENUNGGU", label: "Menunggu" },
                  { key: "DISETUJUI", label: "Disetujui" },
                  { key: "BERJALAN", label: "Berjalan" },
                  { key: "SELESAI", label: "Selesai" },
                  { key: "DITOLAK", label: "Ditolak" }
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setStatusFilter(st.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      statusFilter === st.key
                        ? "bg-[#1B4D3E] text-white shadow-2xs"
                        : "bg-[#FAF7EE] text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {deleteConfirmId && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Hapus data ini secara permanen?</span>
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

        {selectedQrRecord && (
          <div className="p-3.5 sm:p-4 rounded-3xl bg-white border border-[#E2EBF4] shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4]">
              <span className="text-xs font-bold text-[#172033]">Kartu QR Izin Resmi</span>
              <button
                type="button"
                onClick={() => setSelectedQrRecord(null)}
                className="w-7 h-7 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <QrPassCard record={selectedQrRecord} onClose={() => setSelectedQrRecord(null)} />
          </div>
        )}

        {activeTab === "IZIN" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPerizinan.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-[#E2EBF4] text-[#64748B] space-y-1">
                <Ticket className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="text-xs font-semibold">Tidak ada data perizinan</p>
              </div>
            ) : (
              filteredPerizinan.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] flex flex-col justify-between space-y-2.5 shadow-2xs hover:border-[#1B4D3E]/30 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-bold text-[#172033] truncate">
                            {p.santriName}
                          </h3>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black shrink-0 ${
                              p.gender === "Putra"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {p.gender === "Putra" ? "L" : "P"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] font-mono">Kelas {p.santriClass}</p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                          p.status === "DISETUJUI"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "BERJALAN"
                            ? "bg-amber-100 text-amber-800"
                            : p.status === "SELESAI"
                            ? "bg-blue-100 text-blue-800"
                            : p.status === "MENUNGGU"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FAF7EE] text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Jenis:</span>
                        <span className="font-bold text-[#172033]">{p.jenisIzin}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Jadwal:</span>
                        <span className="font-medium text-[#172033]">{p.tglKeluar} - {p.tglKembali}</span>
                      </div>
                      {p.alasan && (
                        <p className="text-[#172033] pt-1 border-t border-[#D4C9B5]/40 truncate">
                          <span className="text-[#94A3B8]">Alasan: </span>
                          {p.alasan}
                        </p>
                      )}
                      {(p.waktuKeluarRiil || p.waktuKembaliRiil) && (
                        <div className="text-[10px] text-[#065F46] pt-1 border-t border-[#D4C9B5]/40 font-mono">
                          {p.waktuKeluarRiil && <div>Keluar: {p.waktuKeluarRiil}</div>}
                          {p.waktuKembaliRiil && <div>Kembali: {p.waktuKembaliRiil}</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQrRecord(p)}
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-[#854D0E] bg-[#FAF7EE] hover:bg-[#FEFCE8] px-2 py-1 rounded-lg border border-[#C5A059]/40 font-bold transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3 h-3 text-[#C5A059]" />
                      <span>QR Pass</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {p.status === "MENUNGGU" && (
                        <>
                          <button
                            type="button"
                            onClick={() => approvePerizinan(p.id, "DISETUJUI")}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                          >
                            Sahkan
                          </button>
                          <button
                            type="button"
                            onClick={() => approvePerizinan(p.id, "DITOLAK")}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTargetType("IZIN");
                          setDeleteConfirmId(p.id);
                        }}
                        className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus Izin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSambangan.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-[#E2EBF4] text-[#64748B] space-y-1">
                <Users className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="text-xs font-semibold">Tidak ada jadwal sambangan</p>
              </div>
            ) : (
              filteredSambangan.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] flex flex-col justify-between space-y-2.5 shadow-2xs hover:border-[#1B4D3E]/30 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-bold text-[#172033] truncate">
                            {s.santriName}
                          </h3>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black shrink-0 ${
                              s.gender === "Putra"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {s.gender === "Putra" ? "L" : "P"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B]">Wali: {s.waliName}</p>
                      </div>

                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        {s.status}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FAF7EE] text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Tanggal:</span>
                        <span className="font-bold text-[#172033]">{s.tanggalSambang}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Sesi:</span>
                        <span className="font-medium text-[#172033]">{s.sesiWaktu}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Pengunjung:</span>
                        <span className="font-medium text-[#172033]">{s.jumlahPengunjung} Orang</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetType("SAMBANG");
                        setDeleteConfirmId(s.id);
                      }}
                      className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus Sambangan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </RoleShell>
  );
}
