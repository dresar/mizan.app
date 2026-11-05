"use client";

import React, { useState, useMemo } from "react";
import {
  HeartPulse,
  Search,
  Calendar,
  Filter,
  Trash2
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Avatar } from "@/components/ui/Avatar";

export default function AdminKesehatanPage() {
  const { kesehatanList, deleteKesehatan } = useMizan();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredRecords = useMemo(() => {
    let list = kesehatanList;
    if (genderFilter !== "ALL") {
      list = list.filter((k) => k.gender === genderFilter);
    }
    if (statusFilter !== "ALL") {
      list = list.filter((k) => k.statusRawat === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (k) =>
          k.santriName.toLowerCase().includes(q) ||
          k.keluhan.toLowerCase().includes(q) ||
          k.diagnosa.toLowerCase().includes(q)
      );
    }
    return list;
  }, [kesehatanList, genderFilter, statusFilter, searchQuery]);

  return (
    <RoleShell>
      <div className="space-y-4 pb-20">
        <div className="mizan-card p-4 sm:p-6 bg-white space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shadow-xs">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                  Rekapitulasi Poskestren & Kesehatan Santri (Admin Panel)
                </h1>
                <p className="text-xs text-[#64748B]">
                  Pusat kendali dan audit rekam medis santri putra & putri pondok pesantren
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EEF2F6]">
              {(["ALL", "Putra", "Putri"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenderFilter(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    genderFilter === g
                      ? "bg-[#1B4D3E] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {g === "ALL" ? "Semua Santri" : g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E2EBF4]">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari santri, diagnosa, keluhan..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-medium text-[#172033] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {(["ALL", "Rawat Jalan", "Istirahat di Kamar", "Rawat Inap Klinik", "Rujuk RS"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#1B4D3E] text-white shadow-xs"
                      : "bg-[#FAF7EE] text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {st === "ALL" ? "Semua Status" : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mizan-card bg-white overflow-hidden">
          <div className="p-4 border-b border-[#E2EBF4] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Rekap Log Kesehatan ({filteredRecords.length} Catatan)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7EE] text-[#64748B] uppercase font-bold text-[10px] border-b border-[#E2EBF4]">
                <tr>
                  <th className="p-3">Santri</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Keluhan</th>
                  <th className="p-3">Diagnosa & Tindakan</th>
                  <th className="p-3">Status Rawat</th>
                  <th className="p-3">Petugas</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EBF4]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#64748B]">
                      Tidak ada catatan kesehatan yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                      <td className="p-3 font-bold text-[#172033]">{r.santriName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            r.gender === "Putra" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {r.gender}
                        </span>
                      </td>
                      <td className="p-3 text-[#64748B] whitespace-nowrap">{r.tanggal}</td>
                      <td className="p-3 text-[#172033] max-w-[180px] truncate">{r.keluhan}</td>
                      <td className="p-3 text-[#172033]">
                        <span className="font-semibold block">{r.diagnosa}</span>
                        <span className="text-[10px] text-[#64748B]">{r.tindakanObat}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            r.statusRawat === "Istirahat di Kamar"
                              ? "bg-amber-100 text-amber-800"
                              : r.statusRawat === "Rawat Inap Klinik"
                              ? "bg-rose-100 text-rose-800"
                              : r.statusRawat === "Rujuk RS"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {r.statusRawat}
                        </span>
                      </td>
                      <td className="p-3 text-[#64748B]">{r.petugasNama}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteKesehatan(r.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
