// ============================================================
// src/components/fournisseurs/FournisseursViewModal.tsx
// ============================================================
// ⭐ PREMIUM FOURNISSEUR VIEW MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY (identique aux tables)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useEffect, useState } from 'react';
import { Building2, X, User, Phone, Mail, MapPin, Calendar, Edit3, Hash, Info, CheckCircle2 } from 'lucide-react';

const COLORS = {
  light: {
    card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', borderSoft: '#F1F5F9',
    text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#4F46E5', primaryHover: '#4338CA',
    primaryBg: 'rgba(79,70,229,0.08)', primaryBorder: 'rgba(79,70,229,0.16)', green: '#059669',
    greenBg: 'rgba(16,185,129,0.08)', greenBorder: 'rgba(16,185,129,0.16)',
  },
  dark: {
    card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111827', border: '#334155', borderSoft: '#1E293B',
    text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#818CF8', primaryHover: '#6366F1',
    primaryBg: 'rgba(129,140,248,0.10)', primaryBorder: 'rgba(129,140,248,0.18)', green: '#34D399',
    greenBg: 'rgba(52,211,153,0.10)', greenBorder: 'rgba(52,211,153,0.18)',
  },
};

interface Fournisseur { id: number; nom: string; contact: string; telephone: string; email: string; adresse: string; created_at: string; image?: string; }
interface FournisseursViewModalProps { fournisseur: Fournisseur; onClose: () => void; onEdit: () => void; isDark: boolean; imageUrl?: string | null; }
interface InfoFieldProps { label: string; value?: React.ReactNode; icon?: React.ReactNode; span?: 'normal' | 'full'; borderBottom?: boolean; isDark?: boolean; }

// ============================================================
// INFO FIELD
// ============================================================

