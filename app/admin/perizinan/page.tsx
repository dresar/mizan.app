"use client";

import React, { useState, useMemo } from "react";
import {
  Ticket,
  Search,
  CheckCircle2,
  XCircle,
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
          p.alasan.toLowerCase().includes(q)
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
      <div className="space-y-4 pb-20">
        <div className="mizan-card p-4 sm:p-6 bg-white space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-xs">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                  Rekapitulasi Perizinan & Sambang (Admin Panel)
                </h1>
                <p className="text-xs text-[#64748B]">
                  Pengawasan perizinan keluar gerbang santri dan rekapitulasi kedatangan wali murid
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EEF2F6]">
              {(["ALL", "Putra", "Putri"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenderFilter(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    genderFilter === g
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {g === "ALL" ? "Semua Gender" : g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-[#E2EBF4]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("IZIN")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "IZIN"
                    ? "bg-[#1B4D3E] text-white shadow-xs"
                    : "bg-[#FAF7EE] text-[#64748B] hover:text-[#172033]"
                }`}
              >
                Permohonan Izin ({filteredPerizinan.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SAMBANG")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "SAMBANG"
                    ? "bg-[#1B4D3E] text-white shadow-xs"
                    : "bg-[#FAF7EE] text-[#64748B] hover:text-[#172033]"
                }`}
              >
                Reservasi Sambangan ({filteredSambangan.length})
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {activeTab === "IZIN" &&
                ["ALL", "MENUNGGU", "DISETUJUI", "BERJALAN", "SELESAI", "DITOLAK"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      statusFilter === st
                        ? "bg-[#172033] text-white"
                        : "bg-[#FAF7EE] text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {st === "ALL" ? "Semua Status" : st}
                  </button>
                ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri, alasan, atau nama wali..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-medium text-[#172033] focus:outline-hidden"
            />
          </div>
        </div>

        {deleteConfirmId && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Yakin ingin menghapus data perizinan/sambangan ini secara permanen?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}

        {selectedQrRecord && (
          <div className="p-4 rounded-3xl bg-white border border-[#E2EBF4] shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4]">
              <span className="text-xs font-bold text-[#172033]">Pratinjau & Unduh Kartu QR Pass Resmi</span>
              <button
                type="button"
                onClick={() => setSelectedQrRecord(null)}
                className="w-7 h-7 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <QrPassCard record={selectedQrRecord} onClose={() => setSelectedQrRecord(null)} />
          </div>
        )}

        {activeTab === "IZIN" ? (
          <div className="mizan-card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7EE] text-[#64748B] uppercase font-bold text-[10px] border-b border-[#E2EBF4]">
                  <tr>
                    <th className="p-3">Santri</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Jenis Izin</th>
                    <th className="p-3">Rencana Keluar - Kembali</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Token QR</th>
                    <th className="p-3">Waktu Riil Gerbang</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBF4]">
                  {filteredPerizinan.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B]">
                        Tidak ada riwayat perizinan santri
                      </td>
                    </tr>
                  ) : (
                    filteredPerizinan.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                        <td className="p-3 font-bold text-[#172033]">
                          {p.santriName} <span className="text-[10px] text-[#64748B] block">Kelas {p.santriClass}</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              p.gender === "Putra" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {p.gender}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-[#172033]">
                          {p.jenisIzin}
                          {p.alasan && <span className="text-[10px] text-[#64748B] block truncate max-w-[150px]">{p.alasan}</span>}
                        </td>
                        <td className="p-3 text-[#64748B]">
                          {p.tglKeluar} s/d {p.tglKembali}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
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
                        </td>
                        <td className="p-3 font-mono text-[10px] text-[#A8833E]">{p.qrCodeToken}</td>
                        <td className="p-3 text-[10px] text-[#64748B]">
                          {p.waktuKeluarRiil && <div>Keluar: {p.waktuKeluarRiil}</div>}
                          {p.waktuKembaliRiil && <div>Kembali: {p.waktuKembaliRiil}</div>}
                          {!p.waktuKeluarRiil && !p.waktuKembaliRiil && <span>Belum lewat gerbang</span>}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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
                              onClick={() => setSelectedQrRecord(p)}
                              className="w-7 h-7 rounded-lg text-[#854D0E] hover:bg-[#FAF7EE] flex items-center justify-center transition-colors border border-[#C5A059]/30"
                              title="Lihat / Unduh Kartu QR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTargetType("IZIN");
                                setDeleteConfirmId(p.id);
                              }}
                              className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                              title="Hapus Izin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mizan-card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7EE] text-[#64748B] uppercase font-bold text-[10px] border-b border-[#E2EBF4]">
                  <tr>
                    <th className="p-3">Santri</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Wali Pengunjung</th>
                    <th className="p-3">Tanggal Sambang</th>
                    <th className="p-3">Sesi Waktu</th>
                    <th className="p-3">Pengunjung</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBF4]">
                  {filteredSambangan.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B]">
                        Tidak ada riwayat reservasi sambangan
                      </td>
                    </tr>
                  ) : (
                    filteredSambangan.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                        <td className="p-3 font-bold text-[#172033]">{s.santriName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              s.gender === "Putra" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {s.gender}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-[#172033]">{s.waliName}</td>
                        <td className="p-3 text-[#64748B]">{s.tanggalSambang}</td>
                        <td className="p-3 text-[#172033]">{s.sesiWaktu}</td>
                        <td className="p-3 text-[#64748B]">{s.jumlahPengunjung} Orang</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTargetType("SAMBANG");
                              setDeleteConfirmId(s.id);
                            }}
                            className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition-colors"
                            title="Hapus Sambangan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
