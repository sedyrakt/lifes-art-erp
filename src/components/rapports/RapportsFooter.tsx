// ============================================================
// src/components/rapports/RapportsFooter.tsx - SYNCED DESIGN
// ⭐ FIX: Background sy border namboarina mba hitovy amin'ny Dashboard Cards
// ============================================================

import React from 'react'; 
import { Package, DollarSign, ShoppingCart, Activity } from 'lucide-react'; 
import { useTheme } from '../../contexts/ThemeContext';

interface RapportsFooterProps { 
  totalProduits: number; 
  chiffreAffaires: number; 
  totalVentes: number; 
  formatMoney: (value: number) => string; 
}

const RapportsFooter: React.FC<RapportsFooterProps> = ({ 
  totalProduits, 
  chiffreAffaires, 
  totalVentes, 
  formatMoney 
}) => {
  const { isDark } = useTheme(); 
  const borderColor = isDark ? 'border-white/[0.055]' : 'border-slate-200';
  const currentDate = new Date(); 
  const formattedDate = currentDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); 
  const formattedTime = currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  return (
    <footer className={`mt-6 border-t ${borderColor} py-3.5 bg-white dark:bg-[#0F172A] transition-colors`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Mise à jour : {formattedDate} à {formattedTime}</span>
          <span className="hidden h-3.5 w-px bg-slate-200 dark:bg-slate-700 md:block" />
          <span className="hidden md:inline text-slate-400 dark:text-slate-500">Données en temps réel</span>
        </div>
        <div className="flex items-center flex-wrap gap-1.5">
          <div className={`group inline-flex items-center gap-1.5 rounded-lg border ${borderColor} bg-white dark:bg-[#0F172A] px-2.5 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5`}>
            <Package size={14} strokeWidth={2} className="text-indigo-500 dark:text-indigo-400" />
            <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{totalProduits.toLocaleString('fr-FR')}</span>
            <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">produits</span>
          </div>
          <div className={`group inline-flex items-center gap-1.5 rounded-lg border ${borderColor} bg-white dark:bg-[#0F172A] px-2.5 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5`}>
            <DollarSign size={14} strokeWidth={2} className="text-indigo-500 dark:text-indigo-400" />
            <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{formatMoney(chiffreAffaires)}</span>
            <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">CA</span>
          </div>
          <div className={`group inline-flex items-center gap-1.5 rounded-lg border ${borderColor} bg-white dark:bg-[#0F172A] px-2.5 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5`}>
            <ShoppingCart size={14} strokeWidth={2} className="text-indigo-500 dark:text-indigo-400" />
            <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{totalVentes.toLocaleString('fr-FR')}</span>
            <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">ventes</span>
          </div>
          <div className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border ${borderColor} bg-indigo-50/70 dark:bg-indigo-500/10 px-2.5 py-1.5`}>
            <Activity size={13} strokeWidth={2} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[13px] font-semibold text-indigo-700 dark:text-indigo-300">Temps réel</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default RapportsFooter;