// ============================================================
// src/components/employes/EmployesPaiementModal/Header.tsx
// ============================================================

import React from 'react';
import {
  DollarSign,
  X,
  UserRound,
  BriefcaseBusiness,
} from 'lucide-react';

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
  const initials =
    `${employe?.prenom?.charAt(0) || ''}${employe?.nom?.charAt(0) || ''}`
      .toUpperCase() || '?';

  return (
    <div
      className="flex-shrink-0 px-5 sm:px-6 py-4 border-b"
      style={{
        background: theme.headerBg,
        borderColor: theme.border,
      }}
    >
      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-3.5 min-w-0">

          {/* ICON */}
          <div
            className="
              w-11 h-11
              rounded-xl
              border
              flex items-center justify-center
              shrink-0
            "
            style={{
              background: theme.primaryBg,
              borderColor: theme.primaryBorder,
              color: theme.primary,
            }}
          >
            <DollarSign className="w-5 h-5" />
          </div>

          {/* EMPLOYEE AVATAR */}
          <div
            className="
              hidden sm:flex
              w-11 h-11
              rounded-xl
              items-center justify-center
              font-extrabold
              text-sm
              border
              shrink-0
            "
            style={{
              background:
                'linear-gradient(135deg,#6366F1,#7C3AED)',
              borderColor: 'rgba(129,140,248,.35)',
              color: '#FFFFFF',
              boxShadow:
                '0 5px 18px rgba(99,102,241,.25)',
            }}
          >
            {initials}
          </div>

          <div className="min-w-0">

            <div className="flex items-center gap-2">
              <h2
                id="paiement-modal-title"
                className="
                  text-[16px]
                  sm:text-[17px]
                  font-extrabold
                  tracking-tight
                  truncate
                "
                style={{ color: theme.text }}
              >
                Paiement du salaire
              </h2>

              <span
                className="
                  hidden sm:inline-flex
                  items-center
                  px-2 py-0.5
                  rounded-full
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  border
                "
                style={{
                  color: theme.green,
                  background: `${theme.green}12`,
                  borderColor: `${theme.green}35`,
                }}
              >
                Paie
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">

              <span
                className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: theme.muted }}
              >
                <UserRound className="w-3.5 h-3.5" />
                {employe.prenom} {employe.nom}
              </span>

              <span
                className="hidden sm:block"
                style={{ color: theme.border }}
              >
                •
              </span>

              <span
                className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: theme.primary }}
              >
                <BriefcaseBusiness className="w-3.5 h-3.5" />
                {employe.poste || 'Employé'}
              </span>

            </div>
          </div>
        </div>

        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="
            w-9 h-9
            rounded-xl
            border
            flex items-center justify-center
            transition-all
            duration-200
            hover:bg-rose-500/10
            hover:border-rose-500/30
            hover:text-rose-500
            shrink-0
          "
          style={{
            color: theme.muted,
            borderColor: theme.border,
          }}
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

export default Header;