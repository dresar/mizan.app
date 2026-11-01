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
  Sliders,
  Settings,
  Building2,
  GraduationCap,
  UserCheck
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";

export function Sidebar() {
  const pathname = usePathname();
  const { activeRole, currentUser } = useMizan();

  let navItems: { label: string; href: string; icon: React.ReactNode; description: string }[] = [];

  if (activeRole === "SUPER_ADMIN") {
    navItems = [
      { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, description: "Monitoring santri" },
      { label: "Data Santri", href: "/admin/santri", icon: <Users className="w-4 h-4" />, description: "Rekap santri putra & putri" },
      { label: "Data Kelas", href: "/admin/kelas", icon: <GraduationCap className="w-4 h-4" />, description: "Wali kelas & anggota" },
      { label: "Wali & Pembina", href: "/admin/wali-kelas", icon: <UserCheck className="w-4 h-4" />, description: "Kelola wali & pembina" },
      { label: "Data Absensi", href: "/admin/absensi", icon: <CalendarCheck className="w-4 h-4" />, description: "Rekap log sholat santri" },
      { label: "Kelola Pengguna", href: "/admin/users", icon: <User className="w-4 h-4" />, description: "Akun pembina & admin" },
      { label: "Master Kategori", href: "/admin/kategori-pelanggaran", icon: <Sliders className="w-4 h-4" />, description: "Hasanah & Sayyi'ah" },
      { label: "Pengaturan Nilai", href: "/admin/pengaturan-nilai", icon: <Settings className="w-4 h-4" />, description: "Konfigurasi bobot" }
    ];
  } else if (activeRole === "PENGASUHAN") {
    navItems = [
      { label: "Beranda Pengasuhan", href: "/bk/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, description: "Pusat monitoring BK" },
      { label: "Absen Sholat", href: "/bk/absen", icon: <CalendarCheck className="w-4 h-4" />, description: "Presensi 7 waktu sholat" },
      { label: "Riwayat Absensi", href: "/bk/history", icon: <Clock className="w-4 h-4" />, description: "Log & kelola presensi" },
      { label: "Profil Pengasuhan", href: "/bk/profil", icon: <User className="w-4 h-4" />, description: "Data akun BK" }
    ];
  } else {
    navItems = [
      { label: "Beranda Pembina", href: "/guru/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, description: "Ringkasan kelas" },
      { label: "Daftar Santri", href: "/guru/santri", icon: <Users className="w-4 h-4" />, description: "Profil & capaian santri" },
      { label: "Input Penilaian", href: "/guru/input-penilaian", icon: <PenTool className="w-4 h-4" />, description: "Pencatatan adab & sikap" },
      { label: "Riwayat Penilaian", href: "/guru/riwayat", icon: <Clock className="w-4 h-4" />, description: "Daftar catatan santri" },
      { label: "Profil Pembina", href: "/guru/profil", icon: <User className="w-4 h-4" />, description: "Data akun & tugas" }
    ];
  }

  return (
    <aside
      className="hidden md:flex flex-col w-60 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] bg-white/80 backdrop-blur-md border-r border-[#E2EBF4] p-3 overflow-y-auto select-none z-30"
      aria-label="Sidebar Menu"
    >
      <div className="p-3 mb-3 rounded-2xl mizan-card-sub bg-white">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#A8833E]">
          <Building2 className="w-3.5 h-3.5 text-[#A8833E]" />
          <span>
            {activeRole === "SUPER_ADMIN"
              ? "Administrator Pondok"
              : activeRole === "PENGASUHAN"
              ? "Pengasuhan Pondok (BK)"
              : "Asatidzah / Pembina"}
          </span>
        </div>
        <p className="text-xs font-bold text-[#172033] mt-0.5 truncate">
          {currentUser?.name || "Akun"}
        </p>
        <span className="inline-block text-[10px] text-[#94A3B8] font-medium">
          {currentUser?.roleTitle || (activeRole === "SUPER_ADMIN" ? "Super Admin" : "Pengasuhan")}
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5" aria-label="Navigasi Menu Utama">
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all text-xs ${
                isActive
                  ? "bg-[#1B4D3E] text-white font-bold shadow-sm"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7F2] font-semibold"
              }`}
            >
              <div className={isActive ? "text-[#C5A059]" : "text-[#64748B]"}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <span className="block truncate">{item.label}</span>
                <span
                  className={`block text-[10px] truncate ${
                    isActive ? "text-emerald-100" : "text-[#94A3B8]"
                  }`}
                >
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
