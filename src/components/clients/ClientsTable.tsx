// ============================================================
// src/components/clients/ClientsTable.tsx
// ============================================================
// ⭐ PREMIUM ERP CLIENTS TABLE
// ⭐ ALL BORDER TABLE
// ⭐ MEDIUM / READABLE FONT SIZE
// ⭐ DARK / LIGHT MODE
// ⭐ MULTI-SELECTION
// ⭐ BULK ACTIONS
// ⭐ CLIENT AVATAR / IMAGE
// ⭐ CONTACT / LOCATION
// ⭐ TOTAL ACHATS / COMMANDES
// ⭐ FLOATING ACTION MENU
// ⭐ RESPONSIVE HORIZONTAL SCROLL
// ⭐ PREMIUM FOOTER
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Phone, MapPin, Eye, Edit, Trash2, Plus, Users, Calendar, ImageOff, User, Building, ShoppingBag, MoreVertical, CheckSquare, TextSelection, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

// ============================================================
// TYPES
// ============================================================

interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  image: string;
  type: 'Particulier' | 'Entreprise';
  created_at: string;
  total_achats?: number;
  nombre_commandes?: number;
}

interface ClientsTableProps {
  clients: Client[];
  imageUrls: Record<number, string | null>;
  imageErrors: Record<number, boolean>;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onAdd: () => void;
  getTypeColor: (type: string) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  handleImageError: (id: number) => void;
  selectedIds?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: number, checked: boolean) => void;
  onBulkDelete?: (ids: number[]) => void;
  onBulkUpdateType?: (ids: number[], newType: string) => void;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

// ============================================================
// COMPONENT
// ============================================================

