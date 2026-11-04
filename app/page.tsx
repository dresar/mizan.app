"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMizan } from "@/lib/mizan-context";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isAuthLoading } = useMizan();

  useEffect(() => {
    if (isAuthLoading) return;
    if (currentUser?.id) {
      if (currentUser.role === "SUPER_ADMIN") {
        router.replace("/admin/dashboard");
      } else if (currentUser.role === "PENGASUHAN") {
        router.replace("/bk/dashboard");
      } else if (currentUser.role === "ORTU") {
        router.replace("/ortu/dashboard");
      } else {
        router.replace("/guru/dashboard");
      }
    } else {
      router.replace("/login");
    }
  }, [currentUser, isAuthLoading, router]);

  return null;
}
