// ============================================================
// src/components/company/CompanySettingsModal.tsx
// ⭐ FIX MAJEUR: Esorina ny downloadPDF mba tsy hisy double Save Dialog
// ============================================================

import React, { useEffect, useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCompanySettings } from './CompanySettingsModal/hooks/useCompanySettings';
import { CompanySettingsModalProps } from './CompanySettingsModal/types';
// ⭐ FIX: ESORY ILAY IMPORT SATRIA EFA AO AMIN'NY COMMANDES.TSX NY GENERATION
// import { downloadPDF } from '../../lib/pdfService'; 

const COLORS = {
  light: {
    overlay: 'rgba(15, 23, 42, 0.55)',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSoft: '#F8FAFC',
    footer: '#F8FAFC',
    border: '#E2E8F0',
    text: '#0F172A',
    muted: '#64748B',
    subMuted: '#94A3B8',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    primaryBg: 'rgba(79,70,229,0.07)',
    primaryBorder: 'rgba(79,70,229,0.15)',
    success: '#059669',
    successBg: 'rgba(16,185,129,0.08)',
    successBorder: 'rgba(16,185,129,0.16)',
    warning: '#D97706',
    warningBg: 'rgba(245,158,11,0.08)',
    warningBorder: 'rgba(245,158,11,0.16)',
    danger: '#E11D48',
    dangerBg: 'rgba(244,63,94,0.07)',
    dangerBorder: 'rgba(244,63,94,0.15)'
  },
  dark: {
    overlay: 'rgba(0, 0, 0, 0.72)',
    card: '#0F172A',
    surface: '#0F172A',
    surfaceSoft: '#111C30',
    footer: '#0F172A',
    border: '#334155',
    text: '#F8FAFC',
    muted: '#94A3B8',
    subMuted: '#64748B',
    primary: '#818CF8',
    primaryHover: '#6366F1',
    primaryBg: 'rgba(99,102,241,0.12)',
    primaryBorder: 'rgba(129,140,248,0.20)',
    success: '#34D399',
    successBg: 'rgba(16,185,129,0.11)',
    successBorder: 'rgba(52,211,153,0.18)',
    warning: '#FBBF24',
    warningBg: 'rgba(245,158,11,0.11)',
    warningBorder: 'rgba(251,191,36,0.18)',
    danger: '#FB7185',
    dangerBg: 'rgba(244,63,94,0.11)',
    dangerBorder: 'rgba(251,113,133,0.18)'
  },
};

import CompanySettingsHeader from './CompanySettingsModal/CompanySettingsHeader';
import CompanySettingsForm from './CompanySettingsModal/CompanySettingsForm';

interface ExtendedCompanySettingsModalProps extends CompanySettingsModalProps {
  commandeForInvoice?: any;
  onPDFGenerated?: (success: boolean, filePath?: string) => void;
}

const CompanySettingsModal: React.FC<ExtendedCompanySettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onGenerate,
  initialData,
  isDark: propIsDark,
  mode = 'generate',
  commandeForInvoice, 
  onPDFGenerated,    
}) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;

  const {
    formData,
    imagePreview,
    loading,
    errors,
    savingImage,
    handleChange,
    handleImageChange,
    handleRemoveImage,
    handleDrop,
    handleDragOver,
    handleGenerate,
  } = useCompanySettings(initialData, onSave, onGenerate);

  const [isVisible, setIsVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen) { setIsVisible(false); return; }
    const timer = window.setTimeout(() => setIsVisible(true), 10);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // ⭐ FIX: ESORINA NY downloadPDF AO ANATIN'ITY FA EFA AO AMIN'NY COMMANDES.TSX
  const handleGenerateWithClose = async () => {
    if (isGenerating || loading || savingImage) return;
    
    setIsGenerating(true);
    console.log('🔄 Début de la génération de facture...');
    
    try {
      // 1. Générer la facture (via le hook) -> Io no miantso ny onGenerate any Commandes.tsx
      const result = await handleGenerate();
      console.log('📄 Résultat de handleGenerate:', result);

      // 2. Raha canceled na success dia tsy manao na inona na inona eto
      if (result?.canceled) {
        console.log('📄 Génération annulée par l\'utilisateur');
        if (onPDFGenerated) onPDFGenerated(false);
        // ⭐ FIX: Tsy mikatona raha annulé
        return;
      }

      if (result?.success) {
        console.log('✅ Génération terminée avec succès');
        if (onPDFGenerated) onPDFGenerated(true);
        // ⭐ FIX: Mikatona ny modal rehefa vita ny génération (ny PDF dia efa natao tao Commandes)
        onClose();
        return;
      }

      // 3. Erreur
      console.error('❌ Erreur lors de la génération:', result?.error || 'Erreur inconnue');
      if (onPDFGenerated) onPDFGenerated(false);
      
    } catch (error: any) {
      console.error('❌ Erreur inattendue lors de la génération:', error);
      if (onPDFGenerated) onPDFGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-3 sm:p-5 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: theme.overlay, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-settings-modal-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative flex w-full max-w-[950px] max-h-[85vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'}`}
        style={{ background: theme.card, borderColor: theme.border }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />

        <header className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:px-6" style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
              <Building2 size={20} strokeWidth={2} style={{ color: theme.primary }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="company-settings-modal-title" className="truncate text-[16px] font-semibold tracking-tight sm:text-[17px]" style={{ color: theme.text }}>Paramètres de l'entreprise</h2>
              </div>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Gérez les informations de votre société</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white">
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </header>

        <form className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6 custom-company-scrollbar">
          <CompanySettingsForm
            formData={formData}
            errors={errors}
            isDark={isDark}
            onChange={handleChange}
            imagePreview={imagePreview}
            savingImage={savingImage}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
        </form>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3 sm:px-6" style={{ background: theme.footer, borderColor: theme.border }}>
          <div className="hidden items-center gap-1.5 text-[11px] font-medium sm:flex" style={{ color: theme.subMuted }}>
            <span className="rounded border px-1.5 py-0.5" style={{ borderColor: theme.border }}>ESC</span>
            <span>fermer</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border px-4 text-[13px] font-medium transition-all hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05]"
              style={{ borderColor: theme.border, color: theme.text, background: 'transparent' }}
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleGenerateWithClose}
              disabled={loading || savingImage || isGenerating}
              className="flex h-9 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: theme.primary }}
              onMouseEnter={e => { if (!loading && !savingImage && !isGenerating) e.currentTarget.style.background = theme.primaryHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = theme.primary; }}
            >
              {loading || savingImage || isGenerating ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  {savingImage ? 'Sauvegarde image...' : (isGenerating ? 'Génération...' : 'Génération...')}
                </>
              ) : (
                'Générer la facture'
              )}
            </button>
          </div>
        </div>

        <style>{`
          .custom-company-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-company-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-company-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.22); border-radius: 999px; }
          .custom-company-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.38); }
          @media (prefers-reduced-motion: reduce) { .custom-company-scrollbar { scroll-behavior: auto; } }
        `}</style>
      </div>
    </div>
  );
};

export default CompanySettingsModal;