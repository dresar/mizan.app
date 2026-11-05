"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  UserCheck,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  GraduationCap
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { CardSub } from "@/components/ui/Card";

function TugaskanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTeacherId = searchParams.get("teacherId") || "";

  const {
    userList,
    kelasList,
    classList,
    santriList,
    updateUser,
    updateClass,
    showToast
  } = useMizan();

  const allPembina = useMemo(() => {
    return userList.filter(
      (u) => (u.role === "GURU" || u.role === "PENGASUHAN") && u.isActive !== false
    );
  }, [userList]);

  const [selectedTeacherId, setSelectedTeacherId] = useState(
    initialTeacherId || (allPembina[0]?.id ?? "")
  );

  const selectedTeacher = useMemo(() => {
    return allPembina.find((t) => t.id === selectedTeacherId) || allPembina[0] || null;
  }, [allPembina, selectedTeacherId]);

  const [assignedClass, setAssignedClass] = useState(
    selectedTeacher?.assignedClass || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedTeacher) {
      setAssignedClass(selectedTeacher.assignedClass || "");
    }
  }, [selectedTeacher]);

  const studentsInTargetClass = useMemo(() => {
    if (!assignedClass) return [];
    return santriList.filter((s) => s.class.toUpperCase() === assignedClass.toUpperCase());
  }, [assignedClass, santriList]);

  const currentWaliOfTargetClass = useMemo(() => {
    if (!assignedClass) return null;
    return allPembina.find(
      (t) => t.assignedClass?.toUpperCase() === assignedClass.toUpperCase() && t.id !== selectedTeacher?.id
    );
  }, [assignedClass, allPembina, selectedTeacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) {
      showToast("Pilih guru pembina terlebih dahulu", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const oldClass = selectedTeacher.assignedClass;
      await updateUser(selectedTeacher.id, {
        assignedClass: assignedClass || undefined
      });

      if (assignedClass) {
        await updateClass(assignedClass, {
          waliKelas: selectedTeacher.name,
          guruId: selectedTeacher.id,
          gender: selectedTeacher.gender
        });
      }

      if (oldClass && oldClass !== assignedClass) {
        const stillOtherWali = allPembina.find(
          (t) => t.id !== selectedTeacher.id && t.assignedClass === oldClass
        );
        if (!stillOtherWali) {
          await updateClass(oldClass, {
            waliKelas: "Belum Ditugaskan",
            guruId: ""
          });
        }
      }

      showToast(
        assignedClass
          ? `Berhasil menugaskan ${selectedTeacher.name} sebagai Wali Kelas ${assignedClass}`
          : `Berhasil mengubah status ${selectedTeacher.name} menjadi Bebas Tugas`,
        "success"
      );
      router.push("/admin/wali-kelas");
    } catch {
      showToast("Gagal menyimpan penugasan wali kelas", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultAvatar =
    selectedTeacher?.gender === "Putri"
      ? "/default-avatar-ustadzah.jpg"
      : "/default-avatar-ustadz.jpg";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-32">
      <div className="space-y-1">
        <Link
          href="/admin/wali-kelas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Data Wali Kelas & Pembina</span>
        </Link>
        <div className="flex items-center gap-2 pt-1">
          <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
            Penugasan Wali Kelas & Guru Pembina
          </h1>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            Sinkronisasi Data
          </span>
        </div>
        <p className="text-xs text-[#64748B]">
          Atur tanggung jawab kelas binaan santri untuk Ustadz atau Ustadzah secara resmi dalam sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <div className="md:col-span-1 space-y-3.5">
          <div className="p-4 rounded-3xl bg-white border border-[#E2EBF4] shadow-2xs space-y-3 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-[#E2EBF4] shadow-xs bg-[#FAF7EE]">
              <img
                src={selectedTeacher?.avatarUrl || defaultAvatar}
                alt={selectedTeacher?.name || "Guru"}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== defaultAvatar && !target.src.endsWith(defaultAvatar)) {
                    target.src = defaultAvatar;
                  }
                }}
              />
            </div>

            <div>
              <h3 className="text-sm font-black text-[#172033]">
                {selectedTeacher?.name || "Pilih Pembina"}
              </h3>
              <p className="text-[10px] font-mono text-[#64748B] pt-0.5">
                @{selectedTeacher?.username || selectedTeacher?.id}
              </p>
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedTeacher?.gender === "Putra"
                      ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                      : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                  }`}
                >
                  {selectedTeacher?.gender === "Putra" ? "Ustadz (L)" : "Ustadzah (P)"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedTeacher?.role === "GURU" ? "Guru Kelas" : "Pengasuhan BK"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Kelas Saat Ini:</span>
                <span className="font-bold text-[#172033]">
                  {selectedTeacher?.assignedClass || "Bebas Tugas"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Santri Binaan:</span>
                <span className="font-mono font-bold text-[#1B4D3E]">
                  {studentsInTargetClass.length} Santri
                </span>
              </div>
            </div>
          </div>

          {currentWaliOfTargetClass && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Peringatan Penugasan</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Kelas <strong>{assignedClass}</strong> saat ini dipegang oleh{" "}
                <strong>{currentWaliOfTargetClass.name}</strong>. Menugaskan pembina baru akan memperbarui penanggung jawab kelas ini.
              </p>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E2EBF4] shadow-2xs space-y-4"
          >
            <div>
              <h2 className="text-sm font-serif font-black text-[#172033] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1B4D3E]" />
                <span>Formulir Penugasan Resmi</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Pilih guru pembina dan tentukan kelas binaan yang sesuai dengan gender santri.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1.5">
                  1. Pilih Guru Pembina (Asatidz / Ustadzah)
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E] transition-colors"
                >
                  {allPembina.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.gender === "Putra" ? "L" : "P"}) {t.assignedClass ? `• Kelas ${t.assignedClass}` : "• Bebas Tugas"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1.5">
                  2. Ruang Kelas Binaan yang Ditugaskan
                </label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E] transition-colors"
                >
                  <option value="">Bebas Tugas (Lepas Penugasan Kelas)</option>
                  {kelasList.map((cls) => {
                    const matchCls = classList.find((c) => c.name.toUpperCase() === cls.toUpperCase());
                    const isPutri = cls.endsWith("B") || cls.endsWith("C") || matchCls?.gender === "Putri";
                    const isGenderMismatch =
                      selectedTeacher &&
                      ((selectedTeacher.gender === "Putra" && isPutri) ||
                        (selectedTeacher.gender === "Putri" && !isPutri));

                    return (
                      <option key={cls} value={cls}>
                        Kelas {cls} ({isPutri ? "Santriwati Putri" : "Santri Putra"}) {isGenderMismatch ? "⚠️ Beda Gender" : ""}
                      </option>
                    );
                  })}
                </select>
                <span className="text-[10px] text-[#64748B] block mt-1">
                  Pilih kelas yang sesuai dengan santri putra atau santriwati putri.
                </span>
              </div>

              {assignedClass && (
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#1B4D3E]" />
                      <span>Santri di Kelas {assignedClass} ({studentsInTargetClass.length} Santri)</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#065F46] font-bold bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                      Siap Dibina
                    </span>
                  </div>

                  {studentsInTargetClass.length === 0 ? (
                    <p className="text-[11px] text-[#64748B] italic">
                      Belum ada santri yang terdaftar di kelas ini.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {studentsInTargetClass.slice(0, 10).map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-1 rounded-lg bg-white border border-[#E2EBF4] text-[10px] font-semibold text-[#172033] shadow-2xs"
                        >
                          {s.name}
                        </span>
                      ))}
                      {studentsInTargetClass.length > 10 && (
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-[#64748B]">
                          +{studentsInTargetClass.length - 10} lainnya
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-2.5">
              <Link
                href="/admin/wali-kelas"
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Simpan Penugasan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TugaskanWaliKelasPage() {
  return (
    <RoleShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Memuat formulir penugasan...</div>}>
        <TugaskanContent />
      </Suspense>
    </RoleShell>
  );
}
