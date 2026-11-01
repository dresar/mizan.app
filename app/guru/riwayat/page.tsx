"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Paperclip
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function GuruRiwayatPage() {
  const { penilaianList, currentUser, deletePenilaian } = useMizan();
  const [activeTab, setActiveTab] = useState<"today" | "week" | "all">("today");

  const myPenilaian = penilaianList.filter(
    (p) => p.guruName === currentUser.name || p.guruId === currentUser.id
  );

  const filteredList = myPenilaian.filter((item) => {
    if (activeTab === "today") return item.dateKey === "today";
    if (activeTab === "week") return item.dateKey === "today" || item.dateKey === "week";
    return true;
  });

  const formatScore = (score: number) => {
    const formatted = Math.abs(score).toFixed(3);
    return score > 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-serif font-black text-[#172033] tracking-tight">
              Riwayat Penilaian
            </h1>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Catatan perilaku santri yang telah Anda input
            </p>
          </div>

          <Link
            href="/guru/input-penilaian"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-full mizan-btn-primary text-xs font-bold shrink-0"
          >
            <span>Input</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-full mizan-pill bg-white max-w-xs text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all ${
              activeTab === "today"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("week")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all ${
              activeTab === "week"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Minggu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1.5 px-3 rounded-full transition-all ${
              activeTab === "all"
                ? "bg-[#1B4D3E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            Semua
          </button>
        </div>

        {filteredList.length === 0 ? (
          <EmptyState
            title="Belum Ada Catatan"
            description="Tidak ada catatan penilaian pada periode yang Anda pilih."
            action={{
              label: "Input Penilaian",
              onClick: () => {}
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {filteredList.map((item) => (
              <CardSub
                key={item.id}
                className="p-3.5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-1 rounded-xl text-xs font-mono font-black shrink-0 ${
                        item.type === "HASANAH"
                          ? "bg-[#ECFDF5] text-[#065F46]"
                          : "bg-[#FEF2F2] text-[#991B1B]"
                      }`}
                    >
                      {formatScore(item.score)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#172033] truncate">
                        {item.santriName}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] truncate">
                        Kelas {item.santriClass}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deletePenilaian(item.id)}
                    className="p-1 rounded-full text-[#94A3B8] hover:text-[#DC2626] transition-colors shrink-0"
                    title="Hapus catatan ini"
                    aria-label={`Hapus catatan ${item.santriName}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs font-semibold text-[#172033] line-clamp-2 leading-snug">
                  {item.indicatorText}
                </p>

                {item.notes && (
                  <p className="text-[11px] text-[#64748B] italic mt-1 line-clamp-1">
                    &quot;{item.notes}&quot;
                  </p>
                )}

                <div className="mt-2.5 pt-2 border-t border-[#E2EBF4] flex items-center justify-between text-[10px] text-[#94A3B8]">
                  <span className="truncate max-w-[150px]">{item.unsurName}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{item.createdAt}</span>
                  </span>
                </div>
              </CardSub>
            ))}
          </div>
        )}
      </div>
    </RoleShell>
  );
}
