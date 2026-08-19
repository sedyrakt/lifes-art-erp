// ============================================================
// src/components/employes/EmployesHeader.tsx
// ⭐ FANITSARA: Nesoriko ny bokotra "Statistiques" (BarChart3) sy ny onOpenStats
// ============================================================

import React from 'react';
import { Plus, RefreshCw, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  light: {
    text: '#0F172A',
    muted: '#64748B',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryLight: '#818CF8',
    card: '#FFFFFF',
    border: '#E2E8F0',
    primaryBg: 'rgba(99,102,241,0.08)',
  },
  dark: {
    text: '#F8FAFC',
    muted: '#94A3B8',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryLight: '#818CF8',
    card: '#1E293B',
    border: '#334155',
    primaryBg: 'rgba(99,102,241,0.15)',
  }
};

interface EmployesHeaderProps {
  onAddEmploye: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const EmployesHeader: React.FC<EmployesHeaderProps> = ({ 
  onAddEmploye, 
  refreshing = false,
  onRefresh 
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  const borderStyle = isDark 
    ? `1px solid rgba(255,255,255,0.08)` 
    : `1px solid ${theme.border}`;

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 rounded-2xl border shadow-sm transition-all duration-300" style={{ background: theme.card, border: borderStyle }}>
        
        {/* ⭐ TITLE: 15px */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0" style={{ background: theme.primaryBg, color: theme.primary }}>
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-[15px] font-black tracking-tight" style={{ color: theme.text }}>
              Gestion des employés
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: theme.muted }}>
              Gérez votre équipe en temps réel
            </p>
          </div>
        </div>
        
        {/* ⭐ 2 BOUTONS SUR UNE SEULE LIGNE */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-nowrap">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl shadow-sm transition-all duration-200 text-[11px] font-bold uppercase tracking-wider border disabled:opacity-50 whitespace-nowrap"
              style={{ background: theme.card, color: theme.text, borderColor: theme.border }}
              aria-label="Actualiser les employés"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          )}

          <button 
            onClick={onAddEmploye}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 text-[11px] font-bold uppercase tracking-wider text-white hover:opacity-90 whitespace-nowrap"
            style={{ background: theme.primary }}
            aria-label="Ajouter un employé"
          >
            <Plus size={15} />
            <span>Ajouter un employé</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployesHeader;