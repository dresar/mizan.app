"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  BookOpen,
  HeartHandshake,
  ArrowRight,
  Lock,
  User,
  KeyRound,
  Loader2,
  CalendarCheck,
  Check,
  Smartphone,
  Download,
  X,
  Sparkles
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

interface DevAccount {
  username: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  category: "Admin" | "BK Putra" | "BK Putri" | "Guru";
}

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, settings } = useMizan();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDevUser, setSelectedDevUser] = useState("");
  const [showAppModal, setShowAppModal] = useState(false);
  const [appTab, setAppTab] = useState<"android" | "ios">("android");
  const [devCategory, setDevCategory] = useState<"Semua" | "BK Putra" | "BK Putri" | "Admin" | "Guru">("Semua");

  const appLogo = settings?.appLogoUrl || "/logo.png";

  const devAccounts: DevAccount[] = [
    {
      username: "admin",
      label: "Super Admin",
      sub: "Ust. H. Syukri",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#FEF3C7]",
      text: "text-[#92400E]",
      category: "Admin"
    },
    {
      username: "doli",
      label: "Ust. Doli, Lc",
      sub: "BK Putra",
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      category: "BK Putra"
    },
    {
      username: "fatihuddin",
      label: "Ust. Fatihuddin",
      sub: "BK Putra",
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      category: "BK Putra"
    },
    {
      username: "syeikhul",
      label: "Ust. Syeikhul",
      sub: "BK Putra",
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      category: "BK Putra"
    },
    {
      username: "willy",
      label: "Ust. Willy",
      sub: "BK Putra",
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      category: "BK Putra"
    },
    {
      username: "ramadhani",
      label: "Ust. Ramadhani",
      sub: "BK Putra",
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      category: "BK Putra"
    },
    {
      username: "salmah",
      label: "Usth. Salmah, S.Pd",
      sub: "BK Putri",
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      bg: "bg-[#FDF2F8]",
      text: "text-[#BE185D]",
      category: "BK Putri"
    },
    {
      username: "nuriyana",
      label: "Usth. Nuriyana",
      sub: "BK Putri",
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      bg: "bg-[#FDF2F8]",
      text: "text-[#BE185D]",
      category: "BK Putri"
    },
    {
      username: "suci",
      label: "Usth. Suci Ayu",
      sub: "BK Putri",
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      bg: "bg-[#FDF2F8]",
      text: "text-[#BE185D]",
      category: "BK Putri"
    },
    {
      username: "sindih",
      label: "Usth. Sindih",
      sub: "BK Putri",
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      bg: "bg-[#FDF2F8]",
      text: "text-[#BE185D]",
      category: "BK Putri"
    },
    {
      username: "salwa",
      label: "Usth. Salwa",
      sub: "BK Putri",
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      bg: "bg-[#FDF2F8]",
      text: "text-[#BE185D]",
      category: "BK Putri"
    },
    {
      username: "puspita",
      label: "Usth. Puspita",
      sub: "BK Putri",
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      bg: "bg-[#FDF2F8]",
      text: "text-[#BE185D]",
      category: "BK Putri"
    },
    {
      username: "ustadz",
      label: "Ustadz",
      sub: "Guru Putra",
      icon: <BookOpen className="w-3.5 h-3.5" />,
      bg: "bg-[#ECFDF5]",
      text: "text-[#065F46]",
      category: "Guru"
    },
    {
      username: "ustadzah",
      label: "Ustadzah",
      sub: "Guru Putri",
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      bg: "bg-[#F5F3FF]",
      text: "text-[#6D28D9]",
      category: "Guru"
    }
  ];

  const BK_PASSWORDS: Record<string, string> = {
    doli: "RDS123",
    fatihuddin: "RDS123",
    syeikhul: "RDS123",
    willy: "RDS123",
    ramadhani: "RDS123",
    salmah: "RDS123",
    nuriyana: "RDS123",
    suci: "RDS123",
    sindih: "RDS123",
    salwa: "RDS123",
    puspita: "RDS123"
  };

  const handleFillForm = (targetUsername: string) => {
    setUsername(targetUsername);
    setPassword(BK_PASSWORDS[targetUsername] || "password123");
    setSelectedDevUser(targetUsername);
    setErrorMessage("");
  };

  const filteredDevAccounts = useMemo(() => {
    if (devCategory === "Semua") return devAccounts;
    return devAccounts.filter((a) => a.category === devCategory);
  }, [devAccounts, devCategory]);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Silakan masukkan username dan kata sandi.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (data.success && data.user) {
        loginUser(data.user);
        const u = encodeURIComponent(data.user.username);
        if (data.user.role === "SUPER_ADMIN") {
          router.push(`/admin/dashboard?u=${u}`);
        } else if (data.user.role === "PENGASUHAN") {
          router.push(`/bk/dashboard?u=${u}`);
        } else {
          router.push(`/guru/dashboard?u=${u}`);
        }
      } else {
        setErrorMessage(data.message || "Username atau kata sandi tidak cocok.");
      }
    } catch {
      setErrorMessage("Terjadi kendala koneksi ke server. Coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] relative flex flex-col justify-center items-center px-3 sm:px-6 py-6 sm:py-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#1B4D3E]/10 blur-3xl pointer-events-none animate-blob" />
      <div className="absolute top-1/3 -right-28 w-72 h-72 rounded-full bg-[#C5A059]/15 blur-3xl pointer-events-none animate-blob" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-[#065F46]/10 blur-3xl pointer-events-none animate-blob" />

      <div className="w-full max-w-lg space-y-4 relative z-10">
        <div className="text-center space-y-2">
          <div className="relative inline-block mx-auto mb-1">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl mizan-card bg-gradient-to-b from-[#1B4D3E] to-[#12362B] p-2 flex items-center justify-center mx-auto shadow-xl border border-[#C5A059]/40 animate-glow">
              <div className="w-full h-full rounded-2xl flex items-center justify-center animate-float overflow-hidden">
                <img
                  src={appLogo}
                  alt="MIZAN"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FAF7EE] border border-[#C5A059] flex items-center justify-center text-[#A8833E] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-[#172033]">
            MIZAN
          </h1>
          <p className="text-xs font-semibold text-[#64748B]">
            Sistem Penilaian Sikap & Absensi Sholat Santri
          </p>
        </div>

        <div className="mizan-card p-5 sm:p-6 space-y-4 bg-white/95 backdrop-blur-md shadow-xl border border-[#E2EBF4]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
            <Lock className="w-4 h-4 text-[#1B4D3E]" />
            <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Formulir Masuk Sistem
            </h2>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSelectedDevUser("");
                  }}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#EEF2F6] border border-transparent focus:bg-white focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/10 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#EEF2F6] border border-transparent focus:bg-white focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/10 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1B4D3E] via-[#236350] to-[#1B4D3E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Periksa</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] shrink-0">
                Pilih Akun Cepat
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 mt-2.5 overflow-x-auto pb-1">
              {(["Semua", "BK Putra", "BK Putri", "Admin", "Guru"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDevCategory(cat)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                    devCategory === cat
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "bg-[#F1F5F9] text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2.5">
              {filteredDevAccounts.map((acc) => {
                const isSelected = selectedDevUser === acc.username;

                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleFillForm(acc.username)}
                    className={`p-2.5 rounded-2xl text-center transition-all cursor-pointer border ${
                      isSelected
                        ? "border-[#1B4D3E] bg-[#ECFDF5] shadow-xs scale-[1.02]"
                        : "border-[#E2EBF4] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1] hover:-translate-y-0.5"
                    }`}
                  >
                    <div className={`w-7 h-7 mx-auto rounded-xl ${acc.bg} ${acc.text} flex items-center justify-center mb-1`}>
                      {acc.icon}
                    </div>
                    <p className="text-[10px] font-bold text-[#172033] leading-tight truncate">
                      {acc.label}
                    </p>
                    <p className="text-[9px] text-[#64748B] truncate mt-0.5">
                      {acc.sub}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          <p className="text-[10px] text-[#94A3B8]">
            MIZAN • Pondok Pesantren Raudhatussalam
          </p>

          <button
            type="button"
            onClick={() => setShowAppModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#CBD5E1] text-[#1B4D3E] text-[11px] font-bold shadow-xs hover:bg-[#FAF7EE] transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Aplikasi</span>
          </button>
        </div>

        {showAppModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm mizan-card p-5 bg-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#1B4D3E]" />
                  <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                    Aplikasi Mobile
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAppModal(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex rounded-xl p-1 bg-[#EEF2F6]">
                <button
                  type="button"
                  onClick={() => setAppTab("android")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                    appTab === "android"
                      ? "bg-white text-[#1B4D3E] shadow-xs"
                      : "text-[#64748B]"
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setAppTab("ios")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                    appTab === "ios"
                      ? "bg-white text-[#1B4D3E] shadow-xs"
                      : "text-[#64748B]"
                  }`}
                >
                  iOS
                </button>
              </div>

              {appTab === "android" ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1 text-center">
                    <p className="text-xs font-bold text-[#065F46]">
                      Format APK Resmi Android (2,6 MB)
                    </p>
                    <p className="text-[10px] text-[#047857]">
                      Penyimpanan lokal aktif, cache offline, serta pembaruan antarmuka otomatis langsung dari server.
                    </p>
                  </div>

                  <a
                    href="/downloads/mizan.apk"
                    download="mizan.apk"
                    className="w-full py-3 rounded-2xl bg-[#1B4D3E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#153e32] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 space-y-1.5 text-xs text-[#172033]">
                    <p className="font-bold text-[#A8833E]">
                      Petunjuk Apple iPhone & iPad:
                    </p>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      Pilih <strong>Pasang</strong> untuk instalasi langsung via Safari (Profil Resmi), atau pilih <strong>Unduh</strong> untuk berkas aplikasi (.ipa) sideload.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/api/download/ios-profile"
                      className="w-full py-2.5 rounded-2xl bg-[#A8833E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#8f6d2f] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Pasang</span>
                    </a>
                    <a
                      href="/downloads/mizan.ipa"
                      download="mizan.ipa"
                      className="w-full py-2.5 rounded-2xl bg-[#172033] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-black transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAppModal(false)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-[#64748B] bg-[#EEF2F6] hover:bg-[#E2E8F0]"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
