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

  return null;
}

export default function BkIndexPage() {
  return (
    <Suspense fallback={null}>
      <BkRedirectContent />
    </Suspense>
  );
}
