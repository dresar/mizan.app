"use client";

import React, { useState, useMemo } from "react";
import {
  Wallet,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  Trash2,
  AlertTriangle,
  Receipt
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";

export default function AdminKeuanganPage() {
  const {
    transaksiList,
    tagihanSppList,
    payTagihanSpp,
    deleteTransaksi,
    deleteTagihanSpp
  } = useMizan();

  const [activeTab, setActiveTab] = useState<"UANG_SAKU" | "SPP">("UANG_SAKU");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "Putra" | "Putri">("ALL");

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<"TRANSAKSI" | "SPP">("TRANSAKSI");

  const filteredTransaksi = useMemo(() => {
    let list = transaksiList;
    if (genderFilter !== "ALL") {
      list = list.filter((t) => t.gender === genderFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.santriName.toLowerCase().includes(q) ||
          t.deskripsi.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transaksiList, genderFilter, searchQuery]);

  const filteredSpp = useMemo(() => {
    let list = tagihanSppList;
    if (genderFilter !== "ALL") {
      list = list.filter((s) => s.gender === genderFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.santriName.toLowerCase().includes(q));
    }
    return list;
  }, [tagihanSppList, genderFilter, searchQuery]);

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmId) return;
    if (deleteTargetType === "TRANSAKSI") {
      await deleteTransaksi(deleteConfirmId);
    } else {
      await deleteTagihanSpp(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  return (
    <RoleShell>
      <div className="space-y-3.5 pb-24">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-serif font-black text-[#172033] tracking-tight">
                  Keuangan Santri
                </h1>
                <p className="text-[10px] text-[#64748B]">Uang saku & tagihan SPP</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="inline-flex rounded-xl p-0.5 bg-[#EEF2F6]">
                <button
                  type="button"
                  onClick={() => setActiveTab("UANG_SAKU")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "UANG_SAKU"
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  Uang Saku ({filteredTransaksi.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("SPP")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "SPP"
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  SPP ({filteredSpp.length})
                </button>
              </div>

              <div className="inline-flex rounded-xl p-0.5 bg-[#EEF2F6]">
                {(["ALL", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenderFilter(g)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      genderFilter === g
                        ? "bg-white text-[#1B4D3E] shadow-2xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g === "ALL" ? "Semua" : g === "Putra" ? "L" : "P"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative pt-1 border-t border-[#E2EBF4]">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-medium text-[#172033] focus:outline-hidden"
            />
          </div>
        </div>

        {deleteConfirmId && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {deleteTargetType === "TRANSAKSI"
                  ? "Batalkan transaksi ini? Saldo santri otomatis disesuaikan."
                  : "Hapus tagihan SPP ini?"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        )}

        {activeTab === "UANG_SAKU" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTransaksi.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-[#E2EBF4] text-[#64748B] space-y-1">
                <Wallet className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="text-xs font-semibold">Tidak ada data transaksi</p>
              </div>
            ) : (
              filteredTransaksi.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] flex flex-col justify-between space-y-2.5 shadow-2xs hover:border-[#1B4D3E]/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          t.jenis === "IN"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {t.jenis === "IN" ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-[#172033] truncate">{t.santriName}</h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black shrink-0 ${
                              t.gender === "Putra"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {t.gender === "Putra" ? "L" : "P"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] font-mono">{t.tanggal}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs sm:text-sm font-black font-mono shrink-0 ${
                        t.jenis === "IN" ? "text-[#065F46]" : "text-rose-700"
                      }`}
                    >
                      {t.jenis === "IN" ? "+" : "-"}Rp {t.nominal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF7EE] text-[11px] space-y-1">
                    <p className="text-[#172033] truncate">
                      <span className="text-[#94A3B8]">Ket: </span>{t.deskripsi}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#D4C9B5]/40 text-[10px] text-[#64748B]">
                      <span>Saldo: Rp {t.saldoTerakhir.toLocaleString("id-ID")}</span>
                      <span>Petugas: {t.petugasNama || "Pengasuhan"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetType("TRANSAKSI");
                        setDeleteConfirmId(t.id);
                      }}
                      className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSpp.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-[#E2EBF4] text-[#64748B] space-y-1">
                <FileText className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="text-xs font-semibold">Tidak ada tagihan SPP</p>
              </div>
            ) : (
              filteredSpp.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] flex flex-col justify-between space-y-2.5 shadow-2xs hover:border-[#1B4D3E]/30 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-[#172033] truncate">{s.santriName}</h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-black shrink-0 ${
                              s.gender === "Putra"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {s.gender === "Putra" ? "L" : "P"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] font-mono">{s.bulan} {s.tahun}</p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                          s.status === "LUNAS" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FAF7EE] text-[11px] space-y-1 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Nominal:</span>
                        <span className="font-bold text-[#172033]">Rp {s.nominal.toLocaleString("id-ID")}</span>
                      </div>
                      {s.kuitansiNomor && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#D4C9B5]/40 text-[10px] text-emerald-800">
                          <span>Kuitansi:</span>
                          <span>{s.kuitansiNomor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between gap-2">
                    {s.status !== "LUNAS" ? (
                      <button
                        type="button"
                        onClick={() => payTagihanSpp(s.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#1B4D3E] hover:bg-[#153e32] text-white text-[10px] font-bold cursor-pointer"
                      >
                        Sahkan Lunas
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#065F46] font-bold">Lunas</span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetType("SPP");
                        setDeleteConfirmId(s.id);
                      }}
                      className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus SPP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </RoleShell>
  );
}
