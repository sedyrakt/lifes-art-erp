// src/components/entrees/EntreesSearchBar.tsx
import React, { useMemo, useState } from 'react';
import { Search, X, Grid, List, ArrowUpDown, Building2 } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'Date (Récent)', label: 'Date (Récent)' },
  { value: 'Date (Ancien)', label: 'Date (Ancien)' },
  { value: 'Quantité (Croissant)', label: 'Quantité ↑' },
  { value: 'Quantité (Décroissant)', label: 'Quantité ↓' },
  { value: 'Prix (Croissant)', label: 'Prix ↑' },
  { value: 'Prix (Décroissant)', label: 'Prix ↓' },
] as const;

interface Fournisseur { id: number | string; nom: string; }
interface EntreesSearchBarProps { searchTerm: string; onSearchChange: (value: string) => void; filterFournisseur: string; onFilterFournisseurChange: (value: string) => void; sortOption: string; onSortChange: (option: string) => void; viewMode: 'table' | 'grid'; onViewModeChange: (mode: 'table' | 'grid') => void; fournisseurs: Fournisseur[]; isLoading?: boolean; }

const EntreesSearchBar: React.FC<EntreesSearchBarProps> = ({ searchTerm, onSearchChange, filterFournisseur, onFilterFournisseurChange, sortOption, onSortChange, viewMode, onViewModeChange, fournisseurs, isLoading = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const selectedFournisseur = useMemo(() => { if (!filterFournisseur) return null; return fournisseurs.find((f) => String(f.id) === filterFournisseur) || null; }, [filterFournisseur, fournisseurs]);
  const hasActiveFilters = searchTerm.trim() !== '' || filterFournisseur !== '';
  const handleReset = () => { onSearchChange(''); onFilterFournisseurChange(''); onSortChange('Date (Récent)'); };

  if (isLoading) return (<div className="mb-4 w-full animate-pulse"><div className="flex w-full flex-col gap-2.5 xl:flex-row xl:items-center"><div className="h-10 min-w-0 flex-1 rounded-lg bg-slate-200 dark:bg-slate-800" /><div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800 xl:w-[190px]" /><div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800 xl:w-[165px]" /><div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800 xl:w-[150px]" /></div></div>);

  return (<div className="mb-4 w-full">
    <div className="flex w-full flex-col gap-2.5 xl:flex-row xl:items-center">
      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5"><Search size={18} strokeWidth={2} className={`transition-colors duration-150 ${isFocused ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} /></div>
        <input type="text" value={searchTerm} placeholder="Rechercher une entrée..." onChange={(e) => onSearchChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className={`h-10 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-10 text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-150 hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10`} />
        {searchTerm && (<button type="button" onClick={() => onSearchChange('')} aria-label="Effacer la recherche" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X size={14} /></button>)}
      </div>
      <div className="flex w-full items-center gap-2 xl:w-auto">
        <div className="relative min-w-0 flex-1 xl:w-[190px] xl:flex-none">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3"><Building2 size={15} strokeWidth={2} className="text-slate-400 dark:text-slate-500" /></div>
          <select value={filterFournisseur} onChange={(e) => onFilterFournisseurChange(e.target.value)} aria-label="Filtrer par fournisseur" className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-[13px] font-medium text-slate-700 outline-none transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10"><option value="">Tous les fournisseurs</option>{fournisseurs.map((f) => (<option key={f.id} value={String(f.id)}>{f.nom}</option>))}</select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-400 dark:text-slate-500"><path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        </div>
        <div className="relative min-w-0 flex-1 xl:w-[165px] xl:flex-none">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3"><ArrowUpDown size={15} strokeWidth={2} className="text-slate-400 dark:text-slate-500" /></div>
          <select value={sortOption} onChange={(e) => onSortChange(e.target.value)} aria-label="Trier les entrées" className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10">{SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}</select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-400 dark:text-slate-500"><path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        </div>
        <div className="flex h-10 shrink-0 items-center rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-[#0F172A]" role="group" aria-label="Mode d'affichage">
          <button type="button" onClick={() => onViewModeChange('table')} aria-label="Vue tableau" aria-pressed={viewMode === 'table'} className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-all duration-150 ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><List size={15} strokeWidth={2} /><span>Table</span></button>
          <button type="button" onClick={() => onViewModeChange('grid')} aria-label="Vue grille" aria-pressed={viewMode === 'grid'} className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-all duration-150 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><Grid size={15} strokeWidth={2} /><span>Grille</span></button>
        </div>
      </div>
    </div>
    {hasActiveFilters && (<div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-0.5">
      <div className="flex flex-wrap items-center gap-1.5"><span className="mr-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Filtres</span>
        {searchTerm.trim() && (<div className="inline-flex max-w-[220px] items-center gap-1.5 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"><Search size={11} strokeWidth={2} /><span className="truncate">"{searchTerm}"</span><button type="button" onClick={() => onSearchChange('')} aria-label="Supprimer la recherche" className="shrink-0 rounded p-0.5 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-200"><X size={11} /></button></div>)}
        {selectedFournisseur && (<div className="inline-flex max-w-[200px] items-center gap-1.5 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"><Building2 size={11} strokeWidth={2} /><span className="truncate">{selectedFournisseur.nom}</span><button type="button" onClick={() => onFilterFournisseurChange('')} aria-label="Supprimer le filtre fournisseur" className="shrink-0 rounded p-0.5 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-200"><X size={11} /></button></div>)}
      </div>
      <button type="button" onClick={handleReset} className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400">Réinitialiser</button>
    </div>)}
  </div>);
};
export default EntreesSearchBar;