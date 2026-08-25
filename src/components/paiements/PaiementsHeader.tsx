// ============================================================
// src/components/paiements/PaiementsHeader.tsx
// ⭐ PREMIUM PAIEMENTS HEADER
// ⭐ FIX: Misy ny onAddPaiement mivantana
// ⭐ FIX: Console.log mba hahitana raha mandeha ny clique
// ============================================================

import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PaiementsHeaderProps {
  onAddPaiement: () => void;
}

const PaiementsHeader: React.FC<PaiementsHeaderProps> = ({ onAddPaiement }) => {
  const { isDark } = useTheme();
  const theme = isDark ? 'dark' : 'light';

  const handleAddClick = () => {
    console.log('🟢 Clic sur "Nouveau paiement" détecté!');
    console.log('🔍 onAddPaiement:', onAddPaiement);
    if (onAddPaiement) {
      onAddPaiement();
    } else {
      console.error('🔴 onAddPaiement tsy misy!');
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {/* TITLE */}
      <div className="min-w-0">
        <h1 className="text-[20px] font-bold tracking-tight text-slate-900 dark:text-white">
          Gestion des paiements
        </h1>
        <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
          Suivez les paiements et rémunérations des employés.
        </p>
      </div>

      {/* BUTTON */}
      <button
        type="button"
        onClick={handleAddClick}
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <Plus size={16} strokeWidth={2} />
        Nouveau paiement
      </button>
    </div>
  );
};

export default PaiementsHeader;