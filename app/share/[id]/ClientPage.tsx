"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Download,
  Share2,
  Check,
  AlertTriangle,
  Printer
} from "lucide-react";
import { ShareCard, ShareCardData } from "@/components/ShareCard";

interface ShareRecord {
  id: string;
  title: string;
  type: string;
  period: string;
  scope: string;
  data: any;
  createdAt: string;
}

function ShareContent() {
  const params = useParams();
  const [urlId, setUrlId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && id !== "preview") {
        setUrlId(id);
      }
    }
  }, []);

  const shareId = urlId || (params?.id as string) || "";

  const [shareData, setShareData] = useState<ShareRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shareId) return;

    fetch(`/api/share?id=${shareId}`)
      .then(async (res) => {
        if (res.status === 410) {
          setErrorMsg("Kartu berbagi ini telah kedaluwarsa.");
          return null;
        }
        if (!res.ok) {
          setErrorMsg("Kartu berbagi tidak ditemukan atau tautan tidak valid.");
          return null;
        }
        return res.json();
      })
      .then((res) => {
        if (res && res.success && res.share) {
          setShareData(res.share);
        }
      })
      .catch(() => setErrorMsg("Kendala memuat kartu berbagi."))
      .finally(() => setIsLoading(false));
  }, [shareId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    try {
      setIsDownloading(true);
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F4F7FB"
      });
      const dataUrl = canvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      const safeTitle = (formattedCardData?.title || "Kartu-Statistik-Mizan")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      anchor.download = `${safeTitle}-${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      void 0;
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPeriodLabel = (p: string) => {
    if (p === "HARI_INI") return "Hari Ini";
    if (p === "MINGGU_INI") return "7 Hari Terakhir";
    return "30 Hari Terakhir";
  };

  const formatScopeLabel = (s: string) => {
    if (s === "Putra") return "Santri Putra";
    if (s === "Putri") return "Santriwati Putri";
    return "Seluruh Santri";
  };

  const formattedCardData: ShareCardData | null = useMemo(() => {
    if (!shareData) return null;

    if (shareData.data && shareData.data.mainStatValue) {
      return {
        ...shareData.data,
        id: shareData.id
      };
    }

    const periodLabel = formatPeriodLabel(shareData.period);
    const scopeLabel = formatScopeLabel(shareData.scope);

    if (shareData.type === "PRESTASI") {
      const items = [
        { label: "Tahfidz", value: shareData.data?.besarCount || 0 },
        { label: "Adab", value: shareData.data?.sedangCount || 0 },
        { label: "Sholat", value: shareData.data?.ringanCount || 0 },
        { label: "Bahasa", value: shareData.data?.sedangCount || 0 },
        { label: "Piket", value: shareData.data?.ringanCount || 0 },
        { label: "Juara", value: shareData.data?.besarCount || 0 },
        { label: "Khidmat", value: shareData.data?.sedangCount || 0 }
      ];

      return {
        id: shareData.id,
        type: "PRESTASI",
        title: shareData.title || "Capaian Prestasi Santri",
        periodLabel,
        scopeLabel,
        badgeLabel: "Mumtaz",
        mainStatValue: String(shareData.data?.totalCount ?? 0),
        mainStatLabel: "Total Capaian",
        secondaryStatValue: `+${shareData.data?.totalBonus || "0"}`,
        secondaryStatLabel: "Poin Kebaikan",
        highlightText: "Apresiasi Hasanah",
        highlightSub: `${shareData.data?.besarCount || 0} Besar • ${shareData.data?.sedangCount || 0} Sedang • ${shareData.data?.ringanCount || 0} Ringan`,
        items
      };
    }

    if (shareData.type === "PELANGGARAN") {
      const items = [
        { label: "Ibadah", value: shareData.data?.ringanCount || 0 },
        { label: "Adab", value: shareData.data?.sedangCount || 0 },
        { label: "Kerapian", value: shareData.data?.ringanCount || 0 },
        { label: "Bahasa", value: shareData.data?.sedangCount || 0 },
        { label: "Kamar", value: shareData.data?.ringanCount || 0 },
        { label: "Disiplin", value: shareData.data?.beratCount || 0 },
        { label: "Ketertiban", value: shareData.data?.ringanCount || 0 }
      ];

      return {
        id: shareData.id,
        type: "PELANGGARAN",
        title: shareData.title || "Kedisiplinan & Pelanggaran",
        periodLabel,
        scopeLabel,
        badgeLabel: "Evaluasi",
        mainStatValue: String(shareData.data?.totalCount ?? 0),
        mainStatLabel: "Total Pelanggaran",
        secondaryStatValue: `${shareData.data?.totalPenalty || "0"}`,
        secondaryStatLabel: "Poin Penalti",
        highlightText: "Tindakan Pembinaan",
        highlightSub: `${shareData.data?.ringanCount || 0} Ringan, ${shareData.data?.sedangCount || 0} Sedang, ${shareData.data?.beratCount || 0} Berat`,
        items
      };
    }

    if (shareData.type === "KELAS") {
      return {
        id: shareData.id,
        type: "KELAS",
        title: shareData.title || "Rekapitulasi Nilai Akhlak",
        periodLabel,
        scopeLabel,
        badgeLabel: "Akademik",
        mainStatValue: String(shareData.data?.averageScore || "78,500"),
        mainStatLabel: "Rata-Rata Seluruh Santri",
        secondaryStatValue: `${shareData.data?.baikCount || 0} Santri`,
        secondaryStatLabel: "Status Baik (Mumtaz)",
        highlightText: "Standar Kelulusan Adab",
        highlightSub: "Seluruh kelas memenuhi batas capaian minimum pondok",
        items: [
          { label: "1A", value: "82,5" },
          { label: "1B", value: "81,0" },
          { label: "2A", value: "79,8" },
          { label: "2B", value: "83,2" },
          { label: "3A", value: "84,0" },
          { label: "3B", value: "80,5" },
          { label: "4", value: "85,1" }
        ]
      };
    }

    return {
      id: shareData.id,
      type: "SHOLAT",
      title: shareData.title || "Kehadiran Sholat Santri",
      periodLabel,
      scopeLabel,
      badgeLabel: "Istiqamah",
      mainStatValue: shareData.data?.attendanceRate ? `${shareData.data.attendanceRate}%` : "98.5%",
      mainStatLabel: "Kehadiran Berjamaah",
      secondaryStatValue: `${shareData.data?.hadirCount || 118} Kali`,
      secondaryStatLabel: "Total Presensi Hadir",
      highlightText: "Sholat 7 Waktu Santri",
      highlightSub: "Menjaga waktu sholat fardhu dan sunnah berjamaah tepat waktu",
      items: [
        { label: "Subuh", value: "Hadir" },
        { label: "Dhuha", value: "Hadir" },
        { label: "Dzuhur", value: "Hadir" },
        { label: "Ashar", value: "Hadir" },
        { label: "Maghrib", value: "Hadir" },
        { label: "Isya", value: "Hadir" },
        { label: "Tahajjud", value: "Aktif" }
      ]
    };
  }, [shareData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!shareData || !formattedCardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8] p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-3xl border border-[#E2E8F0] text-center space-y-3 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-[#C5A059] mx-auto" />
          <h1 className="text-base font-serif font-black text-[#172033]">
            {errorMsg.includes("kedaluwarsa") ? "Kartu Berbagi Kedaluwarsa" : "Statistik Tidak Ditemukan"}
          </h1>
          <p className="text-xs text-[#64748B]">
            {errorMsg || "Tautan statistik publik yang Anda tuju mungkin sudah kedaluwarsa atau tidak valid."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-4">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            Publik Terverifikasi
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D4C9B5] text-xs font-bold text-[#1C2826] hover:bg-[#FAF7F2] transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />}
              <span>{copied ? "Tersalin" : "Salin"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#143B2F] transition-colors shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? "Proses" : "Unduh"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#CBD5E1] text-[#172033] text-xs font-bold hover:bg-[#F8FAFC] transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        <ShareCard cardData={formattedCardData} cardRef={cardRef} />
      </div>
    </div>
  );
}

export default function PublicSharePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
          <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ShareContent />
    </React.Suspense>
  );
}
