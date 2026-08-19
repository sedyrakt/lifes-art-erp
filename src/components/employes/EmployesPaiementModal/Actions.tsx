// ============================================================
// src/components/employes/EmployesPaiementModal/Actions.tsx
// ============================================================

import React from 'react';
import {
  CheckCircle2,
  X,
} from 'lucide-react';

interface ActionsProps {
  estPaye: boolean;
  onClose: () => void;
  onPayerClick: () => void;
  theme: any;
  themeIsDark: boolean;
}

const Actions: React.FC<ActionsProps> = ({
  estPaye,
  onClose,
  onPayerClick,
  theme,
}) => {
  return (
    <div
      className="
        flex
        flex-col-reverse
        sm:flex-row
        sm:items-center
        sm:justify-end
        gap-2.5
        pt-5
        border-t
      "
      style={{
        borderColor: theme.border,
      }}
    >

      <button
        type="button"
        onClick={onClose}
        className="
          h-10
          px-5
          rounded-xl
          border
          text-[11px]
          font-bold
          uppercase
          tracking-wider
          transition-all
          hover:opacity-80
          inline-flex
          items-center
          justify-center
          gap-2
        "
        style={{
          background: theme.inputBg,
          borderColor: theme.border,
          color: theme.muted,
        }}
      >
        <X className="w-3.5 h-3.5" />
        Annuler
      </button>

      <button
        type="button"
        onClick={onPayerClick}
        disabled={estPaye}
        className="
          h-10
          px-6
          rounded-xl
          text-[11px]
          font-bold
          uppercase
          tracking-wider
          text-white
          inline-flex
          items-center
          justify-center
          gap-2
          transition-all
          shadow-lg
          disabled:opacity-45
          disabled:cursor-not-allowed
          hover:-translate-y-0.5
        "
        style={{
          background:
            'linear-gradient(135deg,#6366F1,#7C3AED)',
          boxShadow:
            '0 8px 24px rgba(99,102,241,.28)',
        }}
      >
        <CheckCircle2 className="w-4 h-4" />

        {estPaye
          ? 'Déjà payé'
          : 'Payer le salaire'}
      </button>

    </div>
  );
};

export default Actions;