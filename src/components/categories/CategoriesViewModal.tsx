// ============================================================
// src/components/categories/CategoriesViewModal.tsx - PREMIUM SOLID MODAL (CLIENTS STYLE)
// ⭐ DESIGN: SOLID Slate-900, Sidebar Information Ankavia, Grid 2 Ankavanana
// ⭐ FANITSARA VAOVAO: Nohavaozina 100% mba hitovy amin'ny CategoriesModalForm
// ============================================================

import React from 'react';
import { 
  X, Folder, FileText, Calendar, Edit, Hash, Info
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  light: {
    card: '#FFFFFF',
    border: '#CBD5E1',
    headerBg: '#F8FAFC',
    formBg: '#FFFFFF',
    cellBg: '#F8FAFC',
    inputBg: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    primary: '#6366F1',
    primaryBg: 'rgba(99,102,241,0.06)',
    primaryBorder: 'rgba(99,102,241,0.15)',
    red: '#EF4444',
  },
  dark: {
    card: '#0F172A',        // ⭐ Slate-900 SOLID
    border: '#334155',
    headerBg: '#0F172A',    // ⭐ Slate-900 SOLID
    formBg: '#0F172A',      // ⭐ Slate-900 SOLID
    cellBg: '#1E293B',      // ⭐ Slate-800 SOLID
    inputBg: '#0F172A',     // ⭐ Slate-900 SOLID (input)
    text: '#F8FAFC',
    muted: '#94A3B8',
    primary: '#6366F1',
    primaryBg: 'rgba(99,102,241,0.12)',
    primaryBorder: 'rgba(99,102,241,0.25)',
    red: '#EF4444',
  }
};

interface Categorie {
  id: number;
  nom: string;
  description: string;
  created_at: string;
}

interface CategoriesViewModalProps {
  categorie: Categorie;
  onClose: () => void;
  onEdit: () => void;
  getCategoryColor: (id: number) => string;
  isDark: boolean;
}

// ⭐ FormCell helper (Mitovy 100% amin'ny CategoriesModalForm)
const FormCell: React.FC<{
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  required?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
  fullWidth?: boolean;
}> = ({ label, children, icon, required = false, borderRight = true, borderBottom = true, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  
  return (
    <div 
      className={`flex items-center px-3 py-2.5 ${borderRight ? 'border-r' : ''} ${borderBottom ? 'border-b' : ''} ${fullWidth ? 'col-span-3' : ''}`}
      style={{ 
        borderColor: theme.border,
        background: theme.cellBg, // ⭐ Slate-800
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {icon && <span className="shrink-0 text-indigo-600 dark:text-gray-100">{icon}</span>}
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </div>
        <div className="text-[15px] font-medium">
          {children}
        </div>
      </div>
    </div>
  );
};

const CategoriesViewModal: React.FC<CategoriesViewModalProps> = ({
  categorie,
  onClose,
  onEdit,
  getCategoryColor,
  isDark: propIsDark,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-view-title"
    >
      {/* ⭐ MODAL SOLID AVEC STICKY HEADER/FOOTER */}
      <div 
        className="relative w-full max-w-[800px] max-h-[85vh] shadow-2xl transition-all duration-300 rounded-2xl flex flex-col overflow-hidden border"
        style={{ background: theme.card, borderColor: theme.border }}
      >
        {/* ⭐ HEADER STICKY */}
        <div 
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b z-10"
          style={{ background: theme.headerBg, borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: theme.primaryBg, border: `1px solid ${theme.primaryBorder}` }}>
              <Folder className="w-4 h-4 text-indigo-600 dark:text-[#818cf8]" />
            </div>
            <div>
              <h2 id="category-view-title" className="text-[16px] font-bold tracking-tight" style={{ color: theme.text }}>
                Détails de la catégorie
              </h2>
              <p className="text-[13px] font-medium" style={{ color: theme.muted }}>
                Informations complètes
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-500"
            style={{ color: theme.muted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* ⭐ CORPS SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#1e293b]">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* --- COLONNE ANKAVIA (ICONE & STATS) --- */}
            <div className="w-full md:w-56 flex-shrink-0 flex flex-col gap-4">
              
              {/* Icone / Image Zone */}
              <div className="w-full aspect-square border-2 border-solid border-gray-300 dark:border-[#4f46e5]/60 rounded-xl bg-white dark:bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden relative">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[#8b5cf6] to-[#4f46e5] text-white">
                    <Folder className="w-10 h-10" />
                  </div>
                </div>
              </div>
              
              {/* Stats Block (Sidebar Information) */}
              <div className="p-4 rounded-xl border" style={{ borderColor: theme.border, background: theme.formBg }}>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4" style={{ color: theme.primary }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>Informations</span>
                </div>
                
                <div className="flex justify-between text-[14px] font-medium" style={{ color: theme.muted }}>
                  <span>Catégorie</span>
                  <span style={{ color: theme.text }}>{categorie.nom}</span>
                </div>
                <div className="flex justify-between text-[14px] font-medium mt-1" style={{ color: theme.muted }}>
                  <span>ID</span>
                  <span style={{ color: theme.text }}>{`#${String(categorie.id).padStart(4, '0')}`}</span>
                </div>
                
                <div className="h-px my-2" style={{ background: theme.border }} />
                
                <div className="flex justify-between text-[18px] font-bold">
                  <span style={{ color: theme.text }}>Status</span>
                  <span style={{ color: theme.primary }}>Actif</span>
                </div>
              </div>
            </div>

            {/* --- COLONNE ANKAVANANA (GRID 2) --- */}
            <div className="flex-1 border rounded-xl overflow-hidden" style={{ borderColor: theme.border, background: theme.formBg }}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
              
                {/* Ligne 1: Nom (col-span-2) */}
                <div className="col-span-2 flex items-center px-3 py-2.5 border-b" style={{ borderColor: theme.border, background: theme.cellBg }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Folder size={14} className="text-indigo-600 dark:text-gray-100" />
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>Nom</span>
                    </div>
                    <div className="text-[15px] font-medium" style={{ color: theme.text }}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getCategoryColor(categorie.id)}`} style={{ color: 'white' }}>
                          <Folder className="w-4 h-4" />
                        </div>
                        <span>{categorie.nom}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ligne 2: Description (col-span-2) */}
                <div className="col-span-2 flex items-start px-3 py-2.5 border-b-0 rounded-b-xl" style={{ borderColor: theme.border, background: theme.cellBg }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <FileText size={14} className="text-indigo-600 dark:text-gray-100" />
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>Description</span>
                    </div>
                    <div className="text-[15px] font-medium" style={{ color: theme.text }}>
                      {categorie.description || <span style={{ color: theme.muted }}>Aucune description</span>}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
          
        {/* ⭐ FOOTER UNIFORMISÉ */}
        <div 
          className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: theme.border, background: theme.headerBg }}
        >
          <button 
            type="button"
            onClick={onClose} 
            className="px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all border shadow-sm hover:opacity-80"
            style={{ background: theme.inputBg, borderColor: theme.border, color: theme.muted }}
          >
            Fermer
          </button>
          <button 
            type="button"
            onClick={onEdit} 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 bg-indigo-600"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesViewModal;