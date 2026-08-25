// ============================================================
// src/components/employes/EmployesPaiementModal/ConfirmModal.tsx
// ⭐ COMPACT + FONT SIZE 13px MIN, 15px MAX
// ============================================================

import React from 'react';
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
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border shadow-[0_30px_90px_rgba(0,0,0,.5)]"
        style={{
          background: theme.card,
          borderColor: theme.border,
        }}
      >
        {/* HEADER */}
        <div
          className="px-4 py-3 border-b"
          style={{
            background: theme.headerBg,
            borderColor: theme.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                id="confirm-modal-title"
                className="text-[15px] font-extrabold"
                style={{ color: theme.text }}
              >
                Confirmer le paiement
              </h3>
              <p
                className="text-[13px] font-medium mt-0.5"
                style={{ color: theme.muted }}
              >
                Vérifiez les informations
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-rose-500/10 hover:text-rose-500"
              style={{ color: theme.muted }}
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

        {/* BODY */}
        <div className="p-4">
          {/* employee */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{
              background: theme.inputBg,
              borderColor: theme.border,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-[13px] shrink-0"
              style={{
                background: 'linear-gradient(135deg,#6366F1,#7C3AED)',
                color: '#fff',
              }}
            >
              {initials}
            </div>

            <div className="min-w-0">
              <p
                className="text-[14px] font-extrabold truncate"
                style={{ color: theme.text }}
              >
                {employe.prenom} {employe.nom}
              </p>
              <p
                className="text-[13px] font-medium truncate"
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
            <span
              className="text-[13px] font-semibold"
              style={{ color: theme.muted }}
            >
              Période
            </span>
            <span
              className="text-[13px] font-extrabold"
              style={{ color: theme.text }}
            >
              {moisLabels[paiementMois - 1]} {paiementAnnee}
            </span>
          </div>

          {/* amount */}
          <div
            className="mt-3 p-4 rounded-xl border text-center"
            style={{
              background: `${theme.green}08`,
              borderColor: `${theme.green}35`,
            }}
          >
            <p
              className="text-[13px] font-bold uppercase tracking-[0.14em]"
              style={{ color: theme.muted }}
            >
              Montant à verser
            </p>
            <p
              className="mt-1 text-[15px] font-black tracking-tight"
              style={{ color: theme.green }}
            >
              {formatMoney(
                paiementMontant ||
                employe.salaire ||
                0
              )}
            </p>
            <p
              className="mt-1 text-[13px] font-semibold"
              style={{ color: theme.green }}
            >
              Vérification avant validation
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border text-[13px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
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
              className="h-9 px-5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg,#6366F1,#7C3AED)',
                boxShadow: '0 8px 22px rgba(99,102,241,.3)',
              }}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;