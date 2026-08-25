// src/components/achats/AchatsGrid.tsx
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Package, Eye, Edit, Trash2, MoreVertical, Building2, CalendarDays, Plus, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

export interface Achat { id: number; reference: string | null; fournisseur_id: number | null; fournisseur_nom?: string | null; date_achat: string | null; total_ht: number; total_ttc: number; designation?: string | null; nombre_produits?: number | null; statut?: string | null; observation?: string | null; created_at: string; updated_at?: string | null; }
interface AchatsGridProps { achats: Achat[]; onView: (achat: Achat) => void; onEdit: (achat: Achat) => void; onDelete: (achat: Achat) => void; onAdd: () => void; isDark?: boolean; }
interface MenuPosition { top?: number; bottom?: number; left?: number; right?: number; }
const MENU_WIDTH = 220; const MENU_HEIGHT = 150; const MENU_PADDING = 12;

const formatAchatDate = (date?: string | null) => { if (!date) return null; const parsed = new Date(date); if (Number.isNaN(parsed.getTime())) return null; return { date: parsed.toLocaleDateString('fr-FR'), time: parsed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }; };

const AchatsGrid: React.FC<AchatsGridProps> = ({ achats, onView, onEdit, onDelete, onAdd, isDark: isDarkProp }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({});
  const safeAchats = useMemo(() => (Array.isArray(achats) ? achats.filter(Boolean) : []), [achats]);
  const currentAchat = useMemo(() => openMenuId === null ? null : safeAchats.find((achat) => achat.id === openMenuId) ?? null, [safeAchats, openMenuId]);

  useEffect(() => {
    if (openMenuId === null) return;
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenMenuId(null); };
    const handleResize = () => setOpenMenuId(null);
    const handleScroll = () => setOpenMenuId(null);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    return () => { document.removeEventListener('keydown', handleEscape); window.removeEventListener('resize', handleResize); window.removeEventListener('scroll', handleScroll, true); };
  }, [openMenuId]);

  const toggleMenu = useCallback((id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;
    const position: MenuPosition = {};
    const spaceBelow = viewportHeight - rect.bottom, spaceAbove = rect.top;
    if (spaceBelow < MENU_HEIGHT + MENU_PADDING && spaceAbove > MENU_HEIGHT + MENU_PADDING) { position.bottom = viewportHeight - rect.top + 4; } else { position.top = rect.bottom + 4; }
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + MENU_PADDING && rect.left > MENU_WIDTH + MENU_PADDING) { position.right = viewportWidth - rect.right + 4; } else { position.left = Math.max(MENU_PADDING, rect.right - MENU_WIDTH); }
    setMenuPosition(position); setOpenMenuId(id);
  }, [openMenuId]);

  const handleMenuAction = useCallback((callback: () => void, event: React.MouseEvent) => { event.stopPropagation(); setOpenMenuId(null); callback(); }, []);

  if (safeAchats.length === 0) {
    return (
      <div className={`flex min-h-[390px] flex-col items-center justify-center rounded-2xl border px-6 py-14 text-center shadow-sm ${isDark ? 'border-white/[0.14] bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.20)]' : 'border-slate-300 bg-white'}`}>
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 shadow-sm dark:border-indigo-500/10 dark:bg-indigo-500/10"><FileText size={34} strokeWidth={1.7} className="text-indigo-500 dark:text-indigo-400" /></div>
        <h3 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-slate-100">Aucun achat</h3>
        <p className="mt-1.5 max-w-sm text-[14.5px] leading-6 text-slate-500 dark:text-slate-400">Aucun achat ne correspond aux critères actuels.</p>
        <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"><Plus size={17} />Ajouter un achat</button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {safeAchats.map((achat) => {
        const formattedDate = formatAchatDate(achat.date_achat);
        const totalTTC = Number(achat.total_ttc) || 0;
        const nombreProduits = Number(achat.nombre_produits) || 0;
        const reference = achat.reference || 'Achat inconnu';
        const fournisseur = achat.fournisseur_nom || 'Aucun fournisseur';
        const designation = achat.designation || 'Sans désignation';

        return (
          <div key={achat.id} onClick={() => { setOpenMenuId(null); onView(achat); }} className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${isDark ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
            {/* HEADER */}
            <div className="relative h-36 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 dark:from-indigo-500/5 dark:to-indigo-600/10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10"><Building2 size={32} className="text-indigo-500 dark:text-indigo-400" /></div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute right-2 top-2 z-10"><span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 font-mono text-[11px] font-semibold text-white shadow-sm backdrop-blur-md"><Package size={11} />{achat.reference || '—'}</span></div>
            </div>

            {/* BODY */}
            <div className="flex flex-1 flex-col p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="line-clamp-1 min-w-0 text-[14px] font-semibold text-slate-900 dark:text-slate-100" title={reference}>{reference}</h4>
                <div className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500"><CalendarDays size={12} /><span>{formattedDate ? formattedDate.date : '—'}</span></div>
              </div>
              <div className="flex min-w-0 items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400"><Building2 size={13} className="shrink-0" /><span className="truncate" title={fournisseur}>{fournisseur}</span></div>
              <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[13px] text-slate-700 dark:text-slate-300"><Package size={13} className="shrink-0 text-slate-400 dark:text-slate-500" /><span className="truncate" title={designation}>{designation}</span></div>
              <div className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[12px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"><Package size={11} />{nombreProduits}</span>
                <span>produit{nombreProduits > 1 ? 's' : ''}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-2.5 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Total TTC</span>
                <span className="text-[15px] font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(totalTTC)}</span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-200 pt-2.5 dark:border-slate-700" onClick={(event) => event.stopPropagation()}>
                <button type="button" title="Voir les détails" aria-label={`Voir les détails de ${reference}`} onClick={() => onView(achat)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50"><Eye size={14} /></button>
                <button type="button" title="Modifier" aria-label={`Modifier ${reference}`} onClick={() => onEdit(achat)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"><Edit size={14} /></button>
                <button type="button" title="Actions" aria-label={`Actions pour ${reference}`} aria-expanded={openMenuId === achat.id} onClick={(event) => toggleMenu(achat.id, event)} className={`flex h-8 flex-1 items-center justify-center rounded-md transition-colors ${openMenuId === achat.id ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><MoreVertical size={14} /></button>
              </div>
            </div>
          </div>
        );
      })}

      {/* FLOATING CONTEXT MENU */}
      {openMenuId !== null && currentAchat && createPortal(
        <div className={`fixed z-[99999] w-[220px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'border-white/[0.10] bg-[#111c30]/98' : 'border-slate-200 bg-white/98'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
          <div className={`border-b px-4 py-3 ${isDark ? 'border-white/[0.08]' : 'border-slate-100'}`}><div className="flex items-center gap-2"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Package size={14} /></div><div className="min-w-0"><div className="max-w-[165px] truncate text-[14px] font-semibold text-slate-900 dark:text-slate-100" title={currentAchat.reference || '—'}>{currentAchat.reference || '—'}</div><div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500">ID #{currentAchat.id}</div></div></div></div>
          <div className="flex flex-col p-1 text-[14px]">
            <button type="button" onMouseDown={(event) => handleMenuAction(() => onView(currentAchat), event)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Eye size={15} /></span><span>Voir les détails</span></button>
            <button type="button" onMouseDown={(event) => handleMenuAction(() => onEdit(currentAchat), event)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-200 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><Edit size={15} /></span><span>Modifier</span></button>
            <div className={`mx-2 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} />
            <button type="button" onMouseDown={(event) => handleMenuAction(() => onDelete(currentAchat), event)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 size={15} /></span><span>Supprimer</span></button>
          </div>
        </div>, document.body)}
    </div>
  );
};

export default memo(AchatsGrid);