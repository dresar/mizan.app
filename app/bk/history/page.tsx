"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Search
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { StatusAbsensi, WaktuSholat } from "@/lib/mock-data";

const PRAYER_TIMES: ("ALL" | WaktuSholat)[] = [
  "ALL",
  "Subuh",
  "Dhuha",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya",
  "Tahajjud"
];

export default function PengasuhanHistoryPage() {
  const { absensiList, santriList, currentUser, kelasList, updateAbsensi, deleteAbsensi } = useMizan();

  const [selectedPrayer, setSelectedPrayer] = useState<"ALL" | WaktuSholat>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | StatusAbsensi>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editStatusVal, setEditStatusVal] = useState<StatusAbsensi>("Hadir");

  const filteredHistory = useMemo(() => {
    return absensiList.filter((item) => {
      const matchPrayer =
        selectedPrayer === "ALL" || (item.waktuSholat || "Subuh") === selectedPrayer;
      const matchStatus =
        selectedStatus === "ALL" || item.status === selectedStatus;
      const matchClass =
        selectedClass === "ALL" || item.santriClass === selectedClass;
      const matchSearch =
        searchQuery.trim() === "" ||
        item.santriName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGender =
        currentUser.role === "SUPER_ADMIN" ||
        (() => {
          const s = santriList.find((santri) => santri.id === item.santriId);
          return !s || s.gender === currentUser.gender;
        })();

      return matchPrayer && matchStatus && matchClass && matchSearch && matchGender;
    });
  }, [absensiList, santriList, currentUser, selectedPrayer, selectedStatus, selectedClass, searchQuery]);

  const handleStartEdit = (id: string, currentStatus: StatusAbsensi) => {
    setEditingRecordId(id);
    setEditStatusVal(currentStatus);
  };

  const handleSaveEdit = async (id: string) => {
    await updateAbsensi(id, editStatusVal);
    setEditingRecordId(null);
  };

  const handleDelete = async (id: string, santriName: string) => {
    if (confirm(`Hapus catatan absensi untuk ${santriName}?`)) {
      await deleteAbsensi(id);
    }
  };

  const formatScore = (impact: number) => {
    const val = Math.abs(impact).toFixed(3).replace(".", ",");
    if (impact > 0) return `+${val}`;
    if (impact < 0) return `-${val}`;
    return "0,000";
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                Bagian Pengasuhan Santri (BK)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1">
              Riwayat Presensi Sholat
            </h1>
            <p className="text-xs text-[#64748B]">
              Catatan riwayat presensi sholat 7 waktu santri (dapat diedit dan dihapus)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/bk/absen"
              className="px-4 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-sm"
            >
              Input Absen Baru
            </Link>
          </div>
        </div>

        <Card className="p-4 sm:p-5 bg-white space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                Waktu Sholat
              </label>
              <select
                value={selectedPrayer}
                onChange={(e) => setSelectedPrayer(e.target.value as "ALL" | WaktuSholat)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              >
                {PRAYER_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time === "ALL" ? "Semua Waktu" : `Sholat ${time}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                Status Kehadiran
              </label>
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

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                Filter Kelas
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              >
                <option value="ALL">Semua Kelas</option>
                {kelasList.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                Cari Santri
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Nama santri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Daftar Catatan ({filteredHistory.length})
            </h2>
            <span className="text-[10px] text-[#64748B]">
              Klik tombol edit untuk mengubah status kehadiran
            </span>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              Tidak ada catatan riwayat presensi yang sesuai.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item) => {
                const isEditing = editingRecordId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl mizan-card-sub flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#1B4D3E]/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl mizan-inset flex items-center justify-center font-bold text-xs text-[#1B4D3E] shrink-0">
                        {item.santriName.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-[#172033] truncate">
                            {item.santriName}
                          </p>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2F6] text-[#475569]">
                            Kelas {item.santriClass}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E]">
                            Sholat {item.waktuSholat || "Subuh"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-0.5">
                          {item.date} • Dicatat: {item.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={editStatusVal}
                            onChange={(e) => setEditStatusVal(e.target.value as StatusAbsensi)}
                            className="px-2 py-1 text-xs font-bold bg-[#EEF2F6] rounded-lg border border-transparent"
                          >
                            <option value="Hadir">Hadir</option>
                            <option value="Izin">Izin</option>
                            <option value="Sakit">Sakit</option>
                            <option value="Alpa">Alpa</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 rounded-lg bg-[#1B4D3E] text-white hover:bg-[#153e32]"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRecordId(null)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              item.status === "Hadir"
                                ? "bg-[#ECFDF5] text-[#065F46]"
                                : item.status === "Alpa"
                                ? "bg-red-100 text-red-700"
                                : item.status === "Sakit"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.status} ({formatScore(item.scoreImpact)})
                          </span>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(item.id, item.status)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B4D3E] hover:bg-[#EEF2F6]"
                            title="Edit Status"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.santriName)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </RoleShell>
  );
}