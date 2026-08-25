// src/components/commandes/CommandesStats.tsx
import React from 'react';
import { FileText, Clock, Truck, DollarSign, Loader2, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CommandesStatsProps { 
  total: number; 
  enAttente: number; 
  livrees: number; 
  totalCA: number; 
  totalItems?: number; 
  evolutionTotal?: number; 
  evolutionEnAttente?: number; 
  evolutionLivrees?: number; 
  evolutionCA?: number; 
  evolutionItems?: number; 
  refreshing?: boolean; 
}

const safeNumber = (value: unknown): number => { 
  const number = Number(value); 
  return Number.isFinite(number) ? number : 0; 
};

const CommandesStats: React.FC<CommandesStatsProps> = ({ 
  total, 
  enAttente, 
  livrees, 
  totalCA, 
  totalItems = 0, 
  evolutionTotal = 0, 
  evolutionEnAttente = 0, 
  evolutionLivrees = 0, 
  evolutionCA = 0, 
  evolutionItems = 0, 
  refreshing = false 
}) => {
  // ⭐ FIX: Format Ariary tsotra (tsy mampiasa formatMoney)
  const formattedCA = `${safeNumber(totalCA).toLocaleString('fr-FR')} Ar`;
  
  const stats = [
    { label: 'Total commandes', value: safeNumber(total).toLocaleString('fr-FR'), icon: FileText, evolution: safeNumber(evolutionTotal), iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
    { label: 'En attente', value: safeNumber(enAttente).toLocaleString('fr-FR'), icon: Clock, evolution: safeNumber(evolutionEnAttente), iconClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
    { label: 'Livrées', value: safeNumber(livrees).toLocaleString('fr-FR'), icon: Truck, evolution: safeNumber(evolutionLivrees), iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { label: 'CA total', value: formattedCA, icon: DollarSign, evolution: safeNumber(evolutionCA), iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
    { label: 'Articles vendus', value: safeNumber(totalItems).toLocaleString('fr-FR'), icon: Package, evolution: safeNumber(evolutionItems), iconClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' },
  ];

  return (
    <div className="relative mb-5 w-full">
      {refreshing && (
        <div className="absolute right-0 top-0 z-20 flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-indigo-600 shadow-sm dark:border-slate-700 dark:bg-[#0F172A] dark:text-indigo-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Mise à jour...</span>
        </div>
      )}

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const hasEvolution = stat.evolution !== 0;
          const isPositive = stat.evolution > 0;

          return (
            <div 
              key={stat.label} 
              className="group relative min-h-[80px] rounded-lg border border-slate-300 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 ring-1 ring-transparent hover:ring-indigo-500/30 dark:border-slate-700 dark:bg-[#111c30] dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
            >
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}>
                  <Icon size={20} strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 truncate text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      {stat.value}
                    </span>

                    {hasEvolution && (
                      <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
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

export default CommandesStats;