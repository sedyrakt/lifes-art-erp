// src/components/produits/ProduitsViewModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Edit,
  ShoppingBag,
  Truck,
  Package,
  ImageOff,
  CircleCheck,
  CircleX,
  Tag,
  Box,
  AlertTriangle,
  DollarSign,
  FileText,
} from 'lucide-react';
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

interface ProduitsViewModalProps {
  produit: Produit;
  imageUrl: string | null;
  onClose: () => void;
  onEdit: () => void;
  onNewCommande: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  isDark: boolean;
}

const ProduitsViewModal: React.FC<ProduitsViewModalProps> = ({
  produit,
  imageUrl,
  onClose,
  onEdit,
  onNewCommande,
  getStatusColor,
  getStatusIcon,
  isDark,
}) => {
  // Calcul du niveau de stock (identique à ProduitsTable/Grid)
  const stock = Number(produit.quantite_stock || 0);
  const stockMin = Number(produit.quantite_minimale || 0);
  const isRupture = stock <= 0;
  const isAlert = !isRupture && stock <= stockMin;

  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-300';
  const bgCard = isDark ? 'bg-[#111c30]' : 'bg-white';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';

  // Valeurs par défaut pour les données manquantes
  const initial = produit.nom?.charAt(0)?.toUpperCase() || '?';
  const hasImage = imageUrl !== null && imageUrl !== undefined && imageUrl !== '';

  // Classe pour les détails (lignes)
  const detailRowClass = `flex items-center justify-between border-b py-3 ${
    isDark ? 'border-white/[0.06]' : 'border-slate-100'
  } last:border-0 last:pb-0 first:pt-0`;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl ${borderColor} ${bgCard} animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isDark ? 'border-white/[0.10]' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Package size={20} strokeWidth={1.7} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>{produit.nom}</h2>
              <p className={`text-[13px] font-medium ${textSecondary}`}>
                Réf. : <span className="font-mono">{produit.code || '—'}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="flex flex-col md:flex-row">
          {/* Colonne gauche : Image & Statut */}
          <div className="flex flex-col items-center border-b p-6 md:w-1/3 md:border-b-0 md:border-r md:border-r-slate-200 dark:md:border-r-white/[0.08]">
            <div
              className={`relative flex h-52 w-full max-w-[280px] items-center justify-center overflow-hidden rounded-xl border shadow-sm ${
                isDark ? 'border-white/[0.08] bg-slate-800' : 'border-slate-200 bg-slate-100'
              }`}
            >
              {hasImage ? (
                <img
                  src={imageUrl!}
                  alt={produit.nom}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <ImageOff size={36} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-sm text-slate-400 dark:text-slate-500">Aucune image</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[14px] font-semibold ${getStatusColor(
                  produit.status
                )}`}
              >
                {getStatusIcon(produit.status)}
                {produit.status === 'actif' ? 'Actif' : 'Inactif'}
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                <Box size={14} />
                <span>
                  <strong className={textPrimary}>{stock}</strong> {produit.unite || 'p.'}
                </span>
              </div>
              {isRupture ? (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-rose-600 dark:text-rose-400">
                  <AlertTriangle size={14} />
                  Rupture de stock
                </span>
              ) : isAlert ? (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={14} />
                  Stock faible (min : {stockMin})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CircleCheck size={14} />
                  Stock suffisant
                </span>
              )}
            </div>
          </div>

          {/* Colonne droite : Détails */}
          <div className="flex-1 p-6">
            <h3 className={`mb-4 text-[15px] font-semibold ${textPrimary}`}>Détails du produit</h3>
            <div className="space-y-0.5">
              {/* Catégorie */}
              <div className={detailRowClass}>
                <span className={`flex items-center gap-2 text-[14px] ${textSecondary}`}>
                  <Tag size={15} />
                  Catégorie
                </span>
                <span className={`text-[14px] font-medium ${textPrimary}`}>
                  {produit.categorie_nom || '—'}
                </span>
              </div>

              {/* Fournisseur */}
              <div className={detailRowClass}>
                <span className={`flex items-center gap-2 text-[14px] ${textSecondary}`}>
                  <Truck size={15} />
                  Fournisseur
                </span>
                <span className={`text-[14px] font-medium ${textPrimary}`}>
                  {produit.fournisseur_nom || '—'}
                </span>
              </div>

              {/* Prix d'achat */}
              <div className={detailRowClass}>
                <span className={`flex items-center gap-2 text-[14px] ${textSecondary}`}>
                  <DollarSign size={15} />
                  Prix d'achat
                </span>
                <span className="text-[14px] font-medium text-slate-500 dark:text-slate-400 line-through">
                  {formatMoney(produit.prix_achat)}
                </span>
              </div>

              {/* Prix de vente */}
              <div className={detailRowClass}>
                <span className={`flex items-center gap-2 text-[14px] ${textSecondary}`}>
                  <DollarSign size={15} className="text-indigo-500 dark:text-indigo-400" />
                  Prix de vente
                </span>
                <span className={`text-[16px] font-bold text-indigo-600 dark:text-indigo-400`}>
                  {formatMoney(produit.prix_vente)}
                </span>
              </div>

              {/* Stock minimum */}
              <div className={detailRowClass}>
                <span className={`flex items-center gap-2 text-[14px] ${textSecondary}`}>
                  <AlertTriangle size={15} />
                  Stock minimum
                </span>
                <span className={`text-[14px] font-medium ${textPrimary}`}>
                  {stockMin} {produit.unite || 'p.'}
                </span>
              </div>

              {/* Commandes (nb_commandes) */}
              <div className={detailRowClass}>
                <span className={`flex items-center gap-2 text-[14px] ${textSecondary}`}>
                  <ShoppingBag size={15} />
                  Commandes associées
                </span>
                <span className={`inline-flex min-w-[34px] items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[14px] font-bold text-indigo-700 dark:border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-300`}>
                  {produit.nb_commandes ?? 0}
                </span>
              </div>

              {/* Description */}
              <div className={`${detailRowClass} flex-col items-start !border-b-0 pt-3`}>
                <span className={`flex items-center gap-2 text-[14px] ${textSecondary}`}>
                  <FileText size={15} />
                  Description
                </span>
                <p className={`mt-1.5 w-full whitespace-pre-wrap text-[14px] leading-relaxed ${textSecondary}`}>
                  {produit.description || <span className={`italic ${textMuted}`}>Aucune description</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div
          className={`flex flex-wrap items-center justify-end gap-3 border-t px-6 py-4 ${
            isDark ? 'border-white/[0.10]' : 'border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2.5 text-[14px] font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:bg-white/[0.08]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={onNewCommande}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <ShoppingBag size={16} />
            Nouvelle commande
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Edit size={16} />
            Modifier
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProduitsViewModal;