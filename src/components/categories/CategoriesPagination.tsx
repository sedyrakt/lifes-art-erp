// src/components/categories/CategoriesPagination.tsx
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface CategoriesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const CategoriesPagination: React.FC<CategoriesPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const { isDark } = useTheme();

  // ⭐ VAOVAO: Mitovy amin'ny ProduitsPagination (block 7 isaky ny indray)
  const pages = useMemo<number[]>(() => {
    if (totalPages <= 1) return [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const blockSize = 7;
    // Kajy ny block misy ny page ankehitriny
    const blockIndex = Math.floor((currentPage - 1) / blockSize);
    const startPage = blockIndex * blockSize + 1;
    const endPage = Math.min(startPage + blockSize - 1, totalPages);

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [currentPage, totalPages]);

  if (totalItems === 0 || totalPages === 0) return null;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Loko araka ny Theme
  const textColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const textColorHighlight = isDark ? 'text-white' : 'text-slate-900';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const hoverBg = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100';

  return (
    <div className="flex w-full items-center justify-between px-1 py-3">
      
      {/* TOTAL : X CATÉGORIES */}
      <div className={`text-[11px] font-bold uppercase tracking-widest ${textColor}`}>
        Total : <span className={textColorHighlight}>{totalItems}</span> CATÉGORIE{totalItems > 1 ? 'S' : ''}
      </div>

      {/* NAVIGATION */}
      <div className="flex items-center gap-1.5">
        
        {/* PREVIOUS (<) */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${borderColor} bg-transparent ${hoverBg}`}
          style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          aria-label="Page précédente"
        >
          <ChevronLeft size={15} />
        </button>

        {/* PAGES (1-7, 8-14, ...) */}
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`flex h-8 min-w-[32px] items-center justify-center rounded-xl px-2 text-xs font-bold transition-all ${
                isActive
                  ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm'
                  : `border bg-transparent ${borderColor} ${hoverBg}`
              }`}
              style={{ color: isActive ? '#FFFFFF' : (isDark ? '#94A3B8' : '#475569') }}
            >
              {page}
            </button>
          );
        })}

        {/* NEXT (>) */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${borderColor} bg-transparent ${hoverBg}`}
          style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          aria-label="Page suivante"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default CategoriesPagination;