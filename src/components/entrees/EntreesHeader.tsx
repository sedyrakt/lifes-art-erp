// ============================================================
// src/components/entrees/EntreesHeader.tsx
// ============================================================
import React from 'react'; import { ArrowDown, Plus, RefreshCw } from 'lucide-react'; import { useTheme } from '../../contexts/ThemeContext';

interface EntreesHeaderProps { onAddEntree: () => void; refreshing?: boolean; onRefresh?: () => void; }

const EntreesHeader: React.FC<EntreesHeaderProps> = ({ onAddEntree, refreshing = false, onRefresh }) => {
  const { isDark } = useTheme();
  return (<div className="mb-5"><div className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 md:flex-row md:items-center md:justify-between dark:bg-[#0F172A]" style={{ borderColor: isDark ? '#1E293B' : '#E2E8F0' }}>
    <div className="absolute left-0 top-0 h-full w-[2px] bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15"><ArrowDown size={19} strokeWidth={2} /></div><div className="min-w-0"><h1 className="truncate text-[18px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">Entrées de stock</h1><p className="mt-1 truncate text-[12px] font-medium leading-none text-slate-500 dark:text-slate-400">Enregistrement et suivi des entrées de marchandises</p></div></div>
    <div className="flex w-full shrink-0 items-center gap-2 md:w-auto">
      {onRefresh && <button type="button" onClick={onRefresh} disabled={refreshing} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" style={{ borderColor: isDark ? '#334155' : '#E2E8F0', background: isDark ? '#0F172A' : '#FFFFFF' }} aria-label="Actualiser les entrées"><RefreshCw size={15} strokeWidth={2} className={refreshing ? 'animate-spin' : ''} /><span className="hidden sm:inline">Actualiser</span></button>}
      <button type="button" onClick={onAddEntree} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 active:scale-[0.98] sm:flex-none dark:bg-indigo-500 dark:hover:bg-indigo-600" aria-label="Nouvelle entrée"><Plus size={16} strokeWidth={2.2} /><span>Nouvelle entrée</span></button>
    </div>
  </div></div>);
};
export default EntreesHeader;