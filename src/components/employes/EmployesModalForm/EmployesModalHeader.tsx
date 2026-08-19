import React from 'react';
import { X, UserRound } from 'lucide-react';

interface EmployesModalHeaderProps { editingEmploye: any | null; onClose: () => void; isDark: boolean; }

const EmployesModalHeader: React.FC<EmployesModalHeaderProps> = ({ editingEmploye, onClose, isDark }) => {
  // ⭐ Boridy mifanaraka amin'ny gray-300 / slate-700
  const theme = isDark
    ? { surface: '#0F172A', border: '#334155', text: '#F8FAFC', muted: '#94A3B8', primary: '#818CF8', primarySoft: 'rgba(99,102,241,0.12)' }
    : { surface: '#FFFFFF', border: '#D1D5DB', text: '#0F172A', muted: '#64748B', primary: '#6366F1', primarySoft: 'rgba(99,102,241,0.07)' };

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3.5 sm:px-6" style={{ background: theme.surface, borderColor: theme.border }}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primarySoft, color: theme.primary }}>
          <UserRound className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h2 id="employe-modal-title" className="truncate text-[17px] font-semibold tracking-tight" style={{ color: theme.text }}>
            {editingEmploye ? "Modifier l'employé" : 'Nouvel employé'}
          </h2>
          <p className="mt-0.5 truncate text-[14px]" style={{ color: theme.muted }}>
            {editingEmploye ? 'Mettez à jour les informations de cet employé.' : 'Ajoutez les informations du nouvel employé.'}
          </p>
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 active:scale-95" style={{ color: theme.muted }} onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'; e.currentTarget.style.color = theme.text; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}>
        <X className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
    </header>
  );
};
export default EmployesModalHeader;