"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { INITIAL_CATEGORIES } from "@/lib/mock-data";

function TambahUnsurForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preCategory = searchParams.get("kategori");

  const { categories, addUnsurToCategory, showToast } = useMizan();
  const effectiveCategories = categories && categories.length > 0 ? categories : INITIAL_CATEGORIES;

  const [targetCategory, setTargetCategory] = useState<string>(() => {
    if (preCategory) {
      const match = effectiveCategories.find(
        (c) => c.name.toLowerCase() === preCategory.toLowerCase() || c.code.toLowerCase() === preCategory.toLowerCase()
      );
      if (match) return match.name;
    }
    return effectiveCategories[0]?.name || "Kedisiplinan";
  });

  const [unsurList, setUnsurList] = useState<string[]>([""]);

  useEffect(() => {
    if (preCategory) {
      const match = effectiveCategories.find(
        (c) => c.name.toLowerCase() === preCategory.toLowerCase() || c.code.toLowerCase() === preCategory.toLowerCase()
      );
      if (match) {
        setTargetCategory(match.name);
      }
    }
  }, [preCategory, effectiveCategories]);

  const handleAddRow = () => {
    setUnsurList((prev) => [...prev, ""]);
  };

  const handleRemoveRow = (index: number) => {
    setUnsurList((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleInputChange = (index: number, value: string) => {
    setUnsurList((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetCategory) {
      showToast("Pilih kategori utama terlebih dahulu", "error");
      return;
    }

    const validUnsurs = unsurList.map((u) => u.trim()).filter((u) => u.length > 0);

    if (validUnsurs.length === 0) {
      showToast("Minimal masukkan 1 nama unsur penilaian", "error");
      return;
    }

    validUnsurs.forEach((name) => {
      addUnsurToCategory(targetCategory, name);
    });

    showToast(`Berhasil menambahkan ${validUnsurs.length} unsur penilaian ke ${targetCategory}`, "success");
    router.push("/admin/kategori-pelanggaran");
  };

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
            Tambah Unsur Penilaian
          </h1>
          <p className="text-xs text-[#64748B]">
            Form penambahan satu atau lebih unsur penilaian baru di bawah kategori terpilih
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-6 bg-white space-y-5 shadow-sm w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
              Pilih Kategori Utama
            </label>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033] font-semibold"
            >
              {effectiveCategories.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.code}. {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider">
                Daftar Unsur Penilaian ({unsurList.length})
              </label>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/40 text-[#1B4D3E] hover:bg-[#FAF7EE]/80 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {unsurList.map((unsur, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-[#94A3B8]">
                      #{index + 1}
                    </span>
                    <input
                      type="text"
                      value={unsur}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      placeholder="Contoh: Keterlambatan sholat berjama'ah, Kebersihan kamar..."
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033]"
                      required={index === 0}
                    />
                  </div>

                  {unsurList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="w-full py-2.5 border-2 border-dashed border-[#CBD5E1] hover:border-[#1B4D3E] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1B4D3E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-50/50 hover:bg-[#FAF7EE]/40"
            >
              <Plus className="w-4 h-4 text-[#A8833E]" />
              <span>+ Tambah Unsur Lainnya</span>
            </button>
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
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Semua Unsur</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function TambahUnsurPage() {
  return (
    <RoleShell>
      <Suspense fallback={<div className="p-10 text-center text-xs text-[#64748B]">Memuat formulir...</div>}>
        <TambahUnsurForm />
      </Suspense>
    </RoleShell>
  );
}
