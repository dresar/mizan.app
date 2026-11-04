"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Award } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { PenilaianRecord } from "@/lib/mock-data";

export interface ClassLogsTableProps {
  classNameTitle: string;
  logs: PenilaianRecord[];
}

export function ClassLogsTable({ classNameTitle, logs }: ClassLogsTableProps) {
  const [logFilter, setLogFilter] = useState<"ALL" | "HASANAH" | "SAYYIAH">("ALL");
  const [logPage, setLogPage] = useState(1);
  const PAGE_SIZE = 20;

  const filteredLogs = useMemo(() => {
    if (logFilter === "ALL") return logs;
    return logs.filter((p) => p.type === logFilter);
  }, [logs, logFilter]);

  useEffect(() => {
    setLogPage(1);
  }, [logFilter]);

  const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safeLogPage = Math.min(Math.max(1, logPage), totalLogPages);
  const paginatedLogs = useMemo(() => {
    const start = (safeLogPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, safeLogPage]);

  const formatDecimal = (val: number) => val.toFixed(3).replace(".", ",");

  return (
    <div className="mizan-card p-4 sm:p-5 bg-white border border-[#E2EBF4] space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#1B4D3E]" />
          <h2 className="text-sm font-serif font-black text-[#172033]">
            Catatan Penilaian Kejadian ({filteredLogs.length})
          </h2>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-full mizan-pill bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold self-start">
          {(["ALL", "HASANAH", "SAYYIAH"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLogFilter(mode)}
              className={`py-1 px-3 rounded-full transition-all text-center cursor-pointer ${
                logFilter === mode
                  ? mode === "HASANAH"
                    ? "bg-[#16A34A] text-white"
                    : mode === "SAYYIAH"
                    ? "bg-[#DC2626] text-white"
                    : "bg-[#1B4D3E] text-white"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              {mode === "ALL" ? "Semua" : mode === "HASANAH" ? "Hasanah" : "Sayyi'ah"}
            </button>
          ))}
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#94A3B8]">
          Belum ada catatan penilaian tercatat untuk Kelas {classNameTitle}.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                <th className="py-2 px-3">Waktu</th>
                <th className="py-2 px-3">Nama Santri</th>
                <th className="py-2 px-3 text-center">Jenis</th>
                <th className="py-2 px-3">Indikator</th>
                <th className="py-2 px-3 text-center">Tingkat</th>
                <th className="py-2 px-3 text-center">Poin</th>
                <th className="py-2 px-3">Pencatat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginatedLogs.map((record) => (
                <tr key={record.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2 px-3 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short"
                    })}
                  </td>
                  <td className="py-2 px-3 font-bold text-[#172033] whitespace-nowrap">
                    {record.santriName}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        record.type === "HASANAH"
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : "bg-[#FEF2F2] text-[#991B1B]"
                      }`}
                    >
                      {record.type === "HASANAH" ? "Hasanah" : "Sayyi'ah"}
                    </span>
                  </td>
                  <td className="py-2 px-3 max-w-xs text-[#172033]">
                    <p className="font-medium line-clamp-1">{record.indicatorText}</p>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {record.tingkat || "Ringan"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-bold font-mono">
                    <span
                      className={
                        record.type === "HASANAH" ? "text-[#065F46]" : "text-[#DC2626]"
                      }
                    >
                      {record.type === "HASANAH" ? "+" : ""}
                      {formatDecimal(record.score)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                    {record.guruName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={safeLogPage}
        totalPages={totalLogPages}
        onPageChange={setLogPage}
        totalItems={filteredLogs.length}
        itemsPerPage={PAGE_SIZE}
        itemName="catatan"
      />
    </div>
  );
}
