"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, User, Smartphone, ChevronDown, ShieldCheck, Download } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Avatar } from "@/components/ui/Avatar";

export default function Header() {
  const router = useRouter();
  const { currentUser, logoutUser, activeRole, settings } = useMizan();
  const appLogo = settings?.appLogoUrl || "/logo.png";

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logoutUser();
    router.push("/login");
  };

  let dashboardHref = "/guru/dashboard";
  if (activeRole === "SUPER_ADMIN") dashboardHref = "/admin/dashboard";
  if (activeRole === "PENGASUHAN") dashboardHref = "/bk/dashboard";

  let profileHref = "/guru/profil";
  if (activeRole === "SUPER_ADMIN") profileHref = "/admin/users";
  if (activeRole === "PENGASUHAN") profileHref = "/bk/profil";

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
                    <span>Download APK Android</span>
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
    </header>
  );
}

export { Header };
