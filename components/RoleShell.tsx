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

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated || !currentUser?.id || !activeRole) {
    return null;
  }

  const isAuthorized = (() => {
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F1E8] p-4 text-center">
        <div className="max-w-md w-full p-6 rounded-3xl bg-white border border-[#E2EBF4] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#172033]">Akses Ditolak</h2>
          <p className="text-xs text-[#64748B]">
            Anda tidak memiliki wewenang untuk membuka halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8]">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 p-2.5 sm:p-3.5 md:p-4 pb-36 md:pb-8 w-full overflow-x-hidden">
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
