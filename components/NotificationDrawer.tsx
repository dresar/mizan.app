"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronRight,
  Sparkles
} from "lucide-react";

export interface MizanNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "urgent" | "warning" | "success" | "info";
  link?: string;
}

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

  return (
    <div className="fixed inset-0 z-50 sm:static sm:z-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-[34rem] sm:rounded-2xl sm:border sm:border-[#E2EBF4] sm:shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-top-2 duration-200">
        <div className="w-12 h-1.5 bg-[#CBD5E1] rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between gap-2 shrink-0 bg-[#FAF7EE]/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/30 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-[#1B4D3E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#172033]">
                  Notifikasi
                </h3>
                {unreadCount > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    {unreadCount} Baru
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#64748B] border border-[#E2EBF4]">
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
                className="px-2.5 py-1 rounded-xl bg-white text-[#1B4D3E] border border-[#A7F3D0] hover:bg-[#ECFDF5] text-[11px] font-bold transition-colors shadow-2xs"
              >
                Baca
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-[#F1F5F9] flex items-center gap-2 bg-[#F8FAFC] shrink-0 text-xs">
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
                    ? "bg-white border-[#E2EBF4] opacity-75 hover:opacity-100 hover:bg-[#F8FAFC]"
                    : "bg-[#FAF7EE] border-[#C5A059]/40 shadow-xs hover:border-[#1B4D3E]/60"
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
                        isRead ? "font-semibold text-[#334155]" : "font-black text-[#172033]"
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] text-[#94A3B8] font-mono shrink-0">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between">
                    {!isRead ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#1B4D3E]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E] animate-pulse" />
                        <span>Baru</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#94A3B8]">
                        Dibaca
                      </span>
                    )}

                    {item.link && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#1B4D3E] group-hover:translate-x-0.5 transition-transform">
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
              <CheckCheck className="w-8 h-8 text-[#065F46] mx-auto opacity-60" />
              <p className="text-xs font-bold text-[#172033]">
                {activeTab === "UNREAD"
                  ? "Semua notifikasi sudah dibaca"
                  : "Belum ada notifikasi"}
              </p>
              <p className="text-[10px] text-[#64748B]">
                Pemberitahuan aktivitas santri dan pondok akan muncul di sini.
              </p>
            </div>
          )}
        </div>

        <div className="p-3 pb-6 sm:pb-3 border-t border-[#F1F5F9] bg-[#FAF7EE]/30 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-[#D4C9B5] bg-white text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-colors"
          >
            Tutup
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="px-4 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors shadow-2xs"
            >
              Baca
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
