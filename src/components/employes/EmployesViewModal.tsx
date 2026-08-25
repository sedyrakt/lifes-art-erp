// ============================================================
// src/components/employes/EmployesViewModal.tsx
// ⭐ PREMIUM EMPLOYÉ VIEW MODAL
// ⭐ STYLE UNIFIÉ AVEC ACHATS / DEPENSES
// ⭐ INDIGO THEME + DARK/LIGHT MODE
// ⭐ BORDER MANIFI - PREMIUM
// ⭐ GRID 3 COLONNES
// ⭐ TYPOGRAPHIE COMPACTE ET LISIBLE
// ⭐ ICONS UNIQUEMENT DANS LES BOUTONS
// ============================================================

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, DollarSign, Edit, History } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: {
    card: '#FFFFFF',
    header: '#FFFFFF',
    footer: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSoft: '#F8FAFC',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    text: '#0F172A',
    muted: '#64748B',
    subMuted: '#94A3B8',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primarySoft: 'rgba(99,102,241,0.08)',
    primaryBorder: 'rgba(99,102,241,0.18)',
    green: '#059669',
    greenBg: 'rgba(16,185,129,0.10)',
    greenBorder: 'rgba(16,185,129,0.25)',
    red: '#DC2626',
    redBg: 'rgba(239,68,68,0.08)',
    redBorder: 'rgba(239,68,68,0.20)',
    amber: '#D97706',
    amberBg: 'rgba(245,158,11,0.10)',
    amberBorder: 'rgba(245,158,11,0.25)',
  },
  dark: {
    card: '#0F172A',
    header: '#0F172A',
    footer: '#0F172A',
    surface: '#0F172A',
    surfaceSoft: '#111827',
    border: '#334155',
    borderStrong: '#475569',
    text: '#F8FAFC',
    muted: '#94A3B8',
    subMuted: '#64748B',
    primary: '#818CF8',
    primaryHover: '#6366F1',
    primarySoft: 'rgba(99,102,241,0.12)',
    primaryBorder: 'rgba(99,102,241,0.25)',
    green: '#34D399',
    greenBg: 'rgba(16,185,129,0.14)',
    greenBorder: 'rgba(52,211,153,0.28)',
    red: '#F87171',
    redBg: 'rgba(239,68,68,0.12)',
    redBorder: 'rgba(248,113,113,0.25)',
    amber: '#FBBF24',
    amberBg: 'rgba(245,158,11,0.12)',
    amberBorder: 'rgba(251,191,36,0.25)',
  },
};

interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  date_embauche: string;
  salaire: number;
  image: string;
  status: string;
  created_at: string;
}

interface EmployesViewModalProps {
  employe: Employe | null;
  imageUrl: string | null;
  onClose: () => void;
  onEdit: () => void;
  onHistorique?: () => void;
  getStatusColor?: (status: string) => string;
  getStatusIcon?: (status: string) => React.ReactNode;
  isDark?: boolean;
}

interface FormCellProps {
  label: string;
  children: React.ReactNode;
  borderRight?: boolean;
  borderBottom?: boolean;
  fullWidth?: boolean;
}

