"use client";

import React, { useState, useMemo } from "react";
import {
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  Users,
  X,
  Trash2,
  Edit2,
  Download,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Avatar } from "@/components/ui/Avatar";
import { PerizinanRecord, SambanganRecord } from "@/lib/mock-data";
import { QrPassCard } from "@/components/QrPassCard";

export default function PengasuhanPerizinanPage() {
  const {
    accessibleSantriList,
    perizinanList,
    approvePerizinan,
    addPerizinan,
    updatePerizinan,
    deletePerizinan,
    sambanganList,
    addSambangan,
    deleteSambangan,
    currentUser
  } = useMizan();

  const [activeTab, setActiveTab] = useState<"IZIN" | "SAMBANG">("IZIN");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isIzinFormOpen, setIsIzinFormOpen] = useState(false);
  const [editingIzinId, setEditingIzinId] = useState<string | null>(null);

  const [isSambangFormOpen, setIsSambangFormOpen] = useState(false);
  const [selectedQrRecord, setSelectedQrRecord] = useState<PerizinanRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<"IZIN" | "SAMBANG">("IZIN");

  const [izinForm, setIzinForm] = useState({
    santriId: "",
    jenisIzin: "Pulang",
    alasan: "",
    tglKeluar: "",
    tglKembali: "",
    buktiSuratUrl: "",
    status: "DISETUJUI"
  });

  const [sambangForm, setSambangForm] = useState({
    santriId: "",
    waliName: "",
    tanggalSambang: "",
    sesiWaktu: "Sesi Pagi (09:00 - 11:30)",
    jumlahPengunjung: 2,
    catatan: ""
  });

  const filteredPerizinan = useMemo(() => {
    let list = perizinanList;
    if (currentUser?.gender === "Putra") {
      list = list.filter((p) => p.gender === "Putra");
    } else if (currentUser?.gender === "Putri") {
      list = list.filter((p) => p.gender === "Putri");
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
  }, [perizinanList, currentUser?.gender, statusFilter, searchQuery]);

  const filteredSambangan = useMemo(() => {
    let list = sambanganList;
    if (currentUser?.gender === "Putra") {
      list = list.filter((s) => s.gender === "Putra");
    } else if (currentUser?.gender === "Putri") {
      list = list.filter((s) => s.gender === "Putri");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.santriName.toLowerCase().includes(q) ||
          s.waliName.toLowerCase().includes(q) ||
          s.tanggalSambang.includes(q)
      );
    }
    return list;
  }, [sambanganList, currentUser?.gender, searchQuery]);

  const openAddIzinForm = () => {
    setEditingIzinId(null);
    setIzinForm({
      santriId: accessibleSantriList[0]?.id || "",
      jenisIzin: "Pulang",
      alasan: "",
      tglKeluar: new Date().toISOString().split("T")[0],
      tglKembali: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      buktiSuratUrl: "",
      status: "DISETUJUI"
    });
    setIsIzinFormOpen(true);
  };

  const openEditIzinForm = (record: PerizinanRecord) => {
    setEditingIzinId(record.id);
    setIzinForm({
      santriId: record.santriId,
      jenisIzin: record.jenisIzin,
      alasan: record.alasan,
      tglKeluar: record.tglKeluar,
      tglKembali: record.tglKembali,
      buktiSuratUrl: record.buktiSuratUrl || "",
      status: record.status
    });
    setIsIzinFormOpen(true);
  };

  const handleSaveIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!izinForm.santriId || !izinForm.tglKeluar || !izinForm.tglKembali) return;
    const santri = accessibleSantriList.find((s) => s.id === izinForm.santriId);
    if (!santri) return;

    setIsSubmitting(true);
    if (editingIzinId) {
      await updatePerizinan({
        id: editingIzinId,
        jenisIzin: izinForm.jenisIzin,
        alasan: izinForm.alasan,
        tglKeluar: izinForm.tglKeluar,
        tglKembali: izinForm.tglKembali,
        status: izinForm.status as any,
        buktiSuratUrl: izinForm.buktiSuratUrl
      });
    } else {
      await addPerizinan({
        santriId: santri.id,
        santriName: santri.name,
        santriClass: santri.class,
        gender: santri.gender,
        jenisIzin: izinForm.jenisIzin,
        alasan: izinForm.alasan,
        tglKeluar: izinForm.tglKeluar,
        tglKembali: izinForm.tglKembali,
        diajukanOleh: currentUser?.name || "Pengasuhan",
        disetujuiOleh: currentUser?.name || "Pengasuhan",
        buktiSuratUrl: izinForm.buktiSuratUrl
      });
    }

    setIsSubmitting(false);
    setIsIzinFormOpen(false);
    setEditingIzinId(null);
  };

  const handleSaveSambang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sambangForm.santriId || !sambangForm.tanggalSambang) return;
    const santri = accessibleSantriList.find((s) => s.id === sambangForm.santriId);
    if (!santri) return;

    setIsSubmitting(true);
    await addSambangan({
      santriId: santri.id,
      santriName: santri.name,
      gender: santri.gender,
      waliName: sambangForm.waliName || santri.waliName || "Wali Santri",
      tanggalSambang: sambangForm.tanggalSambang,
      sesiWaktu: sambangForm.sesiWaktu,
      jumlahPengunjung: Number(sambangForm.jumlahPengunjung) || 2,
      catatan: sambangForm.catatan
    });

    setIsSubmitting(false);
    setIsSambangFormOpen(false);
    setSambangForm({
      santriId: "",
      waliName: "",
      tanggalSambang: "",
      sesiWaktu: "Sesi Pagi (09:00 - 11:30)",
      jumlahPengunjung: 2,
      catatan: ""
    });
  };

  const handleDeleteItem = async () => {
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
        <div className="mizan-card p-4 sm:p-5 bg-white space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 text-[#854D0E] flex items-center justify-center shadow-xs">
                <Ticket className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                  Perizinan & Sambang Santri {currentUser?.gender ? `(${currentUser.gender})` : ""}
                </h1>
                <p className="text-xs text-[#64748B]">
                  Persetujuan izin keluar/pulang santri, token QR pos satpam, dan kuota sambangan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "IZIN" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isIzinFormOpen) {
                      setIsIzinFormOpen(false);
                      setEditingIzinId(null);
                    } else {
                      openAddIzinForm();
                    }
                  }}
                  className="px-4 py-2 rounded-2xl bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className={`w-4 h-4 transition-transform duration-200 ${isIzinFormOpen ? "rotate-45" : ""}`} />
                  <span>{isIzinFormOpen ? "Tutup Form" : "Buat Izin Santri"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSambangFormOpen(!isSambangFormOpen)}
                  className="px-4 py-2 rounded-2xl bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className={`w-4 h-4 transition-transform duration-200 ${isSambangFormOpen ? "rotate-45" : ""}`} />
                  <span>{isSambangFormOpen ? "Tutup Form" : "Reservasi Sambang"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex border-b border-[#E2EBF4] gap-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("IZIN");
                setIsSambangFormOpen(false);
              }}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === "IZIN"
                  ? "border-b-2 border-[#1B4D3E] text-[#1B4D3E]"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              Permohonan Izin Santri ({filteredPerizinan.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("SAMBANG");
                setIsIzinFormOpen(false);
              }}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === "SAMBANG"
                  ? "border-b-2 border-[#1B4D3E] text-[#1B4D3E]"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              Reservasi Sambangan ({filteredSambangan.length})
            </button>
          </div>

          {isIzinFormOpen && activeTab === "IZIN" && (
            <form onSubmit={handleSaveIzin} className="p-4 sm:p-5 rounded-3xl bg-[#FAF7EE] border border-[#C5A059]/40 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#D4C9B5]/40">
                <span className="text-xs font-bold text-[#172033]">
                  {editingIzinId ? "Edit Perizinan Santri" : "Formulir Baru Izin Keluar/Pulang Santri"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsIzinFormOpen(false);
                    setEditingIzinId(null);
                  }}
                  className="text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Santri Binaan</label>
                  <select
                    disabled={Boolean(editingIzinId)}
                    value={izinForm.santriId}
                    onChange={(e) => setIzinForm({ ...izinForm, santriId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Santri --</option>
                    {accessibleSantriList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class} • NIS {s.nis})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Jenis Izin</label>
                  <select
                    value={izinForm.jenisIzin}
                    onChange={(e) => setIzinForm({ ...izinForm, jenisIzin: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                  >
                    <option value="Pulang">Pulang ke Rumah</option>
                    <option value="Sakit">Sakit (Klinik / RS)</option>
                    <option value="Lomba">Acara Pondok / Perlombaan</option>
                    <option value="Dinas">Keperluan Mendesak</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Tanggal Keluar (Jadwal)</label>
                  <input
                    type="date"
                    value={izinForm.tglKeluar}
                    onChange={(e) => setIzinForm({ ...izinForm, tglKeluar: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-semibold text-[#172033] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Tanggal Wajib Kembali</label>
                  <input
                    type="date"
                    value={izinForm.tglKembali}
                    onChange={(e) => setIzinForm({ ...izinForm, tglKembali: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-semibold text-[#172033] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-[#172033]">Alasan Izin</label>
                  <textarea
                    rows={2}
                    value={izinForm.alasan}
                    onChange={(e) => setIzinForm({ ...izinForm, alasan: e.target.value })}
                    placeholder="Contoh: Menghadiri pernikahan kakak kandung / Rujukan dokter spesialis..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl text-[#172033] focus:outline-none"
                    required
                  />
                </div>

                {editingIzinId && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#172033]">Status Persetujuan</label>
                    <select
                      value={izinForm.status}
                      onChange={(e) => setIzinForm({ ...izinForm, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                    >
                      <option value="MENUNGGU">MENUNGGU (Verifikasi)</option>
                      <option value="DISETUJUI">DISETUJUI (Siap ke Gerbang)</option>
                      <option value="BERJALAN">BERJALAN (Di Luar Pondok)</option>
                      <option value="SELESAI">SELESAI (Sudah Kembali)</option>
                      <option value="DITOLAK">DITOLAK</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D4C9B5]/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsIzinFormOpen(false);
                    setEditingIzinId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : editingIzinId ? "Perbarui Izin" : "Simpan & Buat Kartu QR"}
                </button>
              </div>
            </form>
          )}

          {isSambangFormOpen && activeTab === "SAMBANG" && (
            <form onSubmit={handleSaveSambang} className="p-4 sm:p-5 rounded-3xl bg-[#FAF7EE] border border-[#C5A059]/40 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#D4C9B5]/40">
                <span className="text-xs font-bold text-[#172033]">Formulir Reservasi Sambangan Santri</span>
                <button
                  type="button"
                  onClick={() => setIsSambangFormOpen(false)}
                  className="text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Santri</label>
                  <select
                    value={sambangForm.santriId}
                    onChange={(e) => setSambangForm({ ...sambangForm, santriId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Santri --</option>
                    {accessibleSantriList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Nama Wali / Tamu</label>
                  <input
                    type="text"
                    value={sambangForm.waliName}
                    onChange={(e) => setSambangForm({ ...sambangForm, waliName: e.target.value })}
                    placeholder="Nama orang tua / wali..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl text-[#172033] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    value={sambangForm.tanggalSambang}
                    onChange={(e) => setSambangForm({ ...sambangForm, tanggalSambang: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-semibold text-[#172033] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Sesi Waktu</label>
                  <select
                    value={sambangForm.sesiWaktu}
                    onChange={(e) => setSambangForm({ ...sambangForm, sesiWaktu: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                  >
                    <option value="Sesi Pagi (09:00 - 11:30)">Sesi Pagi (09:00 - 11:30)</option>
                    <option value="Sesi Siang (13:30 - 15:30)">Sesi Siang (13:30 - 15:30)</option>
                    <option value="Sesi Sore (16:00 - 17:30)">Sesi Sore (16:00 - 17:30)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Estimasi Pengunjung</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={sambangForm.jumlahPengunjung}
                    onChange={(e) => setSambangForm({ ...sambangForm, jumlahPengunjung: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Catatan Khusus</label>
                  <input
                    type="text"
                    value={sambangForm.catatan}
                    onChange={(e) => setSambangForm({ ...sambangForm, catatan: e.target.value })}
                    placeholder="Membawa titipan pakaian / makanan..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl text-[#172033] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D4C9B5]/40">
                <button
                  type="button"
                  onClick={() => setIsSambangFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Daftarkan Sambangan"}
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder={activeTab === "IZIN" ? "Cari santri, alasan, atau jenis izin..." : "Cari santri, wali, tanggal sambang..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>

            {activeTab === "IZIN" && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {["ALL", "MENUNGGU", "DISETUJUI", "BERJALAN", "SELESAI", "DITOLAK"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === st
                        ? "bg-[#1B4D3E] text-white shadow-2xs"
                        : "bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] border border-[#CBD5E1]"
                    }`}
                  >
                    {st === "ALL" ? "Semua Status" : st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedQrRecord && (
          <div className="p-4 rounded-3xl bg-white border border-[#E2EBF4] shadow-md animate-in fade-in duration-200">
            <QrPassCard
              record={selectedQrRecord}
              onClose={() => setSelectedQrRecord(null)}
            />
          </div>
        )}

        {deleteConfirmId && (
          <div className="p-4 rounded-3xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 text-[#B91C1C]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold">Konfirmasi Hapus Data</p>
                <p className="text-[11px] text-[#7F1D1D]">
                  Apakah Anda yakin ingin menghapus {deleteTargetType === "IZIN" ? "perizinan" : "sambangan"} ini?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                className="px-3.5 py-1.5 rounded-xl bg-[#B91C1C] text-white text-xs font-bold hover:bg-red-800 transition-colors shadow-2xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}

        {activeTab === "IZIN" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPerizinan.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-[#E2EBF4] text-[#64748B] space-y-2">
                <Ticket className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="text-xs font-semibold">Tidak ada riwayat perizinan santri</p>
              </div>
            ) : (
              filteredPerizinan.map((p) => (
                <div key={p.id} className="mizan-card p-4 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          initials={p.santriName.substring(0, 2).toUpperCase()}
                          size="md"
                          variant={p.gender === "Putra" ? "primary" : "gold"}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs sm:text-sm font-bold text-[#172033] truncate">{p.santriName}</h3>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-black shrink-0 ${
                                p.gender === "Putra" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {p.gender === "Putra" ? "L" : "P"}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#64748B] font-mono">Kelas {p.santriClass}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            p.status === "MENUNGGU"
                              ? "bg-amber-100 text-amber-800"
                              : p.status === "DISETUJUI"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "BERJALAN"
                              ? "bg-blue-100 text-blue-800"
                              : p.status === "SELESAI"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {p.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => openEditIzinForm(p)}
                          className="w-7 h-7 rounded-lg text-[#64748B] hover:text-[#1B4D3E] hover:bg-[#FAF7EE] flex items-center justify-center transition-colors"
                          title="Edit Izin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
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
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF7EE] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Jenis Izin:</span>
                        <span className="font-bold text-[#172033]">{p.jenisIzin}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Jadwal Keluar:</span>
                        <span className="font-medium text-[#172033]">{p.tglKeluar}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Wajib Kembali:</span>
                        <span className="font-medium text-[#172033]">{p.tglKembali}</span>
                      </div>
                      {p.alasan && (
                        <p className="text-[#172033] pt-1 border-t border-[#D4C9B5]/40 truncate">
                          <span className="text-[#94A3B8]">Alasan: </span>
                          {p.alasan}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <button
                        type="button"
                        onClick={() => setSelectedQrRecord(p)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-[#854D0E] bg-[#FAF7EE] hover:bg-[#FEFCE8] px-2 py-0.5 rounded-md border border-[#C5A059]/40 font-bold transition-colors cursor-pointer"
                        title="Buka Kartu QR Resmi & Unduh Gambar"
                      >
                        <QrCode className="w-3 h-3 text-[#C5A059]" />
                        <span>Unduh QR</span>
                      </button>
                      <span className="text-[10px] truncate max-w-[140px]">Petugas: {p.diajukanOleh}</span>
                    </div>
                  </div>

                  {p.status === "MENUNGGU" && (
                    <div className="pt-2 border-t border-[#E2EBF4] flex gap-2">
                      <button
                        type="button"
                        onClick={() => approvePerizinan(p.id, "DISETUJUI")}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => approvePerizinan(p.id, "DITOLAK")}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSambangan.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-[#E2EBF4] text-[#64748B] space-y-2">
                <Users className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="text-xs font-semibold">Tidak ada data jadwal sambangan</p>
              </div>
            ) : (
              filteredSambangan.map((s) => (
                <div key={s.id} className="mizan-card p-4 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-bold text-[#172033]">{s.santriName}</h3>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black shrink-0 ${
                              s.gender === "Putra" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {s.gender === "Putra" ? "L" : "P"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B]">Wali: {s.waliName}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {s.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetType("SAMBANG");
                            setDeleteConfirmId(s.id);
                          }}
                          className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                          title="Hapus Sambangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF7EE] text-xs space-y-1">
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
                      {s.catatan && (
                        <p className="text-[#172033] pt-1 border-t border-[#D4C9B5]/40 truncate">
                          <span className="text-[#94A3B8]">Catatan: </span>
                          {s.catatan}
                        </p>
                      )}
                    </div>
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
