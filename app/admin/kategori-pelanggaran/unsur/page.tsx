"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";

export default function TambahUnsurPage() {
  const router = useRouter();
  const { categories, addUnsurToCategory, showToast } = useMizan();

  const [targetCategory, setTargetCategory] = useState<string>(categories[0]?.name || "");
  const [unsurName, setUnsurName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unsurName.trim()) {
      showToast("Nama unsur tidak boleh kosong", "error");
      return;
    }

    if (!targetCategory) {
      showToast("Pilih kategori utama terlebih dahulu", "error");
      return;
    }

    addUnsurToCategory(targetCategory, unsurName.trim());
    showToast(`Unsur "${unsurName.trim()}" berhasil ditambahkan ke ${targetCategory}`, "success");
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
              Tambah Unsur Penilaian
            </h1>
            <p className="text-xs text-[#64748B]">
              Form penambahan unsur penilaian baru di bawah kategori terpilih
            </p>
          </div>
        </div>

        <Card className="p-5 sm:p-6 bg-white space-y-4 shadow-sm w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                Pilih Kategori Utama
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none text-[#172033] font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.code}. {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
                Nama Unsur Penilaian
              </label>
              <input
                type="text"
                value={unsurName}
                onChange={(e) => setUnsurName(e.target.value)}
                placeholder="Contoh: Keterlambatan sholat berjama'ah, Kebersihan kamar..."
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
