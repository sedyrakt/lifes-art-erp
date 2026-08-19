// ============================================================
// src/components/company/CompanySettingsModal/CompanySettingsActions.tsx
// ⭐ UNIFIED DESIGN
// ============================================================

import React from 'react';
import { Save, FileDown, Loader2 } from 'lucide-react';

const COLORS = {
  light: {
    border: '#E2E8F0',
  },
  dark: {
    border: '#334155',
  },
};

interface CompanySettingsActionsProps {
  isGenerateMode: boolean;
  loading: boolean;
  savingImage: boolean;
  isDark: boolean;
  onClose: () => void;
  onSave: () => void;
  onGenerate: () => void;
}

const CompanySettingsActions: React.FC<CompanySettingsActionsProps> = ({
  isGenerateMode,
  loading,
  savingImage,
  isDark,
  onClose,
  onSave,
  onGenerate,
}) => {
  const theme = isDark ? COLORS.dark : COLORS.light;
  const isBusy = loading || savingImage;

  return (
    <div
      className="flex-shrink-0 flex items-center justify-end gap-2.5 px-5 py-3.5 border-t"
      style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: theme.border }}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isBusy}
        className="inline-flex h-9 items-center justify-center rounded-lg border px-3.5 text-[14px] font-medium transition-all duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          borderColor: isDark ? '#334155' : '#E2E8F0',
          background: isDark ? '#0F172A' : '#FFFFFF',
          color: isDark ? '#CBD5E1' : '#5F6368',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = isDark ? '#1E293B' : '#F1F3F4';
          e.currentTarget.style.color = isDark ? '#F8FAFC' : '#202124';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isDark ? '#0F172A' : '#FFFFFF';
          e.currentTarget.style.color = isDark ? '#CBD5E1' : '#5F6368';
        }}
      >
        Annuler
      </button>

      {isGenerateMode ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={isBusy}
          className="inline-flex h-9 min-w-[105px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              <span>{savingImage ? 'Sauvegarde...' : 'Génération...'}</span>
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" strokeWidth={2} />
              <span>Générer</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSave}
          disabled={isBusy}
          className="inline-flex h-9 min-w-[115px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              <span>{savingImage ? 'Sauvegarde...' : 'Enregistrement...'}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" strokeWidth={2} />
              <span>Enregistrer</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CompanySettingsActions;