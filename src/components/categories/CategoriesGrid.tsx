// src/components/categories/CategoriesGrid.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Folder,
  Eye,
  Edit,
  Trash2,
  Package,
  CalendarDays,
} from 'lucide-react';

interface Categorie {
  id: number;
  nom: string;
  description?: string;
  created_at: string;
  produits_count?: number;
}

interface CategoriesGridProps {
  categories: Categorie[];
  onView: (categorie: Categorie) => void;
  onEdit: (categorie: Categorie) => void;
  onDelete: (categorie: Categorie) => void;
  onAdd: () => void;
  getCategoryColor: (id: number) => string;
  isDark?: boolean;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  onView,
  onEdit,
  onDelete,
  onAdd,
  getCategoryColor,
  isDark: isDarkProp,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;

  if (categories.length === 0) {
    return (
      <div
        className={`flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-12 text-center shadow-sm ${
          isDark
            ? 'bg-[#111c30] border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.18)]'
            : 'bg-white border-slate-300'
        }`}
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Folder size={28} strokeWidth={1.7} />
        </div>
        <h3 className="text-[16px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Aucune catégorie
        </h3>
        <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
          Créez votre première catégorie pour organiser facilement vos produits.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 ${
        isDark ? 'bg-[#111c30]' : 'bg-white'
      }`}
    >
      {categories.filter(Boolean).map((categorie) => {
        const nbProduits = Number(categorie.produits_count || 0);
        const hasProducts = nbProduits > 0;

        return (
          <div
            key={categorie.id}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md ${
              isDark
                ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]'
                : 'border-slate-200 bg-white hover:border-indigo-200'
            }`}
          >
            {/* En-tête : icône et nom */}
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                {/* ⭐ FOND INDIGO TOKANA HO AN'NY ICON REHETRA */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-150 group-hover:shadow-md ${
                    isDark
                      ? 'border-white/[0.10] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white'
                      : 'border-indigo-100 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                  }`}
                >
                  <Folder size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div
                    className="truncate text-[15px] font-semibold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400"
                    title={categorie.nom}
                  >
                    {categorie.nom}
                  </div>
                  <div className="mt-0.5 text-[12px] text-slate-400 dark:text-slate-500">
                    ID #{String(categorie.id).padStart(3, '0')}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end text-[12px] text-slate-400 dark:text-slate-500">
                <span>
                  {categorie.created_at
                    ? new Date(categorie.created_at).toLocaleDateString('fr-FR')
                    : '—'}
                </span>
              </div>
            </div>

            {/* Corps : description et nombre de produits */}
            <div className="flex flex-1 flex-col p-4 pt-3 space-y-2">
              <span
                className="line-clamp-2 text-[14px] text-slate-600 dark:text-slate-300"
                title={categorie.description || ''}
              >
                {categorie.description || (
                  <span className="italic text-slate-400 dark:text-slate-500">
                    Aucune description
                  </span>
                )}
              </span>

              {/* Badge produits */}
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex min-w-[40px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold transition-all ${
                    hasProducts
                      ? 'border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400'
                  }`}
                >
                  <Package size={13} strokeWidth={1.8} />
                  {nbProduits}
                </span>
                <span className="text-[12px] text-slate-400 dark:text-slate-500">
                  produit{nbProduits > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
              <button
                type="button"
                title="Voir la catégorie"
                onClick={() => onView(categorie)}
                className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
              >
                <Eye size={16} className="mx-auto" />
              </button>
              <button
                type="button"
                title="Modifier"
                onClick={() => onEdit(categorie)}
                className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-600 transition hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
              >
                <Edit size={16} className="mx-auto" />
              </button>
              <button
                type="button"
                title="Supprimer"
                onClick={() => onDelete(categorie)}
                className="flex-1 rounded-lg bg-rose-100 px-3 py-2 text-rose-700 transition hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/50"
              >
                <Trash2 size={16} className="mx-auto" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoriesGrid;