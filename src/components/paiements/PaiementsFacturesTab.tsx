// src/components/paiements/PaiementsFacturesTab.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Search, CheckSquare, Square, Trash2, FileText, Plus } from 'lucide-react';
import { safeNumber, normalizeText, ITEMS_PER_PAGE, formatDate, getStatusClass, DeleteType } from './PaiementsUtils';
import { formatMoney } from '../../lib/formatMoney';
import PaiementsPagination from './PaiementsPagination';
import EllipsisDropdown from './PaiementsDropdown';

interface Props { 
  isDark: boolean; 
  factures: any[]; 
  onView: (data: any) => void; 
  onEdit: (data: any) => void; 
  onDelete: (id: number, type: string) => void; 
  onBulkDelete: (type: DeleteType) => void; 
  onAdd?: () => void; 
}

const PaiementsFacturesTab: React.FC<Props> = ({ 
  isDark, 
  factures = [], 
  onView, 
  onEdit, 
  onDelete, 
  onBulkDelete, 
  onAdd 
}) => {
  const [searchFacture, setSearchFacture] = useState('');
  const [facturePage, setFacturePage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-300';
  const cellBorderColor = isDark ? 'border-white/[0.10]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.18]' : 'border-slate-300';

  const normalizedFactures = useMemo(() => { 
    if (!Array.isArray(factures)) return []; 
    return factures.filter(Boolean); 
  }, [factures]);

  const filteredFactures = useMemo(() => { 
    const term = normalizeText(searchFacture); 
    if (!term) return normalizedFactures; 
    return normalizedFactures.filter((facture) => { 
      const numero = normalizeText(facture?.numero ?? facture?.reference ?? facture?.facture_numero ?? ''); 
      const client = normalizeText(facture?.client_nom ?? facture?.client ?? facture?.client_name ?? ''); 
      const statut = normalizeText(facture?.statut ?? facture?.status ?? ''); 
      const id = String(facture?.id ?? ''); 
      return numero.includes(term) || client.includes(term) || statut.includes(term) || id.includes(term); 
    }); 
  }, [normalizedFactures, searchFacture]);

  const totalPages = Math.max(1, Math.ceil(filteredFactures.length / ITEMS_PER_PAGE));
  const displayedFactures = useMemo(() => { 
    const start = (facturePage - 1) * ITEMS_PER_PAGE; 
    return filteredFactures.slice(start, start + ITEMS_PER_PAGE); 
  }, [filteredFactures, facturePage]);

  useEffect(() => { setFacturePage(1); }, [searchFacture]);
  useEffect(() => { if (facturePage > totalPages) setFacturePage(totalPages); }, [facturePage, totalPages]);
  useEffect(() => { 
    const validIds = new Set(normalizedFactures.map((facture) => Number(facture?.id)).filter((id) => Number.isFinite(id) && id > 0)); 
    setSelectedIds((previous) => { 
      const next = new Set(Array.from(previous).filter((id) => validIds.has(id))); 
      if (next.size === previous.size) { 
        let same = true; 
        for (const id of previous) { 
          if (!next.has(id)) { 
            same = false; 
            break; 
          } 
        } 
        if (same) return previous; 
      } 
      return next; 
    }); 
  }, [normalizedFactures]);

  const filteredIds = useMemo(() => filteredFactures.map((facture) => Number(facture?.id)).filter((id) => Number.isFinite(id) && id > 0), [filteredFactures]);
  const selectedFilteredIds = useMemo(() => filteredIds.filter((id) => selectedIds.has(id)), [filteredIds, selectedIds]);
  const allFilteredSelected = filteredIds.length > 0 && selectedFilteredIds.length === filteredIds.length;
  const someFilteredSelected = selectedFilteredIds.length > 0 && selectedFilteredIds.length < filteredIds.length;

  const handleSelectOne = (id: number, checked: boolean) => { 
    if (!Number.isFinite(id) || id <= 0) return; 
    setSelectedIds((previous) => { 
      const next = new Set(previous); 
      if (checked) next.add(id); 
      else next.delete(id); 
      return next; 
    }); 
  };
  const handleSelectAll = (checked: boolean) => { 
    setSelectedIds((previous) => { 
      const next = new Set(previous); 
      if (checked) filteredIds.forEach((id) => next.add(id)); 
      else filteredIds.forEach((id) => next.delete(id)); 
      return next; 
    }); 
  };
  const handleBulkDelete = () => { 
    if (selectedIds.size === 0) return; 
    onBulkDelete('facture'); 
  };

  // ⭐ RAHA TSY MISY FACTURE DIA ASEHO NY HEADER SY NY EMPTY STATE MAINITSO IRERY IHANY
  if (normalizedFactures.length === 0) {
    return (
      <div className="space-y-4">
        <div className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                <FileText size={19} className="text-cyan-500" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Gestion des factures</h2>
                <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">0 facture</p>
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <FileText size={30} strokeWidth={1.8} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucune facture</h3>
          <p className="mx-auto mt-1 max-w-md text-[14px] text-slate-500 dark:text-slate-400">Aucune facture n'est disponible pour le moment.</p>
          {onAdd && (
            <button 
              type="button" 
              onClick={onAdd} 
              className="mx-auto mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <Plus size={16} />Ajouter une facture
            </button>
          )}
        </div>
      </div>
    );
  }

  // ⭐ RAHA MISY FACTURE SAINGY FILTERED = 0 (TSY HITA NY KAROHY) 
  if (normalizedFactures.length > 0 && filteredFactures.length === 0) {
    return (
      <div className="space-y-4">
        <div className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                <FileText size={19} className="text-cyan-500" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Gestion des factures</h2>
                <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{normalizedFactures.length} facture{normalizedFactures.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                value={searchFacture} 
                onChange={(e) => setSearchFacture(e.target.value)} 
                placeholder="Rechercher..." 
                className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-64" 
              />
            </div>
          </div>
        </div>
        <div className={`overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}>
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <Search size={22} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucune facture trouvée</h3>
            <p className="mt-1 max-w-md text-[14px] text-slate-500 dark:text-slate-400">Aucune facture ne correspond aux critères de recherche.</p>
            <button 
              type="button" 
              onClick={() => setSearchFacture('')} 
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Réinitialiser la recherche
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ⭐ RAHA MISY FACTURE SY HITA NY KAROHY
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <FileText size={19} className="text-cyan-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Gestion des factures</h2>
              <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{filteredFactures.length} facture{filteredFactures.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchFacture} 
              onChange={(e) => setSearchFacture(e.target.value)} 
              placeholder="Rechercher..." 
              className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-64" 
            />
          </div>
        </div>
      </div>

      {/* BULK SELECTION BAR */}
      {selectedIds.size > 0 && (
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-indigo-50 px-4 py-2 dark:bg-[#0F172A] ${borderColor}`}>
          <span className="text-[14px] font-medium text-indigo-700 dark:text-slate-200">
            {selectedIds.size} facture{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button" 
              onClick={handleBulkDelete} 
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <Trash2 size={14} />Supprimer
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedIds(new Set())} 
              className="flex items-center gap-1.5 rounded-md bg-slate-200 px-3 py-1.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      <div className={`overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}>
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[850px] border-separate border-spacing-0 text-left">
            <thead className={`${headerBorderColor} bg-slate-100 dark:bg-[#111c30]`}>
              <tr className="text-[12px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className={`w-12 border px-3 py-2.5 ${headerBorderColor}`}>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAll(!allFilteredSelected)} 
                    className="flex items-center justify-center text-slate-400 transition-colors hover:text-indigo-500" 
                    aria-label={allFilteredSelected ? 'Désélectionner toutes les factures' : 'Sélectionner toutes les factures'}
                  >
                    {allFilteredSelected ? <CheckSquare size={16} className="text-indigo-500" /> : someFilteredSelected ? <CheckSquare size={16} className="text-indigo-400" /> : <Square size={16} />}
                  </button>
                </th>
                <th className={`border px-3 py-2.5 ${headerBorderColor}`}>N° FACTURE</th>
                <th className={`border px-3 py-2.5 ${headerBorderColor}`}>CLIENT</th>
                <th className={`border px-3 py-2.5 ${headerBorderColor}`}>MONTANT</th>
                <th className={`border px-3 py-2.5 ${headerBorderColor}`}>DATE</th>
                <th className={`border px-3 py-2.5 ${headerBorderColor}`}>STATUT</th>
                <th className={`border px-3 py-2.5 text-right ${headerBorderColor}`}>ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#111c30]">
              {displayedFactures.map((facture, index) => {
                const factureId = Number(facture?.id); 
                const selected = selectedIds.has(factureId);
                const numero = facture?.numero ?? facture?.reference ?? facture?.facture_numero ?? `#${String(factureId || 0).padStart(4, '0')}`;
                const client = facture?.client_nom ?? facture?.client ?? facture?.client_name ?? 'Inconnu';
                const montant = safeNumber(facture?.montant ?? facture?.total ?? facture?.total_ttc ?? 0);
                const date = facture?.date_facture ?? facture?.date ?? facture?.date_creation ?? null;
                const statut = facture?.statut ?? facture?.status ?? 'En attente';
                
                return (
                  <tr 
                    key={factureId || `facture-${index}`} 
                    className={`group h-[60px] cursor-pointer transition-colors duration-150 ${selected ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                    onClick={() => onView(facture)}
                  >
                    <td className={`border px-3 py-2.5 align-middle ${cellBorderColor}`} onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button" 
                        onClick={() => handleSelectOne(factureId, !selected)} 
                        className="flex items-center justify-center text-slate-400 transition-colors hover:text-indigo-500" 
                        aria-label={selected ? 'Désélectionner' : 'Sélectionner'}
                      >
                        {selected ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className={`border px-3 py-2.5 align-middle ${cellBorderColor}`}>
                      <span className="font-mono text-[14px] font-medium text-slate-900 dark:text-slate-100">{numero}</span>
                    </td>
                    <td className={`border px-3 py-2.5 align-middle ${cellBorderColor}`}>
                      <div className="min-w-0">
                        <span className="block max-w-[220px] truncate text-[14px] font-medium text-slate-700 transition-colors group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400" title={String(client)}>
                          {client}
                        </span>
                      </div>
                    </td>
                    <td className={`border px-3 py-2.5 align-middle ${cellBorderColor}`}>
                      <span className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(montant)}</span>
                    </td>
                    <td className={`border px-3 py-2.5 align-middle ${cellBorderColor}`}>
                      <span className="text-[14px] text-slate-500 dark:text-slate-400">{date ? formatDate(date) : '—'}</span>
                    </td>
                    <td className={`border px-3 py-2.5 align-middle ${cellBorderColor}`}>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[13px] font-semibold uppercase ${getStatusClass(statut, isDark)}`}>
                        {statut}
                      </span>
                    </td>
                    <td className={`border px-3 py-2.5 text-right align-middle ${cellBorderColor}`} onClick={(e) => e.stopPropagation()}>
                      <EllipsisDropdown 
                        id={factureId} 
                        type="facture" 
                        data={facture} 
                        isDark={isDark} 
                        onView={onView} 
                        onEdit={onEdit} 
                        onDelete={onDelete} 
                        onOpenChange={() => {}} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredFactures.length > 0 && (
          <div className={`border-t ${borderColor}`}>
            <PaiementsPagination 
              currentPage={facturePage} 
              totalPages={totalPages} 
              totalItems={filteredFactures.length} 
              onPageChange={setFacturePage} 
            />
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.35); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.55); }
      `}</style>
    </div>
  );
};

export default PaiementsFacturesTab;