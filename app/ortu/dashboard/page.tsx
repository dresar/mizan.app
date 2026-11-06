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
  AlertTriangle,
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
  CheckCheck,
  MapPin,
  UserCheck,
  KeyRound,
  Lock,
  Bell,
  Info,
  HeartPulse,
  Wallet,
  Ticket,
  QrCode,
  Plus,
  PhoneCall,
  X
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Santri, formatScore, getSantriDisciplineStatus, PerizinanRecord } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { generateSantriPdf } from "@/lib/pdf-generator";
import { formatWIBDate, formatWIBDateTime, getWIBTime, getWIBDate } from "@/lib/date-utils";
import { QrPassCard } from "@/components/QrPassCard";

export default function OrtuDashboardPage() {
  const router = useRouter();
  const {
    santriList,
    penilaianList,
    absensiList,
    settings,
    currentUser,
    loginUser,
    logoutUser,
    refreshData,
    showToast,
    tahfidzList,
    kesehatanList,
    perizinanList,
    sambanganList,
    transaksiList,
    tagihanSppList,
    catatanMusyrifList,
    addPerizinan,
    addSambangan
  } = useMizan();

  const [selectedSantriId, setSelectedSantriId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "RINGKASAN"
    | "TAHFIDZ"
    | "KESEHATAN"
    | "KEUANGAN"
    | "PERIZINAN"
    | "KEBAIKAN"
    | "PELANGGARAN"
    | "PRESENSI"
    | "RAPOR"
  >("RINGKASAN");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loginNis, setLoginNis] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeIzinPanel, setActiveIzinPanel] = useState<"NONE" | "FORM_IZIN" | "FORM_SAMBANG">("NONE");
  const [selectedQrRecord, setSelectedQrRecord] = useState<PerizinanRecord | null>(null);
  const [izinJenis, setIzinJenis] = useState("Pulang");
  const [izinAlasan, setIzinAlasan] = useState("");
  const [izinKeluar, setIzinKeluar] = useState("");
  const [izinKembali, setIzinKembali] = useState("");
  const [sambangTanggal, setSambangTanggal] = useState("");
  const [sambangSesi, setSambangSesi] = useState("Sesi Pagi (09:00 - 11:30)");
  const [sambangPengunjung, setSambangPengunjung] = useState(2);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveDateString = useMemo(() => {
    if (!currentTime) return "";
    return formatWIBDate(currentTime, "full");
  }, [currentTime]);

  const liveTimeString = useMemo(() => {
    if (!currentTime) return "";
    return `${getWIBTime(currentTime, true)} WIB`;
  }, [currentTime]);

  useEffect(() => {
    setIsClient(true);
    if (currentUser?.role === "ORTU" && currentUser?.santriId) {
      setSelectedSantriId(currentUser.santriId);
    } else {
      try {
        const savedId = localStorage.getItem("mizan_ortu_santri_id");
        if (savedId) {
          setSelectedSantriId(savedId);
        }
      } catch {
        void 0;
      }
    }
  }, [currentUser]);

  const selectedSantri = useMemo(() => {
    if (!santriList.length) return null;
    if (selectedSantriId) {
      const match = santriList.find((s) => s.id === selectedSantriId);
      if (match) return match;
    }
    if (currentUser?.role === "ORTU" && santriList.length === 1) {
      return santriList[0];
    }
    return null;
  }, [selectedSantriId, santriList, currentUser]);

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

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      showToast("Data diperbarui realtime", "success");
    } catch {
      showToast("Gagal memperbarui data", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setSelectedSantriId("");
    try {
      localStorage.removeItem("mizan_ortu_santri_id");
      document.cookie = "mizan_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "mizan_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "mizan_uid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "mizan_santri_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {
      void 0;
    }
    router.push("/login");
  };

  const handleOrtuLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginNis.trim() || !loginPassword.trim()) {
      showToast("Masukkan nomor stambuk dan kata sandi", "error");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginNis.trim(), password: loginPassword.trim() })
      });
      const data = await res.json();
      if (data.success && data.user) {
        loginUser(data.user);
        if (data.user.santriId) {
          setSelectedSantriId(data.user.santriId);
          try {
            localStorage.setItem("mizan_ortu_santri_id", data.user.santriId);
          } catch {
            void 0;
          }
        }
        showToast("Login berhasil", "success");
      } else {
        showToast(data.message || "Gagal masuk", "error");
      }
    } catch {
      showToast("Kendala koneksi ke server", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return santriList;
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
    return penilaianList
      .filter((p) => p.santriId === selectedSantri.id)
      .sort((a, b) => {
        const da = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
        const db = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
        return db - da;
      });
  }, [selectedSantri, penilaianList]);

  const hasanahRecords = useMemo(() => {
    return studentPenilaian.filter((p) => p.type === "HASANAH");
  }, [studentPenilaian]);

  const sayyiahRecords = useMemo(() => {
    return studentPenilaian.filter((p) => p.type === "SAYYIAH");
  }, [studentPenilaian]);

  const latestSayyiah = useMemo(() => {
    return sayyiahRecords.length > 0 ? sayyiahRecords[0] : null;
  }, [sayyiahRecords]);

  const childTahfidz = useMemo(() => {
    if (!selectedSantri) return [];
    return tahfidzList.filter((t) => t.santriId === selectedSantri.id);
  }, [selectedSantri, tahfidzList]);

  const childKesehatan = useMemo(() => {
    if (!selectedSantri) return [];
    return kesehatanList.filter((k) => k.santriId === selectedSantri.id);
  }, [selectedSantri, kesehatanList]);

  const childPerizinan = useMemo(() => {
    if (!selectedSantri) return [];
    return perizinanList.filter((p) => p.santriId === selectedSantri.id);
  }, [selectedSantri, perizinanList]);

  const childSambangan = useMemo(() => {
    if (!selectedSantri) return [];
    return sambanganList.filter((s) => s.santriId === selectedSantri.id);
  }, [selectedSantri, sambanganList]);

  const childTransaksi = useMemo(() => {
    if (!selectedSantri) return [];
    return transaksiList.filter((t) => t.santriId === selectedSantri.id);
  }, [selectedSantri, transaksiList]);

  const childSpp = useMemo(() => {
    if (!selectedSantri) return [];
    return tagihanSppList.filter((s) => s.santriId === selectedSantri.id);
  }, [selectedSantri, tagihanSppList]);

  const childCatatanMusyrif = useMemo(() => {
    if (!selectedSantri) return [];
    return catatanMusyrifList.filter((m) => m.santriId === selectedSantri.id);
  }, [selectedSantri, catatanMusyrifList]);

  const handlePengajuanIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri || !izinKeluar || !izinKembali || !izinAlasan) return;
    setIsSubmittingForm(true);
    await addPerizinan({
      santriId: selectedSantri.id,
      santriName: selectedSantri.name,
      santriClass: selectedSantri.class,
      gender: selectedSantri.gender,
      jenisIzin: izinJenis,
      alasan: izinAlasan,
      tglKeluar: izinKeluar,
      tglKembali: izinKembali,
      diajukanOleh: currentUser?.name || selectedSantri.waliName || "Wali Santri"
    });
    setIsSubmittingForm(false);
    setActiveIzinPanel("NONE");
    setIzinAlasan("");
    setIzinKeluar("");
    setIzinKembali("");
  };

  const handlePengajuanSambang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri || !sambangTanggal) return;
    setIsSubmittingForm(true);
    await addSambangan({
      santriId: selectedSantri.id,
      santriName: selectedSantri.name,
      gender: selectedSantri.gender,
      waliName: currentUser?.name || selectedSantri.waliName || "Wali Santri",
      tanggalSambang: sambangTanggal,
      sesiWaktu: sambangSesi,
      jumlahPengunjung: Number(sambangPengunjung) || 2
    });
    setIsSubmittingForm(false);
    setActiveIzinPanel("NONE");
    setSambangTanggal("");
  };

  const studentAbsensi = useMemo(() => {
    if (!selectedSantri) return [];
    return absensiList
      .filter((a) => a.santriId === selectedSantri.id)
      .sort((a, b) => {
        const da = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
        const db = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
        return db - da;
      });
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

  const waContactUrl = useMemo(() => {
    if (!selectedSantri) return "https://wa.me/6281234567890";
    const baseNumber = selectedSantri.gender === "Putri" ? "6281234567891" : "6281234567890";
    const msg = `Assalamu'alaikum Pengasuhan Raudhatussalam, saya wali dari ${selectedSantri.name} (Kelas ${selectedSantri.class}). Mohon izin berkonsultasi mengenai perkembangan ananda.`;
    return `https://wa.me/${baseNumber}?text=${encodeURIComponent(msg)}`;
  }, [selectedSantri]);

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
              <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033]">
                Pesantren Modern Raudhatussalam
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pantau perkembangan akhlak, ketertiban ibadah sholat 7 waktu, dan capaian ananda.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#E2EBF4] space-y-5">
            <form onSubmit={handleOrtuLogin} className="space-y-3 pb-4 border-b border-[#E2EBF4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 text-[#1B4D3E] flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#172033]">
                    Masuk Akun Wali Santri
                  </h3>
                  <p className="text-[10px] text-[#64748B]">
                    Gunakan No. Stambuk murid & kata sandi RDS1234
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                    No. Stambuk / NIS
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Contoh: 221488"
                      value={loginNis}
                      onChange={(e) => setLoginNis(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2EBF4] text-xs font-semibold focus:outline-none focus:border-[#1B4D3E] text-[#172033]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
                    <input
                      type="password"
                      placeholder="Default: RDS1234"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2EBF4] text-xs font-semibold focus:outline-none focus:border-[#1B4D3E] text-[#172033]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isLoggingIn ? "Memeriksa" : "Masuk"}</span>
              </button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033]">
                  Atau Cari Nama Ananda Langsung
                </span>
                <span className="text-[10px] font-bold text-[#A8833E]">
                  {santriList.length} Santri
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Ketik nama santri atau kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EBF4] text-xs font-semibold focus:outline-none focus:border-[#1B4D3E] text-[#172033]"
                />
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[#F1F5F9] border border-[#E2EBF4] rounded-2xl">
                {filteredSearchResults.slice(0, 30).map((santri) => (
                  <button
                    key={santri.id}
                    type="button"
                    onClick={() => handleSelectSantri(santri)}
                    className="w-full p-2.5 flex items-center justify-between text-left hover:bg-[#FAF7EE] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        initials={santri.avatar}
                        size="sm"
                        variant={santri.gender === "Putri" ? "gold" : "primary"}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172033] group-hover:text-[#1B4D3E] truncate">
                          {santri.name}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] font-mono">
                          NIS: {santri.nis} • {santri.class} ({santri.gender === "Putra" ? "L" : "P"})
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[#C5A059] font-bold flex items-center gap-0.5">
                      <span>Buka</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
                {filteredSearchResults.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#94A3B8]">
                    Santri tidak ditemukan dengan kata kunci &quot;{searchQuery}&quot;
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
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.2 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Realtime</span>
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
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-2.5 py-1.5 rounded-xl border border-[#D4C9B5] bg-white text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Segarkan data realtime"
            >
              <RefreshCw className={`w-3 h-3 text-[#A8833E] ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 rounded-xl border border-[#D4C9B5] bg-white text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <User className="w-3 h-3 text-[#1B4D3E]" />
              <span>Ganti</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-5 md:py-8 space-y-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-[#E2EBF4] relative overflow-hidden">
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
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    selectedSantri.gender === "Putri"
                      ? "bg-pink-50 text-pink-800 border-pink-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                  }`}>
                    {selectedSantri.gender === "Putra" ? "L" : "P"}
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

                <div className="flex items-center gap-3 text-[11px] text-[#A8833E] font-semibold mt-1 flex-wrap">
                  {selectedSantri.waliName && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Wali: {selectedSantri.waliName}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-mono text-[#1B4D3E]" suppressHydrationWarning>
                    <Clock className="w-3 h-3" />
                    <span>{liveDateString} • {liveTimeString}</span>
                  </span>
                </div>
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

        <div className="space-y-3">
          {sayyiahRecords.length > 0 || (selectedSantri.currentScore < 80) ? (
            <div className="rounded-3xl p-4 sm:p-5 bg-[#FEF2F2] border border-[#FECACA] shadow-md space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#FECACA] text-[#B91C1C] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#B91C1C]">
                        Peringatan Kedisiplinan
                      </span>
                      <span className="text-xs font-bold text-[#991B1B]">
                        {disciplineStatus?.label || "Perlu Perhatian"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#172033] mt-1">
                      Pemberitahuan Pembinaan Ananda
                    </h3>
                    <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                      Ananda memiliki <strong className="text-[#991B1B]">{sayyiahRecords.length} catatan pelanggaran</strong> dengan akumulasi pengurangan skor <strong className="text-[#991B1B]">-{formatScore(totalPenaltiSayyiah)}</strong>. Tindakan: {disciplineStatus?.action}
                    </p>
                    {latestSayyiah && (
                      <p className="text-[11px] text-[#B91C1C] font-medium mt-1">
                        Catatan terakhir: &quot;{latestSayyiah.indicatorText}&quot; ({formatWIBDate(latestSayyiah.incidentDate || latestSayyiah.createdAt, "short")} pukul {latestSayyiah.incidentTime || "WIB"})
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={waContactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-bold hover:bg-[#991B1B] transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Hubungi</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl p-4 sm:p-5 bg-[#ECFDF5] border border-[#A7F3D0] shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#A7F3D0] text-[#065F46] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                      Kondisi Terpuji
                    </span>
                    <span className="text-xs font-bold text-[#065F46]">
                      Bebas Surat Peringatan
                    </span>
                  </div>
                  <p className="text-xs text-[#172033] mt-0.5">
                    Alhamdulillah, ananda senantiasa menjaga ketertiban dan sopan santun. Tidak ada catatan sanksi atau surat peringatan aktif.
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right shrink-0">
                <span className="text-xs font-mono font-black text-[#065F46] block">
                  {formatScore(selectedSantri.currentScore)} Poin
                </span>
                <span className="text-[10px] text-[#64748B]">Indeks Akhlak</span>
              </div>
            </div>
          )}

          {settings?.popupActive && settings?.popupMessage && (
            <div className="rounded-3xl p-4 bg-[#FAF7EE] border border-[#C5A059]/40 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#C5A059]/40 text-[#A8833E] flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#A8833E] border border-[#C5A059]/30">
                    {settings.popupType || "Maklumat"}
                  </span>
                  <span className="text-xs font-bold text-[#172033]">
                    {settings.popupTitle || "Maklumat Pimpinan Pesantren"}
                  </span>
                </div>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  {settings.popupMessage}
                </p>
                <p className="text-[10px] text-[#A8833E] mt-1 font-semibold">
                  {settings.popupSender || "Pimpinan Pesantren"} • {settings.popupUpdatedAt ? formatWIBDateTime(settings.popupUpdatedAt) : "Terkini"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-lg border border-[#E2EBF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Skor Akhlak
              </span>
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
            </div>

            <div className="my-2.5">
              <div className="text-xl sm:text-3xl font-mono font-black text-[#1B4D3E]">
                {formatScore(selectedSantri.currentScore)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-0.5 truncate">
                {getPredikat(selectedSantri.currentScore).split(" ")[0]}
              </p>
            </div>

            <div className="w-full bg-[#EEF2F6] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1B4D3E] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(10, (selectedSantri.currentScore / 100) * 100))}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-[#94A3B8] font-mono mt-1">
              <span>Standar 80</span>
              <span>100</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-lg border border-[#E2EBF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Kebaikan
              </span>
              <Award className="w-4 h-4 text-[#065F46]" />
            </div>

            <div className="my-2.5">
              <div className="text-xl sm:text-3xl font-mono font-black text-[#065F46]">
                +{formatScore(totalBonusHasanah)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-0.5">
                {hasanahRecords.length} Prestasi Hasanah
              </p>
            </div>

            <div className="p-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[9px] sm:text-[10px] font-bold text-[#065F46] truncate">
              Apresiasi adab ananda
            </div>
          </div>

          <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-lg border border-[#E2EBF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Pelanggaran
              </span>
              <ShieldAlert className="w-4 h-4 text-[#B91C1C]" />
            </div>

            <div className="my-2.5">
              <div className="text-xl sm:text-3xl font-mono font-black text-[#B91C1C]">
                -{formatScore(totalPenaltiSayyiah)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-0.5">
                {sayyiahRecords.length} Catatan Sayyi&apos;ah
              </p>
            </div>

            <div className={`p-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold truncate ${
              sayyiahRecords.length === 0
                ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]"
                : "bg-red-50 border border-red-200 text-[#B91C1C]"
            }`}>
              {sayyiahRecords.length === 0 ? "Nihil Pelanggaran" : disciplineStatus?.label || "Perlu Binaan"}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-lg border border-[#E2EBF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Sholat Hari Ini
              </span>
              <Clock className="w-4 h-4 text-[#A8833E]" />
            </div>

            <div className="my-2.5">
              <div className="text-xl sm:text-3xl font-mono font-black text-[#172033]">
                {hadirCount} <span className="text-xs font-normal text-[#64748B]">/ 7</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-0.5">
                Berjamaah di Masjid
              </p>
            </div>

            <div className="p-1.5 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/30 text-[9px] sm:text-[10px] font-bold text-[#A8833E] flex items-center justify-between">
              <span>Tertib</span>
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
              onClick={() => setActiveTab("TAHFIDZ")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "TAHFIDZ"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Tahfidz ({childTahfidz.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("KESEHATAN")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "KESEHATAN"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Kesehatan ({childKesehatan.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("KEUANGAN")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "KEUANGAN"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Keuangan ({childTransaksi.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PERIZINAN")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "PERIZINAN"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Perizinan ({childPerizinan.length})
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
              onClick={() => setActiveTab("PELANGGARAN")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "PELANGGARAN"
                  ? "bg-[#B91C1C] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FEF2F2]"
              }`}
            >
              Pelanggaran ({sayyiahRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PRESENSI")}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "PRESENSI"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
              }`}
            >
              Presensi ({studentAbsensi.length})
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs space-y-1">
                    <span className="text-[10px] text-[#64748B] font-bold block">Status Kesehatan</span>
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      selectedSantri.currentHealthStatus === "Rawat Inap Klinik" || selectedSantri.currentHealthStatus === "Rujuk RS"
                        ? "bg-rose-100 text-rose-800"
                        : selectedSantri.currentHealthStatus === "Istirahat di Kamar"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {selectedSantri.currentHealthStatus || "Sehat"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs space-y-1">
                    <span className="text-[10px] text-[#64748B] font-bold block">Sisa Uang Saku</span>
                    <span className="text-xs font-bold text-[#172033] block">
                      Rp {(selectedSantri.pocketBalance || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] block">
                      Limit: Rp {(selectedSantri.dailyPocketLimit || 25000).toLocaleString("id-ID")}/hari
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs space-y-1">
                    <span className="text-[10px] text-[#64748B] font-bold block">Hafalan Terakhir</span>
                    <span className="text-xs font-bold text-emerald-700 block truncate">
                      {childTahfidz[0] ? `${childTahfidz[0].surahName} (Juz ${childTahfidz[0].juz})` : "Belum ada setoran"}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] block truncate">
                      {childTahfidz[0]?.predikat || "Tahfidz Harian"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs space-y-1">
                    <span className="text-[10px] text-[#64748B] font-bold block">Musyrif Kamar</span>
                    <span className="text-xs font-bold text-[#172033] block truncate">
                      {selectedSantri.musyrifName || "Pembina Asrama"}
                    </span>
                    <a
                      href={`https://wa.me/${(selectedSantri.musyrifPhone || "6281234567890").replace(/[^0-9]/g, "")}?text=Assalamu%27alaikum%20Ustadz%2C%20saya%20wali%20dari%20${encodeURIComponent(selectedSantri.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      <PhoneCall className="w-2.5 h-2.5" /> WhatsApp
                    </a>
                  </div>
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

            {activeTab === "TAHFIDZ" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#A8833E] uppercase tracking-wider block">
                      Target Tahfidz Tahunan
                    </span>
                    <h3 className="text-sm font-bold text-[#172033] mt-0.5">
                      Target 3 Juz Al-Qur'an (Target Mutqin)
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Total setoran tercatat: {childTahfidz.length} kali halaqah
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] text-center min-w-[120px]">
                    <span className="text-[10px] text-[#94A3B8] font-bold block">Juz Terakhir</span>
                    <span className="text-base font-black text-[#1B4D3E]">
                      {childTahfidz[0] ? `Juz ${childTahfidz[0].juz}` : "-"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Riwayat Setoran Hafalan Santri
                  </h4>
                  {childTahfidz.length === 0 ? (
                    <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2EBF4]">
                      Belum ada riwayat setoran hafalan yang tercatat
                    </div>
                  ) : (
                    childTahfidz.map((t) => (
                      <div key={t.id} className="p-3.5 rounded-2xl border border-[#E2EBF4] bg-white space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#172033]">
                            Surat {t.surahName} (Ayat {t.ayatStart}-{t.ayatEnd})
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Juz {t.juz} • {t.predikat}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                          <span>Kuantitas: {t.halaman} Halaman • {t.date}</span>
                          <span>Penyimak: {t.ustadzName}</span>
                        </div>
                        {t.catatanUstadz && (
                          <p className="text-[11px] text-[#172033] italic pt-1 border-t border-[#E2EBF4]">
                            "{t.catatanUstadz}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "KESEHATAN" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 space-y-1">
                    <span className="text-[10px] font-bold text-[#A8833E] uppercase block">
                      Status Klinis Hari Ini
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
                      selectedSantri.currentHealthStatus === "Rawat Inap Klinik" || selectedSantri.currentHealthStatus === "Rujuk RS"
                        ? "bg-rose-100 text-rose-800"
                        : selectedSantri.currentHealthStatus === "Istirahat di Kamar"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {selectedSantri.currentHealthStatus || "Kondisi Sehat"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] space-y-1">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                      Riwayat Alergi / Catatan Khusus
                    </span>
                    <p className="text-xs text-[#172033] font-medium">
                      {selectedSantri.riwayatAlergi || "Tidak ada riwayat alergi yang didaftarkan"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Riwayat Kunjungan Poskestren / Klinik Pondok
                  </h4>
                  {childKesehatan.length === 0 ? (
                    <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2EBF4]">
                      Alhamdulillah ananda dalam kondisi sehat dan tidak memiliki catatan sakit
                    </div>
                  ) : (
                    childKesehatan.map((k) => (
                      <div key={k.id} className="p-3.5 rounded-2xl border border-[#E2EBF4] bg-white space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#172033]">
                            Tanggal Pemeriksaan: {k.tanggal}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800">
                            {k.statusRawat}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F8FAFC] text-xs space-y-0.5">
                          <p><span className="text-[#94A3B8]">Keluhan:</span> <span className="font-semibold text-[#172033]">{k.keluhan}</span></p>
                          <p><span className="text-[#94A3B8]">Diagnosa:</span> <span className="text-[#172033]">{k.diagnosa}</span></p>
                          <p><span className="text-[#94A3B8]">Obat/Tindakan:</span> <span className="text-[#172033]">{k.tindakanObat}</span></p>
                        </div>
                        <span className="text-[10px] text-[#94A3B8] block text-right">Pemeriksa: {k.petugasNama}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "KEUANGAN" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      Sisa Saldo Uang Saku
                    </span>
                    <h3 className="text-lg font-black text-emerald-800">
                      Rp {(selectedSantri.pocketBalance || 0).toLocaleString("id-ID")}
                    </h3>
                    <p className="text-[11px] text-emerald-700">
                      Batas Belanja Santri: Rp {(selectedSantri.dailyPocketLimit || 25000).toLocaleString("id-ID")}/hari
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 space-y-1">
                    <span className="text-[10px] font-bold text-[#A8833E] uppercase block">
                      Informasi Penambahan Saldo
                    </span>
                    <p className="text-xs text-[#172033]">
                      Wali murid dapat menitipkan uang jajan secara manual melalui musyrif asrama, dan saldo ananda akan diperbarui di sistem secara transparan.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Mutasi Belanja & Titipan Uang Saku
                  </h4>
                  {childTransaksi.length === 0 ? (
                    <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2EBF4]">
                      Belum ada transaksi uang saku
                    </div>
                  ) : (
                    childTransaksi.map((t) => (
                      <div key={t.id} className="p-3.5 rounded-2xl border border-[#E2EBF4] bg-white flex items-center justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#172033]">{t.deskripsi}</span>
                            <span className="text-[10px] text-[#94A3B8]">{t.tanggal}</span>
                          </div>
                          <span className="text-[10px] text-[#94A3B8] block">Metode: {t.metodePembayaran}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold block ${t.jenis === "IN" ? "text-emerald-700" : "text-rose-600"}`}>
                            {t.jenis === "IN" ? "+" : "-"}Rp {t.nominal.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">Sisa: Rp {t.saldoTerakhir.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#E2EBF4]">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Tagihan SPP Asrama
                  </h4>
                  {childSpp.length === 0 ? (
                    <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2EBF4]">
                      Belum ada tagihan SPP untuk ananda
                    </div>
                  ) : (
                    childSpp.map((s) => (
                      <div key={s.id} className="p-3.5 rounded-2xl border border-[#E2EBF4] bg-white flex items-center justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#172033]">Bulan {s.bulan} {s.tahun}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              s.status === "LUNAS" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {s.status}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#172033] block mt-0.5">
                            Rp {s.nominal.toLocaleString("id-ID")}
                          </span>
                          {s.kuitansiNomor && (
                            <span className="text-[10px] text-emerald-700 font-mono block">
                              No. Kuitansi: {s.kuitansiNomor}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#94A3B8]">
                          {s.tglBayar ? `Lunas pada: ${s.tglBayar}` : `Jatuh tempo: ${s.jatuhTempo}`}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "PERIZINAN" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Status Izin Keluar & Sambang
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveIzinPanel(activeIzinPanel === "FORM_IZIN" ? "NONE" : "FORM_IZIN")}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                        activeIzinPanel === "FORM_IZIN"
                          ? "bg-[#172033] text-white"
                          : "bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{activeIzinPanel === "FORM_IZIN" ? "Tutup Form" : "Ajukan Izin Pulang"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveIzinPanel(activeIzinPanel === "FORM_SAMBANG" ? "NONE" : "FORM_SAMBANG")}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeIzinPanel === "FORM_SAMBANG"
                          ? "bg-[#172033] text-white"
                          : "bg-[#FAF7EE] hover:bg-[#FAF7EE]/80 border border-[#D4C9B5] text-[#172033]"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#A8833E]" />
                      <span>{activeIzinPanel === "FORM_SAMBANG" ? "Tutup Form" : "Jadwalkan Sambang"}</span>
                    </button>
                  </div>
                </div>

                {activeIzinPanel === "FORM_IZIN" && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#1B4D3E]/30 shadow-md space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4]">
                      <h3 className="text-xs sm:text-sm font-bold text-[#172033]">Form Pengajuan Izin Keluar/Pulang Santri</h3>
                      <button
                        type="button"
                        onClick={() => setActiveIzinPanel("NONE")}
                        className="w-7 h-7 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handlePengajuanIzin} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-xs font-bold text-[#172033] mb-1">Jenis Izin:</label>
                        <select
                          value={izinJenis}
                          onChange={(e) => setIzinJenis(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-semibold text-[#172033]"
                        >
                          <option value="Pulang">Pulang ke Rumah (Kepentingan Keluarga)</option>
                          <option value="Sakit">Izin Sakit / Berobat Luar</option>
                          <option value="Acara Pondok / Lomba">Acara Pondok / Dispensasi Lomba</option>
                          <option value="Keluar Sebentar">Keluar Sebentar</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-[#172033] mb-1">Tgl Keluar:</label>
                          <input
                            type="date"
                            value={izinKeluar}
                            onChange={(e) => setIzinKeluar(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#172033] mb-1">Tgl Kembali:</label>
                          <input
                            type="date"
                            value={izinKembali}
                            onChange={(e) => setIzinKembali(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#172033] mb-1">Alasan / Kepentingan:</label>
                        <textarea
                          value={izinAlasan}
                          onChange={(e) => setIzinAlasan(e.target.value)}
                          rows={2}
                          placeholder="Sebutkan keperluan izin secara jelas..."
                          className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                          required
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveIzinPanel("NONE")}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#64748B] font-bold cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingForm}
                          className="px-4 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white font-bold disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmittingForm ? "Mengirim..." : "Kirim Pengajuan Izin"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeIzinPanel === "FORM_SAMBANG" && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#C5A059]/40 shadow-md space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4]">
                      <h3 className="text-xs sm:text-sm font-bold text-[#172033]">Form Reservasi Jadwal Sambangan</h3>
                      <button
                        type="button"
                        onClick={() => setActiveIzinPanel("NONE")}
                        className="w-7 h-7 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handlePengajuanSambang} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-[#172033] mb-1">Tanggal Sambang:</label>
                          <input
                            type="date"
                            value={sambangTanggal}
                            onChange={(e) => setSambangTanggal(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#172033] mb-1">Jumlah Pengunjung:</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={sambangPengunjung}
                            onChange={(e) => setSambangPengunjung(Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#172033] mb-1">Pilihan Sesi Sambang:</label>
                        <select
                          value={sambangSesi}
                          onChange={(e) => setSambangSesi(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-semibold text-[#172033]"
                        >
                          <option value="Sesi Pagi (09:00 - 11:30)">Sesi Pagi (09:00 - 11:30)</option>
                          <option value="Sesi Siang (13:30 - 16:30)">Sesi Siang (13:30 - 16:30)</option>
                        </select>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveIzinPanel("NONE")}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#64748B] font-bold cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingForm}
                          className="px-4 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white font-bold disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmittingForm ? "Menyimpan..." : "Reservasi Sekarang"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-3">
                  {childPerizinan.length === 0 ? (
                    <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2EBF4]">
                      Belum ada riwayat perizinan santri
                    </div>
                  ) : (
                    childPerizinan.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[#172033] block">{p.jenisIzin}</span>
                            <span className="text-[11px] text-[#64748B] block">
                              Jadwal: {p.tglKeluar} s/d {p.tglKembali}
                            </span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            p.status === "DISETUJUI"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "BERJALAN"
                              ? "bg-amber-100 text-amber-800"
                              : p.status === "SELESAI"
                              ? "bg-blue-100 text-blue-800"
                              : p.status === "MENUNGGU"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        {p.alasan && (
                          <p className="text-xs text-[#172033] p-2.5 rounded-xl bg-[#FAF7EE]">
                            <span className="text-[#94A3B8]">Alasan: </span> {p.alasan}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#E2EBF4] text-[11px] flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedQrRecord(selectedQrRecord?.id === p.id ? null : p)}
                            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#854D0E] bg-[#FAF7EE] hover:bg-[#FEFCE8] px-3 py-1.5 rounded-xl border border-[#C5A059]/40 font-bold transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>{selectedQrRecord?.id === p.id ? "Tutup Kartu QR" : "Unduh Kartu Izin QR (.png)"}</span>
                          </button>
                          <span className="text-[10px] text-[#64748B]">Token: {p.qrCodeToken}</span>
                        </div>

                        {selectedQrRecord?.id === p.id && (
                          <div className="pt-2">
                            <QrPassCard record={p} onClose={() => setSelectedQrRecord(null)} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#E2EBF4]">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Jadwal Sambangan Terdaftar
                  </h4>
                  {childSambangan.length === 0 ? (
                    <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2EBF4]">
                      Belum ada jadwal sambangan
                    </div>
                  ) : (
                    childSambangan.map((s) => (
                      <div key={s.id} className="p-3 rounded-2xl border border-[#E2EBF4] bg-white flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#172033] block">{s.tanggalSambang} • {s.sesiWaktu}</span>
                          <span className="text-[10px] text-[#64748B]">Pengunjung: {s.jumlahPengunjung} Orang (Wali: {s.waliName})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {s.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "KEBAIKAN" && (
              <div className="space-y-3">
                {hasanahRecords.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5]/50 flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#A7F3D0] text-[#065F46] flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172033]">
                          {item.indicatorText || item.unsurName || "Prestasi Kebaikan"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-[#065F46] font-semibold">
                            Kategori: {item.category}
                          </span>
                          {item.tingkat && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#D1FAE5] text-[#065F46] font-bold">
                              {item.tingkat}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-[#475569] mt-1.5 leading-relaxed bg-white/80 p-2 rounded-xl border border-[#A7F3D0]/60">
                            {item.notes}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#A7F3D0] text-[#065F46] font-medium">
                            <Calendar className="w-3 h-3 text-[#065F46]" />
                            {item.incidentDate ? formatWIBDate(item.incidentDate, "short") : item.date || item.createdAt}
                          </span>
                          {item.incidentTime && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#A7F3D0] text-[#065F46] font-medium">
                              <Clock className="w-3 h-3 text-[#065F46]" />
                              {item.incidentTime} WIB
                            </span>
                          )}
                          {item.location && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#A7F3D0] text-[#475569] font-medium">
                              <MapPin className="w-3 h-3 text-[#A8833E]" />
                              {item.location}
                            </span>
                          )}
                          {item.witnessName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#A7F3D0] text-[#475569] font-medium">
                              <UserCheck className="w-3 h-3 text-[#1B4D3E]" />
                              Saksi: {item.witnessName}
                            </span>
                          )}
                          {item.dueProcessStatus && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#065F46] text-white font-bold text-[9px]">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              {item.dueProcessStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-[#94A3B8] font-mono mt-1.5">
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

            {activeTab === "PELANGGARAN" && (
              <div className="space-y-3">
                {sayyiahRecords.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-red-200 text-[#B91C1C] flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172033]">
                          {item.indicatorText || item.unsurName || "Catatan Kedisiplinan"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-[#B91C1C] font-semibold">
                            Kategori: {item.category || "Kedisiplinan"}
                          </span>
                          {item.tingkat && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-red-100 text-[#B91C1C] font-bold">
                              Tingkat: {item.tingkat}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-[#475569] mt-1.5 leading-relaxed bg-white/80 p-2 rounded-xl border border-red-200/60">
                            &quot;{item.notes}&quot;
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-red-200 text-[#B91C1C] font-medium">
                            <Calendar className="w-3 h-3 text-[#B91C1C]" />
                            {item.incidentDate ? formatWIBDate(item.incidentDate, "short") : item.date || item.createdAt}
                          </span>
                          {item.incidentTime && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-red-200 text-[#B91C1C] font-medium">
                              <Clock className="w-3 h-3 text-[#B91C1C]" />
                              {item.incidentTime} WIB
                            </span>
                          )}
                          {item.location && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-red-200 text-[#475569] font-medium">
                              <MapPin className="w-3 h-3 text-[#B91C1C]" />
                              {item.location}
                            </span>
                          )}
                          {item.witnessName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-red-200 text-[#475569] font-medium">
                              <UserCheck className="w-3 h-3 text-[#B91C1C]" />
                              Saksi: {item.witnessName}
                            </span>
                          )}
                          {item.dueProcessStatus && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#B91C1C] text-white font-bold text-[9px]">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              {item.dueProcessStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-[#94A3B8] font-mono mt-1.5">
                          Dicatat: {item.guruName || "Bagian Pengasuhan"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#B91C1C] text-white">
                        -{formatScore(Math.abs(item.score))}
                      </span>
                      <a
                        href={waContactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-white border border-red-200 text-[#B91C1C] text-[11px] font-bold hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Klarifikasi</span>
                      </a>
                    </div>
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

            {activeTab === "PRESENSI" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#172033]">
                      Rekap Kehadiran Sholat Berjamaah
                    </h4>
                    <p className="text-[10px] text-[#64748B]">
                      7 Waktu Sholat Wajib & Sunnah Muakkad di Masjid Pondok
                    </p>
                  </div>
                  <span className="text-xs font-mono font-black text-[#1B4D3E]">
                    {hadirCount} / 7 Hari Ini
                  </span>
                </div>

                <div className="space-y-2">
                  {studentAbsensi.slice(0, 35).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-[#E2EBF4] bg-white flex items-center justify-between gap-3 hover:border-[#1B4D3E]/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.status === "Hadir"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : item.status === "Alpa"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#172033]">
                            Sholat {item.waktuSholat || "Wajib"}
                          </p>
                          <p className="text-[10px] text-[#64748B]">
                            {item.date ? formatWIBDate(item.date, "short") : "Hari ini"} • {item.createdAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          item.status === "Hadir"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : item.status === "Alpa"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {item.status} ({item.scoreImpact > 0 ? `+${formatScore(item.scoreImpact)}` : item.scoreImpact < 0 ? `-${formatScore(Math.abs(item.scoreImpact))}` : "0,000"})
                        </span>
                      </div>
                    </div>
                  ))}

                  {studentAbsensi.length === 0 && (
                    <div className="py-12 text-center text-xs text-[#94A3B8]">
                      Belum ada rekaman presensi sholat ananda.
                    </div>
                  )}
                </div>
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
            href={waContactUrl}
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
