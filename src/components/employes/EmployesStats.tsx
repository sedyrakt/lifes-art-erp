// src/components/employes/EmployesStats.tsx
import React from 'react';
import { Users, DollarSign, UserCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';

interface EmployesStatsProps { totalItems: number; totalSalaire: number; actifs: number; tauxActif: number; evolutionTotal?: number; evolutionSalaire?: number; evolutionActifs?: number; evolutionTaux?: number; }
const safeNumber = (value: unknown): number => { const n = Number(value); return Number.isFinite(n) ? n : 0; };

const EmployesStats: React.FC<EmployesStatsProps> = ({ totalItems, totalSalaire, actifs, tauxActif, evolutionTotal = 0, evolutionSalaire = 0, evolutionActifs = 0, evolutionTaux = 0 }) => {
  const safeTotalItems = safeNumber(totalItems); const safeTotalSalaire = safeNumber(totalSalaire); const safeActifs = safeNumber(actifs); const safeTauxActif = safeNumber(tauxActif);
  const stats = [
    { label: 'Total employés', value: safeTotalItems.toLocaleString('fr-FR'), icon: Users, evolution: safeNumber(evolutionTotal), iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400', accentClass: 'bg-indigo-500' },
    { label: 'Masse salariale', value: formatMoney(safeTotalSalaire), icon: DollarSign, evolution: safeNumber(evolutionSalaire), iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', accentClass: 'bg-emerald-500' },
    { label: 'Employés actifs', value: safeActifs.toLocaleString('fr-FR'), icon: UserCheck, evolution: safeNumber(evolutionActifs), iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400', accentClass: 'bg-violet-500' },
    { label: "Taux d'activité", value: `${safeTauxActif.toFixed(2)}%`, icon: TrendingUp, evolution: safeNumber(evolutionTaux), iconClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400', accentClass: 'bg-cyan-500' },
  ];
  return (<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {stats.map((stat) => {
      const Icon = stat.icon; const hasEvolution = stat.evolution !== 0; const isPositive = stat.evolution > 0;
      return (<div key={stat.label} className="group relative min-h-[80px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111c30] px-4 py-3.5 transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 ring-1 ring-transparent hover:ring-indigo-500/30">
        <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${stat.accentClass} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}><Icon size={20} strokeWidth={2} /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</span>
              {hasEvolution && (<span className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[12px] font-bold leading-none ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>{isPositive ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}{Math.abs(stat.evolution).toFixed(1)}%</span>)}
            </div>
            <div className="mt-0.5 truncate text-[14px] font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
          </div>
        </div>
      </div>);
    })}
  </div>);
};
export default EmployesStats;