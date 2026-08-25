// src/components/categories/CategoriesViewModal.tsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Folder, Edit, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  light: {
    card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', text: '#0F172A',
    muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5',
    primarySoft: 'rgba(99,102,241,0.08)', primaryBorder: 'rgba(99,102,241,0.18)', green: '#059669'
  },
  dark: {
    card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', border: '#334155', text: '#F8FAFC',
    muted: '#94A3B8', subMuted: '#64748B', primary: '#818CF8', primaryHover: '#6366F1',
    primarySoft: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.25)', green: '#34D399'
  }
};

interface Categorie { id: number; nom: string; description: string; created_at: string; }

interface CategoriesViewModalProps {
  categorie: Categorie; onClose: () => void; onEdit: () => void;
  getCategoryColor: (id: number) => string; isDark?: boolean;
}

interface FormCellProps {
  label: string; children: React.ReactNode; borderRight?: boolean; borderBottom?: boolean; fullWidth?: boolean;
}

const FormCell: React.FC<FormCellProps> = ({ label, children, borderRight = true, borderBottom = true, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className={['min-w-0 px-3 py-3', borderRight ? 'border-r' : '', borderBottom ? 'border-b' : '', fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''].join(' ')} style={{ borderColor: theme.border, background: theme.card }}>
      <div className="mb-1.5 text-[12.5px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>{label}</div>
      <div className="min-w-0 text-[14.5px] font-medium leading-5" style={{ color: theme.text }}>{children}</div>
    </div>
  );
};

interface InfoRowProps { label: string; value: React.ReactNode; }

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="truncate text-[13px] font-medium" style={{ color: theme.muted }}>{label}</span>
      <div className="min-w-0 text-right text-[14px] font-semibold" style={{ color: theme.text }}>{value}</div>
    </div>
  );
};

const CategoriesViewModal: React.FC<CategoriesViewModalProps> = ({ categorie, onClose, onEdit, getCategoryColor, isDark: propIsDark }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
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

  const formatDate = (date?: string) => {
    if (!date) return 'Non spécifiée';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Date inconnue';
    return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const modal = (
    <div className={['fixed inset-0 z-[99999] flex items-center justify-center', 'p-3 sm:p-4', 'transition-all duration-200', isVisible ? 'opacity-100' : 'opacity-0'].join(' ')} style={{ background: isDark ? 'rgba(0,0,0,0.76)' : 'rgba(15,23,42,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="category-view-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={['relative z-[100000] flex w-full max-w-4xl', 'max-h-[88vh] flex-col overflow-hidden', 'rounded-xl sm:rounded-2xl border', 'shadow-[0_24px_70px_rgba(0,0,0,0.22)]', 'transition-all duration-200', isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.98]'].join(' ')} style={{ background: theme.card, borderColor: theme.border }} onMouseDown={(event) => event.stopPropagation()}>
        {/* TOP ACCENT */}
        <div className="absolute left-0 right-0 top-0 z-[100001] h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b px-4 sm:px-5" style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: theme.primaryBorder, background: theme.primarySoft, color: theme.primary }}>
              <Folder className="h-[17px] w-[17px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 id="category-view-title" className="truncate text-[16px] font-semibold tracking-tight" style={{ color: theme.text }}>Détails de la catégorie</h2>
              <p className="mt-0.5 truncate text-[13px]" style={{ color: theme.muted }}>Informations complètes de la catégorie</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all hover:bg-rose-500/10 hover:text-rose-500 active:scale-95" style={{ color: theme.muted }}>
            <X className="h-[17px] w-[17px]" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* SIDEBAR */}
            <aside className="w-full shrink-0 lg:w-[190px]">
              <div className="flex flex-col gap-3">
                {/* CATEGORY IMAGE / ICON */}
                <div className="relative aspect-square overflow-hidden rounded-xl border" style={{ background: theme.surfaceSoft, borderColor: theme.border }}>
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white shadow-lg">
                      <Folder className="h-8 w-8" strokeWidth={1.8} />
                    </div>
                  </div>
                </div>
                {/* SUMMARY */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className="border-b px-3 py-2.5" style={{ background: theme.surfaceSoft, borderColor: theme.border }}>
                    <span className="text-[12.5px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>Résumé</span>
                  </div>
                  <div className="space-y-2.5 p-3">
                    <InfoRow label="Identifiant" value={`#${String(categorie.id).padStart(4, '0')}`} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="Statut" value={<span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: theme.green }}><CheckCircle2 size={13} strokeWidth={2} />Actif</span>} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="Créée le" value={formatDate(categorie.created_at)} />
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                <div className="border-b px-3.5 py-3" style={{ background: theme.surfaceSoft, borderColor: theme.border }}>
                  <span className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>Informations générales</span>
                </div>
                <div className="grid grid-cols-1 border-l sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: theme.border }}>
                  <FormCell label="Nom" borderRight borderBottom fullWidth>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getCategoryColor(categorie.id)}`} style={{ color: 'white' }}>
                        <Folder className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <span className="truncate text-[15px] font-semibold" style={{ color: theme.text }} title={categorie.nom}>{categorie.nom}</span>
                    </div>
                  </FormCell>
                  <FormCell label="Description" borderRight={false} borderBottom={false} fullWidth>
                    <div className="min-h-[48px] whitespace-pre-wrap text-[14px] font-medium leading-5" style={{ color: theme.muted }}>
                      {categorie.description ? categorie.description : <span className="italic" style={{ color: theme.subMuted }}>Aucune description</span>}
                    </div>
                  </FormCell>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex h-[58px] shrink-0 items-center justify-between border-t px-4 sm:px-5" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
          <span className="hidden text-[12px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer</span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-9 rounded-lg border px-3.5 text-[14px] font-medium transition-all duration-150 hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05]" style={{ background: 'transparent', borderColor: theme.border, color: theme.text }}>Fermer</button>
            <button type="button" onClick={onEdit} className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-[14px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(event) => { event.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(event) => { event.currentTarget.style.background = theme.primary; }}>
              <Edit className="h-3.5 w-3.5" strokeWidth={2} />
              Modifier
            </button>
          </div>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default CategoriesViewModal;