"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  Sparkles,
  Search
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { QUICK_ACCOUNTS, QuickAccount } from "@/lib/quick-accounts";

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
  const [devCategory, setDevCategory] = useState<"Semua" | "BK Putra" | "BK Putri" | "Guru Putra" | "Guru Putri" | "Admin">("Semua");
  const [quickSearch, setQuickSearch] = useState("");

  const appLogo = settings?.appLogoUrl || "/logo.png";

  const counts = useMemo(() => {
    const res: Record<string, number> = {
      "Semua": QUICK_ACCOUNTS.length,
      "BK Putra": 0,
      "BK Putri": 0,
      "Guru Putra": 0,
      "Guru Putri": 0,
      "Admin": 0
    };
    for (const a of QUICK_ACCOUNTS) {
      if (res[a.category] !== undefined) res[a.category]++;
    }
    return res;
  }, []);

  const filteredDevAccounts = useMemo(() => {
    return QUICK_ACCOUNTS.filter((a) => {
      const matchCat = devCategory === "Semua" || a.category === devCategory;
      const q = quickSearch.trim().toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [devCategory, quickSearch]);

  const handleQuickLogin = async (acc: QuickAccount) => {
    const pwd = acc.password || (acc.category === "Admin" ? "password123" : "RDS123");
    setUsername(acc.username);
    setPassword(pwd);
    setSelectedDevUser(acc.username);
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: acc.username, password: pwd })
      });

      const data = await res.json();

      if (data.success && data.user) {
        loginUser(data.user, data.token);
        if (data.user.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else if (data.user.role === "PENGASUHAN") {
          router.push("/bk/dashboard");
        } else if (data.user.role === "ORTU") {
          if (data.user.santriId) {
            try {
              localStorage.setItem("mizan_ortu_santri_id", data.user.santriId);
            } catch {
              void 0;
            }
          }
          router.push("/ortu/dashboard");
        } else {
          router.push("/guru/dashboard");
        }
      } else {
        setErrorMessage(data.message || "Gagal masuk.");
      }
    } catch {
      setErrorMessage("Terjadi kendala koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

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
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (data.success && data.user) {
        loginUser(data.user, data.token);
        if (data.user.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else if (data.user.role === "PENGASUHAN") {
          router.push("/bk/dashboard");
        } else if (data.user.role === "ORTU") {
          if (data.user.santriId) {
            try {
              localStorage.setItem("mizan_ortu_santri_id", data.user.santriId);
            } catch {
              void 0;
            }
          }
          router.push("/ortu/dashboard");
        } else {
          router.push("/guru/dashboard");
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

          <h1 className="text-base sm:text-lg font-serif font-black tracking-tight text-[#172033] leading-snug">
            Sistem Penilaian Sikap & Mental Santri
          </h1>
          <p className="text-xs font-semibold text-[#64748B]">
            Pesantren Modern Raudhatussalam Mahato
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
                  placeholder="Username atau No. Stambuk Santri"
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

          <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#C5A059]/30 flex items-center justify-center text-[#A8833E] shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#172033] truncate">
                  Portal Orang Tua / Wali Santri
                </p>
                <p className="text-[10px] text-[#64748B] truncate">
                  Masuk dengan No. Stambuk & sandi RDS1234
                </p>
              </div>
            </div>

            <Link
              href="/ortu/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
            >
              <span>Buka</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] shrink-0">
                Pilih Akun Cepat
              </span>
            </div>

            <div className="flex items-center justify-start gap-1 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
              {(["Semua", "BK Putra", "BK Putri", "Guru Putra", "Guru Putri", "Admin"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDevCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    devCategory === cat
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "bg-[#F1F5F9] text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded-full ${devCategory === cat ? "bg-white/20 text-white" : "bg-[#E2E8F0] text-[#475569]"}`}>
                    {counts[cat]}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative mt-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Cari nama Ustadz / Ustadzah..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#F8FAFC] border border-[#E2EBF4] text-[#172033] placeholder-[#94A3B8] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 max-h-64 overflow-y-auto pr-1">
              {filteredDevAccounts.map((acc) => {
                const isSelected = selectedDevUser === acc.username;
                const getTheme = () => {
                  if (acc.category === "Admin") return { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", icon: <ShieldCheck className="w-3.5 h-3.5" /> };
                  if (acc.category === "BK Putra") return { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", icon: <CalendarCheck className="w-3.5 h-3.5" /> };
                  if (acc.category === "BK Putri") return { bg: "bg-[#FDF2F8]", text: "text-[#BE185D]", icon: <HeartHandshake className="w-3.5 h-3.5" /> };
                  if (acc.category === "Guru Putra") return { bg: "bg-[#ECFDF5]", text: "text-[#065F46]", icon: <BookOpen className="w-3.5 h-3.5" /> };
                  return { bg: "bg-[#F5F3FF]", text: "text-[#6D28D9]", icon: <HeartHandshake className="w-3.5 h-3.5" /> };
                };
                const theme = getTheme();

                return (
                  <div
                    key={acc.username}
                    onClick={() => handleQuickLogin(acc)}
                    className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex items-center justify-between gap-2 ${
                      isSelected
                        ? "border-[#1B4D3E] bg-[#ECFDF5] shadow-xs"
                        : "border-[#E2EBF4] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 shrink-0 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center`}>
                        {theme.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#172033] leading-tight truncate">
                          {acc.name}
                        </p>
                        <p className="text-[9px] text-[#64748B] truncate">
                          {acc.category}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin(acc);
                      }}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-lg bg-[#1B4D3E] text-white text-[10px] font-bold shrink-0 hover:bg-[#153e32] transition-colors cursor-pointer"
                    >
                      Masuk
                    </button>
                  </div>
                );
              })}
              {filteredDevAccounts.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-[#94A3B8]">
                  Tidak ada akun ditemukan
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          <p className="text-[10px] text-[#94A3B8]">
            MIZAN • Pesantren Modern Raudhatussalam Mahato
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
