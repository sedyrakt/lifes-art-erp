// ============================================================
// src/components/rapports/RapportsSummary.tsx - SYNCED DESIGN
// ⭐ FIX: Endrika sy layout mitovy tanteraka amin'ny "Alertes & Notifications"
// ⭐ FIX: Font sizes 14px/13px (tsy nohena)
// ============================================================
import React from 'react';
import { ClipboardList, TrendingUp, ArrowUp, ArrowDown, Target, Users, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface RapportsSummaryProps { 
  stats: { 
    chiffreAffaires: number; 
    totalEntrees: number; 
    totalSorties: number; 
    benefice: number; 
    nbClients: number; 
  }; 
  formatMoney: (value: number) => string; 
}

const RapportsSummary: React.FC<RapportsSummaryProps> = ({ stats, formatMoney }) => {
  const { isDark } = useTheme();
  const borderColor = isDark ? 'border-white/[0.055]' : 'border-slate-200';
  const cardBg = isDark ? 'bg-[#111c30]' : 'bg-white';
  const shadow = isDark ? 'shadow-[0_12px_40px_rgba(0,0,0,0.18)]' : 'shadow-[0_1px_2px_rgba(15,23,42,0.04)]';
  
  const ratio = stats.chiffreAffaires > 0 ? (stats.benefice / stats.chiffreAffaires) * 100 : 0;
  const ratioFormatted = ratio.toFixed(2);
  const beneficePositif = stats.benefice >= 0;

  // ⭐ Liste toy ny "Alertes & Notifications"
  const rows = [
    { 
      key: 'ca', 
      title: "Chiffre d'affaires", 
      subtitle: 'Montant total des ventes', 
      value: formatMoney(stats.chiffreAffaires), 
      icon: TrendingUp, 
      iconBg: 'bg-indigo-500/[0.10] text-indigo-400' 
    },
    { 
      key: 'entrees', 
      title: 'Total entrées', 
      subtitle: 'Mouvements entrants', 
      value: stats.totalEntrees.toLocaleString('fr-FR'), 
      icon: ArrowUp, 
      iconBg: 'bg-emerald-500/[0.10] text-emerald-400' 
    },
    { 
      key: 'sorties', 
      title: 'Total sorties', 
      subtitle: 'Mouvements sortants', 
      value: stats.totalSorties.toLocaleString('fr-FR'), 
      icon: ArrowDown, 
      iconBg: 'bg-rose-500/[0.10] text-rose-400' 
    },
    { 
      key: 'ratio', 
      title: 'Ratio bénéfice / ventes', 
      subtitle: 'Performance globale', 
      value: `${ratioFormatted}%`, 
      icon: Target, 
      iconBg: 'bg-violet-500/[0.10] text-violet-400' 
    },
    { 
      key: 'clients', 
      title: 'Nombre de clients', 
      subtitle: 'Base de données clients', 
      value: stats.nbClients.toLocaleString('fr-FR'), 
      icon: Users, 
      iconBg: 'bg-slate-500/[0.10] text-slate-400' 
    },
  ];

  return (
    <div className={`relative h-full overflow-hidden rounded-xl border ${borderColor} ${cardBg} ${shadow}`}>
      <div className="relative">
        
        {/* HEADER (15px) */}
        <div className={`flex items-center justify-between border-b ${borderColor} px-4 py-3.5`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <ClipboardList size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Résumé financier</h2>
              <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Synthèse des indicateurs</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[13px] font-medium text-emerald-400 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />À jour
          </div>
        </div>

        {/* LISTE DES ROWS (Tahaka ny Alertes) */}
        <div className="px-4 py-3 space-y-3">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.key} className={`flex items-center justify-between gap-3 border-b ${borderColor} pb-3 last:border-b-0 last:pb-0`}>
                
                {/* Gauche: Icon + Text */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${row.iconBg}`}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-200">{row.title}</p>
                    <p className="mt-0.5 truncate text-[13px] text-slate-500 dark:text-slate-400">{row.subtitle}</p>
                  </div>
                </div>

                {/* Droite: Value */}
                <span className="shrink-0 text-[14px] font-semibold text-slate-700 dark:text-slate-100">
                  {row.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* BÉNÉFICE NET (Card mitovy amin'ny Dashboard) */}
        <div className={`mx-4 mb-4 p-4 rounded-xl border ${beneficePositif ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${beneficePositif ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <DollarSign size={15} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Bénéfice net</div>
                <div className="text-[13px] text-slate-500 dark:text-slate-400">Résultat après déduction des sorties</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`text-[15px] font-bold tracking-tight ${beneficePositif ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatMoney(stats.benefice)}
              </span>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full ${beneficePositif ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {beneficePositif ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RapportsSummary;