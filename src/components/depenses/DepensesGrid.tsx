// ============================================================
// src/components/depenses/DepensesGrid.tsx
// ⭐ PREMIUM DEPENSE GRID
// ⭐ DARK + LIGHT MODE
// ⭐ COMPACT ERP DESIGN
// ⭐ BORDER SYSTEM
// ⭐ READABLE TYPOGRAPHY
// ⭐ CATEGORY + ACTION ICONS
// ============================================================

import React, { memo, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Eye, Edit, Trash2, Plus, TrendingDown, Tag, Hash, CalendarDays, Building, Receipt, Wallet } from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';

interface Depense {
  id: number;
  categorie: string;
  description: string;
  montant: number;
  date_depense: string;
  mode_paiement: string;
  reference: string;
  fournisseur_id: number;
  fournisseur_nom?: string;
  observation: string;
  created_at: string;
}

interface DepensesGridProps {
  depenses?: Depense[];
  onView: (depense: Depense) => void;
  onEdit: (depense: Depense) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  categoryIcons: Record<string, React.ElementType>;
  categoryColors: (cat: string) => { light: string; dark: string; text: string };
  isDark?: boolean;
}

const DepensesGrid: React.FC<DepensesGridProps> = ({
  depenses = [],
  onView,
  onEdit,
  onDelete,
  onAdd,
  categoryIcons,
  categoryColors,
  isDark: isDarkProp,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp ?? themeIsDark;

  const safeDepenses = useMemo(
    () => (Array.isArray(depenses) ? depenses.filter(Boolean) : []),
    [depenses]
  );

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const borderClass = isDark ? 'border-white/[0.08]' : 'border-slate-200';
  const cardClass = isDark
    ? 'border-white/[0.08] bg-[#111c30] hover:border-white/[0.16]'
    : 'border-slate-200 bg-white hover:border-indigo-200';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  if (safeDepenses.length === 0) {
    return (
      <div className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border px-6 py-12 text-center shadow-sm ${isDark ? 'border-white/[0.10] bg-[#111c30]' : 'border-slate-300 bg-white'}`}>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-500'}`}>
          <Receipt size={22} strokeWidth={1.8} />
        </div>
        <h3 className={`mt-4 text-[16px] font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          Aucune dépense
        </h3>
        <p className={`mt-1 max-w-sm text-[13px] leading-6 ${mutedText}`}>
          Commencez par enregistrer votre première dépense.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[.98]"
        >
          <Plus size={15} strokeWidth={2} />
          Ajouter une dépense
        </button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {safeDepenses.map((depense) => {
        const CategoryIcon = categoryIcons[depense.categorie] || Tag;
        const colors = categoryColors(depense.categorie);
        const montant = Number(depense.montant) || 0;

        return (
          <article
            key={depense.id}
            className={`group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${cardClass}`}
          >
            <div className={`flex items-center justify-between border-b px-3 py-2.5 ${borderClass} ${isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
              <div className="flex min-w-0 items-center gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm ${isDark ? `border-white/[0.08] ${colors.dark}` : `border-slate-200 ${colors.light}`}`}>
                  <CategoryIcon size={15} strokeWidth={1.8} className={colors.text} />
                </div>
                <div className="min-w-0">
                  <div
                    className={`truncate text-[14px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                    title={depense.categorie || 'Autre'}
                  >
                    {depense.categorie || 'Autre'}
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Dépense
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 'border-rose-200 bg-rose-50 text-rose-500'}`}>
                  <TrendingDown size={12} strokeWidth={2} />
                </span>
                <span className={`text-[14px] font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {formatMoney(montant)}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-3 pt-2.5">
              <div className="mb-2 min-w-0">
                <div
                  className={`truncate text-[13px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  title={depense.description || 'Sans description'}
                >
                  {depense.description || 'Sans description'}
                </div>

                {depense.reference && (
                  <div className={`mt-0.5 flex min-w-0 items-center gap-1 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Hash size={10} strokeWidth={1.8} className="shrink-0" />
                    <span className="truncate">{depense.reference}</span>
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-2 text-[12px] ${mutedText}`}>
                <CalendarDays size={13} strokeWidth={1.8} className="shrink-0" />
                <span className="truncate">{formatDate(depense.date_depense)}</span>
              </div>

              <div className={`mt-1 flex items-center gap-2 text-[12px] ${mutedText}`}>
                <Wallet size={13} strokeWidth={1.8} className="shrink-0" />
                <span className="truncate">{depense.mode_paiement || 'N/A'}</span>
              </div>

              <div className={`mt-1 flex min-w-0 items-center gap-2 text-[12px] ${mutedText}`}>
                <Building size={13} strokeWidth={1.8} className="shrink-0" />
                <span className="truncate">{depense.fournisseur_nom || 'Aucun fournisseur'}</span>
              </div>

              <div className={`mt-3 flex items-center gap-1.5 border-t pt-2.5 ${borderClass}`}>
                <button
                  type="button"
                  title="Voir les détails"
                  aria-label={`Voir les détails de ${depense.description || depense.categorie}`}
                  onClick={() => onView(depense)}
                  className={`flex h-8 flex-1 items-center justify-center rounded-md transition ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400' : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'}`}
                >
                  <Eye size={14} strokeWidth={1.9} />
                </button>

                <button
                  type="button"
                  title="Modifier"
                  aria-label={`Modifier ${depense.description || depense.categorie}`}
                  onClick={() => onEdit(depense)}
                  className={`flex h-8 flex-1 items-center justify-center rounded-md transition ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-amber-500/10 hover:text-amber-400' : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600'}`}
                >
                  <Edit size={14} strokeWidth={1.9} />
                </button>

                <button
                  type="button"
                  title="Supprimer"
                  aria-label={`Supprimer ${depense.description || depense.categorie}`}
                  onClick={() => onDelete(depense.id)}
                  className={`flex h-8 flex-1 items-center justify-center rounded-md transition ${isDark ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-800/50 hover:text-rose-300' : 'bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800'}`}
                >
                  <Trash2 size={14} strokeWidth={1.9} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default memo(DepensesGrid);