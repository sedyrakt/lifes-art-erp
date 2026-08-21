// src/components/entrees/EntreesGrid.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowDown, Package, Eye, Trash2, Plus, Building2, Hash, Calendar, ImageOff } from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';

interface Entree {
  id: number;
  produit_nom: string;
  produit_code: string;
  quantite: number;
  prix_unitaire: number;
  date_entree: string;
  fournisseur_nom: string;
  reference: string;
  produit_image?: string;
}

interface EntreesGridProps {
  entrees: Entree[];
  imageUrls?: Record<number, string | null>;
  onView: (entree: Entree) => void; // ⭐ Click card -> modal
  onAdd: () => void;
  onDelete?: (id: number) => void;
  onBulkDelete?: (ids: number[]) => void;
  isDark?: boolean;
}

const EntreesGrid: React.FC<EntreesGridProps> = ({
  entrees,
  imageUrls = {},
  onView,
  onAdd,
  onDelete,
  onBulkDelete,
  isDark: isDarkProp,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;

  if (entrees.length === 0) {
    return (
      <div className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border bg-white px-6 py-12 text-center shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${isDark ? 'border-white/[0.14]' : 'border-slate-300'}`}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><ArrowDown size={25} strokeWidth={1.8} /></div>
        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucune entrée</h3>
        <p className="mt-1 max-w-sm text-[14.5px] leading-relaxed text-slate-500 dark:text-slate-400">Aucun mouvement d'entrée ne correspond aux critères actuels.</p>
        <button type="button" onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[14.5px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98]"><Plus size={15} />Ajouter une entrée</button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {entrees.filter(Boolean).map((entree) => {
        const imageUrl = imageUrls[entree.id] ?? null;
        const initiale = entree.produit_nom?.charAt(0)?.toUpperCase() || 'P';
        const quantite = Number(entree.quantite) || 0;
        const prix = Number(entree.prix_unitaire) || 0;
        let dateDisplay = '—', timeDisplay = '';
        if (entree.date_entree) { const d = new Date(entree.date_entree); if (!isNaN(d.getTime())) { dateDisplay = d.toLocaleDateString('fr-FR'); timeDisplay = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); } }

        return (
          <div
            key={entree.id}
            // ⭐ CLIC CARD -> MODAL
            onClick={() => onView(entree)}
            className={`group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${isDark ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
          >
            {/* PHOTO (COMPACT: H-36) */}
            <div className="relative h-36 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
              {imageUrl ? <img src={imageUrl} alt={entree.produit_nom || 'Produit'} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center bg-indigo-50 dark:bg-indigo-500/10"><div className="flex flex-col items-center gap-1"><Package size={28} className="text-indigo-400 dark:text-indigo-300" /><span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{initiale}</span></div></div>}
              
              {/* CALQUE (OVERLAY) */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* BADGE QUANTITÉ (COMPACT + BLUR) */}
              <div className="absolute right-2 top-2 z-10">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-md"><ArrowDown size={11} />+{quantite.toLocaleString('fr-FR')}</span>
              </div>
            </div>

            {/* BODY (COMPACT P-3) */}
            <div className="flex flex-1 flex-col p-3">
              <div className="mb-1 flex items-start justify-between">
                <h4 className="text-[14px] font-semibold text-slate-900 line-clamp-1 dark:text-slate-100" title={entree.produit_nom}>{entree.produit_nom || 'Produit inconnu'}</h4>
                <div className="text-[11px] text-slate-400 dark:text-slate-500"><span title={`${dateDisplay} ${timeDisplay}`}>{dateDisplay}</span></div>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400"><Hash size={13} className="shrink-0" /><span className="truncate font-mono">{entree.produit_code || 'Sans code'}</span></div>
              <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400"><Building2 size={13} className="shrink-0" /><span className="truncate">{entree.fournisseur_nom || 'Aucun fournisseur'}</span></div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                <div className="flex flex-col"><span className="text-[11px] text-slate-400 dark:text-slate-500">Prix unitaire</span><span className="text-[14px] font-semibold text-indigo-600 dark:text-indigo-400">{formatMoney(prix)}</span></div>
                <div className="flex flex-col items-end"><span className="text-[11px] text-slate-400 dark:text-slate-500">Réf.</span><span className="text-[13px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{entree.reference || '—'}</span></div>
              </div>
              
              {/* ACTIONS COMPACT (H-8) */}
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-200 pt-2.5 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <button type="button" title="Voir les détails" onClick={() => onView(entree)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><Eye size={14} className="mx-auto" /></button>
                {(onDelete || onBulkDelete) && <button type="button" title="Supprimer" onClick={() => { if (onDelete) onDelete(entree.id); else if (onBulkDelete) onBulkDelete([entree.id]); }} className="flex h-8 flex-1 items-center justify-center rounded-md bg-rose-100 text-rose-700 transition hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/50"><Trash2 size={14} className="mx-auto" /></button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EntreesGrid;