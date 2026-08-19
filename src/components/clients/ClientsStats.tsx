// src/components/clients/ClientsStats.tsx
import React from 'react';
import { Users, User, Building, Phone, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ClientsStatsProps { 
  totalClients: number; 
  particuliers: number; 
  entreprises: number; 
  tauxContact: number; 
  refreshing?: boolean; 
}

const safeNumber = (value: unknown): number => { 
  const n = Number(value); 
  return Number.isFinite(n) ? n : 0; 
};

const ClientsStats: React.FC<ClientsStatsProps> = ({ 
  totalClients, 
  particuliers, 
  entreprises, 
  tauxContact, 
  refreshing = false 
}) => {
  const { isDark } = useTheme();
  
  const stats = [
    { label: 'Total Clients', value: safeNumber(totalClients).toLocaleString('fr-FR'), icon: Users, iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
    { label: 'Particuliers', value: safeNumber(particuliers).toLocaleString('fr-FR'), icon: User, iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { label: 'Entreprises', value: safeNumber(entreprises).toLocaleString('fr-FR'), icon: Building, iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
    { label: 'Taux de contact', value: `${safeNumber(tauxContact)}%`, icon: Phone, iconClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400' },
  ];

  const cardBorder = isDark ? 'border-slate-700' : 'border-slate-300';
  const cardHoverBorder = isDark ? 'hover:border-slate-600' : 'hover:border-slate-400';

  return (
    <div className="relative mb-5">
      {refreshing && (
        <div className={`absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-full border ${isDark ? 'border-slate-700 bg-[#0F172A]' : 'border-slate-300 bg-white'} px-3 py-1.5 text-indigo-600 dark:text-indigo-400 shadow-lg animate-pulse`}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Mise à jour...</span>
        </div>
      )}
      
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`group relative min-h-[80px] rounded-lg border ${cardBorder} ${cardHoverBorder} bg-white dark:bg-[#111c30] px-4 py-3.5 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 ring-1 ring-transparent hover:ring-indigo-500/30 shadow-[0_1px_2px_rgba(15,23,42,0.03)]`}
            >
              {/* ⭐ FIX: Accent bar eo ankavia rehefa hover (tahaka ny CategoriesStats) */}
              <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-indigo-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
              
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  {/* ⭐ FIX: Text-[18px] ho an'ny valeur, text-[14px] ho an'ny label */}
                  <div className="text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {stat.value}
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

export default ClientsStats;