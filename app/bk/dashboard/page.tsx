"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";

export default function PengasuhanDashboardPage() {
  const { santriList, absensiList, currentUser } = useMizan();
  const [todayDate, setTodayDate] = useState<string>("");
  const [todayFormatted, setTodayFormatted] = useState<string>("Minggu, 1 November 2026");

  useEffect(() => {
    try {
      const now = new Date();
      setTodayDate(now.toISOString().split("T")[0]);
      setTodayFormatted(
        new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(now)
      );
    } catch {
      void 0;
    }
  }, []);

  const totalSantri = santriList.length;
  const genderFilter = currentUser.gender || "Putra";
  const filteredSantri = santriList.filter((s) => s.gender === genderFilter);

  const todayAbsensi = useMemo(() => {
    if (!todayDate) return [];
    return absensiList.filter((a) => a.date === todayDate);
  }, [absensiList, todayDate]);

  const alpaCountToday = useMemo(() => {
    return todayAbsensi.filter((a) => a.status === "Alpa").length;
  }, [todayAbsensi]);

  const prayers = [
    { name: "Subuh", emoji: "🌅" },
    { name: "Dhuha", emoji: "☀️" },
    { name: "Dzuhur", emoji: "🌤️" },
    { name: "Ashar", emoji: "⛅" },
    { name: "Maghrib", emoji: "🌇" },
    { name: "Isya", emoji: "🌙" },
    { name: "Tahajjud", emoji: "✨" }
  ];

  return (
    <RoleShell>
      <div className="space-y-3.5 max-w-4xl mx-auto overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-6 bg-white space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                Pengasuhan {currentUser.gender === "Putri" ? "Putri" : "Putra"}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                {todayFormatted}
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/60">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tertib</span>
            </div>
          </div>

          <div className="mizan-inset p-3 rounded-2xl flex items-center justify-between gap-1 text-center">
            {prayers.map((p) => (
              <div key={p.name} className="flex-1 flex flex-col items-center">
                <span className="text-base sm:text-lg mb-0.5">{p.emoji}</span>
                <span className="text-[9px] sm:text-xs font-bold text-[#64748B] truncate max-w-full">
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            <CardSub className="p-3.5 sm:p-4 text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#172033] block font-mono">
                {filteredSantri.length}
              </span>
              <span className="text-[11px] text-[#64748B] font-bold block mt-0.5">
                Total Santri {genderFilter}
              </span>
            </CardSub>

            <CardSub className="p-3.5 sm:p-4 text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#065F46] block font-mono">
                {todayAbsensi.filter((a) => a.status === "Hadir").length}
              </span>
              <span className="text-[11px] text-[#64748B] font-bold block mt-0.5">
                Hadir Hari Ini
              </span>
            </CardSub>
          </div>

          <div className="mizan-card-sub p-3 sm:p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl">🕌</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#172033] truncate">
                  Presensi 7 Waktu
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  {currentUser.name}
                </p>
              </div>
            </div>

            <Link
              href="/bk/absen"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#153e32] transition-colors shrink-0"
            >
              Absen
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          <Link
            href="/bk/absen"
            className="mizan-card p-3.5 sm:p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-2xl mizan-inset flex items-center justify-center text-[#1B4D3E] group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full mizan-pill">
                7 Waktu
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Input Absen
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Presensi Sholat
              </p>
            </div>
          </Link>

          <Link
            href="/bk/history"
            className="mizan-card p-3.5 sm:p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-2xl mizan-inset flex items-center justify-center text-[#64748B] group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#64748B] bg-white px-2 py-0.5 rounded-full mizan-pill">
                Riwayat
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Riwayat Log
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Kelola Presensi
              </p>
            </div>
          </Link>
        </div>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Presensi Terbaru
            </span>
            <Link
              href="/bk/history"
              className="text-xs font-bold text-[#1B4D3E] hover:underline"
            >
              Semua
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {absensiList.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between gap-2.5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#172033] truncate">
                    {item.santriName}
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    Kelas {item.santriClass} • {item.waktuSholat || "Subuh"}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === "Hadir"
                      ? "bg-[#ECFDF5] text-[#065F46]"
                      : item.status === "Alpa"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RoleShell>
  );
}
