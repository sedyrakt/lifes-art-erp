// ============================================================
// src/components/sorties/SortiesHeader.tsx
// ============================================================
import React from 'react'; import { ArrowUp, Plus, RefreshCw } from 'lucide-react'; import { useTheme } from '../../contexts/ThemeContext';

interface SortiesHeaderProps { onAddSortie: () => void; refreshing?: boolean; onRefresh?: () => void; }

const SortiesHeader: React.FC<SortiesHeaderProps> = ({ onAddSortie, refreshing = false, onRefresh }) => {
  const { isDark } = useTheme();
  return (<div className="mb-5"><div className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_14px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#0F172A] dark:hover:shadow-none md:flex-row md:items-center md:justify-between">
    <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15"><ArrowUp size={19} strokeWidth={2} /></div><div className="min-w-0"><h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">Sorties de stock</h1><p className="mt-1 truncate text-[13px] font-medium leading-tight text-slate-500 dark:text-slate-400">Enregistrez et suivez les sorties de marchandises</p></div></div>
    <div className="flex w-full items-center gap-2 md:w-auto">{onRefresh && <button type="button" onClick={onRefresh} disabled={refreshing} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Actualiser les sorties"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /><span className="hidden sm:inline">Actualiser</span></button>}
    <button type="button" onClick={onAddSortie} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all duration-150 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/20 active:scale-[0.98] sm:flex-none dark:bg-indigo-500 dark:hover:bg-indigo-600" aria-label="Nouvelle sortie"><Plus size={16} strokeWidth={2.2} /><span>Nouvelle sortie</span></button>
    </div>
  </div></div>);
};
export default SortiesHeader;