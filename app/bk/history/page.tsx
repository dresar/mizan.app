"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Award,
  ShieldAlert,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { StatusAbsensi, WaktuSholat } from "@/lib/mock-data";
import { formatWIBDate, formatWIBDateTime, getWIBDate, getWIBTime } from "@/lib/date-utils";

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
  const {
    absensiList,
    penilaianList,
    accessibleSantriList,
    currentUser,
    kelasList,
    updateAbsensi,
    deleteAbsensi,
    deleteAbsensiBulk,
    deletePenilaian,
    deletePenilaianBulk
  } = useMizan();

  const [selectedAbsensiIds, setSelectedAbsensiIds] = useState<string[]>([]);
  const [selectedPenilaianIds, setSelectedPenilaianIds] = useState<string[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: "ABSENSI" | "PENILAIAN";
    ids: string[];
    name?: string;
    count?: number;
    isLoading?: boolean;
  }>({
    isOpen: false,
    type: "PENILAIAN",
    ids: []
  });

  const uParam = currentUser?.username ? `?u=${encodeURIComponent(currentUser.username)}` : "";
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<"PENILAIAN" | "ABSENSI">("PENILAIAN");

  const [penilaianPeriod, setPenilaianPeriod] = useState<"today" | "week" | "all">("today");
  const [penilaianType, setPenilaianType] = useState<"ALL" | "HASANAH" | "SAYYIAH">("ALL");
  const [penilaianClass, setPenilaianClass] = useState<string>("ALL");
  const [penilaianSearch, setPenilaianSearch] = useState<string>("");
  const [penilaianPage, setPenilaianPage] = useState<number>(1);

  const [absensiPrayer, setAbsensiPrayer] = useState<"ALL" | WaktuSholat>("ALL");
  const [absensiStatus, setAbsensiStatus] = useState<"ALL" | StatusAbsensi>("ALL");
  const [absensiClass, setAbsensiClass] = useState<string>("ALL");
  const [absensiSearch, setAbsensiSearch] = useState<string>("");
  const [absensiPage, setAbsensiPage] = useState<number>(1);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editStatusVal, setEditStatusVal] = useState<StatusAbsensi>("Hadir");

  const PAGE_SIZE = 15;

  const liveDateString = useMemo(() => {
    if (!currentTime) return "";
    return formatWIBDate(currentTime, "full");
  }, [currentTime]);

  const liveTimeString = useMemo(() => {
    if (!currentTime) return "";
    return `${getWIBTime(currentTime, true)} WIB`;
  }, [currentTime]);

  const availableClasses = useMemo(() => {
    if (isSuperAdmin) return kelasList;
    const classes = Array.from(new Set(accessibleSantriList.map((s) => s.class))).sort();
    return classes.length > 0
      ? classes
      : kelasList.filter((c) =>
          currentUser.gender === "Putri" ? c.endsWith("B") : c.endsWith("A")
        );
  }, [isSuperAdmin, kelasList, accessibleSantriList, currentUser.gender]);

  const todayDateStr = useMemo(() => (currentTime ? getWIBDate(currentTime) : ""), [currentTime]);

  const filteredPenilaian = useMemo(() => {
    return penilaianList.filter((item) => {
      const matchGender =
        isSuperAdmin ||
        (() => {
          const s = accessibleSantriList.find((santri) => santri.id === item.santriId);
          return !!s && s.gender === currentUser.gender;
        })();

      if (!matchGender) return false;

      if (penilaianPeriod === "today" && todayDateStr) {
        const itemDateStr = item.dateKey || (item.rawCreatedAt ? getWIBDate(item.rawCreatedAt) : "");
        if (itemDateStr && itemDateStr !== todayDateStr) {
          return false;
        }
      }

      if (penilaianType !== "ALL" && item.type !== penilaianType) {
        return false;
      }

      if (penilaianClass !== "ALL" && item.santriClass !== penilaianClass) {
        return false;
      }

      if (penilaianSearch.trim() !== "") {
        const q = penilaianSearch.toLowerCase();
        const matchName = item.santriName.toLowerCase().includes(q);
        const matchInd = (item.indicatorText || "").toLowerCase().includes(q);
        const matchCat = (item.category || "").toLowerCase().includes(q);
        const matchNotes = (item.notes || "").toLowerCase().includes(q);
        if (!matchName && !matchInd && !matchCat && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [
    penilaianList,
    accessibleSantriList,
    isSuperAdmin,
    currentUser.gender,
    penilaianPeriod,
    penilaianType,
    penilaianClass,
    penilaianSearch,
    todayDateStr
  ]);

  const totalPenilaianPages = Math.ceil(filteredPenilaian.length / PAGE_SIZE) || 1;
  const paginatedPenilaian = useMemo(() => {
    const start = (penilaianPage - 1) * PAGE_SIZE;
    return filteredPenilaian.slice(start, start + PAGE_SIZE);
  }, [filteredPenilaian, penilaianPage]);

  const filteredAbsensi = useMemo(() => {
    return absensiList.filter((item) => {
      const matchGender =
        isSuperAdmin ||
        (() => {
          const s = accessibleSantriList.find((santri) => santri.id === item.santriId);
          return !!s && s.gender === currentUser.gender;
        })();

      if (!matchGender) return false;

      if (absensiPrayer !== "ALL" && (item.waktuSholat || "Subuh") !== absensiPrayer) {
        return false;
      }

      if (absensiStatus !== "ALL" && item.status !== absensiStatus) {
        return false;
      }

      if (absensiClass !== "ALL" && item.santriClass !== absensiClass) {
        return false;
      }

      if (absensiSearch.trim() !== "") {
        const q = absensiSearch.toLowerCase();
        const matchName = item.santriName.toLowerCase().includes(q);
        const matchClass = item.santriClass.toLowerCase().includes(q);
        if (!matchName && !matchClass) {
          return false;
        }
      }

      return true;
    });
  }, [
    absensiList,
    accessibleSantriList,
    isSuperAdmin,
    currentUser.gender,
    absensiPrayer,
    absensiStatus,
    absensiClass,
    absensiSearch
  ]);

  const totalAbsensiPages = Math.ceil(filteredAbsensi.length / PAGE_SIZE) || 1;
  const paginatedAbsensi = useMemo(() => {
    const start = (absensiPage - 1) * PAGE_SIZE;
    return filteredAbsensi.slice(start, start + PAGE_SIZE);
  }, [filteredAbsensi, absensiPage]);

  const stats = useMemo(() => {
    let hasanahCount = 0;
    let sayyiahCount = 0;
    let absensiHadirCount = 0;
    let absensiAlpaCount = 0;

    penilaianList.forEach((p) => {
      if (p.type === "HASANAH") hasanahCount++;
      if (p.type === "SAYYIAH") sayyiahCount++;
    });

    absensiList.forEach((a) => {
      if (a.status === "Hadir") absensiHadirCount++;
      if (a.status === "Alpa") absensiAlpaCount++;
    });

    return {
      hasanahCount,
      sayyiahCount,
      absensiHadirCount,
      absensiAlpaCount,
      totalPresensi: absensiList.length,
      totalCatatan: penilaianList.length
    };
  }, [penilaianList, absensiList]);

  const handleStartEditAbsensi = (id: string, currentStatus: StatusAbsensi) => {
    setEditingRecordId(id);
    setEditStatusVal(currentStatus);
  };

  const handleSaveEditAbsensi = async (id: string) => {
    await updateAbsensi(id, editStatusVal);
    setEditingRecordId(null);
  };

  const toggleSelectAbsensi = (id: string) => {
    setSelectedAbsensiIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllAbsensi = () => {
    const pageIds = paginatedAbsensi.map((i) => i.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedAbsensiIds.includes(id));
    if (allSelected) {
      setSelectedAbsensiIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedAbsensiIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectPenilaian = (id: string) => {
    setSelectedPenilaianIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPenilaian = () => {
    const pageIds = paginatedPenilaian.map((i) => i.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedPenilaianIds.includes(id));
    if (allSelected) {
      setSelectedPenilaianIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedPenilaianIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleOpenDeleteSingleAbsensi = (id: string, name: string) => {
    setDeleteModalState({
      isOpen: true,
      type: "ABSENSI",
      ids: [id],
      name,
      count: 1
    });
  };

  const handleOpenDeleteSinglePenilaian = (id: string, name: string) => {
    setDeleteModalState({
      isOpen: true,
      type: "PENILAIAN",
      ids: [id],
      name,
      count: 1
    });
  };

  const handleOpenDeleteBulkAbsensi = () => {
    if (selectedAbsensiIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: "ABSENSI",
      ids: selectedAbsensiIds,
      count: selectedAbsensiIds.length
    });
  };

  const handleOpenDeleteBulkPenilaian = () => {
    if (selectedPenilaianIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: "PENILAIAN",
      ids: selectedPenilaianIds,
      count: selectedPenilaianIds.length
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModalState.ids.length === 0) return;
    setDeleteModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (deleteModalState.type === "ABSENSI") {
        if (deleteModalState.ids.length === 1) {
          await deleteAbsensi(deleteModalState.ids[0]);
        } else {
          await deleteAbsensiBulk(deleteModalState.ids);
        }
        setSelectedAbsensiIds((prev) => prev.filter((id) => !deleteModalState.ids.includes(id)));
      } else {
        if (deleteModalState.ids.length === 1) {
          await deletePenilaian(deleteModalState.ids[0]);
        } else {
          await deletePenilaianBulk(deleteModalState.ids);
        }
        setSelectedPenilaianIds((prev) => prev.filter((id) => !deleteModalState.ids.includes(id)));
      }
      setDeleteModalState((prev) => ({ ...prev, isOpen: false, ids: [] }));
    } finally {
      setDeleteModalState((prev) => ({ ...prev, isLoading: false }));
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
        <div className="mizan-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E2E8F0] shadow-xs">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              Riwayat & Aktivitas Santri
            </h1>

            <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap pt-0.5">
              <span className="flex items-center gap-1 text-[#172033] font-semibold" suppressHydrationWarning>
                <Calendar className="w-3.5 h-3.5 text-[#A8833E]" />
                {liveDateString || "Memuat tanggal..."}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono font-bold text-[#1B4D3E]" suppressHydrationWarning>
                <Clock className="w-3.5 h-3.5 text-[#1B4D3E]" />
                {liveTimeString || "Memuat waktu..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <Link
              href={`/bk/penilaian${uParam}`}
              className="px-3.5 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Penilaian</span>
            </Link>

            <Link
              href={`/bk/absen${uParam}`}
              className="px-3.5 py-2 rounded-xl bg-[#FAF7EE] border border-[#C5A059] text-[#1B4D3E] text-xs font-bold hover:bg-[#F3EEDC] transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#A8833E]" />
              <span>Presensi</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <CardSub className="p-3.5 bg-white">
            <div className="flex items-center justify-between text-[#64748B] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Prestasi (Hasanah)</span>
              <div className="w-7 h-7 rounded-lg mizan-inset text-[#065F46] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#065F46]">
              {stats.hasanahCount}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Capaian adab santri</p>
          </CardSub>

          <CardSub className="p-3.5 bg-white">
            <div className="flex items-center justify-between text-[#64748B] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pelanggaran (Sayyi&apos;ah)</span>
              <div className="w-7 h-7 rounded-lg mizan-inset text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-red-600">
              {stats.sayyiahCount}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Catatan kedisiplinan</p>
          </CardSub>

          <CardSub className="p-3.5 bg-white">
            <div className="flex items-center justify-between text-[#64748B] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Presensi Sholat</span>
              <div className="w-7 h-7 rounded-lg mizan-inset text-[#1B4D3E] flex items-center justify-center">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#172033]">
              {stats.totalPresensi}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Hadir: {stats.absensiHadirCount} • Alpa: {stats.absensiAlpaCount}</p>
          </CardSub>

          <CardSub className="p-3.5 bg-white">
            <div className="flex items-center justify-between text-[#64748B] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Waktu Realtime</span>
              <div className="w-7 h-7 rounded-lg mizan-inset text-[#A8833E] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-[#A8833E] truncate" suppressHydrationWarning>
              {liveTimeString ? liveTimeString.replace(" WIB", "") : "..."}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">WIB (UTC+7)</p>
          </CardSub>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E2E8F0] max-w-md text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("PENILAIAN")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "PENILAIAN"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Catatan Sikap ({filteredPenilaian.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ABSENSI")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ABSENSI"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Presensi Sholat ({filteredAbsensi.length})</span>
          </button>
        </div>

        {activeTab === "PENILAIAN" && (
          <div className="space-y-4">
            <Card className="p-4 sm:p-5 bg-white space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Periode Waktu
                  </label>
                  <select
                    aria-label="Filter Periode Penilaian"
                    value={penilaianPeriod}
                    onChange={(e) => {
                      setPenilaianPeriod(e.target.value as any);
                      setPenilaianPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="today">Hari Ini</option>
                    <option value="week">7 Hari Terakhir</option>
                    <option value="all">Semua Waktu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Jenis Catatan
                  </label>
                  <select
                    aria-label="Filter Jenis Catatan"
                    value={penilaianType}
                    onChange={(e) => {
                      setPenilaianType(e.target.value as any);
                      setPenilaianPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="ALL">Semua Jenis</option>
                    <option value="HASANAH">Prestasi (Hasanah)</option>
                    <option value="SAYYIAH">Pelanggaran (Sayyi&apos;ah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Filter Kelas
                  </label>
                  <select
                    aria-label="Filter Kelas Penilaian"
                    value={penilaianClass}
                    onChange={(e) => {
                      setPenilaianClass(e.target.value);
                      setPenilaianPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Cari Santri / Catatan
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Nama santri, adab..."
                      value={penilaianSearch}
                      onChange={(e) => {
                        setPenilaianSearch(e.target.value);
                        setPenilaianPage(1);
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 space-y-3 bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Daftar Catatan Sikap & Pelanggaran ({filteredPenilaian.length})
                </h2>
                <span className="text-[10px] text-[#64748B]">
                  Waktu kejadian & pencatatan realtime WIB
                </span>
              </div>

              {filteredPenilaian.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#FAF7EE] text-[#A8833E] flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-[#172033]">Belum ada catatan perilaku</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Tidak ada catatan sikap atau pelanggaran santri pada filter yang dipilih.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3 px-1 py-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPenilaian}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                          paginatedPenilaian.length > 0 && paginatedPenilaian.every((i) => selectedPenilaianIds.includes(i.id))
                            ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{paginatedPenilaian.length > 0 && paginatedPenilaian.every((i) => selectedPenilaianIds.includes(i.id)) ? "Batal" : "Pilih Semua"}</span>
                      </button>
                      {selectedPenilaianIds.length > 0 && (
                        <span className="text-[11px] text-[#64748B] font-medium">
                          {selectedPenilaianIds.length} terpilih
                        </span>
                      )}
                    </div>

                    {selectedPenilaianIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleOpenDeleteBulkPenilaian}
                        className="px-3 py-1 rounded-xl bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus ({selectedPenilaianIds.length})</span>
                      </button>
                    )}
                  </div>

                  {paginatedPenilaian.map((item) => {
                    const isHasanah = item.type === "HASANAH";
                    const incidentDateDisplay = item.incidentDate
                      ? formatWIBDate(item.incidentDate, "short")
                      : "";
                    const isSelected = selectedPenilaianIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl mizan-card-sub flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#1B4D3E]/30 transition-all bg-white ${
                          isSelected ? "ring-2 ring-red-400 bg-red-50/20" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectPenilaian(item.id)}
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer shrink-0 mt-1"
                            aria-label={`Pilih ${item.santriName}`}
                          />
                          <span
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-black shrink-0 ${
                              isHasanah
                                ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                            }`}
                          >
                            {formatScore(item.score)}
                          </span>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/bk/santri/${item.santriId}${uParam}`}
                                className="text-xs font-bold text-[#172033] hover:text-[#1B4D3E] underline-offset-2 hover:underline"
                              >
                                {item.santriName}
                              </Link>
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EEF2F6] text-[#475569] whitespace-nowrap">
                                {item.santriClass}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  isHasanah
                                    ? "bg-[#ECFDF5] text-[#065F46]"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {isHasanah ? "Prestasi" : "Pelanggaran"}
                              </span>
                              <span className="text-[9px] text-[#94A3B8]">
                                {item.category} • {item.unsurName}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-[#172033] leading-snug">
                              {item.indicatorText}
                            </p>

                            {item.notes && (
                              <p className="text-[11px] text-[#64748B] italic">
                                &quot;{item.notes}&quot;
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-[10px] text-[#94A3B8] flex-wrap pt-0.5">
                              {item.incidentDate && item.incidentTime && (
                                <span className="flex items-center gap-1 text-[#172033]">
                                  <Clock className="w-3 h-3 text-[#A8833E]" />
                                  <span>Kejadian: {incidentDateDisplay} pukul {item.incidentTime} WIB</span>
                                </span>
                              )}
                              <span>•</span>
                              <span>Tercatat: {item.createdAt}</span>
                              <span>•</span>
                              <span className="font-semibold text-[#475569]">Oleh: {item.guruName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <Link
                            href={`/bk/santri/${item.santriId}${uParam}`}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#FAF7EE] text-[#1B4D3E] border border-[#E8DFC8] hover:bg-[#F3EEDC] transition-colors"
                          >
                            Rapor
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteSinglePenilaian(item.id, item.santriName)}
                            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus"
                            aria-label={`Hapus catatan ${item.santriName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Pagination
                currentPage={penilaianPage}
                totalPages={totalPenilaianPages}
                onPageChange={setPenilaianPage}
                totalItems={filteredPenilaian.length}
                itemsPerPage={PAGE_SIZE}
                itemName="catatan"
              />
            </Card>
          </div>
        )}

        {activeTab === "ABSENSI" && (
          <div className="space-y-4">
            <Card className="p-4 sm:p-5 bg-white space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Waktu Sholat
                  </label>
                  <select
                    aria-label="Filter Waktu Sholat"
                    value={absensiPrayer}
                    onChange={(e) => {
                      setAbsensiPrayer(e.target.value as any);
                      setAbsensiPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
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
                    aria-label="Filter Status Absensi"
                    value={absensiStatus}
                    onChange={(e) => {
                      setAbsensiStatus(e.target.value as any);
                      setAbsensiPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
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
                    aria-label="Filter Kelas Absensi"
                    value={absensiClass}
                    onChange={(e) => {
                      setAbsensiClass(e.target.value);
                      setAbsensiPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {availableClasses.map((cls) => (
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
                      value={absensiSearch}
                      onChange={(e) => {
                        setAbsensiSearch(e.target.value);
                        setAbsensiPage(1);
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 space-y-3 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E2E8F0] gap-2">
                <div>
                  <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Daftar Catatan Presensi Sholat ({filteredAbsensi.length})
                  </h2>
                  <span className="text-[10px] text-[#64748B]">
                    Pilih edit untuk memperbarui status
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllAbsensi}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                      paginatedAbsensi.length > 0 && paginatedAbsensi.every((i) => selectedAbsensiIds.includes(i.id))
                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{paginatedAbsensi.length > 0 && paginatedAbsensi.every((i) => selectedAbsensiIds.includes(i.id)) ? "Batal" : "Pilih Semua"}</span>
                  </button>

                  {selectedAbsensiIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleOpenDeleteBulkAbsensi}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus ({selectedAbsensiIds.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredAbsensi.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#FAF7EE] text-[#A8833E] flex items-center justify-center mx-auto">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-[#172033]">Belum ada catatan presensi</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Tidak ada data presensi sholat yang sesuai dengan kriteria filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {paginatedAbsensi.map((item) => {
                    const isEditing = editingRecordId === item.id;
                    const dateDisplay = item.date ? formatWIBDate(item.date, "short") : "";
                    const isSelected = selectedAbsensiIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl mizan-card-sub flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#1B4D3E]/30 transition-all bg-white ${
                          isSelected ? "ring-2 ring-red-400 bg-red-50/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectAbsensi(item.id)}
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer shrink-0"
                            aria-label={`Pilih ${item.santriName}`}
                          />
                          <div className="w-9 h-9 rounded-xl mizan-inset flex items-center justify-center font-bold text-xs text-[#1B4D3E] shrink-0">
                            {item.santriName.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold text-[#172033] truncate">
                                {item.santriName}
                              </p>
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EEF2F6] text-[#475569] whitespace-nowrap">
                                {item.santriClass}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E]">
                                Sholat {item.waktuSholat || "Subuh"}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#64748B]">
                              {dateDisplay || item.date} • Dicatat: {item.createdAt} • Oleh: {item.guruName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <select
                                aria-label="Pilih Status"
                                value={editStatusVal}
                                onChange={(e) => setEditStatusVal(e.target.value as StatusAbsensi)}
                                className="px-2 py-1 text-xs font-bold bg-[#EEF2F6] rounded-lg border border-transparent text-[#172033]"
                              >
                                <option value="Hadir">Hadir</option>
                                <option value="Izin">Izin</option>
                                <option value="Sakit">Sakit</option>
                                <option value="Alpa">Alpa</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleSaveEditAbsensi(item.id)}
                                className="p-1.5 rounded-lg bg-[#1B4D3E] text-white hover:bg-[#153e32]"
                                title="Simpan"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRecordId(null)}
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033]"
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
                                onClick={() => handleStartEditAbsensi(item.id, item.status)}
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B4D3E] hover:bg-[#EEF2F6]"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDeleteSingleAbsensi(item.id, item.santriName)}
                                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50"
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
                </div>
              )}

              <Pagination
                currentPage={absensiPage}
                totalPages={totalAbsensiPages}
                onPageChange={setAbsensiPage}
                totalItems={filteredAbsensi.length}
                itemsPerPage={PAGE_SIZE}
                itemName="presensi"
              />
            </Card>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, type: "PENILAIAN", ids: [] })}
        onConfirm={handleConfirmDelete}
        count={deleteModalState.count}
        message={
          deleteModalState.count === 1 && deleteModalState.name
            ? `Hapus catatan ${deleteModalState.type === "ABSENSI" ? "presensi" : "perilaku"} untuk ${deleteModalState.name}?`
            : undefined
        }
        isLoading={deleteModalState.isLoading}
      />
    </RoleShell>
  );
}
