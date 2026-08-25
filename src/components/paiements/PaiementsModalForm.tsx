// ============================================================
// src/components/paiements/PaiementsModalForm.tsx
// ⭐ FIX: TSY MISY createPortal - MAMPISAO RETURN NULL
// ⭐ FIX: MAMPISAO FALLBACK HO AN'NY moisOptions SY annees
// ⭐ FIX: ESRINA NY ICON REHETRA AFA-TSY NY BOUTON
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CreditCard, X, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = {
  light: {
    overlay: 'rgba(15, 23, 42, 0.55)', card: '#FFFFFF', header: '#FFFFFF', footer: '#F8FAFC', border: '#E2E8F0',
    input: '#FFFFFF', inputMuted: '#F8FAFC', text: '#202124', muted: '#5F6368', subMuted: '#80868B',
    primary: '#6366F1', primaryHover: '#4F46E5', primarySoft: '#EEF2FF', danger: '#D93025', dangerSoft: '#FCE8E6', success: '#188038'
  },
  dark: {
    overlay: 'rgba(0, 0, 0, 0.72)', card: '#0F172A', header: '#0F172A', footer: '#0F172A', border: '#334155',
    input: '#0F172A', inputMuted: '#111827', text: '#F8FAFC', muted: '#CBD5E1', subMuted: '#94A3B8',
    primary: '#6366F1', primaryHover: '#818CF8', primarySoft: 'rgba(99, 102, 241, 0.12)', danger: '#F28B82', dangerSoft: 'rgba(242, 139, 130, 0.10)', success: '#81C995'
  },
};

const defaultMoisOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Mois ${i + 1}` }));
const defaultAnnees = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

interface Employe { id: number; nom?: string; prenom?: string; poste?: string; email?: string; }
interface PaiementsModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingPaiement: any | null;
  employes: Employe[];
  moisOptions?: { value: number; label: string }[];
  annees?: number[];
  isDark?: boolean;
}

const PaiementsModalForm: React.FC<PaiementsModalFormProps> = ({ isOpen, onClose, onSubmit, editingPaiement, employes, moisOptions, annees, isDark: propIsDark }) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState<number>(Number(editingPaiement?.montant || 0));
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  const safeMoisOptions = moisOptions && moisOptions.length > 0 ? moisOptions : defaultMoisOptions;
  const safeAnnees = annees && annees.length > 0 ? annees : defaultAnnees;

  const defaultDate = useMemo(() => {
    if (editingPaiement) return new Date(Number(editingPaiement.annee), Number(editingPaiement.mois) - 1, 1);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [editingPaiement]);

  // ⭐ FIX: Console.log mba hahitana ny isOpen
  useEffect(() => {
    console.log('🟢 PaiementsModalForm useEffect isOpen:', isOpen);
    if (!isOpen) { setIsVisible(false); return; }
    const timer = window.setTimeout(() => setIsVisible(true), 10);
    console.log('🟢 Timer natomboka, hisokatra ny modal');
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedDate(defaultDate);
    setAmount(Number(editingPaiement?.montant || 0));
    setSelectedEmployeId(editingPaiement?.employe_id || null);
  }, [isOpen, defaultDate, editingPaiement]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); formRef.current?.requestSubmit(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ⭐ FIX: Tsy misy createPortal, mampiasa return null
  if (!isOpen) return null;

  const handleDateChange = (date: Date | null) => setSelectedDate(date);
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => { const value = Number(e.target.value); setAmount(Number.isFinite(value) ? value : 0); };
  const handleClose = () => { setIsVisible(false); window.setTimeout(() => onClose(), 100); };

  const inputClass = `w-full h-10 px-3 rounded-lg border text-[14.5px] font-medium outline-none transition-all duration-150 focus:ring-2 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-[#8AB4F8] focus:ring-[#8AB4F8]/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:ring-[#6366F1]/15'}`;
  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeId) return null;
    return employes.find(e => Number(e.id) === Number(selectedEmployeId)) || null;
  }, [employes, selectedEmployeId]);

  const employeeName = selectedEmployee ? `${selectedEmployee.prenom || ''} ${selectedEmployee.nom || ''}`.trim() : (editingPaiement ? `${editingPaiement.prenom || ''} ${editingPaiement.nom || ''}`.trim() : '—');
  const formatAmount = (value: number) => `${Number(value || 0).toLocaleString('fr-FR')} Ar`;
  const periodLabel = selectedDate ? selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-200" style={{ background: theme.overlay, backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true" aria-labelledby="paiement-modal-title" onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className={`relative flex w-full max-w-4xl max-h-[82vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.25)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.985] opacity-0'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={`flex shrink-0 items-center justify-between border-b px-6 py-4 ${borderClass}`} style={{ background: theme.header }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primarySoft, color: theme.primary }}><CreditCard className="h-[18px] w-[18px]" strokeWidth={2} /></div>
            <div>
              <h2 id="paiement-modal-title" className="text-[17px] font-semibold tracking-tight" style={{ color: theme.text }}>{editingPaiement ? 'Modifier le paiement' : 'Nouveau paiement'}</h2>
              <p className="mt-0.5 text-[14px]" style={{ color: theme.subMuted }}>{editingPaiement ? 'Modifiez les informations de ce paiement.' : 'Enregistrez un nouveau paiement.'}</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-full transition-colors" style={{ color: theme.muted }} onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F3F4'; e.currentTarget.style.color = theme.text; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}><X className="h-[18px] w-[18px]" strokeWidth={2} /></button>
        </div>

        {/* FORM */}
        <form ref={formRef} onSubmit={onSubmit} className="flex-1 overflow-y-auto custom-modal-scrollbar">
          <div className="p-6">
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
              {/* SIDEBAR */}
              <aside>
                <div className={`sticky top-0 overflow-hidden rounded-xl border ${borderClass}`} style={{ background: isDark ? '#111827' : '#F8FAFC' }}>
                  <div className={`flex items-center gap-2 border-b px-4 py-3 ${borderClass}`}>
                    {/* ⭐ FIX: ESRINA NY ICON */}
                    <span className="text-[14.5px] font-semibold" style={{ color: theme.text }}>Résumé</span>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14.5px]" style={{ color: theme.muted }}>Employé</span>
                        <span className="max-w-[120px] truncate text-right text-[14.5px] font-medium" style={{ color: theme.text }} title={employeeName}>{employeeName || '—'}</span>
                      </div>
                      {(selectedEmployee?.poste || editingPaiement?.poste) && <div className="flex items-center justify-between gap-3">
                        <span className="text-[14.5px]" style={{ color: theme.muted }}>Poste</span>
                        <span className="max-w-[120px] truncate text-right text-[14px] font-medium" style={{ color: theme.text }}>{selectedEmployee?.poste || editingPaiement?.poste}</span>
                      </div>}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14.5px]" style={{ color: theme.muted }}>Période</span>
                        <span className="text-right text-[14px] font-medium capitalize" style={{ color: theme.text }}>{periodLabel}</span>
                      </div>
                    </div>
                    <div className="my-4 h-px" style={{ background: theme.border }} />
                    <div>
                      <div className="mb-1 text-[14.5px] font-medium" style={{ color: theme.muted }}>Montant</div>
                      <div className="text-[22px] font-semibold tracking-tight" style={{ color: theme.primary }}>{formatAmount(amount)}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: isDark ? 'rgba(99,102,241,0.08)' : '#EEF2FF' }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <span className="text-[12px] font-medium" style={{ color: isDark ? '#A5B4FC' : '#4F46E5' }}>{editingPaiement ? 'Modification' : 'Nouveau paiement'}</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* MAIN FORM */}
              <div className="min-w-0">
                <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
                  <FormField label="Employé" required className="md:col-span-2">
                    <div className="relative">
                      <select name="employe_id" defaultValue={editingPaiement?.employe_id || ''} required className={`${inputClass} appearance-none cursor-pointer pr-9`}>
                        <option value="">Sélectionner un employé</option>
                        {employes.map((employee) => <option key={employee.id} value={employee.id}>{employee.prenom || ''} {employee.nom || ''}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.subMuted }}>▾</span>
                    </div>
                  </FormField>

                  <FormField label="Période" required className="md:col-span-2">
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      showFullMonthYearPicker
                      className={`${inputClass} w-full`}
                      wrapperClassName="w-full"
                      popperClassName={isDark ? 'dark-datepicker-popper' : 'light-datepicker-popper'}
                      calendarClassName={`${isDark ? 'dark-datepicker' : 'light-datepicker'} ${borderClass}`}
                      placeholderText="Sélectionner un mois/année"
                      isClearable={false}
                    />
                    <input type="hidden" name="mois" value={selectedDate ? selectedDate.getMonth() + 1 : ''} />
                    <input type="hidden" name="annee" value={selectedDate ? selectedDate.getFullYear() : ''} />
                  </FormField>

                  <FormField label="Montant" required>
                    <div className="relative">
                      <input type="number" name="montant" value={amount} onChange={handleAmountChange} required min="0" step="1" inputMode="numeric" className={`${inputClass} pr-14 text-[15px] font-semibold`} placeholder="0" />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14.5px] font-medium" style={{ color: theme.subMuted }}>Ar</span>
                    </div>
                  </FormField>

                  <FormField label="Mode de paiement">
                    <div className="relative">
                      <select name="mode_paiement" defaultValue={editingPaiement?.mode_paiement || 'Espèces'} className={`${inputClass} appearance-none cursor-pointer pr-9`}>
                        <option value="Espèces">Espèces</option>
                        <option value="Virement">Virement</option>
                        <option value="Chèque">Chèque</option>
                        <option value="Mobile Money">Mobile Money</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.subMuted }}>▾</span>
                    </div>
                  </FormField>

                  <FormField label="Référence">
                    <input type="text" name="reference" defaultValue={editingPaiement?.reference || ''} className={inputClass} placeholder="REF-001" autoComplete="off" />
                  </FormField>

                  <FormField label="Date de paiement">
                    <input type="date" name="date_paiement" defaultValue={editingPaiement?.date_paiement ? String(editingPaiement.date_paiement).slice(0, 10) : new Date().toISOString().slice(0, 10)} className={inputClass} />
                  </FormField>

                  <div className="md:col-span-2">
                    <FormField label="Observation">
                      <textarea
                        name="observation"
                        defaultValue={editingPaiement?.observation || ''}
                        rows={3}
                        className={`w-full resize-none rounded-lg border px-3 py-2.5 text-[14.5px] font-medium outline-none transition-all focus:ring-2 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-[#8AB4F8] focus:ring-[#8AB4F8]/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#6366F1] focus:ring-[#6366F1]/15'}`}
                        placeholder="Ajoutez une observation si nécessaire..."
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className={`flex shrink-0 items-center justify-between border-t px-6 py-3 ${borderClass}`} style={{ background: theme.footer }}>
          <span className="hidden text-[12px] sm:block" style={{ color: theme.subMuted }}>Échap pour fermer · Ctrl + Entrée pour enregistrer</span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={handleClose} className="h-9 rounded-lg px-4 text-[14.5px] font-medium transition-colors" style={{ color: theme.muted }} onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? '#1E293B' : '#F1F3F4'; e.currentTarget.style.color = theme.text; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}>Annuler</button>
            <button type="button" onClick={() => formRef.current?.requestSubmit()} className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-[14.5px] font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.background = theme.primary; }}><Plus className="h-4 w-4" strokeWidth={2} />{editingPaiement ? 'Enregistrer' : 'Ajouter le paiement'}</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(6px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .custom-modal-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-modal-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.25); border-radius: 999px; }
        .custom-modal-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.4); }
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker-popper { z-index: 100000 !important; }
        .react-datepicker { border-radius: 12px !important; overflow: hidden; font-family: inherit !important; box-shadow: 0 20px 50px rgba(0,0,0,0.18) !important; }
        .react-datepicker__header { padding-top: 12px !important; }
        .react-datepicker__current-month { font-size: 14px !important; font-weight: 600 !important; }
        .react-datepicker__month-text { border-radius: 8px !important; margin: 4px !important; padding: 8px 4px !important; transition: all 120ms ease; }
        .react-datepicker__month-text:hover { background: #6366F1 !important; color: white !important; }
        .react-datepicker__month-text--selected, .react-datepicker__month-text--keyboard-selected { background: #6366F1 !important; color: white !important; font-weight: 600 !important; }
        .dark-datepicker-popper .react-datepicker, .dark-datepicker { background-color: #0F172A !important; border-color: #334155 !important; color: #F8FAFC !important; }
        .dark-datepicker-popper .react-datepicker__header { background-color: #111827 !important; border-color: #334155 !important; }
        .dark-datepicker-popper .react-datepicker__current-month, .dark-datepicker-popper .react-datepicker__month-text { color: #F8FAFC !important; }
        .dark-datepicker-popper .react-datepicker__month-text:hover { background: #6366F1 !important; color: #FFFFFF !important; }
        .dark-datepicker-popper .react-datepicker__month-text--selected, .dark-datepicker-popper .react-datepicker__month-text--keyboard-selected { background: #6366F1 !important; color: #FFFFFF !important; }
        .dark-datepicker-popper .react-datepicker__navigation-icon::before { border-color: #CBD5E1 !important; }
        .light-datepicker-popper .react-datepicker, .light-datepicker { background-color: #FFFFFF !important; border-color: #E2E8F0 !important; }
        .light-datepicker-popper .react-datepicker__header { background-color: #F8FAFC !important; border-color: #E2E8F0 !important; }
        .light-datepicker-popper .react-datepicker__current-month, .light-datepicker-popper .react-datepicker__month-text { color: #0F172A !important; }
        .light-datepicker-popper .react-datepicker__month-text:hover { background: #6366F1 !important; color: #FFFFFF !important; }
        .light-datepicker-popper .react-datepicker__month-text--selected, .light-datepicker-popper .react-datepicker__month-text--keyboard-selected { background: #6366F1 !important; color: #FFFFFF !important; }
      `}</style>
    </div>
  );
};

// ⭐ FormField - ESRINA NY ICON
const FormField: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; required?: boolean; className?: string; }> = ({ label, children, icon, required = false, className = '' }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="flex items-center gap-1.5 text-[14.5px] font-medium" style={{ color: theme.muted }}>
        {/* ⭐ FIX: ESRINA NY ICON */}
        <span>{label}{required && <span className="ml-1" style={{ color: theme.danger }}>*</span>}</span>
      </label>
      {children}
    </div>
  );
};

export default PaiementsModalForm;