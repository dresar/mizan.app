"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PenTool,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Users,
  ChevronRight
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardHeader, CardSub, CardInset } from "@/components/ui/Card";
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

  const [todayDateFormatted, setTodayDateFormatted] = useState("Sabtu, 31 Oktober 2026");

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
    showToast("Laporan Nihil hari ini berhasil dikonfirmasi. Kelas kondusif.", "info");
  };

  const formatScore = (score: number) => {
    const formatted = Math.abs(score).toFixed(3);
    return score > 0 ? `+${formatted}` : `-${formatted}`;
  };

  const totalSantriBinaan = accessibleSantriList.length;

  return (
    <RoleShell>
      <div className="space-y-4 max-w-4xl mx-auto overflow-x-hidden">
        <div className="mizan-card p-4 sm:p-5 bg-white space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#A8833E]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayDateFormatted}</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[11px] mizan-pill ${
                currentGuruRecord?.status === "Sudah Lapor"
                  ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                  : currentGuruRecord?.status === "Laporan Nihil"
                  ? "bg-[#FAF7EE] text-[#854D0E] border-[#C5A059]/40"
                  : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
              }`}
            >
              {currentGuruRecord?.status === "Sudah Lapor" && (
                <CheckCircle2 className="w-3 h-3 text-[#065F46]" />
              )}
              {currentGuruRecord?.status === "Laporan Nihil" && (
                <FileCheck className="w-3 h-3 text-[#854D0E]" />
              )}
              {currentGuruRecord?.status === "Belum Lapor" && (
                <AlertCircle className="w-3 h-3 text-[#991B1B]" />
              )}
              {currentGuruRecord?.status || "Aktif"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[#172033] leading-snug truncate">
                Panel Pembina {currentUser.gender === "Putri" ? "Santriwati Putri" : "Santri Putra"}
              </h1>
              <p className="text-xs text-[#64748B] truncate mt-0.5">
                Binaan Kelas {currentUser.assignedClass || "1A"} • {currentUser.name}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl mizan-inset flex items-center justify-center font-bold text-xs text-[#1B4D3E] shrink-0">
              {currentUser.avatarInitials}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <CardSub className="text-center p-3 sm:p-4">
            <span className="text-xl sm:text-2xl font-black text-[#172033] block font-mono">
              {totalSantriBinaan}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Santri Binaan
            </span>
          </CardSub>

          <CardSub className="text-center p-3 sm:p-4">
            <span className="text-xl sm:text-2xl font-black text-[#1B4D3E] block font-mono">
              {todayPenilaian.length}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Input Hari Ini
            </span>
          </CardSub>

          <CardSub className="text-center p-3 sm:p-4">
            <span className="text-xl sm:text-2xl font-black text-[#065F46] block font-mono">
              {accessibleSantriList.filter((s) => s.status === "Baik").length}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Status Baik
            </span>
          </CardSub>

          <CardSub className="text-center p-3 sm:p-4">
            <span className="text-xl sm:text-2xl font-black text-[#059669] block font-mono">
              100%
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Kondusif
            </span>
          </CardSub>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Link
            href="/guru/input-penilaian"
            className="mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl mizan-inset flex items-center justify-center text-[#1B4D3E] group-hover:scale-105 transition-transform">
                <PenTool className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#1B4D3E] bg-[#ECFDF5] px-2 py-0.5 rounded-full mizan-pill">
                Sikap
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Input Nilai Akhlak
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Pencatatan prestasi & pelanggaran
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLaporanNihil}
            className="mizan-card p-4 flex flex-col justify-between hover:border-[#C5A059]/60 text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl mizan-inset flex items-center justify-center text-[#A8833E] group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
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
                Konfirmasi santri aman terkendali
              </p>
            </div>
          </button>

          <Link
            href="/guru/riwayat"
            className="mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl mizan-inset flex items-center justify-center text-[#64748B] group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#64748B] bg-white px-2 py-0.5 rounded-full mizan-pill">
                Riwayat
              </span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                Riwayat Penilaian
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Rekap catatan perilaku santri
              </p>
            </div>
          </Link>
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Daftar Santri Binaan ({accessibleSantriList.length})
            </span>
            <span className="text-[10px] text-[#64748B]">
              Klik nama untuk buka profil lengkap & cetak PDF
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {accessibleSantriList.map((s) => (
              <Link
                key={s.id}
                href={`/guru/santri/${s.id}`}
                className="mizan-card-sub p-3 flex items-center justify-between gap-2.5 hover:border-[#1B4D3E]/40 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    initials={s.avatar}
                    size="md"
                    variant={s.gender === "Putra" ? "primary" : "gold"}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#172033] truncate group-hover:text-[#1B4D3E] transition-colors">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-[#94A3B8]">
                      NIS {s.nis} • Kelas {s.class}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-[#1B4D3E] block">
                      {s.currentScore.toFixed(3).replace(".", ",")}
                    </span>
                    <span className="text-[9px] text-[#065F46] font-bold block">
                      Hadir: {s.totalHadir || 0}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </RoleShell>
  );
}
