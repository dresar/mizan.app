"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Award,
  TrendingUp,
  TrendingDown,
  UserCheck,
  MoreVertical,
  List,
  LayoutGrid,
  Eye
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { CardSub } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { DeleteModal } from "@/components/ui/DeleteModal";

export default function AdminKelasPage() {
  const {
    kelasList,
    classList,
    santriList,
    userList,
    penilaianList,
    addClass,
    updateClass,
    removeClass,
    showToast
  } = useMizan();

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [logFilter, setLogFilter] = useState<"ALL" | "HASANAH" | "SAYYIAH">("ALL");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const [selectedDetailClass, setSelectedDetailClass] = useState<any | null>(null);

  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGender, setNewClassGender] = useState<"Putra" | "Putri">("Putra");
  const [newWaliId, setNewWaliId] = useState("");

  const [isEditingClass, setIsEditingClass] = useState(false);
  const [targetEditClass, setTargetEditClass] = useState<any>(null);
  const [editClassName, setEditClassName] = useState("");
  const [editGender, setEditGender] = useState<"Putra" | "Putri">("Putra");
  const [editWaliId, setEditWaliId] = useState("");

  const [isEditingWali, setIsEditingWali] = useState(false);
  const [targetWaliClass, setTargetWaliClass] = useState<any>(null);
  const [quickWaliId, setQuickWaliId] = useState("");

  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; name?: string }>({ isOpen: false });

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const availableTeachers = useMemo(() => {
    return userList.filter((u) => u.role === "GURU" || u.role === "PENGASUHAN");
  }, [userList]);

  const enrichedClasses = useMemo(() => {
    return kelasList.map((clsName) => {
      const matchDb = classList.find((c) => c.name.toUpperCase() === clsName.toUpperCase());
      const students = santriList.filter((s) => s.class.toUpperCase() === clsName.toUpperCase());
      const avg =
        students.length > 0
          ? students.reduce((acc, s) => acc + s.currentScore, 0) / students.length
          : 70.0;

      let defaultGender: "Putra" | "Putri" = "Putra";
      if (matchDb?.gender) {
        defaultGender = matchDb.gender;
      } else if (clsName.endsWith("C") || clsName.endsWith("D")) {
        defaultGender = "Putri";
      }

      const assignedTeacher = userList.find(
        (u) => u.assignedClass?.toUpperCase() === clsName.toUpperCase() && (u.role === "GURU" || u.role === "PENGASUHAN")
      );

      return {
        id: matchDb?.id || `cls-${clsName.toLowerCase()}`,
        name: clsName,
        gender: defaultGender,
        waliKelas: assignedTeacher?.name || matchDb?.waliKelas || "Belum Ditugaskan",
        guruId: assignedTeacher?.id || matchDb?.guruId || "",
        teacherAvatarUrl: assignedTeacher?.avatarUrl,
        teacherInitials: assignedTeacher?.avatarInitials || (assignedTeacher?.name || matchDb?.waliKelas || "WK").slice(0, 2).toUpperCase(),
        studentCount: students.length,
        avgScore: avg
      };
    });
  }, [kelasList, classList, santriList, userList]);

  const filteredClasses = useMemo(() => {
    return enrichedClasses.filter((c) => {
      const matchGender = selectedGender === "ALL" || c.gender === selectedGender;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.waliKelas.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGender && matchSearch;
    });
  }, [enrichedClasses, selectedGender, searchQuery]);

  const modalStudents = useMemo(() => {
    if (!selectedDetailClass) return [];
    return santriList.filter(
      (s) => s.class.toUpperCase() === selectedDetailClass.name.toUpperCase()
    );
  }, [santriList, selectedDetailClass]);

  const modalPenilaianList = useMemo(() => {
    if (!selectedDetailClass) return [];
    return penilaianList.filter(
      (p) => p.santriClass?.toUpperCase() === selectedDetailClass.name.toUpperCase()
    );
  }, [penilaianList, selectedDetailClass]);

  const modalStats = useMemo(() => {
    const hasanahRecords = modalPenilaianList.filter((p) => p.type === "HASANAH");
    const sayyiahRecords = modalPenilaianList.filter((p) => p.type === "SAYYIAH");

    const hasanahRingan = hasanahRecords.filter((p) => p.tingkat === "Ringan").length;
    const hasanahSedang = hasanahRecords.filter((p) => p.tingkat === "Sedang").length;
    const hasanahBerat = hasanahRecords.filter((p) => p.tingkat === "Berat").length;

    const sayyiahRingan = sayyiahRecords.filter((p) => p.tingkat === "Ringan").length;
    const sayyiahSedang = sayyiahRecords.filter((p) => p.tingkat === "Sedang").length;
    const sayyiahBerat = sayyiahRecords.filter((p) => p.tingkat === "Berat").length;

    const totalHasanahScore = hasanahRecords.reduce((acc, p) => acc + (p.score || 0), 0);
    const totalSayyiahScore = sayyiahRecords.reduce((acc, p) => acc + (p.score || 0), 0);

    const baikCount = modalStudents.filter((s) => s.status === "Baik").length;
    const perhatianCount = modalStudents.filter((s) => s.status === "Perhatian").length;
    const pembinaanCount = modalStudents.filter((s) => s.status === "Perlu Pembinaan").length;

    const totalHadir = modalStudents.reduce((acc, s) => acc + (s.totalHadir || 0), 0);
    const totalAlpa = modalStudents.reduce((acc, s) => acc + (s.totalAlpa || 0), 0);

    return {
      totalHasanah: hasanahRecords.length,
      totalSayyiah: sayyiahRecords.length,
      totalHasanahScore,
      totalSayyiahScore,
      hasanahRingan,
      hasanahSedang,
      hasanahBerat,
      sayyiahRingan,
      sayyiahSedang,
      sayyiahBerat,
      baikCount,
      perhatianCount,
      pembinaanCount,
      totalHadir,
      totalAlpa
    };
  }, [modalPenilaianList, modalStudents]);

  const modalStudentMetricsMap = useMemo(() => {
    const map = new Map<string, { hasanahCount: number; sayyiahCount: number }>();
    modalStudents.forEach((s) => {
      map.set(s.id, { hasanahCount: 0, sayyiahCount: 0 });
    });
    modalPenilaianList.forEach((p) => {
      const entry = map.get(p.santriId);
      if (entry) {
        if (p.type === "HASANAH") entry.hasanahCount += 1;
        else entry.sayyiahCount += 1;
      }
    });
    return map;
  }, [modalStudents, modalPenilaianList]);

  const filteredModalStudents = useMemo(() => {
    if (!studentSearch.trim()) return modalStudents;
    const q = studentSearch.toLowerCase();
    return modalStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.nis.includes(q)
    );
  }, [modalStudents, studentSearch]);

  const filteredModalLogs = useMemo(() => {
    if (logFilter === "ALL") return modalPenilaianList;
    return modalPenilaianList.filter((p) => p.type === logFilter);
  }, [modalPenilaianList, logFilter]);

  const handleOpenEditClass = (cls: any) => {
    setTargetEditClass(cls);
    setEditClassName(cls.name);
    setEditGender(cls.gender);
    setEditWaliId(cls.guruId);
    setIsEditingClass(true);
    setIsEditingWali(false);
  };

  const handleSaveEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEditClass) return;

    const cleanNew = editClassName.trim().toUpperCase();
    if (!cleanNew) {
      showToast("Nama kelas wajib diisi", "error");
      return;
    }

    const teacher = userList.find((u) => u.id === editWaliId);
    const res = await updateClass(targetEditClass.name, {
      newName: cleanNew,
      gender: editGender,
      waliKelas: teacher?.name || "",
      guruId: editWaliId
    });

    if (res.success) {
      if (selectedDetailClass && selectedDetailClass.name === targetEditClass.name) {
        setSelectedDetailClass({
          ...selectedDetailClass,
          name: cleanNew,
          gender: editGender,
          waliKelas: teacher?.name || "",
          guruId: editWaliId
        });
      }
      setIsEditingClass(false);
      setTargetEditClass(null);
    }
  };

  const handleOpenEditWali = (cls: any) => {
    setTargetWaliClass(cls);
    setQuickWaliId(cls.guruId);
    setIsEditingWali(true);
    setIsEditingClass(false);
  };

  const handleSaveQuickWali = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWaliClass) return;

    const teacher = userList.find((u) => u.id === quickWaliId);
    const res = await updateClass(targetWaliClass.name, {
      waliKelas: teacher?.name || "",
      guruId: quickWaliId
    });

    if (res.success) {
      if (selectedDetailClass && selectedDetailClass.name === targetWaliClass.name) {
        setSelectedDetailClass({
          ...selectedDetailClass,
          waliKelas: teacher?.name || "",
          guruId: quickWaliId
        });
      }
      setIsEditingWali(false);
      setTargetWaliClass(null);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newClassName.trim().toUpperCase();
    if (!clean) {
      showToast("Nama kelas wajib diisi", "error");
      return;
    }

    const teacher = userList.find((u) => u.id === newWaliId);
    const res = await addClass(
      clean,
      newClassGender,
      teacher?.name || "",
      newWaliId
    );

    if (res.success) {
      setNewClassName("");
      setNewWaliId("");
      setIsAddingClass(false);
    }
  };

  const handleDeleteClassByName = (name: string) => {
    setDeleteModalState({ isOpen: true, name });
  };

  const handleConfirmDeleteClass = () => {
    if (!deleteModalState.name) return;
    const targetName = deleteModalState.name;
    removeClass(targetName);
    if (selectedDetailClass && selectedDetailClass.name === targetName) {
      setSelectedDetailClass(null);
    }
    setDeleteModalState({ isOpen: false });
  };

  const formatDecimal = (val: number) => {
    return val.toFixed(3).replace(".", ",");
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                Data Master Kelas
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1">
              Manajemen & Detail Kelas
            </h1>
            <p className="text-[11px] text-[#64748B]">
              Pantau seluruh santri dan santriwati, rata-rata skor, tingkat prestasi, serta pelanggaran secara lengkap dalam satu halaman
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingClass(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full mizan-btn-primary text-xs font-bold shrink-0 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <CardSub className="p-3 text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Total Kelas
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#172033] mt-0.5 block">
              {enrichedClasses.length}
            </span>
          </CardSub>

          <CardSub className="p-3 text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Kelas Putra
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#065F46] mt-0.5 block">
              {enrichedClasses.filter((c) => c.gender === "Putra").length}
            </span>
          </CardSub>

          <CardSub className="p-3 text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Kelas Putri
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#A8833E] mt-0.5 block">
              {enrichedClasses.filter((c) => c.gender === "Putri").length}
            </span>
          </CardSub>

          <CardSub className="p-3 text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Total Santri
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#1B4D3E] mt-0.5 block">
              {santriList.length}
            </span>
          </CardSub>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === "grid"
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kotak</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-full mizan-pill bg-white text-xs font-bold border border-[#E2E8F0]">
                {(["ALL", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`py-1 px-3 rounded-full transition-all text-center ${
                      selectedGender === g
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g === "ALL" ? "Semua" : g}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kelas atau nama wali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2EBF4] rounded-full text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="mizan-card overflow-hidden bg-white border border-[#E2EBF4]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E2EBF4] bg-[#F8FAFC] text-[#64748B] font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3.5 w-12 text-center">No</th>
                      <th className="py-3 px-3.5">Nama Kelas</th>
                      <th className="py-3 px-3.5 text-center">Gender</th>
                      <th className="py-3 px-3.5">Wali Kelas</th>
                      <th className="py-3 px-3.5 text-center">Jumlah Santri</th>
                      <th className="py-3 px-3.5 text-center">Rata-rata Skor</th>
                      <th className="py-3 px-3.5 text-center w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EBF4]">
                    {filteredClasses.map((cls, idx) => (
                      <tr
                        key={cls.name}
                        onClick={() => setSelectedDetailClass(cls)}
                        className="hover:bg-[#FAF7EE]/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-3.5 text-center font-mono font-bold text-[#64748B]">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span className="font-serif font-black text-base text-[#172033] group-hover:text-[#1B4D3E] transition-colors">
                            Kelas {cls.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              cls.gender === "Putra"
                                ? "bg-[#ECFDF5] text-[#065F46]"
                                : "bg-[#FAF7EE] text-[#A8833E]"
                            }`}
                          >
                            {cls.gender}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={cls.teacherAvatarUrl}
                              initials={cls.teacherInitials}
                              size="md"
                              variant={cls.gender === "Putri" ? "gold" : "primary"}
                              className="w-12 h-12 shadow-2xs shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-[#172033] text-sm truncate">
                                {cls.waliKelas}
                              </p>
                              <p className="text-[10px] text-[#64748B]">
                                Wali Pembina
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-[#EEF2F6] text-[#475569]">
                            {cls.studentCount} Santri
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <span className="font-mono font-black text-sm text-[#1B4D3E] bg-[#ECFDF5] px-2.5 py-1 rounded-xl">
                            {formatDecimal(cls.avgScore)}
                          </span>
                        </td>
                        <td
                          className="py-3.5 px-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(activeDropdownId === cls.name ? null : cls.name);
                              }}
                              className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#EEF2F6] transition-colors"
                              aria-label="Aksi"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeDropdownId === cls.name && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-32 rounded-2xl bg-white shadow-xl border border-[#E2EBF4] p-1.5 z-30"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDetailClass(cls);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#1B4D3E] hover:bg-[#ECFDF5] transition-colors flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Detail</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenEditClass(cls);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#A8833E] hover:bg-[#FAF7EE] transition-colors flex items-center gap-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Ubah</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenEditWali(cls);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors flex items-center gap-2"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Wali</span>
                                </button>
                                <div className="my-1 border-t border-[#F1F5F9]" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteClassByName(cls.name);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredClasses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs text-[#94A3B8]">
                          Tidak ada kelas yang cocok dengan pencarian
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredClasses.map((cls) => (
                <div
                  key={cls.name}
                  onClick={() => setSelectedDetailClass(cls)}
                  className="p-4 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between bg-white border-[#E2EBF4] hover:border-[#1B4D3E]/40 hover:shadow-md space-y-3"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-lg font-serif font-black text-[#172033]">
                          Kelas {cls.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              cls.gender === "Putra"
                                ? "bg-[#ECFDF5] text-[#065F46]"
                                : "bg-[#FAF7EE] text-[#A8833E]"
                            }`}
                          >
                            {cls.gender}
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B]">
                            {cls.studentCount} Santri
                          </span>
                        </div>
                      </div>

                      <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === cls.name ? null : cls.name);
                          }}
                          className="p-1.5 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#EEF2F6] transition-colors"
                          aria-label="Aksi"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeDropdownId === cls.name && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-32 rounded-2xl bg-white shadow-xl border border-[#E2EBF4] p-1.5 z-30"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDetailClass(cls);
                                setActiveDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#1B4D3E] hover:bg-[#ECFDF5] transition-colors flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEditClass(cls);
                                setActiveDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#A8833E] hover:bg-[#FAF7EE] transition-colors flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Ubah</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEditWali(cls);
                                setActiveDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors flex items-center gap-2"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Wali</span>
                            </button>
                            <div className="my-1 border-t border-[#F1F5F9]" />
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteClassByName(cls.name);
                                setActiveDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <Avatar
                        src={cls.teacherAvatarUrl}
                        initials={cls.teacherInitials}
                        size="md"
                        variant={cls.gender === "Putri" ? "gold" : "primary"}
                        className="w-12 h-12 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase text-[#94A3B8] block">
                          Wali Kelas
                        </span>
                        <p className="font-bold text-[#172033] text-xs truncate">
                          {cls.waliKelas}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between font-mono">
                    <span className="text-[10px] text-[#64748B] font-bold">Rata-Rata Skor</span>
                    <span className="text-sm font-black text-[#1B4D3E] bg-[#ECFDF5] px-2 py-0.5 rounded-lg">
                      {formatDecimal(cls.avgScore)}
                    </span>
                  </div>
                </div>
              ))}
              {filteredClasses.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-[#94A3B8]">
                  Tidak ada kelas yang cocok dengan pencarian
                </div>
              )}
            </div>
          )}
        </div>

        {selectedDetailClass && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#E2EBF4] flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E2EBF4] flex items-center justify-between bg-[#FAF7EE] shrink-0">
                <div className="flex items-center gap-3.5">
                  <Avatar
                    src={selectedDetailClass.teacherAvatarUrl}
                    initials={selectedDetailClass.teacherInitials}
                    size="lg"
                    variant={selectedDetailClass.gender === "Putri" ? "gold" : "primary"}
                    className="w-14 h-14 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-serif font-black text-[#172033]">
                        Kelas {selectedDetailClass.name}
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedDetailClass.gender === "Putra"
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : "bg-[#FAF7EE] text-[#A8833E]"
                        }`}
                      >
                        {selectedDetailClass.gender}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Wali: <strong className="text-[#172033]">{selectedDetailClass.waliKelas}</strong> • Total: <strong className="text-[#172033]">{modalStudents.length} Santri</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditWali(selectedDetailClass)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EFF6FF] text-[#1E3A8A] border border-blue-200 hover:bg-[#DBEAFE] transition-colors"
                  >
                    Wali
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditClass(selectedDetailClass)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 hover:bg-[#F5EED9] transition-colors"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailClass(null)}
                    className="p-1.5 rounded-xl hover:bg-black/5 text-[#64748B] hover:text-[#172033] transition-colors"
                    aria-label="Tutup"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                      Rata-Rata Skor
                    </span>
                    <span className="text-2xl font-black font-mono text-[#1B4D3E] block mt-1">
                      {formatDecimal(selectedDetailClass.avgScore)}
                    </span>
                    <span className="text-[10px] font-bold text-[#065F46] mt-0.5 block">
                      Skor Dasar: 70,000
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-center">
                    <span className="text-[10px] text-[#065F46] font-bold uppercase block">
                      Total Hasanah
                    </span>
                    <span className="text-2xl font-black font-mono text-[#065F46] block mt-1">
                      {modalStats.totalHasanah}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#047857] mt-0.5 block">
                      +{formatDecimal(modalStats.totalHasanahScore)} Poin
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-center">
                    <span className="text-[10px] text-[#991B1B] font-bold uppercase block">
                      Total Sayyi&apos;ah
                    </span>
                    <span className="text-2xl font-black font-mono text-[#991B1B] block mt-1">
                      {modalStats.totalSayyiah}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#DC2626] mt-0.5 block">
                      {formatDecimal(modalStats.totalSayyiahScore)} Poin
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E8DCB8] text-center">
                    <span className="text-[10px] text-[#854D0E] font-bold uppercase block">
                      Distribusi Status
                    </span>
                    <div className="flex items-center justify-center gap-1.5 mt-1.5">
                      <span className="text-[11px] font-bold text-[#065F46]">{modalStats.baikCount} Baik</span>
                      <span className="text-[#94A3B8]">•</span>
                      <span className="text-[11px] font-bold text-[#854D0E]">{modalStats.perhatianCount} Perhatian</span>
                      <span className="text-[#94A3B8]">•</span>
                      <span className="text-[11px] font-bold text-[#991B1B]">{modalStats.pembinaanCount} Binaan</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                        <h3 className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                          Rincian Tingkat Prestasi
                        </h3>
                      </div>
                      <span className="text-xs font-bold font-mono text-[#166534]">
                        {modalStats.totalHasanah} Catatan
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-white border border-[#BBF7D0] text-center">
                        <span className="text-[10px] text-[#64748B] block">Ringan</span>
                        <span className="text-base font-bold font-mono text-[#166534]">
                          {modalStats.hasanahRingan}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#BBF7D0] text-center">
                        <span className="text-[10px] text-[#64748B] block">Sedang</span>
                        <span className="text-base font-bold font-mono text-[#166534]">
                          {modalStats.hasanahSedang}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#BBF7D0] text-center">
                        <span className="text-[10px] text-[#64748B] block">Berat</span>
                        <span className="text-base font-bold font-mono text-[#166534]">
                          {modalStats.hasanahBerat}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-[#DC2626]" />
                        <h3 className="text-xs font-bold text-[#991B1B] uppercase tracking-wider">
                          Rincian Tingkat Pelanggaran
                        </h3>
                      </div>
                      <span className="text-xs font-bold font-mono text-[#991B1B]">
                        {modalStats.totalSayyiah} Catatan
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-white border border-[#FECACA] text-center">
                        <span className="text-[10px] text-[#64748B] block">Ringan</span>
                        <span className="text-base font-bold font-mono text-[#991B1B]">
                          {modalStats.sayyiahRingan}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#FECACA] text-center">
                        <span className="text-[10px] text-[#64748B] block">Sedang</span>
                        <span className="text-base font-bold font-mono text-[#991B1B]">
                          {modalStats.sayyiahSedang}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#FECACA] text-center">
                        <span className="text-[10px] text-[#64748B] block">Berat</span>
                        <span className="text-base font-bold font-mono text-[#991B1B]">
                          {modalStats.sayyiahBerat}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1B4D3E]" />
                      <h3 className="text-sm font-serif font-black text-[#172033]">
                        Daftar Santri Kelas {selectedDetailClass.name} ({filteredModalStudents.length})
                      </h3>
                    </div>

                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari santri..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2EBF4] rounded-full text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                      />
                    </div>
                  </div>

                  {filteredModalStudents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#94A3B8]">
                      Tidak ada santri yang cocok dengan pencarian di Kelas {selectedDetailClass.name}.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                            <th className="py-2.5 px-3">No</th>
                            <th className="py-2.5 px-3">Santri</th>
                            <th className="py-2.5 px-3 text-center">Prestasi</th>
                            <th className="py-2.5 px-3 text-center">Pelanggaran</th>
                            <th className="py-2.5 px-3 text-center">Skor</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-center">Kehadiran</th>
                            <th className="py-2.5 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {filteredModalStudents.map((santri, idx) => {
                            const m = modalStudentMetricsMap.get(santri.id) || { hasanahCount: 0, sayyiahCount: 0 };

                            return (
                              <tr key={santri.id} className="hover:bg-[#F8FAFC] transition-colors">
                                <td className="py-2.5 px-3 text-[#94A3B8] font-mono">{idx + 1}</td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar
                                      src={santri.avatar}
                                      initials={santri.name.slice(0, 2).toUpperCase()}
                                      size="md"
                                      variant={santri.gender === "Putri" ? "gold" : "primary"}
                                      className="w-12 h-12 shadow-2xs shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="font-bold text-[#172033] truncate">
                                        {santri.name}
                                      </p>
                                      <span className="font-mono text-[10px] text-[#64748B]">
                                        NIS: {santri.nis}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold font-mono text-[#065F46]">
                                  {m.hasanahCount}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold font-mono text-[#DC2626]">
                                  {m.sayyiahCount}
                                </td>
                                <td className="py-2.5 px-3 text-center font-black font-mono text-[#1B4D3E]">
                                  {formatDecimal(santri.currentScore)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                      santri.status === "Baik"
                                        ? "bg-[#ECFDF5] text-[#065F46]"
                                        : santri.status === "Perhatian"
                                        ? "bg-[#FEFCE8] text-[#854D0E]"
                                        : "bg-[#FEF2F2] text-[#991B1B]"
                                    }`}
                                  >
                                    {santri.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#64748B]">
                                  {santri.totalHadir || 28}H / {santri.totalAlpa || 0}A
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <Link
                                    href={`/guru/santri/${santri.id}`}
                                    className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors"
                                  >
                                    Profil
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#1B4D3E]" />
                      <h3 className="text-sm font-serif font-black text-[#172033]">
                        Catatan Penilaian Kejadian ({filteredModalLogs.length})
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-full mizan-pill bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold self-start">
                      {(["ALL", "HASANAH", "SAYYIAH"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setLogFilter(mode)}
                          className={`py-1 px-3 rounded-full transition-all text-center ${
                            logFilter === mode
                              ? mode === "HASANAH"
                                ? "bg-[#16A34A] text-white"
                                : mode === "SAYYIAH"
                                ? "bg-[#DC2626] text-white"
                                : "bg-[#1B4D3E] text-white"
                              : "text-[#64748B] hover:text-[#172033]"
                          }`}
                        >
                          {mode === "ALL" ? "Semua" : mode === "HASANAH" ? "Hasanah" : "Sayyi'ah"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredModalLogs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#94A3B8]">
                      Belum ada catatan penilaian tercatat untuk Kelas {selectedDetailClass.name}.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                            <th className="py-2 px-3">Waktu</th>
                            <th className="py-2 px-3">Nama Santri</th>
                            <th className="py-2 px-3 text-center">Jenis</th>
                            <th className="py-2 px-3">Indikator</th>
                            <th className="py-2 px-3 text-center">Tingkat</th>
                            <th className="py-2 px-3 text-center">Poin</th>
                            <th className="py-2 px-3">Pencatat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {filteredModalLogs.slice(0, 25).map((record) => (
                            <tr key={record.id} className="hover:bg-[#F8FAFC] transition-colors">
                              <td className="py-2 px-3 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                                {new Date(record.createdAt).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short"
                                })}
                              </td>
                              <td className="py-2 px-3 font-bold text-[#172033] whitespace-nowrap">
                                {record.santriName}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    record.type === "HASANAH"
                                      ? "bg-[#ECFDF5] text-[#065F46]"
                                      : "bg-[#FEF2F2] text-[#991B1B]"
                                  }`}
                                >
                                  {record.type === "HASANAH" ? "Hasanah" : "Sayyi'ah"}
                                </span>
                              </td>
                              <td className="py-2 px-3 max-w-xs text-[#172033]">
                                <p className="font-medium line-clamp-1">{record.indicatorText}</p>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {record.tingkat || "Ringan"}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-bold font-mono">
                                <span
                                  className={
                                    record.type === "HASANAH" ? "text-[#065F46]" : "text-[#DC2626]"
                                  }
                                >
                                  {record.type === "HASANAH" ? "+" : ""}
                                  {formatDecimal(record.score)}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-[#64748B] text-[11px] whitespace-nowrap">
                                {record.guruName}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-[#E2EBF4] bg-[#FAF7EE] flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedDetailClass(null)}
                  className="px-5 py-2 rounded-full border border-[#D4C9B5] text-[#172033] text-xs font-bold hover:bg-white transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {isAddingClass && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2EBF4] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1B4D3E]" />
                  <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
                    Tambah Kelas
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingClass(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Nama Kelas
                    </label>
                    <input
                      type="text"
                      required
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Misal: 1E, 2C..."
                      className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Kategori Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Putra", "Putri"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setNewClassGender(g)}
                          className={`py-2 rounded-xl text-xs font-bold text-center border transition-all ${
                            newClassGender === g
                              ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs"
                              : "bg-white text-[#64748B] border-[#D4C9B5] hover:bg-[#FAF7EE]"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Wali Kelas
                    </label>
                    <select
                      value={newWaliId}
                      onChange={(e) => setNewWaliId(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                    >
                      <option value="">-- Pilih Guru Pembina --</option>
                      {availableTeachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.gender})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsAddingClass(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditingClass && targetEditClass && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2EBF4] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-[#A8833E]" />
                  <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
                    Ubah Kelas {targetEditClass.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingClass(false);
                    setTargetEditClass(null);
                  }}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditClass} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Nama Kelas
                    </label>
                    <input
                      type="text"
                      required
                      value={editClassName}
                      onChange={(e) => setEditClassName(e.target.value)}
                      placeholder="Misal: 1A, 2B..."
                      className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Kategori Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Putra", "Putri"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditGender(g)}
                          className={`py-2 rounded-xl text-xs font-bold text-center border transition-all ${
                            editGender === g
                              ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs"
                              : "bg-white text-[#64748B] border-[#D4C9B5] hover:bg-[#FAF7EE]"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Wali Kelas
                    </label>
                    <select
                      value={editWaliId}
                      onChange={(e) => setEditWaliId(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                    >
                      <option value="">-- Belum Ditugaskan --</option>
                      {availableTeachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.gender})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingClass(false);
                      setTargetEditClass(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditingWali && targetWaliClass && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-blue-200 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#1E3A8A]" />
                  <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
                    Ubah Wali Kelas {targetWaliClass.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingWali(false);
                    setTargetWaliClass(null);
                  }}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveQuickWali} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                    Pilih Wali Kelas Baru
                  </label>
                  <select
                    value={quickWaliId}
                    onChange={(e) => setQuickWaliId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#B9D5F3] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.gender})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#64748B] mt-1.5">
                    Wali saat ini: <strong className="text-[#172033]">{targetWaliClass.waliKelas}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingWali(false);
                      setTargetWaliClass(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false })}
        onConfirm={handleConfirmDeleteClass}
        title="Hapus Kelas"
        message={deleteModalState.name ? `Yakin ingin menghapus Kelas ${deleteModalState.name}?` : undefined}
      />
    </RoleShell>
  );
}