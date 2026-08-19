// ============================================================
// src/components/depenses/DepensesTable.tsx
// ============================================================
// ⭐ PREMIUM DEPENSES TABLE
// ⭐ ALL BORDER SYSTEM (identique à CategoriesTable)
// ⭐ MEDIUM / READABLE FONT SIZE
// ⭐ DARK + LIGHT MODE
// ⭐ PREMIUM HOVER / SELECT STATES
// ⭐ BULK ACTIONS
// ⭐ PORTAL ACTION MENU
// ⭐ RESPONSIVE HORIZONTAL SCROLL
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, Building, Eye, Edit, Trash2, Plus, TrendingDown, Tag, Hash, MoreVertical, Receipt, CalendarDays, CheckSquare, TextSelection } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

// ============================================================
// TYPES
// ============================================================

interface Depense {
  id: number;
  categorie: string;
  description: string;
  montant: number;
  date_depense: string;
  mode_paiement: string;
  reference: string;
  fournisseur_id: number;
  fournisseur_nom?: string;
  observation: string;
  created_at: string;
}

interface DepensesTableProps {
  depenses?: Depense[];
  onView: (depense: Depense) => void;
  onEdit: (depense: Depense) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  categoryIcons: Record<string, any>;
  categoryColors: (cat: string) => { light: string; dark: string; text: string };
  isDark?: boolean;
  selectedIds?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: number, checked: boolean) => void;
  onBulkDelete?: (ids: number[]) => void;
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

