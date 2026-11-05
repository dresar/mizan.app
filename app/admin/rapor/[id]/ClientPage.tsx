"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Award,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Search,
  CheckCircle2,
  FileText,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { CardSub } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Santri } from "@/lib/mock-data";
import { generateSantriPdf, generateClassBulkPdf } from "@/lib/pdf-generator";

function getPredikatAdab(score: number): { label: string; badgeCls: string } {
  if (score >= 90) {
    return {
      label: "Mumtaz",
      badgeCls: "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
    };
  }
  if (score >= 80) {
    return {
      label: "Jayyid Jiddan",
      badgeCls: "bg-[#E8F0EC] text-[#1B4D3E] border border-[#1B4D3E]/30"
    };
  }
  if (score >= 70) {
    return {
      label: "Jayyid",
      badgeCls: "bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40"
    };
  }
  if (score >= 60) {
    return {
      label: "Maqbul",
      badgeCls: "bg-amber-50 text-amber-700 border border-amber-200"
    };
  }
  return {
    label: "Perlu Binaan",
    badgeCls: "bg-red-50 text-red-700 border border-red-200"
  };
}

export default function ClassRaporDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    kelasList,
    classList,
    santriList,
    userList,
    penilaianList,
    absensiList,
    showToast
  } = useMizan();

  const rawId = (params?.id as string) || "1A";
  const classId = decodeURIComponent(rawId).trim().toUpperCase();

  const [searchQuery, setSearchQuery] = useState("");
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [downloadingSantriId, setDownloadingSantriId] = useState<string | null>(null);

  const classData = useMemo(() => {
    const matchDb = classList.find((c) => c.name.toUpperCase() === classId);
    let defaultGender: "Putra" | "Putri" = "Putra";
    if (matchDb?.gender) {
      defaultGender = matchDb.gender;
    } else if (classId.endsWith("B") || classId.endsWith("C") || classId.endsWith("D")) {
      defaultGender = "Putri";
    }

    const assignedTeacher = userList.find(
      (u) => u.assignedClass?.toUpperCase() === classId && (u.role === "GURU" || u.role === "PENGASUHAN")
    );

    const defaultAvatar =
      defaultGender === "Putri"
        ? "/default-avatar-ustadzah.jpg"
        : "/default-avatar-ustadz.jpg";

    return {
      name: classId,
      gender: defaultGender,
      waliKelas: assignedTeacher?.name || matchDb?.waliKelas || "Ust. Pembina Kelas",
      waliAvatar: assignedTeacher?.avatarUrl || defaultAvatar,
      asrama: defaultGender === "Putra" ? "Asrama Salman Al-Farisi" : "Asrama Khadijah"
    };
  }, [classList, classId, userList]);

  const rankedStudents = useMemo(() => {
    const inClass = santriList.filter((s) => s.class.toUpperCase() === classId);

    const mapped = inClass.map((s) => {
      const sAbs = absensiList.filter((a) => a.santriId === s.id);
      const totalHadir = sAbs.filter((a) => a.status === "Hadir").length;
      const totalSholat = sAbs.length > 0 ? sAbs.length : 28;
      const safeHadir = s.totalHadir ?? 28;
      const sholatRate = sAbs.length > 0 ? (totalHadir / sAbs.length) * 100 : (safeHadir / 28) * 100;

      return {
        ...s,
        totalHadirCount: sAbs.length > 0 ? totalHadir : safeHadir,
        totalSholatCount: totalSholat,
        sholatRate: Math.min(100, Math.max(0, sholatRate))
      };
    });

    mapped.sort((a, b) => {
      if (b.currentScore !== a.currentScore) {
        return b.currentScore - a.currentScore;
      }
      if (b.sholatRate !== a.sholatRate) {
        return b.sholatRate - a.sholatRate;
      }
      return a.name.localeCompare(b.name);
    });

    return mapped.map((s, index) => ({
      ...s,
      rank: index + 1
    }));
  }, [santriList, classId, absensiList]);

  const filteredRankedStudents = useMemo(() => {
    if (!searchQuery.trim()) return rankedStudents;
    const q = searchQuery.toLowerCase();
    return rankedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        (s.waliName && s.waliName.toLowerCase().includes(q))
    );
  }, [rankedStudents, searchQuery]);

  const classStats = useMemo(() => {
    if (rankedStudents.length === 0) {
      return {
        avgScore: 70.0,
        avgSholat: 100.0,
        totalSantri: 0,
        highestScore: 70.0,
        lowestScore: 70.0
      };
    }

    const totalScore = rankedStudents.reduce((acc, s) => acc + s.currentScore, 0);
    const totalSholat = rankedStudents.reduce((acc, s) => acc + s.sholatRate, 0);

    return {
      avgScore: totalScore / rankedStudents.length,
      avgSholat: totalSholat / rankedStudents.length,
      totalSantri: rankedStudents.length,
      highestScore: rankedStudents[0]?.currentScore || 70.0,
      lowestScore: rankedStudents[rankedStudents.length - 1]?.currentScore || 70.0
    };
  }, [rankedStudents]);

  const handleDownloadSingle = async (santri: Santri) => {
    try {
      setDownloadingSantriId(santri.id);
      const sPenilaian = penilaianList.filter((p) => p.santriId === santri.id);
      const sAbsensi = absensiList.filter((a) => a.santriId === santri.id);
      await generateSantriPdf(santri, sPenilaian, sAbsensi);
      showToast(`Rapor PDF untuk ${santri.name} berhasil diunduh.`, "success");
    } catch {
      showToast("Gagal mengunduh rapor PDF", "error");
    } finally {
      setDownloadingSantriId(null);
    }
  };

  const handleDownloadClassBulk = async () => {
    if (rankedStudents.length === 0) {
      showToast("Tidak ada data santri untuk diunduh.", "error");
      return;
    }
    try {
      setIsBulkDownloading(true);
      await generateClassBulkPdf(classId, rankedStudents, penilaianList, absensiList);
      showToast(`Rapor lengkap seluruh santri Kelas ${classId} berhasil diunduh.`, "success");
    } catch {
      showToast("Gagal membuat berkas PDF gabungan", "error");
    } finally {
      setIsBulkDownloading(false);
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 sm:space-y-5 pb-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Link
              href="/admin/rapor"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Pusat Rapor Kelas</span>
            </Link>
            <div className="flex items-center gap-2 pt-1">
              <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
                Rapor & Peringkat Kelas {classId}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  classData.gender === "Putra"
                    ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                    : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                }`}
              >
                {classData.gender === "Putra" ? "L" : "P"}
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Rekapitulasi peringkat santri, skor adab akumulatif, dan unduhan rapor buku kendali per kelas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadClassBulk}
              disabled={isBulkDownloading || rankedStudents.length === 0}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#1B4D3E] text-white hover:bg-[#153e32] disabled:opacity-50 text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBulkDownloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Unduh PDF Semua Santri ({rankedStudents.length})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <CardSub className="p-3.5 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
              Total Santri
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#172033] mt-0.5 block">
              {classStats.totalSantri}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
              Santri / Santriwati
            </span>
          </CardSub>

          <CardSub className="p-3.5 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
              Rata-Rata Skor
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#1B4D3E] mt-0.5 block">
              {classStats.avgScore.toFixed(3).replace(".", ",")}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
              Skor Baku: 70,000
            </span>
          </CardSub>

          <CardSub className="p-3.5 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
              Rerata Sholat
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#065F46] mt-0.5 block">
              {classStats.avgSholat.toFixed(1).replace(".", ",")}%
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">
              Kehadiran 7 Waktu
            </span>
          </CardSub>

          <CardSub className="p-3.5 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
              Wali Kelas
            </span>
            <span className="text-xs sm:text-sm font-black text-[#172033] mt-1.5 block truncate">
              {classData.waliKelas}
            </span>
            <span className="text-[10px] text-[#C5A059] block mt-0.5 font-bold truncate">
              {classData.asrama}
            </span>
          </CardSub>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E2EBF4] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C5A059]" />
                <span>Peringkat & Lembar Rapor Santri</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Urutan peringkat santri dihitung dari akumulasi Skor Akhlak tertinggi dan kedisiplinan sholat.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Cari santri, NIS, atau wali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs font-semibold bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-16 text-center">Peringkat</th>
                  <th className="py-3 px-3.5">Santri</th>
                  <th className="py-3 px-3.5">NIS</th>
                  <th className="py-3 px-3.5">Wali Santri</th>
                  <th className="py-3 px-3.5 text-center">Sholat 7 Waktu</th>
                  <th className="py-3 px-3.5 text-right">Skor Akhir</th>
                  <th className="py-3 px-3.5 text-center">Predikat</th>
                  <th className="py-3 px-3.5 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EBF4]">
                {filteredRankedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#64748B]">
                      Tidak ada santri yang ditemukan di kelas ini.
                    </td>
                  </tr>
                ) : (
                  filteredRankedStudents.map((santri) => {
                    const pred = getPredikatAdab(santri.currentScore);
                    const defaultAvatar =
                      santri.gender === "Putri"
                        ? "/default-avatar-ustadzah.jpg"
                        : "/default-avatar-ustadz.jpg";
                    const santriPhoto = santri.avatarUrl || defaultAvatar;

                    return (
                      <tr key={santri.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                        <td className="py-3 px-3 text-center">
                          {santri.rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black font-mono border border-amber-300 shadow-2xs text-xs">
                              1
                            </span>
                          ) : santri.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-black font-mono border border-slate-300 shadow-2xs text-xs">
                              2
                            </span>
                          ) : santri.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-800 font-black font-mono border border-orange-300 shadow-2xs text-xs">
                              3
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-xs text-[#64748B]">
                              #{santri.rank}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={santriPhoto}
                              alt={santri.name}
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== defaultAvatar && !target.src.endsWith(defaultAvatar)) {
                                  target.src = defaultAvatar;
                                }
                              }}
                              className="w-9 h-9 rounded-xl object-cover border border-[#E2EBF4] shadow-2xs shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-[#172033] block truncate">
                                {santri.name}
                              </span>
                              <span className="text-[10px] text-[#64748B] block truncate">
                                {santri.asrama || "Asrama Pusat"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-xs text-[#64748B]">
                          {santri.nis}
                        </td>
                        <td className="py-3 px-3.5 text-xs text-[#64748B] truncate">
                          {santri.waliName || "Wali Santri"}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="font-mono font-bold text-xs text-[#172033] block">
                            {santri.sholatRate.toFixed(1).replace(".", ",")}%
                          </span>
                          <span className="text-[10px] text-[#64748B] block font-mono">
                            {santri.totalHadirCount}/{santri.totalSholatCount} Waktu
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <span className="font-mono font-bold text-xs text-[#1B4D3E] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-lg shadow-2xs">
                            {santri.currentScore.toFixed(3).replace(".", ",")}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pred.badgeCls}`}>
                            {pred.label}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(santri)}
                            disabled={downloadingSantriId === santri.id}
                            className="px-3 py-1.5 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] disabled:opacity-50 text-[11px] font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                          >
                            {downloadingSantriId === santri.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>Unduh PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
            {filteredRankedStudents.map((santri) => {
              const pred = getPredikatAdab(santri.currentScore);
              const defaultAvatar =
                santri.gender === "Putri"
                  ? "/default-avatar-ustadzah.jpg"
                  : "/default-avatar-ustadz.jpg";
              const santriPhoto = santri.avatarUrl || defaultAvatar;

              return (
                <div
                  key={santri.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] font-black font-mono text-xs shrink-0">
                        #{santri.rank}
                      </span>
                      <img
                        src={santriPhoto}
                        alt={santri.name}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== defaultAvatar && !target.src.endsWith(defaultAvatar)) {
                            target.src = defaultAvatar;
                          }
                        }}
                        className="w-10 h-10 rounded-xl object-cover border border-[#E2EBF4] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#172033] truncate">
                          {santri.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#64748B] block">
                          NIS: {santri.nis}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${pred.badgeCls}`}>
                      {pred.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2EBF4] text-center">
                    <div>
                      <span className="text-[9px] text-[#64748B] block">Skor Akhlak</span>
                      <span className="text-xs font-black font-mono text-[#1B4D3E]">
                        {santri.currentScore.toFixed(3).replace(".", ",")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">Sholat 7 Waktu</span>
                      <span className="text-xs font-black font-mono text-[#065F46]">
                        {santri.sholatRate.toFixed(1).replace(".", ",")}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(santri)}
                    disabled={downloadingSantriId === santri.id}
                    className="w-full py-2 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] disabled:opacity-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                  >
                    {downloadingSantriId === santri.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Unduh PDF Rapor</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
