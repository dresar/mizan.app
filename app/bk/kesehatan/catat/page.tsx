"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HeartPulse,
  ArrowLeft,
  Save,
  AlertCircle,
  ShieldAlert,
  Building,
  UserCheck
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { SantriSelect } from "@/components/ui/SantriSelect";
import { Avatar } from "@/components/ui/Avatar";

export default function CatatKesehatanPage() {
  const router = useRouter();
  const { accessibleSantriList, addKesehatan, currentUser } = useMizan();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    santriId: "",
    keluhan: "",
    diagnosa: "",
    tindakanObat: "",
    statusRawat: "Rawat Jalan",
    catatan: ""
  });

  const selectedSantri = useMemo(() => {
    return accessibleSantriList.find((s) => s.id === formData.santriId);
  }, [accessibleSantriList, formData.santriId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.santriId) {
      setErrorMsg("Silakan pilih santri terlebih dahulu.");
      return;
    }
    if (!formData.keluhan.trim()) {
      setErrorMsg("Keluhan santri wajib diisi.");
      return;
    }

    if (!selectedSantri) {
      setErrorMsg("Data santri tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);
    const today = new Date().toISOString().split("T")[0];

    try {
      await addKesehatan({
        santriId: selectedSantri.id,
        santriName: selectedSantri.name,
        gender: selectedSantri.gender,
        tanggal: today,
        keluhan: formData.keluhan.trim(),
        diagnosa: formData.diagnosa.trim() || "Pemeriksaan Poskestren",
        tindakanObat: formData.tindakanObat.trim() || "Istirahat & Vitamin",
        statusRawat: formData.statusRawat,
        petugasNama: currentUser?.name || "Pengasuhan",
        catatan: formData.catatan.trim()
      });

      router.push("/bk/kesehatan");
    } catch {
      setErrorMsg("Gagal menyimpan rekam medis. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <RoleShell>
      <div className="max-w-3xl mx-auto space-y-5 pb-24 px-3 sm:px-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/bk/kesehatan"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2EBF4] text-xs font-bold text-[#64748B] hover:text-[#172033] hover:border-[#CBD5E1] transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Poskestren</span>
          </Link>
          <span className="text-[11px] font-semibold text-[#8A9BA8]">
            Petugas: <strong className="text-[#172033]">{currentUser?.name || "Pengasuhan"}</strong>
          </span>
        </div>

        <div className="mizan-card p-5 sm:p-7 bg-white space-y-6 shadow-sm border border-[#E2EBF4] rounded-3xl">
          <div className="flex items-start gap-3.5 pb-4 border-b border-[#E2EBF4]">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shadow-xs shrink-0">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                Catat Pemeriksaan Santri (Poskestren)
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pencatatan klinis resmi rekam medis, keluhan fisik, instruksi obat, dan observasi asrama
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <SantriSelect
                label="Pilih Santri"
                required
                santriList={accessibleSantriList}
                value={formData.santriId}
                onChange={(id) => {
                  setFormData({ ...formData, santriId: id });
                  setErrorMsg("");
                }}
                placeholder="-- Cari dan Pilih Santri --"
              />

              {selectedSantri && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#D4C9B5] flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={selectedSantri.avatarUrl || (selectedSantri.gender === "Putri" ? "/default-avatar-ustadzah.jpg" : "/default-avatar-ustadz.jpg")}
                      name={selectedSantri.name}
                      gender={selectedSantri.gender}
                      initials={selectedSantri.avatar}
                      size="md"
                      variant={selectedSantri.gender === "Putri" ? "gold" : "primary"}
                      className="w-11 h-11 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate">
                        {selectedSantri.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-medium flex-wrap mt-0.5">
                        <span>Kelas {selectedSantri.class}</span>
                        <span>•</span>
                        <span>NIS {selectedSantri.nis}</span>
                        <span>•</span>
                        <span>{selectedSantri.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedSantri.asrama && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#D4C9B5] text-[10px] font-bold text-[#1B4D3E]">
                        <Building className="w-3 h-3 text-[#A8833E]" />
                        <span>Asr: {selectedSantri.asrama} {selectedSantri.kamar ? `(${selectedSantri.kamar})` : ""}</span>
                      </span>
                    )}
                    {selectedSantri.riwayatAlergi && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>Alergi: {selectedSantri.riwayatAlergi}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">
                Status Rawat / Kondisi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { value: "Rawat Jalan", label: "Rawat Jalan", desc: "Tetap masuk kegiatan belajar mengajar (KBM)" },
                  { value: "Istirahat di Kamar", label: "Istirahat di Kamar", desc: "Izin tidak KBM, istirahat di asrama" },
                  { value: "Rawat Inap Klinik", label: "Rawat Inap Poskestren", desc: "Observasi intensif di ruang rawat klinik" },
                  { value: "Rujuk RS", label: "Rujuk ke Rumah Sakit", desc: "Membutuhkan penanganan medis spesialis/UGD" }
                ].map((opt) => {
                  const isChecked = formData.statusRawat === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, statusRawat: opt.value })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#FAF7EE] border-[#1B4D3E] ring-2 ring-[#1B4D3E]/20"
                          : "bg-white border-[#E2EBF4] hover:border-[#D4C9B5]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-bold ${isChecked ? "text-[#1B4D3E]" : "text-[#172033]"}`}>
                          {opt.label}
                        </p>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isChecked ? "border-[#1B4D3E] bg-[#1B4D3E]" : "border-[#CBD5E1]"
                        }`}>
                          {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-tight">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">
                Keluhan Santri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.keluhan}
                onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                placeholder="Contoh: Demam tinggi 38.5°C, pusing berputar, batuk kering..."
                className="w-full p-3 rounded-2xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-semibold text-[#172033] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1B4D3E] focus:bg-white transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#172033]">
                  Diagnosa Medis / Klinis
                </label>
                <input
                  type="text"
                  value={formData.diagnosa}
                  onChange={(e) => setFormData({ ...formData, diagnosa: e.target.value })}
                  placeholder="Contoh: Febris ec ISPA, cephalgia, dispepsia"
                  className="w-full p-3 rounded-2xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-semibold text-[#172033] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1B4D3E] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#172033]">
                  Tindakan & Obat Diberikan
                </label>
                <input
                  type="text"
                  value={formData.tindakanObat}
                  onChange={(e) => setFormData({ ...formData, tindakanObat: e.target.value })}
                  placeholder="Contoh: Paracetamol 500mg 3x1, Vit C, kompres air hangat"
                  className="w-full p-3 rounded-2xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-semibold text-[#172033] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1B4D3E] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">
                Catatan Tambahan / Pesan Khusus
              </label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                rows={3}
                placeholder="Pesan khusus untuk musyrif kamar, jadwal kontrol obat, atau pemberitahuan wali santri..."
                className="w-full p-3 rounded-2xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-medium text-[#172033] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#1B4D3E] focus:bg-white transition-all"
              />
            </div>

            <div className="pt-3 border-t border-[#E2EBF4] flex items-center justify-end gap-3">
              <Link
                href="/bk/kesehatan"
                className="px-5 py-2.5 rounded-2xl bg-[#EEF2F6] hover:bg-[#E2EBF4] text-[#64748B] text-xs font-bold transition-all"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#143B30] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#C5A059]" />
                <span>{isSubmitting ? "Menyimpan Rekam Medis..." : "Simpan Rekam Medis"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </RoleShell>
  );
}
