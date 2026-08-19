// src/components/sorties/SortiesGrid.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowUp, Package, Eye, Trash2, Plus, MapPin, Hash, CalendarDays, ImageOff } from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';

interface Sortie {
  id: number;
  produit_nom: string;
  produit_code: string;
  quantite: number;
  prix_unitaire: number;
  date_sortie: string;
  destination: string;
  reference: string;
  produit_image?: string;
}

interface SortiesGridProps {
  sorties: Sortie[];
  imageUrls?: Record<number, string | null>;
  onView: (sortie: Sortie) => void; // ⭐ Click card -> modal
  onAdd: () => void;
  onDelete?: (id: number) => void;
  onBulkDelete?: (ids: number[]) => void;
  isDark?: boolean;
}

const parseDate = (value?: string): Date | null => { if (!value) return null; const parsed = new Date(value); if (Number.isNaN(parsed.getTime())) return null; return parsed; };
const formatDate = (value?: string): string => { const date = parseDate(value); if (!date) return '-'; return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
const formatTime = (value?: string): string => { const date = parseDate(value); if (!date) return ''; return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
const formatQuantity = (value: number): string => Number(value || 0).toLocaleString('fr-FR');

const SortiesGrid: React.FC<SortiesGridProps> = ({
  sorties,
  imageUrls = {},
  onView,
  onAdd,
  onDelete,
  onBulkDelete,
  isDark: isDarkProp,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;

  if (sorties.length === 0) {
    return (
      <div className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border bg-white px-6 py-12 text-center shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${isDark ? 'border-white/[0.14]' : 'border-slate-300'}`}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><ArrowUp size={25} strokeWidth={1.8} /></div>
        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucune sortie</h3>
        <p className="mt-1 max-w-sm text-[14.5px] leading-relaxed text-slate-500 dark:text-slate-400">Aucune sortie de stock ne correspond aux critères actuels.</p>
        <button type="button" onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[14.5px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98]"><Plus size={15} />Ajouter une sortie</button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {sorties.filter(Boolean).map((sortie) => {
        const imageUrl = imageUrls[sortie.id] ?? sortie.produit_image ?? null;
        const quantite = Number(sortie.quantite) || 0;
        const prix = Number(sortie.prix_unitaire) || 0;
        const productName = sortie.produit_nom?.trim() || 'Produit inconnu';
        const productCode = sortie.produit_code?.trim() || 'Sans code';
        const destination = sortie.destination?.trim() || 'N/A';
        const reference = sortie.reference?.trim() || '-';
        const dateDisplay = formatDate(sortie.date_sortie);
        const timeDisplay = formatTime(sortie.date_sortie);

        return (
          <div
            key={sortie.id}
            // ⭐ CLIC CARD -> MODAL
            onClick={() => onView(sortie)}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${isDark ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
          >
            <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {imageUrl ? <img src={imageUrl} alt={productName} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center bg-indigo-50 dark:bg-indigo-500/10"><div className="flex flex-col items-center gap-1"><Package size={32} className="text-indigo-400 dark:text-indigo-300" /><span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{productName.charAt(0).toUpperCase()}</span></div></div>}
              <div className="absolute right-2 top-2"><span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[12px] font-bold text-white shadow-sm backdrop-blur-sm"><ArrowUp size={12} />-{formatQuantity(quantite)}</span></div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="mb-1 flex items-start justify-between">
                <h4 className="text-[14.5px] font-semibold text-slate-900 line-clamp-2 dark:text-slate-100" title={productName}>{productName}</h4>
                <div className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-slate-500"><CalendarDays size={14} className="shrink-0" /><span title={`${dateDisplay} ${timeDisplay}`}>{dateDisplay}</span></div>
              </div>
              <div className="flex items-center gap-2 text-[14.5px] text-slate-500 dark:text-slate-400"><Hash size={14} className="shrink-0" /><span className="truncate font-mono">{productCode}</span></div>
              <div className="mt-1 flex items-center gap-2 text-[14.5px] text-slate-500 dark:text-slate-400"><MapPin size={14} className="shrink-0" /><span className="truncate">{destination}</span></div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                <div className="flex flex-col"><span className="text-[12px] text-slate-400 dark:text-slate-500">Prix unitaire</span><span className="text-[14.5px] font-semibold text-indigo-600 dark:text-indigo-400">{formatMoney(prix)}</span></div>
                <div className="flex flex-col items-end"><span className="text-[12px] text-slate-400 dark:text-slate-500">Réf.</span><span className="text-[14.5px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{reference}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <button type="button" title="Voir les détails" onClick={() => onView(sortie)} className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><Eye size={16} className="mx-auto" /></button>
                {(onDelete || onBulkDelete) && <button type="button" title="Supprimer" onClick={() => { if (onDelete) onDelete(sortie.id); else if (onBulkDelete) onBulkDelete([sortie.id]); }} className="flex-1 rounded-lg bg-rose-100 px-3 py-2 text-rose-700 transition hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/50"><Trash2 size={16} className="mx-auto" /></button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SortiesGrid;