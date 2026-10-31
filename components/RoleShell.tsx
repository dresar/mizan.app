"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { ToastContainer } from "@/components/ui/Toast";

interface RoleShellProps {
  children: React.ReactNode;
}

export function RoleShell({ children }: RoleShellProps) {
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
