// ============================================================
// src/components/employes/EmployesTable.tsx
// ⭐ PREMIUM EMPLOYES TABLE
// ⭐ ALL BORDER SYSTEM (identique à CategoriesTable)
// ⭐ MEDIUM / READABLE FONT SIZE
// ⭐ DARK + LIGHT MODE
// ⭐ PREMIUM HOVER / SELECT STATES
// ⭐ BULK ACTIONS
// ⭐ PORTAL ACTION MENU
// ⭐ RESPONSIVE HORIZONTAL SCROLL
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Users, Mail, Phone, Eye, Edit, Trash2, Wallet, History, ImageOff, User, Plus, MoreVertical, CheckCircle, CheckSquare, TextSelection } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  date_embauche: string;
  salaire: number;
  image: string;
  status: string;
  created_at: string;
}
interface EmployesTableProps {
  employes: Employe[];
  imageUrls: Record<number, string | null>;
  imageErrors: Record<number, boolean>;
  paiementCounts: Record<number, number>;
  onView: (id: number) => void;
  onEdit: (employe: Employe) => void;
  onDelete: (id: number, image?: string) => void;
  onPaiement: (employe: Employe) => void;
  onHistorique: (employe: Employe) => void;
  onAdd: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  handleImageError: (id: number) => void;
  selectedIds?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: number, checked: boolean) => void;
  onBulkUpdateStatus?: (ids: number[], newStatus: string) => void;
  onBulkDelete?: (ids: number[]) => void;
}
interface MenuPosition { top?: number; bottom?: number; left?: number; right?: number; }

const EmployesTable: React.FC<EmployesTableProps> = ({ 
  employes, 
  imageUrls, 
  imageErrors, 
  paiementCounts, 
  onView, 
  onEdit, 
  onDelete, 
  onPaiement, 
  onHistorique, 
  onAdd, 
  getStatusColor, 
  getStatusIcon, 
  handleImageError, 
  selectedIds = new Set<number>(), 
  onSelectAll, 
  onSelectOne, 
  onBulkUpdateStatus, 
  onBulkDelete 
}) => {
  const { isDark } = useTheme();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({});

  const tableBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const tableSecondaryBackground = isDark ? 'bg-[#0f192b]' : 'bg-slate-50/70';
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-200';
  const cellBorderColor = isDark ? 'border-white/[0.09]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.16]' : 'border-slate-300';

  const safeEmployes = employes || [];
  const safeImageUrls = imageUrls || {};
  const safeImageErrors = imageErrors || {};
  const safePaiementCounts = paiementCounts || {};
  const safeSelectedIds = selectedIds || new Set<number>();

  const getStatusDisplay = (status: string): string => {
    const map: Record<string, string> = { actif: 'Actif', inactif: 'Inactif', en_conge: 'En congé' };
    return map[status] || status || 'Inconnu';
  };

  const stats = useMemo(() => {
    const total = safeEmployes.length;
    const actifs = safeEmployes.filter((e) => e.status === 'actif').length;
    const enConge = safeEmployes.filter((e) => e.status === 'en_conge').length;
    const inactifs = safeEmployes.filter((e) => e.status === 'inactif').length;
    return { total, actifs, enConge, inactifs };
  }, [safeEmployes]);

  const allSelected = safeEmployes.length > 0 && safeEmployes.every((e) => safeSelectedIds.has(e.id));
  const someSelected = safeSelectedIds.size > 0 && !allSelected;

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
    const MENU_WIDTH = 205, MENU_HEIGHT = 205, PADDING = 12;
    const viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
    const position: MenuPosition = {};
    const spaceBelow = viewportHeight - rect.bottom, spaceAbove = rect.top;
    if (spaceBelow < MENU_HEIGHT + PADDING && spaceAbove > MENU_HEIGHT) position.bottom = viewportHeight - rect.top + 4;
    else position.top = rect.bottom + 4;
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + PADDING && rect.left > MENU_WIDTH) position.right = viewportWidth - rect.right + 4;
    else position.left = Math.max(PADDING, rect.right - MENU_WIDTH);
    setMenuPosition(position); setOpenMenuId(id);
  };

  const handleMenuAction = (callback: () => void, event: React.MouseEvent) => {
    event.stopPropagation(); setOpenMenuId(null); callback();
  };

  if (safeEmployes.length === 0) {
    return (<div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
      <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400"><Users size={30} strokeWidth={1.7} /></div>
      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucun employé</h3>
      <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Commencez par ajouter votre premier employé.</p>
      <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]"><Plus size={17} />Ajouter un employé</button>
    </div>);
  }

  return (<div className={`relative overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.20)] ${tableBackground} ${borderColor}`}>
    {safeSelectedIds.size > 0 && (<div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark ? 'border-white/[0.08] bg-indigo-500/[0.065]' : 'border-indigo-100 bg-indigo-50/75'}`}>
      <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm"><CheckSquare size={15} /></div><div className="flex flex-col"><span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">{safeSelectedIds.size} employé{safeSelectedIds.size > 1 ? 's' : ''} sélectionné{safeSelectedIds.size > 1 ? 's' : ''}</span><span className="mt-0.5 text-[12px] text-indigo-500/75 dark:text-indigo-400/70">Action groupée disponible</span></div></div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onBulkUpdateStatus?.(Array.from(safeSelectedIds), 'actif')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"><CheckCircle size={15} />Activer</button>
        <button type="button" onClick={() => onBulkUpdateStatus?.(Array.from(safeSelectedIds), 'inactif')} className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-slate-600 dark:hover:bg-slate-500"><User size={15} />Désactiver</button>
        <button type="button" onClick={() => onBulkUpdateStatus?.(Array.from(safeSelectedIds), 'en_conge')} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow-md active:scale-[0.98]"><History size={15} />En congé</button>
        <button type="button" onClick={() => onBulkDelete?.(Array.from(safeSelectedIds))} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md active:scale-[0.98]"><Trash2 size={15} />Supprimer</button>
        <button type="button" onClick={() => onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"><TextSelection size={15} />Désélectionner</button>
      </div>
    </div>)}

    <div className="custom-scrollbar overflow-x-auto overflow-y-auto scrollbar-gutter-stable">
      <table className={`w-full min-w-[1080px] table-fixed border border-collapse text-left ${borderColor}`}>
        <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark ? 'bg-[#111c30]/97' : 'bg-slate-50/97'}`}>
          <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
            <th scope="col" className={`w-[48px] border px-3 py-4 align-middle ${headerBorderColor}`}><input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected; }} onChange={(event) => onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner tous les employés" /></th>
            <th scope="col" className={`w-[70px] border px-3 py-4 ${headerBorderColor}`}>Photo</th>
            <th scope="col" className={`w-[210px] border px-5 py-4 ${headerBorderColor}`}>Employé</th>
            <th scope="col" className={`w-[160px] border px-5 py-4 ${headerBorderColor}`}>Poste</th>
            <th scope="col" className={`w-[200px] border px-5 py-4 ${headerBorderColor}`}>Contact</th>
            <th scope="col" className={`w-[130px] border px-5 py-4 ${headerBorderColor}`}>Salaire</th>
            <th scope="col" className={`w-[120px] border px-5 py-4 ${headerBorderColor}`}>Statut</th>
            <th scope="col" className={`w-[100px] border px-5 py-4 ${headerBorderColor}`}>Paiements</th>
            <th scope="col" className={`w-[88px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
          </tr>
        </thead>
        <tbody className={tableBackground}>
          {safeEmployes.map((employe) => {
            const imageUrl = safeImageUrls[employe.id];
            const hasError = safeImageErrors[employe.id];
            const nbPaiements = safePaiementCounts[employe.id] || 0;
            const statusDisplay = getStatusDisplay(employe.status);
            const initiales = `${employe.prenom?.charAt(0)?.toUpperCase() || ''}${employe.nom?.charAt(0)?.toUpperCase() || ''}`.replace(/\s/g, '') || '?';
            const isSelected = safeSelectedIds.has(employe.id);
            return (
              <tr key={employe.id} onClick={() => { onView(employe.id); setOpenMenuId(null); }} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected ? (isDark ? 'bg-indigo-500/[0.085]' : 'bg-indigo-50/80') : isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80'}`}>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={isSelected} onChange={(event) => onSelectOne?.(employe.id, event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${employe.prenom} ${employe.nom}`} /></td>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                    {imageUrl && !hasError ? (
                      <img src={imageUrl} alt={`${employe.prenom} ${employe.nom}`} loading="lazy" className="h-full w-full object-cover" onError={() => handleImageError(employe.id)} />
                    ) : hasError ? (
                      <ImageOff className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <span className="text-[13px] font-medium text-indigo-600 dark:text-indigo-400">{initiales}</span>
                    )}
                  </div>
                </td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                  <div className="min-w-0"><div className="truncate text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{employe.prenom} {employe.nom}</div><div className="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">ID #{String(employe.id).padStart(3, '0')}</div></div>
                </td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                  <div className="min-w-0"><div className="truncate text-[14px] font-medium text-slate-700 dark:text-slate-300">{employe.poste || 'N/A'}</div>{employe.departement && <div className="mt-0.5 truncate text-[12px] text-slate-400 dark:text-slate-500">{employe.departement}</div>}</div>
                </td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                  <div className="flex flex-col gap-0.5">
                    {employe.email && <div className="flex items-center gap-2 text-[14px] text-slate-600 dark:text-slate-300"><Mail size={14} className="shrink-0 text-slate-400 dark:text-slate-500" /><span className="max-w-[150px] truncate" title={employe.email}>{employe.email}</span></div>}
                    {employe.telephone && <div className="flex items-center gap-2 text-[14px] text-slate-600 dark:text-slate-300"><Phone size={14} className="shrink-0 text-slate-400 dark:text-slate-500" /><span className="max-w-[150px] truncate">{employe.telephone}</span></div>}
                    {!employe.email && !employe.telephone && <span className="text-[14px] italic text-slate-400 dark:text-slate-500">—</span>}
                  </div>
                </td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                  <div className="flex flex-col"><span className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{formatMoney(employe.salaire || 0)}</span></div>
                </td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[14px] font-medium ${getStatusColor(employe.status)}`}>{getStatusIcon(employe.status)}{statusDisplay}</span>
                </td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                  {nbPaiements > 0 ? (<span className="inline-flex min-w-[2rem] items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[14px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{nbPaiements}</span>) : (<span className="inline-flex min-w-[2rem] items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[14px] font-medium text-slate-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400">0</span>)}
                </td>
                <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => onView(employe.id)} title="Voir" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><Eye size={17} strokeWidth={1.8} /></button>
                    <button type="button" onClick={(event) => toggleMenu(employe.id, event)} title="Actions" className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 ${openMenuId === employe.id ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><MoreVertical size={18} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {openMenuId !== null && createPortal(<div className={`fixed z-[99999] w-[205px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'border-white/[0.10] bg-[#111c30]/98' : 'border-slate-200 bg-white/98'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
      {(() => {
        const employee = safeEmployes.find((item) => item.id === openMenuId);
        if (!employee) return null;
        return (<div className="flex flex-col text-[14px]">
          <button type="button" onMouseDown={(event) => handleMenuAction(() => onEdit(employee), event)} className="flex w-full items-center px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"><Edit size={16} className="mr-3 shrink-0 text-slate-500 dark:text-slate-400" /><span>Modifier</span></button>
          <button type="button" onMouseDown={(event) => handleMenuAction(() => onPaiement(employee), event)} className="flex w-full items-center px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"><Wallet size={16} className="mr-3 shrink-0 text-slate-500 dark:text-slate-400" /><span>Payer salaire</span></button>
          <button type="button" onMouseDown={(event) => handleMenuAction(() => onHistorique(employee), event)} className="flex w-full items-center px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"><History size={16} className="mr-3 shrink-0 text-slate-500 dark:text-slate-400" /><span>Historique</span></button>
          <div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} />
          <button type="button" onMouseDown={(event) => handleMenuAction(() => onDelete(employee.id, employee.image), event)} className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"><Trash2 size={16} className="mr-3 shrink-0" /><span>Supprimer</span></button>
        </div>);
      })()}
    </div>, document.body)}

    <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
        <span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.total}</span> employé{stats.total > 1 ? 's' : ''}</span>
        <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
        {stats.actifs > 0 && <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.actifs}</span> Actif{stats.actifs > 1 ? 's' : ''}</span></span>}
        {stats.enConge > 0 && <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.10)]" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.enConge}</span> En congé</span></span>}
        {stats.inactifs > 0 && <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.10)]" /><span><span className="font-semibold text-slate-900 dark:text-slate-100">{stats.inactifs}</span> Inactif{stats.inactifs > 1 ? 's' : ''}</span></span>}
      </div>
      <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span>Données synchronisées</span></div>
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

export default EmployesTable;