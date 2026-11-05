"use client";

import React, { useRef, useState } from "react";
import { Download, QrCode, CheckCircle2, ShieldCheck, Printer, X } from "lucide-react";
import { PerizinanRecord } from "@/lib/mock-data";

interface QrPassCardProps {
  record: PerizinanRecord;
  onClose?: () => void;
}

export function QrPassCard({ record, onClose }: QrPassCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(record.qrCodeToken)}`;

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 760;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#FAF7EE";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#1B4D3E";
      ctx.fillRect(0, 0, canvas.width, 110);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PONDOK PESANTREN MIZAN", canvas.width / 2, 45);

      ctx.fillStyle = "#C5A059";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("KARTU IZIN DIGITAL SANTRI (POS GERBANG)", canvas.width / 2, 75);

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(40, 130, 520, 580, 24);
      ctx.fill();

      ctx.strokeStyle = "#E2EBF4";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#172033";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(record.santriName, canvas.width / 2, 175);

      ctx.fillStyle = "#64748B";
      ctx.font = "14px monospace";
      ctx.fillText(`Kelas: ${record.santriClass}  •  Gender: ${record.gender}`, canvas.width / 2, 202);

      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = qrImageUrl;

      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => reject();
      });

      ctx.drawImage(qrImg, (canvas.width - 200) / 2, 225, 200, 200);

      ctx.fillStyle = "#FAF7EE";
      ctx.beginPath();
      ctx.roundRect(80, 440, 440, 40, 10);
      ctx.fill();

      ctx.fillStyle = "#854D0E";
      ctx.font = "bold 14px monospace";
      ctx.fillText(record.qrCodeToken, canvas.width / 2, 465);

      ctx.fillStyle = "#065F46";
      ctx.beginPath();
      ctx.roundRect(200, 495, 200, 32, 16);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`STATUS: ${record.status}`, canvas.width / 2, 516);

      ctx.fillStyle = "#172033";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Jenis Izin : ${record.jenisIzin}`, 80, 560);
      ctx.fillText(`Jadwal     : ${record.tglKeluar} s/d ${record.tglKembali}`, 80, 590);
      if (record.alasan) {
        ctx.fillText(`Alasan     : ${record.alasan}`, 80, 620);
      }
      ctx.fillText(`Petugas    : ${record.diajukanOleh}`, 80, 650);

      ctx.textAlign = "center";
      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px sans-serif";
      ctx.fillText("Tunjukkan kartu ber-QR Code ini ke Satpam pos jaga saat keluar & kembali.", canvas.width / 2, 690);

      const link = document.createElement("a");
      link.download = `Kartu-Izin-${record.santriName.replace(/\s+/g, "-")}-${record.qrCodeToken}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      window.open(qrImageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E2EBF4] shadow-lg space-y-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4]">
        <div className="flex items-center gap-2 text-[#1B4D3E]">
          <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          <span className="text-xs font-bold uppercase tracking-wider">Kartu Izin Resmi Pos Gerbang</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div ref={cardRef} className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30 text-center space-y-3">
        <div>
          <h4 className="text-sm font-bold text-[#172033]">{record.santriName}</h4>
          <p className="text-[10px] text-[#64748B] font-mono">Kelas {record.santriClass} • {record.gender}</p>
        </div>

        <div className="p-2.5 bg-white rounded-xl inline-block border border-[#E2E8F0] shadow-2xs">
          <img
            src={qrImageUrl}
            alt={`QR Code ${record.qrCodeToken}`}
            className="w-40 h-40 object-contain mx-auto"
          />
        </div>

        <div>
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#C5A059]/40 text-[#854D0E] font-mono text-xs font-bold block">
            {record.qrCodeToken}
          </span>
          <span className="text-[10px] text-[#065F46] font-bold block mt-1.5">
            Status: {record.status}
          </span>
        </div>

        <div className="text-[11px] text-left pt-2 border-t border-[#D4C9B5]/40 space-y-1">
          <p className="flex justify-between">
            <span className="text-[#94A3B8]">Jenis:</span>
            <span className="font-bold text-[#172033]">{record.jenisIzin}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-[#94A3B8]">Jadwal:</span>
            <span className="font-medium text-[#172033]">{record.tglKeluar} - {record.tglKembali}</span>
          </p>
          {record.alasan && (
            <p className="flex justify-between">
              <span className="text-[#94A3B8]">Alasan:</span>
              <span className="font-medium text-[#172033] truncate max-w-[180px]">{record.alasan}</span>
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownloadImage}
        disabled={isDownloading}
        className="w-full py-2.5 px-3 rounded-2xl bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Download className="w-4 h-4 text-[#C5A059]" />
        <span>{isDownloading ? "Menyiapkan Berkas..." : "Unduh Gambar Kartu QR (.png)"}</span>
      </button>
    </div>
  );
}
