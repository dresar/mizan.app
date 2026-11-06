"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Download,
  Upload,
  Printer,
  Edit2,
  Check,
  X,
  Users,
  Camera,
  Image as ImageIcon,
  Eye
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusAbsensi, WaktuSholat, AbsensiRecord } from "@/lib/mock-data";
import { getWIBDate } from "@/lib/date-utils";

const PRAYER_SCHEDULE: Record<WaktuSholat, { time: string }> = {
  Tahajjud: { time: "03:30 WIB" },
  Subuh: { time: "05:00 WIB" },
  Dhuha: { time: "09:30 WIB" },
  Dzuhur: { time: "12:30 WIB" },
  Ashar: { time: "15:45 WIB" },
  Maghrib: { time: "18:20 WIB" },
  Isya: { time: "19:35 WIB" }
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

  const storageKey = `mizan_absen_photo_${sessionDate}_${parsedPrayer}_${parsedGender}`;
  const [sessionPhoto, setSessionPhoto] = useState<string | null>(null);
  const [isPreviewPhotoOpen, setIsPreviewPhotoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSessionPhoto(saved);
      } else {
        setSessionPhoto(
          parsedGender === "Putra"
            ? "/default-avatar-santri.jpg"
            : "/default-avatar-santriwati.jpg"
        );
      }
    } catch {
      void 0;
    }
  }, [storageKey, parsedGender]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 5 MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSessionPhoto(dataUrl);
      try {
        localStorage.setItem(storageKey, dataUrl);
      } catch {
        void 0;
      }
      showToast("Foto bukti berhasil diperbarui");
    };
    reader.readAsDataURL(file);
  };

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
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
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
      showToast("Catatan diperbarui");
      setEditingRecord(null);
    } else {
      showToast(res.message || "Gagal", "error");
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showToast("Data kosong", "error");
      return;
    }
    const headers = ["No", "Nama Santri", "NIS", "Kelas", "Gender", "Status", "Waktu", "Tanggal", "Petugas", "Catatan"];
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
    link.setAttribute("download", `Presensi_${parsedPrayer}_${parsedGender}_${sessionDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV diunduh");
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        let updatedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
          const nis = cols[2];
          const st = cols[5] as StatusAbsensi;
          const note = cols[9] || "";
          const target = sessionRecords.find((r) => r.santriId === nis);
          if (target && ["Hadir", "Izin", "Sakit", "Alpa"].includes(st)) {
            await updateAbsensi(target.id, st, note);
            updatedCount++;
          }
        }
        showToast(`${updatedCount} data berhasil diimpor`);
      } catch {
        showToast("Format file tidak valid", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <RoleShell>
      <div className="p-3 sm:p-5 max-w-7xl mx-auto space-y-3.5">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; color: black !important; font-size: 11pt !important; }
            header, nav, aside, .no-print { display: none !important; }
            .print-only { display: block !important; }
            .mizan-card, .card { box-shadow: none !important; border: 1px solid #ccc !important; }
          }
          .print-only { display: none; }
        `}} />

        <div className="print-only mb-4 p-4 border-b-2 border-black text-center space-y-1">
          <h1 className="text-xl font-bold uppercase tracking-wide">Pesantren Modern Raudhatussalam Mahato</h1>
          <p className="text-xs">Laporan Presensi {parsedPrayer} ({parsedGender}) • Tanggal: {sessionDate}</p>
          <p className="text-xs">Petugas: {bkStaffList.join(", ") || "-"}</p>
        </div>

        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/admin/absensi?date=${sessionDate}`}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Kembali</span>
            </Link>
            <span className="text-xs text-[#94A3B8]">/</span>
            <span className="text-xs font-bold text-[#172033]">{parsedPrayer} ({parsedGender === "Putra" ? "L" : "P"})</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              type="file"
              ref={importInputRef}
              accept=".csv,.txt"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Impor</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>PDF</span>
            </button>

            <Link
              href="/bk/absen"
              className="px-3 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-all flex items-center gap-1 shadow-2xs"
            >
              <span>Absen</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Card className="lg:col-span-2 p-4 bg-white space-y-3">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl mizan-inset flex items-center justify-center shrink-0">
                  {getPrayerIcon(parsedPrayer)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-base sm:text-lg font-serif font-black text-[#172033]">
                      {parsedPrayer} ({parsedGender === "Putra" ? "L" : "P"})
                    </h1>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        parsedGender === "Putra"
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : "bg-[#FFF1F2] text-[#BE123C]"
                      }`}
                    >
                      {parsedGender === "Putra" ? "Putra" : "Putri"}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#EEF2F6] text-[#172033]">
                      {PRAYER_SCHEDULE[parsedPrayer]?.time || "05:00 WIB"}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 font-mono">
                    {formatDateLabel(sessionDate)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Petugas
                </span>
                <p className="text-xs font-bold text-[#172033] max-w-[160px] sm:max-w-[200px] truncate">
                  {bkStaffList.join(", ") || (parsedGender === "Putra" ? "Ust. Willy Agustino" : "Usth. Siti Salmah")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#065F46] block">
                  Kehadiran
                </span>
                <div className="text-xl font-black font-mono text-[#065F46] mt-0.5">
                  {stats.rate}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#E2EBF4] shadow-2xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#1B4D3E] block">
                  Hadir
                </span>
                <div className="text-xl font-black font-mono text-[#1B4D3E] mt-0.5">
                  {stats.hadir} <span className="text-[10px] font-normal text-[#64748B]">/{stats.total}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#E2EBF4] shadow-2xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#A8833E] block">
                  Izin / Sakit
                </span>
                <div className="text-xl font-black font-mono text-[#A8833E] mt-0.5">
                  {stats.izin + stats.sakit}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#E2EBF4] shadow-2xs">
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 block">
                  Alpa
                </span>
                <div className="text-xl font-black font-mono text-red-600 mt-0.5">
                  {stats.alpa}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1.5">
                Kelas ({parsedGender === "Putra" ? "L" : "P"})
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {classBreakdown.map((item) => (
                  <button
                    key={item.class}
                    type="button"
                    onClick={() => setClassFilter(classFilter === item.class ? "ALL" : item.class)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      classFilter === item.class
                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-2xs"
                        : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#1B4D3E]/40"
                    }`}
                  >
                    <p className="text-xs font-bold">{item.class}</p>
                    <p className={`text-[9px] font-mono mt-0.5 ${classFilter === item.class ? "text-white/90" : "text-[#065F46] font-semibold"}`}>
                      {item.hadir}/{item.total}
                    </p>
                    {item.alpa > 0 && (
                      <p className={`text-[8px] font-bold ${classFilter === item.class ? "text-rose-200" : "text-rose-600"}`}>
                        {item.alpa} Alpa
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#1B4D3E]" />
                  <span className="text-xs font-bold text-[#172033]">Foto Bukti Presensi</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-bold text-[#1B4D3E] hover:underline cursor-pointer"
                >
                  {sessionPhoto ? "Ganti" : "Unggah"}
                </button>
              </div>

              {sessionPhoto ? (
                <div className="mt-2.5 space-y-2">
                  <div
                    onClick={() => setIsPreviewPhotoOpen(true)}
                    className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0] cursor-pointer group"
                  >
                    <img
                      src={sessionPhoto}
                      alt="Bukti Presensi"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Lihat Foto</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span>Dokumentasi sholat {parsedPrayer}</span>
                    <span className="text-emerald-700 font-bold">✓ Terlampir</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2.5 p-6 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-white text-center cursor-pointer transition-colors"
                >
                  <Camera className="w-6 h-6 text-[#94A3B8] mx-auto mb-1" />
                  <p className="text-xs font-bold text-[#172033]">Ambil / Unggah Foto</p>
                  <p className="text-[10px] text-[#94A3B8]">Dokumentasi bukti jama&apos;ah</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] text-[10px] text-[#94A3B8] text-center">
              Foto otomatis tersertakan saat unduh PDF
            </div>
          </Card>
        </div>

        <Card className="p-3 sm:p-4 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Santri ({filteredRecords.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[160px] sm:min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1 rounded-xl text-xs bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-0.5 bg-[#EEF2F6] p-0.5 rounded-xl">
                {(["ALL", "Hadir", "Izin", "Sakit", "Alpa"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      statusFilter === st
                        ? "bg-white text-[#172033] shadow-2xs"
                        : "text-[#64748B]"
                    }`}
                  >
                    {st === "ALL" ? "Semua" : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#94A3B8]">
              Data kosong
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2EBF4] text-[9px] font-bold uppercase tracking-wider text-[#64748B] bg-[#FAF7EE]/60">
                    <th className="p-2 w-8">No</th>
                    <th className="p-2">Santri</th>
                    <th className="p-2">Kelas</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Catatan</th>
                    <th className="p-2 text-right no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBF4]">
                  {filteredRecords.map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-[#FAF7EE]/40 transition-colors">
                      <td className="p-2 font-mono text-[#94A3B8]">{idx + 1}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Avatar
                            initials={rec.santriName.charAt(0)}
                            size="sm"
                            variant={rec.gender === "Putra" ? "primary" : "gold"}
                          />
                          <div>
                            <p className="font-bold text-[#172033]">{rec.santriName}</p>
                            <p className="text-[9px] text-[#64748B] font-mono">NIS {rec.santriId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.2 rounded-md bg-[#EEF2F6] text-[#172033] font-bold text-[10px]">
                          {rec.santriClass}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${
                            rec.status === "Hadir"
                              ? "bg-[#ECFDF5] text-[#065F46]"
                              : rec.status === "Izin"
                              ? "bg-[#FFFBEB] text-[#92400E]"
                              : rec.status === "Sakit"
                              ? "bg-[#EFF6FF] text-[#1E40AF]"
                              : "bg-[#FEF2F2] text-[#991B1B]"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-2 text-[#64748B]">
                        {rec.notes ? (
                          <span className="text-[#172033] font-medium">{rec.notes}</span>
                        ) : (
                          <span className="text-[#CBD5E1]">-</span>
                        )}
                      </td>
                      <td className="p-2 text-right no-print">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rec)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#1B4D3E] bg-[#EEF2F6] hover:bg-[#E2E8F0] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
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
            <div className="w-full max-w-sm mizan-card p-4 bg-white space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Ubah Status
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
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

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Status
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["Hadir", "Izin", "Sakit", "Alpa"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditStatus(st)}
                        className={`py-1.5 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                          editStatus === st
                            ? st === "Hadir"
                              ? "bg-[#065F46] text-white border-[#065F46]"
                              : st === "Izin"
                              ? "bg-[#D97706] text-white border-[#D97706]"
                              : st === "Sakit"
                              ? "bg-[#2563EB] text-white border-[#2563EB]"
                              : "bg-[#DC2626] text-white border-[#DC2626]"
                            : "bg-white text-[#172033] border-[#E2EBF4]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Catatan
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Alasan..."
                    className="w-full p-2 rounded-xl text-xs bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-[#64748B] bg-[#EEF2F6]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? "..." : "Simpan"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {isPreviewPhotoOpen && sessionPhoto && (
          <div
            onClick={() => setIsPreviewPhotoOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
              <img
                src={sessionPhoto}
                alt="Dokumentasi Presensi"
                className="max-w-full max-h-[85vh] object-contain"
              />
              <button
                type="button"
                onClick={() => setIsPreviewPhotoOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
