// ============================================================
// src/components/employes/EmployesPaiementModal.tsx
// ⭐ PREMIUM PRO LAYOUT
// ⭐ FIX: Tsy misy espace vide lehibe intsony amin'ny colonne gauche
// ⭐ FIX: Sidebar gauche full-height
// ⭐ FIX: Contenu droite voalamina tsara
// ⭐ FIX: Stats → Période → Montant/Mode → Observation
// ⭐ FIX: Footer fixe sy propre
// ============================================================

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';

import {
  PaiementModalHeader,
  PaiementStatsCards,
  PaiementEmployeeInfo,
  PaiementPeriodSelector,
  PaiementAmountInput,
  PaiementActions,
  PaiementConfirmModal,
} from './EmployesPaiementModal/index';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employe: any;
  historiquePaiements: any[];
  imageUrl: string | null;

  paiementMois: number;
  paiementAnnee: number;
  paiementMontant: number;
  paiementMode: string;
  paiementObservation: string;

  onMoisChange: (mois: number) => void;
  onAnneeChange: (annee: number) => void;
  onMontantChange: (montant: number) => void;

  onPayer: (
    mois: number,
    annee: number,
    montant: number,
    mode: string,
    obs: string
  ) => void;

  getMoisPourAnnee: (
    dateEmbauche: string,
    annee: number,
    labels?: string[]
  ) => {
    mois: number;
    annee: number;
    label: string;
  }[];

  moisLabels: string[];
  moisLabelsCourt: string[];
  isDark?: boolean;
}

const EmployesPaiementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  employe,
  historiquePaiements,
  imageUrl,

  paiementMois,
  paiementAnnee,
  paiementMontant,
  paiementMode: initialMode,
  paiementObservation: initialObservation,

  onMoisChange,
  onAnneeChange,
  onMontantChange,
  onPayer,

  getMoisPourAnnee,
  moisLabels,

  isDark: isDarkProp,
}) => {
  const { isDark: themeIsDark } = useTheme();

  const isDark =
    isDarkProp !== undefined ? isDarkProp : themeIsDark;

  const [modePaiement, setModePaiement] = useState(
    initialMode || 'Espèces'
  );

  const [observation, setObservation] = useState(
    initialObservation || ''
  );

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // ==========================================================
  // RESET LOCAL STATE
  // ==========================================================

  useEffect(() => {
    if (isOpen) {
      setModePaiement(initialMode || 'Espèces');
      setObservation(initialObservation || '');
      setIsConfirmOpen(false);
    }
  }, [
    isOpen,
    initialMode,
    initialObservation,
  ]);

  // ==========================================================
  // ESC KEY
  // ==========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isConfirmOpen) {
          setIsConfirmOpen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isConfirmOpen, onClose]);

  // ==========================================================
  // LOCK BODY SCROLL
  // ==========================================================

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // ==========================================================
  // GUARD
  // ==========================================================

  if (!isOpen || !employe) {
    return null;
  }

  // ==========================================================
  // PAYMENT STATUS
  // ==========================================================

  const estPaye = historiquePaiements.some(
    (p) =>
      Number(p?.mois) === Number(paiementMois) &&
      Number(p?.annee) === Number(paiementAnnee)
  );

  const totalPaye = historiquePaiements.reduce(
    (sum, p) => sum + Number(p?.montant || 0),
    0
  );

  const anneeEmbauche = employe?.date_embauche
    ? new Date(employe.date_embauche).getFullYear()
    : new Date().getFullYear();

  // ==========================================================
  // MONTH HELPERS
  // ==========================================================

  const isMoisPaye = (
    mois: number,
    annee: number
  ) => {
    return historiquePaiements.some(
      (p) =>
        Number(p?.mois) === Number(mois) &&
        Number(p?.annee) === Number(annee)
    );
  };

  const isMoisFutur = (
    mois: number,
    annee: number
  ) => {
    const today = new Date();

    const date = new Date(
      annee,
      mois - 1,
      1
    );

    date.setMonth(date.getMonth() + 1);

    return date > today;
  };

  const isMoisAvantEmbauche = (
    mois: number,
    annee: number
  ) => {
    if (!employe?.date_embauche) {
      return false;
    }

    const embauche = new Date(
      employe.date_embauche
    );

    const date = new Date(
      annee,
      mois - 1,
      1
    );

    date.setMonth(date.getMonth() + 1);

    return date <= embauche;
  };

  // ==========================================================
  // THEME
  // ==========================================================

  const theme = {
    card: isDark
      ? '#0B1324'
      : '#FFFFFF',

    cardSecondary: isDark
      ? '#0F1A2E'
      : '#F8FAFC',

    border: isDark
      ? '#293A54'
      : '#E2E8F0',

    borderStrong: isDark
      ? '#344765'
      : '#CBD5E1',

    headerBg: isDark
      ? '#0D1729'
      : '#F8FAFC',

    text: isDark
      ? '#F8FAFC'
      : '#0F172A',

    muted: isDark
      ? '#94A3B8'
      : '#64748B',

    primary: '#6366F1',

    primaryBg: isDark
      ? 'rgba(99,102,241,0.14)'
      : 'rgba(99,102,241,0.08)',

    primaryBorder: isDark
      ? 'rgba(99,102,241,0.35)'
      : 'rgba(99,102,241,0.20)',

    inputBg: isDark
      ? '#111D31'
      : '#F8FAFC',

    red: isDark
      ? '#F87171'
      : '#EF4444',

    amber: isDark
      ? '#FBBF24'
      : '#F59E0B',

    green: isDark
      ? '#34D399'
      : '#10B981',
  };

  // ==========================================================
  // HANDLE PAYMENT
  // ==========================================================

  const handlePayer = () => {
    if (estPaye) {
      onClose();
      return;
    }

    if (!paiementMontant || paiementMontant <= 0) {
      return;
    }

    setIsConfirmOpen(true);
  };

  // ==========================================================
  // HANDLE CONFIRM
  // ==========================================================

  const handleConfirm = () => {
    setIsConfirmOpen(false);

    onPayer(
      paiementMois,
      paiementAnnee,
      paiementMontant,
      modePaiement,
      observation
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[99990]
        flex
        items-center
        justify-center
        p-3
        sm:p-5
      "
      style={{
        background: isDark
          ? 'rgba(2, 6, 23, 0.82)'
          : 'rgba(15, 23, 42, 0.62)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          if (!isConfirmOpen) {
            onClose();
          }
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paiement-modal-title"
    >
      {/* ======================================================
          MAIN MODAL
      ====================================================== */}

      <div
        className="
          relative
          w-full
          max-w-[1120px]
          h-[92vh]
          sm:h-[90vh]
          rounded-2xl
          border
          overflow-hidden
          flex
          flex-col
        "
        style={{
          background: theme.card,
          borderColor: theme.borderStrong,

          boxShadow: isDark
            ? '0 30px 90px rgba(0,0,0,0.55)'
            : '0 30px 90px rgba(15,23,42,0.22)',
        }}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <PaiementModalHeader
          onClose={onClose}
          employe={employe}
          theme={theme}
          themeIsDark={isDark}
        />

        {/* ====================================================
            BODY
        ==================================================== */}

        <div
          className="
            flex-1
            min-h-0
            overflow-hidden
          "
        >
          <div
            className="
              h-full
              grid
              grid-cols-1
              lg:grid-cols-[270px_minmax(0,1fr)]
            "
          >
            {/* ==================================================
                LEFT SIDEBAR
            ================================================== */}

            <aside
              className="
                hidden
                lg:flex
                flex-col
                border-r
                min-h-0
              "
              style={{
                borderColor: theme.border,
                background: theme.headerBg,
              }}
            >
              <div className="flex-1 overflow-y-auto p-4">
                <PaiementEmployeeInfo
                  employe={employe}
                  imageUrl={imageUrl}
                  theme={theme}
                  themeIsDark={isDark}
                />
              </div>

              {/* SIDEBAR FOOT INFO */}
              <div
                className="
                  shrink-0
                  border-t
                  px-4
                  py-3
                "
                style={{
                  borderColor: theme.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: theme.muted }}
                  >
                    Période
                  </span>

                  <span
                    className="
                      px-2.5
                      py-1
                      rounded-lg
                      text-xs
                      font-bold
                      border
                    "
                    style={{
                      background: theme.primaryBg,
                      borderColor: theme.primaryBorder,
                      color: theme.primary,
                    }}
                  >
                    {moisLabels[paiementMois - 1] || '—'}{' '}
                    {paiementAnnee}
                  </span>
                </div>
              </div>
            </aside>

            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main
              className="
                min-w-0
                min-h-0
                overflow-y-auto
              "
            >
              <div className="p-4 sm:p-5 space-y-4">

                {/* =================================================
                    MOBILE EMPLOYEE INFO
                ================================================= */}

                <div className="lg:hidden">
                  <PaiementEmployeeInfo
                    employe={employe}
                    imageUrl={imageUrl}
                    theme={theme}
                    themeIsDark={isDark}
                  />
                </div>

                {/* =================================================
                    STATS
                ================================================= */}

                <PaiementStatsCards
                  employe={employe}
                  totalPaye={totalPaye}
                  historiquePaiements={historiquePaiements}
                  paiementAnnee={paiementAnnee}
                  getMoisPourAnnee={getMoisPourAnnee}
                  theme={theme}
                  themeIsDark={isDark}
                />

                {/* =================================================
                    PERIOD
                ================================================= */}

                <PaiementPeriodSelector
                  employe={employe}
                  paiementMois={paiementMois}
                  paiementAnnee={paiementAnnee}
                  anneeEmbauche={anneeEmbauche}
                  historiquePaiements={historiquePaiements}
                  isMoisPaye={isMoisPaye}
                  isMoisFutur={isMoisFutur}
                  isMoisAvantEmbauche={isMoisAvantEmbauche}
                  onMoisClick={(mois, annee) => {
                    onMoisChange(mois);
                    onAnneeChange(annee);
                  }}
                  onAnneeChange={onAnneeChange}
                  getMoisPourAnnee={getMoisPourAnnee}
                  moisLabels={moisLabels}
                  theme={theme}
                  themeIsDark={isDark}
                />

                {/* =================================================
                    PAYMENT INPUTS
                ================================================= */}

                <div
                  className="
                    grid
                    grid-cols-1
                    xl:grid-cols-2
                    gap-4
                  "
                >
                  <PaiementAmountInput
                    paiementMontant={paiementMontant}
                    employe={employe}
                    estPaye={estPaye}
                    onMontantChange={onMontantChange}
                    theme={theme}
                  />

                  {/* MODE DE PAIEMENT */}

                  <div
                    className="
                      rounded-xl
                      border
                      overflow-hidden
                    "
                    style={{
                      background: theme.cardSecondary,
                      borderColor: theme.border,
                    }}
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        px-4
                        py-3
                        border-b
                      "
                      style={{
                        borderColor: theme.border,
                        background: theme.headerBg,
                      }}
                    >
                      <div
                        className="
                          w-7
                          h-7
                          rounded-lg
                          flex
                          items-center
                          justify-center
                        "
                        style={{
                          background: theme.primaryBg,
                          color: theme.primary,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="14"
                            rx="2"
                          />
                          <path d="M3 10h18" />
                        </svg>
                      </div>

                      <div>
                        <p
                          className="
                            text-[11px]
                            font-bold
                            uppercase
                            tracking-wider
                          "
                          style={{
                            color: theme.text,
                          }}
                        >
                          Mode de paiement
                        </p>

                        <p
                          className="text-[10px] mt-0.5"
                          style={{
                            color: theme.muted,
                          }}
                        >
                          Choisissez le mode utilisé
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      <select
                        value={modePaiement}
                        onChange={(e) =>
                          setModePaiement(e.target.value)
                        }
                        disabled={estPaye}
                        className="
                          w-full
                          h-11
                          px-3
                          rounded-lg
                          border
                          outline-none
                          text-sm
                          font-semibold
                          transition-all
                        "
                        style={{
                          background: theme.inputBg,
                          borderColor: theme.borderStrong,
                          color: theme.text,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            theme.primary;
                          e.currentTarget.style.boxShadow =
                            `0 0 0 3px ${theme.primary}20`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            theme.borderStrong;
                          e.currentTarget.style.boxShadow =
                            'none';
                        }}
                      >
                        <option value="Espèces">
                          Espèces
                        </option>

                        <option value="Virement">
                          Virement
                        </option>

                        <option value="Chèque">
                          Chèque
                        </option>

                        <option value="Mobile Money">
                          Mobile Money
                        </option>

                        <option value="Carte bancaire">
                          Carte bancaire
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    OBSERVATION
                ================================================= */}

                <div
                  className="
                    rounded-xl
                    border
                    overflow-hidden
                  "
                  style={{
                    background: theme.cardSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      px-4
                      py-3
                      border-b
                    "
                    style={{
                      borderColor: theme.border,
                      background: theme.headerBg,
                    }}
                  >
                    <div
                      className="
                        w-7
                        h-7
                        rounded-lg
                        flex
                        items-center
                        justify-center
                      "
                      style={{
                        background: theme.primaryBg,
                        color: theme.primary,
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                    </div>

                    <div>
                      <p
                        className="
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wider
                        "
                        style={{
                          color: theme.text,
                        }}
                      >
                        Observation
                      </p>

                      <p
                        className="text-[10px] mt-0.5"
                        style={{
                          color: theme.muted,
                        }}
                      >
                        Informations complémentaires
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <textarea
                      value={observation}
                      onChange={(e) =>
                        setObservation(e.target.value)
                      }
                      disabled={estPaye}
                      rows={3}
                      placeholder="Observation facultative..."
                      className="
                        w-full
                        min-h-[82px]
                        px-3
                        py-3
                        rounded-lg
                        border
                        outline-none
                        resize-none
                        text-sm
                        font-medium
                        transition-all
                      "
                      style={{
                        background: theme.inputBg,
                        borderColor: theme.borderStrong,
                        color: theme.text,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          theme.primary;
                        e.currentTarget.style.boxShadow =
                          `0 0 0 3px ${theme.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          theme.borderStrong;
                        e.currentTarget.style.boxShadow =
                          'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div
          className="
            shrink-0
            border-t
            px-4
            sm:px-5
            py-3
            flex
            items-center
            justify-end
          "
          style={{
            borderColor: theme.border,
            background: theme.headerBg,
          }}
        >
          <PaiementActions
            estPaye={estPaye}
            onClose={onClose}
            onPayerClick={handlePayer}
            theme={theme}
            themeIsDark={isDark}
          />
        </div>
      </div>

      {/* ========================================================
          CONFIRM MODAL
      ======================================================== */}

      <PaiementConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        employe={employe}
        paiementMois={paiementMois}
        paiementAnnee={paiementAnnee}
        paiementMontant={paiementMontant}
        moisLabels={moisLabels}
        theme={theme}
        themeIsDark={isDark}
      />
    </div>,
    document.body
  );
};

export default EmployesPaiementModal;