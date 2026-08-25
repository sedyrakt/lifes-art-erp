// src/components/clients/ClientsGrid.tsx
import React from 'react';
import { Mail, Phone, MapPin, Edit, Trash2, Users, ImageOff, ShoppingBag, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface Client {
  id: number; nom: string; email: string; telephone: string; adresse: string; ville: string;
  code_postal: string; pays: string; image: string; type: 'Particulier' | 'Entreprise';
  created_at: string; total_achats?: number; nombre_commandes?: number;
}

interface ClientsGridProps {
  clients: Client[]; imageUrls: Record<number, string | null>; imageErrors: Record<number, boolean>;
  onView: (client: Client) => void; onEdit: (client: Client) => void; onDelete: (client: Client) => void;
  getTypeColor: (type: string) => string; getTypeIcon: (type: string) => React.ReactNode;
  handleImageError: (id: number) => void; isDark?: boolean;
}

const ClientsGrid: React.FC<ClientsGridProps> = ({ clients, imageUrls, imageErrors, onView, onEdit, onDelete, getTypeColor, getTypeIcon, handleImageError, isDark: isDarkProp }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const navigate = useNavigate();

  if (!clients.length) {
    return (
      <div className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border px-6 py-12 text-center shadow-sm ${isDark ? 'border-white/[0.14] bg-[#111c30] shadow-[0_12px_40px_rgba(0,0,0,0.18)]' : 'border-slate-300 bg-white'}`}>
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Users size={28} strokeWidth={1.7} />
        </div>
        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucun client</h3>
        <p className="mt-1 max-w-sm text-[14.5px] leading-relaxed text-slate-500 dark:text-slate-400">Aucun client ne correspond actuellement aux critères affichés.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 ${isDark ? 'bg-[#111c30]' : 'bg-white'}`}>
      {clients.filter(Boolean).map((client) => {
        const imageUrl = imageUrls[client.id] ?? null;
        const hasImageError = imageErrors[client.id] ?? false;
        const initials = client.nom?.trim().split(/\s+/).filter(Boolean).map((name) => name.charAt(0)).join('').slice(0, 2).toUpperCase() || '?';
        const totalAchats = Number(client.total_achats || 0);
        const nombreCommandes = Number(client.nombre_commandes || 0);

        return (
          <div key={client.id} onClick={() => onView(client)} className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${isDark ? 'border-white/[0.10] bg-[#111c30] hover:border-white/[0.20]' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
            {/* PHOTO */}
            <div className="relative h-36 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
              {imageUrl && !hasImageError ? (
                <img src={imageUrl} alt={client.nom} loading="lazy" onError={() => handleImageError(client.id)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : hasImageError ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700">
                  <ImageOff size={28} className="text-slate-400 dark:text-slate-500" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-50 dark:bg-indigo-500/10">
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute right-2 top-2 z-10">
                <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md`}>
                  {getTypeIcon(client.type)}{client.type}
                </span>
              </div>
              <div className="absolute bottom-2 left-2 z-10">
                <span className="rounded-md border border-white/15 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white/90 backdrop-blur-md">
                  CLI-{String(client.id).padStart(5, '0')}
                </span>
              </div>
            </div>

            {/* BODY */}
            <div className="flex flex-1 flex-col p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="line-clamp-1 min-w-0 text-[14px] font-semibold text-slate-900 dark:text-slate-100" title={client.nom}>{client.nom || 'Client inconnu'}</h4>
                <div className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <Calendar size={12} />
                  <span>{client.created_at ? new Date(client.created_at).toLocaleDateString('fr-FR') : '—'}</span>
                </div>
              </div>

              <div className="space-y-1 text-[13px] text-slate-500 dark:text-slate-400">
                {client.email ? (
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={13} className="shrink-0" />
                    <span className="truncate" title={client.email}>{client.email}</span>
                  </div>
                ) : null}
                {client.telephone ? (
                  <div className="flex items-center gap-2 truncate">
                    <Phone size={13} className="shrink-0" />
                    <span className="truncate" title={client.telephone}>{client.telephone}</span>
                  </div>
                ) : null}
                {!client.email && !client.telephone && (
                  <span className="italic text-slate-400 dark:text-slate-500">Aucun contact</span>
                )}
              </div>

              <div className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                <MapPin size={13} className="shrink-0" />
                <span className="truncate">{client.ville || 'N/A'}</span>
                {client.pays && <span className="truncate text-slate-400 dark:text-slate-500">({client.pays})</span>}
              </div>

              {/* STATS */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5 dark:border-slate-700">
                <div className="flex min-w-0 flex-col">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Total achats</span>
                  <span className="truncate text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{totalAchats.toLocaleString('fr-FR')} Ar</span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Commandes</span>
                  <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[13px] font-semibold ${nombreCommandes > 0 ? 'border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                    <ShoppingBag size={12} />
                    {nombreCommandes}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-200 pt-2.5 dark:border-slate-700" onClick={(event) => event.stopPropagation()}>
                <button type="button" title="Modifier" onClick={() => onEdit(client)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400">
                  <Edit size={14} />
                </button>
                <button type="button" title="Supprimer" onClick={() => onDelete(client)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-rose-100 text-rose-700 transition hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/50">
                  <Trash2 size={14} />
                </button>
                <button type="button" title="Voir les commandes" onClick={() => navigate(`/commandes?client=${client.id}`)} className="flex h-8 flex-1 items-center justify-center rounded-md bg-indigo-600 text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  <ShoppingBag size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientsGrid;