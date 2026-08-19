// src/components/depenses/DepensesStats/ExpenseList.tsx

import React from 'react';
import { Receipt } from 'lucide-react';
import ExpenseCard from './ExpenseCard';

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

interface ExpenseListProps {
  data: Depense[];
  dataLength: number;
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

const ExpenseList: React.FC<ExpenseListProps> = ({
  data,
  dataLength,
  color,
  isDark,
  colors,
  hexToRgba,
  getCategoryIcon,
}) => {
  if (dataLength === 0) {
    return (
      <div className="text-center py-10">
        <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: colors.muted }} />
        <p className="text-base" style={{ color: colors.muted }}>Aucune dépense trouvée</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-base" style={{ color: colors.muted }}>Aucune dépense sur cette page</p>
      </div>
    );
  }

  return (
    <div className="p-5 overflow-y-auto max-h-[55vh] flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((d) => (
          <ExpenseCard
            key={d.id}
            expense={d}
            color={color}
            isDark={isDark}
            colors={colors}
            hexToRgba={hexToRgba}
            getCategoryIcon={getCategoryIcon}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;