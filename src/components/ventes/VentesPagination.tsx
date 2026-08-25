// src/components/ventes/VentesPagination.tsx
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = { 
  light: { border: '#E2E8F0', text: '#0F172A', muted: '#64748B', primary: '#6366F1' },
  dark: { border: '#334155', text: '#F8FAFC', muted: '#94A3B8', primary: '#6366F1' }
};

interface VentesPaginationProps { 
  currentPage: number; 
  totalPages: number; 
  totalItems: number; 
  onPageChange: (page: number) => void; 
}

const VentesPagination: React.FC<VentesPaginationProps> = ({ 
  currentPage, totalPages, totalItems, onPageChange 
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return []; 
    if (totalPages === 1) return [1]; 

    const numbers = [];
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) numbers.push(i);
    return numbers;
  }, [currentPage, totalPages]);

  if (totalPages === 0) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 w-full">
      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
        Total : <span style={{ color: theme.text }} className="font-black">{totalItems}</span> {totalItems > 1 ? 'éléments' : 'élément'}
      </div>
      
      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
          disabled={currentPage === 1} 
          className="p-2 rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:bg-indigo-500/10 hover:border-indigo-500/30" 
          style={{ borderColor: theme.border, color: theme.muted }}
        >
          <ChevronLeft size={16} />
        </button>
        
        {pageNumbers.map(num => {
          const isActive = currentPage === num;
          return (
            <button 
              key={num} 
              onClick={() => onPageChange(num)} 
              className="w-9 h-9 rounded-xl transition-all duration-200 text-xs font-bold flex items-center justify-center shadow-sm" 
              style={{ 
                background: isActive ? theme.primary : (isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF'),
                color: isActive ? '#FFFFFF' : theme.text,
                border: `1px solid ${isActive ? theme.primary : theme.border}`
              }}
            >
              {num}
            </button>
          );
        })}
        
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
          disabled={currentPage === totalPages} 
          className="p-2 rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:bg-indigo-500/10 hover:border-indigo-500/30" 
          style={{ borderColor: theme.border, color: theme.muted }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default VentesPagination;