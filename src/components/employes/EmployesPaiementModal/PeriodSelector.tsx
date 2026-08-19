// ============================================================
// src/components/employes/EmployesPaiementModal/PeriodSelector.tsx
// ============================================================

import React from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Ban,
  Clock3,
  AlertCircle,
} from 'lucide-react';

interface PeriodSelectorProps {
  employe: any;
  paiementMois: number;
  paiementAnnee: number;
  anneeEmbauche: number;
  historiquePaiements: any[];
  isMoisPaye: (mois: number, annee: number) => boolean;
  isMoisFutur: (mois: number, annee: number) => boolean;
  isMoisAvantEmbauche: (
    mois: number,
    annee: number
  ) => boolean;
  onMoisClick: (
    mois: number,
    annee: number
  ) => void;
  onAnneeChange: (annee: number) => void;
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
  theme: any;
  themeIsDark: boolean;
}

const PeriodSelector: React.FC<
  PeriodSelectorProps
> = ({
  employe,
  paiementMois,
  paiementAnnee,
  anneeEmbauche,
  historiquePaiements,
  isMoisPaye,
  isMoisFutur,
  isMoisAvantEmbauche,
  onMoisClick,
  onAnneeChange,
  getMoisPourAnnee,
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

      {/* HEADER */}
      <div
        className="px-4 py-3 border-b"
        style={{
          background: theme.headerBg,
          borderColor: theme.border,
        }}
      >

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: theme.primaryBg,
                color: theme.primary,
              }}
            >
              <CalendarDays className="w-3.5 h-3.5" />
            </div>

            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: theme.text }}
              >
                Période de paiement
              </p>

              <p
                className="text-[10px] font-medium mt-0.5"
                style={{ color: theme.muted }}
              >
                Sélectionnez un mois disponible
              </p>
            </div>

          </div>

          <div
            className="px-3 py-1.5 rounded-lg border text-xs font-extrabold"
            style={{
              background: theme.inputBg,
              borderColor: theme.border,
              color: theme.primary,
            }}
          >
            {paiementAnnee}
          </div>

        </div>
      </div>

      <div className="p-4">

        {/* YEAR NAV */}
        <div className="flex items-center justify-between mb-4">

          <button
            type="button"
            onClick={() => {
              const newAnnee =
                paiementAnnee - 1;

              if (
                newAnnee >= anneeEmbauche
              ) {
                onAnneeChange(newAnnee);
              }
            }}
            disabled={
              paiementAnnee <= anneeEmbauche
            }
            className="
              w-9 h-9
              rounded-xl
              border
              flex items-center justify-center
              transition-all
              hover:bg-indigo-500/10
              disabled:opacity-30
              disabled:cursor-not-allowed
            "
            style={{
              borderColor: theme.border,
              color: theme.muted,
              background: theme.inputBg,
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">

            <p
              className="text-xl font-black"
              style={{ color: theme.text }}
            >
              {paiementAnnee}
            </p>

            <p
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: theme.muted }}
            >
              Année de paie
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              onAnneeChange(
                paiementAnnee + 1
              )
            }
            className="
              w-9 h-9
              rounded-xl
              border
              flex items-center justify-center
              transition-all
              hover:bg-indigo-500/10
            "
            style={{
              borderColor: theme.border,
              color: theme.muted,
              background: theme.inputBg,
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

        {/* MONTHS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">

          {getMoisPourAnnee(
            employe.date_embauche,
            paiementAnnee
          ).map(item => {

            const mois = item.mois;

            const paye =
              isMoisPaye(
                mois,
                paiementAnnee
              );

            const futur =
              isMoisFutur(
                mois,
                paiementAnnee
              );

            const avantEmbauche =
              isMoisAvantEmbauche(
                mois,
                paiementAnnee
              );

            const selected =
              paiementMois === mois &&
              !paye &&
              !futur &&
              !avantEmbauche;

            let color = theme.muted;
            let background = theme.inputBg;
            let border = theme.border;
            let icon: React.ReactNode = null;
            let label = 'Impayé';
            let disabled = false;

            if (avantEmbauche) {

              color = theme.muted;
              background = `${theme.muted}08`;
              border = `${theme.muted}20`;
              icon = <Ban className="w-3 h-3" />;
              label = 'Avant';
              disabled = true;

            } else if (futur) {

              color = theme.muted;
              background = `${theme.muted}08`;
              border = `${theme.muted}20`;
              icon = <Clock3 className="w-3 h-3" />;
              label = 'Futur';
              disabled = true;

            } else if (paye) {

              color = theme.green;
              background = `${theme.green}0D`;
              border = `${theme.green}35`;
              icon = (
                <CheckCircle2 className="w-3 h-3" />
              );
              label = 'Payé';
              disabled = true;

            } else {

              color = theme.amber;
              background = `${theme.amber}0D`;
              border = `${theme.amber}35`;
              icon = (
                <AlertCircle className="w-3 h-3" />
              );
              label = 'Impayé';
              disabled = false;

            }

            if (selected) {
              color = theme.primary;
              background = `${theme.primary}12`;
              border = theme.primary;
            }

            return (
              <button
                key={`${paiementAnnee}-${mois}`}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    onMoisClick(
                      mois,
                      paiementAnnee
                    );
                  }
                }}
                className={`
                  relative
                  min-h-[72px]
                  p-3
                  rounded-xl
                  border
                  text-left
                  transition-all
                  duration-200
                  ${disabled
                    ? 'cursor-not-allowed opacity-55'
                    : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
                  }
                `}
                style={{
                  background,
                  borderColor: border,
                  boxShadow: selected
                    ? `0 0 0 2px ${theme.primary}25`
                    : undefined,
                }}
              >

                <div className="flex items-start justify-between">

                  <p
                    className="text-sm font-extrabold capitalize"
                    style={{
                      color: selected
                        ? theme.primary
                        : theme.text,
                    }}
                  >
                    {item.label}
                  </p>

                  {selected && (
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{
                        color: theme.primary,
                      }}
                    />
                  )}

                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    mt-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                  "
                  style={{ color }}
                >
                  {icon}
                  {label}
                </div>

              </button>
            );
          })}

        </div>

        {/* LEGEND */}
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-center
            gap-x-4
            gap-y-2
            mt-4
            pt-3
            border-t
          "
          style={{
            borderColor: theme.border,
          }}
        >

          {[
            ['#10B981', 'Payé'],
            ['#F59E0B', 'Impayé'],
            ['#94A3B8', 'Futur'],
            ['#6366F1', 'Sélectionné'],
          ].map(([color, label]) => (
            <div
              key={label}
              className="flex items-center gap-1.5"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: color,
                }}
              />

              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: theme.muted,
                }}
              >
                {label}
              </span>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
};

export default PeriodSelector;