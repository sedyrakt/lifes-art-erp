// ============================================================
// src/components/dashboard/DashboardFooter.tsx - VERSION SELLORA
// ⭐ DESIGN: Indigo / Violet professionnel
// ⭐ PALETTE: Primary #6366F1, Secondary #7C3AED
// ⭐ AFFICHAGE: Dernière mise à jour, produits, valeur stock, unités totales
// ⭐ DARK MODE: Intégré
// ============================================================

import React from 'react';
import { Package, DollarSign, Boxes } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

// ============================================================
// ⭐ COLORS - SELLORA (INDIGO/VIOLET)
// ============================================================
const COLORS = {
  light: {
    border: '#E2E8F0',
    muted: '#64748B',
    primary: '#6366F1',          // ⭐ Indigo
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    gold: '#D4A84F',
    amber: '#F59E0B',
    emerald: '#10B981',
    red: '#EF4444',
    violet: '#7C3AED',
    purple: '#8B5CF6',
  },
  dark: {
    border: '#334155',
    muted: '#94A3B8',
    primary: '#6366F1',          // ⭐ Indigo
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    gold: '#D4A84F',
    amber: '#F59E0B',
    emerald: '#10B981',
    red: '#EF4444',
    violet: '#7C3AED',
    purple: '#8B5CF6',
  }
};

interface DashboardFooterProps {
  lastUpdate: Date;
  totalProduits: number;
  valeurStock: number;
  stockTotal: number;
}

const DashboardFooter: React.FC<DashboardFooterProps> = ({
  lastUpdate,
  totalProduits,
  valeurStock,
  stockTotal,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <div className="mt-6 text-center text-xs border-t pt-4"
      style={{ color: colors.muted, borderColor: colors.border }}>
      <p>Dernière mise à jour: {lastUpdate.toLocaleString('fr-FR')} • Données en temps réel</p>
      <p className="mt-1 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <Package className="w-3 h-3" style={{ color: colors.primary }} />
          {totalProduits} produits
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" style={{ color: colors.primary }} />
          {formatMoney(valeurStock)}
        </span>
        <span className="flex items-center gap-1">
          <Boxes className="w-3 h-3" style={{ color: colors.primary }} />
          {stockTotal} unités
        </span>
      </p>
    </div>
  );
};

export default DashboardFooter;