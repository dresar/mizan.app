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
  Sparkles,
  Loader2
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, userList } = useMizan();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleDevLogin = async (targetUsername: string, destination: string) => {
    setIsLoading(true);
    setErrorMessage("");
    setUsername(targetUsername);
    setPassword("password123");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUsername, password: "password123" })
      });

      const data = await res.json();
      if (data.success && data.user) {
        loginUser(data.user);
        router.push(destination);
      } else {
        const fallback = userList.find((u) => u.username === targetUsername);
        if (fallback) {
          loginUser(fallback);
          router.push(destination);
        } else {
          setErrorMessage(data.message || "Gagal masuk dev mode.");
        }
      }
    } catch {
      const fallback = userList.find((u) => u.username === targetUsername);
      if (fallback) {
        loginUser(fallback);
        router.push(destination);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col justify-center items-center px-3 sm:px-6 py-6 sm:py-10">
      <div className="w-full max-w-lg space-y-5">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mizan-card bg-white text-[#1B4D3E] mx-auto shadow-sm">
            <Scale className="w-6 h-6 text-[#1B4D3E]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#172033]">
            Masuk MIZAN
          </h1>
          <p className="text-xs font-semibold text-[#64748B]">
            Sistem Penilaian Sikap & Perilaku Santri
          </p>
        </div>

        <div className="mizan-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
            <Lock className="w-4 h-4 text-[#1B4D3E]" />
            <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Autentikasi Akun Pembina / Admin
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
                  onChange={(e) => setUsername(e.target.value)}
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
              className="w-full py-3 rounded-2xl bg-[#1B4D3E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#153e32] active:scale-[0.99] transition-all disabled:opacity-60"
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
                Mode Dev (Klik Cepat)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleDevLogin("ustadz", "/guru/dashboard")}
                className="p-2.5 rounded-xl mizan-card-sub text-center hover:border-[#1B4D3E] transition-all group"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-[#ECFDF5] text-[#065F46] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-[#172033] leading-tight truncate">Ustadz</p>
                <p className="text-[9px] text-[#64748B]">Binaan Putra</p>
              </button>

              <button
                type="button"
                onClick={() => handleDevLogin("ustadzah", "/guru/dashboard")}
                className="p-2.5 rounded-xl mizan-card-sub text-center hover:border-[#1B4D3E] transition-all group"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-[#FDF2F8] text-[#BE185D] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-[#172033] leading-tight truncate">Ustadzah</p>
                <p className="text-[9px] text-[#64748B]">Binaan Putri</p>
              </button>

              <button
                type="button"
                onClick={() => handleDevLogin("pengasuhan", "/bk/absen")}
                className="p-2.5 rounded-xl mizan-card-sub text-center hover:border-[#1B4D3E] transition-all group"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-[#172033] leading-tight truncate">Pengasuhan</p>
                <p className="text-[9px] text-[#64748B]">Absen Sholat</p>
              </button>

              <button
                type="button"
                onClick={() => handleDevLogin("admin", "/admin/dashboard")}
                className="p-2.5 rounded-xl mizan-card-sub text-center hover:border-[#1B4D3E] transition-all group"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-[#172033] leading-tight truncate">Admin</p>
                <p className="text-[9px] text-[#64748B]">Pusat Kendali</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#94A3B8]">
          MIZAN v4.0 • Terhubung ke PostgreSQL Serverless
        </p>
      </div>
    </div>
  );
}
