// src/components/fournisseurs/FournisseursStats.tsx
import React from 'react';
import { Building, User, Mail, Phone } from 'lucide-react';

interface FournisseursStatsProps { total: number; avecContact: number; avecEmail: number; tauxContact: number; }

const FournisseursStats: React.FC<FournisseursStatsProps> = ({ total, avecContact, avecEmail, tauxContact }) => {
  const stats = [
    { label: 'Total fournisseurs', value: total, icon: Building, iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400', accentClass: 'bg-indigo-500' },
    { label: 'Avec contact', value: avecContact, icon: User, iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', accentClass: 'bg-emerald-500' },
    { label: 'Avec email', value: avecEmail, icon: Mail, iconClass: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400', accentClass: 'bg-violet-500' },
    { label: 'Taux de contact', value: `${tauxContact}%`, icon: Phone, iconClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400', accentClass: 'bg-cyan-500' },
  ];
  return (<div className="mb-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {stats.map((stat) => (<div key={stat.label} className="group relative min-h-[80px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111c30] px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:shadow-[0_2px_6px_rgba(15,23,42,0.05)] dark:hover:border-slate-600 dark:hover:bg-slate-800/50 dark:hover:shadow-none ring-1 ring-transparent hover:ring-indigo-500/30">
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${stat.accentClass}`} />
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}><stat.icon size={20} strokeWidth={2} /></div>
        <div className="min-w-0"><div className="text-[18px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</div><div className="mt-0.5 truncate text-[14px] font-medium text-slate-500 dark:text-slate-400">{stat.label}</div></div>
      </div>
    </div>))}
  </div>);
};
export default FournisseursStats;