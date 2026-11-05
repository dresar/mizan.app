"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BookOpen,
  Search,
  Calendar,
  Award,
  Trash2,
  List,
  LayoutGrid,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown,
  MoreVertical,
  User,
  Sparkles
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Pagination } from "@/components/ui/Pagination";

export default function AdminTahfidzPage() {
  const { tahfidzList, deleteTahfidz, deleteTahfidzBulk, santriList } = useMizan();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    id?: string;
    ids?: string[];
    count?: number;
    isLoading?: boolean;
  }>({ isOpen: false });

  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    santri: true,
    gender: true,
    tanggal: true,
    surah: true,
    juz: true,
    predikat: true,
    penyimak: true,
    aksi: true
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const columnDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnDropdownRef.current &&
        !columnDropdownRef.current.contains(event.target as Node)
      ) {
        setIsColumnDropdownOpen(false);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const santriAvatarMap = useMemo(() => {
    const map = new Map<string, string>();
    santriList.forEach((s) => {
      if (s.avatarUrl) {
        map.set(s.id, s.avatarUrl);
        map.set(s.name.toLowerCase(), s.avatarUrl);
      }
    });
    return map;
  }, [santriList]);

  const filteredTahfidz = useMemo(() => {
    let list = tahfidzList;
    if (genderFilter !== "ALL") {
      list = list.filter((t) => t.gender === genderFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.santriName.toLowerCase().includes(q) ||
          t.surahName.toLowerCase().includes(q) ||
          String(t.juz).includes(q) ||
          (t.ustadzName && t.ustadzName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tahfidzList, genderFilter, searchQuery]);

  const totalPages = Math.ceil(filteredTahfidz.length / PAGE_SIZE) || 1;
  const paginatedTahfidz = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTahfidz.slice(start, start + PAGE_SIZE);
  }, [filteredTahfidz, currentPage]);

  const stats = useMemo(() => {
    const total = tahfidzList.length;
    const putra = tahfidzList.filter((t) => t.gender === "Putra").length;
    const putri = tahfidzList.filter((t) => t.gender === "Putri").length;
    const totalJuz = tahfidzList.reduce((acc, t) => acc + (t.juz || 0), 0);
    const avgJuz = total > 0 ? (totalJuz / total).toFixed(1) : "0";
    return { total, putra, putri, avgJuz };
  }, [tahfidzList]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const pageIds = paginatedTahfidz.map((t) => t.id);
    const isAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleOpenDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      ids: selectedIds,
      count: selectedIds.length
    });
  };

  const handleOpenDeleteSingle = (id: string) => {
    setDeleteModalState({
      isOpen: true,
      id
    });
  };

  const handleConfirmDelete = async () => {
    setDeleteModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (deleteModalState.ids && deleteModalState.ids.length > 0) {
        await deleteTahfidzBulk(deleteModalState.ids);
        setSelectedIds((prev) => prev.filter((id) => !deleteModalState.ids?.includes(id)));
        setIsBulkDeleteMode(false);
      } else if (deleteModalState.id) {
        await deleteTahfidz(deleteModalState.id);
      }
      setActiveActionMenuId(null);
      setDeleteModalState({ isOpen: false });
    } finally {
      setDeleteModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white border border-[#E2EBF4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#065F46] flex items-center justify-center border border-[#A7F3D0] shadow-2xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-serif font-black text-[#172033] tracking-tight">
                Rekapitulasi Tahfidz & Al-Qur&apos;an
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pantau setoran hafalan harian santri dan santriwati secara menyeluruh
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Total Setoran
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#172033] mt-1">
              {stats.total} <span className="text-xs font-normal text-[#94A3B8]">Setoran</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] block">
              Santri Putra (L)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#065F46] mt-1">
              {stats.putra} <span className="text-xs font-normal text-[#94A3B8]">Catatan</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8833E] block">
              Santri Putri (P)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#A8833E] mt-1">
              {stats.putri} <span className="text-xs font-normal text-[#94A3B8]">Catatan</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Rata-rata Juz
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-600 mt-1">
              Juz {stats.avgJuz}
            </div>
          </div>
        </div>

        <div className="mizan-card p-3 sm:p-4 bg-white border border-[#E2EBF4] space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#EEF2F6] p-1 rounded-xl text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kotak</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-full mizan-pill bg-white text-xs font-bold border border-[#E2E8F0]">
                {(["ALL", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGenderFilter(g);
                      setCurrentPage(1);
                    }}
                    className={`py-1 px-3 rounded-full transition-all text-center cursor-pointer ${
                      genderFilter === g
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g === "ALL" ? "Semua" : g === "Putra" ? "L" : "P"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari santri, surat, juz..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#EEF2F6] border border-transparent rounded-full text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors font-medium"
                />
              </div>

              <div className="relative shrink-0" ref={columnDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors shadow-2xs cursor-pointer"
                  title="Pilih kolom yang ditampilkan"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#A8833E]" />
                  <span>Kolom</span>
                  <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform ${isColumnDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isColumnDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white shadow-xl border border-[#E2EBF4] z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 border-b border-[#F1F5F9] text-[11px] font-bold text-[#64748B]">
                      Kolom Ditampilkan
                    </div>
                    {[
                      { key: "no", label: "No" },
                      { key: "santri", label: "Santri" },
                      { key: "gender", label: "Gender" },
                      { key: "tanggal", label: "Tanggal" },
                      { key: "surah", label: "Surah & Ayat" },
                      { key: "juz", label: "Juz" },
                      { key: "predikat", label: "Kelancaran" },
                      { key: "penyimak", label: "Penyimak" },
                      { key: "aksi", label: "Menu Aksi" }
                    ].map((col) => {
                      const isChecked = visibleColumns[col.key as keyof typeof visibleColumns];
                      return (
                        <label
                          key={col.key}
                          className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#FAF7EE] text-xs font-semibold text-[#172033] cursor-pointer"
                        >
                          <span>{col.label}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setVisibleColumns((prev) => ({
                                ...prev,
                                [col.key]: !isChecked
                              }))
                            }
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-1 py-1">
            <div className="flex items-center gap-2">
              {!isBulkDeleteMode ? (
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteMode(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E2E8F0] bg-white text-[#64748B] hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Hapus Massal</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      paginatedTahfidz.length > 0 && paginatedTahfidz.every((t) => selectedIds.includes(t.id))
                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{paginatedTahfidz.length > 0 && paginatedTahfidz.every((t) => selectedIds.includes(t.id)) ? "Batal Semua" : "Pilih Semua"}</span>
                  </button>
                  {selectedIds.length > 0 && (
                    <span className="text-xs text-[#64748B] font-medium">
                      {selectedIds.length} terpilih
                    </span>
                  )}
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleOpenDeleteBulk}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus ({selectedIds.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsBulkDeleteMode(false);
                      setSelectedIds([]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Batalkan penghapusan massal"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Batal</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="mizan-card overflow-hidden bg-white border border-[#E2EBF4]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E2EBF4] bg-[#F8FAFC] text-[#64748B] font-bold text-[10px] uppercase tracking-wider">
                      {isBulkDeleteMode && (
                        <th className="py-3 px-3.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={paginatedTahfidz.length > 0 && paginatedTahfidz.every((t) => selectedIds.includes(t.id))}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer"
                          />
                        </th>
                      )}
                      {visibleColumns.no && <th className="py-3 px-3.5 w-12 text-center">No</th>}
                      {visibleColumns.santri && <th className="py-3 px-3.5">Santri</th>}
                      {visibleColumns.gender && <th className="py-3 px-3.5 text-center">Gender</th>}
                      {visibleColumns.tanggal && <th className="py-3 px-3.5">Tanggal</th>}
                      {visibleColumns.surah && <th className="py-3 px-3.5">Surah / Ayat</th>}
                      {visibleColumns.juz && <th className="py-3 px-3.5 text-center">Juz</th>}
                      {visibleColumns.predikat && <th className="py-3 px-3.5 text-center">Kelancaran</th>}
                      {visibleColumns.penyimak && <th className="py-3 px-3.5">Penyimak</th>}
                      {visibleColumns.aksi && <th className="py-3 px-3.5 text-center w-20">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EBF4]">
                    {paginatedTahfidz.map((t, idx) => {
                      const rowNumber = (currentPage - 1) * PAGE_SIZE + idx + 1;
                      const avatarUrl = santriAvatarMap.get(t.santriId) || santriAvatarMap.get(t.santriName.toLowerCase()) || (t.gender === "Putri" ? "/default-avatar-santriwati.jpg" : "/default-avatar-santri.jpg");

                      return (
                        <tr key={t.id} className="hover:bg-[#FAF7EE]/60 transition-colors group">
                          {isBulkDeleteMode && (
                            <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(t.id)}
                                onChange={() => toggleSelect(t.id)}
                                className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer"
                              />
                            </td>
                          )}
                          {visibleColumns.no && (
                            <td className="py-3.5 px-3.5 text-center font-mono font-bold text-[#64748B]">
                              {rowNumber}
                            </td>
                          )}
                          {visibleColumns.santri && (
                            <td className="py-3.5 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#FAF7EE] border border-[#E2E8F0] shrink-0">
                                  <img
                                    src={avatarUrl}
                                    alt={t.santriName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = t.gender === "Putri" ? "/default-avatar-santriwati.jpg" : "/default-avatar-santri.jpg";
                                    }}
                                  />
                                </div>
                                <span className="font-bold text-[#172033] block">
                                  {t.santriName}
                                </span>
                              </div>
                            </td>
                          )}
                          {visibleColumns.gender && (
                            <td className="py-3.5 px-3.5 text-center">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  t.gender === "Putra"
                                    ? "bg-[#ECFDF5] text-[#065F46]"
                                    : "bg-[#FAF7EE] text-[#A8833E]"
                                }`}
                              >
                                {t.gender === "Putra" ? "L" : "P"}
                              </span>
                            </td>
                          )}
                          {visibleColumns.tanggal && (
                            <td className="py-3.5 px-3.5 text-[#64748B] font-mono text-[11px] whitespace-nowrap">
                              {t.date}
                            </td>
                          )}
                          {visibleColumns.surah && (
                            <td className="py-3.5 px-3.5">
                              <span className="font-bold text-[#172033] block">
                                {t.surahName}
                              </span>
                              <span className="text-[10px] text-[#64748B]">
                                Ayat {t.ayatStart} - {t.ayatEnd}
                              </span>
                              {t.catatanUstadz && (
                                <span className="text-[10px] text-[#A8833E] block italic line-clamp-1 mt-0.5">
                                  {t.catatanUstadz}
                                </span>
                              )}
                            </td>
                          )}
                          {visibleColumns.juz && (
                            <td className="py-3.5 px-3.5 text-center font-mono font-bold text-[#172033]">
                              Juz {t.juz}
                            </td>
                          )}
                          {visibleColumns.predikat && (
                            <td className="py-3.5 px-3.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                                {t.predikat}
                              </span>
                            </td>
                          )}
                          {visibleColumns.penyimak && (
                            <td className="py-3.5 px-3.5 text-[#64748B] text-[11px]">
                              {t.ustadzName || "-"}
                            </td>
                          )}
                          {visibleColumns.aksi && (
                            <td className="py-3.5 px-3.5 text-center relative">
                              <div className="relative inline-block text-left" ref={actionMenuRef}>
                                <button
                                  type="button"
                                  onClick={() => setActiveActionMenuId(activeActionMenuId === t.id ? null : t.id)}
                                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#EEF2F6] transition-colors cursor-pointer"
                                  title="Opsi Aksi"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {activeActionMenuId === t.id && (
                                  <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white shadow-xl border border-[#E2EBF4] z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        handleOpenDeleteSingle(t.id);
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Hapus</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {paginatedTahfidz.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-xs text-[#94A3B8]">
                          Belum ada catatan setoran tahfidz yang sesuai dengan filter pencarian
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
              {paginatedTahfidz.map((t) => {
                const avatarUrl = santriAvatarMap.get(t.santriId) || santriAvatarMap.get(t.santriName.toLowerCase()) || (t.gender === "Putri" ? "/default-avatar-santriwati.jpg" : "/default-avatar-santri.jpg");

                return (
                  <div
                    key={t.id}
                    className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E2EBF4] shadow-2xs hover:shadow-2xl hover:border-[#1B4D3E]/40 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between text-left"
                  >
                    <div className="sheen-wrapper relative w-full aspect-square overflow-hidden bg-[#0E271F] shrink-0">
                      {isBulkDeleteMode && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 left-2 z-10 p-1.5 rounded-xl bg-white/90 backdrop-blur-xs border border-white/60 shadow-xs animate-in fade-in zoom-in-95 duration-150"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(t.id)}
                            onChange={() => toggleSelect(t.id)}
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer"
                          />
                        </div>
                      )}
                      <img
                        src={avatarUrl}
                        alt={t.santriName}
                        onError={(e) => {
                          e.currentTarget.src = t.gender === "Putri" ? "/default-avatar-santriwati.jpg" : "/default-avatar-santri.jpg";
                        }}
                        className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
                    </div>

                    <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 bg-white space-y-2.5">
                      <div className="space-y-1 sm:space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono font-black bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20">
                            Juz {t.juz}
                          </span>
                          <span
                            className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[10px] font-bold border shrink-0 ${
                              t.gender === "Putra"
                                ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                                : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                            }`}
                          >
                            {t.gender === "Putra" ? "L" : "P"}
                          </span>
                        </div>

                        <h3 className="font-serif font-black text-xs sm:text-sm text-[#172033] line-clamp-1 group-hover:text-[#1B4D3E] transition-colors">
                          {t.santriName}
                        </h3>

                        <div className="p-2 rounded-xl bg-[#FAF7EE]/60 border border-[#E2E8F0] space-y-0.5 text-[11px]">
                          <div className="font-bold text-[#172033] truncate">
                            {t.surahName}
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            Ayat {t.ayatStart} - {t.ayatEnd}
                          </div>
                          {t.catatanUstadz && (
                            <p className="text-[9px] text-[#A8833E] italic truncate">
                              {t.catatanUstadz}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                          {t.predikat}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteSingle(t.id)}
                          className="p-1 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredTahfidz.length}
            itemsPerPage={PAGE_SIZE}
            itemName="catatan tahfidz"
          />
        </div>

        <DeleteModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false })}
          onConfirm={handleConfirmDelete}
          title="Hapus Catatan Tahfidz"
          message={
            deleteModalState.ids && deleteModalState.ids.length > 0
              ? `Apakah Anda yakin ingin menghapus ${deleteModalState.ids.length} catatan tahfidz terpilih? Tindakan ini tidak dapat dibatalkan.`
              : "Apakah Anda yakin ingin menghapus catatan tahfidz ini? Tindakan ini tidak dapat dibatalkan."
          }
          isLoading={deleteModalState.isLoading}
        />
      </div>
    </RoleShell>
  );
}