// ============================================================
// src/components/entrees/EntreesTable.tsx
// ============================================================
// ⭐ PREMIUM ENTREES TABLE
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
import { ArrowDown, Building2, Eye, Hash, MoreVertical, Package, Plus, Trash2, CheckSquare, TextSelection } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

// ============================================================
// TYPES
// ============================================================

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

interface EntreesTableProps {
  entrees: Entree[];
  onView: (entree: Entree) => void;
  onAdd: () => void;
  isDark?: boolean;
  selectedIds?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: number, checked: boolean) => void;
  onBulkDelete?: (ids: number[]) => void;
  imageUrls?: Record<number, string | null>;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

// ============================================================
// COMPONENT
// ============================================================

const EntreesTable: React.FC<EntreesTableProps> = ({ entrees, onView, onAdd, isDark: isDarkProp, selectedIds = new Set<number>(), onSelectAll, onSelectOne, onBulkDelete, imageUrls = {} }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;

  // ==========================================================
  // COLORS (identique à CategoriesTable)
  // ==========================================================

  const tableBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const tableSecondaryBackground = isDark ? 'bg-[#0f192b]' : 'bg-slate-50/70';
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-200';
  const cellBorderColor = isDark ? 'border-white/[0.09]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.16]' : 'border-slate-300';

  // ==========================================================
  // STATE
  // ==========================================================

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({});

  const safeEntrees = entrees || [];
  const safeSelectedIds = selectedIds || new Set<number>();

  // ==========================================================
  // CLOSE MENU
  // ==========================================================

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

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

  // ==========================================================
  // TOGGLE ACTION MENU
  // ==========================================================

  const toggleMenu = useCallback((id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === id) {
      closeMenu();
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 210;
    const MENU_HEIGHT = 108;
    const PADDING = 12;
    const GAP = 5;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const position: MenuPosition = {};
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < MENU_HEIGHT + PADDING && spaceAbove > MENU_HEIGHT + PADDING) {
      position.bottom = viewportHeight - rect.top + GAP;
    } else {
      position.top = rect.bottom + GAP;
    }
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + PADDING && rect.left > MENU_WIDTH + PADDING) {
      position.right = viewportWidth - rect.right + GAP;
    } else {
      position.left = Math.max(PADDING, Math.min(rect.right - MENU_WIDTH, viewportWidth - MENU_WIDTH - PADDING));
    }
    setMenuPosition(position);
    setOpenMenuId(id);
  }, [openMenuId, closeMenu]);

  // ==========================================================
  // MENU ACTION
  // ==========================================================

  const handleMenuAction = useCallback((callback: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    closeMenu();
    callback();
  }, [closeMenu]);

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {
    let totalQuantite = 0;
    let totalValeur = 0;
    const fournisseurSet = new Set<string>();
    for (const entree of safeEntrees) {
      const quantite = Number(entree.quantite) || 0;
      const prix = Number(entree.prix_unitaire) || 0;
      totalQuantite += quantite;
      totalValeur += quantite * prix;
      const fournisseur = entree.fournisseur_nom?.trim();
      if (fournisseur) fournisseurSet.add(fournisseur);
    }
    return {
      totalEntrees: safeEntrees.length,
      totalQuantite,
      totalValeur,
      fournisseurs: fournisseurSet.size,
    };
  }, [safeEntrees]);

  // ==========================================================
  // CURRENT ENTREE
  // ==========================================================

  const currentEntree = useMemo(() => {
    if (openMenuId === null) return null;
    return safeEntrees.find((entree) => entree.id === openMenuId) ?? null;
  }, [safeEntrees, openMenuId]);

  // ==========================================================
  // DATE FORMATTER
  // ==========================================================

  const formatDate = useCallback((value: string) => {
    if (!value) return { date: '—', time: '' };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: '—', time: '' };
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  }, []);

  // ==========================================================
  // SELECTION
  // ==========================================================

  const allSelected = safeEntrees.length > 0 && safeEntrees.every((entree) => safeSelectedIds.has(entree.id));
  const someSelected = safeSelectedIds.size > 0 && !allSelected;

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (safeEntrees.length === 0) {
    return (
      <div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
        <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
          <ArrowDown size={30} strokeWidth={1.7} />
        </div>
        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucune entrée</h3>
        <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Aucun mouvement d'entrée ne correspond aux critères actuels.</p>
        <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]">
          <Plus size={17} />
          Ajouter une entrée
        </button>
      </div>
    );
  }

  // ==========================================================
  // MAIN TABLE
  // ==========================================================

  return (
    <div className={`relative overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.20)] ${tableBackground} ${borderColor}`}>
      {/* ======================================================
          BULK ACTION BAR
      ======================================================= */}

      {safeSelectedIds.size > 0 && (
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark ? 'border-white/[0.08] bg-indigo-500/[0.065]' : 'border-indigo-100 bg-indigo-50/75'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <CheckSquare size={15} />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">
                {safeSelectedIds.size} entrée{safeSelectedIds.size > 1 ? 's' : ''} sélectionnée{safeSelectedIds.size > 1 ? 's' : ''}
              </span>
              <span className="mt-0.5 text-[12px] text-indigo-500/75 dark:text-indigo-400/70">Action groupée disponible</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onBulkDelete?.(Array.from(safeSelectedIds))} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md active:scale-[0.98]">
              <Trash2 size={15} />
              Supprimer
            </button>
            <button type="button" onClick={() => onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
              <TextSelection size={15} />
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          SCROLL CONTAINER
      ======================================================= */}

      <div className="custom-scrollbar overflow-x-auto overflow-y-auto scrollbar-gutter-stable">
        {/* ====================================================
            TABLE
            ⭐ border-collapse = ALL BORDER
        ===================================================== */}

        <table className={`w-full min-w-[1080px] table-fixed border border-collapse text-left ${borderColor}`}>
          {/* ==================================================
              HEADER
          =================================================== */}

          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark ? 'bg-[#111c30]/97' : 'bg-slate-50/97'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
              <th scope="col" className={`w-[48px] border px-3 py-4 align-middle ${headerBorderColor}`}>
                <input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected; }} onChange={(event) => onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner toutes les entrées" />
              </th>
              <th scope="col" className={`w-[125px] border px-5 py-4 ${headerBorderColor}`}>Date</th>
              <th scope="col" className={`w-[290px] border px-5 py-4 ${headerBorderColor}`}>Produit</th>
              <th scope="col" className={`w-[110px] border px-5 py-4 ${headerBorderColor}`}>Quantité</th>
              <th scope="col" className={`w-[145px] border px-5 py-4 ${headerBorderColor}`}>Prix unit.</th>
              <th scope="col" className={`w-[190px] border px-5 py-4 ${headerBorderColor}`}>Fournisseur</th>
              <th scope="col" className={`w-[150px] border px-5 py-4 ${headerBorderColor}`}>Référence</th>
              <th scope="col" className={`w-[88px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
            </tr>
          </thead>

          {/* ==================================================
              BODY
          =================================================== */}

          <tbody className={tableBackground}>
            {safeEntrees.map((entree, index) => {
              const imageUrl = imageUrls[entree.id] || null;
              const initiale = entree.produit_nom?.trim()?.charAt(0)?.toUpperCase() || 'P';
              const isSelected = safeSelectedIds.has(entree.id);
              const { date, time } = formatDate(entree.date_entree);
              const quantite = Number(entree.quantite) || 0;
              const prix = Number(entree.prix_unitaire) || 0;
              return (
                <tr key={`${entree.id}-${index}`} onClick={() => { closeMenu(); onView(entree); }} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected ? (isDark ? 'bg-indigo-500/[0.085]' : 'bg-indigo-50/80') : isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80'}`}>
                  {/* CHECKBOX */}
                  <td className={`border px-3 py-3 align-middle ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={(event) => onSelectOne?.(entree.id, event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${entree.produit_nom}`} />
                  </td>
                  {/* DATE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{date}</span>
                      {time && <span className="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">{time}</span>}
                    </div>
                  </td>
                  {/* PRODUIT */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        {imageUrl ? (
                          <img src={imageUrl} alt={entree.produit_nom || 'Produit'} loading="lazy" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-[14px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{initiale}</div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
                      </div>
                      <div className="min-w-0">
                        <div title={entree.produit_nom} className="truncate text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{entree.produit_nom || 'Produit inconnu'}</div>
                        <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[12px] font-medium text-slate-400 dark:text-slate-500">
                          <Package size={11} className="shrink-0" />
                          <span className="truncate font-mono">{entree.produit_code || 'Sans code'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* QUANTITE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <span className="inline-flex min-w-[52px] items-center justify-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[14px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <ArrowDown size={12} />
                      +{quantite.toLocaleString('fr-FR')}
                    </span>
                  </td>
                  {/* PRIX UNITAIRE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap text-[15px] font-semibold text-slate-900 dark:text-slate-100">{formatMoney(prix)}</span>
                      <span className="mt-0.5 text-[12px] text-slate-400 dark:text-slate-500">Prix unitaire</span>
                    </div>
                  </td>
                  {/* FOURNISSEUR */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Building2 size={14} />
                      </div>
                      <span title={entree.fournisseur_nom || 'Aucun fournisseur'} className="truncate text-[14px] text-slate-600 dark:text-slate-300">{entree.fournisseur_nom || 'Aucun fournisseur'}</span>
                    </div>
                  </td>
                  {/* REFERENCE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Hash size={13} className="shrink-0 text-slate-400 dark:text-slate-500" />
                      <span title={entree.reference || '-'} className="truncate font-mono text-[14px] text-slate-500 dark:text-slate-400">{entree.reference || '-'}</span>
                    </div>
                  </td>
                  {/* ACTIONS */}
                  <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" title="Voir les détails" aria-label={`Voir les détails de ${entree.produit_nom}`} onClick={() => onView(entree)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400">
                        <Eye size={17} strokeWidth={1.8} />
                      </button>
                      <button type="button" title="Plus d'actions" aria-label={`Actions pour ${entree.produit_nom}`} aria-expanded={openMenuId === entree.id} onClick={(event) => toggleMenu(entree.id, event)} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 ${openMenuId === entree.id ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          FLOATING ACTION MENU
      ====================================================== */}

      {openMenuId !== null && currentEntree && createPortal(
        <div className={`fixed z-[99999] w-[210px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'border-white/[0.10] bg-[#111c30]/98' : 'border-slate-200 bg-white/98'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
          <div className="flex flex-col text-[14px]">
            <button type="button" onClick={(event) => handleMenuAction(() => onView(currentEntree), event)} className="flex w-full items-center px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]">
              <Eye size={16} className="mr-3 shrink-0 text-slate-500 dark:text-slate-400" />
              <span>Voir les détails</span>
            </button>
            <div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} />
            <button type="button" onClick={(event) => handleMenuAction(() => onBulkDelete?.([currentEntree.id]), event)} className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300">
              <Trash2 size={16} className="mr-3 shrink-0" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.totalEntrees}</span> entrée{stats.totalEntrees > 1 ? 's' : ''}
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.totalQuantite.toLocaleString('fr-FR')}</span> unité{stats.totalQuantite > 1 ? 's' : ''}
            </span>
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <Building2 size={13} className="text-slate-400 dark:text-slate-500" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.fournisseurs}</span> fournisseur{stats.fournisseurs > 1 ? 's' : ''}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500">
          <span>Valeur totale</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{formatMoney(stats.totalValeur)}</span>
        </div>
      </div>

      {/* ======================================================
          CUSTOM SCROLLBAR + ANIMATION
      ====================================================== */}

      <style>
        {`
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
        `}
      </style>
    </div>
  );
};

export default EntreesTable;