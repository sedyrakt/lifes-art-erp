// src/components/produits/ProduitsGrid.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Package, Eye, Edit, Trash2, ShoppingBag, ImageOff, AlertTriangle, CircleCheck, CircleX, Truck, Plus } from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';

interface Produit {
  id: number;
  code: string;
  nom: string;
  description?: string;
  categorie_nom?: string;
  fournisseur_id?: number;
  fournisseur_nom?: string;
  prix_achat: number;
  prix_vente: number;
  quantite_stock: number;
  quantite_minimale: number;
  unite: string;
  image?: string;
  status: string;
  nb_commandes?: number;
}

interface ProduitsGridProps {
  produits: Produit[];
  imageUrls: Record<number, string | null>;
  imageErrors: Record<number, boolean>;
  onView: (id: number) => void; // ⭐ Cliquez sur la carte -> appelle onView
  onEdit: (produit: Produit) => void;
  onDelete: (produit: Produit) => void;
  onAdd: () => void;
  onNewCommande: (produit: Produit) => void;
  getStockLevel: (stock: number, min: number) => { level: string; color: string; bg: string };
  handleImageError: (id: number) => void;
  isDark: boolean;
}

const ProduitsGrid: React.FC<ProduitsGridProps> = ({
  produits,
  imageUrls,
  imageErrors,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onNewCommande,
  getStockLevel,
  handleImageError,
  isDark,
}) => {
  const renderStatusBadge = (status: string) => {
    const isActive = status?.toLowerCase() === 'actif';
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400'}`}>
        {isActive ? <CircleCheck size={11} /> : <CircleX size={11} />}
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  if (produits.length === 0) {
    return (
      <div className={`flex min-h-[390px] flex-col items-center justify-center rounded-2xl border bg-white px-6 py-14 text-center shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.20)] ${isDark ? 'border-white/[0.14]' : 'border-slate-300'}`}>
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 shadow-sm dark:border-indigo-500/10 dark:bg-indigo-500/10">
          <Package size={34} strokeWidth={1.7} className="text-indigo-500 dark:text-indigo-400" />
        </div>
        <h3 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-slate-100">Aucun produit</h3>
        <p className="mt-1.5 max-w-sm text-[14.5px] leading-6 text-slate-500 dark:text-slate-400">
          Commencez par créer votre premier produit pour gérer votre stock.
        </p>
        <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"><Plus size={17} />Ajouter un produit</button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {produits.filter(Boolean).map((produit) => {
        const imageUrl = imageUrls[produit.id] ?? null;
        const hasImageError = imageErrors[produit.id] ?? false;
        const initial = produit.nom?.charAt(0)?.toUpperCase() || '?';
        const stock = Number(produit.quantite_stock || 0);
        const stockMin = Number(produit.quantite_minimale || 0);
        const stockReference = Math.max(stockMin * 5, 1);
        const stockPercentage = Math.min(100, Math.max(0, (stock / stockReference) * 100));
        const isRupture = stock <= 0;
        const isAlert = !isRupture && stock <= stockMin;
        const prixVente = Number(produit.prix_vente || 0);
        const prixAchat = Number(produit.prix_achat || 0);

        return (
          <div
            key={produit.id}
            // ⭐ CLIC CARD -> MODAL
            onClick={() => onView(produit.id)}
            className={`group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${isDark ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
          >
            {/* PHOTO (COMPACT: H-36) */}
            <div className="relative h-36 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
              {imageUrl && !hasImageError ? (
                <img src={imageUrl} alt={produit.nom} loading="lazy" onError={() => handleImageError(produit.id)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : hasImageError ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700"><ImageOff size={28} className="text-slate-400 dark:text-slate-500" /></div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-50 dark:bg-indigo-500/10"><span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{initial}</span></div>
              )}
              
              {/* CALQUE (OVERLAY) */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* BADGE STATUS (NAVERINA TAMIN'NY FONCTION TSARA) */}
              <div className="absolute right-2 top-2 z-10">
                {renderStatusBadge(produit.status)}
              </div>
            </div>

            {/* BODY (COMPACT P-3) */}
            <div className="flex flex-1 flex-col p-3">
              <div className="mb-1 flex items-start justify-between">
                <h4 className="text-[14px] font-semibold text-slate-900 line-clamp-1 dark:text-slate-100" title={produit.nom}>{produit.nom}</h4>
                {produit.fournisseur_nom && <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 shrink-0 ml-2"><Truck size={11} /><span className="truncate max-w-[70px]">{produit.fournisseur_nom}</span></span>}
              </div>
              <div className="text-[13px] text-slate-500 dark:text-slate-400">
                <span className="font-mono">{produit.code || '—'}</span>
                {produit.categorie_nom && <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] dark:bg-slate-800 dark:text-slate-300">{produit.categorie_nom}</span>}
              </div>

              {/* STOCK BAR (COMPACT) */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 flex-col">
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className={`font-bold ${isRupture ? 'text-rose-600 dark:text-rose-400' : isAlert ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {stock} <span className="text-[11px] font-medium text-slate-400">{produit.unite || 'p.'}</span>
                    </span>
                    <span className="text-[11px] font-semibold">{isRupture ? 'Rupture' : isAlert ? 'Faible' : 'OK'}</span>
                  </div>
                  <div className="mt-1 h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className={`h-full rounded-full transition-all duration-500 ${isRupture ? 'bg-rose-500' : isAlert ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${isRupture ? 0 : stockPercentage}%` }} />
                  </div>
                </div>
              </div>

              {/* PRIX (COMPACT) */}
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{formatMoney(prixVente)}</span>
                  <span className="ml-2 text-[12px] text-slate-400 line-through dark:text-slate-500">{formatMoney(prixAchat)}</span>
                </div>
                <span className="inline-flex min-w-[28px] items-center justify-center rounded-md border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[12px] font-bold text-indigo-700 dark:border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-300">{produit.nb_commandes ?? 0}</span>
              </div>

              {/* ACTION BUTTONS (COMPACT) */}
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-200 pt-2.5 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <button type="button" title="Modifier" onClick={() => onEdit(produit)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"><Edit size={14} className="mx-auto" /></button>
                <button type="button" title="Supprimer" onClick={() => onDelete(produit)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-rose-100 text-rose-700 transition hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/50"><Trash2 size={14} className="mx-auto" /></button>
                <button type="button" title="Nouvelle commande" onClick={() => onNewCommande(produit)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-indigo-600 text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"><ShoppingBag size={14} className="mx-auto" /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProduitsGrid;