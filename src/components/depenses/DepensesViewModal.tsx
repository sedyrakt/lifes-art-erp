// ============================================================
// src/components/depenses/DepensesViewModal.tsx
// ============================================================
// ⭐ PREMIUM DEPENSE VIEW MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY (identique aux tables)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Hash, Calendar, DollarSign, Wallet, Building2, Edit3, Tag, Info, Clock3, CreditCard, TrendingDown, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: { overlay: 'rgba(15, 23, 42, 0.52)', card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', borderSoft: '#F1F5F9', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#4F46E5', primaryHover: '#4338CA', primaryBg: '#EEF2FF', primaryBorder: '#C7D2FE', danger: '#DC2626', dangerBg: '#FEF2F2' },
  dark: { overlay: 'rgba(3, 3, 3, 0.78)', card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111827', border: '#1E293B', borderSoft: '#1E293B', text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primaryBg: 'rgba(99, 102, 241, 0.11)', primaryBorder: 'rgba(129, 140, 248, 0.22)', danger: '#F87171', dangerBg: 'rgba(239, 68, 68, 0.08)' }
};

interface Depense { id: number; categorie: string; description: string; montant: number; date_depense: string; mode_paiement: string; reference: string; fournisseur_id: number; fournisseur_nom?: string; observation: string; created_at: string; }
interface DepensesViewModalProps { depense: Depense; onClose: () => void; onEdit: () => void; categoryIcons: Record<string, any>; categoryColors: (cat: string) => { light: string; dark: string; text: string; }; isDark?: boolean; }

// ============================================================
// FORM CELL
// ============================================================

const FormCell: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; }> = ({ label, children, icon }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  return (
    <div className={`min-w-0 px-4 py-2.5 border-b border-r ${borderClass}`} style={{ background: theme.surface }}>
      <div className="mb-1 flex items-center gap-1.5">
        {icon && <span className="flex shrink-0 items-center" style={{ color: theme.subtle }}>{icon}</span>}
        <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.subtle }}>{label}</span>
      </div>
      <div className="min-w-0 break-words text-[14px] font-medium leading-4" style={{ color: theme.text }}>{children}</div>
    </div>
  );
};

// ============================================================
// SECTION TITLE
// ============================================================

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; theme: typeof COLORS.light | typeof COLORS.dark; }> = ({ icon, title, theme }) => {
  const { isDark } = useTheme();
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  return (
    <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: theme.primaryBg, color: theme.primary }}>{icon}</div>
      <span className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>{title}</span>
    </div>
  );
};

// ============================================================
// INFO ROW
// ============================================================

