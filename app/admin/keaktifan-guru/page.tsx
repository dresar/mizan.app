"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Calendar,
  Users,
  ArrowLeft,
  Clock,
  Download,
  ChevronDown,
  X,
  RotateCcw
} from "lucide-react";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { useMizan } from "@/lib/mizan-context";
import { StatusGuru } from "@/lib/mock-data";
import { exportGuruReportExcel, generateGuruReportPdf, GuruReportRow } from "@/lib/guru-report-export";

function cleanGuruName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^(ust\.|usth\.|ustadz\.|ustadzah\.|ustadz|ustadzah|dr\.|drs\.|h\.|hj\.)\s+/gi, "")
    .replace(/,\s*(s\.pd(\.i)?|m\.pd(\.i)?|lc|gr|s\.ag|m\.ag).*$/gi, "")
    .trim();
}

export default function AdminKeaktifanGuruPage() {
  const { guruList, absensiList, penilaianList, setGuruStatus } = useMizan();

  const [evaluationPeriod, setEvaluationPeriod] = useState<"7_HARI" | "30_HARI">("7_HARI");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AKTIF" | "BELUM">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 15;

  const periodDays = evaluationPeriod === "7_HARI" ? 7 : 30;
  const periodLabel = evaluationPeriod === "7_HARI" ? "7 Hari (Seminggu)" : "30 Hari (Sebulan)";

  const cutoffTime = useMemo(() => {
    return Date.now() - periodDays * 24 * 60 * 60 * 1000;
  }, [periodDays]);

  const guruStatsList = useMemo(() => {
    return guruList.map((g) => {
      const gClean = cleanGuruName(g.name);

      const sholatCount = absensiList.filter((a) => {
        const idMatch = a.guruId === g.id || a.guruId.endsWith(g.id) || g.id.endsWith(a.guruId);
        let match = idMatch;
        if (!match) {
          const aClean = cleanGuruName(a.guruName);
          match = Boolean(aClean && gClean && (aClean === gClean || aClean.includes(gClean) || gClean.includes(aClean)));
        }
        if (!match) return false;
        const time = new Date(a.date).getTime();
        return !isNaN(time) ? time >= cutoffTime : true;
      }).length;

      const adabCount = penilaianList.filter((p) => {
        const idMatch = p.guruId === g.id || p.guruId.endsWith(g.id) || g.id.endsWith(p.guruId);
        let match = idMatch;
        if (!match) {
          const pClean = cleanGuruName(p.guruName);
          match = Boolean(pClean && gClean && (pClean === gClean || pClean.includes(gClean) || gClean.includes(pClean)));
        }
        if (!match) return false;
        const time = new Date(p.createdAt).getTime();
        return !isNaN(time) ? time >= cutoffTime : true;
      }).length;

      const totalReports = sholatCount + adabCount;
      const isAktif = totalReports > 0;
      const statusKeaktifan: "Aktif Melapor" | "Belum Melapor" = isAktif ? "Aktif Melapor" : "Belum Melapor";

      return {
        ...g,
        sholatCount,
        adabCount,
        totalReports,
        statusKeaktifan
      };
    });
  }, [guruList, absensiList, penilaianList, cutoffTime]);

  const filteredList = useMemo(() => {
    return guruStatsList.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.assignedClass.toLowerCase().includes(q) ||
        (g.asrama ? g.asrama.toLowerCase().includes(q) : false);
      const matchGender = genderFilter === "ALL" || g.gender === genderFilter;
      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "AKTIF"
          ? g.statusKeaktifan === "Aktif Melapor"
          : g.statusKeaktifan === "Belum Melapor";

      return matchSearch && matchGender && matchStatus;
    });
  }, [guruStatsList, searchQuery, genderFilter, statusFilter]);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const totalGuru = guruStatsList.length;
  const aktifCount = guruStatsList.filter((g) => g.statusKeaktifan === "Aktif Melapor").length;
  const belumCount = guruStatsList.filter((g) => g.statusKeaktifan === "Belum Melapor").length;

  const hasActiveFilters = searchQuery !== "" || genderFilter !== "ALL" || statusFilter !== "ALL" || evaluationPeriod !== "7_HARI";

  const resetFilters = () => {
    setSearchQuery("");
    setGenderFilter("ALL");
    setStatusFilter("ALL");
    setEvaluationPeriod("7_HARI");
    setCurrentPage(1);
  };

  const prepareReportRows = (): GuruReportRow[] => {
    return filteredList.map((g, idx) => ({
      no: idx + 1,
      id: g.id,
      name: g.name,
      gender: g.gender === "Putra" ? "L" : "P",
      assignedClass: g.assignedClass,
      asrama: g.asrama || "-",
      sholatReportCount: g.sholatCount,
      adabReportCount: g.adabCount,
      totalReportCount: g.totalReports,
      lastActive: g.lastLogin,
      statusKeaktifan: g.statusKeaktifan as any,
      evaluasiCatatan:
        g.statusKeaktifan === "Aktif Melapor"
          ? `Disiplin melapor (${g.totalReports} input)`
          : `Belum melapor (${periodDays} hari)`
    }));
  };

  const handleExportExcel = () => {
    setIsExportDropdownOpen(false);
    setIsExporting(true);
    try {
      const rows = prepareReportRows();
      exportGuruReportExcel(rows, periodLabel);
    } catch {
      void 0;
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportDropdownOpen(false);
    setIsExporting(true);
    try {
      const rows = prepareReportRows();
      await generateGuruReportPdf(rows, periodLabel);
    } catch {
      void 0;
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-3.5 overflow-x-hidden pb-36">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/admin/dashboard"
              className="w-8 h-8 rounded-xl bg-white border border-[#E2EBF4] text-[#172033] flex items-center justify-center hover:bg-[#FAF7EE] transition-colors shadow-2xs shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight truncate">
                Keaktifan Pembina
              </h1>
              <p className="text-[11px] text-[#64748B] truncate">
                Piket & adab
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsPeriodDropdownOpen(!isPeriodDropdownOpen);
                  setIsExportDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-[#172033] text-xs font-bold hover:bg-[#F8FAFC] transition-colors shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>{evaluationPeriod === "7_HARI" ? "7 Hari" : "30 Hari"}</span>
                <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform duration-200 ${isPeriodDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isPeriodDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPeriodDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-40 rounded-2xl bg-white border border-[#E2EBF4] shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEvaluationPeriod("7_HARI");
                        setCurrentPage(1);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        evaluationPeriod === "7_HARI"
                          ? "bg-[#FAF7EE] text-[#1B4D3E] font-bold"
                          : "text-[#172033] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <span>Seminggu (7 Hari)</span>
                      {evaluationPeriod === "7_HARI" && <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E]"></span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEvaluationPeriod("30_HARI");
                        setCurrentPage(1);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        evaluationPeriod === "30_HARI"
                          ? "bg-[#FAF7EE] text-[#1B4D3E] font-bold"
                          : "text-[#172033] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <span>Sebulan (30 Hari)</span>
                      {evaluationPeriod === "30_HARI" && <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E]"></span>}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsExportDropdownOpen(!isExportDropdownOpen);
                  setIsPeriodDropdownOpen(false);
                }}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/40 text-[#854D0E] text-xs font-bold hover:bg-[#FEFCE8] transition-colors shadow-2xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Ekspor</span>
                <ChevronDown className={`w-3 h-3 text-[#C5A059] transition-transform duration-200 ${isExportDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isExportDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExportDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white border border-[#E2EBF4] shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#065F46] hover:bg-[#ECFDF5] flex items-center gap-2.5 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Unduh Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#854D0E] hover:bg-[#FAF7EE] flex items-center gap-2.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Cetak PDF (.pdf)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          <CardSub className="p-3 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total</p>
              <p className="text-lg sm:text-2xl font-black font-mono text-[#172033] mt-0.5">{totalGuru}</p>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#E2E8F0] text-[#1B4D3E] flex items-center justify-center font-bold text-xs shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1B4D3E]" />
            </div>
          </CardSub>

          <CardSub className="p-3 sm:p-4 bg-[#F0FDF4] border-[#BBF7D0] flex items-center justify-between">
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-[#15803D] uppercase tracking-wider">Aktif</p>
              <p className="text-lg sm:text-2xl font-black font-mono text-[#15803D] mt-0.5">{aktifCount}</p>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#BBF7D0] text-[#15803D] flex items-center justify-center font-bold text-xs shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#15803D]" />
            </div>
          </CardSub>

          <CardSub className="p-3 sm:p-4 bg-[#FEF2F2] border-[#FECACA] flex items-center justify-between">
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider">Belum</p>
              <p className="text-lg sm:text-2xl font-black font-mono text-[#B91C1C] mt-0.5">{belumCount}</p>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#FECACA] text-[#B91C1C] flex items-center justify-center font-bold text-xs shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B91C1C]" />
            </div>
          </CardSub>
        </div>

        <Card className="p-4 sm:p-5 space-y-3.5 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Cari pembina, kelas, asrama..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <select
                aria-label="Filter Gender Pembina"
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl font-bold text-[#172033] focus:outline-none"
              >
                <option value="ALL">Semua</option>
                <option value="Putra">L</option>
                <option value="Putri">P</option>
              </select>

              <select
                aria-label="Filter Keaktifan Laporan"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl font-bold text-[#172033] focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Aktif Melapor</option>
                <option value="BELUM">Belum Melapor</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl px-3 py-1.5 flex-wrap gap-1.5">
            <div className="flex items-center gap-2 flex-wrap text-[#64748B]">
              <span className="font-bold text-[#172033]">Filter Aktif:</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#CBD5E1] text-[#172033] font-mono text-[10px] font-semibold">
                Periode: {evaluationPeriod === "7_HARI" ? "7 Hari" : "30 Hari"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#CBD5E1] text-[#172033] text-[10px] font-semibold">
                Gender: {genderFilter === "ALL" ? "Semua" : genderFilter === "Putra" ? "L" : "P"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#CBD5E1] text-[#172033] text-[10px] font-semibold">
                Status: {statusFilter === "ALL" ? "Semua" : statusFilter === "AKTIF" ? "Aktif" : "Belum"}
              </span>
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#CBD5E1] text-[#1B4D3E] text-[10px] font-semibold truncate max-w-[150px]">
                  Cari: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-bold text-[#B91C1C] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                  <th className="py-2.5 px-3 text-center w-12">No</th>
                  <th className="py-2.5 px-3">Nama Pembina</th>
                  <th className="py-2.5 px-3">Binaan & Asrama</th>
                  <th className="py-2.5 px-3 text-center">Sholat</th>
                  <th className="py-2.5 px-3 text-center">Adab</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-center w-16">Status</th>
                  <th className="py-2.5 px-3 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginatedList.map((guru, idx) => {
                  const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                  const isTooltipOpen = activeTooltipId === guru.id;

                  return (
                    <tr key={guru.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-[#64748B] text-xs font-semibold">
                        {itemNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#172033]">
                        {guru.name}
                      </td>
                      <td className="py-3 px-3 text-[#64748B] font-mono">
                        {guru.assignedClass} • {guru.asrama}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#172033] font-mono">
                        {guru.sholatCount}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#172033] font-mono">
                        {guru.adabCount}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block font-black font-mono px-2 py-0.5 rounded-lg text-xs ${
                            guru.totalReports > 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {guru.totalReports}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center relative">
                        <div
                          className="inline-block relative group"
                          onClick={() => setActiveTooltipId(isTooltipOpen ? null : guru.id)}
                        >
                          {guru.statusKeaktifan === "Aktif Melapor" ? (
                            <div
                              className="w-7 h-7 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] flex items-center justify-center mx-auto cursor-pointer shadow-2xs hover:scale-110 transition-transform"
                              title={`Aktif Melapor (${guru.totalReports} laporan)`}
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                            </div>
                          ) : (
                            <div
                              className="w-7 h-7 rounded-full bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] flex items-center justify-center mx-auto cursor-pointer shadow-2xs hover:scale-110 transition-transform"
                              title={`Belum Melapor (${periodDays} Hari)`}
                            >
                              <Clock className="w-4 h-4 text-[#B91C1C]" />
                            </div>
                          )}

                          <div
                            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-lg bg-[#172033] text-white text-[10px] font-bold whitespace-nowrap shadow-md z-30 pointer-events-none transition-all duration-150 ${
                              isTooltipOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                            }`}
                          >
                            {guru.statusKeaktifan === "Aktif Melapor"
                              ? `Aktif (${guru.totalReports} laporan)`
                              : `Belum Melapor (${periodDays} hari)`}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#172033]" />
                          </div>
                        </div>
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
                  );
                })}
                {paginatedList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#94A3B8]">
                      Tidak ada data pembina yang sesuai dengan kriteria filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredList.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemName="pembina"
          />
        </Card>
      </div>
    </RoleShell>
  );
}
