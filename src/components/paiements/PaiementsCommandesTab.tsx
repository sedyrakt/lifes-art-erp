// src/components/paiements/PaiementsCommandesTab.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Search, CheckSquare, Square, Trash2, ShoppingCart, RotateCcw, TextSelection } from 'lucide-react';
import { safeNumber, normalizeText, ITEMS_PER_PAGE, formatDate, getStatusClass, DeleteType } from './PaiementsUtils';
import { formatMoney } from '../../lib/formatMoney';
import PaiementsPagination from './PaiementsPagination';
import EllipsisDropdown from './PaiementsDropdown';

interface Props { isDark: boolean; commandes: any[]; onView: (data: any) => void; onEdit: (data: any) => void; onDelete: (id: number, type: string) => void; onBulkDelete: (type: DeleteType) => void; }

// ⭐ FANITSIANA: Mampiasa ilay parseProducts ho an'ny produits_noms
const parseProducts = (produits?: string): { nom: string; quantite: number }[] => {
  if (!produits?.trim()) return [];
  return produits.split(',').map((item) => item.trim()).filter(Boolean).map((item) => {
    const match = item.match(/^(.*?)\s*\(x(\d+)\)\s*$/);
    if (!match) return { nom: item, quantite: 1 };
    return { nom: match[1].trim(), quantite: Number(match[2]) || 1 };
  });
};

