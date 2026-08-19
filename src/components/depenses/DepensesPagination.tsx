// ============================================================
// src/components/depenses/DepensesPagination.tsx - OPTIMISÉ
// ============================================================
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = { light: { border: '#E2E8F0', text: '#0F172A', muted: '#64748B', primary: '#6366F1' }, dark: { border: '#334155', text: '#F8FAFC', muted: '#94A3B8', primary: '#6366F1' } };

interface DepensesPaginationProps { currentPage: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void; }

const DepensesPagination: React.FC<DepensesPaginationProps> = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  const { isDark } = useTheme(); const theme = isDark ? COLORS.dark : COLORS.light;
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return []; const numbers = []; const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2)); let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) numbers.push(i); return numbers;
  }, [currentPage, totalPages]);
  if (totalPages <= 1) return null;
  return (
      <div className="mt-1 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 w-full">
 
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
        Total : <span style={{ color: theme.text }} className="font-black">{totalItems}</span> dépenses au total
   </div>
   
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:bg-indigo-500/10" style={{ borderColor: theme.border, color: theme.muted }}><ChevronLeft size={16} /></button>
        {pageNumbers.map(num => (<button key={num} onClick={() => onPageChange(num)} className="px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium" style={{ background: currentPage === num ? theme.primary : 'transparent', color: currentPage === num ? '#FFFFFF' : theme.muted }}>{num}</button>))}
        <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:bg-indigo-500/10" style={{ borderColor: theme.border, color: theme.muted }}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};
export default DepensesPagination;