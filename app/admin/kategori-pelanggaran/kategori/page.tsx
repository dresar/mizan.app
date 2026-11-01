"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";

export default function TambahKategoriPage() {
  const router = useRouter();
  const { categories, addCategory, showToast } = useMizan();

  const [categoryCode, setCategoryCode] = useState(() => String.fromCharCode(65 + categories.length));
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      showToast("Nama kategori tidak boleh kosong", "error");
      return;
    }

    const code = categoryCode.trim() || String.fromCharCode(65 + categories.length);
    addCategory(code, categoryName.trim());
    showToast(`Kategori ${categoryName.trim()} berhasil ditambahkan`, "success");
    router.push("/admin/kategori-pelanggaran");
  };

  return (
    <RoleShell>
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
              Tambah Kategori Penilaian
            </h1>
            <p className="text-xs text-[#64748B]">
              Form penambahan kategori induk penilaian adab dan perilaku santri
            </p>
          </div>
        </div>

        <Card className="p-5 sm:p-6 bg-white space-y-4 shadow-sm w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                Kode Kategori (Huruf)
              </label>
              <input
                type="text"
                maxLength={3}
                value={categoryCode}
                onChange={(e) => setCategoryCode(e.target.value.toUpperCase())}
                placeholder="Contoh: A, B, C..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none font-mono font-bold text-[#172033]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                Nama Kategori Utama
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Contoh: Kedisiplinan, Ibadah, Akhlak..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033]"
                required
              />
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
          </form>
        </Card>
      </div>
    </RoleShell>
  );
}
