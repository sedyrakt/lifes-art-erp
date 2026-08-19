// ============================================================
// src/components/paiements/PaiementsPagination.tsx - UNIFIED DESIGN
// ⭐ FANITSARA: Nesorina ny inline styles, mampiasa Tailwind madio 100%
// ============================================================

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PaiementsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const PaiementsPagination: React.FC<PaiementsPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const { isDark } = useTheme();
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-300';

  if (totalPages <= 1) return null;

  const pageNumbers = () => {
    const numbers = [];
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) numbers.push(i);
    return numbers;
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {totalItems} paiement{totalItems > 1 ? 's' : ''} au total
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed ${borderColor}`}
        >
          <ChevronLeft size={16} className="text-slate-500 dark:text-slate-400" />
        </button>
        
        {pageNumbers().map(num => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              currentPage === num 
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {num}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed ${borderColor}`}
        >
          <ChevronRight size={16} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default PaiementsPagination;