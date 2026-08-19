// ============================================================
// src/components/clients/ClientsModalForm.tsx
// ============================================================
// ⭐ PREMIUM CLIENT FORM MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY (identique aux tables)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { UserPlus, X, Mail, Phone, MapPin, Globe, User, Building, Plus, Info, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ClientsImageUpload from './ClientsImageUpload';

interface Client { id: number; nom: string; email: string; telephone: string; adresse: string; ville: string; code_postal: string; pays: string; image: string; type: 'Particulier' | 'Entreprise'; created_at: string; }
interface ClientsModalFormProps {
  isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; editingClient: Client | null; isDark?: boolean;
  imagePreview: string | null; uploadingImage: boolean; onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>; error?: string | null; uploadProgress?: number;
}

const COLORS = {
  light: { overlay: 'rgba(8, 9, 9, 0.52)', card: '#FFFFFF', header: '#FFFFFF', footer: '#F8FAFC', surface: '#F8FAFC', border: '#E2E8F0', input: '#FFFFFF', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#4F46E5', primaryHover: '#4338CA', primarySoft: '#EEF2FF', danger: '#DC2626', success: '#059669' },
  dark: { overlay: 'rgba(0, 0, 0, 0.49)', card: '#0F172A', header: '#0F172A', footer: '#0F172A', surface: '#111827', border: '#1E293B', input: '#0F172A', text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#4F46E5', primaryHover: '#4338CA', primarySoft: 'rgba(99, 102, 241, 0.12)', danger: '#F87171', success: '#34D399' },
};

// ============================================================
// FORM FIELD
// ============================================================

const FormField: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; required?: boolean; className?: string; }> = ({ label, children, icon, required = false, className = '' }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>
        {icon && <span className="flex items-center justify-center" style={{ color: theme.subMuted }}>{icon}</span>}
        <span>{label}{required && <span className="ml-1" style={{ color: theme.danger }}>*</span>}</span>
      </label>
      {children}
    </div>
  );
};

const inputBase = 'w-full h-9 px-3 rounded-lg border text-[14px] font-medium outline-none transition-all duration-150 focus:ring-2';

// ============================================================
// COMPONENT
// ============================================================

