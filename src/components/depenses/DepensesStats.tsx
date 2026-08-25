// src/components/depenses/DepensesStats.tsx
import React from 'react';
import { TrendingDown, FileText, DollarSign, Building, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DepensesStatsProps { 
  total: number; 
  nb: number; 
  moyenne: number; 
  nbFournisseurs: number; 
  totalItems?: number; // ⭐ NAMPIANA
  evolutionTotal?: number; 
  evolutionNb?: number; 
  evolutionMoyenne?: number; 
  evolutionFournisseurs?: number; 
  refreshing?: boolean; 
}

const safeNumber = (value: unknown): number => { 
  const number = Number(value); 
  return Number.isFinite(number) ? number : 0; 
};

const DepensesStats: React.FC<DepensesStatsProps> = ({ 
  total, 
  nb, 
  moyenne, 
  nbFournisseurs, 
  totalItems, 
  evolutionTotal = 0, 
  evolutionNb = 0, 
  evolutionMoyenne = 0, 
  evolutionFournisseurs = 0, 
  refreshing = false 
}) => {
  
  // ⭐ FIX: Mampiasa ny totalItems raha misy, fa raha tsy misy dia ny nb no ampiasaina
  const displayNb = totalItems !== undefined ? totalItems : safeNumber(nb);

  // ⭐ FIX: Format Ariary tsotra (tsy mampiasa formatMoney)
  const formattedTotal = `${safeNumber(total).toLocaleString('fr-FR')} Ar`;
  const formattedMoyenne = `${safeNumber(moyenne).toLocaleString('fr-FR')} Ar`;

  const stats = [
    { label: 'Total Dépenses', value: formattedTotal, icon: TrendingDown, evolution: safeNumber(evolutionTotal), iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
    { label: 'Nombre', value: displayNb.toLocaleString('fr-FR'), icon: FileText, evolution: safeNumber(evolutionNb), iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { label: 'Moyenne', value: formattedMoyenne, icon: DollarSign, evolution: safeNumber(evolutionMoyenne), iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
    { label: 'Fournisseurs', value: safeNumber(nbFournisseurs).toLocaleString('fr-FR'), icon: Building, evolution: safeNumber(evolutionFournisseurs), iconClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' },
  ];

  return (
    <div className="relative mb-5 w-full">
      {refreshing && (
        <div className="absolute right-0 top-0 z-20 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-indigo-600 shadow-sm animate-pulse dark:border-slate-700 dark:bg-[#0F172A] dark:text-indigo-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Mise à jour...</span>
        </div>
      )}

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const hasEvolution = stat.evolution !== 0;
          const isPositive = stat.evolution > 0;

          return (
            <div 
              key={stat.label} 
              className="group relative min-h-[80px] rounded-lg border border-slate-300 bg-white px-4 py-3.5 shadow-sm ring-1 ring-transparent transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:ring-indigo-500/20 dark:border-slate-700 dark:bg-[#111c30] dark:hover:border-slate-600 dark:hover:bg-slate-800/50 dark:hover:ring-indigo-500/30"
            >
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}>
                  <Icon size={20} strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <div className="min-w-0 truncate text-[18px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
                      {stat.value}
                    </div>

                    {hasEvolution && (
                      <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-none ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                        {isPositive ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
                        {Math.abs(stat.evolution).toFixed(1)}%
                      </span>
                    )}
                  </div>

                  <div className="mt-0.5 truncate text-[14px] font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepensesStats;