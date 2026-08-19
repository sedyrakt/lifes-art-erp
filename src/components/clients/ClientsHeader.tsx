import React from 'react';
import { Plus, Folder, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface CategoriesHeaderProps {
  onAddCategorie: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  onAddCategorie,
  refreshing = false,
  onRefresh,
  isLoading = false,
}) => {
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="mb-5">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-40 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-56 rounded-md bg-slate-100 dark:bg-slate-800/70" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && <div className="h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />}
            <div className="h-9 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_4px_14px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#0F172A] dark:hover:border-indigo-500/30 dark:hover:shadow-none md:flex-row md:items-center md:justify-between">
        <div className="absolute left-0 top-0 h-full w-[2px] bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15">
            <Folder size={19} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">Gestion des catégories</h1>
            <p className="mt-1 truncate text-[12px] font-medium text-slate-500 dark:text-slate-400">Organisez vos produits par catégorie</p>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={refreshing}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white md:w-auto"
              aria-label="Actualiser les catégories">
              <RefreshCw size={15} strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
          )}
          <button type="button" onClick={onAddCategorie}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(79,70,229,0.25)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_3px_8px_rgba(79,70,229,0.20)] active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600 md:flex-none"
            aria-label="Ajouter une catégorie">
            <Plus size={16} strokeWidth={2.2} />
            <span>Ajouter une catégorie</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesHeader;