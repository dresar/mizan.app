"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderPlus,
  Layers,
  Plus,
  Search,
  ChevronRight,
  Sparkles,
  Sliders
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
  A: { bg: "bg-[#1B4D3E]", text: "text-[#1B4D3E]", border: "border-[#1B4D3E]/30", lightBg: "bg-[#ECFDF5]" },
  B: { bg: "bg-[#C5A059]", text: "text-[#A8833E]", border: "border-[#C5A059]/40", lightBg: "bg-[#FAF7EE]" },
  C: { bg: "bg-blue-600", text: "text-blue-700", border: "border-blue-200", lightBg: "bg-blue-50" },
  D: { bg: "bg-violet-600", text: "text-violet-700", border: "border-violet-200", lightBg: "bg-violet-50" },
  E: { bg: "bg-orange-600", text: "text-orange-700", border: "border-orange-200", lightBg: "bg-orange-50" }
};

export default function AdminKategoriPelanggaranPage() {
  const { categories } = useMizan();
  const [searchQuery, setSearchQuery] = useState("");

  const categoriesOverview = useMemo(() => {
    return categories.map((cat) => {
      const unsursCount = cat.unsurs.length;
      let totalIndicators = 0;
      let hasanahCount = 0;
      let sayyiahCount = 0;

      cat.unsurs.forEach((u) => {
        u.indicators.forEach((ind) => {
          totalIndicators++;
          if (ind.type === "HASANAH") {
            hasanahCount++;
          } else {
            sayyiahCount++;
          }
        });
      });

      const topUnsurs = cat.unsurs.slice(0, 3).map((u) => u.name);

      const colorScheme =
        CATEGORY_COLORS[cat.code] || {
          bg: "bg-[#1B4D3E]",
          text: "text-[#1B4D3E]",
          border: "border-[#1B4D3E]/30",
          lightBg: "bg-[#ECFDF5]"
        };

      return {
        code: cat.code,
        name: cat.name,
        unsursCount,
        totalIndicators,
        hasanahCount,
        sayyiahCount,
        topUnsurs,
        colorScheme
      };
    });
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categoriesOverview;
    return categoriesOverview.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.code.toLowerCase().includes(q) ||
        cat.topUnsurs.some((u) => u.toLowerCase().includes(q))
    );
  }, [categoriesOverview, searchQuery]);

  const totalAllUnsurs = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.unsurs.length, 0);
  }, [categories]);

  const totalAllIndicators = useMemo(() => {
    return categories.reduce((sum, c) => {
      return sum + c.unsurs.reduce((uSum, u) => uSum + u.indicators.length, 0);
    }, 0);
  }, [categories]);

  return (
    <RoleShell>
      <div className="w-full space-y-4 pb-36">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Pusat Konfigurasi Indikator</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF2F6] text-[#64748B]">
                {categories.length} Kategori Utama
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1.5">
              Master Kategori & Indikator Penilaian
            </h1>
            <p className="text-xs text-[#64748B]">
              Pilih salah satu kategori utama di bawah untuk mengelola unsur dan rincian indikator penilaian santri
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/admin/kategori-pelanggaran/kategori"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors shadow-2xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Kategori</span>
            </Link>

            <Link
              href="/admin/kategori-pelanggaran/unsur"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Unsur</span>
            </Link>

            <Link
              href="/admin/kategori-pelanggaran/indikator"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-xs"
            >
              <span>Indikator</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Total Kategori
            </span>
            <div className="text-xl font-black font-mono text-[#172033] mt-0.5">
              {categories.length} <span className="text-xs font-normal text-[#94A3B8]">Kategori</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D3E] block">
              Total Unsur Penilaian
            </span>
            <div className="text-xl font-black font-mono text-[#1B4D3E] mt-0.5">
              {totalAllUnsurs} <span className="text-xs font-normal text-[#94A3B8]">Unsur</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8833E] block">
              Total Indikator Skor
            </span>
            <div className="text-xl font-black font-mono text-[#A8833E] mt-0.5">
              {totalAllIndicators} <span className="text-xs font-normal text-[#94A3B8]">Indikator</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] block">
              Mode Penilaian
            </span>
            <div className="text-xs font-bold text-[#065F46] mt-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hasanah & Sayyi&apos;ah</span>
            </div>
          </div>
        </div>

        <Card className="p-3 sm:p-4 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari kategori atau unsur penilaian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredCategories.map((cat) => {
            return (
              <Link
                key={cat.code}
                href={`/admin/kategori-pelanggaran/${cat.code}`}
                className="group p-5 rounded-2xl bg-white border border-[#E2EBF4] hover:border-[#1B4D3E] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${cat.colorScheme.bg} text-white flex items-center justify-center font-mono font-black text-lg shadow-sm shrink-0`}>
                        {cat.code}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                          Kategori Utama {cat.code}
                        </span>
                        <h2 className="text-base font-bold text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                          {cat.name}
                        </h2>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#EEF2F6] group-hover:bg-[#1B4D3E] text-[#64748B] group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 text-center">
                    <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                        Unsur
                      </span>
                      <span className="text-sm font-black font-mono text-[#172033]">
                        {cat.unsursCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#065F46] block">
                        Hasanah
                      </span>
                      <span className="text-sm font-black font-mono text-[#065F46]">
                        {cat.hasanahCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 block">
                        Sayyi&apos;ah
                      </span>
                      <span className="text-sm font-black font-mono text-red-600">
                        {cat.sayyiahCount}
                      </span>
                    </div>
                  </div>

                  {cat.topUnsurs.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                        Contoh Unsur Penilaian:
                      </span>
                      <ul className="space-y-1">
                        {cat.topUnsurs.map((u, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-[#64748B] line-clamp-1 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                            <span>{u}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#1B4D3E]">
                  <span>Kelola Unsur & Indikator</span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Rincian</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-[#94A3B8] bg-white rounded-2xl border border-[#E2EBF4]">
              Tidak ada kategori yang sesuai dengan kata kunci pencarian
            </div>
          )}
        </div>
      </div>
    </RoleShell>
  );
}
