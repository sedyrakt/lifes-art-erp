// ============================================================
// src/components/depenses/DepensesModalForm.tsx
// ============================================================
// ⭐ PREMIUM DEPENSE FORM MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY (identique aux tables)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TrendingDown, X, Calendar, DollarSign, Hash, Wallet, Building, Tag, FileText, Info, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  light: {
    overlay: 'rgba(15, 23, 42, 0.52)',
    card: '#FFFFFF',
    header: '#FFFFFF',
    footer: '#F8FAFC',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    input: '#FFFFFF',
    inputMuted: '#F8FAFC',
    text: '#0F172A',
    muted: '#64748B',
    subMuted: '#94A3B8',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    primarySoft: '#EEF2FF',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
    success: '#16A34A',
    successSoft: '#F0FDF4'
  },
  dark: {
    overlay: 'rgba(0, 0, 0, 0.78)',
    card: '#0F172A',
    header: '#0F172A',
    footer: '#0F172A',
    border: '#1E293B',
    borderStrong: '#334155',
    input: '#0F172A',
    inputMuted: '#111827',
    text: '#F8FAFC',
    muted: '#94A3B8',
    subMuted: '#64748B',
    primary: '#818CF8',
    primaryHover: '#6366F1',
    primarySoft: 'rgba(99, 102, 241, 0.12)',
    danger: '#F87171',
    dangerSoft: 'rgba(239, 68, 68, 0.08)',
    success: '#4ADE80',
    successSoft: 'rgba(34, 197, 94, 0.08)'
  }
};

interface Depense { id: number; categorie: string; description: string; montant: number; date_depense: string; mode_paiement: string; reference: string; fournisseur_id: number; observation: string; created_at: string; }
interface DepensesModalFormProps { isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; editingDepense: Depense | null; fournisseurs: any[]; categories: string[]; modesPaiement: string[]; isDark: boolean; }

// ============================================================
// FORM FIELD
// ============================================================

const FormField: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; required?: boolean; className?: string }> = ({ label, children, icon, required = false, className = '' }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>
        {icon && <span className="flex items-center justify-center" style={{ color: theme.subMuted }}>{icon}</span>}
        <span>{label}{required && <span className="ml-1" style={{ color: theme.danger }}>*</span>}</span>
      </label>
      {children}
    </div>
  );
};

const inputBase = 'w-full h-9 rounded-lg border px-3 text-[14px] font-medium outline-none transition-all duration-150 focus:ring-2';

const SummaryRow: React.FC<{ label: string; value: string; theme: typeof COLORS.light | typeof COLORS.dark }> = ({ label, value, theme }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[12px] font-medium" style={{ color: theme.muted }}>{label}</span>
    <span className="max-w-[120px] truncate text-right text-[13px] font-semibold" style={{ color: theme.text }} title={value}>{value}</span>
  </div>
);

// ============================================================
// COMPONENT
// ============================================================

