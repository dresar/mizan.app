"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Award,
  Trophy,
  Download
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PrayerAttendanceChart } from "@/components/PrayerAttendanceChart";
import { NeedAttentionCard } from "./NeedAttentionCard";
import { GuruMonitoringCard } from "./GuruMonitoringCard";

export default function AdminDashboardPage() {
  const { santriList, guruList, absensiList, penilaianList, setGuruStatus, settings } = useMizan();

  const [leaderboardGender, setLeaderboardGender] = useState<"ALL" | "Putra" | "Putri">("ALL");

  const totalSantri = santriList.length;
  const totalGuru = guruList.length;

  const sudahLaporCount = useMemo(() => {
    return guruList.filter((g) => g.status === "Sudah Lapor").length;
  }, [guruList]);

  const avgScore = useMemo(() => {
    if (totalSantri === 0) return (settings.defaultBaseScore || 70).toFixed(3).replace(".", ",");
    const sum = santriList.reduce((acc, s) => acc + s.currentScore, 0);
    return (sum / totalSantri).toFixed(3).replace(".", ",");
  }, [santriList, totalSantri, settings.defaultBaseScore]);

  const rankedSantriList = useMemo(() => {
    let list = [...santriList];
    if (leaderboardGender !== "ALL") {
      return list
        .filter((s) => s.gender === leaderboardGender)
        .sort((a, b) => b.currentScore - a.currentScore)
        .slice(0, 10);
    }
    const putra = list
      .filter((s) => s.gender === "Putra")
      .sort((a, b) => b.currentScore - a.currentScore)
      .slice(0, 5);
    const putri = list
      .filter((s) => s.gender === "Putri")
      .sort((a, b) => b.currentScore - a.currentScore)
      .slice(0, 5);
    return [...putra, ...putri];
  }, [santriList, leaderboardGender]);

  const totalNeedAttentionCount = useMemo(() => {
    return santriList.filter((s) => s.currentScore < 50).length;
  }, [santriList]);

  const formatScore = (score: number) => {
    return Number(score).toFixed(3).replace(".", ",");
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              Kendali Pengasuhan & Monitoring
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Monitoring akhlak, absensi, serta pelaporan asatidzah
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/admin/backup?download=1"
              className="px-3.5 py-2 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 text-[#854D0E] text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-[#FEFCE8] transition-colors"
              title="Cadangkan seluruh data dalam format JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Backup</span>
            </a>
            <Link
              href="/admin/users"
              className="px-3.5 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#153e32] transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pengguna</span>
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
              Santri L & P terdaftar
            </p>
          </CardSub>

          <CardSub className="p-4">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Ustadz & Ustadzah</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-[#A8833E] flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#172033]">
              {totalGuru}
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">
              {sudahLaporCount} Lapor Hari Ini • {totalGuru} Terdata
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
              Skor rata-rata pondok
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
              {totalNeedAttentionCount}
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">
              Skor di bawah 50,000
            </p>
          </CardSub>
        </div>

        <PrayerAttendanceChart absensiList={absensiList} />

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
                5 L & 5 P peraih capaian akhlak tertinggi pondok
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
                  {g === "ALL" ? "Semua" : g === "Putra" ? "L" : "P"}
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
                      size="md"
                      variant={isFirst ? "gold" : santri.gender === "Putra" ? "primary" : "gold"}
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate group-hover:text-[#1B4D3E] transition-colors">
                        {santri.name}
                      </p>
                      <p className="text-[10px] text-[#64748B] font-mono">
                        {santri.class} • {santri.gender}
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

        <NeedAttentionCard santriList={santriList} />

        <GuruMonitoringCard
          guruList={guruList}
          absensiList={absensiList}
          penilaianList={penilaianList}
          setGuruStatus={setGuruStatus}
        />
      </div>
    </RoleShell>
  );
}
