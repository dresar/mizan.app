"use client";

import React, { useState, useEffect, Suspense } from "react";
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
import { generateSantriPdf } from "@/lib/pdf-generator";
import { ShareModal } from "@/components/ShareModal";

function SantriDetailContent() {
  const router = useRouter();
  const params = useParams();
  const santriId = (params?.id as string) || "santri-1";

  const { santriList, penilaianList, absensiList } = useMizan();
  const [printDate, setPrintDate] = useState("31 Oktober 2026");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  const fallbackSantri = {
    id: "santri-1",
    nis: "20240801",
    name: "Muhammad Zaki Pratama",
    gender: "Putra" as const,
    class: "1A",
    baseScore: 70.0,
    currentScore: 84.450,
    status: "Baik" as const,
    avatar: "MZ",
    waliName: "H. Pratama",
    waliPhone: "081234567891",
    totalHadir: 28,
    totalAlpa: 1
  };

  const santri = santriList.find((s) => s.id === santriId) || santriList[0] || fallbackSantri;

  const studentPenilaian = penilaianList.filter((p) => p.santriId === santri?.id);
  const studentAbsensi = absensiList.filter((a) => a.santriId === santri?.id);

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
        <div className="p-8 text-center space-y-3">
          <p className="text-sm font-bold text-[#64748B]">Santri tidak ditemukan.</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-full mizan-btn-primary text-xs font-bold"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1B4D3E] border border-[#A7F3D0] hover:bg-[#ECFDF5] text-xs font-bold shadow-xs transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#C5A059]" />
              <span>Bagikan</span>
            </button>

            <button
              type="button"
              onClick={() => generateSantriPdf(santri, studentPenilaian, studentAbsensi, printDate)}
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

        <div className="hidden print:block text-center pb-4 border-b-2 border-[#1B4D3E] mb-4">
          <h2 className="text-xl font-bold font-serif text-[#1B4D3E]">
            PONDOK PESANTREN MODERN RAUDHATUSSALAM MAHATO
          </h2>
          <p className="text-xs text-gray-600">
            LEMBAR REKAPITULASI SIKAP, ADAB, DAN KEDISIPLINAN SANTRI
          </p>
        </div>

        <Card className="p-4 sm:p-6 bg-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 rounded-3xl mizan-card flex items-center justify-center shrink-0">
              <Avatar
                initials={santri.avatar}
                size="xl"
                variant={santri.gender === "Putra" ? "primary" : "gold"}
              />
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033]">
                    {santri.name}
                  </h1>
                  <p className="text-xs font-bold text-[#64748B] mt-0.5">
                    NIS: {santri.nis} • Kelas {santri.class} • {santri.gender === "Putra" ? "Santri Putra" : "Santriwati Putri"}
                  </p>
                </div>

                <div className="shrink-0">
                  <span className={`text-xs font-black px-3 py-1 rounded-full mizan-pill inline-block border ${predikat.color}`}>
                    {predikat.label}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E2EBF4] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <CardInset className="p-2.5 text-center">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                    Skor Akhlak
                  </span>
                  <span className="text-sm font-black font-mono text-[#1B4D3E] block mt-0.5">
                    {formatScore(santri.currentScore)} / 99,000
                  </span>
                </CardInset>

                <CardInset className="p-2.5 text-center">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                    Akumulasi (+)
                  </span>
                  <span className="text-sm font-black font-mono text-[#065F46] block mt-0.5">
                    +{formatScore(totalHasanah)}
                  </span>
                </CardInset>

                <CardInset className="p-2.5 text-center">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                    Akumulasi (-)
                  </span>
                  <span className="text-sm font-black font-mono text-[#991B1B] block mt-0.5">
                    -{formatScore(totalSayyiah)}
                  </span>
                </CardInset>

                <CardInset className="p-2.5 text-center">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                    Kehadiran
                  </span>
                  <span className="text-sm font-black font-mono text-[#172033] block mt-0.5">
                    {santri.totalHadir || 0} Hari ({santri.totalAlpa || 0} Alpa)
                  </span>
                </CardInset>
              </div>

              <div className="mt-3 text-[11px] text-[#64748B] flex items-center justify-between flex-wrap gap-2">
                <span>Wali: {santri.waliName || "Bapak Santri"}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-[#1B4D3E]" />
                  {santri.waliPhone || "0812-xxxx-xxxx"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#1B4D3E]" />
              Riwayat Catatan Perilaku ({studentPenilaian.length})
            </span>
          </div>

          {studentPenilaian.length === 0 ? (
            <CardInset className="p-4 text-center text-xs text-[#64748B]">
              Belum ada catatan pelanggaran atau prestasi khusus yang tercatat.
            </CardInset>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {studentPenilaian.map((item) => (
                <CardSub key={item.id} className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full mizan-pill ${
                        item.type === "HASANAH"
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : "bg-[#FEF2F2] text-[#991B1B]"
                      }`}
                    >
                      {formatScoreWithSign(item.score)}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">{item.createdAt}</span>
                  </div>
                  <p className="text-xs font-bold text-[#172033] line-clamp-2">
                    {item.indicatorText}
                  </p>
                  {item.notes && (
                    <p className="text-[11px] text-[#64748B] italic">
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                  <span className="text-[10px] text-[#A8833E] font-medium block">
                    Pencatat: {item.guruName}
                  </span>
                </CardSub>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-[#1B4D3E]" />
              Riwayat Absensi Harian ({studentAbsensi.length})
            </span>
          </div>

          {studentAbsensi.length === 0 ? (
            <CardInset className="p-4 text-center text-xs text-[#64748B]">
              Belum ada data absensi individual.
            </CardInset>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {studentAbsensi.map((abs) => (
                <CardSub key={abs.id} className="p-2.5 text-center">
                  <span className="text-[10px] text-[#94A3B8] block">{abs.date}</span>
                  <span
                    className={`text-xs font-bold block mt-0.5 ${
                      abs.status === "Hadir"
                        ? "text-[#065F46]"
                        : abs.status === "Alpa"
                        ? "text-[#991B1B]"
                        : "text-[#854D0E]"
                    }`}
                  >
                    {abs.status} ({formatScoreWithSign(abs.scoreImpact)})
                  </span>
                </CardSub>
              ))}
            </div>
          )}
        </Card>

        <div className="hidden print:block pt-8 text-xs text-right space-y-12">
          <div>
            <p>Mahato, {printDate}</p>
            <p className="font-bold">Pengasuhan Pondok Pesantren</p>
          </div>
          <div className="pt-8">
            <p className="font-bold underline">( Ust. H. Ahmad Syukri, Lc. )</p>
            <p className="text-[10px]">Super Admin Pengasuhan MIZAN</p>
          </div>
        </div>

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

export default function SantriDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 text-xs text-[#5C6B64]">
          Memuat profil santri...
        </div>
      }
    >
      <SantriDetailContent />
    </Suspense>
  );
}
