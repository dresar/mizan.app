"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrtuRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ortu/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
    </div>
  );
}
