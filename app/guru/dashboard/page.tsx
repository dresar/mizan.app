"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PenTool,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileCheck,
  Users,
  ChevronRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

export default function GuruDashboardPage() {
  const {
    currentUser,
    penilaianList,
    guruList,
    accessibleSantriList,
    setGuruStatus,
    showToast
  } = useMizan();

  const [todayDateFormatted, setTodayDateFormatted] = useState("Minggu, 1 November 2026");

  useEffect(() => {
    try {
      const formatted = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(new Date());
      setTodayDateFormatted(formatted);
    } catch {
      void 0;
    }
  }, []);

  const currentGuruRecord = guruList.find((g) => g.name === currentUser.name) || guruList[0];
  const guruPenilaian = penilaianList.filter(
    (p) => p.guruName === currentUser.name || p.guruId === currentUser.id
  );

  const todayPenilaian = guruPenilaian.filter((p) => p.dateKey === "today");

  const handleLaporanNihil = () => {
    setGuruStatus(currentGuruRecord?.id || "guru-1", "Laporan Nihil");
    showToast("Laporan Nihil dikonfirmasi", "info");
  };

  const totalSantriBinaan = accessibleSantriList.length;

  const daysOfWeek = [
    { label: "Sen", emoji: "😊" },
    { label: "Sel", emoji: "😃" },
    { label: "Rab", emoji: "😐" },
    { label: "Kam", emoji: "😊" },
    { label: "Jum", emoji: "🥰" },
    { label: "Sab", emoji: "😊" },
    { label: "Min", emoji: "✨" }
  ];

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-6 bg-white space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                Kelas {currentUser.assignedClass || "1A"}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                {todayDateFormatted}
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/60">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{currentGuruRecord?.status || "Kondusif"}</span>
            </div>
          </div>

          <div className="mizan-inset p-3 rounded-2xl flex items-center justify-between gap-1 text-center">
            {daysOfWeek.map((d, i) => (
              <div key={d.label} className="flex-1 flex flex-col items-center">
                <span className="text-base sm:text-lg mb-0.5">{d.emoji}</span>
                <span className="text-[10px] sm:text-xs font-bold text-[#64748B]">
                  {d.label}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            <CardSub className="p-3.5 sm:p-4 text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#172033] block font-mono">
                {totalSantriBinaan}
              </span>
              <span className="text-[11px] text-[#64748B] font-bold block mt-0.5">
                Santri Binaan
              </span>
            </CardSub>

            <CardSub className="p-3.5 sm:p-4 text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#065F46] block font-mono">
                100%
              </span>
              <span className="text-[11px] text-[#64748B] font-bold block mt-0.5">
                Kondusif
              </span>
            </CardSub>
          </div>

          <div className="mizan-card-sub p-3 sm:p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl">🌟</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#172033] truncate">
                  Status Pembina
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  {currentUser.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaporanNihil}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#153e32] transition-colors shrink-0"
            >
              Nihil
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            href="/guru/input-penilaian"
            className="mizan-card p-3.5 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-2xl mizan-inset flex items-center justify-center text-[#1B4D3E] group-hover:scale-105 transition-transform">
                <PenTool className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#1B4D3E] bg-[#ECFDF5] px-2 py-0.5 rounded-full mizan-pill">
                Sikap
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Input Nilai
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Adab & Prestasi
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLaporanNihil}
            className="mizan-card p-3.5 flex flex-col justify-between hover:border-[#C5A059]/60 text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-2xl mizan-inset flex items-center justify-center text-[#A8833E] group-hover:scale-105 transition-transform">
                <FileCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#854D0E] bg-[#FEFCE8] px-2 py-0.5 rounded-full mizan-pill">
                Cepat
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#A8833E] transition-colors">
                Laporan Nihil
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Konfirmasi Aman
              </p>
            </div>
          </button>

          <Link
            href="/guru/riwayat"
            className="mizan-card p-3.5 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-2xl mizan-inset flex items-center justify-center text-[#64748B] group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#64748B] bg-white px-2 py-0.5 rounded-full mizan-pill">
                Log
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Riwayat
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Catatan Penilaian
              </p>
            </div>
          </Link>

          <Link
            href="/guru/santri"
            className="mizan-card p-3.5 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-2xl mizan-inset flex items-center justify-center text-[#1B4D3E] group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full mizan-pill">
                Binaan
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Santri
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Profil & Rapor
              </p>
            </div>
          </Link>
        </div>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Daftar Santri ({totalSantriBinaan})
            </span>
            <Link
              href="/guru/santri"
              className="text-xs font-bold text-[#1B4D3E] hover:underline"
            >
              Semua
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {accessibleSantriList.map((s) => (
              <Link
                key={s.id}
                href={`/guru/santri/${s.id}`}
                className="mizan-card-sub p-3 flex flex-col justify-between gap-2.5 hover:border-[#1B4D3E]/40 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    initials={s.avatar}
                    size="sm"
                    variant={s.gender === "Putra" ? "primary" : "gold"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-[#172033] truncate group-hover:text-[#1B4D3E] transition-colors">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-[#94A3B8] truncate">
                      {s.class} • {s.nis}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-[#EEF2F6]">
                  <span className="text-xs font-black font-mono text-[#1B4D3E]">
                    {s.currentScore.toFixed(3).replace(".", ",")}
                  </span>
                  <span className="text-[9px] font-bold text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded-full">
                    {s.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </RoleShell>
  );
}
