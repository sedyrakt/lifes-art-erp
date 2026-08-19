// ============================================================
// src/components/employes/EmployesPaiementModal/ConfirmModal.tsx
// ============================================================

import React from 'react';
import {
  DollarSign,
  X,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';

import { formatMoney } from '../../../lib/formatMoney';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employe: any;
  paiementMois: number;
  paiementAnnee: number;
  paiementMontant: number;
  moisLabels: string[];
  theme: any;
  themeIsDark: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  employe,
  paiementMois,
  paiementAnnee,
  paiementMontant,
  moisLabels,
  theme,
}) => {
  if (!isOpen) return null;

  const initials =
    `${employe?.prenom?.charAt(0) || ''}${employe?.nom?.charAt(0) || ''}`
      .toUpperCase() || '?';

  return (
    <div
      className="
        fixed
        inset-0
        z-[100000]
        flex
        items-center
        justify-center
        p-4
        bg-slate-950/75
        backdrop-blur-md
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >

      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          shadow-[0_30px_90px_rgba(0,0,0,.5)]
        "
        style={{
          background: theme.card,
          borderColor: theme.border,
        }}
      >

        {/* HEADER */}
        <div
          className="px-5 py-4 border-b"
          style={{
            background: theme.headerBg,
            borderColor: theme.border,
          }}
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: theme.primaryBg,
                  color: theme.primary,
                  border: `1px solid ${theme.primaryBorder}`,
                }}
              >
                <DollarSign className="w-5 h-5" />
              </div>

              <div>
                <h3
                  id="confirm-modal-title"
                  className="text-[15px] font-extrabold"
                  style={{ color: theme.text }}
                >
                  Confirmer le paiement
                </h3>

                <p
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: theme.muted }}
                >
                  Vérifiez les informations avant validation
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                w-8 h-8
                rounded-lg
                flex items-center justify-center
                transition-all
                hover:bg-rose-500/10
                hover:text-rose-500
              "
              style={{ color: theme.muted }}
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* BODY */}
        <div className="p-5">

          {/* employee */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{
              background: theme.inputBg,
              borderColor: theme.border,
            }}
          >

            <div
              className="
                w-10 h-10
                rounded-xl
                flex items-center justify-center
                font-extrabold
                text-xs
                shrink-0
              "
              style={{
                background:
                  'linear-gradient(135deg,#6366F1,#7C3AED)',
                color: '#fff',
              }}
            >
              {initials}
            </div>

            <div className="min-w-0">

              <p
                className="text-sm font-extrabold truncate"
                style={{ color: theme.text }}
              >
                {employe.prenom} {employe.nom}
              </p>

              <p
                className="text-[11px] font-medium truncate"
                style={{ color: theme.muted }}
              >
                {employe.poste || 'Employé'}
              </p>

            </div>

          </div>

          {/* period */}
          <div
            className="mt-3 flex items-center justify-between p-3 rounded-xl border"
            style={{
              background: theme.inputBg,
              borderColor: theme.border,
            }}
          >

            <div className="flex items-center gap-2">

              <CalendarDays
                className="w-4 h-4"
                style={{ color: theme.primary }}
              />

              <span
                className="text-xs font-semibold"
                style={{ color: theme.muted }}
              >
                Période
              </span>

            </div>

            <span
              className="text-xs font-extrabold"
              style={{ color: theme.text }}
            >
              {moisLabels[paiementMois - 1]} {paiementAnnee}
            </span>

          </div>

          {/* amount */}
          <div
            className="
              mt-3
              p-5
              rounded-xl
              border
              text-center
            "
            style={{
              background: `${theme.green}08`,
              borderColor: `${theme.green}35`,
            }}
          >

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
              "
              style={{ color: theme.muted }}
            >
              Montant à verser
            </p>

            <p
              className="mt-2 text-2xl font-black tracking-tight"
              style={{ color: theme.green }}
            >
              {formatMoney(
                paiementMontant ||
                employe.salaire ||
                0
              )}
            </p>

            <div
              className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold"
              style={{ color: theme.green }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Vérification avant validation
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-2.5 mt-5">

            <button
              type="button"
              onClick={onClose}
              className="
                h-10
                px-5
                rounded-xl
                border
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                transition-all
                hover:opacity-80
              "
              style={{
                background: theme.inputBg,
                borderColor: theme.border,
                color: theme.muted,
              }}
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="
                h-10
                px-6
                rounded-xl
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-white
                transition-all
                hover:-translate-y-0.5
              "
              style={{
                background:
                  'linear-gradient(135deg,#6366F1,#7C3AED)',
                boxShadow:
                  '0 8px 22px rgba(99,102,241,.3)',
              }}
            >
              Confirmer le paiement
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;