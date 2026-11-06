"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  ListFilter,
  Users,
  Check,
  X,
  History
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { WaktuSholat, StatusAbsensi } from "@/lib/mock-data";
import { getWIBDate } from "@/lib/date-utils";

const ALL_PRAYERS: WaktuSholat[] = [
  "Tahajjud",
  "Subuh",
  "Dhuha",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya"
];

const PRAYER_SCHEDULE: Record<WaktuSholat, { time: string; period: string }> = {
  Tahajjud: { time: "03:30 WIB", period: "Malam / Sepertiga Akhir" },
  Subuh: { time: "05:00 WIB", period: "Pagi Buta" },
  Dhuha: { time: "09:30 WIB", period: "Pagi Menjelang Siang" },
  Dzuhur: { time: "12:30 WIB", period: "Siang Hari" },
  Ashar: { time: "15:45 WIB", period: "Sore Hari" },
  Maghrib: { time: "18:20 WIB", period: "Petang Hari" },
  Isya: { time: "19:35 WIB", period: "Awal Malam" }
};

export default function AdminAbsensiPage() {
  const { absensiList, santriList, refreshData, showToast } = useMizan();

  const todayStr = useMemo(() => getWIBDate(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setSelectedDate(getWIBDate());
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    showToast("Data presensi berhasil disinkronkan");
  };

  const availableRecordedDates = useMemo(() => {
    const datesSet = new Set<string>();
    absensiList.forEach((a) => {
      if (a.date) datesSet.add(a.date);
    });
    return Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  }, [absensiList]);

  const yesterdayStr = useMemo(() => {
    const [y, m, d] = todayStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    return getWIBDate(dateObj);
  }, [todayStr]);

  const quickDates = useMemo(() => {
    const list: string[] = [];
    if (!list.includes(todayStr)) list.push(todayStr);
    if (!list.includes(yesterdayStr)) list.push(yesterdayStr);
    availableRecordedDates.forEach((d) => {
      if (!list.includes(d)) list.push(d);
    });
    return list.slice(0, 6);
  }, [todayStr, yesterdayStr, availableRecordedDates]);

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const days = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    const dayName = days[dateObj.getDay()] || "";
    const monthName = months[dateObj.getMonth()] || "";
    return `${dayName}, ${day} ${monthName}`;
  };

  const getRelativeDateTag = (dateStr: string) => {
    if (dateStr === todayStr) return "Hari Ini";
    if (dateStr === yesterdayStr) return "Kemarin";
    const [y1, m1, d1] = todayStr.split("-").map(Number);
    const [y2, m2, d2] = dateStr.split("-").map(Number);
    const diff = Math.round(
      (new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (diff === 2) return "2 Hari Lalu";
    if (diff > 2) return `${diff} Hari Lalu`;
    if (diff === -1) return "Besok";
    if (diff < -1) return "Mendatang";
    return "";
  };

  const getPrayerIcon = (prayer: WaktuSholat) => {
    switch (prayer) {
      case "Tahajjud":
        return <Moon className="w-4 h-4 text-purple-600" />;
      case "Subuh":
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case "Dhuha":
        return <Sun className="w-4 h-4 text-amber-600" />;
      case "Dzuhur":
        return <Sun className="w-4 h-4 text-emerald-600" />;
      case "Ashar":
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case "Maghrib":
        return <Sunset className="w-4 h-4 text-rose-500" />;
      case "Isya":
        return <Moon className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-[#1B4D3E]" />;
    }
  };

  const recordsForSelectedDate = useMemo(() => {
    return absensiList.filter((a) => a.date === selectedDate);
  }, [absensiList, selectedDate]);

  const overviewStats = useMemo(() => {
    const putraRecords = recordsForSelectedDate.filter((r) => r.gender === "Putra");
    const putriRecords = recordsForSelectedDate.filter((r) => r.gender === "Putri");

    const totalPutra = putraRecords.length;
    const hadirPutra = putraRecords.filter((r) => r.status === "Hadir").length;
    const alpaPutra = putraRecords.filter((r) => r.status === "Alpa").length;
    const ratePutra = totalPutra > 0 ? Math.round((hadirPutra / totalPutra) * 100) : 0;

    const totalPutri = putriRecords.length;
    const hadirPutri = putriRecords.filter((r) => r.status === "Hadir").length;
    const alpaPutri = putriRecords.filter((r) => r.status === "Alpa").length;
    const ratePutri = totalPutri > 0 ? Math.round((hadirPutri / totalPutri) * 100) : 0;

    const allSessions = new Set<string>();
    recordsForSelectedDate.forEach((r) => {
      allSessions.add(`${r.waktuSholat || "Subuh"}-${r.gender}`);
    });

    const totalRecords = recordsForSelectedDate.length;
    const totalHadir = recordsForSelectedDate.filter((r) => r.status === "Hadir").length;
    const totalAlpa = recordsForSelectedDate.filter((r) => r.status === "Alpa").length;
    const overallRate = totalRecords > 0 ? Math.round((totalHadir / totalRecords) * 100) : 0;

    return {
      totalPutra,
      hadirPutra,
      alpaPutra,
      ratePutra,
      totalPutri,
      hadirPutri,
      alpaPutri,
      ratePutri,
      completedSessionsCount: allSessions.size,
      totalRecords,
      totalHadir,
      totalAlpa,
      overallRate
    };
  }, [recordsForSelectedDate]);

  const buildSessionData = (prayer: WaktuSholat, gender: "Putra" | "Putri") => {
    const records = recordsForSelectedDate.filter(
      (a) => (a.waktuSholat || "Subuh") === prayer && a.gender === gender
    );
    const total = records.length;
    const hadir = records.filter((r) => r.status === "Hadir").length;
    const izin = records.filter((r) => r.status === "Izin").length;
    const sakit = records.filter((r) => r.status === "Sakit").length;
    const alpa = records.filter((r) => r.status === "Alpa").length;
    const pctHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

    const bkStaffSet = new Set<string>();
    records.forEach((r) => {
      if (r.guruName) bkStaffSet.add(r.guruName);
    });
    const bkStaff = Array.from(bkStaffSet);

    const submitTime = records[0]?.createdAt || "-";
    const isRecorded = total > 0;

    return {
      prayer,
      gender,
      schedule: PRAYER_SCHEDULE[prayer],
      isRecorded,
      total,
      hadir,
      izin,
      sakit,
      alpa,
      pctHadir,
      bkStaff,
      submitTime
    };
  };

  const sessionsPutra = useMemo(() => {
    return ALL_PRAYERS.map((p) => buildSessionData(p, "Putra"));
  }, [recordsForSelectedDate]);

  const sessionsPutri = useMemo(() => {
    return ALL_PRAYERS.map((p) => buildSessionData(p, "Putri"));
  }, [recordsForSelectedDate]);

  return (
    <RoleShell>
      <div className="p-3 sm:p-5 md:p-7 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033]">
                Monitoring Absensi Sholat
              </h1>
              {selectedDate === todayStr ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Realtime Hari Ini</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2F6] text-[#64748B]">
                  {getRelativeDateTag(selectedDate) || "Arsip Riwayat"}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Rekapitulasi presensi sholat berjama&apos;ah santri (Putra) dan santriwati (Putri)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/absensi/rekap"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Rekapitulasi</span>
            </Link>

            <Link
              href="/admin/absensi/log"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Log Audit</span>
            </Link>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#1B4D3E] ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Sinkron</span>
            </button>

            <Link
              href="/admin/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-all shadow-2xs"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <Card className="p-4 sm:p-5 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1B4D3E]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                Pilih Tanggal Presensi:
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              />

              <div className="flex items-center gap-1 bg-[#EEF2F6] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedGender("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedGender === "ALL" ? "bg-white text-[#172033] shadow-2xs" : "text-[#64748B]"
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender("Putra")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedGender === "Putra" ? "bg-white text-[#065F46] shadow-2xs" : "text-[#64748B]"
                  }`}
                >
                  L (Putra)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender("Putri")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedGender === "Putri" ? "bg-white text-[#BE123C] shadow-2xs" : "text-[#64748B]"
                  }`}
                >
                  P (Putri)
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {quickDates.map((d) => {
              const isSelected = selectedDate === d;
              const relTag = getRelativeDateTag(d);
              const isToday = d === todayStr;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-2xs"
                      : "bg-[#F8FAFC] text-[#172033] border-[#E2EBF4] hover:bg-white hover:border-[#1B4D3E]/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isToday && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-300" : "bg-emerald-500"}`} />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isSelected ? "text-white/80" : "text-[#A8833E]"
                    }`}>
                      {relTag || "Riwayat"}
                    </span>
                  </div>
                  <p className="text-xs font-bold mt-0.5">
                    {formatDateLabel(d)}
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                  {selectedDate}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46]">
                  {getRelativeDateTag(selectedDate) || "Arsip"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-black text-[#172033] mt-1">
                Rekapitulasi Harian: {formatDateLabel(selectedDate)}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Tingkat Kehadiran Total
                </span>
                <span className="text-2xl font-black font-mono text-[#065F46]">
                  {overviewStats.overallRate}%
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl mizan-inset text-[#065F46] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] block">
                Kehadiran Putra (L)
              </span>
              <div className="text-lg font-black font-mono text-[#065F46] mt-0.5">
                {overviewStats.ratePutra}%{" "}
                <span className="text-xs font-normal text-[#94A3B8]">
                  ({overviewStats.hadirPutra}/{overviewStats.totalPutra})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#BE123C] block">
                Kehadiran Putri (P)
              </span>
              <div className="text-lg font-black font-mono text-[#BE123C] mt-0.5">
                {overviewStats.ratePutri}%{" "}
                <span className="text-xs font-normal text-[#94A3B8]">
                  ({overviewStats.hadirPutri}/{overviewStats.totalPutri})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D3E] block">
                Sesi Selesai Diinput
              </span>
              <div className="text-lg font-black font-mono text-[#1B4D3E] mt-0.5">
                {overviewStats.completedSessionsCount}{" "}
                <span className="text-xs font-normal text-[#94A3B8]">/ 14 Sesi</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                Total Alpa Sholat
              </span>
              <div className="text-lg font-black font-mono text-red-600 mt-0.5">
                {overviewStats.totalAlpa}
              </div>
            </div>
          </div>

          {recordsForSelectedDate.length === 0 && (
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                {selectedDate === todayStr
                  ? "Belum ada sesi sholat yang tercatat untuk hari ini. Sesi akan otomatis muncul dan diperbarui saat tim pengasuhan / BK melakukan absensi."
                  : `Belum ada sesi sholat yang tercatat pada tanggal ${formatDateLabel(selectedDate)} (data kosong).`}
              </span>
            </div>
          )}
        </Card>

        {(selectedGender === "ALL" || selectedGender === "Putra") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#065F46]" />
                <h3 className="text-sm font-bold text-[#172033]">
                  Kampus Putra • Masjid Utama
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46]">
                  Santri L
                </span>
              </div>
              <span className="text-[11px] text-[#64748B]">
                Pengasuhan Ustadz Putra
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sessionsPutra.map((session) => (
                <div
                  key={`putra-${session.prayer}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    session.isRecorded
                      ? "bg-white border-[#E2EBF4] hover:border-[#1B4D3E] shadow-2xs"
                      : "bg-[#FAF7EE]/40 border-dashed border-[#CBD5E1]"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl mizan-inset flex items-center justify-center shrink-0">
                          {getPrayerIcon(session.prayer)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#172033]">
                              Sholat {session.prayer}
                            </h4>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#ECFDF5] text-[#065F46]">
                              Putra (L)
                            </span>
                          </div>
                          <span className="text-[10px] text-[#94A3B8]">
                            {session.schedule.time} • Masjid Putra
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          session.isRecorded
                            ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {session.isRecorded ? "Selesai" : "Belum Diabsen"}
                      </span>
                    </div>

                    {session.isRecorded ? (
                      <div className="space-y-2">
                        <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                            Petugas Pengasuhan Putra
                          </span>
                          <p className="text-xs font-bold text-[#172033] truncate">
                            {session.bkStaff.join(", ") || "Ust. Willy Agustino"}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <span className="text-[#64748B]">Kehadiran:</span>
                            <span className="font-mono text-[#065F46]">
                              {session.pctHadir}% ({session.hadir}/{session.total})
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#EEF2F6] overflow-hidden">
                            <div
                              style={{ width: `${session.pctHadir}%` }}
                              className="h-full rounded-full bg-[#065F46]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 text-[#64748B] font-mono">
                          <span className="text-[#065F46] font-bold">✓ {session.hadir} Hadir</span>
                          {session.alpa > 0 && (
                            <span className="text-red-600 font-bold">• {session.alpa} Alpa</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <p className="text-[11px] text-[#94A3B8]">Belum tercatat absensi</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                    {session.isRecorded ? (
                      <Link
                        href={`/admin/absensi/sesi/${session.prayer.toLowerCase()}-putra?date=${selectedDate}&prayer=${session.prayer}&gender=Putra`}
                        className="w-full py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>Detail Sesi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/bk/absen"
                        className="w-full py-1.5 rounded-xl bg-[#EEF2F6] text-[#172033] text-xs font-bold hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Input Absen</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(selectedGender === "ALL" || selectedGender === "Putri") && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BE123C]" />
                <h3 className="text-sm font-bold text-[#172033]">
                  Kampus Putri • Musholla Asrama
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF1F2] text-[#BE123C]">
                  Santriwati P
                </span>
              </div>
              <span className="text-[11px] text-[#64748B]">
                Pengasuhan Ustadzah Putri
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sessionsPutri.map((session) => (
                <div
                  key={`putri-${session.prayer}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    session.isRecorded
                      ? "bg-white border-[#E2EBF4] hover:border-[#BE123C] shadow-2xs"
                      : "bg-[#FAF7EE]/40 border-dashed border-[#CBD5E1]"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl mizan-inset flex items-center justify-center shrink-0">
                          {getPrayerIcon(session.prayer)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#172033]">
                              Sholat {session.prayer}
                            </h4>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FFF1F2] text-[#BE123C]">
                              Putri (P)
                            </span>
                          </div>
                          <span className="text-[10px] text-[#94A3B8]">
                            {session.schedule.time} • Musholla Putri
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          session.isRecorded
                            ? "bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {session.isRecorded ? "Selesai" : "Belum Diabsen"}
                      </span>
                    </div>

                    {session.isRecorded ? (
                      <div className="space-y-2">
                        <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                            Petugas Pengasuhan Putri
                          </span>
                          <p className="text-xs font-bold text-[#172033] truncate">
                            {session.bkStaff.join(", ") || "Usth. Siti Salmah, S.Pd"}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <span className="text-[#64748B]">Kehadiran:</span>
                            <span className="font-mono text-[#BE123C]">
                              {session.pctHadir}% ({session.hadir}/{session.total})
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#EEF2F6] overflow-hidden">
                            <div
                              style={{ width: `${session.pctHadir}%` }}
                              className="h-full rounded-full bg-[#BE123C]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 text-[#64748B] font-mono">
                          <span className="text-[#065F46] font-bold">✓ {session.hadir} Hadir</span>
                          {session.alpa > 0 && (
                            <span className="text-red-600 font-bold">• {session.alpa} Alpa</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <p className="text-[11px] text-[#94A3B8]">Belum tercatat absensi</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                    {session.isRecorded ? (
                      <Link
                        href={`/admin/absensi/sesi/${session.prayer.toLowerCase()}-putri?date=${selectedDate}&prayer=${session.prayer}&gender=Putri`}
                        className="w-full py-1.5 rounded-xl bg-[#BE123C] text-white text-xs font-bold hover:bg-[#9F1239] transition-colors flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>Detail Sesi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/bk/absen"
                        className="w-full py-1.5 rounded-xl bg-[#EEF2F6] text-[#172033] text-xs font-bold hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Input Absen</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
