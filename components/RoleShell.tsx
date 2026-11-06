"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMizan } from "@/lib/mizan-context";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { ToastContainer } from "@/components/ui/Toast";
import { AnnouncementPopup } from "@/components/AnnouncementPopup";
import { PageTransition } from "@/components/PageTransition";

interface RoleShellProps {
  children: React.ReactNode;
}

export function RoleShell({ children }: RoleShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, activeRole, isAuthenticated, isAuthLoading } = useMizan();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !currentUser?.id || !activeRole) {
      router.replace("/login");
      return;
    }

    if (activeRole === "SATPAM") {
      if (!pathname.startsWith("/satpam")) {
        router.replace("/satpam");
      }
      return;
    }

    if (pathname.startsWith("/satpam")) {
      if (activeRole !== "SUPER_ADMIN" && activeRole !== "PENGASUHAN") {
        router.replace("/login");
      }
      return;
    }

    if (pathname.startsWith("/admin")) {
      if (activeRole !== "SUPER_ADMIN") {
        if (activeRole === "PENGASUHAN") {
          router.replace("/bk/dashboard");
        } else {
          router.replace("/guru/dashboard");
        }
      }
    } else if (pathname.startsWith("/bk")) {
      if (activeRole === "SUPER_ADMIN") {
        if (pathname === "/bk/history") {
          router.replace("/admin/absensi");
        } else {
          router.replace("/admin/dashboard");
        }
      } else if (activeRole !== "PENGASUHAN") {
        router.replace("/guru/dashboard");
      }
    } else if (pathname.startsWith("/guru")) {
      if (activeRole === "SUPER_ADMIN") {
        if (
          pathname === "/guru/input-penilaian" ||
          pathname === "/guru/dashboard" ||
          pathname === "/guru/profil"
        ) {
          router.replace("/admin/dashboard");
        }
      } else if (activeRole === "PENGASUHAN") {
        if (
          pathname === "/guru/input-penilaian" ||
          pathname === "/guru/dashboard" ||
          pathname === "/guru/profil"
        ) {
          router.replace("/bk/dashboard");
        }
      }
    }
  }, [isAuthLoading, isAuthenticated, currentUser, activeRole, pathname, router]);

  useEffect(() => {
    if (!isAuthenticated || !activeRole) return;

    const routes: string[] = [];
    if (activeRole === "SUPER_ADMIN") {
      routes.push(
        "/admin/dashboard",
        "/admin/santri",
        "/admin/kelas",
        "/admin/wali-kelas",
        "/admin/absensi",
        "/admin/rapor",
        "/admin/kesehatan",
        "/admin/perizinan",
        "/admin/keuangan",
        "/admin/tahfidz",
        "/admin/users",
        "/admin/kategori-pelanggaran",
        "/admin/pengaturan-nilai",
        "/admin/notifikasi",
        "/admin/feedback",
        "/admin/logs",
        "/admin/profil"
      );
    } else if (activeRole === "PENGASUHAN") {
      routes.push(
        "/bk/dashboard",
        "/bk/kesehatan",
        "/bk/perizinan",
        "/bk/keuangan",
        "/bk/tahfidz",
        "/bk/penilaian",
        "/bk/santri",
        "/bk/absen",
        "/bk/history",
        "/bk/profil"
      );
    } else if (activeRole === "GURU") {
      routes.push(
        "/guru/dashboard",
        "/guru/santri",
        "/guru/input-penilaian",
        "/guru/riwayat",
        "/guru/profil"
      );
    }

    const timer = setTimeout(() => {
      routes.forEach((r) => {
        try {
          router.prefetch(r);
        } catch {
        }
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [isAuthenticated, activeRole, router]);

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated || !currentUser?.id || !activeRole) {
    return null;
  }

  const isAuthorized = (() => {
    if (activeRole === "SATPAM") {
      return pathname.startsWith("/satpam");
    }
    if (pathname.startsWith("/satpam")) {
      return activeRole === "SUPER_ADMIN" || activeRole === "PENGASUHAN";
    }
    if (pathname.startsWith("/admin")) {
      return activeRole === "SUPER_ADMIN";
    }
    if (pathname.startsWith("/bk")) {
      return activeRole === "PENGASUHAN" || activeRole === "SUPER_ADMIN";
    }
    if (pathname.startsWith("/guru")) {
      return activeRole === "GURU" || activeRole === "SUPER_ADMIN";
    }
    return true;
  })();

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F1E8] dark:bg-[#0a0f1d] p-4 text-center">
        <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2EBF4] dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#172033] dark:text-slate-100">Akses Ditolak</h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Anda tidak memiliki wewenang untuk membuka halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] dark:bg-[#0a0f1d] text-[#172033] dark:text-[#f1f5f9] transition-colors duration-200">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:px-7 md:py-6 lg:px-9 lg:py-7 pb-36 md:pb-12 w-full overflow-x-hidden">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
      <BottomNav />
      <ToastContainer />
      <AnnouncementPopup />
    </div>
  );
}
