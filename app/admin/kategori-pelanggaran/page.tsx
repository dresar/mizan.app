"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  AlertCircle,
  Sliders,
  Sparkles,
  Layers,
  FolderPlus
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import {
  KategoriUtama,
  Tingkat,
  IndikatorType,
  Indikator
} from "@/lib/mock-data";

export default function AdminKategoriPelanggaranPage() {
  const {
    categories,
    addIndikatorToUnsur,
    updateIndikatorItem,
    deleteIndikatorItem,
    addCategory,
    addUnsurToCategory,
    showToast
  } = useMizan();

  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingIndikator, setEditingIndikator] = useState<{
    id?: string;
    kategoriName: KategoriUtama;
    unsurId: string;
    text: string;
    type: IndikatorType;
    tingkat: Tingkat;
    score: number;
    keterangan?: string;
  } | null>(null);

  const [isUnsurDrawerOpen, setIsUnsurDrawerOpen] = useState(false);
  const [unsurTargetCategory, setUnsurTargetCategory] = useState<string>(categories[0]?.name || "");
  const [newUnsurName, setNewUnsurName] = useState("");

  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [newCategoryCode, setNewCategoryCode] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const flatList: {
    indikator: Indikator;
    unsurId: string;
    unsurName: string;
    kategoriName: KategoriUtama;
  }[] = [];

  categories.forEach((cat) => {
    cat.unsurs.forEach((uns) => {
      uns.indicators.forEach((ind) => {
        flatList.push({
          indikator: ind,
          unsurId: uns.id,
          unsurName: uns.name,
          kategoriName: cat.name
        });
      });
    });
  });

  const filteredList = flatList.filter((item) => {
    const matchCat =
      selectedKategoriFilter === "ALL" ||
      item.kategoriName === selectedKategoriFilter;
    const matchType =
      selectedTypeFilter === "ALL" || item.indikator.type === selectedTypeFilter;
    return matchCat && matchType;
  });

  const handleOpenAdd = () => {
    const defaultCat = categories[0];
    const defaultUns = defaultCat?.unsurs[0];
    setEditingIndikator({
      kategoriName: defaultCat.name,
      unsurId: defaultUns?.id || "",
      text: "",
      type: "HASANAH",
      tingkat: "Sedang",
      score: 0.150,
      keterangan: "Sesuai pedoman adab pondok"
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: typeof flatList[0]) => {
    setEditingIndikator({
      id: item.indikator.id,
      kategoriName: item.kategoriName,
      unsurId: item.unsurId,
      text: item.indikator.text,
      type: item.indikator.type,
      tingkat: item.indikator.tingkat || "Ringan",
      score: item.indikator.defaultScore,
      keterangan: "Tercatat dalam kurikulum adab pondok"
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = (indId: string) => {
    deleteIndikatorItem(indId);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndikator || !editingIndikator.text.trim()) {
      showToast("Teks indikator tidak boleh kosong", "error");
      return;
    }

    if (editingIndikator.id) {
      updateIndikatorItem(editingIndikator.id, {
        text: editingIndikator.text,
        type: editingIndikator.type,
        tingkat: editingIndikator.tingkat,
        defaultScore: editingIndikator.score
      });
    } else {
      addIndikatorToUnsur(editingIndikator.unsurId, {
        text: editingIndikator.text,
        type: editingIndikator.type,
        tingkat: editingIndikator.tingkat,
        defaultScore: editingIndikator.score
      });
    }

    setIsDrawerOpen(false);
    setEditingIndikator(null);
  };

  const handleSaveUnsur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnsurName.trim()) {
      showToast("Nama unsur tidak boleh kosong", "error");
      return;
    }
    addUnsurToCategory(unsurTargetCategory, newUnsurName.trim());
    setNewUnsurName("");
    setIsUnsurDrawerOpen(false);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast("Nama kategori tidak boleh kosong", "error");
      return;
    }
    const code = newCategoryCode.trim() || String.fromCharCode(65 + categories.length);
    addCategory(code, newCategoryName.trim());
    setNewCategoryName("");
    setNewCategoryCode("");
    setIsCategoryDrawerOpen(false);
  };

  const handleTypeChange = (type: IndikatorType) => {
    if (!editingIndikator) return;
    const defaultScore = type === "HASANAH" ? 0.150 : -0.050;
    setEditingIndikator({ ...editingIndikator, type, score: defaultScore });
  };

  const handleTingkatChange = (tingkat: Tingkat) => {
    if (!editingIndikator) return;
    let score = editingIndikator.score;
    if (editingIndikator.type === "HASANAH") {
      score = tingkat === "Ringan" ? 0.05 : tingkat === "Sedang" ? 0.150 : 0.234;
    } else {
      score = tingkat === "Ringan" ? -0.05 : tingkat === "Sedang" ? -0.100 : -0.250;
    }
    setEditingIndikator({ ...editingIndikator, tingkat, score });
  };

  const formatScore = (score: number) => {
    const formatted = Math.abs(score).toFixed(3);
    return score > 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <RoleShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#1B4D3E]">
              Master Kategori & Indikator Penilaian
            </h1>
            <p className="text-xs text-[#5C6B64] mt-0.5">
              Kelola master data kategori, unsur penilaian, dan bobot skor desimal (0.xxx). Semua nilai dikonfigurasi di sini sehingga guru di lapangan tidak perlu memasukkan skor manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCategoryDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#D4C9B5] text-[#1C2826] text-xs font-bold hover:bg-[#FAF7F2] transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#C5A059]" />
              Kategori
            </button>

            <button
              type="button"
              onClick={() => setIsUnsurDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#D4C9B5] text-[#1C2826] text-xs font-bold hover:bg-[#FAF7F2] transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Unsur
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Indikator
            </button>
          </div>
        </div>

        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5C6B64] shrink-0" />
              <select
                aria-label="Filter kategori utama"
                value={selectedKategoriFilter}
                onChange={(e) => setSelectedKategoriFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
              >
                <option value="ALL">Semua Kategori Utama</option>
                {categories.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.code}. {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#5C6B64] shrink-0" />
              <select
                aria-label="Filter jenis penilaian"
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
              >
                <option value="ALL">Semua Jenis (Hasanah & Sayyi&apos;ah)</option>
                <option value="HASANAH">Hasanah (Prestasi)</option>
                <option value="SAYYIAH">Sayyi&apos;ah (Pelanggaran)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5DECE] bg-[#FAF7F2] text-[#5C6B64] font-semibold">
                  <th className="py-3 px-4">Indikator Kejadian / Perilaku</th>
                  <th className="py-3 px-3">Kategori & Unsur</th>
                  <th className="py-3 px-3 text-center">Jenis</th>
                  <th className="py-3 px-3 text-center">Tingkat</th>
                  <th className="py-3 px-3 text-center">Dampak Skor Desimal</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DECE]/60">
                {filteredList.map((item) => (
                  <tr key={item.indikator.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#1C2826] max-w-xs">
                      {item.indikator.text}
                    </td>
                    <td className="py-3.5 px-3 text-[#5C6B64]">
                      <div className="font-semibold text-[#1C2826]">{item.kategoriName}</div>
                      <div className="text-[11px] text-[#8A968F]">{item.unsurName}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge
                        variant={item.indikator.type === "HASANAH" ? "hasanah" : "sayyiah"}
                        size="sm"
                      >
                        {item.indikator.type === "HASANAH" ? "Hasanah" : "Sayyi'ah"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge
                        variant={
                          item.indikator.tingkat === "Ringan"
                            ? "ringan"
                            : item.indikator.tingkat === "Sedang"
                            ? "sedang"
                            : "berat"
                        }
                        size="sm"
                      >
                        {item.indikator.tingkat || "Ringan"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono">
                      <span
                        className={
                          item.indikator.defaultScore > 0
                            ? "text-[#1B4D3E]"
                            : "text-[#9B2C2C]"
                        }
                      >
                        {formatScore(item.indikator.defaultScore)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-[#5C6B64] hover:text-[#1B4D3E] hover:bg-[#E8F0EC] transition-colors"
                          title="Edit indikator"
                          aria-label={`Ubah indikator ${item.indikator.text}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.indikator.id)}
                          className="p-1.5 rounded-lg text-[#5C6B64] hover:text-[#9B2C2C] hover:bg-[#FDF2F2] transition-colors"
                          title="Hapus indikator"
                          aria-label={`Hapus indikator ${item.indikator.text}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingIndikator(null);
          }}
          title={editingIndikator?.id ? "Edit Indikator Penilaian" : "Tambah Indikator Baru"}
          subtitle="Form konfigurasi indikator perilaku hasanah dan sayyi'ah santri"
          width="md"
        >
          {editingIndikator && (
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C2826] mb-1">
                  Jenis Penilaian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("HASANAH")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      editingIndikator.type === "HASANAH"
                        ? "bg-[#E8F0EC] border-[#1B4D3E] text-[#1B4D3E]"
                        : "bg-white border-[#D4C9B5] text-[#5C6B64] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    Hasanah (Prestasi)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("SAYYIAH")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      editingIndikator.type === "SAYYIAH"
                        ? "bg-[#FDF2F2] border-[#9B2C2C] text-[#9B2C2C]"
                        : "bg-white border-[#D4C9B5] text-[#5C6B64] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    Sayyi&apos;ah (Pelanggaran)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2826] mb-1">
                  Kategori Utama
                </label>
                <select
                  value={editingIndikator.kategoriName}
                  onChange={(e) => {
                    const catName = e.target.value as KategoriUtama;
                    const catObj = categories.find((c) => c.name === catName);
                    setEditingIndikator({
                      ...editingIndikator,
                      kategoriName: catName,
                      unsurId: catObj?.unsurs[0]?.id || ""
                    });
                  }}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
                >
                  {categories.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.code}. {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2826] mb-1">
                  Unsur Penilaian
                </label>
                <select
                  value={editingIndikator.unsurId}
                  onChange={(e) =>
                    setEditingIndikator({ ...editingIndikator, unsurId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
                >
                  {categories
                    .find((c) => c.name === editingIndikator.kategoriName)
                    ?.unsurs.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2826] mb-1">
                  Teks Indikator / Kejadian
                </label>
                <textarea
                  rows={3}
                  value={editingIndikator.text}
                  onChange={(e) =>
                    setEditingIndikator({ ...editingIndikator, text: e.target.value })
                  }
                  placeholder="Contoh: Aktif dalam kegiatan agama dan kajian pondok..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C2826] mb-1">
                    Tingkat Kejadian
                  </label>
                  <select
                    value={editingIndikator.tingkat}
                    onChange={(e) => handleTingkatChange(e.target.value as Tingkat)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
                  >
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2826] mb-1">
                    Dampak Skor Desimal (0.xxx)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingIndikator.score}
                    onChange={(e) =>
                      setEditingIndikator({
                        ...editingIndikator,
                        score: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] font-mono font-bold text-[#1C2826]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2826] mb-1">
                  Keterangan Kebijakan
                </label>
                <input
                  type="text"
                  value={editingIndikator.keterangan || ""}
                  onChange={(e) =>
                    setEditingIndikator({ ...editingIndikator, keterangan: e.target.value })
                  }
                  placeholder="Catatan takzir atau pedoman..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5DECE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-[#5C6B64] hover:bg-[#FAF7F2] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}
        </Drawer>

        <Drawer
          isOpen={isUnsurDrawerOpen}
          onClose={() => setIsUnsurDrawerOpen(false)}
          title="Tambah Unsur Penilaian Baru"
          subtitle="Tambahkan unsur baru di bawah kategori penilaian terpilih"
          width="md"
        >
          <form onSubmit={handleSaveUnsur} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C2826] mb-1">
                Pilih Kategori Utama
              </label>
              <select
                value={unsurTargetCategory}
                onChange={(e) => setUnsurTargetCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
              >
                {categories.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.code}. {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C2826] mb-1">
                Nama Unsur Penilaian
              </label>
              <input
                type="text"
                placeholder="Contoh: Ketaqwaan Kepada Tuhan, Toleransi Sosial..."
                value={newUnsurName}
                onChange={(e) => setNewUnsurName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
                required
              />
            </div>

            <div className="pt-3 border-t border-[#E5DECE] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUnsurDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-[#5C6B64] hover:bg-[#FAF7F2] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors shadow-xs"
              >
                Simpan
              </button>
            </div>
          </form>
        </Drawer>

        <Drawer
          isOpen={isCategoryDrawerOpen}
          onClose={() => setIsCategoryDrawerOpen(false)}
          title="Tambah Kategori Penilaian Baru"
          subtitle="Tambahkan kategori utama baru ke dalam master data Mizan"
          width="md"
        >
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C2826] mb-1">
                Kode Kategori (Opsional, contoh: F)
              </label>
              <input
                type="text"
                placeholder="Otomatis jika dikosongkan..."
                value={newCategoryCode}
                onChange={(e) => setNewCategoryCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C2826] mb-1">
                Nama Kategori Penilaian
              </label>
              <input
                type="text"
                placeholder="Contoh: Sikap Mental & Sosial, Prestasi Akademik..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D4C9B5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] text-[#1C2826]"
                required
              />
            </div>

            <div className="pt-3 border-t border-[#E5DECE] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-[#5C6B64] hover:bg-[#FAF7F2] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors shadow-xs"
              >
                Simpan
              </button>
            </div>
          </form>
        </Drawer>
      </div>
    </RoleShell>
  );
}