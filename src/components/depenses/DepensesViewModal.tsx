// src/components/depenses/DepensesViewModal.tsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit3, Tag, TrendingDown, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: { card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', borderStrong: '#CBD5E1', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5', primarySoft: 'rgba(99,102,241,0.08)', primaryBorder: 'rgba(99,102,241,0.18)' },
  dark: { card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', border: '#334155', borderStrong: '#475569', text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primarySoft: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.25)' }
} as const;

interface Depense {
  id: number; categorie: string; description: string; montant: number; date_depense: string;
  mode_paiement: string; reference: string; fournisseur_id: number; fournisseur_nom?: string;
  observation: string; created_at: string;
}

interface DepensesViewModalProps {
  depense: Depense; onClose: () => void; onEdit: () => void;
  categoryIcons: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>>;
  categoryColors: (cat: string) => { light: string; dark: string; text: string; };
  isDark?: boolean;
}

interface FormCellProps { label: string; children: React.ReactNode; borderRight?: boolean; borderBottom?: boolean; fullWidth?: boolean; }

const FormCell: React.FC<FormCellProps> = ({ label, children, borderRight = true, borderBottom = true, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const border = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  return (
    <div className={`flex min-w-0 items-center px-3 py-2.5 ${borderRight ? `border-r ${border}` : ''} ${borderBottom ? `border-b ${border}` : ''} ${fullWidth ? 'col-span-3' : ''}`} style={{ background: theme.card }}>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 truncate text-[11px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>{label || ' '}</div>
        <div className="min-w-0 text-[13px] font-normal leading-5" style={{ color: theme.text }}>{children}</div>
      </div>
    </div>
  );
};

const DepensesViewModal: React.FC<DepensesViewModalProps> = ({ depense, onClose, onEdit, categoryIcons, categoryColors, isDark: isDarkProp }) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : contextIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!depense) return null;

  const CategoryIcon = categoryIcons?.[depense.categorie] || Tag;
  const category = categoryColors(depense.categorie);
  const categoryBg = isDark ? category.dark : category.light;
  const categoryText = category.text;
  const formattedDate = depense.date_depense ? new Date(depense.date_depense).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const formattedCreatedAt = depense.created_at ? new Date(depense.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const amount = Number(depense.montant || 0);

  return createPortal(
    <div className={`fixed inset-0 z-[999999] flex items-center justify-center p-3 transition-opacity duration-200 sm:p-5 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true" aria-labelledby="depense-view-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={(event) => event.stopPropagation()}>
        {/* TOP INDIGO LINE */}
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-5 ${borderClass}`} style={{ background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary }}>
              <TrendingDown className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2 id="depense-view-title" className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>Détails de la dépense</h2>
                {depense.reference && <span className="hidden shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primarySoft, borderColor: theme.primaryBorder }}>{depense.reference}</span>}
              </div>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Informations détaillées de la dépense</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500" style={{ color: theme.muted }}>
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* SIDEBAR */}
              <aside className="w-full shrink-0 lg:w-[200px]">
                <div className="flex flex-col gap-3">
                  {/* CATEGORY CARD */}
                  <div className={`relative aspect-square overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.card }}>
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 p-4 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white shadow-lg">
                        <CategoryIcon className="h-8 w-8" strokeWidth={1.8} />
                      </div>
                      <p className="mt-3 max-w-full truncate px-2 text-[14px] font-bold text-white">{depense.categorie || 'Non spécifiée'}</p>
                      <p className="mt-1 text-[11px] text-white/70">Catégorie</p>
                    </div>
                  </div>

                  {/* SUMMARY CARD */}
                  <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.card }}>
                    <div className={`border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
                      <span className="text-[11px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Résumé</span>
                    </div>
                    <div className="space-y-2.5 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-normal" style={{ color: theme.muted }}>Référence</span>
                        <span className="max-w-[105px] truncate text-right text-[12px] font-normal" style={{ color: theme.text }}>{depense.reference || '—'}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-normal" style={{ color: theme.muted }}>Date</span>
                        <span className="max-w-[105px] truncate text-right text-[12px] font-normal" style={{ color: theme.text }}>{formattedDate}</span>
                      </div>
                      <div className="my-2 h-px" style={{ background: theme.border }} />
                      <div>
                        <div className="mb-0.5 flex items-center gap-1 text-[11px] font-normal" style={{ color: theme.muted }}>
                          <DollarSign className="h-3 w-3" />
                          Montant
                        </div>
                        <div className="text-[15px] font-semibold tracking-tight" style={{ color: theme.primary }}>{formatMoney(amount)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT */}
              <div className="min-w-0 flex-1 space-y-4">
                {/* INFORMATIONS GÉNÉRALES */}
                <section className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
                    <span className="text-[12px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Informations générales</span>
                  </div>
                  <div className={`grid grid-cols-1 border-l border-t sm:grid-cols-2 lg:grid-cols-3 ${borderClass}`}>
                    <FormCell label="Catégorie">
                      <span className="inline-flex max-w-full items-center rounded-md px-2 py-1 text-[11px] font-semibold" style={{ background: categoryBg, color: categoryText }}>
                        <span className="truncate">{depense.categorie || 'Non spécifiée'}</span>
                      </span>
                    </FormCell>
                    <FormCell label="Date">
                      <span className="block truncate text-[13px] font-medium" style={{ color: theme.text }}>{formattedDate}</span>
                    </FormCell>
                    <FormCell label="Mode de paiement" borderRight={false}>
                      <span className="block truncate text-[13px] font-medium" style={{ color: theme.text }}>{depense.mode_paiement || '—'}</span>
                    </FormCell>
                    <FormCell label="Montant">
                      <span className="block text-[14px] font-bold" style={{ color: theme.primary }}>{formatMoney(amount)}</span>
                    </FormCell>
                    <FormCell label="Référence">
                      <span className="block truncate font-mono text-[13px] font-medium" style={{ color: theme.text }}>{depense.reference || '—'}</span>
                    </FormCell>
                    <FormCell label="Fournisseur" borderRight={false}>
                      <span className="block truncate text-[13px] font-medium" style={{ color: theme.text }}>{depense.fournisseur_nom || <span style={{ color: theme.muted }}>Non spécifié</span>}</span>
                    </FormCell>
                    <FormCell label="Description">
                      <span className="block truncate text-[13px] font-medium" style={{ color: theme.text }} title={depense.description || ''}>{depense.description || <span style={{ color: theme.muted }}>—</span>}</span>
                    </FormCell>
                    <FormCell label="Observation">
                      <span className="block truncate text-[13px] font-medium" style={{ color: theme.text }} title={depense.observation || ''}>{depense.observation || <span style={{ color: theme.muted }}>—</span>}</span>
                    </FormCell>
                    <FormCell label="Créé le" borderRight={false}>
                      <span className="block truncate text-[13px] font-medium" style={{ color: theme.muted }}>{formattedCreatedAt}</span>
                    </FormCell>
                  </div>
                </section>

                {/* RÉSUMÉ FINANCIER */}
                <section className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
                    <span className="text-[12px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Résumé financier</span>
                  </div>
                  <div className="space-y-2.5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Montant total</span>
                      <span className="text-[13px] font-semibold" style={{ color: theme.text }}>{formatMoney(amount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Date de dépense</span>
                      <span className="text-[13px] font-semibold" style={{ color: theme.text }}>{formattedDate}</span>
                    </div>
                    <div className="my-2 h-px" style={{ background: theme.border }} />
                    <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder }}>
                      <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: theme.primary }}>Total dépense</span>
                      <span className="text-[18px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatMoney(amount)}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-4 py-2.5 sm:px-5 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
          <span className="hidden text-[10px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className={`h-8 rounded-lg border px-3 text-[12px] font-medium transition-all duration-150 hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05] ${borderClass}`} style={{ background: 'transparent', color: theme.text }}>Fermer</button>
            <button type="button" onClick={onEdit} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(event) => { event.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(event) => { event.currentTarget.style.background = theme.primary; }}>
              <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />Modifier
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default DepensesViewModal;