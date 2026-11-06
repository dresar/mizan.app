"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Edit2,
  X,
  Save,
  Plus
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

  const rawId = (params?.id as string) || "";
  const [effectiveClassId, setEffectiveClassId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && last.toUpperCase() !== "DETAIL") {
        return decodeURIComponent(last).trim().toUpperCase();
      }
    }
    const cleanRaw = decodeURIComponent(rawId).trim().toUpperCase();
    if (cleanRaw && cleanRaw !== "DETAIL") {
      return cleanRaw;
    }
    return "1A";
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && last.toUpperCase() !== "DETAIL") {
        setEffectiveClassId(decodeURIComponent(last).trim().toUpperCase());
        return;
      }
    }
    const cleanRaw = decodeURIComponent((params?.id as string) || "").trim().toUpperCase();
    if (cleanRaw && cleanRaw !== "DETAIL") {
      setEffectiveClassId(cleanRaw);
    }
  }, [params?.id]);

  const [isEditing, setIsEditing] = useState(false);
  const [editClassName, setEditClassName] = useState("");
  const [editGender, setEditGender] = useState<"Putra" | "Putri">("Putra");
  const [editWaliId, setEditWaliId] = useState("");
  const [editPendampingId, setEditPendampingId] = useState("");
  const [editAsistenList, setEditAsistenList] = useState<string[]>([]);
  const [selectedNewAsisten, setSelectedNewAsisten] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const availableTeachers = useMemo(() => {
    return userList.filter((u) => u.role === "GURU" || u.role === "PENGASUHAN");
  }, [userList]);

  const currentClass = useMemo(() => {
    const targetId = effectiveClassId || "1A";
    const matchDb = classList.find((c) => c.name.toUpperCase() === targetId);
    const existsInList = kelasList.some((k) => k.toUpperCase() === targetId);
    const isStandardClass = /^[1-6][A-D]$/.test(targetId);

    if (!matchDb && !existsInList && !isStandardClass) return null;

    const students = santriList.filter((s) => s.class.toUpperCase() === targetId);
    const avg =
      students.length > 0
        ? students.reduce((acc, s) => acc + s.currentScore, 0) / students.length
        : 70.0;

    let defaultGender: "Putra" | "Putri" = "Putra";
    if (matchDb?.gender) {
      defaultGender = matchDb.gender;
    } else if (targetId.endsWith("B") || targetId.endsWith("C") || targetId.endsWith("D")) {
      defaultGender = "Putri";
    }

    const assignedTeacher = userList.find(
      (u) => u.assignedClass?.toUpperCase() === targetId && (u.role === "GURU" || u.role === "PENGASUHAN")
    );

    return {
      id: matchDb?.id || `cls-${targetId.toLowerCase()}`,
      name: targetId,
      gender: defaultGender,
      waliKelas: matchDb?.waliKelas || assignedTeacher?.name || "Belum Ditugaskan",
      guruId: matchDb?.guruId || assignedTeacher?.id || "",
      pendampingWali: matchDb?.pendampingWali || "",
      pendampingId: matchDb?.pendampingId || "",
      asistenWali: matchDb?.asistenWali || [],
      teacherAvatarUrl: assignedTeacher?.avatarUrl,
      teacherInitials:
        assignedTeacher?.avatarInitials ||
        (matchDb?.waliKelas || assignedTeacher?.name || "WK").slice(0, 2).toUpperCase(),
      studentCount: students.length,
      avgScore: avg
    };
  }, [effectiveClassId, classList, kelasList, santriList, userList]);

  const classStudents = useMemo(() => {
    return santriList.filter((s) => s.class.toUpperCase() === effectiveClassId);
  }, [santriList, effectiveClassId]);

  const classPenilaianList = useMemo(() => {
    return penilaianList.filter(
      (p) => p.santriClass?.toUpperCase() === effectiveClassId
    );
  }, [penilaianList, effectiveClassId]);

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

  const handleStartEdit = () => {
    if (!currentClass) return;
    setEditClassName(currentClass.name);
    setEditGender(currentClass.gender);
    const matchWali = userList.find(
      (u) => (currentClass.guruId && u.id === currentClass.guruId) || u.name === currentClass.waliKelas
    );
    setEditWaliId(matchWali?.id || currentClass.guruId || "");

    const matchPendamping = userList.find(
      (u) => (currentClass.pendampingId && u.id === currentClass.pendampingId) || u.name === currentClass.pendampingWali
    );
    setEditPendampingId(matchPendamping?.id || currentClass.pendampingId || "");

    setEditAsistenList([...(currentClass.asistenWali || [])]);
    setSelectedNewAsisten("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedNewAsisten("");
  };

  const handleAddAsisten = (teacherName: string) => {
    if (!teacherName) return;
    if (!editAsistenList.includes(teacherName)) {
      setEditAsistenList([...editAsistenList, teacherName]);
    }
    setSelectedNewAsisten("");
  };

  const handleRemoveAsisten = (teacherNameToRemove: string) => {
    setEditAsistenList(editAsistenList.filter((a) => a !== teacherNameToRemove));
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentClass) return;

    const cleanNew = editClassName.trim().toUpperCase();
    if (!cleanNew) {
      showToast("Nama kelas wajib diisi", "error");
      return;
    }

    const waliTeacher = userList.find((u) => u.id === editWaliId);
    const pendampingTeacher = userList.find((u) => u.id === editPendampingId);

    setIsSaving(true);
    try {
      const res = await updateClass(currentClass.name, {
        newName: cleanNew,
        gender: editGender,
        waliKelas: waliTeacher ? waliTeacher.name : editWaliId ? editWaliId : "Belum Ditugaskan",
        guruId: editWaliId,
        pendampingWali: pendampingTeacher ? pendampingTeacher.name : "",
        pendampingId: editPendampingId,
        asistenWali: editAsistenList
      });

      if (res.success) {
        showToast("Data kelas dan tim pembina berhasil diperbarui", "success");
        setIsEditing(false);
        if (cleanNew !== currentClass.name) {
          router.push(`/admin/kelas/${cleanNew}`);
        }
      } else {
        showToast(res.message || "Gagal memperbarui data kelas", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menyimpan kelas", "error");
    } finally {
      setIsSaving(false);
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
              Kelas {effectiveClassId} tidak tercatat dalam basis data sistem Mizan.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
              <Link
                href="/admin/kelas"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors"
              >
                Lihat Seluruh Kelas
              </Link>
              <Link
                href="/admin/kelas/1A"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 text-xs font-bold hover:bg-[#F5EED9] transition-colors"
              >
                Buka Kelas 1A
              </Link>
            </div>
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
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-[#EEF2F6] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#153e32] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40 hover:bg-[#F5EED9] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Kelas & Tim Pembina</span>
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form
            onSubmit={handleSaveAll}
            className="mizan-card p-4 sm:p-5 bg-white border-2 border-[#1B4D3E]/30 rounded-3xl shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#1B4D3E]" />
                <h2 className="text-sm font-serif font-black text-[#172033]">
                  Edit Informasi Kelas & Penugasan Pembina
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                Mode Ubah Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-bold uppercase focus:outline-none focus:border-[#1B4D3E]"
                  placeholder="Contoh: 1A"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                  Kategori Gender Santri
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditGender("Putra")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      editGender === "Putra"
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "bg-[#F8FAFC] text-[#64748B] border border-[#E2EBF4]"
                    }`}
                  >
                    Santri Putra (L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGender("Putri")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      editGender === "Putri"
                        ? "bg-[#A8833E] text-white shadow-xs"
                        : "bg-[#F8FAFC] text-[#64748B] border border-[#E2EBF4]"
                    }`}
                  >
                    Santriwati Putri (P)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] space-y-3">
              <span className="text-xs font-bold text-[#172033] block">
                Penugasan Wali Kelas & Pendamping
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                    Wali Kelas Utama
                  </label>
                  <select
                    value={editWaliId}
                    onChange={(e) => setEditWaliId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.gender === "Putra" ? "Ustadz" : "Ustadzah"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                    Wali Kelas Pendamping / Co-Wali
                  </label>
                  <select
                    value={editPendampingId}
                    onChange={(e) => setEditPendampingId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-[#065F46] font-semibold focus:outline-none focus:border-[#1B4D3E]"
                  >
                    <option value="">-- Tidak Ada Pendamping (Opsional) --</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.gender === "Putra" ? "Ustadz" : "Ustadzah"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033]">
                  Asisten Pembina Belajar Malam ({editAsistenList.length})
                </span>
                <span className="text-[10px] text-[#64748B]">
                  Dapat menambahkan lebih dari 1 guru
                </span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[36px] p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4]">
                {editAsistenList.map((asisten, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-[#E2EBF4] text-[#172033] shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E]" />
                    <span>{asisten}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAsisten(asisten)}
                      className="p-0.5 rounded-md text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title={`Hapus ${asisten}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {editAsistenList.length === 0 && (
                  <span className="text-xs text-[#94A3B8] italic p-1">
                    Belum ada asisten belajar malam yang dipilih.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedNewAsisten}
                  onChange={(e) => setSelectedNewAsisten(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#E2EBF4] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E]"
                >
                  <option value="">-- Pilih Guru untuk Ditambahkan sebagai Asisten --</option>
                  {availableTeachers
                    .filter((t) => !editAsistenList.includes(t.name))
                    .map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.gender === "Putra" ? "Ustadz" : "Ustadzah"}) • {t.role === "GURU" ? "Guru Kelas" : "Pengasuhan"}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAddAsisten(selectedNewAsisten)}
                  disabled={!selectedNewAsisten}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1B4D3E] text-white hover:bg-[#153e32] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Asisten</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mizan-card p-4 sm:p-5 bg-white border border-[#E2EBF4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar
                  src={currentClass.teacherAvatarUrl}
                  initials={currentClass.teacherInitials}
                  size="lg"
                  variant={currentClass.gender === "Putri" ? "gold" : "primary"}
                  gender={currentClass.gender}
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
                    Wali: <strong className="text-[#172033] font-semibold">{currentClass.waliKelas}</strong>
                    {currentClass.pendampingWali && (
                      <span> • Pendamping: <strong className="text-[#065F46] font-semibold">{currentClass.pendampingWali}</strong></span>
                    )}
                    <span> • Total Santri: <strong className="text-[#172033] font-semibold">{classStudents.length} Santri</strong></span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B4D3E]">
                  Tim Pembina & Asisten Belajar Malam Kelas {currentClass.name}
                </h2>
                <span className="text-[11px] font-mono text-[#64748B]">
                  {(currentClass.asistenWali?.length || 0) + (currentClass.pendampingWali ? 2 : 1)} Pembina Terdaftar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/30 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#A8833E]">
                    Wali Kelas Utama
                  </span>
                  <p className="text-sm font-bold text-[#172033]">
                    {currentClass.waliKelas}
                  </p>
                </div>

                {currentClass.pendampingWali && (
                  <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#065F46]">
                      Wali Kelas Pendamping
                    </span>
                    <p className="text-sm font-bold text-[#172033]">
                      {currentClass.pendampingWali}
                    </p>
                  </div>
                )}
              </div>

              {currentClass.asistenWali && currentClass.asistenWali.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Asisten Pembina Belajar Malam ({currentClass.asistenWali.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentClass.asistenWali.map((asisten, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white border border-[#E2EBF4] text-[#172033] shadow-2xs flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E]" />
                        <span>{asisten}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

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
      </div>
    </RoleShell>
  );
}
