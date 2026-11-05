"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  RefreshCw,
  Edit2,
  Check,
  X,
  Trash2,
  ShieldCheck,
  FileSpreadsheet
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { StatusAbsensi, WaktuSholat, AbsensiRecord } from "@/lib/mock-data";

const ALL_PRAYERS: WaktuSholat[] = [
  "Subuh",
  "Dhuha",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya",
  "Tahajjud"
];

const PRAYER_SCHEDULE: Record<WaktuSholat, { time: string; period: string }> = {
  Tahajjud: { time: "03:30 WIB", period: "Malam / Sepertiga Akhir" },
  Subuh: { time: "05:00 WIB", period: "Pagi Buta" },
  Dhuha: { time: "09:30 WIB", period: "Pagi Menjelang Siang" },
  Dzuhur: { time: "12:30 WIB", period: "Siang Hari" },
  Ashar: { time: "15:45 WIB", period: "Sore Hari" },
  Maghrib: { time: "18:20 WIB", period: "Petang Hari" },
  Isya: { time: "19:35 WIB", period: "Awal Malam" }
};

export default function AdminAbsensiPage() {
  const {
    absensiList,
    santriList,
    refreshData,
    updateAbsensi,
    deleteAbsensi,
    deleteAbsensiBulk,
    showToast
  } = useMizan();

  const [selectedAbsensiIds, setSelectedAbsensiIds] = useState<string[]>([]);
  const [isBulkDeleteModeSession, setIsBulkDeleteModeSession] = useState(false);
  const [isBulkDeleteModeLog, setIsBulkDeleteModeLog] = useState(false);
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

  const [activeTab, setActiveTab] = useState<"SESI" | "SEMUA_LOG">("SESI");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [selectedPrayerSession, setSelectedPrayerSession] = useState<WaktuSholat | null>(null);

  const availableDates = useMemo(() => {
    const datesSet = new Set<string>();
    absensiList.forEach((a) => {
      if (a.date) datesSet.add(a.date);
    });
    const sorted = Array.from(datesSet).sort((a, b) => b.localeCompare(a));
    if (sorted.length === 0) {
      sorted.push("2026-11-01");
    }
    return sorted;
  }, [absensiList]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return availableDates[0] || "2026-11-01";
  });

  const [detailStatusFilter, setDetailStatusFilter] = useState<"ALL" | StatusAbsensi>("ALL");
  const [detailSearchQuery, setDetailSearchQuery] = useState("");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editStatusVal, setEditStatusVal] = useState<StatusAbsensi>("Hadir");
  const [editNotesVal, setEditNotesVal] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logPrayerFilter, setLogPrayerFilter] = useState<"ALL" | WaktuSholat>("ALL");
  const [logStatusFilter, setLogStatusFilter] = useState<"ALL" | StatusAbsensi>("ALL");
  const [logDateFilter, setLogDateFilter] = useState<string>("ALL");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    showToast("Data presensi berhasil disinkronkan");
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const days = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    const dayName = days[dateObj.getDay()] || "";
    const monthName = months[dateObj.getMonth()] || "";
    return `${dayName}, ${day} ${monthName}`;
  };

  const getRelativeDateTag = (dateStr: string) => {
    if (dateStr === "2026-11-01") return "Hari Ini";
    if (dateStr === "2026-10-31") return "Kemarin";
    if (dateStr === "2026-10-30") return "2 Hari Lalu";
    if (dateStr === "2026-10-29") return "3 Hari Lalu";
    if (dateStr === "2026-10-28") return "4 Hari Lalu";
    return "";
  };

  const getPrayerIcon = (prayer: WaktuSholat) => {
    switch (prayer) {
      case "Tahajjud":
        return <Moon className="w-4 h-4 text-purple-600" />;
      case "Subuh":
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case "Dhuha":
        return <Sun className="w-4 h-4 text-amber-600" />;
      case "Dzuhur":
        return <Sun className="w-4 h-4 text-emerald-600" />;
      case "Ashar":
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case "Maghrib":
        return <Sunset className="w-4 h-4 text-rose-500" />;
      case "Isya":
        return <Moon className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-[#1B4D3E]" />;
    }
  };

  const dayDateStats = useMemo(() => {
    const map = new Map<string, { total: number; hadir: number; izin: number; sakit: number; alpa: number; sessionsCount: number }>();
    availableDates.forEach((d) => {
      const records = absensiList.filter((a) => {
        const matchDate = a.date === d;
        const matchGender = selectedGender === "ALL" || a.gender === selectedGender;
        return matchDate && matchGender;
      });

      const total = records.length;
      const hadir = records.filter((r) => r.status === "Hadir").length;
      const izin = records.filter((r) => r.status === "Izin").length;
      const sakit = records.filter((r) => r.status === "Sakit").length;
      const alpa = records.filter((r) => r.status === "Alpa").length;

      const sessionsSet = new Set<string>();
      records.forEach((r) => {
        if (r.waktuSholat) sessionsSet.add(r.waktuSholat);
      });

      map.set(d, {
        total,
        hadir,
        izin,
        sakit,
        alpa,
        sessionsCount: sessionsSet.size
      });
    });
    return map;
  }, [availableDates, absensiList, selectedGender]);

  const selectedDayOverview = useMemo(() => {
    const stats = dayDateStats.get(selectedDate) || {
      total: 0,
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
      sessionsCount: 0
    };
    const rate = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
    return {
      ...stats,
      rate
    };
  }, [dayDateStats, selectedDate]);

  const prayerSessionsData = useMemo(() => {
    return ALL_PRAYERS.map((prayer) => {
      const records = absensiList.filter((a) => {
        const matchDate = a.date === selectedDate;
        const matchPrayer = (a.waktuSholat || "Subuh") === prayer;
        const matchGender = selectedGender === "ALL" || a.gender === selectedGender;
        return matchDate && matchPrayer && matchGender;
      });

      const total = records.length;
      const hadir = records.filter((r) => r.status === "Hadir").length;
      const izin = records.filter((r) => r.status === "Izin").length;
      const sakit = records.filter((r) => r.status === "Sakit").length;
      const alpa = records.filter((r) => r.status === "Alpa").length;
      const pctHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

      const bkNamesSet = new Set<string>();
      records.forEach((r) => {
        if (r.guruName) bkNamesSet.add(r.guruName);
      });
      const bkStaff = Array.from(bkNamesSet);

      const submitTime = records[0]?.createdAt || "-";

      const specialNotes = records
        .filter((r) => (r.status !== "Hadir" || r.notes) && r.notes)
        .map((r) => `${r.santriName} (${r.status}): ${r.notes}`);

      return {
        prayer,
        schedule: PRAYER_SCHEDULE[prayer],
        isRecorded: total > 0,
        total,
        hadir,
        izin,
        sakit,
        alpa,
        pctHadir,
        bkStaff,
        submitTime,
        specialNotes,
        records
      };
    });
  }, [absensiList, selectedDate, selectedGender]);

  const activeSessionDetail = useMemo(() => {
    if (!selectedPrayerSession) return null;
    return prayerSessionsData.find((ps) => ps.prayer === selectedPrayerSession) || null;
  }, [selectedPrayerSession, prayerSessionsData]);

  const filteredSessionRecords = useMemo(() => {
    if (!activeSessionDetail) return [];
    return activeSessionDetail.records.filter((rec) => {
      const matchStatus =
        detailStatusFilter === "ALL" || rec.status === detailStatusFilter;
      const q = detailSearchQuery.toLowerCase().trim();
      const matchQuery =
        q === "" ||
        rec.santriName.toLowerCase().includes(q) ||
        rec.santriClass.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [activeSessionDetail, detailStatusFilter, detailSearchQuery]);

  const filteredLogRecords = useMemo(() => {
    return absensiList.filter((rec) => {
      const matchDate = logDateFilter === "ALL" || rec.date === logDateFilter;
      const matchPrayer =
        logPrayerFilter === "ALL" || (rec.waktuSholat || "Subuh") === logPrayerFilter;
      const matchStatus =
        logStatusFilter === "ALL" || rec.status === logStatusFilter;
      const matchGender =
        selectedGender === "ALL" || rec.gender === selectedGender;
      const q = logSearchQuery.toLowerCase().trim();
      const matchQuery =
        q === "" ||
        rec.santriName.toLowerCase().includes(q) ||
        rec.santriClass.toLowerCase().includes(q) ||
        (rec.guruName && rec.guruName.toLowerCase().includes(q));
      return matchDate && matchPrayer && matchStatus && matchGender && matchQuery;
    });
  }, [absensiList, logDateFilter, logPrayerFilter, logStatusFilter, selectedGender, logSearchQuery]);

  const handleStartEdit = (rec: AbsensiRecord) => {
    setEditingRecordId(rec.id);
    setEditStatusVal(rec.status);
    setEditNotesVal(rec.notes || "");
  };

  const handleSaveEdit = async (id: string) => {
    const res = await updateAbsensi(id, editStatusVal, editNotesVal);
    if (res.success) {
      showToast("Catatan absensi berhasil diperbarui");
      setEditingRecordId(null);
    } else {
      showToast(res.message || "Gagal memperbarui", "error");
    }
  };

  const toggleSelectAbsensi = (id: string) => {
    setSelectedAbsensiIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllAbsensi = (items: AbsensiRecord[]) => {
    const itemIds = items.map((i) => i.id);
    const allSelected = itemIds.length > 0 && itemIds.every((id) => selectedAbsensiIds.includes(id));
    if (allSelected) {
      setSelectedAbsensiIds((prev) => prev.filter((id) => !itemIds.includes(id)));
    } else {
      setSelectedAbsensiIds((prev) => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  const handleOpenDeleteSingle = (item: AbsensiRecord) => {
    setDeleteModalState({
      isOpen: true,
      ids: [item.id],
      name: item.santriName,
      count: 1
    });
  };

  const handleOpenDeleteBulk = () => {
    if (selectedAbsensiIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      ids: selectedAbsensiIds,
      count: selectedAbsensiIds.length
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
      }
      setSelectedAbsensiIds((prev) => prev.filter((id) => !deleteModalState.ids.includes(id)));
      setIsBulkDeleteModeSession(false);
      setIsBulkDeleteModeLog(false);
      setDeleteModalState({ isOpen: false, ids: [] });
    } finally {
      setDeleteModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              Monitoring Absensi
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Rekapitulasi presensi sholat harian santri dan santriwati
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#1B4D3E]" : "text-[#64748B]"}`} />
              <span>Sinkron</span>
            </button>
            <Link
              href="/admin/dashboard"
              className="px-3.5 py-2 rounded-2xl bg-[#EEF2F6] text-[#172033] text-xs font-bold hover:bg-[#E2E8F0] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-[#E2EBF4] pb-2">
          <div className="inline-flex rounded-2xl p-1 bg-[#EEF2F6]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("SESI");
                setSelectedPrayerSession(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "SESI"
                  ? "bg-white text-[#1B4D3E] shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Sesi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SEMUA_LOG")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "SEMUA_LOG"
                  ? "bg-white text-[#1B4D3E] shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </div>

          <div className="inline-flex rounded-2xl p-1 bg-[#EEF2F6]">
            {(["ALL", "Putra", "Putri"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGender(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGender === g
                    ? "bg-white text-[#1B4D3E] shadow-xs"
                    : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                {g === "ALL" ? "Semua" : g === "Putra" ? "L" : "P"}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "SESI" && !selectedPrayerSession && (
          <div className="space-y-4">
            <Card className="p-4 sm:p-5 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Pilih Hari & Riwayat Tanggal
                  </span>
                  <h2 className="text-sm font-bold text-[#172033]">
                    Jadwal Presensi Sholat Harian Santri
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-[#64748B] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    <span>Pilih Tanggal:</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                {availableDates.map((d) => {
                  const stat = dayDateStats.get(d);
                  const isSelected = selectedDate === d;
                  const relTag = getRelativeDateTag(d);

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`shrink-0 p-2.5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-sm"
                          : "bg-white text-[#172033] border-[#E2EBF4] hover:border-[#1B4D3E]/40 hover:bg-[#FAF7EE]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isSelected ? "text-white/80" : "text-[#A8833E]"
                        }`}>
                          {relTag || "Riwayat"}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-[#EEF2F6] text-[#64748B]"
                        }`}>
                          {stat?.sessionsCount || 0}/7 Sesi
                        </span>
                      </div>
                      <p className="text-xs font-bold mt-1">
                        {formatDateLabel(d)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        <span className={isSelected ? "text-emerald-200" : "text-[#065F46] font-semibold"}>
                          ✓ {stat?.hadir || 0} Hadir
                        </span>
                        {(stat?.alpa || 0) > 0 && (
                          <span className={isSelected ? "text-red-200" : "text-red-600 font-semibold"}>
                            • {stat?.alpa} Alpa
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="p-4 sm:p-5 rounded-2xl mizan-card bg-gradient-to-br from-white via-white to-[#FAF7EE] border border-[#E2EBF4] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                      Ringkasan Hari: {selectedDate}
                    </span>
                    {getRelativeDateTag(selectedDate) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46]">
                        {getRelativeDateTag(selectedDate)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-black text-[#172033] mt-1">
                    Rekapitulasi Sesi: {formatDateLabel(selectedDate)}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Pilih sesi sholat untuk rincian
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                      Tingkat Kehadiran
                    </span>
                    <span className="text-2xl font-black font-mono text-[#065F46]">
                      {selectedDayOverview.rate}%
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl mizan-inset text-[#065F46] flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Kelengkapan Sesi
                  </span>
                  <div className="text-lg font-black font-mono text-[#172033] mt-0.5">
                    {selectedDayOverview.sessionsCount} <span className="text-xs font-normal text-[#94A3B8]">/ 7 Waktu</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] block">
                    Total Santri Hadir
                  </span>
                  <div className="text-lg font-black font-mono text-[#065F46] mt-0.5">
                    {selectedDayOverview.hadir} <span className="text-xs font-normal text-[#94A3B8]">/{selectedDayOverview.total}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8833E] block">
                    Izin & Sakit
                  </span>
                  <div className="text-lg font-black font-mono text-[#A8833E] mt-0.5">
                    {selectedDayOverview.izin + selectedDayOverview.sakit}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                    Alpa Sholat
                  </span>
                  <div className="text-lg font-black font-mono text-red-600 mt-0.5">
                    {selectedDayOverview.alpa}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A8833E]" />
                  <span>Sesi Sholat ({selectedDayOverview.sessionsCount}/7)</span>
                </h3>
                <span className="text-[11px] text-[#64748B]">
                  Pilih sesi untuk rincian
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prayerSessionsData.map((session) => {
                  const isComplete = session.isRecorded;

                  return (
                    <div
                      key={session.prayer}
                      className={`p-4 rounded-2xl border transition-all ${
                        isComplete
                          ? "bg-white border-[#E2EBF4] hover:border-[#1B4D3E] shadow-2xs"
                          : "bg-[#FAF7EE]/40 border-dashed border-[#CBD5E1]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-[#F1F5F9]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl mizan-inset flex items-center justify-center shrink-0">
                            {getPrayerIcon(session.prayer)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-[#172033]">
                                Sholat {session.prayer}
                              </h4>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EEF2F6] text-[#64748B]">
                                {session.schedule.time}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#94A3B8]">
                              {session.schedule.period}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isComplete ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Selesai</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#64748B]">
                              Belum Diabsen
                            </span>
                          )}
                        </div>
                      </div>

                      {isComplete ? (
                        <div className="pt-3 space-y-3">
                          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#1B4D3E] text-white flex items-center justify-center text-[10px] font-bold">
                                BK
                              </div>
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                                  Petugas Pengasuhan
                                </span>
                                <span className="text-xs font-bold text-[#172033] block truncate max-w-[200px] sm:max-w-[240px]">
                                  {session.bkStaff.join(", ") || "Tim Pengasuhan"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                                Waktu Input
                              </span>
                              <span className="text-[11px] font-mono font-bold text-[#1B4D3E]">
                                {session.submitTime}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                              <span className="text-[#64748B]">Tingkat Kehadiran:</span>
                              <span className="font-mono text-[#065F46]">
                                {session.pctHadir}% ({session.hadir}/{session.total})
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#EEF2F6] overflow-hidden">
                              <div
                                style={{ width: `${session.pctHadir}%` }}
                                className={`h-full rounded-full transition-all ${
                                  session.pctHadir >= 90
                                    ? "bg-[#1B4D3E]"
                                    : session.pctHadir >= 75
                                    ? "bg-[#C5A059]"
                                    : "bg-red-500"
                                }`}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-[#065F46] font-bold">✓ {session.hadir} Hadir</span>
                              {session.izin > 0 && <span className="text-[#A8833E] font-bold">• {session.izin} Izin</span>}
                              {session.sakit > 0 && <span className="text-blue-600 font-bold">• {session.sakit} Sakit</span>}
                              {session.alpa > 0 && <span className="text-red-600 font-bold">• {session.alpa} Alpa</span>}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPrayerSession(session.prayer);
                                setDetailStatusFilter("ALL");
                                setDetailSearchQuery("");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#1B4D3E] text-white font-bold hover:bg-[#153e32] transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <span>Detail</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-xs text-[#94A3B8]">
                            Belum tercatat presensi
                          </p>
                          <Link
                            href="/bk/absen"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B4D3E] hover:underline mt-2"
                          >
                            <span>Input</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "SESI" && selectedPrayerSession && activeSessionDetail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setSelectedPrayerSession(null)}
                className="px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#1B4D3E]" />
                <span>Kembali</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B]">Tanggal:</span>
                <span className="text-xs font-bold text-[#172033] bg-[#EEF2F6] px-2.5 py-1 rounded-xl">
                  {formatDateLabel(selectedDate)}
                </span>
              </div>
            </div>

            <Card className="p-4 sm:p-5 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl mizan-inset flex items-center justify-center shrink-0">
                    {getPrayerIcon(activeSessionDetail.prayer)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                        Detail Presensi
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EEF2F6] text-[#172033]">
                        {activeSessionDetail.schedule.time}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-serif font-black text-[#172033] mt-1">
                      Sholat {activeSessionDetail.prayer} • {formatDateLabel(selectedDate)}
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      {activeSessionDetail.schedule.period} • {activeSessionDetail.total} santri
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] min-w-[220px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Petugas BK / Pengasuhan
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      BK
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#172033]">
                        {activeSessionDetail.bkStaff.join(", ") || "Tim Pengasuhan BK"}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        Diinput: {activeSessionDetail.submitTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] block">
                    Tingkat Kehadiran
                  </span>
                  <div className="text-xl font-black font-mono text-[#065F46] mt-0.5">
                    {activeSessionDetail.pctHadir}%
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D3E] block">
                    Santri Hadir
                  </span>
                  <div className="text-xl font-black font-mono text-[#1B4D3E] mt-0.5">
                    {activeSessionDetail.hadir} <span className="text-xs font-normal text-[#64748B]">/{activeSessionDetail.total}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8833E] block">
                    Izin / Sakit
                  </span>
                  <div className="text-xl font-black font-mono text-[#A8833E] mt-0.5">
                    {activeSessionDetail.izin + activeSessionDetail.sakit}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                    Alpa Sholat
                  </span>
                  <div className="text-xl font-black font-mono text-red-600 mt-0.5">
                    {activeSessionDetail.alpa}
                  </div>
                </div>
              </div>

              {activeSessionDetail.specialNotes.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#92400E] block flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Catatan Khusus Petugas Pengasuhan:</span>
                  </span>
                  <ul className="text-xs text-[#78350F] space-y-1 list-disc list-inside">
                    {activeSessionDetail.specialNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-5 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                    Daftar Kehadiran Santri Sesi {activeSessionDetail.prayer}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Menampilkan {filteredSessionRecords.length} dari {activeSessionDetail.total} santri terdata
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Cari santri / kelas..."
                      value={detailSearchQuery}
                      onChange={(e) => setDetailSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none w-full sm:w-48 font-semibold"
                    />
                  </div>

                  <div className="inline-flex rounded-xl p-0.5 bg-[#EEF2F6]">
                    {(["ALL", "Hadir", "Izin", "Sakit", "Alpa"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setDetailStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          detailStatusFilter === st
                            ? "bg-white text-[#1B4D3E] shadow-2xs"
                            : "text-[#64748B] hover:text-[#172033]"
                        }`}
                      >
                        {st === "ALL" ? "Semua" : st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-1 py-1">
                {!isBulkDeleteModeSession ? (
                  <button
                    type="button"
                    onClick={() => setIsBulkDeleteModeSession(true)}
                    className="px-3 py-1 rounded-xl text-[11px] font-bold border border-[#E2E8F0] bg-white text-[#64748B] hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Hapus Massal</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => handleSelectAllAbsensi(filteredSessionRecords)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        filteredSessionRecords.length > 0 && filteredSessionRecords.every((i) => selectedAbsensiIds.includes(i.id))
                          ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{filteredSessionRecords.length > 0 && filteredSessionRecords.every((i) => selectedAbsensiIds.includes(i.id)) ? "Batal Semua" : "Pilih Semua"}</span>
                    </button>
                    {selectedAbsensiIds.length > 0 && (
                      <span className="text-[11px] text-[#64748B] font-medium">
                        {selectedAbsensiIds.length} terpilih
                      </span>
                    )}
                    {selectedAbsensiIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleOpenDeleteBulk}
                        className="px-3 py-1 rounded-xl bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus ({selectedAbsensiIds.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkDeleteModeSession(false);
                        setSelectedAbsensiIds([]);
                      }}
                      className="px-2 py-1 rounded-xl text-[11px] font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <X className="w-3 h-3" />
                      <span>Batal</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="divide-y divide-[#E2EBF4]">
                {filteredSessionRecords.map((item) => {
                  const isEditing = editingRecordId === item.id;
                  const santriInfo = santriList.find((s) => s.id === item.santriId);
                  const isSelected = selectedAbsensiIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 rounded-xl transition-colors ${
                        isSelected ? "bg-red-50/40" : "hover:bg-[#FAF7EE]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isBulkDeleteModeSession && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectAbsensi(item.id)}
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer shrink-0 animate-in fade-in duration-150"
                            aria-label={`Pilih ${item.santriName}`}
                          />
                        )}
                        <div className="w-9 h-9 rounded-xl bg-[#EEF2F6] text-[#172033] flex items-center justify-center font-bold text-xs shrink-0">
                          {item.santriName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#172033]">
                              {item.santriName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EEF2F6] text-[#64748B] font-bold whitespace-nowrap">
                              {item.santriClass}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              item.gender === "Putra" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                            }`}>
                              {item.gender === "Putra" ? "L" : "P"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#64748B]">
                            <span>Asrama: {santriInfo?.asrama || "Pondok"} / Kamar {santriInfo?.kamar || "-"}</span>
                            <span>•</span>
                            <span>Petugas: {item.guruName || "Tim BK"}</span>
                          </div>
                          {item.notes && !isEditing && (
                            <p className="text-[11px] text-[#A8833E] font-medium mt-1 bg-[#FAF7EE] px-2 py-0.5 rounded-lg border border-[#C5A059]/20 inline-block">
                              Catatan: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isEditing ? (
                          <div className="flex items-center gap-2 bg-[#FAF7EE] p-2 rounded-xl border border-[#C5A059]/30">
                            <select
                              value={editStatusVal}
                              onChange={(e) => setEditStatusVal(e.target.value as StatusAbsensi)}
                              className="px-2.5 py-1 text-xs font-bold bg-white border border-[#CBD5E1] rounded-lg focus:outline-none"
                            >
                              <option value="Hadir">Hadir</option>
                              <option value="Izin">Izin</option>
                              <option value="Sakit">Sakit</option>
                              <option value="Alpa">Alpa</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Keterangan..."
                              value={editNotesVal}
                              onChange={(e) => setEditNotesVal(e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-none w-36"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1.5 rounded-lg bg-[#1B4D3E] text-white hover:bg-[#153e32]"
                              title="Simpan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRecordId(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-[#172033] hover:bg-slate-300"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                item.status === "Hadir"
                                  ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                  : item.status === "Izin"
                                  ? "bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30"
                                  : item.status === "Sakit"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {item.status}
                            </span>
                            <span
                              className={`text-xs font-mono font-bold ${
                                item.scoreImpact > 0
                                  ? "text-[#065F46]"
                                  : item.scoreImpact < 0
                                  ? "text-red-600"
                                  : "text-[#64748B]"
                              }`}
                            >
                              {item.scoreImpact > 0 ? `+${item.scoreImpact.toFixed(3).replace(".", ",")}` : item.scoreImpact < 0 ? `-${Math.abs(item.scoreImpact).toFixed(3).replace(".", ",")}` : "0,000"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-[#EEF2F6] text-[#64748B] hover:text-[#172033] transition-colors"
                              title="Ubah"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteSingle(item)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredSessionRecords.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#94A3B8]">
                    Data tidak ditemukan
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "SEMUA_LOG" && (
          <div className="space-y-4">
            <Card className="p-4 sm:p-5 bg-white space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Cari Santri / Guru BK
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Nama santri, kelas, guru..."
                      value={logSearchQuery}
                      onChange={(e) => setLogSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl text-xs font-semibold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Waktu Sholat
                  </label>
                  <select
                    value={logPrayerFilter}
                    onChange={(e) => setLogPrayerFilter(e.target.value as "ALL" | WaktuSholat)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="ALL">Semua Waktu</option>
                    {ALL_PRAYERS.map((time) => (
                      <option key={time} value={time}>
                        Sholat {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Status Kehadiran
                  </label>
                  <select
                    value={logStatusFilter}
                    onChange={(e) => setLogStatusFilter(e.target.value as "ALL" | StatusAbsensi)}
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
                    Tanggal Presensi
                  </label>
                  <select
                    value={logDateFilter}
                    onChange={(e) => setLogDateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="ALL">Semua Tanggal (Total {absensiList.length})</option>
                    {availableDates.map((d) => (
                      <option key={d} value={d}>
                        {formatDateLabel(d)} ({d})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                    Riwayat Presensi ({filteredLogRecords.length})
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Riwayat presensi santri dan santriwati
                  </p>
                </div>

                {!isBulkDeleteModeLog ? (
                  <button
                    type="button"
                    onClick={() => setIsBulkDeleteModeLog(true)}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold border border-[#E2E8F0] bg-white text-[#64748B] hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                    <span>Hapus Massal</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => handleSelectAllAbsensi(filteredLogRecords)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer active:scale-95 ${
                        filteredLogRecords.length > 0 && filteredLogRecords.every((i) => selectedAbsensiIds.includes(i.id))
                          ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{filteredLogRecords.length > 0 && filteredLogRecords.every((i) => selectedAbsensiIds.includes(i.id)) ? "Batal Semua" : "Pilih Semua"}</span>
                    </button>

                    {selectedAbsensiIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleOpenDeleteBulk}
                        className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus ({selectedAbsensiIds.length})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkDeleteModeLog(false);
                        setSelectedAbsensiIds([]);
                      }}
                      className="px-2 py-1 rounded-xl text-[10px] font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <X className="w-3 h-3" />
                      <span>Batal</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="divide-y divide-[#E2EBF4] max-h-[600px] overflow-y-auto pr-1">
                {filteredLogRecords.map((item) => {
                  const isEditing = editingRecordId === item.id;
                  const isSelected = selectedAbsensiIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 rounded-xl transition-colors ${
                        isSelected ? "bg-red-50/40" : "hover:bg-[#FAF7EE]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isBulkDeleteModeLog && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectAbsensi(item.id)}
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer shrink-0 animate-in fade-in duration-150"
                            aria-label={`Pilih ${item.santriName}`}
                          />
                        )}
                        <div className="w-8 h-8 rounded-xl bg-[#EEF2F6] flex items-center justify-center shrink-0">
                          {getPrayerIcon((item.waktuSholat || "Subuh") as WaktuSholat)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#172033]">
                              {item.santriName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EEF2F6] text-[#64748B] font-bold whitespace-nowrap">
                              {item.santriClass}
                            </span>
                            <span className="text-[10px] font-bold text-[#1B4D3E]">
                              Sholat {item.waktuSholat || "Subuh"}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] mt-0.5">
                            {formatDateLabel(item.date)} ({item.date}) • Diinput oleh: {item.guruName || "Pengasuhan BK"} ({item.createdAt})
                          </p>
                          {item.notes && !isEditing && (
                            <p className="text-[11px] text-[#A8833E] mt-0.5">
                              Catatan: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isEditing ? (
                          <div className="flex items-center gap-2 bg-[#FAF7EE] p-2 rounded-xl border border-[#C5A059]/30">
                            <select
                              value={editStatusVal}
                              onChange={(e) => setEditStatusVal(e.target.value as StatusAbsensi)}
                              className="px-2.5 py-1 text-xs font-bold bg-white border border-[#CBD5E1] rounded-lg focus:outline-none"
                            >
                              <option value="Hadir">Hadir</option>
                              <option value="Izin">Izin</option>
                              <option value="Sakit">Sakit</option>
                              <option value="Alpa">Alpa</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Keterangan..."
                              value={editNotesVal}
                              onChange={(e) => setEditNotesVal(e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-none w-36"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1.5 rounded-lg bg-[#1B4D3E] text-white hover:bg-[#153e32]"
                              title="Simpan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRecordId(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-[#172033] hover:bg-slate-300"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                item.status === "Hadir"
                                  ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                  : item.status === "Izin"
                                  ? "bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30"
                                  : item.status === "Sakit"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {item.status}
                            </span>
                            <span
                              className={`text-xs font-mono font-bold ${
                                item.scoreImpact > 0
                                  ? "text-[#065F46]"
                                  : item.scoreImpact < 0
                                  ? "text-red-600"
                                  : "text-[#64748B]"
                              }`}
                            >
                              {item.scoreImpact > 0 ? `+${item.scoreImpact.toFixed(3).replace(".", ",")}` : item.scoreImpact < 0 ? `-${Math.abs(item.scoreImpact).toFixed(3).replace(".", ",")}` : "0,000"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-[#EEF2F6] text-[#64748B] hover:text-[#172033] transition-colors"
                              title="Ubah"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteSingle(item)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredLogRecords.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#94A3B8]">
                    Data tidak ditemukan
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, ids: [] })}
        onConfirm={handleConfirmDelete}
        count={deleteModalState.count}
        message={
          deleteModalState.count === 1 && deleteModalState.name
            ? `Hapus catatan presensi untuk ${deleteModalState.name}?`
            : undefined
        }
        isLoading={deleteModalState.isLoading}
      />
    </RoleShell>
  );
}
