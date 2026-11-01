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
  ExternalLink
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { UserProfile, Santri } from "@/lib/mock-data";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { ShareModal } from "@/components/ShareModal";

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
    if (!assignTeacherId || !assignClassName) {
      showToast("Pilih guru pembina dan kelas", "error");
      return;
    }

    const teacher = allPembina.find((t) => t.id === assignTeacherId);
    if (!teacher) return;

    await updateUser(assignTeacherId, { assignedClass: assignClassName });
    await updateClass(assignClassName, {
      waliKelas: teacher.name,
      guruId: teacher.id,
      gender: teacher.gender
    });

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

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                Pusat Pembinaan Ustadz & Ustadzah
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                Maksimal 20 per Halaman
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1">
              Data Wali Kelas & Guru Pembina
            </h1>
            <p className="text-[11px] text-[#64748B]">
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

        {isAssigning && (
          <Card className="p-4 sm:p-5 border-2 border-[#1B4D3E]/30 bg-[#FAF7EE] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4C9B5]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1B4D3E]" />
                <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Penugasan Wali Kelas & Ustadz/Ustadzah
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                    Pilih Guru Pembina
                  </label>
                  <select
                    value={assignTeacherId}
                    onChange={(e) => setAssignTeacherId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  >
                    {allPembina.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.gender}) • Kelas saat ini: {t.assignedClass || "Belum Ada"}
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
                    className="w-full p-2.5 text-xs bg-white border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
                  >
                    {kelasList.map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D4C9B5]">
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] bg-white border border-[#D4C9B5] hover:bg-[#FAF7EE]"
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
          </Card>
        )}

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
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-3xl border border-[#E2E8F0] p-4 flex flex-col justify-between hover:shadow-xs hover:border-[#1B4D3E]/30 transition-all space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center font-bold text-xs text-[#166534] shrink-0">
                        {teacher.avatarInitials || "WB"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#172033] line-clamp-1">
                          {teacher.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              teacher.gender === "Putra"
                                ? "bg-[#ECFDF5] text-[#065F46]"
                                : "bg-[#FAF7EE] text-[#A8833E]"
                            }`}
                          >
                            {teacher.gender}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] font-mono">
                            @{teacher.username}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        teacher.status === "Sudah Lapor"
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : "bg-[#FEF2F2] text-[#991B1B]"
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Kelas Binaan:</span>
                      {teacher.assignedClass ? (
                        <span className="font-bold text-[#1B4D3E] bg-[#ECFDF5] px-2 py-0.5 rounded-lg border border-[#A7F3D0]">
                          Kelas {teacher.assignedClass}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#94A3B8] italic">
                          Belum Ditugaskan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EEF2F6]">
                      <span className="text-[#64748B]">Jumlah Santri:</span>
                      <span className="font-bold font-mono text-[#172033]">
                        {teacher.studentsCount} Santri
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EEF2F6]">
                      <span className="text-[#64748B]">Rata-rata Skor:</span>
                      <span className="font-bold font-mono text-[#1B4D3E]">
                        {teacher.avgScore.toFixed(3).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs">
                  <span className="text-[11px] text-[#64748B]">
                    Laporan: <strong className="text-[#172033] font-mono">{teacher.reportsToday}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTeacherToShare(teacher);
                        setIsShareModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 hover:bg-[#F5EED9] transition-colors"
                    >
                      Bagikan
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAssign(teacher)}
                      className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#F8FAFC] text-[#475569] border border-[#CBD5E1] hover:bg-white transition-colors"
                    >
                      Ubah
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDetail(teacher)}
                      className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                    <th className="py-3 px-3.5">No</th>
                    <th className="py-3 px-3.5">Wali Kelas / Pembina</th>
                    <th className="py-3 px-3.5">Gender</th>
                    <th className="py-3 px-3.5">Peran</th>
                    <th className="py-3 px-3.5">Kelas Binaan</th>
                    <th className="py-3 px-3.5 text-center">Jumlah Santri</th>
                    <th className="py-3 px-3.5 text-center">Rata-rata Skor</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedTeachers.map((teacher, idx) => {
                    const rowNumber = (currentPage - 1) * PAGE_SIZE + idx + 1;
                    return (
                      <tr key={teacher.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-3.5 font-mono text-[#94A3B8]">{rowNumber}</td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center font-bold text-[11px] text-[#166534] shrink-0">
                              {teacher.avatarInitials || "WB"}
                            </div>
                            <div>
                              <p className="font-bold text-[#172033]">{teacher.name}</p>
                              <p className="text-[10px] text-[#94A3B8] font-mono">@{teacher.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              teacher.gender === "Putra"
                                ? "bg-[#ECFDF5] text-[#065F46]"
                                : "bg-[#FAF7EE] text-[#A8833E]"
                            }`}
                          >
                            {teacher.gender}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-[#475569]">
                          {teacher.role === "GURU" ? "Guru Kelas" : "Pengasuhan BK"}
                        </td>
                        <td className="py-3 px-3.5">
                          {teacher.assignedClass ? (
                            <span className="font-bold text-[#1B4D3E] bg-[#ECFDF5] px-2 py-0.5 rounded-lg border border-[#A7F3D0]">
                              Kelas {teacher.assignedClass}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#94A3B8] italic">Belum Ditugaskan</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-[#172033]">
                          {teacher.studentsCount}
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-[#1B4D3E]">
                          {teacher.avgScore.toFixed(3).replace(".", ",")}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              teacher.status === "Sudah Lapor"
                                ? "bg-[#ECFDF5] text-[#065F46]"
                                : "bg-[#FEF2F2] text-[#991B1B]"
                            }`}
                          >
                            {teacher.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeacherToShare(teacher);
                                setIsShareModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 hover:bg-[#F5EED9]"
                            >
                              Bagikan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenAssign(teacher)}
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F8FAFC] text-[#475569] border border-[#CBD5E1] hover:bg-white"
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(teacher)}
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1B4D3E] text-white hover:bg-[#143B2F]"
                            >
                              Detail
                            </button>
                          </div>
                        </td>
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

        {activeTeacherDetail && (
          <Card className="p-4 sm:p-5 bg-white border border-[#E2E8F0] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center font-bold text-sm text-[#065F46] shrink-0">
                  {activeTeacherDetail.avatarInitials}
                </div>
                <div>
                  <h3 className="text-base font-serif font-black text-[#172033]">
                    {activeTeacherDetail.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap mt-0.5">
                    <span>Pembina Santri {activeTeacherDetail.gender}</span>
                    <span>•</span>
                    <span className="font-bold text-[#1B4D3E]">
                      Kelas: {activeTeacherDetail.assignedClass || "Belum Ditugaskan"}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[#94A3B8]">@{activeTeacherDetail.username}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
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
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <span className="text-[10px] text-[#64748B] font-bold uppercase block">Total Santri</span>
                <span className="text-lg font-black font-mono text-[#172033] mt-0.5 block">{assignedStudents.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <span className="text-[10px] text-[#64748B] font-bold uppercase block">Rata-rata Skor</span>
                <span className="text-lg font-black font-mono text-[#1B4D3E] mt-0.5 block">{detailAvgScore}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <span className="text-[10px] text-[#64748B] font-bold uppercase block">Perlu Binaan</span>
                <span className="text-lg font-black font-mono text-red-600 mt-0.5 block">{detailAttentionCount}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] block">
                  Daftar Santri Binaan di Kelas {activeTeacherDetail.assignedClass || "-"} ({assignedStudents.length})
                </span>
                <span className="text-[10px] text-[#94A3B8]">Maksimal 20 per Halaman</span>
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
                              <td className="py-2.5 px-3 text-[#64748B]">{s.asrama || "-"} • {s.kamar || "-"}</td>
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
          </Card>
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
      </div>
    </RoleShell>
  );
}
