"use client";

import React, { useState } from "react";
import {
  Settings,
  Save,
  Bell,
  Sparkles,
  ShieldAlert,
  Award,
  RefreshCcw,
  CheckCircle2
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardHeader } from "@/components/ui/Card";

export default function AdminPengaturanNilaiPage() {
  const { settings, updateSettings, showToast } = useMizan();
  const [formState, setFormState] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
  };

  const handleResetDefault = () => {
    const defaults = {
      defaultBaseScore: 70.0,
      penaltyRingan: -0.05,
      penaltySedang: -0.1,
      penaltyBerat: -0.25,
      bonusRingan: 0.05,
      bonusSedang: 0.1,
      bonusBesar: 0.15,
      notifyParents: true,
      realtimeSimulation: true
    };
    setFormState(defaults);
    updateSettings(defaults);
    showToast("Pengaturan dikembalikan ke standar awal pondok", "info");
  };

  return (
    <RoleShell>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#1B4D3E]">
              Pengaturan Nilai & Sistem
            </h1>
            <p className="text-xs text-[#5C6B64] mt-0.5">
              Konfigurasi bobot penilaian akhlak, batas ambang desimal, dan notifikasi simulasi
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#D4C9B5] bg-white text-[#5C6B64] hover:bg-[#FAF7F2] transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card>
            <CardHeader
              title="Nilai Awal (Default) Santri"
              subtitle="Setiap santri dan santriwati memulai tahun ajaran dengan nilai adab standar"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C2826] mb-1">
                  Nilai Awal Akhlak (Desimal)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="50"
                    max="100"
                    value={formState.defaultBaseScore}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        defaultBaseScore: parseFloat(e.target.value) || 70.0
                      })
                    }
                    className="w-32 px-3 py-2 text-sm font-bold font-mono bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1B4D3E]"
                  />
                  <span className="text-xs text-[#5C6B64]">
                    Standar baku pondok: 70.00
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DECE] text-xs text-[#5C6B64]">
                <p className="font-semibold text-[#1C2826] mb-1">Pedoman Ambang Desimal:</p>
                <p>• 80.000 - 100.000: Kategori Mumtaz / Baik</p>
                <p>• 70.000 - 79.999: Kategori Cukup / Perhatian</p>
                <p>• Di bawah 70.000: Perlu Pembinaan Khusus Pengasuhan</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Bobot Penalti Pelanggaran Desimal (Sayyi'ah)"
              subtitle="Pengurangan poin otomatis saat guru mencatat kejadian pelanggaran"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl border border-[#FEF08A] bg-[#FEFCE8]/40">
                <span className="text-xs font-bold text-[#854D0E] block mb-1">
                  Pelanggaran Ringan
                </span>
                <input
                  type="number"
                  step="0.001"
                  max="0"
                  value={formState.penaltyRingan}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      penaltyRingan: parseFloat(e.target.value) || -0.05
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-md text-[#9B2C2C] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] mt-1 block">
                  Contoh: -0.050 (Terlambat)
                </span>
              </div>

              <div className="p-3 rounded-2xl border border-[#FDBA74] bg-[#FFF7ED]/40">
                <span className="text-xs font-bold text-[#C2410C] block mb-1">
                  Pelanggaran Sedang
                </span>
                <input
                  type="number"
                  step="0.001"
                  max="0"
                  value={formState.penaltySedang}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      penaltySedang: parseFloat(e.target.value) || -0.1
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-md text-[#9B2C2C] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] mt-1 block">
                  Contoh: -0.100 (Masjid gaduh)
                </span>
              </div>

              <div className="p-3 rounded-2xl border border-[#9B2C2C]/30 bg-[#FDF2F2]/60">
                <span className="text-xs font-bold text-[#9B2C2C] block mb-1">
                  Pelanggaran Berat
                </span>
                <input
                  type="number"
                  step="0.001"
                  max="0"
                  value={formState.penaltyBerat}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      penaltyBerat: parseFloat(e.target.value) || -0.25
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-md text-[#9B2C2C] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] mt-1 block">
                  Contoh: -0.250 / -0.500 (HP/Kabur)
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Apresiasi Kebaikan Desimal (Hasanah)"
              subtitle="Penambahan skor saat santri berinisiatif melakukan perbuatan terpuji"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl border border-[#1B4D3E]/20 bg-[#E8F0EC]/40">
                <span className="text-xs font-bold text-[#1B4D3E] block mb-1">
                  Hasanah Ringan
                </span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formState.bonusRingan}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      bonusRingan: parseFloat(e.target.value) || 0.05
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-md text-[#1B4D3E] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] mt-1 block">
                  Contoh: +0.050 (Shalat awal waktu)
                </span>
              </div>

              <div className="p-3 rounded-2xl border border-[#1B4D3E]/20 bg-[#E8F0EC]/40">
                <span className="text-xs font-bold text-[#1B4D3E] block mb-1">
                  Hasanah Sedang
                </span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formState.bonusSedang}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      bonusSedang: parseFloat(e.target.value) || 0.1
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-md text-[#1B4D3E] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] mt-1 block">
                  Contoh: +0.100 (Piket amanah)
                </span>
              </div>

              <div className="p-3 rounded-2xl border border-[#C5A059]/40 bg-[#FAF7EE]">
                <span className="text-xs font-bold text-[#A8833E] block mb-1">
                  Hasanah Besar
                </span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formState.bonusBesar}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      bonusBesar: parseFloat(e.target.value) || 0.234
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-[#D4C9B5] rounded-md text-[#A8833E] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                />
                <span className="text-[10px] text-[#5C6B64] mt-1 block">
                  Contoh: +0.234 (Imam wirid / prestasi)
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Integrasi Simulasi & Pemberitahuan"
              subtitle="Pengaturan perilaku prototype dalam lingkungan lokal browser"
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
                    Simulasi Notifikasi Orang Tua / Wali Santri
                  </span>
                  <p className="text-[11px] text-[#5C6B64] mt-0.5">
                    Kirim notifikasi otomatis saat santri menerima catatan pelanggaran atau hasanah baru.
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
                    Sinkronisasi State Realtime (Local Storage)
                  </span>
                  <p className="text-[11px] text-[#5C6B64] mt-0.5">
                    Perubahan nilai di modul guru langsung terefleksi secara langsung pada tampilan orang tua, santri, dan admin.
                  </p>
                </div>
              </label>
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </RoleShell>
  );
}
