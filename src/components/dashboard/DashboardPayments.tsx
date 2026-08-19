import React from 'react';
import { CreditCard, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

interface PaymentItem {
  id?: number | string;
  prenom?: string;
  nom?: string;
  employe_nom?: string;
  poste?: string;
  fonction?: string;
  montant?: number | string;
  date_paiement?: string;
  date?: string;
}

interface DashboardPaymentsProps {
  payments?: PaymentItem[];
  totalPayments?: number;
  evolution?: number;
}

const DashboardPayments: React.FC<DashboardPaymentsProps> = ({ payments = [], totalPayments = 0, evolution = 0 }) => {
  const { isDark } = useTheme();
  const positive = Number(evolution) >= 0;
  const evolutionDisplay = `${positive ? '+' : ''}${Number(evolution).toFixed(1)}%`;
  const bg = isDark ? '#0F172A' : '#F8FAFC';
  const border = isDark ? '#334155' : '#E2E8F0';
  const text = isDark ? '#F3F4F6' : '#111827';
  const muted = isDark ? '#94A3B8' : '#64748B';

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm" style={{ background: bg, borderColor: border }}>
      <div className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
              <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-[14.5px] font-medium" style={{ color: text }}>Paiements récents</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[13px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{totalPayments} ce mois</span>
            {evolution !== 0 && (
              <div className={`flex items-center gap-0.5 text-[13px] font-medium ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{evolutionDisplay}</span>
              </div>
            )}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: isDark ? '#1E293B' : '#F1F5F9' }}>
              <Wallet className="h-6 w-6" style={{ color: isDark ? '#64748B' : '#94A3B8' }} />
            </div>
            <p className="text-[14.5px] font-medium" style={{ color: muted }}>Aucun paiement</p>
            <p className="text-[13px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Aucun paiement enregistré</p>
          </div>
        ) : (
          <div className="custom-scrollbar max-h-48 space-y-2.5 overflow-y-auto pr-1">
            {payments.map((p, index) => {
              const fullName = `${p.prenom || ''} ${p.nom || ''}`.trim() || p.employe_nom || 'Employé inconnu';
              const poste = p.poste || p.fonction || 'N/A';
              const montant = Number(p.montant ?? 0);
              const date = p.date_paiement || p.date;

              return (
                <div key={p.id ?? index} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-800/30" style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: border }}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-medium" style={{ color: text }}>{fullName}</p>
                    <p className="truncate text-[13px]" style={{ color: muted }}>{poste}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-[14.5px] font-medium text-indigo-600 dark:text-indigo-400">{formatMoney(montant)}</p>
                    {date && <p className="text-[13px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{new Date(date).toLocaleDateString('fr-FR')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:4px;height:4px}
        .custom-scrollbar::-webkit-scrollbar-track{background:transparent}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(100,116,139,.2);border-radius:999px}
        .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(100,116,139,.4)}
      `}</style>
    </div>
  );
};

export default DashboardPayments;