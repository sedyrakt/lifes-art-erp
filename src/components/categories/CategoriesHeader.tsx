import React from 'react';
import { Plus, Folder, RefreshCw } from 'lucide-react';

interface CategoriesHeaderProps {
  onAddCategorie: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  onAddCategorie,
  refreshing = false,
  onRefresh,
}) => {
  return (
    <div className="mb-5 w-full">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-[#0F172A]">
        {/* Gauche – Titre */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Folder size={19} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              Gestion des catégories
            </h1>
            <p className="mt-1 truncate text-[12px] font-medium leading-none text-slate-500 dark:text-slate-400">
              Organisez vos produits par catégorie
            </p>
          </div>
        </div>

        {/* Droite – Actions */}
        <div className="flex w-full shrink-0 items-center justify-end gap-2 md:w-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Actualiser les catégories"
              title="Actualiser"
            >
              <RefreshCw size={15} strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          )}
          <button
            type="button"
            onClick={onAddCategorie}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-[#0F172A]"
            aria-label="Ajouter une catégorie"
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>Ajouter une catégorie</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesHeader;