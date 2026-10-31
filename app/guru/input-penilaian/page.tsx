"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  ShieldAlert,
  Search,
  User,
  Check,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { FileUploadMock } from "@/components/ui/FileUploadMock";
import categoriesMasterData from "@/lib/categories-master.json";

interface IndicatorItem {
  id: string;
  code: string;
  text: string;
  defaultScore: number;
  tingkat?: string;
  isNegative?: boolean;
}

interface UnsurItem {
  id: string;
  name: string;
  code: string;
  type?: string;
  indicators: IndicatorItem[];
}

interface CategoryItem {
  code: string;
  name: string;
  unsurs: UnsurItem[];
}

export default function InputPenilaianPage() {
  const router = useRouter();
  const {
    accessibleSantriList,
    currentUser,
    addPenilaian,
    showToast,
    penilaianList
  } = useMizan();

  const [selectedSantriId, setSelectedSantriId] = useState<string>(accessibleSantriList[0]?.id || "santri-1");
  const [penilaianType, setPenilaianType] = useState<"HASANAH" | "SAYYIAH">("HASANAH");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [selectedUnsurId, setSelectedUnsurId] = useState<string>("");
  const [santriSearch, setSantriSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [isMobileSantriExpanded, setIsMobileSantriExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number } | null>(null);

  const categoriesForType: CategoryItem[] = useMemo(() => {
    return (categoriesMasterData as unknown as CategoryItem[])
      .map((cat) => ({
        code: cat.code,
        name: cat.name,
        unsurs: (cat.unsurs || []).filter((u: any) => u.type === penilaianType)
      }))
      .filter((cat) => cat.unsurs.length > 0);
  }, [penilaianType]);

  useEffect(() => {
    if (categoriesForType.length > 0) {
      setSelectedCategoryName(categoriesForType[0].name);
      if (categoriesForType[0].unsurs && categoriesForType[0].unsurs.length > 0) {
        setSelectedUnsurId(categoriesForType[0].unsurs[0].id);
      } else {
        setSelectedUnsurId("");
      }
    }
  }, [categoriesForType]);

  const activeCategory = useMemo(() => {
    return (
      categoriesForType.find((cat) => cat.name === selectedCategoryName) ||
      categoriesForType[0]
    );
  }, [categoriesForType, selectedCategoryName]);

  const availableUnsurs = useMemo(() => {
    return activeCategory?.unsurs || [];
  }, [activeCategory]);

  const activeUnsur = useMemo(() => {
    return (
      availableUnsurs.find((uns) => uns.id === selectedUnsurId) ||
      availableUnsurs[0] ||
      null
    );
  }, [availableUnsurs, selectedUnsurId]);

  const currentIndicators = useMemo(() => {
    return activeUnsur?.indicators || [];
  }, [activeUnsur]);

  const totalUnsurScore = useMemo(() => {
    return currentIndicators.reduce((acc, ind) => acc + (ind.defaultScore || 0), 0);
  }, [currentIndicators]);

  const handleCategoryChange = (catName: string) => {
    setSelectedCategoryName(catName);
    const targetCat = categoriesForType.find((c) => c.name === catName);
    if (targetCat && targetCat.unsurs.length > 0) {
      setSelectedUnsurId(targetCat.unsurs[0].id);
    } else {
      setSelectedUnsurId("");
    }
  };

  const handleUnsurToggle = (unsurId: string) => {
    setSelectedUnsurId(unsurId);
  };

  const handleSwitchPenilaianType = (type: "HASANAH" | "SAYYIAH") => {
    setPenilaianType(type);
  };

  const classList = useMemo(() => {
    const classes = Array.from(new Set(accessibleSantriList.map((s) => s.class)));
    return ["ALL", ...classes];
  }, [accessibleSantriList]);

  const filteredSantriList = useMemo(() => {
    return accessibleSantriList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(santriSearch.toLowerCase()) ||
        s.nis.includes(santriSearch);
      const matchClass =
        selectedClassFilter === "ALL" || s.class === selectedClassFilter;
      return matchSearch && matchClass;
    });
  }, [accessibleSantriList, santriSearch, selectedClassFilter]);

  const selectedSantri = useMemo(() => {
    return accessibleSantriList.find((s) => s.id === selectedSantriId) || accessibleSantriList[0];
  }, [accessibleSantriList, selectedSantriId]);

  const santriBaseScore = selectedSantri ? selectedSantri.baseScore : 80;

  const totalHasanahAccumulated = useMemo(() => {
    if (!selectedSantri) return 0;
    return penilaianList
      .filter((p) => p.santriId === selectedSantri.id && p.type === "HASANAH")
      .reduce((sum, p) => sum + Math.abs(p.score), 0);
  }, [selectedSantri, penilaianList]);

  const totalSayyiahAccumulated = useMemo(() => {
    if (!selectedSantri) return 0;
    return penilaianList
      .filter((p) => p.santriId === selectedSantri.id && p.type === "SAYYIAH")
      .reduce((sum, p) => sum + Math.abs(p.score), 0);
  }, [selectedSantri, penilaianList]);

  const projectedCombinedIndex = useMemo(() => {
    let raw = santriBaseScore + totalHasanahAccumulated - totalSayyiahAccumulated;
    if (penilaianType === "HASANAH") {
      raw += Math.abs(totalUnsurScore);
    } else {
      raw -= Math.abs(totalUnsurScore);
    }
    const clamped = Math.max(0, Math.min(raw, 99.0));
    return parseFloat(clamped.toFixed(3));
  }, [santriBaseScore, totalHasanahAccumulated, totalSayyiahAccumulated, penilaianType, totalUnsurScore]);

  const predikat = useMemo(() => {
    if (projectedCombinedIndex >= 90) return { label: "MUMTAZ", color: "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]" };
    if (projectedCombinedIndex >= 80) return { label: "JAYYID JIDDAN", color: "text-[#1B4D3E] bg-[#E8F0EC] border-[#1B4D3E]/30" };
    if (projectedCombinedIndex >= 70) return { label: "JAYYID", color: "text-[#854D0E] bg-[#FEFCE8] border-[#FEF08A]" };
    if (projectedCombinedIndex >= 60) return { label: "MAQBUL", color: "text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]" };
    return { label: "RASIB / PEMBINAAN", color: "text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]" };
  }, [projectedCombinedIndex]);

  const formatScore = (score: number) => {
    return score.toFixed(3).replace(".", ",");
  };

  const formatScoreWithSign = (score: number) => {
    const formatted = Math.abs(score).toFixed(3).replace(".", ",");
    return score >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const handleSelectSantri = (id: string) => {
    setSelectedSantriId(id);
    setIsMobileSantriExpanded(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSantri) {
      showToast("Pilih santri terlebih dahulu", "error");
      return;
    }
    if (!activeUnsur) {
      showToast("Pilih jenis penilaian terlebih dahulu", "error");
      return;
    }

    addPenilaian({
      santriId: selectedSantri.id,
      santriName: selectedSantri.name,
      santriClass: selectedSantri.class,
      guruId: currentUser.id,
      guruName: currentUser.name,
      category: selectedCategoryName,
      unsurName: activeUnsur.name,
      indicatorText: `${activeUnsur.name} (${currentIndicators.length} Butir Baku)`,
      score: totalUnsurScore,
      type: penilaianType,
      notes: notes || "",
      proofFileName: attachedFile?.name,
      proofFileSize: attachedFile?.size
    });

    showToast(`Penilaian ${activeUnsur.name} (${formatScoreWithSign(totalUnsurScore)}) tersimpan`, "success");
    setNotes("");
    setAttachedFile(null);
    router.push("/guru/riwayat");
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 max-w-5xl mx-auto overflow-x-hidden pb-32">
        <div className="mizan-card p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base sm:text-xl font-serif font-black text-[#172033] tracking-tight">
              Input Penilaian Santri
            </h1>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Catat prestasi dan kedisiplinan santri
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full mizan-pill bg-[#ECFDF5] text-[#065F46]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Siap Lapor
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 w-full">
          <div className="lg:col-span-4 space-y-3">
            <Card className="p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#1B4D3E]" />
                  Santri Dinilai
                </span>

                <button
                  type="button"
                  onClick={() => setIsMobileSantriExpanded(!isMobileSantriExpanded)}
                  className="lg:hidden text-[10px] font-bold text-[#1B4D3E] flex items-center gap-1 px-2.5 py-1 rounded-full mizan-pill bg-white"
                >
                  <span>{isMobileSantriExpanded ? "Tutup" : "Ganti"}</span>
                  {isMobileSantriExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {selectedSantri && (
                <CardInset className="p-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      initials={selectedSantri.avatar}
                      size="md"
                      variant={selectedSantri.gender === "Putra" ? "primary" : "gold"}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate">
                        {selectedSantri.name}
                      </p>
                      <p className="text-[10px] text-[#64748B] truncate">
                        Kelas {selectedSantri.class} • {selectedSantri.gender === "Putra" ? "Putra" : "Putri"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-[#94A3B8] block font-bold uppercase">Skor</span>
                    <span className="text-xs font-black font-mono text-[#1B4D3E]">
                      {formatScore(selectedSantri.currentScore)}
                    </span>
                  </div>
                </CardInset>
              )}

              <div className={`${isMobileSantriExpanded ? "block" : "hidden"} lg:block space-y-2.5 pt-1 border-t border-[#E2EBF4]`}>
                <div className="w-full">
                  <select
                    aria-label="Filter Kelas"
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] font-bold"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {classList.filter((c) => c !== "ALL").map((cls) => (
                      <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari santri..."
                    value={santriSearch}
                    onChange={(e) => setSantriSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E2EBF4] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 rounded-2xl mizan-inset bg-[#F1F5F9]/60">
                  {filteredSantriList.map((santri) => {
                    const isSelected = selectedSantri?.id === santri.id;
                    return (
                      <div
                        key={santri.id}
                        onClick={() => handleSelectSantri(santri.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-all ${
                          isSelected
                            ? "bg-white border border-[#1B4D3E] shadow-sm font-bold text-[#1B4D3E]"
                            : "bg-white/80 hover:bg-white border border-transparent text-[#172033]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            initials={santri.avatar}
                            size="sm"
                            variant={isSelected ? "primary" : "neutral"}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold leading-tight">
                              {santri.name}
                            </p>
                            <p className="text-[9px] text-[#64748B] truncate">
                              Kelas {santri.class}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] font-black text-[#1B4D3E] shrink-0">
                          {formatScore(santri.currentScore)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <CardSub className="p-3 text-center">
                <span className="text-[10px] font-bold text-[#065F46] block uppercase">
                  Prestasi
                </span>
                <span className="font-mono font-black text-sm text-[#065F46] mt-0.5 block">
                  +{formatScore(totalHasanahAccumulated)}
                </span>
              </CardSub>

              <CardSub className="p-3 text-center">
                <span className="text-[10px] font-bold text-[#991B1B] block uppercase">
                  Pelanggaran
                </span>
                <span className="font-mono font-black text-sm text-[#991B1B] mt-0.5 block">
                  -{formatScore(totalSayyiahAccumulated)}
                </span>
              </CardSub>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            <Card className="p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#1B4D3E]" />
                  Jenis Penilaian
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchPenilaianType("HASANAH")}
                  className={`py-2.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    penilaianType === "HASANAH"
                      ? "mizan-btn-primary shadow-sm"
                      : "mizan-btn-ghost text-[#64748B]"
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Prestasi (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchPenilaianType("SAYYIAH")}
                  className={`py-2.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    penilaianType === "SAYYIAH"
                      ? "bg-[#DC2626] text-white shadow-sm"
                      : "mizan-btn-ghost text-[#64748B]"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Pelanggaran (-)</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold text-[#64748B] uppercase">
                  Kategori Utama
                </label>
                <select
                  aria-label="Pilih Kategori Utama"
                  value={selectedCategoryName}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] font-bold focus:outline-none focus:border-[#1B4D3E]"
                >
                  {categoriesForType.map((cat) => (
                    <option key={cat.code} value={cat.name}>
                      [{cat.code}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase">
                    {penilaianType === "HASANAH" ? "Jenis Prestasi" : "Jenis Pelanggaran"} ({availableUnsurs.length})
                  </label>
                  <span className="text-[10px] text-[#94A3B8]">Klik untuk memilih dan buka rincian</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {availableUnsurs.map((uns, idx) => {
                    const isSelected = (selectedUnsurId || activeUnsur?.id) === uns.id;
                    const unsScore = uns.indicators.reduce((acc, ind) => acc + (ind.defaultScore || 0), 0);

                    return (
                      <div
                        key={uns.id}
                        className={`rounded-2xl transition-all border ${
                          isSelected
                            ? "bg-white border-[#1B4D3E] shadow-sm"
                            : "bg-[#F8FAFC] hover:bg-white border-[#E2EBF4]"
                        }`}
                      >
                        <div
                          onClick={() => handleUnsurToggle(uns.id)}
                          className="p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                              isSelected
                                ? "bg-[#1B4D3E] text-white"
                                : "bg-[#EEF2F6] text-[#64748B]"
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className={`text-xs block leading-snug truncate ${
                                isSelected ? "font-bold text-[#172033]" : "font-medium text-[#475569]"
                              }`}>
                                {uns.name}
                              </span>
                              <span className="text-[10px] text-[#94A3B8] block">
                                {uns.indicators.length} Butir Unsur
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                unsScore >= 0
                                  ? "bg-[#ECFDF5] text-[#065F46]"
                                  : "bg-[#FEF2F2] text-[#991B1B]"
                              }`}
                            >
                              {formatScoreWithSign(unsScore)}
                            </span>
                            {isSelected ? (
                              <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="px-3 pb-3 pt-1 border-t border-[#E2EBF4] space-y-2">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                              Rincian Unsur Penilaian ({uns.indicators.length} butir baku):
                            </p>
                            <div className="space-y-1.5 max-h-44 overflow-y-auto">
                              {uns.indicators.map((ind, indIdx) => (
                                <div
                                  key={ind.id}
                                  className="p-2 rounded-xl bg-[#F8FAFC] flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[10px] font-bold text-[#94A3B8] shrink-0">
                                      #{indIdx + 1}
                                    </span>
                                    <span className="text-[11px] text-[#172033] leading-snug">
                                      {ind.text}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                      ind.defaultScore >= 0
                                        ? "bg-emerald-100 text-[#065F46]"
                                        : "bg-red-100 text-[#991B1B]"
                                    }`}
                                  >
                                    {formatScoreWithSign(ind.defaultScore)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="p-3.5 sm:p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <CardSub className="p-2.5 text-center">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                    Skor Awal
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-[#172033] mt-0.5 block">
                    {formatScore(santriBaseScore)}
                  </span>
                </CardSub>

                <CardSub className="p-2.5 text-center">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                    Total Bobot
                  </span>
                  <span
                    className={`font-mono font-black text-xs sm:text-sm mt-0.5 block ${
                      totalUnsurScore >= 0 ? "text-[#065F46]" : "text-[#991B1B]"
                    }`}
                  >
                    {formatScoreWithSign(totalUnsurScore)}
                  </span>
                </CardSub>

                <CardSub className="p-2.5 text-center">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                    Proyeksi
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-[#1B4D3E] mt-0.5 block">
                    {formatScore(projectedCombinedIndex)}
                  </span>
                </CardSub>

                <CardSub className="p-2.5 text-center">
                  <span className="text-[10px] text-[#64748B] font-bold block uppercase">
                    Predikat
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full mizan-pill inline-block mt-1 truncate max-w-full ${predikat.color}`}>
                    {predikat.label}
                  </span>
                </CardSub>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Catatan Ringkas (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Keterangan singkat..."
                  className="w-full p-2.5 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] resize-none focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Lampiran Foto / Bukti
                </label>
                <FileUploadMock onFileChange={(file) => setAttachedFile(file)} />
              </div>

              <div className="hidden lg:grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => router.push("/guru/dashboard")}
                  className="py-2.5 px-3 rounded-full text-xs font-bold mizan-btn-ghost text-center"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-3 rounded-full text-xs font-bold mizan-btn-primary flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
              </div>
            </Card>
          </div>
        </form>

        <div className="fixed bottom-[68px] inset-x-3 md:inset-x-auto md:right-8 md:bottom-6 z-30 mizan-card p-3 flex items-center justify-between gap-3 shadow-xl bg-white/95 backdrop-blur-md border border-[#E2EBF4] rounded-3xl max-w-md mx-auto">
          <div className="min-w-0">
            <span className="text-[10px] text-[#94A3B8] block truncate font-bold">
              {selectedSantri?.name}
            </span>
            <span
              className={`text-sm font-black font-mono ${
                totalUnsurScore >= 0 ? "text-[#065F46]" : "text-[#991B1B]"
              }`}
            >
              {formatScoreWithSign(totalUnsurScore)} Poin
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </RoleShell>
  );
}
