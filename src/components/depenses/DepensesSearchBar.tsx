// src/components/depenses/DepensesSearchBar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Grid, List, ArrowUpDown, Tag, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SORT_OPTIONS = [
  { value: 'Date (Récent)', label: 'Date (Récent)' },
  { value: 'Date (Ancien)', label: 'Date (Ancien)' },
  { value: 'Montant (Croissant)', label: 'Montant ↑' },
  { value: 'Montant (Décroissant)', label: 'Montant ↓' },
  { value: 'Catégorie (A-Z)', label: 'Catégorie (A-Z)' },
  { value: 'Catégorie (Z-A)', label: 'Catégorie (Z-A)' },
] as const;

interface DepensesSearchBarProps { searchTerm: string; onSearchChange: (value: string) => void; filterCategorie: string; onFilterCategorieChange: (value: string) => void; sortOption: string; onSortChange: (option: string) => void; categories: string[]; viewMode: 'table' | 'grid'; onViewModeChange: (mode: 'table' | 'grid') => void; }

const DepensesSearchBar: React.FC<DepensesSearchBarProps> = ({ searchTerm, onSearchChange, filterCategorie, onFilterCategorieChange, sortOption, onSortChange, categories, viewMode, onViewModeChange }) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const surface = isDark ? 'bg-[#111c30]' : 'bg-white';
  const border = isDark ? 'border-white/[0.08]' : 'border-slate-300';
  const hoverBorder = isDark ? 'hover:border-white/[0.14]' : 'hover:border-slate-400';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const selectTextColor = isDark ? 'text-slate-200' : 'text-slate-700';
  const mutedColor = isDark ? 'text-slate-500' : 'text-slate-400';
  const placeholderColor = isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400';

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

  return (<div className="w-full" role="search" aria-label="Barre de recherche et filtres des dépenses">
    <div className="flex w-full flex-col gap-2.5 xl:flex-row xl:items-center">
      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search size={18} strokeWidth={2} className={`transition-colors duration-200 ${isFocused ? 'text-indigo-600 dark:text-indigo-400' : mutedColor}`} /></div>
        <input ref={searchRef} type="text" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="Rechercher une dépense..." autoComplete="off" aria-label="Rechercher une dépense" className={`h-10 w-full rounded-lg border ${border} ${surface} pl-10 ${searchTerm ? 'pr-11' : 'pr-20'} text-[14px] font-medium ${textColor} ${placeholderColor} outline-none shadow-sm transition-all duration-200 ${hoverBorder} ${isFocused ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.08)]' : ''}`} />
        {!searchTerm && (<div className={`pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex`}><kbd className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium shadow-sm ${isDark ? 'border-white/[0.08] bg-slate-800/70 text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>{typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘' : 'Ctrl'}</kbd><kbd className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium shadow-sm ${isDark ? 'border-white/[0.08] bg-slate-800/70 text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>K</kbd></div>)}
        {searchTerm && (<button type="button" title="Effacer la recherche" aria-label="Effacer la recherche" onClick={() => onSearchChange('')} className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}><X size={15} strokeWidth={2} /></button>)}
      </div>
      <div className="flex w-full shrink-0 items-center gap-2 overflow-x-auto pb-0.5 xl:w-auto xl:overflow-visible">
        <div className="relative shrink-0"><Tag size={15} strokeWidth={2} className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 ${mutedColor}`} /><select value={filterCategorie} onChange={(event) => onFilterCategorieChange(event.target.value)} aria-label="Filtrer par catégorie" className={`h-10 w-[145px] cursor-pointer appearance-none rounded-lg border ${border} ${surface} pl-9 pr-8 text-[13px] font-medium ${selectTextColor} outline-none shadow-sm transition-all duration-200 ${hoverBorder} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10`}><option value="" className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>Catégorie</option>{categories.map((category) => (<option key={category} value={category} className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>{category}</option>))}</select><ChevronDown size={14} strokeWidth={2} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${mutedColor}`} /></div>
        <div className="relative shrink-0"><ArrowUpDown size={15} strokeWidth={2} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${mutedColor}`} /><select value={sortOption} onChange={(event) => onSortChange(event.target.value)} aria-label="Trier les dépenses" className={`h-10 w-[155px] cursor-pointer appearance-none rounded-lg border ${border} ${surface} pl-9 pr-8 text-[13px] font-medium ${selectTextColor} outline-none shadow-sm transition-all duration-200 ${hoverBorder} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10`}>{SORT_OPTIONS.map((option) => (<option key={option.value} value={option.value} className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>{option.label}</option>))}</select><ChevronDown size={14} strokeWidth={2} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${mutedColor}`} /></div>
        <div className={`flex h-10 shrink-0 items-center gap-0.5 rounded-lg border p-1 ${border} ${surface} shadow-sm`} role="group" aria-label="Mode d'affichage">
          <button type="button" title="Vue tableau" aria-label="Vue tableau" aria-pressed={viewMode === 'table'} onClick={() => onViewModeChange('table')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : `${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}`}><List size={18} strokeWidth={2} /></button>
          <button type="button" title="Vue grille" aria-label="Vue grille" aria-pressed={viewMode === 'grid'} onClick={() => onViewModeChange('grid')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : `${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}`}><Grid size={18} strokeWidth={2} /></button>
        </div>
      </div>
    </div>
  </div>);
};
export default DepensesSearchBar;