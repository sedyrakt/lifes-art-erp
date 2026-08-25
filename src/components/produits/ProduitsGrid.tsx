// src/components/produits/ProduitsGrid.tsx
import React from 'react';
import { Package, Eye, Edit, Trash2, ShoppingBag, ImageOff, CircleCheck, CircleX, Truck, Plus } from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';

interface Produit {
  id: number; code: string; nom: string; description?: string; categorie_nom?: string;
  fournisseur_id?: number; fournisseur_nom?: string; prix_achat: number; prix_vente: number;
  quantite_stock: number; quantite_minimale: number; unite: string; image?: string;
  status: string; nb_commandes?: number;
}

interface ProduitsGridProps {
  produits: Produit[]; imageUrls: Record<number, string | null>; imageErrors: Record<number, boolean>;
  onView: (id: number) => void; onEdit: (produit: Produit) => void; onDelete: (produit: Produit) => void;
  onAdd: () => void; onNewCommande: (produit: Produit) => void;
  getStockLevel: (stock: number, min: number) => { level: string; color: string; bg: string };
  handleImageError: (id: number) => void; isDark: boolean;
}

const ProduitsGrid: React.FC<ProduitsGridProps> = ({ produits, imageUrls, imageErrors, onView, onEdit, onDelete, onAdd, onNewCommande, getStockLevel, handleImageError, isDark }) => {
  const renderStatusBadge = (status: string) => {
    const isActive = status?.toLowerCase() === 'actif';
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11px] font-semibold ${isActive ? 'border-emerald-200 bg-white/95 text-emerald-700 dark:border-emerald-500/20 dark:bg-slate-900/90 dark:text-emerald-400' : 'border-slate-200 bg-white/95 text-slate-500 dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-400'}`}>
        {isActive ? <CircleCheck size={11} strokeWidth={2} /> : <CircleX size={11} strokeWidth={2} />}
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  if (produits.length === 0) {
    return (
      <div className={`flex min-h-[380px] flex-col items-center justify-center rounded-xl border px-6 py-12 text-center ${isDark ? 'border-white/[0.10] bg-[#111C30]' : 'border-slate-200 bg-white'}`}>
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl border ${isDark ? 'border-indigo-500/15 bg-indigo-500/10' : 'border-indigo-100 bg-indigo-50'}`}>
          <Package size={30} strokeWidth={1.7} className="text-indigo-500 dark:text-indigo-400" />
        </div>
        <h3 className={`text-[16px] font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Aucun produit</h3>
        <p className={`mt-1.5 max-w-sm text-[14px] leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Commencez par créer votre premier produit pour gérer votre stock.</p>
        <button type="button" onClick={onAdd} className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600">
          <Plus size={15} />Ajouter un produit
        </button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${isDark ? 'bg-[#111C30]' : 'bg-white'}`}>
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
          <article key={produit.id} onClick={() => onView(produit.id)} className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-all duration-200 ${isDark ? 'border-white/[0.09] bg-[#0F172A] hover:border-white/[0.17] hover:shadow-[0_10px_30px_rgba(0,0,0,0.20)]' : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]'}`}>
            {/* IMAGE */}
            <div className="relative h-32 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
              {imageUrl && !hasImageError ? (
                <img src={imageUrl} alt={produit.nom} loading="lazy" onError={() => handleImageError(produit.id)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.035]" />
              ) : hasImageError ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-800">
                  <ImageOff size={27} strokeWidth={1.6} className="text-slate-400 dark:text-slate-500" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-indigo-500/10 dark:to-violet-500/10">
                  <span className="text-[30px] font-bold text-indigo-500 dark:text-indigo-400">{initial}</span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute right-2 top-2 z-10">{renderStatusBadge(produit.status)}</div>
              <div className="pointer-events-none absolute bottom-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm"><Eye size={11} />Voir</span>
              </div>
            </div>

            {/* BODY */}
            <div className="flex flex-1 flex-col px-3 py-2.5">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <h4 className={`min-w-0 flex-1 truncate text-[14px] font-semibold leading-5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`} title={produit.nom}>{produit.nom}</h4>
                {produit.fournisseur_nom && (
                  <span className={`flex max-w-[90px] shrink-0 items-center gap-1 truncate text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`} title={produit.fournisseur_nom}>
                    <Truck size={10} strokeWidth={1.7} />
                    <span className="truncate">{produit.fournisseur_nom}</span>
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                <span className={`truncate font-mono text-[12px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{produit.code || '—'}</span>
                {produit.categorie_nom && (
                  <>
                    <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>·</span>
                    <span className={`max-w-[110px] truncate rounded-md px-1.5 py-[2px] text-[10.5px] font-medium ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`} title={produit.categorie_nom}>{produit.categorie_nom}</span>
                  </>
                )}
              </div>

              {/* STOCK */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-bold ${isRupture ? 'text-rose-600 dark:text-rose-400' : isAlert ? 'text-amber-600 dark:text-amber-400' : isDark ? 'text-slate-100' : 'text-slate-800'}`}>{stock} <span className="text-[11px] font-medium text-slate-400">{produit.unite || 'p.'}</span></span>
                  <span className={`text-[10.5px] font-semibold ${isRupture ? 'text-rose-500' : isAlert ? 'text-amber-500' : 'text-emerald-500'}`}>{isRupture ? 'Rupture' : isAlert ? 'Stock faible' : 'Disponible'}</span>
                </div>
                <div className={`mt-1.5 h-1 w-full overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className={`h-full rounded-full transition-all duration-500 ${isRupture ? 'bg-rose-500' : isAlert ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${isRupture ? 0 : stockPercentage}%` }} />
                </div>
              </div>

              {/* PRICE + COMMANDES */}
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className={`truncate text-[15px] font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formatMoney(prixVente)}</div>
                  {prixAchat > 0 && <div className={`truncate text-[11px] line-through ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{formatMoney(prixAchat)}</div>}
                </div>
                <div className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 ${isDark ? 'border-indigo-500/15 bg-indigo-500/10' : 'border-indigo-100 bg-indigo-50'}`}>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>Cmd</span>
                  <span className={`text-[13px] font-bold leading-none ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{produit.nb_commandes ?? 0}</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className={`mt-2.5 flex items-center gap-1.5 border-t pt-2 ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} onClick={(e) => e.stopPropagation()}>
                <button type="button" title="Modifier" aria-label="Modifier" onClick={() => onEdit(produit)} className={`flex h-8 flex-1 items-center justify-center rounded-md border transition-all active:scale-[0.97] ${isDark ? 'border-white/[0.07] bg-slate-800/70 text-slate-300 hover:border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-400' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600'}`}>
                  <Edit size={14} strokeWidth={1.8} />
                </button>
                <button type="button" title="Supprimer" aria-label="Supprimer" onClick={() => onDelete(produit)} className={`flex h-8 flex-1 items-center justify-center rounded-md border transition-all active:scale-[0.97] ${isDark ? 'border-rose-500/10 bg-rose-500/[0.07] text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/15' : 'border-rose-100 bg-rose-50 text-rose-500 hover:border-rose-200 hover:bg-rose-100'}`}>
                  <Trash2 size={14} strokeWidth={1.8} />
                </button>
                <button type="button" title="Nouvelle commande" aria-label="Nouvelle commande" onClick={() => onNewCommande(produit)} className={`flex h-8 flex-1 items-center justify-center rounded-md border transition-all active:scale-[0.97] ${isDark ? 'border-indigo-500/15 bg-indigo-500/10 text-indigo-300 hover:border-indigo-400/25 hover:bg-indigo-500/15 hover:text-indigo-200' : 'border-indigo-100 bg-indigo-50 text-indigo-600 hover:border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700'}`}>
                  <ShoppingBag size={14} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ProduitsGrid;