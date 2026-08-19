// ============================================================
// src/components/categories/CategoriesTable.tsx
// ============================================================
// ⭐ PREMIUM ERP TABLE
// ⭐ ALL BORDER TABLE
// ⭐ Medium / readable typography
// ⭐ Professional spacing
// ⭐ Dark / Light mode
// ⭐ Sticky header
// ⭐ Row hover + selected state
// ⭐ Bulk selection
// ⭐ Floating action menu
// ⭐ Responsive horizontal scroll
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Folder, Eye, Edit, Trash2, Plus, MoreVertical, Package, CheckSquare, TextSelection, ChevronRight, Layers3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// ============================================================
// TYPES
// ============================================================

interface Categorie {
  id: number;
  nom: string;
  description?: string;
  created_at: string;
  produits_count?: number;
}

interface CategoriesTableProps {
  categories: Categorie[];
  onView: (categorie: Categorie) => void;
  onEdit: (categorie: Categorie) => void;
  onDelete: (categorie: Categorie) => void;
  onAdd: () => void;
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

const CategoriesTable: React.FC<CategoriesTableProps> = ({ categories, onView, onEdit, onDelete, onAdd, selectedIds = new Set<number>(), onSelectAll, onSelectOne, onBulkDelete }) => {
  const { isDark } = useTheme();

  // ==========================================================
  // STATE
  // ==========================================================

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({});

  // ==========================================================
  // COLORS
  // ==========================================================

  const tableBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const tableSecondaryBackground = isDark ? 'bg-[#0f192b]' : 'bg-slate-50/70';
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-200';
  const cellBorderColor = isDark ? 'border-white/[0.09]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.16]' : 'border-slate-300';
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
    const MENU_WIDTH = 220;
    const MENU_HEIGHT = 150;
    const PADDING = 14;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const position: MenuPosition = {};
    if (spaceBelow < MENU_HEIGHT + PADDING && spaceAbove > MENU_HEIGHT) {
      position.bottom = viewportHeight - rect.top + 6;
    } else {
      position.top = rect.bottom + 6;
    }
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + PADDING && rect.left > MENU_WIDTH) {
      position.right = viewportWidth - rect.right + 6;
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

  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const categoriesAvecProduits = categories.filter((categorie) => Number(categorie.produits_count || 0) > 0).length;
    const totalProduits = categories.reduce((total, categorie) => total + Number(categorie.produits_count || 0), 0);
    return { totalCategories, categoriesAvecProduits, totalProduits };
  }, [categories]);

  // ==========================================================
  // SELECTION
  // ==========================================================

  const allSelected = categories.length > 0 && categories.every((categorie) => safeSelectedIds.has(categorie.id));
  const someSelected = safeSelectedIds.size > 0 && !allSelected;

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (categories.length === 0) {
    return (
      <div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
        <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Folder size={30} strokeWidth={1.7} />
        </div>
        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucune catégorie</h3>
        <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Créez votre première catégorie pour organiser facilement vos produits.</p>
        <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]">
          <Plus size={17} />
          Ajouter une catégorie
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
                {safeSelectedIds.size} catégorie{safeSelectedIds.size > 1 ? 's' : ''} sélectionnée{safeSelectedIds.size > 1 ? 's' : ''}
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

        <table className={`w-full min-w-[960px] table-fixed border border-collapse text-left ${borderColor}`}>
          {/* ==================================================
              HEADER
          =================================================== */}

          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark ? 'bg-[#111c30]/97' : 'bg-slate-50/97'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
              <th scope="col" className={`w-[58px] border px-4 py-4 align-middle ${headerBorderColor}`}>
                <input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected; }} onChange={(event) => onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner toutes les catégories" />
              </th>
              <th scope="col" className={`w-[280px] border px-5 py-4 ${headerBorderColor}`}>Catégorie</th>
              <th scope="col" className={`w-[330px] border px-5 py-4 ${headerBorderColor}`}>Description</th>
              <th scope="col" className={`w-[140px] border px-5 py-4 ${headerBorderColor}`}>Produits</th>
              <th scope="col" className={`w-[155px] border px-5 py-4 ${headerBorderColor}`}>Créée le</th>
              <th scope="col" className={`w-[105px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
            </tr>
          </thead>

          {/* ==================================================
              BODY
          =================================================== */}

          <tbody className={tableBackground}>
            {categories.map((categorie) => {
              const nbProduits = Number(categorie.produits_count || 0);
              const isSelected = safeSelectedIds.has(categorie.id);
              const hasProducts = nbProduits > 0;
              return (
                <tr key={categorie.id} onClick={() => { setOpenMenuId(null); onView(categorie); }} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected ? (isDark ? 'bg-indigo-500/[0.085]' : 'bg-indigo-50/80') : isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80'}`}>
                  {/* CHECKBOX */}
                  <td className={`border px-4 py-3 align-middle ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={(event) => onSelectOne?.(categorie.id, event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${categorie.nom}`} />
                  </td>
                  {/* CATEGORY */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm transition-all duration-150 group-hover:border-indigo-200 group-hover:bg-indigo-100 group-hover:shadow-md dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15">
                        <Folder size={19} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <div title={categorie.nom} className="truncate text-[15px] font-semibold leading-5 text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{categorie.nom}</div>
                        <div className="mt-1 text-[12px] font-medium text-slate-400 dark:text-slate-500">ID #{String(categorie.id).padStart(3, '0')}</div>
                      </div>
                    </div>
                  </td>
                  {/* DESCRIPTION */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <span title={categorie.description || 'Aucune description'} className={`block max-w-[300px] truncate text-[14px] leading-5 ${categorie.description ? 'text-slate-600 dark:text-slate-300' : 'italic text-slate-400 dark:text-slate-500'}`}>
                      {categorie.description || 'Aucune description'}
                    </span>
                  </td>
                  {/* PRODUCTS */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex items-center">
                      <span className={`inline-flex min-w-[54px] items-center justify-center gap-2 rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold transition-all ${hasProducts ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400'}`}>
                        <Package size={14} strokeWidth={1.8} />
                        <span>{nbProduits}</span>
                      </span>
                    </div>
                  </td>
                  {/* DATE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{new Date(categorie.created_at).toLocaleDateString('fr-FR')}</span>
                      <span className="mt-1 text-[12px] font-medium text-slate-400 dark:text-slate-500">{new Date(categorie.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  {/* ACTIONS */}
                  <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" title="Voir" aria-label={`Voir ${categorie.nom}`} onClick={() => onView(categorie)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400">
                        <Eye size={17} strokeWidth={1.8} />
                      </button>
                      <button type="button" title="Plus d'actions" aria-label={`Actions pour ${categorie.nom}`} aria-expanded={openMenuId === categorie.id} onClick={(event) => toggleMenu(categorie.id, event)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all duration-150 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
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

      {/* ==========================================================
          FLOATING ACTION MENU
      =========================================================== */}

      {openMenuId !== null && createPortal(
        <div className={`fixed z-[99999] w-[220px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'border-white/[0.10] bg-[#111c30]/98' : 'border-slate-200 bg-white/98'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
          {(() => {
            const currentCategorie = categories.find((categorie) => categorie.id === openMenuId);
            if (!currentCategorie) return null;
            return (
              <div className="flex flex-col text-[14px]">
                <div className={`border-b px-4 py-3 ${isDark ? 'border-white/[0.08]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Layers3 size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="max-w-[165px] truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">{currentCategorie.nom}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500">ID #{currentCategorie.id}</div>
                    </div>
                  </div>
                </div>
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onEdit(currentCategorie), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Edit size={15} /></span>
                  <span>Modifier</span>
                  <ChevronRight size={15} className="ml-auto text-slate-300 dark:text-slate-600" />
                </button>
                <div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} />
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onDelete(currentCategorie), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 size={15} /></span>
                  <span>Supprimer</span>
                </button>
              </div>
            );
          })()}
        </div>,
        document.body
      )}

      {/* ==========================================================
          FOOTER
      =========================================================== */}

      <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.totalCategories}</span> catégorie{stats.totalCategories > 1 ? 's' : ''}
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.categoriesAvecProduits}</span> avec produit{stats.categoriesAvecProduits > 1 ? 's' : ''}
            </span>
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <Package size={14} className="text-indigo-500 dark:text-indigo-400" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.totalProduits}</span> produit{stats.totalProduits > 1 ? 's' : ''}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500">
          <Folder size={14} />
          <span>Organisation des produits</span>
        </div>
      </div>

      {/* ==========================================================
          CUSTOM SCROLLBAR + ANIMATION
      =========================================================== */}

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 7px; height: 7px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.26); border-radius: 999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.46); }
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100, 116, 139, 0.28) transparent; }
          .scrollbar-gutter-stable { scrollbar-gutter: stable; }
          @keyframes categoryRowIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
          .group { animation: categoryRowIn 0.18s ease-out; }
        `}
      </style>
    </div>
  );
};

// ============================================================
// EXPORT
// ============================================================

export default CategoriesTable;