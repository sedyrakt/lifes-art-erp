// ============================================================
// src/components/produits/ProduitsHeader.tsx
// GOOGLE-LIKE / PREMIUM ERP HEADER
//
// ⭐ DESIGN:
//    - Clean white / Slate surface
//    - Indigo as primary brand accent
//    - Compact icon
//    - Single primary CTA
//    - Optional refresh + statistics actions
//    - Responsive desktop / mobile
//    - Dark mode fully supported
// ============================================================

import React from 'react';
import {
  Plus,
  Package,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface ProduitsHeaderProps {
  onAddProduit: () => void;
  onOpenStats?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const ProduitsHeader: React.FC<ProduitsHeaderProps> = ({
  onAddProduit,
  onOpenStats,
  refreshing = false,
  onRefresh,
}) => {
  return (
    <header className="mb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* ======================================================
            LEFT — PAGE IDENTITY
        ====================================================== */}
        <div className="flex min-w-0 items-center gap-3">

          {/* Icon */}
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-lg
              bg-indigo-50
              text-indigo-600
              ring-1 ring-inset ring-indigo-100
              dark:bg-indigo-500/10
              dark:text-indigo-400
              dark:ring-indigo-500/20
            "
          >
            <Package
              size={20}
              strokeWidth={2}
            />
          </div>

          {/* Title + subtitle */}
          <div className="min-w-0">
            <h1
              className="
                truncate
                text-[21px]
                font-semibold
                leading-tight
                tracking-[-0.02em]
                text-slate-900
                dark:text-slate-100
              "
            >
              Produits
            </h1>

            <p
              className="
                mt-0.5
                truncate
                text-[13px]
                font-medium
                leading-tight
                text-slate-500
                dark:text-slate-400
              "
            >
              Gérez et organisez votre catalogue produits.
            </p>
          </div>
        </div>

        {/* ======================================================
            RIGHT — ACTIONS
        ====================================================== */}
        <div className="flex items-center gap-2">

          {/* Statistics */}
          {onOpenStats && (
            <button
              type="button"
              onClick={onOpenStats}
              className="
                inline-flex h-9
                items-center justify-center gap-2
                rounded-lg
                border border-slate-200
                bg-white
                px-3
                text-[13px]
                font-medium
                text-slate-700
                shadow-[0_1px_2px_rgba(15,23,42,0.04)]
                transition-all duration-150
                hover:border-indigo-200
                hover:bg-indigo-50
                hover:text-indigo-700
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500/20
                dark:border-slate-700
                dark:bg-[#0F172A]
                dark:text-slate-300
                dark:hover:border-indigo-500/30
                dark:hover:bg-indigo-500/10
                dark:hover:text-indigo-300
              "
              aria-label="Voir les statistiques"
            >
              <BarChart3 size={16} />
              <span className="hidden sm:inline">
                Statistiques
              </span>
            </button>
          )}

          {/* Refresh */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="
                inline-flex h-9 w-9
                items-center justify-center
                rounded-lg
                border border-slate-200
                bg-white
                text-slate-500
                shadow-[0_1px_2px_rgba(15,23,42,0.04)]
                transition-all duration-150
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500/20
                dark:border-slate-700
                dark:bg-[#0F172A]
                dark:text-slate-400
                dark:hover:border-slate-600
                dark:hover:bg-slate-800
                dark:hover:text-slate-200
              "
              aria-label="Actualiser"
              title="Actualiser"
            >
              <RefreshCw
                size={16}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
          )}

          {/* ====================================================
              PRIMARY CTA
          ==================================================== */}
          <button
            type="button"
            onClick={onAddProduit}
            className="
              inline-flex h-9
              items-center justify-center gap-2
              rounded-lg
              bg-indigo-600
              px-3.5
              text-[13px]
              font-semibold
              text-white
              shadow-[0_1px_2px_rgba(79,70,229,0.25)]
              transition-all duration-150
              hover:bg-indigo-700
              hover:shadow-[0_3px_8px_rgba(79,70,229,0.20)]
              active:scale-[0.98]
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500/30
              focus:ring-offset-1
              dark:bg-indigo-500
              dark:hover:bg-indigo-600
            "
            aria-label="Ajouter un produit"
          >
            <Plus
              size={17}
              strokeWidth={2.2}
            />

            <span>
              Nouveau produit
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SUBTLE DIVIDER
          Manampy hierarchy fa tsy manao card be.
      ======================================================== */}
      <div className="mt-4 h-px bg-slate-100 dark:bg-slate-800" />
    </header>
  );
};

export default ProduitsHeader;