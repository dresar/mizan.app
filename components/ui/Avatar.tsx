"use client";

import React, { useState } from "react";

interface AvatarProps {
  initials: string;
  src?: string | null;
  name?: string;
  gender?: "Putra" | "Putri" | string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  variant?: "primary" | "gold" | "neutral";
  className?: string;
}

export function Avatar({
  initials,
  src,
  name,
  gender,
  size = "md",
  variant = "primary",
  className = ""
}: AvatarProps) {
  const isFemale = gender === "Putri" || variant === "gold";
  const defaultAvatar = isFemale
    ? "/default-avatar-ustadzah.jpg"
    : "/default-avatar-ustadz.jpg";

  const isRealImageUrl = (url?: string | null): boolean => {
    if (!url) return false;
    const clean = url.trim();
    return (
      clean.startsWith("/") ||
      clean.startsWith("http://") ||
      clean.startsWith("https://") ||
      clean.startsWith("data:image")
    );
  };

  const initialSrc = isRealImageUrl(src) ? src!.trim() : defaultAvatar;
  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [hasFailedDefault, setHasFailedDefault] = useState(false);

  React.useEffect(() => {
    setCurrentSrc(isRealImageUrl(src) ? src!.trim() : defaultAvatar);
    setHasFailedDefault(false);
  }, [src, defaultAvatar]);

  let sizeClass = "w-12 h-12 text-sm font-bold";
  if (size === "xs") sizeClass = "w-7 h-7 text-[11px] font-semibold";
  if (size === "sm") sizeClass = "w-9 h-9 text-xs font-bold";
  if (size === "lg") sizeClass = "w-16 h-16 text-lg font-black";
  if (size === "xl") sizeClass = "w-20 h-20 text-2xl font-black";
  if (size === "2xl") sizeClass = "w-24 h-24 text-3xl font-black";
  if (size === "3xl") sizeClass = "w-28 h-28 text-4xl font-black";

  let colorClass = "bg-[#1B4D3E] text-white border border-[#143B2F]";
  if (variant === "gold") colorClass = "bg-[#C5A059] text-white border border-[#AD8742]";
  if (variant === "neutral") colorClass = "bg-[#FAF7F2] text-[#1B4D3E] border border-[#E5DECE]";

  if (!hasFailedDefault) {
    return (
      <div
        title={name || initials}
        className={`inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-xs border border-[#E2EBF4] ${sizeClass} ${className}`}
      >
        <img
          src={currentSrc}
          alt={name || initials}
          onError={() => {
            if (currentSrc !== defaultAvatar) {
              setCurrentSrc(defaultAvatar);
            } else {
              setHasFailedDefault(true);
            }
          }}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div
      title={name || initials}
      className={`inline-flex items-center justify-center shrink-0 rounded-2xl font-bold select-none shadow-xs ${sizeClass} ${colorClass} ${className}`}
    >
      {initials}
    </div>
  );
}
