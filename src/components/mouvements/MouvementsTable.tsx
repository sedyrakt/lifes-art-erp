// ============================================================
// src/components/mouvements/MouvementsTable.tsx
// ⭐ PREMIUM MOUVEMENTS TABLE
// ⭐ ALL BORDER SYSTEM (identique à CategoriesTable)
// ⭐ MEDIUM / READABLE FONT SIZE
// ⭐ DARK + LIGHT MODE
// ⭐ PREMIUM HOVER / SELECT STATES
// ⭐ BULK ACTIONS
// ⭐ PORTAL ACTION MENU
// ⭐ RESPONSIVE HORIZONTAL SCROLL
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, ArrowDown, ArrowUp, CheckSquare, ChevronRight, Eye, ImageOff, MoreVertical, Package, TextSelection, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';
import ConfirmModal from '../common/ConfirmModal';

interface Mouvement {
  id: number;
  produit_nom: string;
  produit_code: string;
  type_mouvement: string;
  quantite: number;
  ancien_stock: number;
  nouveau_stock: number;
  date_mouvement: string;
  reference: string;
  prix_achat?: number;
  prix_unitaire?: number;
  produit_image?: string;
}

interface MouvementsTableProps {
  mouvements: Mouvement[];
  getTypeColor: (type: string) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeLabel: (type: string) => string;
  selectedIds?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: number, checked: boolean) => void;
  onBulkDelete?: (ids: number[]) => void;
  onView?: (mouvement: Mouvement) => void;
  imageUrls?: Record<number, string | null>;
  loadImageForMouvement?: (mouvement: Mouvement) => void;
}

interface MenuPosition { top?: number; bottom?: number; left?: number; right?: number; }

