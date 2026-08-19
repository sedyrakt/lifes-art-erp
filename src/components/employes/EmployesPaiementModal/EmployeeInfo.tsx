// ============================================================
// src/components/employes/EmployesPaiementModal/EmployeeInfo.tsx
// ============================================================

import React from 'react';
import {
  UserRound,
  BriefcaseBusiness,
  CalendarDays,
} from 'lucide-react';

interface EmployeeInfoProps {
  employe: any;
  imageUrl: string | null;
  theme: any;
  themeIsDark: boolean;
}

const EmployeeInfo: React.FC<EmployeeInfoProps> = ({
  employe,
  imageUrl,
  theme,
}) => {
  const getInitiales = (
    prenom: string,
    nom: string
  ) => {
    return (
      `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`
    ).toUpperCase() || '?';
  };

  const formatDate = (value: string) => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: theme.card,
        borderColor: theme.border,
      }}
    >

      {/* HEADER */}
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{
          background: theme.headerBg,
          borderColor: theme.border,
        }}
      >
        <UserRound
          className="w-4 h-4"
          style={{ color: theme.primary }}
        />

        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: theme.text }}
        >
          Employé
        </span>
      </div>

      {/* PROFILE */}
      <div className="p-4">

        <div className="flex items-center gap-3">

          <div
            className="
              w-14 h-14
              rounded-xl
              overflow-hidden
              border
              flex items-center justify-center
              shrink-0
            "
            style={{
              borderColor: theme.border,
              background: theme.primaryBg,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${employe.prenom} ${employe.nom}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="font-extrabold text-lg"
                style={{
                  color: theme.primary,
                }}
              >
                {getInitiales(
                  employe.prenom,
                  employe.nom
                )}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p
              className="text-sm font-extrabold truncate"
              style={{ color: theme.text }}
            >
              {employe.prenom} {employe.nom}
            </p>

            <p
              className="text-xs font-semibold truncate mt-1"
              style={{ color: theme.primary }}
            >
              {employe.poste || 'Employé'}
            </p>
          </div>

        </div>

        {/* DETAILS */}
        <div
          className="mt-4 pt-4 border-t space-y-3"
          style={{
            borderColor: theme.border,
          }}
        >

          <div className="flex items-center justify-between gap-3">

            <span
              className="flex items-center gap-2 text-xs font-medium"
              style={{ color: theme.muted }}
            >
              <BriefcaseBusiness className="w-3.5 h-3.5" />
              Département
            </span>

            <span
              className="text-xs font-bold truncate"
              style={{ color: theme.text }}
            >
              {employe.departement || '—'}
            </span>

          </div>

          <div className="flex items-center justify-between gap-3">

            <span
              className="flex items-center gap-2 text-xs font-medium"
              style={{ color: theme.muted }}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Embauche
            </span>

            <span
              className="text-xs font-bold"
              style={{ color: theme.text }}
            >
              {formatDate(employe.date_embauche)}
            </span>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EmployeeInfo;