// ============================================================
// src/components/entrees/EntreesViewModal.tsx
// ⭐ PREMIUM ENTREE VIEW MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY (identique aux tables)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useEffect, useState } from 'react';
import { X, ArrowDown, DollarSign, Building, Hash, Calendar, Package, FileText, Info, Edit, Receipt } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: { card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', surfaceMuted: '#F1F5F9', border: '#E2E8F0', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#4F46E5', primaryHover: '#4338CA', primaryBg: 'rgba(79,70,229,0.07)', primaryBorder: 'rgba(79,70,229,0.16)', success: '#059669', successBg: 'rgba(5,150,105,0.07)', successBorder: 'rgba(5,150,105,0.15)' },
  dark: { card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', surfaceMuted: '#162033', border: 'rgba(148,163,184,0.15)', text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primaryBg: 'rgba(129,140,248,0.10)', primaryBorder: 'rgba(129,140,248,0.20)', success: '#34D399', successBg: 'rgba(52,211,153,0.10)', successBorder: 'rgba(52,211,153,0.18)' },
};

interface Entree { id: number; produit_nom: string; produit_code: string; quantite: number; prix_unitaire: number; date_entree: string; fournisseur_nom: string; reference: string; observation: string; produit_id?: number; produit_image?: string; }
interface EntreesViewModalProps { entree: Entree; onClose: () => void; onEdit?: () => void; isDark: boolean; imageUrls?: Record<number, string | null>; loadImageForEntree?: (entree: Entree) => void; }

const FormCell: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; borderRight?: boolean; borderBottom?: boolean; }> = ({ label, children, icon, borderRight = true, borderBottom = true }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  return (
    <div className={`min-w-0 px-4 py-2.5 ${borderRight ? `border-r ${borderClass}` : ''} ${borderBottom ? `border-b ${borderClass}` : ''}`} style={{ background: theme.surface }}>
      <div className="mb-0.5 flex items-center gap-2">
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
    <div className={`flex items-center gap-2.5 border-b px-4 py-2.5 ${borderClass}`} style={{ background: theme.surface }}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: theme.primaryBg, color: theme.primary }}>{icon}</div>
      <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>{title}</span>
    </div>
  );
};

