// src/components/produits/ProduitsStats.tsx
import React from 'react';
import { Box, Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface ProduitsStatsProps { 
  totalItems: number; 
  totalStock: number; 
  alertes: number; 
  totalValeur?: number | string; 
}

const safeNumber = (value: unknown): number => { 
  const n = Number(value); 
  return Number.isFinite(n) ? n : 0; 
};

const ProduitsStats: React.FC<ProduitsStatsProps> = ({ 
  totalItems, 
  totalStock, 
  alertes, 
  totalValeur = 0 
}) => {
  // ⭐ FIX: Format Ariary tsotra (tsy mampiasa formatMoney)
  const formattedValeur = typeof totalValeur === 'number' 
    ? `${safeNumber(totalValeur).toLocaleString('fr-FR')} Ar` 
    : totalValeur || '0 Ar';
  
  const stats = [
    { label: 'Valeur du stock', value: formattedValeur, icon: TrendingUp, iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400', accentClass: 'bg-indigo-500' },
    { label: 'Produits', value: safeNumber(totalItems).toLocaleString('fr-FR'), icon: Package, iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400', accentClass: 'bg-indigo-500' },
    { label: 'Stock total', value: safeNumber(totalStock).toLocaleString('fr-FR'), icon: Box, iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400', accentClass: 'bg-indigo-500' },
    { label: 'Alertes stock', value: safeNumber(alertes).toLocaleString('fr-FR'), icon: AlertTriangle, iconClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', accentClass: 'bg-amber-500' },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label} 
            className={`group relative min-h-[80px] rounded-lg border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[#111c30] dark:shadow-[0_1px_3px_rgba(0,0,0,0.18)] px-4 py-3.5 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:shadow-[0_3px_8px_rgba(15,23,42,0.08)] dark:hover:border-slate-600 dark:hover:bg-slate-800/50 dark:hover:shadow-[0_3px_10px_rgba(0,0,0,0.18)] ring-1 ring-transparent hover:ring-indigo-500/15 dark:hover:ring-indigo-400/10`}
          >
            <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${stat.accentClass} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
            
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}>
                <Icon size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                {/* ⭐ FIX: text-[18px] ho an'ny valeur, text-[14px] ho an'ny label */}
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[14px] font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProduitsStats;