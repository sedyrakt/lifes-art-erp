// src/components/sorties/SortiesStats/SortieCard.tsx

import React from 'react';
import { ImageOff, Calendar, MapPin } from 'lucide-react';
import { formatMoney } from '../../../lib/formatMoney';

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

interface SortieCardProps {
  sortie: Sortie;
  color: string;
  imageUrl: string | null;
  hasError: boolean;
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

const SortieCard: React.FC<SortieCardProps> = ({
  sortie: s,
  color,
  imageUrl,
  hasError,
  onImageError,
  isDark,
  colors,
}) => {
  const initiales = s.produit_nom?.charAt(0)?.toUpperCase() || '?';

  return (
    <div
      className="rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.01] flex flex-col"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        borderColor: 'rgba(99,102,241,0.12)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center flex-shrink-0"
          style={{
            borderColor: color,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
          }}
        >
          {imageUrl && !hasError && typeof imageUrl === 'string' ? (
            <img
              src={imageUrl}
              alt={s.produit_nom || 'Produit'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => onImageError(s.produit_id)}
            />
          ) : hasError ? (
            <ImageOff className="w-5 h-5" style={{ color: colors.muted }} />
          ) : (
            <span className="text-sm font-bold" style={{ color }}>
              {initiales}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold truncate" style={{ color: colors.text }}>
            {s.produit_nom || `Produit #${s.produit_id}`}
          </h3>
          <p className="text-xs font-medium" style={{ color: colors.muted }}>
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            {new Date(s.date_sortie || s.created_at).toLocaleDateString('fr-FR')}
          </p>
          {s.destination && (
            <p className="text-xs truncate" style={{ color: colors.muted }}>
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              {s.destination}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t grid grid-cols-3 gap-1 text-sm" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
        <div className="text-center">
          <span className="block text-xs font-medium" style={{ color: colors.muted }}>Qté</span>
          <span className="font-bold" style={{ color: colors.text }}>{s.quantite}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-medium" style={{ color: colors.muted }}>Prix unit.</span>
          <span className="font-bold" style={{ color: colors.text }}>{formatMoney(s.prix_unitaire)}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-medium" style={{ color: colors.muted }}>Total</span>
          <span className="font-bold" style={{ color }}>{formatMoney(s.total_ligne)}</span>
        </div>
      </div>

      {s.reference && (
        <div className="mt-2 text-xs text-center truncate" style={{ color: colors.muted }}>
          Réf. {s.reference}
        </div>
      )}
    </div>
  );
};

export default SortieCard;