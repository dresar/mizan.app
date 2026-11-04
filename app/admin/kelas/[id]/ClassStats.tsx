"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CardSub } from "@/components/ui/Card";

export interface ClassStatsProps {
  avgScore: number;
  stats: {
    totalHasanah: number;
    totalSayyiah: number;
    totalHasanahScore: number;
    totalSayyiahScore: number;
    hasanahRingan: number;
    hasanahSedang: number;
    hasanahBerat: number;
    sayyiahRingan: number;
    sayyiahSedang: number;
    sayyiahBerat: number;
    baikCount: number;
    perhatianCount: number;
    pembinaanCount: number;
  };
}

export function ClassStats({ avgScore, stats }: ClassStatsProps) {
  const formatDecimal = (val: number) => val.toFixed(3).replace(".", ",");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        <CardSub className="p-4 bg-white text-center">
          <span className="text-[10px] text-[#64748B] font-bold uppercase block">
            Rata-Rata Skor
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#1B4D3E] block mt-1">
            {formatDecimal(avgScore)}
          </span>
          <span className="text-[10px] font-bold text-[#065F46] mt-0.5 block">
            Skor Dasar: 70,000
          </span>
        </CardSub>

        <CardSub className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] text-center">
          <span className="text-[10px] text-[#065F46] font-bold uppercase block">
            Total Hasanah
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#065F46] block mt-1">
            {stats.totalHasanah}
          </span>
          <span className="text-[10px] font-mono font-bold text-[#047857] mt-0.5 block">
            +{formatDecimal(stats.totalHasanahScore)} Poin
          </span>
        </CardSub>

        <CardSub className="p-4 bg-[#FEF2F2] border border-[#FECACA] text-center">
          <span className="text-[10px] text-[#991B1B] font-bold uppercase block">
            Total Sayyi&apos;ah
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#991B1B] block mt-1">
            {stats.totalSayyiah}
          </span>
          <span className="text-[10px] font-mono font-bold text-[#DC2626] mt-0.5 block">
            {formatDecimal(stats.totalSayyiahScore)} Poin
          </span>
        </CardSub>

        <CardSub className="p-4 bg-[#FAF7EE] border border-[#E8DCB8] text-center">
          <span className="text-[10px] text-[#854D0E] font-bold uppercase block">
            Distribusi Status
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs font-bold text-[#065F46]">{stats.baikCount} Baik</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-xs font-bold text-[#854D0E]">{stats.perhatianCount} Perhatian</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-xs font-bold text-[#991B1B]">{stats.pembinaanCount} Binaan</span>
          </div>
        </CardSub>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#16A34A]" />
              <h3 className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                Rincian Tingkat Prestasi
              </h3>
            </div>
            <span className="text-xs font-bold font-mono text-[#166534]">
              {stats.totalHasanah} Catatan
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-[#BBF7D0] text-center">
              <span className="text-[10px] text-[#64748B] block">Ringan</span>
              <span className="text-base font-black font-mono text-[#166534]">
                {stats.hasanahRingan}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#BBF7D0] text-center">
              <span className="text-[10px] text-[#64748B] block">Sedang</span>
              <span className="text-base font-black font-mono text-[#166534]">
                {stats.hasanahSedang}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#BBF7D0] text-center">
              <span className="text-[10px] text-[#64748B] block">Berat</span>
              <span className="text-base font-black font-mono text-[#166534]">
                {stats.hasanahBerat}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-[#DC2626]" />
              <h3 className="text-xs font-bold text-[#991B1B] uppercase tracking-wider">
                Rincian Tingkat Pelanggaran
              </h3>
            </div>
            <span className="text-xs font-bold font-mono text-[#991B1B]">
              {stats.totalSayyiah} Catatan
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-[#FECACA] text-center">
              <span className="text-[10px] text-[#64748B] block">Ringan</span>
              <span className="text-base font-black font-mono text-[#991B1B]">
                {stats.sayyiahRingan}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#FECACA] text-center">
              <span className="text-[10px] text-[#64748B] block">Sedang</span>
              <span className="text-base font-black font-mono text-[#991B1B]">
                {stats.sayyiahSedang}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#FECACA] text-center">
              <span className="text-[10px] text-[#64748B] block">Berat</span>
              <span className="text-base font-black font-mono text-[#991B1B]">
                {stats.sayyiahBerat}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
