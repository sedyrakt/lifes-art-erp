// src/components/depenses/DepensesGrid.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Wallet,
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingDown,
  Tag,
  Hash,
  CalendarDays,
  Building,
  Receipt,
} from 'lucide-react';
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
  categoryIcons: Record<string, any>;
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
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (depenses.length === 0) {
    return (
      <div
        className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border bg-white px-6 py-12 text-center shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${
          isDark ? 'border-white/[0.14]' : 'border-slate-300'
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Receipt size={22} strokeWidth={1.8} />
        </div>
        <h3 className="mt-4 text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucune dépense</h3>
        <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
          Commencez par enregistrer votre première dépense.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98]"
        >
          <Plus size={15} /> Ajouter une dépense
        </button>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 ${
        isDark ? 'bg-[#111c30]' : 'bg-white'
      }`}
    >
      {depenses.filter(Boolean).map((depense) => {
        const Icon = categoryIcons[depense.categorie] || Tag;
        const colors = categoryColors(depense.categorie);
        const montant = Number(depense.montant) || 0;

        return (
          <div
            key={depense.id}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md ${
              isDark
                ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]'
                : 'border-slate-200 bg-white hover:border-indigo-200'
            }`}
          >
            {/* En-tête de la carte : icône catégorie et montant */}
            <div className="relative flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm ${
                    isDark
                      ? `border-white/[0.08] ${colors.dark}`
                      : `border-slate-200 ${colors.light}`
                  }`}
                >
                  <Icon size={18} strokeWidth={1.9} className={colors.text} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-medium text-slate-800 dark:text-slate-200">
                    {depense.categorie || 'Autre'}
                  </div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">Dépense</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
                  <TrendingDown size={14} />
                </span>
                <span className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">
                  {formatMoney(montant)}
                </span>
              </div>
            </div>

            {/* Corps de la carte */}
            <div className="flex flex-1 flex-col p-4 pt-3">
              {/* Description */}
              <div className="mb-2 min-w-0">
                <div
                  className="truncate text-[14px] font-medium text-slate-700 dark:text-slate-300"
                  title={depense.description || 'Sans description'}
                >
                  {depense.description || 'Sans description'}
                </div>
                {depense.reference && (
                  <div className="mt-0.5 flex items-center gap-1 text-[13px] text-slate-400 dark:text-slate-500">
                    <Hash size={11} />
                    <span className="truncate">{depense.reference}</span>
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                <CalendarDays size={14} className="shrink-0" />
                <span>{formatDate(depense.date_depense)}</span>
              </div>

              {/* Mode de paiement */}
              <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                <Wallet size={14} className="shrink-0" />
                <span className="truncate">{depense.mode_paiement || 'N/A'}</span>
              </div>

              {/* Fournisseur */}
              {depense.fournisseur_nom && (
                <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                  <Building size={14} className="shrink-0" />
                  <span className="truncate">{depense.fournisseur_nom}</span>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                <button
                  type="button"
                  title="Voir les détails"
                  onClick={() => onView(depense)}
                  className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                >
                  <Eye size={16} className="mx-auto" />
                </button>
                <button
                  type="button"
                  title="Modifier"
                  onClick={() => onEdit(depense)}
                  className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-600 transition hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                >
                  <Edit size={16} className="mx-auto" />
                </button>
                <button
                  type="button"
                  title="Supprimer"
                  onClick={() => onDelete(depense.id)}
                  className="flex-1 rounded-lg bg-rose-100 px-3 py-2 text-rose-700 transition hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/50"
                >
                  <Trash2 size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DepensesGrid;