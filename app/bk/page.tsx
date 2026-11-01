"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMizan } from "@/lib/mizan-context";

function BkRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useMizan();

  useEffect(() => {
    const u = searchParams.get("u") || currentUser?.username || "";
    const query = u ? `?u=${encodeURIComponent(u)}` : "";
    router.replace(`/bk/dashboard${query}`);
  }, [router, searchParams, currentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
      <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
    </div>
  );
}

export default function BkIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
          <div className="w-8 h-8 rounded-full border-2 border-[#1B4D3E] border-t-transparent animate-spin" />
        </div>
      }
    >
      <BkRedirectContent />
    </Suspense>
  );
}
