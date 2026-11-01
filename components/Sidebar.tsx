"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  UserCheck,
  Award,
  FileText,
  X
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Avatar } from "@/components/ui/Avatar";

export function Sidebar() {
  const pathname = usePathname();
  const { activeRole, currentUser, isMobileNavOpen, setIsMobileNavOpen, settings } = useMizan();
  const uParam = currentUser?.username ? `?u=${encodeURIComponent(currentUser.username)}` : "";
  const appLogo = settings?.appLogoUrl || "/logo.png";

  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen, setIsMobileNavOpen]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname, setIsMobileNavOpen]);

  let navItems: { label: string; href: string; icon: React.ReactNode; description: string }[] = [];

  if (activeRole === "SUPER_ADMIN") {
    navItems = [
      { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, description: "Monitoring santri" },
      { label: "Data Santri", href: "/admin/santri", icon: <Users className="w-4 h-4" />, description: "Rekap santri putra & putri" },
      { label: "Data Kelas", href: "/admin/kelas", icon: <GraduationCap className="w-4 h-4" />, description: "Wali kelas & anggota" },
      { label: "Wali & Pembina", href: "/admin/wali-kelas", icon: <UserCheck className="w-4 h-4" />, description: "Kelola wali & pembina" },
      { label: "Data Absensi", href: "/admin/absensi", icon: <CalendarCheck className="w-4 h-4" />, description: "Rekap log sholat santri" },
      { label: "Rapor Santri", href: "/admin/rapor", icon: <FileText className="w-4 h-4" />, description: "Rapor adab & sholat" },
      { label: "Kelola Pengguna", href: "/admin/users", icon: <User className="w-4 h-4" />, description: "Akun pembina & admin" },
      { label: "Master Kategori", href: "/admin/kategori-pelanggaran", icon: <Sliders className="w-4 h-4" />, description: "Hasanah & Sayyi'ah" },
      { label: "Pengaturan Nilai", href: "/admin/pengaturan-nilai", icon: <Settings className="w-4 h-4" />, description: "Konfigurasi bobot" }
    ];
  } else if (activeRole === "PENGASUHAN") {
    navItems = [
      { label: "Beranda Pengasuhan", href: "/bk/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, description: "Pusat monitoring BK" },
      { label: "Penilaian Santri", href: "/bk/penilaian", icon: <Award className="w-4 h-4" />, description: "Catat hasanah & sayyi'ah" },
      { label: "Data Santri", href: "/bk/santri", icon: <GraduationCap className="w-4 h-4" />, description: "Profil & rapor santri" },
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

  const roleLabel =
    activeRole === "SUPER_ADMIN"
      ? "Administrator Pondok"
      : activeRole === "PENGASUHAN"
      ? "Pengasuhan Pondok (BK)"
      : "Asatidzah / Pembina";

  return (
    <>
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] bg-white/80 backdrop-blur-md border-r border-[#E2EBF4] p-3 overflow-y-auto select-none z-30"
        aria-label="Sidebar Menu"
      >
        <div className="p-3 mb-3 rounded-2xl mizan-card-sub bg-white">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#A8833E]">
            <Building2 className="w-3.5 h-3.5 text-[#A8833E]" />
            <span>{roleLabel}</span>
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
                href={`${item.href}${uParam}`}
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

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            aria-hidden="true"
          />

          <div className="relative w-[285px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-4 border-r border-[#E2EBF4] z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2EBF4]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1B4D3E] p-1 flex items-center justify-center overflow-hidden">
                  <Image src={appLogo} alt="Mizan Logo" width={32} height={32} className="w-full h-full object-contain" unoptimized />
                </div>
                <div>
                  <span className="font-serif font-black tracking-wide text-[#1B4D3E] text-base block leading-none">
                    MIZAN
                  </span>
                  <span className="text-[10px] font-bold text-[#A8833E] mt-0.5 block">
                    {activeRole === "SUPER_ADMIN" ? "Admin Panel" : "Menu Panel"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/5 text-[#64748B] hover:text-[#172033] transition-colors"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 mb-3 rounded-2xl mizan-card-sub bg-[#FAF7EE] border border-[#C5A059]/20">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={currentUser?.avatarUrl}
                  initials={currentUser?.avatarInitials || "AD"}
                  size="sm"
                  variant="primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#172033] truncate">
                    {currentUser?.name || "Administrator"}
                  </p>
                  <span className="inline-block text-[10px] text-[#A8833E] font-bold">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 flex flex-col gap-1.5" aria-label="Navigasi Menu Mobile">
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
                    href={`${item.href}${uParam}`}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all text-xs ${
                      isActive
                        ? "bg-[#1B4D3E] text-white font-bold shadow-sm"
                        : "text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7F2] font-semibold"
                    }`}
                  >
                    <div className={isActive ? "text-[#C5A059]" : "text-[#64748B]"}>
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
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

            <div className="pt-3 border-t border-[#E2EBF4] mt-auto">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-[#FAF7EE] text-[#172033] hover:bg-[#FAF7EE]/80 border border-[#D4C9B5] text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
