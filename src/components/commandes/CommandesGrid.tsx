// src/components/commandes/CommandesGrid.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Eye, Receipt, Trash2, CheckCircle, XCircle, Truck, MoreVertical, ImageOff, Phone, Package, CalendarDays, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';
import { STATUS } from '../../types/commandes';

export interface Commande {
  id: number; client_id: number; numero: string; client_nom: string; client_telephone: string; client_email: string;
  date_commande: string; statut: string; total_ht: number; total_ttc: number; remise: number;
  observation: string; created_at: string; produits_noms?: string;
}

interface ParsedProduct { nom: string; quantite: number; }

interface CommandesGridProps {
  commandes: Commande[];
  onView: (commande: Commande) => void;
  onGenerateFacture: (commande: Commande) => void;
  onUpdateStatus: (id: number, newStatus: string) => void;
  onDelete: (commande: Commande) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  clientImageUrls?: Record<number, string | null>;
  clientImageErrors?: Record<number, boolean>;
  handleClientImageError?: (id: number) => void;
  isDark?: boolean;
}

const parseProducts = (produits?: string): ParsedProduct[] => {
  if (!produits?.trim()) return [];
  return produits.split(',').map(item => item.trim()).filter(Boolean).map(item => {
    const match = item.match(/^(.*?)\s*\(x(\d+)\)\s*$/);
    return match ? { nom: match[1].trim(), quantite: Number(match[2]) || 1 } : { nom: item, quantite: 1 };
  });
};

const formatCommandeDate = (date?: string) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return { date: parsed.toLocaleDateString('fr-FR'), time: parsed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
};

const getStatusDotColor = (statut: string) => {
  switch (statut) {
    case STATUS.PENDING: return 'bg-amber-500';
    case STATUS.CONFIRMED: return 'bg-emerald-500';
    case STATUS.SHIPPED: return 'bg-blue-500';
    case STATUS.DELIVERED: return 'bg-emerald-500';
    case STATUS.CANCELLED: return 'bg-rose-500';
    default: return 'bg-slate-400';
  }
};

