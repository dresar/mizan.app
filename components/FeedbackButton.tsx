"use client";

import React, { useState } from "react";
import { MessageSquarePlus, Bug, Sparkles, Lightbulb, ChevronUp } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

export function FeedbackButton() {
  const { openFeedbackModal } = useMizan();
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  return (
    <div className="fixed bottom-20 right-3 sm:right-5 md:bottom-6 md:right-6 z-40 select-none flex flex-col items-end gap-2">
      {isOpenMenu && (
        <div className="flex flex-col gap-1.5 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-[#E2EBF4] dark:border-slate-800 shadow-xl text-[#172033] dark:text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            type="button"
            onClick={() => {
              setIsOpenMenu(false);
              openFeedbackModal("BUG");
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Bug</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpenMenu(false);
              openFeedbackModal("SARAN");
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#1B4D3E] dark:text-emerald-400 hover:bg-[#FAF7EE] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Saran</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpenMenu(!isOpenMenu)}
        className="h-10 px-3.5 rounded-full bg-[#1B4D3E] text-white shadow-lg shadow-[#1B4D3E]/20 hover:bg-[#143B30] active:scale-95 flex items-center gap-2 text-xs font-bold transition-all border border-[#C5A059]/40 cursor-pointer"
        aria-label="Feedback"
      >
        <MessageSquarePlus className="w-4 h-4 text-[#C5A059]" />
        <span className="hidden sm:inline">Masukan</span>
        <ChevronUp className={`w-3.5 h-3.5 text-[#C5A059] transition-transform duration-200 ${isOpenMenu ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
