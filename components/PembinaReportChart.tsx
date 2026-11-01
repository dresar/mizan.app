"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  PieChart,
  List,
  CheckCircle2,
  UserX,
  Users,
  Copy,
  Check,
  Target,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { GuruMonitoring } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";

interface PembinaReportChartProps {
  guruList: GuruMonitoring[];
  initialTimeframe?: "HARIAN" | "MINGGUAN" | "BULANAN";
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function PembinaReportChart({
  guruList,
  initialTimeframe = "HARIAN",
  title = "Analisis & Diagram Keaktifan Laporan Pembina",
  subtitle = "Monitoring keaktifan pembina menginput catatan sikap santri harian, mingguan, dan bulanan",
  compact = false
}: PembinaReportChartProps) {
  const [reportTimeframe, setReportTimeframe] = useState<"HARIAN" | "MINGGUAN" | "BULANAN">(initialTimeframe);
  const [viewMode, setViewMode] = useState<"BAR" | "DONUT" | "LIST">("BAR");
  const [filterRareOnly, setFilterRareOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const teacherAnalytics = useMemo(() => {
    return guruList.map((guru) => {
      let count = guru.reportCountToday;
      let target = 5;

      if (reportTimeframe === "MINGGUAN") {
        count = guru.reportCountToday * 6 + (guru.id === "guru-1" ? 18 : guru.id === "guru-4" ? 14 : 2);
        target = 30;
      } else if (reportTimeframe === "BULANAN") {
        count = guru.reportCountToday * 24 + (guru.id === "guru-1" ? 68 : guru.id === "guru-4" ? 54 : 8);
        target = 120;
      }

      const percentage = Math.min(100, Math.round((count / target) * 100));
      const isRare = count <= (reportTimeframe === "HARIAN" ? 0 : reportTimeframe === "MINGGUAN" ? 5 : 20);

      return {
        ...guru,
        periodCount: count,
        target,
        percentage,
        isRare
      };
    });
  }, [guruList, reportTimeframe]);

  const teachersNeedingReminder = useMemo(() => {
    return teacherAnalytics.filter((t) => t.isRare);
  }, [teacherAnalytics]);

  const activeTeachers = useMemo(() => {
    return teacherAnalytics.filter((t) => !t.isRare);
  }, [teacherAnalytics]);

  const displayedTeachers = useMemo(() => {
    let list = teacherAnalytics;
    if (filterRareOnly) {
      list = teachersNeedingReminder;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.assignedClass.toLowerCase().includes(q));
    }
    return list;
  }, [teacherAnalytics, teachersNeedingReminder, filterRareOnly, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(displayedTeachers.length / itemsPerPage));

  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedTeachers.slice(start, start + itemsPerPage);
  }, [displayedTeachers, currentPage, itemsPerPage]);

  const targetValue = useMemo(() => {
    if (reportTimeframe === "MINGGUAN") return 30;
    if (reportTimeframe === "BULANAN") return 120;
    return 5;
  }, [reportTimeframe]);

  const maxChartValue = useMemo(() => {
    const highest = Math.max(...teacherAnalytics.map((t) => t.periodCount), targetValue);
    return Math.max(highest * 1.15, 6);
  }, [teacherAnalytics, targetValue]);

  const compliancePercentage = useMemo(() => {
    if (teacherAnalytics.length === 0) return 0;
    return Math.round((activeTeachers.length / teacherAnalytics.length) * 100);
  }, [teacherAnalytics, activeTeachers]);

