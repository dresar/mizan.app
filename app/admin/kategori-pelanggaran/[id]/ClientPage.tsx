"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Layers,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { INITIAL_CATEGORIES } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Tingkat, IndikatorType } from "@/lib/mock-data";

function CategoryDetailContent() {
  const params = useParams();
  const [urlId, setUrlId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && id !== "detail") {
        setUrlId(id);
      }
    }
  }, []);

  const rawId = urlId || (params?.id as string) || "";
  const categoryId = decodeURIComponent(rawId);

  const { categories, deleteIndikatorItem, showToast } = useMizan();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | IndikatorType>("ALL");
  const [tingkatFilter, setTingkatFilter] = useState<"ALL" | Tingkat>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; indId?: string; indText?: string }>({ isOpen: false });
  const UNSURS_PER_PAGE = 10;

  const effectiveCategories = useMemo(() => {
    return categories && categories.length > 0 ? categories : INITIAL_CATEGORIES;
  }, [categories]);

  const currentCategory = useMemo(() => {
    return (
      effectiveCategories.find(
        (c) =>
          c.code.toLowerCase() === categoryId.toLowerCase() ||
          c.name.toLowerCase() === categoryId.toLowerCase()
      ) || null
    );
  }, [effectiveCategories, categoryId]);

  const categoryStats = useMemo(() => {
    if (!currentCategory) {
      return { totalUnsurs: 0, totalIndicators: 0, hasanahCount: 0, sayyiahCount: 0 };
    }

    const totalUnsurs = currentCategory.unsurs.length;
    let totalIndicators = 0;
    let hasanahCount = 0;
    let sayyiahCount = 0;

    currentCategory.unsurs.forEach((u) => {
      u.indicators.forEach((ind) => {
        totalIndicators++;
        if (ind.type === "HASANAH") {
          hasanahCount++;
        } else {
          sayyiahCount++;
        }
      });
    });

    return { totalUnsurs, totalIndicators, hasanahCount, sayyiahCount };
  }, [currentCategory]);

  const filteredUnsurs = useMemo(() => {
    if (!currentCategory) return [];

    const q = searchQuery.toLowerCase().trim();

    return currentCategory.unsurs
      .map((unsur) => {
        const matchingIndicators = unsur.indicators.filter((ind) => {
          const matchType = typeFilter === "ALL" || ind.type === typeFilter;
          const matchTingkat = tingkatFilter === "ALL" || ind.tingkat === tingkatFilter;
          const matchQuery =
            q === "" ||
            unsur.name.toLowerCase().includes(q) ||
            ind.text.toLowerCase().includes(q);
          return matchType && matchTingkat && matchQuery;
        });

        return {
          ...unsur,
          matchingIndicators
        };
      })
      .filter((unsur) => {
        if (q === "" && typeFilter === "ALL" && tingkatFilter === "ALL") {
          return true;
        }
        return unsur.matchingIndicators.length > 0;
      });
  }, [currentCategory, searchQuery, typeFilter, tingkatFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUnsurs.length / UNSURS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * UNSURS_PER_PAGE;
  const paginatedUnsurs = filteredUnsurs.slice(startIndex, startIndex + UNSURS_PER_PAGE);

  const handleDeleteIndicator = (indId: string, indText: string) => {
    setDeleteModalState({ isOpen: true, indId, indText });
  };

  const handleConfirmDeleteIndicator = () => {
    if (!deleteModalState.indId) return;
    deleteIndikatorItem(deleteModalState.indId);
    showToast("Indikator berhasil dihapus");
    setDeleteModalState({ isOpen: false });
  };

  const formatScore = (score: number) => {
    const formatted = Math.abs(score).toFixed(3);
    return score > 0 ? `+${formatted}` : `-${formatted}`;
  };

  if (!currentCategory) {
    return (
      <RoleShell>
        <div className="w-full space-y-4 py-12 text-center">
          <h2 className="text-xl font-bold text-[#172033]">Kategori Tidak Ditemukan</h2>
          <p className="text-xs text-[#64748B]">
            Kategori dengan kode atau nama &quot;{categoryId}&quot; tidak terdaftar di sistem.
          </p>
          <div className="pt-4">
            <Link
              href="/admin/kategori-pelanggaran"
              className="px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Master Kategori</span>
            </Link>
          </div>
        </div>
      </RoleShell>
    );
  }

  return (
    <RoleShell>
      <div className="w-full space-y-4 pb-36">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/kategori-pelanggaran"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#1B4D3E] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#1B4D3E] text-white font-mono font-black text-xs flex items-center justify-center">
              {currentCategory.code}
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              {currentCategory.name}
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Rincian seluruh unsur penilaian dan daftar indikator perilaku santri dalam kategori ini
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={`/admin/kategori-pelanggaran/unsur`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>Unsur</span>
          </Link>

          <Link
            href={`/admin/kategori-pelanggaran/indikator`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-xs"
          >
            <span>Indikator</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
            Unsur Penilaian
          </span>
          <div className="text-xl font-black font-mono text-[#172033] mt-0.5">
            {categoryStats.totalUnsurs} <span className="text-xs font-normal text-[#94A3B8]">Unsur</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D3E] block">
            Total Indikator
          </span>
          <div className="text-xl font-black font-mono text-[#1B4D3E] mt-0.5">
            {categoryStats.totalIndicators} <span className="text-xs font-normal text-[#94A3B8]">Indikator</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] block">
            Indikator Hasanah
          </span>
          <div className="text-xl font-black font-mono text-[#065F46] mt-0.5">
            {categoryStats.hasanahCount} <span className="text-xs font-normal text-[#065F46]/70">Prestasi</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
            Indikator Sayyi&apos;ah
          </span>
          <div className="text-xl font-black font-mono text-red-600 mt-0.5">
            {categoryStats.sayyiahCount} <span className="text-xs font-normal text-red-600/70">Pelanggaran</span>
          </div>
        </div>
      </div>

      <Card className="p-3 sm:p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari unsur atau indikator..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
            />
          </div>

          <div>
            <select
              aria-label="Filter jenis penilaian"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as "ALL" | IndikatorType);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs font-bold bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
            >
              <option value="ALL">Semua Jenis (Hasanah & Sayyi&apos;ah)</option>
              <option value="HASANAH">Hasanah (Prestasi)</option>
              <option value="SAYYIAH">Sayyi&apos;ah (Pelanggaran)</option>
            </select>
          </div>

          <div>
            <select
              aria-label="Filter tingkat kejadian"
              value={tingkatFilter}
              onChange={(e) => {
                setTingkatFilter(e.target.value as "ALL" | Tingkat);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs font-bold bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
            >
              <option value="ALL">Semua Tingkat (Ringan / Sedang / Berat)</option>
              <option value="Ringan">Tingkat Ringan</option>
              <option value="Sedang">Tingkat Sedang</option>
              <option value="Berat">Tingkat Berat</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {paginatedUnsurs.map((unsur) => {
          const indicatorsToShow = unsur.matchingIndicators || unsur.indicators;

          return (
            <Card key={unsur.id} className="p-4 sm:p-5 bg-white space-y-3 border border-[#E2EBF4]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF2F6] text-[#1B4D3E] flex items-center justify-center font-bold text-xs shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#172033]">
                      {unsur.name}
                    </h2>
                    <span className="text-[10px] text-[#64748B]">
                      Tercatat {unsur.indicators.length} indikator di bawah unsur ini
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    href={`/admin/kategori-pelanggaran/indikator`}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-[#EEF2F6] text-[#172033] hover:bg-[#E2E8F0] transition-colors inline-flex items-center gap-1"
                  >
                    <span>Indikator</span>
                  </Link>
                </div>
              </div>

              {indicatorsToShow.length > 0 ? (
                <div className="divide-y divide-[#F1F5F9]">
                  {indicatorsToShow.map((ind) => {
                    return (
                      <div
                        key={ind.id}
                        className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF7EE]/50 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#172033]">
                            {ind.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ind.type === "HASANAH"
                                ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {ind.type === "HASANAH" ? "Hasanah" : "Sayyi'ah"}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                            {ind.tingkat || "Sedang"}
                          </span>

                          <span
                            className={`text-xs font-mono font-bold w-16 text-right ${
                              ind.defaultScore > 0 ? "text-[#065F46]" : "text-red-600"
                            }`}
                          >
                            {formatScore(ind.defaultScore)}
                          </span>

                          <div className="flex items-center gap-1 pl-2 border-l border-[#E2E8F0]">
                            <Link
                              href={`/admin/kategori-pelanggaran/indikator?id=${ind.id}`}
                              className="p-1 rounded-lg hover:bg-[#EEF2F6] text-[#64748B] hover:text-[#172033] transition-colors"
                              title="Edit Indikator"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteIndicator(ind.id, ind.text)}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                              title="Hapus Indikator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-[#94A3B8]">
                  Tidak ada indikator yang sesuai dengan filter
                </div>
              )}
            </Card>
          );
        })}

        {filteredUnsurs.length === 0 && (
          <div className="py-12 text-center text-xs text-[#94A3B8] bg-white rounded-2xl border border-[#E2EBF4]">
            Tidak ada unsur yang sesuai dengan kata kunci pencarian
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#64748B]">
              Halaman {safePage} dari {totalPages} ({filteredUnsurs.length} Unsur)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] disabled:opacity-40 hover:bg-[#FAF7EE] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] disabled:opacity-40 hover:bg-[#FAF7EE] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    <DeleteModal
      isOpen={deleteModalState.isOpen}
      onClose={() => setDeleteModalState({ isOpen: false })}
      onConfirm={handleConfirmDeleteIndicator}
      title="Hapus Indikator"
      message={deleteModalState.indText ? `Hapus indikator "${deleteModalState.indText}"?` : undefined}
    />
  </RoleShell>
);
}

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Memuat data kategori...</div>}>
      <CategoryDetailContent />
    </Suspense>
  );
}
