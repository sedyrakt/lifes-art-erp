// ============================================================
// src/components/paiements/PaiementsGrid.tsx - REFACTORED UNIFIED
// ⭐ FANITSARA: Esorina ny borders rehefa mode dark (border-0)
// ============================================================

import React from 'react';
import { Calendar as CalendarIcon, History, Edit, Trash2, Plus, CreditCard, Briefcase } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

interface Paiement {
  id: number;
  employe_id: number;
  employe_nom: string;
  employe_prenom: string;
  employe_poste: string;
  mois: number;
  annee: number;
  montant: number;
  mode_paiement: string;
  date_paiement: string;
  reference?: string;
  observation?: string;
}

interface PaiementsGridProps {
  paiements: Paiement[];
  moisLabels: string[];
  onViewHistorique: (employeId: number) => void;
  onEdit: (paiement: Paiement) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

const PaiementsGrid: React.FC<PaiementsGridProps> = ({
  paiements = [],
  moisLabels,
  onViewHistorique,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const { isDark } = useTheme();
  const borderColor = isDark ? 'border-0' : 'border-slate-200';

  if (paiements.length === 0) {
    return (
      <div className={`rounded-xl border bg-white dark:bg-[#0F172A] p-12 text-center shadow-sm ${borderColor}`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <CreditCard size={24} strokeWidth={1.8} />
        </div>
        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucun paiement</h3>
        <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">Ajoutez un paiement pour ce mois.</p>
        <button onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow">
          <Plus size={15} /> Ajouter un paiement
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {paiements.map((p) => {
        const initiales = `${p.employe_prenom?.charAt(0) || ''}${p.employe_nom?.charAt(0) || ''}`.toUpperCase();
        return (
          <div
            key={p.id}
            className={`group relative rounded-xl border shadow-sm bg-white dark:bg-[#0F172A] hover:shadow-md transition-all duration-200 flex flex-col p-4 ${borderColor}`}
          >
            {/* HEADER: Info Employé + Actions capsule */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[13px] font-bold text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                    {initiales}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block truncate text-[15px] font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                      {p.employe_prenom} {p.employe_nom}
                    </span>
                    <div className="flex items-center gap-1 truncate text-[12px] font-medium text-slate-500 dark:text-slate-400">
                      <Briefcase size={12} /> {p.employe_poste}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS CAPSULE */}
              <div className="flex-shrink-0 ml-2">
                <div className={`inline-flex items-center gap-0.5 rounded-xl border px-1.5 py-1 shadow-sm backdrop-blur-sm bg-slate-50 dark:bg-[#1E293B] ${borderColor}`}>
                  <button 
                    onClick={() => onViewHistorique(p.employe_id)} 
                    className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-600 hover:scale-110 dark:text-slate-500 dark:hover:text-emerald-400" 
                    title="Historique"
                  >
                    <History size={16} />
                  </button>
                  <button 
                    onClick={() => onEdit(p)} 
                    className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-amber-500/20 hover:text-amber-600 hover:scale-110 dark:text-slate-500 dark:hover:text-amber-400" 
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(p.id)} 
                    className="rounded-lg p-1.5 text-rose-500 transition-all hover:bg-rose-500/20 hover:scale-110" 
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* MONTANT */}
            <div className="mb-2 mt-1">
              <span className="block text-[22px] font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                {formatMoney(p.montant)}
              </span>
            </div>

            {/* DÉTAILS (Période + Mode) */}
            <div className="mt-auto flex items-center justify-between border-t pt-3 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                <CalendarIcon size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                {moisLabels[p.mois - 1]} {p.annee}
              </div>
              
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-sm bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                {p.mode_paiement}
              </span>
            </div>

            {/* DATE DU PAIEMENT */}
            <div className="mt-2 text-[12px] font-medium text-slate-400 dark:text-slate-500">
              {new Date(p.date_paiement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaiementsGrid;