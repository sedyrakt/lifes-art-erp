// src/components/sorties/SortiesStats.tsx
import React from 'react';
import { FileText, Package, DollarSign, MapPin, Loader2 } from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';
import { useTheme } from '../../contexts/ThemeContext'; // ⭐ ZAVA-DEHIBE: Nampidirina ny useTheme

interface SortiesStatsProps { 
  totalSorties: number; 
  totalQuantite: number; 
  totalValeur: number; 
  destinations: number; 
  previousTotalSorties?: number; 
  previousTotalQuantite?: number; 
  previousTotalValeur?: number; 
  previousDestinations?: number; 
  refreshing?: boolean; 
}

const safeNumber = (value: unknown): number => { 
  const number = Number(value); 
  return Number.isFinite(number) ? number : 0; 
};

const calculateEvolution = (current: unknown, previous: unknown): number => { 
  const currentValue = safeNumber(current); 
  const previousValue = safeNumber(previous); 
  if (previousValue <= 0) return 0; 
  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1)); 
};

const SortiesStats: React.FC<SortiesStatsProps> = ({ 
  totalSorties, 
  totalQuantite, 
  totalValeur, 
  destinations, 
  previousTotalSorties = 0, 
  previousTotalQuantite = 0, 
  previousTotalValeur = 0, 
  previousDestinations = 0, 
  refreshing = false 
}) => {
  const { isDark } = useTheme(); // ⭐ FIX: Nampidirina mba ho azo ampiasaina

  const evolutionSorties = calculateEvolution(totalSorties, previousTotalSorties);
  const evolutionQuantite = calculateEvolution(totalQuantite, previousTotalQuantite);
  const evolutionValeur = calculateEvolution(totalValeur, previousTotalValeur);
  const evolutionDestinations = calculateEvolution(destinations, previousDestinations);

  const stats = [
    { label: 'Total sorties', value: safeNumber(totalSorties).toLocaleString('fr-FR'), icon: FileText, evolution: evolutionSorties, iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
    { label: 'Quantité totale', value: `${safeNumber(totalQuantite).toLocaleString('fr-FR')} unités`, icon: Package, evolution: evolutionQuantite, iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { label: 'Valeur totale', value: formatMoney(safeNumber(totalValeur)), icon: DollarSign, evolution: evolutionValeur, iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
    { label: 'Destinations', value: safeNumber(destinations).toLocaleString('fr-FR'), icon: MapPin, evolution: evolutionDestinations, iconClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' },
  ];

  const cardBorder = isDark ? 'border-white/[0.08]' : 'border-slate-300'; // ⭐ FIX: Mampiasa ny isDark
  const cardHoverBorder = isDark ? 'hover:border-white/[0.12]' : 'hover:border-slate-400';
  const cardHoverBg = isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50';

  return (<div className="relative mb-5 w-full">
    {refreshing && (<div className={`absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-lg border ${cardBorder} bg-white px-2.5 py-1.5 text-indigo-600 shadow-sm animate-pulse dark:bg-[#0F172A] dark:text-indigo-400`}>
      <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Mise à jour...</span>
    </div>)}
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon; 
        const isPositive = stat.evolution >= 0; 
        const evolutionDisplay = `${isPositive ? '+' : ''}${stat.evolution.toFixed(1)}%`; 
        const hasEvolution = stat.evolution !== 0;
        return (<div key={stat.label} className={`group relative min-h-[80px] rounded-lg border ${cardBorder} ${cardHoverBorder} bg-white dark:bg-[#111c30] px-4 py-3.5 transition-all duration-200 ${cardHoverBg} ring-1 ring-transparent hover:ring-indigo-500/20 shadow-[0_1px_2px_rgba(15,23,42,0.03)]`}>
          <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}><Icon size={20} strokeWidth={2} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 truncate text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</div>
                {hasEvolution && (<div className={`flex shrink-0 items-center gap-0.5 text-[12px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}><span>{isPositive ? '▲' : '▼'}</span><span>{evolutionDisplay}</span></div>)}
              </div>
              <div className="mt-0.5 truncate text-[14px] font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          </div>
        </div>);
      })}
    </div>
  </div>);
};

export default SortiesStats;