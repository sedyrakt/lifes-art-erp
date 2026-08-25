// src/components/produits/ProduitsViewModal.tsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit, ShoppingBag, Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: {
    card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', borderSoft: '#EEF2F7',
    text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5',
    primarySoft: 'rgba(99,102,241,.07)', primaryBorder: 'rgba(99,102,241,.18)', green: '#059669',
    greenBg: 'rgba(16,185,129,.08)', greenBorder: 'rgba(16,185,129,.20)', amber: '#D97706',
    amberBg: 'rgba(245,158,11,.08)', amberBorder: 'rgba(245,158,11,.20)', red: '#DC2626',
    redBg: 'rgba(239,68,68,.07)', redBorder: 'rgba(239,68,68,.18)'
  },
  dark: {
    card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111827', border: 'rgba(148,163,184,.14)',
    borderSoft: 'rgba(148,163,184,.08)', text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B',
    primary: '#818CF8', primaryHover: '#6366F1', primarySoft: 'rgba(99,102,241,.11)',
    primaryBorder: 'rgba(129,140,248,.23)', green: '#34D399', greenBg: 'rgba(16,185,129,.11)',
    greenBorder: 'rgba(52,211,153,.22)', amber: '#FBBF24', amberBg: 'rgba(245,158,11,.11)',
    amberBorder: 'rgba(251,191,36,.22)', red: '#F87171', redBg: 'rgba(239,68,68,.10)',
    redBorder: 'rgba(248,113,113,.20)'
  }
};

interface Produit {
  id: number; code: string; nom: string; description?: string; categorie_nom?: string;
  fournisseur_id?: number; fournisseur_nom?: string; prix_achat: number; prix_vente: number;
  quantite_stock: number; quantite_minimale: number; unite: string; image?: string;
  status: string; nb_commandes?: number;
}

interface ProduitsViewModalProps {
  produit: Produit; imageUrl: string | null; onClose: () => void; onEdit: () => void;
  onNewCommande: () => void; getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode; isDark?: boolean;
}

interface FieldProps { label: string; children: React.ReactNode; last?: boolean; }

const Field: React.FC<FieldProps> = ({ label, children, last = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className={`min-w-0 px-3 py-2.5 ${!last ? 'border-r' : ''}`} style={{ borderColor: theme.borderSoft }}>
      <div className="mb-0.5 truncate text-[11px] font-semibold uppercase tracking-[.055em]" style={{ color: theme.subMuted }}>{label}</div>
      <div className="min-w-0 truncate text-[13.5px] font-medium leading-5">{children}</div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; right?: React.ReactNode; }> = ({ title, right }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className="flex h-[40px] items-center justify-between border-b px-3" style={{ background: theme.surface, borderColor: theme.borderSoft }}>
      <span className="text-[12px] font-semibold uppercase tracking-[.055em]" style={{ color: theme.muted }}>{title}</span>
      {right}
    </div>
  );
};

const StatusBadge: React.FC<{ active: boolean; theme: typeof COLORS.light; }> = ({ active, theme }) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold"
    style={{ color: active ? theme.green : theme.red, background: active ? theme.greenBg : theme.redBg, borderColor: active ? theme.greenBorder : theme.redBorder }}>
    {active ? <CheckCircle2 size={12} strokeWidth={2} /> : <XCircle size={12} strokeWidth={2} />}
    {active ? 'Actif' : 'Inactif'}
  </span>
);

