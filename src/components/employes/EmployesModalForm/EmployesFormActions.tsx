import React from 'react';
import { Plus, Save } from 'lucide-react';

interface EmployesFormActionsProps { editingEmploye: any | null; onClose: () => void; isDark: boolean; onSave: () => void; }

const EmployesFormActions: React.FC<EmployesFormActionsProps> = ({ editingEmploye, onClose, isDark, onSave }) => {
  // ⭐ Boridy mifanaraka amin'ny gray-300 / slate-700
  const theme = isDark ? { bg: '#0F172A', border: '#334155', text: '#F8FAFC', muted: '#94A3B8', hover: '#1E293B', primary: '#6366F1', primaryHover: '#4F46E5' } : { bg: '#F8FAFC', border: '#D1D5DB', text: '#0F172A', muted: '#64748B', hover: '#F1F5F9', primary: '#6366F1', primaryHover: '#4F46E5' };
  
  return (<footer className="flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3 sm:px-6" style={{ background: theme.bg, borderColor: theme.border }}>
    <span className="hidden text-[12px] sm:block" style={{ color: theme.muted }}>Échap pour fermer · Ctrl + Entrée pour enregistrer</span>
    <div className="ml-auto flex items-center gap-2">
      <button type="button" onClick={onClose} className="h-9 rounded-lg px-4 text-[14.5px] font-medium transition-all duration-150 active:scale-[0.98]" style={{ color: theme.muted }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.hover; e.currentTarget.style.color = theme.text; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}>Annuler</button>
      <button type="button" onClick={onSave} className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-[14.5px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(e) => { e.currentTarget.style.background = theme.primary; }}>{editingEmploye ? <Save className="h-3.5 w-3.5" strokeWidth={2} /> : <Plus className="h-3.5 w-3.5" strokeWidth={2} />}{editingEmploye ? 'Enregistrer' : 'Ajouter'}</button>
    </div>
  </footer>);
};
export default EmployesFormActions;