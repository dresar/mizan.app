"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "gold"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "destructive-solid";

export type ButtonSize = "compact" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      disabled = false,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    let sizeClasses = "h-9 px-3.5 text-xs rounded-lg";
    if (size === "compact") {
      sizeClasses = "h-8 px-2.5 text-[11px] rounded-[6px]";
    } else if (size === "lg") {
      sizeClasses = "h-10 px-4 text-xs sm:text-sm rounded-lg";
    } else if (size === "icon") {
      sizeClasses = "size-8.5 p-1.5 rounded-lg flex items-center justify-center shrink-0";
    }

    let variantClasses = "bg-[#1B4D3E] text-white hover:bg-[#153E32] shadow-2xs border border-transparent";
    if (variant === "gold") {
      variantClasses = "bg-[#C5A059] text-white hover:bg-[#B08C48] shadow-2xs border border-transparent";
    } else if (variant === "secondary") {
      variantClasses = "bg-[#EEF2F6] text-[#172033] hover:bg-[#E2E8F0] border border-[#CBD5E1]/60 shadow-2xs";
    } else if (variant === "outline") {
      variantClasses = "bg-white text-[#1B4D3E] border border-[#1B4D3E]/40 hover:bg-[#1B4D3E]/10";
    } else if (variant === "ghost") {
      variantClasses = "bg-transparent text-[#64748B] hover:text-[#172033] hover:bg-[#EEF2F6] border border-transparent";
    } else if (variant === "destructive") {
      variantClasses = "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2]";
    } else if (variant === "destructive-solid") {
      variantClasses = "bg-[#DC2626] text-white hover:bg-[#B91C1C] border border-transparent shadow-2xs";
    }

    const widthClass = fullWidth ? "w-full" : "";
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-1.5 font-bold tracking-tight transition-all duration-150 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            {size !== "icon" && <span>Proses</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="shrink-0">{icon}</span>
            )}
            {children && <span>{children}</span>}
            {icon && iconPosition === "right" && (
              <span className="shrink-0">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