const DepensesTable: React.FC<DepensesTableProps> = ({ depenses = [], onView, onEdit, onDelete, onAdd, categoryIcons, categoryColors, isDark: isDarkProp, selectedIds = new Set<number>(), onSelectAll, onSelectOne, onBulkDelete }) => {
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

  const safeDepenses = depenses || [];
  const safeSelectedIds = selectedIds || new Set<number>();

  // ==========================================================
  // CLOSE MENU
  // ==========================================================

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => setOpenMenuId(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  // ==========================================================
  // TOGGLE ACTION MENU
  // ==========================================================

  const toggleMenu = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 205;
    const MENU_HEIGHT = 110;
    const PADDING = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const position: MenuPosition = {};
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < MENU_HEIGHT + PADDING && spaceAbove > MENU_HEIGHT) {
      position.bottom = viewportHeight - rect.top + 4;
    } else {
      position.top = rect.bottom + 4;
    }
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + PADDING && rect.left > MENU_WIDTH) {
      position.right = viewportWidth - rect.right + 4;
    } else {
      position.left = Math.max(PADDING, rect.right - MENU_WIDTH);
    }
    setMenuPosition(position);
    setOpenMenuId(id);
  };

  // ==========================================================
  // MENU ACTION
  // ==========================================================

  const handleMenuAction = (callback: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(null);
    callback();
  };

  // ==========================================================
  // STATS
  // ==========================================================

  const totalMontant = useMemo(() => safeDepenses.reduce((total, depense) => total + Number(depense.montant || 0), 0), [safeDepenses]);

  const categorieStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    safeDepenses.forEach((depense) => {
      const category = depense.categorie || 'Autre';
      if (!stats[category]) stats[category] = { count: 0, total: 0 };
      stats[category].count += 1;
      stats[category].total += Number(depense.montant || 0);
    });
    return Object.entries(stats).sort(([, a], [, b]) => b.total - a.total).slice(0, 3);
  }, [safeDepenses]);

  // ==========================================================
  // SELECTION
  // ==========================================================

  const allSelected = safeDepenses.length > 0 && safeDepenses.every((depense) => safeSelectedIds.has(depense.id));
  const someSelected = safeSelectedIds.size > 0 && !allSelected;

  // ==========================================================
  // DATE FORMATTER
  // ==========================================================

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (safeDepenses.length === 0) {
    return (
      <div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
        <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Receipt size={30} strokeWidth={1.7} />
        </div>
        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucune dépense</h3>
        <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Commencez par enregistrer votre première dépense pour suivre vos finances.</p>
        <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]">
          <Plus size={17} />
          Ajouter une dépense
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
                {safeSelectedIds.size} dépense{safeSelectedIds.size > 1 ? 's' : ''} sélectionnée{safeSelectedIds.size > 1 ? 's' : ''}
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

        <table className={`w-full min-w-[1000px] table-fixed border border-collapse text-left ${borderColor}`}>
          {/* ==================================================
              HEADER
          =================================================== */}

          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark ? 'bg-[#111c30]/97' : 'bg-slate-50/97'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
              <th scope="col" className={`w-[48px] border px-3 py-4 align-middle ${headerBorderColor}`}>
                <input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected; }} onChange={(event) => onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner toutes les dépenses" />
              </th>
              <th scope="col" className={`w-[190px] border px-5 py-4 ${headerBorderColor}`}>Catégorie</th>
              <th scope="col" className={`w-[230px] border px-5 py-4 ${headerBorderColor}`}>Description</th>
              <th scope="col" className={`w-[130px] border px-5 py-4 ${headerBorderColor}`}>Date</th>
              <th scope="col" className={`w-[140px] border px-5 py-4 ${headerBorderColor}`}>Montant</th>
              <th scope="col" className={`w-[130px] border px-5 py-4 ${headerBorderColor}`}>Paiement</th>
              <th scope="col" className={`w-[170px] border px-5 py-4 ${headerBorderColor}`}>Fournisseur</th>
              <th scope="col" className={`w-[88px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
            </tr>
          </thead>

          {/* ==================================================
              BODY
          =================================================== */}

          <tbody className={tableBackground}>
            {safeDepenses.map((depense) => {
              const Icon = categoryIcons[depense.categorie] || Tag;
              const colors = categoryColors(depense.categorie);
              const isSelected = safeSelectedIds.has(depense.id);
              return (
                <tr key={depense.id} onClick={() => { setOpenMenuId(null); onView(depense); }} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected ? (isDark ? 'bg-indigo-500/[0.085]' : 'bg-indigo-50/80') : isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80'}`}>
                  {/* CHECKBOX */}
                  <td className={`border px-3 py-3 align-middle ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={(event) => onSelectOne?.(depense.id, event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${depense.description || depense.categorie}`} />
                  </td>
                  {/* CATEGORIE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:border-white/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15">
                        <Icon size={16} strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{depense.categorie || 'Autre'}</div>
                        <div className="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">Dépense</div>
                      </div>
                    </div>
                  </td>
                  {/* DESCRIPTION */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-medium text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">{depense.description || 'Sans description'}</div>
                      {depense.reference && (
                        <div className="mt-1 flex items-center gap-1 text-[13px] text-slate-400 dark:text-slate-500">
                          <Hash size={11} />
                          <span className="truncate">{depense.reference}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  {/* DATE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                      <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{formatDate(depense.date_depense)}</span>
                    </div>
                  </td>
                  {/* MONTANT */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
                        <TrendingDown size={14} />
                      </span>
                      <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{formatMoney(depense.montant || 0)}</span>
                    </div>
                  </td>
                  {/* PAIEMENT */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[14px] font-medium text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300">
                      <Wallet size={13} className="text-slate-400 dark:text-slate-500" />
                      <span className="max-w-[90px] truncate">{depense.mode_paiement || 'N/A'}</span>
                    </div>
                  </td>
                  {/* FOURNISSEUR */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex items-center gap-2">
                      <Building size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                      <span className="max-w-[125px] truncate text-[14px] text-slate-600 dark:text-slate-300">{depense.fournisseur_nom || 'Aucun fournisseur'}</span>
                    </div>
                  </td>
                  {/* ACTIONS */}
                  <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => onView(depense)} title="Voir la dépense" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400">
                        <Eye size={17} strokeWidth={1.8} />
                      </button>
                      <button type="button" onClick={(event) => toggleMenu(depense.id, event)} title="Actions" aria-label={`Actions pour ${depense.description || depense.categorie}`} aria-expanded={openMenuId === depense.id} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 ${openMenuId === depense.id ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
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
            const depense = safeDepenses.find((item) => item.id === openMenuId);
            if (!depense) return null;
            return (
              <div className="flex flex-col text-[14px]">
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onEdit(depense), event)} className="flex w-full items-center px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]">
                  <Edit size={16} className="mr-3 shrink-0 text-slate-500 dark:text-slate-400" />
                  <span>Modifier</span>
                </button>
                <div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} />
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onDelete(depense.id), event)} className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300">
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
            <span className="font-semibold text-slate-900 dark:text-slate-100">{safeDepenses.length}</span> dépense{safeDepenses.length > 1 ? 's' : ''}
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">{formatMoney(totalMontant)}</span>
            <span>Total</span>
          </span>
          {categorieStats.length > 0 && (
            <>
              <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
              <div className="flex flex-wrap items-center gap-1.5">
                {categorieStats.map(([category, stats]) => (
                  <span key={category} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[13px] font-medium text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {category}
                    <span className="text-slate-400 dark:text-slate-500">{stats.count}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500">
          <Receipt size={14} />
          <span>Suivi des dépenses</span>
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

export default DepensesTable;