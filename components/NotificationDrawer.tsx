"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronRight
} from "lucide-react";
import { MizanNotification } from "@/lib/mock-data";
export type { MizanNotification };

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: MizanNotification[];
  readNotifIds: string[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  readNotifIds,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      if (window.innerWidth < 640) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }
  }, [isOpen, mounted]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !readNotifIds.includes(n.id)).length;
  const displayedNotifications =
    activeTab === "UNREAD"
      ? notifications.filter((n) => !readNotifIds.includes(n.id))
      : notifications;

  const handleItemClick = (item: MizanNotification) => {
    onMarkAsRead(item.id);
    if (item.link) {
      router.push(item.link);
      onClose();
    }
  };

  const getIcon = (type: MizanNotification["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="w-4 h-4 text-[#B91C1C]" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-[#D97706]" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-[#065F46]" />;
      case "info":
      default:
        return <FileText className="w-4 h-4 text-[#A8833E]" />;
    }
  };

  const getBadgeStyle = (type: MizanNotification["type"]) => {
    switch (type) {
      case "urgent":
        return "bg-red-50 border-red-200 text-red-700";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "info":
      default:
        return "bg-[#FAF7EE] border-[#C5A059]/30 text-[#A8833E]";
    }
  };

  const renderContent = (isMobileView: boolean) => (
    <>
      {isMobileView && (
        <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full mx-auto my-3 shrink-0" />
      )}

      <div className="px-4 py-3 border-b border-[#F1F5F9] dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-[#FAF7EE]/50 dark:bg-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-[#C5A059]/30 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-4 h-4 text-[#1B4D3E] dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#172033] dark:text-slate-100">
                Notifikasi
              </h3>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#065F46] dark:text-emerald-400 border border-[#A7F3D0] dark:border-emerald-800">
                  {unreadCount} Baru
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border border-[#E2EBF4] dark:border-slate-700">
                  Terbaca
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-[#1B4D3E] dark:text-emerald-400 border border-[#A7F3D0] dark:border-emerald-800 hover:bg-[#ECFDF5] dark:hover:bg-slate-700 text-[11px] font-bold transition-colors shadow-2xs"
            >
              Baca
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-100 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-[#F1F5F9] dark:border-slate-800 flex items-center gap-2 bg-[#F8FAFC] dark:bg-slate-850 shrink-0 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ALL"
              ? "bg-[#1B4D3E] text-white shadow-2xs"
              : "bg-white text-[#64748B] border border-[#E2EBF4] hover:bg-[#FAF7EE]"
          }`}
        >
          Semua ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("UNREAD")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === "UNREAD"
              ? "bg-[#1B4D3E] text-white shadow-2xs"
              : "bg-white text-[#64748B] border border-[#E2EBF4] hover:bg-[#FAF7EE]"
          }`}
        >
          Belum ({unreadCount})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-[#F1F5F9]/60">
        {displayedNotifications.map((item) => {
          const isRead = readNotifIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group pt-3 first:pt-3 ${
                isRead
                  ? "bg-white dark:bg-slate-900 border-[#E2EBF4] dark:border-slate-800 opacity-75 hover:opacity-100 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/60"
                  : "bg-[#FAF7EE] dark:bg-slate-800/90 border-[#C5A059]/40 dark:border-slate-700 shadow-xs hover:border-[#1B4D3E]/60 dark:hover:border-emerald-500/50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getBadgeStyle(
                  item.type
                )}`}
              >
                {getIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs truncate ${
                      isRead ? "font-semibold text-[#334155] dark:text-slate-300" : "font-black text-[#172033] dark:text-slate-100"
                    }`}
                  >
                    {item.title}
                  </p>
                  <span className="text-[10px] text-[#94A3B8] dark:text-slate-500 font-mono shrink-0">
                    {item.time}
                  </span>
                </div>

                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-1.5 flex items-center justify-between">
                  {!isRead ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#1B4D3E] dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E] dark:bg-emerald-400 animate-pulse" />
                      <span>Baru</span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-[#94A3B8] dark:text-slate-500">
                      Dibaca
                    </span>
                  )}

                  {item.link && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#1B4D3E] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Buka</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayedNotifications.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <CheckCheck className="w-8 h-8 text-[#065F46] dark:text-emerald-400 mx-auto opacity-60" />
            <p className="text-xs font-bold text-[#172033] dark:text-slate-100">
              {activeTab === "UNREAD"
                ? "Semua notifikasi sudah dibaca"
                : "Belum ada notifikasi"}
            </p>
            <p className="text-[10px] text-[#64748B] dark:text-slate-400">
              Pemberitahuan aktivitas santri dan pondok akan muncul di sini.
            </p>
          </div>
        )}
      </div>

      <div
        className={`p-3 border-t border-[#F1F5F9] dark:border-slate-800 bg-[#FAF7EE]/40 dark:bg-slate-850 flex items-center justify-between shrink-0 ${
          isMobileView ? "pb-8" : "pb-3"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              router.push("/admin/notifikasi");
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl border border-[#C5A059]/40 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1B4D3E] dark:text-emerald-400 text-xs font-bold hover:bg-[#FAF7EE] dark:hover:bg-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <span>Semua</span>
            <ChevronRight className="w-3 h-3 text-[#A8833E]" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-[#D4C9B5] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172033] dark:text-slate-200 text-xs font-bold hover:bg-[#FAF7EE] dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="px-4 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-2xs cursor-pointer"
          >
            Baca
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="hidden sm:flex sm:flex-col absolute right-0 top-full mt-2 w-96 max-h-[34rem] bg-white dark:bg-slate-900 rounded-2xl border border-[#E2EBF4] dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        {renderContent(false)}
      </div>

      {mounted &&
        createPortal(
          <div id="mizan-notif-drawer" className="sm:hidden fixed inset-0 z-[1000] flex flex-col justify-end">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={onClose}
              aria-hidden="true"
            />
            <div className="relative w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden z-[1001] animate-in fade-in slide-in-from-bottom-8 duration-200">
              {renderContent(true)}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
