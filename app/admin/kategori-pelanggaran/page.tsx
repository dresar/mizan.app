"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Filter,
  Sliders,
  Layers,
  FolderPlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  KategoriUtama,
  Indikator
} from "@/lib/mock-data";

export default function AdminKategoriPelanggaranPage() {
  const {
    categories,
    deleteIndikatorItem
  } = useMizan();

  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 20;

  const flatList: {
    indikator: Indikator;
    unsurId: string;
    unsurName: string;
    kategoriName: KategoriUtama;
  }[] = [];

  categories.forEach((cat) => {
    cat.unsurs.forEach((uns) => {
      uns.indicators.forEach((ind) => {
        flatList.push({
          indikator: ind,
          unsurId: uns.id,
          unsurName: uns.name,
          kategoriName: cat.name
        });
      });
    });
  });

  const filteredList = flatList.filter((item) => {
    const matchCat =
      selectedKategoriFilter === "ALL" ||
      item.kategoriName === selectedKategoriFilter;
    const matchType =
      selectedTypeFilter === "ALL" || item.indikator.type === selectedTypeFilter;
    return matchCat && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredList.length);
  const paginatedList = filteredList.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      totalPages
    ];
  };

  const handleDelete = (indId: string, indText: string) => {
    if (confirm(`Hapus indikator "${indText}"?`)) {
      deleteIndikatorItem(indId);
    }
  };

  const formatScore = (score: number) => {
    const formatted = Math.abs(score).toFixed(3);
    return score > 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <RoleShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#1B4D3E]">
              Master Kategori & Indikator Penilaian
            </h1>
            <p className="text-xs text-[#5C6B64] mt-0.5">
              Kelola master data kategori, unsur penilaian, dan bobot skor desimal (0.xxx). Semua nilai dikonfigurasi di sini sehingga guru di lapangan tidak perlu memasukkan skor manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/admin/kategori-pelanggaran/kategori"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#D4C9B5] text-[#1C2826] text-xs font-bold hover:bg-[#FAF7F2] transition-colors shadow-xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Kategori</span>
            </Link>

            <Link
              href="/admin/kategori-pelanggaran/unsur"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#D4C9B5] text-[#1C2826] text-xs font-bold hover:bg-[#FAF7F2] transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Unsur</span>
            </Link>

            <Link
              href="/admin/kategori-pelanggaran/indikator"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Indikator</span>
            </Link>
          </div>
        </div>

        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5C6B64] shrink-0" />
              <select
                aria-label="Filter kategori utama"
                value={selectedKategoriFilter}
                onChange={(e) => {
                  setSelectedKategoriFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
              >
                <option value="ALL">Semua Kategori Utama</option>
                {categories.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.code}. {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#5C6B64] shrink-0" />
              <select
                aria-label="Filter jenis penilaian"
                value={selectedTypeFilter}
                onChange={(e) => {
                  setSelectedTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-44 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
              >
                <option value="ALL">Semua Jenis</option>
                <option value="HASANAH">Hasanah (Prestasi)</option>
                <option value="SAYYIAH">Sayyi&apos;ah (Pelanggaran)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5DECE] bg-[#FAF7F2] text-[#5C6B64] font-bold">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-40">Kategori</th>
                  <th className="py-3 px-4 w-48">Unsur</th>
                  <th className="py-3 px-4">Teks Indikator</th>
                  <th className="py-3 px-4 w-28 text-center">Tingkat</th>
                  <th className="py-3 px-4 w-28 text-right">Dampak Skor</th>
                  <th className="py-3 px-4 w-24 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DECE]/60">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#5C6B64]">
                      Tidak ada indikator yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item, idx) => (
                    <tr
                      key={item.indikator.id}
                      className="hover:bg-[#FAF7F2]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-[#5C6B64]">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1C2826]">
                        {item.kategoriName}
                      </td>
                      <td className="py-3.5 px-4 text-[#5C6B64]">
                        {item.unsurName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#1C2826]">
                          {item.indikator.text}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            item.indikator.type === "HASANAH" ? "hasanah" : "sayyiah"
                          }
                          size="sm"
                        >
                          {item.indikator.tingkat || (item.indikator.type === "HASANAH" ? "Hasanah" : "Sayyi'ah")}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={
                            item.indikator.type === "HASANAH"
                              ? "text-[#1B4D3E] font-bold font-mono"
                              : "text-[#9B2C2C] font-bold font-mono"
                          }
                        >
                          {formatScore(item.indikator.defaultScore)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/admin/kategori-pelanggaran/indikator?id=${item.indikator.id}`}
                            className="p-1.5 rounded-lg text-[#5C6B64] hover:text-[#1B4D3E] hover:bg-[#E8F0EC] transition-colors"
                            title="Edit indikator"
                            aria-label={`Ubah indikator ${item.indikator.text}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.indikator.id, item.indikator.text)}
                            className="p-1.5 rounded-lg text-[#5C6B64] hover:text-[#9B2C2C] hover:bg-[#FDF2F2] transition-colors"
                            title="Hapus indikator"
                            aria-label={`Hapus indikator ${item.indikator.text}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#E5DECE] bg-[#FAF7F2]/50 text-xs text-[#5C6B64]">
            <div>
              Menampilkan <span className="font-semibold text-[#1C2826]">{filteredList.length === 0 ? 0 : startIndex + 1}</span> - <span className="font-semibold text-[#1C2826]">{endIndex}</span> dari <span className="font-semibold text-[#1C2826]">{filteredList.length}</span> data
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D4C9B5] bg-white text-[#1C2826] font-semibold hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <span className="sm:hidden px-2 font-medium text-[#1C2826]">
                {safeCurrentPage} / {totalPages}
              </span>

              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-1.5 text-[#8A968F]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      className={`min-w-[32px] h-8 px-2 rounded-lg font-semibold text-xs transition-colors ${
                        safeCurrentPage === p
                          ? "bg-[#1B4D3E] text-white shadow-xs"
                          : "border border-[#D4C9B5] bg-white text-[#1C2826] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D4C9B5] bg-white text-[#1C2826] font-semibold hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Berikutnya"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </RoleShell>
  );
}