const InfoRow: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-medium" style={{ color: theme.muted }}>{label}</span>
      <span className="min-w-0 truncate text-right text-[13px] font-semibold" style={{ color: theme.text }}>{value}</span>
    </div>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const DepensesViewModal: React.FC<DepensesViewModalProps> = ({ depense, onClose, onEdit, categoryIcons, categoryColors }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [onClose]);
  useEffect(() => { const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previousOverflow; }; }, []);

  const CategoryIcon = categoryIcons[depense.categorie] || Tag;
  const category = categoryColors(depense.categorie);
  const categoryBg = isDark ? category.dark : category.light;
  const categoryText = category.text;

  const formattedDate = depense.date_depense ? new Date(depense.date_depense).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const formattedCreatedAt = depense.created_at ? new Date(depense.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  return createPortal(
    <div className={`fixed inset-0 z-[999999] flex items-center justify-center transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: theme.overlay, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true" aria-labelledby="depense-view-title" onMouseDown={handleOverlayMouseDown}>
      <div className={`relative flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:px-6 ${borderClass}`} style={{ background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primaryBg, color: theme.primary }}>
              <TrendingDown className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2 id="depense-view-title" className="truncate text-[15px] font-semibold tracking-tight sm:text-[16px]" style={{ color: theme.text }}>Détails de la dépense</h2>
                {depense.reference && (
                  <span className="hidden shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primaryBg, borderColor: theme.primaryBorder }}>
                    {depense.reference}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[13px]" style={{ color: theme.muted }}>Informations détaillées de la dépense</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 active:scale-95 dark:hover:bg-white/[0.06]" style={{ color: theme.muted }}>
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="custom-depense-view-scroll flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
              {/* SIDEBAR */}
              <aside className="flex flex-col gap-3">
                <div className={`relative flex min-h-[175px] flex-col items-center justify-center overflow-hidden rounded-xl border p-4 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl" style={{ background: theme.primaryBg }} />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: categoryBg, color: categoryText }}>
                    <CategoryIcon className="h-8 w-8" strokeWidth={1.8} />
                  </div>
                  <span className="mt-3 max-w-[90%] truncate text-center text-[14px] font-semibold" style={{ color: theme.text }}>{depense.categorie}</span>
                  <span className="mt-0.5 text-[12px]" style={{ color: theme.muted }}>Catégorie</span>
                </div>

                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                  <SectionTitle icon={<Wallet className="h-3.5 w-3.5" />} title="Résumé" theme={theme} />
                  <div className="space-y-2 p-3">
                    <InfoRow label="Référence" value={depense.reference || '—'} />
                    <div className="h-px" style={{ background: theme.borderSoft }} />
                    <div className="flex items-end justify-between gap-2">
                      <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Montant</span>
                      <span className="text-right text-[16px] font-bold" style={{ color: theme.primary }}>{formatMoney(depense.montant)}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${borderClass}`} style={{ background: theme.surface }}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primaryBg, color: theme.primary }}>
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px]" style={{ color: theme.subtle }}>Date de dépense</p>
                    <p className="mt-0.5 truncate text-[13px] font-semibold" style={{ color: theme.text }}>{formattedDate}</p>
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT */}
              <section className="min-w-0 space-y-3">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                  <SectionTitle icon={<Info className="h-3.5 w-3.5" />} title="Informations générales" theme={theme} />
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l ${borderClass}`}>
                    <FormCell label="Catégorie" icon={<Tag className="h-3.5 w-3.5" />}>
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold" style={{ background: categoryBg, color: categoryText }}>
                        <CategoryIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{depense.categorie}</span>
                      </span>
                    </FormCell>
                    <FormCell label="Date" icon={<Calendar className="h-3.5 w-3.5" />}>{formattedDate}</FormCell>
                    <FormCell label="Mode de paiement" icon={<CreditCard className="h-3.5 w-3.5" />}>{depense.mode_paiement || '—'}</FormCell>
                    <FormCell label="Montant" icon={<DollarSign className="h-3.5 w-3.5" />}>
                      <span className="font-bold" style={{ color: theme.primary }}>{formatMoney(depense.montant)}</span>
                    </FormCell>
                    <FormCell label="Référence" icon={<Hash className="h-3.5 w-3.5" />}>
                      <span className="font-mono text-[12px]">{depense.reference || '—'}</span>
                    </FormCell>
                    <FormCell label="Fournisseur" icon={<Building2 className="h-3.5 w-3.5" />}>
                      {depense.fournisseur_nom || <span style={{ color: theme.muted }}>Non spécifié</span>}
                    </FormCell>
                    <FormCell label="Description" icon={<FileText className="h-3.5 w-3.5" />}>{depense.description || <span style={{ color: theme.muted }}>—</span>}</FormCell>
                    <FormCell label="Observation" icon={<FileText className="h-3.5 w-3.5" />}>{depense.observation || <span style={{ color: theme.muted }}>—</span>}</FormCell>
                    <FormCell label="Créé le" icon={<Clock3 className="h-3.5 w-3.5" />}><span style={{ color: theme.muted }}>{formattedCreatedAt}</span></FormCell>
                  </div>
                </div>

                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.primaryBg }}>
                  <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${borderClass}`}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: theme.primaryBg, color: theme.primary }}>
                      <DollarSign className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>Résumé financier</span>
                  </div>
                  <div className="p-3">
                    <div className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${borderClass}`} style={{ background: theme.surface }}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primaryBg, color: theme.primary }}>
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.05em]" style={{ color: theme.muted }}>Montant total</p>
                          <p className="mt-0.5 text-[12px]" style={{ color: theme.subtle }}>Dépense enregistrée</p>
                        </div>
                      </div>
                      <span className="text-[20px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatMoney(depense.montant)}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3 sm:px-6 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
          <span className="hidden text-[11px] font-medium sm:block" style={{ color: theme.subtle }}>Échap pour fermer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className={`h-8 rounded-lg border px-3 text-[13px] font-medium transition-all duration-150 hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05] ${borderClass}`} style={{ background: 'transparent', color: theme.text }}>
              Fermer
            </button>
            <button type="button" onClick={onEdit} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.background = theme.primary; }}>
              <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />Modifier
            </button>
          </div>
        </footer>

        <style>{`
          .custom-depense-view-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-depense-view-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-depense-view-scroll::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.24); border-radius: 999px; }
          .custom-depense-view-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.40); }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default DepensesViewModal;