const DepensesModalForm: React.FC<DepensesModalFormProps> = ({ isOpen, onClose, onSubmit, editingDepense, fournisseurs, categories, modesPaiement, isDark: propIsDark }) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => { if (!isOpen) { setIsVisible(false); return; } const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, [isOpen]);
  useEffect(() => { if (!isOpen) return; const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previousOverflow; }; }, [isOpen]);
  useEffect(() => { if (!isOpen) return; const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); return; } if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') { e.preventDefault(); formRef.current?.requestSubmit(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatAmount = (amount: number) => `${Number(amount || 0).toLocaleString('fr-FR')} Ar`;
  const formattedDate = editingDepense?.date_depense ? new Date(editingDepense.date_depense).toLocaleDateString('fr-FR') : "Aujourd'hui";

  const inputClass = `${inputBase} ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'}`;
  const textareaClass = `w-full resize-none rounded-lg border px-3 py-2 text-[14px] font-medium outline-none transition-all focus:ring-2 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'}`;

  const modal = (
    <div className={`fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto p-3 sm:p-5 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: theme.overlay, backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="depense-modal-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-[920px] max-h-[86vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <div className={`flex shrink-0 items-center justify-between border-b px-5 py-3.5 sm:px-6 ${borderClass}`} style={{ background: theme.header }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primarySoft, color: theme.primary }}>
              <TrendingDown className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 id="depense-modal-title" className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>
                {editingDepense ? 'Modifier la dépense' : 'Nouvelle dépense'}
              </h2>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.subMuted }}>
                {editingDepense ? 'Modifiez les informations de cette dépense.' : 'Ajoutez une nouvelle dépense à votre registre.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800" style={{ color: theme.muted }}>
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* BODY */}
        <form ref={formRef} onSubmit={onSubmit} className="min-h-0 flex-1 overflow-y-auto custom-depense-scrollbar">
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              {/* SIDEBAR */}
              <aside className="min-w-0">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: isDark ? '#111827' : '#F8FAFC' }}>
                  <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${borderClass}`}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: theme.primarySoft, color: theme.primary }}>
                      <Info className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>Résumé</span>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      <SummaryRow label="Référence" value={editingDepense?.reference || 'Nouvelle'} theme={theme} />
                      <SummaryRow label="Date" value={formattedDate} theme={theme} />
                      <SummaryRow label="Catégorie" value={editingDepense?.categorie || '—'} theme={theme} />
                      <SummaryRow label="Paiement" value={editingDepense?.mode_paiement || '—'} theme={theme} />
                    </div>
                    <div className="my-2.5 h-px" style={{ background: theme.border }} />
                    <div>
                      <div className="mb-0.5 text-[12px] font-medium" style={{ color: theme.muted }}>Montant</div>
                      <div className="truncate text-[18px] font-bold tracking-tight" style={{ color: theme.primary }}>
                        {editingDepense ? formatAmount(editingDepense.montant) : '0 Ar'}
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: isDark ? 'rgba(99,102,241,0.08)' : '#EEF2FF' }}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                      <span className="text-[11px] font-semibold" style={{ color: isDark ? '#A5B4FC' : '#4F46E5' }}>
                        {editingDepense ? 'Mode modification' : 'Nouvelle dépense'}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* MAIN FORM */}
              <div className="min-w-0">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`}>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
                      <FormField label="Catégorie" required icon={<Tag className="h-3.5 w-3.5" />}>
                        <div className="relative">
                          <select name="categorie" defaultValue={editingDepense?.categorie || ''} required className={`${inputClass} appearance-none cursor-pointer pr-8`}>
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map((categorie) => <option key={categorie} value={categorie}>{categorie}</option>)}
                          </select>
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: theme.subMuted }}>▼</span>
                        </div>
                      </FormField>
                      <FormField label="Date" icon={<Calendar className="h-3.5 w-3.5" />}>
                        <input type="date" name="date_depense" defaultValue={editingDepense?.date_depense || new Date().toISOString().split('T')[0]} className={inputClass} />
                      </FormField>
                      <FormField label="Mode de paiement" icon={<Wallet className="h-3.5 w-3.5" />}>
                        <div className="relative">
                          <select name="mode_paiement" defaultValue={editingDepense?.mode_paiement || 'Espèces'} className={`${inputClass} appearance-none cursor-pointer pr-8`}>
                            {modesPaiement.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                          </select>
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: theme.subMuted }}>▼</span>
                        </div>
                      </FormField>
                      <FormField label="Fournisseur" icon={<Building className="h-3.5 w-3.5" />}>
                        <div className="relative">
                          <select name="fournisseur_id" defaultValue={editingDepense?.fournisseur_id || ''} className={`${inputClass} appearance-none cursor-pointer pr-8`}>
                            <option value="">Aucun fournisseur</option>
                            {fournisseurs.map((fournisseur) => <option key={fournisseur.id} value={fournisseur.id}>{fournisseur.nom}</option>)}
                          </select>
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: theme.subMuted }}>▼</span>
                        </div>
                      </FormField>
                      <div className="md:col-span-2">
                        <FormField label="Description" required icon={<FileText className="h-3.5 w-3.5" />}>
                          <input type="text" name="description" defaultValue={editingDepense?.description || ''} required className={inputClass} placeholder="Description de la dépense" />
                        </FormField>
                      </div>
                      <FormField label="Montant" required icon={<DollarSign className="h-3.5 w-3.5" />}>
                        <div className="relative">
                          <input type="number" name="montant" defaultValue={editingDepense?.montant || 0} required min="0" step="any" className={`${inputClass} pr-10 text-[14px] font-bold`} placeholder="0" />
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold" style={{ color: theme.subMuted }}>Ar</span>
                        </div>
                      </FormField>
                      <FormField label="Référence" icon={<Hash className="h-3.5 w-3.5" />}>
                        <input type="text" name="reference" defaultValue={editingDepense?.reference || `DEP-${Date.now().toString().slice(-4)}`} className={inputClass} placeholder="Référence" />
                      </FormField>
                      <div className="md:col-span-2">
                        <FormField label="Observation" icon={<FileText className="h-3.5 w-3.5" />}>
                          <textarea name="observation" defaultValue={editingDepense?.observation || ''} rows={3} className={textareaClass} placeholder="Ajoutez une observation si nécessaire..." />
                        </FormField>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className={`flex shrink-0 items-center justify-between gap-3 border-t px-5 py-2.5 sm:px-6 ${borderClass}`} style={{ background: theme.footer }}>
          <span className="hidden text-[11px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer · Ctrl + Entrée pour enregistrer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className={`h-8 rounded-lg px-3 text-[13px] font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${borderClass}`} style={{ background: 'transparent', color: theme.muted }}>
              Annuler
            </button>
            <button type="button" onClick={() => { formRef.current?.requestSubmit(); }} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.background = theme.primary; }}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              {editingDepense ? 'Enregistrer' : 'Ajouter la dépense'}
            </button>
          </div>
        </div>

        <style>{`
          .custom-depense-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-depense-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-depense-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.24); border-radius: 999px; }
          .custom-depense-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.40); }
        `}</style>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default DepensesModalForm;