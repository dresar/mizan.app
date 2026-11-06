"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Download,
  Edit2,
  Check,
  X,
  Users
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusAbsensi, WaktuSholat, AbsensiRecord } from "@/lib/mock-data";
import { getWIBDate } from "@/lib/date-utils";

const PRAYER_SCHEDULE: Record<WaktuSholat, { time: string; period: string }> = {
  Tahajjud: { time: "03:30 WIB", period: "Malam / Sepertiga Akhir" },
  Subuh: { time: "05:00 WIB", period: "Pagi Buta" },
  Dhuha: { time: "09:30 WIB", period: "Pagi Menjelang Siang" },
  Dzuhur: { time: "12:30 WIB", period: "Siang Hari" },
  Ashar: { time: "15:45 WIB", period: "Sore Hari" },
  Maghrib: { time: "18:20 WIB", period: "Petang Hari" },
  Isya: { time: "19:35 WIB", period: "Awal Malam" }
};

export default function SessionDetailClientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { absensiList, santriList, updateAbsensi, showToast } = useMizan();

  const rawSlug = ((params?.id as string) || "subuh-putra").toLowerCase();
  const queryDate = searchParams?.get("date");
  const queryPrayer = searchParams?.get("prayer");
  const queryGender = searchParams?.get("gender");

  const parsedPrayer: WaktuSholat = useMemo(() => {
    if (queryPrayer) {
      const cap = queryPrayer.charAt(0).toUpperCase() + queryPrayer.slice(1).toLowerCase();
      if (cap in PRAYER_SCHEDULE) return cap as WaktuSholat;
    }
    if (rawSlug.includes("subuh")) return "Subuh";
    if (rawSlug.includes("dhuha")) return "Dhuha";
    if (rawSlug.includes("dzuhur")) return "Dzuhur";
    if (rawSlug.includes("ashar")) return "Ashar";
    if (rawSlug.includes("maghrib")) return "Maghrib";
    if (rawSlug.includes("isya")) return "Isya";
    if (rawSlug.includes("tahajjud")) return "Tahajjud";
    return "Subuh";
  }, [rawSlug, queryPrayer]);

  const parsedGender: "Putra" | "Putri" = useMemo(() => {
    if (queryGender === "Putri" || queryGender === "P" || rawSlug.endsWith("-putri") || rawSlug.endsWith("-p")) {
      return "Putri";
    }
    return "Putra";
  }, [rawSlug, queryGender]);

  const sessionDate = useMemo(() => {
    if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate)) {
      return queryDate;
    }
    const match = rawSlug.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    return getWIBDate();
  }, [queryDate, rawSlug]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StatusAbsensi>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");

  const [editingRecord, setEditingRecord] = useState<AbsensiRecord | null>(null);
  const [editStatus, setEditStatus] = useState<StatusAbsensi>("Hadir");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const sessionRecords = useMemo(() => {
    return absensiList.filter((a) => {
      const matchDate = a.date === sessionDate;
      const matchPrayer = (a.waktuSholat || "Subuh") === parsedPrayer;
      const matchGender = a.gender === parsedGender;
      return matchDate && matchPrayer && matchGender;
    });
  }, [absensiList, sessionDate, parsedPrayer, parsedGender]);

  const bkStaffList = useMemo(() => {
    const set = new Set<string>();
    sessionRecords.forEach((r) => {
      if (r.guruName) set.add(r.guruName);
    });
    return Array.from(set);
  }, [sessionRecords]);

  const stats = useMemo(() => {
    const total = sessionRecords.length;
    const hadir = sessionRecords.filter((r) => r.status === "Hadir").length;
    const izin = sessionRecords.filter((r) => r.status === "Izin").length;
    const sakit = sessionRecords.filter((r) => r.status === "Sakit").length;
    const alpa = sessionRecords.filter((r) => r.status === "Alpa").length;
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, izin, sakit, alpa, rate };
  }, [sessionRecords]);

  const classListForGender = useMemo(() => {
    if (parsedGender === "Putra") return ["1A", "2A", "3A", "4A", "5A", "6A"];
    return ["1B", "2B", "3B", "4B", "5B", "6B"];
  }, [parsedGender]);

  const classBreakdown = useMemo(() => {
    return classListForGender.map((cls) => {
      const inCls = sessionRecords.filter((r) => r.santriClass === cls);
      const total = inCls.length;
      const hadir = inCls.filter((r) => r.status === "Hadir").length;
      const alpa = inCls.filter((r) => r.status === "Alpa").length;
      const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;
      return { class: cls, total, hadir, alpa, rate };
    });
  }, [classListForGender, sessionRecords]);

  const filteredRecords = useMemo(() => {
    return sessionRecords.filter((r) => {
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchClass = classFilter === "ALL" || r.santriClass === classFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        r.santriName.toLowerCase().includes(q) ||
        r.santriClass.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q));
      return matchStatus && matchClass && matchSearch;
    });
  }, [sessionRecords, statusFilter, classFilter, searchQuery]);

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${days[dateObj.getDay()] || ""}, ${d} ${months[dateObj.getMonth()] || ""} ${y}`;
  };

  const getPrayerIcon = (prayer: WaktuSholat) => {
    switch (prayer) {
      case "Tahajjud":
        return <Moon className="w-5 h-5 text-purple-600" />;
      case "Subuh":
        return <Sunrise className="w-5 h-5 text-amber-500" />;
      case "Dhuha":
        return <Sun className="w-5 h-5 text-amber-600" />;
      case "Dzuhur":
        return <Sun className="w-5 h-5 text-emerald-600" />;
      case "Ashar":
        return <Sunset className="w-5 h-5 text-orange-500" />;
      case "Maghrib":
        return <Sunset className="w-5 h-5 text-rose-500" />;
      case "Isya":
        return <Moon className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-[#1B4D3E]" />;
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
      showToast("Data presensi santri berhasil diperbarui");
      setEditingRecord(null);
    } else {
      showToast(res.message || "Gagal memperbarui", "error");
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showToast("Tidak ada data untuk diekspor", "error");
      return;
    }
    const headers = ["No", "Nama Santri", "NIS", "Kelas", "Gender", "Status", "Waktu Sholat", "Tanggal", "Petugas", "Catatan"];
    const rows = filteredRecords.map((r, i) => [
      i + 1,
      `"${r.santriName.replace(/"/g, '""')}"`,
      r.santriId,
      r.santriClass,
      r.gender,
      r.status,
      r.waktuSholat || parsedPrayer,
      r.date,
      `"${(r.guruName || "").replace(/"/g, '""')}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Presensi_${parsedPrayer}_${parsedGender}_${sessionDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File CSV berhasil diunduh");
  };

  return (
    <RoleShell>
      <div className="p-3 sm:p-5 md:p-7 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/absensi?date=${sessionDate}`}
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#1B4D3E]" />
              <span>Kembali</span>
            </Link>
            <span className="text-xs text-[#94A3B8]">/</span>
            <span className="text-xs font-bold text-[#64748B]">Detail Sesi Sholat</span>
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
            <Link
              href="/bk/absen"
              className="px-3.5 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>Input Absen</span>
            </Link>
          </div>
        </div>

        <Card className="p-4 sm:p-6 bg-white space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl mizan-inset flex items-center justify-center shrink-0">
                {getPrayerIcon(parsedPrayer)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      parsedGender === "Putra"
                        ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                        : "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]"
                    }`}
                  >
                    Santri {parsedGender} ({parsedGender === "Putra" ? "L" : "P"})
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EEF2F6] text-[#172033]">
                    {PRAYER_SCHEDULE[parsedPrayer]?.time || "05:00 WIB"}
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    {parsedGender === "Putra" ? "Masjid Kampus Putra" : "Musholla Asrama Putri"}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] mt-1.5">
                  Sholat {parsedPrayer} ({parsedGender}) • {formatDateLabel(sessionDate)}
                </h1>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {PRAYER_SCHEDULE[parsedPrayer]?.period} • Total {stats.total} santri terdata
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] min-w-[240px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Petugas Pengasuhan ({parsedGender})
              </span>
              <div className="flex items-center gap-2.5 mt-1.5">
                <div className="w-9 h-9 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  BK
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172033]">
                    {bkStaffList.join(", ") || (parsedGender === "Putra" ? "Ust. Willy Agustino" : "Usth. Siti Salmah, S.Pd")}
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    {sessionRecords[0]?.createdAt ? `Diinput: ${sessionRecords[0].createdAt}` : "Tercatat di sistem"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] block">
                Tingkat Kehadiran
              </span>
              <div className="text-2xl font-black font-mono text-[#065F46] mt-0.5">
                {stats.rate}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D3E] block">
                Santri Hadir
              </span>
              <div className="text-2xl font-black font-mono text-[#1B4D3E] mt-0.5">
                {stats.hadir} <span className="text-xs font-normal text-[#64748B]">/{stats.total}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8833E] block">
                Izin / Sakit
              </span>
              <div className="text-2xl font-black font-mono text-[#A8833E] mt-0.5">
                {stats.izin + stats.sakit}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                Alpa Sholat
              </span>
              <div className="text-2xl font-black font-mono text-red-600 mt-0.5">
                {stats.alpa}
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">
              Rincian Kehadiran per Kelas ({parsedGender})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {classBreakdown.map((item) => (
                <div
                  key={item.class}
                  onClick={() => setClassFilter(classFilter === item.class ? "ALL" : item.class)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    classFilter === item.class
                      ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-2xs"
                      : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#1B4D3E]/40"
                  }`}
                >
                  <p className="text-xs font-bold">Kelas {item.class}</p>
                  <p className={`text-[10px] font-mono mt-0.5 ${classFilter === item.class ? "text-white/90" : "text-[#065F46] font-semibold"}`}>
                    {item.hadir}/{item.total} Hadir
                  </p>
                  {item.alpa > 0 && (
                    <p className={`text-[9px] font-bold ${classFilter === item.class ? "text-rose-200" : "text-rose-600"}`}>
                      {item.alpa} Alpa
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Daftar Absensi Santri ({filteredRecords.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Cari nama atau kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#EEF2F6] p-1 rounded-xl">
                {(["ALL", "Hadir", "Izin", "Sakit", "Alpa"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      statusFilter === st
                        ? "bg-white text-[#172033] shadow-2xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {st === "ALL" ? "Semua" : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              {sessionRecords.length === 0
                ? "Belum ada santri yang diabsen pada sesi ini."
                : "Tidak ada santri yang cocok dengan filter pencarian."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2EBF4] text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#FAF7EE]/60">
                    <th className="p-3 w-10">No</th>
                    <th className="p-3">Santri</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Catatan / Alasan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBF4]">
                  {filteredRecords.map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-[#FAF7EE]/40 transition-colors">
                      <td className="p-3 font-mono text-[#94A3B8]">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            initials={rec.santriName.charAt(0)}
                            size="sm"
                            variant={rec.gender === "Putra" ? "primary" : "gold"}
                          />
                          <div>
                            <p className="font-bold text-[#172033]">{rec.santriName}</p>
                            <p className="text-[10px] text-[#64748B] font-mono">NIS {rec.santriId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#EEF2F6] text-[#172033] font-bold text-[10px]">
                          {rec.santriClass}
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
                      <td className="p-3 text-[#64748B]">
                        {rec.notes ? (
                          <span className="text-[#172033] font-medium">{rec.notes}</span>
                        ) : (
                          <span className="text-[#CBD5E1]">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rec)}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold text-[#1B4D3E] bg-[#EEF2F6] hover:bg-[#E2E8F0] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Ubah</span>
                        </button>
                      </td>
                    </tr>
                  ))}
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
                    Ubah Status Kehadiran
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {editingRecord.santriName} ({editingRecord.santriClass})
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
                    placeholder="Contoh: Piket dapur, izin ke poskestren, dll..."
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
                  <span>{isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
