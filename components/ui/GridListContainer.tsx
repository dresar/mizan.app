"use client";

import React from "react";
import { ViewMode } from "./ViewModeToggle";

export interface GridListContainerProps {
  mode: ViewMode;
  children: React.ReactNode;
  gridClassName?: string;
  listClassName?: string;
  className?: string;
  empty?: boolean;
  emptyComponent?: React.ReactNode;
}

export function GridListContainer({
  mode,
  children,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3",
  listClassName = "space-y-2",
  className = "",
  empty = false,
  emptyComponent
}: GridListContainerProps) {
  if (empty && emptyComponent) {
    return <div className={className}>{emptyComponent}</div>;
  }

  if (mode === "grid") {
    return <div className={`${gridClassName} ${className}`}>{children}</div>;
  }

  return <div className={`${listClassName} ${className}`}>{children}</div>;
}
