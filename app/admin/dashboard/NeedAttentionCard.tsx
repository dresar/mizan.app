"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Santri } from "@/lib/mock-data";

interface NeedAttentionCardProps {
  santriList: Santri[];
}

export function NeedAttentionCard({ santriList }: NeedAttentionCardProps) {
  const [attentionGender, setAttentionGender] = useState<"ALL" | "Putra" | "Putri">("ALL");

  const needAttentionSantri = useMemo(() => {
    const list = [...santriList];
    if (attentionGender !== "ALL") {
      return list
        .filter((s) => s.gender === attentionGender)
        .sort((a, b) => a.currentScore - b.currentScore)
        .slice(0, 5);
    }
    const putra = list
      .filter((s) => s.gender === "Putra")
      .sort((a, b) => a.currentScore - b.currentScore)
      .slice(0, 5);
    const putri = list
      .filter((s) => s.gender === "Putri")
      .sort((a, b) => a.currentScore - b.currentScore)
      .slice(0, 5);
    return [...putra, ...putri];
  }, [santriList, attentionGender]);

  const minScoreInList = useMemo(() => {
    if (!needAttentionSantri.length) return 70;
    return Math.min(...needAttentionSantri.map((s) => s.currentScore));
  }, [needAttentionSantri]);

  const formatScore = (score: number) => {
    return Number(score).toFixed(3).replace(".", ",");
  };

  const getCardStyle = (score: number) => {
    if (score < 50) {
      return {
        card: "border-red-200 bg-[#FEF2F2]/70 hover:border-red-400 hover:bg-[#FEF2F2]",
        rank: "bg-red-100 text-red-700",
        nameHover: "group-hover:text-red-700",
        scoreColor: "text-red-600",
        badge: "text-red-700 bg-red-100/80 border-red-200",
        icon: <AlertTriangle className="w-3 h-3 text-red-600" />,
        statusLabel: "Binaan"
      };
    }
    if (score < 70) {
      return {
        card: "border-amber-200 bg-[#FEFCE8]/70 hover:border-amber-400 hover:bg-[#FEFCE8]",
        rank: "bg-amber-100 text-amber-700",
        nameHover: "group-hover:text-amber-800",
        scoreColor: "text-amber-700",
        badge: "text-amber-800 bg-amber-100/80 border-amber-200",
        icon: <AlertCircle className="w-3 h-3 text-amber-600" />,
        statusLabel: "Perhatian"
      };
    }
    return {
      card: "border-emerald-200 bg-[#F0FDF4]/70 hover:border-emerald-400 hover:bg-[#F0FDF4]",
      rank: "bg-emerald-100 text-emerald-800",
      nameHover: "group-hover:text-emerald-800",
      scoreColor: "text-emerald-700",
      badge: "text-emerald-800 bg-emerald-100/80 border-emerald-200",
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
      statusLabel: "Aman"
    };
  };

  const isCriticalAlert = minScoreInList < 50;
  const isWarningAlert = minScoreInList < 70 && minScoreInList >= 50;

  return (
    <Card className="p-4 sm:p-5 space-y-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            {isCriticalAlert ? (
              <ShieldAlert className="w-4 h-4 text-red-600" />
            ) : isWarningAlert ? (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
            <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
              {isCriticalAlert
                ? "Perlu Pembinaan"
                : isWarningAlert
                ? "Perlu Perhatian"
                : "Skor Terendah"}
            </h2>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {isCriticalAlert
              ? "Skor akhlak di bawah 50,000"
              : isWarningAlert
              ? "Skor mendekati batas aman (50 - 70)"
              : "5 L & 5 P terendah"}
          </p>
        </div>

        <div className="inline-flex rounded-xl p-1 bg-[#EEF2F6] self-start sm:self-auto">
          {(["ALL", "Putra", "Putri"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setAttentionGender(g)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                attentionGender === g
                  ? "bg-white text-[#1B4D3E] shadow-xs"
                  : "text-[#64748B] hover:text-[#172033]"
              }`}
            >
              {g === "ALL" ? "Semua" : g === "Putra" ? "L" : "P"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {needAttentionSantri.map((santri, idx) => {
          const rank = idx + 1;
          const style = getCardStyle(santri.currentScore);
          return (
            <Link
              key={santri.id}
              href={`/guru/santri/${santri.id}`}
              className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-2.5 transition-all group ${style.card}`}
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 w-full sm:w-auto">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${style.rank}`}
                >
                  {rank}
                </div>

                <Avatar
                  src={santri.avatarUrl || (santri.gender === "Putri" ? "/default-avatar-ustadzah.jpg" : "/default-avatar-ustadz.jpg")}
                  name={santri.name}
                  gender={santri.gender}
                  initials={santri.avatar}
                  size="sm"
                  variant={santri.gender === "Putra" ? "primary" : "gold"}
                />

                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold text-[#172033] truncate transition-colors ${style.nameHover}`}>
                    {santri.name}
                  </p>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    {santri.class} • {santri.gender === "Putra" ? "L" : "P"}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-1.5 sm:pt-0 border-[#E2E8F0]">
                <span className={`text-xs font-black font-mono block ${style.scoreColor}`}>
                  {formatScore(santri.currentScore)}
                </span>
                <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold border px-2 py-0.5 rounded-full ${style.badge}`}>
                  {style.icon}
                  {santri.currentScore >= 70 ? (santri.status || "Aman") : style.statusLabel}
                </span>
              </div>
            </Link>
          );
        })}
        {needAttentionSantri.length === 0 && (
          <div className="col-span-2 py-8 text-center text-xs text-[#065F46] bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0]">
            Alhamdulillah, tidak ada santri yang memerlukan pembinaan intensif.
          </div>
        )}
      </div>
    </Card>
  );
}