const normalizeMovementType = (type?: string): string => (type || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

const formatDate = (date?: string): string => {
  if (!date) return '-';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (date?: string): string => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatNumber = (value: number): string => Number(value || 0).toLocaleString('fr-FR');

const MouvementsTable: React.FC<MouvementsTableProps> = ({ mouvements, getTypeColor, getTypeIcon, getTypeLabel, selectedIds = new Set<number>(), onSelectAll, onSelectOne, onBulkDelete, onView, imageUrls = {}, loadImageForMouvement }) => {
  const { isDark } = useTheme();

  const tableBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const tableSecondaryBackground = isDark ? 'bg-[#0f192b]' : 'bg-slate-50/70';
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-200';
  const cellBorderColor = isDark ? 'border-white/[0.09]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.16]' : 'border-slate-300';

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const safeMouvements = mouvements || [];
  const safeSelectedIds = selectedIds || new Set<number>();

  const stats = useMemo(() => {
    let entrees = 0, sorties = 0, ajustements = 0;
    safeMouvements.forEach((mouvement) => {
      const type = normalizeMovementType(mouvement.type_mouvement);
      if (type.includes('ENTREE')) entrees++;
      else if (type.includes('SORTIE')) sorties++;
      else ajustements++;
    });
    return { total: safeMouvements.length, entrees, sorties, ajustements };
  }, [safeMouvements]);

  const allSelected = safeMouvements.length > 0 && safeMouvements.every((mouvement) => safeSelectedIds.has(mouvement.id));
  const someSelected = safeMouvements.length > 0 && safeMouvements.some((mouvement) => safeSelectedIds.has(mouvement.id)) && !allSelected;

  useEffect(() => {
    if (!loadImageForMouvement) return;
    safeMouvements.forEach((mouvement) => {
      if (imageUrls[mouvement.id] === undefined) loadImageForMouvement(mouvement);
    });
  }, [safeMouvements, imageUrls, loadImageForMouvement]);

  const closeMenu = useCallback(() => setOpenMenuId(null), []);

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => closeMenu();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId, closeMenu]);

  const toggleMenu = useCallback((id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === id) { closeMenu(); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 205, MENU_HEIGHT = 130, PADDING = 12;
    const viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
    const position: MenuPosition = {};
    const spaceBelow = viewportHeight - rect.bottom, spaceAbove = rect.top;
    if (spaceBelow < MENU_HEIGHT + PADDING && spaceAbove > MENU_HEIGHT) position.bottom = viewportHeight - rect.top + 4;
    else position.top = rect.bottom + 4;
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + PADDING && rect.left > MENU_WIDTH) position.right = viewportWidth - rect.right + 4;
    else position.left = Math.max(PADDING, rect.right - MENU_WIDTH);
    setMenuPosition(position); setOpenMenuId(id);
  }, [openMenuId, closeMenu]);

  const handleMenuAction = useCallback((callback: () => void, event: React.MouseEvent) => {
    event.stopPropagation(); closeMenu(); callback();
  }, [closeMenu]);

  const handleSingleDeleteClick = useCallback((id: number) => { setDeleteTargetId(id); setShowDeleteModal(true); }, []);
  const handleConfirmDelete = useCallback(() => {
    if (deleteTargetId === null) return;
    onBulkDelete?.([deleteTargetId]);
    setShowDeleteModal(false); setDeleteTargetId(null);
  }, [deleteTargetId, onBulkDelete]);

  if (safeMouvements.length === 0) {
    return (<div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
      <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400"><Activity size={30} strokeWidth={1.7} /></div>
      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucun mouvement</h3>
      <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Aucun mouvement de stock n'a été enregistré pour le moment.</p>
    </div>);
  }

  return (<div className={`relative overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.20)] ${tableBackground} ${borderColor}`}>
    {safeSelectedIds.size > 0 && (<div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark ? 'border-white/[0.08] bg-indigo-500/[0.065]' : 'border-indigo-100 bg-indigo-50/75'}`}>
      <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm"><CheckSquare size={15} /></div><div className="flex flex-col"><span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">{safeSelectedIds.size} mouvement{safeSelectedIds.size > 1 ? 's' : ''} sélectionné{safeSelectedIds.size > 1 ? 's' : ''}</span><span className="mt-0.5 text-[12px] text-indigo-500/75 dark:text-indigo-400/70">Action groupée disponible</span></div></div>
      <div className="flex items-center gap-2"><button type="button" onClick={() => onBulkDelete?.(Array.from(safeSelectedIds))} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md active:scale-[0.98]"><Trash2 size={15} />Supprimer</button><button type="button" onClick={() => onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"><TextSelection size={15} />Désélectionner</button></div>
    </div>)}

    <div className="custom-scrollbar overflow-x-auto overflow-y-auto scrollbar-gutter-stable">
      <table className={`w-full min-w-[1050px] table-fixed border border-collapse text-left ${borderColor}`}>
        <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark ? 'bg-[#111c30]/97' : 'bg-slate-50/97'}`}>
          <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
            <th scope="col" className={`w-[48px] border px-3 py-4 align-middle ${headerBorderColor}`}><input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected; }} onChange={(event) => onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner tous les mouvements" /></th>
            <th scope="col" className={`w-[115px] border px-5 py-4 ${headerBorderColor}`}>Date</th>
            <th scope="col" className={`w-[250px] border px-5 py-4 ${headerBorderColor}`}>Produit</th>
            <th scope="col" className={`w-[130px] border px-5 py-4 ${headerBorderColor}`}>Type</th>
            <th scope="col" className={`w-[90px] border px-5 py-4 ${headerBorderColor}`}>Quantité</th>
            <th scope="col" className={`w-[130px] border px-5 py-4 ${headerBorderColor}`}>Prix unit.</th>
            <th scope="col" className={`w-[150px] border px-5 py-4 ${headerBorderColor}`}>Stock</th>
            <th scope="col" className={`w-[130px] border px-5 py-4 ${headerBorderColor}`}>Référence</th>
            <th scope="col" className={`w-[88px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
          </tr>
        </thead>
        <tbody className={tableBackground}>
          {safeMouvements.map((mouvement) => {
            const type = normalizeMovementType(mouvement.type_mouvement);
            const isEntree = type.includes('ENTREE'); const isSortie = type.includes('SORTIE');
            const isSelected = safeSelectedIds.has(mouvement.id);
            // ⭐ FIX: Mampiasa imageUrls voaloa avy amin'ny hook
            const imageUrl = imageUrls[mouvement.id] || mouvement.produit_image || null;
            const quantityConfig = isEntree ? { prefix: '+', wrapper: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: <ArrowDown size={12} /> } : isSortie ? { prefix: '-', wrapper: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400', icon: <ArrowUp size={12} /> } : { prefix: '±', wrapper: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: <Activity size={12} /> };
            const price = Number(mouvement.prix_unitaire ?? mouvement.prix_achat ?? 0) || 0;
            const ancienStock = Number(mouvement.ancien_stock) || 0; const nouveauStock = Number(mouvement.nouveau_stock) || 0;
            return (<tr key={mouvement.id} onClick={() => onView?.(mouvement)} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected ? (isDark ? 'bg-indigo-500/[0.085]' : 'bg-indigo-50/80') : isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80'}`}>
              <td className={`border px-3 py-3 align-middle ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={isSelected} onChange={(event) => onSelectOne?.(mouvement.id, event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${mouvement.produit_nom || 'ce mouvement'}`} /></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><div className="flex flex-col"><span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{formatDate(mouvement.date_mouvement)}</span><span className="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">{formatTime(mouvement.date_mouvement)}</span></div></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    {imageUrl ? (
                      <img src={imageUrl} alt={mouvement.produit_nom || 'Produit'} loading="lazy" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <ImageOff size={18} strokeWidth={1.8} className="text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                    <span className={`absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${isEntree ? 'bg-emerald-500' : isSortie ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  </div>
                  <div className="min-w-0"><div title={mouvement.produit_nom || 'Produit inconnu'} className="truncate text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{mouvement.produit_nom || 'Produit inconnu'}</div><div className="mt-0.5 flex min-w-0 items-center gap-1 text-[12px] font-medium text-slate-400 dark:text-slate-500"><Package size={11} className="shrink-0" /><span className="truncate font-mono">{mouvement.produit_code || 'Sans code'}</span></div></div>
                </div>
              </td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[14px] font-medium ${getTypeColor(mouvement.type_mouvement)}`}>{getTypeIcon(mouvement.type_mouvement)}{getTypeLabel(mouvement.type_mouvement)}</span></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className={`inline-flex min-w-[55px] items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[14px] font-semibold ${quantityConfig.wrapper}`}>{quantityConfig.icon}{quantityConfig.prefix}{formatNumber(Number(mouvement.quantite) || 0)}</span></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><div className="flex flex-col"><span className="whitespace-nowrap text-[14px] font-semibold text-slate-900 dark:text-slate-100">{formatMoney(price)}</span><span className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">Prix unitaire</span></div></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><div className="flex items-center gap-1.5"><span title="Ancien stock" className="rounded-md bg-slate-100 px-2 py-1 text-[14px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{formatNumber(ancienStock)}</span><ChevronRight size={14} className={`shrink-0 ${isEntree ? 'text-emerald-500' : isSortie ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600'}`} /><span title="Nouveau stock" className="rounded-md bg-indigo-50 px-2 py-1 text-[14px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">{formatNumber(nouveauStock)}</span></div></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className="block max-w-[110px] truncate font-mono text-[14px] text-slate-500 dark:text-slate-400" title={mouvement.reference || ''}>{mouvement.reference || '-'}</span></td>
              <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-end gap-1"><button type="button" title="Voir les détails" onClick={() => onView?.(mouvement)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><Eye size={17} strokeWidth={1.8} /></button><button type="button" title="Plus d'actions" aria-label={`Actions pour ${mouvement.produit_nom || 'ce mouvement'}`} aria-expanded={openMenuId === mouvement.id} onClick={(event) => toggleMenu(mouvement.id, event)} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 ${openMenuId === mouvement.id ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><MoreVertical size={18} /></button></div></td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>

    {openMenuId !== null && createPortal(<div className={`fixed z-[99999] w-[205px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'border-white/[0.10] bg-[#111c30]/98' : 'border-slate-200 bg-white/98'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
      {(() => {
        const currentMouvement = safeMouvements.find((item) => item.id === openMenuId);
        if (!currentMouvement) return null;
        return (<div className="flex flex-col text-[14px]"><button type="button" onMouseDown={(event) => handleMenuAction(() => onView?.(currentMouvement), event)} className="flex w-full items-center px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"><Eye size={16} className="mr-3 shrink-0 text-slate-500 dark:text-slate-400" /><span>Voir les détails</span></button><div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} /><button type="button" onMouseDown={(event) => handleMenuAction(() => handleSingleDeleteClick(currentMouvement.id), event)} className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"><Trash2 size={16} className="mr-3 shrink-0" /><span>Supprimer</span></button></div>);
      })()}
    </div>, document.body)}

    <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTargetId(null); }} onConfirm={handleConfirmDelete} title="Confirmation de suppression" message="Voulez-vous vraiment supprimer ce mouvement de stock ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />

    <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
        <span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.total}</span> mouvement{stats.total > 1 ? 's' : ''}</span>
        <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.entrees}</span> Entrée{stats.entrees > 1 ? 's' : ''}</span></span>
        <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.sorties}</span> Sortie{stats.sorties > 1 ? 's' : ''}</span></span>
        {stats.ajustements > 0 && (<><span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" /><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.ajustements}</span> Ajustement{stats.ajustements > 1 ? 's' : ''}</span></span></>)}
      </div>
      <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span>Stock synchronisé</span></div>
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
      @keyframes rowIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
      .group { animation: rowIn 0.18s ease-out; }
    `}</style>
  </div>);
};

export default MouvementsTable;