const ClientsModalForm: React.FC<ClientsModalFormProps> = ({ isOpen, onClose, onSubmit, editingClient, isDark: propIsDark, imagePreview, uploadingImage, onImageChange, onRemoveImage, fileInputRef, error = null, uploadProgress = 0 }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => { if (!isOpen) { setIsVisible(false); return; } const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, [isOpen]);
  useEffect(() => { if (!isOpen) return; const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); formRef.current?.requestSubmit(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [isOpen, onClose]);

  if (!isOpen) return null;

  const inputClass = `${inputBase} ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15 hover:border-slate-600' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10 hover:border-slate-400'}`;
  const initials = editingClient?.nom ? editingClient.nom.split(' ').slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase() : 'NC';

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: theme.overlay, backdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="client-modal-title" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-[70%] max-h-[85vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(15,23,42,0.22)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={e => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-20 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between border-b px-5 py-3.5 sm:px-6 ${borderClass}`} style={{ background: theme.header }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primarySoft, color: theme.primary }}>
              <UserPlus className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 id="client-modal-title" className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.subMuted }}>
                {editingClient ? 'Mettez à jour les informations du client' : 'Ajoutez un nouveau client à votre base'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors" style={{ color: theme.muted }} onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'; e.currentTarget.style.color = theme.text; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}>
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <form ref={formRef} onSubmit={onSubmit} className="flex-1 overflow-y-auto custom-client-scrollbar">
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
              {/* SIDEBAR */}
              <aside className="flex flex-col gap-3">
                <div className={`relative aspect-square w-full overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                  <ClientsImageUpload
                    imagePreview={imagePreview}
                    uploadingImage={uploadingImage}
                    onImageChange={onImageChange}
                    onRemoveImage={onRemoveImage}
                    fileInputRef={fileInputRef}
                    isDark={isDark}
                    uploadProgress={uploadProgress}
                    error={error}
                    initials={initials}
                  />
                </div>

                <div className={`rounded-xl border p-3 ${borderClass}`} style={{ background: theme.surface }}>
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" style={{ color: theme.primary }} />
                    <span className="text-[13px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>Résumé</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Type</span>
                      <span className="truncate text-[13px] font-medium" style={{ color: theme.text }}>{editingClient?.type || 'Particulier'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-medium" style={{ color: theme.muted }}>ID Client</span>
                      <span className="text-[13px] font-medium" style={{ color: theme.text }}>{editingClient ? `#${String(editingClient.id).padStart(4, '0')}` : '—'}</span>
                    </div>
                    <div className="my-2 h-px" style={{ background: theme.border }} />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-medium" style={{ color: theme.text }}>Statut</span>
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: isDark ? 'rgba(16,185,129,0.10)' : '#ECFDF5', color: theme.success }}>
                        <CheckCircle2 size={11} />
                        {editingClient ? 'Actif' : 'Nouveau'}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* MAIN FORM */}
              <section className="min-w-0">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full" style={{ background: theme.primary }} />
                  <h3 className="text-[14px] font-semibold" style={{ color: theme.text }}>Informations du client</h3>
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <FormField label="Nom complet" required icon={<User className="h-3.5 w-3.5" />}>
                      <input type="text" name="nom" defaultValue={editingClient?.nom || ''} required autoFocus={!editingClient} className={inputClass} placeholder="Nom complet du client" />
                    </FormField>
                  </div>
                  <FormField label="Email" icon={<Mail className="h-3.5 w-3.5" />}>
                    <input type="email" name="email" defaultValue={editingClient?.email || ''} className={inputClass} placeholder="adresse email" />
                  </FormField>
                  <FormField label="Téléphone" icon={<Phone className="h-3.5 w-3.5" />}>
                    <input type="tel" name="telephone" defaultValue={editingClient?.telephone || ''} className={inputClass} placeholder="+261 32 12 345 67" />
                  </FormField>
                  <FormField label="Adresse" icon={<MapPin className="h-3.5 w-3.5" />}>
                    <input type="text" name="adresse" defaultValue={editingClient?.adresse || ''} className={inputClass} placeholder="Adresse complète" />
                  </FormField>
                  <FormField label="Ville" icon={<MapPin className="h-3.5 w-3.5" />}>
                    <input type="text" name="ville" defaultValue={editingClient?.ville || ''} className={inputClass} placeholder="Antananarivo" />
                  </FormField>
                  <FormField label="Code postal" icon={<MapPin className="h-3.5 w-3.5" />}>
                    <input type="text" name="code_postal" defaultValue={editingClient?.code_postal || ''} className={inputClass} placeholder="101" />
                  </FormField>
                  <FormField label="Pays" icon={<Globe className="h-3.5 w-3.5" />}>
                    <input type="text" name="pays" defaultValue={editingClient?.pays || 'Madagascar'} className={inputClass} placeholder="Madagascar" />
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="Type de client" icon={<Building className="h-3.5 w-3.5" />}>
                      <div className="relative">
                        <select name="type" defaultValue={editingClient?.type || 'Particulier'} className={`${inputClass} appearance-none cursor-pointer pr-8`}>
                          <option value="Particulier">Particulier</option>
                          <option value="Entreprise">Entreprise</option>
                        </select>
                        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: theme.subMuted }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                      </div>
                    </FormField>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-between gap-3 border-t px-5 py-2.5 sm:px-6 ${borderClass}`} style={{ background: theme.footer }}>
          <span className="hidden text-[11px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer · Ctrl + Entrée pour enregistrer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className={`h-8 rounded-lg px-3 text-[13px] font-medium transition-colors ${borderClass}`} style={{ background: 'transparent', color: theme.muted }} onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#1E293B' : '#F1F5F9'; e.currentTarget.style.color = theme.text; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}>
              Annuler
            </button>
            <button type="button" onClick={() => formRef.current?.requestSubmit()} disabled={uploadingImage} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50" style={{ background: theme.primary }} onMouseEnter={e => { if (!uploadingImage) e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={e => { e.currentTarget.style.background = theme.primary; }}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              {uploadingImage ? 'Téléversement...' : editingClient ? 'Enregistrer' : 'Ajouter le client'}
            </button>
          </div>
        </footer>

        <style>{`
          .custom-client-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-client-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-client-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.25); border-radius: 999px; }
          .custom-client-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.40); }
        `}</style>
      </div>
    </div>
  );
};

export default ClientsModalForm;