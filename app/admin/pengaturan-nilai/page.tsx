"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Bell,
  Sparkles,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Award,
  Loader2,
  Camera,
  Upload,
  Eye,
  X,
  Check,
  Building2,
  BookOpen,
  AlertCircle,
  Download
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { DEFAULT_SETTINGS, AppSettings } from "@/lib/mock-data";

export default function AdminPengaturanNilaiPage() {
  const { settings, updateSettings, showToast } = useMizan();
  const [formState, setFormState] = useState<AppSettings>(settings);
  const [applyToSantri, setApplyToSantri] = useState(false);
  const [applyToIndicators, setApplyToIndicators] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(settings?.appLogoUrl || "/logo.png");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormState({
        ...DEFAULT_SETTINGS,
        ...settings
      });
      if (settings.appLogoUrl) {
        setLogoPreview(settings.appLogoUrl);
      }
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      setIsUploadingLogo(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", "app-logo");

        const res = await fetch("/api/upload-avatar", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success && data.avatarUrl) {
          setFormState((prev) => ({ ...prev, appLogoUrl: data.avatarUrl }));
          setLogoPreview(data.avatarUrl);
          await updateSettings({ ...formState, appLogoUrl: data.avatarUrl });
          showToast("Logo berhasil diunggah", "success");
        } else {
          showToast(data.message || "Gagal mengunggah logo", "error");
        }
      } catch {
        showToast("Gagal mengunggah logo", "error");
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updatedState = {
      ...formState,
      popupUpdatedAt: new Date().toISOString()
    };
    setFormState(updatedState);
    await updateSettings(updatedState, {
      applyToSantri,
      applyToIndicators
    });
    setIsSaving(false);
  };

  const handleResetDefault = async () => {
    setFormState(DEFAULT_SETTINGS);
    setIsSaving(true);
    await updateSettings(DEFAULT_SETTINGS, {
      applyToSantri: false,
      applyToIndicators: false
    });
    setIsSaving(false);
    showToast("Pengaturan dikembalikan ke standar acuan", "info");
  };

  const formatDecimal = (val: number) => {
    return val.toFixed(3).replace(".", ",");
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                Konfigurasi Master
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1">
              Pengaturan Bobot & Nilai Santri
            </h1>
            <p className="text-[11px] text-[#64748B]">
              Atur standar nilai awal, ambang batas status akhlak, serta bobot desimal penalti dan apresiasi
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefault}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D4C9B5] bg-white text-[#5C6B64] hover:bg-[#FAF7F2] text-xs font-bold shrink-0 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <Card className="p-4 sm:p-5 bg-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
                Identitas Logo & Ikon Aplikasi
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Ikon resmi di header, kartu login, favicon, serta aplikasi mobile
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
              Utama
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-3xl mizan-card bg-[#1B4D3E] p-2 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
              <img
                src={logoPreview || formState.appLogoUrl || "/logo.png"}
                alt="Logo Preview"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Pilih Berkas Logo Baru
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="block w-full text-xs text-[#64748B] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-[#1B4D3E] file:text-white hover:file:bg-[#153e32] cursor-pointer disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Tautan Berkas Logo (URL)
                </label>
                <input
                  type="text"
                  value={formState.appLogoUrl || "/logo.png"}
                  onChange={(e) => {
                    setFormState({ ...formState, appLogoUrl: e.target.value });
                    setLogoPreview(e.target.value);
                  }}
                  placeholder="/logo.png"
                  className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card className="p-4 sm:p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#A8833E]" />
                  Pengumuman & Nasihat Popup (Modal Beranda)
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Tampilkan jendela popup pesan, tausiyah pimpinan, atau pengumuman santri yang dapat ditutup
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3 py-1.5 rounded-full border border-[#CBD5E1] hover:bg-[#FAF7EE] text-[11px] font-bold text-[#1B4D3E] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau</span>
                </button>

                <label className="inline-flex items-center gap-2 cursor-pointer bg-[#F8FAFC] px-3 py-1.5 rounded-full border border-[#E2EBF4]">
                  <input
                    type="checkbox"
                    checked={formState.popupActive ?? false}
                    onChange={(e) =>
                      setFormState({ ...formState, popupActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#CBD5E1] text-[#1B4D3E] focus:ring-[#1B4D3E]"
                  />
                  <span className={`text-xs font-bold ${formState.popupActive ? "text-[#065F46]" : "text-[#64748B]"}`}>
                    {formState.popupActive ? "Aktif" : "Nonaktif"}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                  Kategori Pesan
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#EEF2F6]">
                  {(["Nasihat", "Pengumuman", "Tausiyah", "Penting"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormState({ ...formState, popupType: t })}
                      className={`py-1.5 rounded-xl text-[10px] font-bold transition-all text-center ${
                        (formState.popupType || "Nasihat") === t
                          ? "bg-[#1B4D3E] text-white shadow-2xs"
                          : "text-[#64748B] hover:text-[#172033]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                  Sasaran Penerima
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#EEF2F6]">
                  {(["Semua", "GURU", "PENGASUHAN"] as const).map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => setFormState({ ...formState, popupTarget: target })}
                      className={`py-1.5 rounded-xl text-[10px] font-bold transition-all text-center ${
                        (formState.popupTarget || "Semua") === target
                          ? "bg-[#1B4D3E] text-white shadow-2xs"
                          : "text-[#64748B] hover:text-[#172033]"
                      }`}
                    >
                      {target === "Semua" ? "Semua" : target === "GURU" ? "Guru" : "BK"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                  Judul Pengumuman / Nasihat
                </label>
                <input
                  type="text"
                  value={formState.popupTitle || ""}
                  onChange={(e) => setFormState({ ...formState, popupTitle: e.target.value })}
                  placeholder="Contoh: Nasihat Kedisiplinan Sholat Berjamaah"
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none font-bold text-[#172033]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                  Pihak Pengirim / Penulis
                </label>
                <input
                  type="text"
                  value={formState.popupSender || ""}
                  onChange={(e) => setFormState({ ...formState, popupSender: e.target.value })}
                  placeholder="Contoh: Pimpinan Pesantren"
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none font-semibold text-[#172033]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                Isi Pesan / Nasihat / Arahan
              </label>
              <textarea
                rows={4}
                value={formState.popupMessage || ""}
                onChange={(e) => setFormState({ ...formState, popupMessage: e.target.value })}
                placeholder="Tuliskan arahan, tausiyah, atau pengumuman yang akan tampil di modal popup beranda pengguna..."
                className="w-full p-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033] font-medium leading-relaxed resize-none"
              />
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white space-y-4">
            <CardHeader
              title="Nilai Awal & Ambang Batas Status Santri"
              subtitle="Konfigurasi dinamis rentang skor untuk penentuan otomatis kategori akhlak santri"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C2826] mb-1">
                  Nilai Awal Standar (Desimal)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={formState.defaultBaseScore}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        defaultBaseScore: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-36 px-3 py-2 text-sm font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1B4D3E]"
                  />
                  <span className="text-xs text-[#5C6B64]">
                    Titik awal tahun ajaran
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2826] mb-1">
                  Batas Nilai Maksimum
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.001"
                    min="50"
                    max="100"
                    value={formState.maxScore || 100.0}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        maxScore: parseFloat(e.target.value) || 100.0
                      })
                    }
                    className="w-36 px-3 py-2 text-sm font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1B4D3E]"
                  />
                  <span className="text-xs text-[#5C6B64]">
                    Batas tertinggi akumulasi
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DECE] space-y-4">
              <div>
                <span className="text-xs font-bold text-[#1C2826] block">
                  Jenjang Ambang Batas Sanksi Disiplin Santri (Dinamis)
                </span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Buku Catatan Penilaian Sikap dan Perilaku Perorangan Pesantren Modern Raudhatussalam Mahato
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#854D0E]">
                      Tingkat 1: Peringatan Lisan
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-[#64748B]">Rentang:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.lisanMin ?? 51.0}
                        onChange={(e) => setFormState({ ...formState, lisanMin: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#854D0E] text-center"
                      />
                      <span>s/d</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.lisanThreshold ?? 69.0}
                        onChange={(e) => setFormState({ ...formState, lisanThreshold: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#854D0E] text-center"
                      />
                      <span className="text-[#64748B]">Poin</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Tindakan: Konseling ringan & peneguran langsung oleh staf pengasuhan santri.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#C2410C]">
                      Tingkat 2: Surat Peringatan 1 (SP 1)
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-[#64748B]">Rentang:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.sp1Min ?? 36.0}
                        onChange={(e) => setFormState({ ...formState, sp1Min: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#C2410C] text-center"
                      />
                      <span>s/d</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.sp1Threshold ?? 50.0}
                        onChange={(e) => setFormState({ ...formState, sp1Threshold: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#C2410C] text-center"
                      />
                      <span className="text-[#64748B]">Poin</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formState.sp1Action || "Pemanggilan santri, penulisan surat pengakuan & surat perjanjian, wali santri diinformasikan via WA"}
                    onChange={(e) => setFormState({ ...formState, sp1Action: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg text-[#172033]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#BE123C]">
                      Tingkat 3: Surat Peringatan 2 (SP 2)
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-[#64748B]">Rentang:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.sp2Min ?? 21.0}
                        onChange={(e) => setFormState({ ...formState, sp2Min: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#BE123C] text-center"
                      />
                      <span>s/d</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.sp2Threshold ?? 35.0}
                        onChange={(e) => setFormState({ ...formState, sp2Threshold: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#BE123C] text-center"
                      />
                      <span className="text-[#64748B]">Poin</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formState.sp2Action || "Pemanggilan orangtua/wali ke pesantren, hukuman khidmat/kebersihan khusus 3 hari"}
                    onChange={(e) => setFormState({ ...formState, sp2Action: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg text-[#172033]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#991B1B]">
                      Tingkat 4: Surat Peringatan 3 Terakhir (SP 3)
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-[#64748B]">Rentang:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.sp3Min ?? 6.0}
                        onChange={(e) => setFormState({ ...formState, sp3Min: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#991B1B] text-center"
                      />
                      <span>s/d</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.sp3Threshold ?? 20.0}
                        onChange={(e) => setFormState({ ...formState, sp3Threshold: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#991B1B] text-center"
                      />
                      <span className="text-[#64748B]">Poin</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formState.sp3Action || "Surat peringatan terakhir, sanksi botak (putra)/khimar (putri), hafalan Yasin, Al-Waqiah, Ar-Rahman, perjanjian bermaterai"}
                    onChange={(e) => setFormState({ ...formState, sp3Action: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg text-[#172033]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#450A0A]">
                      Tingkat 5: Pengembalian Santri
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-[#64748B]">Batas Poin:</span>
                      <span className="font-bold">0.0 s/d</span>
                      <input
                        type="number"
                        step="0.1"
                        value={formState.pengembalianThreshold ?? 5.0}
                        onChange={(e) => setFormState({ ...formState, pengembalianThreshold: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-md text-[#7F1D1D] text-center"
                      />
                      <span className="text-[#64748B]">Poin</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formState.pengembalianAction || "Santri dikembalikan secara resmi kepada orangtua (dikeluarkan dari pesantren)"}
                    onChange={(e) => setFormState({ ...formState, pengembalianAction: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg text-[#172033]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] space-y-3">
                <span className="text-xs font-bold text-[#1C2826] block">
                  Aturan Validasi & Hak Sanggah (Due Process)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                      Batas Waktu Pelaporan Pelanggaran / Prestasi (Jam)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={formState.inputTimeLimitHours ?? 48}
                        onChange={(e) => setFormState({ ...formState, inputTimeLimitHours: parseInt(e.target.value, 10) || 48 })}
                        className="w-24 px-2.5 py-1.5 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg text-[#1B4D3E]"
                      />
                      <span className="text-xs text-[#64748B]">Jam (Standar: 2 x 24 Jam)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                      Tenggat Hak Sanggah Santri (Jam)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="72"
                        value={formState.sanggahanTimeLimitHours ?? 24}
                        onChange={(e) => setFormState({ ...formState, sanggahanTimeLimitHours: parseInt(e.target.value, 10) || 24 })}
                        className="w-24 px-2.5 py-1.5 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg text-[#1B4D3E]"
                      />
                      <span className="text-xs text-[#64748B]">Jam (Standar: 1 x 24 Jam)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5DECE] flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C2826]">
                  <input
                    type="checkbox"
                    checked={applyToSantri}
                    onChange={(e) => setApplyToSantri(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D4C9B5] text-[#1B4D3E] focus:ring-[#1B4D3E]"
                  />
                  <span>Terapkan ambang batas dan perbarui status 249 santri saat disimpan</span>
                </label>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white space-y-4">
            <CardHeader
              title="Bobot Penalti Pelanggaran Desimal (Sayyi'ah)"
              subtitle="Pengurangan poin standar saat pencatatan kejadian pelanggaran santri"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-[#FEF08A] bg-[#FEFCE8]/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#854D0E]">
                    Pelanggaran Ringan
                  </span>
                  <TrendingDown className="w-4 h-4 text-[#854D0E]" />
                </div>
                <input
                  type="number"
                  step="0.001"
                  max="0"
                  value={formState.penaltyRingan}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      penaltyRingan: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-xl text-[#9B2C2C] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] block">
                  Standar desimal: -0,050
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#FDBA74] bg-[#FFF7ED]/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C2410C]">
                    Pelanggaran Sedang
                  </span>
                  <TrendingDown className="w-4 h-4 text-[#C2410C]" />
                </div>
                <input
                  type="number"
                  step="0.001"
                  max="0"
                  value={formState.penaltySedang}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      penaltySedang: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-xl text-[#9B2C2C] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] block">
                  Standar desimal: -0,100
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#9B2C2C]/30 bg-[#FDF2F2]/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9B2C2C]">
                    Pelanggaran Berat
                  </span>
                  <TrendingDown className="w-4 h-4 text-[#9B2C2C]" />
                </div>
                <input
                  type="number"
                  step="0.001"
                  max="0"
                  value={formState.penaltyBerat}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      penaltyBerat: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-xl text-[#9B2C2C] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] block">
                  Standar desimal: -0,250
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white space-y-4">
            <CardHeader
              title="Apresiasi Kebaikan Desimal (Hasanah)"
              subtitle="Penambahan poin standar saat santri berinisiatif melakukan amal kebajikan"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-[#1B4D3E]/20 bg-[#E8F0EC]/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B4D3E]">
                    Hasanah Ringan
                  </span>
                  <TrendingUp className="w-4 h-4 text-[#1B4D3E]" />
                </div>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formState.bonusRingan}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      bonusRingan: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-xl text-[#1B4D3E] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] block">
                  Standar desimal: +0,050
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#1B4D3E]/20 bg-[#E8F0EC]/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B4D3E]">
                    Hasanah Sedang
                  </span>
                  <TrendingUp className="w-4 h-4 text-[#1B4D3E]" />
                </div>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formState.bonusSedang}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      bonusSedang: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-xl text-[#1B4D3E] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] block">
                  Standar desimal: +0,100
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#C5A059]/40 bg-[#FAF7EE] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A8833E]">
                    Hasanah Besar
                  </span>
                  <Award className="w-4 h-4 text-[#A8833E]" />
                </div>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formState.bonusBesar}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      bonusBesar: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-xl text-[#A8833E] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] block">
                  Standar desimal: +0,234
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5DECE]">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C2826]">
                <input
                  type="checkbox"
                  checked={applyToIndicators}
                  onChange={(e) => setApplyToIndicators(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D4C9B5] text-[#1B4D3E] focus:ring-[#1B4D3E]"
                />
                <span>Perbarui seluruh bobot master indikator penilaian sesuai angka di atas</span>
              </label>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white space-y-4">
            <CardHeader
              title="Bobot Poin Presensi Sholat"
              subtitle="Konfigurasi penambahan dan pengurangan skor adab santri berdasarkan kehadiran 7 waktu sholat"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]/60">
                <label className="block text-xs font-bold text-[#065F46]">
                  Poin Hadir (+)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formState.absenHadirScore ?? 0.05}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      absenHadirScore: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-[#A7F3D0] rounded-xl text-[#065F46] focus:outline-none"
                />
                <span className="text-[10px] text-[#047857] block font-medium">
                  Default: +0,050 / sholat
                </span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]/60">
                <label className="block text-xs font-bold text-[#92400E]">
                  Poin Izin
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formState.absenIzinScore ?? 0}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      absenIzinScore: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-[#FDE68A] rounded-xl text-[#92400E] focus:outline-none"
                />
                <span className="text-[10px] text-[#B45309] block font-medium">
                  Default: 0,000 (Netral)
                </span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE]/60">
                <label className="block text-xs font-bold text-[#1E40AF]">
                  Poin Sakit
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formState.absenSakitScore ?? 0}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      absenSakitScore: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-[#BFDBFE] rounded-xl text-[#1E40AF] focus:outline-none"
                />
                <span className="text-[10px] text-[#1D4ED8] block font-medium">
                  Default: 0,000 (Netral)
                </span>
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]/60">
                <label className="block text-xs font-bold text-[#991B1B]">
                  Poin Alpa (-)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formState.absenAlpaScore ?? -0.05}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      absenAlpaScore: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-[#FECACA] rounded-xl text-[#991B1B] focus:outline-none"
                />
                <span className="text-[10px] text-[#B91C1C] block font-medium">
                  Default: -0,050 / sholat
                </span>
              </div>
            </div>

            <div className="mizan-card-sub p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <span className="text-[#64748B]">Simulasi 7 Waktu Sholat:</span>
              <div className="flex items-center gap-3 font-mono font-bold">
                <span className="text-[#065F46]">
                  7x Hadir = +{((formState.absenHadirScore ?? 0.05) * 7).toFixed(3)}
                </span>
                <span className="text-[#991B1B]">
                  1x Alpa = {(formState.absenAlpaScore ?? -0.05).toFixed(3)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white space-y-4">
            <CardHeader
              title="Pemberitahuan & Sinkronisasi"
              subtitle="Pengaturan alur informasi bagi asatidzah, santri, serta wali santri"
            />

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.notifyParents}
                  onChange={(e) =>
                    setFormState({ ...formState, notifyParents: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-[#D4C9B5] text-[#1B4D3E] focus:ring-[#1B4D3E]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1C2826] flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#C5A059]" />
                    Pemberitahuan Wali Santri
                  </span>
                  <p className="text-[11px] text-[#5C6B64] mt-0.5">
                    Kirim informasi otomatis saat santri menerima catatan pelanggaran atau hasanah baru.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.realtimeSimulation}
                  onChange={(e) =>
                    setFormState({ ...formState, realtimeSimulation: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-[#D4C9B5] text-[#1B4D3E] focus:ring-[#1B4D3E]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1C2826] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    Pembaruan Langsung
                  </span>
                  <p className="text-[11px] text-[#5C6B64] mt-0.5">
                    Perubahan nilai di modul asatidzah langsung terbarui pada seluruh perangkat pengasuhan dan wali santri.
                  </p>
                </div>
              </label>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan</span>
            </button>
          </div>
        </form>

        <Card className="p-4 sm:p-5 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EEF2F6]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                  Format JSON
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#172033] mt-1">
                Cadangan Data
              </h2>
              <p className="text-xs text-[#64748B]">
                Unduh seluruh data santri, presensi, penilaian, dan konfigurasi dalam format berkas JSON.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/admin/backup?download=1"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1B4D3E] text-white hover:bg-[#153e32] text-xs font-bold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Santri</span>
              <span className="font-mono text-base font-black text-[#1B4D3E]">249</span>
              <a
                href="/api/admin/backup?scope=santri&download=1"
                className="mt-2 block text-[10px] font-bold text-[#1B4D3E] hover:underline"
              >
                Santri
              </a>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Kelas</span>
              <span className="font-mono text-base font-black text-[#1B4D3E]">12</span>
              <span className="mt-2 block text-[10px] font-bold text-[#94A3B8]">Terdaftar</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Presensi</span>
              <span className="font-mono text-base font-black text-[#065F46]">Aktif</span>
              <a
                href="/api/admin/backup?scope=absensi&download=1"
                className="mt-2 block text-[10px] font-bold text-[#065F46] hover:underline"
              >
                Presensi
              </a>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Penilaian</span>
              <span className="font-mono text-base font-black text-[#C5A059]">Baku</span>
              <a
                href="/api/admin/backup?scope=penilaian&download=1"
                className="mt-2 block text-[10px] font-bold text-[#A8833E] hover:underline"
              >
                Penilaian
              </a>
            </div>
          </div>
        </Card>

        {showPreviewModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#C5A059]/40 relative space-y-4 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#1B4D3E] via-[#C5A059] to-[#1B4D3E]" />

              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 flex items-center justify-center shrink-0 shadow-2xs">
                    {(formState.popupType || "Nasihat") === "Nasihat" ? (
                      <Sparkles className="w-5 h-5 text-[#C5A059]" />
                    ) : (formState.popupType || "Nasihat") === "Pengumuman" ? (
                      <Bell className="w-5 h-5 text-[#1B4D3E]" />
                    ) : (formState.popupType || "Nasihat") === "Tausiyah" ? (
                      <BookOpen className="w-5 h-5 text-[#A8833E]" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/30">
                      {formState.popupType || "Nasihat"}
                    </span>
                    <p className="text-[10px] text-[#94A3B8] font-bold mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {formState.popupSender || "Pimpinan Pesantren"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-xl hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#172033] transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 border-y border-[#F1F5F9] py-3.5 max-h-[55vh] overflow-y-auto pr-1">
                <h2 className="text-base sm:text-lg font-serif font-black text-[#172033] leading-snug">
                  {formState.popupTitle || "Judul Pengumuman / Nasihat"}
                </h2>
                <div className="text-xs text-[#475569] leading-relaxed whitespace-pre-line font-medium">
                  {formState.popupMessage || "Isi pengumuman atau nasihat akan tampil di sini..."}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[10px] text-[#94A3B8] italic truncate">
                  Pesantren Modern Raudhatussalam Mahato
                </p>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tutup</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
