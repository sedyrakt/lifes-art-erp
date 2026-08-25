// src/components/produits/ProduitsSearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Grid, List, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SORT_OPTIONS = [
  { value: 'Nom (A-Z)', label: 'Nom (A-Z)' },
  { value: 'Nom (Z-A)', label: 'Nom (Z-A)' },
  { value: 'Prix (Croissant)', label: 'Prix ↑' },
  { value: 'Prix (Décroissant)', label: 'Prix ↓' },
  { value: 'Stock (Croissant)', label: 'Stock ↑' },
  { value: 'Stock (Décroissant)', label: 'Stock ↓' },
] as const;

interface ProduitsSearchBarProps {
  searchTerm: string; onSearchChange: (value: string) => void; sortOption: string; onSortChange: (option: string) => void;
  viewMode: 'table' | 'grid'; onViewModeChange: (mode: 'table' | 'grid') => void;
  filterCategorie: string; onFilterCategorieChange: (value: string) => void;
  filterStatus: string; onFilterStatusChange: (value: string) => void;
  categories: Array<{ id: number; nom: string; }>;
  onResetFilters: () => void; hasActiveFilters: boolean;
}

// ⭐ FIX: Custom Select Component (Avoasaina ho scroll manify)
const CustomSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  isDark: boolean;
}> = ({ value, onChange, options, placeholder = 'Sélectionner', icon, className = '', isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-[14px] text-slate-700 outline-none shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all hover:border-slate-400 hover:bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/60 ${className}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[999] mt-1 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {/* ⭐ FIX: Search amin'ny dropdown */}
          <div className="border-b border-slate-200 p-2 dark:border-slate-700">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          {/* ⭐ FIX: Max-height 200px + Scroll manify */}
          <div className="custom-dropdown-scroll max-h-[200px] overflow-y-auto">
            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); setSearchTerm(''); }}
              className="flex w-full items-center px-3 py-2 text-left text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800"
              style={{ color: value === '' ? '#6366F1' : '#64748B' }}
            >
              {placeholder}
            </button>
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }}
                className={`flex w-full items-center px-3 py-2 text-left text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 ${value === opt.value ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .custom-dropdown-scroll::-webkit-scrollbar { width: 6px; }
        .custom-dropdown-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dropdown-scroll::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.3); border-radius: 999px; }
        .custom-dropdown-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.5); }
        .custom-dropdown-scroll { scrollbar-width: thin; }
      `}</style>
    </div>
  );
};

const ProduitsSearchBar: React.FC<ProduitsSearchBarProps> = ({ searchTerm, onSearchChange, sortOption, onSortChange, viewMode, onViewModeChange, filterCategorie, onFilterCategorieChange, filterStatus, onFilterStatusChange, categories, onResetFilters, hasActiveFilters }) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (isShortcut) { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        if (searchTerm) onSearchChange(''); else searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [searchTerm, onSearchChange]);

  const fieldBorder = 'border border-slate-300 dark:border-slate-700';
  const fieldBackground = 'bg-white dark:bg-slate-900';
  const fieldText = 'text-slate-700 dark:text-slate-200';
  const fieldFocus = 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10';

  return (<div className="mb-4 flex w-full flex-col gap-2">
    <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative min-w-[280px] flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5"><Search size={18} strokeWidth={2} className={`transition-colors ${isFocused ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} /></div>
        <input ref={searchRef} type="text" placeholder="Rechercher un produit..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className={`h-10 w-full rounded-lg ${fieldBorder} ${fieldBackground} pl-11 pr-10 text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-150 hover:border-slate-400 dark:hover:border-slate-600 ${fieldFocus}`} />
        {!searchTerm && (<div className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[13px] font-medium text-slate-500 shadow-sm sm:flex dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"><span>Ctrl</span><span>K</span></div>)}
        {searchTerm && (<button type="button" onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="Effacer la recherche"><X size={16} /></button>)}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        
        {/* ⭐ FIX: Custom Select Catégorie */}
        <CustomSelect
          value={filterCategorie}
          onChange={onFilterCategorieChange}
          options={(categories || []).map((c) => ({ value: String(c.id), label: c.nom }))}
          placeholder="Catégorie"
          isDark={isDark}
          className="min-w-[140px]"
        />
        
        {/* ⭐ FIX: Custom Select Statut */}
        <CustomSelect
          value={filterStatus}
          onChange={onFilterStatusChange}
          options={[{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }, { value: 'archive', label: 'Archive' }]}
          placeholder="Statut"
          isDark={isDark}
          className="min-w-[120px]"
        />

        <div className="relative min-w-[150px]"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><ArrowUpDown size={15} strokeWidth={2} className="text-slate-400 dark:text-slate-500" /></div><select value={sortOption} onChange={(e) => onSortChange(e.target.value)} className={`h-10 w-full cursor-pointer appearance-none rounded-lg ${fieldBorder} ${fieldBackground} pl-9 pr-3 text-[14px] ${fieldText} outline-none shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all hover:border-slate-400 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800/60 ${fieldFocus}`}>{SORT_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div>
        <div className={`flex shrink-0 items-center rounded-lg border border-slate-300 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-700 dark:bg-slate-900`} role="group" aria-label="Mode d'affichage">
          <button type="button" onClick={() => onViewModeChange('table')} className={`flex cursor-pointer items-center gap-1.5 rounded-md p-1.5 text-[14px] transition-all ${viewMode === 'table' ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'}`} title="Vue tableau"><List size={15} strokeWidth={2} /><span>Table</span></button>
          <button type="button" onClick={() => onViewModeChange('grid')} className={`flex cursor-pointer items-center gap-1.5 rounded-md p-1.5 text-[14px] transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'}`} title="Vue grille"><Grid size={15} strokeWidth={2} /><span>Grille</span></button>
        </div>
      </div>
    </div>
  </div>);
};
export default ProduitsSearchBar;