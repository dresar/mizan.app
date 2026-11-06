"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { GuruMonitoring, AbsensiRecord, PenilaianRecord } from "@/lib/mock-data";

interface GuruMonitoringPreviewCardProps {
  guruList: GuruMonitoring[];
  absensiList: AbsensiRecord[];
  penilaianList: PenilaianRecord[];
}

function cleanGuruName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^(ust\.|usth\.|ustadz\.|ustadzah\.|ustadz|ustadzah|dr\.|drs\.|h\.|hj\.)\s+/gi, "")
    .replace(/,\s*(s\.pd(\.i)?|m\.pd(\.i)?|lc|gr|s\.ag|m\.ag).*$/gi, "")
    .trim();
}

export function GuruMonitoringPreviewCard({
  guruList,
  absensiList,
  penilaianList
}: GuruMonitoringPreviewCardProps) {
  const cutoffTime = useMemo(() => {
    return Date.now() - 7 * 24 * 60 * 60 * 1000;
  }, []);

  const guruStats = useMemo(() => {
    return guruList.map((g) => {
      const gClean = cleanGuruName(g.name);

      const sholatCount = absensiList.filter((a) => {
        const idMatch = a.guruId === g.id || a.guruId.endsWith(g.id) || g.id.endsWith(a.guruId);
        if (idMatch) return true;
        const aClean = cleanGuruName(a.guruName);
        if (aClean && gClean && (aClean === gClean || aClean.includes(gClean) || gClean.includes(aClean))) {
          return true;
        }
        return false;
      }).length;

      const adabCount = penilaianList.filter((p) => {
        const idMatch = p.guruId === g.id || p.guruId.endsWith(g.id) || g.id.endsWith(p.guruId);
        if (idMatch) return true;
        const pClean = cleanGuruName(p.guruName);
        if (pClean && gClean && (pClean === gClean || pClean.includes(gClean) || gClean.includes(pClean))) {
          return true;
        }
        return false;
      }).length;

      const totalReports = sholatCount + adabCount;
      const isAktif = totalReports > 0;

      return {
        ...g,
        sholatCount,
        adabCount,
        totalReports,
        isAktif
      };
    });
  }, [guruList, absensiList, penilaianList, cutoffTime]);

  const totalGuru = guruStats.length;
  const aktifCount = guruStats.filter((g) => g.isAktif).length;
  const belumCount = totalGuru - aktifCount;
  const compliancePct = totalGuru > 0 ? Math.round((aktifCount / totalGuru) * 100) : 0;

  const topActiveGurus = useMemo(() => {
    return [...guruStats]
      .sort((a, b) => b.totalReports - a.totalReports)
      .slice(0, 4);
  }, [guruStats]);

  return (
    <Card className="p-4 sm:p-5 space-y-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1B4D3E]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
              Keaktifan Pembina
            </h2>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Piket & adab (7 hari)
          </p>
        </div>

        <Link
          href="/admin/keaktifan-guru"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/40 text-[#854D0E] text-xs font-bold hover:bg-[#FEFCE8] transition-colors shadow-2xs self-start sm:self-auto"
        >
          <span>Detail Pelaporan Guru</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Pembina</p>
            <p className="text-xl font-black font-mono text-[#172033] mt-0.5">{totalGuru} Pembina</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#1B4D3E] flex items-center justify-center font-bold text-xs">
            <Users className="w-4 h-4 text-[#1B4D3E]" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">Aktif Melapor</p>
            <p className="text-xl font-black font-mono text-[#15803D] mt-0.5">{aktifCount} Pembina</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white border border-[#BBF7D0] text-[#15803D] flex items-center justify-center font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider">Belum Melapor</p>
            <p className="text-xl font-black font-mono text-[#B91C1C] mt-0.5">{belumCount} Pembina</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white border border-[#FECACA] text-[#B91C1C] flex items-center justify-center font-bold text-xs">
            <Clock className="w-4 h-4 text-[#B91C1C]" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#854D0E] uppercase tracking-wider">Tingkat Kepatuhan</p>
            <p className="text-xl font-black font-mono text-[#854D0E] mt-0.5">{compliancePct}%</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white border border-[#C5A059]/40 text-[#854D0E] flex items-center justify-center font-bold text-xs">
            <TrendingUp className="w-4 h-4 text-[#854D0E]" />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#172033]">
          <span>Preview Pembina Teraktif</span>
          <Link
            href="/admin/keaktifan-guru"
            className="text-[11px] font-bold text-[#1B4D3E] hover:underline flex items-center gap-0.5"
          >
            Lihat Semua ({totalGuru}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {topActiveGurus.map((g) => (
            <div
              key={g.id}
              className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2.5"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#172033] truncate">{g.name}</p>
                <p className="text-[10px] text-[#64748B] font-mono truncate">
                  {g.assignedClass} • {g.asrama}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded-lg ${
                    g.totalReports > 0
                      ? "bg-[#DCFCE7] text-[#15803D]"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {g.totalReports} Laporan
                </span>
                <span className="block text-[9px] text-[#94A3B8] mt-0.5">
                  {g.sholatCount} Sholat • {g.adabCount} Adab
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