const PaiementsCommandesTab: React.FC<Props> = ({ isDark, commandes = [], onView, onEdit, onDelete, onBulkDelete }) => {
  const [searchCommande, setSearchCommande] = useState('');
  const [commandePage, setCommandePage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openedDropdownRow, setOpenedDropdownRow] = useState<number | null>(null);
  
  // ⭐ BORDER SYSTEM (Mitovy tanteraka amin'ny tabilao hafa)
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-300';
  const cellBorderColor = isDark ? 'border-white/[0.10]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.18]' : 'border-slate-300';

  const normalizedCommandes = useMemo(() => { if (!Array.isArray(commandes)) return []; return commandes.filter((commande) => commande && (commande.id !== undefined || commande.numero !== undefined)); }, [commandes]);
  const filteredCommandes = useMemo(() => {
    const term = normalizeText(searchCommande);
    if (!term) return normalizedCommandes;
    return normalizedCommandes.filter((commande) => {
      const clientName = normalizeText(commande.client_nom ?? commande.client ?? '');
      const status = normalizeText(commande.statut ?? '');
      const numero = normalizeText(commande.numero ?? '');
      const id = String(commande.id ?? '');
      // ⭐ Ampiasao ny parseProducts mba hahazoana ny designation ho an'ny search
      const products = parseProducts(commande.produits_noms);
      const designation = products.map(p => p.nom).join(' ');
      return clientName.includes(term) || status.includes(term) || numero.includes(term) || id.includes(term) || normalizeText(designation).includes(term);
    });
  }, [normalizedCommandes, searchCommande]);
  useEffect(() => { setCommandePage(1); }, [searchCommande]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredCommandes.length / ITEMS_PER_PAGE)), [filteredCommandes.length]);
  useEffect(() => { if (commandePage > totalPages) setCommandePage(totalPages); }, [commandePage, totalPages]);
  const displayedCommandes = useMemo(() => { const start = (commandePage - 1) * ITEMS_PER_PAGE; return filteredCommandes.slice(start, start + ITEMS_PER_PAGE); }, [filteredCommandes, commandePage]);

  const handleSelectOne = (id: number, checked: boolean) => { if (!id) return; setSelectedIds((prev) => { const next = new Set(prev); checked ? next.add(id) : next.delete(id); return next; }); };
  const filteredIds = useMemo(() => filteredCommandes.map(item => Number(item?.id)).filter(id => Number.isFinite(id) && id > 0), [filteredCommandes]);
  const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.has(id));
  const someSelected = filteredIds.some(id => selectedIds.has(id));
  const handleSelectAll = (checked: boolean) => { if (!checked) { setSelectedIds(new Set()); return; } setSelectedIds(new Set(filteredIds)); };
  const clearSelection = () => setSelectedIds(new Set());
  const handleBulkDelete = () => { if (selectedIds.size === 0) return; onBulkDelete('commande'); setSelectedIds(new Set()); };
  const handleResetSearch = () => { setSearchCommande(''); setCommandePage(1); setSelectedIds(new Set()); };

  return (<div className="space-y-4">
    <div className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10"><ShoppingCart size={19} className="text-violet-500" strokeWidth={2} /></div><div className="min-w-0"><h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Liste des commandes</h2><p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{filteredCommandes.length} commande{filteredCommandes.length > 1 ? 's' : ''}</p></div></div>
        <div className="flex items-center gap-2"><div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input type="text" value={searchCommande} onChange={(e) => setSearchCommande(e.target.value)} placeholder="Rechercher..." className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-64" /></div>{searchCommande && <button type="button" onClick={handleResetSearch} title="Réinitialiser" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"><RotateCcw size={15} /></button>}</div>
      </div>
    </div>

    {selectedIds.size > 0 && (<div className={`flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 bg-indigo-50/80 px-4 py-3 dark:border-indigo-500/10 dark:bg-indigo-500/[0.07]`}><div className="flex items-center gap-2.5"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><CheckSquare size={15} /></div><div><span className="text-[13px] font-semibold text-indigo-700 dark:text-indigo-300">{selectedIds.size} commande{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}</span></div></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={handleBulkDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98]"><Trash2 size={14} />Supprimer</button><button type="button" onClick={clearSelection} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"><TextSelection size={14} />Désélectionner</button></div></div>)}

    <div className={`overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}>
      <div className="custom-scrollbar overflow-x-auto">
        {/* ⭐ BORDER SEPARATE + SPACING 0 -> Mitovy amin'ny tabilao hafa */}
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
          <thead className={`${headerBorderColor} bg-slate-100 dark:bg-[#111c30]`}>
            <tr className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              <th className={`w-12 border px-3 py-3 ${headerBorderColor}`}><button type="button" onClick={() => handleSelectAll(!allSelected)} className="flex items-center justify-center text-slate-400 transition-colors hover:text-indigo-500" aria-label={allSelected ? 'Désélectionner tout' : 'Sélectionner tout'}>{allSelected ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} className={someSelected ? 'text-indigo-400' : ''} />}</button></th>
              <th className={`w-[135px] border px-3 py-3 ${headerBorderColor}`}>N° COMMANDE</th>
              <th className={`w-[220px] border px-3 py-3 ${headerBorderColor}`}>DÉSIGNATION</th>
              <th className={`w-[80px] border px-3 py-3 ${headerBorderColor}`}>QTÉ</th>
              <th className={`w-[170px] border px-3 py-3 ${headerBorderColor}`}>CLIENT</th>
              <th className={`w-[130px] border px-3 py-3 ${headerBorderColor}`}>TOTAL</th>
              <th className={`w-[120px] border px-3 py-3 ${headerBorderColor}`}>DATE</th>
              <th className={`w-[120px] border px-3 py-3 ${headerBorderColor}`}>STATUT</th>
              <th className={`w-[70px] border px-3 py-3 text-right ${headerBorderColor}`}>ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#111c30]">
            {displayedCommandes.length === 0 ? (<tr><td colSpan={9} className={`border px-6 py-14 text-center ${borderColor}`}><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"><ShoppingCart size={22} className="text-slate-400 dark:text-slate-500" /></div><p className="mt-3 text-[14px] font-medium text-slate-700 dark:text-slate-200">Aucune commande trouvée</p><p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{searchCommande ? 'Essayez une autre recherche.' : 'Aucune commande disponible.'}</p>{searchCommande && <button type="button" onClick={handleResetSearch} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-indigo-700"><RotateCcw size={14} />Réinitialiser</button>}</td></tr>) : (displayedCommandes.map((commande, idx) => { 
              // ⭐ ILAY FANOVANA: Mampiasa parseProducts mba haka ilay designation sy quantite
              const products = parseProducts(commande.produits_noms);
              const first = products.length > 0 ? products[0] : null;
              const designation = first ? first.nom : (products.length > 0 ? `${products.length} produits` : '-');
              const quantity = first ? first.quantite : (products.length > 0 ? products.reduce((sum, p) => sum + p.quantite, 0) : '-');
              const commandeId = Number(commande?.id);
              const selected = selectedIds.has(commandeId);
              const numero = commande?.numero ?? commande?.id ?? '0';
              const client = commande?.client_nom || commande?.client || 'Inconnu';
              const total = safeNumber(commande?.total_ttc ?? commande?.total ?? 0);
              const status = commande?.statut || 'En attente';
              return (<tr key={commandeId || `commande-${idx}`} className={`group h-[64px] cursor-pointer transition-all duration-150 ${selected ? 'bg-indigo-50/80 dark:bg-indigo-500/[0.08]' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/35'}`}>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`} onClick={(e) => e.stopPropagation()}><button type="button" onClick={() => handleSelectOne(commandeId, !selected)} className="flex items-center justify-center text-slate-400 transition-colors hover:text-indigo-500" aria-label={selected ? 'Désélectionner' : 'Sélectionner'}>{selected ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}</button></td>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><span className="text-[14px] font-medium text-slate-900 dark:text-slate-100">#{String(numero).padStart(4, '0')}</span></td>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><div className="min-w-0"><span className="block max-w-[220px] truncate text-[14px] font-medium text-slate-900 dark:text-slate-100" title={String(designation)}>{designation}</span>{products.length > 1 && <span className="mt-0.5 block text-[11px] text-slate-400 dark:text-slate-500">+{products.length - 1} autre{products.length - 1 > 1 ? 's' : ''} produit{products.length - 1 > 1 ? 's' : ''}</span>}</div></td>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><span className="text-[14px] font-medium text-slate-600 dark:text-slate-300">{typeof quantity === 'number' ? quantity : '-'}</span></td>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><span className="block max-w-[160px] truncate text-[14px] text-slate-600 dark:text-slate-300" title={String(client)}>{client}</span></td>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><span className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(total)}</span></td>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><span className="text-[13px] text-slate-500 dark:text-slate-400">{formatDate(commande?.date_commande)}</span></td>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}><span className={`inline-flex max-w-[110px] truncate rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase ${getStatusClass(status, isDark)}`}>{status}</span></td>
                <td className={`border px-3 py-3 align-middle text-right ${cellBorderColor}`} onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-end"><EllipsisDropdown id={commandeId} type="commande" data={commande} isDark={isDark} onView={onView} onEdit={onEdit} onDelete={onDelete} onOpenChange={(open) => setOpenedDropdownRow(open ? commandeId : null)} /></div></td>
              </tr>); }))}
          </tbody>
        </table>
      </div>
      {filteredCommandes.length > 0 && (<div className={`border-t ${borderColor}`}><PaiementsPagination currentPage={commandePage} totalPages={totalPages} totalItems={filteredCommandes.length} onPageChange={setCommandePage} /></div>)}
    </div>
    <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.35); border-radius: 999px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.55); }`}</style>
  </div>);
};
export default PaiementsCommandesTab;