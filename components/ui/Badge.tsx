"use client";

import React from "react";

export type BadgeVariant =
  | "hasanah"
  | "sayyiah"
  | "ringan"
  | "sedang"
  | "berat"
  | "baik"
  | "perhatian"
  | "pembinaan"
  | "sudah-lapor"
  | "laporan-nihil"
  | "belum-lapor"
  | "neutral"
  | "gold";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = ""
}: BadgeProps) {
  const sizeClasses =
    size === "sm" ? "px-2.5 py-0.5 text-[10px] font-bold" : "px-3 py-1 text-xs font-bold";

  let colorClasses = "bg-[#FAF7F2] text-[#64748B] border border-[#E2EBF4]";

  switch (variant) {
    case "hasanah":
    case "baik":
    case "sudah-lapor":
      colorClasses = "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]";
      break;
    case "sayyiah":
    case "berat":
    case "pembinaan":
    case "belum-lapor":
      colorClasses = "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]";
      break;
    case "sedang":
    case "perhatian":
      colorClasses = "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]";
      break;
    case "ringan":
    case "laporan-nihil":
      colorClasses = "bg-[#FEFCE8] text-[#854D0E] border border-[#FEF08A]";
      break;
    case "gold":
      colorClasses = "bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/40";
      break;
    case "neutral":
    default:
      colorClasses = "bg-[#FAF7F2] text-[#64748B] border border-[#E2EBF4]";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full tracking-tight ${sizeClasses} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
}
