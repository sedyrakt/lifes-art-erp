// ============================================================
// src/components/mouvements/MouvementsHeader.tsx
// ============================================================
import React from 'react'; import { Activity, Printer, Download, RefreshCw } from 'lucide-react';

interface MouvementsHeaderProps { onPrint: () => void; onExport: () => void; refreshing?: boolean; onRefresh?: () => void; }

const MouvementsHeader: React.FC<MouvementsHeaderProps> = ({ onPrint, onExport, refreshing = false, onRefresh }) => {
  return (
    <div className="mb-5">
      <div className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_4px_14px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#0F172A] dark:hover:border-indigo-500/30 dark:hover:shadow-none md:flex-row md:items-center md:justify-between">
        <div className="absolute left-0 top-0 h-full w-[2px] rounded-l-xl bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15"><Activity size={20} strokeWidth={2} /></div>
          <div className="min-w-0"><h1 className="truncate text-[18px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">Mouvements de stock</h1><p className="mt-1 truncate text-[12px] font-medium leading-none text-slate-500 dark:text-slate-400">Historique des mouvements de stock</p></div>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto md:shrink-0">
          {onRefresh && <button type="button" onClick={onRefresh} disabled={refreshing} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white md:flex-none" aria-label="Actualiser les mouvements" title="Actualiser"><RefreshCw size={15} strokeWidth={2} className={refreshing ? 'animate-spin' : ''} /><span>Actualiser</span></button>}
          <button type="button" onClick={onPrint} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white md:flex-none" aria-label="Imprimer les mouvements" title="Imprimer"><Printer size={15} strokeWidth={2} /><span>Imprimer</span></button>
          <button type="button" onClick={onExport} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98] md:flex-none dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-400/20" aria-label="Exporter les mouvements" title="Exporter"><Download size={15} strokeWidth={2} /><span>Exporter</span></button>
        </div>
      </div>
    </div>
  );
};
export default MouvementsHeader;