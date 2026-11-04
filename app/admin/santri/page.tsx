"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Plus,
  Trash2,
  CalendarCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  Edit,
  X,
  Check,
  GraduationCap,
  LayoutGrid,
  List
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Pagination } from "@/components/ui/Pagination";
import { Santri } from "@/lib/mock-data";

export default function AdminSantriPage() {
  const {
    santriList,
    kelasList,
    addClass,
    removeClass,
    addSantri,
    importSantriBatch,
    updateSantri,
    deleteSantri,
    deleteSantriBulk,
    showToast
  } = useMizan();

  const [selectedSantriIds, setSelectedSantriIds] = useState<string[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    ids: string[];
    name?: string;
    count?: number;
    isLoading?: boolean;
  }>({
    isOpen: false,
    ids: []
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassInput, setNewClassInput] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);

  const [formNis, setFormNis] = useState("");
  const [formName, setFormName] = useState("");
  const [formGender, setFormGender] = useState<"Putra" | "Putri">("Putra");
  const [formClass, setFormClass] = useState("1A");
  const [formBaseScore, setFormBaseScore] = useState("70.000");
  const [formWaliName, setFormWaliName] = useState("");
  const [formWaliPhone, setFormWaliPhone] = useState("");
  const [formStatus, setFormStatus] = useState<Santri["status"]>("Baik");

  const [importCsvText, setImportCsvText] = useState("");
  const [importPreview, setImportPreview] = useState<Array<Partial<Santri>>>([]);
  const [importFileName, setImportFileName] = useState("");

  const filteredSantri = useMemo(() => {
    return santriList.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);
      const matchGender =
        selectedGender === "ALL" || s.gender === selectedGender;
      const matchClass =
        selectedClass === "ALL" || s.class === selectedClass;
      return matchSearch && matchGender && matchClass;
    });
  }, [santriList, searchQuery, selectedGender, selectedClass]);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGender, selectedClass]);

  const totalPages = Math.max(1, Math.ceil(filteredSantri.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedSantri = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredSantri.slice(start, start + PAGE_SIZE);
  }, [filteredSantri, safePage]);

  const putraCount = santriList.filter((s) => s.gender === "Putra").length;
  const putriCount = santriList.filter((s) => s.gender === "Putri").length;

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassInput.trim()) {
      addClass(newClassInput.trim());
      setNewClassInput("");
      setShowClassModal(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "nis,name,gender,class,wali_name,wali_phone,base_score\n" +
      "20240811,Ahmad Fatih Pratama,Putra,1A,H. Pratama,081234567801,70.000\n" +
      "20240812,Nur Aisyah Azzahra,Putri,1C,H. Sulaiman,081234567802,70.000\n" +
      "20240813,Muhammad Rayhan,Putra,1B,Drs. H. Mulyadi,081234567803,70.000\n" +
      "20240814,Khadijah Zahra,Putri,1D,Hj. Siti Aminah,081234567804,70.000\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_import_santri.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCsv = () => {
    let csv = "NIS,Nama Santri,Gender,Kelas,Skor Akhlak,Status,Wali Santri,No HP Wali,Hadir,Alpa\n";
    filteredSantri.forEach((s) => {
      csv += `"${s.nis}","${s.name}","${s.gender}","${s.class}","${s.currentScore}","${s.status}","${s.waliName || ""}","${s.waliPhone || ""}","${s.totalHadir || 28}","${s.totalAlpa || 0}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `data_santri_mizan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    const payload = {
      app: "MIZAN",
      institution: "Pondok Pesantren Modern Raudhatussalam Mahato",
      exportedAt: new Date().toISOString(),
      count: filteredSantri.length,
      santri: filteredSantri
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `backup_santri_mizan_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data santri berhasil dicadangkan");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportCsvText(text);

      if (file.name.endsWith(".json")) {
        try {
          const json = JSON.parse(text);
          const list = Array.isArray(json)
            ? json
            : json.santri || json.data?.santri || [];
          const parsed = list
            .map((item: any) => ({
              nis: String(item.nis || item.stbk || ""),
              name: String(item.name || ""),
              gender: (item.gender === "Putri" ? "Putri" : "Putra") as "Putra" | "Putri",
              class: String(item.class || item.kelas || "1A"),
              waliName: item.waliName || item.wali_name || "",
              waliPhone: item.waliPhone || item.wali_phone || "",
              asrama: item.asrama || "",
              kamar: item.kamar || "",
              baseScore: parseFloat(item.baseScore || item.base_score || 70.0),
              currentScore: parseFloat(item.currentScore || item.current_score || item.baseScore || 70.0),
              status: (item.status || "Baik") as "Baik" | "Peringatan" | "Bahaya"
            }))
            .filter((s: any) => s.nis && s.name);
          setImportPreview(parsed);
          return;
        } catch {
          showToast("Format berkas JSON tidak valid", "error");
        }
      }

      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return;

    const parsed: Array<Partial<Santri>> = [];
    const startIndex = lines[0].toLowerCase().includes("nis") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const nis = parts[0];
        const name = parts[1];
        const gender = parts[2] === "Putri" ? "Putri" : "Putra";
        const cls = parts[3] || (gender === "Putra" ? "1A" : "1C");
        const waliName = parts[4] || "";
        const waliPhone = parts[5] || "";
        const baseScore = parseFloat(parts[6]) || 70.0;

        parsed.push({
          nis,
          name,
          gender,
          class: cls,
          waliName,
          waliPhone,
          baseScore,
          currentScore: baseScore,
          status: "Baik"
        });
      }
    }

    setImportPreview(parsed);
  };

  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    await importSantriBatch(importPreview);
    setShowImportModal(false);
    setImportPreview([]);
    setImportCsvText("");
    setImportFileName("");
  };

  const handleSaveNewSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNis.trim() || !formName.trim()) return;

    await addSantri({
      nis: formNis.trim(),
      name: formName.trim(),
      gender: formGender,
      class: formClass,
      baseScore: parseFloat(formBaseScore) || 70.0,
      waliName: formWaliName.trim(),
      waliPhone: formWaliPhone.trim()
    });

    setFormNis("");
    setFormName("");
    setFormWaliName("");
    setFormWaliPhone("");
    setShowAddModal(false);
  };

  const handleOpenEdit = (s: Santri) => {
    setEditingSantri(s);
    setFormNis(s.nis);
    setFormName(s.name);
    setFormGender(s.gender);
    setFormClass(s.class);
    setFormBaseScore(String(s.baseScore || 70.0));
    setFormWaliName(s.waliName || "");
    setFormWaliPhone(s.waliPhone || "");
    setFormStatus(s.status || "Baik");
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSantri) return;

    await updateSantri(editingSantri.id, {
      nis: formNis.trim(),
      name: formName.trim(),
      gender: formGender,
      class: formClass,
      baseScore: parseFloat(formBaseScore) || 70.0,
      waliName: formWaliName.trim(),
      waliPhone: formWaliPhone.trim(),
      status: formStatus
    });

    setShowEditModal(false);
    setEditingSantri(null);
  };

  const toggleSelectSantri = (id: string) => {
    setSelectedSantriIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const pageIds = paginatedSantri.map((s) => s.id);
    const isAllPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedSantriIds.includes(id));
    if (isAllPageSelected) {
      setSelectedSantriIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedSantriIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleOpenDeleteSingle = (santri: Santri) => {
    setDeleteModalState({
      isOpen: true,
      ids: [santri.id],
      name: santri.name,
      count: 1
    });
  };

  const handleOpenDeleteBulk = () => {
    if (selectedSantriIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      ids: selectedSantriIds,
      count: selectedSantriIds.length
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModalState.ids.length === 0) return;
    setDeleteModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (deleteModalState.ids.length === 1) {
        await deleteSantri(deleteModalState.ids[0]);
      } else {
        await deleteSantriBulk(deleteModalState.ids);
      }
      setSelectedSantriIds((prev) => prev.filter((id) => !deleteModalState.ids.includes(id)));
      setDeleteModalState({ isOpen: false, ids: [] });
    } finally {
      setDeleteModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                Pusat Data Siswa
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1">
              Data Santri & Santriwati
            </h1>
            <p className="text-[11px] text-[#64748B]">
              Kelola profil santri, pembagian kelas, impor berkas, serta ekspor rekapitulasi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              title="Unduh format berkas CSV"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] text-xs font-bold hover:bg-white transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#A8833E]" />
              <span>Template</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold hover:bg-[#DBEAFE] transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-bold hover:bg-[#D1FAE5] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              title="Cadangkan data santri dalam format JSON"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 text-[#854D0E] text-xs font-bold hover:bg-[#FEFCE8] transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Backup</span>
            </button>

            <Link
              href="/admin/kelas"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 text-[#A8833E] text-xs font-bold hover:bg-[#F5EED9] transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Kelas</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {showClassModal && (
          <Card className="p-4 space-y-3 bg-[#FAF7EE] border-[#C5A059]/40">
            <span className="text-xs font-bold text-[#172033] block">
              Daftar Kelas
            </span>

            <div className="flex flex-wrap gap-2">
              {kelasList.map((cls) => (
                <span
                  key={cls}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full mizan-pill bg-white text-xs font-bold text-[#172033]"
                >
                  <span>Kelas {cls}</span>
                  {kelasList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeClass(cls)}
                      className="text-[#94A3B8] hover:text-[#DC2626] ml-1"
                      title="Hapus kelas"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <form onSubmit={handleCreateClass} className="flex gap-2 pt-1 max-w-sm">
              <input
                type="text"
                placeholder="Tambah kelas baru (misal: 1E, 2E)..."
                value={newClassInput}
                onChange={(e) => setNewClassInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full mizan-btn-primary text-xs font-bold"
              >
                Tambah
              </button>
            </form>
          </Card>
        )}

        <div className="flex items-center gap-1.5 p-1 rounded-full mizan-pill bg-white max-w-md text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedGender("ALL")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all text-center ${
              selectedGender === "ALL"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Semua ({santriList.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender("Putra")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all text-center ${
              selectedGender === "Putra"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Putra ({putraCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender("Putri")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all text-center ${
              selectedGender === "Putri"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Putri ({putriCount})
          </button>
        </div>

        <Card className="p-3 sm:p-4 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama santri atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E2EBF4] rounded-2xl text-[#172033]"
              />
            </div>

            <div>
              <select
                aria-label="Filter kelas santri"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2EBF4] rounded-2xl text-[#172033] font-bold"
              >
                <option value="ALL">Semua Kelas</option>
                {kelasList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {filteredSantri.length === 0 ? (
          <EmptyState
            title="Santri tidak ditemukan"
            description="Tidak ada data santri yang cocok dengan kriteria filter gender atau kelas."
            action={{
              label: "Reset",
              onClick: () => {
                setSearchQuery("");
                setSelectedGender("ALL");
                setSelectedClass("ALL");
              }
            }}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 px-1 py-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    paginatedSantri.length > 0 && paginatedSantri.every((s) => selectedSantriIds.includes(s.id))
                      ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{paginatedSantri.length > 0 && paginatedSantri.every((s) => selectedSantriIds.includes(s.id)) ? "Batal" : "Pilih"}</span>
                </button>
                {selectedSantriIds.length > 0 && (
                  <span className="text-xs text-[#64748B] font-medium">
                    {selectedSantriIds.length} terpilih
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedSantriIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenDeleteBulk}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus ({selectedSantriIds.length})</span>
                  </button>
                )}

                <div className="flex items-center p-0.5 rounded-xl bg-white border border-[#E2EBF4] shadow-2xs">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {paginatedSantri.map((santri) => {
                const isSelected = selectedSantriIds.includes(santri.id);
                return (
                  <div
                    key={santri.id}
                    className={`mizan-card p-4 flex flex-col justify-between hover:border-[#1B4D3E]/40 group transition-all relative ${
                      isSelected ? "ring-2 ring-red-400 bg-red-50/20" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectSantri(santri.id)}
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer shrink-0"
                            aria-label={`Pilih ${santri.name}`}
                          />
                          <Avatar
                            initials={santri.avatar}
                            size="md"
                            variant={santri.gender === "Putra" ? "primary" : "gold"}
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs sm:text-sm text-[#172033] leading-tight truncate group-hover:text-[#1B4D3E] transition-colors">
                              {santri.name}
                            </h3>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">
                              NIS: {santri.nis} • Kelas {santri.class}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full mizan-pill shrink-0 ${
                            santri.gender === "Putra"
                              ? "bg-[#ECFDF5] text-[#065F46]"
                              : "bg-[#FAF7EE] text-[#A8833E]"
                          }`}
                        >
                          {santri.gender}
                        </span>
                      </div>

                      <CardInset className="p-2.5 grid grid-cols-2 gap-2 text-center my-2">
                        <div>
                          <span className="text-[9px] text-[#94A3B8] block font-bold uppercase">
                            Skor Akhlak
                          </span>
                          <span className="text-xs font-black font-mono text-[#1B4D3E]">
                            {santri.currentScore.toFixed(3).replace(".", ",")}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] text-[#94A3B8] block font-bold uppercase">
                            Kehadiran
                          </span>
                          <span className="text-xs font-black font-mono text-[#065F46]">
                            {santri.totalHadir || 0} Hari
                          </span>
                        </div>
                      </CardInset>
                    </div>

                    <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-[#64748B] truncate max-w-[120px]">
                        {santri.waliName || "Bapak Santri"}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(santri)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteSingle(santri)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          Hapus
                        </button>

                        <Link
                          href={`/guru/santri/${santri.id}`}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1B4D3E] text-white hover:bg-[#153e32]"
                        >
                          Profil
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
              <div className="space-y-2">
                {paginatedSantri.map((santri) => {
                  const isSelected = selectedSantriIds.includes(santri.id);
                  return (
                    <div
                      key={santri.id}
                      className={`p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E2EBF4] hover:border-[#1B4D3E]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                        isSelected ? "ring-2 ring-red-400 bg-red-50/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectSantri(santri.id)}
                          className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer shrink-0"
                          aria-label={`Pilih ${santri.name}`}
                        />
                        <Avatar
                          initials={santri.avatar}
                          size="md"
                          variant={santri.gender === "Putra" ? "primary" : "gold"}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-xs sm:text-sm text-[#172033] truncate">
                              {santri.name}
                            </h3>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                santri.gender === "Putra"
                                  ? "bg-[#ECFDF5] text-[#065F46]"
                                  : "bg-[#FAF7EE] text-[#A8833E]"
                              }`}
                            >
                              {santri.gender}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EEF2F6] text-[#172033]">
                              Kelas {santri.class}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#64748B] mt-0.5 flex-wrap">
                            <span>NIS: <strong className="font-mono text-[#172033]">{santri.nis}</strong></span>
                            {santri.waliName && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[140px]">Wali: {santri.waliName}</span>
                              </>
                            )}
                            {santri.asrama && (
                              <>
                                <span>•</span>
                                <span>{santri.asrama}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-[#F1F5F9]">
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span className="text-[9px] text-[#94A3B8] font-bold block uppercase">
                              Skor Akhlak
                            </span>
                            <span className="text-xs sm:text-sm font-black font-mono text-[#1B4D3E]">
                              {santri.currentScore.toFixed(3).replace(".", ",")}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#94A3B8] font-bold block uppercase">
                              Kehadiran
                            </span>
                            <span className="text-xs sm:text-sm font-black font-mono text-[#065F46]">
                              {santri.totalHadir || 0} Hari
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(santri)}
                            className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-colors"
                          >
                            Ubah
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteSingle(santri)}
                            className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Hapus
                          </button>

                          <Link
                            href={`/guru/santri/${santri.id}`}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-[#1B4D3E] text-white hover:bg-[#153e32] transition-colors shadow-2xs"
                          >
                            Profil
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredSantri.length}
              itemsPerPage={PAGE_SIZE}
              itemName="santri"
            />
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md mizan-card p-5 bg-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Tambah Santri Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNewSantri} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Nomor Induk / NIS
                    </label>
                    <input
                      type="text"
                      required
                      value={formNis}
                      onChange={(e) => setFormNis(e.target.value)}
                      placeholder="202408xx"
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Skor Awal Baku
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={formBaseScore}
                      onChange={(e) => setFormBaseScore(e.target.value)}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] font-mono focus:bg-white focus:border-[#1B4D3E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Masukkan nama santri..."
                    className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Kategori Gender
                    </label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as "Putra" | "Putri")}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E]"
                    >
                      <option value="Putra">Santri Putra</option>
                      <option value="Putri">Santriwati Putri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Pilihan Kelas
                    </label>
                    <select
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E]"
                    >
                      {kelasList.map((cls) => (
                        <option key={cls} value={cls}>Kelas {cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Nama Orang Tua / Wali
                    </label>
                    <input
                      type="text"
                      value={formWaliName}
                      onChange={(e) => setFormWaliName(e.target.value)}
                      placeholder="Bpk / Ibu..."
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Kontak Telepon
                    </label>
                    <input
                      type="text"
                      value={formWaliPhone}
                      onChange={(e) => setFormWaliPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#64748B] bg-[#EEF2F6] hover:bg-[#E2E8F0]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#153e32]"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingSantri && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md mizan-card p-5 bg-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Ubah Data Santri
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      NIS
                    </label>
                    <input
                      type="text"
                      required
                      value={formNis}
                      onChange={(e) => setFormNis(e.target.value)}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Skor Awal
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={formBaseScore}
                      onChange={(e) => setFormBaseScore(e.target.value)}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Gender
                    </label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as "Putra" | "Putri")}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033]"
                    >
                      <option value="Putra">Putra</option>
                      <option value="Putri">Putri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Kelas
                    </label>
                    <select
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033]"
                    >
                      {kelasList.map((cls) => (
                        <option key={cls} value={cls}>Kelas {cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Wali Santri
                    </label>
                    <input
                      type="text"
                      value={formWaliName}
                      onChange={(e) => setFormWaliName(e.target.value)}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Status Santri
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as Santri["status"])}
                      className="w-full p-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033]"
                    >
                      <option value="Aman">Aman / Terpuji (80-100)</option>
                      <option value="Peringatan Lisan">Peringatan Lisan (61-79)</option>
                      <option value="SP 1">Surat Peringatan 1 (46-60)</option>
                      <option value="SP 2">Surat Peringatan 2 (31-45)</option>
                      <option value="SP 3">Surat Peringatan 3 (16-30)</option>
                      <option value="Pengembalian">Pengembalian (0-15)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#64748B] bg-[#EEF2F6] hover:bg-[#E2E8F0]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#153e32]"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showImportModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg mizan-card p-5 bg-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Impor Berkas Data Santri (.csv / .json)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-[#A8833E] mx-auto" />
                <p className="text-xs font-bold text-[#172033]">
                  Pilih file CSV atau JSON cadangan
                </p>
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileChange}
                  className="text-xs text-[#64748B] mx-auto block file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1B4D3E] file:text-white hover:file:bg-[#153e32]"
                />
                {importFileName && (
                  <p className="text-[10px] text-[#065F46] font-bold">
                    Berkas terpilih: {importFileName}
                  </p>
                )}
              </div>

              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#172033]">
                      Pratinjau Data ({importPreview.length} santri):
                    </span>
                    <span className="text-[10px] text-[#065F46] font-bold">
                      Format Valid
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2EBF4]">
                    {importPreview.slice(0, 10).map((item, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-1.5 rounded-lg bg-white flex items-center justify-between"
                      >
                        <span className="font-semibold text-[#172033]">
                          {item.name} ({item.nis})
                        </span>
                        <span className="text-[#64748B]">
                          Kelas {item.class} • {item.gender}
                        </span>
                      </div>
                    ))}
                    {importPreview.length > 10 && (
                      <p className="text-[10px] text-center text-[#94A3B8] italic pt-1">
                        ...dan {importPreview.length - 10} santri lainnya
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#64748B] bg-[#EEF2F6] hover:bg-[#E2E8F0]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleExecuteImport}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#153e32] disabled:opacity-50"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, ids: [] })}
        onConfirm={handleConfirmDelete}
        count={deleteModalState.count}
        message={
          deleteModalState.count === 1 && deleteModalState.name
            ? `Hapus data santri ${deleteModalState.name} beserta seluruh riwayatnya?`
            : undefined
        }
        isLoading={deleteModalState.isLoading}
      />
    </RoleShell>
  );
}
