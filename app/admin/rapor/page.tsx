"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Users,
  Award,
  Clock,
  Sparkles,
  Building2,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  User,
  ShieldCheck,
  FileText
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { CardSub } from "@/components/ui/Card";
import { generateClassBulkPdf } from "@/lib/pdf-generator";

interface ClassRaporCardItem {
  id: string;
  name: string;
  gender: "Putra" | "Putri";
  waliKelas: string;
  pendampingWali?: string;
  asistenWali?: string[];
  waliAvatar: string;
  studentCount: number;
  avgScore: number;
  avgSholat: number;
  asrama: string;
}

export default function AdminRaporPage() {
  const {
    kelasList,
    classList,
    santriList,
    userList,
    penilaianList,
    absensiList,
    showToast
  } = useMizan();

  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingClassId, setDownloadingClassId] = useState<string | null>(null);

  const enrichedClasses: ClassRaporCardItem[] = useMemo(() => {
    return kelasList.map((clsName) => {
      const matchDb = classList.find((c) => c.name.toUpperCase() === clsName.toUpperCase());
      const students = santriList.filter((s) => s.class.toUpperCase() === clsName.toUpperCase());

      const avgScore =
        students.length > 0
          ? students.reduce((acc, s) => acc + s.currentScore, 0) / students.length
          : 70.0;

      let totalSholatPercentSum = 0;
      if (students.length > 0) {
        students.forEach((s) => {
          const sAbs = absensiList.filter((a) => a.santriId === s.id);
          const totalHadir = sAbs.filter((a) => a.status === "Hadir").length;
          const safeHadir = s.totalHadir ?? 28;
          const rate = sAbs.length > 0 ? (totalHadir / sAbs.length) * 100 : (safeHadir / 28) * 100;
          totalSholatPercentSum += Math.min(100, Math.max(0, rate));
        });
      }
      const avgSholat = students.length > 0 ? totalSholatPercentSum / students.length : 100.0;

      let defaultGender: "Putra" | "Putri" = "Putra";
      if (matchDb?.gender) {
        defaultGender = matchDb.gender;
      } else if (clsName.endsWith("B") || clsName.endsWith("C") || clsName.endsWith("D")) {
        defaultGender = "Putri";
      }

      const assignedTeacher = userList.find(
        (u) =>
          u.assignedClass?.toUpperCase() === clsName.toUpperCase() &&
          (u.role === "GURU" || u.role === "PENGASUHAN")
      );

      const defaultAvatar =
        defaultGender === "Putri"
          ? "/default-avatar-ustadzah.jpg"
          : "/default-avatar-ustadz.jpg";

      return {
        id: matchDb?.id || `cls-${clsName.toLowerCase()}`,
        name: clsName,
        gender: defaultGender,
        waliKelas: matchDb?.waliKelas || assignedTeacher?.name || "Ust. Pembina Kelas",
        pendampingWali: matchDb?.pendampingWali || "",
        asistenWali: matchDb?.asistenWali || [],
        waliAvatar: assignedTeacher?.avatarUrl || defaultAvatar,
        studentCount: students.length,
        avgScore,
        avgSholat,
        asrama: defaultGender === "Putra" ? "Asrama Salman Al-Farisi" : "Asrama Khadijah"
      };
    });
  }, [kelasList, classList, santriList, userList, absensiList]);

  const filteredClasses = useMemo(() => {
    return enrichedClasses.filter((c) => {
      const matchGender = selectedGender === "ALL" || c.gender === selectedGender;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.waliKelas.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGender && matchSearch;
    });
  }, [enrichedClasses, selectedGender, searchQuery]);

  const totalSantriCount = santriList.length;
  const putraCount = santriList.filter((s) => s.gender === "Putra").length;
  const putriCount = santriList.filter((s) => s.gender === "Putri").length;

  const handleDownloadClassBulk = async (cls: ClassRaporCardItem) => {
    const studentsInClass = santriList.filter(
      (s) => s.class.toUpperCase() === cls.name.toUpperCase()
    );
    if (studentsInClass.length === 0) {
      showToast(`Tidak ada santri di Kelas ${cls.name}`, "error");
      return;
    }

    try {
      setDownloadingClassId(cls.name);
      await generateClassBulkPdf(cls.name, studentsInClass, penilaianList, absensiList);
      showToast(`Rapor lengkap Kelas ${cls.name} (${studentsInClass.length} santri) berhasil diunduh.`, "success");
    } catch {
      showToast(`Gagal mengunduh rapor Kelas ${cls.name}`, "error");
    } finally {
      setDownloadingClassId(null);
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 sm:space-y-5 pb-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              Pusat Rapor Akhlak & Prestasi Santri
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Pilih kelas untuk melihat peringkat santri, statistik adab & sholat, serta unduh rapor buku kendali per kelas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <CardSub className="p-3.5 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
              Total Kelas
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#172033] mt-0.5 block">
              {enrichedClasses.length}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
              Kelas 1 s/d Kelas 6
            </span>
          </CardSub>

          <CardSub className="p-3.5 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
              Total Santri
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#1B4D3E] mt-0.5 block">
              {totalSantriCount}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
              Santri Aktif Terdata
            </span>
          </CardSub>

          <CardSub className="p-3.5 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
              Santri Putra (L)
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#065F46] mt-0.5 block">
              {putraCount}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
              Kelas 1A, 2A, 3A, 4A, 5A, 6A
            </span>
          </CardSub>

          <CardSub className="p-3.5 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
              Santri Putri (P)
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#A8833E] mt-0.5 block">
              {putriCount}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
              Kelas 1B, 2B, 3B, 4B, 5B, 6B
            </span>
          </CardSub>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(["ALL", "Putra", "Putri"] as const).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setSelectedGender(gender)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedGender === gender
                    ? "bg-[#1B4D3E] text-white shadow-2xs"
                    : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE]"
                }`}
              >
                {gender === "ALL" ? "Semua" : gender === "Putra" ? "L" : "P"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari kelas atau wali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs font-semibold bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {filteredClasses.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-[#E2EBF4] p-6 space-y-2">
              <GraduationCap className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
              <h3 className="text-sm font-bold text-[#172033]">Kelas Tidak Ditemukan</h3>
              <p className="text-xs text-[#64748B]">
                Tidak ada kelas yang sesuai dengan kata kunci pencarian atau filter gender.
              </p>
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const defaultAvatar =
                cls.gender === "Putri"
                  ? "/default-avatar-ustadzah.jpg"
                  : "/default-avatar-ustadz.jpg";
              const classPhoto = cls.waliAvatar || defaultAvatar;
              const isDownloadingThis = downloadingClassId === cls.name;

              return (
                <div
                  key={cls.id}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E2EBF4] shadow-2xs hover:shadow-2xl hover:border-[#1B4D3E]/40 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between text-left"
                >
                  <Link
                    href={`/admin/rapor/${cls.name}`}
                    className="sheen-wrapper relative w-full aspect-square overflow-hidden bg-[#0E271F] shrink-0 cursor-pointer block"
                    title={`Lihat Rapor Kelas ${cls.name}`}
                  >
                    <img
                      src={classPhoto}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== defaultAvatar && !target.src.endsWith(defaultAvatar)) {
                          target.src = defaultAvatar;
                        }
                      }}
                      alt={`Wali Kelas ${cls.name}`}
                      className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
                  </Link>

                  <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 bg-white space-y-2.5">
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono font-black bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20 whitespace-nowrap">
                          Kelas {cls.name}
                        </span>
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[9px] sm:text-[10px] font-bold border shrink-0 ${
                            cls.gender === "Putra"
                              ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                              : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                          }`}
                        >
                          {cls.gender === "Putra" ? "L" : "P"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-[#C5A059] block">
                          Wali Kelas
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-[#172033] group-hover:text-[#1B4D3E] transition-colors truncate mt-0.5">
                          {cls.waliKelas}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-[#64748B] flex items-center gap-1 pt-0.5 truncate">
                          <Building2 className="w-3 h-3 text-[#C5A059] shrink-0" />
                          <span>{cls.studentCount} Santri Terdaftar</span>
                        </p>
                        {cls.pendampingWali && (
                          <p className="text-[9px] text-[#065F46] font-semibold truncate pt-0.5">
                            Pendamping: {cls.pendampingWali}
                          </p>
                        )}
                        {cls.asistenWali && cls.asistenWali.length > 0 && (
                          <p className="text-[9px] text-[#A8833E] font-medium truncate pt-0.5" title={cls.asistenWali.join(", ")}>
                            {cls.asistenWali.length} Asisten Belajar Malam
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-[#64748B] font-medium">Rerata Skor</span>
                      <span className="font-mono font-bold text-[#1B4D3E] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 sm:px-2 py-0.5 rounded-lg shadow-2xs">
                        {cls.avgScore.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5 sm:pt-1">
                      <Link
                        href={`/admin/rapor/${cls.name}`}
                        className="py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#FAF7EE] text-[#A8833E] hover:bg-[#F3EBD8] border border-[#C5A059]/40 text-[10px] sm:text-xs font-bold text-center transition-all shadow-2xs active:scale-95 cursor-pointer truncate flex items-center justify-center gap-1"
                      >
                        <span>Detail</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDownloadClassBulk(cls)}
                        disabled={isDownloadingThis || cls.studentCount === 0}
                        className="py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] disabled:opacity-50 text-[10px] sm:text-xs font-bold text-center transition-all shadow-2xs active:scale-95 cursor-pointer truncate flex items-center justify-center gap-1"
                        title="Unduh seluruh rapor santri di kelas ini"
                      >
                        {isDownloadingThis ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        <span>Unduh PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </RoleShell>
  );
}
