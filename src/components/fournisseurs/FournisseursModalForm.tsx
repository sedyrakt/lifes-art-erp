// ============================================================
// src/components/fournisseurs/FournisseursModalForm.tsx
// ⭐ PREMIUM FOURNISSEUR FORM MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ COMPACT / GOOGLE-LIKE DESIGN
// ⭐ BORDER MANIFY - PREMIUM
// ⭐ RESPONSIVE
// ⭐ ICONS ONLY ON BUTTONS
// ============================================================

import React, { useEffect, useRef } from 'react';
import { Building2, X, Plus, Info, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FournisseursImageUpload from './FournisseursImageUpload';

interface Fournisseur {
  id: number;
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
  created_at: string;
  image?: string;
}

interface FournisseursModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingFournisseur: Fournisseur | null;
  isDark: boolean;
  imagePreview?: string | null;
  uploadingImage?: boolean;
  uploadProgress?: number;
  imageError?: string | null;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  required = false,
  className = '',
}) => (
  <div className={`min-w-0 ${className}`}>
    <label className="mb-1 block text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500 dark:text-slate-400">
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = [
  'w-full h-9 rounded-lg border px-3 text-[14px] font-medium outline-none',
  'transition-all duration-150',
  'border-slate-200 bg-white text-slate-900',
  'placeholder:text-slate-400 hover:border-slate-300',
  'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10',
  'dark:border-white/[0.06] dark:bg-[#0F172A] dark:text-slate-100',
  'dark:placeholder:text-slate-500 dark:hover:border-slate-600',
  'dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10',
].join(' ');

const textareaClass = [
  'w-full rounded-lg border px-3 py-2 text-[14px] font-medium outline-none',
  'transition-all duration-150 resize-none',
  'border-slate-200 bg-white text-slate-900',
  'placeholder:text-slate-400 hover:border-slate-300',
  'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10',
  'dark:border-white/[0.06] dark:bg-[#0F172A] dark:text-slate-100',
  'dark:placeholder:text-slate-500 dark:hover:border-slate-600',
  'dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10',
].join(' ');

const FournisseursModalForm: React.FC<FournisseursModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingFournisseur,
  isDark: propIsDark,
  imagePreview = null,
  uploadingImage = false,
  uploadProgress = 0,
  imageError = null,
  onImageChange,
  onRemoveImage,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const borderClass = isDark
    ? 'border-white/[0.06]'
    : 'border-slate-200';

  const isEditing = Boolean(editingFournisseur);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[4px] sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fournisseur-modal-title"
    >
      <div
        className={`relative flex w-full max-w-[900px] max-h-[90vh] flex-col overflow-hidden rounded-2xl border ${borderClass} shadow-[0_24px_80px_rgba(15,23,42,0.25)]`}
        style={{
          background: isDark ? '#0F172A' : '#FFFFFF',
        }}
      >
        {/* HEADER */}
        <header
          className={`flex shrink-0 items-center justify-between border-b px-5 py-3.5 sm:px-6 ${borderClass}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/[0.07] text-indigo-600 dark:text-indigo-400">
              <Building2 size={17} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <h2
                id="fournisseur-modal-title"
                className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100"
              >
                {isEditing
                  ? 'Modifier le fournisseur'
                  : 'Nouveau fournisseur'}
              </h2>

              <p className="mt-0.5 truncate text-[12px] text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Mettez à jour les informations du fournisseur'
                  : 'Ajoutez un nouveau fournisseur à votre entreprise'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </header>

        {/* FORM */}
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* LEFT */}
            <aside className="flex flex-col gap-3">
              <div>
                <div className="mb-1 text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500 dark:text-slate-400">
                  Logo / Image
                </div>

                <div
                  className={`relative aspect-square w-full overflow-hidden rounded-xl border ${borderClass}`}
                >
                  <FournisseursImageUpload
                    imagePreview={imagePreview}
                    uploadingImage={uploadingImage}
                    onImageChange={
                      onImageChange ||
                      (() => undefined)
                    }
                    onRemoveImage={
                      onRemoveImage ||
                      (() => undefined)
                    }
                    fileInputRef={fileInputRef}
                    isDark={isDark}
                    uploadProgress={uploadProgress}
                    error={imageError}
                  />
                </div>
              </div>

              {/* INFORMATIONS */}
              <div
                className={`rounded-xl border p-3 ${borderClass}`}
                style={{
                  background: isDark ? '#111C30' : '#F8FAFC',
                }}
              >
                <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500 dark:text-slate-400">
                  Informations
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] text-slate-500 dark:text-slate-500">
                      Fournisseur
                    </span>

                    <span className="max-w-[125px] truncate text-right text-[13px] font-medium text-slate-800 dark:text-slate-200">
                      {editingFournisseur?.nom || 'Nouveau'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] text-slate-500 dark:text-slate-500">
                      Identifiant
                    </span>

                    <span className="text-[13px] font-medium text-slate-800 dark:text-slate-200">
                      {editingFournisseur
                        ? `#${String(editingFournisseur.id).padStart(4, '0')}`
                        : '—'}
                    </span>
                  </div>

                  <div
                    className={`mt-2 flex items-center justify-between border-t pt-2 ${borderClass}`}
                  >
                    <span className="text-[12px] text-slate-500 dark:text-slate-500">
                      Statut
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={12} />
                      {isEditing ? 'Actif' : 'Nouveau'}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT */}
            <section className="min-w-0">
              <div className="mb-4">
                <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                  Informations générales
                </h3>

                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  Renseignez les coordonnées principales du fournisseur.
                </p>
              </div>

              <div className="space-y-3.5">
                <FormField label="Nom du fournisseur" required>
                  <input
                    type="text"
                    name="nom"
                    defaultValue={editingFournisseur?.nom || ''}
                    required
                    autoFocus
                    placeholder="Nom du fournisseur"
                    className={inputClass}
                  />
                </FormField>

                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  <FormField label="Contact">
                    <input
                      type="text"
                      name="contact"
                      defaultValue={editingFournisseur?.contact || ''}
                      placeholder="Nom du responsable"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Téléphone">
                    <input
                      type="tel"
                      name="telephone"
                      defaultValue={editingFournisseur?.telephone || ''}
                      placeholder="+261 32 12 345 67"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Adresse e-mail"
                    className="md:col-span-2"
                  >
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingFournisseur?.email || ''}
                      placeholder="adresse@email.com"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField label="Adresse">
                  <textarea
                    name="adresse"
                    defaultValue={editingFournisseur?.adresse || ''}
                    rows={4}
                    placeholder="Adresse complète du fournisseur..."
                    className={textareaClass}
                  />
                </FormField>

                <div className="flex items-start gap-2 rounded-lg bg-indigo-50/70 px-3 py-2 text-[13px] leading-4 text-indigo-700 dark:bg-indigo-500/[0.05] dark:text-indigo-300">
                  <Info
                    size={13}
                    className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400"
                  />

                  <span>
                    Les champs marqués d'un <strong>*</strong> sont
                    obligatoires.
                  </span>
                </div>
              </div>
            </section>
          </div>
        </form>

        {/* FOOTER */}
        <footer
          className={`flex shrink-0 items-center justify-between gap-3 border-t px-5 py-2.5 sm:px-6 ${borderClass}`}
          style={{
            background: isDark ? '#0F172A' : '#F8FAFC',
          }}
        >
          <div className="hidden items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 sm:flex">
            <kbd
              className={`rounded border px-1.5 py-0.5 font-sans ${borderClass}`}
              style={{
                background: isDark ? '#1E293B' : '#F1F5F9',
              }}
            >
              Esc
            </kbd>
            <span>pour fermer</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-lg px-3 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Plus size={14} strokeWidth={2.2} />
              {isEditing ? 'Enregistrer' : 'Ajouter le fournisseur'}
            </button>
          </div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100,116,139,.22);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100,116,139,.38);
        }
      `}</style>
    </div>
  );
};

export default FournisseursModalForm;