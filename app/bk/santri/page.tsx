"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  User,
  GraduationCap,
  FileText,
  Share2,
  Eye,
  LayoutGrid,
  List,
  MoreVertical
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import { generateSantriPdf } from "@/lib/pdf-generator";
import { ShareModal } from "@/components/ShareModal";
import { PhotoViewerModal, PhotoItem } from "@/components/PhotoViewerModal";
import { Santri } from "@/lib/mock-data";

export default function BkSantriListPage() {
  const { accessibleSantriList, currentUser, penilaianList, absensiList, showToast } = useMizan();
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"Semua" | "Putra" | "Putri">(
    currentUser.gender === "Putri" ? "Putri" : "Putra"
  );
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [shareTargetSantri, setShareTargetSantri] = useState<Santri | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const PAGE_SIZE = 12;

  const classes = useMemo(() => {
    let list = accessibleSantriList;
    if (isSuperAdmin && genderFilter !== "Semua") {
      list = list.filter((s) => s.gender === genderFilter);
    }
    const set = new Set(list.map((s) => s.class));
    return ["ALL", ...Array.from(set).sort()];
  }, [accessibleSantriList, isSuperAdmin, genderFilter]);

  const filteredSantri = useMemo(() => {
    return accessibleSantriList.filter((s) => {
      const matchGender = isSuperAdmin ? (genderFilter === "Semua" || s.gender === genderFilter) : true;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);
      const matchClass = selectedClass === "ALL" || s.class === selectedClass;
      return matchGender && matchSearch && matchClass;
    });
  }, [accessibleSantriList, isSuperAdmin, genderFilter, searchQuery, selectedClass]);

  const totalPages = Math.ceil(filteredSantri.length / PAGE_SIZE) || 1;

  const paginatedSantri = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSantri.slice(start, start + PAGE_SIZE);
  }, [filteredSantri, currentPage]);

  const photoItems: PhotoItem[] = useMemo(() => {
    return paginatedSantri.map((s) => {
      const defaultAvatar =
        s.gender === "Putri"
          ? "/default-avatar-santriwati.jpg"
          : "/default-avatar-santri.jpg";
      return {
        id: s.id,
        name: s.name,
        role: `Santri Kelas ${s.class} (${s.gender === "Putra" ? "L" : "P"})`,
        photoUrl: s.avatarUrl || defaultAvatar,
        avatarInitials: s.avatar,
        gender: s.gender,
        classInfo: s.class,
        nis: s.nis
      };
    });
  }, [paginatedSantri]);

  const handleOpenPhotoViewer = (santriId: string) => {
    const idx = photoItems.findIndex((item) => item.id === santriId);
    if (idx !== -1) {
      setPhotoViewerIndex(idx);
      setIsPhotoViewerOpen(true);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleGenderChange = (val: "Semua" | "Putra" | "Putri") => {
    setGenderFilter(val);
    setSelectedClass("ALL");
    setCurrentPage(1);
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setCurrentPage(1);
  };

  const formatScore = (score: number) => {
    return score.toFixed(3).replace(".", ",");
  };

  const getPredikatBadge = (score: number) => {
    if (score >= 90) return { label: "MUMTAZ", color: "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]" };
    if (score >= 80) return { label: "JAYYID JIDDAN", color: "text-[#1B4D3E] bg-[#E8F0EC] border-[#1B4D3E]/30" };
    if (score >= 70) return { label: "JAYYID", color: "text-[#854D0E] bg-[#FEFCE8] border-[#FEF08A]" };
    if (score >= 60) return { label: "MAQBUL", color: "text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]" };
    return { label: "RASIB", color: "text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]" };
  };

  const handleDownloadRapor = async (santri: Santri) => {
    try {
      showToast(`Menyiapkan rapor ${santri.name}...`, "info");
      const studentPenilaian = penilaianList.filter((p) => p.santriId === santri.id);
      const studentAbsensi = absensiList.filter((a) => a.santriId === santri.id);
      await generateSantriPdf(santri, studentPenilaian, studentAbsensi);
      showToast(`Rapor ${santri.name} siap`, "success");
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        showToast("Gagal mengunduh rapor", "error");
      }
    }
  };

  const handleOpenShare = (santri: Santri) => {
    setShareTargetSantri(santri);
    setIsShareModalOpen(true);
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-[#172033] tracking-tight">
              Data Santri & Santriwati
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Pengasuhan Pondok (BK) • Total {filteredSantri.length} santri terdaftar
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mizan-pill bg-[#ECFDF5] text-[#065F46]">
            <GraduationCap className="w-3.5 h-3.5" />
            Pengasuhan BK
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama santri atau NIS..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>

            {isSuperAdmin ? (
              <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E2EBF4] rounded-2xl shrink-0">
                {(["Semua", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenderChange(g)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      genderFilter === g
                        ? "bg-[#1B4D3E] text-white shadow-2xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g === "Semua" ? "Semua" : g === "Putra" ? "L" : "P"}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center px-3 py-2 bg-white border border-[#E2EBF4] rounded-2xl text-xs font-bold text-[#1B4D3E] shrink-0">
                Santri {currentUser.gender || "Putra"}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
                {classes.map((cls) => {
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleClassChange(cls)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                        isSelected
                          ? "bg-[#C5A059] text-white shadow-2xs"
                          : "bg-white text-[#64748B] border border-[#E2EBF4] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {cls === "ALL" ? "Semua" : `Kls ${cls}`}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center p-0.5 rounded-xl bg-white border border-[#E2EBF4] shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === "grid"
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                  title="Tampilan Grid"
                  aria-label="Grid"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    viewMode === "list"
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                  title="Tampilan List"
                  aria-label="List"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
              {paginatedSantri.map((santri) => {
                const pred = getPredikatBadge(santri.currentScore);
                const defaultAvatar =
                  santri.gender === "Putri"
                    ? "/default-avatar-santriwati.jpg"
                    : "/default-avatar-santri.jpg";
                const photoUrl = santri.avatarUrl || defaultAvatar;

                return (
                  <div
                    key={santri.id}
                    className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E2EBF4] shadow-2xs hover:shadow-2xl hover:border-[#1B4D3E]/40 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between text-left"
                  >
                    <div
                      onClick={() => handleOpenPhotoViewer(santri.id)}
                      className="sheen-wrapper relative w-full aspect-square overflow-hidden bg-[#0E271F] shrink-0 cursor-pointer"
                      title="Klik untuk melihat foto santri"
                    >
                      <img
                        src={photoUrl}
                        alt={santri.name}
                        onError={(e) => {
                          e.currentTarget.src = defaultAvatar;
                        }}
                        className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
                    </div>

                    <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 bg-white space-y-2.5">
                      <div className="space-y-1 sm:space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono font-black bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20">
                            {santri.class}
                          </span>
                          <span
                            className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[10px] font-bold border shrink-0 ${
                              santri.gender === "Putra"
                                ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                                : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                            }`}
                          >
                            {santri.gender === "Putra" ? "L" : "P"}
                          </span>
                        </div>

                        <Link
                          href={`/bk/santri/${santri.id}`}
                          className="font-serif font-black text-xs sm:text-sm text-[#172033] line-clamp-1 group-hover:text-[#1B4D3E] transition-colors block"
                        >
                          {santri.name}
                        </Link>
                        <p className="text-[10px] text-[#64748B] font-mono truncate">
                          NIS {santri.nis} • {santri.kamar || santri.asrama || "Asrama"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-[#FAF7EE]/60 border border-[#E2E8F0] text-center">
                        <div>
                          <span className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold uppercase block">
                            Skor Adab
                          </span>
                          <span className="font-mono text-xs sm:text-sm font-black text-[#1B4D3E] block">
                            {formatScore(santri.currentScore)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold uppercase block">
                            Predikat
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border truncate max-w-full ${pred.color}`}>
                            {pred.label}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F1F5F9] grid grid-cols-3 gap-1">
                        <Link
                          href={`/bk/santri/${santri.id}`}
                          className="py-1.5 rounded-xl bg-[#F8FAFC] text-[#172033] hover:bg-[#EEF2F6] text-[10px] font-bold border border-[#E2EBF4] text-center transition-colors"
                        >
                          Detail
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDownloadRapor(santri)}
                          className="py-1.5 rounded-xl bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5] text-[10px] font-bold border border-[#A7F3D0] text-center transition-colors cursor-pointer"
                        >
                          Rapor
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenShare(santri)}
                          className="py-1.5 rounded-xl bg-[#FAF7EE] text-[#854D0E] hover:bg-[#FEFCE8] text-[10px] font-bold border border-[#FEF08A] text-center transition-colors cursor-pointer"
                        >
                          Bagikan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedSantri.map((santri) => {
                const pred = getPredikatBadge(santri.currentScore);
                return (
                  <div
                    key={santri.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E2EBF4] hover:border-[#1B4D3E]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        initials={santri.avatar}
                        size="md"
                        variant={santri.gender === "Putra" ? "primary" : "gold"}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/bk/santri/${santri.id}`}
                            className="font-bold text-xs sm:text-sm text-[#172033] hover:text-[#1B4D3E] transition-colors truncate"
                          >
                            {santri.name}
                          </Link>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              santri.gender === "Putra"
                                ? "bg-[#ECFDF5] text-[#065F46]"
                                : "bg-[#FAF7EE] text-[#A8833E]"
                            }`}
                          >
                            {santri.gender}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EEF2F6] text-[#172033] whitespace-nowrap">
                            {santri.class}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${pred.color}`}>
                            {pred.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#64748B] mt-0.5 flex-wrap">
                          <span>NIS: <strong className="font-mono text-[#172033]">{santri.nis}</strong></span>
                          {(santri.kamar || santri.asrama) && (
                            <>
                              <span>•</span>
                              <span>{santri.kamar || santri.asrama}</span>
                            </>
                          )}
                          {santri.waliName && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[140px]">Wali: {santri.waliName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-[#F1F5F9]">
                      <div className="text-right">
                        <span className="text-[9px] text-[#94A3B8] font-bold block uppercase">
                          Skor Adab
                        </span>
                        <span className="text-xs sm:text-sm font-black font-mono text-[#1B4D3E]">
                          {formatScore(santri.currentScore)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/bk/santri/${santri.id}`}
                          className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-[#F8FAFC] text-[#172033] hover:bg-[#EEF2F6] border border-[#E2EBF4] transition-colors"
                        >
                          Detail
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDownloadRapor(santri)}
                          className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors"
                        >
                          Rapor
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenShare(santri)}
                          className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-[#FAF7EE] text-[#854D0E] hover:bg-[#FEFCE8] border border-[#FEF08A] transition-colors"
                        >
                          Bagikan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredSantri.length}
            itemsPerPage={PAGE_SIZE}
            itemName="santri"
          />

          {filteredSantri.length === 0 && (
            <div className="text-center py-12 mizan-card p-6">
              <User className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-[#172033]">Santri tidak ditemukan</p>
            </div>
          )}
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareTargetSantri(null);
          }}
          initialType="SANTRI"
          targetSantri={shareTargetSantri || undefined}
        />

        <PhotoViewerModal
          isOpen={isPhotoViewerOpen}
          onClose={() => setIsPhotoViewerOpen(false)}
          items={photoItems}
          currentIndex={photoViewerIndex}
          onIndexChange={setPhotoViewerIndex}
        />
      </div>
    </RoleShell>
  );
}
