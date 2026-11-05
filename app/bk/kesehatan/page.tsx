"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Clock,
  Sparkles,
  Trash2
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Avatar } from "@/components/ui/Avatar";
import { KesehatanRecord } from "@/lib/mock-data";

export default function PengasuhanKesehatanPage() {
  const { kesehatanList, deleteKesehatan, currentUser } = useMizan();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredRecords = useMemo(() => {
    let list = kesehatanList;
    if (currentUser?.gender === "Putra") {
      list = list.filter((k) => k.gender === "Putra");
    } else if (currentUser?.gender === "Putri") {
      list = list.filter((k) => k.gender === "Putri");
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
  }, [kesehatanList, currentUser?.gender, statusFilter, searchQuery]);

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
                  Poskestren & Kesehatan Santri {currentUser?.gender ? `(${currentUser.gender})` : ""}
                </h1>
                <p className="text-xs text-[#64748B]">
                  Pencatatan keluhan sakit, rawat inap asrama, obat, dan status klinis santri
                </p>
              </div>
            </div>

            <Link
              href="/bk/kesehatan/catat"
              className="px-4 py-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Santri Sakit</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E2EBF4]">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari santri, diagnosa, atau keluhan..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRecords.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-[#E2EBF4] text-[#64748B] space-y-2">
              <HeartPulse className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p className="text-xs font-semibold">Tidak ada riwayat rekam medis yang sesuai</p>
            </div>
          ) : (
            filteredRecords.map((r) => (
              <div key={r.id} className="mizan-card p-4 bg-white flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        initials={r.santriName.substring(0, 2).toUpperCase()}
                        size="md"
                        variant={r.gender === "Putra" ? "primary" : "gold"}
                      />
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#172033]">{r.santriName}</h3>
                        <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {r.tanggal}
                        </span>
                      </div>
                    </div>

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
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF7EE] text-xs space-y-1">
                    <p className="text-[#172033] font-semibold">
                      <span className="text-[#94A3B8] font-normal">Keluhan: </span>
                      {r.keluhan}
                    </p>
                    <p className="text-[#172033]">
                      <span className="text-[#94A3B8]">Diagnosa: </span>
                      {r.diagnosa}
                    </p>
                    <p className="text-[#172033]">
                      <span className="text-[#94A3B8]">Tindakan / Obat: </span>
                      {r.tindakanObat}
                    </p>
                  </div>

                  {r.catatan && (
                    <p className="text-[11px] text-[#64748B] italic">Catatan: {r.catatan}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>Pemeriksa: {r.petugasNama}</span>
                  <button
                    type="button"
                    onClick={() => deleteKesehatan(r.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Hapus Rekam"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RoleShell>
  );
}
