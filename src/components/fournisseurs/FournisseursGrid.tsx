// src/components/fournisseurs/FournisseursGrid.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Building, Phone, Mail, Eye, Edit, Trash2, Package, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Fournisseur {
  id: number;
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
  created_at: string;
  image?: string | null;
}

interface FournisseursGridProps {
  fournisseurs: Fournisseur[];
  onView: (fournisseur: Fournisseur) => void; // ⭐ Click card -> modal
  onEdit: (fournisseur: Fournisseur) => void;
  onDelete: (fournisseur: Fournisseur) => void;
  isDark?: boolean;
}

const FournisseursGrid: React.FC<FournisseursGridProps> = ({
  fournisseurs,
  onView,
  onEdit,
  onDelete,
  isDark: isDarkProp,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const navigate = useNavigate();

  if (fournisseurs.length === 0) {
    return (
      <div className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border px-6 py-12 text-center shadow-sm ${isDark ? 'bg-[#111c30] border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.18)]' : 'bg-white border-slate-300'}`}>
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400"><Building size={28} strokeWidth={1.7} /></div>
        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucun fournisseur</h3>
        <p className="mt-1 max-w-sm text-[14.5px] leading-relaxed text-slate-500 dark:text-slate-400">Commencez par créer votre premier fournisseur.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {fournisseurs.filter(Boolean).map((fournisseur) => {
        const hasImage = Boolean(fournisseur.image);
        const initiales = fournisseur.nom?.trim().split(/\s+/).filter(Boolean).map((name) => name.charAt(0)).join('').slice(0, 2).toUpperCase() || '?';

        return (
          <div
            key={fournisseur.id}
            // ⭐ CLIC CARD -> MODAL
            onClick={() => onView(fournisseur)}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${isDark ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
          >
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm transition-all duration-150 group-hover:border-indigo-200 group-hover:bg-indigo-100 group-hover:shadow-md dark:border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15">
                  {hasImage ? <img src={fournisseur.image!} alt={fournisseur.nom} loading="lazy" className="h-full w-full object-cover rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span className="text-lg font-bold">{initiales}</span>}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14.5px] font-semibold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">{fournisseur.nom || 'Fournisseur inconnu'}</div>
                  <div className="mt-0.5 text-[14.5px] text-slate-400 dark:text-slate-500">ID #{String(fournisseur.id).padStart(3, '0')}</div>
                </div>
              </div>
              <div className="flex flex-col items-end text-[14.5px] text-slate-400 dark:text-slate-500"><CalendarDays size={14} className="inline mr-1" /><span>{fournisseur.created_at ? new Date(fournisseur.created_at).toLocaleDateString('fr-FR') : '—'}</span></div>
            </div>

            <div className="flex flex-1 flex-col p-4 pt-3 space-y-1.5">
              {fournisseur.contact ? <div className="flex items-center gap-2 text-[14.5px] text-slate-600 dark:text-slate-300"><span className="text-slate-400 dark:text-slate-500">Contact :</span><span className="truncate font-medium">{fournisseur.contact}</span></div> : <span className="text-[14.5px] italic text-slate-400 dark:text-slate-500">Aucun contact</span>}
              {fournisseur.telephone ? <div className="flex items-center gap-2 text-[14.5px] text-slate-600 dark:text-slate-300"><Phone size={14} className="shrink-0" /><span className="truncate">{fournisseur.telephone}</span></div> : <span className="text-[14.5px] italic text-slate-400 dark:text-slate-500">—</span>}
              {fournisseur.email ? <div className="flex items-center gap-2 text-[14.5px] text-slate-600 dark:text-slate-300"><Mail size={14} className="shrink-0" /><span className="truncate">{fournisseur.email}</span></div> : <span className="text-[14.5px] italic text-slate-400 dark:text-slate-500">—</span>}
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
              <button type="button" title="Voir les produits" onClick={() => navigate(`/produits?fournisseur=${fournisseur.id}`)} className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><Package size={16} className="mx-auto" /></button>
              <button type="button" title="Modifier" onClick={() => onEdit(fournisseur)} className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-600 transition hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"><Edit size={16} className="mx-auto" /></button>
              <button type="button" title="Supprimer" onClick={() => onDelete(fournisseur)} className="flex-1 rounded-lg bg-rose-100 px-3 py-2 text-rose-700 transition hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/50"><Trash2 size={16} className="mx-auto" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FournisseursGrid;