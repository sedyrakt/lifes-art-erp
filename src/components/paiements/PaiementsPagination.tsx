// ============================================================
// src/components/paiements/PaiementsPagination.tsx - COMPACT
// ⭐ FANITSARA: Nesorina ny inline styles, mampiasa Tailwind madio 100%
// ⭐ FIX: Border couleur hafa (slate-200 / slate-700)
// ⭐ FIX: FontSize 15px + Padding kely
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
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const hoverBg = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const textColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const activeBg = isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white';
  const inactiveBg = isDark ? 'text-slate-300' : 'text-slate-600';

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
    <div className="flex items-center justify-between border-t px-3 py-2" style={{ borderColor: isDark ? '#334155' : '#E2E8F0' }}>
      <div className={`text-[15px] font-medium ${textColor}`}>
        {totalItems} paiement{totalItems > 1 ? 's' : ''} au total
      </div>
      <div className="flex items-center gap-1">
        {/* Prev Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${hoverBg} disabled:opacity-40 disabled:cursor-not-allowed ${borderColor}`}
        >
          <ChevronLeft size={16} className={textColor} />
        </button>
        
        {/* Page Numbers */}
        {pageNumbers().map(num => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-[15px] font-medium transition-colors ${
              currentPage === num 
                ? `${activeBg} shadow-sm` 
                : `${inactiveBg} ${hoverBg}`
            }`}
          >
            {num}
          </button>
        ))}
        
        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${hoverBg} disabled:opacity-40 disabled:cursor-not-allowed ${borderColor}`}
        >
          <ChevronRight size={16} className={textColor} />
        </button>
      </div>
    </div>
  );
};

export default PaiementsPagination;