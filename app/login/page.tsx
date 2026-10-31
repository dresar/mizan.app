"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  ShieldCheck,
  BookOpen,
  HeartHandshake,
  ArrowRight,
  Lock,
  User,
  KeyRound,
  Loader2,
  CalendarCheck,
  Check
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

interface DevAccount {
  username: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useMizan();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDevUser, setSelectedDevUser] = useState("");

  const devAccounts: DevAccount[] = [
    {
      username: "ustadz",
      label: "Ustadz",
      sub: "Guru Putra",
      icon: <BookOpen className="w-3.5 h-3.5" />,
      bg: "bg-[#ECFDF5]",
      text: "text-[#065F46]"
    },
    {
      username: "ustadzah",
      label: "Ustadzah",
      sub: "Guru Putri",
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      bg: "bg-[#FDF2F8]",
      text: "text-[#BE185D]"
    },
    {
      username: "pengasuhan",
      label: "Pengasuhan (L)",
      sub: "BK Putra",
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]"
    },
    {
      username: "pengasuhan_putri",
      label: "Pengasuhan (P)",
      sub: "BK Putri",
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#F5F3FF]",
      text: "text-[#6D28D9]"
    },
    {
      username: "admin",
      label: "Super Admin",
      sub: "Pengasuhan",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      bg: "bg-[#FEF3C7]",
      text: "text-[#92400E]"
    }
  ];

  const handleFillForm = (targetUsername: string) => {
    setUsername(targetUsername);
    setPassword("password123");
    setSelectedDevUser(targetUsername);
    setErrorMessage("");
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
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (data.success && data.user) {
        loginUser(data.user);
        if (data.user.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else if (data.user.role === "PENGASUHAN") {
          router.push("/bk/absen");
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
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col justify-center items-center px-3 sm:px-6 py-6 sm:py-10">
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mizan-card bg-white text-[#1B4D3E] mx-auto shadow-sm">
            <Scale className="w-6 h-6 text-[#1B4D3E]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#172033]">
            Masuk MIZAN
          </h1>
          <p className="text-xs font-semibold text-[#64748B]">
            Sistem Penilaian Sikap & Absensi Sholat Santri
          </p>
        </div>

        <div className="mizan-card p-5 sm:p-6 space-y-4 bg-white">
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium bg-[#EEF2F6] border border-transparent focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium bg-[#EEF2F6] border border-transparent focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-[#1B4D3E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#153e32] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] shrink-0">
                Pilih Akun Cepat (Isi Form)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
              {devAccounts.map((acc) => {
                const isSelected = selectedDevUser === acc.username;

                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleFillForm(acc.username)}
                    className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                      isSelected
                        ? "border-[#1B4D3E] bg-[#ECFDF5] shadow-xs"
                        : "border-[#E2EBF4] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className={`w-6 h-6 mx-auto rounded-lg ${acc.bg} ${acc.text} flex items-center justify-center mb-1`}>
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
            <p className="text-[10px] text-center text-[#94A3B8] mt-2">
              Klik salah satu akun di atas untuk mengisi form, lalu klik tombol Masuk Aplikasi.
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#94A3B8]">
          MIZAN v4.1 • Terhubung ke PostgreSQL Neon
        </p>
      </div>
    </div>
  );
}
