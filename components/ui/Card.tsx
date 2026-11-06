"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  accent?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
  accent = false
}: CardProps) {
  const clickableClass = onClick || hoverable
    ? "cursor-pointer hover:border-[#1B4D3E]/40 hover:-translate-y-0.5"
    : "";

  const accentClass = accent ? "border-l-4 border-l-[#1B4D3E]" : "";

  return (
    <div
      onClick={onClick}
      className={`mizan-card p-4 sm:p-5 ${clickableClass} ${accentClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardSub({
  children,
  className = "",
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const clickableClass = onClick ? "cursor-pointer" : "";
  return (
    <div
      onClick={onClick}
      className={`mizan-card-sub p-3.5 sm:p-4 ${clickableClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardInset({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mizan-inset p-3.5 sm:p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = ""
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-3 ${className}`}>
      <div>
        <h3 className="font-bold text-[#172033] dark:text-slate-100 text-sm sm:text-base leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 mt-0.5 leading-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mt-3 pt-3 border-t border-[#E2EBF4] dark:border-slate-800 flex items-center justify-between gap-2 ${className}`}
    >
      {children}
    </div>
  );
}
