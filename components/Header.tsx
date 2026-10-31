"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Users, ChevronDown, Check } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Avatar } from "@/components/ui/Avatar";

export function Header() {
  const router = useRouter();
  const { currentUser, switchRole, userList } = useMizan();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelectUser = (userId: string) => {
    const target = userList.find((u) => u.id === userId);
    if (!target) return;
    switchRole(target.role, target.id);
    setDropdownOpen(false);
    if (target.role === "SUPER_ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/guru/dashboard");
    }
  };

  const dashboardHref =
    currentUser.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/guru/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2EBF4] shadow-xs">
      <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-3 max-w-6xl mx-auto">
        <Link href={dashboardHref} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl mizan-card bg-[#1B4D3E] text-[#C5A059] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-[#C5A059]" />
          </div>
          <span className="font-serif font-black tracking-wide text-[#1B4D3E] text-lg sm:text-xl">
            MIZAN
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mizan-pill bg-white text-left transition-colors"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <Users className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0" />
              <span className="text-xs font-bold text-[#172033] max-w-[130px] sm:max-w-[200px] truncate">
                {currentUser.name.split(" ")[0]} ({currentUser.gender ? currentUser.gender : "Admin"})
              </span>
              <ChevronDown className="w-3 h-3 text-[#64748B] shrink-0" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2EBF4] py-1.5 z-50 text-xs mizan-card"
                role="menu"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase border-b border-[#E2EBF4]">
                  Ganti Akun Pembina
                </div>

                {userList.map((u) => {
                  const isCurrent = currentUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u.id)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors ${
                        isCurrent ? "font-bold text-[#1B4D3E] bg-[#ECFDF5]" : "text-[#172033]"
                      }`}
                      role="menuitem"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block font-bold text-xs truncate">{u.name}</span>
                        <span className="text-[10px] text-[#64748B] block truncate">{u.roleTitle}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#1B4D3E] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/guru/profil" className="shrink-0">
            <Avatar initials={currentUser.avatarInitials || "MZ"} size="sm" variant="primary" />
          </Link>
        </div>
      </div>
    </header>
  );
}
