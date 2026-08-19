// src/components/clients/ClientsSearchBar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Grid2X2, List, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const TYPE_FILTERS = [{ value: 'Tous', label: 'Tous les clients' }, { value: 'Particulier', label: 'Particuliers' }, { value: 'Entreprise', label: 'Entreprises' }] as const;
const SORT_OPTIONS = [{ value: 'Nom (A-Z)', label: 'Nom (A-Z)' }, { value: 'Nom (Z-A)', label: 'Nom (Z-A)' }, { value: 'Date (Récent)', label: 'Plus récent' }, { value: 'Date (Ancien)', label: 'Plus ancien' }] as const;

interface ClientsSearchBarProps { searchTerm: string; onSearchChange: (value: string) => void; filterType: string; onFilterTypeChange: (type: string) => void; sortOption: string; onSortChange: (option: string) => void; viewMode?: 'table' | 'grid'; onViewModeChange: (mode: 'table' | 'grid') => void; }

const ClientsSearchBar: React.FC<ClientsSearchBarProps> = ({ searchTerm, onSearchChange, filterType, onFilterTypeChange, sortOption, onSortChange, viewMode = 'table', onViewModeChange }) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const surface = isDark ? 'bg-[#111c30]' : 'bg-white';
  const border = isDark ? 'border-slate-800' : 'border-slate-300';
  const hoverBorder = isDark ? 'hover:border-slate-700' : 'hover:border-slate-400';
  const text = isDark ? 'text-slate-100' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const placeholder = isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400';

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const isSearchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (isSearchShortcut) { event.preventDefault(); searchRef.current?.focus(); searchRef.current?.select(); }
      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        if (searchTerm) onSearchChange(''); else searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [searchTerm, onSearchChange]);

  const controlBase = `h-10 rounded-lg border ${surface} ${border} ${hoverBorder} outline-none shadow-sm transition-all duration-200`;

  return (<div className="w-full" role="search" aria-label="Barre de recherche et filtres des clients">
    <div className="flex w-full flex-col gap-2.5 xl:flex-row xl:items-center">
      <div className="relative min-w-0 flex-1">
        <div className={`pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center transition-colors duration-200 ${isFocused ? 'text-indigo-500 dark:text-indigo-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}><Search size={18} strokeWidth={2} /></div>
        <input ref={searchRef} type="text" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="Rechercher un client..." autoComplete="off" aria-label="Rechercher un client" className={`h-10 w-full rounded-lg border ${surface} ${border} ${hoverBorder} pl-10 ${searchTerm ? 'pr-20' : 'pr-16'} text-[14px] font-medium ${text} ${placeholder} outline-none shadow-sm transition-all duration-200 ${isFocused ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.08)]' : ''}`} />
        {!searchTerm && (<div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex"><kbd className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium shadow-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>{typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘' : 'Ctrl'}</kbd><kbd className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium shadow-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>K</kbd></div>)}
        {searchTerm && (<button type="button" onClick={() => onSearchChange('')} title="Effacer la recherche" aria-label="Effacer la recherche" className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}><X size={15} /></button>)}
      </div>
      <div className="flex w-full shrink-0 items-center gap-2 overflow-x-auto pb-0.5 xl:w-auto">
        <div className="relative shrink-0"><select value={filterType} onChange={(event) => onFilterTypeChange(event.target.value)} aria-label="Filtrer par type de client" className={`${controlBase} w-[135px] appearance-none cursor-pointer pl-3 pr-8 text-[13px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10`}>{TYPE_FILTERS.map((type) => (<option key={type.value} value={type.value} className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>{type.label}</option>))}</select><ChevronDown size={14} strokeWidth={2} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} /></div>
        <div className="relative shrink-0"><ArrowUpDown size={15} strokeWidth={2} className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} /><select value={sortOption} onChange={(event) => onSortChange(event.target.value)} aria-label="Trier les clients" className={`${controlBase} w-[145px] appearance-none cursor-pointer pl-9 pr-8 text-[13px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10`}>{SORT_OPTIONS.map((option) => (<option key={option.value} value={option.value} className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>{option.label}</option>))}</select><ChevronDown size={14} strokeWidth={2} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} /></div>
        <div className={`flex h-10 shrink-0 items-center gap-0.5 rounded-lg border p-1 ${surface} ${border} shadow-sm`} role="group" aria-label="Mode d'affichage">
          <button type="button" onClick={() => onViewModeChange('table')} title="Vue tableau" aria-label="Vue tableau" aria-pressed={viewMode === 'table'} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : `${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}`}><List size={18} strokeWidth={2} /></button>
          <button type="button" onClick={() => onViewModeChange('grid')} title="Vue grille" aria-label="Vue grille" aria-pressed={viewMode === 'grid'} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : `${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}`}><Grid2X2 size={18} strokeWidth={2} /></button>
        </div>
      </div>
    </div>
  </div>);
};
export default ClientsSearchBar;