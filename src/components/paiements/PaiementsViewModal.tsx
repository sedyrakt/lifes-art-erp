// ============================================================
// src/components/paiements/PaiementsViewModal.tsx
// ⭐ PREMIUM PAIEMENT VIEW MODAL
// ⭐ MITOVY DESIGN AMIN'NY ACHAT VIEW MODAL
// ⭐ DARK + LIGHT MODE (INDIGO THEME)
// ⭐ ALL BORDER SYSTEM + GRID 3 COLONNES (FormCell)
// ⭐ SIDEBAR (Carte Employé + Carte Résumé)
// ⭐ RÉCAPITULATIF
// ============================================================

import React, { useEffect, useState } from 'react';
import { Receipt, X, DollarSign, Calendar as CalendarIcon, History, Briefcase, Wallet, Hash, FileText, Info, CheckCircle2, CreditCard } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: {
    card: '#FFFFFF', header: '#FFFFFF', footer: '#F8FAFC', border: '#E2E8F0', borderStrong: '#CBD5E1',
    text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5',
    primarySoft: 'rgba(99,102,241,0.08)', primaryBorder: 'rgba(99,102,241,0.18)',
    green: '#059669', greenBg: 'rgba(16,185,129,0.10)', greenBorder: 'rgba(16,185,129,0.25)',
    warning: '#D97706', warningBg: 'rgba(245,158,11,0.10)', warningBorder: 'rgba(245,158,11,0.25)'
  },
  dark: {
    card: '#0F172A', header: '#0F172A', footer: '#0F172A', border: '#334155', borderStrong: '#475569',
    text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#818CF8', primaryHover: '#6366F1',
    primarySoft: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.25)',
    green: '#34D399', greenBg: 'rgba(16,185,129,0.14)', greenBorder: 'rgba(52,211,153,0.28)',
    warning: '#FBBF24', warningBg: 'rgba(245,158,11,0.12)', warningBorder: 'rgba(251,191,36,0.25)'
  },
};

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
  created_at: string;
}

interface PaiementsViewModalProps {
  paiement: Paiement;
  moisLabels: string[];
  onClose: () => void;
  onViewHistorique: () => void;
}

// ⭐ FormCell - Mitovy amin'ny AchatViewModal
interface FormCellProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  borderRight?: boolean;
  borderBottom?: boolean;
  fullWidth?: boolean;
}