  const handleCopyReminder = () => {
    const names = teachersNeedingReminder.map((t) => t.name).join("\n- ");
    const text = `Assalamu'alaikum Wr. Wb.\n\nPengingat Laporan Pembina (${reportTimeframe.toLowerCase()}):\nBerikut asatidzah/pembina yang belum rutin melakukan input laporan pembinaan santri:\n- ${names}\n\nMohon untuk segera melengkapi input laporan pada sistem Mizan. Jazakumullah khairan.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const donutRadius = 42;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const activeStrokeLength = (compliancePercentage / 100) * donutCircumference;

  return (
    <Card className="p-4 sm:p-5 space-y-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#1B4D3E]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
              {title}
            </h2>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl p-1 bg-[#EEF2F6]">
            {(["HARIAN", "MINGGUAN", "BULANAN"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => {
                  setReportTimeframe(period);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  reportTimeframe === period
                    ? "bg-white text-[#1B4D3E] shadow-xs"
                    : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-xl p-1 bg-[#EEF2F6]">
            <button
              type="button"
              onClick={() => setViewMode("BAR")}
              title="Diagram Batang"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "BAR"
                  ? "bg-white text-[#1B4D3E] shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("DONUT")}
              title="Distribusi Rasio"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "DONUT"
                  ? "bg-white text-[#1B4D3E] shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              title="Daftar Rinci"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "LIST"
                  ? "bg-white text-[#1B4D3E] shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] font-bold block uppercase tracking-wider">Total Pembina</span>
            <span className="text-xl font-black font-mono text-[#172033] block mt-0.5">{teacherAnalytics.length}</span>
          </div>
          <div className="w-8 h-8 rounded-xl mizan-inset text-[#1B4D3E] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#065F46] font-bold block uppercase tracking-wider">Aktif Melapor</span>
            <span className="text-xl font-black font-mono text-[#065F46] block mt-0.5">
              {activeTeachers.length} <span className="text-xs font-normal text-[#64748B]">({compliancePercentage}%)</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl mizan-inset text-[#065F46] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => {
            setFilterRareOnly(!filterRareOnly);
            setCurrentPage(1);
          }}
          className={`p-3 rounded-2xl mizan-card-sub flex items-center justify-between cursor-pointer transition-all ${
            filterRareOnly ? "ring-2 ring-red-500 bg-red-50/50" : ""
          }`}
        >
          <div>
            <span className="text-[10px] text-red-700 font-bold block uppercase tracking-wider">Jarang Lapor</span>
            <span className="text-xl font-black font-mono text-red-600 block mt-0.5">
              {teachersNeedingReminder.length} <span className="text-xs font-normal text-[#64748B]">({100 - compliancePercentage}%)</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl mizan-inset text-red-600 flex items-center justify-center">
            <UserX className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl mizan-card-sub flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#A8833E] font-bold block uppercase tracking-wider">Target Laporan</span>
            <span className="text-xl font-black font-mono text-[#A8833E] block mt-0.5">
              {targetValue} <span className="text-xs font-normal text-[#64748B]">/ periode</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl mizan-inset text-[#A8833E] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
      </div>

      {teachersNeedingReminder.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <UserX className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-800">
                Perhatian: {teachersNeedingReminder.length} Pembina Jarang Lapor ({reportTimeframe.toLowerCase()})
              </p>
              <p className="text-[11px] text-red-700 mt-0.5">
                Pembina berikut belum rutin melakukan input laporan:{" "}
                <span className="font-semibold">
                  {teachersNeedingReminder.map((t) => t.name).join(", ")}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyReminder}
              className="px-3 py-1.5 rounded-xl bg-white text-red-700 border border-red-300 text-[11px] font-bold hover:bg-red-50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#065F46]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin" : "Salin Pengingat"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterRareOnly(!filterRareOnly);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                filterRareOnly
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              {filterRareOnly ? "Tampilkan Semua" : "Saring Jarang"}
            </button>
          </div>
        </div>
      )}

      {viewMode === "BAR" && (
        <div className="p-4 rounded-2xl mizan-card-sub space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#EEF2F6]">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Cari pembina / kelas..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-2.5 py-1 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <select
                aria-label="Tampilkan per halaman"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl font-bold text-[#172033] focus:outline-none"
              >
                <option value={5}>5 / hal</option>
                <option value={10}>10 / hal</option>
                <option value={20}>20 / hal</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-bold text-[#64748B]">
              <span>Hal. {currentPage} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded-lg border border-[#E2EBF4] hover:bg-[#EEF2F6] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-lg border border-[#E2EBF4] hover:bg-[#EEF2F6] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B4D3E]"></span>
                <span>Aktif Melapor</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Jarang Lapor (0 Input)</span>
              </span>
            </div>
            <span className="flex items-center gap-1 text-[#A8833E]">
              <span className="w-3 border-t-2 border-dashed border-[#A8833E]"></span>
              <span>Garis Target ({targetValue})</span>
            </span>
          </div>

          <div className="relative pt-6 pb-2">
            <div
              className="absolute left-0 right-0 border-b border-dashed border-[#A8833E] z-10 pointer-events-none flex items-center justify-end pr-1"
              style={{
                bottom: `${Math.min(92, Math.max(12, (targetValue / maxChartValue) * 190))}px`
              }}
            >
              <span className="bg-[#FAF7EE] text-[#A8833E] text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-[#C5A059]/30">
                Target: {targetValue}
              </span>
            </div>

            <div className={`grid ${itemsPerPage <= 5 ? "grid-cols-5" : itemsPerPage <= 10 ? "grid-cols-5 sm:grid-cols-10" : "grid-cols-5 sm:grid-cols-10 md:grid-cols-20"} gap-2 sm:gap-4 h-48 items-end relative z-0`}>
              {paginatedTeachers.map((teacher) => {
                const heightPercent = Math.max(6, Math.min(100, (teacher.periodCount / maxChartValue) * 100));

                return (
                  <div key={teacher.id} className="flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-black font-mono mb-1 transition-transform group-hover:-translate-y-1">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                          teacher.isRare
                            ? "bg-red-100 text-red-700"
                            : "bg-[#ECFDF5] text-[#065F46]"
                        }`}
                      >
                        {teacher.periodCount}
                      </span>
                    </div>

                    <div className="w-full max-w-[48px] bg-[#EEF2F6] rounded-t-xl h-full flex items-end p-0.5 overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-700 ease-out flex flex-col justify-between items-center py-1 ${
                          teacher.isRare
                            ? "bg-gradient-to-t from-red-600 to-red-400 shadow-sm"
                            : teacher.periodCount >= targetValue
                            ? "bg-gradient-to-t from-[#1B4D3E] to-[#2D8269] shadow-sm"
                            : "bg-gradient-to-t from-[#C5A059] to-[#E5C378] shadow-sm"
                        }`}
                      >
                        {heightPercent > 35 && (
                          <span className="text-[9px] font-mono text-white font-bold">
                            {teacher.percentage}%
                          </span>
                        )}
                        <div className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
                      </div>
                    </div>

                    <div className="mt-2 text-center w-full px-0.5">
                      <p className="text-[10px] font-bold text-[#172033] truncate group-hover:text-[#1B4D3E] transition-colors" title={teacher.name}>
                        {teacher.name.replace(/^(Ustadz|Ustadzah)\s+/, "").split(" ")[0]}
                      </p>
                      <span
                        className={`inline-block text-[8px] font-bold px-1.5 py-0.2 rounded-full mt-0.5 ${
                          teacher.isRare
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                        }`}
                      >
                        {teacher.isRare ? "Jarang" : "Aktif"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {paginatedTeachers.length === 0 && (
                <div className="col-span-5 py-12 text-center text-xs text-[#94A3B8]">
                  Tidak ada data pembina yang sesuai
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === "DONUT" && (
        <div className="p-4 rounded-2xl mizan-card-sub flex flex-col sm:flex-row items-center justify-around gap-6">
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="150" height="150" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="#EEF2F6"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="#EF4444"
                strokeWidth="12"
                strokeDasharray={`${donutCircumference} ${donutCircumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="#1B4D3E"
                strokeWidth="12"
                strokeDasharray={`${donutCircumference} ${donutCircumference}`}
                strokeDashoffset={donutCircumference - activeStrokeLength}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black font-mono text-[#172033]">
                {activeTeachers.length}/{teacherAnalytics.length}
              </span>
              <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">
                Aktif Melapor
              </span>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-sm">
            <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/60 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#065F46]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B4D3E]"></span>
                  <span>Aktif Melapor ({compliancePercentage}%)</span>
                </span>
                <span className="font-mono">{activeTeachers.length} Pembina</span>
              </div>
              <p className="text-[10px] text-[#047857]">
                {activeTeachers.map((t) => t.name).join(", ")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-red-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span>Jarang Lapor ({100 - compliancePercentage}%)</span>
                </span>
                <span className="font-mono">{teachersNeedingReminder.length} Pembina</span>
              </div>
              <p className="text-[10px] text-red-700">
                {teachersNeedingReminder.map((t) => t.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {(viewMode === "LIST" || !compact) && (
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#94A3B8] px-1 uppercase tracking-wider w-full sm:w-auto gap-4">
              <span>Rincian Capaian Asatidzah ({displayedTeachers.length} Pembina)</span>
              <span>Target: {targetValue} Input</span>
            </div>

            {viewMode === "LIST" && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Cari pembina / kelas..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-2.5 py-1 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>

                <select
                  aria-label="Tampilkan per halaman"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl font-bold text-[#172033] focus:outline-none"
                >
                  <option value={5}>5 / hal</option>
                  <option value={10}>10 / hal</option>
                  <option value={20}>20 / hal</option>
                </select>
              </div>
            )}
          </div>

          {paginatedTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className={`p-3 rounded-2xl mizan-card-sub space-y-2 transition-all ${
                teacher.isRare ? "hover:border-red-300" : "hover:border-[#1B4D3E]/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl mizan-inset flex items-center justify-center font-bold text-xs shrink-0 ${
                      teacher.isRare ? "text-red-600 bg-red-50" : "text-[#1B4D3E]"
                    }`}
                  >
                    {teacher.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033] truncate">
                      {teacher.name}
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Binaan Kelas {teacher.assignedClass} ({teacher.gender}) • Status: {teacher.status}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-black font-mono ${
                      teacher.isRare ? "text-red-600" : "text-[#1B4D3E]"
                    }`}
                  >
                    {teacher.periodCount} Input
                  </span>
                  <span
                    className={`block text-[9px] font-bold ${
                      teacher.isRare ? "text-red-600" : "text-[#065F46]"
                    }`}
                  >
                    {teacher.isRare ? "Jarang Lapor" : "Aktif Melapor"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      teacher.isRare
                        ? "bg-red-500"
                        : teacher.percentage >= 80
                        ? "bg-[#1B4D3E]"
                        : "bg-[#A8833E]"
                    }`}
                    style={{ width: `${Math.max(5, teacher.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[#94A3B8] font-bold">
                  <span>Aktivitas Terakhir: {teacher.lastLogin}</span>
                  <span>{teacher.percentage}% dari target ({teacher.periodCount}/{targetValue})</span>
                </div>
              </div>
            </div>
          ))}

          {paginatedTeachers.length === 0 && (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              Tidak ada data pembina yang sesuai dengan kriteria filter
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={displayedTeachers.length}
            itemsPerPage={itemsPerPage}
            itemName="pembina"
          />
        </div>
      )}
    </Card>
  );
}