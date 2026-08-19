// ============================================================
// src/components/fournisseurs/FournisseursPagination.tsx
// ============================================================
// ⭐ PREMIUM PAGINATION
// ⭐ DARK / LIGHT
// ⭐ 7 PAGES MAX
// ⭐ SAFE PAGE VALUES
// ============================================================

import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  light: {
    border: '#E2E8F0',
    text: '#0F172A',
    muted: '#64748B',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    background: '#FFFFFF',
  },
  dark: {
    border: '#334155',
    text: '#F8FAFC',
    muted: '#94A3B8',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    background: 'rgba(255,255,255,0.03)',
  },
};

// ============================================================
// PROPS
// ============================================================

interface FournisseursPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

// ============================================================
// COMPONENT
// ============================================================

const FournisseursPagination: React.FC<FournisseursPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  // ==========================================================
  // SAFE VALUES
  // ==========================================================

  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safeTotalItems = Math.max(0, Number(totalItems) || 0);
  const safeCurrentPage = Math.max(
    1,
    Math.min(Number(currentPage) || 1, safeTotalPages)
  );

  // ==========================================================
  // PAGE NUMBERS
  // ==========================================================

  const pageNumbers = useMemo(() => {
    if (safeTotalPages <= 1) return [];
    const maxVisible = 7;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(safeTotalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const numbers: number[] = [];
    for (let page = start; page <= end; page++) {
      numbers.push(page);
    }
    return numbers;
  }, [safeCurrentPage, safeTotalPages]);

  // ==========================================================
  // PREVIOUS
  // ==========================================================

  const handlePrevious = useCallback(() => {
    const page = Math.max(1, safeCurrentPage - 1);
    if (page !== safeCurrentPage) {
      onPageChange(page);
    }
  }, [safeCurrentPage, onPageChange]);

  // ==========================================================
  // NEXT
  // ==========================================================

  const handleNext = useCallback(() => {
    const page = Math.min(safeTotalPages, safeCurrentPage + 1);
    if (page !== safeCurrentPage) {
      onPageChange(page);
    }
  }, [safeCurrentPage, safeTotalPages, onPageChange]);

  // ==========================================================
  // PAGE CLICK
  // ==========================================================

  const handlePageClick = useCallback(
    (page: number) => {
      if (page === safeCurrentPage) return;
      const safePage = Math.max(1, Math.min(page, safeTotalPages));
      onPageChange(safePage);
    },
    [safeCurrentPage, safeTotalPages, onPageChange]
  );

  // ==========================================================
  // HIDE
  // ==========================================================

  if (safeTotalPages <= 1) return null;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="mt-1 flex w-full flex-col items-center justify-between gap-4 px-2 sm:flex-row">
      {/* ======================================================
          TOTAL
      ====================================================== */}
      <div
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: theme.muted }}
      >
        Total :{' '}
        <span className="font-black" style={{ color: theme.text }}>
          {safeTotalItems}
        </span>{' '}
        fournisseurs
      </div>

      {/* ======================================================
          PAGINATION BUTTONS
      ====================================================== */}
      <div className="flex items-center gap-1.5">
        {/* ====================================================
            PREVIOUS
        ==================================================== */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={safeCurrentPage === 1}
          aria-label="Page précédente"
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-30"
          style={{ borderColor: theme.border, color: theme.muted }}
        >
          <ChevronLeft size={16} />
        </button>

        {/* ====================================================
            PAGE NUMBERS
        ==================================================== */}
        {pageNumbers.map((page) => {
          const isActive = safeCurrentPage === page;
          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageClick(page)}
              aria-current={isActive ? 'page' : undefined}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shadow-sm transition-all duration-200 active:scale-95"
              style={{
                background: isActive ? theme.primary : theme.background,
                color: isActive ? '#FFFFFF' : theme.text,
                border: `1px solid ${isActive ? theme.primary : theme.border}`,
              }}
            >
              {page}
            </button>
          );
        })}

        {/* ====================================================
            NEXT
        ==================================================== */}
        <button
          type="button"
          onClick={handleNext}
          disabled={safeCurrentPage === safeTotalPages}
          aria-label="Page suivante"
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-30"
          style={{ borderColor: theme.border, color: theme.muted }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default FournisseursPagination;