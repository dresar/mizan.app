"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Bug,
  Lightbulb,
  Check,
  Copy,
  AlertTriangle,
  FileCode2,
  RefreshCw,
  Send,
  ShieldAlert
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { FeedbackType, FeedbackSeverity, AIAnalysisResult } from "@/lib/mock-data";
import { Portal } from "@/components/ui/Portal";

const CATEGORY_OPTIONS = [
  "Absensi Sholat",
  "Input Penilaian & Sikap",
  "Rapor Santri & PDF",
  "Data Santri",
  "Data Kelas & Wali",
  "Portal Wali Santri",
  "Dashboard Pondok",
  "Login & Autentikasi",
  "Pengaturan & Master",
  "Lainnya"
];

export function FeedbackModal() {
  const [pathname, setPathname] = useState<string>("");
  const {
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    feedbackInitialType,
    currentUser,
    activeRole,
    addFeedback,
    showToast
  } = useMizan();

  const [type, setType] = useState<FeedbackType>(feedbackInitialType || "SARAN");
  const [category, setCategory] = useState<string>("Absensi Sholat");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isFeedbackModalOpen) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      setPathname(currentPath);
      setType(feedbackInitialType || "SARAN");
      setTitle("");
      setDescription("");
      setAiAnalysis(null);
      setEditablePrompt("");
      setIsCopied(false);
      setIsAnalyzing(false);
      setIsSubmitting(false);

      if (pathname.includes("absen")) {
        setCategory("Absensi Sholat");
      } else if (pathname.includes("rapor")) {
        setCategory("Rapor Santri & PDF");
      } else if (pathname.includes("penilaian")) {
        setCategory("Input Penilaian & Sikap");
      } else if (pathname.includes("santri")) {
        setCategory("Data Santri");
      } else if (pathname.includes("kelas")) {
        setCategory("Data Kelas & Wali");
      } else if (pathname.includes("ortu")) {
        setCategory("Portal Wali Santri");
      } else if (pathname.includes("login")) {
        setCategory("Login & Autentikasi");
      } else {
        setCategory("Dashboard Pondok");
      }
    }
  }, [isFeedbackModalOpen, feedbackInitialType]);

  if (!isFeedbackModalOpen) return null;

  const handleClose = () => {
    setIsFeedbackModalOpen(false);
  };

  const handleRunAiAnalysis = async () => {
    if (!title.trim() && !description.trim()) {
      showToast("Lengkapi judul atau deskripsi", "error");
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/feedback/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Temuan Bug",
          description: description.trim() || title.trim(),
          category,
          pageUrl: pathname,
          userRole: activeRole || "GUEST"
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data);
        setEditablePrompt(data.data.recommendationPrompt || "");
        showToast("Selesai", "success");
      } else {
        showToast("Gagal menganalisis", "error");
      }
    } catch {
      showToast("Koneksi gagal", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (!editablePrompt) return;
    try {
      await navigator.clipboard.writeText(editablePrompt);
      setIsCopied(true);
      showToast("Disalin", "info");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Judul wajib diisi", "error");
      return;
    }
    if (!description.trim()) {
      showToast("Deskripsi wajib diisi", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await addFeedback({
        type,
        category,
        title: title.trim(),
        description: description.trim(),
        pageUrl: pathname,
        userId: currentUser?.id || "",
        userName: currentUser?.name || "Pengguna",
        userRole: activeRole || "GUEST",
        aiAnalysis: aiAnalysis || undefined,
        customPrompt: editablePrompt.trim() || undefined
      });
      setIsFeedbackModalOpen(false);
    } catch {
      showToast("Gagal mengirim", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityColor = (sev: FeedbackSeverity) => {
    switch (sev) {
      case "Kritis":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Tinggi":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Sedang":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs select-none"
        onClick={handleClose}
      >
      <div
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-[#E2EBF4] dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-[#172033] dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EBF4] dark:border-slate-800 bg-[#FAF7EE]/60 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1B4D3E]/10 dark:bg-emerald-950/60 text-[#1B4D3E] dark:text-emerald-400 flex items-center justify-center font-bold">
              {type === "BUG" ? <Bug className="w-4 h-4" /> : <Lightbulb className="w-4 h-4 text-[#C5A059]" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033] dark:text-slate-100">
                {type === "BUG" ? "Lapor Kendala & Analisis Kode" : "Saran Pengembangan Sistem"}
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                {currentUser?.name ? `${currentUser.name} (${activeRole || "Pengguna"})` : "Pengguna Mizan"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-lg text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center p-1 bg-[#F5F1E8] dark:bg-slate-800 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setType("SARAN");
                setAiAnalysis(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === "SARAN" ? "bg-white dark:bg-slate-700 text-[#1B4D3E] dark:text-emerald-400 shadow-xs" : "text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-100"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Saran</span>
            </button>
            <button
              type="button"
              onClick={() => setType("BUG")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === "BUG" ? "bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs" : "text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-100"
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Bug</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl bg-white border border-[#CBD5E1] text-[#172033] focus:outline-hidden focus:border-[#1B4D3E]"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">Halaman</label>
              <input
                type="text"
                readOnly
                value={pathname}
                className="w-full h-9 px-3 text-xs rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#64748B] cursor-not-allowed font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              {type === "BUG" ? "Gejala Masalah" : "Judul Saran"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "BUG" ? "Contoh: Presensi Subuh gagal tersimpan" : "Contoh: Tambahkan tombol unduh per asrama"}
              className="w-full h-9 px-3 text-xs rounded-xl bg-white border border-[#CBD5E1] text-[#172033] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1B4D3E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              {type === "BUG" ? "Uraian & Kronologi Bug" : "Deskripsi Usulan"}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === "BUG"
                  ? "Jelaskan langkah yang memicu kendala, pesan galat, atau data yang hilang..."
                  : "Uraikan manfaat dan alur fitur yang diharapkan..."
              }
              className="w-full p-3 text-xs rounded-xl bg-white border border-[#CBD5E1] text-[#172033] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1B4D3E] resize-none"
            />
          </div>

          {type === "BUG" && (
            <div className="pt-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7EE] border border-[#E9DFCE]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#172033]">AI Code Inspector</h4>
                    <p className="text-[10px] text-[#64748B]">
                      Menganalisis berkas source code dan merumuskan prompt perbaikan teknis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleRunAiAnalysis}
                  className="px-3 py-1.5 rounded-lg bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B30] disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />}
                  <span>Analisis</span>
                </button>
              </div>

              {aiAnalysis && (
                <div className="mt-3 p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2">
                    <div className="flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-[#1B4D3E]" />
                      <span className="text-xs font-bold text-[#172033]">Hasil Diagnosa AI</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${severityColor(aiAnalysis.severity)}`}>
                      {aiAnalysis.severity}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[#475569]">Akar Masalah:</p>
                    <p className="text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                      {aiAnalysis.rootCause}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-[#475569] mb-1">Berkas Terkait:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysis.affectedFiles?.map((file, idx) => (
                        <span key={idx} className="font-mono text-[10px] bg-[#EEF2F6] text-[#1E293B] px-2 py-0.5 rounded-md border border-[#CBD5E1]">
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#475569]">
                        Prompt Perbaikan Kode (Dapat Diedit):
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        className="text-[10px] text-[#1B4D3E] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={editablePrompt}
                      onChange={(e) => setEditablePrompt(e.target.value)}
                      placeholder="Instruksi prompt teknis..."
                      className="w-full p-2.5 font-mono text-[11px] rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] focus:outline-hidden focus:border-[#1B4D3E] resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2EBF4]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B30] disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-[#C5A059]" />}
              <span>Kirim</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
