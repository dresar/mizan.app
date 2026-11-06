"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
  AlertTriangle
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { StatusAbsensi, WaktuSholat, AbsensiRecord } from "@/lib/mock-data";

const ALL_PRAYERS: WaktuSholat[] = [
  "Tahajjud",
  "Subuh",
  "Dhuha",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya"
];

export default function AdminAbsensiLogPage() {
  const { absensiList, updateAbsensi, deleteAbsensi, deleteAbsensiBulk, showToast } = useMizan();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [selectedPrayer, setSelectedPrayer] = useState<"ALL" | WaktuSholat>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | StatusAbsensi>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("ALL");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    ids: string[];
    name?: string;
    count?: number;
    isLoading?: boolean;
  }>({
    isOpen: false,
    ids: []
  });

  const [editingRecord, setEditingRecord] = useState<AbsensiRecord | null>(null);
  const [editStatus, setEditStatus] = useState<StatusAbsensi>("Hadir");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const availableDates = useMemo(() => {
    const set = new Set<string>();
    absensiList.forEach((a) => {
      if (a.date) set.add(a.date);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [absensiList]);

  const filteredLogs = useMemo(() => {
    return absensiList.filter((a) => {
      const matchGender = selectedGender === "ALL" || a.gender === selectedGender;
      const matchPrayer = selectedPrayer === "ALL" || (a.waktuSholat || "Subuh") === selectedPrayer;
      const matchStatus = selectedStatus === "ALL" || a.status === selectedStatus;
      const matchDate = selectedDate === "ALL" || a.date === selectedDate;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        a.santriName.toLowerCase().includes(q) ||
        a.santriClass.toLowerCase().includes(q) ||
        (a.guruName && a.guruName.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q));
      return matchGender && matchPrayer && matchStatus && matchDate && matchSearch;
    });
  }, [absensiList, selectedGender, selectedPrayer, selectedStatus, selectedDate, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredLogs.map((a) => a.id);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleOpenDeleteSingle = (rec: AbsensiRecord) => {
    setDeleteModalState({
      isOpen: true,
      ids: [rec.id],
      name: `${rec.santriName} (${rec.waktuSholat} ${rec.date})`,
      count: 1
    });
  };

  const handleOpenDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      ids: selectedIds,
      count: selectedIds.length
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModalState.ids.length === 0) return;
    setDeleteModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (deleteModalState.ids.length === 1) {
        await deleteAbsensi(deleteModalState.ids[0]);
      } else {
        await deleteAbsensiBulk(deleteModalState.ids);
        setSelectedIds([]);
        setIsBulkDeleteMode(false);
      }
      showToast("Data presensi berhasil dihapus");
    } catch {
      showToast("Gagal menghapus data", "error");
    } finally {
      setDeleteModalState({ isOpen: false, ids: [], isLoading: false });
    }
  };

  const handleOpenEdit = (rec: AbsensiRecord) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditNotes(rec.notes || "");
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setIsSavingEdit(true);
    const res = await updateAbsensi(editingRecord.id, editStatus, editNotes);
    setIsSavingEdit(false);
    if (res.success) {
      showToast("Catatan presensi berhasil diperbarui");
      setEditingRecord(null);
    } else {
      showToast(res.message || "Gagal memperbarui", "error");
    }
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showToast("Tidak ada data untuk diekspor", "error");
      return;
    }
    const headers = ["No", "Tanggal", "Waktu Sholat", "Nama Santri", "Kelas", "Gender", "Status", "Petugas", "Catatan"];
    const rows = filteredLogs.map((r, i) => [
      i + 1,
      r.date,
      r.waktuSholat || "Subuh",
      `"${r.santriName.replace(/"/g, '""')}"`,
      r.santriClass,
      r.gender,
      r.status,
      `"${(r.guruName || "").replace(/"/g, '""')}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Log_Presensi_Sholat_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File CSV log presensi berhasil diunduh");
  };

  return (
    <RoleShell>
      <div className="p-3 sm:p-5 md:p-7 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/absensi"
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#1B4D3E]" />
              <span>Monitoring</span>
            </Link>
            <span className="text-xs text-[#94A3B8]">/</span>
            <span className="text-xs font-bold text-[#64748B]">Log Audit Presensi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Unduh CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBulkDeleteMode(!isBulkDeleteMode);
                if (isBulkDeleteMode) setSelectedIds([]);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                isBulkDeleteMode
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-white border border-[#E2EBF4] text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{isBulkDeleteMode ? "Batal Hapus Massal" : "Hapus Massal"}</span>
            </button>
          </div>
        </div>

        <Card className="p-4 sm:p-5 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h1 className="text-lg sm:text-xl font-serif font-black text-[#172033]">
                Log Riwayat Presensi Sholat
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Daftar rekaman presensi lengkap dengan detail waktu, santri, dan pengasuh
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#EEF2F6] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedGender("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedGender === "ALL" ? "bg-white text-[#172033] shadow-2xs" : "text-[#64748B]"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender("Putra")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedGender === "Putra" ? "bg-white text-[#065F46] shadow-2xs" : "text-[#64748B]"
                }`}
              >
                L (Putra)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender("Putri")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedGender === "Putri" ? "bg-white text-[#BE123C] shadow-2xs" : "text-[#64748B]"
                }`}
              >
                P (Putri)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Cari nama, kelas, atau petugas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              >
                <option value="ALL">Semua Tanggal</option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedPrayer}
                onChange={(e) => setSelectedPrayer(e.target.value as "ALL" | WaktuSholat)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              >
                <option value="ALL">Semua Waktu Sholat</option>
                {ALL_PRAYERS.map((p) => (
                  <option key={p} value={p}>
                    Sholat {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as "ALL" | StatusAbsensi)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpa">Alpa</option>
              </select>
            </div>
          </div>

          {isBulkDeleteMode && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-rose-700 border border-rose-300 hover:bg-rose-100 cursor-pointer"
                >
                  {filteredLogs.length > 0 && filteredLogs.every((l) => selectedIds.includes(l.id))
                    ? "Batal Pilih Semua"
                    : "Pilih Semua Terfilter"}
                </button>
                <span className="text-xs font-bold text-rose-800">
                  {selectedIds.length} catatan terpilih
                </span>
              </div>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenDeleteBulk}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus ({selectedIds.length})</span>
                </button>
              )}
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-5 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Hasil Log Presensi ({filteredLogs.length})
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              Tidak ada log presensi yang sesuai dengan kriteria filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2EBF4] text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#FAF7EE]/60">
                    {isBulkDeleteMode && <th className="p-3 w-10">Pilih</th>}
                    <th className="p-3 w-10">No</th>
                    <th className="p-3">Tanggal & Sesi</th>
                    <th className="p-3">Santri</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Petugas BK</th>
                    <th className="p-3">Catatan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBF4]">
                  {filteredLogs.map((rec, idx) => {
                    const isChecked = selectedIds.includes(rec.id);
                    return (
                      <tr key={rec.id} className="hover:bg-[#FAF7EE]/40 transition-colors">
                        {isBulkDeleteMode && (
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelect(rec.id)}
                              className="rounded border-[#CBD5E1] text-[#1B4D3E] focus:ring-[#1B4D3E]"
                            />
                          </td>
                        )}
                        <td className="p-3 font-mono text-[#94A3B8]">{idx + 1}</td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-bold text-[#172033]">{rec.waktuSholat || "Subuh"}</p>
                          <p className="text-[10px] text-[#64748B] font-mono">{rec.date}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-[#172033]">{rec.santriName}</p>
                          <p className="text-[10px] text-[#64748B] font-mono">NIS {rec.santriId}</p>
                        </td>
                        <td className="p-3 font-mono font-bold">{rec.santriClass}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              rec.gender === "Putra" ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FFF1F2] text-[#BE123C]"
                            }`}
                          >
                            {rec.gender === "Putra" ? "L" : "P"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold inline-block ${
                              rec.status === "Hadir"
                                ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                : rec.status === "Izin"
                                ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]"
                                : rec.status === "Sakit"
                                ? "bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]"
                                : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3 text-[#64748B]">{rec.guruName || "-"}</td>
                        <td className="p-3 text-[#64748B]">
                          {rec.notes ? (
                            <span className="text-[#172033] font-medium">{rec.notes}</span>
                          ) : (
                            <span className="text-[#CBD5E1]">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(rec)}
                              className="p-1.5 rounded-lg text-[#1B4D3E] hover:bg-[#EEF2F6] transition-colors"
                              title="Ubah Catatan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteSingle(rec)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {editingRecord && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md mizan-card p-5 bg-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Ubah Status Presensi
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {editingRecord.santriName} • Sholat {editingRecord.waktuSholat} ({editingRecord.date})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Status Presensi
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["Hadir", "Izin", "Sakit", "Alpa"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditStatus(st)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                          editStatus === st
                            ? st === "Hadir"
                              ? "bg-[#065F46] text-white border-[#065F46]"
                              : st === "Izin"
                              ? "bg-[#D97706] text-white border-[#D97706]"
                              : st === "Sakit"
                              ? "bg-[#2563EB] text-white border-[#2563EB]"
                              : "bg-[#DC2626] text-white border-[#DC2626]"
                            : "bg-white text-[#172033] border-[#E2EBF4] hover:bg-[#FAF7EE]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Catatan Khusus / Alasan
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Tulis catatan..."
                    className="w-full p-2.5 rounded-xl text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#64748B] bg-[#EEF2F6] hover:bg-[#E2E8F0]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#153e32] flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? "Menyimpan..." : "Simpan"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <DeleteModal
          isOpen={deleteModalState.isOpen}
          title={deleteModalState.count && deleteModalState.count > 1 ? "Hapus Massal Presensi" : "Hapus Catatan Presensi"}
          message={
            deleteModalState.count && deleteModalState.count > 1
              ? `Apakah Anda yakin ingin menghapus ${deleteModalState.count} catatan presensi terpilih? Tindakan ini tidak dapat dibatalkan.`
              : `Apakah Anda yakin ingin menghapus catatan presensi untuk ${deleteModalState.name}?`
          }
          isLoading={deleteModalState.isLoading}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteModalState({ isOpen: false, ids: [] })}
        />
      </div>
    </RoleShell>
  );
}
