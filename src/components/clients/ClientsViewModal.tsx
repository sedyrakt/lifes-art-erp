import React, { useEffect, useState } from 'react';
import { Info, X, Mail, Phone, MapPin, Calendar, Edit, User, Building, ShoppingCart, Hash } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  light: {
    card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0',
    text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#4F46E5',
    primaryHover: '#4338CA', primaryBg: 'rgba(99,102,241,0.08)', primaryBorder: 'rgba(99,102,241,0.16)',
    green: '#10B981', greenBg: 'rgba(16,185,129,0.08)', greenBorder: 'rgba(16,185,129,0.18)',
    red: '#EF4444', redBg: 'rgba(239,68,68,0.08)', redBorder: 'rgba(239,68,68,0.18)',
  },
  dark: {
    card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', border: 'rgba(148,163,184,0.16)',
    text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#4F46E5',
    primaryHover: '#4338CA', primaryBg: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(129,140,248,0.20)',
    green: '#34D399', greenBg: 'rgba(16,185,129,0.12)', greenBorder: 'rgba(52,211,153,0.20)',
    red: '#F87171', redBg: 'rgba(239,68,68,0.12)', redBorder: 'rgba(248,113,113,0.20)',
  },
};

interface Client { id: number; nom: string; email: string; telephone: string; adresse: string; ville: string; code_postal: string; pays: string; image: string; type: 'Particulier' | 'Entreprise'; created_at: string; nb_commandes?: number; total_achats?: number; }
interface ClientsViewModalProps { client: Client; imageUrl: string | null; onClose: () => void; onEdit: () => void; getTypeColor: (type: string) => string; getTypeIcon: (type: string) => React.ReactNode; handleImageError: (id: number) => void; isDark?: boolean; }

const FormCell: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; borderRight?: boolean; borderBottom?: boolean; isDark?: boolean; }> = ({ label, children, icon, borderRight = true, borderBottom = true, isDark = false }) => {
  const { isDark: contextIsDark } = useTheme();
  const darkMode = isDark !== undefined ? isDark : contextIsDark;
  const theme = darkMode ? COLORS.dark : COLORS.light;
  const gridBorderClass = darkMode ? 'border-white/[0.10]' : 'border-slate-200';
  return (<div className={['min-w-0 px-4 py-3.5', borderRight ? `border-r ${gridBorderClass}` : '', borderBottom ? `border-b ${gridBorderClass}` : ''].join(' ')} style={{ background: theme.surface }}><div className="mb-1.5 flex items-center gap-2">{icon && <span className="flex-shrink-0" style={{ color: theme.subtle }}>{icon}</span>}<span className="text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: theme.subtle }}>{label}</span></div><div className="min-w-0 break-words text-[14px] font-medium leading-5" style={{ color: theme.text }}>{children}</div></div>);
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; theme: typeof COLORS.light; cardBorderClass: string; }> = ({ icon, title, theme, cardBorderClass }) => (<div className={`flex items-center gap-2 border-b px-4 py-3 ${cardBorderClass}`} style={{ borderColor: theme.border, background: theme.surface }}><span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: theme.primaryBg, color: theme.primary }}>{icon}</span><span className="text-[13px] font-semibold" style={{ color: theme.text }}>{title}</span></div>);

const EmptyValue: React.FC<{ theme: typeof COLORS.light }> = ({ theme }) => (<span style={{ color: theme.muted }}>Non spécifié</span>);

const ClientsViewModal: React.FC<ClientsViewModalProps> = ({ client, imageUrl, onClose, onEdit, getTypeColor, getTypeIcon, handleImageError, isDark: isDarkProp }) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : contextIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);
  const cardBorderClass = isDark ? 'border-white/[0.14]' : 'border-slate-300';
  const gridBorderClass = isDark ? 'border-white/[0.10]' : 'border-slate-200';

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { if (event.key !== 'Escape') return; event.preventDefault(); onClose(); }; window.addEventListener('keydown', handleKeyDown); return () => { window.removeEventListener('keydown', handleKeyDown); }; }, [onClose]);

  const getInitiales = (nom: string) => { if (!nom?.trim()) return '?'; const words = nom.trim().split(/\s+/).filter(Boolean); if (words.length === 1) return words[0].charAt(0).toUpperCase(); return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join(''); };
  const formatDate = (date: string) => { if (!date) return null; const parsed = new Date(date); if (Number.isNaN(parsed.getTime())) return null; return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  const formattedCreatedAt = formatDate(client.created_at);
  const nbCommandes = typeof client.nb_commandes === 'number' ? client.nb_commandes : null;
  const totalAchats = typeof client.total_achats === 'number' ? client.total_achats : 0;
  const typeColorClass = getTypeColor(client.type);

  return (<div className={`fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="client-view-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-2xl border ${cardBorderClass} shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.98]'}`} style={{ background: theme.card }} onMouseDown={(event) => event.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-20 h-[3px]" style={{ background: theme.primary }} />
        <header className={`flex flex-shrink-0 items-center justify-between border-b px-5 py-4 sm:px-6 ${cardBorderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border ${cardBorderClass}`} style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
              {/* ⭐ FIX: Logo path ho './images/logo.png' */}
              <img src="./images/logo.png" alt="Logo" className="max-h-[26px] max-w-[26px] object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2"><h2 id="client-view-title" className="truncate text-[16px] font-semibold tracking-tight sm:text-[17px]" style={{ color: theme.text }}>Détails du client</h2><span className={`hidden items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium sm:inline-flex ${cardBorderClass}`} style={{ color: theme.primary, background: theme.primaryBg, borderColor: theme.primaryBorder }}>CLI-{String(client.id).padStart(6, '0')}</span></div>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Informations détaillées du client</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:bg-slate-100 active:scale-95 dark:hover:bg-white/[0.06]" style={{ color: theme.muted }} aria-label="Fermer"><X className="h-[18px] w-[18px]" strokeWidth={2} /></button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
            <aside className="flex flex-col gap-3">
              <div className={`relative aspect-square max-h-[230px] w-full overflow-hidden rounded-xl border ${cardBorderClass}`} style={{ background: theme.surfaceSoft }}>
                {imageUrl && typeof imageUrl === 'string' ? (<img src={imageUrl} alt={client.nom} className="h-full w-full object-cover" loading="lazy" onError={() => handleImageError(client.id)} />) : (<div className="flex h-full w-full items-center justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-semibold text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#818CF8,#4F46E5)' }}>{getInitiales(client.nom)}</div></div>)}
              </div>
              <div className={`rounded-xl border px-4 py-3 ${cardBorderClass}`} style={{ borderColor: theme.border, background: theme.surface }}><p className="mb-1 text-[12px] font-medium uppercase tracking-wide" style={{ color: theme.subtle }}>Client</p><p className="text-[14px] font-semibold leading-5" style={{ color: theme.text }}>{client.nom || 'Client sans nom'}</p></div>
              <div className={`overflow-hidden rounded-xl border ${cardBorderClass}`} style={{ borderColor: theme.border, background: theme.surface }}><SectionTitle icon={<Info className="h-3.5 w-3.5" />} title="Résumé" theme={theme} cardBorderClass={cardBorderClass} /><div className="space-y-3 p-4"><div className="flex items-center justify-between gap-3"><span className="text-[12px]" style={{ color: theme.muted }}>Type</span><span className="text-[12px] font-medium" style={{ color: theme.text }}>{client.type}</span></div><div className="h-px" style={{ background: theme.border }} /><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: theme.text }}><span className="h-3.5 w-3.5 flex items-center justify-center" style={{ color: theme.subtle }}>Ar</span>Total Achats</span><span className="text-[13px] font-semibold" style={{ color: theme.green }}>{totalAchats.toLocaleString('fr-FR')} Ar</span></div><div className="h-px" style={{ background: theme.border }} /><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: theme.text }}><ShoppingCart className="h-3.5 w-3.5" style={{ color: theme.subtle }} />Commandes</span><span className="text-[13px] font-semibold" style={{ color: theme.primary }}>{nbCommandes ?? '—'}</span></div><div className="h-px" style={{ background: theme.border }} /><div className="flex items-center justify-between gap-3"><span className="text-[12px]" style={{ color: theme.muted }}>Identifiant</span><span className="flex items-center gap-1 font-mono text-[11px] font-medium" style={{ color: theme.text }}><Hash className="h-3 w-3" />{client.id}</span></div></div></div>
            </aside>
            <section className="min-w-0 space-y-3">
              <div className={`overflow-hidden rounded-xl border ${cardBorderClass}`} style={{ borderColor: theme.border, background: theme.surface }}><SectionTitle icon={<User className="h-3.5 w-3.5" />} title="Informations générales" theme={theme} cardBorderClass={cardBorderClass} /><div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l ${gridBorderClass}`}><FormCell label="Nom" icon={<User className="h-3.5 w-3.5" />} isDark={isDark}>{client.nom || <EmptyValue theme={theme} />}</FormCell><FormCell label="Email" icon={<Mail className="h-3.5 w-3.5" />} isDark={isDark}>{client.email || <EmptyValue theme={theme} />}</FormCell><FormCell label="Téléphone" icon={<Phone className="h-3.5 w-3.5" />} borderRight={false} isDark={isDark}>{client.telephone || <EmptyValue theme={theme} />}</FormCell><FormCell label="Type" icon={<Building className="h-3.5 w-3.5" />} isDark={isDark}><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${typeColorClass}`}>{getTypeIcon(client.type)}{client.type}</span></FormCell><FormCell label="Adresse" icon={<MapPin className="h-3.5 w-3.5" />} isDark={isDark}>{client.adresse || <EmptyValue theme={theme} />}</FormCell><FormCell label="Ville / CP" icon={<MapPin className="h-3.5 w-3.5" />} borderRight={false} isDark={isDark}>{[client.ville, client.code_postal].filter(Boolean).join(', ') || (<EmptyValue theme={theme} />)}</FormCell><FormCell label="Pays" icon={<MapPin className="h-3.5 w-3.5" />} isDark={isDark}>{client.pays || <EmptyValue theme={theme} />}</FormCell><FormCell label="Client depuis" icon={<Calendar className="h-3.5 w-3.5" />} isDark={isDark}>{formattedCreatedAt || <EmptyValue theme={theme} />}</FormCell><FormCell label="" borderRight={false} isDark={isDark}><span className="invisible">.</span></FormCell></div></div>
              <div className={`overflow-hidden rounded-xl border ${cardBorderClass}`} style={{ borderColor: theme.border, background: theme.surface }}><SectionTitle icon={<Mail className="h-3.5 w-3.5" />} title="Coordonnées" theme={theme} cardBorderClass={cardBorderClass} /><div className={`grid grid-cols-1 sm:grid-cols-2 border-t border-l ${gridBorderClass}`}><FormCell label="Adresse email" icon={<Mail className="h-3.5 w-3.5" />} borderBottom={false} isDark={isDark}>{client.email ? (<a href={`mailto:${client.email}`} onClick={(event) => event.stopPropagation()} className="break-all transition-colors hover:text-indigo-500" style={{ color: theme.text }}>{client.email}</a>) : (<EmptyValue theme={theme} />)}</FormCell><FormCell label="Téléphone" icon={<Phone className="h-3.5 w-3.5" />} borderRight={false} borderBottom={false} isDark={isDark}>{client.telephone ? (<a href={`tel:${client.telephone}`} onClick={(event) => event.stopPropagation()} className="transition-colors hover:text-indigo-500" style={{ color: theme.text }}>{client.telephone}</a>) : (<EmptyValue theme={theme} />)}</FormCell></div></div>
            </section>
          </div>
        </main>
        <footer className={`flex flex-shrink-0 items-center justify-end gap-2 border-t px-5 py-3.5 sm:px-6 ${cardBorderClass}`} style={{ borderColor: theme.border, background: theme.surfaceSoft }}><button type="button" onClick={onClose} className={`h-9 rounded-lg border px-4 text-[14px] font-medium transition-all duration-150 hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05] ${cardBorderClass}`} style={{ background: 'transparent', color: theme.text }}>Fermer</button><button type="button" onClick={onEdit} className="flex h-9 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={(event) => (event.currentTarget.style.background = theme.primaryHover)} onMouseLeave={(event) => (event.currentTarget.style.background = theme.primary)}><Edit className="h-3.5 w-3.5" strokeWidth={2} />Modifier</button></footer>
      </div>
    </div>
  );
};

export default ClientsViewModal;