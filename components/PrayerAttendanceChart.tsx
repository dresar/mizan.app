"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Clock
} from "lucide-react";
import { AbsensiRecord, WaktuSholat } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";

interface PrayerAttendanceChartProps {
  absensiList: AbsensiRecord[];
  title?: string;
  subtitle?: string;
}

const FIVE_PRAYERS: WaktuSholat[] = [
  "Subuh",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya"
];

const SEVEN_PRAYERS: WaktuSholat[] = [
  "Subuh",
  "Dhuha",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya",
  "Tahajjud"
];

export function PrayerAttendanceChart({
  absensiList,
  title = "Tingkat Kehadiran Sholat Santri",
  subtitle = "Analisis tingkat kepatuhan sholat santri berdasarkan log presensi"
}: PrayerAttendanceChartProps) {
  const [prayerMode, setPrayerMode] = useState<"5_WAKTU" | "7_WAKTU">("5_WAKTU");

  const activePrayers = useMemo(() => {
    return prayerMode === "5_WAKTU" ? FIVE_PRAYERS : SEVEN_PRAYERS;
  }, [prayerMode]);

  const stats = useMemo(() => {
    const relevantRecords = absensiList.filter((a) =>
      activePrayers.includes((a.waktuSholat || "Subuh") as WaktuSholat)
    );

    const total = relevantRecords.length;
    const hadir = relevantRecords.filter((a) => a.status === "Hadir").length;
    const izin = relevantRecords.filter((a) => a.status === "Izin").length;
    const sakit = relevantRecords.filter((a) => a.status === "Sakit").length;
    const alpa = relevantRecords.filter((a) => a.status === "Alpa").length;
    const rateHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

    const breakdown = activePrayers.map((waktu) => {
      const records = relevantRecords.filter((a) => (a.waktuSholat || "Subuh") === waktu);
      const hCount = records.filter((r) => r.status === "Hadir").length;
      const notHCount = records.length - hCount;
      const pct = records.length > 0 ? Math.round((hCount / records.length) * 100) : 0;
      return {
        waktu,
        total: records.length,
        hadir: hCount,
        tidakHadir: notHCount,
        pct
      };
    });

    return {
      total,
      hadir,
      izin,
      sakit,
      alpa,
      rateHadir,
      breakdown
    };
  }, [absensiList, activePrayers]);

  return (
    <Card className="p-4 sm:p-5 space-y-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#1B4D3E]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
              {title}
            </h2>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="inline-flex rounded-xl p-1 bg-[#EEF2F6] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPrayerMode("5_WAKTU")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              prayerMode === "5_WAKTU"
                ? "bg-white text-[#1B4D3E] shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Sholat 5 Waktu
          </button>
          <button
            type="button"
            onClick={() => setPrayerMode("7_WAKTU")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              prayerMode === "7_WAKTU"
                ? "bg-white text-[#1B4D3E] shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            7 Waktu (+Sunnah)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#065F46] font-bold block uppercase tracking-wider">Rata-rata Hadir</span>
            <span className="text-xl font-black font-mono text-[#065F46] block mt-0.5">
              {stats.rateHadir}%
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl mizan-inset text-[#065F46] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#1B4D3E] font-bold block uppercase tracking-wider">Total Hadir</span>
            <span className="text-xl font-black font-mono text-[#1B4D3E] block mt-0.5">
              {stats.hadir} <span className="text-xs font-normal text-[#64748B]">/{stats.total}</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl mizan-inset text-[#1B4D3E] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#A8833E] font-bold block uppercase tracking-wider">Izin / Sakit</span>
            <span className="text-xl font-black font-mono text-[#A8833E] block mt-0.5">
              {stats.izin + stats.sakit}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl mizan-inset text-[#A8833E] flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between">
          <div>
            <span className="text-[10px] text-red-700 font-bold block uppercase tracking-wider">Alpa Sholat</span>
            <span className="text-xl font-black font-mono text-red-600 block mt-0.5">
              {stats.alpa}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl mizan-inset text-red-600 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl mizan-card-sub space-y-4">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B4D3E]"></span>
              <span>≥ 80% Hadir</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]"></span>
              <span>50 - 79%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>&lt; 50%</span>
            </span>
          </div>
          <span className="flex items-center gap-1 text-[#A8833E]">
            <span className="w-3 border-t-2 border-dashed border-[#A8833E]"></span>
            <span>Target 100%</span>
          </span>
        </div>

        <div className="pt-2 pb-4">
          <div
            className={`grid gap-2 sm:gap-4 h-52 items-end ${
              prayerMode === "5_WAKTU" ? "grid-cols-5" : "grid-cols-7"
            }`}
          >
            {stats.breakdown.map((pb) => {
              const barHeight = Math.max(8, pb.pct);

              return (
                <div key={pb.waktu} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-black font-mono mb-1 transition-transform group-hover:-translate-y-1">
                    <span
                      className={`px-1.5 py-0.5 rounded-md ${
                        pb.total === 0
                          ? "bg-slate-100 text-slate-500"
                          : pb.pct >= 80
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : pb.pct >= 50
                          ? "bg-[#FAF7EE] text-[#A8833E]"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {pb.total === 0 ? "0%" : `${pb.pct}%`}
                    </span>
                  </div>

                  <div className="w-full max-w-[48px] bg-[#EEF2F6] rounded-t-xl h-full flex items-end p-1 overflow-hidden">
                    <div
                      style={{ height: `${barHeight}%` }}
                      className={`w-full rounded-t-lg transition-all duration-700 ease-out flex flex-col justify-end items-center pb-1.5 ${
                        pb.total === 0
                          ? "bg-slate-200"
                          : pb.pct >= 80
                          ? "bg-gradient-to-t from-[#1B4D3E] to-[#2D8269] shadow-sm"
                          : pb.pct >= 50
                          ? "bg-gradient-to-t from-[#C5A059] to-[#E5C378] shadow-sm"
                          : "bg-gradient-to-t from-red-600 to-red-400 shadow-sm"
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
                    </div>
                  </div>

                  <div className="mt-2.5 text-center w-full px-0.5">
                    <p className="text-xs font-bold text-[#172033] truncate group-hover:text-[#1B4D3E] transition-colors leading-tight">
                      {pb.waktu}
                    </p>
                    <span className="block text-[10px] font-mono text-[#94A3B8] font-semibold mt-0.5">
                      {pb.hadir}/{pb.total} Hadir
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}