"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Smartphone,
  ChevronDown,
  ShieldCheck,
  Download,
  Apple,
  Bell,
  Menu,
  MessageSquarePlus,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationDrawer, MizanNotification } from "@/components/NotificationDrawer";

export default function Header() {
  const router = useRouter();
  const {
    currentUser,
    logoutUser,
    activeRole,
    settings,
    isMobileNavOpen,
    setIsMobileNavOpen,
    openFeedbackModal,
    notificationList,
    readNotifIds,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    theme,
    setTheme,
    showToast
  } = useMizan();
  const appLogo = settings?.appLogoUrl || "/logo.png";

  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleToggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      showToast?.("Mode Gelap aktif", "info");
    } else if (theme === "dark") {
      setTheme("system");
      showToast?.("Mode Bawaan Device aktif", "info");
    } else {
      setTheme("light");
      showToast?.("Mode Terang aktif", "info");
    }
  };

  const themeIcon = useMemo(() => {
    if (theme === "dark") {
      return <Moon key="dark" className="w-4 h-4 text-sky-400 animate-theme-icon" />;
    }
    if (theme === "system") {
      return <Monitor key="system" className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-theme-icon" />;
    }
    return <Sun key="light" className="w-4 h-4 text-amber-500 animate-theme-icon" />;
  }, [theme]);

  const themeLabel =
    theme === "dark"
      ? "Mode Gelap (Klik untuk Bawaan Device)"
      : theme === "system"
      ? "Mode Bawaan Device (Klik untuk Mode Terang)"
      : "Mode Terang (Klik untuk Mode Gelap)";

  const notifications: MizanNotification[] = useMemo(() => {
    return (notificationList || []).filter((item) => {
      if (!item.isActive) return false;
      if (!item.targetRole || item.targetRole === "ALL") return true;
      if (activeRole === "SUPER_ADMIN") return true;
      return item.targetRole === activeRole;
    });
  }, [notificationList, activeRole]);

  const unreadCount = notifications.filter((n) => !readNotifIds.includes(n.id)).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        const mobileDrawer = document.getElementById("mizan-notif-drawer");
        if (!mobileDrawer || !mobileDrawer.contains(target)) {
          setIsNotifOpen(false);
        }
      }
    }

    if (isOpen || isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isNotifOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logoutUser();
    router.push("/login");
  };

  let dashboardHref = "/guru/dashboard";
  if (activeRole === "SUPER_ADMIN") dashboardHref = "/admin/dashboard";
  if (activeRole === "PENGASUHAN") dashboardHref = "/bk/dashboard";

  let profileHref = "/guru/profil";
  if (activeRole === "SUPER_ADMIN") profileHref = "/admin/profil";
  if (activeRole === "PENGASUHAN") profileHref = "/bk/profil";

  const roleTitle =
    activeRole === "SUPER_ADMIN"
      ? "Super Admin"
      : activeRole === "PENGASUHAN"
      ? "Pengasuhan (BK)"
      : "Pembina Santri";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-[#E2EBF4] dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {activeRole === "SUPER_ADMIN" && (
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-2xl bg-[#FAF7EE] dark:bg-slate-800 text-[#1B4D3E] dark:text-emerald-400 hover:bg-[#FAF7EE]/80 dark:hover:bg-slate-700 border border-[#C5A059]/30 dark:border-slate-700 transition-all focus:outline-none"
              aria-label="Menu Navigasi"
            >
              <Menu className="w-5 h-5 text-[#1B4D3E] dark:text-emerald-400" />
            </button>
          )}

          <Link href={dashboardHref} prefetch={true} className="flex items-center gap-2.5 group active:scale-[0.98] transition-transform">
            <div className="w-9 h-9 rounded-2xl mizan-card bg-[#1B4D3E] p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
              <Image src={appLogo} alt="Mizan Logo" width={36} height={36} className="w-full h-full object-contain" unoptimized />
            </div>
            <span className="font-serif font-black tracking-wide text-[#1B4D3E] dark:text-emerald-400 text-lg sm:text-xl">
              MIZAN
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openFeedbackModal("SARAN")}
            className="p-2 rounded-2xl bg-[#FAF7EE] dark:bg-slate-800 text-[#172033] dark:text-slate-200 hover:bg-[#FAF7EE]/80 dark:hover:bg-slate-700 border border-[#C5A059]/30 dark:border-slate-700 transition-all focus:outline-none cursor-pointer"
            aria-label="Kirim Masukan"
            title="Kirim Masukan atau Lapor Bug"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#A8833E]" />
          </button>

          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2 rounded-2xl bg-[#FAF7EE] dark:bg-slate-800 text-[#172033] dark:text-slate-200 hover:bg-[#FAF7EE]/80 dark:hover:bg-slate-700 border border-[#C5A059]/30 dark:border-slate-700 transition-all focus:outline-none cursor-pointer active:scale-90"
            aria-label={themeLabel}
            title={themeLabel}
          >
            {themeIcon}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-2xl bg-[#FAF7EE] dark:bg-slate-800 text-[#172033] dark:text-slate-200 hover:bg-[#FAF7EE]/80 dark:hover:bg-slate-700 border border-[#C5A059]/30 dark:border-slate-700 transition-all focus:outline-none"
              aria-label="Notifikasi Aplikasi"
            >
              <Bell className="w-4 h-4 text-[#A8833E]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#B91C1C] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-2xs font-mono">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationDrawer
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              notifications={notifications}
              readNotifIds={readNotifIds}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 p-1 rounded-2xl hover:bg-[#FAF7EE] dark:hover:bg-slate-800 transition-all focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Menu Profil"
            >
              <Avatar
                src={currentUser?.avatarUrl}
                initials={currentUser?.avatarInitials || "MZ"}
                size="sm"
                variant={currentUser?.gender === "Putri" ? "gold" : "primary"}
              />
              <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] dark:text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-[#E2EBF4] dark:border-slate-800 z-50 p-2 space-y-1.5 transition-all">
                <div className="p-3 rounded-xl bg-[#FAF7EE] dark:bg-slate-800/80 border border-[#C5A059]/20 dark:border-slate-700">
                  <p className="text-xs font-bold text-[#172033] dark:text-slate-100 truncate">
                    {currentUser?.name || "Pengguna"}
                  </p>
                  {currentUser?.username && (
                    <p className="text-[11px] font-mono font-bold text-[#065F46] dark:text-emerald-400 mt-0.5">
                      @{currentUser.username}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[#1B4D3E] dark:text-emerald-400 border border-[#E2EBF4] dark:border-slate-700 inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#A8833E]" />
                      <span>{roleTitle}</span>
                    </span>
                    {currentUser?.gender && (
                      <span className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400">
                        • {currentUser.gender}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-1.5 rounded-xl bg-[#FAF7EE] dark:bg-slate-800/80 border border-[#C5A059]/20 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block px-1">
                    Tema Tampilan
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        theme === "light"
                          ? "bg-white dark:bg-slate-700 text-[#1B4D3E] dark:text-emerald-400 shadow-xs border border-[#C5A059]/40"
                          : "text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-200"
                      }`}
                    >
                      <Sun className="w-3 h-3 text-amber-500" />
                      <span>Terang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        theme === "dark"
                          ? "bg-white dark:bg-slate-700 text-sky-400 shadow-xs border border-sky-400/40"
                          : "text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-200"
                      }`}
                    >
                      <Moon className="w-3 h-3 text-sky-400" />
                      <span>Gelap</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("system")}
                      className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        theme === "system"
                          ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/40"
                          : "text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-200"
                      }`}
                    >
                      <Monitor className="w-3 h-3 text-slate-500 dark:text-slate-300" />
                      <span>Device</span>
                    </button>
                  </div>
                </div>

                <div className="pt-1 space-y-0.5 text-xs">
                  <Link
                    href={profileHref}
                    prefetch={true}
                    onClick={() => setIsOpen(false)}
                    className="w-full px-3 py-2 rounded-xl text-[#172033] dark:text-slate-200 hover:bg-[#EEF2F6] dark:hover:bg-slate-800 font-semibold flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-[#1B4D3E] dark:text-emerald-400" />
                    <span>Profil & Akun</span>
                  </Link>

                  <a
                    href="/downloads/mizan.apk"
                    download="mizan.apk"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-3 py-2 rounded-xl text-[#172033] dark:text-slate-200 hover:bg-[#EEF2F6] dark:hover:bg-slate-800 font-semibold flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-[#A8833E]" />
                      <span>Download APK (Android)</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
                  </a>

                  <a
                    href="/api/download/ios-profile"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-3 py-2 rounded-xl text-[#172033] dark:text-slate-200 hover:bg-[#EEF2F6] dark:hover:bg-slate-800 font-semibold flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Apple className="w-4 h-4 text-[#A8833E]" />
                      <span>Pasang App (Apple iOS)</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
                  </a>

                  <div className="my-1 border-t border-[#F1F5F9] dark:border-slate-800" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold flex items-center gap-2.5 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Keluar Aplikasi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export { Header };
