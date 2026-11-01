"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, LogOut, User, Smartphone } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Avatar } from "@/components/ui/Avatar";

export default function Header() {
  const router = useRouter();
  const { currentUser, logoutUser, activeRole } = useMizan();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  let dashboardHref = "/guru/dashboard";
  if (activeRole === "SUPER_ADMIN") dashboardHref = "/admin/dashboard";
  if (activeRole === "PENGASUHAN") dashboardHref = "/bk/dashboard";

  let profileHref = "/guru/profil";
  if (activeRole === "SUPER_ADMIN") profileHref = "/admin/users";
  if (activeRole === "PENGASUHAN") profileHref = "/bk/profil";

  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "Akun";
  const labelGender = currentUser?.gender || (activeRole === "SUPER_ADMIN" ? "Admin" : "");

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2EBF4] shadow-xs">
      <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-3 max-w-6xl mx-auto">
        <Link href={dashboardHref} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl mizan-card bg-[#1B4D3E] text-[#C5A059] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-[#C5A059]" />
          </div>
          <span className="font-serif font-black tracking-wide text-[#1B4D3E] text-lg sm:text-xl">
            MIZAN
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mizan-pill bg-white border border-[#E2EBF4]">
            <User className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0" />
            <span className="text-xs font-bold text-[#172033] max-w-[120px] sm:max-w-[200px] truncate">
              {firstName} {labelGender ? `(${labelGender})` : ""}
            </span>
          </div>

          <Link href={profileHref} className="shrink-0" title="Profil">
            <Avatar
              src={currentUser?.avatarUrl}
              initials={currentUser?.avatarInitials || "MZ"}
              size="sm"
              variant={currentUser?.gender === "Putri" ? "gold" : "primary"}
            />
          </Link>

          <a
            href="/downloads/mizan.apk"
            download="mizan.apk"
            title="Aplikasi"
            className="p-2 rounded-2xl border border-[#E2EBF4] hover:bg-[#FAF7EE] text-[#1B4D3E] hover:text-[#065F46] transition-colors shrink-0"
            aria-label="Aplikasi"
          >
            <Smartphone className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            title="Keluar"
            className="p-2 rounded-2xl border border-[#E2EBF4] hover:bg-red-50 text-[#64748B] hover:text-red-600 transition-colors shrink-0"
            aria-label="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
export { Header };
