"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMizan } from "@/lib/mizan-context";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { ToastContainer } from "@/components/ui/Toast";

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser?.id || !activeRole) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8]">
      <Header />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 pb-36 md:pb-10 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