const CommandesGrid: React.FC<CommandesGridProps> = ({ commandes, onView, onGenerateFacture, onUpdateStatus, onDelete, getStatusColor, getStatusIcon, clientImageUrls = {}, clientImageErrors = {}, handleClientImageError, isDark: isDarkProp }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number; }>({});

  const toggleMenu = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 220, MENU_HEIGHT = 200, PADDING = 12;
    const viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
    const position: typeof menuPosition = {};
    const spaceBelow = viewportHeight - rect.bottom, spaceAbove = rect.top;
    if (spaceBelow < MENU_HEIGHT + PADDING && spaceAbove > MENU_HEIGHT + PADDING) { position.bottom = viewportHeight - rect.top + 4; } else { position.top = rect.bottom + 4; }
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + PADDING && rect.left > MENU_WIDTH + PADDING) { position.right = viewportWidth - rect.right + 4; } else { position.left = Math.max(PADDING, rect.right - MENU_WIDTH); }
    setMenuPosition(position); setOpenMenuId(id);
  };

  const handleMenuAction = (callback: () => void, event: React.MouseEvent) => { event.stopPropagation(); setOpenMenuId(null); callback(); };

  if (!commandes?.length) {
    return (
      <div className={`flex min-h-[390px] flex-col items-center justify-center rounded-2xl border bg-white px-6 py-14 text-center shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.20)] ${isDark ? 'border-white/[0.14]' : 'border-slate-300'}`}>
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 shadow-sm dark:border-indigo-500/10 dark:bg-indigo-500/10">
          <ShoppingCart size={34} strokeWidth={1.7} className="text-indigo-500 dark:text-indigo-400" />
        </div>
        <h3 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-slate-100">Aucune commande</h3>
        <p className="mt-1.5 max-w-sm text-[14.5px] leading-6 text-slate-500 dark:text-slate-400">Aucune commande ne correspond aux critères actuels.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {commandes.filter(Boolean).map(commande => {
        const imageUrl = clientImageUrls[commande.client_id] || null;
        const imageError = clientImageErrors[commande.client_id] || false;
        const initials = commande.client_nom?.trim().split(/\s+/).filter(Boolean).map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase() || '?';
        const products = parseProducts(commande.produits_noms);
        const visibleProducts = products.slice(0, 2);
        const hiddenProducts = Math.max(0, products.length - 2);
        const formattedDate = formatCommandeDate(commande.date_commande);
        const totalTTC = Number(commande.total_ttc || 0);

        return (
          <div key={commande.id} onClick={() => onView(commande)} className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${isDark ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
            {/* PHOTO CLIENT */}
            <div className="relative h-36 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
              {imageUrl && !imageError ? (
                <img src={imageUrl} alt={commande.client_nom} loading="lazy" onError={() => handleClientImageError?.(commande.client_id)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : imageError ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700">
                  <ImageOff size={28} className="text-slate-400 dark:text-slate-500" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-50 dark:bg-indigo-500/10">
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute right-2 top-2 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(commande.statut)}`} />
                  {getStatusIcon(commande.statut)}
                  {commande.statut}
                </span>
              </div>
            </div>

            {/* BODY */}
            <div className="flex flex-1 flex-col p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="line-clamp-1 text-[14px] font-semibold text-slate-900 dark:text-slate-100" title={commande.client_nom}>{commande.client_nom || 'Client inconnu'}</h4>
                <span className="inline-flex shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{commande.numero}</span>
              </div>
              <div className="space-y-1 text-[13px] text-slate-500 dark:text-slate-400">
                {commande.client_telephone ? (
                  <div className="flex min-w-0 items-center gap-2 truncate">
                    <Phone size={13} className="shrink-0" />
                    <span className="truncate">{commande.client_telephone}</span>
                  </div>
                ) : commande.client_email ? (
                  <div className="flex min-w-0 items-center gap-2 truncate">
                    <Mail size={13} className="shrink-0" />
                    <span className="truncate">{commande.client_email}</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[13px] text-slate-700 dark:text-slate-300">
                <Package size={13} className="shrink-0 text-slate-400 dark:text-slate-500" />
                {products.length === 0 ? (
                  <span className="text-slate-400 dark:text-slate-500">Aucun produit</span>
                ) : (
                  <>
                    <span className="truncate" title={products.map(product => `${product.nom} (x${product.quantite})`).join(', ')}>{visibleProducts.map(p => p.nom).join(', ')}</span>
                    {hiddenProducts > 0 && <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">+{hiddenProducts}</span>}
                  </>
                )}
              </div>
              {formattedDate && (
                <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                  <CalendarDays size={13} className="shrink-0" />
                  <span>{formattedDate.date}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>{formattedDate.time}</span>
                </div>
              )}
              <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-2.5 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Total TTC</span>
                <span className="text-[15px] font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(totalTTC)}</span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-200 pt-2.5 dark:border-slate-700" onClick={event => event.stopPropagation()}>
                <button type="button" title="Générer la facture" onClick={() => onGenerateFacture(commande)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-emerald-100 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400">
                  <Receipt size={14} />
                </button>
                <button type="button" title="Voir les détails" onClick={() => onView(commande)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50">
                  <Eye size={14} />
                </button>
                <button type="button" title="Actions" onClick={event => toggleMenu(commande.id, event)} className={`flex h-8 flex-1 items-center justify-center rounded-md transition-colors ${openMenuId === commande.id ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* CONTEXT MENU */}
      {openMenuId !== null && createPortal(
        <div className={`fixed z-[99999] w-[220px] overflow-hidden rounded-xl border py-1.5 shadow-2xl backdrop-blur-xl ${isDark ? 'border-white/[0.07] bg-[#111c30]' : 'border-slate-200 bg-white'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
          {(() => {
            const currentCommande = commandes.find(commande => commande.id === openMenuId);
            if (!currentCommande) return null;
            const isPending = currentCommande.statut === STATUS.PENDING;
            const isConfirmed = currentCommande.statut === STATUS.CONFIRMED;
            const isDelivered = currentCommande.statut === STATUS.DELIVERED;
            const isShipped = currentCommande.statut === STATUS.SHIPPED;
            return (
              <div className="flex flex-col p-1">
                {isPending && (
                  <>
                    <button type="button" onMouseDown={event => handleMenuAction(() => onUpdateStatus(currentCommande.id, STATUS.CONFIRMED), event)} className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400">
                      <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><CheckCircle size={15} /></span>
                      <span>Confirmer</span>
                    </button>
                    <button type="button" onMouseDown={event => handleMenuAction(() => onUpdateStatus(currentCommande.id, STATUS.CANCELLED), event)} className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400">
                      <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"><XCircle size={15} /></span>
                      <span>Annuler</span>
                    </button>
                  </>
                )}
                {isConfirmed && (
                  <>
                    <button type="button" onMouseDown={event => handleMenuAction(() => onUpdateStatus(currentCommande.id, STATUS.DELIVERED), event)} className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400">
                      <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><Truck size={15} /></span>
                      <span>Livrer</span>
                    </button>
                    <button type="button" onMouseDown={event => handleMenuAction(() => onUpdateStatus(currentCommande.id, STATUS.CANCELLED), event)} className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400">
                      <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"><XCircle size={15} /></span>
                      <span>Annuler</span>
                    </button>
                  </>
                )}
                {(isShipped || isDelivered) && (
                  <button type="button" onMouseDown={event => handleMenuAction(() => onView(currentCommande), event)} className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400">
                    <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Eye size={15} /></span>
                    <span>Voir les détails</span>
                  </button>
                )}
                <div className={`my-1 border-t ${isDark ? 'border-white/[0.055]' : 'border-slate-100'}`} />
                <button type="button" onMouseDown={event => handleMenuAction(() => onDelete(currentCommande), event)} className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300">
                  <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 size={15} /></span>
                  <span>Supprimer</span>
                </button>
              </div>
            );
          })()}
        </div>, document.body)}
    </div>
  );
};

export default CommandesGrid;