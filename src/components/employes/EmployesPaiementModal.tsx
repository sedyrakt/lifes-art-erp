// ============================================================
// src/components/employes/EmployesPaiementModal.tsx
// ⭐ PREMIUM PRO LAYOUT - COMPACT + OVERLAY 60% OPACITY
// ============================================================

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  PaiementModalHeader,
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
  onPayer: (mois: number, annee: number, montant: number, mode: string, obs: string) => void;
  getMoisPourAnnee: (dateEmbauche: string, annee: number, labels?: string[]) => {
    mois: number;
    annee: number;
    label: string;
  }[];
  moisLabels: string[];
  moisLabelsCourt: string[];
  isDark?: boolean;
}

const EmployesPaiementModal: React.FC<Props> = ({
  isOpen, onClose, employe, historiquePaiements, imageUrl,
  paiementMois, paiementAnnee, paiementMontant,
  paiementMode: initialMode, paiementObservation: initialObservation,
  onMoisChange, onAnneeChange, onMontantChange, onPayer,
  getMoisPourAnnee, moisLabels, isDark: isDarkProp,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const [modePaiement, setModePaiement] = useState(initialMode || 'Espèces');
  const [observation, setObservation] = useState(initialObservation || '');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModePaiement(initialMode || 'Espèces');
      setObservation(initialObservation || '');
      setIsConfirmOpen(false);
    }
  }, [isOpen, initialMode, initialObservation]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isConfirmOpen) setIsConfirmOpen(false);
        else onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirmOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  if (!isOpen || !employe) return null;

  const estPaye = historiquePaiements.some(
    (p) => Number(p?.mois) === Number(paiementMois) && Number(p?.annee) === Number(paiementAnnee)
  );
  const totalPaye = historiquePaiements.reduce((sum, p) => sum + Number(p?.montant || 0), 0);
  const anneeEmbauche = employe?.date_embauche ? new Date(employe.date_embauche).getFullYear() : new Date().getFullYear();

  const isMoisPaye = (mois: number, annee: number) => {
    return historiquePaiements.some((p) => Number(p?.mois) === Number(mois) && Number(p?.annee) === Number(annee));
  };

  const isMoisFutur = (mois: number, annee: number) => {
    const today = new Date();
    const date = new Date(annee, mois - 1, 1);
    date.setMonth(date.getMonth() + 1);
    return date > today;
  };

  const isMoisAvantEmbauche = (mois: number, annee: number) => {
    if (!employe?.date_embauche) return false;
    const embauche = new Date(employe.date_embauche);
    const date = new Date(annee, mois - 1, 1);
    date.setMonth(date.getMonth() + 1);
    return date <= embauche;
  };

  const theme = {
    card: isDark ? '#0B1324' : '#FFFFFF',
    cardSecondary: isDark ? '#0F1A2E' : '#F8FAFC',
    border: isDark ? '#293A54' : '#E2E8F0',
    borderStrong: isDark ? '#344765' : '#CBD5E1',
    headerBg: isDark ? '#0D1729' : '#F8FAFC',
    text: isDark ? '#F8FAFC' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#64748B',
    primary: '#6366F1',
    primaryBg: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.08)',
    primaryBorder: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.20)',
    inputBg: isDark ? '#111D31' : '#F8FAFC',
    red: isDark ? '#F87171' : '#EF4444',
    amber: isDark ? '#FBBF24' : '#F59E0B',
    green: isDark ? '#34D399' : '#10B981',
  };

  const handlePayer = () => {
    if (estPaye) { onClose(); return; }
    if (!paiementMontant || paiementMontant <= 0) return;
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    onPayer(paiementMois, paiementAnnee, paiementMontant, modePaiement, observation);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-4"
      style={{
        background: isDark ? 'rgba(2, 6, 23, 0.6)' : 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isConfirmOpen) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paiement-modal-title"
    >
      <div
        className="relative w-full max-w-[900px] h-[85vh] sm:h-[80vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{
          background: theme.card,
          borderColor: theme.borderStrong,
          boxShadow: isDark 
            ? '0 30px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)' 
            : '0 30px 90px rgba(15,23,42,0.30), 0 0 0 1px rgba(255,255,255,0.10)',
        }}
      >
        {/* HEADER */}
        <PaiementModalHeader onClose={onClose} employe={employe} theme={theme} themeIsDark={isDark} />

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* LEFT SIDEBAR */}
            <aside
              className="hidden lg:flex flex-col border-r min-h-0"
              style={{ borderColor: theme.border, background: theme.headerBg }}
            >
              <div className="flex-1 overflow-y-auto p-3">
                <PaiementEmployeeInfo employe={employe} imageUrl={imageUrl} theme={theme} themeIsDark={isDark} />
              </div>
              <div className="shrink-0 border-t px-3 py-2" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>Période</span>
                  <span className="px-2 py-0.5 rounded-md text-[13px] font-bold border"
                    style={{ background: theme.primaryBg, borderColor: theme.primaryBorder, color: theme.primary }}>
                    {moisLabels[paiementMois - 1] || '—'} {paiementAnnee}
                  </span>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="min-w-0 min-h-0 overflow-y-auto">
              <div className="p-3 sm:p-4 space-y-3">
                {/* MOBILE EMPLOYEE INFO */}
                <div className="lg:hidden">
                  <PaiementEmployeeInfo employe={employe} imageUrl={imageUrl} theme={theme} themeIsDark={isDark} />
                </div>

                {/* PERIOD */}
                <PaiementPeriodSelector employe={employe} paiementMois={paiementMois} paiementAnnee={paiementAnnee}
                  anneeEmbauche={anneeEmbauche} historiquePaiements={historiquePaiements}
                  isMoisPaye={isMoisPaye} isMoisFutur={isMoisFutur} isMoisAvantEmbauche={isMoisAvantEmbauche}
                  onMoisClick={(mois, annee) => { onMoisChange(mois); onAnneeChange(annee); }}
                  onAnneeChange={onAnneeChange} getMoisPourAnnee={getMoisPourAnnee} moisLabels={moisLabels}
                  theme={theme} themeIsDark={isDark} />

                {/* PAYMENT INPUTS */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <PaiementAmountInput paiementMontant={paiementMontant} employe={employe} estPaye={estPaye}
                    onMontantChange={onMontantChange} theme={theme} />

                  {/* MODE DE PAIEMENT */}
                  <div className="rounded-xl border overflow-hidden" style={{ background: theme.cardSecondary, borderColor: theme.border }}>
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: theme.border, background: theme.headerBg }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: theme.primaryBg, color: theme.primary }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="M3 10h18" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: theme.text }}>Mode de paiement</p>
                        <p className="text-[13px] mt-0.5" style={{ color: theme.muted }}>Choisissez le mode utilisé</p>
                      </div>
                    </div>
                    <div className="p-3">
                      <select value={modePaiement} onChange={(e) => setModePaiement(e.target.value)} disabled={estPaye}
                        className="w-full h-10 px-3 rounded-lg border outline-none text-[13px] font-semibold transition-all"
                        style={{ background: theme.inputBg, borderColor: theme.borderStrong, color: theme.text }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = theme.borderStrong; e.currentTarget.style.boxShadow = 'none'; }}>
                        <option value="Espèces">Espèces</option>
                        <option value="Virement">Virement</option>
                        <option value="Chèque">Chèque</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Carte bancaire">Carte bancaire</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* OBSERVATION */}
                <div className="rounded-xl border overflow-hidden" style={{ background: theme.cardSecondary, borderColor: theme.border }}>
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: theme.border, background: theme.headerBg }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: theme.primaryBg, color: theme.primary }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: theme.text }}>Observation</p>
                      <p className="text-[13px] mt-0.5" style={{ color: theme.muted }}>Informations complémentaires</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <textarea value={observation} onChange={(e) => setObservation(e.target.value)} disabled={estPaye}
                      rows={2} placeholder="Observation facultative..."
                      className="w-full min-h-[60px] px-3 py-2 rounded-lg border outline-none resize-none text-[13px] font-medium transition-all"
                      style={{ background: theme.inputBg, borderColor: theme.borderStrong, color: theme.text }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = theme.borderStrong; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t px-4 py-2.5 flex items-center justify-end"
          style={{ borderColor: theme.border, background: theme.headerBg }}>
          <PaiementActions estPaye={estPaye} onClose={onClose} onPayerClick={handlePayer} theme={theme} themeIsDark={isDark} />
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <PaiementConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirm}
        employe={employe} paiementMois={paiementMois} paiementAnnee={paiementAnnee}
        paiementMontant={paiementMontant} moisLabels={moisLabels} theme={theme} themeIsDark={isDark} />
    </div>,
    document.body
  );
};

export default EmployesPaiementModal;