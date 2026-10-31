"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-[#D4C9B5] ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#FAF7EE] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-[#1C2826] mb-1">
        {title}
      </h4>
      <p className="text-xs text-[#5C6B64] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#1B4D3E] text-white hover:bg-[#143B2F] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
