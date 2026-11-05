"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { KategoriUtama, Tingkat, IndikatorType, INITIAL_CATEGORIES } from "@/lib/mock-data";

function IndikatorFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const {
    categories,
    addIndikatorToUnsur,
    updateIndikatorItem,
    showToast
  } = useMizan();

  const effectiveCategories = categories && categories.length > 0 ? categories : INITIAL_CATEGORIES;

  const [formData, setFormData] = useState<{
    id?: string;
    kategoriName: KategoriUtama;
    unsurId: string;
    text: string;
    type: IndikatorType;
    tingkat: Tingkat;
    score: number;
    keterangan?: string;
  }>({
    kategoriName: (effectiveCategories[0]?.name as KategoriUtama) || "Kedisiplinan",
    unsurId: effectiveCategories[0]?.unsurs[0]?.id || "",
    text: "",
    type: "HASANAH",
    tingkat: "Sedang",
    score: 0.150,
    keterangan: "Sesuai pedoman adab pondok"
  });

  useEffect(() => {
    if (!editId || effectiveCategories.length === 0) return;

    const timer = setTimeout(() => {
      for (const cat of effectiveCategories) {
        for (const uns of cat.unsurs) {
          const found = uns.indicators.find((ind) => ind.id === editId);
          if (found) {
            setFormData({
              id: found.id,
              kategoriName: cat.name,
              unsurId: uns.id,
              text: found.text,
              type: found.type,
              tingkat: (found.tingkat as Tingkat) || "Sedang",
              score: found.defaultScore,
              keterangan: "Sesuai pedoman adab pondok"
            });
            return;
          }
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [editId, effectiveCategories]);

  const handleTypeChange = (type: IndikatorType) => {
    const defaultScore = type === "HASANAH" ? 0.150 : -0.050;
    setFormData((prev) => ({ ...prev, type, score: defaultScore }));
  };

  const handleTingkatChange = (tingkat: Tingkat) => {
    let score = formData.score;
    if (formData.type === "HASANAH") {
      score = tingkat === "Ringan" ? 0.05 : tingkat === "Sedang" ? 0.150 : 0.234;
    } else {
      score = tingkat === "Ringan" ? -0.05 : tingkat === "Sedang" ? -0.100 : -0.250;
    }
    setFormData((prev) => ({ ...prev, tingkat, score }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      showToast("Teks indikator tidak boleh kosong", "error");
      return;
    }

    if (!formData.unsurId) {
      showToast("Pilih unsur penilaian terlebih dahulu", "error");
      return;
    }

    if (formData.id) {
      updateIndikatorItem(formData.id, {
        text: formData.text.trim(),
        type: formData.type,
        tingkat: formData.tingkat,
        defaultScore: formData.score
      });
      showToast("Indikator berhasil diperbarui", "success");
    } else {
      addIndikatorToUnsur(formData.unsurId, {
        text: formData.text.trim(),
        type: formData.type,
        tingkat: formData.tingkat,
        defaultScore: formData.score
      });
      showToast("Indikator berhasil ditambahkan", "success");
    }

    router.push("/admin/kategori-pelanggaran");
  };

  const activeCategory = effectiveCategories.find((c) => c.name === formData.kategoriName) || effectiveCategories[0];

  return (
    <div className="w-full space-y-4 pb-36">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/kategori-pelanggaran"
          className="p-2 rounded-xl bg-white border border-[#E2EBF4] text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7F2] transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-[#1B4D3E] tracking-tight">
            {formData.id ? "Edit Indikator Penilaian" : "Tambah Indikator"}
          </h1>
          <p className="text-xs text-[#64748B]">
            Form konfigurasi indikator perilaku hasanah dan sayyi&apos;ah santri
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-6 bg-white space-y-4 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                  Jenis Penilaian
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("HASANAH")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === "HASANAH"
                        ? "bg-[#ECFDF5] border-[#1B4D3E] text-[#065F46] shadow-xs"
                        : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    Hasanah (Prestasi)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("SAYYIAH")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === "SAYYIAH"
                        ? "bg-[#FEF2F2] border-red-500 text-red-700 shadow-xs"
                        : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    Sayyi&apos;ah (Pelanggaran)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                  Kategori Utama
                </label>
                <select
                  value={formData.kategoriName}
                  onChange={(e) => {
                    const catName = e.target.value as KategoriUtama;
                    const catObj = categories.find((c) => c.name === catName);
                    setFormData((prev) => ({
                      ...prev,
                      kategoriName: catName,
                      unsurId: catObj?.unsurs[0]?.id || ""
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033] font-semibold"
                >
                  {effectiveCategories.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.code}. {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                  Unsur Penilaian
                </label>
                <select
                  value={formData.unsurId}
                  onChange={(e) => setFormData({ ...formData, unsurId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033] font-semibold"
                >
                  {activeCategory?.unsurs.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                    Tingkat Kejadian
                  </label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => handleTingkatChange(e.target.value as Tingkat)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033] font-semibold"
                  >
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                    Dampak Skor Desimal (0.xxx)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        score: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none font-mono font-bold text-[#172033]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                    Teks Indikator / Kejadian
                  </label>
                  <textarea
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Contoh: Aktif dalam kegiatan agama dan kajian pondok..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                    Keterangan Kebijakan
                  </label>
                  <input
                    type="text"
                    value={formData.keterangan || ""}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Sesuai pedoman adab pondok..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2EBF4] flex items-center justify-end gap-2.5">
                <Link
                  href="/admin/kategori-pelanggaran"
                  className="px-4 py-2.5 text-xs font-bold rounded-xl text-[#64748B] hover:text-[#172033] bg-[#EEF2F6] hover:bg-[#E2E8F0] transition-colors"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function IndikatorFormPage() {
  return (
    <RoleShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Memuat formulir indikator...</div>}>
        <IndikatorFormContent />
      </Suspense>
    </RoleShell>
  );
}
