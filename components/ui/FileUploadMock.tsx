"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileCheck, X, AlertCircle } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

interface FileUploadMockProps {
  onFileChange?: (fileInfo: { name: string; size: number } | null) => void;
  className?: string;
}

export function FileUploadMock({ onFileChange, className = "" }: FileUploadMockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; isImage: boolean } | null>(null);
  const { showToast } = useMizan();

  const MAX_BYTES = 5 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      showToast("File melebihi 5 MB. Silakan pilih file lebih kecil.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const isImage = file.type.startsWith("image/");
    const info = { name: file.name, size: file.size, isImage };
    setSelectedFile(info);
    if (onFileChange) onFileChange({ name: file.name, size: file.size });
    showToast("Bukti lampiran berhasil dipilih", "info");
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onFileChange) onFileChange(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload-input"
      />

      {!selectedFile ? (
        <label
          htmlFor="file-upload-input"
          className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#D4C9B5] rounded-2xl bg-[#FAF7F2] hover:bg-[#F5F1E8] cursor-pointer transition-colors text-center"
        >
          <UploadCloud className="w-7 h-7 text-[#1B4D3E] mb-2" />
          <span className="text-xs font-semibold text-[#1C2826]">
            Unggah Foto atau Video Bukti
          </span>
          <span className="text-[11px] text-[#5C6B64] mt-1">
            Format file gambar atau video. Maksimal 5 MB.
          </span>
          <span className="text-[10px] text-[#8A968F] mt-0.5">
            Foto/video hanya sebagai bukti pendukung.
          </span>
        </label>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-2xl border border-[#1B4D3E]/30 bg-[#E8F0EC]/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-[#1B4D3E] text-white flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1C2826] truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-[#5C6B64]">
                {formatFileSize(selectedFile.size)} • Siap dilampirkan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-[#9B2C2C] hover:bg-[#FDF2F2] transition-colors"
            title="Hapus lampiran"
            aria-label="Hapus file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
