"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  TrendingUp,
  Award,
  Sun,
  Sunrise,
  Sunset,
  Moon
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";

export default function PengasuhanDashboardPage() {
  const { accessibleSantriList, absensiList, penilaianList, currentUser } = useMizan();
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const uParam = currentUser?.username ? `?u=${encodeURIComponent(currentUser.username)}` : "";
  const [todayDate, setTodayDate] = useState<string>("");
  const [todayFormatted, setTodayFormatted] = useState<string>("Minggu, 1 November 2026");
  const [genderFilter, setGenderFilter] = useState<"Semua" | "Putra" | "Putri">(
    currentUser.gender === "Putri" ? "Putri" : "Putra"
  );

  useEffect(() => {
    if (currentUser?.gender) {
      setGenderFilter(currentUser.gender === "Putri" ? "Putri" : "Putra");
    }
  }, [currentUser?.gender]);

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

  const filteredSantri = useMemo(() => {
    if (isSuperAdmin && genderFilter !== "Semua") {
      return accessibleSantriList.filter((s) => s.gender === genderFilter);
    }
    return accessibleSantriList;
  }, [accessibleSantriList, isSuperAdmin, genderFilter]);

  const todayAbsensi = useMemo(() => {
    if (!todayDate) return [];
    return absensiList.filter((a) => a.date === todayDate);
  }, [absensiList, todayDate]);

  const prayers = [
    { name: "Subuh", icon: Sunrise },
    { name: "Dhuha", icon: Sun },
    { name: "Dzuhur", icon: Sun },
    { name: "Ashar", icon: Sun },
    { name: "Maghrib", icon: Sunset },
    { name: "Isya", icon: Moon },
    { name: "Tahajjud", icon: Clock }
  ];

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-6 bg-white space-y-3.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                Dashboard Pengasuhan Santri & Santriwati
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                {todayFormatted} • {currentUser.name}
              </p>
            </div>

            {isSuperAdmin ? (
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EEF2F6]">
                {(["Semua", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenderFilter(g)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      genderFilter === g
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-2xl bg-[#EEF2F6] text-xs font-bold text-[#1B4D3E]">
                Santri {currentUser.gender || "Putra"}
              </div>
            )}
          </div>

          <div className="mizan-inset p-2.5 rounded-2xl grid grid-cols-7 gap-1 text-center">
            {prayers.map((p) => {
              const IconComp = p.icon;
              return (
                <div key={p.name} className="flex flex-col items-center py-2 px-1 rounded-xl bg-white/70">
                  <div className="w-6 h-6 rounded-full bg-[#FAF7EE] border border-[#C5A059]/30 text-[#A8833E] flex items-center justify-center mb-1">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#64748B] truncate max-w-full">
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            <CardSub className="p-3 sm:p-4 text-center">
              <span className="text-xl sm:text-3xl font-black text-[#172033] block font-mono">
                {filteredSantri.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#64748B] font-bold block mt-0.5">
                {genderFilter === "Semua" ? "Total Santri" : `Santri ${genderFilter}`}
              </span>
            </CardSub>

            <CardSub className="p-3 sm:p-4 text-center">
              <span className="text-xl sm:text-3xl font-black text-[#065F46] block font-mono">
                {todayAbsensi.filter((a) => a.status === "Hadir").length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#64748B] font-bold block mt-0.5">
                Hadir Hari Ini
              </span>
            </CardSub>

            <CardSub className="p-3 sm:p-4 text-center">
              <span className="text-xl sm:text-3xl font-black text-[#A8833E] block font-mono">
                {penilaianList.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#64748B] font-bold block mt-0.5">
                Catatan Sikap
              </span>
            </CardSub>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          <Link
            href={`/bk/absen${uParam}`}
            className="mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl mizan-inset flex items-center justify-center text-[#1B4D3E] group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full mizan-pill">
                7 Waktu
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Input Presensi
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Presensi Sholat Santri
              </p>
            </div>
          </Link>

          <Link
            href={`/bk/penilaian${uParam}`}
            className="mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl mizan-inset flex items-center justify-center text-[#A8833E] group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#A8833E] bg-[#FAF7EE] px-2 py-0.5 rounded-full mizan-pill border border-[#C5A059]/30">
                Adab & Sikap
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Input Penilaian
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Kebaikan & Pelanggaran
              </p>
            </div>
          </Link>

          <Link
            href={`/bk/history${uParam}`}
            className="mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-3">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5 space-y-3 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Presensi Terbaru
              </span>
              <Link
                href={`/bk/history${uParam}`}
                className="text-xs font-bold text-[#1B4D3E] hover:underline"
              >
                Semua
              </Link>
            </div>

            <div className="space-y-2">
              {absensiList.slice(0, 5).map((item) => (
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

          <Card className="p-4 sm:p-5 space-y-3 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Catatan Penilaian Sikap Terkini
              </span>
              <Link
                href={`/bk/penilaian${uParam}`}
                className="text-xs font-bold text-[#1B4D3E] hover:underline"
              >
                Tambah
              </Link>
            </div>

            <div className="space-y-2">
              {penilaianList.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033] truncate">
                      {p.santriName}
                    </p>
                    <p className="text-[10px] text-[#64748B] truncate">
                      {p.unsurName} • {p.createdAt}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      p.score > 0
                        ? "bg-[#ECFDF5] text-[#065F46]"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.score > 0 ? `+${p.score.toFixed(3).replace(".", ",")}` : p.score.toFixed(3).replace(".", ",")}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </RoleShell>
  );
}