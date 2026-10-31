"use client";

import React from "react";

interface ScoreBarProps {
  score: number;
  baseScore?: number;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreBar({
  score,
  baseScore = 70.0,
  showLabels = true,
  size = "md",
  className = ""
}: ScoreBarProps) {
  const clampedScore = Math.max(0, Math.min(99, score));
  const percentage = (clampedScore / 99) * 100;

  let barColor = "bg-[#1B4D3E]";
  let textColor = "text-[#1B4D3E]";

  if (clampedScore < 70) {
    barColor = "bg-[#9B2C2C]";
    textColor = "text-[#9B2C2C]";
  } else if (clampedScore < 80) {
    barColor = "bg-[#C5A059]";
    textColor = "text-[#A8833E]";
  }

  const heightClass = size === "sm" ? "h-2" : size === "lg" ? "h-3.5" : "h-2.5";

  const formattedScore = score.toFixed(3).replace(".", ",");
  const formattedBase = baseScore.toFixed(3).replace(".", ",");

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-medium mb-1.5">
          <span className="text-[#5C6B64]">
            Nilai Akhlak (Dasar: {formattedBase})
          </span>
          <span className={`font-bold font-mono ${textColor}`}>
            {formattedScore} / 99,000
          </span>
        </div>
      )}

      <div className={`w-full bg-[#EAE3D2] rounded-2xl overflow-hidden relative ${heightClass}`}>
        <div
          className={`h-full rounded-2xl transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-black/30"
          style={{ left: `${(baseScore / 99) * 100}%` }}
          title={`Nilai Awal: ${formattedBase}`}
        />
      </div>
    </div>
  );
}
