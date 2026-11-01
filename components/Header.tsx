"use client";

import React, { useState, useRef, useEffect } from "react";
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
  AlertTriangle,
  FileText
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Avatar } from "@/components/ui/Avatar";

export default function Header() {
  const router = useRouter();
  const { currentUser, logoutUser, activeRole, settings } = useMizan();
  const appLogo = settings?.appLogoUrl || "/logo.png";

  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
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

  const uParam = currentUser?.username ? `?u=${encodeURIComponent(currentUser.username)}` : "";

  let dashboardHref = `/guru/dashboard${uParam}`;
  if (activeRole === "SUPER_ADMIN") dashboardHref = `/admin/dashboard${uParam}`;
  if (activeRole === "PENGASUHAN") dashboardHref = `/bk/dashboard${uParam}`;

  let profileHref = `/guru/profil${uParam}`;
  if (activeRole === "SUPER_ADMIN") profileHref = `/admin/users${uParam}`;
  if (activeRole === "PENGASUHAN") profileHref = `/bk/profil${uParam}`;

  const roleTitle =
    activeRole === "SUPER_ADMIN"
      ? "Super Admin"
      : activeRole === "PENGASUHAN"
      ? "Pengasuhan (BK)"
      : "Pembina Santri";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2EBF4] shadow-xs">
      <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link href={dashboardHref} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl mizan-card bg-[#1B4D3E] p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
            <Image src={appLogo} alt="Mizan Logo" width={36} height={36} className="w-full h-full object-contain" unoptimized />
          </div>
          <span className="font-serif font-black tracking-wide text-[#1B4D3E] text-lg sm:text-xl">
            MIZAN
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {currentUser?.username && (
            <>
              <div className="flex sm:hidden items-center">
                <span className="text-[10px] font-mono font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]/60 truncate max-w-[105px]">
                  @{currentUser.username}
                </span>
              </div>
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-[#172033] leading-tight truncate max-w-[150px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]/60">
                  @{currentUser.username} • {roleTitle}
                </span>
              </div>
            </>
          )}

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-2xl bg-[#FAF7EE] text-[#172033] hover:bg-[#FAF7EE]/80 border border-[#C5A059]/30 transition-all focus:outline-none"
              aria-label="Notifikasi Aplikasi"
            >
              <Bell className="w-4 h-4 text-[#A8833E]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white shadow-xl border border-[#E2EBF4] z-50 p-3 space-y-2.5 transition-all">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EBF4]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#1B4D3E]" />
                    <span className="text-xs font-bold text-[#172033]">
                      Notifikasi Aplikasi
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    3 Baru
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 text-xs">
                  <Link
                    href="/admin/rapor"
                    onClick={() => setIsNotifOpen(false)}
                    className="p-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2]/60 hover:bg-[#FEF2F2] flex items-start gap-2.5 transition-colors block"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#B91C1C] text-[11px]">
                        Evaluasi Rapor Santri
                      </p>
                      <p className="text-[10px] text-[#64748B] mt-0.5">
                        Terdapat santri dalam batas perhatian pembinaan adab khusus.
                      </p>
                    </div>
                  </Link>

                  <div className="p-2.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/60 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#065F46] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#065F46] text-[11px]">
                        Presensi Sholat Berjamaah
                      </p>
                      <p className="text-[10px] text-[#64748B] mt-0.5">
                        Data kehadiran sholat 7 waktu santri hari ini telah tercatat tertib.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#E2EBF4] bg-[#FAF7EE] flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-[#A8833E] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#172033] text-[11px]">
                        Pembaruan Master Rapor
                      </p>
                      <p className="text-[10px] text-[#64748B] mt-0.5">
                        Tabel rapor terpadu santri dan santriwati siap diunduh &amp; dicetak.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2EBF4] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[11px] font-bold text-[#64748B] hover:text-[#172033]"
                  >
                    Tutup
                  </button>
                  <Link
                    href="/admin/rapor"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[11px] font-bold text-[#1B4D3E] hover:underline"
                  >
                    Buka
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 p-1 rounded-2xl hover:bg-[#FAF7EE] transition-all focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Menu Profil"
            >
              <Avatar
                src={currentUser?.avatarUrl}
                initials={currentUser?.avatarInitials || "MZ"}
                size="sm"
                variant={currentUser?.gender === "Putri" ? "gold" : "primary"}
              />
              <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white shadow-xl border border-[#E2EBF4] z-50 p-2 space-y-1.5 transition-all">
                <div className="p-3 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/20">
                  <p className="text-xs font-bold text-[#172033] truncate">
                    {currentUser?.name || "Pengguna"}
                  </p>
                  {currentUser?.username && (
                    <p className="text-[11px] font-mono font-bold text-[#065F46] mt-0.5">
                      @{currentUser.username}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#1B4D3E] border border-[#E2EBF4] inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#A8833E]" />
                      <span>{roleTitle}</span>
                    </span>
                    {currentUser?.gender && (
                      <span className="text-[10px] font-semibold text-[#64748B]">
                        • {currentUser.gender}
                      </span>
                    )}
                  </div>
                </div>

              <div className="pt-1 space-y-0.5 text-xs">
                <Link
                  href={profileHref}
                  onClick={() => setIsOpen(false)}
                  className="w-full px-3 py-2 rounded-xl text-[#172033] hover:bg-[#EEF2F6] font-semibold flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-[#1B4D3E]" />
                  <span>Profil & Akun</span>
                </Link>

                <a
                  href="/downloads/mizan.apk"
                  download="mizan.apk"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-3 py-2 rounded-xl text-[#172033] hover:bg-[#EEF2F6] font-semibold flex items-center justify-between transition-colors"
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
                  className="w-full px-3 py-2 rounded-xl text-[#172033] hover:bg-[#EEF2F6] font-semibold flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Apple className="w-4 h-4 text-[#A8833E]" />
                    <span>Pasang App (Apple iOS)</span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
                </a>

                <div className="my-1 border-t border-[#F1F5F9]" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2.5 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
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
