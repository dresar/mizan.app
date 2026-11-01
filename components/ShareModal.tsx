"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Share2,
  Check,
  X,
  Download,
  Printer
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Santri, UserProfile } from "@/lib/mock-data";
import { ShareCard, ShareCardData } from "@/components/ShareCard";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "SHOLAT" | "PELANGGARAN" | "PRESTASI" | "KELAS" | "SANTRI" | "USTADZ";
  targetSantri?: Santri;
  targetUstadz?: UserProfile;
}

export function ShareModal({
  isOpen,
  onClose,
  initialType = "SHOLAT",
  targetSantri,
  targetUstadz
}: ShareModalProps) {
  const {
    santriList,
    penilaianList,
    absensiList,
    kelasList,
    showToast
  } = useMizan();

  const [shareType, setShareType] = useState<"SHOLAT" | "PELANGGARAN" | "PRESTASI" | "KELAS" | "SANTRI" | "USTADZ">(initialType);
  const [sharePeriod, setSharePeriod] = useState<"HARI_INI" | "MINGGU_INI" | "BULAN_INI">("HARI_INI");
  const [shareScope, setShareScope] = useState<"ALL" | "Putra" | "Putri">("ALL");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShare, setGeneratedShare] = useState<{ id: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setShareType(initialType);
      setGeneratedShare(null);
    }
  }, [isOpen, initialType]);

  const cardData: ShareCardData = useMemo(() => {
    const periodLabel =
      sharePeriod === "HARI_INI"
        ? "Hari Ini"
        : sharePeriod === "MINGGU_INI"
        ? "7 Hari Terakhir"
        : "30 Hari Terakhir";

    const scopeLabel =
      shareScope === "Putra"
        ? "Santri Putra"
        : shareScope === "Putri"
        ? "Santriwati Putri"
        : "Seluruh Santri";

    if (shareType === "SANTRI" && targetSantri) {
      const studentPenilaian = penilaianList.filter((p) => p.santriId === targetSantri.id);
      const studentAbsensi = absensiList.filter((a) => a.santriId === targetSantri.id);
      const hasanahCount = studentPenilaian.filter((p) => p.type === "HASANAH").length;
      const sayyiahCount = studentPenilaian.filter((p) => p.type === "SAYYIAH").length;

      const items = [
        { label: "Subuh", value: "Hadir" },
        { label: "Dhuha", value: "Hadir" },
        { label: "Dzuhur", value: "Hadir" },
        { label: "Ashar", value: "Hadir" },
        { label: "Maghrib", value: "Hadir" },
        { label: "Isya", value: "Hadir" },
        { label: "Tahajjud", value: "Aktif" }
      ];

      return {
        id: generatedShare?.id,
        type: "SANTRI",
        title: targetSantri.name,
        periodLabel: `Kelas ${targetSantri.class}`,
        scopeLabel: `NIS ${targetSantri.nis}`,
        badgeLabel: targetSantri.status === "Baik" ? "Mumtaz" : targetSantri.status,
        mainStatValue: targetSantri.currentScore.toFixed(3).replace(".", ","),
        mainStatLabel: "Skor Akhlak Adab",
        secondaryStatValue: `${targetSantri.totalHadir || 28} Hari`,
        secondaryStatLabel: "Kehadiran Sholat",
        highlightText: "Capaian Adab & Ibadah",
        highlightSub: `${hasanahCount} Prestasi Hasanah • ${sayyiahCount} Pelanggaran Sayyi'ah`,
        items
      };
    }

    if (shareType === "USTADZ" && targetUstadz) {
      const reportsCount = penilaianList.filter(
        (p) => p.guruId === targetUstadz.id || p.guruName === targetUstadz.name
      ).length;
      const classStudents = santriList.filter(
        (s) => s.class.toUpperCase() === targetUstadz.assignedClass?.toUpperCase()
      );

      const items = [
        { label: "Sen", value: "Aktif" },
        { label: "Sel", value: "Aktif" },
        { label: "Rab", value: "Aktif" },
        { label: "Kam", value: "Aktif" },
        { label: "Jum", value: "Piket" },
        { label: "Sab", value: "Aktif" },
        { label: "Min", value: "Kajian" }
      ];

      return {
        id: generatedShare?.id,
        type: "USTADZ",
        title: targetUstadz.name,
        periodLabel: `Pembina Santri ${targetUstadz.gender}`,
        scopeLabel: `Kelas ${targetUstadz.assignedClass || "Binaan"}`,
        badgeLabel: targetUstadz.gender === "Putri" ? "Ustadzah" : "Ustadz",
        mainStatValue: `${classStudents.length} Santri`,
        mainStatLabel: "Binaan Terdaftar",
        secondaryStatValue: `${reportsCount} Laporan`,
        secondaryStatLabel: "Catatan Pembinaan",
        highlightText: "Tugas Pengasuhan",
        highlightSub: "Membina kedisiplinan dan akhlak karimah santri pondok",
        items
      };
    }

    if (shareType === "PELANGGARAN") {
      const records = penilaianList.filter((p) => p.type === "SAYYIAH");
      const ringan = records.filter((p) => p.tingkat === "Ringan").length;
      const sedang = records.filter((p) => p.tingkat === "Sedang").length;
      const berat = records.filter((p) => p.tingkat === "Berat").length;
      const totalPenalty = records.reduce((acc, p) => acc + (p.score || 0), 0);

      const items = [
        { label: "Ibadah", value: ringan },
        { label: "Adab", value: sedang },
        { label: "Kerapian", value: ringan },
        { label: "Bahasa", value: sedang },
        { label: "Kamar", value: ringan },
        { label: "Disiplin", value: berat },
        { label: "Ketertiban", value: ringan }
      ];

      return {
        id: generatedShare?.id,
        type: "PELANGGARAN",
        title: "Kedisiplinan & Pelanggaran",
        periodLabel,
        scopeLabel,
        badgeLabel: "Evaluasi",
        mainStatValue: String(records.length),
        mainStatLabel: "Total Pelanggaran",
        secondaryStatValue: `${totalPenalty.toFixed(3).replace(".", ",")}`,
        secondaryStatLabel: "Poin Penalti",
        highlightText: "Tindakan Pembinaan",
        highlightSub: `${ringan} Ringan, ${sedang} Sedang, ${berat} Berat ditangani`,
        items
      };
    }

    if (shareType === "PRESTASI") {
      const records = penilaianList.filter((p) => p.type === "HASANAH");
      const ringan = records.filter((p) => p.tingkat === "Ringan").length;
      const sedang = records.filter((p) => p.tingkat === "Sedang").length;
      const besar = records.filter((p) => p.tingkat === "Berat").length;
      const totalBonus = records.reduce((acc, p) => acc + (p.score || 0), 0);

      const items = [
        { label: "Tahfidz", value: besar },
        { label: "Adab", value: sedang },
        { label: "Sholat", value: ringan },
        { label: "Bahasa", value: sedang },
        { label: "Piket", value: ringan },
        { label: "Juara", value: besar },
        { label: "Khidmat", value: sedang }
      ];

      return {
        id: generatedShare?.id,
        type: "PRESTASI",
        title: "Capaian Prestasi Santri",
        periodLabel,
        scopeLabel,
        badgeLabel: "Mumtaz",
        mainStatValue: String(records.length),
        mainStatLabel: "Total Capaian",
        secondaryStatValue: `+${totalBonus.toFixed(3).replace(".", ",")}`,
        secondaryStatLabel: "Poin Kebaikan",
        highlightText: "Apresiasi Hasanah",
        highlightSub: `${besar} Prestasi Besar • ${sedang} Sedang • ${ringan} Ringan`,
        items
      };
    }

    if (shareType === "KELAS") {
      const totalStudents = santriList.length || 1;
      const avgScore =
        santriList.reduce((acc, s) => acc + s.currentScore, 0) / totalStudents;
      const baik = santriList.filter((s) => s.status === "Baik").length;

      const items = kelasList.slice(0, 7).map((cls) => {
        const students = santriList.filter((s) => s.class.toUpperCase() === cls.toUpperCase());
        const avg =
          students.length > 0
            ? students.reduce((acc, s) => acc + s.currentScore, 0) / students.length
            : 70;
        return {
          label: cls,
          value: avg.toFixed(1).replace(".", ",")
        };
      });

      return {
        id: generatedShare?.id,
        type: "KELAS",
        title: "Rekapitulasi Nilai Akhlak",
        periodLabel,
        scopeLabel: `${kelasList.length} Kelas Aktif`,
        badgeLabel: "Akademik",
        mainStatValue: avgScore.toFixed(3).replace(".", ","),
        mainStatLabel: "Rata-Rata Seluruh Santri",
        secondaryStatValue: `${baik} Santri`,
        secondaryStatLabel: "Status Baik (Mumtaz)",
        highlightText: "Standar Kelulusan Adab",
        highlightSub: "Seluruh kelas memenuhi batas capaian minimum pondok",
        items
      };
    }

    const records = absensiList.filter((a) =>
      shareScope === "ALL" ? true : a.gender === shareScope
    );
    const hadir = records.filter((r) => r.status === "Hadir").length;
    const total = records.length || 1;
    const rate = ((hadir / total) * 100).toFixed(1);

    const prayers = ["Subuh", "Dhuha", "Dzuhur", "Ashar", "Maghrib", "Isya", "Tahajjud"];
    const items = prayers.map((p) => {
      const count = records.filter((r) => r.waktuSholat === p && r.status === "Hadir").length;
      return {
        label: p,
        value: count
      };
    });

    return {
      id: generatedShare?.id,
      type: "SHOLAT",
      title: "Kehadiran Sholat Santri",
      periodLabel,
      scopeLabel,
      badgeLabel: "Istiqamah",
      mainStatValue: `${rate}%`,
      mainStatLabel: "Kehadiran Berjamaah",
      secondaryStatValue: `${hadir} Kali`,
      secondaryStatLabel: "Total Presensi Hadir",
      highlightText: "Sholat 7 Waktu Santri",
      highlightSub: "Menjaga waktu sholat fardhu dan sunnah berjamaah",
      items
    };
  }, [
    shareType,
    sharePeriod,
    shareScope,
    targetSantri,
    targetUstadz,
    generatedShare,
    penilaianList,
    absensiList,
    santriList,
    kelasList
  ]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cardData.title,
          type: cardData.type,
          period: sharePeriod,
          scope: shareScope,
          data: cardData
        })
      });

      const resData = await res.json();
      if (resData.success && resData.share) {
        const publicUrl = `${window.location.origin}/share/${resData.share.id}`;
        setGeneratedShare({
          id: resData.share.id,
          url: publicUrl
        });
        showToast("Tautan publik berhasil dibuat", "success");
      }
    } catch {
      showToast("Gagal membuat tautan", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedShare) return;
    navigator.clipboard.writeText(generatedShare.url);
    setCopied(true);
    showToast("Tautan tersalin ke papan klip", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = async () => {
    if (!cardContainerRef.current || isDownloading) return;
    try {
      setIsDownloading(true);
      showToast("Menyiapkan berkas gambar kartu...", "info");
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardContainerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F4F7FB"
      });
      const dataUrl = canvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      const cleanTitle = (cardData.title || "Kartu-Statistik-Mizan")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      anchor.download = `${cleanTitle}-${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      showToast("Kartu berhasil diunduh", "success");
    } catch {
      showToast("Gagal mengunduh kartu", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-[28px] border border-[#E2E8F0] shadow-2xl p-4 sm:p-5 space-y-3.5 max-h-[92vh] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#1B4D3E]" />
            <h3 className="text-sm font-serif font-black text-[#172033]">
              Bagikan Kartu Statistik
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                Pilih Jenis Statistik
              </label>
              <select
                value={shareType}
                onChange={(e) => {
                  setShareType(e.target.value as any);
                  setGeneratedShare(null);
                }}
                className="w-full p-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E]"
              >
                <option value="SHOLAT">Kehadiran Sholat</option>
                <option value="PELANGGARAN">Pelanggaran</option>
                <option value="PRESTASI">Prestasi Santri</option>
                <option value="KELAS">Rekap Nilai Kelas</option>
                {targetSantri && <option value="SANTRI">Profil Santri</option>}
                {targetUstadz && <option value="USTADZ">Profil Ustadz</option>}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                Rentang Waktu
              </label>
              <select
                value={sharePeriod}
                onChange={(e) => {
                  setSharePeriod(e.target.value as any);
                  setGeneratedShare(null);
                }}
                className="w-full p-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E]"
              >
                <option value="HARI_INI">Sehari (Hari Ini)</option>
                <option value="MINGGU_INI">Seminggu (7 Hari)</option>
                <option value="BULAN_INI">Sebulan (30 Hari)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                Sasaran
              </label>
              <select
                value={shareScope}
                onChange={(e) => {
                  setShareScope(e.target.value as any);
                  setGeneratedShare(null);
                }}
                className="w-full p-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#172033] font-semibold focus:outline-none focus:border-[#1B4D3E]"
              >
                <option value="ALL">Semua Santri</option>
                <option value="Putra">Santri Putra</option>
                <option value="Putri">Santriwati Putri</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <ShareCard cardData={cardData} cardRef={cardContainerRef} compact={true} />
          </div>

          {generatedShare && (
            <div className="p-2.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedShare.url}
                className="flex-1 p-1.5 text-[11px] bg-white border border-[#A7F3D0] rounded-lg text-[#172033] font-mono select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-[#065F46] text-white text-xs font-bold hover:bg-[#047857] transition-colors shrink-0"
              >
                {copied ? "Tersalin" : "Salin"}
              </button>
              <Link
                href={`/share/${generatedShare.id}`}
                target="_blank"
                className="px-3 py-1.5 rounded-lg bg-white border border-[#A7F3D0] text-[#065F46] text-xs font-bold hover:bg-[#ECFDF5] transition-colors shrink-0"
              >
                Buka
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-[#D4C9B5] bg-white text-[#172033] text-xs font-bold hover:bg-[#FAF7F2] transition-colors shadow-2xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>{isDownloading ? "Proses" : "Unduh"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#CBD5E1] bg-white text-[#64748B] hover:text-[#172033] text-xs font-bold hover:bg-[#F8FAFC] transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>

          {!generatedShare ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-1.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] transition-colors shadow-xs disabled:opacity-50"
            >
              {isGenerating ? "Proses" : "Bagikan"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] transition-colors shadow-xs"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
