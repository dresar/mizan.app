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
  AlertTriangle
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
      <div className="space-y-4 pb-20">
        <div className="mizan-card p-4 sm:p-6 bg-white space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                  Rekapitulasi Finansial & SPP (Admin Panel)
                </h1>
                <p className="text-xs text-[#64748B]">
                  Pusat audit saldo uang saku santri, pencatatan titipan wali, dan pelunasan SPP
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

          <div className="flex items-center justify-between gap-2 border-b border-[#E2EBF4] pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("UANG_SAKU")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "UANG_SAKU"
                    ? "border-[#1B4D3E] text-[#1B4D3E]"
                    : "border-transparent text-[#64748B] hover:text-[#172033]"
                }`}
              >
                Log Transaksi Uang Saku ({filteredTransaksi.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SPP")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "SPP"
                    ? "border-[#1B4D3E] text-[#1B4D3E]"
                    : "border-transparent text-[#64748B] hover:text-[#172033]"
                }`}
              >
                Data Tagihan SPP ({filteredSpp.length})
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri atau deskripsi transaksi..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-medium text-[#172033] focus:outline-hidden"
            />
          </div>
        </div>

        {deleteConfirmId && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {deleteTargetType === "TRANSAKSI"
                  ? "Yakin ingin membatalkan transaksi ini? Saldo santri akan disesuaikan kembali secara otomatis."
                  : "Yakin ingin menghapus tagihan SPP ini?"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}

        {activeTab === "UANG_SAKU" ? (
          <div className="mizan-card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7EE] text-[#64748B] uppercase font-bold text-[10px] border-b border-[#E2EBF4]">
                  <tr>
                    <th className="p-3">Santri</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Jenis</th>
                    <th className="p-3">Nominal</th>
                    <th className="p-3">Sisa Saldo</th>
                    <th className="p-3">Keperluan / Keterangan</th>
                    <th className="p-3">Petugas</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBF4]">
                  {filteredTransaksi.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-[#64748B]">
                        Belum ada data mutasi uang saku
                      </td>
                    </tr>
                  ) : (
                    filteredTransaksi.map((t) => (
                      <tr key={t.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                        <td className="p-3 font-bold text-[#172033]">{t.santriName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              t.gender === "Putra" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {t.gender}
                          </span>
                        </td>
                        <td className="p-3 text-[#64748B] whitespace-nowrap">{t.tanggal}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              t.jenis === "IN"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {t.jenis === "IN" ? "TITIPAN (IN)" : "JAJAN (OUT)"}
                          </span>
                        </td>
                        <td className="p-3 font-bold">
                          <span
                            className={
                              t.jenis === "IN" ? "text-emerald-700" : "text-rose-600"
                            }
                          >
                            {t.jenis === "IN" ? "+" : "-"}Rp {t.nominal.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 text-[#172033] font-semibold">
                          Rp {t.saldoTerakhir.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 text-[#64748B]">{t.deskripsi}</td>
                        <td className="p-3 text-[#94A3B8]">{t.petugasNama || "Pengasuhan"}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTargetType("TRANSAKSI");
                              setDeleteConfirmId(t.id);
                            }}
                            className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition-colors cursor-pointer"
                            title="Hapus / Batalkan Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mizan-card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7EE] text-[#64748B] uppercase font-bold text-[10px] border-b border-[#E2EBF4]">
                  <tr>
                    <th className="p-3">Santri</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Periode</th>
                    <th className="p-3">Nominal</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Kuitansi Resmi</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBF4]">
                  {filteredSpp.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#64748B]">
                        Belum ada tagihan SPP
                      </td>
                    </tr>
                  ) : (
                    filteredSpp.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                        <td className="p-3 font-bold text-[#172033]">{s.santriName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              s.gender === "Putra" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {s.gender}
                          </span>
                        </td>
                        <td className="p-3 text-[#64748B]">
                          {s.bulan} {s.tahun}
                        </td>
                        <td className="p-3 font-bold text-[#172033]">
                          Rp {s.nominal.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                              s.status === "LUNAS" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-[10px] font-mono text-emerald-800">
                          {s.kuitansiNomor ? `${s.kuitansiNomor} (${s.tglBayar})` : "-"}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.status !== "LUNAS" && (
                              <button
                                type="button"
                                onClick={() => payTagihanSpp(s.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#1B4D3E] hover:bg-[#153e32] text-white text-[10px] font-bold cursor-pointer"
                              >
                                Sahkan Lunas
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTargetType("SPP");
                                setDeleteConfirmId(s.id);
                              }}
                              className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus Tagihan SPP"
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
          </div>
        )}
      </div>
    </RoleShell>
  );
}
