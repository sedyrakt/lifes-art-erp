// src/components/categories/CategoriesModalForm.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Folder, X, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  light: {
    card: '#FFFFFF', border: '#E2E8F0', headerBg: '#FFFFFF', formBg: '#FFFFFF', inputBg: '#FFFFFF',
    softBg: '#F8FAFC', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1',
    primaryHover: '#4F46E5', primaryBg: 'rgba(99,102,241,0.07)', primaryBorder: 'rgba(99,102,241,0.20)'
  },
  dark: {
    card: '#0F172A', border: '#334155', headerBg: '#0F172A', formBg: '#0F172A', inputBg: '#0F172A',
    softBg: '#111C30', text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#818CF8',
    primaryHover: '#6366F1', primaryBg: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.28)'
  }
};

interface Categorie { id: number; nom: string; description: string; created_at: string; }

interface CategoriesModalFormProps {
  isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingCategorie: Categorie | null; isDark?: boolean;
}

interface FormCellProps { label: string; children: React.ReactNode; required?: boolean; fullWidth?: boolean; }

const FormCell: React.FC<FormCellProps> = ({ label, children, required = false, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className={`min-w-0 ${fullWidth ? 'w-full' : ''}`}>
      <label className="mb-1.5 block text-[14px] font-medium" style={{ color: theme.text }}>
        {label}{required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
};

const CategoriesModalForm: React.FC<CategoriesModalFormProps> = ({ isOpen, onClose, onSubmit, editingCategorie, isDark: propIsDark }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); formRef.current?.requestSubmit(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4" style={{ background: isDark ? 'rgba(0,0,0,0.78)' : 'rgba(15,23,42,0.58)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="category-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative z-[100000] flex w-full max-w-[760px] max-h-[88vh] flex-col overflow-hidden rounded-xl border shadow-[0_24px_70px_rgba(0,0,0,0.25)]" style={{ background: theme.card, borderColor: theme.border }} onMouseDown={(event) => event.stopPropagation()}>
        {/* TOP ACCENT */}
        <div className="absolute left-0 right-0 top-0 z-[100001] h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className="flex h-[66px] shrink-0 items-center justify-between border-b px-4 sm:px-5" style={{ background: theme.headerBg, borderColor: theme.border }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border" style={{ background: theme.primaryBg, borderColor: theme.primaryBorder, color: theme.primary }}>
              <Folder className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 id="category-modal-title" className="truncate text-[16px] font-semibold tracking-tight" style={{ color: theme.text }}>
                {editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <p className="mt-0.5 truncate text-[13px]" style={{ color: theme.muted }}>
                {editingCategorie ? 'Mettez à jour les informations de la catégorie' : 'Ajoutez une nouvelle catégorie'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all hover:bg-rose-500/10 hover:text-rose-500 active:scale-95" style={{ color: theme.muted }}>
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </header>

        {/* FORM */}
        <form ref={formRef} onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 md:flex-row">
              {/* LEFT SIDEBAR */}
              <aside className="w-full shrink-0 md:w-[190px]">
                <div className="flex flex-col gap-3">
                  {/* CATEGORY CARD */}
                  <div className="flex aspect-square max-h-[210px] items-center justify-center overflow-hidden rounded-xl border" style={{ background: theme.softBg, borderColor: theme.border }}>
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                        <Folder className="h-8 w-8" strokeWidth={1.8} />
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Catégorie</span>
                    </div>
                  </div>
                  {/* INFORMATION CARD */}
                  <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                    <div className="border-b px-3 py-2.5" style={{ background: theme.softBg, borderColor: theme.border }}>
                      <span className="text-[12.5px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>Informations</span>
                    </div>
                    <div className="space-y-2.5 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px]" style={{ color: theme.muted }}>Catégorie</span>
                        <span className="max-w-[105px] truncate text-right text-[13.5px] font-semibold" style={{ color: theme.text }} title={editingCategorie?.nom || 'Nouvelle'}>{editingCategorie?.nom || 'Nouvelle'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px]" style={{ color: theme.muted }}>ID</span>
                        <span className="text-[13.5px] font-semibold" style={{ color: theme.text }}>{editingCategorie ? `#${String(editingCategorie.id).padStart(4, '0')}` : '—'}</span>
                      </div>
                      <div className="h-px" style={{ background: theme.border }} />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px]" style={{ color: theme.muted }}>Statut</span>
                        <span className="text-[13.5px] font-semibold" style={{ color: theme.primary }}>{editingCategorie ? 'Actif' : 'Nouveau'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* RIGHT FORM */}
              <div className="min-w-0 flex-1">
                <div className="rounded-xl border p-4 sm:p-5" style={{ background: theme.formBg, borderColor: theme.border }}>
                  <div className="mb-4">
                    <span className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>Informations générales</span>
                  </div>
                  <FormCell label="Nom" required fullWidth>
                    <input type="text" name="nom" defaultValue={editingCategorie?.nom || ''} required autoFocus={!editingCategorie} autoComplete="off" placeholder="Ex : Électronique, Vêtements..." className="h-10 w-full rounded-lg border px-3 text-[14.5px] font-medium outline-none transition-all placeholder:text-slate-400 focus:ring-2 dark:placeholder:text-slate-500" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} onFocus={(event) => { event.currentTarget.style.borderColor = theme.primary; event.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primaryBg}`; }} onBlur={(event) => { event.currentTarget.style.borderColor = theme.border; event.currentTarget.style.boxShadow = 'none'; }} />
                  </FormCell>
                  <div className="mt-2">
                    <FormCell label="Description" fullWidth>
                      <textarea name="description" defaultValue={editingCategorie?.description || ''} rows={4} placeholder="Description de la catégorie..." className="w-full resize-none rounded-lg border px-3 py-2.5 text-[14.5px] font-medium leading-5 outline-none transition-all placeholder:text-slate-400 focus:ring-2 dark:placeholder:text-slate-500" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} onFocus={(event) => { event.currentTarget.style.borderColor = theme.primary; event.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primaryBg}`; }} onBlur={(event) => { event.currentTarget.style.borderColor = theme.border; event.currentTarget.style.boxShadow = 'none'; }} />
                    </FormCell>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="flex h-[60px] shrink-0 items-center justify-between border-t px-4 sm:px-5" style={{ background: theme.softBg, borderColor: theme.border }}>
            <span className="hidden text-[12px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer · Ctrl + Entrée pour enregistrer</span>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={onClose} className="h-9 rounded-lg border px-3.5 text-[14px] font-medium transition-all hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05]" style={{ background: 'transparent', borderColor: theme.border, color: theme.text }}>Annuler</button>
              <button type="submit" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-4 text-[14px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(event) => { event.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(event) => { event.currentTarget.style.background = theme.primary; }}>
                <Plus className="h-4 w-4" strokeWidth={2} />
                {editingCategorie ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default CategoriesModalForm;