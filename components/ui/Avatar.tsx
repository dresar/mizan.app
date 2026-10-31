"use client";

import React, { useState } from "react";

interface AvatarProps {
  initials: string;
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "gold" | "neutral";
  className?: string;
}

export function Avatar({
  initials,
  src,
  name,
  size = "md",
  variant = "primary",
  className = ""
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  let sizeClass = "w-10 h-10 text-sm";
  if (size === "xs") sizeClass = "w-6 h-6 text-[10px]";
  if (size === "sm") sizeClass = "w-8 h-8 text-xs";
  if (size === "lg") sizeClass = "w-12 h-12 text-base font-semibold";
  if (size === "xl") sizeClass = "w-16 h-16 text-xl font-bold";

  let colorClass = "bg-[#1B4D3E] text-white border border-[#143B2F]";
  if (variant === "gold") colorClass = "bg-[#C5A059] text-white border border-[#AD8742]";
  if (variant === "neutral") colorClass = "bg-[#FAF7F2] text-[#1B4D3E] border border-[#E5DECE]";

  if (src && !imgError) {
    return (
      <div
        title={name || initials}
        className={`inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-xs border border-[#E2EBF4] ${sizeClass} ${className}`}
      >
        <img
          src={src}
          alt={name || initials}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
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
