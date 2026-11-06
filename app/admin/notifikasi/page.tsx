"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Edit,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sliders,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Shield,
  Layers,
  Clock,
  Radio,
  Settings2
} from "lucide-react";
import { useMizan, MizanNotification } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { NotificationCategory, NotificationType } from "@/lib/mock-data";

interface NotificationFormData {
  id?: string;
  title: string;
  message: string;
  category: NotificationCategory;
  type: NotificationType;
  link: string;
  isActive: boolean;
  targetRole: "ALL" | "SUPER_ADMIN" | "PENGASUHAN" | "GURU" | "ORTU";
}

const CATEGORIES: NotificationCategory[] = [
  "Evaluasi Rapor",
  "Presensi Sholat",
  "Peringatan Disiplin",
  "Pengumuman Pondok"
];

const INITIAL_FORM_DATA: NotificationFormData = {
  title: "",
  message: "",
  category: "Pengumuman Pondok",
  type: "info",
  link: "",
  isActive: true,
  targetRole: "ALL"
};

export default function AdminNotificationPage() {
  const {
    notificationList,
    readNotifIds,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotificationActive,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshData,
    settings,
    updateSettings,
    showToast
  } = useMizan();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "UNREAD">("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NotificationFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [thresholdScore, setThresholdScore] = useState<number>(settings?.minScorePerhatian ?? 65);
  const [thresholdAlpa, setThresholdAlpa] = useState<number>(3);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const stats = useMemo(() => {
    const total = notificationList.length;
    const unread = notificationList.filter((n) => !readNotifIds.includes(n.id)).length;
    const active = notificationList.filter((n) => n.isActive).length;
    const urgent = notificationList.filter((n) => n.type === "urgent" || n.type === "warning").length;
    return { total, unread, active, urgent };
  }, [notificationList, readNotifIds]);

  const filteredNotifications = useMemo(() => {
    return notificationList.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
      if (selectedType !== "ALL" && item.type !== selectedType) return false;
      if (selectedStatus === "ACTIVE" && !item.isActive) return false;
      if (selectedStatus === "INACTIVE" && item.isActive) return false;
      if (selectedStatus === "UNREAD" && readNotifIds.includes(item.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMessage = item.message.toLowerCase().includes(q);
        const matchCat = (item.category || "").toLowerCase().includes(q);
        if (!matchTitle && !matchMessage && !matchCat) return false;
      }
      return true;
    });
  }, [notificationList, selectedCategory, selectedType, selectedStatus, searchQuery, readNotifIds]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MizanNotification) => {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      title: item.title,
      message: item.message,
      category: item.category || "Pengumuman Pondok",
      type: item.type || "info",
      link: item.link || "",
      isActive: item.isActive ?? true,
      targetRole: item.targetRole || "ALL"
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Judul notifikasi wajib diisi", "error");
      return;
    }
    if (!formData.message.trim()) {
      showToast("Pesan notifikasi wajib diisi", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateNotification(editingId, {
          title: formData.title.trim(),
          message: formData.message.trim(),
          category: formData.category,
          type: formData.type,
          link: formData.link.trim(),
          isActive: formData.isActive,
          targetRole: formData.targetRole
        });
      } else {
        await addNotification({
          title: formData.title.trim(),
          message: formData.message.trim(),
          category: formData.category,
          type: formData.type,
          link: formData.link.trim(),
          isActive: formData.isActive,
          targetRole: formData.targetRole,
          time: "Baru saja"
        });
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteNotification(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAutomationSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSettings({
        minScorePerhatian: thresholdScore
      });
      showToast("Pengaturan disimpan", "success");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getTypeStyle = (type: NotificationType) => {
    switch (type) {
      case "urgent":
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
          badge: "bg-rose-50 border-rose-200 text-rose-700",
          accent: "border-l-rose-500"
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          badge: "bg-amber-50 border-amber-200 text-amber-800",
          accent: "border-l-amber-500"
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          badge: "bg-emerald-50 border-emerald-200 text-emerald-800",
          accent: "border-l-emerald-500"
        };
      case "info":
      default:
        return {
          icon: <FileText className="w-4 h-4 text-[#A8833E]" />,
          badge: "bg-[#FAF7EE] border-[#C5A059]/30 text-[#A8833E]",
          accent: "border-l-[#1B4D3E]"
        };
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-5 pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              Manajemen Notifikasi
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Kelola peringatan evaluasi rapor santri, presensi sholat, kedisiplinan adab, dan pengumuman terpadu
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              href="/admin/notifikasi/tambah"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </Link>

            {stats.unread > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D4C9B5] text-[#172033] hover:bg-[#FAF7EE] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#065F46]" />
                <span>Baca</span>
              </button>
            )}

            <button
              type="button"
              onClick={refreshData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#D4C9B5] text-[#172033] hover:bg-[#FAF7EE] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#A8833E]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="mizan-card p-4 bg-white border border-[#E2EBF4] shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
              <div className="w-7 h-7 rounded-lg bg-[#FAF7EE] text-[#1B4D3E] flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-[#172033]">{stats.total}</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Notifikasi tersimpan</p>
          </div>

          <div className="mizan-card p-4 bg-white border border-[#E2EBF4] shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Belum Dibaca</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-[#B91C1C]">{stats.unread}</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Memerlukan atensi</p>
          </div>

          <div className="mizan-card p-4 bg-white border border-[#E2EBF4] shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Mendesak</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-rose-700">{stats.urgent}</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Peringatan khusus</p>
          </div>

          <div className="mizan-card p-4 bg-white border border-[#E2EBF4] shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Aktif</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#065F46] flex items-center justify-center">
                <Radio className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-[#065F46]">{stats.active}</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Tayang di header</p>
          </div>
        </div>

        <div className="mizan-card p-4 bg-white border border-[#E2EBF4] space-y-3.5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, pesan, atau kategori..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] font-medium focus:outline-none"
              >
                <option value="ALL">Status: Semua</option>
                <option value="ACTIVE">Status: Aktif</option>
                <option value="INACTIVE">Status: Nonaktif</option>
                <option value="UNREAD">Status: Belum Dibaca</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] font-medium focus:outline-none"
              >
                <option value="ALL">Urgensi: Semua</option>
                <option value="urgent">Mendesak</option>
                <option value="warning">Peringatan</option>
                <option value="success">Sukses</option>
                <option value="info">Informasi</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-[#1B4D3E] text-white"
                  : "bg-[#FAF7EE] text-[#172033] hover:bg-[#F2ECE0] border border-[#E2EBF4]"
              }`}
            >
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#1B4D3E] text-white"
                    : "bg-[#FAF7EE] text-[#172033] hover:bg-[#F2ECE0] border border-[#E2EBF4]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="mizan-card p-10 bg-white border border-[#E2EBF4] text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7EE] text-[#A8833E] flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#172033]">Tidak Ada Notifikasi</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Tidak ditemukan data notifikasi yang sesuai dengan kriteria filter pencarian.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const typeCfg = getTypeStyle(item.type);
              const isUnread = !readNotifIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`mizan-card p-4 bg-white border border-[#E2EBF4] shadow-2xs hover:shadow-sm transition-all border-l-4 ${typeCfg.accent}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-xl bg-[#FAF7EE] shrink-0 mt-0.5">
                        {typeCfg.icon}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeCfg.badge}`}>
                            {item.category || "Umum"}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-[#D4C9B5] text-[#172033]">
                            Penerima: {item.targetRole || "ALL"}
                          </span>

                          {isUnread && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-600 text-white animate-pulse">
                              Baru
                            </span>
                          )}

                          <span className="text-[10px] text-[#94A3B8] font-mono">
                            {item.time || item.createdAt || "Terkini"}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[#172033] leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-[#475569] leading-relaxed">
                          {item.message}
                        </p>

                        {item.link && (
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B4D3E] hover:underline">
                              <span>Tautan: {item.link}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F9] w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => toggleNotificationActive(item.id, Boolean(item.isActive))}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={item.isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
                      >
                        {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.isActive ? "Aktif" : "Nonaktif"}</span>
                      </button>

                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => markNotificationAsRead(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#D4C9B5] text-[#172033] hover:bg-[#FAF7EE] text-xs font-bold transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-[#A8833E]" />
                          <span>Buka</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#D4C9B5] text-[#172033] hover:bg-[#FAF7EE] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Edit className="w-3 h-3 text-[#1B4D3E]" />
                        <span>Ubah</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mizan-card p-5 bg-white border border-[#E2EBF4] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7EE] text-[#1B4D3E] flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172033]">
                Pengaturan Peringatan & Evaluasi Otomatis
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Tetapkan ambang batas pemicu otomatis notifikasi pembinaan dan rapor santri
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-[#FAF7EE]/60 border border-[#C5A059]/20 space-y-2">
              <label className="text-xs font-bold text-[#172033] block">
                Ambang Batas Skor Perhatian Pembinaan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="40"
                  max="90"
                  value={thresholdScore}
                  onChange={(e) => setThresholdScore(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-[#D4C9B5] bg-white text-[#172033]"
                />
                <span className="text-xs text-[#64748B]">
                  Santri dengan skor di bawah nilai ini dikategorikan batas perhatian khusus
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7EE]/60 border border-[#C5A059]/20 space-y-2">
              <label className="text-xs font-bold text-[#172033] block">
                Toleransi Alpa Presensi Sholat
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={thresholdAlpa}
                  onChange={(e) => setThresholdAlpa(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-[#D4C9B5] bg-white text-[#172033]"
                />
                <span className="text-xs text-[#64748B]">
                  Pemberitahuan muncul jika santri alpa sholat mencapai angka batas ini
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={isSavingSettings}
              onClick={handleSaveAutomationSettings}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{isSavingSettings ? "Proses" : "Simpan"}</span>
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2EBF4] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-5 py-4 bg-[#FAF7EE] border-b border-[#C5A059]/30 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#172033]">
                    {editingId ? "Ubah Notifikasi" : "Tambah Notifikasi"}
                  </h2>
                  <p className="text-[11px] text-[#64748B]">
                    Informasi tayang pada header lonceng pengguna
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033] block">
                    Judul Pemberitahuan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Evaluasi Rapor Santri Semester Genap"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033] block">
                    Pesan Lengkap
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Rincian informasi atau arahan untuk santri dan pembina..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033] block">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as NotificationCategory })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033] block">
                      Tingkat Urgensi
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationType })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none"
                    >
                      <option value="info">Informasi (Kuning)</option>
                      <option value="success">Sukses (Hijau)</option>
                      <option value="warning">Peringatan (Oranye)</option>
                      <option value="urgent">Mendesak (Merah)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033] block">
                      Target Penerima
                    </label>
                    <select
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none"
                    >
                      <option value="ALL">Semua Pengguna</option>
                      <option value="SUPER_ADMIN">Super Admin Saja</option>
                      <option value="PENGASUHAN">Pengasuhan (BK)</option>
                      <option value="GURU">Pembina / Asatidzah</option>
                      <option value="ORTU">Wali Santri</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033] block">
                      Status Tayang
                    </label>
                    <div className="pt-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-[#1B4D3E] focus:ring-[#1B4D3E] border-[#D4C9B5]"
                        />
                        <span className="text-xs font-bold text-[#172033]">Aktifkan Notifikasi</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033] block">
                    Tautan Halaman Tujuan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="Contoh: /admin/rapor atau /admin/santri"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                  />
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap text-[10px]">
                    <span className="text-[#64748B]">Pintasan:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, link: "/admin/rapor" })}
                      className="px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-[#D4C9B5] text-[#1B4D3E] hover:bg-white"
                    >
                      /admin/rapor
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, link: "/admin/santri" })}
                      className="px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-[#D4C9B5] text-[#1B4D3E] hover:bg-white"
                    >
                      /admin/santri
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, link: "/admin/absensi" })}
                      className="px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-[#D4C9B5] text-[#1B4D3E] hover:bg-white"
                    >
                      /admin/absensi
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2EBF4]">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3.5 py-2 rounded-xl border border-[#D4C9B5] bg-white text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Proses" : "Simpan"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E2EBF4] p-5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-[#172033]">Hapus Notifikasi?</h3>
                <p className="text-xs text-[#64748B]">
                  Pemberitahuan ini akan dihapus permanen dari daftar dan header seluruh pengguna.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="px-4 py-2 rounded-xl border border-[#D4C9B5] bg-white text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span>{isDeleting ? "Proses" : "Hapus"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