const FormCell: React.FC<FormCellProps> = ({ label, children, icon, borderRight = true, borderBottom = true, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  
  return (
    <div className={`flex min-w-0 items-center px-3 py-2.5 ${borderRight ? `border-r ${borderClass}` : ''} ${borderBottom ? `border-b ${borderClass}` : ''} ${fullWidth ? 'col-span-3' : ''}`} style={{ background: theme.card }}>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          {icon && <span className="flex shrink-0 items-center justify-center" style={{ color: theme.muted }}>{icon}</span>}
          <span className="truncate text-[12px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>{label || ' '}</span>
        </div>
        <div className="min-w-0 text-[14px] font-medium leading-4">{children}</div>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; theme: typeof COLORS.light | typeof COLORS.dark; }> = ({ icon, title, theme }) => {
  const { isDark } = useTheme();
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  return (
    <div className={`flex items-center gap-2 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: theme.primarySoft, color: theme.primary }}>{icon}</div>
      <span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.text }}>{title}</span>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; }> = ({ label, value, icon }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        {icon && <span className="shrink-0" style={{ color: theme.muted }}>{icon}</span>}
        <span className="truncate text-[12px] font-medium" style={{ color: theme.muted }}>{label}</span>
      </div>
      <div className="min-w-0 text-right text-[13px] font-semibold" style={{ color: theme.text }}>{value}</div>
    </div>
  );
};

const PaiementsViewModal: React.FC<PaiementsViewModalProps> = ({ paiement, moisLabels, onClose, onViewHistorique }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [onClose]);

  const formatDateTime = (value?: string) => { if (!value) return '—'; const date = new Date(value); if (Number.isNaN(date.getTime())) return '—'; return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  const periode = moisLabels[paiement.mois - 1] || `Mois ${paiement.mois}`;

  // ⭐ Calculs pour récapitulatif
  const salaireTotal = Number(paiement.montant) || 0;
  const salaireAnnuel = salaireTotal * 12;

  return (
    <div className={`fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border ${borderClass} shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.98]'}`} style={{ background: theme.card }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-20 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5 ${borderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: theme.primaryBorder, background: theme.primarySoft, color: theme.primary }}>
              <Receipt size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>Détails du paiement</h2>
              <p className="mt-0.5 truncate text-[13px]" style={{ color: theme.muted }}>Informations détaillées de la rémunération</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500" style={{ color: theme.muted }}>
            <X size={16} strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto custom-modal-scrollbar p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">

            {/* ⭐ SIDEBAR GAUCHE */}
            <aside className="w-full shrink-0 lg:w-[200px]">
              <div className="flex flex-col gap-3">

                {/* ⭐ CARTE EMPLOYÉ */}
                <div className={`relative aspect-square overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surfaceSoft }}>
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 p-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white shadow-lg">
                      {(paiement.employe_prenom?.charAt(0) || '?')}{paiement.employe_nom?.charAt(0) || ''}
                    </div>
                    <p className="mt-3 text-[14px] font-bold text-white">{paiement.employe_prenom} {paiement.employe_nom}</p>
                    <p className="mt-1 text-[11px] text-white/70">{paiement.employe_poste || 'Employé'}</p>
                  </div>
                </div>

                {/* ⭐ CARTE RÉSUMÉ */}
                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.card }}>
                  <div className={`flex items-center gap-2 border-b px-3 py-2.5 ${borderClass}`}>
                    <Info className="h-3.5 w-3.5" style={{ color: theme.primary }} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Résumé</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <InfoRow label="Référence" value={paiement.reference || '—'} icon={<Hash size={12} />} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="Période" value={`${periode} ${paiement.annee}`} icon={<CalendarIcon size={12} />} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <div>
                      <div className="mb-0.5 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: theme.muted }}>
                        <DollarSign className="h-3 w-3" /> Montant
                      </div>
                      <div className="text-[15px] font-semibold tracking-tight" style={{ color: theme.primary }}>{formatMoney(salaireTotal)}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: theme.greenBg, border: `1px solid ${theme.greenBorder}` }}>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: theme.green }} />
                      <span className="text-[12px] font-semibold" style={{ color: theme.green }}>Payé</span>
                    </div>
                  </div>
                </div>

              </div>
            </aside>

            {/* ⭐ MAIN RIGHT */}
            <div className="min-w-0 flex-1 space-y-4">

              {/* ⭐ INFORMATIONS GÉNÉRALES (GRID 3 COLS) */}
              <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: theme.primarySoft, color: theme.primary }}>
                    <Info className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Informations générales</span>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l ${borderClass}`}>
                  <FormCell label="Employé" icon={<Briefcase size={13} />} borderRight borderBottom>
                    <span className="block truncate text-[14px] font-semibold" style={{ color: theme.text }}>{paiement.employe_prenom} {paiement.employe_nom}</span>
                  </FormCell>
                  <FormCell label="Poste" icon={<Briefcase size={13} />} borderRight borderBottom>
                    <span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{paiement.employe_poste || '—'}</span>
                  </FormCell>
                  <FormCell label="Période" icon={<CalendarIcon size={13} />} borderRight={false} borderBottom>
                    <span className="block capitalize text-[14px] font-medium" style={{ color: theme.text }}>{periode} {paiement.annee}</span>
                  </FormCell>
                  <FormCell label="Montant" icon={<DollarSign size={13} />} borderRight borderBottom>
                    <span className="block text-[15px] font-bold" style={{ color: theme.primary }}>{formatMoney(salaireTotal)}</span>
                  </FormCell>
                  <FormCell label="Mode de paiement" icon={<CreditCard size={13} />} borderRight borderBottom>
                    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-[13px] font-semibold" style={{ background: theme.primarySoft, color: theme.primary }}>{paiement.mode_paiement || '—'}</span>
                  </FormCell>
                  <FormCell label="Référence" icon={<Hash size={13} />} borderRight={false} borderBottom>
                    <span className="block truncate font-mono text-[14px] font-medium" style={{ color: theme.text }}>{paiement.reference || '—'}</span>
                  </FormCell>
                  <FormCell label="Date de paiement" icon={<CalendarIcon size={13} />} borderRight borderBottom>
                    <span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{formatDateTime(paiement.date_paiement)}</span>
                  </FormCell>
                  <FormCell label="Créé le" icon={<CalendarIcon size={13} />} borderRight={false} borderBottom>
                    <span className="block truncate text-[14px] font-medium" style={{ color: theme.muted }}>{formatDateTime(paiement.created_at)}</span>
                  </FormCell>
                </div>
              </div>

              {/* ⭐ RÉCAPITULATIF FINANCIER */}
              <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: theme.primarySoft, color: theme.primary }}>
                    <Wallet className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Récapitulatif financier</span>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Paiement mensuel</span>
                    <span className="text-[14px] font-semibold" style={{ color: theme.text }}>{formatMoney(salaireTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Salaire annuel (12 mois)</span>
                    <span className="text-[14px] font-semibold" style={{ color: theme.text }}>{formatMoney(salaireAnnuel)}</span>
                  </div>
                  <div className="my-2 h-px" style={{ background: theme.border }} />
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2.5" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder }}>
                    <span className="text-[14px] font-bold uppercase tracking-wide" style={{ color: theme.primary }}>Total annuel</span>
                    <span className="text-[20px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatMoney(salaireAnnuel)}</span>
                  </div>
                </div>
              </div>

              {/* ⭐ OBSERVATION */}
              {paiement.observation && (
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: theme.primarySoft, color: theme.primary }}>
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Observation</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: theme.muted }}>{paiement.observation}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-4 py-2.5 sm:px-5 ${borderClass}`} style={{ borderColor: theme.border, background: theme.footer }}>
          <span className="hidden text-[11px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[13px] font-medium transition-all hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05]" style={{ borderColor: theme.border, color: theme.text, background: 'transparent' }}>
              Fermer
            </button>
            <button type="button" onClick={onViewHistorique} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }}>
              <History className="h-3.5 w-3.5" strokeWidth={2} />
              Voir historique
            </button>
          </div>
        </footer>

        <style>{`
          @keyframes paiementModalIn { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .custom-modal-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-modal-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.28); border-radius: 999px; }
          .custom-modal-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.45); }
        `}</style>
      </div>
    </div>
  );
};

export default PaiementsViewModal;