"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Sparkles,
  Check,
  Copy,
  Trash2,
  Clock,
  User,
  MapPin,
  FileCode2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Portal } from "@/components/ui/Portal";
import { FeedbackRecord, FeedbackStatus, FeedbackType, FeedbackSeverity } from "@/lib/mock-data";

export default function AdminFeedbackPage() {
  const {
    feedbackList,
    updateFeedbackStatus,
    deleteFeedback,
    refreshData,
    openFeedbackModal,
    showToast
  } = useMizan();

  const [activeTab, setActiveTab] = useState<"ALL" | FeedbackType>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);
  const [editStatus, setEditStatus] = useState<FeedbackStatus>("Baru");
  const [editAdminNotes, setEditAdminNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const stats = useMemo(() => {
    const total = feedbackList.length;
    const bugCount = feedbackList.filter((f) => f.type === "BUG").length;
    const saranCount = feedbackList.filter((f) => f.type === "SARAN").length;
    const pendingCount = feedbackList.filter((f) => f.status === "Baru" || f.status === "Ditinjau").length;
    const resolvedCount = feedbackList.filter((f) => f.status === "Selesai").length;
    return { total, bugCount, saranCount, pendingCount, resolvedCount };
  }, [feedbackList]);

  const filteredList = useMemo(() => {
    return feedbackList.filter((item) => {
      if (activeTab !== "ALL" && item.type !== activeTab) return false;
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchUser = item.userName?.toLowerCase().includes(q);
        const matchCat = item.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchUser && !matchCat) return false;
      }
      return true;
    });
  }, [feedbackList, activeTab, selectedStatus, searchQuery]);

  const handleOpenDetail = (item: FeedbackRecord) => {
    setSelectedFeedback(item);
    setEditStatus(item.status);
    setEditAdminNotes(item.adminNotes || "");
    setIsCopied(false);
  };

  const handleSaveStatus = async () => {
    if (!selectedFeedback) return;
    setIsUpdating(true);
    try {
      await updateFeedbackStatus(selectedFeedback.id, editStatus, editAdminNotes);
      setSelectedFeedback((prev) =>
        prev ? { ...prev, status: editStatus, adminNotes: editAdminNotes } : null
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyPrompt = async (promptText: string) => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setIsCopied(true);
      showToast("Disalin", "info");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin", "error");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteFeedback(id);
    if (selectedFeedback?.id === id) {
      setSelectedFeedback(null);
    }
    setDeleteConfirmId(null);
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case "Baru":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Ditinjau":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Diproses":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Selesai":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Ditolak":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getSeverityBadge = (sev: FeedbackSeverity) => {
    switch (sev) {
      case "Kritis":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "Tinggi":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Sedang":
        return "bg-sky-100 text-sky-800 border-sky-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <RoleShell>
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-[#E2EBF4] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#1B4D3E]/10 text-[#1B4D3E]">
                <MessageSquare className="w-5 h-5 text-[#1B4D3E]" />
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[#172033]">
                Manajemen Feedback & Laporan Bug
              </h1>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Rekapitulasi masukan santri, asatidzah, wali, serta diagnosa mendalam AI Code Inspector.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshData()}
              className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan</span>
            </button>
            <button
              type="button"
              onClick={() => openFeedbackModal("SARAN")}
              className="px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B30] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B]">Total Masukan</span>
            <p className="text-xl font-bold text-[#172033] mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs">
            <span className="text-[11px] font-bold text-rose-700">Laporan Bug</span>
            <p className="text-xl font-bold text-rose-700 mt-1">{stats.bugCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs">
            <span className="text-[11px] font-bold text-[#A8833E]">Saran Fitur</span>
            <p className="text-xl font-bold text-[#A8833E] mt-1">{stats.saranCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs">
            <span className="text-[11px] font-bold text-amber-700">Menunggu Tindakan</span>
            <p className="text-xl font-bold text-amber-700 mt-1">{stats.pendingCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] shadow-xs col-span-2 lg:col-span-1">
            <span className="text-[11px] font-bold text-[#065F46] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />
              <span>Sudah Diperbaiki</span>
            </span>
            <p className="text-xl font-bold text-[#065F46] mt-1">{stats.resolvedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#E2EBF4] shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center p-1 bg-[#F5F1E8] rounded-xl gap-1 w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "ALL" ? "bg-white text-[#1B4D3E] shadow-xs" : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("BUG")}
                className={`py-1 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "BUG" ? "bg-white text-rose-700 shadow-xs" : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Bug</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SARAN")}
                className={`py-1 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "SARAN" ? "bg-white text-[#1B4D3E] shadow-xs" : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Saran</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari judul atau pengirim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-white border border-[#CBD5E1] text-[#172033] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1B4D3E]"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-8 px-2.5 text-xs rounded-xl bg-white border border-[#CBD5E1] text-[#172033] focus:outline-hidden focus:border-[#1B4D3E]"
              >
                <option value="ALL">Semua Status</option>
                <option value="Baru">Baru</option>
                <option value="Ditinjau">Ditinjau</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] text-[#64748B]">
              <MessageSquare className="w-8 h-8 mx-auto text-[#94A3B8] mb-2 opacity-50" />
              <p className="text-xs font-semibold">Belum ada data feedback yang sesuai filter.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border border-[#E2EBF4] hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.status === "Selesai"
                      ? "border-l-4 border-l-emerald-600 bg-emerald-50/20"
                      : "bg-[#FAF7EE]/40"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          item.type === "BUG"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-[#FAF7EE] text-[#1B4D3E] border-[#C5A059]/40"
                        }`}
                      >
                        {item.type === "BUG" ? <Bug className="w-3 h-3" /> : <Lightbulb className="w-3 h-3 text-[#C5A059]" />}
                        <span>{item.type}</span>
                      </span>

                      {item.status === "Selesai" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sudah Diperbaiki</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      )}

                      {item.aiAnalysis?.severity && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSeverityBadge(item.aiAnalysis.severity)}`}>
                          Tingkat: {item.aiAnalysis.severity}
                        </span>
                      )}

                      <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.createdAt}</span>
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#172033] truncate">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#475569] line-clamp-1">
                      {item.description}
                    </p>

                    {item.adminNotes && (
                      <div className="mt-2 p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            Catatan Perbaikan / Tindak Lanjut:
                          </span>
                          <span className="text-xs text-emerald-950 font-medium">{item.adminNotes}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] pt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3 h-3 text-[#94A3B8]" />
                        <span>{item.userName || "Pengguna"} ({item.userRole || "GUEST"})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-[#1B4D3E]">{item.category}</span>
                      </span>
                      {item.pageUrl && (
                        <span className="font-mono text-[10px] text-[#94A3B8] bg-white px-1.5 py-0.5 rounded border border-[#E2EBF4]">
                          {item.pageUrl}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {item.status !== "Selesai" ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await updateFeedbackStatus(item.id, "Selesai", "Telah diperbaiki dan diverifikasi oleh sistem.");
                          showToast("Status diubah menjadi Sudah Diperbaiki", "success");
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Tandai Sudah Diperbaiki"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Tandai Selesai</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Selesai</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenDetail(item)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#1B4D3E] hover:bg-[#FAF7EE] transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedFeedback && (
          <Portal>
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs select-none"
              onClick={() => setSelectedFeedback(null)}
            >
            <div
              className="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl border border-[#E2EBF4] shadow-2xl flex flex-col overflow-hidden text-[#172033] animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EBF4] bg-[#FAF7EE]/60">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-1.5 rounded-lg border ${
                      selectedFeedback.type === "BUG"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-[#FAF7EE] text-[#1B4D3E] border-[#C5A059]/40"
                    }`}
                  >
                    {selectedFeedback.type === "BUG" ? <Bug className="w-4 h-4" /> : <Lightbulb className="w-4 h-4 text-[#C5A059]" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      Rincian {selectedFeedback.type === "BUG" ? "Laporan Bug" : "Saran Pengembangan"}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">ID: {selectedFeedback.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="px-3 py-1 text-xs font-bold text-[#64748B] hover:text-[#172033] cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] space-y-2">
                  <h4 className="text-sm font-bold text-[#172033]">{selectedFeedback.title}</h4>
                  <p className="text-xs text-[#334155] whitespace-pre-wrap leading-relaxed">
                    {selectedFeedback.description}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E2EBF4] text-[11px]">
                    <div>
                      <span className="text-[#94A3B8] block">Pengirim:</span>
                      <span className="font-semibold text-[#1E293B]">{selectedFeedback.userName}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block">Wewenang:</span>
                      <span className="font-semibold text-[#1E293B]">{selectedFeedback.userRole}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block">Kategori:</span>
                      <span className="font-semibold text-[#1B4D3E]">{selectedFeedback.category}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block">Waktu:</span>
                      <span className="font-semibold text-[#1E293B]">{selectedFeedback.createdAt}</span>
                    </div>
                  </div>
                </div>

                {selectedFeedback.aiAnalysis && (
                  <div className="p-4 rounded-2xl bg-white border border-[#CBD5E1] shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-xs font-bold text-[#172033]">Hasil Analisis AI Code Inspector</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSeverityBadge(selectedFeedback.aiAnalysis.severity)}`}>
                        {selectedFeedback.aiAnalysis.severity}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#475569]">Akar Masalah Arsitektur:</span>
                      <p className="text-xs text-[#334155] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
                        {selectedFeedback.aiAnalysis.rootCause}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-[#475569] block mb-1">Berkas Terkait:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedFeedback.aiAnalysis.affectedFiles?.map((file, idx) => (
                          <span key={idx} className="font-mono text-[10px] bg-[#EEF2F6] text-[#1E293B] px-2 py-0.5 rounded-md border border-[#CBD5E1]">
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(selectedFeedback.customPrompt || selectedFeedback.aiAnalysis.recommendationPrompt) && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#475569]">
                            Prompting Teknis Perbaikan:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyPrompt(
                                selectedFeedback.customPrompt ||
                                  selectedFeedback.aiAnalysis?.recommendationPrompt ||
                                  ""
                              )
                            }
                            className="text-[10px] text-[#1B4D3E] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>Salin</span>
                          </button>
                        </div>
                        <pre className="w-full p-2.5 font-mono text-[11px] rounded-xl bg-[#0F172A] text-[#F8FAFC] whitespace-pre-wrap overflow-x-auto max-h-48 leading-relaxed">
                          {selectedFeedback.customPrompt || selectedFeedback.aiAnalysis.recommendationPrompt}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E9DFCE] space-y-3">
                  <h4 className="text-xs font-bold text-[#172033]">Status & Penanganan Admin</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#475569] mb-1">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as FeedbackStatus)}
                        className="w-full h-9 px-3 text-xs rounded-xl bg-white border border-[#CBD5E1] text-[#172033] focus:outline-hidden focus:border-[#1B4D3E]"
                      >
                        <option value="Baru">Baru</option>
                        <option value="Ditinjau">Ditinjau</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#475569] mb-1">Catatan Tindak Lanjut</label>
                      <input
                        type="text"
                        value={editAdminNotes}
                        onChange={(e) => setEditAdminNotes(e.target.value)}
                        placeholder="Contoh: Telah diperbaiki pada patch v1.2"
                        className="w-full h-9 px-3 text-xs rounded-xl bg-white border border-[#CBD5E1] text-[#172033] focus:outline-hidden focus:border-[#1B4D3E]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={handleSaveStatus}
                      className="px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B30] disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-[#C5A059]" />}
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end px-5 py-3 border-t border-[#E2EBF4] bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-white transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
          </Portal>
        )}

        {deleteConfirmId && (
          <Portal>
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none"
              onClick={() => setDeleteConfirmId(null)}
            >
              <div
                className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E2EBF4] shadow-2xl space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="text-sm font-bold text-[#172033]">Hapus Feedback</h4>
                <p className="text-xs text-[#64748B]">Apakah Anda yakin ingin menghapus data masukan ini?</p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="px-4 py-1.5 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </RoleShell>
  );
}
