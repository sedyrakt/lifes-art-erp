import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ClientsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const ClientsPagination: React.FC<ClientsPaginationProps> = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  const { isDark } = useTheme();
  const theme = isDark ? { border: '#334155', text: '#F8FAFC', muted: '#94A3B8', primary: '#6366F1', surface: 'rgba(255,255,255,0.03)' } : { border: '#E2E8F0', text: '#0F172A', muted: '#64748B', primary: '#6366F1', surface: '#FFFFFF' };

  // ⭐ BLOC 7: 1-7, 8-14, 15-21...
  const pages = useMemo<number[]>(() => {
    if (totalPages <= 1) return [];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const blockSize = 7;
    const blockIndex = Math.floor((currentPage - 1) / blockSize);
    const startPage = blockIndex * blockSize + 1;
    const endPage = Math.min(startPage + blockSize - 1, totalPages);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex w-full flex-col items-center justify-between gap-3 px-1 sm:flex-row">
      <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
        Total : <span className="font-black" style={{ color: theme.text }}>{totalItems}</span> clients
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:bg-indigo-500/10 hover:border-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-30" style={{ borderColor: theme.border, color: theme.muted, background: theme.surface }}><ChevronLeft size={16} /></button>
        {pages.map(page => {
          const active = currentPage === page;
          return (<button key={page} type="button" onClick={() => onPageChange(page)} aria-current={active ? 'page' : undefined} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold shadow-sm transition-all duration-200 active:scale-95" style={{ background: active ? theme.primary : theme.surface, color: active ? '#FFFFFF' : theme.text, borderColor: active ? theme.primary : theme.border }}>{page}</button>);
        })}
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:bg-indigo-500/10 hover:border-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-30" style={{ borderColor: theme.border, color: theme.muted, background: theme.surface }}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};
export default ClientsPagination;