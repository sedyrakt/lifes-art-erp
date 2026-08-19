// ============================================================
// src/components/rapports/RapportsHeader.tsx - SYNCED DESIGN
// ⭐ FIX: Background sy border namboarina mba hitovy amin'ny Dashboard Cards (bg-[#111c30])
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, Download, RefreshCw, ChevronDown, FileSpreadsheet, FileText, File as FileCsv, Trophy, ShoppingCart, Calendar, X, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { format, parseISO, isValid } from 'date-fns';

interface RapportsHeaderProps {
  selectedDate: Date;
  granularity: 'jour' | 'semaine' | 'mois' | 'annee';
  onDateChange: (date: Date) => void;
  onGranularityChange: (g: 'jour' | 'semaine' | 'mois' | 'annee') => void;
  onToday: () => void;
  onRefresh: () => void;
  onExportStats: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onExportTopProduits: () => void;
  onExportCommandes: () => void;
}

const RapportsHeader: React.FC<RapportsHeaderProps> = ({ 
  selectedDate, granularity, onDateChange, onGranularityChange, 
  onToday, onRefresh, onExportStats, onExportPDF, onExportCSV, 
  onExportTopProduits, onExportCommandes 
}) => {
  const { isDark } = useTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  // ⭐ Loko mifanaraka amin'ny Dashboard Cards
  const borderColor = isDark ? 'border-white/[0.055]' : 'border-slate-200';
  const cardBg = isDark ? 'bg-[#111c30]' : 'bg-white';
  const shadow = isDark ? 'shadow-[0_12px_40px_rgba(0,0,0,0.18)]' : 'shadow-[0_1px_2px_rgba(15,23,42,0.04)]';

  const safeFormatDate = (date: Date): string => {
    if (!date || !isValid(date)) return format(new Date(), 'yyyy-MM-dd');
    return format(date, 'yyyy-MM-dd');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;
    const parsed = parseISO(value);
    if (isValid(parsed)) onDateChange(parsed);
  };

  useEffect(() => {
    if (!showExportMenu) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) setShowExportMenu(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showExportMenu]);

  const periods = [
    { id: 'jour' as const, label: 'Jour' },
    { id: 'semaine' as const, label: 'Semaine' },
    { id: 'mois' as const, label: 'Mois' },
    { id: 'annee' as const, label: 'Année' }
  ];

  const exportItemClass = `group flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800`;

  return (
    <div className={`relative mb-5 w-full rounded-xl border ${borderColor} ${cardBg} ${shadow} px-4 py-3 transition-colors`}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className={`flex h-10 items-center rounded-lg border ${borderColor} bg-slate-50 dark:bg-slate-900/60 p-1`} role="tablist" aria-label="Période du rapport">
            {periods.map(period => {
              const active = granularity === period.id;
              return (
                <button
                  key={period.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onGranularityChange(period.id)}
                  className={`h-8 rounded-md px-3 text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-indigo-400 dark:ring-slate-700'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {period.label}
                </button>
              );
            })}
          </div>
          <label className={`group flex h-10 items-center gap-2 rounded-lg border ${borderColor} bg-white dark:bg-[#0F172A] px-3 transition-all hover:border-indigo-300 dark:hover:border-indigo-500/40`}>
            <Calendar size={16} strokeWidth={2} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
            <input
              type="date"
              value={safeFormatDate(selectedDate)}
              onChange={handleDateChange}
              aria-label="Date du rapport"
              className="min-w-[120px] bg-transparent text-[13px] font-medium text-slate-700 outline-none dark:text-slate-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </label>
          <button
            type="button"
            onClick={onToday}
            className={`flex h-10 items-center gap-2 rounded-lg border ${borderColor} bg-white dark:bg-[#0F172A] px-3 text-[13px] font-medium text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400`}
          >
            <BarChart3 size={15} strokeWidth={2} />Aujourd'hui
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div ref={exportMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(prev => !prev)}
              aria-expanded={showExportMenu}
              aria-haspopup="menu"
              className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Download size={16} strokeWidth={2} />
              <span>Exporter</span>
              <ChevronDown size={15} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>
            {showExportMenu && (
              <div
                role="menu"
                className={`absolute right-0 top-full z-[100] mt-2 w-[250px] overflow-hidden rounded-xl border ${borderColor} bg-white dark:bg-[#0F172A] py-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)] animate-in fade-in zoom-in-95 duration-100 dark:shadow-2xl`}
              >
                <div className={`flex items-center justify-between border-b ${borderColor} px-3 py-2.5`}>
                  <div className="flex items-center gap-2">
                    <Download size={14} className="text-indigo-500 dark:text-indigo-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Exporter les données</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(false)}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Fermer"
                  >
                    <X size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onExportStats(); setShowExportMenu(false); }}
                  className={exportItemClass}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <FileSpreadsheet size={15} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">Excel<span className="ml-1 text-slate-400 dark:text-slate-500"> · Statistiques</span></span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onExportPDF(); setShowExportMenu(false); }}
                  className={exportItemClass}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                    <FileText size={15} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">PDF<span className="ml-1 text-slate-400 dark:text-slate-500"> · Statistiques</span></span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onExportCSV(); setShowExportMenu(false); }}
                  className={exportItemClass}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                    <FileCsv size={15} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">CSV<span className="ml-1 text-slate-400 dark:text-slate-500"> · Statistiques</span></span>
                </button>
                <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onExportTopProduits(); setShowExportMenu(false); }}
                  className={exportItemClass}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <Trophy size={15} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">Top produits</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onExportCommandes(); setShowExportMenu(false); }}
                  className={exportItemClass}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <ShoppingCart size={15} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">Commandes récentes</span>
                </button>
                <div className="mt-1 border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    <Check size={13} />Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            title="Rafraîchir"
            aria-label="Rafraîchir les rapports"
            className={`flex h-10 w-10 items-center justify-center rounded-lg border ${borderColor} bg-white dark:bg-[#0F172A] text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:text-slate-400 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400`}
          >
            <RefreshCw size={17} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default RapportsHeader;