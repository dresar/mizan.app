"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HeartHandshake,
  Sparkles,
  Award,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Download,
  Search,
  User,
  Phone,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
  Check,
  ArrowRight,
  FileText,
  HelpCircle,
  Compass,
  CheckCheck
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Santri, formatScore, getSantriDisciplineStatus } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { generateSantriPdf } from "@/lib/pdf-generator";

export default function OrtuDashboardPage() {
  const router = useRouter();
  const {
    santriList,
    penilaianList,
    absensiList,
    settings,
    showToast
  } = useMizan();

  const [selectedSantriId, setSelectedSantriId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"RINGKASAN" | "KEBAIKAN" | "EVALUASI" | "RAPOR">("RINGKASAN");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedId = localStorage.getItem("mizan_ortu_santri_id");
      if (savedId) {
        setSelectedSantriId(savedId);
      }
    } catch {
      void 0;
    }
  }, []);

  const selectedSantri = useMemo(() => {
    if (!selectedSantriId || !santriList.length) return null;
    return santriList.find((s) => s.id === selectedSantriId) || null;
  }, [selectedSantriId, santriList]);

  const handleSelectSantri = (santri: Santri) => {
    setSelectedSantriId(santri.id);
    try {
      localStorage.setItem("mizan_ortu_santri_id", santri.id);
    } catch {
      void 0;
    }
    showToast(`Data ananda ${santri.name} dimuat`, "success");
  };

  const handleClearSelection = () => {
    setSelectedSantriId("");
    try {
      localStorage.removeItem("mizan_ortu_santri_id");
    } catch {
      void 0;
    }
  };

  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return santriList.slice(0, 6);
    return santriList.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchNis = s.nis.toLowerCase().includes(q);
      const matchClass = s.class.toLowerCase().includes(q);
      const matchWali = s.waliName ? s.waliName.toLowerCase().includes(q) : false;
      const matchPhone = s.waliPhone ? s.waliPhone.includes(q) : false;
      return matchName || matchNis || matchClass || matchWali || matchPhone;
    });
  }, [searchQuery, santriList]);

  const studentPenilaian = useMemo(() => {
    if (!selectedSantri) return [];
    return penilaianList.filter((p) => p.santriId === selectedSantri.id);
  }, [selectedSantri, penilaianList]);

  const hasanahRecords = useMemo(() => {
    return studentPenilaian.filter((p) => p.type === "HASANAH");
  }, [studentPenilaian]);

  const sayyiahRecords = useMemo(() => {
    return studentPenilaian.filter((p) => p.type === "SAYYIAH");
  }, [studentPenilaian]);

  const studentAbsensi = useMemo(() => {
    if (!selectedSantri) return [];
    return absensiList.filter((a) => a.santriId === selectedSantri.id);
  }, [selectedSantri, absensiList]);

  const disciplineStatus = useMemo(() => {
    if (!selectedSantri) return null;
    return getSantriDisciplineStatus(selectedSantri.currentScore, settings);
  }, [selectedSantri, settings]);

  const sholatWaktu = ["Subuh", "Dhuha", "Dzuhur", "Ashar", "Maghrib", "Isya", "Tahajjud"] as const;

  const todaySholatStatuses = useMemo(() => {
    if (!selectedSantri) return [];
    return sholatWaktu.map((waktu) => {
      const record = studentAbsensi.find((a) => a.waktuSholat === waktu);
      return {
        waktu,
        status: record ? record.status : "Hadir",
        note: record?.notes || ""
      };
    });
  }, [selectedSantri, studentAbsensi]);

  const hadirCount = todaySholatStatuses.filter((s) => s.status === "Hadir").length;

  const totalBonusHasanah = useMemo(() => {
    return hasanahRecords.reduce((acc, curr) => acc + (curr.score || 0), 0);
  }, [hasanahRecords]);

  const totalPenaltiSayyiah = useMemo(() => {
    return sayyiahRecords.reduce((acc, curr) => acc + Math.abs(curr.score || 0), 0);
  }, [sayyiahRecords]);

  const handleDownloadRapor = async () => {
    if (!selectedSantri || isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      showToast("Menyiapkan berkas rapor...", "info");
      await generateSantriPdf(selectedSantri, studentPenilaian, studentAbsensi);
      showToast("Rapor berhasil diunduh", "success");
    } catch {
      showToast("Gagal mengunduh rapor", "error");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getPredikat = (score: number) => {
    if (score >= 90) return "Mumtaz (Istimewa)";
    if (score >= 80) return "Jayyid Jiddan (Sangat Baik)";
    if (score >= 65) return "Jayyid (Baik)";
    return "Maqbul (Cukup)";
  };

  const appLogo = settings?.appLogoUrl || "/logo.png";

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!selectedSantri) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex flex-col justify-between py-6 px-3 sm:px-6">
        <div className="max-w-xl mx-auto w-full space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#1B4D3E] p-2.5 shadow-lg border border-[#C5A059]/40 mx-auto">
              <Image src={appLogo} alt="Mizan" width={48} height={48} className="object-contain" unoptimized />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 uppercase tracking-widest inline-block mb-1">
                Portal Wali Santri
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033]">
                Pesantren Modern Raudhatussalam
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pantau perkembangan akhlak, ketertiban ibadah sholat 7 waktu, dan capaian ananda.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#E2EBF4] space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">
                Pencarian Data Ananda
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Ketik NIS, nama santri, atau no. HP wali..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] text-xs font-semibold focus:outline-none focus:border-[#1B4D3E] text-[#172033]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B]">
                <span>Daftar Santri</span>
                <span>{filteredSearchResults.length} Santri</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredSearchResults.map((santri) => (
                  <div
                    key={santri.id}
                    onClick={() => handleSelectSantri(santri)}
                    className="p-3 rounded-2xl border border-[#E2EBF4] hover:border-[#1B4D3E]/60 bg-[#FAF7EE]/40 hover:bg-[#FAF7EE] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        initials={santri.avatar}
                        size="lg"
                        variant={santri.gender === "Putri" ? "gold" : "primary"}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172033] truncate group-hover:text-[#1B4D3E]">
                          {santri.name}
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          NIS: <span className="font-mono font-bold">{santri.nis}</span> • Kelas {santri.class}
                        </p>
                        {santri.waliName && (
                          <p className="text-[10px] text-[#A8833E] font-medium truncate">
                            Wali: {santri.waliName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                        {formatScore(santri.currentScore)}
                      </span>
                      <div className="flex items-center gap-0.5 text-[10px] text-[#1B4D3E] font-bold mt-1 justify-end">
                        <span>Pilih</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}

                {filteredSearchResults.length === 0 && (
                  <div className="py-8 text-center space-y-2">
                    <User className="w-8 h-8 text-[#94A3B8] mx-auto opacity-60" />
                    <p className="text-xs font-bold text-[#172033]">
                      Santri Tidak Ditemukan
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Pastikan ejaan nama, NIS, atau nomor telepon wali sesuai.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
              <Link
                href="/login"
                className="text-xs font-bold text-[#64748B] hover:text-[#172033] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
              <span className="text-[10px] text-[#94A3B8]">
                Pesantren Modern Raudhatussalam Mahato
              </span>
            </div>
          </div>
        </div>

        <footer className="text-center text-[10px] text-[#94A3B8] py-4">
          MIZAN • Sistem Terpadu Pengasuhan & Penilaian Sikap Santri
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col pb-20">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2EBF4] shadow-xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#1B4D3E] p-1 flex items-center justify-center shadow-xs">
              <Image src={appLogo} alt="Mizan" width={32} height={32} className="object-contain" unoptimized />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black tracking-wide text-[#1B4D3E] text-base">
                  MIZAN
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 uppercase">
                  Wali Santri
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] leading-none hidden sm:block">
                Pesantren Modern Raudhatussalam Mahato
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-xl border border-[#D4C9B5] bg-white text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3 h-3 text-[#A8833E]" />
              <span>Ganti</span>
            </button>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-2xs flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-4 space-y-4">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-[#E2EBF4] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C5A059]/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar
                initials={selectedSantri.avatar}
                size="2xl"
                variant={selectedSantri.gender === "Putri" ? "gold" : "primary"}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-[#172033]">
                    {selectedSantri.name}
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedSantri.gender === "Putri"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}>
                    Santri {selectedSantri.gender}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap font-medium">
                  <span>NIS: <strong className="font-mono text-[#172033]">{selectedSantri.nis}</strong></span>
                  <span>•</span>
                  <span>Kelas: <strong className="text-[#172033]">{selectedSantri.class}</strong></span>
                  {selectedSantri.asrama && (
                    <>
                      <span>•</span>
                      <span>Asrama: <strong className="text-[#172033]">{selectedSantri.asrama}</strong></span>
                    </>
                  )}
                </div>

                {selectedSantri.waliName && (
                  <p className="text-[11px] text-[#A8833E] font-semibold mt-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Wali: {selectedSantri.waliName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="sm:text-right w-full sm:w-auto p-3 sm:p-0 rounded-2xl bg-[#FAF7EE] sm:bg-transparent border border-[#C5A059]/30 sm:border-0">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Status Pembinaan Santri
              </span>
              <div className="mt-1 flex items-center gap-1.5 sm:justify-end">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black border shadow-2xs ${disciplineStatus?.bg} ${disciplineStatus?.color} border-current/20`}>
                  {disciplineStatus?.label || "Aman / Terpuji"}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1 max-w-xs">
                {disciplineStatus?.action || "Adab dan perilaku terjaga dengan baik."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-[#E2EBF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Indeks Skor Akhlak
              </span>
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
            </div>

            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#1B4D3E]">
                {formatScore(selectedSantri.currentScore)}
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Predikat: <strong className="text-[#172033]">{getPredikat(selectedSantri.currentScore)}</strong>
              </p>
            </div>

            <div className="w-full bg-[#EEF2F6] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1B4D3E] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(10, (selectedSantri.currentScore / 100) * 100))}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#94A3B8] font-mono mt-1.5">
              <span>Batas Binaan: 61,000</span>
              <span>Standar: 80,000</span>
              <span>100,000</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-[#E2EBF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Catatan Kebaikan
              </span>
              <Award className="w-4 h-4 text-[#065F46]" />
            </div>

            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#065F46]">
                +{formatScore(totalBonusHasanah)}
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {hasanahRecords.length} Catatan Apresiasi Hasanah
              </p>
            </div>

            <div className="p-2 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-bold text-[#065F46] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Ananda aktif dalam kebaikan dan ketertiban</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-[#E2EBF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Presensi Sholat Hari Ini
              </span>
              <Clock className="w-4 h-4 text-[#A8833E]" />
            </div>

            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#172033]">
                {hadirCount} <span className="text-sm font-normal text-[#64748B]">/ 7 Waktu</span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Kehadiran Sholat Berjamaah Masjid
              </p>
            </div>

            <div className="p-2 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/30 text-[10px] font-bold text-[#A8833E] flex items-center justify-between">
              <span>Tertib 7 Waktu</span>
              <span className="font-mono">{Math.round((hadirCount / 7) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-[#E2EBF4] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1B4D3E]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#172033]">
                Ketertiban Sholat 7 Waktu Hari Ini
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
              Berjamaah
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {todaySholatStatuses.map((s) => {
              const isHadir = s.status === "Hadir";
              return (
                <div
                  key={s.waktu}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    isHadir
                      ? "bg-[#ECFDF5]/60 border-[#A7F3D0] text-[#065F46]"
                      : "bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]"
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {s.waktu === "Tahajjud" || s.waktu === "Isya" || s.waktu === "Subuh" ? (
                      <Moon className="w-3.5 h-3.5 opacity-80" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 opacity-80" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#172033]">
                    {s.waktu}
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span className="text-[10px] font-bold">
                      {s.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-[#E2EBF4] overflow-hidden">
          <div className="flex items-center border-b border-[#E2EBF4] bg-[#F8FAFC] overflow-x-auto p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("RINGKASAN")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "RINGKASAN"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Ringkasan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("KEBAIKAN")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "KEBAIKAN"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Kebaikan ({hasanahRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("EVALUASI")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "EVALUASI"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Evaluasi ({sayyiahRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("RAPOR")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "RAPOR"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Rapor
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "RINGKASAN" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#A8833E]">
                    <Sparkles className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Maklumat Pimpinan Pesantren
                    </h4>
                  </div>
                  <p className="text-xs text-[#172033] leading-relaxed">
                    Pesantren Modern Raudhatussalam Mahato senantiasa mengedepankan pembinaan adab, ketertiban ubudiyah, dan kedisiplinan hidup mandiri santri. Nilai akhlak ananda diperbarui secara berkesinambungan oleh dewan asatidz dan pengasuhan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-[#E2EBF4] bg-[#F8FAFC] space-y-1">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">
                      Informasi Asrama & Musyrif
                    </span>
                    <p className="text-xs font-bold text-[#172033]">
                      Kamar: {selectedSantri.kamar || "Kamar Santri"}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Gedung Asrama: {selectedSantri.asrama || "Asrama Pusat"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-[#E2EBF4] bg-[#F8FAFC] space-y-1">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">
                      Rekap Kehadiran
                    </span>
                    <p className="text-xs font-bold text-[#172033]">
                      Hadir: {selectedSantri.totalHadir ?? 28} Hari
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Alpa: {selectedSantri.totalAlpa ?? 0} Hari
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[#E2EBF4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#065F46] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#172033]">
                        Rapor Akhlak & Karakter Santri
                      </h4>
                      <p className="text-[10px] text-[#64748B]">
                        Dokumen resmi rekapitulasi penilaian sikap semester ini.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadRapor}
                    disabled={isDownloadingPdf}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloadingPdf ? "Menyiapkan" : "Unduh"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "KEBAIKAN" && (
              <div className="space-y-3">
                {hasanahRecords.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5]/50 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#A7F3D0] text-[#065F46] flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172033]">
                          {item.indicatorText || item.unsurName || "Prestasi Kebaikan"}
                        </p>
                        <p className="text-[10px] text-[#065F46] font-semibold mt-0.5">
                          Kategori: {item.category}
                        </p>
                        {item.notes && (
                          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                            {item.notes}
                          </p>
                        )}
                        <p className="text-[9px] text-[#94A3B8] font-mono mt-1">
                          Dicatat: {item.guruName || "Pembina Santri"}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#065F46] text-white shrink-0">
                      +{formatScore(item.score)}
                    </span>
                  </div>
                ))}

                {hasanahRecords.length === 0 && (
                  <div className="py-12 text-center space-y-2">
                    <Award className="w-8 h-8 text-[#94A3B8] mx-auto opacity-60" />
                    <p className="text-xs font-bold text-[#172033]">
                      Belum Ada Catatan Khusus
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Capaian dan apresiasi kebaikan ananda akan dicatat oleh pembina santri.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "EVALUASI" && (
              <div className="space-y-3">
                {sayyiahRecords.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-red-200 bg-red-50/50 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-red-200 text-[#B91C1C] flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172033]">
                          {item.indicatorText || item.unsurName || "Catatan Kedisiplinan"}
                        </p>
                        <p className="text-[10px] text-[#B91C1C] font-semibold mt-0.5">
                          Tingkat: {item.tingkat || item.category || "Pembinaan"}
                        </p>
                        {item.notes && (
                          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                            {item.notes}
                          </p>
                        )}
                        <p className="text-[9px] text-[#94A3B8] font-mono mt-1">
                          Pembina: {item.guruName || "Bagian Pengasuhan"}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#B91C1C] text-white shrink-0">
                      -{formatScore(Math.abs(item.score))}
                    </span>
                  </div>
                ))}

                {sayyiahRecords.length === 0 && (
                  <div className="py-12 text-center space-y-2">
                    <CheckCheck className="w-8 h-8 text-[#065F46] mx-auto opacity-70" />
                    <p className="text-xs font-bold text-[#065F46]">
                      Alhamdulillah, Nihil Pelanggaran
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Ananda senantiasa menjaga adab, sopan santun, dan ketertiban pondok.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "RAPOR" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-[#E2EBF4] bg-[#FAF7EE]/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4]">
                    <div>
                      <h4 className="text-sm font-bold text-[#172033]">
                        Rapor Penilaian Sikap & Perilaku Santri
                      </h4>
                      <p className="text-[10px] text-[#64748B]">
                        Semester Berjalan • Pesantren Modern Raudhatussalam Mahato
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadRapor}
                      disabled={isDownloadingPdf}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E2EBF4]">
                      <span className="text-[10px] text-[#64748B] block">Nilai Akhir</span>
                      <strong className="font-mono text-[#1B4D3E] text-base">
                        {formatScore(selectedSantri.currentScore)}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#E2EBF4]">
                      <span className="text-[10px] text-[#64748B] block">Predikat</span>
                      <strong className="text-[#172033]">
                        {getPredikat(selectedSantri.currentScore).split(" ")[0]}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#E2EBF4]">
                      <span className="text-[10px] text-[#64748B] block">Kehadiran</span>
                      <strong className="text-[#065F46]">
                        {selectedSantri.totalHadir ?? 28} Hadir
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#E2EBF4]">
                      <span className="text-[10px] text-[#64748B] block">Status Disiplin</span>
                      <strong className="text-[#172033]">
                        {disciplineStatus?.label || "Aman"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] text-[11px] text-[#64748B] flex items-center justify-between">
                  <span>Butuh berkas fisik resmi bertanda tangan pimpinan?</span>
                  <button
                    type="button"
                    onClick={handleDownloadRapor}
                    className="text-xs font-bold text-[#1B4D3E] hover:underline cursor-pointer"
                  >
                    Unduh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-[#E2EBF4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 flex items-center justify-center text-[#A8833E] shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172033]">
                Komunikasi dengan Bagian Pengasuhan
              </h4>
              <p className="text-[10px] text-[#64748B]">
                Wali santri dapat berkonsultasi mengenai perkembangan ananda.
              </p>
            </div>
          </div>

          <a
            href={
              selectedSantri.gender === "Putri"
                ? "https://wa.me/6281234567891?text=Assalamu%27alaikum%2C%20saya%20wali%20santri%20dari%20" + encodeURIComponent(selectedSantri.name)
                : "https://wa.me/6281234567890?text=Assalamu%27alaikum%2C%20saya%20wali%20santri%20dari%20" + encodeURIComponent(selectedSantri.name)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#065F46] text-white text-xs font-bold hover:bg-[#054d38] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Hubungi</span>
          </a>
        </div>
      </main>

      <footer className="text-center text-[10px] text-[#94A3B8] py-4 mt-auto">
        MIZAN • Pesantren Modern Raudhatussalam Mahato
      </footer>
    </div>
  );
}
