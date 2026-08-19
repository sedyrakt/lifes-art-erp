// ============================================================
// src/components/paiements/PaiementsHeader.tsx - UNIFIED DESIGN
// ⭐ FANITSARA: Nohavaozina ny bouton mba ho indigo
// ============================================================

import React from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PaiementsHeaderProps {
  onAddPaiement: () => void;
}

const PaiementsHeader: React.FC<PaiementsHeaderProps> = ({ onAddPaiement }) => {
  const { isDark } = useTheme();

  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <CreditCard size={22} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Gestion des paiements</h1>
        </div>
        <p className="text-[14px] text-slate-500 dark:text-slate-400">Suivez les paiements et rémunérations des employés.</p>
      </div>
      
      <button 
        onClick={onAddPaiement}
        className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[14px] font-medium text-white transition-all active:scale-[0.98] shadow-sm"
      >
        <Plus size={18} />Nouveau paiement
      </button>
    </div>
  );
};

export default PaiementsHeader;