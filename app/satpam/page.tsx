"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  LogOut
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { PerizinanRecord } from "@/lib/mock-data";

export default function SatpamGatePage() {
  const { verifyGatePass, logoutUser, currentUser } = useMizan();
  const [tokenInput, setTokenInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scannedRecord, setScannedRecord] = useState<PerizinanRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const handleVerify = async (action: "CHECK" | "KELUAR" | "KEMBALI") => {
    const queryToken = (tokenInput || scannedRecord?.qrCodeToken || "").trim();
    if (!queryToken) {
      setStatusMessage({ type: "error", text: "Silakan masukkan atau scan token QR code izin" });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    if (action === "CHECK") {
      try {
        const res = await fetch(`/api/monitoring/perizinan?token=${encodeURIComponent(queryToken)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.perizinan) && json.perizinan.length > 0) {
          const rec: PerizinanRecord = json.perizinan[0];
          setScannedRecord(rec);
          setStatusMessage({ type: "success", text: `Izin ditemukan atas nama ${rec.santriName}` });
        } else {
          setScannedRecord(null);
          setStatusMessage({ type: "error", text: "Kartu izin tidak ditemukan atau kode QR tidak sah" });
        }
      } catch {
        setStatusMessage({ type: "error", text: "Gagal menghubungkan ke server verifikasi gerbang" });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const result = await verifyGatePass(queryToken, action);
      if (result.success && result.data) {
        setScannedRecord(result.data);
        setStatusMessage({
          type: "success",
          text: action === "KELUAR" ? "Konfirmasi KELUAR berhasil dicatat" : "Konfirmasi KEMBALI berhasil dicatat"
        });
      } else {
        setStatusMessage({ type: "error", text: result.message || "Gagal memproses verifikasi gerbang" });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e?.message || "Terjadi kesalahan sistem" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setTokenInput("");
    setScannedRecord(null);
    setStatusMessage(null);
  };

  return (
    <RoleShell>
      <div className="max-w-xl mx-auto space-y-4 pb-20">
        <div className="mizan-card p-5 bg-white dark:bg-slate-900 border border-[#E2EBF4] dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EBF4] dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#1B4D3E] text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-[#172033] dark:text-slate-100 tracking-tight">
                  Pos Jaga Gerbang Pesantren
                </h1>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Verifikasi Surat Izin Keluar / Masuk Santri • {currentUser?.name || "Petugas Keamanan"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logoutUser}
              className="px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Keluar dari Akun Satpam"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#172033] dark:text-slate-200">
              Scan atau Masukkan Kode QR Izin Santri:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-[#94A3B8] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Contoh: QR-17300000-xxxx atau tempel kode..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#FAF7EE] dark:bg-slate-800/80 border border-[#D4C9B5] dark:border-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#1B4D3E]/30"
                />
              </div>
              <button
                type="button"
                onClick={() => handleVerify("CHECK")}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Periksa"}
              </button>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : statusMessage.type === "error"
                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {scannedRecord && (
            <div className="p-4 rounded-2xl bg-[#FAF7EE] dark:bg-slate-800/70 border border-[#C5A059]/30 dark:border-slate-700 space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#A8833E] dark:text-amber-400 uppercase tracking-wider block">
                    Kartu Izin Resmi
                  </span>
                  <h3 className="text-sm font-bold text-[#172033] dark:text-slate-100 mt-0.5">
                    {scannedRecord.santriName}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Kelas {scannedRecord.santriClass} • {scannedRecord.gender === "Putra" ? "L" : "P"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold ${
                    scannedRecord.status === "DISETUJUI"
                      ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                      : scannedRecord.status === "BERJALAN"
                      ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                      : scannedRecord.status === "SELESAI"
                      ? "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  {scannedRecord.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#D4C9B5]/40 dark:border-slate-700">
                <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-transparent dark:border-slate-800">
                  <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 block">Jenis Izin</span>
                  <span className="font-bold text-[#172033] dark:text-slate-100">{scannedRecord.jenisIzin}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-transparent dark:border-slate-800">
                  <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 block">Disetujui Oleh</span>
                  <span className="font-bold text-[#172033] dark:text-slate-100">{scannedRecord.disetujuiOleh || "Pengasuhan"}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-transparent dark:border-slate-800">
                  <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 block">Rencana Keluar</span>
                  <span className="font-bold text-[#172033] dark:text-slate-100">{scannedRecord.tglKeluar}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-transparent dark:border-slate-800">
                  <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 block">Wajib Kembali</span>
                  <span className="font-bold text-[#172033] dark:text-slate-100">{scannedRecord.tglKembali}</span>
                </div>
              </div>

              {scannedRecord.alasan && (
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-transparent dark:border-slate-800 text-xs">
                  <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 block font-medium">Alasan / Keterangan:</span>
                  <p className="text-[#172033] dark:text-slate-200 mt-0.5">{scannedRecord.alasan}</p>
                </div>
              )}

              {scannedRecord.waktuKeluarRiil && (
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Keluar Gerbang: {scannedRecord.waktuKeluarRiil}</span>
                </div>
              )}

              {scannedRecord.waktuKembaliRiil && (
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kembali Masuk: {scannedRecord.waktuKembaliRiil}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleVerify("KELUAR")}
                  disabled={isLoading || scannedRecord.status === "BERJALAN" || scannedRecord.status === "SELESAI"}
                  className="flex-1 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Konfirmasi KELUAR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerify("KEMBALI")}
                  disabled={isLoading || scannedRecord.status !== "BERJALAN"}
                  className="flex-1 py-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi KEMBALI</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="text-xs text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-100 font-semibold underline"
                >
                  Periksa Izin Santri Lain
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleShell>
  );
}
