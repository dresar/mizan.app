"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightAction,
      className = "",
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[#94A3B8] pointer-events-none shrink-0">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full h-9 rounded-lg border bg-white px-3 text-xs text-[#172033] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E]/30 disabled:opacity-50 disabled:bg-[#F8FAFC] ${
              icon ? "pl-9" : ""
            } ${rightAction ? "pr-10" : ""} ${
              error ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20" : "border-[#E2E8F0]"
            } ${className}`}
            {...props}
          />
          {rightAction && (
            <div className="absolute right-2.5 flex items-center">{rightAction}</div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-[#DC2626]">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#94A3B8]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface PasswordInputProps extends Omit<InputProps, "type" | "rightAction"> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [show, setShow] = useState(false);

    return (
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        rightAction={
          <button
            type="button"
            onClick={() => setShow(!show)}
            tabIndex={-1}
            aria-label={show ? "Sembunyikan" : "Tampilkan"}
            className="p-1 text-[#94A3B8] hover:text-[#172033] transition-colors rounded-sm"
          >
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className = "", id, children, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full h-9 rounded-lg border bg-white px-3 pr-8 text-xs text-[#172033] font-semibold appearance-none outline-none transition-all focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E]/30 disabled:opacity-50 disabled:bg-[#F8FAFC] ${
              error ? "border-[#DC2626] focus:border-[#DC2626]" : "border-[#E2E8F0]"
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-2.5 pointer-events-none text-[#94A3B8]">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-[#DC2626]">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#94A3B8]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, disabled, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={`w-full rounded-lg border bg-white p-2.5 text-xs text-[#172033] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E]/30 disabled:opacity-50 disabled:bg-[#F8FAFC] ${
            error ? "border-[#DC2626] focus:border-[#DC2626]" : "border-[#E2E8F0]"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11px] font-medium text-[#DC2626]">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#94A3B8]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
