"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  Award,
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Phone,
  User,
  Scale
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { generateSantriPdf } from "@/lib/pdf-generator";
import { ShareModal } from "@/components/ShareModal";

function BkSantriDetailContent() {
  const router = useRouter();
  const params = useParams();
  const santriId = (params?.id as string) || "";

  const { santriList, penilaianList, absensiList, showToast } = useMizan();
  const [printDate, setPrintDate] = useState("1 November 2026");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [penilaianPage, setPenilaianPage] = useState(1);
  const [absensiPage, setAbsensiPage] = useState(1);
  const PENILAIAN_PAGE_SIZE = 6;
  const ABSENSI_PAGE_SIZE = 10;

  useEffect(() => {
    try {
      setPrintDate(
        new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      );
    } catch {
      void 0;
    }
  }, []);

  const santri = santriList.find((s) => s.id === santriId) || santriList[0];

  const studentPenilaian = penilaianList.filter((p) => p.santriId === santri?.id);
  const studentAbsensi = absensiList.filter((a) => a.santriId === santri?.id);

  const totalPenilaianPages = Math.ceil(studentPenilaian.length / PENILAIAN_PAGE_SIZE) || 1;
  const paginatedPenilaian = useMemo(() => {
    const start = (penilaianPage - 1) * PENILAIAN_PAGE_SIZE;
    return studentPenilaian.slice(start, start + PENILAIAN_PAGE_SIZE);
  }, [studentPenilaian, penilaianPage]);

  const totalAbsensiPages = Math.ceil(studentAbsensi.length / ABSENSI_PAGE_SIZE) || 1;
  const paginatedAbsensi = useMemo(() => {
    const start = (absensiPage - 1) * ABSENSI_PAGE_SIZE;
    return studentAbsensi.slice(start, start + ABSENSI_PAGE_SIZE);
  }, [studentAbsensi, absensiPage]);

  const totalHasanah = studentPenilaian
    .filter((p) => p.type === "HASANAH")
    .reduce((sum, p) => sum + Math.abs(p.score), 0);

  const totalSayyiah = studentPenilaian
    .filter((p) => p.type === "SAYYIAH")
    .reduce((sum, p) => sum + Math.abs(p.score), 0);

  const formatScore = (score: number) => {
    return score.toFixed(3).replace(".", ",");
  };

  const formatScoreWithSign = (score: number) => {
    const formatted = Math.abs(score).toFixed(3).replace(".", ",");
    return score >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const getPredikat = (score: number) => {
    if (score >= 90) return { label: "MUMTAZ (ISTIMEWA)", color: "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]" };
    if (score >= 80) return { label: "JAYYID JIDDAN (SANGAT BAIK)", color: "text-[#1B4D3E] bg-[#E8F0EC] border-[#1B4D3E]/30" };
    if (score >= 70) return { label: "JAYYID (BAIK)", color: "text-[#854D0E] bg-[#FEFCE8] border-[#FEF08A]" };
    if (score >= 60) return { label: "MAQBUL (CUKUP)", color: "text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]" };
    return { label: "RASIB / PEMBINAAN", color: "text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]" };
  };

  const predikat = santri ? getPredikat(santri.currentScore) : getPredikat(70);

  const handlePrint = () => {
    window.print();
  };

  if (!santri) {
    return (
      <RoleShell>
        <div className="p-8 text-center mizan-card">
          <p className="text-sm font-bold text-[#172033]">Data santri tidak ditemukan</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#1B4D3E] text-white rounded-xl text-xs font-bold"
          >
            Kembali
          </button>
        </div>
      </RoleShell>
    );
  }

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36 print:p-0 print:m-0 print:max-w-none">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full mizan-btn-ghost text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1B4D3E] border border-[#A7F3D0] hover:bg-[#ECFDF5] text-xs font-bold shadow-2xs transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#C5A059]" />
              <span>Bagikan</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  showToast(`Menyiapkan rapor ${santri.name}...`, "info");
                  await generateSantriPdf(santri, studentPenilaian, studentAbsensi, printDate);
                  showToast(`Rapor ${santri.name} siap`, "success");
                } catch (err: unknown) {
                  if ((err as Error)?.name !== "AbortError") {
                    showToast("Gagal mengunduh rapor", "error");
                  }
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B4D3E] text-white text-xs font-bold shadow-md hover:bg-[#153e32] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full mizan-card bg-white text-[#172033] border border-[#CBD5E1] text-xs font-bold hover:bg-[#F8FAFC] transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        <div className="hidden print:block text-center border-b-2 border-[#1B4D3E] pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider text-[#1B4D3E]">
            Pondok Pesantren Mizan
          </h1>
          <p className="text-xs text-[#64748B]">
            Laporan Disiplin, Catatan Adab & Kehadiran Ibadah Santri
          </p>
          <p className="text-[10px] text-[#64748B] mt-1 font-mono">
            Dokumen Dicetak Pada: {printDate}
          </p>
        </div>

        <Card className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar
                initials={santri.avatar}
                size="lg"
                variant={santri.gender === "Putra" ? "primary" : "gold"}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-[#172033]">
                    {santri.name}
                  </h1>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${predikat.color}`}>
                    {predikat.label}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  NIS: <span className="font-mono font-semibold">{santri.nis}</span> • Kelas {santri.class} ({santri.gender})
                </p>
                <p className="text-xs text-[#A8833E] mt-0.5 font-medium">
                  {santri.kamar || santri.asrama}
                </p>
              </div>
            </div>

            <div className="sm:text-right w-full sm:w-auto p-3 sm:p-0 rounded-2xl bg-[#FAF7EE] sm:bg-transparent border border-[#C5A059]/20 sm:border-0 flex sm:flex-col justify-between items-center sm:items-end">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block">
                  Skor Akumulasi
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-[#1B4D3E]">
                  {formatScore(santri.currentScore)}
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] mt-0.5 block">
                Skor Dasar: 70,000
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <CardSub className="p-3 sm:p-4 text-center">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">
              Skor Dasar
            </span>
            <span className="font-mono text-base sm:text-lg font-black text-[#172033]">
              {formatScore(santri.baseScore || 70)}
            </span>
            <span className="text-[9px] text-[#94A3B8] block mt-0.5">Standar Baku</span>
          </CardSub>

          <CardSub className="p-3 sm:p-4 text-center">
            <span className="text-[10px] text-[#065F46] uppercase font-bold block mb-1">
              Apresiasi Hasanah
            </span>
            <span className="font-mono text-base sm:text-lg font-black text-[#065F46]">
              +{formatScore(totalHasanah)}
            </span>
            <span className="text-[9px] text-[#065F46] block mt-0.5">
              {studentPenilaian.filter((p) => p.type === "HASANAH").length} Catatan
            </span>
          </CardSub>

          <CardSub className="p-3 sm:p-4 text-center">
            <span className="text-[10px] text-[#991B1B] uppercase font-bold block mb-1">
              Pelanggaran Sayyi'ah
            </span>
            <span className="font-mono text-base sm:text-lg font-black text-[#991B1B]">
              -{formatScore(totalSayyiah)}
            </span>
            <span className="text-[9px] text-[#991B1B] block mt-0.5">
              {studentPenilaian.filter((p) => p.type === "SAYYIAH").length} Catatan
            </span>
          </CardSub>

          <CardSub className="p-3 sm:p-4 text-center">
            <span className="text-[10px] text-[#1B4D3E] uppercase font-bold block mb-1">
              Kehadiran Sholat
            </span>
            <span className="font-mono text-base sm:text-lg font-black text-[#1B4D3E]">
              {santri.totalHadir || 28} Hari
            </span>
            <span className="text-[9px] text-[#64748B] block mt-0.5">
              Alpa: {santri.totalAlpa || 0}
            </span>
          </CardSub>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#EEF2F6] pb-2.5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#1B4D3E]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#172033]">
                  Catatan Adab & Perilaku
                </h2>
              </div>
              <span className="text-[10px] font-bold text-[#64748B]">
                {studentPenilaian.length} Riwayat
              </span>
            </div>

            <div className="space-y-2">
              {paginatedPenilaian.map((p) => {
                const isHasanah = p.type === "HASANAH";
                return (
                  <CardInset key={p.id} className="p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isHasanah
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isHasanah ? "Hasanah" : "Sayyi'ah"}
                          </span>
                          <span className="text-[10px] font-bold text-[#172033]">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#172033] mt-1">
                          {p.unsurName || p.indicatorText}
                        </p>
                        {p.notes && (
                          <p className="text-[11px] text-[#64748B] mt-0.5 italic">
                            "{p.notes}"
                          </p>
                        )}
                        <p className="text-[9px] text-[#94A3B8] mt-1">
                          Dicatat oleh {p.guruName} • {p.createdAt}
                        </p>
                      </div>

                      <span
                        className={`font-mono text-xs font-black shrink-0 ${
                          isHasanah ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {formatScoreWithSign(p.score)}
                      </span>
                    </div>
                  </CardInset>
                );
              })}

              {studentPenilaian.length === 0 && (
                <div className="text-center py-8 text-[#94A3B8]">
                  <Award className="w-8 h-8 mx-auto mb-1 opacity-40" />
                  <p className="text-xs font-bold">Belum ada catatan sikap</p>
                </div>
              )}
            </div>

            <Pagination
              currentPage={penilaianPage}
              totalPages={totalPenilaianPages}
              onPageChange={setPenilaianPage}
              totalItems={studentPenilaian.length}
              itemsPerPage={PENILAIAN_PAGE_SIZE}
              itemName="catatan"
            />
          </Card>

          <Card className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#EEF2F6] pb-2.5">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#1B4D3E]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#172033]">
                  Presensi Sholat Berjamaah
                </h2>
              </div>
              <span className="text-[10px] font-bold text-[#64748B]">
                {studentAbsensi.length} Catatan
              </span>
            </div>

            <div className="space-y-2">
              {paginatedAbsensi.map((a) => {
                const isHadir = a.status === "Hadir";
                const isAlpa = a.status === "Alpa";
                return (
                  <CardInset key={a.id} className="p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#172033]">
                            Sholat {a.waktuSholat}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isHadir
                                ? "bg-emerald-100 text-emerald-800"
                                : isAlpa
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-0.5">
                          {a.date} • Dicatat: {a.guruName || "Pengasuhan"}
                        </p>
                      </div>

                      <span
                        className={`font-mono text-xs font-bold ${
                          a.scoreImpact < 0 ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {a.scoreImpact ? formatScoreWithSign(a.scoreImpact) : "0,000"}
                      </span>
                    </div>
                  </CardInset>
                );
              })}

              {studentAbsensi.length === 0 && (
                <div className="text-center py-8 text-[#94A3B8]">
                  <CalendarCheck className="w-8 h-8 mx-auto mb-1 opacity-40" />
                  <p className="text-xs font-bold">Belum ada log presensi sholat</p>
                </div>
              )}
            </div>

            <Pagination
              currentPage={absensiPage}
              totalPages={totalAbsensiPages}
              onPageChange={setAbsensiPage}
              totalItems={studentAbsensi.length}
              itemsPerPage={ABSENSI_PAGE_SIZE}
              itemName="presensi"
            />
          </Card>
        </div>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 border-b border-[#EEF2F6] pb-2.5 mb-3">
            <User className="w-4 h-4 text-[#1B4D3E]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#172033]">
              Informasi Wali Santri
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4]">
              <span className="text-[10px] text-[#64748B] block">Nama Wali</span>
              <p className="text-xs font-bold text-[#172033] mt-0.5">
                {santri.waliName || `Wali ${santri.name.split(" ")[0]}`}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4]">
              <span className="text-[10px] text-[#64748B] block">Kontak Telepon / WA</span>
              <p className="text-xs font-bold text-[#172033] mt-0.5 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-[#1B4D3E]" />
                {santri.waliPhone || "081234567890"}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4]">
              <span className="text-[10px] text-[#64748B] block">Asrama & Kamar</span>
              <p className="text-xs font-bold text-[#172033] mt-0.5">
                {santri.kamar || "Kamar Pondok"} ({santri.asrama || "Kampus Mahato"})
              </p>
            </div>
          </div>
        </Card>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          initialType="SANTRI"
          targetSantri={santri}
        />
      </div>
    </RoleShell>
  );
}

export default function BkSantriDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
          <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
        </div>
      }
    >
      <BkSantriDetailContent />
    </Suspense>
  );
}
