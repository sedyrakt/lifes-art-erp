// ============================================================
// src/components/employes/EmployesPaiementModal/PeriodSelector.tsx
// ⭐ COMPACT + MIXED FONT SIZE 13px-15px
// ⭐ FIX: Tsy desactiver-na daholo ny mois rehetra
// ⭐ FIX: Mois payé ihany no desactiver (misy check circle)
// ⭐ FIX: Mois futur sy avant embauche dia mbola azo misafidy
// ⭐ FIX: Nesorina ny icon amin'ny status
// ============================================================

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface PeriodSelectorProps {
  employe: any;
  paiementMois: number;
  paiementAnnee: number;
  anneeEmbauche: number;
  historiquePaiements: any[];
  isMoisPaye: (mois: number, annee: number) => boolean;
  isMoisFutur: (mois: number, annee: number) => boolean;
  isMoisAvantEmbauche: (mois: number, annee: number) => boolean;
  onMoisClick: (mois: number, annee: number) => void;
  onAnneeChange: (annee: number) => void;
  getMoisPourAnnee: (dateEmbauche: string, annee: number, labels?: string[]) => {
    mois: number;
    annee: number;
    label: string;
  }[];
  moisLabels: string[];
  theme: any;
  themeIsDark: boolean;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
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
        className="px-3 py-2.5 border-b flex items-center justify-between"
        style={{
          background: theme.headerBg,
          borderColor: theme.border,
        }}
      >
        <span
          className="text-[13px] font-bold uppercase tracking-wider"
          style={{ color: theme.text }}
        >
          Période
        </span>
        <span
          className="px-2 py-0.5 rounded-md border text-[13px] font-extrabold"
          style={{
            background: theme.inputBg,
            borderColor: theme.border,
            color: theme.primary,
          }}
        >
          {paiementAnnee}
        </span>
      </div>

      <div className="p-3">
        {/* YEAR NAV */}
        <div className="flex items-center justify-between mb-2.5">
          <button
            type="button"
            onClick={() => {
              const newAnnee = paiementAnnee - 1;
              if (newAnnee >= anneeEmbauche) {
                onAnneeChange(newAnnee);
              }
            }}
            disabled={paiementAnnee <= anneeEmbauche}
            className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderColor: theme.border,
              color: theme.muted,
              background: theme.inputBg,
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-[15px] font-black" style={{ color: theme.text }}>
            {paiementAnnee}
          </span>

          <button
            type="button"
            onClick={() => onAnneeChange(paiementAnnee + 1)}
            className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all hover:bg-indigo-500/10"
            style={{
              borderColor: theme.border,
              color: theme.muted,
              background: theme.inputBg,
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* MONTHS GRID */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {getMoisPourAnnee(
            employe.date_embauche,
            paiementAnnee
          ).map(item => {
            const mois = item.mois;
            const paye = isMoisPaye(mois, paiementAnnee);
            const futur = isMoisFutur(mois, paiementAnnee);
            const avantEmbauche = isMoisAvantEmbauche(mois, paiementAnnee);

            // ⭐ FIX: Ny mois payé ihany no tsy azo fidihana
            const selected = paiementMois === mois && !paye;

            let color = theme.muted;
            let background = theme.inputBg;
            let border = theme.border;
            let label = 'Impayé';
            let disabled = false;

            if (avantEmbauche) {
              color = theme.muted;
              background = `${theme.muted}08`;
              border = `${theme.muted}20`;
              label = 'Avant';
              disabled = false;
            } else if (futur) {
              color = theme.muted;
              background = `${theme.muted}08`;
              border = `${theme.muted}20`;
              label = 'Futur';
              disabled = false;
            } else if (paye) {
              color = theme.green;
              background = `${theme.green}0D`;
              border = `${theme.green}35`;
              label = 'Payé';
              disabled = true;
            } else {
              color = theme.amber;
              background = `${theme.amber}0D`;
              border = `${theme.amber}35`;
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
                    onMoisClick(mois, paiementAnnee);
                  }
                }}
                className={`
                  relative
                  min-h-[52px]
                  px-2
                  py-1.5
                  rounded-xl
                  border
                  text-center
                  transition-all
                  duration-150
                  ${disabled
                    ? 'cursor-not-allowed opacity-55'
                    : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-sm'
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
                <div className="flex items-center justify-center gap-1">
                  <span
                    className="text-[14px] font-bold capitalize"
                    style={{
                      color: selected ? theme.primary : theme.text,
                    }}
                  >
                    {item.label}
                  </span>
                  {selected && (
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                  )}
                </div>
                <div className="flex items-center justify-center mt-1">
                  <span
                    className="text-[13px] font-bold uppercase tracking-wider"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 pt-2 border-t" style={{ borderColor: theme.border }}>
          {[
            ['#10B981', 'Payé'],
            ['#F59E0B', 'Impayé'],
            ['#94A3B8', 'Futur'],
            ['#6366F1', 'Sélectionné'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
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