// ============================================================
// src/components/sorties/SortiesTable.tsx
// ============================================================
// ⭐ PREMIUM SORTIES TABLE
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
import { ArrowUp, CalendarDays, CheckSquare, Eye, Hash, MapPin, MoreVertical, Package, Plus, TextSelection, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

// ============================================================
// TYPES
// ============================================================

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

interface SortiesTableProps {
  sorties: Sortie[];
  onView: (sortie: Sortie) => void;
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
// CONSTANTS
// ============================================================

const MENU_WIDTH = 205;
const MENU_HEIGHT = 112;
const MENU_PADDING = 12;

// ============================================================
// DATE HELPERS
// ============================================================

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatDate = (value?: string): string => {
  const date = parseDate(value);
  if (!date) return '-';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (value?: string): string => {
  const date = parseDate(value);
  if (!date) return '';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatQuantity = (value: number): string => Number(value || 0).toLocaleString('fr-FR');

// ============================================================
// COMPONENT
// ============================================================

const SortiesTable: React.FC<SortiesTableProps> = ({ sorties, onView, onAdd, isDark: isDarkProp, selectedIds = new Set<number>(), onSelectAll, onSelectOne, onBulkDelete, imageUrls = {} }) => {
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

  const safeSorties = sorties || [];
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

  const calculateMenuPosition = useCallback((button: HTMLButtonElement): MenuPosition => {
    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const position: MenuPosition = {};
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < MENU_HEIGHT + MENU_PADDING && spaceAbove > MENU_HEIGHT) {
      position.bottom = viewportHeight - rect.top + 4;
    } else {
      position.top = rect.bottom + 4;
    }
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + MENU_PADDING && rect.left > MENU_WIDTH) {
      position.right = viewportWidth - rect.right + 4;
    } else {
      position.left = Math.max(MENU_PADDING, rect.right - MENU_WIDTH);
    }
    return position;
  }, []);

  const toggleMenu = useCallback((id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === id) {
      closeMenu();
      return;
    }
    const position = calculateMenuPosition(event.currentTarget);
    setMenuPosition(position);
    setOpenMenuId(id);
  }, [openMenuId, closeMenu, calculateMenuPosition]);

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
    const totalQuantite = safeSorties.reduce((total, sortie) => total + (Number(sortie.quantite) || 0), 0);
    const totalValeur = safeSorties.reduce((total, sortie) => total + (Number(sortie.quantite) || 0) * (Number(sortie.prix_unitaire) || 0), 0);
    const totalDestinations = new Set(safeSorties.map((sortie) => sortie.destination?.trim()).filter(Boolean)).size;
    return {
      total: safeSorties.length,
      totalQuantite,
      totalValeur,
      totalDestinations,
    };
  }, [safeSorties]);

  // ==========================================================
  // SELECTION
  // ==========================================================

  const allSelected = safeSorties.length > 0 && safeSorties.every((sortie) => safeSelectedIds.has(sortie.id));
  const someSelected = safeSelectedIds.size > 0 && !allSelected;

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (safeSorties.length === 0) {
    return (
      <div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
        <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
          <ArrowUp size={30} strokeWidth={1.7} />
        </div>
        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucune sortie</h3>
        <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Aucune sortie de stock ne correspond aux critères actuels.</p>
        <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]">
          <Plus size={17} />
          Ajouter une sortie
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
                {safeSelectedIds.size} sortie{safeSelectedIds.size > 1 ? 's' : ''} sélectionnée{safeSelectedIds.size > 1 ? 's' : ''}
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

        <table className={`w-full min-w-[1040px] table-fixed border border-collapse text-left ${borderColor}`}>
          {/* ==================================================
              HEADER
          =================================================== */}

          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark ? 'bg-[#111c30]/97' : 'bg-slate-50/97'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
              <th scope="col" className={`w-[48px] border px-3 py-4 align-middle ${headerBorderColor}`}>
                <input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected; }} onChange={(event) => onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner toutes les sorties" />
              </th>
              <th scope="col" className={`w-[135px] border px-5 py-4 ${headerBorderColor}`}>Date</th>
              <th scope="col" className={`w-[280px] border px-5 py-4 ${headerBorderColor}`}>Produit</th>
              <th scope="col" className={`w-[110px] border px-5 py-4 ${headerBorderColor}`}>Quantité</th>
              <th scope="col" className={`w-[150px] border px-5 py-4 ${headerBorderColor}`}>Prix unit.</th>
              <th scope="col" className={`w-[190px] border px-5 py-4 ${headerBorderColor}`}>Destination</th>
              <th scope="col" className={`w-[150px] border px-5 py-4 ${headerBorderColor}`}>Référence</th>
              <th scope="col" className={`w-[88px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
            </tr>
          </thead>

          {/* ==================================================
              BODY
          =================================================== */}

          <tbody className={tableBackground}>
            {safeSorties.map((sortie, index) => {
              const imageUrl = imageUrls[sortie.id] || sortie.produit_image || null;
              const isSelected = safeSelectedIds.has(sortie.id);
              const quantite = Number(sortie.quantite) || 0;
              const prix = Number(sortie.prix_unitaire) || 0;
              const date = parseDate(sortie.date_sortie);
              const productName = sortie.produit_nom?.trim() || 'Produit inconnu';
              const productCode = sortie.produit_code?.trim() || 'Sans code';
              const destination = sortie.destination?.trim() || 'N/A';
              const reference = sortie.reference?.trim() || '-';
              return (
                <tr key={`${sortie.id}-${index}`} onClick={() => { closeMenu(); onView(sortie); }} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected ? (isDark ? 'bg-indigo-500/[0.085]' : 'bg-indigo-50/80') : isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80'}`}>
                  {/* CHECKBOX */}
                  <td className={`border px-3 py-3 align-middle ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={(event) => onSelectOne?.(sortie.id, event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${productName}`} />
                  </td>
                  {/* DATE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <CalendarDays size={14} />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{formatDate(sortie.date_sortie)}</span>
                        {date && <span className="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">{formatTime(sortie.date_sortie)}</span>}
                      </div>
                    </div>
                  </td>
                  {/* PRODUIT */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        {imageUrl ? (
                          <img src={imageUrl} alt={productName} loading="lazy" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <Package size={19} strokeWidth={1.8} />
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800" />
                      </div>
                      <div className="min-w-0">
                        <div title={productName} className="truncate text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{productName}</div>
                        <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[12px] font-medium text-slate-400 dark:text-slate-500">
                          <Package size={11} className="shrink-0" />
                          <span className="truncate font-mono">{productCode}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* QUANTITE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <span className="inline-flex min-w-[58px] items-center justify-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-[14px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                      <ArrowUp size={12} strokeWidth={2} />
                      -{formatQuantity(quantite)}
                    </span>
                  </td>
                  {/* PRIX UNITAIRE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex flex-col leading-tight">
                      <span className="whitespace-nowrap text-[15px] font-semibold text-slate-900 dark:text-slate-100">{formatMoney(prix)}</span>
                      <span className="mt-0.5 whitespace-nowrap text-[12px] text-slate-400 dark:text-slate-500">Valeur · {formatMoney(quantite * prix)}</span>
                    </div>
                  </td>
                  {/* DESTINATION */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex min-w-0 max-w-[175px] items-center gap-2">
                      <MapPin size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                      <span title={destination} className="truncate text-[14px] text-slate-600 dark:text-slate-300">{destination}</span>
                    </div>
                  </td>
                  {/* REFERENCE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex max-w-[130px] min-w-0 items-center gap-1.5">
                      <Hash size={13} className="shrink-0 text-slate-400 dark:text-slate-500" />
                      <span title={reference} className="truncate font-mono text-[14px] text-slate-500 dark:text-slate-400">{reference}</span>
                    </div>
                  </td>
                  {/* ACTIONS */}
                  <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" title="Voir les détails" aria-label={`Voir les détails de ${productName}`} onClick={() => onView(sortie)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400">
                        <Eye size={17} strokeWidth={1.8} />
                      </button>
                      <button type="button" title="Plus d'actions" aria-label={`Actions pour ${productName}`} aria-expanded={openMenuId === sortie.id} onClick={(event) => toggleMenu(sortie.id, event)} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 ${openMenuId === sortie.id ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
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

      {openMenuId !== null && createPortal(
        <div className={`fixed z-[99999] w-[205px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'border-white/[0.10] bg-[#111c30]/98' : 'border-slate-200 bg-white/98'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
          {(() => {
            const currentSortie = safeSorties.find((item) => item.id === openMenuId);
            if (!currentSortie) return null;
            return (
              <div className="flex flex-col text-[14px]">
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onView(currentSortie), event)} className="flex w-full items-center px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]">
                  <Eye size={16} className="mr-3 shrink-0 text-slate-500 dark:text-slate-400" />
                  <span>Voir les détails</span>
                </button>
                <div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} />
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onBulkDelete?.([currentSortie.id]), event)} className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300">
                  <Trash2 size={16} className="mr-3 shrink-0" />
                  <span>Supprimer</span>
                </button>
              </div>
            );
          })()}
        </div>,
        document.body
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.total}</span> sortie{stats.total > 1 ? 's' : ''}
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.10)]" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatQuantity(stats.totalQuantite)}</span> unité{stats.totalQuantite > 1 ? 's' : ''}
            </span>
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <MapPin size={13} className="text-indigo-500 dark:text-indigo-400" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.totalDestinations}</span> destination{stats.totalDestinations > 1 ? 's' : ''}
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

export default SortiesTable;