"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Award,
  Calendar,
  CheckCircle2,
  Trash2,
  X
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Avatar } from "@/components/ui/Avatar";
import { SantriSelect } from "@/components/ui/SantriSelect";
import { TahfidzRecord } from "@/lib/mock-data";

export default function PengasuhanTahfidzPage() {
  const { accessibleSantriList, tahfidzList, addTahfidz, deleteTahfidz, currentUser } = useMizan();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    santriId: "",
    surahName: "An-Naba'",
    ayatStart: 1,
    ayatEnd: 40,
    halaman: 1.5,
    juz: 30,
    predikat: "Lancar (Mumtaz)",
    targetJuz: 3,
    realisasiJuz: 1.0,
    catatanUstadz: "Tajwid tartil dan makharijul huruf baik"
  });

  const filteredTahfidz = useMemo(() => {
    let list = tahfidzList;
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
          t.surahName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tahfidzList, currentUser?.gender, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.santriId || !form.surahName) return;
    const santri = accessibleSantriList.find((s) => s.id === form.santriId);
    if (!santri) return;

    setIsSubmitting(true);
    const today = new Date().toISOString().split("T")[0];
    await addTahfidz({
      santriId: santri.id,
      santriName: santri.name,
      gender: santri.gender,
      surahName: form.surahName,
      ayatStart: Number(form.ayatStart),
      ayatEnd: Number(form.ayatEnd),
      halaman: Number(form.halaman) || 1,
      juz: Number(form.juz) || 30,
      predikat: form.predikat,
      targetJuz: Number(form.targetJuz) || 3,
      realisasiJuz: Number(form.realisasiJuz) || 1,
      catatanUstadz: form.catatanUstadz,
      ustadzId: currentUser?.id,
      ustadzName: currentUser?.name || "Musyrif Tahfidz",
      date: today
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  return (
    <RoleShell>
      <div className="space-y-4 pb-20">
        <div className="mizan-card p-4 sm:p-6 bg-white space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
                  Progres Tahfidz & Al-Qur'an {currentUser?.gender ? `(${currentUser.gender})` : ""}
                </h1>
                <p className="text-xs text-[#64748B]">
                  Pencatatan setoran hafalan harian, kelancaran, target juz, dan bimbingan musyrif
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Setoran Hafalan</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri atau surat..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] text-xs font-medium text-[#172033] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTahfidz.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-[#E2EBF4] text-[#64748B] space-y-2">
              <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p className="text-xs font-semibold">Belum ada riwayat setoran tahfidz</p>
            </div>
          ) : (
            filteredTahfidz.map((t) => (
              <div key={t.id} className="mizan-card p-4 bg-white flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        initials={t.santriName.substring(0, 2).toUpperCase()}
                        size="md"
                        variant={t.gender === "Putra" ? "primary" : "gold"}
                      />
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#172033]">{t.santriName}</h3>
                        <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {t.date}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Juz {t.juz}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF7EE] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Surat / Ayat:</span>
                      <span className="font-bold text-[#172033]">
                        {t.surahName} (Ayat {t.ayatStart}-{t.ayatEnd})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Predikat Kelancaran:</span>
                      <span className="font-semibold text-emerald-700">{t.predikat}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Kuantitas:</span>
                      <span className="text-[#172033]">{t.halaman} Halaman</span>
                    </div>

                    {t.catatanUstadz && (
                      <p className="text-[#172033] italic pt-1 border-t border-[#D4C9B5]/40">
                        "{t.catatanUstadz}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>Penyimak: {t.ustadzName}</span>
                  <button
                    type="button"
                    onClick={() => deleteTahfidz(t.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Hapus Setoran"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 border border-[#E2EBF4] shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4]">
                <h2 className="text-sm sm:text-base font-bold text-[#172033]">Catat Setoran Hafalan Baru</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 text-[#64748B]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <SantriSelect
                    label="Pilih Santri"
                    required
                    santriList={accessibleSantriList}
                    value={form.santriId}
                    onChange={(id) => setForm({ ...form, santriId: id })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#172033] mb-1">Nama Surat:</label>
                    <input
                      type="text"
                      value={form.surahName}
                      onChange={(e) => setForm({ ...form, surahName: e.target.value })}
                      placeholder="Contoh: Al-Mulk, Yasin, An-Naba'..."
                      className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-semibold text-[#172033]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#172033] mb-1">Juz:</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={form.juz}
                      onChange={(e) => setForm({ ...form, juz: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-bold text-[#172033]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#172033] mb-1">Ayat Mulai:</label>
                    <input
                      type="number"
                      min={1}
                      value={form.ayatStart}
                      onChange={(e) => setForm({ ...form, ayatStart: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#172033] mb-1">Ayat Sampai:</label>
                    <input
                      type="number"
                      min={1}
                      value={form.ayatEnd}
                      onChange={(e) => setForm({ ...form, ayatEnd: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#172033] mb-1">Halaman:</label>
                    <input
                      type="number"
                      step={0.5}
                      min={0.5}
                      value={form.halaman}
                      onChange={(e) => setForm({ ...form, halaman: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">Predikat Kelancaran:</label>
                  <select
                    value={form.predikat}
                    onChange={(e) => setForm({ ...form, predikat: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-semibold text-[#172033]"
                  >
                    <option value="Sangat Lancar (Mumtaz)">Sangat Lancar (Mumtaz)</option>
                    <option value="Lancar (Jayyid Jiddan)">Lancar (Jayyid Jiddan)</option>
                    <option value="Cukup (Jayyid)">Cukup (Jayyid)</option>
                    <option value="Kurang Lancar (Perlu Muroja'ah)">Kurang Lancar (Perlu Muroja'ah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">Catatan Musyrif / Ustadz:</label>
                  <textarea
                    value={form.catatanUstadz}
                    onChange={(e) => setForm({ ...form, catatanUstadz: e.target.value })}
                    rows={2}
                    placeholder="Ulasan tajwid, mad, waqaf, atau kemajuan santri..."
                    className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-[#D4C9B5] font-medium text-[#172033]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#64748B] font-bold">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#1B4D3E]/90 text-white font-bold disabled:opacity-50">
                    {isSubmitting ? "Menyimpan..." : "Simpan Setoran"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
