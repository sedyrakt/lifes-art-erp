// ============================================================
// src/components/entrees/EntreesPagination.tsx - PREMIUM UI (CLEAN DARK MODE)
// ⭐ Keyset Pagination (Prev/Next) - Unified with ProduitsTable
// ============================================================
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface EntreesPaginationProps {
  currentPage: number;
  totalItems: number;
  hasMore: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

const EntreesPagination: React.FC<EntreesPaginationProps> = ({ 
  currentPage, totalItems, hasMore, onNext, onPrevious 
}) => {
  const { isDark } = useTheme();

  if (totalItems === 0) return null;

  // ⭐ Loko mifanaraka amin'ny Dashboard (ProduitsTable)
  const borderClass = isDark ? 'border-slate-800' : 'border-slate-200';
  const bgClass = isDark ? 'bg-[#111c30]' : 'bg-white';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const textStrong = isDark ? 'text-slate-100' : 'text-slate-900';
  const btnHover = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const disabledClass = 'opacity-40 cursor-not-allowed';

  return (
    <div className={`mt-2 flex w-full items-center justify-between rounded-xl border px-4 py-3 shadow-sm transition-all duration-200 ${bgClass} ${borderClass}`}>
      
      {/* ⭐ Gauche : Total (Uppercase tahaka ny an'ny Produit) */}
      <div className={`text-[13px] font-bold uppercase tracking-wider ${textMuted}`}>
        TOTAL : <span className={`font-black ${textStrong}`}>{totalItems}</span> entrée{totalItems > 1 ? 's' : ''}
      </div>

      {/* ⭐ Droite : Boutons de navigation + Page actuelle */}
      <div className="flex items-center gap-1.5">
        {/* PREVIOUS */}
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${borderClass} bg-transparent transition-colors ${textMuted} ${currentPage === 1 ? disabledClass : btnHover}`}
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>

        {/* CURRENT PAGE */}
        <div 
          className="flex h-9 min-w-[36px] items-center justify-center rounded-lg px-3 text-[13px] font-bold text-white shadow-sm bg-indigo-600 dark:bg-indigo-500"
        >
          {currentPage}
        </div>

        {/* NEXT */}
        <button
          onClick={onNext}
          disabled={!hasMore}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${borderClass} bg-transparent transition-colors ${textMuted} ${!hasMore ? disabledClass : btnHover}`}
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default EntreesPagination;