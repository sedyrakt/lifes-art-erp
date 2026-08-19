// src/components/employes/EmployesModalForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Info, UserRound } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import EmployesModalHeader from './EmployesModalForm/EmployesModalHeader';
import EmployesImageUpload from './EmployesModalForm/EmployesImageUpload';
import EmployesFormFields from './EmployesModalForm/EmployesFormFields';
import EmployesFormActions from './EmployesModalForm/EmployesFormActions';

interface Employe { id: number; nom: string; prenom: string; email: string; telephone: string; poste: string; departement: string; date_embauche: string; salaire: number; image: string; status: 'Actif' | 'Inactif' | 'En congé'; created_at: string; }
interface EmployesModalFormProps { isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; editingEmploye: Employe | null; isDark?: boolean; imagePreview: string | null; uploadingImage: boolean; onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemoveImage: () => void; uploadProgress?: number; imageError?: string | null; }

const EmployesModalForm: React.FC<EmployesModalFormProps> = ({ isOpen, onClose, onSubmit, editingEmploye, isDark: isDarkProp, imagePreview, uploadingImage, onImageChange, onRemoveImage, uploadProgress = 0, imageError = null }) => {
  const { isDark: contextIsDark } = useTheme(); const isDark = isDarkProp !== undefined ? isDarkProp : contextIsDark; const formRef = useRef<HTMLFormElement>(null); const [isVisible, setIsVisible] = useState(false);
  
  // ⭐ FANITSIA MAJOR : Border Class (gray-300 / slate-700)
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  
  const theme = isDark ? { overlay: 'rgba(0, 0, 0, 0.78)', card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', border: '#263449', borderSoft: 'rgba(148,163,184,0.12)', text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primarySoft: 'rgba(99,102,241,0.12)' } : { overlay: 'rgba(15,23,42,0.52)', card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', borderSoft: '#F1F5F9', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5', primarySoft: 'rgba(99,102,241,0.07)' };
  
  useEffect(() => { if (!isOpen) { setIsVisible(false); return; } const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, [isOpen]);
  useEffect(() => { if (!isOpen) return; const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') { e.preventDefault(); formRef.current?.requestSubmit(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [isOpen, onClose]);
  if (!isOpen) return null;
  const fullName = editingEmploye ? `${editingEmploye.prenom || ''} ${editingEmploye.nom || ''}`.trim() : 'Nouveau'; const status = editingEmploye?.status || 'Actif'; const statusColor = status === 'Actif' ? (isDark ? '#34D399' : '#059669') : status === 'En congé' ? (isDark ? '#FBBF24' : '#D97706') : (isDark ? '#94A3B8' : '#64748B'); const formattedSalary = Number(editingEmploye?.salaire || 0).toLocaleString('fr-FR');

  return (<div className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: theme.overlay, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true" aria-labelledby="employe-modal-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    
    {/* ⭐ FANITSIA: Nampiana borderClass amin'ny sisiny ivelany */}
    <div className={`relative flex w-full max-w-4xl max-h-[82vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={(e) => e.stopPropagation()}>
      <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />
      
      <EmployesModalHeader editingEmploye={editingEmploye} onClose={onClose} isDark={isDark} />
      
      <form ref={formRef} onSubmit={onSubmit} className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[205px_minmax(0,1fr)]">
            <aside className="flex min-w-0 flex-col gap-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border" style={{ maxHeight: '205px', background: theme.surfaceSoft, borderColor: theme.border }}><EmployesImageUpload imagePreview={imagePreview} uploadingImage={uploadingImage} onImageChange={onImageChange} onRemoveImage={onRemoveImage} uploadProgress={uploadProgress} imageError={imageError} isDark={isDark} /></div>
              
              {/* ⭐ FANITSIA: Nampiana borderClass sy text-14/15 ho an'ny résumé */}
              <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                <div className={`flex items-center gap-2 border-b px-3.5 py-2.5 ${borderClass}`} style={{ borderColor: theme.borderSoft }}>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: theme.primarySoft, color: theme.primary }}><Info className="h-3.5 w-3.5" /></div>
                  <span className="text-[14.5px] font-semibold" style={{ color: theme.text }}>Informations</span>
                </div>
                <div className="space-y-2.5 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px]" style={{ color: theme.muted }}>Employé</span>
                    <span className="max-w-[115px] truncate text-right text-[14.5px] font-medium" style={{ color: theme.text }} title={fullName}>{fullName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px]" style={{ color: theme.muted }}>Statut</span>
                    <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: statusColor }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />{status}</span>
                  </div>
                  <div className="h-px" style={{ background: theme.borderSoft }} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px]" style={{ color: theme.muted }}>ID</span>
                    <span className="font-mono text-[14px] font-semibold" style={{ color: theme.primary }}>{editingEmploye ? `#${String(editingEmploye.id).padStart(4, '0')}` : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px]" style={{ color: theme.muted }}>Salaire</span>
                    <span className="text-[14.5px] font-semibold" style={{ color: theme.text }}>{formattedSalary} Ar</span>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 ${borderClass}`} style={{ background: theme.primarySoft, borderColor: isDark ? 'rgba(129,140,248,0.18)' : 'rgba(99,102,241,0.14)' }}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primarySoft, color: theme.primary }}><UserRound className="h-3.5 w-3.5" /></div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.05em]" style={{ color: theme.muted }}>{editingEmploye ? 'Modification' : 'Création'}</p>
                  <p className="truncate text-[12px] font-medium" style={{ color: theme.text }}>{editingEmploye ? 'Mise à jour du profil' : 'Nouvel employé'}</p>
                </div>
              </div>
            </aside>
            
            <section className="min-w-0">
              <div className={`rounded-xl border p-4 ${borderClass}`} style={{ background: theme.surface }}>
                <EmployesFormFields editingEmploye={editingEmploye} isDark={isDark} />
              </div>
            </section>
          </div>
        </div>
      </form>
      
      <EmployesFormActions editingEmploye={editingEmploye} onClose={onClose} isDark={isDark} onSave={() => formRef.current?.requestSubmit()} />
    </div>
    <style>{`@keyframes employeModalIn { from { opacity: 0; transform: translateY(7px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } } .employe-modal-scroll::-webkit-scrollbar { width: 6px; } .employe-modal-scroll::-webkit-scrollbar-track { background: transparent; } .employe-modal-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.25); border-radius: 999px; } .employe-modal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.4); } input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.65; cursor: pointer; } select option { background: ${isDark ? '#0F172A' : '#FFFFFF'}; color: ${isDark ? '#F8FAFC' : '#0F172A'}; }`}</style>
  </div>);
};
export default EmployesModalForm;