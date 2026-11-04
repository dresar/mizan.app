"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrtuRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ortu/dashboard");
  }, [router]);

  return null;
}
