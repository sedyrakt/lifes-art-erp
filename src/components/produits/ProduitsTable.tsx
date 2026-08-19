// ============================================================
// src/components/produits/ProduitsTable.tsx
// ⭐ PRO / PREMIUM PRODUITS TABLE
// ⭐ ALL BORDER SYSTEM (IDENTIQUE À CategoriesTable)
// ⭐ MEDIUM / READABLE FONT SIZE
// ⭐ DARK + LIGHT MODE
// ⭐ PREMIUM HOVER / SELECT STATES
// ⭐ BULK ACTIONS
// ⭐ PORTAL ACTION MENU
// ⭐ RESPONSIVE HORIZONTAL SCROLL
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Package, Eye, Edit, Trash2, Plus, ImageOff, CheckSquare, TextSelection, ShoppingBag, Truck, MoreVertical, ChevronRight, AlertTriangle, CircleCheck, CircleX, Boxes } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
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

interface ProduitsTableProps {
  produits: Produit[];
  imageUrls: Record<number, string | null>;
  imageErrors: Record<number, boolean>;
  onView: (id: number) => void;
  onEdit: (produit: Produit) => void;
  onDelete: (produit: Produit) => void;
  onAdd: () => void;
  getStockLevel: (stock: number, min: number) => { level: string; color: string; bg: string };
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  handleImageError: (id: number) => void;
  totalStats?: { total: number; rupture: number; alerte: number; valeur_totale: number };
  totalItems?: number;
  selectedIds?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: number, checked: boolean) => void;
  onBulkDelete?: (ids: number[]) => void;
  onBulkUpdateStatus?: (ids: number[], newStatus: string) => void;
}

