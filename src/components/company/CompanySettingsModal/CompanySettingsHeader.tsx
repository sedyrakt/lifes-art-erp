// ============================================================
// src/components/company/CompanySettingsModal/CompanySettingsHeader.tsx
// ⭐ UNIFIED DESIGN
// ============================================================

import React from 'react';
import { X, Building2, FilePlus2 } from 'lucide-react';

const COLORS = {
  light: {
    text: '#202124',
    muted: '#5F6368',
    border: '#E2E8F0',
  },
  dark: {
    text: '#F8FAFC',
    muted: '#CBD5E1',
    border: '#334155',
  },
};

interface CompanySettingsHeaderProps {
  isGenerateMode: boolean;
  isDark: boolean;
  onClose: () => void;
}

const CompanySettingsHeader: React.FC<CompanySettingsHeaderProps> = ({
  isGenerateMode,
  isDark,
  onClose,
}) => {
  const theme = isDark ? COLORS.dark : COLORS.light;

  const title = isGenerateMode ? 'Générer la facture' : "Informations de l'entreprise";
  const description = isGenerateMode
    ? 'Renseignez les informations nécessaires pour la facture'
    : 'Configurez les informations utilisées sur vos factures';

  return (
    <header
      className="relative flex-shrink-0 flex items-center justify-between px-5 sm:px-6 py-3.5 border-b z-10"
      style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: theme.border }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500" />

      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
          style={{ borderColor: theme.border, background: isDark ? '#0F172A' : '#F8FAFC' }}
        >
          <img src="/logo.png" alt="Logo" className="h-7 w-auto max-w-[30px] object-contain" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              style={{ background: isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF', color: '#6366F1' }}
            >
              {isGenerateMode ? <FilePlus2 size={14} strokeWidth={2} /> : <Building2 size={14} strokeWidth={2} />}
            </div>
            <h2 id="company-settings-modal-title" className="truncate text-[16px] font-semibold tracking-tight" style={{ color: theme.text }}>
              {title}
            </h2>
          </div>
          <p className="mt-1 truncate text-[13px] font-medium" style={{ color: theme.muted }}>{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        title="Fermer"
        className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        style={{ color: theme.muted }}
      >
        <X size={18} strokeWidth={2} />
      </button>
    </header>
  );
};

export default CompanySettingsHeader;