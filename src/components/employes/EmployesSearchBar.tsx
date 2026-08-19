import React, { useState } from 'react';
import { Search, X, Grid, List, ArrowUpDown, SlidersHorizontal, Briefcase, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const STATUS_OPTIONS = ['Tous', 'Actif', 'En congé', 'Inactif'] as const;

interface EmployesSearchBarProps {
  searchTerm: string; onSearchChange: (value: string) => void;
  filterStatus: string; onFilterStatusChange: (status: string) => void;
  sortOption: string; onSortChange: (option: string) => void;
  viewMode?: 'table' | 'grid'; onViewModeChange: (mode: 'table' | 'grid') => void;
  isLoading?: boolean;
  filterDepartement: string; onFilterDepartementChange: (value: string) => void;
}

const SelectControl: React.FC<{ value: string; onChange: (value: string) => void; options: readonly string[]; icon: React.ReactNode; minWidth?: string; ariaLabel: string }> = ({ value, onChange, options, icon, minWidth = '130px', ariaLabel }) => (
  <div className="relative shrink-0" style={{ minWidth }}>
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3"><span className="text-slate-400 dark:text-slate-500">{icon}</span></div>
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel} className="w-full h-10 appearance-none cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] pl-9 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-200 outline-none transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
    <ChevronDown size={14} strokeWidth={2} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
  </div>
);

const EmployesSearchBar: React.FC<EmployesSearchBarProps> = ({
  searchTerm, onSearchChange, filterStatus, onFilterStatusChange, sortOption, onSortChange,
  viewMode = 'table', onViewModeChange, isLoading = false,
  filterDepartement, onFilterDepartementChange,
}) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  if (isLoading) return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="flex-1 min-w-[220px] h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="w-[125px] h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="w-[140px] h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="w-[145px] h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="w-[132px] h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center gap-2.5 w-full flex-nowrap overflow-x-auto overflow-y-hidden pb-1 scrollbar-none">
        <div className="relative flex-1 min-w-[220px] shrink">
          <Search size={17} strokeWidth={1.9} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} />
          <input type="text" value={searchTerm} placeholder="Rechercher un employé..." onChange={(e) => onSearchChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] pl-9 pr-9 text-[13px] font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10" />
          {searchTerm && <button type="button" onClick={() => onSearchChange('')} aria-label="Effacer la recherche" className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"><X size={13} /></button>}
        </div>
        <SelectControl value={filterStatus} onChange={onFilterStatusChange} options={STATUS_OPTIONS} icon={<SlidersHorizontal size={15} strokeWidth={1.8} />} minWidth="125px" ariaLabel="Filtrer par statut" />
        <div className="relative shrink-0 w-[140px]">
          <Briefcase size={15} strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input type="text" value={filterDepartement} placeholder="Département" onChange={(e) => onFilterDepartementChange(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] pl-9 pr-3 text-[13px] font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10" />
        </div>
        <SelectControl value={sortOption} onChange={onSortChange} options={['Nom (A-Z)', 'Nom (Z-A)', 'Salaire (Croissant)', 'Salaire (Décroissant)', 'Date (Récent)', 'Date (Ancien)']} icon={<ArrowUpDown size={15} strokeWidth={1.8} />} minWidth="145px" ariaLabel="Trier les employés" />
        <div className="shrink-0 flex items-center gap-0.5 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A]" role="group" aria-label="Changer la vue">
          <button type="button" onClick={() => onViewModeChange('table')} aria-label="Vue tableau" title="Vue tableau" className={`flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all duration-200 ${viewMode === 'table' ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <List size={16} strokeWidth={viewMode === 'table' ? 2.2 : 1.8} />
          </button>
          <button type="button" onClick={() => onViewModeChange('grid')} aria-label="Vue grille" title="Vue grille" className={`flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all duration-200 ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <Grid size={15} strokeWidth={viewMode === 'grid' ? 2.2 : 1.8} />
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default EmployesSearchBar;