const FormCell: React.FC<FormCellProps> = ({
  label,
  children,
  borderRight = true,
  borderBottom = true,
  fullWidth = false,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark
    ? 'border-white/[0.06]'
    : 'border-slate-200';

  return (
    <div
      className={[
        'flex min-w-0 items-center px-3 py-2.5',
        borderRight ? `border-r ${borderClass}` : '',
        borderBottom ? `border-b ${borderClass}` : '',
        fullWidth ? 'col-span-3' : '',
      ].join(' ')}
      style={{ background: theme.card }}
    >
      <div className="min-w-0 flex-1">
        <div
          className="mb-0.5 truncate text-[12px] font-normal uppercase tracking-[0.045em]"
          style={{ color: theme.muted }}
        >
          {label || ' '}
        </div>

        <div className="min-w-0 text-[14px] font-normal leading-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const EmployesViewModal: React.FC<EmployesViewModalProps> = ({
  employe,
  imageUrl,
  onClose,
  onEdit,
  onHistorique,
  isDark: isDarkProp,
}) => {
  const { isDark: contextIsDark } = useTheme();

  const isDark =
    isDarkProp !== undefined ? isDarkProp : contextIsDark;

  const theme = isDark ? COLORS.dark : COLORS.light;

  const [isVisible, setIsVisible] = useState(false);

  const borderClass = isDark
    ? 'border-white/[0.06]'
    : 'border-slate-200';

  useEffect(() => {
    if (!employe) {
      setIsVisible(false);
      return;
    }

    const timer = window.setTimeout(
      () => setIsVisible(true),
      10
    );

    return () => window.clearTimeout(timer);
  }, [employe]);

  useEffect(() => {
    if (!employe) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [employe]);

  useEffect(() => {
    if (!employe) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
  }, [employe, onClose]);

  if (!employe) return null;

  const getInitiales = (
    prenom: string,
    nom: string
  ): string => {
    const first =
      prenom?.trim()?.charAt(0)?.toUpperCase() || '?';

    const last =
      nom?.trim()?.charAt(0)?.toUpperCase() || '';

    return `${first}${last}`;
  };

  const formatDate = (
    dateStr: string
  ): string => {
    if (!dateStr) return 'N/A';

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };

  const formatDateTime = (
    dateStr: string
  ): string => {
    if (!dateStr) return 'N/A';

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const normalizeStatus = (
    status: string
  ): string =>
    String(status || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

  const getStatusTheme = (
    status: string
  ) => {
    switch (normalizeStatus(status)) {
      case 'inactif':
        return {
          background: theme.redBg,
          borderColor: theme.redBorder,
          color: theme.red,
        };

      case 'en_conge':
      case 'en congé':
        return {
          background: theme.amberBg,
          borderColor: theme.amberBorder,
          color: theme.amber,
        };

      case 'actif':
      default:
        return {
          background: theme.greenBg,
          borderColor: theme.greenBorder,
          color: theme.green,
        };
    }
  };

  const getStatusLabel = (
    status?: string
  ): string => {
    const normalized =
      normalizeStatus(status || 'actif');

    if (normalized === 'inactif') {
      return 'Inactif';
    }

    if (
      normalized === 'en_conge' ||
      normalized === 'en congé'
    ) {
      return 'En congé';
    }

    return 'Actif';
  };

  const statusTheme =
    getStatusTheme(employe.status);

  const initiales = getInitiales(
    employe.prenom,
    employe.nom
  );

  const salaireMensuel =
    Number(employe.salaire) || 0;

  const salaireAnnuel =
    salaireMensuel * 12;

  const fullName =
    `${employe.prenom || ''} ${employe.nom || ''}`
      .trim();

  const handleOverlayMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={[
        'fixed inset-0 z-[999999] flex items-center justify-center',
        'p-3 sm:p-5',
        'transition-opacity duration-200',
        isVisible
          ? 'opacity-100'
          : 'opacity-0',
      ].join(' ')}
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="employe-view-modal-title"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className={[
          'relative flex w-full max-w-4xl max-h-[85vh]',
          'flex-col overflow-hidden rounded-2xl border',
          'shadow-[0_24px_80px_rgba(0,0,0,0.24)]',
          'transition-all duration-200',
          isVisible
            ? 'translate-y-0 scale-100'
            : 'translate-y-2 scale-[0.985]',
          borderClass,
        ].join(' ')}
        style={{
          background: theme.card,
        }}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* TOP INDIGO LINE */}
        <div
          className="absolute left-0 right-0 top-0 z-30 h-[3px]"
          style={{
            background: theme.primary,
          }}
        />

        {/* ====================================================
            HEADER
        ==================================================== */}
        <header
          className={[
            'flex shrink-0 items-center justify-between',
            'gap-4 border-b px-4 py-3 sm:px-5',
            borderClass,
          ].join(' ')}
          style={{
            background: theme.header,
          }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
              style={{
                background:
                  theme.primarySoft,
                borderColor:
                  theme.primaryBorder,
                  color: theme.primary,
              }}
            >
              <User
                className="h-4 w-4"
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2
                  id="employe-view-modal-title"
                  className="truncate text-[15px] font-semibold tracking-tight"
                  style={{
                    color: theme.text,
                  }}
                >
                  Détails de l'employé
                </h2>

                <span
                  className="hidden shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium sm:inline-flex"
                  style={{
                    color: statusTheme.color,
                    background:
                      statusTheme.background,
                    borderColor:
                      statusTheme.borderColor,
                  }}
                >
                  {getStatusLabel(
                    employe.status
                  )}
                </span>
              </div>

              <p
                className="mt-0.5 truncate text-[13px]"
                style={{
                  color: theme.muted,
                }}
              >
                {fullName || 'Employé'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            style={{
              color: theme.muted,
            }}
          >
            <X
              className="h-4 w-4"
              strokeWidth={2}
            />
          </button>
        </header>

        {/* ====================================================
            BODY
        ==================================================== */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ minHeight: 0 }}
        >
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row">

              {/* ==================================================
                  SIDEBAR
              ================================================== */}
              <aside className="w-full shrink-0 lg:w-[200px]">
                <div className="flex flex-col gap-3">

                  {/* PROFIL */}
                  <div
                    className={[
                      'relative aspect-square overflow-hidden',
                      'rounded-xl border',
                      borderClass,
                    ].join(' ')}
                    style={{
                      background: theme.card,
                    }}
                  >
                    {imageUrl &&
                    typeof imageUrl === 'string' ? (
                      <img
                        src={imageUrl}
                        alt={fullName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 p-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white shadow-lg">
                          {initiales}
                        </div>

                        <p className="mt-3 max-w-full truncate text-[14px] font-semibold text-white">
                          {fullName ||
                            'Employé'}
                        </p>

                        <p className="mt-1 max-w-full truncate text-[11px] text-white/70">
                          {employe.poste ||
                            'Employé'}
                        </p>
                      </div>
                    )}

                    {/* STATUS DOT */}
                    <div
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm"
                      style={{
                        background:
                          theme.card,
                        borderColor:
                          theme.border,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            statusTheme.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* RÉSUMÉ */}
                  <div
                    className={[
                      'overflow-hidden rounded-xl border',
                      borderClass,
                    ].join(' ')}
                    style={{
                      background: theme.card,
                    }}
                  >
                    <div
                      className={[
                        'flex items-center border-b',
                        'px-3 py-2.5',
                        borderClass,
                      ].join(' ')}
                    >
                      <span
                        className="text-[12px] font-normal uppercase tracking-[0.045em]"
                        style={{
                          color: theme.muted,
                        }}
                      >
                        Résumé
                      </span>
                    </div>

                    <div className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="text-[12px] font-normal"
                          style={{
                            color: theme.muted,
                          }}
                        >
                          Employé
                        </span>

                        <span
                          className="max-w-[105px] truncate text-right text-[13px] font-normal"
                          style={{
                            color: theme.text,
                          }}
                        >
                          {fullName || '—'}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="text-[12px] font-normal"
                          style={{
                            color: theme.muted,
                          }}
                        >
                          Poste
                        </span>

                        <span
                          className="max-w-[105px] truncate text-right text-[13px] font-normal"
                          style={{
                            color: theme.primary,
                          }}
                        >
                          {employe.poste ||
                            '—'}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="text-[12px] font-normal"
                          style={{
                            color: theme.muted,
                          }}
                        >
                          Département
                        </span>

                        <span
                          className="max-w-[105px] truncate text-right text-[13px] font-normal"
                          style={{
                            color: theme.text,
                          }}
                        >
                          {employe.departement ||
                            '—'}
                        </span>
                      </div>

                      <div
                        className="my-2 h-px"
                        style={{
                          background:
                            theme.border,
                        }}
                      />

                      <div>
                        <div
                          className="mb-0.5 flex items-center gap-1.5 text-[12px] font-normal"
                          style={{
                            color: theme.muted,
                          }}
                        >
                          <span>
                            Salaire mensuel
                          </span>
                        </div>

                        <div
                          className="text-[15px] font-semibold tracking-tight"
                          style={{
                            color: theme.primary,
                          }}
                        >
                          {formatMoney(
                            salaireMensuel
                          )}
                        </div>
                      </div>

                      <div
                        className="mt-3 rounded-lg border px-2.5 py-1.5"
                        style={{
                          background:
                            statusTheme.background,
                          borderColor:
                            statusTheme.borderColor,
                        }}
                      >
                        <span
                          className="text-[12px] font-semibold"
                          style={{
                            color:
                              statusTheme.color,
                          }}
                        >
                          {getStatusLabel(
                            employe.status
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* ==================================================
                  MAIN CONTENT
              ================================================== */}
              <div className="min-w-0 flex-1 space-y-4">

                {/* INFORMATIONS GÉNÉRALES */}
                <section
                  className="overflow-hidden rounded-xl border"
                  style={{
                    background:
                      theme.card,
                    borderColor:
                      theme.border,
                  }}
                >
                  <div
                    className={[
                      'flex items-center border-b',
                      'px-3 py-2.5',
                      borderClass,
                    ].join(' ')}
                    style={{
                      background:
                        theme.card,
                    }}
                  >
                    <span
                      className="text-[13px] font-normal uppercase tracking-[0.045em]"
                      style={{
                        color: theme.muted,
                      }}
                    >
                      Informations générales
                    </span>
                  </div>

                  <div
                    className={[
                      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                      'border-l border-t',
                      borderClass,
                    ].join(' ')}
                  >
                    <FormCell
                      label="Prénom"
                      borderRight
                      borderBottom
                    >
                      <span
                        className="block truncate text-[14px] font-medium"
                        style={{
                          color: theme.text,
                        }}
                      >
                        {employe.prenom ||
                          '—'}
                      </span>
                    </FormCell>

                    <FormCell
                      label="Nom"
                      borderRight
                      borderBottom
                    >
                      <span
                        className="block truncate text-[14px] font-medium"
                        style={{
                          color: theme.text,
                        }}
                      >
                        {employe.nom ||
                          '—'}
                      </span>
                    </FormCell>

                    <FormCell
                      label="Poste"
                      borderRight={false}
                      borderBottom
                    >
                      <span
                        className="block truncate text-[14px] font-semibold"
                        style={{
                          color: theme.primary,
                        }}
                      >
                        {employe.poste ||
                          '—'}
                      </span>
                    </FormCell>

                    <FormCell
                      label="Statut"
                      borderRight
                      borderBottom
                    >
                      <span
                        className="inline-flex max-w-full items-center rounded-md border px-2 py-1 text-[12px] font-semibold"
                        style={{
                          background:
                            statusTheme.background,
                          borderColor:
                            statusTheme.borderColor,
                          color:
                            statusTheme.color,
                        }}
                      >
                        <span className="truncate">
                          {getStatusLabel(
                            employe.status
                          )}
                        </span>
                      </span>
                    </FormCell>

                    <FormCell
                      label="Département"
                      borderRight
                      borderBottom
                    >
                      <span
                        className="block truncate text-[14px] font-medium"
                        style={{
                          color: theme.text,
                        }}
                      >
                        {employe.departement ||
                          '—'}
                      </span>
                    </FormCell>

                    <FormCell
                      label="Téléphone"
                      borderRight={false}
                      borderBottom
                    >
                      <span
                        className="block truncate text-[14px] font-medium"
                        style={{
                          color: theme.text,
                        }}
                      >
                        {employe.telephone ||
                          '—'}
                      </span>
                    </FormCell>

                    <FormCell
                      label="Email"
                      borderRight
                      borderBottom
                    >
                      <span
                        className="block truncate text-[14px] font-medium"
                        style={{
                          color: theme.text,
                        }}
                        title={
                          employe.email ||
                          ''
                        }
                      >
                        {employe.email ||
                          '—'}
                      </span>
                    </FormCell>

                    <FormCell
                      label="Date d'embauche"
                      borderRight
                      borderBottom
                    >
                      <span
                        className="block truncate text-[14px] font-medium"
                        style={{
                          color: theme.text,
                        }}
                      >
                        {formatDate(
                          employe.date_embauche
                        )}
                      </span>
                    </FormCell>

                    <FormCell
                      label="Créé le"
                      borderRight={false}
                      borderBottom
                    >
                      <span
                        className="block truncate text-[14px] font-medium"
                        style={{
                          color: theme.muted,
                        }}
                      >
                        {formatDateTime(
                          employe.created_at
                        )}
                      </span>
                    </FormCell>

                    <FormCell
                      label="Salaire mensuel"
                      borderRight={false}
                      borderBottom={false}
                      fullWidth
                    >
                      <span
                        className="block text-[15px] font-bold"
                        style={{
                          color:
                            theme.primary,
                        }}
                      >
                        {formatMoney(
                          salaireMensuel
                        )}
                      </span>
                    </FormCell>
                  </div>
                </section>

                {/* RÉCAPITULATIF SALAIRE */}
                <section
                  className="overflow-hidden rounded-xl border"
                  style={{
                    background:
                      theme.card,
                    borderColor:
                      theme.border,
                  }}
                >
                  <div
                    className={[
                      'flex items-center border-b',
                      'px-3 py-2.5',
                      borderClass,
                    ].join(' ')}
                    style={{
                      background:
                        theme.card,
                    }}
                  >
                    <span
                      className="text-[13px] font-normal uppercase tracking-[0.045em]"
                      style={{
                        color: theme.muted,
                      }}
                    >
                      Récapitulatif salaire
                    </span>
                  </div>

                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="text-[13px] font-medium"
                        style={{
                          color: theme.muted,
                        }}
                      >
                        Salaire mensuel
                      </span>

                      <span
                        className="text-[14px] font-semibold"
                        style={{
                          color: theme.text,
                        }}
                      >
                        {formatMoney(
                          salaireMensuel
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="text-[13px] font-medium"
                        style={{
                          color: theme.muted,
                        }}
                      >
                        Salaire annuel (12 mois)
                      </span>

                      <span
                        className="text-[14px] font-semibold"
                        style={{
                          color: theme.text,
                        }}
                      >
                        {formatMoney(
                          salaireAnnuel
                        )}
                      </span>
                    </div>

                    <div
                      className="my-2 h-px"
                      style={{
                        background:
                          theme.border,
                      }}
                    />

                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
                      style={{
                        background:
                          theme.primarySoft,
                        borderColor:
                          theme.primaryBorder,
                      }}
                    >
                      <span
                        className="text-[14px] font-bold uppercase tracking-wide"
                        style={{
                          color:
                            theme.primary,
                        }}
                      >
                        Total annuel
                      </span>

                      <span
                        className="text-[20px] font-bold tracking-tight"
                        style={{
                          color:
                            theme.primary,
                        }}
                      >
                        {formatMoney(
                          salaireAnnuel
                        )}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>

        {/* ====================================================
            FOOTER
        ==================================================== */}
        <footer
          className={[
            'flex shrink-0 flex-wrap items-center',
            'justify-between gap-3 border-t',
            'px-4 py-2.5 sm:px-5',
            borderClass,
          ].join(' ')}
          style={{
            background: theme.footer,
          }}
        >
          <span
            className="hidden text-[11px] font-medium sm:block"
            style={{
              color: theme.subMuted,
            }}
          >
            Échap pour fermer
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-1.5">

            {/* HISTORIQUE */}
            {onHistorique && (
              <button
                type="button"
                onClick={onHistorique}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                style={{
                  background: theme.green,
                }}
              >
                <History
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                />
                Historique
              </button>
            )}

            {/* MODIFIER */}
            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              style={{
                background:
                  theme.primary,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  theme.primaryHover;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  theme.primary;
              }}
            >
              <Edit
                className="h-3.5 w-3.5"
                strokeWidth={2}
              />
              Modifier
            </button>

            {/* FERMER */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors"
              style={{
                color: theme.muted,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  isDark
                    ? '#1E293B'
                    : '#F1F5F9';

                event.currentTarget.style.color =
                  theme.text;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';

                event.currentTarget.style.color =
                  theme.muted;
              }}
            >
              <X
                className="h-3.5 w-3.5"
                strokeWidth={2}
              />
              Fermer
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default EmployesViewModal;