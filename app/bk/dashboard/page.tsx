"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

export default function PengasuhanDashboardPage() {
  const { santriList, absensiList, currentUser } = useMizan();
  const [todayDate, setTodayDate] = useState<string>("");

  useEffect(() => {
    try {
      setTodayDate(new Date().toISOString().split("T")[0]);
    } catch {
      void 0;
    }
  }, []);

  const totalSantri = santriList.length;
  const putraCount = santriList.filter((s) => s.gender === "Putra").length;
  const putriCount = santriList.filter((s) => s.gender === "Putri").length;

  const todayAbsensi = useMemo(() => {
    if (!todayDate) return [];
    return absensiList.filter((a) => a.date === todayDate);
  }, [absensiList, todayDate]);

  const alpaCountToday = useMemo(() => {
    return todayAbsensi.filter((a) => a.status === "Alpa").length;
  }, [todayAbsensi]);

  return (
    <RoleShell>
      <div className="space-y-4 max-w-4xl mx-auto overflow-x-hidden pb-16">
        <div className="mizan-card p-4 sm:p-5 bg-white space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
              Bagian Pengasuhan & BK
            </span>
            <span className="text-[11px] font-bold text-[#A8833E]">
              Pondok Pesantren Raudhatussalam
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[#172033] leading-snug truncate">
                Panel Pengasuhan & Monitoring Sholat
              </h1>
              <p className="text-xs text-[#64748B] truncate mt-0.5">
                Pengawasan presensi 7 waktu sholat santri & santriwati
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl mizan-inset flex items-center justify-center font-bold text-xs text-[#1B4D3E] shrink-0">
              {currentUser.avatarInitials}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <CardSub className="p-3 text-center">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#172033] block">
              {totalSantri}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Santri ({putraCount} Pa / {putriCount} Pi)
            </span>
          </CardSub>

          <CardSub className="p-3 text-center">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#065F46] block">
              {todayAbsensi.filter((a) => a.status === "Hadir").length}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Hadir Sholat Hari Ini
            </span>
          </CardSub>

          <CardSub className="p-3 text-center">
            <span className="text-xl sm:text-2xl font-black font-mono text-red-600 block">
              {alpaCountToday}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Alpa Sholat Hari Ini
            </span>
          </CardSub>

          <CardSub className="p-3 text-center">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#A8833E] block">
              {absensiList.length}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Total Log Sholat
            </span>
          </CardSub>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/bk/absen"
            className="mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl mizan-inset flex items-center justify-center text-[#1B4D3E] group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full mizan-pill">
                7 Waktu
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Input Absen Sholat
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Subuh, Dhuha, Dzuhur, Ashar, Maghrib, Isya, Tahajjud
              </p>
            </div>
          </Link>

          <Link
            href="/bk/history"
            className="mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl mizan-inset flex items-center justify-center text-[#64748B] group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#64748B] bg-white px-2 py-0.5 rounded-full mizan-pill">
                Kelola
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Riwayat Presensi
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Edit & hapus log kehadiran
              </p>
            </div>
          </Link>
        </div>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Presensi Sholat Terbaru
            </span>
            <Link
              href="/bk/history"
              className="text-[11px] font-bold text-[#1B4D3E] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
                    Kelas {item.santriClass} • Sholat {item.waktuSholat || "Subuh"} • {item.date}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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
