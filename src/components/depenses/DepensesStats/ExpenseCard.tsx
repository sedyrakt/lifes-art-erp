// src/components/depenses/DepensesStats/ExpenseCard.tsx

import React from 'react';
import { Calendar, DollarSign, Building, CreditCard } from 'lucide-react';
import { formatMoney } from '../../../lib/formatMoney';
import { CATEGORY_COLORS, CATEGORY_BG } from '../DepensesStats';

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

interface ExpenseCardProps {
  expense: Depense;
  color: string;
  isDark: boolean;
  colors: {
    card: string;
    border: string;
    text: string;
    muted: string;
    primary: string;
  };
  hexToRgba: (color: string, alpha: number) => string;
  getCategoryIcon: (categorie: string) => React.ElementType;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense: d,
  color,
  isDark,
  colors,
  hexToRgba,
  getCategoryIcon,
}) => {
  const categoryColor = CATEGORY_COLORS[d.categorie] || colors.primary;
  const categoryBg = CATEGORY_BG[d.categorie] || 'bg-gray-50 dark:bg-gray-800';
  const IconComponent = getCategoryIcon(d.categorie);

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${categoryBg}`}
      style={{
        borderColor: 'rgba(99,102,241,0.12)',
      }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 mb-3"
          style={{
            background: `${categoryColor}20`,
            border: `2px solid ${categoryColor}`,
          }}
        >
          <IconComponent className="w-8 h-8" style={{ color: categoryColor }} />
        </div>

        <h3 className="text-base font-semibold" style={{ color: colors.text }}>
          {d.description || 'Sans description'}
        </h3>

        <p className="text-sm font-medium" style={{ color: categoryColor }}>
          {d.categorie}
        </p>

        <div className="w-12 h-0.5 rounded-full my-2" style={{ background: hexToRgba(categoryColor, 0.3) }} />

        <div className="w-full text-sm space-y-1" style={{ color: colors.muted }}>
          <div className="flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(d.date_depense).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-semibold" style={{ color }}>
              {formatMoney(d.montant)}
            </span>
          </div>
          {d.fournisseur_nom && (
            <div className="flex items-center justify-center gap-1">
              <Building className="w-3.5 h-3.5" />
              <span>{d.fournisseur_nom}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{d.mode_paiement}</span>
          </div>
        </div>

        {d.reference && (
          <div className="mt-2 pt-2 border-t w-full" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
            <span className="text-xs font-mono" style={{ color: colors.muted }}>
              Réf: {d.reference}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;