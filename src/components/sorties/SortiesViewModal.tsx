// ============================================================
// src/components/sorties/SortiesViewModal.tsx
// ⭐ PREMIUM SORTIE VIEW MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY (identique aux tables)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useEffect, useState } from 'react';
import { X, Package, ArrowUp, Calendar, MapPin, Hash, DollarSign, FileText, Info, Edit, Boxes, ArrowDownRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: { card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#4F46E5', primaryHover: '#4338CA', primaryBg: 'rgba(79,70,229,0.07)', primaryBorder: 'rgba(79,70,229,0.14)', danger: '#DC2626', dangerBg: 'rgba(220,38,38,0.07)', dangerBorder: 'rgba(220,38,38,0.14)', success: '#059669', successBg: 'rgba(5,150,105,0.07)', successBorder: 'rgba(5,150,105,0.14)' },
  dark: { card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', border: 'rgba(148,163,184,0.16)', text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primaryBg: 'rgba(129,140,248,0.10)', primaryBorder: 'rgba(129,140,248,0.20)', danger: '#F87171', dangerBg: 'rgba(248,113,113,0.10)', dangerBorder: 'rgba(248,113,113,0.20)', success: '#34D399', successBg: 'rgba(52,211,153,0.10)', successBorder: 'rgba(52,211,153,0.20)' },
};

interface Sortie { id: number; produit_nom: string; produit_code: string; quantite: number; prix_unitaire: number; date_sortie: string; destination: string; reference: string; observation: string; produit_id?: number; produit_image?: string; }
interface SortiesViewModalProps { sortie: Sortie; onClose: () => void; onEdit?: () => void; isDark?: boolean; imageUrls?: Record<number, string | null>; loadImageForSortie?: (sortie: Sortie) => void; }

const FormCell: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; borderRight?: boolean; borderBottom?: boolean; }> = ({ label, children, icon, borderRight = true, borderBottom = true }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  return (
    <div className={`min-w-0 px-4 py-2.5 ${borderRight ? `border-r ${borderClass}` : ''} ${borderBottom ? `border-b ${borderClass}` : ''}`} style={{ background: theme.surface }}>
      <div className="mb-0.5 flex items-center gap-1.5">
        {icon && <span className="flex shrink-0" style={{ color: theme.subtle }}>{icon}</span>}
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.subtle }}>{label}</span>
      </div>
      <div className="min-w-0 break-words text-[13px] font-medium leading-4" style={{ color: theme.text }}>{children}</div>
    </div>
  );
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; theme: typeof COLORS.light; }> = ({ icon, title, theme }) => {
  const { isDark } = useTheme();
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 border-b ${borderClass}`} style={{ background: theme.surface }}>
      <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: theme.primaryBg, color: theme.primary }}>{icon}</div>
      <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>{title}</span>
    </div>
  );
};

const SortiesViewModal: React.FC<SortiesViewModalProps> = ({ sortie, onClose, onEdit, isDark: isDarkProp, imageUrls = {} }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProductImage = async () => {
      if (!sortie) return;
      const cachedImage = imageUrls[sortie.id];
      if (cachedImage) { setLocalImageUrl(cachedImage); return; }
      if (!sortie.produit_id) return;
      setLoadingImage(true);
      try {
        const productResult = await window.api.products.getById(sortie.produit_id);
        if (!cancelled && productResult?.success && productResult.data?.image) {
          const urlResult = await window.api.images.getUrl(productResult.data.image);
          if (!cancelled && urlResult?.success && urlResult.data) {
            const url = urlResult.data.includes('?') ? urlResult.data : `${urlResult.data}?t=${Date.now()}`;
            setLocalImageUrl(url);
          }
        }
      } catch (error) {
        console.error('Erreur chargement image produit:', error);
      } finally {
        if (!cancelled) setLoadingImage(false);
      }
    };
    fetchProductImage();
    return () => { cancelled = true; };
  }, [sortie?.id, sortie?.produit_id, imageUrls]);

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [onClose]);

  if (!sortie) return null;

  const montantTotal = (sortie.quantite || 0) * (sortie.prix_unitaire || 0);
  const initiales = sortie.produit_nom?.trim()?.charAt(0)?.toUpperCase() || '?';
  const formattedDate = sortie.date_sortie ? new Date(sortie.date_sortie).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date inconnue';

  return (
    <div className={`fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: isDark ? 'rgba(14, 14, 14, 0.8)' : 'rgba(15,23,42,0.50)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true" aria-labelledby="sortie-view-title" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-4xl max-h-[80vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.20)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={e => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-20 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3.5 sm:px-6 ${borderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
              {/* ⭐ FIX: Logo path ovaina ho './images/logo.png' */}
              <img src="./images/logo.png" alt="Logo" className="max-h-[22px] max-w-[22px] object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="sortie-view-title" className="truncate text-[15px] font-semibold tracking-tight sm:text-[16px]" style={{ color: theme.text }}>Détails de la sortie</h2>
                <span className="hidden rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primaryBg, borderColor: theme.primaryBorder }}>{sortie.reference || `SOR-${sortie.id}`}</span>
              </div>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Informations détaillées de la sortie de stock</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 active:scale-95 dark:hover:bg-white/[0.06]" style={{ color: theme.muted }}>
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* SIDEBAR */}
            <aside className="flex flex-col gap-3">
              <div className={`relative aspect-square max-h-[220px] w-full overflow-hidden rounded-xl border ${borderClass}`} style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold" style={{ color: theme.danger, background: isDark ? 'rgba(15,23,42,0.88)' : 'rgba(255,255,255,0.92)', borderColor: theme.dangerBorder }}>
                  <ArrowUp size={11} strokeWidth={2.5} />SORTIE
                </div>
                {loadingImage ? (
                  <div className="flex h-full w-full items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" /></div>
                ) : localImageUrl ? (
                  <img src={localImageUrl} alt={sortie.produit_nom} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-semibold" style={{ color: theme.primary, background: theme.primaryBg, border: `1px solid ${theme.primaryBorder}` }}>{initiales}</div>
                  </div>
                )}
              </div>

              <div className={`rounded-xl border px-3 py-2.5 ${borderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.subtle }}>Produit</p>
                <p className="line-clamp-2 text-[13px] font-semibold leading-4" style={{ color: theme.text }}>{sortie.produit_nom}</p>
                <p className="mt-0.5 font-mono text-[12px]" style={{ color: theme.muted }}>{sortie.produit_code || 'Code non défini'}</p>
              </div>

              <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
                <SectionTitle icon={<Info className="h-3.5 w-3.5" />} title="Résumé" theme={theme} />
                <div className="space-y-2.5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Référence</span>
                    <span className="max-w-[120px] truncate font-mono text-[13px] font-medium" style={{ color: theme.text }}>{sortie.reference || `SOR-${sortie.id}`}</span>
                  </div>
                  <div className="h-px" style={{ background: theme.border }} />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Quantité sortie</span>
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-bold" style={{ color: theme.danger, background: theme.dangerBg }}>
                      <ArrowDownRight size={12} />{sortie.quantite}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <section className="min-w-0 space-y-3">
              <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
                <SectionTitle icon={<Package className="h-3.5 w-3.5" />} title="Informations générales" theme={theme} />
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l ${borderClass}`}>
                  <FormCell label="Produit" icon={<Package className="h-3.5 w-3.5" />}>
                    <div className="min-w-0">
                      <span className="block truncate">{sortie.produit_nom}</span>
                      <span className="mt-0.5 block font-mono text-[12px]" style={{ color: theme.muted }}>{sortie.produit_code || 'N/A'}</span>
                    </div>
                  </FormCell>
                  <FormCell label="Quantité sortie" icon={<ArrowUp className="h-3.5 w-3.5" />}>
                    <span className="font-bold" style={{ color: theme.danger }}>
                      −{sortie.quantite}<span className="ml-1 text-[12px] font-medium" style={{ color: theme.muted }}>unités</span>
                    </span>
                  </FormCell>
                  <FormCell label="Prix unitaire" icon={<DollarSign className="h-3.5 w-3.5" />} borderRight={false}>
                    {formatMoney(sortie.prix_unitaire || 0)}
                  </FormCell>
                  <FormCell label="Destination" icon={<MapPin className="h-3.5 w-3.5" />}>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: theme.primary }} />
                      <span className="truncate">{sortie.destination || <span style={{ color: theme.muted }}>Non spécifiée</span>}</span>
                    </div>
                  </FormCell>
                  <FormCell label="Référence" icon={<Hash className="h-3.5 w-3.5" />}>
                    <span className="block truncate font-mono text-[13px]">{sortie.reference || '-'}</span>
                  </FormCell>
                  <FormCell label="Date de sortie" icon={<Calendar className="h-3.5 w-3.5" />} borderRight={false}>
                    <span style={{ color: theme.muted }}>{formattedDate}</span>
                  </FormCell>
                  <FormCell label="Valeur totale" icon={<DollarSign className="h-3.5 w-3.5" />}>
                    <span className="text-[15px] font-bold" style={{ color: theme.success }}>{formatMoney(montantTotal)}</span>
                  </FormCell>
                  <FormCell label="Observation" icon={<FileText className="h-3.5 w-3.5" />} borderRight={false}>
                    {sortie.observation || <span style={{ color: theme.muted }}>Aucune observation</span>}
                  </FormCell>
                  <FormCell label="" borderRight={false} borderBottom={false}><div className="invisible">.</div></FormCell>
                </div>
              </div>

              <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-2.5 ${borderClass}`} style={{ borderColor: theme.primaryBorder, background: theme.primaryBg }}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: isDark ? 'rgba(129,140,248,0.12)' : 'rgba(79,70,229,0.08)', color: theme.primary }}>
                    <Boxes size={16} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>Valeur de la sortie</p>
                    <p className="mt-0.5 text-[13px] font-medium" style={{ color: theme.text }}>{sortie.quantite} unité{sortie.quantite > 1 ? 's' : ''} × {formatMoney(sortie.prix_unitaire || 0)}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right text-[18px] font-bold tracking-tight" style={{ color: theme.text }}>{formatMoney(montantTotal)}</div>
              </div>
            </section>
          </div>
        </main>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-5 py-2.5 sm:px-6 ${borderClass}`} style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
          <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[13px] font-medium transition-all duration-150 hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05]" style={{ background: 'transparent', borderColor: theme.border, color: theme.text }}>
            Fermer
          </button>
          {onEdit && (
            <button type="button" onClick={onEdit} className="flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }} onMouseEnter={e => { e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={e => { e.currentTarget.style.background = theme.primary; }}>
              <Edit className="h-3.5 w-3.5" strokeWidth={2} />Modifier
            </button>
          )}
        </footer>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.24); border-radius: 999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.40); }
        `}</style>
      </div>
    </div>
  );
};

export default SortiesViewModal;