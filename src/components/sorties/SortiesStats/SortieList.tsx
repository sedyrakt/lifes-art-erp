// src/components/sorties/SortiesStats/SortieList.tsx

import React from 'react';
import { Truck } from 'lucide-react';
import SortieCard from './SortieCard';

interface Sortie {
  id: number;
  produit_id: number;
  produit_nom?: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  reference?: string;
  destination?: string;
  observation?: string;
  date_sortie: string;
  created_at?: string;
  image?: string;
  unite?: string;
}

interface SortieListProps {
  data: Sortie[];
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

const SortieList: React.FC<SortieListProps> = ({
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
        <Truck className="w-10 h-10 mx-auto mb-2.5" style={{ color: colors.muted }} />
        <p className="text-sm font-semibold" style={{ color: colors.muted }}>Aucune sortie trouvée</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm font-semibold" style={{ color: colors.muted }}>Aucune sortie sur cette page</p>
      </div>
    );
  }

  return (
    <div className="p-5 overflow-y-auto max-h-[55vh] flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((s) => (
          <SortieCard
            key={s.id}
            sortie={s}
            color={color}
            imageUrl={imageUrls[s.produit_id] || null}
            hasError={imageErrors[s.produit_id] || false}
            onImageError={onImageError}
            isDark={isDark}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
};

export default SortieList;