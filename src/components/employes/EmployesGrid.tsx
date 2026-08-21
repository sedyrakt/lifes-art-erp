// src/components/employes/EmployesGrid.tsx
import React from 'react';
import {
  User,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  Wallet,
  History,
  ImageOff,
  Plus,
  Users,
  Calendar,
} from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';

interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  date_embauche: string;
  salaire: number;
  image: string;
  status: string;
  created_at: string;
}

interface EmployesGridProps {
  employes: Employe[];
  imageUrls: Record<number, string | null>;
  imageErrors: Record<number, boolean>;
  onView: (id: number) => void; // ⭐ Click card -> modal
  onEdit: (employe: Employe) => void;
  onDelete: (id: number, image?: string) => void;
  onPaiement: (employe: Employe) => void;
  onHistorique: (employe: Employe) => void;
  onAdd: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  handleImageError: (id: number) => void;
  isDark: boolean;
}

const EmployesGrid: React.FC<EmployesGridProps> = ({
  employes,
  imageUrls,
  imageErrors,
  onView,
  onEdit,
  onDelete,
  onPaiement,
  onHistorique,
  onAdd,
  getStatusColor,
  getStatusIcon,
  handleImageError,
  isDark,
}) => {
  const statusLabels: Record<string, string> = {
    actif: 'Actif',
    inactif: 'Inactif',
    en_conge: 'En congé',
    licencie: 'Licencié',
  };

  if (employes.length === 0) {
    return (
      <div className={`flex min-h-[320px] flex-col items-center justify-center rounded-xl border px-6 py-12 text-center shadow-sm ${isDark ? 'bg-[#111c30] border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.18)]' : 'bg-white border-slate-300'}`}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Users size={24} strokeWidth={1.8} /></div>
        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucun employé</h3>
        <p className="mt-1 max-w-sm text-[14.5px] leading-relaxed text-slate-500 dark:text-slate-400">Commencez par ajouter votre premier employé.</p>
        <button type="button" onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[14.5px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98]"><Plus size={15} />Ajouter un employé</button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {employes.filter(Boolean).map((employe) => {
        const imageUrl = imageUrls[employe.id] ?? null;
        const hasImageError = imageErrors[employe.id] ?? false;
        const initiales = `${employe.prenom?.charAt(0)?.toUpperCase() || ''}${employe.nom?.charAt(0)?.toUpperCase() || ''}`.replace(/\s/g, '') || '?';
        const statusLabel = statusLabels[employe.status] || employe.status || 'Inconnu';

        return (
          <div
            key={employe.id}
            // ⭐ CLIC CARD -> MODAL
            onClick={() => onView(employe.id)}
            className={`group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${isDark ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
          >
            {/* PHOTO (COMPACT: H-36) */}
            <div className="relative h-36 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
              {imageUrl && !hasImageError ? (
                <img src={imageUrl} alt={`${employe.prenom} ${employe.nom}`} loading="lazy" onError={() => handleImageError(employe.id)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : hasImageError ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700"><ImageOff size={28} className="text-slate-400 dark:text-slate-500" /></div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-50 dark:bg-indigo-500/10"><span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{initiales}</span></div>
              )}
              
              {/* CALQUE (OVERLAY) */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* BADGE STATUS (COMPACT + BLUR) */}
              <div className="absolute right-2 top-2 z-10">
                <span className={`inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md`}>
                  {getStatusIcon(employe.status)}{statusLabel}
                </span>
              </div>
            </div>

            {/* BODY (COMPACT P-3) */}
            <div className="flex flex-1 flex-col p-3">
              <div className="mb-1 flex items-start justify-between">
                <h4 className="text-[14px] font-semibold text-slate-900 line-clamp-1 dark:text-slate-100" title={`${employe.prenom} ${employe.nom}`}>{employe.prenom} {employe.nom}</h4>
                <div className="text-[11px] text-slate-400 dark:text-slate-500"><Calendar size={12} className="inline mr-1" />{employe.date_embauche ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') : '—'}</div>
              </div>
              <div className="space-y-0.5 text-[13px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 truncate"><User size={13} className="shrink-0" /><span className="truncate font-medium text-slate-700 dark:text-slate-300">{employe.poste || 'Poste non défini'}</span></div>
                {employe.departement && <div className="flex items-center gap-2 truncate text-slate-400 dark:text-slate-500"><span className="ml-6">Dép. : {employe.departement}</span></div>}
              </div>
              <div className="mt-2 space-y-1 text-[13px] text-slate-500 dark:text-slate-400">
                {employe.email && <div className="flex items-center gap-2 truncate"><Mail size={13} className="shrink-0" /><span className="truncate" title={employe.email}>{employe.email}</span></div>}
                {employe.telephone && <div className="flex items-center gap-2 truncate"><Phone size={13} className="shrink-0" /><span className="truncate">{employe.telephone}</span></div>}
                {!employe.email && !employe.telephone && <span className="italic text-slate-400 dark:text-slate-500">Aucun contact</span>}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                <div className="flex flex-col"><span className="text-[11px] text-slate-400 dark:text-slate-500">Salaire mensuel</span><span className="text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(employe.salaire)}</span></div>
              </div>
              
              {/* ACTIONS COMPACT (H-8) */}
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-200 pt-2.5 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <button type="button" title="Modifier" onClick={() => onEdit(employe)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"><Edit size={14} className="mx-auto" /></button>
                <button type="button" title="Payer salaire" onClick={() => onPaiement(employe)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/50"><Wallet size={14} className="mx-auto" /></button>
                <button type="button" title="Historique" onClick={() => onHistorique(employe)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 transition hover:bg-indigo-200 hover:text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50"><History size={14} className="mx-auto" /></button>
                <button type="button" title="Supprimer" onClick={() => onDelete(employe.id, employe.image)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-rose-100 text-rose-700 transition hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/50"><Trash2 size={14} className="mx-auto" /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmployesGrid;