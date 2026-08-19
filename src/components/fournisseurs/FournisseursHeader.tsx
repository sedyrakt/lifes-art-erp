import React from 'react';
import { Plus, Building2, RefreshCw, ArrowRight } from 'lucide-react';

interface FournisseursHeaderProps {
  onAddFournisseur: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const FournisseursHeader: React.FC<FournisseursHeaderProps> = ({
  onAddFournisseur,
  refreshing = false,
  onRefresh,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <header className="mb-5">
        <div className="relative overflow-hidden flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-slate-100/70 to-transparent dark:via-slate-800/40" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-5 w-52 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="h-3.5 w-72 max-w-full rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-9 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
        <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      </header>
    );
  }

  return (
    <header className="mb-5">
      <div className="group relative overflow-hidden flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_4px_14px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#0F172A] dark:hover:border-indigo-500/30 dark:hover:shadow-none sm:flex-row sm:items-center sm:justify-between">
        <div className="absolute left-0 top-0 h-full w-[2px] bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15">
            <Building2 size={19} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">Fournisseurs</h1>
            <p className="mt-1 truncate text-[13px] font-medium leading-tight text-slate-500 dark:text-slate-400">Gérez vos fournisseurs et leurs informations</p>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={refreshing}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              aria-label="Actualiser les fournisseurs" title="Actualiser">
              <RefreshCw size={15} strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          )}
          <button type="button" onClick={onAddFournisseur}
            className="inline-flex h-9 flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600"
            aria-label="Ajouter un fournisseur">
            <Plus size={16} strokeWidth={2.2} />
            <span>Nouveau fournisseur</span>
            <ArrowRight size={14} strokeWidth={2} className="hidden opacity-0 -translate-x-1 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default FournisseursHeader;