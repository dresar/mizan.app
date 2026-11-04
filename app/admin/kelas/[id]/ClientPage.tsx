"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Edit2,
  UserCheck,
  X,
  Save
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Avatar } from "@/components/ui/Avatar";
import { ClassStats } from "./ClassStats";
import { ClassStudentsTable } from "./ClassStudentsTable";
import { ClassLogsTable } from "./ClassLogsTable";

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    kelasList,
    classList,
    santriList,
    userList,
    penilaianList,
    updateClass,
    showToast
  } = useMizan();

  const rawId = (params?.id as string) || "1A";
  const classId = decodeURIComponent(rawId).trim().toUpperCase();

  const [isEditingClass, setIsEditingClass] = useState(false);
  const [editClassName, setEditClassName] = useState("");
  const [editGender, setEditGender] = useState<"Putra" | "Putri">("Putra");
  const [editWaliId, setEditWaliId] = useState("");

  const [isEditingWali, setIsEditingWali] = useState(false);
  const [quickWaliId, setQuickWaliId] = useState("");

  const availableTeachers = useMemo(() => {
    return userList.filter((u) => u.role === "GURU" || u.role === "PENGASUHAN");
  }, [userList]);

  const currentClass = useMemo(() => {
    const matchDb = classList.find((c) => c.name.toUpperCase() === classId);
    const existsInList = kelasList.some((k) => k.toUpperCase() === classId);

    if (!matchDb && !existsInList) return null;

    const students = santriList.filter((s) => s.class.toUpperCase() === classId);
    const avg =
      students.length > 0
        ? students.reduce((acc, s) => acc + s.currentScore, 0) / students.length
        : 70.0;

    let defaultGender: "Putra" | "Putri" = "Putra";
    if (matchDb?.gender) {
      defaultGender = matchDb.gender;
    } else if (classId.endsWith("C") || classId.endsWith("D")) {
      defaultGender = "Putri";
    }

    const assignedTeacher = userList.find(
      (u) => u.assignedClass?.toUpperCase() === classId && (u.role === "GURU" || u.role === "PENGASUHAN")
    );

    return {
      id: matchDb?.id || `cls-${classId.toLowerCase()}`,
      name: classId,
      gender: defaultGender,
      waliKelas: assignedTeacher?.name || matchDb?.waliKelas || "Belum Ditugaskan",
      guruId: assignedTeacher?.id || matchDb?.guruId || "",
      teacherAvatarUrl: assignedTeacher?.avatarUrl,
      teacherInitials:
        assignedTeacher?.avatarInitials ||
        (assignedTeacher?.name || matchDb?.waliKelas || "WK").slice(0, 2).toUpperCase(),
      studentCount: students.length,
      avgScore: avg
    };
  }, [classId, classList, kelasList, santriList, userList]);

  const classStudents = useMemo(() => {
    return santriList.filter((s) => s.class.toUpperCase() === classId);
  }, [santriList, classId]);

  const classPenilaianList = useMemo(() => {
    return penilaianList.filter(
      (p) => p.santriClass?.toUpperCase() === classId
    );
  }, [penilaianList, classId]);

  const stats = useMemo(() => {
    const hasanahRecords = classPenilaianList.filter((p) => p.type === "HASANAH");
    const sayyiahRecords = classPenilaianList.filter((p) => p.type === "SAYYIAH");

    return {
      totalHasanah: hasanahRecords.length,
      totalSayyiah: sayyiahRecords.length,
      totalHasanahScore: hasanahRecords.reduce((acc, p) => acc + (p.score || 0), 0),
      totalSayyiahScore: sayyiahRecords.reduce((acc, p) => acc + (p.score || 0), 0),
      hasanahRingan: hasanahRecords.filter((p) => p.tingkat === "Ringan").length,
      hasanahSedang: hasanahRecords.filter((p) => p.tingkat === "Sedang").length,
      hasanahBerat: hasanahRecords.filter((p) => p.tingkat === "Berat").length,
      sayyiahRingan: sayyiahRecords.filter((p) => p.tingkat === "Ringan").length,
      sayyiahSedang: sayyiahRecords.filter((p) => p.tingkat === "Sedang").length,
      sayyiahBerat: sayyiahRecords.filter((p) => p.tingkat === "Berat").length,
      baikCount: classStudents.filter((s) => s.status === "Baik").length,
      perhatianCount: classStudents.filter((s) => s.status === "Perhatian").length,
      pembinaanCount: classStudents.filter((s) => s.status === "Perlu Pembinaan").length
    };
  }, [classPenilaianList, classStudents]);

  const studentMetricsMap = useMemo(() => {
    const map = new Map<string, { hasanahCount: number; sayyiahCount: number }>();
    classStudents.forEach((s) => {
      map.set(s.id, { hasanahCount: 0, sayyiahCount: 0 });
    });
    classPenilaianList.forEach((p) => {
      const entry = map.get(p.santriId);
      if (entry) {
        if (p.type === "HASANAH") entry.hasanahCount += 1;
        else entry.sayyiahCount += 1;
      }
    });
    return map;
  }, [classStudents, classPenilaianList]);

  const handleOpenEditClass = () => {
    if (!currentClass) return;
    setEditClassName(currentClass.name);
    setEditGender(currentClass.gender);
    setEditWaliId(currentClass.guruId);
    setIsEditingClass(true);
    setIsEditingWali(false);
  };

  const handleSaveEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass) return;

    const cleanNew = editClassName.trim().toUpperCase();
    if (!cleanNew) {
      showToast("Nama kelas wajib diisi", "error");
      return;
    }

    const teacher = userList.find((u) => u.id === editWaliId);
    const res = await updateClass(currentClass.name, {
      newName: cleanNew,
      gender: editGender,
      waliKelas: teacher?.name || "",
      guruId: editWaliId
    });

    if (res.success) {
      setIsEditingClass(false);
      if (cleanNew !== currentClass.name) {
        router.push(`/admin/kelas/${cleanNew}`);
      }
    }
  };

  const handleOpenEditWali = () => {
    if (!currentClass) return;
    setQuickWaliId(currentClass.guruId);
    setIsEditingWali(true);
    setIsEditingClass(false);
  };

  const handleSaveQuickWali = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass) return;

    const teacher = userList.find((u) => u.id === quickWaliId);
    const res = await updateClass(currentClass.name, {
      waliKelas: teacher?.name || "",
      guruId: quickWaliId
    });

    if (res.success) {
      setIsEditingWali(false);
    }
  };

  if (!currentClass) {
    return (
      <RoleShell>
        <div className="w-full space-y-4 pb-36">
          <Link
            href="/admin/kelas"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#172033] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Data Kelas</span>
          </Link>
          <div className="mizan-card p-12 text-center space-y-3 bg-white border border-[#E2EBF4]">
            <GraduationCap className="w-12 h-12 text-[#94A3B8] mx-auto opacity-50" />
            <h2 className="text-base font-bold text-[#172033]">Kelas Tidak Ditemukan</h2>
            <p className="text-xs text-[#64748B]">
              Kelas {classId} tidak tercatat dalam basis data sistem Mizan.
            </p>
            <Link
              href="/admin/kelas"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors"
            >
              Lihat Seluruh Kelas
            </Link>
          </div>
        </div>
      </RoleShell>
    );
  }

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/kelas"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#172033] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Data Kelas</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenEditWali}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#EFF6FF] text-[#1E3A8A] border border-blue-200 hover:bg-[#DBEAFE] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Ganti Wali</span>
            </button>
            <button
              type="button"
              onClick={handleOpenEditClass}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 hover:bg-[#F5EED9] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Ubah Kelas</span>
            </button>
          </div>
        </div>

        <div className="mizan-card p-4 sm:p-5 bg-white border border-[#E2EBF4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar
              src={currentClass.teacherAvatarUrl}
              initials={currentClass.teacherInitials}
              size="lg"
              variant={currentClass.gender === "Putri" ? "gold" : "primary"}
              className="w-16 h-16 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033]">
                  Kelas {currentClass.name}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentClass.gender === "Putra"
                      ? "bg-[#ECFDF5] text-[#065F46]"
                      : "bg-[#FAF7EE] text-[#A8833E]"
                  }`}
                >
                  {currentClass.gender}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Wali: <strong className="text-[#172033] font-semibold">{currentClass.waliKelas}</strong> • Total Santri: <strong className="text-[#172033] font-semibold">{classStudents.length} Santri</strong>
              </p>
            </div>
          </div>
        </div>

        <ClassStats avgScore={currentClass.avgScore} stats={stats} />

        <ClassStudentsTable
          classNameTitle={currentClass.name}
          students={classStudents}
          studentMetricsMap={studentMetricsMap}
        />

        <ClassLogsTable
          classNameTitle={currentClass.name}
          logs={classPenilaianList}
        />

        {isEditingClass && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2EBF4] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#1B4D3E]" />
                  <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
                    Ubah Kelas
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingClass(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditClass} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-bold focus:outline-none focus:border-[#1B4D3E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Kategori Gender Santri
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Putra", "Putri"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setEditGender(g)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          editGender === g
                            ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs"
                            : "bg-[#FAF7EE] text-[#64748B] border-[#E2EBF4] hover:bg-white"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Pilih Wali Kelas
                  </label>
                  <select
                    value={editWaliId}
                    onChange={(e) => setEditWaliId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-bold focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsEditingClass(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditingWali && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E2EBF4] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1B4D3E]" />
                  <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
                    Ganti Wali Kelas {currentClass.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingWali(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveQuickWali} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Pilih Guru Pembina
                  </label>
                  <select
                    value={quickWaliId}
                    onChange={(e) => setQuickWaliId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-bold focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsEditingWali(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Tugaskan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
