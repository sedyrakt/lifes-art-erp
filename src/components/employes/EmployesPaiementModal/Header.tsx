// ============================================================
// src/components/employes/EmployesPaiementModal/Header.tsx
// ⭐ COMPACT + FONT SIZE 13px-15px
// ⭐ FIX: Nesorina ny icons rehetra
// ⭐ FIX: Nesorina ny image/avatar
// ============================================================

import React from 'react';

interface HeaderProps {
  onClose: () => void;
  employe: any;
  theme: {
    card: string;
    border: string;
    headerBg: string;
    text: string;
    muted: string;
    primary: string;
    primaryBg: string;
    primaryBorder: string;
    inputBg: string;
    red: string;
    amber: string;
    green: string;
  };
  themeIsDark: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onClose,
  employe,
  theme,
}) => {
  return (
    <div
      className="flex-shrink-0 px-4 py-3 border-b"
      style={{
        background: theme.headerBg,
        borderColor: theme.border,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2
              id="paiement-modal-title"
              className="text-[15px] font-extrabold tracking-tight truncate"
              style={{ color: theme.text }}
            >
              Paiement du salaire
            </h2>
            <span
              className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-bold uppercase tracking-wider border"
              style={{
                color: theme.green,
                background: `${theme.green}12`,
                borderColor: `${theme.green}35`,
              }}
            >
              Paie
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
            <span
              className="text-[13px] font-semibold"
              style={{ color: theme.muted }}
            >
              {employe.prenom} {employe.nom}
            </span>
            <span
              className="hidden sm:block"
              style={{ color: theme.border }}
            >
              •
            </span>
            <span
              className="text-[13px] font-semibold"
              style={{ color: theme.primary }}
            >
              {employe.poste || 'Employé'}
            </span>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 shrink-0"
          style={{
            color: theme.muted,
            borderColor: theme.border,
          }}
          aria-label="Fermer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;