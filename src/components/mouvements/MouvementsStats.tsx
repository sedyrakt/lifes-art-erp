// src/components/mouvements/MouvementsStats.tsx
import React from 'react';
import { FileText, ArrowDown, ArrowUp, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface MouvementsStatsProps { total: number; entrees: number; sorties: number; ajustements: number; quantiteEntree: number; quantiteSortie: number; refreshing?: boolean; onRefresh?: () => void; filtreActif?: string; onSelectFiltre?: (filtre: string) => void; }

const MouvementsStats: React.FC<MouvementsStatsProps> = ({ total, entrees, sorties, ajustements, quantiteEntree, quantiteSortie, refreshing: propRefreshing = false, onSelectFiltre, filtreActif = '' }) => {
  const { isDark } = useTheme();
  const cardBorder = isDark ? 'border-white/[0.08]' : 'border-slate-300';
  const cardHoverBorder = isDark ? 'hover:border-indigo-400/30' : 'hover:border-indigo-300';
  const cardBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const selectedBorder = isDark ? 'border-indigo-400' : 'border-indigo-500';
  const selectedBackground = isDark ? 'bg-indigo-500/[0.10]' : 'bg-indigo-50/70';

  const stats = [
    { key: '', label: 'Total Mouvements', value: total, quantiteValue: null, icon: FileText, iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
    { key: 'ENTREE', label: 'Entrées', value: entrees, quantiteValue: quantiteEntree, icon: ArrowDown, iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { key: 'SORTIE', label: 'Sorties', value: sorties, quantiteValue: quantiteSortie, icon: ArrowUp, iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
    { key: 'AJUSTEMENT', label: 'Ajustements', value: ajustements, quantiteValue: null, icon: AlertCircle, iconClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' },
  ];

  return (<div className="relative mb-5">
    {propRefreshing && (<div className={`absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-lg animate-pulse ${isDark ? 'border-white/[0.08] bg-[#0F172A] text-indigo-400' : 'border-slate-300 bg-white text-indigo-600'}`}><Loader2 className="h-3.5 w-3.5 animate-spin" /><span className="text-xs font-bold uppercase tracking-wider">Mise à jour...</span></div>)}
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const isSelected = filtreActif === stat.key; const isFilterCard = stat.key !== '';
        return (<div key={stat.key} onClick={() => onSelectFiltre?.(stat.key)} className={`group relative min-h-[80px] cursor-pointer overflow-hidden rounded-lg border px-4 py-3.5 shadow-sm transition-all duration-200 ring-1 ring-transparent ${isSelected && isFilterCard ? `${selectedBorder} ${selectedBackground} shadow-sm` : `${cardBorder} ${cardBackground} ${cardHoverBorder} hover:shadow-md`} hover:ring-indigo-500/20`}>
          <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full transition-all duration-200 ${isSelected && isFilterCard ? 'bg-indigo-500 opacity-100' : 'bg-indigo-500 opacity-0 group-hover:opacity-100'}`} />
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${isDark ? 'border-white/[0.04]' : 'border-slate-200'} ${stat.iconClass}`}><stat.icon size={20} strokeWidth={2} /></div>
            <div className="min-w-0 flex-1"><div className="text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</div><div className="mt-0.5 truncate text-[14px] font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>{stat.quantiteValue !== null && (<div className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">{Number(stat.quantiteValue || 0).toLocaleString('fr-FR')} unité{stat.quantiteValue > 1 ? 's' : ''}</div>)}</div>
          </div>
        </div>);
      })}
    </div>
    <style>{`@media (prefers-color-scheme: light) { .mouvements-stats-card { border-color: #cbd5e1; } }`}</style>
  </div>);
};
export default MouvementsStats;