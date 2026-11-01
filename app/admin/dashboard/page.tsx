"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Award,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Trophy,
  Medal,
  Calendar,
  UserCheck,
  UserX,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardHeader, CardSub, CardInset } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StatusGuru } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const { santriList, guruList, penilaianList, setGuruStatus } = useMizan();

  const [leaderboardGender, setLeaderboardGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [reportTimeframe, setReportTimeframe] = useState<"HARIAN" | "MINGGUAN" | "BULANAN">("HARIAN");

  const totalSantri = santriList.length;
  const totalGuru = guruList.length;

  const avgScore = useMemo(() => {
    if (totalSantri === 0) return "70,000";
    const sum = santriList.reduce((acc, s) => acc + s.currentScore, 0);
    return (sum / totalSantri).toFixed(3).replace(".", ",");
  }, [santriList, totalSantri]);

  const rankedSantriList = useMemo(() => {
    let list = [...santriList];
    if (leaderboardGender !== "ALL") {
      list = list.filter((s) => s.gender === leaderboardGender);
    }
    return list.sort((a, b) => b.currentScore - a.currentScore);
  }, [santriList, leaderboardGender]);

  const needAttentionSantri = useMemo(() => {
    return [...santriList]
      .filter((s) => s.currentScore < 70 || s.status !== "Baik")
      .sort((a, b) => a.currentScore - b.currentScore);
  }, [santriList]);

  const teacherAnalytics = useMemo(() => {
    return guruList.map((guru) => {
      let count = guru.reportCountToday;
      let target = 5;

      if (reportTimeframe === "MINGGUAN") {
        count = guru.reportCountToday * 6 + (guru.id === "guru-1" ? 18 : guru.id === "guru-4" ? 14 : 2);
        target = 30;
      } else if (reportTimeframe === "BULANAN") {
        count = guru.reportCountToday * 24 + (guru.id === "guru-1" ? 68 : guru.id === "guru-4" ? 54 : 8);
        target = 120;
      }

      const percentage = Math.min(100, Math.round((count / target) * 100));
      const isRare = count <= (reportTimeframe === "HARIAN" ? 0 : reportTimeframe === "MINGGUAN" ? 5 : 20);

      return {
        ...guru,
        periodCount: count,
        target,
        percentage,
        isRare
      };
    });
  }, [guruList, reportTimeframe]);

  const teachersNeedingReminder = useMemo(() => {
    return teacherAnalytics.filter((t) => t.isRare);
  }, [teacherAnalytics]);

  const getGuruBadgeVariant = (status: StatusGuru) => {
    if (status === "Sudah Lapor") return "sudah-lapor";
    if (status === "Laporan Nihil") return "laporan-nihil";
    return "belum-lapor";
  };

  const getGuruStatusIcon = (status: StatusGuru) => {
    if (status === "Sudah Lapor") return <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4D3E]" />;
    if (status === "Laporan Nihil") return <AlertCircle className="w-3.5 h-3.5 text-[#854D0E]" />;
    return <HelpCircle className="w-3.5 h-3.5 text-[#9B2C2C]" />;
  };

  const formatScore = (score: number) => {
    return Number(score).toFixed(3).replace(".", ",");
  };

  return (
    <RoleShell>
      <div className="space-y-5 max-w-5xl mx-auto overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                Dashboard Super Admin
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1">
              Pusat Kendali Pengasuhan & Monitoring
            </h1>
            <p className="text-xs text-[#64748B]">
              Monitoring akhlak, absensi, serta pelaporan asatidzah
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="px-3.5 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#153e32] transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kelola Pengguna</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <CardSub className="p-4">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Santri</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-[#1B4D3E] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#172033]">
              {totalSantri}
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">
              Putra & Putri terdaftar
            </p>
          </CardSub>

          <CardSub className="p-4">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Guru / Mudabbir</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-[#A8833E] flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#172033]">
              {totalGuru}
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">
              Ustadz & Ustadzah aktif
            </p>
          </CardSub>

          <CardSub className="p-4">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Rata-rata Skor</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-[#065F46] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#065F46]">
              {avgScore}
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">
              Batas Maksimal 99,000
            </p>
          </CardSub>

          <CardSub className="p-4">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Perlu Binaan</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-red-600">
              {needAttentionSantri.length}
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">
              Skor di bawah 70,000
            </p>
          </CardSub>
        </div>

        <Card className="p-4 sm:p-5 space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1B4D3E]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
                  Analisis Intensitas Laporan Asatidzah
                </h2>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Monitoring keaktifan pembina menginput catatan sikap santri harian, mingguan, dan bulanan
              </p>
            </div>

            <div className="inline-flex rounded-xl p-1 bg-[#EEF2F6] self-start sm:self-auto">
              {(["HARIAN", "MINGGUAN", "BULANAN"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setReportTimeframe(period)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    reportTimeframe === period
                      ? "bg-white text-[#1B4D3E] shadow-xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {teachersNeedingReminder.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-red-200 flex items-start gap-3">
              <UserX className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-800">
                  Perhatian: {teachersNeedingReminder.length} Pembina Jarang Lapor ({reportTimeframe.toLowerCase()})
                </p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  Pembina berikut belum rutin melakukan input laporan:{" "}
                  <span className="font-semibold">
                    {teachersNeedingReminder.map((t) => t.name).join(", ")}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-1">
            {teacherAnalytics.map((teacher) => (
              <div
                key={teacher.id}
                className="p-3 rounded-2xl mizan-card-sub space-y-2 hover:border-[#1B4D3E]/40 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl mizan-inset flex items-center justify-center font-bold text-xs text-[#1B4D3E] shrink-0">
                      {teacher.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate">
                        {teacher.name}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        Binaan Kelas {teacher.assignedClass} ({teacher.gender}) • Status: {teacher.status}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black font-mono text-[#1B4D3E]">
                      {teacher.periodCount} Input
                    </span>
                    <span
                      className={`block text-[9px] font-bold ${
                        teacher.isRare ? "text-red-600" : "text-[#065F46]"
                      }`}
                    >
                      {teacher.isRare ? "Jarang Lapor" : "Aktif Melapor"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        teacher.isRare
                          ? "bg-red-500"
                          : teacher.percentage >= 80
                          ? "bg-[#1B4D3E]"
                          : "bg-[#A8833E]"
                      }`}
                      style={{ width: `${Math.max(5, teacher.percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#94A3B8] font-bold">
                    <span>Aktivitas Terakhir: {teacher.lastLogin}</span>
                    <span>{teacher.percentage}% dari target periode</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#A8833E]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
                  Peringkat Santri & Santriwati Teladan
                </h2>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Urutan capaian akhlak tertinggi pondok (Maksimal 99,000)
              </p>
            </div>

            <div className="inline-flex rounded-xl p-1 bg-[#EEF2F6] self-start sm:self-auto">
              {(["ALL", "Putra", "Putri"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setLeaderboardGender(g)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    leaderboardGender === g
                      ? "bg-white text-[#1B4D3E] shadow-xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {g === "ALL" ? "Semua" : g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {rankedSantriList.map((santri, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <Link
                  key={santri.id}
                  href={`/guru/santri/${santri.id}`}
                  className={`p-3 rounded-2xl mizan-card-sub flex items-center justify-between gap-2.5 transition-all group ${
                    isFirst
                      ? "border-[#C5A059] bg-[#FAF7EE]/50"
                      : isSecond
                      ? "border-slate-300 bg-slate-50/50"
                      : isThird
                      ? "border-amber-300 bg-amber-50/40"
                      : "hover:border-[#1B4D3E]/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isFirst
                          ? "bg-[#C5A059] text-white shadow-xs"
                          : isSecond
                          ? "bg-slate-400 text-white"
                          : isThird
                          ? "bg-amber-600 text-white"
                          : "bg-[#EEF2F6] text-[#64748B]"
                      }`}
                    >
                      {rank}
                    </div>

                    <Avatar
                      initials={santri.avatar}
                      size="sm"
                      variant={isFirst ? "gold" : santri.gender === "Putra" ? "primary" : "gold"}
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate group-hover:text-[#1B4D3E] transition-colors">
                        {santri.name}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        Kelas {santri.class} • {santri.gender}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black font-mono text-[#1B4D3E] block">
                      {formatScore(santri.currentScore)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A8833E] bg-[#FAF7EE] border border-[#C5A059]/30 px-2.5 py-0.5 rounded-full mt-1">
                      <Award className="w-3 h-3 text-[#A8833E]" />
                      Peringkat {rank}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
                Santri Perlu Pembinaan Segera (Skor Terendah)
              </h2>
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full mizan-pill">
              {needAttentionSantri.length} Santri
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {needAttentionSantri.slice(0, 4).map((santri) => (
              <Link
                key={santri.id}
                href={`/guru/santri/${santri.id}`}
                className="p-3 rounded-2xl border border-red-200 bg-[#FEF2F2]/60 flex items-center justify-between gap-2 hover:border-red-400 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar initials={santri.avatar} size="sm" variant="primary" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033] truncate">
                      {santri.name}
                    </p>
                    <p className="text-[10px] text-red-700">
                      Kelas {santri.class} • Status: {santri.status}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black font-mono text-red-600 block">
                    {formatScore(santri.currentScore)}
                  </span>
                  <span className="text-[9px] text-[#64748B]">Profil</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <CardHeader
            title="Deteksi Laporan Harian Asatidzah Hari Ini"
            subtitle="Status pelaporan piket dan penegakan adab santri oleh masing-masing pembina"
          />

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                  <th className="py-2.5 px-3">Nama Pembina</th>
                  <th className="py-2.5 px-3">Binaan Kelas</th>
                  <th className="py-2.5 px-3">Aktivitas Terakhir</th>
                  <th className="py-2.5 px-3 text-center">Laporan Hari Ini</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {guruList.map((guru) => (
                  <tr key={guru.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#172033]">
                      {guru.name}
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">
                      Kelas {guru.assignedClass} ({guru.gender})
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">{guru.lastLogin}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#172033]">
                      {guru.reportCountToday}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={getGuruBadgeVariant(guru.status)}>
                        {getGuruStatusIcon(guru.status)}
                        <span>{guru.status}</span>
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        aria-label={`Ubah status ${guru.name}`}
                        value={guru.status}
                        onChange={(e) => setGuruStatus(guru.id, e.target.value as StatusGuru)}
                        className="text-[11px] bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                      >
                        <option value="Sudah Lapor">Sudah Lapor</option>
                        <option value="Laporan Nihil">Laporan Nihil</option>
                        <option value="Belum Lapor">Belum Lapor</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </RoleShell>
  );
}