const ProduitsViewModal: React.FC<ProduitsViewModalProps> = ({ produit, imageUrl, onClose, onEdit, onNewCommande, isDark: isDarkProp }) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : contextIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 10);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const stock = Number(produit.quantite_stock || 0);
  const stockMin = Number(produit.quantite_minimale || 0);
  const commandes = Number(produit.nb_commandes || 0);
  const isRupture = stock <= 0;
  const isAlert = !isRupture && stock <= stockMin;
  const isActive = produit.status === 'actif';
  const initial = produit.nom?.charAt(0)?.toUpperCase() || '?';
  const hasImage = typeof imageUrl === 'string' && imageUrl.trim() !== '';

  const stockColor = isRupture ? theme.red : isAlert ? theme.amber : theme.green;
  const stockBg = isRupture ? theme.redBg : isAlert ? theme.amberBg : theme.greenBg;
  const stockBorder = isRupture ? theme.redBorder : isAlert ? theme.amberBorder : theme.greenBorder;
  const stockLabel = isRupture ? 'Rupture de stock' : isAlert ? 'Stock faible' : 'Stock suffisant';
  const stockPercent = stockMin > 0 ? Math.min(100, Math.max(0, (stock / stockMin) * 100)) : stock > 0 ? 100 : 0;

  return createPortal(
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: isDark ? 'rgba(2,6,23,.76)' : 'rgba(15,23,42,.52)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Produit ${produit.nom}`}
        className={`relative flex w-full max-w-[900px] max-h-[82vh] flex-col overflow-hidden rounded-xl border shadow-[0_20px_60px_rgba(0,0,0,.24)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[.985]'}`}
        style={{ background: theme.surfaceSoft, borderColor: theme.border }}
        onClick={(event) => event.stopPropagation()}>
        
        {/* TOP ACCENT */}
        <div className="absolute left-0 right-0 top-0 z-20 h-[2px]" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.primaryHover}, transparent)` }} />

        {/* HEADER */}
        <header className="flex h-[56px] shrink-0 items-center justify-between border-b px-3.5 sm:px-4" style={{ background: theme.card, borderColor: theme.border }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary }}>
              <Package size={17} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>{produit.nom}</h2>
                <span className="hidden shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primarySoft, borderColor: theme.primaryBorder }}>
                  {produit.code || '—'}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px]" style={{ color: theme.subMuted }}>Informations détaillées du produit</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-rose-500/10 hover:text-rose-500" style={{ color: theme.muted }}>
            <X size={16} strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-3.5">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* SIDEBAR */}
            <aside className="w-full shrink-0 lg:w-[175px]">
              <div className="space-y-3">
                {/* IMAGE */}
                <div className="relative aspect-square overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  {hasImage ? (
                    <img src={imageUrl!} alt={produit.nom} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center" style={{ background: isDark ? 'linear-gradient(135deg,#1E1B4B,#312E81)' : 'linear-gradient(135deg,#EEF2FF,#E0E7FF)' }}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold" style={{ background: isDark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.75)', color: theme.primary }}>{initial}</div>
                      <span className="mt-2 text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,.55)' : theme.muted }}>Aucune image</span>
                    </div>
                  )}
                </div>
                {/* SUMMARY */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <SectionHeader title="Résumé" />
                  <div className="space-y-2.5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: theme.muted }}>Stock</span>
                      <span className="text-[13px] font-bold" style={{ color: stockColor }}>{stock} {produit.unite || 'p.'}</span>
                    </div>
                    <div className="h-px" style={{ background: theme.borderSoft }} />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: theme.muted }}>Statut</span>
                      <StatusBadge active={isActive} theme={theme} />
                    </div>
                    <div className="h-px" style={{ background: theme.borderSoft }} />
                    <div>
                      <div className="text-[11px]" style={{ color: theme.muted }}>Prix de vente</div>
                      <div className="mt-0.5 text-[16px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatMoney(produit.prix_vente)}</div>
                    </div>
                    <div className="flex items-center justify-center rounded-md border px-2 py-1.5" style={{ background: stockBg, borderColor: stockBorder }}>
                      {isRupture ? <XCircle size={13} className="mr-1" style={{ color: stockColor }} /> : isAlert ? <AlertTriangle size={13} className="mr-1" style={{ color: stockColor }} /> : <CheckCircle2 size={13} className="mr-1" style={{ color: stockColor }} />}
                      <span className="text-[11px] font-semibold" style={{ color: stockColor }}>{stockLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN */}
            <div className="min-w-0 flex-1 space-y-3">
              {/* INFORMATIONS */}
              <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                <SectionHeader title="Informations générales" right={<span className="font-mono text-[10px]" style={{ color: theme.subMuted }}>ID #{produit.id}</span>} />
                <div className="grid grid-cols-1 border-l sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: theme.borderSoft }}>
                  <Field label="Code"><span className="font-mono font-semibold" style={{ color: theme.primary }}>{produit.code || '—'}</span></Field>
                  <Field label="Nom"><span style={{ color: theme.text }}>{produit.nom || '—'}</span></Field>
                  <Field label="Catégorie" last><span style={{ color: theme.text }}>{produit.categorie_nom || '—'}</span></Field>
                  <Field label="Fournisseur"><span style={{ color: theme.text }}>{produit.fournisseur_nom || '—'}</span></Field>
                  <Field label="Prix d'achat"><span style={{ color: theme.muted }}>{formatMoney(produit.prix_achat)}</span></Field>
                  <Field label="Prix de vente" last><span className="font-bold" style={{ color: theme.primary }}>{formatMoney(produit.prix_vente)}</span></Field>
                  <Field label="Stock"><span style={{ color: theme.text }}>{stock} {produit.unite || 'p.'}</span></Field>
                  <Field label="Stock minimum"><span style={{ color: theme.text }}>{stockMin} {produit.unite || 'p.'}</span></Field>
                  <Field label="Statut" last><StatusBadge active={isActive} theme={theme} /></Field>
                  <div className="col-span-1 border-t px-3 py-2.5 sm:col-span-2 lg:col-span-3" style={{ borderColor: theme.borderSoft }}>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.055em]" style={{ color: theme.subMuted }}>Commandes</div>
                    <span className="inline-flex min-w-[32px] items-center justify-center rounded-md border px-2 py-1 text-[12px] font-bold" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary }}>{commandes}</span>
                  </div>
                </div>
              </div>

              {/* STOCK */}
              <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                <SectionHeader title="État du stock" right={<span className="text-[11px] font-semibold" style={{ color: stockColor }}>{stockLabel}</span>} />
                <div className="px-3 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px]" style={{ color: theme.subMuted }}>Stock actuel</div>
                      <div className="mt-0.5 text-[19px] font-bold tracking-tight" style={{ color: stockColor }}>
                        {stock}<span className="ml-1 text-[12px] font-medium" style={{ color: theme.muted }}>{produit.unite || 'p.'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px]" style={{ color: theme.subMuted }}>Minimum</div>
                      <div className="mt-0.5 text-[14px] font-semibold" style={{ color: theme.text }}>{stockMin} {produit.unite || 'p.'}</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: isDark ? 'rgba(148,163,184,.10)' : '#E2E8F0' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${stockPercent}%`, background: stockColor }} />
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                <SectionHeader title="Description" />
                <div className="px-3 py-3">
                  <p className="whitespace-pre-wrap text-[13px] leading-5" style={{ color: theme.muted }}>
                    {produit.description || (<span className="italic" style={{ color: theme.subMuted }}>Aucune description.</span>)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-t px-3.5 sm:px-4" style={{ background: theme.card, borderColor: theme.border }}>
          <span className="hidden text-[11px] sm:block" style={{ color: theme.subMuted }}>Échap pour fermer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[12px] font-medium transition-all hover:bg-slate-100 active:scale-[.98] dark:hover:bg-white/[.04]"
              style={{ color: theme.text, background: 'transparent', borderColor: theme.border }}>
              Fermer
            </button>
            <button type="button" onClick={onNewCommande} className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-semibold transition-all hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0"
              style={{ color: theme.primary, background: theme.primarySoft, borderColor: theme.primaryBorder }}>
              <ShoppingBag size={14} strokeWidth={2} />
              Nouvelle commande
            </button>
            <button type="button" onClick={onEdit} className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-semibold transition-all hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0"
              style={{ background: isDark ? '#172033' : '#F8FAFC', color: theme.text, borderColor: theme.border }}>
              <Edit size={14} strokeWidth={2} />
              Modifier
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ProduitsViewModal;