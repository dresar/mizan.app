"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  PenTool,
  Clock,
  User,
  Users,
  Settings,
  Award,
  ShieldCheck
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

export function BottomNav() {
  const pathname = usePathname();
  const { activeRole, currentUser } = useMizan();

  let navItems: { label: string; href: string; icon: React.ReactNode }[] = [];

  if (activeRole === "SUPER_ADMIN") {
    navItems = [
      { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Santri", href: "/admin/santri", icon: <Users className="w-4 h-4" /> },
      { label: "Absensi", href: "/admin/absensi", icon: <CalendarCheck className="w-4 h-4" /> },
      { label: "Pengguna", href: "/admin/users", icon: <User className="w-4 h-4" /> },
      { label: "Pengaturan", href: "/admin/pengaturan-nilai", icon: <Settings className="w-4 h-4" /> }
    ];
  } else if (activeRole === "PENGASUHAN") {
    navItems = [
      { label: "Beranda", href: "/bk/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Nilai", href: "/bk/penilaian", icon: <Award className="w-4 h-4" /> },
      { label: "Absen", href: "/bk/absen", icon: <CalendarCheck className="w-4 h-4" /> },
      { label: "History", href: "/bk/history", icon: <Clock className="w-4 h-4" /> },
      { label: "Profil", href: "/bk/profil", icon: <User className="w-4 h-4" /> }
    ];
  } else if (activeRole === "SATPAM") {
    navItems = [
      { label: "Pos Gerbang", href: "/satpam", icon: <ShieldCheck className="w-4 h-4" /> }
    ];
  } else {
    navItems = [
      { label: "Beranda", href: "/guru/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Santri", href: "/guru/santri", icon: <Users className="w-4 h-4" /> },
      { label: "Input Nilai", href: "/guru/input-penilaian", icon: <PenTool className="w-4 h-4" /> },
      { label: "History", href: "/guru/riwayat", icon: <Clock className="w-4 h-4" /> },
      { label: "Profil", href: "/guru/profil", icon: <User className="w-4 h-4" /> }
    ];
  }

  return (
    <nav
      className="md:hidden fixed bottom-2 inset-x-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full mizan-card z-30 shadow-xl px-1.5 py-1.5 border border-[#E2EBF4] dark:border-slate-800 transition-colors duration-200"
      aria-label="Navigasi Bawah Mobile"
    >
      <div className="flex items-center justify-around gap-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              item.href !== "/guru/dashboard" &&
              item.href !== "/bk/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex-1 flex flex-col items-center justify-center min-h-[42px] py-1 px-0.5 rounded-full transition-all duration-150 active:scale-[0.95] text-center ${
                isActive
                  ? "text-[#1B4D3E] dark:text-emerald-400 font-black bg-[#ECFDF5] dark:bg-emerald-950/60"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-100 font-medium"
              }`}
            >
              <div className={isActive ? "text-[#1B4D3E] dark:text-emerald-400" : "text-[#64748B] dark:text-slate-400"}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5 leading-none truncate max-w-[56px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
