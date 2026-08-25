// src/components/fournisseurs/FournisseursGrid.tsx
import React from 'react';
import { Building, Phone, Mail, Package, Edit, Trash2, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface Fournisseur {
  id: number; nom: string; contact: string; telephone: string; email: string;
  adresse: string; created_at: string; image?: string | null;
}

interface FournisseursGridProps {
  fournisseurs: Fournisseur[];
  onView: (fournisseur: Fournisseur) => void;
  onEdit: (fournisseur: Fournisseur) => void;
  onDelete: (fournisseur: Fournisseur) => void;
  isDark?: boolean;
}

const FournisseursGrid: React.FC<FournisseursGridProps> = ({ fournisseurs, onView, onEdit, onDelete, isDark: isDarkProp }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const navigate = useNavigate();

  const formatDate = (date?: string) => {
    if (!date) return '—';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('fr-FR');
  };

  const getInitiales = (nom?: string) => {
    if (!nom?.trim()) return '?';
    return nom.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  };

  if (!fournisseurs?.length) {
    return (
      <div className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border px-6 py-12 text-center shadow-sm ${isDark ? 'border-white/[0.06] bg-[#111C30] shadow-[0_12px_40px_rgba(0,0,0,0.18)]' : 'border-slate-200 bg-white'}`}>
        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${isDark ? 'border-indigo-500/15 bg-indigo-500/10 text-indigo-400' : 'border-indigo-100 bg-indigo-50 text-indigo-600'}`}>
          <Building size={28} strokeWidth={1.7} />
        </div>
        <h3 className={`text-[16px] font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Aucun fournisseur</h3>
        <p className={`mt-1 max-w-sm text-[14px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Commencez par créer votre premier fournisseur.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${isDark ? 'bg-[#111C30]' : 'bg-white'}`}>
      {fournisseurs.filter(Boolean).map((fournisseur) => {
        const hasImage = Boolean(fournisseur.image);
        const initiales = getInitiales(fournisseur.nom);

        return (
          <article key={fournisseur.id} onClick={() => onView(fournisseur)} className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${isDark ? 'border-white/[0.06] bg-[#111C30] hover:border-white/[0.12]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
            {/* HEADER */}
            <div className={`flex items-center justify-between gap-3 border-b px-3 py-2.5 ${isDark ? 'border-white/[0.06] bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex min-w-0 items-center gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border ${isDark ? 'border-indigo-500/15 bg-indigo-500/10 text-indigo-400' : 'border-indigo-100 bg-indigo-50 text-indigo-600'}`}>
                  {hasImage ? (
                    <img src={fournisseur.image as string} alt={fournisseur.nom || 'Fournisseur'} loading="lazy" className="h-full w-full object-cover" onError={(e) => { const target = e.currentTarget; target.style.display = 'none'; const parent = target.parentElement; if (parent && !parent.querySelector('[data-fallback]')) { const fallback = document.createElement('span'); fallback.dataset.fallback = 'true'; fallback.className = 'text-[14px] font-bold'; fallback.textContent = initiales; parent.appendChild(fallback); } }} />
                  ) : (
                    <span className="text-[14px] font-bold">{initiales}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`truncate text-[14px] font-semibold transition-colors ${isDark ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>{fournisseur.nom || 'Fournisseur inconnu'}</div>
                  <div className={`mt-0.5 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ID #{String(fournisseur.id).padStart(3, '0')}</div>
                </div>
              </div>
              <div className={`flex shrink-0 items-center gap-1 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <CalendarDays size={11} />
                <span>{formatDate(fournisseur.created_at)}</span>
              </div>
            </div>

            {/* BODY */}
            <div className="flex flex-1 flex-col space-y-1.5 p-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`shrink-0 text-[12px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Contact</span>
                {fournisseur.contact ? (
                  <span className={`truncate text-[13px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{fournisseur.contact}</span>
                ) : (
                  <span className={`truncate text-[13px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Non spécifié</span>
                )}
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className={`shrink-0 text-[12px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Téléphone</span>
                {fournisseur.telephone ? (
                  <span className={`truncate text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{fournisseur.telephone}</span>
                ) : (
                  <span className={`text-[13px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                )}
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className={`shrink-0 text-[12px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Email</span>
                {fournisseur.email ? (
                  <span className={`truncate text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{fournisseur.email}</span>
                ) : (
                  <span className={`text-[13px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                )}
              </div>
              {fournisseur.adresse && (
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`shrink-0 text-[12px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Adresse</span>
                  <span className={`truncate text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`} title={fournisseur.adresse}>{fournisseur.adresse}</span>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className={`mt-2 flex items-center gap-1.5 border-t px-3 py-2.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
              <button type="button" title="Voir les produits" aria-label="Voir les produits" onClick={() => navigate(`/produits?fournisseur=${fournisseur.id}`)} className={`flex h-8 flex-1 items-center justify-center rounded-md transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400' : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'}`}>
                <Package size={14} strokeWidth={2} />
              </button>
              <button type="button" title="Modifier" aria-label="Modifier" onClick={() => onEdit(fournisseur)} className={`flex h-8 flex-1 items-center justify-center rounded-md transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-amber-500/10 hover:text-amber-400' : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600'}`}>
                <Edit size={14} strokeWidth={2} />
              </button>
              <button type="button" title="Supprimer" aria-label="Supprimer" onClick={() => onDelete(fournisseur)} className={`flex h-8 flex-1 items-center justify-center rounded-md transition-colors ${isDark ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default FournisseursGrid;