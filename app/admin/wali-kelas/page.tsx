"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserCheck,
  Users,
  Plus,
  Edit2,
  Search,
  Share2,
  X,
  LayoutGrid,
  List,
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Building2,
  MoreVertical,
  SlidersHorizontal,
  Eye,
  ChevronDown
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { UserProfile, Santri } from "@/lib/mock-data";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { ShareModal } from "@/components/ShareModal";
import { PhotoViewerModal, PhotoItem } from "@/components/PhotoViewerModal";

export default function AdminWaliKelasPage() {
  const {
    userList,
    guruList,
    kelasList,
    classList,
    santriList,
    penilaianList,
    updateUser,
    updateClass,
    showToast
  } = useMizan();

  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [selectedRole, setSelectedRole] = useState<"ALL" | "GURU" | "PENGASUHAN">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const [activeTeacherDetail, setActiveTeacherDetail] = useState<UserProfile | null>(null);
  const [detailPage, setDetailPage] = useState(1);
  const DETAIL_PAGE_SIZE = 20;

  const [isAssigning, setIsAssigning] = useState(false);
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignClassName, setAssignClassName] = useState("");

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTeacherToShare, setSelectedTeacherToShare] = useState<UserProfile | null>(null);

  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    teacher: true,
    gender: true,
    role: true,
    class: true,
    studentsCount: true,
    score: true,
    status: true,
    action: true
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const columnDropdownRef = React.useRef<HTMLDivElement>(null);

  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const actionMenuRef = React.useRef<HTMLDivElement>(null);

  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnDropdownRef.current &&
        !columnDropdownRef.current.contains(event.target as Node)
      ) {
        setIsColumnDropdownOpen(false);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const allPembina = useMemo(() => {
    return userList.filter((u) => u.role === "GURU" || u.role === "PENGASUHAN");
  }, [userList]);

  const teachers = useMemo(() => {
    return allPembina.filter((u) => {
      if (selectedRole === "ALL") return true;
      return u.role === selectedRole;
    });
  }, [allPembina, selectedRole]);

  const enrichedTeachers = useMemo(() => {
    return teachers.map((teacher) => {
      const assignedClass = teacher.assignedClass?.toUpperCase() || "";
      const students = santriList.filter((s) => s.class.toUpperCase() === assignedClass);
      const avgScore =
        students.length > 0
          ? students.reduce((acc, s) => acc + s.currentScore, 0) / students.length
          : 70.0;

      const reportsToday = penilaianList.filter(
        (p) => p.guruId === teacher.id || p.guruName === teacher.name
      ).length;

      const monitoringItem = guruList.find((g) => g.id === teacher.id || g.name === teacher.name);

      return {
        ...teacher,
        assignedClass,
        studentsCount: students.length,
        avgScore,
        reportsToday,
        studentsSample: students.slice(0, 5),
        status: monitoringItem?.status || (reportsToday > 0 ? "Sudah Lapor" : "Belum Lapor")
      };
    });
  }, [teachers, santriList, penilaianList, guruList]);

  const filteredTeachers = useMemo(() => {
    return enrichedTeachers.filter((t) => {
      const matchGender = selectedGender === "ALL" || t.gender === selectedGender;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.username ? t.username.toLowerCase().includes(q) : false) ||
        t.assignedClass.toLowerCase().includes(q);
      return matchGender && matchSearch;
    });
  }, [enrichedTeachers, selectedGender, searchQuery]);

  const totalPages = Math.ceil(filteredTeachers.length / PAGE_SIZE) || 1;

  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTeachers.slice(start, start + PAGE_SIZE);
  }, [filteredTeachers, currentPage]);

  const photoItems: PhotoItem[] = useMemo(() => {
    return filteredTeachers.map((t) => ({
      id: t.id,
      name: t.name,
      subtitle: t.username ? `@${t.username}` : undefined,
      tag: t.assignedClass
        ? `${t.assignedClass} • ${t.role === "GURU" ? "Guru Kelas" : "Pengasuhan BK"}`
        : t.role === "GURU"
        ? "Guru Kelas"
        : "Pengasuhan BK",
      photoUrl: t.avatarUrl,
      initials: t.avatarInitials,
      gender: t.gender as "Putra" | "Putri"
    }));
  }, [filteredTeachers]);

  const handleOpenPhotoViewer = (teacherId: string) => {
    const idx = photoItems.findIndex((p) => p.id === teacherId);
    if (idx !== -1) {
      setPhotoViewerIndex(idx);
      setIsPhotoViewerOpen(true);
    }
  };

  const assignedClassesCount = useMemo(() => {
    return new Set(allPembina.map((t) => t.assignedClass).filter(Boolean)).size;
  }, [allPembina]);

  const handleOpenAssign = (teacher?: typeof enrichedTeachers[0]) => {
    if (teacher) {
      setAssignTeacherId(teacher.id);
      setAssignClassName(teacher.assignedClass || kelasList[0] || "1A");
    } else {
      setAssignTeacherId(teachers[0]?.id || "");
      setAssignClassName(kelasList[0] || "1A");
    }
    setIsAssigning(true);
  };

  const handleSaveAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeacherId) {
      showToast("Pilih guru pembina", "error");
      return;
    }

    const teacher = allPembina.find((t) => t.id === assignTeacherId);
    if (!teacher) return;

    await updateUser(assignTeacherId, { assignedClass: assignClassName });
    if (assignClassName) {
      await updateClass(assignClassName, {
        waliKelas: teacher.name,
        guruId: teacher.id,
        gender: teacher.gender
      });
    }

    showToast(`Penugasan ${teacher.name} berhasil disimpan`, "success");
    setIsAssigning(false);
  };

  const handleOpenDetail = (teacher: UserProfile) => {
    setActiveTeacherDetail(teacher);
    setDetailPage(1);
  };

  const assignedStudents = useMemo(() => {
    if (!activeTeacherDetail?.assignedClass) return [];
    return santriList.filter(
      (s) => s.class.toUpperCase() === activeTeacherDetail.assignedClass?.toUpperCase()
    );
  }, [santriList, activeTeacherDetail]);

  const detailTotalPages = Math.ceil(assignedStudents.length / DETAIL_PAGE_SIZE) || 1;

  const paginatedAssignedStudents = useMemo(() => {
    const start = (detailPage - 1) * DETAIL_PAGE_SIZE;
    return assignedStudents.slice(start, start + DETAIL_PAGE_SIZE);
  }, [assignedStudents, detailPage]);

  const detailAvgScore = useMemo(() => {
    if (assignedStudents.length === 0) return "0,000";
    const sum = assignedStudents.reduce((acc, s) => acc + s.currentScore, 0);
    return (sum / assignedStudents.length).toFixed(3).replace(".", ",");
  }, [assignedStudents]);

  const detailAttentionCount = useMemo(() => {
    return assignedStudents.filter((s) => s.currentScore < 80).length;
  }, [assignedStudents]);

  const activeTeacherDetailEnriched = useMemo(() => {
    if (!activeTeacherDetail) return null;
    return enrichedTeachers.find((t) => t.id === activeTeacherDetail.id) || null;
  }, [enrichedTeachers, activeTeacherDetail]);

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E2E8F0]">
          <div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              Data Wali Kelas & Guru Pembina
            </h1>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Daftar penanggung jawab kelas santri serta sarana publikasi statistik ke khalayak publik
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedTeacherToShare(null);
                setIsShareModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#D4C9B5] text-[#1C2826] hover:bg-[#FAF7F2] text-xs font-bold shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Bagikan</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAssign()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl mizan-btn-primary text-xs font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tugaskan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <CardSub className="p-3.5 text-center bg-white">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Total Pembina
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#172033] mt-0.5 block">
              {allPembina.length}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">Ustadz & Ustadzah</span>
          </CardSub>

          <CardSub className="p-3.5 text-center bg-white">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Pembina Putra
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#065F46] mt-0.5 block">
              {allPembina.filter((t) => t.gender === "Putra").length}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">Asatidz</span>
          </CardSub>

          <CardSub className="p-3.5 text-center bg-white">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Pembina Putri
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#A8833E] mt-0.5 block">
              {allPembina.filter((t) => t.gender === "Putri").length}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">Ustadzah</span>
          </CardSub>

          <CardSub className="p-3.5 text-center bg-white">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Kelas Terbina
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#1B4D3E] mt-0.5 block">
              {assignedClassesCount} / {kelasList.length}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">Ruang Kelas Aktif</span>
          </CardSub>
        </div>

        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#E2E8F0] space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#EEF2F6] text-xs font-bold">
                {(["ALL", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setSelectedGender(g);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 px-3 rounded-xl transition-all text-center ${
                      selectedGender === g
                        ? "bg-white text-[#1B4D3E] shadow-xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g === "ALL" ? "Semua Gender" : g}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#EEF2F6] text-xs font-bold">
                {(["ALL", "GURU", "PENGASUHAN"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 px-3 rounded-xl transition-all text-center ${
                      selectedRole === r
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {r === "ALL" ? "Semua Peran" : r === "GURU" ? "Guru Kelas" : "Pengasuhan BK"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari wali kelas, username, kelas..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EEF2F6] text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-[#1B4D3E] shadow-xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                  title="Tampilan Grid"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "table"
                      ? "bg-white text-[#1B4D3E] shadow-xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                  title="Tampilan Tabel"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="relative shrink-0" ref={columnDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors shadow-2xs cursor-pointer"
                  title="Pilih kolom yang ditampilkan"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#A8833E]" />
                  <span>Kolom</span>
                  <ChevronDown className={`w-3 h-3 text-[#64748B] transition-transform ${isColumnDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isColumnDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white shadow-xl border border-[#E2EBF4] z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 border-b border-[#F1F5F9] text-[11px] font-bold text-[#64748B]">
                      Kolom Ditampilkan
                    </div>
                    {[
                      { key: "no", label: "No" },
                      { key: "teacher", label: "Wali & Foto" },
                      { key: "gender", label: "Gender" },
                      { key: "role", label: "Peran" },
                      { key: "class", label: "Kelas Binaan" },
                      { key: "studentsCount", label: "Jumlah Santri" },
                      { key: "score", label: "Rata-rata Skor" },
                      { key: "status", label: "Status Lapor" },
                      { key: "action", label: "Menu Aksi" }
                    ].map((col) => {
                      const isChecked = visibleColumns[col.key as keyof typeof visibleColumns];
                      return (
                        <label
                          key={col.key}
                          className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#FAF7EE] text-xs font-semibold text-[#172033] cursor-pointer"
                        >
                          <span>{col.label}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setVisibleColumns((prev) => ({
                                ...prev,
                                [col.key]: !isChecked
                              }))
                            }
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {paginatedTeachers.map((teacher) => {
              const defaultAvatar =
                teacher.gender === "Putri"
                  ? "/default-avatar-ustadzah.svg"
                  : "/default-avatar-ustadz.svg";
              const teacherPhoto = teacher.avatarUrl || defaultAvatar;

              return (
                <div
                  key={teacher.id}
                  onClick={() => handleOpenDetail(teacher)}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E2EBF4] shadow-2xs hover:shadow-2xl hover:border-[#1B4D3E]/40 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between cursor-pointer text-left"
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPhotoViewer(teacher.id);
                    }}
                    className="sheen-wrapper relative w-full aspect-square overflow-hidden bg-[#0E271F] shrink-0 cursor-pointer"
                    title="Klik untuk melihat foto"
                  >
                    <img
                      src={teacherPhoto}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== defaultAvatar && !target.src.endsWith(defaultAvatar)) {
                          target.src = defaultAvatar;
                        }
                      }}
                      alt={teacher.name}
                      className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
                  </div>

                  <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 bg-white space-y-2.5">
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        {teacher.assignedClass ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono font-black bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20 whitespace-nowrap">
                            {teacher.assignedClass}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-slate-100 text-slate-400 border border-slate-200 whitespace-nowrap">
                            -
                          </span>
                        )}
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[8px] sm:text-[10px] font-bold border shrink-0 ${
                            teacher.gender === "Putra"
                              ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                              : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                          }`}
                        >
                          {teacher.gender}
                        </span>
                      </div>

                      <div>
                        <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-[#C5A059] block">
                          Wali Pembina
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-[#172033] group-hover:text-[#1B4D3E] transition-colors truncate mt-0.5">
                          {teacher.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-[#64748B] flex items-center gap-1 pt-0.5 truncate">
                          <Building2 className="w-3 h-3 text-[#C5A059] shrink-0" />
                          <span>{teacher.studentsCount} Santri Binaan</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-[#64748B] font-medium">Rata-Rata</span>
                      <span className="font-mono font-bold text-[#1B4D3E] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 sm:px-2 py-0.5 rounded-lg shadow-2xs">
                        {teacher.avgScore.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div
                      className="grid grid-cols-3 gap-1 pt-0.5 sm:pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(teacher)}
                        className="py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] text-[10px] sm:text-xs font-bold text-center transition-all shadow-2xs active:scale-95 cursor-pointer truncate"
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAssign(teacher)}
                        className="py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#FAF7EE] text-[#A8833E] hover:bg-[#F3EBD8] border border-[#C5A059]/40 text-[10px] sm:text-xs font-bold text-center transition-all shadow-2xs active:scale-95 cursor-pointer truncate"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeacherToShare(teacher);
                          setIsShareModalOpen(true);
                        }}
                        className="py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-[10px] sm:text-xs font-bold text-center transition-all shadow-2xs active:scale-95 cursor-pointer truncate"
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
          <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold text-[11px]">
                    {visibleColumns.no && <th className="py-3.5 px-3.5">No</th>}
                    {visibleColumns.teacher && <th className="py-3.5 px-3.5">Wali Kelas / Pembina</th>}
                    {visibleColumns.gender && <th className="py-3.5 px-3.5">Gender</th>}
                    {visibleColumns.role && <th className="py-3.5 px-3.5">Peran</th>}
                    {visibleColumns.class && <th className="py-3.5 px-3.5">Kelas Binaan</th>}
                    {visibleColumns.studentsCount && (
                      <th className="py-3.5 px-3.5 text-center">Jumlah Santri</th>
                    )}
                    {visibleColumns.score && (
                      <th className="py-3.5 px-3.5 text-center">Rata-rata Skor</th>
                    )}
                    {visibleColumns.status && (
                      <th className="py-3.5 px-3.5 text-center">Status</th>
                    )}
                    {visibleColumns.action && (
                      <th className="py-3.5 px-3.5 text-right">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedTeachers.map((teacher, idx) => {
                    const rowNumber = (currentPage - 1) * PAGE_SIZE + idx + 1;
                    const defaultAvatar =
                      teacher.gender === "Putri"
                        ? "/default-avatar-ustadzah.svg"
                        : "/default-avatar-ustadz.svg";
                    const teacherPhoto = teacher.avatarUrl || defaultAvatar;

                    return (
                      <tr key={teacher.id} className="hover:bg-[#F8FAFC] transition-colors">
                        {visibleColumns.no && (
                          <td className="py-3 px-3.5 font-mono text-[#94A3B8] text-xs">
                            {rowNumber}
                          </td>
                        )}

                        {visibleColumns.teacher && (
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPhotoViewer(teacher.id);
                                }}
                                className="group/avatar relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#FAF7EE] shadow-2xs shrink-0 cursor-pointer hover:scale-105 hover:ring-2 hover:ring-[#1B4D3E] transition-all"
                                title="Klik untuk melihat foto"
                              >
                                <img
                                  src={teacherPhoto}
                                  alt={teacher.name}
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    if (target.src !== defaultAvatar && !target.src.endsWith(defaultAvatar)) {
                                      target.src = defaultAvatar;
                                    }
                                  }}
                                  className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/25 flex items-center justify-center transition-colors">
                                  <Eye className="w-3.5 h-3.5 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity drop-shadow-sm" />
                                </div>
                              </button>
                              <div className="min-w-0">
                                <p
                                  onClick={() => handleOpenDetail(teacher)}
                                  className="font-bold text-[#172033] text-xs sm:text-sm truncate hover:text-[#1B4D3E] cursor-pointer"
                                >
                                  {teacher.name}
                                </p>
                                <p className="text-[10px] text-[#94A3B8] font-mono truncate">
                                  @{teacher.username || teacher.id}
                                </p>
                              </div>
                            </div>
                          </td>
                        )}

                        {visibleColumns.gender && (
                          <td className="py-3 px-3.5">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                teacher.gender === "Putra"
                                  ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                                  : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                              }`}
                            >
                              {teacher.gender}
                            </span>
                          </td>
                        )}

                        {visibleColumns.role && (
                          <td className="py-3 px-3.5 text-[#475569] text-xs">
                            {teacher.role === "GURU" ? "Guru Kelas" : "Pengasuhan BK"}
                          </td>
                        )}

                        {visibleColumns.class && (
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {teacher.assignedClass ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] shadow-2xs">
                                {teacher.assignedClass}
                              </span>
                            ) : (
                              <span className="text-xs text-[#94A3B8] font-mono font-bold">
                                -
                              </span>
                            )}
                          </td>
                        )}

                        {visibleColumns.studentsCount && (
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-[#172033] text-xs">
                            {teacher.studentsCount}
                          </td>
                        )}

                        {visibleColumns.score && (
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-[#1B4D3E] text-xs">
                            {teacher.avgScore.toFixed(3).replace(".", ",")}
                          </td>
                        )}

                        {visibleColumns.status && (
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            {teacher.status === "Sudah Lapor" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                <span>Sudah Lapor</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
                                <span>Belum Lapor</span>
                              </span>
                            )}
                          </td>
                        )}

                        {visibleColumns.action && (
                          <td className="py-3 px-3.5 text-right">
                            <div
                              className="relative inline-block text-left"
                              ref={activeActionMenuId === teacher.id ? actionMenuRef : null}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(
                                    activeActionMenuId === teacher.id ? null : teacher.id
                                  );
                                }}
                                className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#FAF7F2] hover:border-[#1B4D3E]/40 text-[#64748B] hover:text-[#172033] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                                title="Opsi Aksi"
                                aria-label="Opsi Aksi"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeActionMenuId === teacher.id && (
                                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl bg-white shadow-xl border border-[#E2EBF4] z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenDetail(teacher);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#FAF7EE] hover:text-[#1B4D3E] text-left transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#1B4D3E]" />
                                    <span>Detail Lengkap</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenAssign(teacher);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#FAF7EE] hover:text-[#C5A059] text-left transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" />
                                    <span>Tugaskan Kelas</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      setSelectedTeacherToShare(teacher);
                                      setIsShareModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#FAF7EE] hover:text-[#2563EB] text-left transition-colors cursor-pointer"
                                  >
                                    <Share2 className="w-3.5 h-3.5 text-[#2563EB]" />
                                    <span>Bagikan Statistik</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredTeachers.length === 0 && (
          <div className="p-12 text-center text-xs text-[#94A3B8] bg-white rounded-3xl border border-[#E2E8F0]">
            Tidak ada data wali kelas atau pembina yang sesuai dengan kriteria filter.
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredTeachers.length}
          itemsPerPage={PAGE_SIZE}
          itemName="wali kelas"
        />

        {isAssigning && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-lg bg-white rounded-[28px] border border-[#E2E8F0] shadow-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1B4D3E]" />
                  <h2 className="text-sm font-serif font-black text-[#172033]">
                    Penugasan Wali Kelas & Ustadz
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAssign} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Pilih Guru Pembina
                    </label>
                    <select
                      value={assignTeacherId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setAssignTeacherId(newId);
                        const found = allPembina.find((t) => t.id === newId);
                        if (found) {
                          setAssignClassName(found.assignedClass || "");
                        }
                      }}
                      className="w-full p-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E]"
                    >
                      {allPembina.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.gender}) - Kelas saat ini: {t.assignedClass || "Belum Ada"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                      Kelas Binaan yang Ditugaskan
                    </label>
                    <select
                      value={assignClassName}
                      onChange={(e) => setAssignClassName(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E]"
                    >
                      <option value="">Bebas Tugas (Lepas Kelas)</option>
                      {kelasList.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setIsAssigning(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTeacherDetail && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-2xl bg-white rounded-[28px] border border-[#E2E8F0] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex items-center justify-between gap-3 bg-[#FAF7EE]/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center font-bold text-sm text-[#065F46] shrink-0">
                    {activeTeacherDetail.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-serif font-black text-[#172033] truncate">
                      {activeTeacherDetail.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] flex-wrap mt-0.5">
                      <span>Pembina Santri {activeTeacherDetail.gender}</span>
                      <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                      <span className="font-bold text-[#1B4D3E]">
                        Kelas: {activeTeacherDetail.assignedClass || "Belum Ditugaskan"}
                      </span>
                      <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                      <span className="font-mono text-[#94A3B8]">@{activeTeacherDetail.username}</span>
                      {activeTeacherDetailEnriched && (
                        <>
                          <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                              activeTeacherDetailEnriched.status === "Sudah Lapor"
                                ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                                : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                activeTeacherDetailEnriched.status === "Sudah Lapor" ? "bg-[#10B981]" : "bg-red-500"
                              } animate-pulse`}
                            />
                            {activeTeacherDetailEnriched.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTeacherToShare(activeTeacherDetail);
                      setIsShareModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 hover:bg-[#F5EED9] text-xs font-bold transition-colors shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTeacherDetail(null)}
                    className="p-1.5 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-black/5"
                    title="Tutup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">Total Santri</span>
                    <span className="text-base sm:text-lg font-black font-mono text-[#172033] mt-0.5 block">{assignedStudents.length}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">Rata-rata Skor</span>
                    <span className="text-base sm:text-lg font-black font-mono text-[#1B4D3E] mt-0.5 block">{detailAvgScore}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">Perlu Binaan</span>
                    <span className="text-base sm:text-lg font-black font-mono text-red-600 mt-0.5 block">{detailAttentionCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase block">Laporan Hari Ini</span>
                    <span className="text-base sm:text-lg font-black font-mono text-[#1B4D3E] mt-0.5 block">{activeTeacherDetailEnriched?.reportsToday || 0}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172033] block">
                      Daftar Santri Binaan di Kelas {activeTeacherDetail.assignedClass || "-"} ({assignedStudents.length})
                    </span>
                  </div>

                  {assignedStudents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#94A3B8] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                      Tidak ada santri yang terdaftar di kelas binaan ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="overflow-x-auto -mx-4 sm:mx-0 border border-[#E2E8F0] rounded-2xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                              <th className="py-2.5 px-3">No</th>
                              <th className="py-2.5 px-3">NIS</th>
                              <th className="py-2.5 px-3">Nama Santri</th>
                              <th className="py-2.5 px-3">Asrama & Kamar</th>
                              <th className="py-2.5 px-3 text-center">Skor Akhlak</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-right">Profil</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0]">
                            {paginatedAssignedStudents.map((s, idx) => {
                              const studentNumber = (detailPage - 1) * DETAIL_PAGE_SIZE + idx + 1;
                              return (
                                <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                                  <td className="py-2.5 px-3 font-mono text-[#94A3B8]">{studentNumber}</td>
                                  <td className="py-2.5 px-3 font-mono text-[#64748B]">{s.nis}</td>
                                  <td className="py-2.5 px-3 font-bold text-[#172033]">{s.name}</td>
                                  <td className="py-2.5 px-3 text-[#64748B]">{s.asrama || "-"} - {s.kamar || "-"}</td>
                                  <td className="py-2.5 px-3 text-center font-bold font-mono text-[#1B4D3E]">
                                    {s.currentScore.toFixed(3).replace(".", ",")}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                        s.status === "Baik" || s.status === "Aman"
                                          ? "bg-[#ECFDF5] text-[#065F46]"
                                          : s.status === "Perhatian"
                                          ? "bg-[#FEFCE8] text-[#854D0E]"
                                          : "bg-[#FEF2F2] text-[#991B1B]"
                                      }`}
                                    >
                                      {s.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <Link
                                      href={`/guru/santri/${s.id}`}
                                      className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1B4D3E] text-white hover:bg-[#143B2F] inline-flex items-center gap-1"
                                    >
                                      <span>Profil</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <Pagination
                        currentPage={detailPage}
                        totalPages={detailTotalPages}
                        onPageChange={setDetailPage}
                        totalItems={assignedStudents.length}
                        itemsPerPage={DETAIL_PAGE_SIZE}
                        itemName="santri"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 sm:p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] font-medium">
                  Total {assignedStudents.length} santri binaan
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTeacherDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedTeacherToShare(null);
          }}
          initialType={selectedTeacherToShare ? "USTADZ" : "SHOLAT"}
          targetUstadz={selectedTeacherToShare || undefined}
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
