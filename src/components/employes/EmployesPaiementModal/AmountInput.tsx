// ============================================================
// src/components/employes/EmployesPaiementModal/AmountInput.tsx
// ⭐ COMPACT - FONT SIZE 13px MIN, 15px MAX
// ============================================================

import React from 'react';
import { LockKeyhole } from 'lucide-react';

interface AmountInputProps {
  paiementMontant: number;
  employe: any;
  estPaye: boolean;
  onMontantChange: (montant: number) => void;
  theme: any;
}

const AmountInput: React.FC<AmountInputProps> = ({
  paiementMontant,
  employe,
  estPaye,
  onMontantChange,
  theme,
}) => {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: theme.border,
        background: theme.card,
      }}
    >
      <div
        className="px-3 py-2.5 border-b flex items-center justify-between"
        style={{
          background: theme.headerBg,
          borderColor: theme.border,
        }}
      >
        <div className="flex items-center gap-2">
          <div>
            <p
              className="text-[13px] font-bold uppercase tracking-wider"
              style={{ color: theme.text }}
            >
              Montant du paiement
              <span className="text-rose-500 ml-1">*</span>
            </p>
            <p
              className="text-[13px] font-medium mt-0.5"
              style={{ color: theme.muted }}
            >
              Montant à verser
            </p>
          </div>
        </div>

        {estPaye && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[13px] font-bold uppercase"
            style={{
              color: theme.green,
              background: `${theme.green}12`,
              borderColor: `${theme.green}35`,
            }}
          >
            <LockKeyhole className="w-3 h-3" />
            Verrouillé
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="relative">
          <div
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
          >
            <span
              className="text-[15px] font-extrabold"
              style={{ color: theme.primary }}
            >
              Ar
            </span>
          </div>

          <input
            type="number"
            value={paiementMontant || ''}
            onChange={e => {
              const val = e.target.value;
              onMontantChange(
                val === '' ? 0 : parseFloat(val) || 0
              );
            }}
            disabled={estPaye}
            placeholder={String(employe.salaire || 0)}
            className="
              w-full
              h-12
              pl-11
              pr-3
              rounded-xl
              border
              outline-none
              text-[15px]
              font-extrabold
              tracking-tight
              transition-all
              disabled:opacity-60
            "
            style={{
              background: theme.inputBg,
              borderColor: theme.border,
              color: theme.text,
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = theme.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}18`;
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label="Montant du salaire"
          />
        </div>
      </div>
    </div>
  );
};

export default AmountInput;