const ProduitsTable: React.FC<ProduitsTableProps> = ({ 
  produits, 
  imageUrls, 
  imageErrors, 
  onView, 
  onEdit, 
  onDelete, 
  onAdd, 
  getStockLevel, 
  getStatusColor, 
  getStatusIcon, 
  handleImageError, 
  totalStats, 
  totalItems, 
  selectedIds = new Set<number>(), 
  onSelectAll, 
  onSelectOne, 
  onBulkDelete, 
  onBulkUpdateStatus 
}) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({});

  // ⭐ COLORS IDENTIQUES À CategoriesTable
  const tableBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const tableSecondaryBackground = isDark ? 'bg-[#0f192b]' : 'bg-slate-50/70';
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-200';
  const cellBorderColor = isDark ? 'border-white/[0.09]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.16]' : 'border-slate-300';
  const safeImageUrls = imageUrls || {};
  const safeImageErrors = imageErrors || {};
  const safeSelectedIds = selectedIds || new Set<number>();

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => setOpenMenuId(null);
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenMenuId(null); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('keydown', handleKeyDown); };
  }, [openMenuId]);

  const toggleMenu = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 220; const MENU_HEIGHT = 215; const PADDING = 12;
    const viewportWidth = window.innerWidth; const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom; const spaceAbove = rect.top;
    const position: { top?: number; bottom?: number; left?: number; right?: number } = {};
    if (spaceBelow < MENU_HEIGHT + PADDING && spaceAbove > MENU_HEIGHT) position.bottom = viewportHeight - rect.top + 6;
    else position.top = rect.bottom + 6;
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + PADDING && rect.left > MENU_WIDTH) position.right = viewportWidth - rect.right;
    else position.left = Math.max(PADDING, rect.right - MENU_WIDTH);
    setMenuPosition(position); setOpenMenuId(id);
  };

  const handleMenuAction = (callback: () => void, event: React.MouseEvent) => {
    event.stopPropagation(); setOpenMenuId(null); callback();
  };

  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const isActive = normalizedStatus === 'actif' || normalizedStatus === 'active';
    return (<span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold transition-colors ${isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400'}`}>{isActive ? <CircleCheck size={12} strokeWidth={2.5} /> : <CircleX size={12} strokeWidth={2.5} />}{isActive ? 'Actif' : 'Inactif'}</span>);
  };

  const stats = useMemo(() => {
    const total = totalItems !== undefined && totalItems > 0 ? totalItems : totalStats?.total ?? produits.length;
    const rupture = totalStats?.rupture ?? 0; const alerte = totalStats?.alerte ?? 0;
    const valeurTotale = produits.reduce((acc, produit) => acc + Number(produit.prix_vente || 0) * Number(produit.quantite_stock || 0), 0);
    const actifs = produits.filter((produit) => produit.status?.toLowerCase() === 'actif').length;
    return { total, rupture, alerte, valeurTotale, actifs };
  }, [produits, totalStats, totalItems]);

  const allSelected = produits.length > 0 && produits.every((produit) => safeSelectedIds.has(produit.id));
  const someSelected = safeSelectedIds.size > 0 && !allSelected;

  if (produits.length === 0) {
    return (<div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
      <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400"><Package size={30} strokeWidth={1.7} /></div>
      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucun produit</h3>
      <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Commencez par créer votre premier produit pour gérer votre stock.</p>
      <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]"><Plus size={17} />Ajouter un produit</button>
    </div>);
  }

  return (<div className={`relative overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.20)] ${tableBackground} ${borderColor}`}>
    {safeSelectedIds.size > 0 && (<div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark ? 'border-white/[0.08] bg-indigo-500/[0.065]' : 'border-indigo-100 bg-indigo-50/75'}`}>
      <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm"><CheckSquare size={15} /></div><div className="flex flex-col"><span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">{safeSelectedIds.size} produit{safeSelectedIds.size > 1 ? 's' : ''} sélectionné{safeSelectedIds.size > 1 ? 's' : ''}</span><span className="mt-0.5 text-[12px] text-indigo-500/75 dark:text-indigo-400/70">Action groupée disponible</span></div></div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onBulkUpdateStatus?.(Array.from(safeSelectedIds), 'actif')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"><CheckSquare size={15} />Activer</button>
        <button type="button" onClick={() => onBulkUpdateStatus?.(Array.from(safeSelectedIds), 'inactif')} className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-slate-600 dark:hover:bg-slate-500"><CircleX size={15} />Désactiver</button>
        <button type="button" onClick={() => onBulkDelete?.(Array.from(safeSelectedIds))} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md active:scale-[0.98]"><Trash2 size={15} />Supprimer</button>
        <button type="button" onClick={() => onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"><TextSelection size={15} />Désélectionner</button>
      </div>
    </div>)}

    <div className="custom-scrollbar overflow-x-auto overflow-y-auto scrollbar-gutter-stable">
      {/* ⭐ TABLE BORDER SYSTEM IDENTIQUE À CategoriesTable */}
      <table className={`w-full min-w-[1100px] table-fixed border border-collapse text-left ${borderColor}`}>
        
        {/* ⭐ THEAD: ESORINA NY border-b, ny th tsirairay no mitondra ny sisiny */}
        <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark ? 'bg-[#111c30]/97' : 'bg-slate-50/97'}`}>
          <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
            <th scope="col" className={`w-[48px] border px-3 py-4 align-middle ${headerBorderColor}`}>
              <input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected; }} onChange={(event) => onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner tous les produits" />
            </th>
            <th scope="col" className={`w-[72px] border px-3 py-4 ${headerBorderColor}`}>Produit</th>
            <th scope="col" className={`w-[130px] border px-3 py-4 ${headerBorderColor}`}>Ref.</th>
            <th scope="col" className={`min-w-[220px] border px-3 py-4 ${headerBorderColor}`}>Désignation</th>
            <th scope="col" className={`w-[145px] border px-3 py-4 ${headerBorderColor}`}>Catégorie</th>
            <th scope="col" className={`w-[110px] border px-3 py-4 ${headerBorderColor}`}>Stock</th>
            <th scope="col" className={`w-[80px] border px-3 py-4 ${headerBorderColor}`}>CMD</th>
            <th scope="col" className={`w-[155px] border px-3 py-4 ${headerBorderColor}`}>Prix</th>
            <th scope="col" className={`w-[105px] border px-3 py-4 ${headerBorderColor}`}>Statut</th>
            <th scope="col" className={`w-[88px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
          </tr>
        </thead>

        {/* ⭐ TBODY: Ny td tsirairay dia manana border mitovy */}
        <tbody className={tableBackground}>
          {produits.filter(Boolean).map((produit) => {
            const imageUrl = safeImageUrls[produit.id] ?? null; const hasImageError = safeImageErrors[produit.id] ?? false;
            const isSelected = safeSelectedIds.has(produit.id); const initial = produit.nom?.charAt(0)?.toUpperCase() || '?';
            const stock = Number(produit.quantite_stock || 0); const stockMin = Number(produit.quantite_minimale || 0);
            const stockReference = Math.max(stockMin * 5, 1); const stockPercentage = Math.min(100, Math.max(0, (stock / stockReference) * 100));
            const isRupture = stock <= 0; const isAlert = !isRupture && stock <= stockMin;
            const prixAchat = Number(produit.prix_achat || 0); const prixVente = Number(produit.prix_vente || 0);
            return (<tr key={produit.id} onClick={() => { setOpenMenuId(null); onView(produit.id); }} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected ? (isDark ? 'bg-indigo-500/[0.085]' : 'bg-indigo-50/80') : isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80'}`}>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={isSelected} onChange={(event) => onSelectOne?.(produit.id, event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${produit.nom}`} /></td>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm transition-all duration-200 group-hover:scale-[1.03] ${isSelected ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10' : 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'}`}>{imageUrl && !hasImageError ? <img src={imageUrl} alt={produit.nom} loading="lazy" onError={() => handleImageError(produit.id)} className="h-full w-full object-cover" /> : hasImageError ? <ImageOff size={17} className="text-slate-400 dark:text-slate-500" /> : <span className="text-[15px] font-bold text-indigo-600 dark:text-indigo-400">{initial}</span>}</div></td>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><span title={produit.code || 'Référence inconnue'} className="inline-flex max-w-[120px] truncate rounded-md bg-slate-100 px-2 py-1 font-mono text-[14px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{produit.code || '—'}</span></td>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><div className="min-w-0"><div title={produit.nom} className="max-w-[250px] truncate text-[15px] font-semibold leading-5 text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{produit.nom}</div>{produit.fournisseur_nom && <div className="mt-1 flex max-w-[250px] items-center gap-1 truncate text-[13px] text-slate-400 dark:text-slate-500"><Truck size={10} /><span className="truncate">{produit.fournisseur_nom}</span></div>}</div></td>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}>{produit.categorie_nom ? <span className="inline-flex max-w-[130px] items-center truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[14px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300" title={produit.categorie_nom}>{produit.categorie_nom}</span> : <span className="text-[13px] italic text-slate-400 dark:text-slate-500">Sans catégorie</span>}</td>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><div className="flex flex-col gap-1"><div className="flex items-baseline gap-0.5"><span className={`text-[14px] font-bold ${isRupture ? 'text-rose-600 dark:text-rose-400' : isAlert ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>{stock}</span><span className="ml-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">{produit.unite || 'p.'}</span></div><div className="flex w-full items-center gap-2"><div className="h-1.5 min-w-[25px] flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full transition-all duration-500 ${isRupture ? 'bg-rose-500' : isAlert ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${isRupture ? 0 : stockPercentage}%` }} /></div><span className={`shrink-0 text-[11px] font-bold ${isRupture ? 'text-rose-500' : isAlert ? 'text-amber-500' : 'text-emerald-500'}`}>{isRupture ? 'Rupture' : isAlert ? 'Faible' : 'OK'}</span></div></div></td>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><span className="inline-flex min-w-[34px] items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1.5 text-[14px] font-bold text-indigo-700 dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-300">{produit.nb_commandes ?? 0}</span></td>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><div className="flex flex-col"><span className="whitespace-nowrap text-[14px] font-bold text-slate-900 dark:text-slate-100">{formatMoney(prixVente)}</span><span className="mt-0.5 whitespace-nowrap text-[13px] text-slate-400 dark:text-slate-500">Achat · {formatMoney(prixAchat)}</span></div></td>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}>{renderStatusBadge(produit.status)}</td>
              <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-end gap-1"><button type="button" title="Voir le produit" onClick={() => onView(produit.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><Eye size={17} strokeWidth={1.8} /></button><button type="button" title="Plus d'actions" aria-label={`Actions pour ${produit.nom}`} aria-expanded={openMenuId === produit.id} onClick={(event) => toggleMenu(produit.id, event)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all duration-150 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"><MoreVertical size={18} /></button></div></td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>

    {openMenuId !== null && createPortal(<div className={`fixed z-[99999] w-[220px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'border-white/[0.10] bg-[#111c30]/98' : 'border-slate-200 bg-white/98'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
      {(() => { const currentProduct = produits.find((product) => product.id === openMenuId); if (!currentProduct) return null; return (<div className="flex flex-col text-[14px]"><div className={`border-b px-4 py-3 ${isDark ? 'border-white/[0.08]' : 'border-slate-100'}`}><div className="flex items-center gap-2"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Package size={14} /></div><div className="min-w-0"><div className="max-w-[165px] truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">{currentProduct.nom}</div><div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500">{currentProduct.code || 'Sans référence'}</div></div></div></div><button type="button" onMouseDown={(event) => handleMenuAction(() => onEdit(currentProduct), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Edit size={15} /></span><span>Modifier</span><ChevronRight size={15} className="ml-auto text-slate-300 dark:text-slate-600" /></button>{currentProduct.fournisseur_id && (<button type="button" onMouseDown={(event) => handleMenuAction(() => navigate(`/fournisseurs/${currentProduct.fournisseur_id}`), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Truck size={15} /></span><span>Voir fournisseur</span><ChevronRight size={15} className="ml-auto text-slate-300 dark:text-slate-600" /></button>)}<div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} /><button type="button" onMouseDown={(event) => handleMenuAction(() => onDelete(currentProduct), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 size={15} /></span><span>Supprimer</span></button></div>); })()}
    </div>, document.body)}

    <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-2"><Boxes size={14} className="text-indigo-500 dark:text-indigo-400" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.total}</span> produit{stats.total > 1 ? 's' : ''}</span></span>
        <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.actifs}</span> actif{stats.actifs > 1 ? 's' : ''}</span></span>
        <span className="flex items-center gap-2"><AlertTriangle size={13} className="text-rose-500" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.rupture}</span> rupture</span></span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.10)]" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.alerte}</span> alerte</span></span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"><span className="text-[13px] font-medium text-slate-400 dark:text-slate-500">Valeur stock</span><span className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{formatMoney(stats.valeurTotale)}</span></div>
    </div>

    <style>{`
      .custom-scrollbar::-webkit-scrollbar { width: 7px; height: 7px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.26); border-radius: 999px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.46); }
      .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100, 116, 139, 0.28) transparent; }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.20); }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.32); }
      .scrollbar-gutter-stable { scrollbar-gutter: stable; }
      @keyframes productRowIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
      .group { animation: productRowIn 0.18s ease-out; }
    `}</style>
  </div>);
};

export default ProduitsTable;