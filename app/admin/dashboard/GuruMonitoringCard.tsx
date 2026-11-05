"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Users
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { GuruMonitoring, AbsensiRecord, PenilaianRecord, StatusGuru } from "@/lib/mock-data";
import { exportGuruReportExcel, generateGuruReportPdf, GuruReportRow } from "@/lib/guru-report-export";

interface GuruMonitoringCardProps {
  guruList: GuruMonitoring[];
  absensiList: AbsensiRecord[];
  penilaianList: PenilaianRecord[];
  setGuruStatus: (guruId: string, status: StatusGuru) => void;
}

export function GuruMonitoringCard({
  guruList,
  absensiList,
  penilaianList,
  setGuruStatus
}: GuruMonitoringCardProps) {
  const [evaluationPeriod, setEvaluationPeriod] = useState<"7_HARI" | "30_HARI">("7_HARI");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AKTIF" | "JARANG">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const periodDays = evaluationPeriod === "7_HARI" ? 7 : 30;
  const periodLabel = evaluationPeriod === "7_HARI" ? "7 Hari Terakhir (1 Minggu)" : "30 Hari Terakhir (1 Bulan)";

  const cutoffTime = useMemo(() => {
    return Date.now() - periodDays * 24 * 60 * 60 * 1000;
  }, [periodDays]);

  const guruStatsList = useMemo(() => {
    return guruList.map((g) => {
      const sholatCount = absensiList.filter((a) => {
        const matchesGuru = a.guruId === g.id || a.guruName.toLowerCase() === g.name.toLowerCase();
        if (!matchesGuru) return false;
        const time = new Date(a.date).getTime();
        return !isNaN(time) ? time >= cutoffTime : true;
      }).length;

      const adabCount = penilaianList.filter((p) => {
        const matchesGuru = p.guruId === g.id || p.guruName.toLowerCase() === g.name.toLowerCase();
        if (!matchesGuru) return false;
        const time = new Date(p.createdAt).getTime();
        return !isNaN(time) ? time >= cutoffTime : true;
      }).length;

      const totalReports = sholatCount + adabCount;
      const isAktif = totalReports > 0;
      const statusKeaktifan: "Aktif Lapor" | "Jarang Lapor" = isAktif ? "Aktif Lapor" : "Jarang Lapor";

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
      const matchSearch = !q || g.name.toLowerCase().includes(q) || g.assignedClass.toLowerCase().includes(q) || (g.asrama ? g.asrama.toLowerCase().includes(q) : false);
      const matchGender = genderFilter === "ALL" || g.gender === genderFilter;
      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "AKTIF"
          ? g.statusKeaktifan === "Aktif Lapor"
          : g.statusKeaktifan === "Jarang Lapor";

      return matchSearch && matchGender && matchStatus;
    });
  }, [guruStatsList, searchQuery, genderFilter, statusFilter]);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const totalGuru = guruStatsList.length;
  const aktifCount = guruStatsList.filter((g) => g.statusKeaktifan === "Aktif Lapor").length;
  const jarangCount = guruStatsList.filter((g) => g.statusKeaktifan === "Jarang Lapor").length;

  const prepareReportRows = (): GuruReportRow[] => {
    return filteredList.map((g, idx) => ({
      no: idx + 1,
      id: g.id,
      name: g.name,
      gender: g.gender === "Putra" ? "L" : "P",
      assignedClass: g.assignedClass,
      asrama: g.asrama || '-',
      sholatReportCount: g.sholatCount,
      adabReportCount: g.adabCount,
      totalReportCount: g.totalReports,
      lastActive: g.lastLogin,
      statusKeaktifan: g.statusKeaktifan,
      evaluasiCatatan:
        g.statusKeaktifan === "Aktif Lapor"
          ? `Disiplin melapor (${g.totalReports} input)`
          : `Perlu diingatkan pengasuhan (Nihil ${periodDays} hari)`
    }));
  };

  const handleExportExcel = () => {
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
    <Card className="p-4 sm:p-5 space-y-4 bg-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1B4D3E]" />
            <CardHeader
              title="Monitoring Keaktifan & Evaluasi Pelaporan Asatidzah"
              subtitle={`Rekapitulasi pelaporan piket sholat & adab santri dalam rentang ${periodLabel}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl p-1 bg-[#EEF2F6]">
            <button
              type="button"
              onClick={() => {
                setEvaluationPeriod("7_HARI");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                evaluationPeriod === "7_HARI"
                  ? "bg-[#1B4D3E] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Seminggu (7 Hari)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEvaluationPeriod("30_HARI");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                evaluationPeriod === "30_HARI"
                  ? "bg-[#1B4D3E] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Sebulan (30 Hari)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-bold flex items-center gap-1.5 hover:bg-[#D1FAE5] transition-colors shadow-2xs disabled:opacity-50"
              title="Unduh laporan lengkap format Microsoft Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#059669]" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/40 text-[#854D0E] text-xs font-bold flex items-center gap-1.5 hover:bg-[#FEFCE8] transition-colors shadow-2xs disabled:opacity-50"
              title="Cetak & Unduh Laporan format PDF resmi"
            >
              <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Pembina</p>
            <p className="text-lg font-black font-mono text-[#172033] mt-0.5">{totalGuru} Asatidzah</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#1B4D3E] flex items-center justify-center font-bold text-xs">
            {totalGuru}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">Aktif Melapor ({periodDays} Hari)</p>
            <p className="text-lg font-black font-mono text-[#15803D] mt-0.5">{aktifCount} Pembina</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white border border-[#BBF7D0] text-[#15803D] flex items-center justify-center font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider">Jarang Lapor ({periodDays} Hari)</p>
            <p className="text-lg font-black font-mono text-[#B91C1C] mt-0.5">{jarangCount} Pembina</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white border border-[#FECACA] text-[#B91C1C] flex items-center justify-center font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-[#B91C1C]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
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
            <option value="ALL">Semua Gender</option>
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
            <option value="ALL">Semua Keaktifan</option>
            <option value="JARANG">Jarang Lapor ({periodDays} Hari)</option>
            <option value="AKTIF">Aktif Lapor</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
              <th className="py-2.5 px-3">Nama Pembina</th>
              <th className="py-2.5 px-3">Binaan Kelas & Asrama</th>
              <th className="py-2.5 px-3 text-center">Laporan Sholat</th>
              <th className="py-2.5 px-3 text-center">Laporan Adab</th>
              <th className="py-2.5 px-3 text-center">Total ({periodDays} Hari)</th>
              <th className="py-2.5 px-3">Aktivitas Terakhir</th>
              <th className="py-2.5 px-3 text-center">Status Keaktifan</th>
              <th className="py-2.5 px-3 text-right">Ubah Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {paginatedList.map((guru) => (
              <tr key={guru.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-3 font-semibold text-[#172033]">
                  {guru.name}
                </td>
                <td className="py-3 px-3 text-[#64748B] font-mono">
                  {guru.assignedClass} • {guru.asrama}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#172033]">
                  {guru.sholatCount} kali
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#172033]">
                  {guru.adabCount} kali
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block font-black font-mono px-2 py-0.5 rounded-lg text-xs ${
                    guru.totalReports > 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#B91C1C]"
                  }`}>
                    {guru.totalReports} Laporan
                  </span>
                </td>
                <td className="py-3 px-3 text-[#64748B]">{guru.lastLogin}</td>
                <td className="py-3 px-3 text-center">
                  {guru.statusKeaktifan === "Aktif Lapor" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                      <span>Aktif Lapor</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B91C1C] bg-[#FEE2E2] border border-[#FECACA] px-2.5 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-[#B91C1C]" />
                      <span>Jarang Lapor ({periodDays} Hari)</span>
                    </span>
                  )}
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
            ))}
            {paginatedList.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-[#94A3B8]">
                  Tidak ada pembina yang sesuai dengan kriteria filter {periodLabel}
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
  );
}