const InfoField: React.FC<InfoFieldProps> = ({ label, value, icon, span = 'normal', borderBottom = true, isDark = false }) => {
  const isEmpty = value === undefined || value === null || value === '';
  const theme = isDark ? COLORS.dark : COLORS.light;

  return (
    <div className={`min-w-0 px-4 py-2.5 ${span === 'full' ? 'sm:col-span-2' : ''} ${borderBottom ? 'border-b' : ''}`} style={{ borderColor: theme.border }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-400 dark:text-slate-500">{label}</span>
      </div>
      <div className="min-w-0 break-words text-[13px] font-medium leading-4 text-slate-900 dark:text-slate-100">
        {isEmpty ? <span className="font-normal text-slate-400 dark:text-slate-500">Non spécifié</span> : value}
      </div>
    </div>
  );
};

// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; isDark: boolean }> = ({ icon, title, subtitle, isDark }) => {
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: theme.border }}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: theme.primaryBg, color: theme.primary }}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>{title}</div>
        {subtitle && <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</div>}
      </div>
    </div>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const FournisseursViewModal: React.FC<FournisseursViewModalProps> = ({ fournisseur, onClose, onEdit, imageUrl = null, isDark }) => {
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getInitiales = (nom?: string) => {
    if (!nom) return '?';
    return nom.trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
  };
  const formatDate = (date?: string) => {
    if (!date) return 'Non spécifiée';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Date inconnue';
    return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (!fournisseur) return null;

  return (
    <div className={`fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: isDark ? 'rgba(12, 12, 12, 0.82)' : 'rgba(15,23,42,0.52)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      role="dialog" aria-modal="true" aria-labelledby="fournisseur-view-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative w-[65%] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.20)] transition-all duration-200 ${isVisible ? 'scale-100 translate-y-0' : 'scale-[0.985] translate-y-2'}`}
        style={{ background: theme.card, borderColor: theme.border }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-30 h-[2px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3.5 sm:px-6" style={{ borderColor: theme.border }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
              <img src="/logo.png" alt="Logo" className="max-h-[22px] max-w-[22px] object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="fournisseur-view-title" className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>Détails du fournisseur</h2>
                <span className="hidden shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase sm:inline-flex" style={{ color: theme.primary, background: theme.primaryBg, borderColor: theme.primaryBorder }}>
                  <Hash size={10} />{String(fournisseur.id).padStart(4, '0')}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Informations détaillées du fournisseur</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* SIDEBAR */}
            <aside className="flex flex-col gap-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                {imageUrl && !imageError ? (
                  <img src={imageUrl} alt={fournisseur.nom} className="h-full w-full object-cover" loading="lazy" onError={() => setImageError(true)} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-semibold" style={{ background: theme.primaryBg, color: theme.primary, border: `1px solid ${theme.primaryBorder}` }}>
                      {getInitiales(fournisseur.nom)}
                    </div>
                  </div>
                )}
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-bold uppercase backdrop-blur-sm" style={{ color: theme.green, background: isDark ? 'rgba(15,23,42,0.88)' : 'rgba(255,255,255,0.92)', borderColor: theme.greenBorder }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Actif
                </div>
              </div>

              <div className="rounded-xl border px-3 py-2.5" style={{ borderColor: theme.border, background: theme.surface }}>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.subtle }}>Fournisseur</div>
                <div className="break-words text-[13px] font-semibold leading-4" style={{ color: theme.text }}>{fournisseur.nom}</div>
              </div>

              <div className="overflow-hidden rounded-xl border" style={{ borderColor: theme.border, background: theme.surface }}>
                <SectionHeader icon={<Info size={14} />} title="Résumé" isDark={isDark} />
                <div className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Identifiant</span>
                    <span className="font-mono text-[13px] font-medium" style={{ color: theme.text }}>#{String(fournisseur.id).padStart(4, '0')}</span>
                  </div>
                  <div className="my-2 h-px" style={{ background: theme.borderSoft }} />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Statut</span>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: theme.green }}><CheckCircle2 size={12} />Actif</span>
                  </div>
                  <div className="my-2 h-px" style={{ background: theme.borderSoft }} />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Créé le</span>
                    <span className="text-right text-[13px] font-medium" style={{ color: theme.text }}>{formatDate(fournisseur.created_at)}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <section className="min-w-0">
              <div className="overflow-hidden rounded-xl border" style={{ borderColor: theme.border, background: theme.surface }}>
                <SectionHeader icon={<Building2 size={14} />} title="Informations générales" subtitle="Coordonnées et informations principales" isDark={isDark} />
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <InfoField label="Nom du fournisseur" icon={<Building2 size={13} />} span="full" value={fournisseur.nom} isDark={isDark} />
                  <InfoField label="Contact" icon={<User size={13} />} value={fournisseur.contact} isDark={isDark} />
                  <InfoField label="Téléphone" icon={<Phone size={13} />} value={fournisseur.telephone} isDark={isDark} />
                  <InfoField label="Email" icon={<Mail size={13} />} value={fournisseur.email ? <span className="break-all">{fournisseur.email}</span> : undefined} isDark={isDark} />
                  <InfoField label="Adresse" icon={<MapPin size={13} />} span="full" value={fournisseur.adresse} isDark={isDark} />
                  <InfoField label="Date de création" icon={<Calendar size={13} />} span="full" borderBottom={false} value={formatDate(fournisseur.created_at)} isDark={isDark} />
                </div>
              </div>

              {(fournisseur.telephone || fournisseur.email) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border p-2.5" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                  <span className="mr-1 text-[12px] font-medium" style={{ color: theme.muted }}>Contact rapide</span>
                  {fournisseur.telephone && (
                    <a href={`tel:${fournisseur.telephone}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[13px] font-medium transition-colors hover:bg-white dark:hover:bg-slate-800" style={{ color: theme.text, borderColor: theme.border }}>
                      <Phone size={12} />Appeler
                    </a>
                  )}
                  {fournisseur.email && (
                    <a href={`mailto:${fournisseur.email}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[13px] font-medium transition-colors hover:bg-white dark:hover:bg-slate-800" style={{ color: theme.text, borderColor: theme.border }}>
                      <Mail size={12} />Envoyer un email
                    </a>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex shrink-0 items-center justify-end gap-2 border-t px-5 py-2.5 sm:px-6" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
          <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[13px] font-medium transition-all duration-150 hover:bg-white active:scale-[0.98] dark:hover:bg-slate-800" style={{ background: 'transparent', borderColor: theme.border, color: theme.text }}>
            Fermer
          </button>
          <button type="button" onClick={onEdit} className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.background = theme.primary; }}>
            <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />Modifier
          </button>
        </footer>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.24); border-radius: 999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.40); }
        `}</style>
      </div>
    </div>
  );
};

export default FournisseursViewModal;