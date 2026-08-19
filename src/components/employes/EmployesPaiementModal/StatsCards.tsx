// ============================================================
// src/components/employes/EmployesPaiementModal/StatsCards.tsx
// ============================================================

import React from 'react';
import {
  Wallet,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';

import { formatMoney } from '../../../lib/formatMoney';

interface StatsCardsProps {
  employe: any;
  totalPaye: number;
  historiquePaiements: any[];
  paiementAnnee: number;
  getMoisPourAnnee: (
    dateEmbauche: string,
    annee: number
  ) => {
    mois: number;
    annee: number;
    label: string;
  }[];
  theme: any;
  themeIsDark: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  employe,
  totalPaye,
  historiquePaiements,
  paiementAnnee,
  getMoisPourAnnee,
  theme,
}) => {
  const moisTotal =
    getMoisPourAnnee(
      employe.date_embauche,
      paiementAnnee
    ).length;

  const tauxPaiement =
    moisTotal > 0
      ? Math.min(
          100,
          Math.round(
            (historiquePaiements.length /
              moisTotal) *
              100
          )
        )
      : 0;

  const cards = [
    {
      label: 'Salaire mensuel',
      value: formatMoney(
        employe.salaire || 0
      ),
      icon: Wallet,
      color: theme.primary,
    },
    {
      label: 'Total payé',
      value: formatMoney(totalPaye),
      icon: BadgeCheck,
      color: theme.green,
    },
    {
      label: 'Taux de paiement',
      value: `${tauxPaiement}%`,
      icon: TrendingUp,
      color: theme.primary,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

      {cards.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="
              relative
              overflow-hidden
              rounded-xl
              border
              p-4
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-lg
            "
            style={{
              background: theme.inputBg,
              borderColor: theme.border,
            }}
          >

            {/* accent */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5"
              style={{
                background: item.color,
              }}
            />

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                  "
                  style={{
                    color: theme.muted,
                  }}
                >
                  {item.label}
                </p>

                <p
                  className="mt-2 text-lg font-extrabold tracking-tight truncate"
                  style={{
                    color: item.color,
                  }}
                >
                  {item.value}
                </p>

              </div>

              <div
                className="
                  w-9 h-9
                  rounded-lg
                  flex items-center justify-center
                  shrink-0
                "
                style={{
                  background: `${item.color}14`,
                  color: item.color,
                }}
              >
                <Icon className="w-4 h-4" />
              </div>

            </div>
          </div>
        );
      })}

    </div>
  );
};

export default StatsCards;