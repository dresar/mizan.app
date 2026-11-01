"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  ShieldAlert,
  Search,
  User,
  Check,
  ChevronDown,
  X,
  SlidersHorizontal,
  Layers,
  FileText,
  Printer,
  Download,
  Share2,
  Eye,
  ExternalLink,
  CalendarCheck,
  Phone,
  Scale,
  Clock,
  Calendar,
  History
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { FileUploadMock } from "@/components/ui/FileUploadMock";
import categoriesMasterData from "@/lib/categories-master.json";
import { generateSantriPdf } from "@/lib/pdf-generator";
import { ShareModal } from "@/components/ShareModal";
import { Santri } from "@/lib/mock-data";

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

interface MasterFlatItem {
  unsurId: string;
  unsurName: string;
  cleanName: string;
  categoryCode: string;
  categoryName: string;
  type: "HASANAH" | "SAYYIAH";
  indicatorsCount: number;
  totalScore: number;
  indicators: IndicatorItem[];
  searchText: string;
}

export default function PengasuhanPenilaianPage() {
  const router = useRouter();
  const {
    santriList,
    currentUser,
    addPenilaian,
    showToast,
    penilaianList,
    absensiList
  } = useMizan();

  const [genderFilter, setGenderFilter] = useState<"Semua" | "Putra" | "Putri">(
    currentUser.gender === "Putri" ? "Putri" : "Putra"
  );

  useEffect(() => {
    if (currentUser?.gender) {
      setGenderFilter(currentUser.gender === "Putri" ? "Putri" : "Putra");
    }
  }, [currentUser?.gender]);

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateLive = useMemo(() => {
    if (!currentTime) return "";
    return currentTime.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, [currentTime]);

  const formattedTimeLive = useMemo(() => {
    if (!currentTime) return "";
    return (
      currentTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) + " WIB"
    );
  }, [currentTime]);

  const [selectedSantriId, setSelectedSantriId] = useState<string>("");
  const [penilaianType, setPenilaianType] = useState<"HASANAH" | "SAYYIAH">("HASANAH");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [selectedUnsurId, setSelectedUnsurId] = useState<string>("");
  const [santriSearch, setSantriSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [isMobileSantriExpanded, setIsMobileSantriExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number } | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalSantri, setProfileModalSantri] = useState<Santri | null>(null);
  const [profileModalTab, setProfileModalTab] = useState<"CATATAN" | "ABSENSI" | "WALI">("CATATAN");
  const [isDownloadingRapor, setIsDownloadingRapor] = useState(false);

  const handleDownloadRapor = async (targetSantri: Santri) => {
    if (!targetSantri || isDownloadingRapor) return;
    try {
      setIsDownloadingRapor(true);
      showToast(`Menyiapkan rapor ${targetSantri.name}...`, "info");
      const studentPenilaian = penilaianList.filter((p) => p.santriId === targetSantri.id);
      const studentAbsensi = absensiList.filter((a) => a.santriId === targetSantri.id);
      await generateSantriPdf(targetSantri, studentPenilaian, studentAbsensi);
      showToast(`Rapor ${targetSantri.name} siap`, "success");
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        showToast("Gagal mengunduh rapor", "error");
      }
    } finally {
      setIsDownloadingRapor(false);
    }
  };

  const [liveSearchQuery, setLiveSearchQuery] = useState("");
  const [isLiveSearchOpen, setIsLiveSearchOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalTypeFilter, setModalTypeFilter] = useState<"ALL" | "HASANAH" | "SAYYIAH">("ALL");
  const [modalCategoryFilter, setModalCategoryFilter] = useState("ALL");

  const [isUnsurDropdownOpen, setIsUnsurDropdownOpen] = useState(false);
  const [unsurDropdownSearch, setUnsurDropdownSearch] = useState("");

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const unsurDropdownRef = useRef<HTMLDivElement>(null);

  const cleanUnsurName = (name: string) => name.replace(/^\d+\.\s*/, "");

  const allMasterItems: MasterFlatItem[] = useMemo(() => {
    const list: MasterFlatItem[] = [];
    (categoriesMasterData as unknown as CategoryItem[]).forEach((cat) => {
      (cat.unsurs || []).forEach((u) => {
        const uType = (u.type || "HASANAH") as "HASANAH" | "SAYYIAH";
        const cName = cleanUnsurName(u.name);
        const indScores = (u.indicators || []).reduce((acc, ind) => acc + (ind.defaultScore || 0), 0);
        const allIndTexts = (u.indicators || []).map((i) => i.text).join(" ");
        const searchBlob = `${cName} ${u.name} ${cat.name} ${allIndTexts} ${uType === "HASANAH" ? "prestasi kebaikan" : "pelanggaran sayyiah"}`.toLowerCase();

        list.push({
          unsurId: u.id,
          unsurName: u.name,
          cleanName: cName,
          categoryCode: cat.code,
          categoryName: cat.name,
          type: uType,
          indicatorsCount: (u.indicators || []).length,
          totalScore: indScores,
          indicators: u.indicators || [],
          searchText: searchBlob
        });
      });
    });
    return list;
  }, []);

  const liveSearchResults = useMemo(() => {
    const q = liveSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const words = q.split(/\s+/).filter(Boolean);
    return allMasterItems.filter((item) =>
      words.every((w) => item.searchText.includes(w))
    );
  }, [liveSearchQuery, allMasterItems]);

  const modalFilteredItems = useMemo(() => {
    const q = modalSearchQuery.trim().toLowerCase();
    const words = q ? q.split(/\s+/).filter(Boolean) : [];

    return allMasterItems.filter((item) => {
      const matchType = modalTypeFilter === "ALL" || item.type === modalTypeFilter;
      const matchCat = modalCategoryFilter === "ALL" || item.categoryName === modalCategoryFilter;
      const matchQuery = words.length === 0 || words.every((w) => item.searchText.includes(w));
      return matchType && matchCat && matchQuery;
    });
  }, [allMasterItems, modalSearchQuery, modalTypeFilter, modalCategoryFilter]);

  const categoriesForType: CategoryItem[] = useMemo(() => {
    return (categoriesMasterData as unknown as CategoryItem[])
      .map((cat) => ({
        code: cat.code,
        name: cat.name,
        unsurs: (cat.unsurs || []).filter((u: UnsurItem) => u.type === penilaianType)
      }))
      .filter((cat) => cat.unsurs.length > 0);
  }, [penilaianType]);

  const allUnsursForType = useMemo(() => {
    return categoriesForType.flatMap((cat) =>
      cat.unsurs.map((u) => ({ ...u, categoryName: cat.name }))
    );
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
      allUnsursForType.find((uns) => uns.id === selectedUnsurId) ||
      availableUnsurs[0] ||
      null
    );
  }, [allUnsursForType, availableUnsurs, selectedUnsurId]);

  const filteredUnsursForDropdown = useMemo(() => {
    const q = unsurDropdownSearch.trim().toLowerCase();
    if (!q) return availableUnsurs;
    return availableUnsurs.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.indicators.some((ind) => ind.text.toLowerCase().includes(q))
    );
  }, [availableUnsurs, unsurDropdownSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsLiveSearchOpen(false);
      }
      if (unsurDropdownRef.current && !unsurDropdownRef.current.contains(event.target as Node)) {
        setIsUnsurDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentIndicators = useMemo(() => {
    return activeUnsur?.indicators || [];
  }, [activeUnsur]);

  const totalUnsurScore = useMemo(() => {
    return currentIndicators.reduce((acc, ind) => acc + (ind.defaultScore || 0), 0);
  }, [currentIndicators]);

  const handleSelectMasterItem = (item: MasterFlatItem) => {
    setPenilaianType(item.type);
    setSelectedCategoryName(item.categoryName);
    setSelectedUnsurId(item.unsurId);
    setLiveSearchQuery("");
    setIsLiveSearchOpen(false);
    setIsCatalogModalOpen(false);
    setIsUnsurDropdownOpen(false);
    showToast(`Memilih: ${item.cleanName}`);
  };

  const handleCategoryChange = (catName: string) => {
    setSelectedCategoryName(catName);
    const targetCat = categoriesForType.find((c) => c.name === catName);
    if (targetCat && targetCat.unsurs.length > 0) {
      setSelectedUnsurId(targetCat.unsurs[0].id);
    } else {
      setSelectedUnsurId("");
    }
  };

  const handleUnsurSelect = (unsurId: string) => {
    setSelectedUnsurId(unsurId);
    setIsUnsurDropdownOpen(false);
    const target = allUnsursForType.find((u) => u.id === unsurId);
    if (target && target.categoryName && target.categoryName !== selectedCategoryName) {
      setSelectedCategoryName(target.categoryName);
    }
  };

  const handleSwitchPenilaianType = (type: "HASANAH" | "SAYYIAH") => {
    setPenilaianType(type);
    setLiveSearchQuery("");
    const cats = (categoriesMasterData as unknown as CategoryItem[])
      .map((cat) => ({
        code: cat.code,
        name: cat.name,
        unsurs: (cat.unsurs || []).filter((u: UnsurItem) => u.type === type)
      }))
      .filter((cat) => cat.unsurs.length > 0);
    if (cats.length > 0) {
      setSelectedCategoryName(cats[0].name);
      if (cats[0].unsurs.length > 0) {
        setSelectedUnsurId(cats[0].unsurs[0].id);
      }
    }
  };

  const classList = useMemo(() => {
    const classes = Array.from(new Set(santriList.map((s) => s.class)));
    return ["ALL", ...classes];
  }, [santriList]);

  const filteredSantriList = useMemo(() => {
    return santriList.filter((s) => {
      const matchGender = genderFilter === "Semua" || s.gender === genderFilter;
      const matchSearch =
        s.name.toLowerCase().includes(santriSearch.toLowerCase()) ||
        s.nis.includes(santriSearch);
      const matchClass =
        selectedClassFilter === "ALL" || s.class === selectedClassFilter;
      return matchGender && matchSearch && matchClass;
    });
  }, [santriList, genderFilter, santriSearch, selectedClassFilter]);

  const selectedSantri = useMemo(() => {
    if (selectedSantriId) {
      const found = filteredSantriList.find((s) => s.id === selectedSantriId);
      if (found) return found;
    }
    return filteredSantriList[0] || null;
  }, [filteredSantriList, selectedSantriId]);

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

    const now = new Date();
    const finalUnsurName = cleanUnsurName(activeUnsur.name);
    addPenilaian({
      santriId: selectedSantri.id,
      santriName: selectedSantri.name,
      santriClass: selectedSantri.class,
      guruId: currentUser.id,
      guruName: currentUser.name,
      category: activeCategory?.name || selectedCategoryName || "",
      unsurName: finalUnsurName,
      indicatorText: `${finalUnsurName} (${currentIndicators.length} Butir Baku)`,
      score: totalUnsurScore,
      type: penilaianType,
      notes: notes || "",
      proofFileName: attachedFile?.name,
      proofFileSize: attachedFile?.size,
      createdAt: now.toISOString(),
      dateKey: now.toISOString().split("T")[0]
    });

    showToast(`Penilaian ${finalUnsurName} (${formatScoreWithSign(totalUnsurScore)}) tersimpan`, "success");
    setNotes("");
    setAttachedFile(null);
    const uParam = currentUser?.username ? `?u=${encodeURIComponent(currentUser.username)}` : "";
    router.push(`/bk/dashboard${uParam}`);
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base sm:text-xl font-serif font-black text-[#172033] tracking-tight">
              Input Penilaian Santri & Santriwati
            </h1>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Pusat Pengasuhan Pondok (BK) • Catat prestasi hasanah dan pelanggaran sayyiah
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full mizan-pill bg-[#ECFDF5] text-[#065F46]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Pengasuhan BK
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
                  <span>{isMobileSantriExpanded ? "Tutup" : "Pilih"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileSantriExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/20 flex items-center gap-3">
                <Avatar
                  initials={selectedSantri?.avatar || "SN"}
                  size="md"
                  variant={selectedSantri?.gender === "Putri" ? "gold" : "primary"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#172033] truncate">
                    {selectedSantri?.name || "Pilih Santri"}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate">
                    NIS: {selectedSantri?.nis || "-"} • Kelas {selectedSantri?.class || "-"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-[#065F46] font-mono">
                      Skor: {formatScore(selectedSantri?.currentScore || 80)}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-[#64748B] border border-[#E2EBF4]">
                      {selectedSantri?.gender || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSantri && (
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileModalSantri(selectedSantri);
                      setIsProfileModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white text-[#1B4D3E] border border-[#A7F3D0] hover:bg-[#ECFDF5] text-[10px] font-bold shadow-2xs transition-colors"
                  >
                    <Eye className="w-3 h-3 text-[#1B4D3E]" />
                    <span>Profil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadRapor(selectedSantri)}
                    disabled={isDownloadingRapor}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] text-[10px] font-bold shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-3 h-3 text-[#C5A059]" />
                    <span>{isDownloadingRapor ? "Proses" : "Rapor"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white text-[#854D0E] border border-[#FEF08A] hover:bg-[#FEFCE8] text-[10px] font-bold shadow-2xs transition-colors"
                  >
                    <Share2 className="w-3 h-3 text-[#C5A059]" />
                    <span>Bagikan</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#EEF2F6]">
                {(["Semua", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenderFilter(g)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      genderFilter === g
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className={`space-y-2.5 ${isMobileSantriExpanded ? "block" : "hidden lg:block"}`}>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Cari nama / NIS..."
                      value={santriSearch}
                      onChange={(e) => setSantriSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <select
                    aria-label="Filter Kelas"
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="px-2 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl font-bold focus:outline-none"
                  >
                    {classList.map((c) => (
                      <option key={c} value={c}>
                        {c === "ALL" ? "Semua" : `Kls ${c}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                  {filteredSantriList.map((santri) => {
                    const isSelected = santri.id === selectedSantri?.id;
                    return (
                      <div
                        key={santri.id}
                        onClick={() => handleSelectSantri(santri.id)}
                        className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#1B4D3E] text-white shadow-xs"
                            : "bg-[#F8FAFC] hover:bg-[#EEF2F6] text-[#172033]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            initials={santri.avatar}
                            size="sm"
                            variant={santri.gender === "Putri" ? "gold" : "primary"}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold leading-tight">
                              {santri.name}
                            </p>
                            <p className="text-[9px] text-[#64748B] truncate">
                              Kelas {santri.class} • {santri.gender}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`font-mono text-[11px] font-black ${isSelected ? "text-white" : "text-[#1B4D3E]"}`}>
                            {formatScore(santri.currentScore)}
                          </span>
                          <button
                            type="button"
                            title="Profil"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileModalSantri(santri);
                              setIsProfileModalOpen(true);
                            }}
                            className={`p-1 rounded-lg transition-colors ${
                              isSelected
                                ? "text-white/80 hover:text-white hover:bg-white/20"
                                : "text-[#64748B] hover:text-[#1B4D3E] hover:bg-white/80"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                  <span>Prestasi</span>
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
                  <span>Pelanggaran</span>
                </button>
              </div>

              <div className="relative pt-1" ref={searchBoxRef}>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={liveSearchQuery}
                      onFocus={() => setIsLiveSearchOpen(true)}
                      onChange={(e) => {
                        setLiveSearchQuery(e.target.value);
                        setIsLiveSearchOpen(true);
                      }}
                      placeholder="Cari cepat (contoh: tidur, sholat, sandal, bicara, kabur)..."
                      className="w-full pl-9 pr-8 py-2.5 text-xs bg-[#F8FAFC] focus:bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E] shadow-2xs transition-colors"
                    />
                    {liveSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setLiveSearchQuery("");
                          setIsLiveSearchOpen(false);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setModalSearchQuery(liveSearchQuery);
                      setIsCatalogModalOpen(true);
                    }}
                    title="Buka Katalog Lengkap Indikator"
                    className="p-2.5 rounded-2xl bg-white border border-[#E2EBF4] text-[#1B4D3E] hover:bg-[#FAF7EE] shadow-2xs transition-colors flex items-center gap-1 text-xs font-bold shrink-0"
                  >
                    <Layers className="w-4 h-4 text-[#C5A059]" />
                    <span className="hidden sm:inline">Katalog</span>
                  </button>
                </div>

                {isLiveSearchOpen && liveSearchQuery.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E2EBF4] z-50 p-2 space-y-1.5">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-[#64748B] border-b border-[#F1F5F9]">
                      <span>
                        Ditemukan {liveSearchResults.length} hasil (5 ditampilkan di awal, gulir untuk melihat lainnya):
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLiveSearchOpen(false)}
                        className="text-[#94A3B8] hover:text-[#172033]"
                      >
                        Tutup ✕
                      </button>
                    </div>

                    <div className="max-h-[265px] overflow-y-auto space-y-1.5 pr-1">
                      {liveSearchResults.slice(0, 50).map((item) => (
                        <div
                          key={item.unsurId}
                          onClick={() => handleSelectMasterItem(item)}
                          className="p-2.5 rounded-xl border border-[#E2EBF4] hover:border-[#1B4D3E] hover:bg-[#FAF7EE]/60 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  item.type === "HASANAH"
                                    ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {item.type === "HASANAH" ? "Prestasi" : "Pelanggaran"}
                              </span>
                              <span className="text-[10px] font-semibold text-[#64748B] truncate">
                                Kat. {item.categoryCode}: {item.categoryName}
                              </span>
                            </div>
                            <p className="font-bold text-[#172033] leading-snug">
                              {item.cleanName}
                            </p>
                            <span className="text-[10px] text-[#94A3B8] block truncate mt-0.5">
                              {item.indicators.map((i) => i.text).slice(0, 2).join(", ")}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-xs font-mono font-bold px-2 py-1 rounded-lg block ${
                                item.totalScore >= 0
                                  ? "bg-emerald-50 text-[#065F46] border border-emerald-200"
                                  : "bg-red-50 text-[#991B1B] border border-red-200"
                              }`}
                            >
                              {formatScoreWithSign(item.totalScore)}
                            </span>
                            <span className="text-[9px] text-[#94A3B8] mt-0.5 block">
                              {item.indicatorsCount} Butir
                            </span>
                          </div>
                        </div>
                      ))}

                      {liveSearchResults.length === 0 && (
                        <div className="py-6 text-center text-xs text-[#94A3B8]">
                          Tidak ada kalimat atau kata kunci yang cocok dengan &quot;{liveSearchQuery}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase">
                    Kategori Utama
                  </label>
                  <select
                    aria-label="Pilih Kategori Utama"
                    value={activeCategory?.name || selectedCategoryName || ""}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] font-bold focus:outline-none focus:border-[#1B4D3E]"
                  >
                    {categoriesForType.map((cat) => (
                      <option key={cat.code} value={cat.name}>
                        {cat.code}. {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 relative" ref={unsurDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase">
                      {penilaianType === "HASANAH" ? "Jenis Prestasi" : "Jenis Pelanggaran"} ({availableUnsurs.length})
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsUnsurDropdownOpen(!isUnsurDropdownOpen)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E2EBF4] hover:border-[#1B4D3E] rounded-2xl text-[#172033] font-bold text-left flex items-center justify-between gap-2 shadow-2xs transition-colors"
                  >
                    <span className="truncate">
                      {activeUnsur ? cleanUnsurName(activeUnsur.name) : "Pilih jenis..."}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          totalUnsurScore >= 0
                            ? "bg-emerald-50 text-[#065F46]"
                            : "bg-red-50 text-[#991B1B]"
                        }`}
                      >
                        {formatScoreWithSign(totalUnsurScore)}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${isUnsurDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {isUnsurDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E2EBF4] z-40 p-2 space-y-1.5">
                      <input
                        type="text"
                        placeholder="Filter pilihan dalam kategori ini..."
                        value={unsurDropdownSearch}
                        onChange={(e) => setUnsurDropdownSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl focus:outline-none focus:border-[#1B4D3E]"
                      />

                      <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                        {filteredUnsursForDropdown.map((uns) => {
                          const unsScore = uns.indicators.reduce((acc, ind) => acc + (ind.defaultScore || 0), 0);
                          const isSelected = uns.id === activeUnsur?.id;

                          return (
                            <div
                              key={uns.id}
                              onClick={() => handleUnsurSelect(uns.id)}
                              className={`p-2 rounded-xl text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                                isSelected
                                  ? "bg-[#1B4D3E] text-white font-bold"
                                  : "hover:bg-[#FAF7EE] text-[#172033]"
                              }`}
                            >
                              <span className="truncate flex-1">
                                {cleanUnsurName(uns.name)}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : unsScore >= 0
                                    ? "bg-emerald-50 text-[#065F46]"
                                    : "bg-red-50 text-[#991B1B]"
                                }`}
                              >
                                {formatScoreWithSign(unsScore)}
                              </span>
                            </div>
                          );
                        })}

                        {filteredUnsursForDropdown.length === 0 && (
                          <div className="py-4 text-center text-xs text-[#94A3B8]">
                            Tidak ada pilihan yang cocok
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {activeUnsur && currentIndicators.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] space-y-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#172033] uppercase tracking-wider">
                      Rincian Unsur Penilaian ({currentIndicators.length} butir baku):
                    </p>
                    <span
                      className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${
                        totalUnsurScore >= 0
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : "bg-[#FEF2F2] text-[#991B1B]"
                      }`}
                    >
                      {formatScoreWithSign(totalUnsurScore)}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                    {currentIndicators.map((ind, indIdx) => (
                      <div
                        key={ind.id}
                        className="p-2.5 rounded-xl bg-white border border-[#E2EBF4]/80 flex items-center justify-between gap-2.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-[#94A3B8] shrink-0">
                            #{indIdx + 1}
                          </span>
                          <span className="text-[11px] font-medium text-[#172033] leading-snug">
                            {ind.text}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                            ind.defaultScore >= 0
                              ? "bg-emerald-50 text-[#065F46] border border-emerald-200"
                              : "bg-red-50 text-[#991B1B] border border-red-200"
                          }`}
                        >
                          {formatScoreWithSign(ind.defaultScore)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  onClick={() => router.push(`/bk/dashboard${currentUser?.username ? `?u=${encodeURIComponent(currentUser.username)}` : ""}`)}
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
              {selectedSantri?.name || "Santri"}
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

        {isCatalogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-[#E2EBF4] space-y-3 max-h-[88vh] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7EE] text-[#A8833E] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#172033]">
                      Katalog Indikator Penilaian Santri
                    </h2>
                    <p className="text-[10px] text-[#64748B]">
                      Pilih dari 686 indikator sikap, prestasi, atau pelanggaran
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#EEF2F6] text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Ketik kata kunci untuk mencari (contoh: kabur, sholat, tidur, adab)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-xl focus:outline-none focus:border-[#1B4D3E] font-semibold"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
                  <div className="inline-flex rounded-xl p-0.5 bg-[#EEF2F6] shrink-0">
                    {(["ALL", "HASANAH", "SAYYIAH"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setModalTypeFilter(t)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          modalTypeFilter === t
                            ? "bg-white text-[#1B4D3E] shadow-2xs"
                            : "text-[#64748B] hover:text-[#172033]"
                        }`}
                      >
                        {t === "ALL" ? "Semua" : t === "HASANAH" ? "Prestasi" : "Pelanggaran"}
                      </button>
                    ))}
                  </div>

                  <select
                    aria-label="Filter Kategori"
                    value={modalCategoryFilter}
                    onChange={(e) => setModalCategoryFilter(e.target.value)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:outline-none shrink-0"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {(categoriesMasterData as unknown as CategoryItem[]).map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.code}. {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
                {modalFilteredItems.map((item) => (
                  <div
                    key={item.unsurId}
                    onClick={() => handleSelectMasterItem(item)}
                    className="p-3 rounded-2xl border border-[#E2EBF4] hover:border-[#1B4D3E] hover:bg-[#FAF7EE]/50 cursor-pointer transition-all flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.type === "HASANAH"
                              ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {item.type === "HASANAH" ? "Prestasi" : "Pelanggaran"}
                        </span>
                        <span className="text-[10px] font-semibold text-[#64748B]">
                          Kat. {item.categoryCode}: {item.categoryName}
                        </span>
                      </div>
                      <p className="font-bold text-[#172033]">
                        {item.cleanName}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.indicators.map((ind) => (
                          <span
                            key={ind.id}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[#F8FAFC] text-[#64748B] border border-[#E2EBF4]"
                          >
                            {ind.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-1 rounded-lg block ${
                          item.totalScore >= 0
                            ? "bg-emerald-50 text-[#065F46] border border-emerald-200"
                            : "bg-red-50 text-[#991B1B] border border-red-200"
                        }`}
                      >
                        {formatScoreWithSign(item.totalScore)}
                      </span>
                      <span className="text-[9px] text-[#94A3B8] mt-1 block font-semibold">
                        Pilih →
                      </span>
                    </div>
                  </div>
                ))}

                {modalFilteredItems.length === 0 && (
                  <div className="py-12 text-center text-xs text-[#94A3B8]">
                    Tidak ada indikator yang sesuai dengan filter pencarian
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          initialType="SANTRI"
          targetSantri={profileModalSantri || selectedSantri || undefined}
        />

        {isProfileModalOpen && profileModalSantri && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E2EBF4] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#EEF2F6] flex items-center justify-between gap-3 bg-[#FAF7EE]/60">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    initials={profileModalSantri.avatar}
                    size="md"
                    variant={profileModalSantri.gender === "Putra" ? "primary" : "gold"}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#172033] truncate">
                      {profileModalSantri.name}
                    </h3>
                    <p className="text-[10px] text-[#64748B] truncate">
                      NIS: {profileModalSantri.nis} • Kelas {profileModalSantri.class} ({profileModalSantri.gender})
                    </p>
                    <p className="text-[10px] text-[#A8833E] truncate font-medium">
                      {profileModalSantri.kamar || profileModalSantri.asrama}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 text-[#64748B] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4]">
                    <span className="text-[9px] text-[#64748B] font-semibold block uppercase">Skor Adab</span>
                    <span className="font-mono text-base font-black text-[#1B4D3E]">
                      {formatScore(profileModalSantri.currentScore)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
                    <span className="text-[9px] text-[#065F46] font-semibold block uppercase">Prestasi</span>
                    <span className="font-mono text-base font-black text-[#065F46]">
                      {penilaianList.filter((p) => p.santriId === profileModalSantri.id && p.type === "HASANAH").length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]">
                    <span className="text-[9px] text-[#991B1B] font-semibold block uppercase">Pelanggaran</span>
                    <span className="font-mono text-base font-black text-[#991B1B]">
                      {penilaianList.filter((p) => p.santriId === profileModalSantri.id && p.type === "SAYYIAH").length}
                    </span>
                  </div>
                </div>

                <div className="flex border-b border-[#EEF2F6] gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileModalTab("CATATAN")}
                    className={`pb-2 text-xs font-bold transition-colors ${
                      profileModalTab === "CATATAN"
                        ? "text-[#1B4D3E] border-b-2 border-[#1B4D3E]"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    Catatan
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileModalTab("ABSENSI")}
                    className={`pb-2 text-xs font-bold transition-colors ${
                      profileModalTab === "ABSENSI"
                        ? "text-[#1B4D3E] border-b-2 border-[#1B4D3E]"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    Presensi
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileModalTab("WALI")}
                    className={`pb-2 text-xs font-bold transition-colors ${
                      profileModalTab === "WALI"
                        ? "text-[#1B4D3E] border-b-2 border-[#1B4D3E]"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    Wali
                  </button>
                </div>

                {profileModalTab === "CATATAN" && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {penilaianList
                      .filter((p) => p.santriId === profileModalSantri.id)
                      .map((p) => (
                        <div key={p.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EBF4] text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                p.type === "HASANAH"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {p.type === "HASANAH" ? "Hasanah" : "Sayyi'ah"}
                            </span>
                            <span className="font-mono text-xs font-black">
                              {p.type === "HASANAH" ? `+${formatScore(Math.abs(p.score))}` : `-${formatScore(Math.abs(p.score))}`}
                            </span>
                          </div>
                          <p className="font-bold text-[#172033] mt-1">{p.unsurName || p.indicatorText}</p>
                          {p.notes && <p className="text-[10px] text-[#64748B] italic mt-0.5">"{p.notes}"</p>}
                          <p className="text-[9px] text-[#94A3B8] mt-1">{p.guruName} • {p.createdAt}</p>
                        </div>
                      ))}
                    {penilaianList.filter((p) => p.santriId === profileModalSantri.id).length === 0 && (
                      <div className="py-6 text-center text-xs text-[#94A3B8]">
                        Belum ada catatan sikap
                      </div>
                    )}
                  </div>
                )}

                {profileModalTab === "ABSENSI" && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {absensiList
                      .filter((a) => a.santriId === profileModalSantri.id)
                      .map((a) => (
                        <div key={a.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EBF4] flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#172033]">Sholat {a.waktuSholat}</span>
                            <p className="text-[10px] text-[#64748B]">{a.date}</p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              a.status === "Hadir"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.status === "Alpa"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                      ))}
                    {absensiList.filter((a) => a.santriId === profileModalSantri.id).length === 0 && (
                      <div className="py-6 text-center text-xs text-[#94A3B8]">
                        Belum ada catatan presensi
                      </div>
                    )}
                  </div>
                )}

                {profileModalTab === "WALI" && (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4]">
                      <span className="text-[10px] text-[#64748B] block">Nama Wali</span>
                      <p className="font-bold text-[#172033] mt-0.5">
                        {profileModalSantri.waliName || `Wali ${profileModalSantri.name.split(" ")[0]}`}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4]">
                      <span className="text-[10px] text-[#64748B] block">Kontak Telepon</span>
                      <p className="font-bold text-[#172033] mt-0.5 font-mono">
                        {profileModalSantri.waliPhone || "081234567890"}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4]">
                      <span className="text-[10px] text-[#64748B] block">Kamar Asrama</span>
                      <p className="font-bold text-[#172033] mt-0.5">
                        {profileModalSantri.kamar || "Kamar Pondok"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[#EEF2F6] flex items-center justify-between gap-2 bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-[#64748B] hover:text-[#172033] text-xs font-bold border border-[#E2EBF4] transition-colors"
                >
                  Tutup
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setIsShareModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white text-[#854D0E] border border-[#FEF08A] hover:bg-[#FEFCE8] text-xs font-bold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Bagikan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => profileModalSantri && handleDownloadRapor(profileModalSantri)}
                    disabled={isDownloadingRapor}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{isDownloadingRapor ? "Proses" : "Rapor"}</span>
                  </button>

                  <Link
                    href={`/bk/santri/${profileModalSantri.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#FAF7EE] text-[#1B4D3E] border border-[#C5A059]/40 hover:bg-[#F3EEDC] text-xs font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
