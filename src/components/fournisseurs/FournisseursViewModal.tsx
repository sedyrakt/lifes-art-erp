// src/components/fournisseurs/FournisseursViewModal.tsx
import React, { useEffect, useState } from 'react';
import { Building2, X, Phone, Mail, Edit3, Hash, CheckCircle2 } from 'lucide-react';

const COLORS = {
  light: { card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5', primarySoft: 'rgba(99,102,241,0.08)', primaryBorder: 'rgba(99,102,241,0.18)', green: '#059669' },
  dark: { card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', border: '#334155', text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primarySoft: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.25)', green: '#34D399' }
};

interface Fournisseur { id: number; nom: string; contact: string; telephone: string; email: string; adresse: string; created_at: string; image?: string; }
interface FournisseursViewModalProps { fournisseur: Fournisseur; onClose: () => void; onEdit: () => void; isDark: boolean; imageUrl?: string | null; }

interface FormCellProps { label: string; children: React.ReactNode; borderRight?: boolean; borderBottom?: boolean; fullWidth?: boolean; }

const FormCell: React.FC<FormCellProps> = ({ label, children, borderRight = true, borderBottom = true, fullWidth = false }) => (
  <div className={['min-w-0 px-3 py-2.5', borderRight ? 'border-r border-slate-200 dark:border-white/[0.06]' : '', borderBottom ? 'border-b border-slate-200 dark:border-white/[0.06]' : '', fullWidth ? 'col-span-full' : ''].join(' ')}>
    <div className="mb-1 truncate text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500 dark:text-slate-400">{label}</div>
    <div className="min-w-0 text-[14px] font-normal leading-5">{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode; isDark: boolean; }> = ({ label, value, isDark }) => {
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="truncate text-[12px] font-medium" style={{ color: theme.muted }}>{label}</span>
      <span className="min-w-0 truncate text-right text-[13px] font-normal" style={{ color: theme.text }}>{value}</span>
    </div>
  );
};

const EmptyValue: React.FC<{ theme: typeof COLORS.light | typeof COLORS.dark; }> = ({ theme }) => <span style={{ color: theme.subMuted }}>Non spécifié</span>;

const FournisseursViewModal: React.FC<FournisseursViewModalProps> = ({ fournisseur, onClose, onEdit, imageUrl = null, isDark }) => {
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [onClose]);

  if (!fournisseur) return null;

  const getInitiales = (nom?: string) => { if (!nom) return '?'; return nom.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase(); };
  const formatDate = (date?: string) => { if (!date) return 'Non spécifiée'; const parsed = new Date(date); if (Number.isNaN(parsed.getTime())) return 'Date inconnue'; return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  const borderColor = theme.border;

  return (
    <div className={`fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: isDark ? 'rgba(12,12,12,0.82)' : 'rgba(15,23,42,0.52)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true" aria-labelledby="fournisseur-view-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.20)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'}`} style={{ background: theme.card, borderColor }} onMouseDown={(e) => e.stopPropagation()}>
        {/* TOP ACCENT */}
        <div className="absolute left-0 right-0 top-0 z-30 h-[2px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className="flex h-[62px] shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-5" style={{ borderColor, background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: theme.primaryBorder, background: theme.primarySoft, color: theme.primary }}>
              <Building2 className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2 id="fournisseur-view-title" className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>Détails du fournisseur</h2>
                <span className="hidden shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primarySoft, borderColor: theme.primaryBorder }}>
                  <Hash size={10} />{String(fournisseur.id).padStart(4, '0')}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Informations détaillées du fournisseur</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500" style={{ color: theme.muted }}>
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* SIDEBAR */}
            <aside className="w-full shrink-0 lg:w-[190px]">
              <div className="flex flex-col gap-3">
                {/* PROFILE */}
                <div className="relative aspect-square overflow-hidden rounded-xl border" style={{ background: theme.surfaceSoft, borderColor }}>
                  {imageUrl && !imageError ? (
                    <img src={imageUrl} alt={fournisseur.nom} loading="lazy" onError={() => setImageError(true)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white shadow-lg">{getInitiales(fournisseur.nom)}</div>
                    </div>
                  )}
                </div>
                {/* SUMMARY */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor }}>
                  <div className="border-b px-3 py-2.5" style={{ borderColor }}>
                    <span className="text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: theme.muted }}>Résumé</span>
                  </div>
                  <div className="space-y-2.5 p-3">
                    <InfoRow label="Identifiant" value={`#${String(fournisseur.id).padStart(4, '0')}`} isDark={isDark} />
                    <div className="h-px" style={{ background: borderColor }} />
                    <InfoRow label="Statut" value={<span className="inline-flex items-center gap-1 text-[13px] font-normal" style={{ color: theme.green }}><CheckCircle2 size={12} />Actif</span>} isDark={isDark} />
                    <div className="h-px" style={{ background: borderColor }} />
                    <InfoRow label="Créé le" value={formatDate(fournisseur.created_at)} isDark={isDark} />
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN */}
            <div className="min-w-0 flex-1">
              {/* INFORMATIONS */}
              <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor }}>
                <div className="border-b px-3 py-2.5" style={{ background: theme.surface, borderColor }}>
                  <span className="text-[13px] font-medium uppercase tracking-[0.04em]" style={{ color: theme.muted }}>Informations générales</span>
                </div>
                <div className="grid grid-cols-1 border-l border-t sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor }}>
                  <FormCell label="Nom du fournisseur" borderRight borderBottom fullWidth>
                    <span className="block truncate text-[14px] font-normal" style={{ color: theme.text }}>{fournisseur.nom || <EmptyValue theme={theme} />}</span>
                  </FormCell>
                  <FormCell label="Contact" borderRight borderBottom>
                    <span className="block truncate text-[14px] font-normal" style={{ color: theme.text }}>{fournisseur.contact || <EmptyValue theme={theme} />}</span>
                  </FormCell>
                  <FormCell label="Téléphone" borderRight borderBottom>
                    <span className="block truncate text-[14px] font-normal" style={{ color: theme.text }}>{fournisseur.telephone || <EmptyValue theme={theme} />}</span>
                  </FormCell>
                  <FormCell label="Email" borderRight={false} borderBottom>
                    <span className="block truncate text-[14px] font-normal" style={{ color: theme.text }}>{fournisseur.email || <EmptyValue theme={theme} />}</span>
                  </FormCell>
                  <FormCell label="Adresse" borderRight borderBottom fullWidth>
                    <span className="block truncate text-[14px] font-normal" style={{ color: theme.text }}>{fournisseur.adresse || <EmptyValue theme={theme} />}</span>
                  </FormCell>
                  <FormCell label="Date de création" borderRight={false} borderBottom={false}>
                    <span className="block truncate text-[14px] font-normal" style={{ color: theme.text }}>{formatDate(fournisseur.created_at)}</span>
                  </FormCell>
                </div>
              </div>

              {/* CONTACT RAPIDE */}
              {(fournisseur.telephone || fournisseur.email) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border p-2.5" style={{ borderColor, background: theme.surfaceSoft }}>
                  <span className="mr-1 text-[12px] font-medium" style={{ color: theme.muted }}>Contact rapide</span>
                  {fournisseur.telephone && (
                    <a href={`tel:${fournisseur.telephone}`} onClick={(e) => e.stopPropagation()} className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-normal transition-colors hover:bg-white dark:hover:bg-slate-800" style={{ color: theme.text, borderColor }}>
                      <Phone size={12} />Appeler
                    </a>
                  )}
                  {fournisseur.email && (
                    <a href={`mailto:${fournisseur.email}`} onClick={(e) => e.stopPropagation()} className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-normal transition-colors hover:bg-white dark:hover:bg-slate-800" style={{ color: theme.text, borderColor }}>
                      <Mail size={12} />Envoyer un email
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex h-[54px] shrink-0 items-center justify-end gap-2 border-t px-4 sm:px-5" style={{ borderColor, background: theme.surfaceSoft }}>
          <span className="hidden text-[11px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[13px] font-medium transition-all hover:bg-white active:scale-[0.98] dark:hover:bg-slate-800" style={{ background: 'transparent', borderColor, color: theme.text }}>Fermer</button>
            <button type="button" onClick={onEdit} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.background = theme.primary; }}>
              <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />Modifier
            </button>
          </div>
        </footer>

        <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px;height:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(100,116,139,0.24);border-radius:999px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(100,116,139,0.40)}`}</style>
      </div>
    </div>
  );
};

export default FournisseursViewModal;