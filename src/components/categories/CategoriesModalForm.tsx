// src/components/categories/CategoriesModalForm.tsx - GOOGLE-LIKE PROFESSIONAL MODAL (GAP FIX)
// ⭐ FANITSARA LEHIBE: Nampihena ho 2px ny elanelana eo anelanelan'ny Nom sy Description.
// ============================================================

import React, { useRef, useEffect } from 'react';
import { Folder, X, Tag, FileText, Plus, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  light: {
    card: '#FFFFFF',
    border: '#E2E8F0',
    headerBg: '#F8FAFC',
    formBg: '#FFFFFF',
    cellBg: '#F8FAFC',
    inputBg: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    primary: '#6366F1',
    primaryBg: 'rgba(99,102,241,0.06)',
    primaryBorder: 'rgba(99,102,241,0.25)',
    red: '#EF4444',
  },
  dark: {
    card: '#0F172A',
    border: '#334155',
    headerBg: '#0F172A',
    formBg: '#0F172A',
    cellBg: '#1E293B',
    inputBg: '#0F172A',
    text: '#F8FAFC',
    muted: '#94A3B8',
    primary: '#6366F1',
    primaryBg: 'rgba(99,102,241,0.12)',
    primaryBorder: 'rgba(99,102,241,0.35)',
    red: '#EF4444',
  }
};

interface Categorie {
  id: number;
  nom: string;
  description: string;
  created_at: string;
}

interface CategoriesModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingCategorie: Categorie | null;
  isDark?: boolean;
}

// ⭐ FormCell Google-like
const FormCell: React.FC<{
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  required?: boolean;
  fullWidth?: boolean;
}> = ({ label, children, icon, required = false, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="shrink-0 text-slate-400 dark:text-slate-500">
            {icon}
          </span>
        )}
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      </div>
      {children}
    </div>
  );
};

const CategoriesModalForm: React.FC<CategoriesModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategorie,
  isDark: propIsDark,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (formRef.current) formRef.current.requestSubmit();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div 
        className="relative w-full max-w-[800px] max-h-[80vh] shadow-2xl transition-all duration-300 rounded-xl flex flex-col overflow-hidden border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800"
      >
        {/* ⭐ HEADER STICKY */}
        <div 
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 id="category-modal-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {editingCategorie ? 'Mettez à jour les informations' : 'Remplissez les informations'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* ⭐ CORPS SCROLLABLE */}
        <form ref={formRef} onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* --- COLONNE ANKAVIA (ICONE & STATS) --- */}
            <div className="w-full md:w-56 flex-shrink-0 flex flex-col gap-4">
              
              <div className="w-full aspect-square max-h-[260px] border-2 rounded-lg overflow-hidden relative bg-slate-50 dark:bg-[#0F172A] border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                    <Folder className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Image de catégorie</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A]">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Informations</span>
                </div>
                
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Catégorie</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{editingCategorie?.nom || 'Nouvelle'}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 mt-1">
                  <span>ID</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{editingCategorie ? `#${String(editingCategorie.id).padStart(4, '0')}` : '—'}</span>
                </div>
                
                <div className="h-px my-3 bg-slate-200 dark:bg-slate-700" />
                
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-slate-900 dark:text-slate-100">Status</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {editingCategorie ? 'Actif' : 'Nouveau'}
                  </span>
                </div>
              </div>
            </div>

            {/* ⭐ FANITSARA: COLONNE ANKAVANANA - Flex-col mba hanesorana ilay gap be */}
            <div className="flex-1 flex flex-col gap-2">
            
              {/* Row 1: Nom */}
              <FormCell label="Nom" required icon={<Tag size={14} />} fullWidth>
                <input 
                  type="text" 
                  name="nom" 
                  defaultValue={editingCategorie?.nom || ''} 
                  required 
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Ex: Électronique, Vêtements..."
                />
              </FormCell>
              
              {/* Row 2: Description */}
              <FormCell label="Description" icon={<FileText size={14} />} fullWidth>
                <div className="relative">
                  <textarea 
                    name="description" 
                    defaultValue={editingCategorie?.description || ''} 
                    rows={3} 
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Description de la catégorie..."
                  />
                </div>
              </FormCell>

            </div>
          </div>
        </form>
          
        {/* ⭐ FOOTER STICKY */}
        <div 
          className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A]"
        >
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button 
            type="button" 
            onClick={() => formRef.current?.requestSubmit()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {editingCategorie ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesModalForm;