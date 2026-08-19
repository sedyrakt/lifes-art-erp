// src/components/entrees/EntreesStats/EntryList.tsx

import React from 'react';
import { FileText } from 'lucide-react';
import EntryCard from './EntryCard';

interface Entree {
  id: number;
  produit_id: number;
  produit_nom?: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  reference?: string;
  fournisseur_id?: number;
  fournisseur_nom?: string;
  observation?: string;
  date_entree: string;
  created_at?: string;
  image?: string;
  unite?: string;
}

interface EntryListProps {
  data: Entree[];
  dataLength: number;
  color: string;
  imageUrls: Record<number, string | null>;
  imageErrors: Record<number, boolean>;
  onImageError: (id: number) => void;
  isDark: boolean;
  colors: {
    card: string;
    border: string;
    text: string;
    muted: string;
    primary: string;
  };
}

const EntryList: React.FC<EntryListProps> = ({
  data,
  dataLength,
  color,
  imageUrls,
  imageErrors,
  onImageError,
  isDark,
  colors,
}) => {
  if (dataLength === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="w-10 h-10 mx-auto mb-2.5" style={{ color: colors.muted }} />
        <p className="text-sm font-semibold" style={{ color: colors.muted }}>Aucune entrée trouvée</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm font-semibold" style={{ color: colors.muted }}>Aucune entrée sur cette page</p>
      </div>
    );
  }

  return (
    <div className="p-5 overflow-y-auto max-h-[55vh] flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((e) => (
          <EntryCard
            key={e.id}
            entry={e}
            color={color}
            imageUrl={imageUrls[e.produit_id] || null}
            hasError={imageErrors[e.produit_id] || false}
            onImageError={onImageError}
            isDark={isDark}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
};

export default EntryList;