// ============================================================
// src/components/employes/EmployesViewModal.tsx
// ⭐ PREMIUM EMPLOYE VIEW MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY
// ⭐ PROFESSIONAL SPACING
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Calendar, Briefcase, DollarSign, Edit, History, User, CheckCircle2, Building2, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: { card: '#FFFFFF', header: '#FFFFFF', footer: '#F8FAFC', border: '#E2E8F0', borderStrong: '#CBD5E1', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5', primarySoft: 'rgba(99,102,241,0.08)', primaryBorder: 'rgba(99,102,241,0.18)', green: '#059669', greenBg: 'rgba(16,185,129,0.10)', greenBorder: 'rgba(16,185,129,0.25)', red: '#DC2626', redBg: 'rgba(239,68,68,0.08)', redBorder: 'rgba(239,68,68,0.20)', amber: '#D97706', amberBg: 'rgba(245,158,11,0.10)', amberBorder: 'rgba(245,158,11,0.25)', blue: '#2563EB', blueBg: 'rgba(37,99,235,0.08)', blueBorder: 'rgba(37,99,235,0.18)' },
  dark: { card: '#0F172A', header: '#0F172A', footer: '#0F172A', border: '#334155', borderStrong: '#475569', text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#6366F1', primaryHover: '#818CF8', primarySoft: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.25)', green: '#34D399', greenBg: 'rgba(16,185,129,0.14)', greenBorder: 'rgba(52,211,153,0.28)', red: '#F87171', redBg: 'rgba(239,68,68,0.12)', redBorder: 'rgba(248,113,113,0.25)', amber: '#FBBF24', amberBg: 'rgba(245,158,11,0.12)', amberBorder: 'rgba(251,191,36,0.25)', blue: '#60A5FA', blueBg: 'rgba(59,130,246,0.12)', blueBorder: 'rgba(96,165,250,0.25)' },
};

interface Employe { id: number; nom: string; prenom: string; email: string; telephone: string; poste: string; departement: string; date_embauche: string; salaire: number; image: string; status: string; created_at: string; }
interface EmployesViewModalProps { employe: Employe; imageUrl: string | null; onClose: () => void; onEdit: () => void; onHistorique?: () => void; getStatusColor: (status: string) => string; getStatusIcon: (status: string) => React.ReactNode; isDark?: boolean; }
interface FormCellProps { label: string; children: React.ReactNode; icon?: React.ReactNode; borderRight?: boolean; borderBottom?: boolean; fullWidth?: boolean; }

const FormCell: React.FC<FormCellProps> = ({ label, children, icon, borderRight = true, borderBottom = true, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  return (<div className={`flex min-w-0 items-center px-3 py-2.5 ${borderRight ? `border-r ${borderClass}` : ''} ${borderBottom ? `border-b ${borderClass}` : ''} ${fullWidth ? 'col-span-3' : ''}`} style={{ background: theme.card }}><div className="min-w-0 flex-1"><div className="mb-0.5 flex items-center gap-1.5">{icon && <span className="flex shrink-0 items-center justify-center" style={{ color: theme.muted }}>{icon}</span>}<span className="truncate text-[12px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>{label || ' '}</span></div><div className="min-w-0 text-[14px] font-medium leading-4">{children}</div></div></div>);
};

const EmployesViewModal: React.FC<EmployesViewModalProps> = ({ employe, imageUrl, onClose, onEdit, onHistorique, getStatusIcon, isDark: isDarkProp }) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : contextIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);
  const overlayBg = 'rgba(0, 0, 0, 0.65)';
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [onClose]);

  if (!employe) return null;

  const getInitiales = (prenom: string, nom: string): string => {
    const first = prenom?.trim()?.charAt(0)?.toUpperCase() || '?';
    const last = nom?.trim()?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A'; try { const date = new Date(dateStr); if (Number.isNaN(date.getTime())) return 'N/A'; return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return 'N/A'; }
  };
  const formatDateTime = (dateStr: string): string => {
    if (!dateStr) return 'N/A'; try { const date = new Date(dateStr); if (Number.isNaN(date.getTime())) return 'N/A'; return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return 'N/A'; }
  };
  const normalizeStatus = (status: string): string => String(status || '').trim().toLowerCase().replace(/\s+/g, '_');

  const getStatusTheme = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'actif': return { background: theme.greenBg, borderColor: theme.greenBorder, color: theme.green };
      case 'inactif': return { background: theme.redBg, borderColor: theme.redBorder, color: theme.red };
      case 'en_conge': return { background: theme.amberBg, borderColor: theme.amberBorder, color: theme.amber };
      default: return { background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary };
    }
  };

  const statusTheme = getStatusTheme(employe.status);
  const initiales = getInitiales(employe.prenom, employe.nom);

  return (<div className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6" style={{ background: overlayBg, backdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true" aria-labelledby="employe-view-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`relative flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.985] opacity-0'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={(event) => event.stopPropagation()}>
      <div className="absolute left-0 right-0 top-0 z-20 h-[3px]" style={{ background: theme.primary }} />
      
      <div className={`flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5 ${borderClass}`} style={{ background: theme.header }}>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary }}><User className="h-4 w-4" strokeWidth={2} /></div>
          <div className="min-w-0"><h2 id="employe-view-modal-title" className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>Détails de l'employé</h2><p className="mt-0.5 truncate text-[13px] font-medium" style={{ color: theme.primary }}>{employe.prenom} {employe.nom}</p></div>
        </div>
        {/* ⭐ FIX: Logo path dia './images/logo.png' */}
        <img src="./images/logo.png" alt="Logo" className="absolute left-[50%] top-[12px] -translate-x-[50%] h-8 w-8 object-contain opacity-10 pointer-events-none" />
        <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500" style={{ color: theme.muted }}><X className="h-4 w-4" strokeWidth={2} /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <aside className="w-full shrink-0 lg:w-[200px]">
              <div className="flex flex-col gap-3">
                <div className={`relative aspect-square overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.card }}>
                  {imageUrl && typeof imageUrl === 'string' ? (<img src={imageUrl} alt={`${employe.prenom} ${employe.nom}`} className="h-full w-full object-cover" loading="lazy" />) : (<div className="flex h-full w-full items-center justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">{initiales}</div></div>)}
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm" style={{ background: theme.card, borderColor: theme.border }}><span className="h-2 w-2 rounded-full" style={{ background: statusTheme.color }} /></div>
                </div>

                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.card }}>
                  <div className={`flex items-center gap-2 border-b px-3 py-2.5 ${borderClass}`}><Info className="h-3.5 w-3.5" style={{ color: theme.primary }} /><span className="text-[12px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Résumé</span></div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2"><span className="text-[12px] font-medium" style={{ color: theme.muted }}>Employé</span><span className="max-w-[100px] truncate text-right text-[13px] font-medium" style={{ color: theme.text }}>{employe.prenom} {employe.nom}</span></div>
                    <div className="flex items-start justify-between gap-2"><span className="text-[12px] font-medium" style={{ color: theme.muted }}>Poste</span><span className="max-w-[100px] truncate text-right text-[13px] font-semibold" style={{ color: theme.primary }}>{employe.poste || '—'}</span></div>
                    <div className="flex items-start justify-between gap-2"><span className="text-[12px] font-medium" style={{ color: theme.muted }}>Département</span><span className="max-w-[100px] truncate text-right text-[13px] font-medium" style={{ color: theme.text }}>{employe.departement || '—'}</span></div>
                    <div className="my-2 h-px" style={{ background: theme.border }} />
                    <div><div className="mb-0.5 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: theme.muted }}><DollarSign className="h-3 w-3" /> Salaire mensuel</div><div className="text-[15px] font-semibold tracking-tight" style={{ color: theme.primary }}>{formatMoney(Number(employe.salaire || 0))}</div></div>
                    <div className="mt-3 flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: statusTheme.background, border: `1px solid ${statusTheme.borderColor}` }}><span className="flex shrink-0" style={{ color: statusTheme.color }}>{getStatusIcon(employe.status)}</span><span className="text-[12px] font-semibold" style={{ color: statusTheme.color }}>{employe.status === 'actif' ? 'Actif' : employe.status === 'inactif' ? 'Inactif' : 'En congé'}</span></div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex-1 overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
              <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}><div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: theme.primarySoft, color: theme.primary }}><Info className="h-3.5 w-3.5" /></div><span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Informations générales</span></div>
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l ${borderClass}`}>
                <FormCell label="Prénom" icon={<User size={13} />} borderRight borderBottom><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{employe.prenom || '—'}</span></FormCell>
                <FormCell label="Nom" icon={<User size={13} />} borderRight borderBottom><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{employe.nom || '—'}</span></FormCell>
                <FormCell label="Poste" icon={<Briefcase size={13} />} borderRight={false} borderBottom><span className="block truncate text-[14px] font-semibold" style={{ color: theme.primary }}>{employe.poste || '—'}</span></FormCell>
                <FormCell label="Statut" icon={<CheckCircle2 size={13} />} borderRight borderBottom><span className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wide" style={{ background: statusTheme.background, borderColor: statusTheme.borderColor, color: statusTheme.color }}><span className="shrink-0">{getStatusIcon(employe.status)}</span><span className="truncate">{employe.status === 'actif' ? 'Actif' : employe.status === 'inactif' ? 'Inactif' : 'En congé'}</span></span></FormCell>
                <FormCell label="Département" icon={<Building2 size={13} />} borderRight borderBottom><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{employe.departement || '—'}</span></FormCell>
                <FormCell label="Téléphone" icon={<Phone size={13} />} borderRight={false} borderBottom><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{employe.telephone || '—'}</span></FormCell>
                <FormCell label="Email" icon={<Mail size={13} />} borderRight borderBottom><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }} title={employe.email || ''}>{employe.email || '—'}</span></FormCell>
                <FormCell label="Date d'embauche" icon={<Calendar size={13} />} borderRight borderBottom><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{formatDate(employe.date_embauche)}</span></FormCell>
                <FormCell label="Créé le" icon={<Calendar size={13} />} borderRight={false} borderBottom><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{formatDateTime(employe.created_at)}</span></FormCell>
                <FormCell label="Salaire mensuel" icon={<DollarSign size={13} />} borderRight={false} borderBottom={false} fullWidth><span className="block text-[15px] font-bold" style={{ color: theme.primary }}>{formatMoney(Number(employe.salaire || 0))}</span></FormCell>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5 sm:px-5 ${borderClass}`} style={{ background: theme.footer }}>
        <span className="hidden text-[11px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {onHistorique && (<button type="button" onClick={onHistorique} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: '#059669' }}><History className="h-3.5 w-3.5" strokeWidth={2} />Historique</button>)}
          <button type="button" onClick={onEdit} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }}><Edit className="h-3.5 w-3.5" strokeWidth={2} />Modifier</button>
          <button type="button" onClick={onClose} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors" style={{ color: theme.muted }} onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? '#1E293B' : '#F1F5F9'; e.currentTarget.style.color = theme.text; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}><X className="h-3.5 w-3.5" strokeWidth={2} />Fermer</button>
        </div>
      </div>
    </div>
  </div>);
};

export default EmployesViewModal;