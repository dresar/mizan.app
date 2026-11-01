"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 20,
  itemName = "data",
  className = ""
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= itemsPerPage)) {
    return null;
  }

  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 1;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : itemsPerPage;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#EEF2F6] ${className}`}>
      {totalItems !== undefined && (
        <span className="text-xs text-[#64748B] font-medium order-2 sm:order-1">
          Menampilkan <strong className="font-mono text-[#172033]">{startItem}</strong> -{" "}
          <strong className="font-mono text-[#172033]">{endItem}</strong> dari{" "}
          <strong className="font-mono text-[#172033]">{totalItems}</strong> {itemName}
        </span>
      )}

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Sebelumnya"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#E2EBF4] bg-white text-[#172033] text-xs font-bold hover:bg-[#F8FAFC] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-[#94A3B8]">
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-[#1B4D3E] text-white shadow-2xs"
                    : "bg-white text-[#64748B] border border-[#E2EBF4] hover:text-[#172033] hover:bg-[#F8FAFC]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Selanjutnya"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#E2EBF4] bg-white text-[#172033] text-xs font-bold hover:bg-[#F8FAFC] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs flex items-center gap-1"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
