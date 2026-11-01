"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function OrtuDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
      <div className="mizan-card p-6 text-center max-w-sm space-y-3 bg-white">
        <div className="w-12 h-12 rounded-2xl mizan-inset mx-auto flex items-center justify-center text-[#A8833E]">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-base font-bold text-[#172033]">
          Akses Dinonaktifkan Sementara
        </h1>
        <p className="text-xs text-[#64748B]">
          Fokus sistem saat ini dialihkan pada portal Guru dan Super Admin Pengasuhan.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full py-2.5 rounded-full mizan-btn-primary text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Masuk</span>
        </button>
      </div>
    </div>
  );
}
