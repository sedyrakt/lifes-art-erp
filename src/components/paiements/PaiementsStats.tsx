// ============================================================
// src/components/paiements/PaiementsStats.tsx
// ============================================================
// ⭐ PREMIUM PAIEMENTS STATS
// ⭐ DARK + LIGHT MODE
// ⭐ FONT SIZE MITOVY (18px valeur, 14px label)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE GRID
// ============================================================

import React from 'react';
import { DollarSign, Receipt, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PaiementsStatsProps {
  totalPaiements: number;
  nbPaiements: number;
  employesPayes: number;
}

const PaiementsStats: React.FC<PaiementsStatsProps> = ({ totalPaiements, nbPaiements, employesPayes }) => {
  const { isDark } = useTheme();

  // ⭐ BORDER SYSTEM (identique à CategoriesTable)
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-200';
  const hoverBorderColor = isDark ? 'hover:border-white/[0.22]' : 'hover:border-slate-300';
  const cardBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const hoverBackground = isDark ? 'dark:hover:bg-slate-800/50' : 'hover:bg-slate-50';

  // ⭐ FIX: Format Ariary tsotra (tsy mampiasa formatMoney)
  const formattedTotal = `${Number(totalPaiements || 0).toLocaleString('fr-FR')} Ar`;

  const stats = [
    {
      label: 'Total payé',
      value: formattedTotal,
      subValue: `${Number(nbPaiements || 0).toLocaleString('fr-FR')} paiement${Number(nbPaiements || 0) > 1 ? 's' : ''}`,
      icon: DollarSign,
      iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      accentClass: 'bg-emerald-500',
    },
    {
      label: 'Nombre de paiements',
      value: Number(nbPaiements || 0).toLocaleString('fr-FR'),
      subValue: 'Paiements enregistrés',
      icon: Receipt,
      iconClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      accentClass: 'bg-blue-500',
    },
    {
      label: 'Employés payés',
      value: Number(employesPayes || 0).toLocaleString('fr-FR'),
      subValue: 'Employés concernés',
      icon: Users,
      iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
      accentClass: 'bg-violet-500',
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group relative min-h-[80px] overflow-hidden rounded-xl border ${borderColor} ${cardBackground} ${hoverBackground} px-4 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-[1px] ${hoverBorderColor} hover:shadow-md`}
        >
          <div
            className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${stat.accentClass} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
          />
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass} transition-transform duration-200 group-hover:scale-105`}
            >
              <stat.icon size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {stat.value}
                </span>
              </div>
              <div className="mt-0.5 truncate text-[14px] font-medium text-slate-600 dark:text-slate-400">
                {stat.label}
              </div>
              {stat.subValue && (
                <div className="mt-0.5 truncate text-[14px] font-medium text-slate-400 dark:text-slate-500">
                  {stat.subValue}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaiementsStats;