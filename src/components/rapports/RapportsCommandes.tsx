// ============================================================
// src/components/rapports/RapportsCommandes.tsx
// ⭐ FIX: ESRINA NY ICON REHETRA
// ⭐ FIX: AHENAO NY FONTSIZE
// ============================================================

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

interface Commande {
  id: number;
  commande_numero?: string;
  numero?: string;
  client_nom: string;
  date_commande: string;
  total_ttc: number;
  statut: string;
  nb_produits?: number;
}

interface RapportsCommandesProps { commandes?: Commande[]; }

const RapportsCommandes: React.FC<RapportsCommandesProps> = ({ commandes = [] }) => {
  const { isDark } = useTheme();

  const borderColor = isDark ? 'border-white/[0.055]' : 'border-slate-200';
  const cardBg = isDark ? 'bg-[#111c30]' : 'bg-white';
  const shadow = isDark ? 'shadow-[0_12px_40px_rgba(0,0,0,0.18)]' : 'shadow-[0_1px_2px_rgba(15,23,42,0.04)]';

  const getStatusColor = (statut: string) => {
    const normalized = statut?.toLowerCase().trim();
    switch (normalized) {
      case 'livrée': case 'livree': return 'text-emerald-400';
      case 'confirmée': case 'confirmee': return 'text-indigo-400';
      case 'en attente': return 'text-amber-400';
      case 'annulée': case 'annulee': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!commandes || commandes.length === 0) {
    return (
      <div className={`relative h-full overflow-hidden rounded-xl border ${borderColor} ${cardBg} ${shadow}`}>
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          {/* ⭐ FIX: ESRINA NY ICON */}
          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Aucune commande récente</h3>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">Les commandes apparaîtront ici une fois qu'elles auront été enregistrées.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full overflow-hidden rounded-xl border ${borderColor} ${cardBg} ${shadow}`}>
      <div className="relative">
        <div className={`flex items-center justify-between border-b ${borderColor} px-4 py-3.5`}>
          {/* ⭐ FIX: AHENAO NY FONTSIZE */}
          <h2 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Commandes récentes</h2>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Dernières {commandes.length}</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px]">
            {/* HEADER */}
            <div className={`grid grid-cols-[minmax(180px,1.4fr)_100px_125px_100px] gap-2 border-b ${borderColor} px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500`}>
              <span>N° Commande</span>
              <span className="text-right">Client</span>
              <span className="text-right">Total</span>
              <span className="text-right">Statut</span>
            </div>

            {/* ROWS */}
            <div>
              {commandes.map((cmd, index) => {
                const statusColor = getStatusColor(cmd.statut);
                const numeroAffichage = cmd.commande_numero || cmd.numero || `#${String(cmd.id).padStart(4, '0')}`;

                return (
                  <div key={cmd.id} className={`grid grid-cols-[minmax(180px,1.4fr)_100px_125px_100px] gap-2 border-b ${borderColor} px-4 py-3 last:border-b-0 hover:bg-white/[0.03]`}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      {/* ⭐ FIX: ESRINA NY ICON */}
                      <span className="truncate text-[14px] font-medium text-slate-900 dark:text-slate-200">
                        {numeroAffichage}
                      </span>
                    </div>
                    <span className="self-center text-right text-[13px] text-slate-700 dark:text-slate-400">
                      {cmd.client_nom || 'Client inconnu'}
                    </span>
                    <span className="self-center text-right text-[13px] text-slate-600 dark:text-slate-300">
                      {formatMoney(cmd.total_ttc || 0)}
                    </span>
                    <span className={`self-center text-right text-[13px] font-semibold ${statusColor}`}>
                      {cmd.statut || '—'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className={`flex items-center justify-between border-t ${borderColor} bg-white/[0.03] px-4 py-3`}>
              {/* ⭐ FIX: AHENAO NY FONTSIZE */}
              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                {commandes.length} commande{commandes.length > 1 ? 's' : ''} affichée{commandes.length > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />À jour
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
      `}</style>
    </div>
  );
};

export default RapportsCommandes;