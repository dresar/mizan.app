"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMizan } from "@/lib/mizan-context";

export default function GuruAbsenRedirectPage() {
  const router = useRouter();
  const { activeRole, showToast } = useMizan();

  useEffect(() => {
    if (activeRole === "PENGASUHAN" || activeRole === "SUPER_ADMIN") {
      router.replace("/bk/absen");
    } else {
      showToast("Fitur absensi sholat dikelola oleh Pengasuhan (BK)", "info");
      router.replace("/guru/dashboard");
    }
  }, [router, activeRole, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
    </div>
  );
}
