"use client";

import React from "react";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  HeartHandshake
} from "lucide-react";

export interface ShareCardData {
  id?: string;
  type: "SHOLAT" | "PELANGGARAN" | "PRESTASI" | "KELAS" | "SANTRI" | "USTADZ";
  title: string;
  subtitle?: string;
  periodLabel?: string;
  scopeLabel?: string;
  badgeLabel?: string;
  badgeIcon?: string;
  mainStatValue: string;
  mainStatLabel: string;
  secondaryStatValue: string;
  secondaryStatLabel: string;
  highlightText: string;
  highlightSub: string;
  items?: { label: string; value: string | number; icon?: string }[];
}

interface ShareCardProps {
  cardData: ShareCardData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  compact?: boolean;
}

export function ShareCard({ cardData, cardRef, compact = false }: ShareCardProps) {
  const {
    id,
    title,
    subtitle = "Pondok Pesantren Modern Raudhatussalam Mahato",
    periodLabel,
    scopeLabel,
    badgeLabel = "Terverifikasi",
    badgeIcon = "📈",
    mainStatValue,
    mainStatLabel,
    secondaryStatValue,
    secondaryStatLabel,
    highlightText,
    highlightSub,
    items = []
  } = cardData;

  return (
    <div
      ref={cardRef}
      className={`w-full max-w-md mx-auto bg-[#F4F7FB] border border-[#E2E8F0] shadow-xl shadow-slate-200/60 transition-all font-sans text-[#1E293B] ${
        compact ? "p-4 rounded-[24px] space-y-3" : "p-6 sm:p-7 rounded-[32px] space-y-4"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className={`font-black tracking-tight text-[#1E293B] ${compact ? "text-base" : "text-lg sm:text-xl"}`}>
            {title}
          </h2>
          <p className={`text-[#8A9BA8] font-medium mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>
            {periodLabel ? `${periodLabel} • ` : ""}
            {scopeLabel || subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-xs shrink-0">
          <span className="text-xs">{badgeIcon}</span>
          <span className="text-[11px] font-bold text-[#475569]">{badgeLabel}</span>
        </div>
      </div>

      <div className={`w-full bg-[#EBF0F7] rounded-[22px] border border-[#DEE5EF] shadow-inner ${compact ? "p-3" : "p-4"}`}>
        <div className="grid grid-cols-7 gap-1 text-center">
          {items.slice(0, 7).map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className={`flex items-center justify-center rounded-full bg-white shadow-xs ${compact ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"}`}>
                {item.icon || "✨"}
              </span>
              <span className="text-[9px] font-bold text-[#64748B] tracking-tight truncate w-full">
                {item.label}
              </span>
              <span className="text-[10px] font-black text-[#1E293B] font-mono">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`bg-white rounded-[20px] border border-[#E2E8F0] shadow-xs text-center flex flex-col justify-center ${compact ? "p-2.5" : "p-3.5"}`}>
          <span className={`font-black font-mono text-[#1B4D3E] tracking-tight block ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
            {mainStatValue}
          </span>
          <span className="text-[10px] font-bold text-[#8A9BA8] mt-0.5 uppercase tracking-wider block">
            {mainStatLabel}
          </span>
        </div>

        <div className={`bg-white rounded-[20px] border border-[#E2E8F0] shadow-xs text-center flex flex-col justify-center ${compact ? "p-2.5" : "p-3.5"}`}>
          <span className={`font-black font-mono text-[#065F46] tracking-tight block ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
            {secondaryStatValue}
          </span>
          <span className="text-[10px] font-bold text-[#8A9BA8] mt-0.5 uppercase tracking-wider block">
            {secondaryStatLabel}
          </span>
        </div>
      </div>

      <div className={`bg-white rounded-[20px] border border-[#E2E8F0] shadow-xs flex items-center gap-3 ${compact ? "p-2.5" : "p-3.5"}`}>
        <div className="w-9 h-9 rounded-full bg-[#FAF7EE] border border-[#C5A059]/40 flex items-center justify-center shrink-0 text-base">
          🌿
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-[#1E293B] block truncate">
            {highlightText}
          </span>
          <p className="text-[10px] text-[#8A9BA8] truncate mt-0.5 italic">
            &ldquo;{highlightSub}&rdquo;
          </p>
        </div>
      </div>

      {id && (
        <div className="pt-2 flex items-center justify-between text-[9px] text-[#94A3B8] border-t border-[#E2E8F0]">
          <div className="flex items-center gap-1 font-bold text-[#065F46]">
            <ShieldCheck className="w-3 h-3 text-[#065F46]" />
            <span>MIZAN Official</span>
          </div>
          <span className="font-mono">ID: {id}</span>
        </div>
      )}
    </div>
  );
}
