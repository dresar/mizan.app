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
  Upload
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
    await updateSettings(formState, {
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

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DECE] space-y-3">
              <span className="text-xs font-bold text-[#1C2826] block">
                Konfigurasi Ambang Batas Kategori Akhlak (Dinamis)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] space-y-1.5">
                  <span className="text-xs font-bold text-[#065F46] block">
                    Batas Minimum Kategori Baik
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="100"
                      value={formState.minScoreBaik || 80.0}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          minScoreBaik: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-28 px-2.5 py-1.5 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg text-[#065F46] focus:outline-none focus:border-[#1B4D3E]"
                    />
                    <span className="text-[11px] text-[#5C6B64]">
                      Skor ≥ {formatDecimal(formState.minScoreBaik || 80.0)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B]">
                    Santri berstatus Baik jika nilai mencapai atau melampaui batas ini.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D4C9B5] space-y-1.5">
                  <span className="text-xs font-bold text-[#854D0E] block">
                    Batas Minimum Kategori Perhatian
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="100"
                      value={formState.minScorePerhatian || 70.0}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          minScorePerhatian: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-28 px-2.5 py-1.5 text-xs font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg text-[#854D0E] focus:outline-none focus:border-[#1B4D3E]"
                    />
                    <span className="text-[11px] text-[#5C6B64]">
                      Skor ≥ {formatDecimal(formState.minScorePerhatian || 70.0)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B]">
                    Santri di bawah {formatDecimal(formState.minScorePerhatian || 70.0)} otomatis masuk kategori Perlu Pembinaan.
                  </p>
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
                  <span>Terapkan ambang batas dan perbarui status santri saat disimpan</span>
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
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] shadow-xs transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </RoleShell>
  );
}
