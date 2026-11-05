"use client";

import React, { useState, useMemo } from "react";
import {
  Wallet,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  X,
  Trash2,
  AlertTriangle,
  Receipt
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Avatar } from "@/components/ui/Avatar";
import { TransaksiKeuangan, TagihanSPP } from "@/lib/mock-data";

export default function PengasuhanKeuanganPage() {
  const {
    accessibleSantriList,
    transaksiList,
    addTransaksi,
    deleteTransaksi,
    tagihanSppList,
    addTagihanSpp,
    deleteTagihanSpp,
    payTagihanSpp,
    currentUser
  } = useMizan();

  const [activeTab, setActiveTab] = useState<"UANG_SAKU" | "SPP">("UANG_SAKU");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeInlineForm, setActiveInlineForm] = useState<"NONE" | "TOPUP" | "BELANJA" | "SPP">("NONE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<"TRANSAKSI" | "SPP">("TRANSAKSI");

  const [topupForm, setTopupForm] = useState({
    santriId: "",
    nominal: 50000,
    metode: "CASH",
    deskripsi: "Titipan uang jajan dari wali santri"
  });

  const [belanjaForm, setBelanjaForm] = useState({
    santriId: "",
    nominal: 10000,
    deskripsi: "Jajan kantin / Koperasi santri"
  });

  const [sppForm, setSppForm] = useState({
    santriId: "",
    bulan: "November",
    tahun: 2026,
    nominal: 750000
  });

  const filteredTransaksi = useMemo(() => {
    let list = transaksiList;
    if (currentUser?.gender === "Putra") {
      list = list.filter((t) => t.gender === "Putra");
    } else if (currentUser?.gender === "Putri") {
      list = list.filter((t) => t.gender === "Putri");
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
  }, [transaksiList, currentUser?.gender, searchQuery]);

  const filteredSpp = useMemo(() => {
    let list = tagihanSppList;
    if (currentUser?.gender === "Putra") {
      list = list.filter((s) => s.gender === "Putra");
    } else if (currentUser?.gender === "Putri") {
      list = list.filter((s) => s.gender === "Putri");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.santriName.toLowerCase().includes(q));
    }
    return list;
  }, [tagihanSppList, currentUser?.gender, searchQuery]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupForm.santriId || topupForm.nominal <= 0) return;
    const santri = accessibleSantriList.find((s) => s.id === topupForm.santriId);
    if (!santri) return;

    setIsSubmitting(true);
    await addTransaksi({
      santriId: santri.id,
      santriName: santri.name,
      gender: santri.gender,
      kategori: "Uang Saku",
      jenis: "IN",
      nominal: Number(topupForm.nominal),
      deskripsi: topupForm.deskripsi,
      metodePembayaran: topupForm.metode,
      petugasNama: currentUser?.name || "Pengasuhan",
      tanggal: new Date().toISOString().split("T")[0],
      status: "BERHASIL"
    });

    setIsSubmitting(false);
    setActiveInlineForm("NONE");
    setTopupForm({
      santriId: "",
      nominal: 50000,
      metode: "CASH",
      deskripsi: "Titipan uang jajan dari wali santri"
    });
  };

  const handleBelanja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!belanjaForm.santriId || belanjaForm.nominal <= 0) return;
    const santri = accessibleSantriList.find((s) => s.id === belanjaForm.santriId);
    if (!santri) return;

    setIsSubmitting(true);
    await addTransaksi({
      santriId: santri.id,
      santriName: santri.name,
      gender: santri.gender,
      kategori: "Uang Saku",
      jenis: "OUT",
      nominal: Number(belanjaForm.nominal),
      deskripsi: belanjaForm.deskripsi,
      metodePembayaran: "SALDO_SAKU",
      petugasNama: currentUser?.name || "Pengasuhan",
      tanggal: new Date().toISOString().split("T")[0],
      status: "BERHASIL"
    });

    setIsSubmitting(false);
    setActiveInlineForm("NONE");
    setBelanjaForm({
      santriId: "",
      nominal: 10000,
      deskripsi: "Jajan kantin / Koperasi santri"
    });
  };

  const handleCreateSpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sppForm.santriId || sppForm.nominal <= 0) return;
    const santri = accessibleSantriList.find((s) => s.id === sppForm.santriId);
    if (!santri) return;

    setIsSubmitting(true);
    await addTagihanSpp({
      santriId: santri.id,
      santriName: santri.name,
      gender: santri.gender,
      bulan: sppForm.bulan,
      tahun: Number(sppForm.tahun) || 2026,
      nominal: Number(sppForm.nominal),
      jatuhTempo: `${sppForm.tahun}-11-10`
    });

    setIsSubmitting(false);
    setActiveInlineForm("NONE");
    setSppForm({
      santriId: "",
      bulan: "November",
      tahun: 2026,
      nominal: 750000
    });
  };

  const handleDeleteItem = async () => {
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
        <div className="mizan-card p-4 sm:p-5 bg-white space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 text-[#854D0E] flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                  Finansial & Uang Saku Santri {currentUser?.gender ? `(${currentUser.gender})` : ""}
                </h1>
                <p className="text-xs text-[#64748B]">
                  Pencatatan uang saku manual dari wali, mutasi belanja kantin, dan verifikasi SPP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === "UANG_SAKU" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveInlineForm(activeInlineForm === "TOPUP" ? "NONE" : "TOPUP")}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                      activeInlineForm === "TOPUP"
                        ? "bg-[#854D0E] text-white"
                        : "bg-[#1B4D3E] hover:bg-[#153e32] text-white"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{activeInlineForm === "TOPUP" ? "Tutup Form" : "Titip Uang Saku"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInlineForm(activeInlineForm === "BELANJA" ? "NONE" : "BELANJA")}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      activeInlineForm === "BELANJA"
                        ? "bg-rose-700 text-white border-rose-800"
                        : "bg-white border-[#CBD5E1] text-[#172033] hover:bg-slate-50"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    <span>{activeInlineForm === "BELANJA" ? "Tutup Form" : "Belanja Kantin"}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveInlineForm(activeInlineForm === "SPP" ? "NONE" : "SPP")}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    activeInlineForm === "SPP"
                      ? "bg-[#854D0E] text-white"
                      : "bg-[#1B4D3E] hover:bg-[#153e32] text-white"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{activeInlineForm === "SPP" ? "Tutup Form" : "Buat Tagihan SPP"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex border-b border-[#E2EBF4] gap-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("UANG_SAKU");
                setActiveInlineForm("NONE");
              }}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === "UANG_SAKU"
                  ? "border-b-2 border-[#1B4D3E] text-[#1B4D3E]"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              Buku Kas Uang Saku ({filteredTransaksi.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("SPP");
                setActiveInlineForm("NONE");
              }}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === "SPP"
                  ? "border-b-2 border-[#1B4D3E] text-[#1B4D3E]"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              Tagihan & SPP Santri ({filteredSpp.length})
            </button>
          </div>

          {activeInlineForm === "TOPUP" && (
            <form onSubmit={handleTopup} className="p-4 sm:p-5 rounded-3xl bg-[#FAF7EE] border border-[#C5A059]/40 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#D4C9B5]/40">
                <span className="text-xs font-bold text-[#172033]">Pencatatan Titipan Uang Saku Santri (Manual dari Wali)</span>
                <button
                  type="button"
                  onClick={() => setActiveInlineForm("NONE")}
                  className="text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Santri</label>
                  <select
                    value={topupForm.santriId}
                    onChange={(e) => setTopupForm({ ...topupForm, santriId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Santri --</option>
                    {accessibleSantriList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class}) • Saldo: Rp {Number(s.pocketBalance || 0).toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Nominal Titipan (Rp)</label>
                  <input
                    type="number"
                    step="5000"
                    min="5000"
                    value={topupForm.nominal}
                    onChange={(e) => setTopupForm({ ...topupForm, nominal: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Metode Serah Terima</label>
                  <select
                    value={topupForm.metode}
                    onChange={(e) => setTopupForm({ ...topupForm, metode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                  >
                    <option value="CASH">Tunai (Diterima Pengasuhan)</option>
                    <option value="TRANSFER">Transfer Bank / Rekening Pondok</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Keterangan / Catatan</label>
                  <input
                    type="text"
                    value={topupForm.deskripsi}
                    onChange={(e) => setTopupForm({ ...topupForm, deskripsi: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl text-[#172033] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D4C9B5]/40">
                <button
                  type="button"
                  onClick={() => setActiveInlineForm("NONE")}
                  className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Catat & Tambah Saldo"}
                </button>
              </div>
            </form>
          )}

          {activeInlineForm === "BELANJA" && (
            <form onSubmit={handleBelanja} className="p-4 sm:p-5 rounded-3xl bg-[#FEF2F2] border border-[#FECACA] space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#FCA5A5]/40">
                <span className="text-xs font-bold text-[#B91C1C]">Catat Belanja Kantin / Koperasi Santri (Potong Saldo)</span>
                <button
                  type="button"
                  onClick={() => setActiveInlineForm("NONE")}
                  className="text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Santri</label>
                  <select
                    value={belanjaForm.santriId}
                    onChange={(e) => setBelanjaForm({ ...belanjaForm, santriId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Santri --</option>
                    {accessibleSantriList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class}) • Sisa Saldo: Rp {Number(s.pocketBalance || 0).toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Nominal Belanja (Rp)</label>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={belanjaForm.nominal}
                    onChange={(e) => setBelanjaForm({ ...belanjaForm, nominal: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-[#172033]">Barang / Keperluan Belanja</label>
                  <input
                    type="text"
                    value={belanjaForm.deskripsi}
                    onChange={(e) => setBelanjaForm({ ...belanjaForm, deskripsi: e.target.value })}
                    placeholder="Contoh: Makan siang kantin / Beli kitab / Perlengkapan mandi..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl text-[#172033] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#FCA5A5]/40">
                <button
                  type="button"
                  onClick={() => setActiveInlineForm("NONE")}
                  className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Potong Saldo Belanja"}
                </button>
              </div>
            </form>
          )}

          {activeInlineForm === "SPP" && (
            <form onSubmit={handleCreateSpp} className="p-4 sm:p-5 rounded-3xl bg-[#FAF7EE] border border-[#C5A059]/40 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#D4C9B5]/40">
                <span className="text-xs font-bold text-[#172033]">Penerbitan Tagihan SPP Bulanan Santri</span>
                <button
                  type="button"
                  onClick={() => setActiveInlineForm("NONE")}
                  className="text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Santri</label>
                  <select
                    value={sppForm.santriId}
                    onChange={(e) => setSppForm({ ...sppForm, santriId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Santri --</option>
                    {accessibleSantriList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Bulan Tagihan</label>
                  <select
                    value={sppForm.bulan}
                    onChange={(e) => setSppForm({ ...sppForm, bulan: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none"
                  >
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Tahun</label>
                  <input
                    type="number"
                    value={sppForm.tahun}
                    onChange={(e) => setSppForm({ ...sppForm, tahun: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#172033]">Nominal SPP (Rp)</label>
                  <input
                    type="number"
                    step="25000"
                    min="50000"
                    value={sppForm.nominal}
                    onChange={(e) => setSppForm({ ...sppForm, nominal: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl font-bold text-[#172033] focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D4C9B5]/40">
                <button
                  type="button"
                  onClick={() => setActiveInlineForm("NONE")}
                  className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? "Menerbitkan..." : "Terbitkan Tagihan"}
                </button>
              </div>
            </form>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder={activeTab === "UANG_SAKU" ? "Cari riwayat transaksi santri..." : "Cari santri penerima tagihan SPP..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
            />
          </div>
        </div>

        {deleteConfirmId && (
          <div className="p-4 rounded-3xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 text-[#B91C1C]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold">Konfirmasi Hapus Data Finansial</p>
                <p className="text-[11px] text-[#7F1D1D]">
                  {deleteTargetType === "TRANSAKSI"
                    ? "Hapus transaksi ini? Saldo saku santri akan otomatis disesuaikan kembali."
                    : "Hapus tagihan SPP ini?"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                className="px-3.5 py-1.5 rounded-xl bg-[#B91C1C] text-white text-xs font-bold hover:bg-red-800 transition-colors shadow-2xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}

        {activeTab === "UANG_SAKU" ? (
          <div className="space-y-2.5">
            {filteredTransaksi.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#E2EBF4] text-[#64748B]">
                Belum ada catatan mutasi uang saku santri
              </div>
            ) : (
              filteredTransaksi.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] flex items-center justify-between gap-3 hover:border-[#1B4D3E]/30 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        t.jenis === "IN"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {t.jenis === "IN" ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate">
                        {t.santriName} <span className="font-normal text-[#64748B] font-mono">({t.kategori})</span>
                      </p>
                      <p className="text-[11px] text-[#64748B] truncate">
                        {t.deskripsi} • <span className="font-mono">{t.tanggal}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-xs sm:text-sm font-black font-mono block ${
                          t.jenis === "IN" ? "text-[#065F46]" : "text-rose-700"
                        }`}
                      >
                        {t.jenis === "IN" ? "+" : "-"}Rp {Number(t.nominal).toLocaleString("id-ID")}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono block">
                        Metode: {t.metodePembayaran}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetType("TRANSAKSI");
                        setDeleteConfirmId(t.id);
                      }}
                      className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                      title="Hapus / Batalkan Transaksi"
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
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-[#E2EBF4] text-[#64748B]">
                Belum ada data tagihan SPP santri
              </div>
            ) : (
              filteredSpp.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-white border border-[#E2EBF4] flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#172033]">{s.santriName}</h4>
                        <span className="text-[10px] text-[#64748B] font-mono">Bulan: {s.bulan} {s.tahun}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            s.status === "LUNAS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {s.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetType("SPP");
                            setDeleteConfirmId(s.id);
                          }}
                          className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                          title="Hapus Tagihan SPP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF7EE] text-xs space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Tagihan:</span>
                        <span className="font-bold text-[#172033]">Rp {Number(s.nominal).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#94A3B8]">Jatuh Tempo:</span>
                        <span className="text-[#64748B]">{s.jatuhTempo}</span>
                      </div>
                      {s.kuitansiNomor && (
                        <div className="flex justify-between text-[10px] text-[#065F46] pt-1 border-t border-[#D4C9B5]/40 font-bold">
                          <span>Kuitansi:</span>
                          <span>{s.kuitansiNomor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {s.status !== "LUNAS" && (
                    <button
                      type="button"
                      onClick={() => payTagihanSpp(s.id)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Verifikasi Lunas (Kuitansi)</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </RoleShell>
  );
}