const ClientsTable: React.FC<ClientsTableProps> = ({ clients, imageUrls, imageErrors, onView, onEdit, onDelete, onAdd, getTypeColor, getTypeIcon, handleImageError, selectedIds = new Set<number>(), onSelectAll, onSelectOne, onBulkDelete, onBulkUpdateType }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({});

  // ==========================================================
  // COLORS (identique à CategoriesTable)
  // ==========================================================

  const tableBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const tableSecondaryBackground = isDark ? 'bg-[#0f192b]' : 'bg-slate-50/70';
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-200';
  const cellBorderColor = isDark ? 'border-white/[0.09]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.16]' : 'border-slate-300';

  // ==========================================================
  // SAFE DATA
  // ==========================================================

  const safeClients = useMemo(() => clients?.filter(Boolean) ?? [], [clients]);
  const safeImageUrls = imageUrls || {};
  const safeImageErrors = imageErrors || {};
  const safeSelectedIds = selectedIds || new Set<number>();

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {
    const total = safeClients.length;
    const particuliers = safeClients.filter((client) => client.type === 'Particulier').length;
    const entreprises = safeClients.filter((client) => client.type === 'Entreprise').length;
    const totalAchats = safeClients.reduce((sum, client) => sum + Number(client.total_achats || 0), 0);
    const totalCommandes = safeClients.reduce((sum, client) => sum + Number(client.nombre_commandes || 0), 0);
    return { total, particuliers, entreprises, totalAchats, totalCommandes };
  }, [safeClients]);

  // ==========================================================
  // SELECTION
  // ==========================================================

  const allSelected = safeClients.length > 0 && safeClients.every((client) => safeSelectedIds.has(client.id));
  const someSelected = safeClients.some((client) => safeSelectedIds.has(client.id)) && !allSelected;

  // ==========================================================
  // CLOSE MENU
  // ==========================================================

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => setOpenMenuId(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  // ==========================================================
  // TOGGLE ACTION MENU
  // ==========================================================

  const toggleMenu = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 225;
    const MENU_HEIGHT = 175;
    const PADDING = 14;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const position: MenuPosition = {};
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < MENU_HEIGHT + PADDING && spaceAbove > MENU_HEIGHT) {
      position.bottom = viewportHeight - rect.top + 6;
    } else {
      position.top = rect.bottom + 6;
    }
    const spaceRight = viewportWidth - rect.right;
    if (spaceRight < MENU_WIDTH + PADDING && rect.left > MENU_WIDTH) {
      position.right = viewportWidth - rect.right + 6;
    } else {
      position.left = Math.max(PADDING, rect.right - MENU_WIDTH);
    }
    setMenuPosition(position);
    setOpenMenuId(id);
  };

  // ==========================================================
  // MENU ACTION
  // ==========================================================

  const handleMenuAction = (callback: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(null);
    callback();
  };

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (safeClients.length === 0) {
    return (
      <div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
        <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Users size={30} strokeWidth={1.7} />
        </div>
        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucun client</h3>
        <p className="mt-2 max-w-[420px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Aucun client ne correspond actuellement aux critères affichés.</p>
        <button type="button" onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]">
          <Plus size={17} />
          Nouveau client
        </button>
      </div>
    );
  }

  // ==========================================================
  // MAIN TABLE
  // ==========================================================

  return (
    <div className={`relative overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.20)] ${tableBackground} ${borderColor}`}>
      {/* ======================================================
          BULK ACTION BAR
      ======================================================= */}

      {safeSelectedIds.size > 0 && (
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark ? 'border-white/[0.08] bg-indigo-500/[0.065]' : 'border-indigo-100 bg-indigo-50/75'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <CheckSquare size={15} />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">
                {safeSelectedIds.size} client{safeSelectedIds.size > 1 ? 's' : ''} sélectionné{safeSelectedIds.size > 1 ? 's' : ''}
              </span>
              <span className="mt-0.5 text-[12px] text-indigo-500/75 dark:text-indigo-400/70">Actions groupées disponibles</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onBulkUpdateType?.(Array.from(safeSelectedIds), 'Entreprise')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-[0.98]">
              <Building size={15} />
              Entreprise
            </button>
            <button type="button" onClick={() => onBulkUpdateType?.(Array.from(safeSelectedIds), 'Particulier')} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98]">
              <User size={15} />
              Particulier
            </button>
            <button type="button" onClick={() => onBulkDelete?.(Array.from(safeSelectedIds))} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500/20 active:scale-[0.98]">
              <Trash2 size={15} />
              Supprimer
            </button>
            <button type="button" onClick={() => onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
              <TextSelection size={15} />
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          SCROLL CONTAINER
      ======================================================= */}

      <div className="custom-scrollbar overflow-x-auto overflow-y-auto scrollbar-gutter-stable">
        {/* ====================================================
            TABLE
            ⭐ border-collapse = ALL BORDER
        ===================================================== */}

        <table className={`w-full min-w-[1280px] table-fixed border border-collapse text-left ${borderColor}`}>
          {/* ==================================================
              HEADER
          =================================================== */}

          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark ? 'bg-[#111c30]/98' : 'bg-slate-50/98'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
              <th scope="col" className={`w-[58px] border px-4 py-4 align-middle ${headerBorderColor}`}>
                <input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = someSelected; }} onChange={(event) => onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner tous les clients" />
              </th>
              <th scope="col" className={`w-[72px] border px-3 py-4 align-middle ${headerBorderColor}`}>Photo</th>
              <th scope="col" className={`w-[215px] border px-5 py-4 align-middle ${headerBorderColor}`}>Client</th>
              <th scope="col" className={`w-[235px] border px-5 py-4 align-middle ${headerBorderColor}`}>Contact</th>
              <th scope="col" className={`w-[145px] border px-5 py-4 align-middle ${headerBorderColor}`}>Type</th>
              <th scope="col" className={`w-[185px] border px-5 py-4 align-middle ${headerBorderColor}`}>Localisation</th>
              <th scope="col" className={`w-[145px] border px-4 py-4 text-right align-middle ${headerBorderColor}`}>Total achats</th>
              <th scope="col" className={`w-[120px] border px-4 py-4 text-right align-middle ${headerBorderColor}`}>Commandes</th>
              <th scope="col" className={`w-[125px] border px-4 py-4 text-right align-middle ${headerBorderColor}`}>Actions</th>
            </tr>
          </thead>

          {/* ==================================================
              BODY
          =================================================== */}

          <tbody className={tableBackground}>
            {safeClients.map((client) => {
              const imageUrl = safeImageUrls[client.id] || null;
              const hasImageError = safeImageErrors[client.id] || false;
              const initials = client.nom?.trim().split(/\s+/).filter(Boolean).map((name) => name.charAt(0)).join('').slice(0, 2).toUpperCase() || '?';
              const isSelected = safeSelectedIds.has(client.id);
              return (
                <tr key={client.id} onClick={() => { setOpenMenuId(null); onView(client); }} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected ? (isDark ? 'bg-indigo-500/[0.085]' : 'bg-indigo-50/80') : isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80'}`}>
                  {/* SELECT */}
                  <td className={`border px-4 py-3 align-middle ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={(event) => onSelectOne?.(client.id, event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${client.nom}`} />
                  </td>
                  {/* PHOTO */}
                  <td className={`border px-3 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm transition-all duration-150 group-hover:border-indigo-200 group-hover:bg-indigo-100 group-hover:shadow-md dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/15">
                      {imageUrl && !hasImageError ? (
                        <img src={imageUrl} alt={client.nom} loading="lazy" onError={() => handleImageError(client.id)} className="h-full w-full object-cover" />
                      ) : hasImageError ? (
                        <ImageOff size={18} className="text-slate-400 dark:text-slate-500" />
                      ) : (
                        <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
                      )}
                    </div>
                  </td>
                  {/* CLIENT */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="min-w-0">
                      <div title={client.nom} className="truncate text-[15px] font-semibold leading-5 text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{client.nom || 'Client inconnu'}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">
                        <Calendar size={12} />
                        <span>{client.created_at ? new Date(client.created_at).toLocaleDateString('fr-FR') : '—'}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>ID #{String(client.id).padStart(3, '0')}</span>
                      </div>
                    </div>
                  </td>
                  {/* CONTACT */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      {client.email ? (
                        <div className="flex min-w-0 items-center gap-2 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                          <Mail size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                          <span title={client.email} className="max-w-[190px] truncate">{client.email}</span>
                        </div>
                      ) : null}
                      {client.telephone ? (
                        <div className="flex items-center gap-2 text-[14px] font-medium text-slate-600 dark:text-slate-300">
                          <Phone size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                          <span title={client.telephone} className="max-w-[170px] truncate">{client.telephone}</span>
                        </div>
                      ) : null}
                      {!client.email && !client.telephone ? (
                        <span className="text-[14px] italic text-slate-400 dark:text-slate-500">Aucun contact</span>
                      ) : null}
                    </div>
                  </td>
                  {/* TYPE */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-semibold ${getTypeColor(client.type)}`}>
                      {getTypeIcon(client.type)}
                      {client.type}
                    </span>
                  </td>
                  {/* LOCATION */}
                  <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>
                    <div className="flex min-w-0 items-center gap-2.5 text-[14px] text-slate-600 dark:text-slate-300">
                      <MapPin size={15} className="shrink-0 text-slate-400 dark:text-slate-500" />
                      <div className="min-w-0">
                        <span title={client.ville || 'N/A'} className="block max-w-[150px] truncate font-semibold">{client.ville || 'N/A'}</span>
                        {client.pays ? <span className="mt-0.5 block truncate text-[12px] font-medium text-slate-400 dark:text-slate-500">{client.pays}</span> : null}
                      </div>
                    </div>
                  </td>
                  {/* TOTAL ACHATS */}
                  <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`}>
                    <span className="whitespace-nowrap text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{Number(client.total_achats || 0).toLocaleString('fr-FR')} Ar</span>
                  </td>
                  {/* COMMANDES */}
                  <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`}>
                    <span className="inline-flex min-w-[58px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                      <ShoppingBag size={14} className="text-slate-400 dark:text-slate-500" />
                      {Number(client.nombre_commandes || 0)}
                    </span>
                  </td>
                  {/* ACTIONS */}
                  <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => navigate(`/commandes?client=${client.id}`)} title="Voir les commandes" aria-label={`Voir les commandes de ${client.nom}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400">
                        <ShoppingBag size={17} />
                      </button>
                      <button type="button" onClick={() => onView(client)} title="Voir les détails" aria-label={`Voir ${client.nom}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400">
                        <Eye size={17} />
                      </button>
                      <button type="button" onClick={(event) => toggleMenu(client.id, event)} title="Plus d'actions" aria-label={`Actions pour ${client.nom}`} aria-expanded={openMenuId === client.id} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 ${openMenuId === client.id ? 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200' : 'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ==========================================================
          FLOATING ACTION MENU
      =========================================================== */}

      {openMenuId !== null && createPortal(
        <div className={`fixed z-[99999] w-[225px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'border-white/[0.10] bg-[#111c30]/98' : 'border-slate-200 bg-white/98'}`} style={{ top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined, bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined, left: menuPosition.left !== undefined ? `${menuPosition.left}px` : undefined, right: menuPosition.right !== undefined ? `${menuPosition.right}px` : undefined }} onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
          {(() => {
            const currentClient = safeClients.find((client) => client.id === openMenuId);
            if (!currentClient) return null;
            return (
              <div className="flex flex-col text-[14px]">
                <div className={`border-b px-4 py-3 ${isDark ? 'border-white/[0.08]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
                      {safeImageUrls[currentClient.id] && !safeImageErrors[currentClient.id] ? (
                        <img src={safeImageUrls[currentClient.id]!} alt={currentClient.nom} className="h-full w-full object-cover" />
                      ) : (
                        <User size={17} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="max-w-[165px] truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">{currentClient.nom}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500">ID #{currentClient.id}</div>
                    </div>
                  </div>
                </div>
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onView(currentClient), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Eye size={15} /></span>
                  <span>Voir les détails</span>
                  <ChevronRight size={15} className="ml-auto text-slate-300 dark:text-slate-600" />
                </button>
                <button type="button" onMouseDown={(event) => handleMenuAction(() => navigate(`/commandes?client=${currentClient.id}`), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><ShoppingBag size={15} /></span>
                  <span>Voir les commandes</span>
                  <ExternalLink size={14} className="ml-auto text-slate-300 dark:text-slate-600" />
                </button>
                <div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`} />
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onEdit(currentClient), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Edit size={15} /></span>
                  <span>Modifier</span>
                  <ChevronRight size={15} className="ml-auto text-slate-300 dark:text-slate-600" />
                </button>
                <button type="button" onMouseDown={(event) => handleMenuAction(() => onDelete(currentClient), event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 size={15} /></span>
                  <span>Supprimer</span>
                </button>
              </div>
            );
          })()}
        </div>,
        document.body
      )}

      {/* ==========================================================
          FOOTER
      =========================================================== */}

      <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.total}</span> client{stats.total > 1 ? 's' : ''}
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.10)]" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.particuliers}</span> particulier{stats.particuliers > 1 ? 's' : ''}
            </span>
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.entreprises}</span> entreprise{stats.entreprises > 1 ? 's' : ''}
            </span>
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-indigo-500 dark:text-indigo-400" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.totalCommandes}</span> commande{stats.totalCommandes > 1 ? 's' : ''}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500">
          <Users size={15} />
          <span>Gestion des clients</span>
        </div>
      </div>

      {/* ==========================================================
          CUSTOM SCROLLBAR + ANIMATION
      =========================================================== */}

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 7px; height: 7px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.26); border-radius: 999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.46); }
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100, 116, 139, 0.28) transparent; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.20); }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.32); }
          .scrollbar-gutter-stable { scrollbar-gutter: stable; }
          @keyframes clientRowIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
          .group { animation: clientRowIn 0.18s ease-out; }
        `}
      </style>
    </div>
  );
};

export default ClientsTable;