const EntreesViewModal: React.FC<EntreesViewModalProps> = ({ entree, onClose, onEdit, isDark: propIsDark, imageUrls = {} }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProductImage = async () => {
      if (imageUrls[entree.id]) { setLocalImageUrl(imageUrls[entree.id]); return; }
      if (!entree.produit_id) { setLocalImageUrl(null); return; }
      setLoadingImage(true);
      try {
        const productResult = await window.api.products.getById(entree.produit_id);
        if (!cancelled && productResult?.success && productResult.data?.image) {
          const urlResult = await window.api.images.getUrl(productResult.data.image);
          if (!cancelled && urlResult?.success && urlResult.data) {
            const url = urlResult.data.includes('?') ? urlResult.data : `${urlResult.data}?t=${Date.now()}`;
            setLocalImageUrl(url);
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Erreur chargement image produit:', error);
      } finally {
        if (!cancelled) setLoadingImage(false);
      }
    };
    fetchProductImage();
    return () => { cancelled = true; };
  }, [entree.id, entree.produit_id, imageUrls]);

  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [onClose]);

  const montantTotal = (entree.quantite || 0) * (entree.prix_unitaire || 0);
  const initiales = entree.produit_nom?.trim()?.charAt(0)?.toUpperCase() || '?';
  const formattedDate = entree.date_entree ? new Date(entree.date_entree).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date inconnue';

  return (
    <div className={`fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: isDark ? 'rgba(9, 9, 9, 0.78)' : 'rgba(15,23,42,0.48)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true" aria-labelledby="entree-view-title" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-4xl max-h-[80vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.20)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.98]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={e => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-20 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between border-b px-5 py-3.5 sm:px-6 ${borderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
              {/* ⭐ FIX: Logo path ovaina ho './images/logo.png' */}
              <img src="./images/logo.png" alt="Logo" className="max-h-[22px] max-w-[22px] object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="entree-view-title" className="truncate text-[15px] font-semibold tracking-tight sm:text-[16px]" style={{ color: theme.text }}>Détails de l'entrée</h2>
                <span className="hidden rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primaryBg, borderColor: theme.primaryBorder }}>{entree.reference || `ENT-${entree.id}`}</span>
              </div>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Enregistrement d'entrée en stock</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 active:scale-95 dark:hover:bg-white/[0.06]" style={{ color: theme.muted }} aria-label="Fermer">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[225px_minmax(0,1fr)]">
            {/* SIDEBAR */}
            <aside className="flex flex-col gap-3">
              <div className={`relative aspect-square max-h-[225px] w-full overflow-hidden rounded-xl border ${borderClass}`} style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold" style={{ color: theme.success, background: isDark ? 'rgba(5,150,105,0.12)' : '#ECFDF5', borderColor: theme.successBorder }}>
                  <ArrowDown size={11} />Entrée stock
                </div>
                {loadingImage ? (
                  <div className="flex h-full w-full items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" /></div>
                ) : localImageUrl ? (
                  <img src={localImageUrl} alt={entree.produit_nom} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-semibold text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#818CF8,#4F46E5)' }}>{initiales}</div>
                  </div>
                )}
              </div>

              <div className={`rounded-xl border px-3 py-2.5 ${borderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.subtle }}>Produit</p>
                <p className="text-[13px] font-semibold leading-4" style={{ color: theme.text }}>{entree.produit_nom}</p>
                {entree.produit_code && <p className="mt-0.5 font-mono text-[12px]" style={{ color: theme.muted }}>{entree.produit_code}</p>}
              </div>

              <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ borderColor: theme.border, background: theme.surface }}>
                <SectionTitle icon={<Info className="h-3.5 w-3.5" />} title="Résumé" theme={theme} />
                <div className="space-y-2.5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Référence</span>
                    <span className="max-w-[120px] truncate text-[13px] font-medium" style={{ color: theme.text }}>{entree.reference || 'N/A'}</span>
                  </div>
                  <div className="h-px" style={{ background: theme.border }} />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium" style={{ color: theme.text }}>Quantité</span>
                    <span className="rounded-md px-2 py-1 text-[13px] font-semibold" style={{ color: theme.success, background: theme.successBg }}>+{entree.quantite}</span>
                  </div>
                  <div className="h-px" style={{ background: theme.border }} />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Total</span>
                    <span className="text-[15px] font-bold" style={{ color: theme.primary }}>{formatMoney(montantTotal)}</span>
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
                    <div><span>{entree.produit_nom}</span>{entree.produit_code && <span className="mt-0.5 block font-mono text-[12px]" style={{ color: theme.muted }}>{entree.produit_code}</span>}</div>
                  </FormCell>
                  <FormCell label="Quantité" icon={<ArrowDown className="h-3.5 w-3.5" />}>
                    <span className="font-bold" style={{ color: theme.success }}>+{entree.quantite} unités</span>
                  </FormCell>
                  <FormCell label="Fournisseur" icon={<Building className="h-3.5 w-3.5" />} borderRight={false}>
                    {entree.fournisseur_nom ? <span>{entree.fournisseur_nom}</span> : <span style={{ color: theme.muted }}>Non spécifié</span>}
                  </FormCell>
                  <FormCell label="Prix unitaire" icon={<DollarSign className="h-3.5 w-3.5" />}>{formatMoney(entree.prix_unitaire || 0)}</FormCell>
                  <FormCell label="Référence" icon={<Hash className="h-3.5 w-3.5" />}>{entree.reference || '-'}</FormCell>
                  <FormCell label="Date d'entrée" icon={<Calendar className="h-3.5 w-3.5" />} borderRight={false}>
                    <span style={{ color: theme.muted }}>{formattedDate}</span>
                  </FormCell>
                  <FormCell label="Valeur totale" icon={<Receipt className="h-3.5 w-3.5" />}>
                    <span className="text-[15px] font-bold" style={{ color: theme.primary }}>{formatMoney(montantTotal)}</span>
                  </FormCell>
                  <FormCell label="Observation" icon={<FileText className="h-3.5 w-3.5" />} borderRight={true}>
                    {entree.observation ? <span>{entree.observation}</span> : <span style={{ color: theme.muted }}>Aucune observation</span>}
                  </FormCell>
                  <FormCell label="" borderRight={false} borderBottom={false}><div className="invisible">—</div></FormCell>
                </div>
              </div>

              <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ borderColor: theme.primaryBorder, background: theme.primaryBg }}>
                <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(79,70,229,0.10)', color: theme.primary }}>
                      <DollarSign size={15} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium" style={{ color: theme.muted }}>Valeur totale de l'entrée</p>
                      <p className="mt-0.5 truncate text-[18px] font-bold tracking-tight" style={{ color: theme.text }}>{formatMoney(montantTotal)}</p>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-[12px]" style={{ color: theme.muted }}>{entree.quantite} unités</p>
                    <p className="mt-0.5 text-[12px] font-medium" style={{ color: theme.primary }}>{formatMoney(entree.prix_unitaire || 0)} / unité</p>
                  </div>
                </div>
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

export default EntreesViewModal;